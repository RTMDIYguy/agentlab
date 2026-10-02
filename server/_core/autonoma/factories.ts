import { defineFactory } from "@autonoma-ai/sdk";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  users,
  workspaces,
  workspacePackages,
  newsletterSubscribers,
  contactSubmissions,
  messengerThreads,
  messengerMessages,
  teardownSessions,
  betaEnrollments,
  betaXpEvents,
} from "../../schema";
import { getUserByOpenId, upsertUser, getDb } from "../../db";

async function deleteById(table: any, id: number | string) {
  const db = await getDb();
  if (!db) return;
  await db.delete(table).where(eq(table.id, id));
}

// users — root entity. Creates through the app's real upsert path (which also
// derives the admin role for ENV.ownerOpenId), then re-reads the row for its id.
const User = defineFactory({
  inputSchema: z.object({
    openId: z.string(),
    name: z.string().optional(),
    email: z.string().optional(),
    loginMethod: z.string().optional(),
    role: z.enum(["user", "admin", "operator", "owner", "auditor"]).optional(),
  }),
  create: async data => {
    await upsertUser({
      openId: data.openId,
      name: data.name ?? "Test User",
      email: data.email ?? "test@example.com",
      loginMethod: data.loginMethod ?? null,
      role: data.role,
    });
    const row = await getUserByOpenId(data.openId);
    if (!row)
      throw new Error(`upsertUser did not persist openId=${data.openId}`);
    return row as unknown as Record<string, unknown> & { id: string };
  },
  teardown: async record => deleteById(users, record.id as string),
});

// newsletterSubscribers — created via the newsletter service shape (pending status).
const NewsletterSubscriber = defineFactory({
  inputSchema: z.object({
    email: z.string(),
    name: z.string().optional(),
    source: z.string().optional(),
  }),
  create: async data => {
    const db = await getDb();
    const [row] = await db
      .insert(newsletterSubscribers)
      .values({
        email: data.email.toLowerCase(),
        name: data.name ?? null,
        status: "active",
        source: data.source ?? "autonoma-test",
        verifyToken: null,
        unsubscribeToken: null,
      })
      .returning();
    return row as unknown as Record<string, unknown> & { id: string };
  },
  teardown: async record =>
    deleteById(newsletterSubscribers, record.id as string),
});

// contactSubmissions — persists a lead the same way the intake route does.
const ContactSubmission = defineFactory({
  inputSchema: z.object({
    email: z.string(),
    name: z.string().optional(),
    source: z.string().optional(),
    subject: z.string().optional(),
    message: z.string().optional(),
  }),
  create: async data => {
    const db = await getDb();
    const [row] = await db
      .insert(contactSubmissions)
      .values({
        name: data.name ?? null,
        email: data.email.toLowerCase(),
        subject: data.subject ?? null,
        message: data.message ?? null,
        source: data.source ?? "autonoma-test",
        status: "new",
      })
      .returning();
    return row as unknown as Record<string, unknown> & { id: string };
  },
  teardown: async record =>
    deleteById(contactSubmissions, record.id as string),
});

// messengerThreads — a channel or DM thread (slug unique; conflict-safe).
const MessengerThread = defineFactory({
  inputSchema: z.object({
    type: z.enum(["channel", "dm"]).optional(),
    slug: z.string().optional(),
    name: z.string(),
    tagline: z.string().optional(),
  }),
  create: async data => {
    const db = await getDb();
    const type = data.type ?? "channel";
    const slug =
      data.slug ??
      (type === "channel"
        ? data.name.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "")
        : null);
    const [row] = await db
      .insert(messengerThreads)
      .values({
        type,
        name: data.name,
        slug,
        tagline: data.tagline ?? null,
      })
      .onConflictDoUpdate({
        target: messengerThreads.slug,
        set: { name: data.name, updatedAt: new Date() },
      })
      .returning();
    return row as unknown as Record<string, unknown> & { id: string };
  },
  teardown: async record =>
    // Seed channels are intentionally kept; only delete non-seed test threads.
    deleteById(messengerThreads, record.id as string),
});

// messengerMessages — requires a threadId (seed the thread factory first).
const MessengerMessage = defineFactory({
  inputSchema: z.object({
    threadId: z.string(),
    sender: z.enum(["founder", "client", "bot"]).optional(),
    senderName: z.string().optional(),
    content: z.string(),
    isMeetingLink: z.boolean().optional(),
  }),
  create: async data => {
    const db = await getDb();
    const [row] = await db
      .insert(messengerMessages)
      .values({
        threadId: data.threadId,
        sender: data.sender ?? "founder",
        senderName: data.senderName ?? "Test Sender",
        content: data.content,
        isMeetingLink: data.isMeetingLink ?? false,
      })
      .returning();
    return row as unknown as Record<string, unknown> & { id: string };
  },
  teardown: async record =>
    deleteById(messengerMessages, record.id as string),
});

// teardownSessions — a persisted screen-teardown session. Provisions its
// own disposable workspace (workspace_id is NOT NULL), so teardown of the
// session cascades cleanly when the workspace is removed.
const TeardownSession = defineFactory({
  inputSchema: z.object({
    title: z.string().optional(),
    durationSeconds: z.number().int().min(0).optional(),
    notes: z.string().optional(),
    aiBrief: z.string().optional(),
    withVideo: z.boolean().optional(),
  }),
  create: async data => {
    const db = await getDb();
    const [ws] = await db
      .insert(workspaces)
      .values({
        name: "Autonoma Teardown Workspace",
        slug: `autonoma-teardown-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
      })
      .returning();

    const [row] = await db
      .insert(teardownSessions)
      .values({
        workspaceId: ws.id,
        title: data.title ?? "Autonoma Teardown Session",
        durationSeconds: data.durationSeconds ?? 120,
        sizeBytes: data.withVideo ? 1024 : 0,
        notes: data.notes ?? null,
        aiBrief: data.aiBrief ?? null,
        videoData: data.withVideo ? Buffer.from("autonoma-fake-webm") : null,
      })
      .returning();
    return row as unknown as Record<string, unknown> & { id: string };
  },
  teardown: async record =>
    deleteById(teardownSessions, record.id as string),
});

// betaEnrollments — CC-2026-10-02-017's durable beta membership. Requires a
// workspaceId (seed a user/workspace first). Inserts the same row shape
// POST /api/beta/enroll writes; the unique (workspace, app) index makes a
// duplicate seed a hard error, matching real enrollment behavior.
const BetaEnrollment = defineFactory({
  inputSchema: z.object({
    workspaceId: z.string(),
    appId: z.string(),
    xpGranted: z.number().int().optional(),
  }),
  create: async data => {
    const db = await getDb();
    const [row] = await db
      .insert(betaEnrollments)
      .values({
        workspaceId: data.workspaceId,
        appId: data.appId,
        xpGranted: data.xpGranted ?? 50,
      })
      .onConflictDoNothing()
      .returning();
    if (!row)
      throw new Error(
        `beta_enrollments already contains appId=${data.appId} for workspace ${data.workspaceId}`
      );
    return row as unknown as Record<string, unknown> & { id: string };
  },
  teardown: async record => deleteById(betaEnrollments, record.id as string),
});

// betaXpEvents — XP / trial-day ledger row (event_type: enrollment |
// trial_extension | manual). getBetaStatus and getTrialStatus sum these,
// so a seeded event must behave exactly like a controller-written one.
const BetaXpEvent = defineFactory({
  inputSchema: z.object({
    workspaceId: z.string(),
    eventType: z.enum(["enrollment", "trial_extension", "manual"]).optional(),
    appId: z.string().optional(),
    points: z.number().int().optional(),
    trialDays: z.number().int().optional(),
    reason: z.string().optional(),
  }),
  create: async data => {
    const db = await getDb();
    const [row] = await db
      .insert(betaXpEvents)
      .values({
        workspaceId: data.workspaceId,
        eventType: data.eventType ?? "manual",
        appId: data.appId ?? null,
        points: data.points ?? 0,
        trialDays: data.trialDays ?? 0,
        reason: data.reason ?? "autonoma-test",
      })
      .returning();
    return row as unknown as Record<string, unknown> & { id: string };
  },
  teardown: async record => deleteById(betaXpEvents, record.id as string),
});

export const factories = {
  users: User,
  newsletterSubscribers: NewsletterSubscriber,
  contactSubmissions: ContactSubmission,
  messengerThreads: MessengerThread,
  messengerMessages: MessengerMessage,
  teardownSessions: TeardownSession,
  betaEnrollments: BetaEnrollment,
  betaXpEvents: BetaXpEvent,
};
