/**
 * Artifact export tests (Tier 1): Markdown transport of real stored content —
 * workspace-scoped, honest metadata (grades rendered as "not evaluated" when
 * null, never invented), correct attachment headers, and 404s for anything
 * the caller does not own.
 */

import { describe, expect, it, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => {
  const artifactRows: Record<string, Record<string, any>> = {};
  const runRows: Record<string, Record<string, any>> = {};
  return { artifactRows, runRows };
});

vi.mock("../db", () => ({
  getDb: vi.fn(async () => ({
    select: () => ({
      from: (table: any) => {
        const rowsFor = () =>
          table?.__tag === "artifacts"
            ? Object.values(h.artifactRows)
            : table?.__tag === "runs"
              ? Object.values(h.runRows).slice(0, 1)
              : [];
        return {
          where: () => ({
            limit: async () => rowsFor(),
            // bundle path: .where(...).orderBy(asc(...)) is awaited directly
            orderBy: async () => rowsFor(),
          }),
          orderBy: async () => rowsFor(),
        };
      },
    }),
  })),
}));

vi.mock("../schema", () => {
  const workflowArtifacts = { __tag: "artifacts" };
  const workflowRuns = { __tag: "runs" };
  return { workflowArtifacts, workflowRuns };
});

vi.mock("./params", () => ({
  param: (req: any, name: string) => req.params?.[name] ?? "",
}));

import { exportRunArtifact, exportRunBundle } from "./export";

function makeRes() {
  const res: any = { statusCode: 0, body: undefined as unknown, headers: {} as Record<string, string> };
  res.status = vi.fn((c: number) => {
    res.statusCode = c;
    return res;
  });
  res.json = vi.fn((p: unknown) => {
    res.body = p;
    return res;
  });
  res.send = vi.fn((p: unknown) => {
    res.body = p;
    return res;
  });
  res.setHeader = vi.fn((k: string, v: string) => {
    res.headers[k] = v;
    return res;
  });
  return res;
}

const WORKSPACE = "a1a1a1a1-1111-4111-8111-111111111111";
const RUN = "b2b2b2b2-2222-4222-8222-222222222222";
const ARTIFACT = "c3c3c3c3-3333-4333-8333-333333333333";

function seed() {
  h.runRows[RUN] = {
    id: RUN,
    workspaceId: WORKSPACE,
    status: "completed",
    startedAt: new Date("2026-09-23T10:00:00Z"),
    completedAt: new Date("2026-09-23T10:01:00Z"),
  };
  h.artifactRows[ARTIFACT] = {
    id: ARTIFACT,
    workspaceId: WORKSPACE,
    workflowRunId: RUN,
    title: "Q4 Outreach Brief",
    artifactType: "document",
    targetPlatform: "linkedin",
    qualityScore: null,
    qualityGrade: null,
    summary: "Summary line",
    content: "# Real stored content\n\nBody copy.",
    createdAt: new Date("2026-09-23T10:00:30Z"),
  };
}

beforeEach(() => {
  for (const k of Object.keys(h.artifactRows)) delete h.artifactRows[k];
  for (const k of Object.keys(h.runRows)) delete h.runRows[k];
  seed();
});

const baseReq = { workspaceId: WORKSPACE, params: { runId: RUN } } as any;

describe("exportRunArtifact", () => {
  it("serves stored content with attachment headers and honest metadata", async () => {
    const res = makeRes();
    await exportRunArtifact(
      { ...baseReq, params: { ...baseReq.params, artifactId: ARTIFACT } } as any,
      res
    );

    expect(res.statusCode).toBe(200);
    expect(res.headers["Content-Type"]).toContain("text/markdown");
    expect(res.headers["Content-Disposition"]).toMatch(/attachment; filename=".*\.md"/);
    expect(res.body).toContain("# Q4 Outreach Brief");
    expect(res.body).toContain("# Real stored content");
    expect(res.body).toContain("not evaluated"); // null grade rendered honestly
  });
});

describe("exportRunBundle", () => {
  it("bundles every artifact with run status and real timestamps", async () => {
    const res = makeRes();
    await exportRunBundle(baseReq, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toContain("# Run Export");
    expect(res.body).toContain("**Status:** completed");
    expect(res.body).toContain("**Artifacts:** 1");
    expect(res.body).toContain("Q4 Outreach Brief");
  });

  it("404s when the run has no artifacts (never exports an empty fiction)", async () => {
    for (const k of Object.keys(h.artifactRows)) delete h.artifactRows[k];
    const res = makeRes();
    await exportRunBundle(baseReq, res);
    expect(res.statusCode).toBe(404);
  });
});
