import type { Request, Response } from "express";

export interface AgentDto {
  id: string;
  name: string;
  role: string;
  status: "active" | "idle" | "error" | "paused";
  tasksCompleted: number;
  uptime: string;
  baseModel: string;
}

const DEFAULT_WORKSPACE_AGENTS: AgentDto[] = [
  {
    id: "agt_alpha_01",
    name: "Alpha-Node-01",
    role: "Lead Enrichment Specialist",
    status: "active",
    tasksCompleted: 1420,
    uptime: "99.9%",
    baseModel: "gemini-1.5-pro",
  },
  {
    id: "agt_coder_07",
    name: "Coder-Agent-07",
    role: "Full-Stack Software Engineer",
    status: "active",
    tasksCompleted: 832,
    uptime: "99.4%",
    baseModel: "claude-3-7-sonnet",
  },
  {
    id: "agt_sdr_02",
    name: "SDR-Writer-02",
    role: "Founder Outreach Matrix Copywriter",
    status: "idle",
    tasksCompleted: 2190,
    uptime: "99.8%",
    baseModel: "gpt-4o-mini",
  },
  {
    id: "agt_audit_09",
    name: "Auditor-Bot-9",
    role: "Financial Reconciliation Auditor",
    status: "idle",
    tasksCompleted: 450,
    uptime: "98.5%",
    baseModel: "gpt-4o",
  },
  {
    id: "agt_planner_04",
    name: "Workflow-Planner-04",
    role: "Autonomous Task Router & DAG Synthesizer",
    status: "active",
    tasksCompleted: 3102,
    uptime: "99.9%",
    baseModel: "gemini-1.5-pro",
  },
];

export async function getAgents(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.workspaceId;
    // In production, query Cloud SQL with eq(agents.workspaceId, workspaceId)
    res.status(200).json({
      workspaceId,
      agents: DEFAULT_WORKSPACE_AGENTS,
      totalCount: DEFAULT_WORKSPACE_AGENTS.length,
    });
  } catch (error) {
    console.error("[Agents Controller Error]:", error);
    res.status(500).json({ error: "Failed to fetch agents." });
  }
}
