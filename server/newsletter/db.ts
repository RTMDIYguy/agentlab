import {
  newsletterSubscribers,
  newsletterCampaigns,
  newsletterTemplates,
  newsletterEvents,
  InsertNewsletterSubscriber,
  InsertNewsletterCampaign,
  InsertNewsletterTemplate,
  InsertNewsletterEvent,
} from "../../drizzle/schema";
import { getDb } from "../db";
import { eq, desc, and, isNull } from "drizzle-orm";
import { randomBytes } from "crypto";

/**
 * Generate a unique token for verification or unsubscribe links
 */
export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Subscribe a new email to the newsletter
 */
export async function subscribeToNewsletter(
  email: string,
  name?: string,
  source: string = "website"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const verificationToken = generateToken();
  const unsubscribeToken = generateToken();

  const result = await db.insert(newsletterSubscribers).values({
    email,
    name,
    source,
    status: "subscribed",
    verificationToken,
    verifiedAt: new Date(),
    unsubscribeToken,
  });

  return {
    ...result,
    verificationToken,
    unsubscribeToken,
  };
}

/**
 * Verify a newsletter subscription
 */
export async function verifyNewsletterSubscription(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const subscriber = await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.verificationToken, token))
    .limit(1);

  if (!subscriber.length) {
    throw new Error("Invalid verification token");
  }

  await db
    .update(newsletterSubscribers)
    .set({
      status: "subscribed",
      verifiedAt: new Date(),
      verificationToken: null,
    })
    .where(eq(newsletterSubscribers.id, subscriber[0].id));

  return subscriber[0];
}

/**
 * Unsubscribe from newsletter
 */
export async function unsubscribeFromNewsletter(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(newsletterSubscribers)
    .set({
      status: "unsubscribed",
      unsubscribedAt: new Date(),
    })
    .where(eq(newsletterSubscribers.email, email));
}

/**
 * Unsubscribe using token
 */
export async function unsubscribeWithToken(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const subscriber = await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.unsubscribeToken, token))
    .limit(1);

  if (!subscriber.length) {
    throw new Error("Invalid unsubscribe token");
  }

  await db
    .update(newsletterSubscribers)
    .set({
      status: "unsubscribed",
      unsubscribedAt: new Date(),
    })
    .where(eq(newsletterSubscribers.id, subscriber[0].id));

  return subscriber[0];
}

/**
 * Get all active newsletter subscribers
 */
export async function getActiveSubscribers(limit = 1000) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.status, "subscribed"))
    .limit(limit);
}

/**
 * Get subscriber by email
 */
export async function getSubscriberByEmail(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, email))
    .limit(1);

  return result[0] || null;
}

/**
 * Get subscriber count by status
 */
export async function getSubscriberCountByStatus(
  status: "subscribed" | "unsubscribed" | "bounced" | "complained"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.status, status));

  return result.length;
}

/**
 * Create a new newsletter campaign
 */
export async function createNewsletterCampaign(
  data: InsertNewsletterCampaign
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(newsletterCampaigns).values(data);
}

/**
 * Get all newsletter campaigns (admin)
 */
export async function getNewsletterCampaigns(limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(newsletterCampaigns)
    .orderBy(desc(newsletterCampaigns.createdAt))
    .limit(limit);
}

/**
 * Get campaign by ID
 */
export async function getCampaignById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(newsletterCampaigns)
    .where(eq(newsletterCampaigns.id, id))
    .limit(1);

  return result[0] || null;
}

/**
 * Update campaign status
 */
export async function updateCampaignStatus(
  id: number,
  status: "draft" | "scheduled" | "sending" | "sent" | "paused" | "failed"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(newsletterCampaigns)
    .set({ status })
    .where(eq(newsletterCampaigns.id, id));
}

/**
 * Create a newsletter template
 */
export async function createNewsletterTemplate(
  data: InsertNewsletterTemplate
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(newsletterTemplates).values(data);
}

/**
 * Get all newsletter templates
 */
export async function getNewsletterTemplates(limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(newsletterTemplates)
    .orderBy(desc(newsletterTemplates.createdAt))
    .limit(limit);
}

/**
 * Get template by ID
 */
export async function getTemplateById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(newsletterTemplates)
    .where(eq(newsletterTemplates.id, id))
    .limit(1);

  return result[0] || null;
}

/**
 * Track newsletter event (open, click, bounce, etc.)
 */
export async function trackNewsletterEvent(
  data: InsertNewsletterEvent
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(newsletterEvents).values(data);

  // Update campaign metrics
  const campaign = await getCampaignById(data.campaignId);
  if (!campaign) return;

  const updates: Record<string, any> = {};

  switch (data.eventType) {
    case "open":
      updates.openCount = (campaign.openCount || 0) + 1;
      break;
    case "click":
      updates.clickCount = (campaign.clickCount || 0) + 1;
      break;
    case "bounce":
      updates.bounceCount = (campaign.bounceCount || 0) + 1;
      break;
    case "complaint":
      updates.complaintCount = (campaign.complaintCount || 0) + 1;
      break;
    case "unsubscribe":
      updates.unsubscribeCount = (campaign.unsubscribeCount || 0) + 1;
      break;
  }

  if (Object.keys(updates).length > 0) {
    await db
      .update(newsletterCampaigns)
      .set(updates)
      .where(eq(newsletterCampaigns.id, data.campaignId));
  }
}

/**
 * Get campaign statistics
 */
export async function getCampaignStats(campaignId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const campaign = await getCampaignById(campaignId);
  if (!campaign) return null;

  const events = await db
    .select()
    .from(newsletterEvents)
    .where(eq(newsletterEvents.campaignId, campaignId));

  const openRate =
    campaign.sentCount > 0
      ? ((campaign.openCount / campaign.sentCount) * 100).toFixed(2)
      : 0;
  const clickRate =
    campaign.sentCount > 0
      ? ((campaign.clickCount / campaign.sentCount) * 100).toFixed(2)
      : 0;
  const unsubscribeRate =
    campaign.sentCount > 0
      ? ((campaign.unsubscribeCount / campaign.sentCount) * 100).toFixed(2)
      : 0;

  return {
    ...campaign,
    openRate: parseFloat(openRate as string),
    clickRate: parseFloat(clickRate as string),
    unsubscribeRate: parseFloat(unsubscribeRate as string),
    eventCount: events.length,
  };
}

/**
 * Get newsletter statistics
 */
export async function getNewsletterStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const totalSubscribers = await getSubscriberCountByStatus("subscribed");
  const unsubscribed = await getSubscriberCountByStatus("unsubscribed");
  const bounced = await getSubscriberCountByStatus("bounced");
  const complained = await getSubscriberCountByStatus("complained");

  const campaigns = await db
    .select()
    .from(newsletterCampaigns)
    .where(eq(newsletterCampaigns.status, "sent"));

  const totalSent = campaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0);
  const totalOpens = campaigns.reduce((sum, c) => sum + (c.openCount || 0), 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + (c.clickCount || 0), 0);

  return {
    subscribers: {
      total: totalSubscribers,
      unsubscribed,
      bounced,
      complained,
    },
    campaigns: {
      total: campaigns.length,
      totalSent,
      totalOpens,
      totalClicks,
      avgOpenRate:
        campaigns.length > 0
          ? (
              campaigns.reduce(
                (sum, c) =>
                  sum +
                  (c.sentCount > 0
                    ? (c.openCount / c.sentCount) * 100
                    : 0),
                0
              ) / campaigns.length
            ).toFixed(2)
          : 0,
    },
  };
}
