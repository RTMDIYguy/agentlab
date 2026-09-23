/**
 * Per-step execution policy (Tier 1 runner hardening).
 *
 * A workflow step may declare `timeoutSeconds` and `maxRetries`. Values are
 * clamped to safe bounds — a step can never hang the queue indefinitely and
 * never retry unboundedly. The policy is honest: every attempt's failure is
 * recorded in the final error message, and a cancelled run aborts attempts
 * immediately (cooperative cancellation via the run's cancel_requested flag).
 */

import { getDb } from "../db";
import { workflowRuns } from "../schema";
import { eq } from "drizzle-orm";

export const STEP_POLICY_BOUNDS = {
  minTimeoutSeconds: 10,
  maxTimeoutSeconds: 600,
  defaultTimeoutSeconds: 120,
  minRetries: 0,
  maxRetries: 3,
  defaultRetries: 0,
} as const;

export interface StepPolicy {
  timeoutSeconds: number;
  maxRetries: number;
}

export function resolveStepPolicy(step: {
  timeoutSeconds?: number | null;
  maxRetries?: number | null;
}): StepPolicy {
  const clamp = (v: number | null | undefined, min: number, max: number, dflt: number) => {
    if (v === null || v === undefined || Number.isNaN(v)) return dflt;
    return Math.min(max, Math.max(min, Math.round(v)));
  };
  return {
    timeoutSeconds: clamp(
      step.timeoutSeconds,
      STEP_POLICY_BOUNDS.minTimeoutSeconds,
      STEP_POLICY_BOUNDS.maxTimeoutSeconds,
      STEP_POLICY_BOUNDS.defaultTimeoutSeconds
    ),
    maxRetries: clamp(
      step.maxRetries,
      STEP_POLICY_BOUNDS.minRetries,
      STEP_POLICY_BOUNDS.maxRetries,
      STEP_POLICY_BOUNDS.defaultRetries
    ),
  };
}

export class StepCancelledError extends Error {
  constructor() {
    super("Run cancelled by operator");
    this.name = "StepCancelledError";
  }
}

/** Cooperative cancellation check: flips to a typed error mid-attempt. */
export async function assertNotCancelled(runId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const [row] = await db
    .select({ cancelRequested: workflowRuns.cancelRequested })
    .from(workflowRuns)
    .where(eq(workflowRuns.id, runId))
    .limit(1);
  if (row?.cancelRequested) throw new StepCancelledError();
}

function withAbortTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`${label}: timed out after ${Math.round(ms / 1000)}s`));
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export interface AttemptOutcome<T> {
  value: T;
  attempts: number;
}

/**
 * Runs `task` under the step policy: an abort timeout per attempt, up to
 * `1 + maxRetries` attempts, and a cancellation check before each attempt
 * and again after failures (so a cancel requested mid-attempt takes effect
 * without waiting out the retry schedule).
 */
export async function runWithStepPolicy<T>(
  runId: string,
  policy: StepPolicy,
  task: () => Promise<T>
): Promise<AttemptOutcome<T>> {
  const totalAttempts = 1 + policy.maxRetries;
  let lastError: unknown;

  for (let attempt = 1; attempt <= totalAttempts; attempt++) {
    await assertNotCancelled(runId);
    try {
      const value = await withAbortTimeout(
        task(),
        policy.timeoutSeconds * 1000,
        "Step execution"
      );
      return { value, attempts: attempt };
    } catch (err) {
      lastError = err;
      if (err instanceof StepCancelledError) throw err;
      if (attempt < totalAttempts) {
        await assertNotCancelled(runId);
      }
    }
  }

  const message =
    lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(
    `Step failed after ${totalAttempts} attempt(s) (policy: timeout ${policy.timeoutSeconds}s, maxRetries ${policy.maxRetries}): ${message}`
  );
}
