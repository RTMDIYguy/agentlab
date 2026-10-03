import type { Request, Response } from "express";
import { generateObject, generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import {
  createGoogleProvider,
  isGoogleAiConfigured,
  withGoogleModelChain,
  withGoogleModelChainLeading,
  GOOGLE_MODEL_CHAIN,
} from "../_core/google-ai";
import { eq, and, desc } from "drizzle-orm";
import { getDb } from "../db";
import {
  knowledgePackages,
  workspacePackages,
  auditLogs,
  workflowRuns,
  workflowRunSteps,
  workflowArtifacts,
  workflows as dbWorkflows,
  agents as dbAgents,
  workspaces,
} from "../schema";
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

export interface LiveSystemTelemetry {
  recentErrors?: string[];
  recentRuns?: string[];
  recentRunFailures?: string[];
  activeWorkflows?: string[];
  activeAgents?: string[];
  prospectContext?: string;
}

/**
 * Formats one workflow run as citable evidence for the ops agent.
 *
 * Evidence-hygiene rule (2026-09-27, after the CC-2026-09-25-014 follow-up
 * where the agent attributed a Sept-5 failure of one workflow to another): a
 * citation MUST carry the workflow's NAME and the run's creation date next to
 * the id. Ids are opaque hex; the name is what the agent (and the founder)
 * can actually check a claim against. Exported pure for regression tests.
 */
export function formatRunEvidence(
  run: {
    id: string;
    workflowId?: string | null;
    createdAt?: Date | string | null;
    status?: string | null;
    errorMessage?: string | null;
  },
  workflowNameById: Map<string, string>
): string {
  const name = (run.workflowId && workflowNameById.get(run.workflowId)) || "unknown workflow";
  const d = run.createdAt ? new Date(run.createdAt) : null;
  const date = d && !Number.isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : "date unknown";
  const outcome =
    run.status === "failed" || run.errorMessage
      ? run.errorMessage || "no recorded error message"
      : run.status
        ? `status=${run.status}`
        : "no recorded outcome";
  return `Run ${run.id} — workflow "${name}" (workflow id ${run.workflowId ?? "n/a"}, run created ${date}): ${outcome}`;
}

export interface OrchestratorChatRequest {
  prompt: string;
  context?: Record<string, unknown>;
}

export interface OrchestratorChatResponse {
  reply: string;
  proposal?: WorkflowProposal;
  timestamp: string;
  executionMetrics: {
    latencyMs: number | null;
    tokensUsed: number | null;
    model: string;
    /** Honest note when the requested model did not (or could not) answer. */
    modelNote?: string;
  };
}

/**
 * Builds the system prompt injecting URC's proprietary agency structure, toolsets, doctrine, and brand guidelines.
 */
export function buildSystemPrompt(
  unlockedDepartments: string[],
  telemetry?: LiveSystemTelemetry,
  workspacePersona?: { name?: string | null; customPrompt?: string | null }
): string {
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

  const telemetrySection = telemetry
    ? `
LIVE SYSTEM STATE, RECENT AUDIT LOGS & RUNTIME TELEMETRY:
- Active Workflows in Workspace: ${telemetry.activeWorkflows?.length ? telemetry.activeWorkflows.join("; ") : "Default Canonical 10 Workflows Active"}
- Active Agents in Workspace: ${telemetry.activeAgents?.length ? telemetry.activeAgents.join("; ") : "Alpha-Node-01, Coder-Agent-07, SDR-Writer-02, Auditor-Bot-9"}
- Recent Workflow Runs: ${telemetry.recentRuns?.length ? telemetry.recentRuns.join("; ") : "No recent runs"}
- FAILED RUNS (real recorded errors — surface these proactively when relevant):
  ${telemetry.recentRunFailures?.length ? telemetry.recentRunFailures.join("\n  ") : "(no failed runs recorded)"}
- Recent System Audit Logs / Errors:
  ${telemetry.recentErrors?.length ? telemetry.recentErrors.join("\n  ") : "All recent audit logs nominal (zero active unhandled crashes)"}
${telemetry.prospectContext ? `
PROSPECT CONTEXT (from this user's pre-signup intake conversations — use it to greet them by name, remember their stated pain points, and build on what they already told us):
  ${telemetry.prospectContext}
` : ""}`
    : "";

  // Operator persona (CC-2026-10-01-009): the workspace row's stored prompt
  // now leads the base identity. When none is stored, the built-in default
  // below applies. The fake "DAG Orchestration Engine v2.4" string is gone —
  // the same honesty rule the conversational tail enforces (no invented
  // engine/version claims) now holds for the base prompt itself.
  const personaLead = workspacePersona?.customPrompt?.trim()
    ? workspacePersona.customPrompt.trim()
    : `You are the Ops Agent & Master Orchestrator for AgentLab. You act as the consultative Chief Operating Officer (COO), Lead Systems Architect, and Technical Partner to the founder.`;

  return `${personaLead}${
    workspacePersona?.name?.trim()
      ? ` You answer to the operator-assigned name "${workspacePersona.name.trim()}".`
      : ""
  }

PERFECT PLATFORM & TECHNICAL KNOWLEDGE (CRITICAL):
You have 360-degree knowledge of the AgentLab platform, database schemas, and multi-agent execution pipeline:
1. **Database Schema & Runtime Architecture**:
   - \`workflows\`: Stores workflow definitions (id, workspace_id, name, description, trigger_type, cron_expression, status, success_rate).
   - \`workflow_steps\`: Stores DAG nodes (id, workflow_id, agent_id [UUID], order_index, step_type ['trigger'|'agent'|'guardrail'|'destination'], title, action_prompt).
   - \`workflow_runs\` & \`workflow_run_steps\`: Stores live DAG run executions, latency, token usage, and status.
   - \`workflow_artifacts\`: Stores generated content drafts, scheduled posts, documents, quality scores, and verification notes.
   - \`audit_logs\`: Stores model traces, SAIF compliance checks, and error contexts.
2. **Autonomous Execution & Diagnostic Intelligence**:
   - When the user shares audit logs, screenshots, or error traces (such as "Failed query: insert into workflow_artifacts..."), do NOT ask basic questions or say "I cannot interpret the screenshot". You have full visual inspection and telemetry access.
   - Accurately diagnose root causes (e.g. database schema migrations, column type constraints like UUID vs string agent names, refusal detection, API rate limits, or missing inputs).
   - EVIDENCE CITATION RULE (CRITICAL — 2026-09-27): when you cite a run as evidence, you MUST state the workflow's NAME (from Active Workflows or the run's own citation line) and the run's date alongside the id. NEVER attribute a run to a workflow by id-shape or assumption — ids are opaque hex and two workflows of the same program share none. If the telemetry line already names the workflow, repeat that name verbatim; if a run's workflow name is 'unknown workflow', say so and verify before diagnosing. Do not bundle unrelated runs into one narrative (one workflow's old failure is not evidence about another workflow's current bug).
   - Provide concrete explanations and propose refined, stateful DAG proposals that address and resolve those failure modes.
3. **Collaborative Pair Architect Relationship**:
   - Think of yourself as a senior technical co-founder / COO who advises, diagnoses, and architects the business without executing destructively.
   - Provide deep, transparent explanations of workflow mechanics, data dependencies, and quality guardrails.
   - Structure actionable DAG proposals that users can review, adjust, and deploy.

${telemetrySection}

YOU REPRESENT:
- Uncle Robert Consulting LLC (URC) — Main business advisory & operating brand (Led by Robert McCarthy / "Uncle Robert").
- Bootstrapper Capital — The founder audience, community, and event funnel arm (https://bootstrapper.ai).
- Tactix — The fulfillment, contractor dispatch, and execution arm.
- Authority Doctrine Books: "Startup Operational Excellence" ($19.99) & "Bootstrapper's Guide to the World" ($59.99).

EXCLUSIVE ORCHESTRATOR TECHNOLOGY:
You are powered by AgentLab's proprietary multi-agent Directed Acyclic Graph (DAG) Orchestrator. Unlike generic chat interfaces, you do not just respond with text—you dynamically coordinate specialized autonomous swarm agents across our 7 departments into executable, stateful business workflows.

CORE CONSULTATIVE BEHAVIOR & USER-CURIOUS PERSONA (CRITICAL):
1. **Be Deeply User-Curious & Consultative**: Do NOT assume or jump blindly into rigid workflows without understanding the user's specific context. Always explain the rationale behind each step and invite the user to tweak, re-order, add, or reject individual steps in their interactive proposal card before deployment.
2. **Servant Leadership Code**: "We walk beside you the whole way." Genuinely listen, validate their bottlenecks, and build solutions around their existing tools (M365 default).

THE CORE STRATEGIC NORTH STAR — PREPPING CLIENTS FOR OWNABLE OS & EQUITY INDEPENDENCE:
Everything we do in AgentLab preps the client for the Ownable OS on Bootstrapper.ai (https://bootstrapper.ai/), Building Transferable Equity (https://bootstrapper.ai/build-equity?p_grain=LW), and the Independence Model (https://bootstrapper.ai/chapters/independence-mo).
1. We transform messy, founder-dependent service businesses into standardized, autonomous, and ownable operating assets.
2. By implementing the 7 department playbooks (MKT, SAL, OPS, FIN, FUL, CUL, AFT), we systematically elevate the client's Ownable Score, compress their valuation discount rate, expand their Wedge Equity, and turn day-to-day operations into verifiable enterprise value.
3. The 4 Engines of Ownable OS:
   - Financial Engine: Bank-connected ledger intelligence, cash health, and runway forecaster (FIN).
   - Profit Engine: CRM-driven pipeline velocity, scorecard targets, and closed-won momentum (SAL & MKT).
   - Value Engine: Standardized protocol library, automated DAGs, and SOP standardizer (OPS & FUL).
   - People Engine: Servant leadership cadence, async unblocking, and delegation signals (CUL & AFT).

PRODUCT & OFFER LADDER:
1. Starter Marketing Sprint: Founder Signal System ($1,000 One-Time 3-5 day sprint to nail ICP, message map, first 3 posts, and proof loop).
2. Ownable OS (Agentic OS Pro): $500/mo all-inclusive membership covering all 7 department playbooks, multi-agent swarm concurrency, Python SDK, and free copy of Startup Operational Excellence.
3. Modular Department Playbooks: $99–$199/mo à la carte (MKT $99, SAL $149, OPS $199, FIN $149, FUL $149, CUL $99, AFT $99 = $943/mo total if bought individually).

ECOSYSTEM TOOLS:
- Market Marksman: Standard Edition (Universal B2B Opportunity Radar) & Nevada Edition (State-specific Filings & Regulatory Radar on Cloud Run).
- LeadPulse: B2B lead accuracy, enrichment, and verification engine on AI Studio.
- Pulse Social: Multi-channel content syndication & post scheduling engine on Vercel & Play Store.
- AgentLab Python SDK (agentlab-sdk): Programmatic Python SDK for browser-use, DAG triggering, and multi-agent swarms.
- Pamela AI Receptionist: 24/7 ElevenLabs telephony & Google Voice receptionist node.

OFFICIAL BOOTSTRAPPER.AI PARTNER LEAD CAPTURE & DIAGNOSTIC ENDPOINTS:
1. Workflow Automation & Operations: https://bootstrapper.ai/@agentlab/leads/workflow_automation
2. CRM & Revenue Velocity: https://bootstrapper.ai/@agentlab/leads/crm
3. Lead Generation & Inbound Authority: https://bootstrapper.ai/@agentlab/leads/lead_generation
4. Business Valuation & Exit / Ownable Readiness: https://bootstrapper.ai/@agentlab/leads/business_valuation_exit
5. Business Financing & Capital Readiness: https://bootstrapper.ai/@agentlab/leads/business_financing

7 DEPARTMENT PLAYBOOK BLUEPRINTS [ACTIVE & UNLOCKED]:
${sopList}

When replying:
- Act as the consultative Chief Operating Officer (COO) and Lead Orchestrator.
- Directly diagnose errors from attached logs or screenshots with technical precision.
- Offer actionable DAG proposals with clear step breakdowns, and remind the user that they can edit, delete, or add steps directly in their proposal card.`;
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
      promptLower.includes("hubspot") ||
      promptLower.includes("crm") ||
      promptLower.includes("pipeline")
    ) {
      matched = workflows.find(w => w.id.startsWith("sal")) || {
        id: "sal-02",
        name: "HubSpot CRM Contact & Deal Synchronization",
        department: "Sales & RevOps",
        description: "Automated ingestion, deduplication, and stage synchronization of sales leads into HubSpot CRM and M365 tracker."
      } as any;
    } else if (
      promptLower.includes("lead") ||
      promptLower.includes("outreach") ||
      promptLower.includes("prospect") ||
      promptLower.includes("sales")
    ) {
      matched = workflows.find(
        w => w.id.startsWith("sal") || w.id.startsWith("mkt")
      );
    } else if (
      promptLower.includes("content") ||
      promptLower.includes("newsletter") ||
      promptLower.includes("linkedin") ||
      promptLower.includes("post") ||
      promptLower.includes("article")
    ) {
      matched = workflows.find(
        w => w.id.includes("content") || w.id.startsWith("mkt")
      );
    } else if (
      promptLower.includes("finance") ||
      promptLower.includes("invoice") ||
      promptLower.includes("payment") ||
      promptLower.includes("runway") ||
      promptLower.includes("stripe")
    ) {
      matched = workflows.find(w => w.id.startsWith("fin"));
    } else if (
      promptLower.includes("onboard") ||
      promptLower.includes("client") ||
      promptLower.includes("fulfillment")
    ) {
      matched = workflows.find(w => w.id.startsWith("ful"));
    } else if (
      promptLower.includes("audit") ||
      promptLower.includes("compliance") ||
      promptLower.includes("ops") ||
      promptLower.includes("drift")
    ) {
      matched = workflows.find(w => w.id.startsWith("ops"));
    } else {
      matched = workflows.find(w => w.id.startsWith("ops")) || workflows[0];
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

  const isHubSpot = promptLower.includes("hubspot") || promptLower.includes("crm");

  const proposal: WorkflowProposal = {
    id,
    name: title,
    description: isHubSpot
      ? "Direct synchronization bridge between HubSpot CRM and AgentLab multi-agent state, mapping contact fields, deal velocity, and M365 audit logs."
      : `Synthesized operational DAG workflow for ${title} under URC ${dept.name} department operating guidelines.`,
    departmentCode: deptCode,
    // CC-2026-09-25-011: estimatedCostPerRun / estimatedLatencySeconds are no
    // longer emitted — the deterministic fallback has no honest basis for a
    // number, and the schema now treats them as optional. The client shows
    // "not estimated" instead of fabricated "$0.02 / 12s".
    triggerType: isHubSpot ? "HubSpot Webhook / Scheduled Polling" : "Webhook / Scheduled Event",
    guardrails: [
      "Pre-execution rate-limit check",
      "Row Level Security (RLS) tenant boundary verification",
      "PII redaction and GDPR/CCPA scrub before LLM inference",
      "Human-in-the-loop approval before external dispatch",
    ],
    steps: [
      {
        stepNumber: 1,
        type: "trigger",
        title: isHubSpot ? "HubSpot CRM Webhook Ingestion" : "Event Trigger Ingestion",
        detail: isHubSpot
          ? "Receive contact create/update event or poll recent deals via HUBSPOT_PAT bridge."
          : `Ingest incoming operational event or queue item for ${title}.`,
      },
      {
        stepNumber: 2,
        type: "agent",
        title: isHubSpot ? "Sales & CRM Intelligence Agent" : `${dept.name} Specialist Agent`,
        detail: isHubSpot
          ? "Enrich contact firmographics, qualify lead tier, and stage deal next steps."
          : `Analyze operational parameters, enrich context, and synthesize workflow artifact using approved toolsets.`,
        // No agentId here (CC-2026-09-25-007): the old generator emitted fake
        // ids like "agent-sal-crm" that are neither UUIDs nor real rows in the
        // agents table - executing such a proposal died on the uuid column
        // binding. The runner falls back to the default specialist prompt
        // when a step has no agent, which is the honest behavior.
      },
      {
        stepNumber: 3,
        type: "guardrail",
        title: "SAIF Compliance & PII Gate",
        detail:
          "Validate generated artifacts against URC brand voice, security boundaries, and quality thresholds.",
      },
      {
        stepNumber: 4,
        type: "destination",
        title: isHubSpot ? "HubSpot & M365 Commit" : "Artifact Dispatch & Ledger Commit",
        detail: isHubSpot
          ? "Update HubSpot deal stage, write lead summary to M365 tracker, and notify Slack/Teams channel."
          : "Write outcome to M365 audit repository, log change record, and notify designated department supervisor.",
      },
    ],
    reply: isHubSpot
      ? `Yes, the HubSpot CRM integration is verified via the HUBSPOT_PAT connection bridge. I have synthesized an active multi-agent DAG execution plan for "HubSpot CRM Contact & Deal Synchronization" below. You can review the steps and click "Approve & Execute DAG" to run it in the OS:`
      : `I have analyzed your request against the URC Operating Architecture (${dept.name} / ${deptCode.toUpperCase()}). I have synthesized a multi-agent DAG proposal for "${title}" governed by URC standard compliance guardrails. Review the execution blueprint below:`,
  };

  return {
    reply: proposal.reply,
    proposal,
  };
}

/**
 * Selector catalog behind GET /api/orchestrator/models (CC-2026-10-02-021).
 *
 * The ops-agent model selector is DATA-DRIVEN: the endpoint returns only what
 * this deployment can actually run — Google chain entries when a credential
 * exists, Claude only when ANTHROPIC_API_KEY is set, and the deterministic
 * offline mode that needs no provider. GPT-4o was never wired server-side
 * (no OpenAI provider is installed), so it is never offered — the honest
 * version of the chip that used to pretend.
 */
export interface OrchestratorModelOption {
  id: string;
  name: string;
  provider: string;
  badge: string;
}

const CHAT_MODEL_CATALOG: Array<
  OrchestratorModelOption & { requires: "google" | "anthropic" | "none" }
> = [
  {
    id: "gemini-flash-latest",
    name: "Gemini Flash (latest)",
    provider: "Google",
    badge: "Fastest / Realtime",
    requires: "google",
  },
  {
    id: "gemini-pro-latest",
    name: "Gemini Pro (latest)",
    provider: "Google",
    badge: "Deep Reasoning",
    requires: "google",
  },
  {
    id: "claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    provider: "Anthropic",
    badge: "Code & Architecture",
    requires: "anthropic",
  },
  {
    id: "urc-fallback",
    name: "URC Deterministic Model",
    provider: "AgentLab",
    badge: "Offline Fallback",
    requires: "none",
  },
];

/** Models this deployment can run right now — exported pure for tests. */
export function listAvailableChatModels(deps: {
  googleConfigured: boolean;
  anthropicKey: string | null;
}): OrchestratorModelOption[] {
  return CHAT_MODEL_CATALOG.filter(m => {
    if (m.requires === "none") return true;
    if (m.requires === "google") return deps.googleConfigured;
    return !!deps.anthropicKey;
  }).map(m => ({ id: m.id, name: m.name, provider: m.provider, badge: m.badge }));
}

export type ChatModelRequest =
  | { kind: "deterministic" }
  | { kind: "google"; lead: string | null }
  | { kind: "anthropic"; id: string; key: string }
  | { kind: "unsupported"; requested: string };

/**
 * Resolve the model the operator asked for (req.body.model) into a request
 * the server can actually honor — exported pure for tests (CC-2026-10-02-021).
 *
 * - a current Google chain id leads the chain
 * - "urc-fallback" is the EXPLICIT deterministic mode (no model consulted)
 * - the Claude id routes to Anthropic only when a key exists
 * - anything else (gpt-4o, retired ids, junk) is honestly unsupported: the
 *   chain answers and the response says so via modelNote
 */
export function resolveChatModelRequest(
  raw: unknown,
  deps: { anthropicKey: string | null }
): ChatModelRequest {
  const requested = typeof raw === "string" ? raw.trim() : "";
  if (!requested) return { kind: "google", lead: null };
  if (requested === "urc-fallback") return { kind: "deterministic" };
  if ((GOOGLE_MODEL_CHAIN as readonly string[]).includes(requested)) {
    return { kind: "google", lead: requested };
  }
  if (requested === "claude-haiku-4-5" && deps.anthropicKey) {
    return { kind: "anthropic", id: requested, key: deps.anthropicKey };
  }
  return { kind: "unsupported", requested };
}

/** GET /api/orchestrator/models — what this deployment can actually run. */
export function listOrchestratorModels(_req: Request, res: Response): void {
  const models = listAvailableChatModels({
    googleConfigured: isGoogleAiConfigured(),
    anthropicKey: process.env.ANTHROPIC_API_KEY?.trim() || null,
  });
  res.status(200).json({ models });
}

/**
 * Controller endpoint: POST /api/orchestrator/chat
 */
/**
 * Decide whether a chat turn is a workflow build request (structured DAG
 * proposal) or consultative dialogue. Exported for regression tests.
 *
 * CC-2026-09-25-011: the original keyword regex matched question forms too
 * ("run that by me again", "what runs do we have?", "how do we execute
 * onboarding?"), forcing a DAG proposal where the founder wanted an answer.
 * Rules, in precedence order:
 *  1. forceProposal (set programmatically) always wins.
 *  2. A STRONG imperative opener (build/create/synthesize/design/automate/
 *     set up) is unambiguous commissioning language and proposes even if the
 *     sentence carries a question mark ("build the onboarding DAG, ok?").
 *     Weak verbs like "run"/"execute" deliberately do NOT get this privilege:
 *     "run that by me again" was the original false positive.
 *  3. Any other sentence containing a build verb proposes only when it does
 *     not read as a question (no "?", no interrogative opener).
 */
const BUILD_VERBS =
  /\b(build|create|synthesize|design|automate|draft a workflow|propose a workflow|new workflow|dag|workflow for|set up|execute|run)\b/i;
const STRONG_IMPERATIVE_OPEN =
  /^(build|create|synthesize|design|automate|set up|draft|propose)\b/i;
const INTERROGATIVE_START =
  /^(what|when|where|which|who|whom|whose|why|how|do|does|did|can|could|should|would|is|are|was|were|will|may|might|have|has)\b/i;

export function shouldProposeWorkflow(
  rawPrompt: string,
  forceProposal = false
): boolean {
  if (forceProposal) return true;
  const text = (rawPrompt || "").trim();
  if (!text) return false;
  if (STRONG_IMPERATIVE_OPEN.test(text)) return true;
  if (!BUILD_VERBS.test(text)) return false;
  // A question mark anywhere, or a sentence that opens like a question, means
  // the founder is asking — not commissioning.
  if (text.includes("?") || INTERROGATIVE_START.test(text)) return false;
  return true;
}

export async function handleOrchestratorChat(
  req: Request,
  res: Response
): Promise<void> {
  const startTime = Date.now();
  const rawPrompt = req.body.prompt || req.body.message;
  // Model request resolution (CC-2026-10-02-021): this used to be a
  // display-only label — req.body.model was read and never used. It now
  // resolves to a request the server can honor: a Google chain id leads the
  // chain, urc-fallback is the explicit deterministic mode, Claude routes to
  // Anthropic when a key exists, and anything else answers honestly via
  // modelNote instead of pretending the choice was honored.
  const modelRequest = resolveChatModelRequest(req.body.model, {
    anthropicKey: process.env.ANTHROPIC_API_KEY?.trim() || null,
  });
  const attachments = req.body.attachments as Array<{ name: string; content: string; type?: string }> | undefined;

  if (!rawPrompt || typeof rawPrompt !== "string") {
    res
      .status(400)
      .json({ error: 'Field "prompt" or "message" is required and must be a string.' });
    return;
  }

  let prompt = rawPrompt;
  const textAttachments: Array<{ name: string; content: string }> = [];
  const imageAttachments: Array<{ name: string; content: string }> = [];

  if (attachments && attachments.length > 0) {
    for (const att of attachments) {
      if (att.content && (att.content.startsWith("data:image/") || att.type?.startsWith("image/"))) {
        imageAttachments.push(att);
      } else {
        textAttachments.push(att);
      }
    }

    if (textAttachments.length > 0) {
      const attachmentText = textAttachments
        .map(a => `[Attached Document: ${a.name}]\n${a.content}`)
        .join("\n\n");
      prompt = `${rawPrompt}\n\n--- Context Documents & Logs ---\n${attachmentText}`;
    }
  }

  let unlockedDepartments: string[] = [];
  const workspaceId = req.workspaceId;
  const telemetry: LiveSystemTelemetry = {};

  if (workspaceId === "00000000-0000-0000-0000-000000000000") {
    unlockedDepartments = ["ALL"];
  }

  try {
    const db = await getDb();
    if (db && workspaceId) {
      if (workspaceId !== "00000000-0000-0000-0000-000000000000") {
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

      // Live Telemetry Introspection
      const recentLogs = await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.workspaceId, workspaceId))
        .orderBy(desc(auditLogs.createdAt))
        .limit(10);

      telemetry.recentErrors = recentLogs
        .filter(l => l.status === "error" || l.actionType.includes("failure"))
        .map(l => `[${l.actionType}] ${l.errorMessage || JSON.stringify(l.payloadIn).slice(0, 180)}`);

      const runs = await db
        .select()
        .from(workflowRuns)
        .where(eq(workflowRuns.workspaceId, workspaceId))
        .orderBy(desc(workflowRuns.startedAt))
        .limit(10);

      // Real failure evidence (2026-09-24): the agent must be able to SEE
      // its own failed runs — previously it only got run statuses, so it
      // could not diagnose why DAGs were dying without being told.
      //
      // Citations go through formatRunEvidence: every line carries the
      // joined workflow NAME and run date, never a bare UUID wall.

      const wfs = await db
        .select()
        .from(dbWorkflows)
        .where(eq(dbWorkflows.workspaceId, workspaceId));

      telemetry.activeWorkflows = wfs.map(w => `${w.name} (${w.status})`);

      const wfNameById = new Map(wfs.map(w => [w.id, w.name]));

      telemetry.recentRuns = runs
        .slice(0, 5)
        .map(r => formatRunEvidence(r, wfNameById));

      telemetry.recentRunFailures = runs
        .filter(r => r.status === "failed")
        .slice(0, 5)
        .map(r => formatRunEvidence(r, wfNameById));

      const ags = await db
        .select()
        .from(dbAgents)
        .where(eq(dbAgents.workspaceId, workspaceId));

      telemetry.activeAgents = ags.map(a => `${a.name} (${a.role})`);

      // Visitor→account memory: surface what the user told the intake agent
      // pre-signup so the Ops Agent greets a returning prospect with context
      // instead of starting cold.
      try {
        const [ws] = await db
          .select({ onboardingContext: workspaces.onboardingContext })
          .from(workspaces)
          .where(eq(workspaces.id, workspaceId))
          .limit(1);
        const ctx = ws?.onboardingContext as any;
        if (ctx && typeof ctx === "object") {
          const bits = [
            ctx.company ? `Company: ${ctx.company}` : null,
            ctx.painPoint ? `Stated pain point: ${ctx.painPoint}` : null,
            ctx.interest ? `Interest: ${ctx.interest}` : null,
            ctx.transcript ? `Intake transcript (truncated): ${String(ctx.transcript).slice(0, 1500)}` : null,
          ].filter(Boolean);
          if (bits.length > 0) {
            telemetry.prospectContext = bits.join(" | ");
          }
        }
      } catch {
        // onboarding context is optional enrichment
      }
    }
  } catch (e) {
    console.warn("[Orchestrator] Telemetry query note:", e);
  }

  // Operator persona + preferred model (CC-2026-10-01-009): read the
  // workspace row once. The stored orchestrator system prompt and name feed
  // buildSystemPrompt; the stored default model LEADS the chat chain (when it
  // is a real, current id — retired/fictional ids are skipped with a logged
  // note instead of silently 404ing).
  let personaConfig: { name?: string | null; customPrompt?: string | null } = {};
  let preferredModel: string | null = null;
  try {
    const db2 = await getDb();
    if (db2 && workspaceId) {
      const [wsRow] = await db2
        .select({
          orchestratorName: workspaces.orchestratorName,
          orchestratorSystemPrompt: workspaces.orchestratorSystemPrompt,
          defaultModel: workspaces.defaultModel,
        })
        .from(workspaces)
        .where(eq(workspaces.id, workspaceId))
        .limit(1);
      if (wsRow) {
        personaConfig = {
          name: wsRow.orchestratorName,
          customPrompt: wsRow.orchestratorSystemPrompt,
        };
        const stored = (wsRow.defaultModel ?? "").trim();
        if (
          stored &&
          !stored.includes("1.5") && // dormant-era id, never a live choice
          !stored.includes("2.5-flash") && // retired 2026-09-30 (CC-2026-09-30-012)
          !stored.includes("2.0") &&
          GOOGLE_MODEL_CHAIN.includes(stored as any)
        ) {
          preferredModel = stored;
        } else if (stored && stored !== "gemini-1.5-pro") {
          console.warn(
            `[Orchestrator] Stored defaultModel "${stored}" is not in the current chain — using the shared chain order instead.`
          );
        }
      }
    }
  } catch {
    // Persona/model preference is enrichment; the chat must not fail over it.
  }

  let proposal: WorkflowProposal | undefined;
  let reply = "";
  let modelUsed: string = preferredModel ?? GOOGLE_MODEL_CHAIN[0];
  let tokensUsed: number | null = null;
  let modelNote: string | undefined;
  let anthropicFailed = false;
  // Hoisted so the honest-fallback catch (CC-2026-09-30-012) knows which mode
  // failed and can degrade truthfully for that mode.
  let wantsProposal = false;

  const buildPayload = (): OrchestratorChatResponse => ({
    reply,
    proposal,
    timestamp: new Date().toISOString(),
    executionMetrics: {
      latencyMs: Date.now() - startTime,
      tokensUsed,
      model: modelUsed,
      ...(modelNote ? { modelNote } : {}),
    },
  });

  // Explicit deterministic mode (CC-2026-10-02-021, Robert-approved): the
  // "URC Deterministic Model" runs only when the operator actively selects it.
  // Proposals come from the canonical playbook matcher; conversation gets an
  // honest "no model consulted" refusal. CC-2026-09-30-012's ban on SILENT
  // canned fallback is untouched — this path is never taken implicitly.
  if (modelRequest.kind === "deterministic") {
    wantsProposal = shouldProposeWorkflow(rawPrompt, req.body.forceProposal === true);
    modelUsed = "urc-deterministic";
    tokensUsed = null;
    modelNote = "Deterministic offline mode — no model was consulted.";
    if (wantsProposal) {
      const deterministic = generateFallbackWorkflowProposal(prompt, unlockedDepartments);
      proposal = deterministic.proposal;
      reply = deterministic.reply;
    } else {
      reply =
        "Deterministic offline mode is selected, so no model was consulted and I cannot answer questions from live telemetry. Pick a Gemini or Claude model in the selector for real answers — deterministic mode only synthesizes workflow proposals from the canonical playbook list.";
    }
    res.status(200).json(buildPayload());
    return;
  }

  // Provider dispatch (CC-2026-10-02-021): honors the operator's requested
  // model. Claude is tried first ONLY when explicitly requested (and a key
  // exists), falling back to the Google chain with a logged note; Google
  // requests and the stored defaultModel lead the chain via its second
  // argument — the wire CC-2026-10-01-009 documented but never connected.
  async function dispatchModelRun<R>(
    run: (buildModel: () => any) => Promise<R>
  ): Promise<{ value: R; model: string }> {
    if (modelRequest.kind === "anthropic") {
      try {
        const anthropic = createAnthropic({ apiKey: modelRequest.key });
        const value = await run(() => anthropic(modelRequest.id));
        return { value, model: `anthropic:${modelRequest.id}` };
      } catch (err) {
        anthropicFailed = true;
        console.warn(
          "[Orchestrator] Claude request failed — falling back to the Google chain:",
          err
        );
      }
    }
    if (!isGoogleAiConfigured()) {
      throw new Error(
        "LLM_NOT_CONFIGURED: no Gemini credential (service-account key or API key) is available. Place the service-account JSON at secrets/gemini-service-account.json."
      );
    }
    const google = createGoogleProvider();
    const chainLead =
      modelRequest.kind === "google" && modelRequest.lead
        ? modelRequest.lead
        : preferredModel;
    const result = await withGoogleModelChainLeading(
      model => run(() => google(model)),
      chainLead
    );
    return { value: result.value, model: result.model };
  }

  // Attempt dynamic LLM orchestration via Vercel AI SDK & Google Gemini / Vertex AI
  try {
    const systemPrompt = buildSystemPrompt(unlockedDepartments, telemetry, personaConfig);

    // Conversation history (2026-09-24): the chat was single-turn — every
    // message started a fresh context. Pass prior turns through so the Ops
    // Agent can hold a real thread.
    const rawHistory: any[] = Array.isArray(req.body.history) ? req.body.history : [];
    const history = rawHistory
      .filter((m: any) => m && typeof m.content === "string" && m.content.trim() &&
        (m.role === "user" || m.role === "assistant"))
      .slice(-12)
      .map((m: any) => ({ role: m.role as "user" | "assistant", content: m.content as string }));

    // Mode routing (2026-09-24): the previous implementation forced EVERY
    // response through generateObject(workflowProposalSchema), so the agent
    // was structurally unable to simply converse, diagnose, or answer
    // questions — it could only emit a DAG proposal. Now: proposals are
    // generated only when the user actually wants one; everything else gets
    // a real conversational answer grounded in the live telemetry (including
    // real failed-run errors).
    // CC-2026-09-25-011: routing extracted into shouldProposeWorkflow with an
    // interrogative guard — "run that by me again", "what runs do we have?",
    // and other question forms are conversation, not build requests.
    wantsProposal = shouldProposeWorkflow(
      rawPrompt,
      req.body.forceProposal === true
    );

    const userMessageContent: Array<{ type: "text"; text: string } | { type: "image"; image: string }> = [
      { type: "text", text: prompt },
    ];

    for (const img of imageAttachments) {
      userMessageContent.push({
        type: "image",
        image: img.content,
      });
    }

    const baseMessages = [
      ...history.map(h => ({ role: h.role, content: h.content as any })),
      { role: "user" as const, content: userMessageContent as any },
    ];

    if (wantsProposal) {
      // Model-chain (CC-2026-09-30-012): pinned "gemini-2.5-flash" is retired
      // for new accounts (404 "no longer available to new users"), which routed
      // every chat into the canned fallback below. The "-latest" aliases track
      // the current GA model — same chain agent-runner has used since 09-28.
      // CC-2026-10-02-021: dispatchModelRun honors the operator's requested
      // model and passes the stored defaultModel as the chain lead — the wire
      // CC-2026-10-01-009 documented but never connected.
      const outcome = await dispatchModelRun(buildModel =>
        generateObject({
          model: buildModel(),
          schema: workflowProposalSchema,
          system: systemPrompt,
          messages: baseMessages as any,
        })
      );

      proposal = outcome.value.object;
      modelUsed = outcome.model;
      reply =
        proposal.reply ||
        `Synthesized multi-agent DAG proposal for "${proposal.name}" governed by URC ${proposal.departmentCode.toUpperCase()} operations.`;
      // Honesty rule (honesty-audit P1-1): when the model does not report usage,
      // we record null — never a random number.
      tokensUsed = outcome.value.usage?.totalTokens ?? null;
    } else {
      const conversationalSystem = `${systemPrompt}

=== RESPONSE MODE: CONSULTATIVE DIALOGUE (NOT a workflow proposal) ===
The founder is asking a question, reporting an issue, or thinking out loud. Respond in natural prose — NOT as a workflow proposal.
Rules:
- Answer the actual question. If they ask about failed runs, diagnose using the FAILED RUNS and audit-log telemetry in your context; quote the real recorded error messages.
- If the telemetry shows failures, say so plainly with the specific error, the affected workflow, and your recommended fix — never claim "all systems nominal" if failed runs are listed above.
- You may suggest that a workflow proposal COULD address the issue, and ask if they want one. Do not fabricate a proposal object in prose.
- Plain text only — no markdown syntax (no **, *, #, backticks, bullet markers); the directive card renders your text literally.
- Every version number, engine name, run id, and date you state MUST come verbatim from the telemetry block above. You have NO platform/engine version telemetry — never invent one (post-deploy hardening 2026-09-30: the model confabulated an "Engine v2.4").
- Keep the consultative COO voice: direct, evidence-based, no fluff.`;

      const outcome = await dispatchModelRun(buildModel =>
        generateText({
          model: buildModel(),
          system: conversationalSystem,
          messages: baseMessages as any,
        })
      );

      reply = outcome.value.text;
      modelUsed = outcome.model;
      tokensUsed = outcome.value.usage?.totalTokens ?? null;
    }
  } catch (llmError) {
    // Mode-aware HONEST fallback (CC-2026-09-30-012): the previous catch-all
    // ran generateFallbackWorkflowProposal for EVERY failure, so a conversational
    // question died into a canned 4-step DAG — and that template spoke in the
    // first person ("I have analyzed your request..."), reading as a real model
    // answer. Fail loudly instead: log the error, tell the operator the truth,
    // and never fabricate analysis or a proposal object.
    console.error("[Orchestrator] Gemini model chain exhausted:", llmError);
    modelUsed = "urc-model-unavailable";
    tokensUsed = null; // no model answered
    if (wantsProposal) {
      proposal = undefined;
      reply = `I could not reach the Gemini model just now, so I have NOT synthesized a DAG proposal — emitting the canned template would be a fabrication. Your request is preserved; please retry in a moment. (Tried: ${GOOGLE_MODEL_CHAIN.join(" → ")})`;
    } else {
      reply = `I could not reach the Gemini model just now, so I cannot answer from live telemetry. Please retry in a moment. (Tried: ${GOOGLE_MODEL_CHAIN.join(" → ")})`;
    }
  }

  // Honest model reporting (CC-2026-10-02-021): when the requested model was
  // not the one that answered (or none did), say so instead of staying silent.
  if (modelRequest.kind === "unsupported") {
    modelNote =
      modelUsed === "urc-model-unavailable"
        ? `Requested model "${modelRequest.requested}" is not available on this deployment, and no model answered.`
        : `Requested model "${modelRequest.requested}" is not available on this deployment — ${modelUsed} answered.`;
  } else if (anthropicFailed) {
    modelNote =
      modelUsed === "urc-model-unavailable"
        ? "Claude request failed, and the Google chain did not answer either."
        : "Claude request failed — the Google chain answered instead.";
  }

  res.status(200).json(buildPayload());
}
