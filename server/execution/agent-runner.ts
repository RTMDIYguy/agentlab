import { generateText, tool } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

// Create a Google instance for the AI SDK.
// It will automatically use the GOOGLE_GENERATIVE_AI_API_KEY environment variable.
const google = createGoogleGenerativeAI();

export interface AgentRunnerResult {
  outputPayload: any;
  tokensPrompt: number;
  tokensCompletion: number;
  tokensTotal: number;
  cost: number;
  latencyMs: number;
}

/**
 * Runs a single agent step by combining the system prompt, action prompt,
 * and context, then calling Gemini 1.5 Pro.
 */
export async function runAgentStep(
  actionPrompt: string,
  systemPrompt: string | undefined | null,
  inputContext: Record<string, any> = {}
): Promise<AgentRunnerResult> {
  const startTime = Date.now();

  let fullPrompt = actionPrompt;
  if (Object.keys(inputContext).length > 0) {
    fullPrompt += `\n\n[Current Run Context]:\n${JSON.stringify(inputContext, null, 2)}`;
  }
  
  const finalSystemPrompt = `${systemPrompt || ""}\n\nYou have access to tools. If the step requires sending an email or updating a CRM, you MUST call the appropriate tool.`;

  // Generate text using the AI SDK
  const { text, usage } = await generateText({
    model: google("gemini-1.5-pro") as any,
    system: finalSystemPrompt,
    prompt: fullPrompt,
    maxSteps: 5,
    tools: {
      sendAgentMail: tool({
        description: "Send an email via the AgentMail relay.",
        parameters: z.object({
          to: z.string(),
          subject: z.string(),
          body: z.string(),
        }),
        execute: async ({ to, subject, body }) => {
          console.log("[TOOL EXECUTED] Sending email to:", to);
          return "Email successfully queued.";
        },
      }),
    },
  });

  const latencyMs = Date.now() - startTime;

  const usageAny = usage as any;
  const tokensPrompt = usageAny?.promptTokens || 0;
  const tokensCompletion = usageAny?.completionTokens || 0;
  const tokensTotal = usageAny?.totalTokens || 0;

  // Example cost calculation for gemini-1.5-pro ($1.25/1M input, $5.00/1M output)
  const cost =
    (tokensPrompt / 1_000_000) * 1.25 + (tokensCompletion / 1_000_000) * 5.0;

  let outputPayload;
  try {
    // Attempt to parse JSON if the model happens to return it
    outputPayload = JSON.parse(text);
  } catch (e) {
    // Otherwise wrap it in a result object
    outputPayload = { result: text };
  }

  return {
    outputPayload,
    tokensPrompt,
    tokensCompletion,
    tokensTotal,
    cost,
    latencyMs,
  };
}
