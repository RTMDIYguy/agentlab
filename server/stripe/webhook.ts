import Stripe from "stripe";
import {
  upsertSubscription,
  getPaymentByStripeId,
  createPayment,
  updatePaymentStatus,
} from "./db";
import { users, workspacePackages } from "../schema";
import { eq } from "drizzle-orm";
import { getDb } from "../db";

const stripe = new Stripe((process.env.STRIPE_SECRET_KEY as string) || "sk_test_123");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

/**
 * Verify and construct Stripe webhook event
 */
export function constructWebhookEvent(body: Buffer, signature: string) {
  try {
    return stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    throw new Error(`Webhook signature verification failed: ${error}`);
  }
}

/**
 * Handle checkout session completed event
 */
export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const metadata = session.metadata || {};
  const workspaceId = metadata.workspaceId;
  const packageId = metadata.packageId;

  if (!workspaceId || !packageId) {
    console.error("[Webhook] Missing workspaceId or packageId in checkout session metadata");
    return;
  }

  // Get subscription details
  if (session.subscription && typeof session.subscription === "string") {
    const subscriptionId = session.subscription;

    const db = await getDb();
    if (!db) {
      console.error("[Webhook] Database unavailable");
      return;
    }

    await db.insert(workspacePackages).values({
      workspaceId,
      packageId,
      status: 'active',
      stripeSubscriptionId: subscriptionId,
      unlockedAt: new Date(),
    }).onConflictDoUpdate({
      target: [workspacePackages.workspaceId, workspacePackages.packageId],
      set: {
        status: 'active',
        stripeSubscriptionId: subscriptionId,
        unlockedAt: new Date(),
      }
    });

    console.log(
      `[Webhook] Package ${packageId} unlocked for workspace ${workspaceId} with subscription ${subscriptionId}`
    );
  }
}


