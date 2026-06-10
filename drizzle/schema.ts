import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Stripe subscription tracking
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }).notNull().unique(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }).notNull(),
  plan: varchar("plan", { length: 64 }).notNull(), // 'starter', 'professional', 'enterprise'
  status: varchar("status", { length: 64 }).notNull(), // 'active', 'canceled', 'past_due', etc.
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  canceledAt: timestamp("canceledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// Payment history tracking
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }).notNull().unique(),
  stripeInvoiceId: varchar("stripeInvoiceId", { length: 255 }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("usd").notNull(),
  status: varchar("status", { length: 64 }).notNull(), // 'succeeded', 'failed', 'processing'
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
// Blog comments for user engagement
export const blogComments = mysqlTable("blogComments", {
  id: int("id").autoincrement().primaryKey(),
  articleId: varchar("articleId", { length: 255 }).notNull(), // Article ID from blog data
  userId: int("userId").notNull(), // User who posted the comment
  parentCommentId: int("parentCommentId"), // Parent comment ID for threaded replies (null for top-level)
  content: text("content").notNull(), // Comment text
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("approved").notNull(), // Moderation status
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BlogComment = typeof blogComments.$inferSelect;
export type InsertBlogComment = typeof blogComments.$inferInsert;

// Blog articles with publishing and scheduling support
export const blogArticles = mysqlTable("blogArticles", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(), // URL-friendly slug
  title: varchar("title", { length: 255 }).notNull(),
  excerpt: text("excerpt"), // Short description for listings
  content: text("content").notNull(), // Full article content (markdown)
  category: varchar("category", { length: 100 }).default("General").notNull(),
  authorId: int("authorId").notNull(), // User who wrote the article
  status: mysqlEnum("status", ["draft", "scheduled", "published"]).default("draft").notNull(),
  publishedAt: timestamp("publishedAt"), // When article was/will be published
  scheduledFor: timestamp("scheduledFor"), // When to publish (for scheduled posts)
  featuredImage: varchar("featuredImage", { length: 500 }), // Featured image URL
  views: int("views").default(0).notNull(), // View count
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BlogArticle = typeof blogArticles.$inferSelect;
export type InsertBlogArticle = typeof blogArticles.$inferInsert;

// Contact form submissions
export const contactSubmissions = mysqlTable("contactSubmissions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["new", "read", "responded"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  respondedAt: timestamp("respondedAt"),
});

export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = typeof contactSubmissions.$inferInsert;

// System status incidents
export const statusIncidents = mysqlTable("statusIncidents", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  status: mysqlEnum("status", ["investigating", "identified", "monitoring", "resolved"]).default("investigating").notNull(),
  severity: mysqlEnum("severity", ["minor", "major", "critical"]).default("major").notNull(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StatusIncident = typeof statusIncidents.$inferSelect;
export type InsertStatusIncident = typeof statusIncidents.$inferInsert;

// System maintenance schedule
export const maintenanceSchedule = mysqlTable("maintenanceSchedule", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  scheduledStart: timestamp("scheduledStart").notNull(),
  scheduledEnd: timestamp("scheduledEnd").notNull(),
  status: mysqlEnum("status", ["scheduled", "in_progress", "completed", "cancelled"]).default("scheduled").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MaintenanceSchedule = typeof maintenanceSchedule.$inferSelect;
export type InsertMaintenanceSchedule = typeof maintenanceSchedule.$inferInsert;

// Newsletter subscribers
export const newsletterSubscribers = mysqlTable("newsletterSubscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  status: mysqlEnum("status", ["subscribed", "unsubscribed", "bounced", "complained"]).default("subscribed").notNull(),
  verificationToken: varchar("verificationToken", { length: 255 }),
  verifiedAt: timestamp("verifiedAt"),
  unsubscribeToken: varchar("unsubscribeToken", { length: 255 }).unique(),
  unsubscribedAt: timestamp("unsubscribedAt"),
  source: varchar("source", { length: 100 }).default("website").notNull(), // 'website', 'homepage', 'popup', 'import'
  tags: text("tags"), // JSON array of tags for segmentation
  preferences: text("preferences"), // JSON object for email preferences
  lastEmailSentAt: timestamp("lastEmailSentAt"),
  bounceCount: int("bounceCount").default(0).notNull(),
  complaintCount: int("complaintCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;

// Newsletter campaigns
export const newsletterCampaigns = mysqlTable("newsletterCampaigns", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  content: text("content").notNull(), // HTML content
  templateId: int("templateId"),
  status: mysqlEnum("status", ["draft", "scheduled", "sending", "sent", "paused", "failed"]).default("draft").notNull(),
  recipientCount: int("recipientCount").default(0).notNull(),
  sentCount: int("sentCount").default(0).notNull(),
  openCount: int("openCount").default(0).notNull(),
  clickCount: int("clickCount").default(0).notNull(),
  bounceCount: int("bounceCount").default(0).notNull(),
  complaintCount: int("complaintCount").default(0).notNull(),
  unsubscribeCount: int("unsubscribeCount").default(0).notNull(),
  scheduledFor: timestamp("scheduledFor"),
  sentAt: timestamp("sentAt"),
  createdBy: int("createdBy").notNull(), // User ID who created the campaign
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NewsletterCampaign = typeof newsletterCampaigns.$inferSelect;
export type InsertNewsletterCampaign = typeof newsletterCampaigns.$inferInsert;

// Newsletter templates
export const newsletterTemplates = mysqlTable("newsletterTemplates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  content: text("content").notNull(), // HTML template with placeholders
  previewUrl: varchar("previewUrl", { length: 500 }),
  category: varchar("category", { length: 100 }).default("general").notNull(),
  isDefault: boolean("isDefault").default(false).notNull(),
  createdBy: int("createdBy").notNull(), // User ID who created the template
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NewsletterTemplate = typeof newsletterTemplates.$inferSelect;
export type InsertNewsletterTemplate = typeof newsletterTemplates.$inferInsert;

// Newsletter campaign events (for tracking opens, clicks, bounces)
export const newsletterEvents = mysqlTable("newsletterEvents", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  subscriberId: int("subscriberId").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  eventType: mysqlEnum("eventType", ["sent", "open", "click", "bounce", "complaint", "unsubscribe"]).notNull(),
  linkUrl: varchar("linkUrl", { length: 500 }), // For click events
  metadata: text("metadata"), // JSON for additional data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NewsletterEvent = typeof newsletterEvents.$inferSelect;
export type InsertNewsletterEvent = typeof newsletterEvents.$inferInsert;


// Shopping cart items (temporary storage for quote building)
export const cartItems = mysqlTable("cartItems", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  department: varchar("department", { length: 64 }).notNull(), // 'marketing', 'sales', 'operations', 'finance'
  tier: varchar("tier", { length: 64 }).notNull(), // 'basic', 'professional', 'enterprise'
  monthlyPrice: int("monthlyPrice").notNull(), // Price in cents
  quantity: int("quantity").default(1).notNull(),
  metadata: text("metadata"), // JSON for additional workflow details
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

// Orders (completed purchases)
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  orderNumber: varchar("orderNumber", { length: 64 }).notNull().unique(), // Human-readable order ID
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }).unique(),
  paymentMethod: mysqlEnum("paymentMethod", ["stripe", "paypal"]).notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  subtotal: int("subtotal").notNull(), // Total before tax/fees in cents
  tax: int("tax").default(0).notNull(),
  total: int("total").notNull(), // Final amount in cents
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  billingEmail: varchar("billingEmail", { length: 320 }).notNull(),
  billingName: varchar("billingName", { length: 255 }).notNull(),
  billingAddress: text("billingAddress"), // JSON
  invoiceUrl: varchar("invoiceUrl", { length: 500 }), // Stripe invoice URL
  receiptUrl: varchar("receiptUrl", { length: 500 }), // Stripe receipt URL
  metadata: text("metadata"), // JSON for additional order data
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// Order line items (individual departments/tiers in an order)
export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  department: varchar("department", { length: 64 }).notNull(),
  tier: varchar("tier", { length: 64 }).notNull(),
  monthlyPrice: int("monthlyPrice").notNull(),
  quantity: int("quantity").default(1).notNull(),
  lineTotal: int("lineTotal").notNull(), // monthlyPrice * quantity
  metadata: text("metadata"), // JSON for workflow details
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// Quote requests (for tracking quote builder submissions)
export const quotes = mysqlTable("quotes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // Null if not authenticated
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }),
  status: mysqlEnum("status", ["draft", "sent", "viewed", "accepted", "rejected"]).default("draft").notNull(),
  subtotal: int("subtotal").notNull(),
  tax: int("tax").default(0).notNull(),
  total: int("total").notNull(),
  items: text("items").notNull(), // JSON array of quote items
  notes: text("notes"),
  expiresAt: timestamp("expiresAt"),
  viewedAt: timestamp("viewedAt"),
  acceptedAt: timestamp("acceptedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = typeof quotes.$inferInsert;
