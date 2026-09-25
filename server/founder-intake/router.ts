import { z } from "zod";
import { eq } from "drizzle-orm";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { contactSubmissions, visitorProfiles } from "../schema";
import { syncContactSubmission } from "../hubspot/sync";
import { generateText } from "ai";
import { createGoogleProvider, isGoogleAiConfigured } from "../_core/google-ai";

/**
 * Visitor memory ("the temp file", 2026-09-24):
 * Every intake turn persists what the agent has learned about the visitor
 * into visitor_profiles, keyed by email once shared. Previously the
 * conversation lived only in React state and died with the tab — there was
 * no memory when the visitor returned, and nothing to seed a workspace with
 * at signup. Bounded: keeps the latest 12 turns and 8KB of transcript text.
 */
const MAX_CONVERSATION_TURNS = 12;
const MAX_CONVERSATION_CHARS = 8192;

async function rememberVisitorTurn(
  lead: LeadContext,
  messages: ChatMessage[]
): Promise<void> {
  const email = (lead.email || "").trim().toLowerCase();
  if (!email || !email.includes("@")) return; // anonymous so far — nothing to key on

  try {
    const db = await getDb();
    if (!db) return;

    const trimmed = messages.slice(-MAX_CONVERSATION_TURNS);
    const transcript = trimmed
      .map(m => `${m.role === "user" ? "Visitor" : "Agent"}: ${m.content}`)
      .join("\n")
      .slice(-MAX_CONVERSATION_CHARS);

    const [existing] = await db
      .select({ id: visitorProfiles.id })
      .from(visitorProfiles)
      .where(eq(visitorProfiles.email, email))
      .limit(1);

    if (existing) {
      await db
        .update(visitorProfiles)
        .set({
          name: lead.name || undefined,
          company: lead.company || undefined,
          painPoint: lead.painPoint || undefined,
          interest: lead.interest || undefined,
          conversation: { turns: trimmed, transcript },
          updatedAt: new Date(),
        })
        .where(eq(visitorProfiles.id, existing.id));
    } else {
      await db.insert(visitorProfiles).values({
        email,
        name: lead.name || null,
        company: lead.company || null,
        painPoint: lead.painPoint || null,
        interest: lead.interest || null,
        conversation: { turns: trimmed, transcript },
      });
    }
  } catch (err: any) {
    // Memory must never break the conversation.
    console.warn("[Founder Intake] visitor memory write skipped:", err?.message);
  }
}

/**
 * Claim (consume) a visitor profile at signup: marks it as seeded into the
 * given workspace and returns the profile for workspace initialization.
 */
export async function claimVisitorProfile(
  email: string,
  workspaceId: string
): Promise<{
  name: string | null;
  company: string | null;
  painPoint: string | null;
  interest: string | null;
  transcript: string | null;
} | null> {
  try {
    const db = await getDb();
    if (!db) return null;
    const normalized = (email || "").trim().toLowerCase();
    if (!normalized) return null;

    const [profile] = await db
      .select()
      .from(visitorProfiles)
      .where(eq(visitorProfiles.email, normalized))
      .limit(1);
    if (!profile) return null;

    if (!profile.claimedByWorkspaceId) {
      await db
        .update(visitorProfiles)
        .set({ claimedByWorkspaceId: workspaceId, claimedAt: new Date(), updatedAt: new Date() })
        .where(eq(visitorProfiles.id, profile.id));
    }

    const conv = profile.conversation as { transcript?: string } | null;
    return {
      name: profile.name,
      company: profile.company,
      painPoint: profile.painPoint,
      interest: profile.interest,
      transcript: conv?.transcript ?? null,
    };
  } catch (err: any) {
    console.warn("[Founder Intake] visitor profile claim failed:", err?.message);
    return null;
  }
}

async function relayToN8nIfConfigured(payload: Record<string, unknown>) {
  const webhookUrl = process.env.N8N_INTAKE_WEBHOOK_URL;
  if (!webhookUrl) return false;

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      console.error(
        `[Founder Intake] n8n relay failed with status ${response.status}`
      );
      return false;
    }
    return true;
  } catch (err: any) {
    console.error("[Founder Intake] n8n relay error:", err?.message);
    return false;
  }
}



const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const leadSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  company: z.string().optional(),
  painPoint: z.string().optional(),
  interest: z.string().optional(),
});

type LeadContext = z.infer<typeof leadSchema>;
type ChatMessage = z.infer<typeof chatMessageSchema>;

type IntakeResponse = {
  reply: string;
  stage: "qualify" | "capture" | "recommend";
  recommendedOffer: string | null;
  recommendedCta: string | null;
  shouldCaptureLead: boolean;
  collected: LeadContext;
};

/**
 * Honest status of why the LLM path did not answer (surfaced in the API
 * response so the UI and the watchdog can tell "no credential configured"
 * apart from "credential failed").
 */
export type IntakeLlmStatus = {
  engine: "gemini" | "fallback";
  reason: "ok" | "not_configured" | "llm_error";
  detail?: string;
};

function buildConversation(messages: ChatMessage[]) {
  return messages
    .map(message => `${message.role.toUpperCase()}: ${message.content}`)
    .join("\n");
}

function normalizeCollectedLead(lead: LeadContext, messages: ChatMessage[]) {
  const userTranscript = messages
    .filter(message => message.role === "user")
    .map(message => message.content)
    .join(" ");

  const interest =
    lead.interest ||
    (userTranscript.match(/roundtable/i)
      ? "Founder Roundtable"
      : userTranscript.match(/diagnostic/i)
        ? "Business Systems Diagnostic"
        : userTranscript.match(/ownable os/i)
          ? "Ownable OS"
          : undefined);

  return {
    ...lead,
    interest,
  };
}

function buildFallbackResponse(
  lead: LeadContext,
  messages: ChatMessage[]
): IntakeResponse {
  const normalizedLead = normalizeCollectedLead(lead, messages);
  const missingName = !normalizedLead.name;
  const missingEmail = !normalizedLead.email;
  const missingPainPoint = !normalizedLead.painPoint;

  if (missingPainPoint) {
    return {
      reply:
        "Tell me the biggest thing slowing your business down right now: leads, follow-up, operations, marketing, or systems chaos. I’ll point you to the best next step.",
      stage: "qualify",
      recommendedOffer: null,
      recommendedCta: null,
      shouldCaptureLead: false,
      collected: normalizedLead,
    };
  }

  if (missingName || missingEmail) {
    return {
      reply:
        "You sound like a fit for a next step. Drop your name and email and I’ll route you to the best option, usually a Founder Roundtable or a Business Systems Diagnostic.",
      stage: "capture",
      recommendedOffer:
        normalizedLead.interest === "Business Systems Diagnostic"
          ? "Business Systems Diagnostic"
          : "Founder Roundtable",
      recommendedCta:
        "Share your name and email to get the invite or follow-up.",
      shouldCaptureLead: true,
      collected: normalizedLead,
    };
  }

  return {
    reply:
      normalizedLead.interest === "Business Systems Diagnostic"
        ? "You’re a good fit for a Business Systems Diagnostic. I can help you simplify the tools you already have and map the right path into Ownable OS."
        : "You’re a good fit for the Founder Roundtable. It’s the fastest way to simplify your current stack and see what a path into Ownable OS could look like.",
    stage: "recommend",
    recommendedOffer:
      normalizedLead.interest === "Business Systems Diagnostic"
        ? "Business Systems Diagnostic"
        : "Founder Roundtable",
    recommendedCta:
      normalizedLead.interest === "Business Systems Diagnostic"
        ? "Book the diagnostic and we’ll map your lead flow, follow-up, and operating gaps."
        : "Join the roundtable and we’ll map the simplest next move for your business.",
    shouldCaptureLead: true,
    collected: normalizedLead,
  };
}

/**
 * Gemini migration (2026-09-25): the intake agent previously called OpenAI's
 * raw HTTP API directly — off-policy for the org's no-API-key rule, and in
 * practice dead weight: no OPENAI_API_KEY is configured in this deployment,
 * so every visitor conversation has been running on the canned fallback
 * script. It now goes through the app's one Gemini auth factory
 * (server/_core/google-ai.ts: service-account OAuth under the org policy,
 * API-key fallback preserved) with the same model fallback chain the other
 * controllers use.
 */
async function callGemini(
  messages: ChatMessage[],
  lead: LeadContext
): Promise<{ response: IntakeResponse | null; status: IntakeLlmStatus } | null> {
  // null return = no credential configured; respond() reports that honestly
  // instead of disguising it as an LLM failure.
  if (!isGoogleAiConfigured()) return null;

  const normalizedLead = normalizeCollectedLead(lead, messages);
  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

  const prompt = `
You are the Founder Intake Agent for Uncle Robert Consulting, Bootstrapper Capital, Tactix, and Ownable OS.

Your job:
- qualify founders and small business operators
- identify whether they need a Founder Roundtable, Business Systems Diagnostic, workshop, or consulting follow-up
- meet them where they are by simplifying the tools they already have
- position Ownable OS as the long-term destination when there is a fit

Rules:
- keep the tone practical, warm, and concise
- do not sound salesy
- ask only one useful next question at a time
- if pain point is unclear, ask for it
- once pain point is clear and name/email are missing, ask for them
- once enough info exists, recommend one next step
- never return markdown, only JSON

Current lead context:
${JSON.stringify(normalizedLead, null, 2)}

Conversation:
${buildConversation(messages)}

Return valid JSON with this exact shape:
{
  "reply": "string",
  "stage": "qualify" | "capture" | "recommend",
  "recommendedOffer": "Founder Roundtable" | "Business Systems Diagnostic" | "Workshop" | "Consulting Call" | null,
  "recommendedCta": "string or null",
  "shouldCaptureLead": true,
  "collected": {
    "name": "string optional",
    "email": "string optional",
    "company": "string optional",
    "painPoint": "string optional",
    "interest": "string optional"
  }
}`.trim();

  let lastError: string | null = null;
  const google = createGoogleProvider();
  for (const modelId of models) {
    try {
      const result = await generateText({
        model: google(modelId) as any,
        prompt,
      });

      const outputText = (result.text || "").trim();
      if (!outputText) {
        lastError = `model ${modelId} returned an empty response`;
        continue;
      }

      // Tolerate markdown-fenced JSON: Gemini occasionally wraps even when
      // told not to, and the fallback script is a worse visitor experience.
      const jsonText = outputText
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```\s*$/, "")
        .trim();

      try {
        const parsed = JSON.parse(jsonText);
        return {
          response: {
            reply: parsed.reply,
            stage: parsed.stage,
            recommendedOffer: parsed.recommendedOffer ?? null,
            recommendedCta: parsed.recommendedCta ?? null,
            shouldCaptureLead: Boolean(parsed.shouldCaptureLead),
            collected: {
              name: parsed.collected?.name,
              email: parsed.collected?.email,
              company: parsed.collected?.company,
              painPoint: parsed.collected?.painPoint,
              interest: parsed.collected?.interest,
            },
          },
          status: { engine: "gemini", reason: "ok" },
        };
      } catch (parseErr: any) {
        console.error("[Founder Intake] Failed to parse Gemini JSON:", parseErr?.message);
        lastError = `model ${modelId} returned unparseable JSON`;
        continue;
      }
    } catch (mErr: any) {
      console.warn(`[Founder Intake] Model ${modelId} failed, falling back:`, mErr?.message);
      lastError = mErr?.message || String(mErr);
    }
  }

  return {
    response: null,
    status: { engine: "fallback", reason: "llm_error", detail: lastError || "all models failed" },
  };
}

export const founderIntakeRouter = router({
  respond: publicProcedure
    .input(
      z.object({
        messages: z.array(chatMessageSchema).min(1).max(24),
        lead: leadSchema.default({}),
      })
    )
    .mutation(async ({ input }) => {
      const llm = await callGemini(input.messages, input.lead);

      // Three honest states, never disguised: (1) no credential configured,
      // (2) a credential exists but every model in the chain failed, (3) the
      // Gemini path answered. llmStatus rides along so the UI and the ops
      // watchdog can tell them apart.
      let response: IntakeResponse;
      let llmStatus: IntakeLlmStatus;
      if (llm && llm.response) {
        response = llm.response;
        llmStatus = llm.status;
      } else {
        response = buildFallbackResponse(input.lead, input.messages);
        llmStatus = llm
          ? llm.status
          : {
              engine: "fallback",
              reason: "not_configured",
              detail:
                "No Gemini credential configured (secrets/gemini-service-account.json or GOOGLE_SERVICE_ACCOUNT_JSON); visitor got the scripted fallback.",
            };
      }

      // Persist what we learned this turn ("the temp file") — before this
      // change, visitor context evaporated when the tab closed.
      const mergedLead: LeadContext = {
        ...input.lead,
        ...response.collected,
        name: response.collected.name || input.lead.name,
        email: response.collected.email || input.lead.email,
      };
      await rememberVisitorTurn(mergedLead, input.messages);

      return { ...response, llmStatus };
    }),

  captureLead: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        company: z.string().optional(),
        painPoint: z.string().optional(),
        interest: z.string().optional(),
      })
    )    .mutation(async ({ input }) => {
      const db = await getDb();
      const subject = `Founder Intake Lead${input.interest ? ` - ${input.interest}` : ""}`;

      // Persist first: a webhook failure must never lose a lead.
      const [submission] = await db
        .insert(contactSubmissions)
        .values({
          name: input.name,
          email: input.email.toLowerCase(),
          company: input.company ?? null,
          painPoint: input.painPoint ?? null,
          interest: input.interest ?? null,
          subject,
          message: [
            `Company: ${input.company || "Not provided"}`,
            `Pain Point: ${input.painPoint || "Not provided"}`,
            "",
            "This lead was captured through the Founder Intake Agent.",
          ].join("\n"),
          source: "founder-intake-chat",
          status: "new",
        })
        .returning({ id: contactSubmissions.id });

      // Optional CRM relay via the same pipeline as the rest of the site.
      const relayed = await relayToN8nIfConfigured({
        "Contact Name": input.name,
        "Email": input.email.toLowerCase(),
        "Service Line": input.interest || "Founder Intake",
        "Source": "AgentLab Founder Intake Chat",
        "Notes": `Company: ${input.company || "Not provided"}\nPain Point: ${input.painPoint || "Not provided"}`,
        "Deal Value ($)": "0",
        "HubSpotSync": "",
      });

      // HubSpot lead handoff (blueprint Phase 1) — direct sync, independent
      // of the optional n8n relay. Best-effort and honestly logged; the
      // submission flips to `synced` only on a real HubSpot confirmation.
      try {
        const [full] = await db
          .select()
          .from(contactSubmissions)
          .where(eq(contactSubmissions.id, submission.id));
        if (full) {
          await syncContactSubmission(full);
        }
      } catch (syncErr: any) {
        console.error("[FounderIntake] HubSpot sync error:", syncErr?.message);
      }

      if (relayed) {
        await db
          .update(contactSubmissions)
          .set({ status: "synced", crmSyncedAt: new Date() })
          .where(eq(contactSubmissions.id, submission.id));
      }

      return {
        success: true,
        submissionId: submission.id,
        message: "Lead captured successfully.",
      };
    }),
});
