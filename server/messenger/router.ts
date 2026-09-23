import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { asc, desc, eq, sql } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { messengerMessages, messengerThreads } from "../schema";
import { invokeLLM } from "../_core/llm";

// Seed channels mirror the previous hardcoded scaffold so existing UI flows
// keep working, but now they live in the DB and are created once.
const SEED_CHANNELS = [
  { slug: "chan-general", name: "general-office", tagline: "Agency-wide team & ops sync" },
  { slug: "chan-sales", name: "sales-and-leads", tagline: "Inbound diagnostics & CRM pipeline" },
  { slug: "chan-fulfillment", name: "fulfillment-briefs", tagline: "Active sprints & DAG delivery" },
  { slug: "chan-portal", name: "client-portal", tagline: "Client-facing updates & approvals" },
] as const;

const createThreadSchema = z.object({
  type: z.enum(["channel", "dm"]),
  name: z.string().trim().min(1).max(128),
  tagline: z.string().trim().max(255).optional(),
  role: z.string().trim().max(96).optional(),
  company: z.string().trim().max(128).optional(),
  slug: z.string().trim().max(96).optional(),
});

export const messengerRouter = router({
  /** Ensure seed channels exist, then list every thread. */
  listThreads: protectedProcedure.query(async () => {
    const db = await getDb();

    for (const channel of SEED_CHANNELS) {
      await db
        .insert(messengerThreads)
        .values({ type: "channel", ...channel })
        .onConflictDoNothing();
    }

    const rows = await db
      .select()
      .from(messengerThreads)
      .orderBy(asc(messengerThreads.type), asc(messengerThreads.name));

    return rows.map(row => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));
  }),

  /** Fetch a thread's messages, oldest first. */
  getMessages: protectedProcedure
    .input(z.object({ threadId: z.string().uuid() }))
    .query(async ({ input }) => {
      const db = await getDb();

      const [thread] = await db
        .select()
        .from(messengerThreads)
        .where(eq(messengerThreads.id, input.threadId))
        .limit(1);

      if (!thread) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Thread not found" });
      }

      const rows = await db
        .select()
        .from(messengerMessages)
        .where(eq(messengerMessages.threadId, input.threadId))
        .orderBy(asc(messengerMessages.createdAt))
        .limit(500);

      return rows.map(row => ({
        ...row,
        createdAt: row.createdAt.toISOString(),
      }));
    }),

  /** Persist a message sent by the founder (or recorded on their behalf). */
  sendMessage: protectedProcedure
    .input(
      z.object({
        threadId: z.string().uuid(),
        senderName: z.string().trim().min(1).max(128).default("Robert McCarthy"),
        content: z.string().trim().min(1).max(10000),
        isMeetingLink: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();

      const [thread] = await db
        .select()
        .from(messengerThreads)
        .where(eq(messengerThreads.id, input.threadId))
        .limit(1);

      if (!thread) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Thread not found" });
      }

      const [row] = await db
        .insert(messengerMessages)
        .values({
          threadId: input.threadId,
          sender: "founder",
          senderName: input.senderName,
          content: input.content,
          isMeetingLink: input.isMeetingLink,
        })
        .returning();

      await db
        .update(messengerThreads)
        .set({ updatedAt: new Date() })
        .where(eq(messengerThreads.id, input.threadId));

      return { ...row, createdAt: row.createdAt.toISOString() };
    }),

  /** Create a channel or direct-message thread. */
  createThread: protectedProcedure
    .input(createThreadSchema)
    .mutation(async ({ input }) => {
      const db = await getDb();

      const slug =
        input.slug ??
        (input.type === "channel"
          ? input.name.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "")
          : null);

      const [row] = await db
        .insert(messengerThreads)
        .values({
          type: input.type,
          name: input.name,
          tagline: input.tagline ?? null,
          role: input.role ?? null,
          company: input.company ?? null,
          slug,
        })
        .onConflictDoUpdate({
          target: messengerThreads.slug,
          set: { name: input.name, updatedAt: new Date() },
        })
        .returning();

      return { ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() };
    }),

  /**
   * AI Response Assistant — a real LLM draft grounded in the thread's recent
   * history. Requires a configured model key; failures surface honestly
   * instead of faking a draft.
   */
  draftReply: protectedProcedure
    .input(z.object({ threadId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const db = await getDb();

      const [thread] = await db
        .select()
        .from(messengerThreads)
        .where(eq(messengerThreads.id, input.threadId))
        .limit(1);

      if (!thread) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Thread not found" });
      }

      const recent = await db
        .select({
          sender: messengerMessages.sender,
          senderName: messengerMessages.senderName,
          content: messengerMessages.content,
        })
        .from(messengerMessages)
        .where(eq(messengerMessages.threadId, input.threadId))
        .orderBy(desc(messengerMessages.createdAt))
        .limit(10);

      const transcript = recent
        .reverse()
        .map(m => `${m.senderName} (${m.sender}): ${m.content}`)
        .join("\n");

      if (!transcript.trim()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No messages in this thread yet to draft a reply from.",
        });
      }

      const result = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are the AI Response Assistant inside AgentLab OS, helping Robert McCarthy (founder of Uncle Robert Consulting) reply to clients and teammates. Write one concise, warm, professional reply (max ~120 words) to the last message in the thread. Ground it in the transcript. Do not invent commitments, prices, or dates.",
          },
          {
            role: "user",
            content: `Thread: ${thread.name} (${thread.type})${thread.tagline ? ` — ${thread.tagline}` : ""}\n\nRecent messages:\n${transcript}\n\nDraft Robert's reply. Output only the reply text.`,
          },
        ],
        maxTokens: 400,
      });

      const choice = result.choices?.[0]?.message?.content;
      const draft =
        typeof choice === "string"
          ? choice.trim()
          : Array.isArray(choice)
            ? choice
                .filter(part => part.type === "text")
                .map(part => part.text)
                .join("")
                .trim()
            : "";

      if (!draft) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Model returned an empty draft.",
        });
      }

      return { draft };
    }),

  /** Per-thread message counts, for honest unread-style badges if needed. */
  getThreadCounts: protectedProcedure.query(async () => {
    const db = await getDb();

    const rows = await db
      .select({
        threadId: messengerMessages.threadId,
        count: sql<number>`count(*)::int`,
        lastAt: sql<string | null>`max(${messengerMessages.createdAt})::text`,
      })
      .from(messengerMessages)
      .groupBy(messengerMessages.threadId);

    return rows;
  }),
});
