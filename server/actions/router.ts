/**
 * Human-gated action dispatches (conversion plan Tier 2).
 *
 * The approval surface for 'action' steps: agents draft, humans decide.
 * Approve = SAIF gate → connector-shape validation → REAL dispatch → run
 * resume. Reject = recorded refusal with reason → run continues past the
 * step. Every path writes the real outcome to the dispatch row; nothing is
 * ever reported as dispatched unless the external system accepted it.
 */

import { z } from "zod";
import { and, desc, eq, inArray } from "drizzle-orm";
import { adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { actionDispatches, workflowRunSteps, workflowRuns } from "../schema";
import { processPendingRuns } from "../execution/queue-processor";
import {
  CONNECTORS,
  listConnectors,
  runSaifCheck,
  validatePayloadForConnector,
} from "../execution/connectors";

/**
 * Operator workspaces whose dispatches admins must see from the cockpit.
 *
 * The mismatch this fixes: seeded and agent-generated material lives in the
 * sentinel workspace (...0001, the default write target for controllers
 * like aiStudioSync), REST god-mode traffic maps to (...0000, tenant.ts),
 * while Robert's tRPC session resolves to his real user workspace — so the
 * Dispatch Decisions card showed zero awaiting items and every approve/
 * reject failed the workspace match, forcing the script lane.
 *
 * Visibility (not re-ownership) is deliberate: the sentinel stays an ACTIVE
 * write target, so re-owning rows would not stop new mismatches. Admins are
 * already gated by adminProcedure; this union only widens what they can see.
 */
const OPERATOR_SENTINEL_WORKSPACE_ID = "00000000-0000-0000-0000-000000000001";
const GOD_MODE_WORKSPACE_ID = "00000000-0000-0000-0000-000000000000";

function visibleWorkspaces(userWorkspaceId: string): string[] {
  return Array.from(
    new Set([
      userWorkspaceId,
      OPERATOR_SENTINEL_WORKSPACE_ID,
      GOD_MODE_WORKSPACE_ID,
    ])
  );
}

export const actionsRouter = router({
  /** Admin: dispatches awaiting approval, then recent decisions. */
  listDispatches: adminProcedure
    .input(
      z
        .object({ limit: z.number().min(1).max(100).default(50) })
        .default({ limit: 50 })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { awaiting: [], recent: [] };
      const workspaceId = ctx.user?.workspaceId;
      if (!workspaceId) return { awaiting: [], recent: [] };

      const awaiting = await db
        .select()
        .from(actionDispatches)
        .where(
          and(
            inArray(
              actionDispatches.workspaceId,
              visibleWorkspaces(workspaceId)
            ),
            eq(actionDispatches.status, "awaiting_approval")
          )
        )
        .orderBy(desc(actionDispatches.createdAt))
        .limit(input.limit);

      const recent = await db
        .select()
        .from(actionDispatches)
        .where(
          inArray(
            actionDispatches.workspaceId,
            visibleWorkspaces(workspaceId)
          )
        )
        .orderBy(desc(actionDispatches.createdAt))
        .limit(input.limit);

      const serialize = (rows: typeof recent) =>
        rows.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
          approvedAt: r.approvedAt?.toISOString() ?? null,
          dispatchedAt: r.dispatchedAt?.toISOString() ?? null,
        }));

      return { awaiting: serialize(awaiting), recent: serialize(recent) };
    }),

  getDispatch: adminProcedure
    .input(z.object({ dispatchId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const workspaceId = ctx.user?.workspaceId;
      if (!workspaceId) throw new Error("Unauthorized");
      const [row] = await db
        .select()
        .from(actionDispatches)
        .where(
          and(
            eq(actionDispatches.id, input.dispatchId),
            inArray(
              actionDispatches.workspaceId,
              visibleWorkspaces(workspaceId)
            )
          )
        );
      if (!row) throw new Error("Dispatch not found");
      return {
        ...row,
        createdAt: row.createdAt.toISOString(),
        approvedAt: row.approvedAt?.toISOString() ?? null,
        dispatchedAt: row.dispatchedAt?.toISOString() ?? null,
      };
    }),

  listConnectors: adminProcedure.query(async () => listConnectors()),

  /**
   * Approve and dispatch. Runs the SAIF gate, validates the payload against
   * the connector contract, performs the real outbound call, records the
   * real result, and resumes the paused run.
   */
  approve: adminProcedure
    .input(z.object({ dispatchId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const workspaceId = ctx.user?.workspaceId;
      if (!workspaceId) throw new Error("Unauthorized");
      const approverId = ctx.user?.id ?? null;

      const [dispatch] = await db
        .select()
        .from(actionDispatches)
        .where(eq(actionDispatches.id, input.dispatchId));
      if (
        !dispatch ||
        !visibleWorkspaces(workspaceId).includes(dispatch.workspaceId)
      ) {
        throw new Error("Dispatch not found");
      }
      if (dispatch.status !== "awaiting_approval") {
        throw new Error(
          `Dispatch is ${dispatch.status}, not awaiting_approval — it was already decided.`
        );
      }

      // 1. SAIF gate on the exact outbound payload
      const saif = runSaifCheck(dispatch.payload as Record<string, unknown>);
      if (!saif.passed) {
        await db
          .update(actionDispatches)
          .set({
            status: "awaiting_approval",
            saifPassed: false,
            saifReason: saif.reason ?? "SAIF check failed",
            approvedBy: approverId,
            approvedAt: new Date(),
          })
          .where(eq(actionDispatches.id, dispatch.id));
        throw new Error(`SAIF check blocked dispatch: ${saif.reason}`);
      }

      // 2. Connector-shape validation (strip nothing silently)
      const validation = validatePayloadForConnector(
        dispatch.connector,
        dispatch.payload as Record<string, unknown>
      );
      if (!validation.ok) {
        await db
          .update(actionDispatches)
          .set({
            saifPassed: true,
            approvedBy: approverId,
            approvedAt: new Date(),
            status: "dispatch_failed",
            dispatchError: `Payload validation failed: ${validation.error}`,
            dispatchedAt: new Date(),
            runOutcome: "failed",
          })
          .where(eq(actionDispatches.id, dispatch.id));
        throw new Error(`Payload validation failed: ${validation.error}`);
      }

      // 3. Real dispatch — the actionDispatches.connector column is typed as
      // a plain string, so the registry lookup decides which connector runs.
      const connectorDef = CONNECTORS[dispatch.connector];
      if (!connectorDef) {
        await db
          .update(actionDispatches)
          .set({
            status: "dispatch_failed",
            saifPassed: true,
            approvedBy: approverId,
            approvedAt: new Date(),
            dispatchError: `Unknown connector at approve time: ${dispatch.connector}`,
            dispatchedAt: new Date(),
            runOutcome: "failed",
          })
          .where(eq(actionDispatches.id, dispatch.id));
        throw new Error(`Unknown connector: ${dispatch.connector}`);
      }
      // Inject the dispatching workspace AFTER validation so a draft can
      // never smuggle a workspace id through the connector contract.
      const result = await connectorDef.dispatch({
        ...validation.cleaned,
        __workspaceId: workspaceId,
      });

      if (!result.ok) {
        await db
          .update(actionDispatches)
          .set({
            status: "dispatch_failed",
            saifPassed: true,
            approvedBy: approverId,
            approvedAt: new Date(),
            dispatchedAt: new Date(),
            dispatchError: result.error ?? "Unknown dispatch error",
            runOutcome: "failed",
          })
          .where(eq(actionDispatches.id, dispatch.id));

        // Mark the run step failed honestly; the run stays paused for review.
        if (dispatch.workflowRunStepId) {
          await db
            .update(workflowRunSteps)
            .set({
              status: "failed",
              completedAt: new Date(),
              errorMessage: `Dispatch failed: ${result.error}`,
            })
            .where(eq(workflowRunSteps.id, dispatch.workflowRunStepId));
        }

        return {
          dispatched: false,
          error: result.error,
          message: "Dispatch failed — the external system rejected or could not be reached. Run left paused for review.",
        };
      }

      // 4. Record success and resume the run
      await db
        .update(actionDispatches)
        .set({
          status: "dispatched",
          saifPassed: true,
          approvedBy: approverId,
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
      if (dispatch.workflowRunId) {
        await db
          .update(workflowRuns)
          .set({ status: "pending", updatedAt: new Date() })
          .where(eq(workflowRuns.id, dispatch.workflowRunId));
        // Real resume through the actual pipeline.
        try {
          await processPendingRuns();
        } catch (resumeErr: any) {
          console.error("[Actions] Run resume failed:", resumeErr?.message);
        }
      }

      return {
        dispatched: true,
        externalId: result.externalId ?? null,
        externalUrl: result.externalUrl ?? null,
        message: "Dispatched. Run resumed.",
      };
    }),

  /** Reject: record the human's refusal with a reason; run continues past the step. */
  reject: adminProcedure
    .input(
      z.object({
        dispatchId: z.string().uuid(),
        reason: z.string().trim().min(1).max(2000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const workspaceId = ctx.user?.workspaceId;
      if (!workspaceId) throw new Error("Unauthorized");
      const approverId = ctx.user?.id ?? null;

      const [dispatch] = await db
        .select()
        .from(actionDispatches)
        .where(eq(actionDispatches.id, input.dispatchId));
      if (
        !dispatch ||
        !visibleWorkspaces(workspaceId).includes(dispatch.workspaceId)
      ) {
        throw new Error("Dispatch not found");
      }
      if (dispatch.status !== "awaiting_approval") {
        throw new Error(
          `Dispatch is ${dispatch.status}, not awaiting_approval — it was already decided.`
        );
      }

      await db
        .update(actionDispatches)
        .set({
          status: "rejected",
          rejectedReason: input.reason,
          approvedBy: approverId,
          approvedAt: new Date(),
          runOutcome: "rejected",
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
              rejected: true,
              reason: input.reason,
            },
          })
          .where(eq(workflowRunSteps.id, dispatch.workflowRunStepId));
      }
      if (dispatch.workflowRunId) {
        await db
          .update(workflowRuns)
          .set({ status: "pending", updatedAt: new Date() })
          .where(eq(workflowRuns.id, dispatch.workflowRunId));
        try {
          await processPendingRuns();
        } catch (resumeErr: any) {
          console.error("[Actions] Run resume failed:", resumeErr?.message);
        }
      }

      return { rejected: true, message: "Dispatch rejected. Run resumed past this step." };
    }),
});
