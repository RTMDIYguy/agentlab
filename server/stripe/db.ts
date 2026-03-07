import { eq } from "drizzle-orm";
import { subscriptions, payments, InsertSubscription, InsertPayment } from "../../drizzle/schema";
import { getDb } from "../db";

/**
 * Create or update a subscription record
 */
export async function upsertSubscription(data: InsertSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, data.stripeSubscriptionId!))
    .limit(1);

  if (existing.length > 0) {
    // Update existing
    return db
      .update(subscriptions)
      .set(data)
      .where(eq(subscriptions.stripeSubscriptionId, data.stripeSubscriptionId!));
  } else {
    // Insert new
    return db.insert(subscriptions).values(data);
  }
}

/**
 * Get subscription by Stripe subscription ID
 */
export async function getSubscriptionByStripeId(stripeSubscriptionId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Get subscription by user ID
 */
export async function getSubscriptionByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Create a payment record
 */
export async function createPayment(data: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(payments).values(data);
}

/**
 * Get payment by Stripe payment intent ID
 */
export async function getPaymentByStripeId(stripePaymentIntentId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(payments)
    .where(eq(payments.stripePaymentIntentId, stripePaymentIntentId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Get all payments for a user
 */
export async function getPaymentsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(payments)
    .where(eq(payments.userId, userId))
    .orderBy(payments.createdAt);
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(stripePaymentIntentId: string, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(payments)
    .set({ status })
    .where(eq(payments.stripePaymentIntentId, stripePaymentIntentId));
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(subscriptions)
    .set({ status: "canceled", canceledAt: new Date() })
    .where(eq(subscriptions.userId, userId));
}

/**
 * Update subscription plan
 */
export async function updateSubscriptionPlan(userId: number, newPlan: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(subscriptions)
    .set({ plan: newPlan })
    .where(eq(subscriptions.userId, userId));
}


/**
 * Get all subscriptions (admin only)
 */
export async function getAllSubscriptions() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(subscriptions);
}

/**
 * Get subscription count by status
 */
export async function getSubscriptionCountByStatus() {
  const db = await getDb();
  if (!db) return {};

  const allSubs = await db.select().from(subscriptions);
  
  const counts = {
    active: 0,
    canceled: 0,
    past_due: 0,
  };

  allSubs.forEach((sub) => {
    if (sub.status in counts) {
      counts[sub.status as keyof typeof counts]++;
    }
  });

  return counts;
}

/**
 * Get monthly recurring revenue (MRR)
 */
export async function calculateMRR() {
  const db = await getDb();
  if (!db) return 0;

  const activeSubs = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.status, "active"));

  // This is a simplified calculation - in production you'd fetch actual prices from Stripe
  let mrr = 0;
  activeSubs.forEach((sub) => {
    const basePrice = sub.plan === "starter" ? 40 : sub.plan === "professional" ? 199 : 599;
    mrr += basePrice;
  });

  return mrr;
}

/**
 * Get churn rate (canceled subscriptions in last 30 days)
 */
export async function getChurnRate() {
  const db = await getDb();
  if (!db) return 0;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const canceledSubs = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.status, "canceled"));

  const recentCancellations = canceledSubs.filter(
    (sub) => sub.canceledAt && new Date(sub.canceledAt) > thirtyDaysAgo
  );

  return recentCancellations.length;
}

/**
 * Get total revenue
 */
export async function getTotalRevenue() {
  const db = await getDb();
  if (!db) return 0;

  const allPayments = await db.select().from(payments);
  
  return allPayments.reduce((total, payment) => {
    const amount = typeof payment.amount === "number" ? payment.amount : 0;
    return total + (payment.status === "succeeded" ? amount : 0);
  }, 0);
}

/**
 * Get customer details with subscription info
 */
export async function getCustomerWithSubscription(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const user = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  return user.length > 0 ? user[0] : null;
}

/**
 * Get all customers with subscription info
 */
export async function getAllCustomersWithSubscriptions() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(subscriptions);
}

/**
 * Update customer subscription status (admin)
 */
export async function updateCustomerSubscriptionStatus(userId: number, newStatus: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(subscriptions)
    .set({ status: newStatus })
    .where(eq(subscriptions.userId, userId));
}
