/**
 * Regression tests for workflow success-rate honesty (CC-2026-09-23-016):
 * the controller must compute per-workflow success rates from real
 * workflow_runs history, report null for never-run workflows, and never
 * serve fabricated rates or backdated lastRunAt timestamps.
 *
 * Also guards the fiction linter itself: the dead fabricated DTO array that
 * once seeded fake rates (99.4 / 98.8 / 100.0) must never reappear here.
 */

import { describe, expect, it, vi, beforeEach } from "vitest";

const chainMock = vi.fn();
const fromMock = vi.fn();
const whereMock = vi.fn();

vi.mock("../db", () => ({
  getDb: vi.fn(async () => ({
    select: (...args: unknown[]) => chainMock(...args),
    insert: vi.fn(),
  })),
}));

vi.mock("../schema", () => ({
  workflows: { workspaceId: "workflows.workspace_id" },
  workflowSteps: { workspaceId: "workflow_steps.workspace_id" },
  workflowRuns: {
    workspaceId: "workflow_runs.workspace_id",
    workflowId: "workflow_runs.workflow_id",
    status: "workflow_runs.status",
    startedAt: "workflow_runs.started_at",
  },
  agents: {},
}));

import { getWorkflows as listWorkflows } from "./workflows";

type RunStatRow = {
  workflowId: string;
  finished: number;
  succeeded: number;
  lastRun: Date | null;
};

function makeRes() {
  const res: any = { statusCode: 0, body: undefined as unknown };
  res.status = vi.fn((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.json = vi.fn((payload: unknown) => {
    res.body = payload;
    return res;
  });
  return res;
}

function setupDb(opts: {
  workflowRows: Array<Record<string, unknown>>;
  runStats: RunStatRow[];
}) {
  chainMock.mockReset();
  fromMock.mockReset();
  whereMock.mockReset();

  // Call 1: workflows list; Call 2: workflow steps; Call 3: run stats.
  chainMock.mockImplementation(() => ({ from: fromMock }));
  fromMock
    .mockImplementationOnce(() => ({ where: whereMock }))
    .mockImplementationOnce(() => ({ where: whereMock }))
    .mockImplementationOnce(() => ({ where: whereMock }));

  // where() results are awaited directly or chained (.orderBy / .groupBy).
  const chainResult = (rows: unknown[]) => ({
    orderBy: async () => rows,
    groupBy: async () => rows,
    then: (resolve: any, reject: any) =>
      Promise.resolve(rows).then(resolve, reject),
  });

  let whereCall = 0;
  whereMock.mockImplementation(() => {
    whereCall += 1;
    if (whereCall === 1) return chainResult(opts.workflowRows);
    if (whereCall === 2) return chainResult([]);
    return chainResult(opts.runStats);
  });
}

const BASE_REQ = { workspaceId: "ws-1" } as any;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("listWorkflows — success-rate honesty", () => {
  it("computes successRate from real run history", async () => {
    setupDb({
      workflowRows: [{ id: "wf-a", workspaceId: "ws-1" }],
      runStats: [
        { workflowId: "wf-a", finished: 10, succeeded: 9, lastRun: new Date("2026-09-20T10:00:00Z") },
      ],
    });

    const res = makeRes();
    await listWorkflows(BASE_REQ, res);

    const wf = (res.body as any).workflows[0];
    expect(res.statusCode).toBe(200);
    expect(wf.successRate).toBe(90);
    expect(wf.lastRunAt).toBe("2026-09-20T10:00:00.000Z");
  });

  it("reports null successRate and null lastRunAt for never-run workflows", async () => {
    setupDb({
      workflowRows: [{ id: "wf-b", workspaceId: "ws-1" }],
      runStats: [],
    });

    const res = makeRes();
    await listWorkflows(BASE_REQ, res);

    const wf = (res.body as any).workflows[0];
    expect(wf.successRate).toBeNull();
    expect(wf.lastRunAt).toBeNull();
  });

  it("rounds to one decimal place", async () => {
    setupDb({
      workflowRows: [{ id: "wf-c", workspaceId: "ws-1" }],
      runStats: [
        { workflowId: "wf-c", finished: 3, succeeded: 2, lastRun: null },
      ],
    });

    const res = makeRes();
    await listWorkflows(BASE_REQ, res);

    expect((res.body as any).workflows[0].successRate).toBe(66.7);
  });

  it("ignores stored success_rate values (legacy column, never trusted)", async () => {
    setupDb({
      workflowRows: [{ id: "wf-d", workspaceId: "ws-1", successRate: "100.00" }],
      runStats: [],
    });

    const res = makeRes();
    await listWorkflows(BASE_REQ, res);

    expect((res.body as any).workflows[0].successRate).toBeNull();
  });
});

describe("fiction linter guard — fabricated workflow seeds", () => {
  it("the dead fabricated DTO array (wf-001 fake rates) never returns", async () => {
    const { readFileSync } = await import("fs");
    const source = readFileSync(__filename.replace(/\.test\.ts$/, ".ts"), "utf8");
    expect(source).not.toMatch(/DEFAULT_WORKSPACE_WORKFLOWS/);
    expect(source).not.toMatch(/successRate:\s*99\.4/);
    expect(source).not.toMatch(/successRate:\s*98\.8/);
    expect(source).not.toMatch(/lastRunAt:\s*"2026-08-2\dT/);
  });
});
