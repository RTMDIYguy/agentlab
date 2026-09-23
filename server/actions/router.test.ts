/**
 * Human-gated action flow tests (Tier 2): the approval surface's honesty
 * contract. The dispatch row's status must always reflect what actually
 * happened, the run must resume through the real pipeline, and a decision
 * can only be made once.
 */

import { describe, expect, it, vi, beforeEach } from "vitest";

// All mutable state lives in vi.hoisted so the hoisted vi.mock factories can
// reach it before module evaluation.
const h = vi.hoisted(() => {
  // Nameable column sentinels so the mocked drizzle eq() can produce plain
  // {col, val} conditions the fake db can evaluate deterministically.
  const dispatchTable = {
    id: { name: "id" },
    workspaceId: { name: "workspaceId" },
    status: { name: "status" },
  };
  const runStepTable = { id: { name: "id" } };
  const runTable = { id: { name: "id" } };
  const dispatchRows: Record<string, Record<string, any>> = {};
  const runStepRows: Record<string, Record<string, any>> = {};
  const runRows: Record<string, Record<string, any>> = {};
  const processPendingRuns = vi.fn();
  const seedCounterRef = { value: 0 };  function makeDb() {
    const rowsFor = (table: any) =>
      table === dispatchTable
        ? dispatchRows
        : table === runStepTable
          ? runStepRows
          : table === runTable
            ? runRows
            : {};

    const update = (table: any) => ({
      set: (vals: Record<string, any>) => ({
        where: async (cond: any) => {
          const target = Object.values(rowsFor(table)).find(
            (r) => r[cond?.col] === cond?.val
          );
          if (target) Object.assign(target, vals);
          return target;
        },
      }),
    });

    const select = () => ({
      from: (table: any) => ({
        where: (conds: any) => {
          const list = Array.isArray(conds) ? conds : [conds];
          const filtered = Object.values(rowsFor(table)).filter((row) =>
            list.every((c) => row[c?.col] === c?.val)
          );
          const result = Promise.resolve(filtered) as any;
          result.orderBy = () => ({
            limit: async () => filtered,
          });
          return result;
        },
        orderBy: () => ({ limit: async () => Object.values(dispatchRows) }),
      }),
    });

    return {
      insert: () => ({ values: async (v: Record<string, any>) => ({ returning: async () => [v] }) }),
      update,
      select,
    };
  }

  const dispatchMock = vi.fn();

  return {
    dispatchTable,
    runStepTable,
    runTable,
    dispatchRows,
    runStepRows,
    runRows,
    processPendingRuns,
    dispatchMock,
    seedCounterRef,
    makeDb,
  };
});

vi.mock("../db", () => ({ getDb: vi.fn(async () => h.makeDb()) }));

// Plain condition objects so the fake db can evaluate them deterministically.
vi.mock("drizzle-orm", () => ({
  eq: (col: any, val: any) => ({ col: col?.name, val }),
  and: (...conds: any[]) => conds,
  desc: (col: any) => ({ col: col?.name, dir: "desc" }),
}));

vi.mock("../schema", () => ({
  actionDispatches: h.dispatchTable,
  workflowRunSteps: h.runStepTable,
  workflowRuns: h.runTable,
}));

vi.mock("../execution/queue-processor", () => ({
  processPendingRuns: h.processPendingRuns,
}));

vi.mock("../execution/connectors", () => ({
  CONNECTORS: {
    test_connector: {
      name: "test_connector",
      label: "Test",
      description: "test",
      requiredKeys: ["email"],
      optionalKeys: [] as string[],
      dispatch: h.dispatchMock,
    },
  },
  listConnectors: () => [],
  runSaifCheck: (payload: Record<string, unknown>) =>
    JSON.stringify(payload).includes("injection-phrase")
      ? { passed: false, reason: "injection detected" }
      : { passed: true },
  validatePayloadForConnector: (name: string, payload: Record<string, unknown>) =>
    payload && typeof payload.email === "string" && payload.email.includes("bad-key")
      ? { ok: false, error: "bad payload" }
      : { ok: true, cleaned: payload },
}));

import { actionsRouter } from "./router";

const WORKSPACE = "a1111111-1111-4111-8111-111111111111";
const USER_ID = "b2222222-2222-4222-8222-222222222222";

function makeCaller() {
  return actionsRouter.createCaller({
    req: {} as any,
    res: {} as any,
    user: {
      id: USER_ID,
      openId: "u1",
      email: "robert@example.com",
      name: "Robert",
      role: "admin",
      workspaceId: WORKSPACE,
    } as any,
  });
}

function seedAwaitingDispatch(overrides: Record<string, any> = {}) {
  const n = ++h.seedCounterRef.value;
  const id = `c3333333-3333-4333-8333-${String(n).padStart(12, "0")}`;
  const runId = `d4444444-4444-4444-8444-${String(n).padStart(12, "0")}`;
  const stepId = `e5555555-5555-4555-8555-${String(n).padStart(12, "0")}`;
  h.dispatchRows[id] = {
    id,
    workspaceId: WORKSPACE,
    connector: "test_connector",
    status: "awaiting_approval",
    title: "Upsert lead",
    payload: { email: "lead@example.com" },
    workflowRunId: runId,
    workflowRunStepId: stepId,
    createdAt: new Date(),
    ...overrides,
  };
  h.runRows[runId] = { id: runId, workspaceId: WORKSPACE, status: "paused_for_approval" };
  h.runStepRows[stepId] = { id: stepId, workspaceId: WORKSPACE, status: "awaiting_approval" };
  return id;
}

beforeEach(() => {
  for (const k of Object.keys(h.dispatchRows)) delete h.dispatchRows[k];
  for (const k of Object.keys(h.runStepRows)) delete h.runStepRows[k];
  for (const k of Object.keys(h.runRows)) delete h.runRows[k];
  h.dispatchMock.mockReset();
  h.processPendingRuns.mockReset();
});

describe("actions.approve — the gated dispatch path", () => {
  it("dispatches for real, records the result, resumes the run", async () => {
    const id = seedAwaitingDispatch();
    h.dispatchMock.mockResolvedValueOnce({ ok: true, externalId: "701550009" });

    const caller = makeCaller();
    const out = await caller.approve({ dispatchId: id });

    expect(out.dispatched).toBe(true);
    expect(out.externalId).toBe("701550009");
    const row = h.dispatchRows[id];
    expect(row.status).toBe("dispatched");
    expect(row.externalId).toBe("701550009");
    expect(row.saifPassed).toBe(true);
    expect(row.approvedBy).toBe(USER_ID);
    expect(h.runStepRows[row.workflowRunStepId].status).toBe("completed");
    expect(h.runRows[row.workflowRunId].status).toBe("pending");
    expect(h.processPendingRuns).toHaveBeenCalledTimes(1);
    expect(h.dispatchMock).toHaveBeenCalledWith(
      expect.objectContaining({ email: "lead@example.com" })
    );
  });

  it("records dispatch failure honestly and leaves the run paused", async () => {
    const id = seedAwaitingDispatch();
    h.dispatchMock.mockResolvedValueOnce({ ok: false, error: "401 unauthorized" });

    const caller = makeCaller();
    const out = await caller.approve({ dispatchId: id });

    expect(out.dispatched).toBe(false);
    expect(out.error).toContain("401");
    const row = h.dispatchRows[id];
    expect(row.status).toBe("dispatch_failed");
    expect(row.dispatchError).toContain("401");
    expect(h.runStepRows[row.workflowRunStepId].status).toBe("failed");
    expect(h.processPendingRuns).not.toHaveBeenCalled();
  });

  it("SAIF-blocked payloads never dispatch and stay awaiting_approval", async () => {
    const id = seedAwaitingDispatch({
      payload: { email: "lead@example.com", notes: "injection-phrase" },
    });

    const caller = makeCaller();
    await expect(caller.approve({ dispatchId: id })).rejects.toThrow(/SAIF/);

    const row = h.dispatchRows[id];
    expect(row.status).toBe("awaiting_approval");
    expect(row.saifPassed).toBe(false);
    expect(h.dispatchMock).not.toHaveBeenCalled();
  });

  it("a dispatch cannot be decided twice", async () => {
    const id = seedAwaitingDispatch({ status: "dispatched" });
    const caller = makeCaller();
    await expect(caller.approve({ dispatchId: id })).rejects.toThrow(/already decided/);
    await expect(
      caller.reject({ dispatchId: id, reason: "too late" })
    ).rejects.toThrow(/already decided/);
  });
});

describe("actions.reject — recorded refusal, run continues", () => {
  it("marks rejected, keeps the payload undelivered, resumes the run", async () => {
    const id = seedAwaitingDispatch();
    const caller = makeCaller();
    const out = await caller.reject({ dispatchId: id, reason: "wrong lead" });

    expect(out.rejected).toBe(true);
    const row = h.dispatchRows[id];
    expect(row.status).toBe("rejected");
    expect(row.rejectedReason).toBe("wrong lead");
    expect(h.dispatchMock).not.toHaveBeenCalled();
    expect(h.runStepRows[row.workflowRunStepId].status).toBe("completed");
    expect(h.runRows[row.workflowRunId].status).toBe("pending");
    expect(h.processPendingRuns).toHaveBeenCalledTimes(1);
  });
});

describe("actions.listDispatches", () => {
  it("separates awaiting from decided dispatches", async () => {
    seedAwaitingDispatch();
    seedAwaitingDispatch({ status: "dispatched" });
    const caller = makeCaller();
    const out = await caller.listDispatches({});
    expect(out.awaiting.length).toBe(1);
    expect(out.recent.length).toBe(2);
  });
});
