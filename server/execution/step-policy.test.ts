/**
 * Step-policy tests (Tier 1 runner hardening): clamped bounds, real timeout
 * enforcement, bounded retries, and cooperative cancellation that takes
 * effect between attempts.
 */

import { describe, expect, it, vi, beforeEach } from "vitest";

const selectWhere = vi.fn();

vi.mock("../db", () => ({
  getDb: vi.fn(async () => ({
    select: () => ({
      from: () => ({
        where: () => ({ limit: selectWhere }),
      }),
    }),
  })),
}));

vi.mock("../schema", () => ({
  workflowRuns: { id: "workflow_runs.id" },
}));

import {
  resolveStepPolicy,
  runWithStepPolicy,
  assertNotCancelled,
  StepCancelledError,
  STEP_POLICY_BOUNDS,
} from "./step-policy";

describe("resolveStepPolicy", () => {
  it("uses defaults when the step declares nothing", () => {
    expect(resolveStepPolicy({})).toEqual({
      timeoutSeconds: STEP_POLICY_BOUNDS.defaultTimeoutSeconds,
      maxRetries: STEP_POLICY_BOUNDS.defaultRetries,
    });
  });

  it("clamps absurd values into safe bounds", () => {
    expect(resolveStepPolicy({ timeoutSeconds: 999999, maxRetries: 50 })).toEqual({
      timeoutSeconds: STEP_POLICY_BOUNDS.maxTimeoutSeconds,
      maxRetries: STEP_POLICY_BOUNDS.maxRetries,
    });
    expect(resolveStepPolicy({ timeoutSeconds: 0, maxRetries: -3 })).toEqual({
      timeoutSeconds: STEP_POLICY_BOUNDS.minTimeoutSeconds,
      maxRetries: 0,
    });
  });

  it("rounds fractional input", () => {
    expect(resolveStepPolicy({ timeoutSeconds: 30.7, maxRetries: 1.2 }).timeoutSeconds).toBe(31);
  });
});

describe("runWithStepPolicy", () => {
  beforeEach(() => {
    selectWhere.mockReset();
    // default: never cancelled
    selectWhere.mockResolvedValue([{ cancelRequested: false }]);
  });

  it("returns the value on first success", async () => {
    const out = await runWithStepPolicy("run-1", { timeoutSeconds: 5, maxRetries: 2 }, async () => 42);
    expect(out.value).toBe(42);
    expect(out.attempts).toBe(1);
  });

  it("retries on transient failure and reports the attempt count", async () => {
    let calls = 0;
    const out = await runWithStepPolicy("run-1", { timeoutSeconds: 5, maxRetries: 2 }, async () => {
      calls++;
      if (calls < 3) throw new Error("transient");
      return "ok";
    });
    expect(calls).toBe(3);
    expect(out.value).toBe("ok");
    expect(out.attempts).toBe(3);
  });

  it("fails after bounded attempts with every failure honest in the message", async () => {
    let calls = 0;
    await expect(
      runWithStepPolicy("run-1", { timeoutSeconds: 5, maxRetries: 1 }, async () => {
        calls++;
        throw new Error(`boom ${calls}`);
      })
    ).rejects.toThrow(/after 2 attempt\(s\).*boom 2/);
    expect(calls).toBe(2);
  });

  it("enforces the timeout for a hanging task", async () => {
    await expect(
      runWithStepPolicy("run-1", { timeoutSeconds: STEP_POLICY_BOUNDS.minTimeoutSeconds === 10 ? 1 : 10, maxRetries: 0 }, () => new Promise(() => {}))
    ).rejects.toThrow(/timed out/);
  }, 10_000);

  it("stops retrying when the run is cancelled between attempts", async () => {
    let calls = 0;
    selectWhere.mockImplementation(async () => {
      // after the first attempt fails, cancel arrives
      calls++;
      return [{ cancelRequested: calls > 1 }];
    });

    await expect(
      runWithStepPolicy("run-1", { timeoutSeconds: 5, maxRetries: 3 }, async () => {
        throw new Error("first failure");
      })
    ).rejects.toBeInstanceOf(StepCancelledError);
  });

  it("assertNotCancelled throws the typed error when the flag is set", async () => {
    selectWhere.mockResolvedValueOnce([{ cancelRequested: true }]);
    await expect(assertNotCancelled("run-1")).rejects.toBeInstanceOf(StepCancelledError);
  });
});
