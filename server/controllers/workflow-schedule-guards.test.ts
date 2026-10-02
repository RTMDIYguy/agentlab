/**
 * Regression tests for the inert-schedule hole (CC-2026-10-02-009,
 * disposition 10): a workflow created or rescheduled as
 * triggerType "schedule" with NO cron expression can never fire —
 * execution/scheduler.ts selects on lte(nextRunAt, now), which never
 * matches a NULL nextRunAt. Both write paths (createCustomWorkflow and
 * updateWorkflowSchedule) must refuse with 400 instead of persisting a
 * dead schedule, while non-schedule triggers keep working cron-free.
 */

import { describe, expect, it, vi, beforeEach } from "vitest";

const updateMock = vi.fn();
const insertMock = vi.fn();
const selectMock = vi.fn();

vi.mock("../db", () => ({
  getDb: vi.fn(async () => ({
    update: updateMock,
    insert: insertMock,
    select: selectMock,
  })),
}));

import { createCustomWorkflow, updateWorkflowSchedule } from "./workflows";

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

function stubUpdateReturning() {
  updateMock.mockReturnValue({
    set: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn(async () => [{ id: "wf-1", workspaceId: "ws-1" }]),
      })),
    })),
  });
}

const scheduleReq = (body: Record<string, unknown>) =>
  ({ workspaceId: "ws-1", params: { workflowId: "wf-1" }, body }) as any;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("updateWorkflowSchedule — schedule requires a cron", () => {
  it("rejects triggerType=schedule with no cron expression (400, no DB write)", async () => {
    const res = makeRes();
    await updateWorkflowSchedule(
      scheduleReq({ triggerType: "schedule", cronExpression: "" }),
      res
    );

    expect(res.statusCode).toBe(400);
    expect(String((res.body as any).error)).toMatch(/cron expression is required/i);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("rejects a whitespace-only cron as well", async () => {
    const res = makeRes();
    await updateWorkflowSchedule(
      scheduleReq({ triggerType: "schedule", cronExpression: "   " }),
      res
    );

    expect(res.statusCode).toBe(400);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("still accepts a non-schedule trigger with no cron (clears it, arms nothing)", async () => {
    stubUpdateReturning();
    const res = makeRes();
    await updateWorkflowSchedule(
      scheduleReq({ triggerType: "manual", cronExpression: "" }),
      res
    );

    expect(res.statusCode).toBe(200);
    expect(updateMock).toHaveBeenCalledTimes(1);
    const setArgs = updateMock.mock.results[0].value.set.mock.calls[0][0];
    expect(setArgs.triggerType).toBe("manual");
    expect(setArgs.cronExpression).toBeNull();
    expect(setArgs.nextRunAt).toBeNull();
  });

  it("accepts a valid cron and computes a real nextRunAt (arms the schedule)", async () => {
    stubUpdateReturning();
    const res = makeRes();
    await updateWorkflowSchedule(
      scheduleReq({ triggerType: "schedule", cronExpression: "0 9 * * 1-5" }),
      res
    );

    expect(res.statusCode).toBe(200);
    const setArgs = updateMock.mock.results[0].value.set.mock.calls[0][0];
    expect(setArgs.cronExpression).toBe("0 9 * * 1-5");
    expect(setArgs.nextRunAt).toBeInstanceOf(Date);
    expect(setArgs.nextRunAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("rejects an invalid cron expression with 400 (existing behavior kept)", async () => {
    const res = makeRes();
    await updateWorkflowSchedule(
      scheduleReq({ triggerType: "schedule", cronExpression: "not a cron" }),
      res
    );

    expect(res.statusCode).toBe(400);
    expect(String((res.body as any).error)).toMatch(/invalid cron/i);
    expect(updateMock).not.toHaveBeenCalled();
  });
});

describe("createCustomWorkflow — schedule requires a cron", () => {
  it("rejects creating a scheduled workflow with no cron (400, no insert)", async () => {
    const res = makeRes();
    await createCustomWorkflow(
      {
        workspaceId: "ws-1",
        body: { name: "Dead Schedule", triggerType: "schedule", cronExpression: undefined },
      } as any,
      res
    );

    expect(res.statusCode).toBe(400);
    expect(String((res.body as any).error)).toMatch(/cron expression is required/i);
    expect(insertMock).not.toHaveBeenCalled();
  });
});
