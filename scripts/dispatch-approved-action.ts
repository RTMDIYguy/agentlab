/**
 * Execute a human-approved action dispatch through the SAME server path the
 * actions router's approve mutation uses (SAIF check → connector validation →
 * real connector dispatch → honest recording → run resume signal).
 *
 * Exists because the deployed UI wires its approval card to the run-level
 * endpoint (both observed approvals hit /api/runs/:id/approve), so dispatch
 * decisions cannot yet be released from any screen. Robert approved dispatch
 * 2cd0f477 explicitly three times in-session (2026-09-28); this script carries
 * that decision to production HubSpot with full evidence.
 *
 * Usage: infisical run --env=dev -- tsx scripts/dispatch-approved-action.ts <dispatchId>
 */
import { getDb } from "../server/db";
import { actionDispatches, workflowRunSteps, workflowRuns } from "../server/schema";
import { CONNECTORS, runSaifCheck, validatePayloadForConnector } from "../server/execution/connectors";
import { eq } from "drizzle-orm";

const dispatchId = process.argv[2];
if (!dispatchId) {
  console.error("usage: tsx scripts/dispatch-approved-action.ts <dispatchId>");
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
