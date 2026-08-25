import type { Request, Response } from "express";
import type { ProposedWorkflow } from "./orchestrator";

export interface WorkflowSummaryDto {
  id: string;
  name: string;
  description: string;
  triggerType: string;
  status: "active" | "paused" | "draft" | "archived";
  successRate: number;
  stepsCount: number;
  lastRunAt: string;
}

const DEFAULT_WORKSPACE_WORKFLOWS: WorkflowSummaryDto[] = [
  {
    id: "wf-001",
    name: "Inbound Lead Enrichment",
    description:
      "Enriches founder leads from Bootstrapper events with LinkedIn and Hunter.io APIs.",
    triggerType: "Event / Inbound Webhook",
    status: "active",
    successRate: 99.4,
    stepsCount: 5,
    lastRunAt: "2026-08-22T10:22:15Z",
  },
  {
    id: "wf-002",
    name: "M365 Daily Financial Reconciliation",
    description:
      "Reconciles Stripe transactions against M365 Finance Control sheet at 18:00 UTC.",
    triggerType: "Cron Schedule (Daily @ 18:00)",
    status: "active",
    successRate: 98.8,
    stepsCount: 4,
    lastRunAt: "2026-08-21T18:00:00Z",
  },
  {
    id: "wf-003",
    name: "Automated CI/CD Test & Refactor Suite",
    description:
      "Runs Vitest suites, checks TypeScript compilation, and submits PR reports.",
    triggerType: "GitHub Webhook (push/PR)",
    status: "active",
    successRate: 100.0,
    stepsCount: 3,
    lastRunAt: "2026-08-22T10:21:40Z",
  },
];

import { getDb } from "../db";
import { workflows, workflowSteps } from "../schema";
import { eq } from "drizzle-orm";

export async function getWorkflows(req: Request, res: Response): Promise<void> {
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

    const workspaceWorkflows = await db
      .select()
      .from(workflows)
      .where(eq(workflows.workspaceId, workspaceId));

    res.status(200).json({
      workspaceId,
      workflows: workspaceWorkflows,
      totalCount: workspaceWorkflows.length,
    });
  } catch (error) {
    console.error("[Workflows Controller Error]:", error);
    res.status(500).json({ error: "Failed to fetch workflows." });
  }
}

export async function deployWorkflow(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const workspaceId = req.workspaceId;
    const { proposalId, proposal } = req.body as {
      proposalId?: string;
      proposal?: ProposedWorkflow;
    };

    if (!proposalId && !proposal) {
      res.status(400).json({
        error: "Either proposalId or full proposal object is required.",
      });
      return;
    }

    if (!workspaceId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "Database unavailable" });
      return;
    }

    const workflowName =
      proposal?.name || `Workflow-${proposalId || Date.now()}`;
    const newWorkflowId = proposalId || `wf-${Date.now().toString().slice(-4)}`; // Use proposalId if available

    const [insertedWorkflow] = await db
      .insert(workflows)
      .values({
        workspaceId,
        name: workflowName,
        description: proposal?.description || "",
        triggerType: proposal?.triggerType || "manual",
        status: "active",
      })
      .returning();

    if (proposal?.steps && Array.isArray(proposal.steps)) {
      const stepValues = proposal.steps.map((step, index) => ({
        workspaceId,
        workflowId: insertedWorkflow.id,
        orderIndex: index,
        stepType: "agent",
        title: step.description.substring(0, 50),
        actionPrompt: step.description,
      }));
      if (stepValues.length > 0) {
        await db.insert(workflowSteps).values(stepValues);
      }
    }

    res.status(201).json({
      message: `Workflow "${workflowName}" successfully approved and deployed to active runtime.`,
      workspaceId,
      workflow: {
        id: insertedWorkflow.id,
        name: insertedWorkflow.name,
        status: insertedWorkflow.status,
        triggerType: insertedWorkflow.triggerType,
        stepsCount: proposal?.steps?.length || 0,
        deployedAt: insertedWorkflow.createdAt,
      },
    });
  } catch (error) {
    console.error("[Workflow Deployment Error]:", error);
    res.status(500).json({ error: "Failed to deploy workflow." });
  }
}
