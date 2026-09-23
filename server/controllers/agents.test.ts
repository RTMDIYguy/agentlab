import { readFileSync } from "fs";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { getAgents } from "./agents";
import { getDb } from "../db";
import { agents, workflowRunSteps, workflowSteps } from "../schema";

vi.mock("../db", () => ({ getDb: vi.fn() }));

function makeRes() {
  const res: any = {
    statusCode: 200,
    body: undefined as Record<string, any> | undefined,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(payload: Record<string, any>) {
      res.body = payload;
      return res;
    },
  };
  return res;
}

function makeDb(config: {
  agentRows?: any[];
  stepRows?: any[];
  insertReturning?: any[];
}) {
  const insertedValues: any[] = [];
  const db: any = {
    _insertedValues: insertedValues,
    select: vi.fn(() => {
      const b: any = {};
      b.from = (table: any) => {
        b._table = table;
        if (table === agents) {
          const rows = config.agentRows ?? [];
          b.where = () => ({
            orderBy: async () => rows,
            then: (resolve: any, reject: any) =>
              Promise.resolve(rows).then(resolve, reject),
          });
          b.orderBy = async () => rows;
          b.then = (resolve: any, reject: any) =>
            Promise.resolve(rows).then(resolve, reject);
        } else if (table === workflowRunSteps) {
          b.innerJoin = () => ({
            where: async () => config.stepRows ?? [],
            then: (resolve: any, reject: any) =>
              Promise.resolve(config.stepRows ?? []).then(resolve, reject),
          });
          b.innerJoin = () => b;
          b.where = () => b;
          b.orderBy = () => b;
          b.limit = async () => config.stepRows ?? [];
          b.then = (resolve: any, reject: any) =>
            Promise.resolve(config.stepRows ?? []).then(resolve, reject);
        }
        return b;
      };
      return b;
    }),
    insert: vi.fn(() => {
      const b: any = {};
      b.values = (v: any) => {
        insertedValues.push({ table: b._table, values: v });
        return b;
      };
      b.returning = async () => config.insertReturning ?? [];
      b.then = (resolve: any, reject: any) =>
        Promise.resolve(config.insertReturning ?? []).then(resolve, reject);
      return b;
    }),
  };
  // Tag insert builders by table.
  const rawInsert = db.insert;
  db.insert = vi.fn((table: any) => {
    const builder = rawInsert(table);
    builder._table = table;
    return builder;
  });
  return db;
}

function call(db: any) {
  const res = makeRes();
  return getAgents({ workspaceId: "ws-1" } as any, res).then(() => res);
}

describe("getAgents (honest seeding + real stats)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("seeds identity-only agents (no fabricated task counts or uptimes)", async () => {
    // First select returns empty (nothing seeded), insert returns nothing,
    // second select returns the seeded rows.
    const seededRows = [
      { id: "a-1", name: "Alpha-Node-01", role: "Lead Enrichment Specialist", status: "idle" },
    ];
    let agentsCall = 0;
    const db = makeDb({ stepRows: [] });
    db.select.mockImplementation((fn: any) => {
      const b: any = {};
      b.from = (table: any) => {
        b._table = table;
        if (table === agents) {
          agentsCall += 1;
          const rows = agentsCall === 1 ? [] : seededRows;
          b.where = () => ({
            orderBy: async () => rows,
            then: (resolve: any, reject: any) =>
              Promise.resolve(rows).then(resolve, reject),
          });
        } else if (table === workflowRunSteps) {
          b.innerJoin = () => b;
          b.where = () => b;
          b.orderBy = () => b;
          b.limit = async () => [];
          b.then = (resolve: any, reject: any) =>
            Promise.resolve([]).then(resolve, reject);
        }
        return b;
      };
      return b;
    });
    vi.mocked(getDb).mockResolvedValue({ ...db, select: db.select });

    const res = await call(db);

    const agentSeed = db._insertedValues.find((iv: any) => iv.table === agents);
    expect(agentSeed).toBeTruthy();
    for (const seed of agentSeed.values) {
      expect(seed.tasksCompleted).toBeUndefined();
      expect(seed.uptime).toBeUndefined();
      expect(seed.status).toBe("idle");
    }
    expect(res.body.agents[0].tasksCompleted).toBe(0);
    expect(res.body.agents[0].successRate).toBeNull();
  });

  it("computes real per-agent stats from run history", async () => {
    const db = makeDb({
      agentRows: [
        { id: "agent-1", name: "A", status: "active" },
        { id: "agent-2", name: "B", status: "idle" },
      ],
      stepRows: [
        { agentId: "agent-1", status: "completed", completedAt: new Date("2026-09-23T10:00:00Z") },
        { agentId: "agent-1", status: "completed", completedAt: new Date("2026-09-23T10:05:00Z") },
        { agentId: "agent-1", status: "failed", completedAt: new Date("2026-09-23T10:06:00Z") },
        { agentId: "agent-2", status: "completed", completedAt: null },
      ],
    });
    vi.mocked(getDb).mockResolvedValue(db);

    const res = await call(db);

    const a1 = res.body.agents.find((a: any) => a.id === "agent-1");
    const a2 = res.body.agents.find((a: any) => a.id === "agent-2");
    expect(a1.tasksCompleted).toBe(2);
    expect(a1.successRate).toBe(67); // 2 of 3 finished steps
    expect(a1.lastStepAt).toBe("2026-09-23T10:06:00.000Z");
    expect(a2.tasksCompleted).toBe(1);
    expect(a2.successRate).toBe(100); // completed counts as finished
    expect(a2.lastStepAt).toBeNull(); // no completedAt timestamp recorded
  });

  it("reports zero and null (not fiction) for agents with no history", async () => {
    const db = makeDb({
      agentRows: [{ id: "agent-3", name: "C", status: "idle" }],
      stepRows: [],
    });
    vi.mocked(getDb).mockResolvedValue(db);

    const res = await call(db);

    expect(res.body.agents[0].tasksCompleted).toBe(0);
    expect(res.body.agents[0].successRate).toBeNull();
    expect(res.body.agents[0].lastStepAt).toBeNull();
  });

  it("no fabricated identities, counts, or uptimes remain in the controller source", () => {
    const source = readFileSync("server/controllers/agents.ts", "utf-8");
    expect(source).not.toContain("tasksCompleted: 1420");
    expect(source).not.toContain("tasksCompleted: 3102");
    expect(source).not.toContain('uptime: "99.9%"');
    expect(source).not.toContain('uptime: "98.5%"');
  });
});
