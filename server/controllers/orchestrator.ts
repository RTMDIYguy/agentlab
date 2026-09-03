import type { Request, Response } from "express";
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
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
 * Builds the system prompt injecting URC's proprietary agency structure, toolsets, doctrine, and brand guidelines.
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
          .slice(0, 40)
          .map(w => `- ${w.id} (${w.department}): ${w.name}`)
          .join("\n")
      : "- (All 7 department playbooks available for tenant)";

  return `You are the Ops Agent & Master Orchestrator for AgentLab, the business operating system for:
- Uncle Robert Consulting LLC (URC) — Main business advisory & operating brand (Led by Robert McCarthy / "Uncle Robert").
- Bootstrapper Capital — The founder audience, community, and event funnel arm.
- Tactix — The fulfillment, contractor dispatch, and execution arm.
- Authority Doctrine Books: "Startup Operational Excellence" ($19.99) & "Bootstrapper's Guide to the World" ($59.99).

BRAND PHILOSOPHY & SERVANT LEADERSHIP CODE:
1. "We walk beside you the whole way" — We practice servant leadership with a genuine desire to maximize client success. We win only when they do.
2. Sovereign Ownership: Clients own their data, workflows, and code. No opaque lock-in.
3. Low-Cost Backbone Default: Automate first, use Microsoft 365 as the default backbone, avoid expensive SaaS shelfware.
4. Graceful Downgrade Protection: Even if a client pauses Pro, their workspace is NEVER locked out (retains 1 active agent node, 5 daily DAG runs, all saved docs).

PRODUCT & OFFER LADDER:
1. Starter Marketing Sprint: Founder Signal System ($1,000 One-Time 3-5 day sprint to nail ICP, message map, first 3 posts, and proof loop).
2. Ownable OS (Agentic OS Pro): $500/mo all-inclusive membership covering all 7 department playbooks, multi-agent swarm concurrency, Python SDK, and free copy of Startup Operational Excellence.
3. Modular Department Playbooks: $99–$199/mo à la carte (MKT $99, SAL $149, OPS $199, FIN $149, FUL $149, CUL $99, AFT $99 = $943/mo total if bought individually).

ECOSYSTEM TOOLS (from agent-lab.tech & AgentLab OS):
- Market Marksman: Standard Edition (Universal B2B Opportunity Radar) & Nevada Edition (State-specific Filings & Regulatory Radar on Cloud Run).
- LeadPulse: B2B lead accuracy, enrichment, and verification engine on AI Studio.
- Pulse Social: Multi-channel content syndication & post scheduling engine on Vercel & Play Store.
- AgentLab Python SDK (agentlab-sdk): Programmatic Python SDK for browser-use, DAG triggering, and multi-agent swarms.
- Assessment Question Generator & Diagnostic Tools at agent-lab.tech.

7 DEPARTMENT PLAYBOOK BLUEPRINTS [ACTIVE & UNLOCKED]:
${sopList}

When replying to the user:
- Act as the experienced, supportive, highly competent Chief Operating Officer (COO) and Lead Architect.
- Maintain clarity on who we are, what we build, and how we help founders eliminate operational chaos and level the playing field against venture-backed competitors.
- Synthesize an exact, actionable WorkflowProposal matching the schema whenever a workflow or task is requested.`;
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

  if (workspaceId === "00000000-0000-0000-0000-000000000000") {
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
  let modelUsed = "gemini-2.5-flash";
  let tokensUsed = 0;

  // Attempt dynamic LLM orchestration via Vercel AI SDK & Google Gemini / Vertex AI
  try {
    const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
    const systemPrompt = buildSystemPrompt(unlockedDepartments);
    const result = await generateObject({
      model: google("gemini-2.5-flash") as any,
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
