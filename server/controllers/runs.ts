import type { Request, Response } from "express";
import { eq, desc, and, asc } from "drizzle-orm";
import { getDb } from "../db";
import { workflowRuns, workflowRunSteps, workflows, auditLogs } from "../schema";

export async function triggerRun(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.workspaceId;
    if (!workspaceId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { workflowId } = req.params;
    const { initialContext, triggerSource } = req.body;

    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "Database unavailable" });
      return;
    }

    // Verify workflow belongs to workspace
    const workflowCheck = await db
      .select()
      .from(workflows)
      .where(
        and(
          eq(workflows.id, workflowId),
          eq(workflows.workspaceId, workspaceId)
        )
      )
      .limit(1);

    if (workflowCheck.length === 0) {
      res.status(404).json({ error: "Workflow not found" });
      return;
    }

    const newRunId = crypto.randomUUID();

    await db.insert(workflowRuns).values({
      id: newRunId,
      workspaceId,
      workflowId,
      status: "pending",
      triggerSource: triggerSource || "manual",
      initialContext: initialContext || {},
    } as any);

    res.status(201).json({
      message: "Workflow run triggered successfully",
      runId: newRunId,
    });

    // Simulate background execution engine progressing to 'paused_for_approval'
    setTimeout(async () => {
      try {
        const bgDb = await getDb();
        if (bgDb) {
          await bgDb
            .update(workflowRuns)
            .set({ status: "paused_for_approval", updatedAt: new Date() })
            .where(eq(workflowRuns.id, newRunId));
          
          await bgDb.insert(auditLogs).values({
            workspaceId,
            actionType: "guardrail_pause",
            payloadIn: { resource: `workflowRuns/${newRunId}`, reason: "Budget limit reached. Requires human approval." },
            tokensTotal: 1500,
            latencyMs: 2000,
            cost: "0.05",
          });
          console.log(`[Execution Engine Mock] Run ${newRunId} paused for approval.`);
        }
      } catch (err) {
        console.error("[Execution Engine Mock Error]", err);
      }
    }, 2000);
  } catch (error) {
    console.error("[Runs Controller Error]:", error);
    res.status(500).json({ error: "Failed to trigger run" });
  }
}

export async function listRuns(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.workspaceId;
    if (!workspaceId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "Database unavailable" });
      return;
    }

    const runs = await db
      .select()
      .from(workflowRuns)
      .where(eq(workflowRuns.workspaceId, workspaceId))
      .orderBy(desc(workflowRuns.createdAt))
      .limit(50);

    res.status(200).json({ runs });
  } catch (error) {
    console.error("[Runs Controller Error]:", error);
    res.status(500).json({ error: "Failed to list runs" });
  }
}

export async function getRunDetails(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const workspaceId = req.workspaceId;
    if (!workspaceId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { runId } = req.params;

    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "Database unavailable" });
      return;
    }

    const runData = await db
      .select()
      .from(workflowRuns)
      .where(
        and(
          eq(workflowRuns.id, runId),
          eq(workflowRuns.workspaceId, workspaceId)
        )
      )
      .limit(1);

    if (runData.length === 0) {
      res.status(404).json({ error: "Run not found" });
      return;
    }

    const stepsData = await db
      .select()
      .from(workflowRunSteps)
      .where(
        and(
          eq(workflowRunSteps.workflowRunId, runId),
          eq(workflowRunSteps.workspaceId, workspaceId)
        )
      )
      .orderBy(asc(workflowRunSteps.createdAt));

    res.status(200).json({
      run: runData[0],
      steps: stepsData,
    });
  } catch (error) {
    console.error("[Runs Controller Error]:", error);
    res.status(500).json({ error: "Failed to get run details" });
  }
}

export async function approveRun(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.workspaceId;
    if (!workspaceId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { runId } = req.params;

    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "Database unavailable" });
      return;
    }

    const runData = await db
      .select()
      .from(workflowRuns)
      .where(
        and(
          eq(workflowRuns.id, runId),
          eq(workflowRuns.workspaceId, workspaceId)
        )
      )
      .limit(1);

    if (runData.length === 0) {
      res.status(404).json({ error: "Run not found" });
      return;
    }

    if (runData[0].status !== "paused_for_approval") {
      res.status(400).json({ error: "Run is not pending approval" });
      return;
    }

    await db
      .update(workflowRuns)
      .set({ status: "pending", updatedAt: new Date() })
      .where(eq(workflowRuns.id, runId));

    res.status(200).json({ message: "Run approved and resumed" });

    // Simulate background execution engine progressing to 'completed'
    setTimeout(async () => {
      try {
        const bgDb = await getDb();
        if (bgDb) {
          await bgDb
            .update(workflowRuns)
            .set({ status: "completed", completedAt: new Date(), updatedAt: new Date() })
            .where(eq(workflowRuns.id, runId));
          
          await bgDb.insert(auditLogs).values({
            workspaceId,
            actionType: "workflow_run_completed",
            payloadIn: { resource: `workflowRuns/${runId}`, message: "Run completed successfully after approval." },
            tokensTotal: 500,
            latencyMs: 1500,
            cost: "0.01",
          });
          console.log(`[Execution Engine Mock] Run ${runId} completed.`);
        }
      } catch (err) {
        console.error("[Execution Engine Mock Error]", err);
      }
    }, 2000);
  } catch (error) {
    console.error("[Runs Controller Error]:", error);
    res.status(500).json({ error: "Failed to approve run" });
  }
}
