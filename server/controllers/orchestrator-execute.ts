import type { Request, Response } from "express";
import { and, asc, eq } from "drizzle-orm";
import { getDb } from "../db";
import {
  auditLogs,
  workflowArtifacts,
  workflowRuns,
  workflowRunSteps,
  workflowSteps,
  workflows as dbWorkflows,
} from "../schema";
import { processPendingRuns } from "../execution/queue-processor";
import type { WorkflowProposal } from "../domain/schemas";

/**
 * Executes an approved Ops-Agent workflow proposal through the REAL agent
 * pipeline. Replaces the previous implementation that inserted an
 * instant-"completed" run with a backdated startedAt and pre-canned template
 * artifacts presenting invented marketing copy as freshly generated
 * deliverables (honesty-audit finding, CC-2026-09-23-011).
 *
 * Flow:
 *  1. Resolve or create the target workflow (workspace-scoped).
 *  2. Sync the proposal's steps into workflow_steps — create-once, so
 *     re-executions reuse the same DAG instead of duplicating rows (the
 *     run-steps FK cascades on step delete, so destructive sync is unsafe).
 *  3. Insert a run with status "pending" and REAL timestamps (the queue
 *     processor owns startedAt/completedAt from here).
 *  4. Run the actual pipeline: processPendingRuns() executes each step with
 *     the real agent runner, persisting run steps, extracted artifacts, and
 *     per-step audit telemetry. Guardrail steps pause the run for approval;
 *     failures mark the run failed with the real error.
 *  5. Report the run's ACTUAL database state — never a fabricated success.
 */
export async function executeOrchestratorWorkflow(
  req: Request,
  res: Response
): Promise<void> {
  const workspaceId = req.workspaceId;
  if (!workspaceId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { proposal, workflowId: providedWorkflowId } = req.body as {
    proposal?: WorkflowProposal;
    workflowId?: string;
  };

  if (
    !proposal ||
    typeof proposal.name !== "string" ||
    !proposal.name.trim() ||
    !Array.isArray(proposal.steps) ||
    proposal.steps.length === 0
  ) {
    res.status(400).json({
      error:
        "A proposal with a name and at least one step is required to execute a workflow run.",
    });
    return;
  }

  const title = proposal.name.trim().slice(0, 128);
  const dept = (proposal.departmentCode || "OPS").toUpperCase();

  const db = await getDb();
  if (!db) {
    res.status(503).json({ error: "Database unavailable" });
    return;
  }

  try {
    // 1. Resolve the target workflow: explicit id (workspace-verified), or
    //    an existing workflow with the same name, or create it.
    let targetWfId: string | undefined;

    if (providedWorkflowId) {
      const [owned] = await db
        .select({ id: dbWorkflows.id })
        .from(dbWorkflows)
        .where(
          and(
            eq(dbWorkflows.id, providedWorkflowId),
            eq(dbWorkflows.workspaceId, workspaceId)
          )
        )
        .limit(1);
      targetWfId = owned?.id;
      if (providedWorkflowId && !targetWfId) {
        res.status(404).json({ error: "Workflow not found in this workspace" });
        return;
      }
    }

    if (!targetWfId) {
      const [existing] = await db
        .select({ id: dbWorkflows.id })
        .from(dbWorkflows)
        .where(
          and(
            eq(dbWorkflows.workspaceId, workspaceId),
            eq(dbWorkflows.name, title)
          )
        )
        .limit(1);
      targetWfId = existing?.id;
    }

    if (!targetWfId) {
      const [insertedWf] = await db
        .insert(dbWorkflows)
        .values({
          workspaceId,
          name: title,
          description:
            proposal.description ||
            `Ops Agent proposal executed via the real agent pipeline (${dept}).`,
          triggerType: "ops_agent",
          status: "active",
        })
        .returning();
      targetWfId = insertedWf.id;
    }

    // 2. Create-once step sync: the pipeline executes workflow_steps, so the
    //    proposal's steps must exist as real DAG nodes. If the workflow
    //    already has steps (re-execution), reuse them.
    const existingSteps = await db
      .select({ id: workflowSteps.id })
      .from(workflowSteps)
      .where(eq(workflowSteps.workflowId, targetWfId))
      .orderBy(asc(workflowSteps.orderIndex));

    if (existingSteps.length === 0) {
      const stepRows = proposal.steps.slice(0, 20).map((step, idx) => ({
        workspaceId,
        workflowId: targetWfId!,
        agentId: step.agentId || null,
        orderIndex: step.stepNumber ?? idx + 1,
        stepType: classifyStepType(step.type),
        title: (step.title || `Step ${idx + 1}`).slice(0, 128),
        actionPrompt:
          step.detail?.trim() || `Execute workflow step: ${step.title || idx + 1}`,
      }));
      if (stepRows.length > 0) {
        await db.insert(workflowSteps).values(stepRows);
      }
    }

    // 3. Queue the run as pending with real timestamps — the pipeline owns
    //    the lifecycle from here.
    const [insertedRun] = await db
      .insert(workflowRuns)
      .values({
        workspaceId,
        workflowId: targetWfId,
        status: "pending",
        triggerSource: "ops_agent",
        initialContext: { proposal },
      })
      .returning();

    // 4. Real execution. This is synchronous (same choice triggerRun makes
    //    to avoid serverless CPU throttling); the client sees the spinner
    //    until the run actually finishes — or pauses at a guardrail.
    await processPendingRuns();

    // 5. Read back the run's ACTUAL outcome.
    const [finalRun] = await db
      .select()
      .from(workflowRuns)
      .where(eq(workflowRuns.id, insertedRun.id))
      .limit(1);

    const runStatus = finalRun?.status ?? "unknown";

    const stepRowsForRun = await db
      .select({
        status: workflowRunSteps.status,
        cost: workflowRunSteps.cost,
      })
      .from(workflowRunSteps)
      .where(eq(workflowRunSteps.workflowRunId, insertedRun.id));
    const stepsCompleted = stepRowsForRun.filter(
      s => s.status === "completed"
    ).length;
    const stepsFailed = stepRowsForRun.filter(s => s.status === "failed").length;

    const artifactRows = await db
      .select({ title: workflowArtifacts.title })
      .from(workflowArtifacts)
      .where(eq(workflowArtifacts.workflowRunId, insertedRun.id));

    // Real cost telemetry comes from the per-step run rows the pipeline
    // wrote (audit_logs has no run linkage, so it cannot be attributed to
    // this run; per-step token counts are not persisted anywhere — tokens
    // are therefore reported as null, not guessed).
    const hasCostTelemetry = stepRowsForRun.some(s => s.cost != null);
    const costSum = stepRowsForRun.reduce((acc, s) => {
      const n = s.cost != null ? Number(s.cost) : 0;
      return Number.isFinite(n) ? acc + n : acc;
    }, 0);

    const latencyMs =
      finalRun?.startedAt && finalRun?.completedAt
        ? new Date(finalRun.completedAt).getTime() -
          new Date(finalRun.startedAt).getTime()
        : null;

    const base = {
      runId: insertedRun.id,
      workflowId: targetWfId,
      workflowName: title,
      departmentCode: dept,
      status: runStatus,
      timestamp: new Date().toISOString(),
      artifactsCount: artifactRows.length,
      artifacts: artifactRows.map(a => a.title).slice(0, 10),
      stepsCompleted,
      stepsFailed,
      executionMetrics: {
        latencyMs,
        tokensUsed: null,
        cost: hasCostTelemetry ? costSum.toFixed(6) : null,
        model: "per-step (see run inspector)",
      },
    };

    if (runStatus === "completed") {
      res.status(200).json({
        ...base,
        success: true,
        summary: `Run completed: ${stepsCompleted}/${stepRowsForRun.length} steps executed, ${artifactRows.length} artifact(s) created by real agent execution. Inspect the run in Command Center for full telemetry.`,
      });
      return;
    }

    if (runStatus === "paused_for_approval") {
      res.status(200).json({
        ...base,
        success: true,
        summary: `Run paused for approval at a guardrail step after ${stepsCompleted} completed step(s). Approve it in Command Center to resume.`,
      });
      return;
    }

    if (runStatus === "failed") {
      res.status(200).json({
        ...base,
        success: false,
        errorMessage: finalRun?.errorMessage || "One or more steps failed.",
        summary: `Run failed after ${stepsCompleted} completed step(s). See the run inspector for the failing step and error.`,
      });
      return;
    }

    // Still running / pending / unknown — report honestly.
    res.status(200).json({
      ...base,
      success: true,
      summary: `Run is currently "${runStatus}" with ${stepsCompleted} completed step(s). Track it in Command Center.`,
    });
  } catch (error: any) {
    console.error("[Orchestrator Execute] Error:", error);
    res.status(500).json({
      error: error?.message || "Failed to execute workflow run",
    });
  }
}

/**
 * Map a proposal step's free-text type onto a real workflow_steps.stepType.
 * Unknown types default to "agent" — the pipeline's honest general case.
 */
function classifyStepType(type: string | undefined): string {
  const t = (type || "").toLowerCase();
  if (t.includes("guardrail") || t.includes("approval") || t.includes("hitl")) {
    return "guardrail";
  }
  if (t.includes("trigger")) return "trigger";
  if (t.includes("destination") || t.includes("publish") || t.includes("email")) {
    return "destination";
  }
  return "agent";
}
