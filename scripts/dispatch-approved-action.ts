/**
 * Execute a human decision on an action dispatch through the SAME state
 * transitions the actions router's approve/reject mutations use.
 *
 * Exists because the deployed UI wires its approval card to the run-level
 * endpoint (both observed approvals hit /api/runs/:id/approve), so dispatch
 * decisions cannot yet be released from any screen. Robert approved dispatch
 * 2cd0f477 explicitly three times in-session (2026-09-28); this script carries
 * that decision to production HubSpot with full evidence.
 *
 * Approve mode (unchanged): SAIF check → connector validation → real connector
 * dispatch → honest recording → run resume signal.
 *
 * Reject mode (CC-2026-09-29): record the human's refusal with a reason and,
 * when the run is paused_for_approval, re-arm it to pending so the real
 * pipeline can RE-EXECUTE the step
 * (e.g. re-draft through a better connector). Deliberately does NOT mirror the
 * router's 'completed step row' semantics: the queue processor skips any step
 * with a completed run-step row, so a completed mark would make the resume
 * silently skip the re-draft. Instead the old run-step row is marked 'rejected'
 * (with the reason in errorMessage), which the processor treats as not-done and
 * inserts a fresh row on resume. Pipeline execution is deliberately NOT run
 * inline: call scripts/execute-pending-runs.ts explicitly afterward so each
 * stage stays observable.
 *
 * Usage (approve): infisical run --env=dev -- tsx scripts/dispatch-approved-action.ts <dispatchId>
 * Usage (reject):  infisical run --env=dev -- tsx scripts/dispatch-approved-action.ts --reject <dispatchId> "<reason>"
 */
import { getDb } from "../server/db";
import { actionDispatches, workflowRunSteps, workflowRuns } from "../server/schema";
import { CONNECTORS, runSaifCheck, validatePayloadForConnector } from "../server/execution/connectors";
import { eq } from "drizzle-orm";

const rejectMode = process.argv[2] === "--reject";
const dispatchId = rejectMode ? process.argv[3] : process.argv[2];
const rejectReason = rejectMode ? process.argv.slice(4).join(" ").trim() : null;
if (!dispatchId || (rejectMode && !rejectReason)) {
  console.error(
    "usage: tsx scripts/dispatch-approved-action.ts <dispatchId>\n" +
      "       tsx scripts/dispatch-approved-action.ts --reject <dispatchId> \"<reason>\""
  );
  process.exit(1);
}

const db = await getDb();
if (!db) throw new Error("Database unavailable");

const [dispatch] = await db
  .select()
  .from(actionDispatches)
  .where(eq(actionDispatches.id, dispatchId));
if (!dispatch) throw new Error("Dispatch not found");
if (dispatch.status !== "awaiting_approval") {
  throw new Error(`Dispatch is ${dispatch.status}, not awaiting_approval — it was already decided.`);
}

console.log("[dispatch] connector:", dispatch.connector);
console.log("[dispatch] title:", dispatch.title);
console.log("[dispatch] mode:", rejectMode ? "REJECT" : "APPROVE");

// ---- Reject mode: record the refusal, optionally re-arm the run, stop (no
// inline execution). CC-2026-09-29: the run is reset to pending ONLY if it is
// currently paused_for_approval. A failed/stale-pollered environment (the
// pre-09-27 Cloud Run instance executes pending runs from the shared DB) means
// an unconditional reset would hand the re-draft to stale code — the operator
// re-arms explicitly with reset-run.mjs + execute-pending-runs.ts instead.
if (rejectMode) {
  let runStatus: string | null = null;
  if (dispatch.workflowRunId) {
    const [runRow] = await db
      .select({ status: workflowRuns.status })
      .from(workflowRuns)
      .where(eq(workflowRuns.id, dispatch.workflowRunId));
    runStatus = runRow?.status ?? null;
  }

  await db
    .update(actionDispatches)
    .set({
      status: "rejected",
      rejectedReason: rejectReason,
      approvedAt: new Date(),
      runOutcome: "rejected",
    })
    .where(eq(actionDispatches.id, dispatch.id));

  if (dispatch.workflowRunStepId) {
    await db
      .update(workflowRunSteps)
      .set({
        // NOT 'completed': the processor skips completed steps on resume, which
        // would swallow the re-draft. 'rejected' reads as not-done, and the
        // fresh attempt inserts its own row — history stays intact.
        status: "rejected",
        completedAt: new Date(),
        errorMessage: `Dispatch rejected by human decision: ${rejectReason}`,
        outputPayload: {
          actionDispatchId: dispatch.id,
          rejected: true,
          reason: rejectReason,
        },
      })
      .where(eq(workflowRunSteps.id, dispatch.workflowRunStepId));
  }

  if (dispatch.workflowRunId && runStatus === "paused_for_approval") {
    await db
      .update(workflowRuns)
      .set({ status: "pending", updatedAt: new Date() })
      .where(eq(workflowRuns.id, dispatch.workflowRunId));
  }

  console.log("[dispatch] REJECTED with reason:", rejectReason);
  if (runStatus === "paused_for_approval") {
    console.log(
      "[dispatch] run was paused_for_approval — reset to pending. Now run: " +
        "pnpm exec infisical run --env=dev -- pnpm exec tsx scripts/execute-pending-runs.ts"
    );
  } else {
    console.log(
      `[dispatch] run status is '${runStatus}' (not paused) — left untouched. ` +
        `Re-arm explicitly when ready: reset-run.mjs <runId> then execute-pending-runs.ts.`
    );
  }
  process.exit(0);
}

// 1. SAIF check (same as the router).
const saif = runSaifCheck(dispatch.payload as Record<string, unknown>);
if (!saif.passed) {
  console.error("[dispatch] SAIF check FAILED:", saif.reason);
  process.exit(1);
}

// 2. Connector validation (same as the router).
const validation = validatePayloadForConnector(
  dispatch.connector,
  dispatch.payload as Record<string, unknown>
);
if (!validation.ok) {
  console.error("[dispatch] payload validation FAILED:", validation.error);
  process.exit(1);
}

// 3. Real dispatch through the registered connector.
const connector = CONNECTORS[dispatch.connector];
const result = await connector.dispatch(validation.cleaned);

if (!result.ok) {
  await db
    .update(actionDispatches)
    .set({
      status: "dispatch_failed",
      saifPassed: true,
      approvedAt: new Date(),
      dispatchedAt: new Date(),
      dispatchError: result.error ?? "Unknown dispatch error",
      runOutcome: "failed",
    })
    .where(eq(actionDispatches.id, dispatch.id));
  console.error("[dispatch] FAILED:", result.error);
  process.exit(1);
}

// 4. Record success honestly (approvedBy stays null: script execution on the
// operator's explicit in-session approval; provenance lives in the register).
await db
  .update(actionDispatches)
  .set({
    status: "dispatched",
    saifPassed: true,
    approvedAt: new Date(),
    dispatchedAt: new Date(),
    externalId: result.externalId ?? null,
    externalUrl: result.externalUrl ?? null,
    runOutcome: "dispatched",
  })
  .where(eq(actionDispatches.id, dispatch.id));

if (dispatch.workflowRunStepId) {
  await db
    .update(workflowRunSteps)
    .set({
      status: "completed",
      completedAt: new Date(),
      outputPayload: {
        actionDispatchId: dispatch.id,
        dispatched: true,
        externalId: result.externalId ?? null,
      },
    })
    .where(eq(workflowRunSteps.id, dispatch.workflowRunStepId));
}

console.log("[dispatch] DISPATCHED ok:", JSON.stringify(result));
process.exit(0);
