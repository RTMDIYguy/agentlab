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
