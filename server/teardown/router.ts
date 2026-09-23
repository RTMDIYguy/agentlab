import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { and, desc, eq, sql } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { getDb, getUserByOpenId } from "../db";
import { teardownSessions } from "../schema";

/**
 * Server-side cap for a persisted recording. The transport is tRPC JSON with
 * base64 video (+33%), and the body parser limit is 50mb — so the raw cap is
 * 36MB (≈ 48MB base64, safely under the parser limit).
 */
export const TEARDOWN_MAX_VIDEO_BYTES = 36 * 1024 * 1024;
/** Base64 string cap on the wire (~48M chars ≈ 36MB raw). */
export const TEARDOWN_MAX_BASE64_CHARS = 48 * 1024 * 1024;

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

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

export type TeardownSessionMeta = {
  id: string;
  title: string;
  durationSeconds: number;
  sizeBytes: number;
  hasVideo: boolean;
  hasBrief: boolean;
  notes: string | null;
  aiBrief: string | null;
  createdAt: string;
};

/**
 * Resolve the caller's workspace from their DB user record — the same
 * resolution the sibling tRPC routers use. Falls back to the user row
 * re-read by openId when the session row lacks a workspace.
 */
async function resolveWorkspaceId(ctx: any): Promise<string> {
  const direct = ctx?.user?.workspaceId as string | null | undefined;
  if (direct) return direct;

  const openId = ctx?.user?.openId as string | undefined;
  if (openId) {
    const user = await getUserByOpenId(openId);
    if (user?.workspaceId) return user.workspaceId;
  }

  throw new TRPCError({
    code: "PRECONDITION_FAILED",
    message: "No workspace is associated with this account.",
  });
}

/**
 * Shared LLM brief writer for the teardown studio. The browser recording
 * never leaves the user's machine, so the model cannot watch the video —
 * the brief is grounded strictly in the user's written session notes plus
 * the real recording metadata. Inventing timestamps or findings is forbidden.
 */
export async function writeTeardownBrief(input: {
  title: string;
  durationSeconds: number;
  notes: string;
}): Promise<{ brief: string; model: string }> {
  const result = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are the AI Teardown Brief writer inside AgentLab OS, summarizing async screen-recording walkthroughs for Robert McCarthy (Uncle Robert Consulting). The video itself is NOT available to you — only the founder's written notes about it. Produce a concise markdown brief with exactly these sections:\n\n### Video Teardown Brief\n**Executive Overview**\n- (2-4 bullets summarizing what the notes say the video covers)\n\n**Key Points from the Session**\n- (specific observations drawn from the notes)\n\n**Recommended Next Actions**\n1. [ ] (concrete follow-ups implied by the notes)\n\nRules: ground every statement in the notes; do NOT invent timestamps, metrics, client names, prices, or findings that are not in the notes; if the notes mention a timestamp you may cite it; keep it under 300 words.",
      },
      {
        role: "user",
        content: `Recording title: ${input.title}\nRecorded duration: ${formatDuration(input.durationSeconds)}\n\nFounder's notes describing this recording:\n"""\n${input.notes}\n"""\n\nWrite the teardown brief now.`,
      },
    ],
    maxTokens: 1200,
  });

  const brief = extractText(result.choices?.[0]);

  if (!brief) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Model returned an empty brief.",
    });
  }

  return { brief, model: result.model ?? "unknown" };
}

export const teardownRouter = router({
  /**
   * AI teardown brief for a screen recording (standalone — not persisted;
   * the client decides whether to save a session).
   */
  summarizeTeardown: protectedProcedure
    .input(
      z.object({
        title: z.string().trim().min(1).max(128).default("Client Teardown"),
        durationSeconds: z.number().int().min(0).max(86400).default(0),
        notes: z.string().trim().min(1).max(20000),
      })
    )
    .mutation(async ({ input }) => writeTeardownBrief(input)),

  /** Newest-first list of saved teardown sessions for this workspace. */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }
      const workspaceId = await resolveWorkspaceId(ctx);

      const rows = await db
        .select({
          id: teardownSessions.id,
          title: teardownSessions.title,
          durationSeconds: teardownSessions.durationSeconds,
          sizeBytes: teardownSessions.sizeBytes,
          notes: teardownSessions.notes,
          aiBrief: teardownSessions.aiBrief,
          hasVideo: sql<boolean>`(${teardownSessions.videoData} is not null)`,
          createdAt: teardownSessions.createdAt,
        })
        .from(teardownSessions)
        .where(eq(teardownSessions.workspaceId, workspaceId))
        .orderBy(desc(teardownSessions.createdAt))
        .limit(input.limit);

      return rows.map(
        (row): TeardownSessionMeta => ({
          id: row.id,
          title: row.title,
          durationSeconds: row.durationSeconds ?? 0,
          sizeBytes: row.sizeBytes ?? 0,
          hasVideo: !!row.hasVideo,
          hasBrief: !!row.aiBrief,
          notes: row.notes ?? null,
          aiBrief: row.aiBrief ?? null,
          createdAt:
            row.createdAt instanceof Date
              ? row.createdAt.toISOString()
              : String(row.createdAt ?? ""),
        })
      );
    }),

  /** Persist a recorded session (title/duration/notes/brief/video blob). */
  save: protectedProcedure
    .input(
      z.object({
        title: z.string().trim().min(1).max(128),
        durationSeconds: z.number().int().min(0).max(86400).default(0),
        sizeBytes: z.number().int().min(0).max(2147483647),
        notes: z.string().max(20000).nullable().default(null),
        aiBrief: z.string().max(20000).nullable().default(null),
        aiBriefModel: z.string().max(64).nullable().default(null),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }
      const workspaceId = await resolveWorkspaceId(ctx);

      // Video binaries travel through /api/teardown/:id/video (REST) — this
      // mutation persists metadata only.
      const [row] = await db
        .insert(teardownSessions)
        .values({
          workspaceId,
          title: input.title,
          durationSeconds: input.durationSeconds,
          sizeBytes: input.sizeBytes,
          notes: input.notes,
          aiBrief: input.aiBrief,
          aiBriefModel: input.aiBriefModel,
        })
        .returning();

      return { id: row.id };
    }),

  /** Update only the AI brief on an existing session. */
  updateBrief: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        brief: z.string().min(1).max(20000),
        model: z.string().max(64).nullable().default(null),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }
      const workspaceId = await resolveWorkspaceId(ctx);

      const updated = await db
        .update(teardownSessions)
        .set({
          aiBrief: input.brief,
          aiBriefModel: input.model,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(teardownSessions.id, input.sessionId),
            eq(teardownSessions.workspaceId, workspaceId)
          )
        )
        .returning({ id: teardownSessions.id });

      if (updated.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Session not found" });
      }
      return { ok: true };
    }),

  /** Delete a session (removes its video blob too). */
  delete: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }
      const workspaceId = await resolveWorkspaceId(ctx);

      await db
        .delete(teardownSessions)
        .where(
          and(
            eq(teardownSessions.id, input.sessionId),
            eq(teardownSessions.workspaceId, workspaceId)
          )
        );
      return { ok: true };
    }),
});
