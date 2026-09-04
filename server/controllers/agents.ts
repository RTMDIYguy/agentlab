import type { Request, Response } from "express";
import { getDb } from "../db";
import { agents } from "../schema";
import { eq, and, desc } from "drizzle-orm";

export interface AgentDto {
  id: string;
  name: string;
  role: string;
  status: "active" | "idle" | "error" | "paused";
  tasksCompleted: number;
  uptime: string;
  baseModel: string;
  systemPrompt?: string;
  createdAt?: Date;
}

const INITIAL_WORKSPACE_AGENTS: Omit<AgentDto, "id">[] = [
  {
    name: "Alpha-Node-01",
    role: "Lead Enrichment Specialist",
    status: "active",
    tasksCompleted: 1420,
    uptime: "99.9%",
    baseModel: "gemini-1.5-pro",
    systemPrompt: "Autonomous Lead Enrichment Specialist for URC & Bootstrapper audience discovery.",
  },
  {
    name: "Coder-Agent-07",
    role: "Full-Stack Software Engineer",
    status: "active",
    tasksCompleted: 832,
    uptime: "99.4%",
    baseModel: "claude-3-7-sonnet",
    systemPrompt: "Lead Full-Stack Software Engineer for AgentLab architecture, API, and UI components.",
  },
  {
    name: "Tech-Node-08",
    role: "Backend & Systems Infrastructure Specialist",
    status: "active",
    tasksCompleted: 615,
    uptime: "99.7%",
    baseModel: "claude-3-7-sonnet",
    systemPrompt: "Systems Infrastructure and Backend Engineer for database, runtime, and CRM bridge pipelines.",
  },
  {
    name: "SDR-Writer-02",
    role: "Founder Outreach Matrix Copywriter",
    status: "idle",
    tasksCompleted: 2190,
    uptime: "99.8%",
    baseModel: "gpt-4o-mini",
    systemPrompt: "Founder Outreach Copywriter for personalized ICP messaging, proof loops, and email sequences.",
  },
  {
    name: "Auditor-Bot-9",
    role: "Financial Reconciliation Auditor",
    status: "idle",
    tasksCompleted: 450,
    uptime: "98.5%",
    baseModel: "gpt-4o",
    systemPrompt: "Financial Auditor for M365 ledger reconciliation, Stripe settlement tracking, and anomaly checks.",
  },
  {
    name: "Workflow-Planner-04",
    role: "Autonomous Task Router & DAG Synthesizer",
    status: "active",
    tasksCompleted: 3102,
    uptime: "99.9%",
    baseModel: "gemini-1.5-pro",
    systemPrompt: "Master Task Router and DAG Synthesizer mapping business requests to URC 7-department SOPs.",
  },
];

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

    // If workspace has no agents seeded in the DB yet, seed the default swarm nodes
    if (dbAgents.length === 0) {
      const seedValues = INITIAL_WORKSPACE_AGENTS.map((a) => ({
        workspaceId,
        name: a.name,
        role: a.role,
        baseModel: a.baseModel,
        systemPrompt: a.systemPrompt || `Autonomous agent persona for ${a.role}`,
        status: a.status,
        tasksCompleted: a.tasksCompleted,
        uptime: a.uptime,
      }));

      await db.insert(agents).values(seedValues);

      dbAgents = await db
        .select()
        .from(agents)
        .where(eq(agents.workspaceId, workspaceId))
        .orderBy(desc(agents.createdAt));
    }

    res.status(200).json({
      workspaceId,
      agents: dbAgents,
      totalCount: dbAgents.length,
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

    const { id } = req.params;
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

    const { name, role, baseModel, systemPrompt } = req.body;
    if (!name || !role) {
      res.status(400).json({ error: "Agent name and role are required." });
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
        name,
        role,
        baseModel: baseModel || "gemini-2.5-flash",
        systemPrompt: systemPrompt || `Autonomous agent persona for ${role}. Operates within URC SOP framework.`,
        status: "active",
        tasksCompleted: 0,
        uptime: "100%",
      })
      .returning();

    res.status(201).json({ success: true, agent: newAgent });
  } catch (error) {
    console.error("[Deploy Agent Error]:", error);
    res.status(500).json({ error: "Failed to deploy agent." });
  }
}
