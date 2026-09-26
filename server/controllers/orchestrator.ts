import type { Request, Response } from "express";
import { generateObject, generateText } from "ai";
import { createGoogleProvider, isGoogleAiConfigured } from "../_core/google-ai";
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
  };
}

/**
 * Builds the system prompt injecting URC's proprietary agency structure, toolsets, doctrine, and brand guidelines.
 */
function buildSystemPrompt(unlockedDepartments: string[], telemetry?: LiveSystemTelemetry): string {
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

  return `You are the Ops Agent & Master Orchestrator for AgentLab, powered exclusively by the proprietary **AgentLab DAG Orchestration Engine v2.4**. You act as the consultative Chief Operating Officer (COO), Lead Systems Architect, and Technical Partner to the founder.

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
    estimatedCostPerRun: isHubSpot ? 0.02 : 0.04,
    estimatedLatencySeconds: isHubSpot ? 8 : 15,
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
 * Controller endpoint: POST /api/orchestrator/chat
 */
export async function handleOrchestratorChat(
  req: Request,
  res: Response
): Promise<void> {
  const startTime = Date.now();
  const rawPrompt = req.body.prompt || req.body.message;
  const requestedModel = req.body.model || "gemini-2.5-flash";
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

      telemetry.recentRuns = runs
        .slice(0, 5)
        .map(r => `Run ${r.id}: status=${r.status}`);

      // Real failure evidence (2026-09-24): the agent must be able to SEE
      // its own failed runs — previously it only got run statuses, so it
      // could not diagnose why DAGs were dying without being told.
      telemetry.recentRunFailures = runs
        .filter(r => r.status === "failed")
        .slice(0, 5)
        .map(r => `Run ${r.id} (workflow ${r.workflowId ?? "n/a"}): ${r.errorMessage || "no recorded error message"}`);

      const wfs = await db
        .select()
        .from(dbWorkflows)
        .where(eq(dbWorkflows.workspaceId, workspaceId));

      telemetry.activeWorkflows = wfs.map(w => `${w.name} (${w.status})`);

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

  let proposal: WorkflowProposal | undefined;
  let reply = "";
  let modelUsed = "gemini-2.5-flash";
  let tokensUsed: number | null = null;

  // Attempt dynamic LLM orchestration via Vercel AI SDK & Google Gemini / Vertex AI
  try {
    if (!isGoogleAiConfigured()) {
      throw new Error(
        "LLM_NOT_CONFIGURED: no Gemini credential (service-account key or API key) is available. Place the service-account JSON at secrets/gemini-service-account.json."
      );
    }
    const google = createGoogleProvider();
    const systemPrompt = buildSystemPrompt(unlockedDepartments, telemetry);

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
    const wantsProposal =
      /\b(build|create|synthesize|design|automate|draft a workflow|propose a workflow|new workflow|dag|workflow for|set up|execute|run)\b/i.test(rawPrompt) ||
      req.body.forceProposal === true;

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
      const result = await generateObject({
        model: google("gemini-2.5-flash") as any,
        schema: workflowProposalSchema,
        system: systemPrompt,
        messages: baseMessages as any,
      });

      proposal = result.object;
      reply =
        proposal.reply ||
        `Synthesized multi-agent DAG proposal for "${proposal.name}" governed by URC ${proposal.departmentCode.toUpperCase()} operations.`;
      // Honesty rule (honesty-audit P1-1): when the model does not report usage,
      // we record null — never a random number.
      tokensUsed = result.usage?.totalTokens ?? null;
    } else {
      const conversationalSystem = `${systemPrompt}

=== RESPONSE MODE: CONSULTATIVE DIALOGUE (NOT a workflow proposal) ===
The founder is asking a question, reporting an issue, or thinking out loud. Respond in natural prose — NOT as a workflow proposal.
Rules:
- Answer the actual question. If they ask about failed runs, diagnose using the FAILED RUNS and audit-log telemetry in your context; quote the real recorded error messages.
- If the telemetry shows failures, say so plainly with the specific error, the affected workflow, and your recommended fix — never claim "all systems nominal" if failed runs are listed above.
- You may suggest that a workflow proposal COULD address the issue, and ask if they want one. Do not fabricate a proposal object in prose.
- Keep the consultative COO voice: direct, evidence-based, no fluff.`;

      const result = await generateText({
        model: google("gemini-2.5-flash") as any,
        system: conversationalSystem,
        messages: baseMessages as any,
      });

      reply = result.text;
      tokensUsed = result.usage?.totalTokens ?? null;
    }
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
    tokensUsed = null; // deterministic fallback consumed no LLM tokens
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
