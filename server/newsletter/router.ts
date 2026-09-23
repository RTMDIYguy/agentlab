import { randomBytes } from "crypto";
import { z } from "zod";
import { and, desc, eq, isNotNull, sql } from "drizzle-orm";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  newsletterCampaigns,
  newsletterSubscribers,
} from "../schema";
import {
  createEmailTemplate,
  createMarketingEmail,
  publishMarketingEmail,
  updateMarketingEmail,
  getEmailStats,
  getHubspotEmailToken,
  sendTransactionalSingleEmail,
} from "../tools/hubspotEmail";
import {
  syncContactsToList,
  NEWSLETTER_LIST_NAME,
} from "../tools/hubspotList";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function newToken() {
  return randomBytes(32).toString("hex");
}

/**
 * Public base URL for links embedded in emails (verify/unsubscribe). Takes
 * precedence from APP_BASE_URL / PUBLIC_BASE_URL env; falls back to localhost
 * for development.
 */
function appBaseUrl(): string {
  return (
    process.env.APP_BASE_URL ||
    process.env.PUBLIC_BASE_URL ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
}

function rowToCampaign(row: any) {
  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    content: row.content,
    status: row.status,
    recipientCount: row.recipientCount ?? 0,
    sentCount: row.sentCount ?? 0,
    openCount: row.openCount ?? 0,
    clickCount: row.clickCount ?? 0,
    sentAt: row.sentAt ? row.sentAt.toISOString() : null,
    hubspotEmailId: row.hubspotEmailId ?? null,
    hubspotTemplatePath: row.hubspotTemplatePath ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

function rowToSubscriber(row: any) {
  return {
    id: row.id,
    email: row.email,
    name: row.name ?? "",
    status: row.status,
    source: row.source,
    createdAt: row.createdAt.toISOString(),
  };
}

export const newsletterRouter = router({
  /** Public: subscribe (double opt-in). Idempotent — re-subscribing resets the flow. */
  subscribe: publicProcedure
    .input(
      z.object({
        email: z.string().trim().max(255),
        name: z.string().trim().max(128).optional(),
        source: z.string().max(64).default("website"),
      })
    )
    .mutation(async ({ input }) => {
      if (!EMAIL_RE.test(input.email)) {
        throw new Error("Please enter a valid email address");
      }
      const db = await getDb();
      const email = input.email.toLowerCase();

      const [existing] = await db
        .select()
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.email, email))
        .limit(1);

      if (existing && existing.status === "active") {
        return { success: true, alreadySubscribed: true, emailDelivery: "none" };
      }

      // Fresh tokens per (re)subscription attempt.
      const verifyToken = newToken();
      const unsubToken = newToken();

      if (existing) {
        await db
          .update(newsletterSubscribers)
          .set({
            status: "pending",
            verifyToken,
            unsubscribeToken: unsubToken,
            name: input.name ?? existing.name,
            source: input.source,
            updatedAt: new Date(),
          })
          .where(eq(newsletterSubscribers.email, email));
      } else {
        await db.insert(newsletterSubscribers).values({
          email,
          name: input.name ?? null,
          status: "pending",
          source: input.source,
          verifyToken,
          unsubscribeToken: unsubToken,
        });
      }

      // Double opt-in: send the confirmation email through HubSpot
      // transactional single-send when the account has the add-on configured
      // (in-app transactional email ID); otherwise log the link honestly.
      const verifyUrl = `${appBaseUrl()}/newsletter/verify?token=${verifyToken}`;
      let emailDelivery = "logged";
      try {
        const result = await sendTransactionalSingleEmail({
          to: email,
          customProperties: {
            VERIFY_URL: verifyUrl,
            UNSUBSCRIBE_URL: `${appBaseUrl()}/newsletter/unsubscribe?token=${unsubToken}`,
            SUBSCRIBER_NAME: input.name || "there",
          },
        });
        emailDelivery = result.sent ? "hubspot" : "logged";
        if (!result.sent) {
          console.log(
            `[Newsletter] Verification for ${email}: ${result.message}`
          );
        }
      } catch (err: any) {
        // A failed send must not fail the subscription — the link is always
        // recoverable server-side; surface the error in logs.
        console.error(
          `[Newsletter] Confirmation email failed for ${email}: ${err?.message}`
        );
      }
      if (emailDelivery === "logged") {
        console.log(`[Newsletter] Verify link for ${email}: ${verifyUrl}`);
      }

      return {
        success: true,
        alreadySubscribed: false,
        emailDelivery,
      };
    }),

  /** Public: verify a subscription via emailed token. */
  verify: publicProcedure
    .input(z.object({ token: z.string().min(10).max(128) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const [row] = await db
        .select()
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.verifyToken, input.token))
        .limit(1);

      if (!row) {
        throw new Error("Invalid or expired verification link.");
      }

      await db
        .update(newsletterSubscribers)
        .set({
          status: "active",
          verifiedAt: new Date(),
          verifyToken: null,
          unsubscribeToken: row.unsubscribeToken ?? newToken(),
          updatedAt: new Date(),
        })
        .where(eq(newsletterSubscribers.id, row.id));

      return { success: true, email: row.email };
    }),

  /** Public: unsubscribe via token from campaign footer. */
  unsubscribeWithToken: publicProcedure
    .input(z.object({ token: z.string().min(10).max(128) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const [row] = await db
        .select()
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.unsubscribeToken, input.token))
        .limit(1);

      if (!row) {
        throw new Error("Invalid or expired unsubscribe link.");
      }

      await db
        .update(newsletterSubscribers)
        .set({ status: "unsubscribed", updatedAt: new Date() })
        .where(eq(newsletterSubscribers.id, row.id));

      return { success: true, email: row.email };
    }),

  /** Public: count of active subscribers. */
  getSubscriberCount: publicProcedure.query(async () => {
    const db = await getDb();
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.status, "active"));
    return { count: row?.count ?? 0 };
  }),

  /** Admin: campaigns list. */
  getCampaigns: adminProcedure
    .input(
      z
        .object({ limit: z.number().min(1).max(200).default(100) })
        .default({ limit: 100 })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      const rows = await db
        .select()
        .from(newsletterCampaigns)
        .orderBy(desc(newsletterCampaigns.createdAt))
        .limit(input.limit);
      return rows.map(rowToCampaign);
    }),

  /** Admin: subscribers list. */
  getSubscribers: adminProcedure
    .input(
      z
        .object({ limit: z.number().min(1).max(500).default(100) })
        .default({ limit: 100 })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      const rows = await db
        .select()
        .from(newsletterSubscribers)
        .orderBy(desc(newsletterSubscribers.createdAt))
        .limit(input.limit);
      return rows.map(rowToSubscriber);
    }),

  /** Admin: aggregate stats. */
  getStats: adminProcedure.query(async () => {
    const db = await getDb();

    const [sub] = await db
      .select({
        total: sql<number>`count(*)::int`,
        active: sql<number>`count(*) filter (where ${newsletterSubscribers.status} = 'active')::int`,
        pending: sql<number>`count(*) filter (where ${newsletterSubscribers.status} = 'pending')::int`,
        unsubscribed: sql<number>`count(*) filter (where ${newsletterSubscribers.status} = 'unsubscribed')::int`,
      })
      .from(newsletterSubscribers);

    const [camp] = await db
      .select({
        totalSent: sql<number>`coalesce(sum(${newsletterCampaigns.sentCount}), 0)::int`,
        totalClicks: sql<number>`coalesce(sum(${newsletterCampaigns.clickCount}), 0)::int`,
        avgOpenRate: sql<number>`coalesce(
          case when sum(${newsletterCampaigns.sentCount}) > 0
            then sum(${newsletterCampaigns.openCount})::float / sum(${newsletterCampaigns.sentCount})::float * 100
            else 0 end, 0)::float`,
      })
      .from(newsletterCampaigns);

    return {
      subscribers: {
        total: sub?.total ?? 0,
        active: sub?.active ?? 0,
        pending: sub?.pending ?? 0,
        unsubscribed: sub?.unsubscribed ?? 0,
        bounced: 0,
      },
      campaigns: {
        totalSent: camp?.totalSent ?? 0,
        avgOpenRate: Math.round(camp?.avgOpenRate ?? 0),
        totalClicks: camp?.totalClicks ?? 0,
      },
    };
  }),

  /** Admin: template library (past campaigns, so admin can duplicate them). */
  getTemplates: adminProcedure
    .input(
      z
        .object({ limit: z.number().min(1).max(50).default(50) })
        .default({ limit: 50 })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      const rows = await db
        .select()
        .from(newsletterCampaigns)
        .orderBy(desc(newsletterCampaigns.createdAt))
        .limit(input.limit);
      return rows.map(row => ({
        id: row.id,
        title: row.title,
        subject: row.subject,
        content: row.content,
        createdAt: row.createdAt.toISOString(),
      }));
    }),

  /** Admin: create a draft campaign. */
  createCampaign: adminProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        subject: z.string().min(1).max(255),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      const [row] = await db
        .insert(newsletterCampaigns)
        .values({
          title: input.title,
          subject: input.subject,
          content: input.content,
          status: "draft",
        })
        .returning();
      return { success: true, campaign: rowToCampaign(row) };
    }),

  /**
   * Admin: send a campaign through HubSpot Marketing Hub (Enterprise).
   * Flow: custom-coded template from campaign HTML -> marketing email draft
   * -> publish. Recipients are managed in HubSpot; the local row records the
   * send and the HubSpot ids for later stats sync. Falls back to DB-only
   * recording when no HubSpot token is configured (honest, not fake).
   */
  sendCampaign: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const [campaign] = await db
        .select()
        .from(newsletterCampaigns)
        .where(
          and(
            eq(newsletterCampaigns.id, input.id),
            eq(newsletterCampaigns.status, "draft")
          )
        )
        .limit(1);

      if (!campaign) {
        throw new Error("Campaign not found or already sent.");
      }

      const [activeCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.status, "active"));

      const token = getHubspotEmailToken();

      if (!token) {
        // DB-only fallback: record the send honestly, do not pretend.
        const [row] = await db
          .update(newsletterCampaigns)
          .set({
            status: "sent",
            sentAt: new Date(),
            recipientCount: activeCount?.count ?? 0,
            sentCount: 0,
            updatedAt: new Date(),
          })
          .where(eq(newsletterCampaigns.id, input.id))
          .returning();

        return {
          success: true,
          delivery: "db-only",
          message:
            "Recorded locally, but NOT emailed: no HubSpot token configured. Add HUBSPOT_PAT in Settings → Secrets to send via Marketing Hub.",
          campaign: rowToCampaign(row),
        };
      }

      try {
        // 1. Mirror the active-subscriber roster onto the HubSpot static list
        // so the send targets the real local list (upsert contacts, ensure
        // list, add/remove memberships).
        const activeSubscribers = await db
          .select({
            email: newsletterSubscribers.email,
            name: newsletterSubscribers.name,
          })
          .from(newsletterSubscribers)
          .where(eq(newsletterSubscribers.status, "active"));

        const listReport = await syncContactsToList(
          activeSubscribers.map(s => ({ email: s.email, name: s.name }))
        );
        console.log(
          `[Newsletter] HubSpot list "${listReport.listName}" (${listReport.listId}) synced: +${listReport.added} / -${listReport.removed} (${listReport.totalActive} active).`
        );

        // 2. Custom-coded template from the campaign HTML (DnD templates do
        // not render injected HTML — this is the API-compatible path).
        const template = await createEmailTemplate(
          `AgentLab ${campaign.title}`,
          campaign.content
        );

        // 3. Marketing email draft referencing that template.
        const email = await createMarketingEmail({
          name: `AgentLab — ${campaign.title}`,
          subject: campaign.subject,
          templatePath: template.path,
        });

        // 4. Target the synced list, then publish (Enterprise-gated).
        await updateMarketingEmail(email.emailId, {
          recipients: { listIds: [listReport.listId] },
        });
        await publishMarketingEmail(email.emailId);

        const [row] = await db
          .update(newsletterCampaigns)
          .set({
            status: "sent",
            sentAt: new Date(),
            recipientCount: activeCount?.count ?? 0,
            sentCount: activeCount?.count ?? 0,
            hubspotEmailId: email.emailId,
            hubspotTemplatePath: template.path,
            updatedAt: new Date(),
          })
          .where(eq(newsletterCampaigns.id, input.id))
          .returning();

        console.log(
          `[Newsletter] Campaign "${row.title}" sent via HubSpot Marketing Hub (email ${email.emailId}, list ${listReport.listId}).`
        );

        return {
          success: true,
          delivery: "hubspot",
          hubspotEmailId: email.emailId,
          hubspotListId: listReport.listId,
          message: `Sent via HubSpot Marketing Hub to list "${listReport.listName}" (${listReport.added} added, ${listReport.removed} removed, ${listReport.totalActive} active subscribers).`,
          campaign: rowToCampaign(row),
        };
      } catch (err: any) {
        console.error("[Newsletter] HubSpot send failed:", err?.message);
        throw new Error(
          `HubSpot send failed: ${err?.message || "unknown error"}. Campaign remains in draft.`
        );
      }
    }),

  /**
   * Admin: sync the active newsletter_subscribers roster into the HubSpot
   * static contact list (upsert contacts by email, ensure list, mirror
   * memberships) without sending anything. Useful right after verifying a
   * batch of subscribers or before a manual HubSpot-side send.
   */
  syncSubscribersToHubspot: adminProcedure.mutation(async () => {
    const db = await getDb();
    if (!getHubspotEmailToken()) {
      throw new Error(
        "No HubSpot token configured — add HUBSPOT_PAT in Settings → Secrets."
      );
    }

    const activeSubscribers = await db
      .select({
        email: newsletterSubscribers.email,
        name: newsletterSubscribers.name,
      })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.status, "active"));

    const report = await syncContactsToList(
      activeSubscribers.map(s => ({ email: s.email, name: s.name }))
    );

    return {
      success: true,
      listId: report.listId,
      listName: report.listName,
      upserted: report.upserted,
      added: report.added,
      removed: report.removed,
      totalActive: report.totalActive,
    };
  }),

  /**
   * Admin: pull post-send stats from HubSpot for every campaign that has a
   * hubspotEmailId and mirror them into the local rows.
   */
  syncCampaignStats: adminProcedure.mutation(async () => {
    const db = await getDb();
    if (!getHubspotEmailToken()) {
      throw new Error(
        "No HubSpot token configured — stats sync unavailable."
      );
    }

    const rows = await db
      .select()
      .from(newsletterCampaigns)
      .where(isNotNull(newsletterCampaigns.hubspotEmailId))
      .orderBy(desc(newsletterCampaigns.sentAt))
      .limit(50);

    let synced = 0;
    const errors: string[] = [];
    for (const row of rows) {
      try {
        const stats = await getEmailStats(row.hubspotEmailId!);
        await db
          .update(newsletterCampaigns)
          .set({
            openCount: stats.opens ?? row.openCount,
            clickCount: stats.clicks ?? row.clickCount,
            sentCount: stats.sent ?? row.sentCount,
            updatedAt: new Date(),
          })
          .where(eq(newsletterCampaigns.id, row.id));
        synced += 1;
      } catch (err: any) {
        errors.push(`${row.title}: ${err?.message || "failed"}`);
      }
    }

    return { success: true, synced, errors };
  }),
});
