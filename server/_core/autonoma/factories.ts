import { defineFactory } from "@autonoma-ai/sdk";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  blogArticles,
  blogComments,
  cartItems,
  contactSubmissions,
  maintenanceSchedule,
  newsletterCampaigns,
  newsletterEvents,
  newsletterSubscribers,
  newsletterTemplates,
  orderItems,
  orders,
  payments,
  quotes,
  statusIncidents,
  subscriptions,
  users,
} from "../../../drizzle/schema";
import { getArticleBySlug, createArticle } from "../../blog/articles";
import { createComment, createReply } from "../../blog/db";
import {
  createContactSubmission,
  markContactSubmissionAsRead,
} from "../../contact/db";
import { getUserByOpenId, upsertUser, getDb } from "../../db";
import {
  createNewsletterCampaign,
  createNewsletterTemplate,
  getSubscriberByEmail,
  subscribeToNewsletter,
  trackNewsletterEvent,
  unsubscribeFromNewsletter,
  updateCampaignStatus,
} from "../../newsletter/db";
import {
  createPayment,
  getPaymentByStripeId,
  getSubscriptionByStripeId,
  upsertSubscription,
} from "../../stripe/db";

async function deleteById(table: any, id: number) {
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
    role: z.enum(["user", "admin"]).optional(),
  }),
  create: async data => {
    await upsertUser({
      openId: data.openId,
      name: data.name ?? null,
      email: data.email ?? null,
      loginMethod: data.loginMethod ?? null,
      role: data.role,
    });
    const row = await getUserByOpenId(data.openId);
    if (!row)
      throw new Error(`upsertUser did not persist openId=${data.openId}`);
    return row as unknown as Record<string, unknown> & { id: number };
  },
  teardown: async record => deleteById(users, record.id as number),
});

const Subscription = defineFactory({
  inputSchema: z.object({
    userId: z.number(),
    stripeSubscriptionId: z.string(),
    stripeCustomerId: z.string(),
    plan: z.string(),
    status: z.string(),
    currentPeriodStart: z.string().optional(),
    currentPeriodEnd: z.string().optional(),
    canceledAt: z.string().optional(),
  }),
  create: async data => {
    await upsertSubscription({
      userId: data.userId,
      stripeSubscriptionId: data.stripeSubscriptionId,
      stripeCustomerId: data.stripeCustomerId,
      plan: data.plan,
      status: data.status,
      currentPeriodStart: data.currentPeriodStart
        ? new Date(data.currentPeriodStart)
        : undefined,
      currentPeriodEnd: data.currentPeriodEnd
        ? new Date(data.currentPeriodEnd)
        : undefined,
      canceledAt: data.canceledAt ? new Date(data.canceledAt) : undefined,
    });
    const row = await getSubscriptionByStripeId(data.stripeSubscriptionId);
    if (!row)
      throw new Error(
        `upsertSubscription did not persist ${data.stripeSubscriptionId}`
      );
    return row as unknown as Record<string, unknown> & { id: number };
  },
  teardown: async record => deleteById(subscriptions, record.id as number),
});

const Payment = defineFactory({
  inputSchema: z.object({
    userId: z.number(),
    stripePaymentIntentId: z.string(),
    stripeInvoiceId: z.string().optional(),
    amount: z.union([z.string(), z.number()]).transform(String),
    currency: z.string().optional(),
    status: z.string(),
    description: z.string().optional(),
  }),
  create: async data => {
    await createPayment(data);
    const row = await getPaymentByStripeId(data.stripePaymentIntentId);
    if (!row)
      throw new Error(
        `createPayment did not persist ${data.stripePaymentIntentId}`
      );
    return row as unknown as Record<string, unknown> & { id: number };
  },
  teardown: async record => deleteById(payments, record.id as number),
});

// blogArticles — `id` is deliberately the article's slug, not the numeric row
// id. blogComments.articleId (see below) stores the slug string (confirmed by
// how the client posts comments from the /blog/:slug route), so returning the
// slug as this factory's `id` lets a plain `_ref` wire comments to the right
// article without a second lookup field.
const BlogArticle = defineFactory({
  inputSchema: z.object({
    title: z.string(),
    excerpt: z.string().optional(),
    content: z.string(),
    slug: z.string(),
    category: z.string().optional(),
    authorId: z.number(),
    status: z.enum(["draft", "scheduled", "published"]).optional(),
    scheduledFor: z.string().optional(),
    featuredImage: z.string().optional(),
  }),
  create: async data => {
    await createArticle(
      data.title,
      data.excerpt ?? "",
      data.content,
      data.slug,
      data.category ?? "General",
      data.authorId,
      data.status ?? "draft",
      data.scheduledFor ? new Date(data.scheduledFor) : undefined,
      data.featuredImage
    );
    const row = await getArticleBySlug(data.slug);
    if (!row)
      throw new Error(`createArticle did not persist slug=${data.slug}`);
    return { ...row, id: row.slug, dbId: row.id } as unknown as Record<
      string,
      unknown
    > & { id: string };
  },
  teardown: async record => {
    const db = await getDb();
    if (!db) return;
    await db
      .delete(blogArticles)
      .where(eq(blogArticles.slug, record.id as string));
  },
});

// blogComments — createComment/createReply always insert status "approved"
// (the app has no moderation endpoint yet). When the recipe asks for a
// different status we patch that single column after the real create call.
const BlogComment = defineFactory({
  inputSchema: z.object({
    articleId: z.string(),
    userId: z.number(),
    content: z.string(),
    parentCommentId: z.number().optional(),
    status: z.enum(["pending", "approved", "rejected"]).optional(),
  }),
  create: async data => {
    const result = data.parentCommentId
      ? await createReply(
          data.articleId,
          data.userId,
          data.content,
          data.parentCommentId
        )
      : await createComment(data.articleId, data.userId, data.content);
    const insertId = (result as unknown as [{ insertId: number }])[0].insertId;

    if (data.status && data.status !== "approved") {
      const db = await getDb();
      if (db) {
        await db
          .update(blogComments)
          .set({ status: data.status })
          .where(eq(blogComments.id, insertId));
      }
    }

    return {
      id: insertId,
      articleId: data.articleId,
      userId: data.userId,
      content: data.content,
      parentCommentId: data.parentCommentId ?? null,
      status: data.status ?? "approved",
    };
  },
  teardown: async record => deleteById(blogComments, record.id as number),
});

const ContactSubmission = defineFactory({
  inputSchema: z.object({
    name: z.string(),
    email: z.string(),
    subject: z.string(),
    message: z.string(),
    status: z.enum(["new", "read", "responded"]).optional(),
  }),
  create: async data => {
    const result = await createContactSubmission({
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
    });
    const insertId = (result as unknown as [{ insertId: number }])[0].insertId;

    if (data.status === "read") {
      await markContactSubmissionAsRead(insertId);
    } else if (data.status === "responded") {
      // No dedicated "mark responded" path exists yet; reproduce the same
      // field the app would set (status + respondedAt) directly.
      const db = await getDb();
      if (db) {
        await db
          .update(contactSubmissions)
          .set({ status: "responded", respondedAt: new Date() })
          .where(eq(contactSubmissions.id, insertId));
      }
    }

    return { id: insertId, ...data, status: data.status ?? "new" };
  },
  teardown: async record => deleteById(contactSubmissions, record.id as number),
});

const NewsletterSubscriber = defineFactory({
  inputSchema: z.object({
    email: z.string(),
    name: z.string().optional(),
    source: z.string().optional(),
    status: z
      .enum(["subscribed", "unsubscribed", "bounced", "complained"])
      .optional(),
  }),
  create: async data => {
    await subscribeToNewsletter(
      data.email,
      data.name,
      data.source ?? "website"
    );

    if (data.status === "unsubscribed") {
      await unsubscribeFromNewsletter(data.email);
    } else if (data.status === "bounced" || data.status === "complained") {
      // subscribeToNewsletter always inserts status "subscribed" and there is
      // no reusable path for marking a subscriber bounced/complained (those
      // states are normally written by an inbound webhook the app doesn't
      // have yet); patch the single column directly.
      const db = await getDb();
      if (db) {
        await db
          .update(newsletterSubscribers)
          .set({ status: data.status })
          .where(eq(newsletterSubscribers.email, data.email));
      }
    }

    const row = await getSubscriberByEmail(data.email);
    if (!row)
      throw new Error(`subscribeToNewsletter did not persist ${data.email}`);
    return row as unknown as Record<string, unknown> & { id: number };
  },
  teardown: async record =>
    deleteById(newsletterSubscribers, record.id as number),
});

const NewsletterTemplate = defineFactory({
  inputSchema: z.object({
    name: z.string(),
    description: z.string().optional(),
    content: z.string(),
    previewUrl: z.string().optional(),
    category: z.string().optional(),
    isDefault: z.boolean().optional(),
    createdBy: z.number(),
  }),
  create: async data => {
    const result = await createNewsletterTemplate(data);
    const insertId = (result as unknown as [{ insertId: number }])[0].insertId;
    return { id: insertId, ...data };
  },
  teardown: async record =>
    deleteById(newsletterTemplates, record.id as number),
});

const NewsletterCampaign = defineFactory({
  inputSchema: z.object({
    title: z.string(),
    subject: z.string(),
    content: z.string(),
    templateId: z.number().optional(),
    status: z
      .enum(["draft", "scheduled", "sending", "sent", "paused", "failed"])
      .optional(),
    scheduledFor: z.string().optional(),
    sentAt: z.string().optional(),
    createdBy: z.number(),
  }),
  create: async data => {
    const result = await createNewsletterCampaign({
      title: data.title,
      subject: data.subject,
      content: data.content,
      templateId: data.templateId,
      createdBy: data.createdBy,
      scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : undefined,
      sentAt: data.sentAt ? new Date(data.sentAt) : undefined,
    });
    const insertId = (result as unknown as [{ insertId: number }])[0].insertId;

    if (data.status && data.status !== "draft") {
      await updateCampaignStatus(insertId, data.status);
    }

    return { id: insertId, ...data, status: data.status ?? "draft" };
  },
  teardown: async record =>
    deleteById(newsletterCampaigns, record.id as number),
});

const NewsletterEvent = defineFactory({
  inputSchema: z.object({
    campaignId: z.number(),
    subscriberId: z.number(),
    email: z.string(),
    eventType: z.enum([
      "sent",
      "open",
      "click",
      "bounce",
      "complaint",
      "unsubscribe",
    ]),
    linkUrl: z.string().optional(),
    metadata: z.string().optional(),
  }),
  create: async data => {
    // trackNewsletterEvent (real path) also bumps the campaign's counters —
    // that side effect matters for the scenario's campaign stats. It does
    // not return the inserted row, so re-select it right after.
    await trackNewsletterEvent(data);
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const rows = await db
      .select()
      .from(newsletterEvents)
      .where(eq(newsletterEvents.campaignId, data.campaignId))
      .orderBy(newsletterEvents.id);
    const row = [...rows]
      .reverse()
      .find(
        r =>
          r.subscriberId === data.subscriberId && r.eventType === data.eventType
      );
    if (!row)
      throw new Error("trackNewsletterEvent did not persist the expected row");
    return row as unknown as Record<string, unknown> & { id: number };
  },
  teardown: async record => deleteById(newsletterEvents, record.id as number),
});

// --- No creation path exists anywhere in the app for the six models below
// (verified by a full-repo grep: no db.ts helper, no inline insert in any
// router/handler). The quote builder on /pricing is entirely client-side
// state and never persists; the status page, cart, and orders/quotes tables
// have schema + migrations but no server code writes them yet. Per the
// integration spec, a documented direct insert is the sanctioned fallback
// when the real creation function genuinely does not exist. Teardown is
// always a direct delete regardless of how create is implemented.

const StatusIncident = defineFactory({
  inputSchema: z.object({
    title: z.string(),
    description: z.string(),
    status: z
      .enum(["investigating", "identified", "monitoring", "resolved"])
      .optional(),
    severity: z.enum(["minor", "major", "critical"]).optional(),
  }),
  create: async data => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [result] = await db.insert(statusIncidents).values(data);
    return { id: (result as { insertId: number }).insertId, ...data };
  },
  teardown: async record => deleteById(statusIncidents, record.id as number),
});

const MaintenanceScheduleEntry = defineFactory({
  inputSchema: z.object({
    title: z.string(),
    description: z.string().optional(),
    scheduledStart: z.string(),
    scheduledEnd: z.string(),
    status: z
      .enum(["scheduled", "in_progress", "completed", "cancelled"])
      .optional(),
  }),
  create: async data => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [result] = await db.insert(maintenanceSchedule).values({
      ...data,
      scheduledStart: new Date(data.scheduledStart),
      scheduledEnd: new Date(data.scheduledEnd),
    });
    return { id: (result as { insertId: number }).insertId, ...data };
  },
  teardown: async record =>
    deleteById(maintenanceSchedule, record.id as number),
});

const CartItem = defineFactory({
  inputSchema: z.object({
    userId: z.number(),
    department: z.string(),
    tier: z.string(),
    monthlyPrice: z.number(),
    quantity: z.number().optional(),
    metadata: z.string().optional(),
  }),
  create: async data => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [result] = await db.insert(cartItems).values(data);
    return { id: (result as { insertId: number }).insertId, ...data };
  },
  teardown: async record => deleteById(cartItems, record.id as number),
});

const Order = defineFactory({
  inputSchema: z.object({
    userId: z.number(),
    orderNumber: z.string(),
    stripePaymentIntentId: z.string().optional(),
    paymentMethod: z.enum(["stripe", "paypal"]),
    status: z.enum(["pending", "completed", "failed", "refunded"]).optional(),
    subtotal: z.number(),
    tax: z.number().optional(),
    total: z.number(),
    currency: z.string().optional(),
    billingEmail: z.string(),
    billingName: z.string(),
    billingAddress: z.string().optional(),
    invoiceUrl: z.string().optional(),
    receiptUrl: z.string().optional(),
    metadata: z.string().optional(),
    completedAt: z.string().optional(),
  }),
  create: async data => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [result] = await db.insert(orders).values({
      ...data,
      completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
    });
    return { id: (result as { insertId: number }).insertId, ...data };
  },
  teardown: async record => deleteById(orders, record.id as number),
});

const OrderItem = defineFactory({
  inputSchema: z.object({
    orderId: z.number(),
    department: z.string(),
    tier: z.string(),
    monthlyPrice: z.number(),
    quantity: z.number().optional(),
    lineTotal: z.number(),
    metadata: z.string().optional(),
  }),
  create: async data => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [result] = await db.insert(orderItems).values(data);
    return { id: (result as { insertId: number }).insertId, ...data };
  },
  teardown: async record => deleteById(orderItems, record.id as number),
});

const Quote = defineFactory({
  inputSchema: z.object({
    userId: z.number().optional().nullable(),
    email: z.string(),
    name: z.string(),
    company: z.string().optional(),
    status: z
      .enum(["draft", "sent", "viewed", "accepted", "rejected"])
      .optional(),
    subtotal: z.number(),
    tax: z.number().optional(),
    total: z.number(),
    items: z.string(),
    notes: z.string().optional(),
    expiresAt: z.string().optional(),
    viewedAt: z.string().optional(),
    acceptedAt: z.string().optional(),
  }),
  create: async data => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [result] = await db.insert(quotes).values({
      ...data,
      userId: data.userId ?? null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      viewedAt: data.viewedAt ? new Date(data.viewedAt) : undefined,
      acceptedAt: data.acceptedAt ? new Date(data.acceptedAt) : undefined,
    });
    return { id: (result as { insertId: number }).insertId, ...data };
  },
  teardown: async record => deleteById(quotes, record.id as number),
});

export const factories = {
  users: User,
  subscriptions: Subscription,
  payments: Payment,
  blogArticles: BlogArticle,
  blogComments: BlogComment,
  contactSubmissions: ContactSubmission,
  newsletterSubscribers: NewsletterSubscriber,
  newsletterTemplates: NewsletterTemplate,
  newsletterCampaigns: NewsletterCampaign,
  newsletterEvents: NewsletterEvent,
  statusIncidents: StatusIncident,
  maintenanceSchedule: MaintenanceScheduleEntry,
  cartItems: CartItem,
  orders: Order,
  orderItems: OrderItem,
  quotes: Quote,
};
