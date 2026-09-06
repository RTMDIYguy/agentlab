import type { Request, Response } from "express";
import { eq, desc, and, asc } from "drizzle-orm";
import { getDb } from "../db";
import {
  workflowRuns,
  workflowRunSteps,
  workflows,
  workflowSteps,
  workflowArtifacts,
  agents,
  auditLogs,
} from "../schema";
import { processPendingRuns } from "../execution/queue-processor";

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

    // Explicitly run the queue processor synchronously to avoid serverless CPU throttling
    await processPendingRuns();

    res.status(201).json({
      message: "Workflow run triggered successfully",
      runId: newRunId,
    });
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

    const currentRun = runData[0];

    // 1. Fetch workflow metadata
    let workflowInfo: any = null;
    if (currentRun.workflowId) {
      const wfRes = await db
        .select()
        .from(workflows)
        .where(eq(workflows.id, currentRun.workflowId))
        .limit(1);
      if (wfRes.length > 0) {
        workflowInfo = wfRes[0];
      }
    }

    // 2. Fetch run steps
    const rawRunSteps = await db
      .select()
      .from(workflowRunSteps)
      .where(
        and(
          eq(workflowRunSteps.workflowRunId, runId),
          eq(workflowRunSteps.workspaceId, workspaceId)
        )
      )
      .orderBy(asc(workflowRunSteps.createdAt));

    // 3. Fetch step definitions and agent assignments for enrichment
    const stepDefinitions = currentRun.workflowId
      ? await db
          .select()
          .from(workflowSteps)
          .where(eq(workflowSteps.workflowId, currentRun.workflowId))
      : [];

    const stepDefMap = new Map(stepDefinitions.map((s: any) => [s.id, s]));

    // Fetch agents
    const agentsList = await db
      .select()
      .from(agents)
      .where(eq(agents.workspaceId, workspaceId));
    const agentMap = new Map(agentsList.map((a: any) => [a.id, a]));

    const enrichedSteps = rawRunSteps.map((rs: any, idx: number) => {
      const stepDef = stepDefMap.get(rs.workflowStepId);
      const agentInfo = stepDef?.agentId ? agentMap.get(stepDef.agentId) : null;
      const outputPayload = rs.outputPayload as any;
      const toolsExecuted = outputPayload?._telemetry?.toolsExecuted || [];

      return {
        ...rs,
        stepTitle: stepDef?.title || `Step ${idx + 1}`,
        stepType: stepDef?.stepType || "agent",
        actionPrompt: stepDef?.actionPrompt || "",
        agentName: agentInfo?.name || stepDef?.agentId || "Ops Agent",
        agentRole: agentInfo?.role || "Execution Node",
        toolsExecuted,
        artifactsCreatedCount: outputPayload?._telemetry?.artifactsCreated || 0,
      };
    });

    // 4. Fetch artifacts produced by this run
    const artifacts = await db
      .select()
      .from(workflowArtifacts)
      .where(
        and(
          eq(workflowArtifacts.workspaceId, workspaceId),
          eq(workflowArtifacts.workflowRunId, runId)
        )
      )
      .orderBy(asc(workflowArtifacts.createdAt));

    // 5. Aggregate metrics
    const totalToolsCount = enrichedSteps.reduce(
      (sum: number, s: any) => sum + (s.toolsExecuted?.length || 0),
      0
    );
    const totalCost = enrichedSteps.reduce(
      (sum: number, s: any) => sum + (parseFloat(s.cost || "0") || 0),
      0
    );
    const totalLatencyMs = enrichedSteps.reduce(
      (sum: number, s: any) => sum + (s.latencyMs || 0),
      0
    );

    res.status(200).json({
      run: currentRun,
      workflow: workflowInfo,
      steps: enrichedSteps,
      artifacts,
      totalToolsCount,
      totalCost: totalCost.toFixed(6),
      totalLatencyMs,
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

    // Explicitly run the queue processor synchronously
    await processPendingRuns();

    res.status(200).json({ message: "Run approved and resumed" });
  } catch (error) {
    console.error("[Runs Controller Error]:", error);
    res.status(500).json({ error: "Failed to approve run" });
  }
}

export async function rejectRun(req: Request, res: Response): Promise<void> {
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
      .set({ 
        status: "failed", 
        errorMessage: "Rejected by user",
        completedAt: new Date(), 
        updatedAt: new Date() 
      })
      .where(eq(workflowRuns.id, runId));

    res.status(200).json({ message: "Run rejected" });
  } catch (error) {
    console.error("[Runs Controller Error]:", error);
    res.status(500).json({ error: "Failed to reject run" });
  }
}
