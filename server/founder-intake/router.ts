import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  createContactSubmission,
} from "../contact/db";
import {
  sendContactFormEmail,
  sendContactFormReply,
} from "../contact/email-service";

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

function buildFallbackResponse(lead: LeadContext, messages: ChatMessage[]): IntakeResponse {
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
      recommendedCta: "Share your name and email to get the invite or follow-up.",
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

async function callOpenAI(messages: ChatMessage[], lead: LeadContext): Promise<IntakeResponse | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const normalizedLead = normalizeCollectedLead(lead, messages);
  const model = process.env.OPENAI_FOUNDER_AGENT_MODEL || "gpt-5-mini";

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

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: prompt,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[Founder Intake] OpenAI error:", response.status, errorText);
    return null;
  }

  const payload = await response.json() as any;
  const outputText =
    typeof payload.output_text === "string"
      ? payload.output_text
      : Array.isArray(payload.output)
        ? payload.output
            .flatMap((item: any) => item.content || [])
            .map((item: any) => item.text || "")
            .join("")
        : "";

  if (!outputText) return null;

  try {
    const parsed = JSON.parse(outputText);
    return {
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
    };
  } catch (error) {
    console.error("[Founder Intake] Failed to parse OpenAI JSON:", error);
    return null;
  }
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
      const aiResponse = await callOpenAI(input.messages, input.lead);
      return aiResponse ?? buildFallbackResponse(input.lead, input.messages);
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
    )
    .mutation(async ({ input }) => {
      const subject = `Founder Intake Lead${input.interest ? ` - ${input.interest}` : ""}`;
      const message = [
        `Name: ${input.name}`,
        `Email: ${input.email}`,
        `Company: ${input.company || "Not provided"}`,
        `Pain Point: ${input.painPoint || "Not provided"}`,
        `Interest: ${input.interest || "General founder intake"}`,
        "",
        "This lead was captured through the Founder Intake Agent.",
      ].join("\n");

      const submission = await createContactSubmission({
        name: input.name,
        email: input.email,
        subject,
        message,
        status: "new",
      });

      const emailSent = await sendContactFormEmail({
        name: input.name,
        email: input.email,
        subject,
        message,
      });

      const replySent = await sendContactFormReply(input.email, input.name);

      if (!emailSent) {
        console.warn("[Founder Intake] Failed to send intake notification email");
      }

      if (!replySent) {
        console.warn("[Founder Intake] Failed to send intake auto-reply");
      }

      return {
        success: true,
        submissionId: (submission as any).insertId,
        message: "Lead captured successfully.",
      };
    }),
});
