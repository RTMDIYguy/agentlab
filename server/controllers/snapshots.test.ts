/**
 * CC-2026-10-03-004 — audit finding F-14: snapshots.ts had ZERO workspaceId
 * scoping over one shared in-memory store, so any signed-in workspace could
 * read/clone/restore/delete every other workspace's snapshots — including the
 * two built-in template ids Settings.tsx hardcodes — and a deploy wiped it all.
 *
 * The fix (data-model decision recorded in the audit):
 *   workspace_id IS NULL  -> built-in template: globally visible + clonable,
 *                            NEVER deletable through the API (403)
 *   workspace_id = yours  -> private: invisible and undeletable elsewhere,
 *                            which reads as 404 so nothing leaks
 *
 * These tests prove:
 *   - list returns templates + the caller's own snapshots only, through a
 *     WHERE clause that actually references workspace_id (asserted on the
 *     drizzle SQL atoms, not just on the returned rows)
 *   - save writes the CALLER's workspaceId (never the source's)
 *   - clone from a template lands in the caller's workspace
 *   - delete: template 403, someone else's 404 (indistinguishable from
 *     nonexistent), own 200
 *   - every handler 401s a session with no workspace
 *   - the two templates are seeded exactly once, idempotently
 *   - response shapes are byte-for-byte what Settings.tsx expects, so the
 *     client needed no change
 */

import { describe, expect, it, vi, beforeEach } from "vitest";
import { workspaceSnapshots } from "../schema";
import {
  listSnapshots,
  saveSnapshot,
  cloneSnapshot,
  restoreSnapshot,
  deleteSnapshot,
} from "./snapshots";

const WS_A = "11111111-1111-4111-8111-111111111111";
const WS_B = "22222222-2222-4222-8222-222222222222";

const insertCalls: { table: unknown; values: any }[] = [];
const whereCalls: any[] = [];
const deleteCalls: { table: unknown; filter: any }[] = [];
const selectQueue: any[][] = [];
let dbAvailable = true;

function shiftRows(): any[] {
  return selectQueue.shift() ?? [];
}

function makeDb() {
  const result = (rows: any[]) => {
    const p: any = Promise.resolve(rows);
    p.limit = (n: number) => Promise.resolve(rows.slice(0, n));
    p.orderBy = (..._args: unknown[]) => Promise.resolve(rows);
    return p;
  };
  return {
    select: vi.fn((..._fields: unknown[]) => ({
      from: vi.fn(() => ({
        where: vi.fn((filter: any) => {
          whereCalls.push(filter);
          return result(shiftRows());
        }),
      })),
    })),
    insert: vi.fn((table: unknown) => ({
      values: (values: any) => {
        insertCalls.push({ table, values });
        const p: any = Promise.resolve([values]);
        p.returning = () => Promise.resolve([values]);
        p.onConflictDoNothing = () => p;
        return p;
      },
    })),
    delete: vi.fn((table: unknown) => ({
      where: vi.fn((filter: any) => {
        deleteCalls.push({ table, filter });
        return Promise.resolve([]);
      }),
    })),
  };
}

vi.mock("../db", () => ({
  getDb: vi.fn(async () => (dbAvailable ? makeDb() : null)),
}));

/**
 * Walks a drizzle SQL expression and collects its atoms: column names,
 * literal fragments (StringChunk.strings) and bound param values (Param.value).
 * Lets a test assert that a query was actually scoped instead of trusting
 * the returned rows.
 */
function filterAtoms(x: unknown, out: unknown[] = []): unknown[] {
  if (x === null || x === undefined) return out;
  if (typeof x === "string" || typeof x === "number" || typeof x === "boolean") {
    out.push(x);
    return out;
  }
  if (Array.isArray(x)) {
    for (const v of x) filterAtoms(v, out);
    return out;
  }
  if (typeof x === "object") {
    const o = x as Record<string, unknown>;
    if (typeof o.name === "string") out.push(o.name);
    // Param.value is a bound param; StringChunk.value is an array of literal
    // SQL fragments (" is null", " = ", ...). Recurse so both flatten out.
    if ("value" in o) filterAtoms(o.value, out);
    if (Array.isArray(o.queryChunks)) {
      for (const c of o.queryChunks) filterAtoms(c, out);
    }
  }
  return out;
}

function setup(overrides: Record<string, unknown> = {}) {
  const req: any = {
    params: {},
    headers: {},
    body: {},
    ...overrides,
  };
  // Express defaults to 200 when a handler calls res.json() without res.status()
  // — every success path in this controller does exactly that.
  const res: any = { statusCode: 200, body: undefined as unknown };
  res.status = vi.fn((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.json = vi.fn((payload: unknown) => {
    res.body = payload;
    return res;
  });
  return { req, res };
}

function snapshotInserts() {
  return insertCalls.filter(c => c.table === workspaceSnapshots);
}

function makeRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "snap_own000001",
    workspaceId: WS_A,
    name: "My Configuration",
    officeName: "KC Branch",
    description: "saved config",
    version: "1.0.0",
    tags: ["custom"],
    scope: { integrations: true, hyperparameters: true },
    configuration: { llmSettings: { temperature: 0.3 } },
    createdBy: "owner@agentlab.test",
    createdAt: new Date("2026-10-01T00:00:00.000Z"),
    updatedAt: new Date("2026-10-01T00:00:00.000Z"),
    ...overrides,
  };
}

beforeEach(() => {
  insertCalls.length = 0;
  whereCalls.length = 0;
  deleteCalls.length = 0;
  selectQueue.length = 0;
  dbAvailable = true;
});

describe("listSnapshots — F-14 cross-tenant read", () => {
  it("returns templates + own snapshots only, through a workspace_id filter, seeding templates once", async () => {
    const templateRow = makeRow({
      id: "snap_kc_hq_primary",
      workspaceId: null,
      name: "Kansas City HQ Master Configuration",
    });
    const ownRow = makeRow();

    selectQueue.push([templateRow, ownRow]);
    const first = setup({ workspaceId: WS_A });
    await listSnapshots(first.req, first.res);

    expect(first.res.statusCode).toBe(200);
    expect(first.res.body.success).toBe(true);
    expect(first.res.body.totalCount).toBe(2);
    expect(first.res.body.snapshots.map((s: any) => s.id)).toEqual([
      "snap_kc_hq_primary",
      "snap_own000001",
    ]);
    expect(typeof first.res.body.lastUpdated).toBe("string");

    // the WHERE clause is really scoped: workspace_id IS NULL OR workspace_id = WS_A
    const atoms = filterAtoms(whereCalls[0]);
    expect(atoms).toContain("workspace_id");
    expect(atoms).toContain(WS_A);
    expect(
      atoms.some(a => typeof a === "string" && a.toLowerCase().includes("is null"))
    ).toBe(true);

    // seeded both built-in templates as global rows
    const seeds = snapshotInserts();
    expect(seeds.map(s => s.values.id).sort()).toEqual([
      "snap_franchise_starter",
      "snap_kc_hq_primary",
    ]);
    for (const s of seeds) expect(s.values.workspaceId).toBeNull();

    // second call: idempotent, no re-seed
    insertCalls.length = 0;
    selectQueue.push([templateRow, ownRow]);
    const second = setup({ workspaceId: WS_A });
    await listSnapshots(second.req, second.res);
    expect(second.res.statusCode).toBe(200);
    expect(snapshotInserts()).toHaveLength(0);
  });

  it("401s a session with no workspace and never touches the database", async () => {
    const { req, res } = setup();
    await listSnapshots(req, res);
    expect(res.statusCode).toBe(401);
    expect(whereCalls).toHaveLength(0);
    expect(insertCalls).toHaveLength(0);
  });

  it("503s cleanly when the database is unavailable", async () => {
    dbAvailable = false;
    const { req, res } = setup({ workspaceId: WS_A });
    await listSnapshots(req, res);
    expect(res.statusCode).toBe(503);
    expect(res.body.error).toBe("Database unavailable");
  });
});

describe("saveSnapshot — F-14 cross-tenant write", () => {
  it("writes the CALLER's workspaceId, never a source's", async () => {
    const { req, res } = setup({
      workspaceId: WS_A,
      userEmail: "owner@agentlab.test",
      body: {
        name: "Night Operations",
        officeName: "KC Branch Annex",
        description: "annex config",
        tags: ["annex"],
      },
    });
    await saveSnapshot(req, res);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.message).toBe("string");
    expect(res.body.snapshot.id).toMatch(/^snap_[A-Za-z0-9_-]{10}$/);

    const ins = snapshotInserts();
    expect(ins).toHaveLength(1);
    expect(ins[0].values.workspaceId).toBe(WS_A);
    expect(ins[0].values.createdBy).toBe("owner@agentlab.test");
    expect(ins[0].values.name).toBe("Night Operations");
  });

  it("400s when name or officeName is missing", async () => {
    const { req, res } = setup({ workspaceId: WS_A, body: { officeName: "Only office" } });
    await saveSnapshot(req, res);
    expect(res.statusCode).toBe(400);
    expect(snapshotInserts()).toHaveLength(0);
  });

  it("401s a session with no workspace", async () => {
    const { req, res } = setup({ body: { name: "x", officeName: "y" } });
    await saveSnapshot(req, res);
    expect(res.statusCode).toBe(401);
    expect(snapshotInserts()).toHaveLength(0);
  });
});

describe("cloneSnapshot — clone lands in the CALLER's workspace", () => {
  it("clones a built-in template into the caller's own workspace", async () => {
    const templateRow = makeRow({
      id: "snap_kc_hq_primary",
      workspaceId: null,
      name: "Kansas City HQ Master Configuration",
      officeName: "Uncle Robert Consulting — KC Flagship",
    });
    selectQueue.push([templateRow, makeRow()]);

    const { req, res } = setup({
      workspaceId: WS_A,
      userEmail: "owner@agentlab.test",
      params: { id: "snap_kc_hq_primary" },
      body: { targetOfficeName: "Branch 02" },
    });
    await cloneSnapshot(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.message).toBe("string");
    expect(res.body.snapshot.id).toMatch(/^snap_[A-Za-z0-9_-]{10}$/);
    expect(res.body.snapshot.id).not.toBe("snap_kc_hq_primary");
    expect(res.body.snapshot.officeName).toBe("Branch 02");
    expect(res.body.snapshot.tags).toContain("cloned-branch");

    // source lookup went through the visible filter (templates + own)
    const atoms = filterAtoms(whereCalls[0]);
    expect(atoms).toContain("workspace_id");
    expect(atoms).toContain(WS_A);

    // the clone was written into the caller's workspace
    const ins = snapshotInserts();
    expect(ins).toHaveLength(1);
    expect(ins[0].values.workspaceId).toBe(WS_A);
    expect(ins[0].values.createdBy).toBe("owner@agentlab.test");
  });

  it("404s for a snapshot that is not in the caller's visible set", async () => {
    // the scoped DB would never return WS_B's row, so it is absent here
    selectQueue.push([makeRow({ id: "snap_kc_hq_primary", workspaceId: null })]);
    const { req, res } = setup({
      workspaceId: WS_A,
      params: { id: "snap_bobsnapshot" },
      body: {},
    });
    await cloneSnapshot(req, res);
    expect(res.statusCode).toBe(404);
    expect(snapshotInserts()).toHaveLength(0);
  });

  it("401s a session with no workspace", async () => {
    const { req, res } = setup({ params: { id: "snap_kc_hq_primary" }, body: {} });
    await cloneSnapshot(req, res);
    expect(res.statusCode).toBe(401);
    expect(snapshotInserts()).toHaveLength(0);
  });
});

describe("restoreSnapshot — configuration hand-back", () => {
  it("restores the caller's own snapshot with the exact shape Settings.tsx expects", async () => {
    const ownRow = makeRow({ configuration: { llmSettings: { temperature: 0.42 } } });
    selectQueue.push([ownRow]);
    const { req, res } = setup({ workspaceId: WS_A, params: { id: "snap_own000001" } });
    await restoreSnapshot(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.message).toBe("string");
    expect(res.body.appliedConfiguration).toEqual({ llmSettings: { temperature: 0.42 } });
    expect(typeof res.body.appliedAt).toBe("string");

    const atoms = filterAtoms(whereCalls[0]);
    expect(atoms).toContain("workspace_id");
    expect(atoms).toContain(WS_A);
  });

  it("404s for a snapshot outside the caller's visible set", async () => {
    selectQueue.push([]);
    const { req, res } = setup({ workspaceId: WS_A, params: { id: "snap_bobsnapshot" } });
    await restoreSnapshot(req, res);
    expect(res.statusCode).toBe(404);
  });

  it("401s a session with no workspace", async () => {
    const { req, res } = setup({ params: { id: "snap_kc_hq_primary" } });
    await restoreSnapshot(req, res);
    expect(res.statusCode).toBe(401);
  });
});

describe("deleteSnapshot — template protection and non-leaking 404", () => {
  it("403s deletion of a built-in template (the ids Settings.tsx hardcodes)", async () => {
    selectQueue.push([{ id: "snap_kc_hq_primary", workspaceId: null }]);
    const { req, res } = setup({ workspaceId: WS_A, params: { id: "snap_kc_hq_primary" } });
    await deleteSnapshot(req, res);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe("Built-in templates cannot be deleted.");
    expect(deleteCalls).toHaveLength(0);
  });

  it("404s another workspace's snapshot — byte-identical to nonexistent, so nothing leaks", async () => {
    selectQueue.push([{ id: "snap_bobsnapshot", workspaceId: WS_B }]);
    const other = setup({ workspaceId: WS_A, params: { id: "snap_bobsnapshot" } });
    await deleteSnapshot(other.req, other.res);

    selectQueue.push([]);
    const missing = setup({ workspaceId: WS_A, params: { id: "snap_notreal00" } });
    await deleteSnapshot(missing.req, missing.res);

    expect(other.res.statusCode).toBe(404);
    expect(missing.res.statusCode).toBe(404);
    expect(JSON.stringify(other.res.body)).toBe(JSON.stringify(missing.res.body));
    expect(JSON.stringify(other.res.body)).not.toContain(WS_B);
    expect(deleteCalls).toHaveLength(0);
  });

  it("200s deletion of the caller's own snapshot", async () => {
    selectQueue.push([{ id: "snap_own000001", workspaceId: WS_A }]);
    const { req, res } = setup({ workspaceId: WS_A, params: { id: "snap_own000001" } });
    await deleteSnapshot(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true, message: "Snapshot deleted." });
    expect(deleteCalls).toHaveLength(1);
    const atoms = filterAtoms(deleteCalls[0].filter);
    expect(atoms).toContain("id");
    expect(atoms).toContain("snap_own000001");
  });

  it("401s a session with no workspace", async () => {
    const { req, res } = setup({ params: { id: "snap_own000001" } });
    await deleteSnapshot(req, res);
    expect(res.statusCode).toBe(401);
    expect(deleteCalls).toHaveLength(0);
  });
});
