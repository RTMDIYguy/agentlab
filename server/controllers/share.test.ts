/**
 * Share-token tests (Tier 1 item 3): client-facing run consoles.
 *
 * Covers the honesty and security contract of the share surface:
 *  - the raw token is returned exactly once and only a sha256 hash is stored
 *  - public reads 401 on unknown/revoked tokens
 *  - shared payloads are explicit projections (no workspaceId, no
 *    initialContext, no input/output payloads on steps)
 *  - aggregates (totalCost/totalLatencyMs) are computed from real rows
 *  - revocation stops access and is recorded, not deleted
 */

import { describe, expect, it, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => {
  const state = {
    tokens: new Map<string, Record<string, any>>(),
    runs: new Map<string, Record<string, any>>(),
    workflows: new Map<string, Record<string, any>>(),
    steps: [] as Record<string, any>[],
    artifacts: [] as Record<string, any>[],
  };
  return state;
});

// --- drizzle-orm mock: conditions become plain evaluatable objects ---------
vi.mock("drizzle-orm", () => ({
  and: (...conds: any[]) => ({ __and: conds }),
  eq: (col: any, val: any) => ({ __eq: [col, val] }),
  isNull: (col: any) => ({ __isNull: col }),
  desc: (col: any) => ({ __desc: col }),
  asc: (col: any) => ({ __asc: col }),
}));

vi.mock("../db", async () => {
  const evalCond = (row: any, cond: any): boolean => {
    if (!cond) return true;
    if (cond.__and) return cond.__and.every((c: any) => evalCond(row, c));
    if (cond.__eq) return row[cond.__eq[0].__col] === cond.__eq[1];
    if (cond.__isNull) return row[cond.__isNull.__col] == null;
    return true;
  };
  const rowsFor = (table: any) => {
    const tag = table?.__tag;
    if (tag === "tokens") return [...h.tokens.values()];
    if (tag === "runs") return [...h.runs.values()];
    if (tag === "workflows") return [...h.workflows.values()];
    if (tag === "steps") return h.steps;
    if (tag === "artifacts") return h.artifacts;
    return [];
  };
  const filtered = (table: any, cond: any) =>
    rowsFor(table).filter((row) => evalCond(row, cond));

  const db: any = {
    select: (proj?: any) => ({
      from: (table: any) => {
        // Honor drizzle select({...}) projections so tests can assert that the
        // controller only surfaces the fields it explicitly selected.
        const materialize = (rows: any[]) =>
          proj && typeof proj === "object" && !Array.isArray(proj)
            ? rows.map((r) =>
                Object.fromEntries(
                  Object.entries(proj).map(([k, c]: [string, any]) => [
                    k,
                    c && c.__col ? r[c.__col] : undefined,
                  ])
                )
              )
            : rows;
        return {
        where: (cond: any) => {
          const rows = () => materialize(filtered(table, cond));
          return {
            // await-able directly (steps/artifacts queries chain no limit)
            then: (res: any, rej: any) => {
              try {
                res(rows());
              } catch (e) {
                rej(e);
              }
            },
            limit: async () => rows().slice(0, 1),
            orderBy: () => ({
              limit: async (n: number) => rows().slice(0, n),
            }),
          };
        },
        };
      },
    }),
    insert: (_table: any) => ({
      values: async (v: any) => {
        if (v.tokenHash) h.tokens.set(v.tokenHash, { createdAt: new Date(), ...v });
      },
    }),
    update: (_table: any) => ({
      set: (patch: any) => ({
        where: (cond: any) => {
          const matched = filtered(_table, cond);
          const apply = () => matched.forEach((row) => Object.assign(row, patch));
          return {
            then: (res: any, rej: any) => {
              try {
                apply();
                res(matched);
              } catch (e) {
                rej(e);
              }
            },
            returning: async () => {
              apply();
              return matched.map((row) => ({ id: row.id }));
            },
          };
        },
      }),
    }),
  };
  return { getDb: vi.fn(async () => db) };
});

vi.mock("../schema", () => {
  const col = (name: string) => ({ __col: name });
  // Conditions compare against JS property names of the mock rows, so the
  // column registry maps property -> property (not DB snake_case).
  const taggedTable = (tag: string, propNames: string[]) => {
    const t: any = { __tag: tag };
    for (const name of propNames) t[name] = col(name);
    return t;
  };
  return {
    workflowShareTokens: taggedTable("tokens", [
      "id", "workspaceId", "tokenHash", "label", "scope", "runId",
      "createdByEmail", "createdAt", "lastAccessedAt", "revokedAt",
    ]),
    workflowRuns: taggedTable("runs", [
      "id", "workspaceId", "workflowId", "status", "triggerSource",
      "startedAt", "completedAt", "errorMessage", "initialContext", "createdAt",
    ]),
    workflows: taggedTable("workflows", ["id", "workspaceId", "name", "description"]),
    workflowRunSteps: taggedTable("steps", [
      "id", "workflowRunId", "status", "latencyMs", "cost",
      "errorMessage", "inputContext", "outputPayload",
    ]),
    workflowArtifacts: taggedTable("artifacts", [
      "id", "workflowRunId", "title", "artifactType", "status", "summary",
      "content", "qualityScore", "qualityGrade", "verificationNotes", "createdAt",
    ]),
  };
});

import {
  createShareToken,
  listShareTokens,
  revokeShareToken,
  getSharedRuns,
  getSharedRunDetail,
} from "./share";

function makeReq(overrides: Record<string, any> = {}): any {
  return {
    workspaceId: "ws-1",
    userEmail: "ops@urc.test",
    body: {},
    params: {},
    headers: {},
    query: {},
    ...overrides,
  };
}

function makeRes() {
  const res: any = {
    statusCode: 0,
    body: undefined as unknown,
    headers: {} as Record<string, string>,
  };
  res.status = vi.fn((c: number) => {
    res.statusCode = c;
    return res;
  });
  res.json = vi.fn((p: unknown) => {
    res.body = p;
    return res;
  });
  res.setHeader = vi.fn((k: string, v: string) => {
    res.headers[k] = v;
    return res;
  });
  return res;
}

function seedRun(overrides: Record<string, any> = {}) {
  const id = overrides.id ?? "run-1";
  h.runs.set(id, {
    id,
    workspaceId: "ws-1",
    workflowId: "wf-1",
    status: "completed",
    triggerSource: "manual",
    startedAt: new Date("2026-09-23T10:00:00Z"),
    completedAt: new Date("2026-09-23T10:05:00Z"),
    errorMessage: null,
    initialContext: { secret: "tenant-only" },
    createdAt: new Date("2026-09-23T10:00:00Z"),
    ...overrides,
  });
  h.workflows.set("wf-1", {
    id: "wf-1",
    workspaceId: "ws-1",
    name: "Weekly Content Engine",
    description: null,
  });
  return id;
}

let rawToken = "";
let tokenHashStored = "";

beforeEach(async () => {
  h.tokens.clear();
  h.runs.clear();
  h.workflows.clear();
  h.steps = [];
  h.artifacts = [];
  rawToken = "";
  tokenHashStored = "";
  const res = makeRes();
  await createShareToken(makeReq({ body: { label: "Acme weekly" } }), res);
  expect(res.statusCode).toBe(201);
  rawToken = res.body.token;
  const stored = [...h.tokens.values()][0];
  tokenHashStored = stored.tokenHash;
});

describe("share token lifecycle", () => {
  it("stores only a 64-hex sha256 hash — never the raw token", () => {
    expect(rawToken).toMatch(/^als_/);
    expect(tokenHashStored).toMatch(/^[0-9a-f]{64}$/);
    expect(tokenHashStored).not.toContain(rawToken);
  });

  it("does not leak the hash through the operator list endpoint", async () => {
    const res = makeRes();
    await listShareTokens(makeReq(), res);
    expect(res.statusCode).toBe(200);
    expect(res.body.tokens).toHaveLength(1);
    expect(res.body.tokens[0].tokenHash).toBeUndefined();
    expect(res.body.tokens[0].label).toBe("Acme weekly");
  });

  it("rejects single-run scope for a run outside the workspace", async () => {
    const res = makeRes();
    await createShareToken(
      makeReq({ body: { scope: "single", runId: "missing-run" } }),
      res
    );
    expect(res.statusCode).toBe(404);
  });

  it("revocation records a timestamp and blocks further access", async () => {
    const res = makeRes();
    await revokeShareToken(
      makeReq({ params: { tokenId: [...h.tokens.values()][0].id } }),
      res
    );
    expect(res.statusCode).toBe(200);
    expect([...h.tokens.values()][0].revokedAt).toBeInstanceOf(Date);

    const publicRes = makeRes();
    await getSharedRuns(
      makeReq({ workspaceId: undefined, headers: { "x-share-token": rawToken } }),
      publicRes
    );
    expect(publicRes.statusCode).toBe(401);
    expect(publicRes.body.error).toMatch(/revoked/i);
  });
});

describe("public token-scoped reads", () => {
  it("401s on an unknown token", async () => {
    const res = makeRes();
    await getSharedRuns(
      makeReq({ workspaceId: undefined, headers: { "x-share-token": "als_nope" } }),
      res
    );
    expect(res.statusCode).toBe(401);
  });

  it("returns projected run fields with real workflow names — and nothing tenant-side", async () => {
    seedRun();
    const res = makeRes();
    await getSharedRuns(
      makeReq({ workspaceId: undefined, headers: { "x-share-token": rawToken } }),
      res
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.label).toBe("Acme weekly");
    const run = res.body.runs[0];
    expect(run.workflowName).toBe("Weekly Content Engine");
    expect(run.status).toBe("completed");
    // Explicit projection guarantees:
    expect(run.workspaceId).toBeUndefined();
    expect(run.initialContext).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain("tenant-only");
  });

  it("run detail aggregates real cost/latency and projects steps without payloads", async () => {
    const runId = seedRun();
    h.steps.push(
      {
        id: "s-1",
        workflowRunId: runId,
        status: "completed",
        latencyMs: 1200,
        cost: "0.004200",
        errorMessage: null,
        inputContext: { hidden: true },
        outputPayload: { hidden: true },
      },
      {
        id: "s-2",
        workflowRunId: runId,
        status: "failed",
        latencyMs: 300,
        cost: "0.000100",
        errorMessage: "model refused",
        inputContext: { hidden: true },
        outputPayload: null,
      }
    );
    h.artifacts.push({
      id: "a-1",
      workflowRunId: runId,
      title: "LinkedIn post draft",
      artifactType: "post",
      status: "draft",
      summary: "Draft awaiting approval",
      content: "...",
      qualityScore: 92,
      qualityGrade: "A",
      verificationNotes: null,
      createdAt: new Date(),
    });

    const res = makeRes();
    await getSharedRunDetail(
      makeReq({
        workspaceId: undefined,
        headers: { "x-share-token": rawToken },
        params: { runId },
      }),
      res
    );
    expect(res.statusCode).toBe(200);
    // Aggregates are the real sums of the stored rows:
    expect(res.body.totalCost).toBe("0.004300");
    expect(res.body.totalLatencyMs).toBe(1500);
    // Steps are projected — no input/output payload leakage:
    expect(res.body.steps).toHaveLength(2);
    expect(res.body.steps[0].inputContext).toBeUndefined();
    expect(res.body.steps[0].outputPayload).toBeUndefined();
    expect(res.body.steps[1].errorMessage).toBe("model refused");
    // Artifacts render from real evaluation data:
    expect(res.body.artifacts[0].qualityScore).toBe(92);
    expect(res.body.artifacts[0].qualityGrade).toBe("A");
  });

  it("404s a run outside the token's workspace", async () => {
    const res = makeRes();
    await getSharedRunDetail(
      makeReq({
        workspaceId: undefined,
        headers: { "x-share-token": rawToken },
        params: { runId: "other-workspace-run" },
      }),
      res
    );
    expect(res.statusCode).toBe(404);
  });
});
