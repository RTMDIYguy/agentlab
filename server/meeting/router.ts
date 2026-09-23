import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Extracts plain text from an LLM choice — string content or content parts.
 */
function extractText(choice: any): string {
  const content = choice?.message?.content;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content
      .filter((part: any) => part?.type === "text")
      .map((part: any) => part.text)
      .join("")
      .trim();
  }
  return "";
}

export const meetingRouter = router({
  /**
   * AI meeting summary — a real LLM call grounded strictly in the founder's
   * scratchpad notes. Never invents commitments, prices, or dates; failures
   * surface honestly instead of returning a canned fake summary.
   */
  summarizeNotes: protectedProcedure
    .input(
      z.object({
        roomName: z.string().trim().min(1).max(128).default("war-room"),
        durationSeconds: z.number().int().min(0).max(86400).default(0),
        notes: z.string().trim().min(1).max(20000),
      })
    )
    .mutation(async ({ input }) => {
      const result = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are the AI Meeting Summary engine inside AgentLab OS, summarizing founder/client War Room meetings for Robert McCarthy (Uncle Robert Consulting). Produce a concise markdown executive summary with exactly these sections:\n\n### Meeting Executive Summary\n**Key Findings & Discussion Points**\n- (bullet points grounded in the notes)\n\n**Agreed Next Action Items**\n1. [ ] (concrete actions found in the notes)\n\n**Open Questions / Follow-ups**\n- (anything unresolved)\n\nRules: ground every statement in the provided notes; if the notes do not mention an action, owner, price, or date, do not invent one; keep it under 300 words.",
          },
          {
            role: "user",
            content: `War Room: ${input.roomName}\nDuration: ${formatDuration(input.durationSeconds)}\n\nScratchpad notes from the meeting:\n"""\n${input.notes}\n"""\n\nProduce the executive summary now.`,
          },
        ],
        maxTokens: 1200,
      });

      const summary = extractText(result.choices?.[0]);

      if (!summary) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Model returned an empty summary.",
        });
      }

      return { summary, model: result.model ?? "unknown" };
    }),
});
