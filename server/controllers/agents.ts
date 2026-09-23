import { param } from "./params";
import type { Request, Response } from "express";
import { getDb } from "../db";
import {
  agents,
  workflowRunSteps,
  workflowSteps,
} from "../schema";
import { eq, and, desc, sql } from "drizzle-orm";

export interface AgentDto {
  id: string;
  name: string;
  role: string;
  status: "active" | "idle" | "error" | "paused";
  baseModel: string;
  systemPrompt?: string;
  // Real per-agent execution stats computed from workflow run history —
  // no seeded or invented values.
  tasksCompleted: number;
  successRate: number | null;
  lastStepAt: string | null;
}

// The default swarm nodes seeded into a fresh workspace. Only real identity
// and configuration — no fabricated task counts, uptimes, or histories.
// Stats start at zero and grow from real executions.
const DEFAULT_WORKSPACE_AGENTS = [
  {
    name: "Alpha-Node-01",
    role: "Lead Enrichment Specialist",
    baseModel: "gemini-1.5-pro",
    systemPrompt:
      "Autonomous Lead Enrichment Specialist for URC & Bootstrapper audience discovery.",
  },
  {
    name: "Coder-Agent-07",
    role: "Full-Stack Software Engineer",
    baseModel: "claude-3-7-sonnet",
    systemPrompt:
      "Lead Full-Stack Software Engineer for AgentLab architecture, API, and UI components.",
  },
  {
    name: "Tech-Node-08",
    role: "Backend & Systems Infrastructure Specialist",
    baseModel: "claude-3-7-sonnet",
    systemPrompt:
      "Systems Infrastructure and Backend Engineer for database, runtime, and CRM bridge pipelines.",
  },
  {
    name: "SDR-Writer-02",
    role: "Founder Outreach Matrix Copywriter",
    baseModel: "gpt-4o-mini",
    systemPrompt:
      "Founder Outreach Copywriter for personalized ICP messaging, proof loops, and email sequences.",
  },
  {
    name: "Auditor-Bot-9",
    role: "Financial Reconciliation Auditor",
    baseModel: "gpt-4o",
    systemPrompt:
      "Financial Auditor for M365 ledger reconciliation, Stripe settlement tracking, and anomaly checks.",
  },
  {
    name: "Workflow-Planner-04",
    role: "Autonomous Task Router & DAG Synthesizer",
    baseModel: "gemini-1.5-pro",
    systemPrompt:
      "Master Task Router and DAG Synthesizer mapping business requests to URC 7-department SOPs.",
  },
];

/** Per-agent real stats, computed by joining run steps to step definitions. */
interface AgentStats {
  tasksCompleted: number;
  totalFinished: number;
  totalFailed: number;
  lastStepAt: string | null;
}

interface AgentStatsView {
  tasksCompleted: number;
  successRate: number | null;
  lastStepAt: string | null;
}

async function computeAgentStats(
  db: any,
  workspaceId: string
): Promise<Map<string, AgentStatsView>> {
  const rows = await db
    .select({
      agentId: workflowSteps.agentId,
      status: workflowRunSteps.status,
      completedAt: workflowRunSteps.completedAt,
    })
    .from(workflowRunSteps)
    .innerJoin(workflowSteps, eq(workflowRunSteps.workflowStepId, workflowSteps.id))
    .where(eq(workflowRunSteps.workspaceId, workspaceId));

  const stats = new Map<string, AgentStats>();
  for (const row of rows) {
    if (!row.agentId) continue;
    const entry: AgentStats =
      stats.get(row.agentId) ??
      { tasksCompleted: 0, totalFinished: 0, totalFailed: 0, lastStepAt: null };

    if (row.status === "completed") {
      entry.tasksCompleted += 1;
      entry.totalFinished += 1;
    } else if (row.status === "failed") {
      entry.totalFinished += 1;
      entry.totalFailed += 1;
    }

    if (row.completedAt) {
      const iso =
        row.completedAt instanceof Date
          ? row.completedAt.toISOString()
          : String(row.completedAt);
      if (!entry.lastStepAt || iso > entry.lastStepAt) {
        entry.lastStepAt = iso;
      }
    }
    stats.set(row.agentId, entry);
  }

  const result = new Map<string, AgentStatsView>();
  stats.forEach((entry, agentId) => {
    result.set(agentId, {
      tasksCompleted: entry.tasksCompleted,
      successRate:
        entry.totalFinished > 0
          ? Math.round((entry.tasksCompleted / entry.totalFinished) * 100)
          : null,
      lastStepAt: entry.lastStepAt,
    });
  });
  return result;
}

export async function getAgents(req: Request, res: Response): Promise<void> {
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

    // Query agents from DB
    let dbAgents = await db
      .select()
      .from(agents)
      .where(eq(agents.workspaceId, workspaceId))
      .orderBy(desc(agents.createdAt));

    // If workspace has no agents seeded in the DB yet, seed the default
    // swarm nodes with identity only — stats start at zero and come from
    // real executions.
    if (dbAgents.length === 0) {
      const seedValues = DEFAULT_WORKSPACE_AGENTS.map((a) => ({
        workspaceId,
        name: a.name,
        role: a.role,
        baseModel: a.baseModel,
        systemPrompt: a.systemPrompt,
        status: "idle",
      }));

      await db.insert(agents).values(seedValues);

      dbAgents = await db
        .select()
        .from(agents)
        .where(eq(agents.workspaceId, workspaceId))
        .orderBy(desc(agents.createdAt));
    }

    // Real per-agent stats from run history (joined steps → run steps).
    const statsByAgent = await computeAgentStats(db, workspaceId);

    const agentsWithStats = dbAgents.map((agent: any) => {
      const stats = statsByAgent.get(agent.id);
      return {
        ...agent,
        tasksCompleted: stats?.tasksCompleted ?? 0,
        successRate: stats?.successRate ?? null,
        lastStepAt: stats?.lastStepAt ?? null,
      };
    });

    res.status(200).json({
      workspaceId,
      agents: agentsWithStats,
      totalCount: agentsWithStats.length,
    });
  } catch (error) {
    console.error("[Agents Controller Error]:", error);
    res.status(500).json({ error: "Failed to fetch agents." });
  }
}

export async function toggleAgentStatus(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.workspaceId;
    if (!workspaceId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const id = param(req, "id");
    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "Database unavailable" });
      return;
    }

    const [existingAgent] = await db
      .select()
      .from(agents)
      .where(and(eq(agents.id, id), eq(agents.workspaceId, workspaceId)));

    if (!existingAgent) {
      res.status(404).json({ error: `Agent with id ${id} not found.` });
      return;
    }

    const nextStatus = existingAgent.status === "active" ? "paused" : "active";

    const [updatedAgent] = await db
      .update(agents)
      .set({
        status: nextStatus,
        updatedAt: new Date(),
      })
      .where(and(eq(agents.id, id), eq(agents.workspaceId, workspaceId)))
      .returning();

    res.status(200).json({ success: true, agent: updatedAgent });
  } catch (error) {
    console.error("[Toggle Agent Error]:", error);
    res.status(500).json({ error: "Failed to toggle agent status." });
  }
}

export async function deployAgent(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.workspaceId;
    if (!workspaceId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { name, role, baseModel, systemPrompt } = req.body || {};

    if (!name || typeof name !== "string" || !name.trim()) {
      res.status(400).json({ error: "Agent name is required." });
      return;
    }

    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "Database unavailable" });
      return;
    }

    const [newAgent] = await db
      .insert(agents)
      .values({
        workspaceId,
        name: name.trim().slice(0, 128),
        role: (role || "Autonomous Agent").toString().slice(0, 128),
        baseModel: (baseModel || "gemini-1.5-pro").toString().slice(0, 64),
        systemPrompt:
          (systemPrompt || `Autonomous agent persona for ${role || "general operations"}`).toString(),
        status: "idle",
      })
      .returning();

    res.status(201).json({ success: true, agent: newAgent });
  } catch (error) {
    console.error("[Deploy Agent Error]:", error);
    res.status(500).json({ error: "Failed to deploy agent." });
  }
}
