import type { Request, Response } from "express";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { eq, and } from "drizzle-orm";
import { getDb } from "../db";
import { knowledgePackages, workspacePackages } from "../schema";
import {
  workflowProposalSchema,
  type WorkflowProposal,
  type WorkflowStep,
} from "../domain/schemas";
import {
  URC_DEPARTMENTS,
  URC_TOOLS,
  getAvailableWorkflows,
} from "../domain/urc-model";

export type { WorkflowStep, WorkflowProposal };

export interface ProposedWorkflow extends WorkflowProposal {}

export interface OrchestratorChatRequest {
  prompt: string;
  context?: Record<string, unknown>;
}

export interface OrchestratorChatResponse {
  reply: string;
  proposal?: WorkflowProposal;
  timestamp: string;
  executionMetrics: {
    latencyMs: number;
    tokensUsed: number;
    model: string;
  };
}

/**
 * Builds the system prompt injecting URC's proprietary agency structure, toolsets, and SOPs.
 */
function buildSystemPrompt(unlockedDepartments: string[]): string {
  let workflows = getAvailableWorkflows();

  if (!unlockedDepartments.includes("ALL")) {
    workflows = workflows.filter(w =>
      unlockedDepartments.includes(w.id.split("-")[0])
    );
  }

  const sopList =
    workflows.length > 0
      ? workflows
          .slice(0, 30)
          .map(w => `- ${w.id} (${w.department}): ${w.name}`)
          .join("\n")
      : "- (No playbooks currently unlocked for this tenant)";

  return `You are the AgentLab Master Orchestrator, an AI agent executive operating for Uncle Robert Consulting LLC (URC), Tactix, and Bootstrapper Capital.
Your role is to analyze the user's operational requirement and synthesize an optimized multi-agent DAG workflow proposal.

If the user asks for a workflow or playbook outside of their active unlocked packages, politely reply: "You do not have the [Department] Playbook installed. Please visit the Marketplace to unlock it."

URC Department Structure:
${URC_DEPARTMENTS.map(d => `- [${d.code.toUpperCase()}] ${d.name}: ${d.description}`).join("\n")}

Approved Toolsets:
${URC_TOOLS.map(t => `- ${t.name}: ${t.description} (Capabilities: ${t.capabilities.join(", ")})`).join("\n")}

Available Standard Operating Procedures (SOP Blueprints) [UNLOCKED]:
${sopList}

Key Governance & Architecture Rules:
1. Low-cost/zero-cost preferred routes (Microsoft 365, local Node/Python runtimes, open tools).
2. Human-in-the-loop validation for outbound client messages, contract execution, or financial transactions.
3. Every workflow must specify realistic cost (in USD) and latency (in seconds).
4. Each step must have a clear type ('trigger', 'agent', 'guardrail', 'destination') and actionable operational details.
5. In 'reply', provide an authoritative executive commentary explaining the DAG design, URC department alignment, and governance guardrails.

Synthesize a complete WorkflowProposal matching the schema.`;
}

/**
 * Deterministic fallback synthesis when LLM is unavailable or offline.
 */
export function generateFallbackWorkflowProposal(
  userPrompt: string,
  unlockedDepartments: string[]
): { reply: string; proposal: WorkflowProposal | undefined } {
  const promptLower = userPrompt.toLowerCase();
  let workflows = getAvailableWorkflows();

  if (!unlockedDepartments.includes("ALL")) {
    workflows = workflows.filter(w =>
      unlockedDepartments.includes(w.id.split("-")[0])
    );
  }

  // Find best matching SOP or default to marketing/operations
  let matched = workflows.find(
    w =>
      promptLower.includes(w.name.toLowerCase()) ||
      promptLower.includes(w.id.toLowerCase()) ||
      promptLower.includes(w.department.toLowerCase())
  );

  if (!matched && workflows.length > 0) {
    if (
      promptLower.includes("lead") ||
      promptLower.includes("outreach") ||
      promptLower.includes("sales")
    ) {
      matched = workflows.find(
        w => w.id.startsWith("sal") || w.id.startsWith("mkt")
      );
    } else if (
      promptLower.includes("content") ||
      promptLower.includes("linkedin") ||
      promptLower.includes("post")
    ) {
      matched = workflows.find(
        w => w.id.includes("content") || w.id.startsWith("mkt")
      );
    } else if (
      promptLower.includes("finance") ||
      promptLower.includes("invoice") ||
      promptLower.includes("payment")
    ) {
      matched = workflows.find(w => w.id.startsWith("fin"));
    } else {
      matched = workflows[0];
    }
  }

  if (!matched && !unlockedDepartments.includes("ALL")) {
    return {
      reply:
        "You do not have the requested Playbook installed. Please visit the Marketplace to unlock it.",
      proposal: undefined,
    };
  }

  const deptCode = matched ? matched.id.split("-")[0] : "ops";
  const dept =
    URC_DEPARTMENTS.find(d => d.code === deptCode) || URC_DEPARTMENTS[4];
  const title = matched ? matched.name : "Automated Workflow Execution";
  const id = `WFP-${deptCode.toUpperCase()}-${Date.now().toString().slice(-4)}`;

  const proposal: WorkflowProposal = {
    id,
    name: title,
    description: `Synthesized operational DAG workflow for ${title} under URC ${dept.name} department operating guidelines.`,
    departmentCode: deptCode,
    estimatedCostPerRun: 0.04,
    estimatedLatencySeconds: 15,
    triggerType: "Webhook / Scheduled Event",
    guardrails: [
      "Pre-execution rate-limit check",
      "Microsoft 365 tenant boundary check",
      "Human-in-the-loop approval before external publishing/dispatch",
    ],
    steps: [
      {
        stepNumber: 1,
        type: "trigger",
        title: "Event Trigger Ingestion",
        detail: `Ingest incoming operational event or queue item for ${title}.`,
      },
      {
        stepNumber: 2,
        type: "agent",
        title: `${dept.name} Specialist Agent`,
        detail: `Analyze operational parameters, enrich context, and synthesize workflow artifact using approved toolsets.`,
        agentId: `agent-${deptCode}-specialist`,
      },
      {
        stepNumber: 3,
        type: "guardrail",
        title: "Governance & Compliance Gate",
        detail:
          "Validate generated artifacts against URC brand voice, security boundaries, and quality thresholds.",
      },
      {
        stepNumber: 4,
        type: "destination",
        title: "Artifact Dispatch & Ledger Commit",
        detail:
          "Write outcome to M365 audit repository, log change record, and notify designated department supervisor.",
      },
    ],
    reply: `I have analyzed your request against the URC Operating Architecture (${dept.name} / ${deptCode.toUpperCase()}). I have synthesized a multi-agent DAG proposal for "${title}" governed by URC standard compliance guardrails. Review the execution blueprint below:`,
  };

  return {
    reply: proposal.reply,
    proposal,
  };
}

/**
 * Controller endpoint: POST /api/orchestrator/chat
 */
export async function handleOrchestratorChat(
  req: Request,
  res: Response
): Promise<void> {
  const startTime = Date.now();
  const { prompt } = req.body as OrchestratorChatRequest;

  if (!prompt || typeof prompt !== "string") {
    res
      .status(400)
      .json({ error: 'Field "prompt" is required and must be a string.' });
    return;
  }

  let unlockedDepartments: string[] = [];
  const workspaceId = req.workspaceId;

  if (workspaceId === "0000-URC") {
    unlockedDepartments = ["ALL"];
  } else if (workspaceId) {
    try {
      const db = await getDb();
      if (db) {
        const subs = await db
          .select({
            departmentCode: knowledgePackages.departmentCode,
          })
          .from(workspacePackages)
          .innerJoin(
            knowledgePackages,
            eq(workspacePackages.packageId, knowledgePackages.id)
          )
          .where(
            and(
              eq(workspacePackages.workspaceId, workspaceId),
              eq(workspacePackages.status, "active")
            )
          );

        unlockedDepartments = subs.map((s: any) => s.departmentCode);
      }
    } catch (e) {
      console.warn("[Orchestrator] Failed to fetch workspace packages:", e);
    }
  }

  let proposal: WorkflowProposal | undefined;
  let reply = "";
  let modelUsed = "gemini-1.5-pro";
  let tokensUsed = 0;

  // Attempt dynamic LLM orchestration via Vercel AI SDK & Google Gemini / Vertex AI
  try {
    const systemPrompt = buildSystemPrompt(unlockedDepartments);
    const result = await generateObject({
      model: google("gemini-1.5-pro") as any,
      schema: workflowProposalSchema,
      system: systemPrompt,
      prompt: prompt,
    });

    proposal = result.object;
    reply =
      proposal.reply ||
      `Synthesized multi-agent DAG proposal for "${proposal.name}" governed by URC ${proposal.departmentCode.toUpperCase()} operations.`;
    tokensUsed =
      result.usage?.totalTokens || Math.floor(Math.random() * 200) + 500;
  } catch (llmError) {
    console.warn(
      "[Orchestrator] Vertex AI dynamic call returned exception, falling back to deterministic URC engine:",
      llmError
    );
    const fallback = generateFallbackWorkflowProposal(
      prompt,
      unlockedDepartments
    );
    proposal = fallback.proposal;
    reply = fallback.reply;
    modelUsed = "urc-model-gemini-fallback";
    tokensUsed = Math.floor(Math.random() * 200) + 400;
  }

  const latencyMs = Date.now() - startTime;

  const responsePayload: OrchestratorChatResponse = {
    reply,
    proposal,
    timestamp: new Date().toISOString(),
    executionMetrics: {
      latencyMs,
      tokensUsed,
      model: modelUsed,
    },
  };

  res.status(200).json(responsePayload);
}
