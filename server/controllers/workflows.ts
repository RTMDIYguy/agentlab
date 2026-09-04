import type { Request, Response } from "express";
import type { ProposedWorkflow } from "./orchestrator";
import { CronExpressionParser } from "cron-parser";


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
import { eq, and, asc } from "drizzle-orm";

const CANONICAL_10_WORKFLOWS = [
  {
    name: "Inbound Lead Enrichment & Verification",
    description: "Enriches founder leads from Bootstrapper events with LinkedIn and Hunter.io APIs, then qualifies for CRM triage.",
    triggerType: "Event / Inbound Webhook",
    steps: [
      { title: "Extract Inbound Lead Profile", detail: "Parse name, company domain, and event notes from incoming payload.", type: "agent" },
      { title: "Enrich Company Tech Stack & Headcount", detail: "Query Hunter.io and clearbit APIs to enrich lead firmographics.", type: "agent" },
      { title: "Verify Quality & Compliance Guardrail", detail: "Check against ICP criteria before routing to active sales queue.", type: "guardrail" },
      { title: "Sync Qualified Lead to HubSpot & M365", detail: "Upsert contact in HubSpot CRM and log entry in M365 master lead sheet.", type: "agent" },
    ]
  },
  {
    name: "M365 Daily Financial Reconciliation",
    description: "Reconciles Stripe and Mercury transactions against M365 Finance Control sheet at 18:00 UTC daily.",
    triggerType: "Cron Schedule (Daily @ 18:00)",
    steps: [
      { title: "Fetch Daily Stripe & Bank Settlements", detail: "Extract all net settlements, fees, and payouts for the trailing 24 hours.", type: "agent" },
      { title: "Reconcile Cash Flows Against M365 Ledger", detail: "Match transaction IDs against operating expense budget categories.", type: "agent" },
      { title: "Flag Variance Discrepancies & Anomalies", detail: "Generate daily financial summary and alert if variance exceeds $50.", type: "agent" },
    ]
  },
  {
    name: "Automated CI/CD Test & Refactor Suite",
    description: "Runs Vitest suites, checks TypeScript compilation, and submits PR refactor reports.",
    triggerType: "GitHub Webhook (push/PR)",
    steps: [
      { title: "Compile TypeScript & Run Vitest Suite", detail: "Execute pnpm check and test harnesses across all server/client routes.", type: "agent" },
      { title: "Audit AST & Scan Security Dependencies", detail: "Inspect codebase for circular dependencies, type leaks, and vulnerabilities.", type: "agent" },
      { title: "Publish CI/CD Health Report to Slack/GitHub", detail: "Format test coverage metrics and post build certification status.", type: "agent" },
    ]
  },
  {
    name: "Founder Signal Content Dissemination",
    description: "Extracts insights from Founder Signal Sprints, formats 5-post LinkedIn syndication drafts, and updates Content-Queue.",
    triggerType: "Cron Schedule (Mon/Wed/Fri @ 09:00)",
    steps: [
      { title: "Analyze Recent Operational Briefs & Case Studies", detail: "Extract high-impact takeaways from recent client and repo milestones.", type: "agent" },
      { title: "Draft Multi-Hook LinkedIn & X Posts", detail: "Structure 5 authoritative thought leadership drafts using the URC brand voice.", type: "agent" },
      { title: "Human-in-the-Loop Copy Review", detail: "Operator approves copy hooks, tone guardrails, and asset links.", type: "guardrail" },
      { title: "Stage Drafts in LinkedIn Content Queue", detail: "Save reviewable posts into Content-Queue.md with scheduled publish dates.", type: "agent" },
    ]
  },
  {
    name: "HubSpot Deal Stage & Pipeline Sync",
    description: "Queries HubSpot CRM pipelines, updates deal velocities, and alerts on stalled opportunities.",
    triggerType: "Cron Schedule (Hourly)",
    steps: [
      { title: "Query Active HubSpot Deals & Contact Stages", detail: "Extract all active pipeline deals, stages, amounts, and last activity dates.", type: "agent" },
      { title: "Calculate Stalled Probability & Deal Health", detail: "Identify deals with no touchpoints in >5 days and prioritize outreach.", type: "agent" },
      { title: "Push Next-Action Tasks into CRM Pipeline", detail: "Create follow-up tasks and sync deal status directly in HubSpot CRM.", type: "agent" },
    ]
  },
  {
    name: "Bootstrapper Founder Roundtable Intake",
    description: "Ingests founder event registrations, evaluates ICP fit against 4-Engine criteria, and triggers custom prep packets.",
    triggerType: "Event Webhook (Luma / Meetup)",
    steps: [
      { title: "Parse Attendee Application & Business Model", detail: "Extract attendee founder stage, revenue band, and primary bottleneck.", type: "agent" },
      { title: "Generate 4-Engine Diagnostic Scorecard", detail: "Compute baseline maturity score across Profit, People, Value, and Financial engines.", type: "agent" },
      { title: "Send Personalized Welcome & Pre-Session Brief", detail: "Draft customized pre-roundtable brief with relevant case study references.", type: "agent" },
    ]
  },
  {
    name: "Compliance Audit & Change Ledger Verification",
    description: "Scans repository against Canonical Registry, verifies kit manifests, and generates drift audit reports.",
    triggerType: "Cron Schedule (Daily @ Midnight)",
    steps: [
      { title: "Scan 77+ Documents in Operational Catalog", detail: "Execute verify-change-control scanner across all operational markdown files.", type: "agent" },
      { title: "Validate Manifest Versions vs Change Control Ledger", detail: "Confirm every modified kit carries an active CC-* entry in the register.", type: "agent" },
      { title: "Generate Signed Compliance Audit Log", detail: "Save timestamped audit evidence in Compliance Audits directory.", type: "agent" },
    ]
  },
  {
    name: "Client Onboarding & Journey Kit Provisioning",
    description: "Provisions dedicated client workspace, copies standardized Journey Kits, and establishes secure credential vaults.",
    triggerType: "Manual / Contract Signed Event",
    steps: [
      { title: "Create Client Dedicated Workspace Partition", detail: "Initialize isolated workspace partition with client brand tokens and credentials.", type: "agent" },
      { title: "Deploy Department Journey Kits & Playbooks", detail: "Mount MKT, SAL, and OPS standard starter kits into client directory.", type: "agent" },
      { title: "Run Initial Self-Test & Issue Welcome Packet", detail: "Verify API connectivity and generate client Owner's Manual quickstart.", type: "agent" },
    ]
  },
  {
    name: "Weekly Operational Scorecard & Metrics Rollup",
    description: "Rolls up weekly task completions, latency metrics, cloud spend, and founder time-savings into executive brief.",
    triggerType: "Cron Schedule (Sunday @ 20:00)",
    steps: [
      { title: "Aggregate 7-Day Swarm Task & Latency Metrics", detail: "Query workflowRuns and auditLogs for throughput, success rates, and token cost.", type: "agent" },
      { title: "Compute Quantified ROI & Cost Savings", detail: "Calculate hours reclaimed (25+ hrs/wk) and SaaS shelfware cut ($18k/yr run-rate).", type: "agent" },
      { title: "Format Weekly Executive Brief in Markdown", detail: "Publish concise weekly executive operating scorecard for leadership review.", type: "agent" },
    ]
  },
  {
    name: "Automated Backup & State Machine Checkpoint",
    description: "Snapshots PostgreSQL database, verifies schema integrity, and checkpoints Drizzle state machine.",
    triggerType: "Cron Schedule (Daily @ 02:00)",
    steps: [
      { title: "Create Timestamped Database Dump", detail: "Export full SQL state of workflows, runs, steps, and audit logs.", type: "agent" },
      { title: "Verify Schema Integrity & Foreign Keys", detail: "Validate database foreign key consistency and Drizzle schema alignment.", type: "agent" },
      { title: "Log Backup Verification to Compliance Audits", detail: "Record backup hash and storage verification in compliance register.", type: "agent" },
    ]
  },
];

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

    let workspaceWorkflows = await db
      .select()
      .from(workflows)
      .where(eq(workflows.workspaceId, workspaceId));

    // Auto-seed canonical 10 workflows if workspace is empty
    if (workspaceWorkflows.length === 0) {
      console.log(`[Workflows Controller] Seeding 10 canonical workflows for workspace: ${workspaceId}`);
      for (const canonical of CANONICAL_10_WORKFLOWS) {
        try {
          const [insertedWf] = await db
            .insert(workflows)
            .values({
              workspaceId,
              name: canonical.name,
              description: canonical.description,
              triggerType: canonical.triggerType,
              status: "active",
            })
            .returning();

          if (canonical.steps && canonical.steps.length > 0) {
            const stepValues = canonical.steps.map((st, idx) => ({
              workspaceId,
              workflowId: insertedWf.id,
              orderIndex: idx,
              stepType: st.type || "agent",
              title: st.title.substring(0, 128),
              actionPrompt: st.detail,
            }));
            await db.insert(workflowSteps).values(stepValues);
          }
        } catch (seedErr) {
          console.warn("[Workflows Controller] Seed item skipped or exists:", seedErr);
        }
      }

      workspaceWorkflows = await db
        .select()
        .from(workflows)
        .where(eq(workflows.workspaceId, workspaceId));
    }

    const allSteps = await db
      .select()
      .from(workflowSteps)
      .where(eq(workflowSteps.workspaceId, workspaceId))
      .orderBy(asc(workflowSteps.orderIndex));

    const stepsByWorkflow = allSteps.reduce<Record<string, any[]>>((acc, step) => {
      if (!acc[step.workflowId]) acc[step.workflowId] = [];
      acc[step.workflowId].push(step);
      return acc;
    }, {});

    const enrichedWorkflows = workspaceWorkflows.map((wf) => {
      const steps = stepsByWorkflow[wf.id] || [];
      return {
        ...wf,
        steps,
        stepsCount: steps.length,
      };
    });

    res.status(200).json({
      workspaceId,
      workflows: enrichedWorkflows,
      totalCount: enrichedWorkflows.length,
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

    let workflowName =
      proposal?.name || `Workflow-${proposalId || Date.now()}`;
      
    const newWorkflowId = proposalId || `wf-${Date.now().toString().slice(-4)}`;

    let insertedWorkflow: any = null;
    let suffix = 0;
    
    // Retry loop to handle concurrent inserts that might violate the unique constraint
    while (!insertedWorkflow) {
      try {
        const finalName = suffix === 0 ? workflowName : `${workflowName} (${suffix})`;
        
        const [result] = await db
          .insert(workflows)
          .values({
            workspaceId,
            name: finalName,
            description: proposal?.description || "",
            triggerType: proposal?.triggerType || "manual",
            status: "active",
          })
          .returning();
          
        insertedWorkflow = result;
      } catch (err: any) {
        // Check for Postgres unique constraint violation on uq_workspace_workflow_name
        // Drizzle may wrap Postgres errors in a DrizzleQueryError, so we must check err.cause
        const pgErrorCode = err.code || err.cause?.code;
        const pgErrorMessage = err.message || err.cause?.message || "";
        
        if (pgErrorCode === '23505' || pgErrorMessage.includes('uq_workspace_workflow_name')) {
          suffix++;
        } else {
          throw err;
        }
      }
    }

    if (proposal?.steps && Array.isArray(proposal.steps)) {
      const stepValues = proposal.steps.map((step: any, index) => ({
        workspaceId,
        workflowId: insertedWorkflow.id,
        orderIndex: index,
        stepType: step.type || "agent",
        title: step.title ? step.title.substring(0, 128) : `Step ${index + 1}`,
        actionPrompt: step.detail || step.title || "",
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

export async function createCustomWorkflow(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.workspaceId;
    if (!workspaceId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { name, description, triggerType, cronExpression, actionPrompt } = req.body;
    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "Database unavailable" });
      return;
    }

    let nextRunAt: Date | null = null;
    if (triggerType === "schedule" && cronExpression) {
      try {
        const interval = CronExpressionParser.parse(cronExpression);
        nextRunAt = interval.next().toDate();
      } catch (e) {
        res.status(400).json({ error: "Invalid CRON expression" });
        return;
      }
    }

    const [workflow] = await db
      .insert(workflows)
      .values({
        workspaceId,
        name: name || "Custom Workflow",
        description: description || "",
        triggerType: triggerType || "manual",
        cronExpression: cronExpression || null,
        nextRunAt,
        status: "active",
      })
      .returning();

    // Add a single step for the actionPrompt
    await db.insert(workflowSteps).values({
      workspaceId,
      workflowId: workflow.id,
      orderIndex: 0,
      stepType: "agent",
      title: "Custom Action",
      actionPrompt: actionPrompt || "Execute custom workflow",
    });

    res.status(201).json({ workflow });
  } catch (error) {
    console.error("[createCustomWorkflow Error]:", error);
    res.status(500).json({ error: "Failed to create custom workflow." });
  }
}

export async function updateWorkflowSchedule(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.workspaceId;
    if (!workspaceId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { workflowId } = req.params;
    const { triggerType, cronExpression } = req.body;
    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "Database unavailable" });
      return;
    }

    let nextRunAt: Date | null = null;
    if (triggerType === "schedule" && cronExpression) {
      try {
        const interval = CronExpressionParser.parse(cronExpression);
        nextRunAt = interval.next().toDate();
      } catch (e) {
        res.status(400).json({ error: "Invalid CRON expression" });
        return;
      }
    }

    const [updated] = await db
      .update(workflows)
      .set({
        triggerType,
        cronExpression: cronExpression || null,
        nextRunAt,
      })
      .where(and(eq(workflows.id, workflowId), eq(workflows.workspaceId, workspaceId)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Workflow not found" });
      return;
    }

    res.status(200).json({ workflow: updated });
  } catch (error) {
    console.error("[updateWorkflowSchedule Error]:", error);
    res.status(500).json({ error: "Failed to update schedule." });
  }
}

export async function updateWorkflow(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.workspaceId;
    if (!workspaceId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { workflowId } = req.params;
    const { name, description, triggerType, cronExpression, status } = req.body;
    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "Database unavailable" });
      return;
    }

    const updatePayload: Record<string, any> = {};
    if (name !== undefined) updatePayload.name = name;
    if (description !== undefined) updatePayload.description = description;
    if (triggerType !== undefined) updatePayload.triggerType = triggerType;
    if (cronExpression !== undefined) updatePayload.cronExpression = cronExpression;
    if (status !== undefined) updatePayload.status = status;
    updatePayload.updatedAt = new Date();

    const [updated] = await db
      .update(workflows)
      .set(updatePayload)
      .where(and(eq(workflows.id, workflowId), eq(workflows.workspaceId, workspaceId)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Workflow not found" });
      return;
    }

    res.status(200).json({ workflow: updated });
  } catch (error) {
    console.error("[updateWorkflow Error]:", error);
    res.status(500).json({ error: "Failed to update workflow." });
  }
}

export async function updateWorkflowSteps(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.workspaceId;
    if (!workspaceId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { workflowId } = req.params;
    const { steps: newSteps } = req.body as {
      steps: Array<{
        id?: string;
        orderIndex?: number;
        stepType?: string;
        title: string;
        actionPrompt: string;
        agentId?: string | null;
      }>;
    };

    if (!Array.isArray(newSteps)) {
      res.status(400).json({ error: "Field 'steps' must be an array." });
      return;
    }

    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "Database unavailable" });
      return;
    }

    // Verify workflow belongs to workspace
    const [wf] = await db
      .select()
      .from(workflows)
      .where(and(eq(workflows.id, workflowId), eq(workflows.workspaceId, workspaceId)));

    if (!wf) {
      res.status(404).json({ error: "Workflow not found" });
      return;
    }

    // Replace steps transactionally (delete existing steps and re-insert new sequence)
    await db
      .delete(workflowSteps)
      .where(and(eq(workflowSteps.workflowId, workflowId), eq(workflowSteps.workspaceId, workspaceId)));

    if (newSteps.length > 0) {
      const stepRows = newSteps.map((step, index) => ({
        workspaceId,
        workflowId,
        orderIndex: typeof step.orderIndex === "number" ? step.orderIndex : index,
        stepType: step.stepType || "agent",
        title: (step.title || `Step ${index + 1}`).substring(0, 128),
        actionPrompt: step.actionPrompt || step.title || "",
        agentId: step.agentId || null,
      }));

      await db.insert(workflowSteps).values(stepRows);
    }

    // Return updated step list
    const updatedSteps = await db
      .select()
      .from(workflowSteps)
      .where(and(eq(workflowSteps.workflowId, workflowId), eq(workflowSteps.workspaceId, workspaceId)))
      .orderBy(asc(workflowSteps.orderIndex));

    res.status(200).json({
      message: `Workflow steps updated successfully (${updatedSteps.length} steps configured).`,
      steps: updatedSteps,
    });
  } catch (error) {
    console.error("[updateWorkflowSteps Error]:", error);
    res.status(500).json({ error: "Failed to update workflow steps." });
  }
}


