import Stripe from "stripe";
import { upsertSubscription, getPaymentByStripeId, createPayment, updatePaymentStatus } from "./db";
import { getUserByOpenId } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { getDb } from "../db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
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
export async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = parseInt(session.client_reference_id || "0");
  const metadata = session.metadata || {};

  if (!userId || userId === 0) {
    console.error("[Webhook] Invalid user ID in checkout session");
    return;
  }

  // Get subscription details
  if (session.subscription && typeof session.subscription === "string") {
    const subscription = await stripe.subscriptions.retrieve(session.subscription);

    // Extract plan from metadata
    const plan = metadata.plan || "starter";
    const billingCycle = metadata.billing_cycle || "monthly";

    // Store subscription in database
    await upsertSubscription({
      userId,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      plan,
      status: subscription.status,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
    });

    console.log(`[Webhook] Subscription created for user ${userId}: ${subscription.id}`);
  }
}

/**
 * Handle subscription updated event
 */
export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const stripeSubscriptionId = subscription.id;

  // Update subscription status in database
  await upsertSubscription({
    stripeSubscriptionId,
    stripeCustomerId: subscription.customer as string,
    userId: 0, // Will be overwritten by upsert
    plan: "starter", // Will be overwritten by upsert
    status: subscription.status,
    currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
    currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
    canceledAt: (subscription as any).canceled_at ? new Date((subscription as any).canceled_at * 1000) : null,
  });

  console.log(`[Webhook] Subscription updated: ${stripeSubscriptionId}`);
}

/**
 * Handle subscription deleted event
 */
export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const stripeSubscriptionId = subscription.id;

  // Update subscription status to canceled
  await upsertSubscription({
    stripeSubscriptionId,
    stripeCustomerId: subscription.customer as string,
    userId: 0, // Will be overwritten by upsert
    plan: "starter", // Will be overwritten by upsert
    status: "canceled",
    canceledAt: new Date(),
  });

  console.log(`[Webhook] Subscription deleted: ${stripeSubscriptionId}`);
}

/**
 * Handle payment intent succeeded event
 */
export async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const stripePaymentIntentId = paymentIntent.id;
  const metadata = paymentIntent.metadata || {};
  const userId = parseInt(metadata.user_id || "0");

  if (!userId || userId === 0) {
    console.error("[Webhook] Invalid user ID in payment intent");
    return;
  }

  // Check if payment already exists
  const existingPayment = await getPaymentByStripeId(stripePaymentIntentId);
  if (existingPayment) {
    // Update status
    await updatePaymentStatus(stripePaymentIntentId, "succeeded");
  } else {
    // Create new payment record
    await createPayment({
      userId,
      stripePaymentIntentId,
      stripeInvoiceId: (paymentIntent as any).invoice as string | undefined,
      amount: (paymentIntent.amount / 100).toString(), // Convert cents to dollars
      currency: paymentIntent.currency.toUpperCase(),
      status: "succeeded",
      description: paymentIntent.description || undefined,
    });
  }

  console.log(`[Webhook] Payment succeeded for user ${userId}: ${stripePaymentIntentId}`);
}

/**
 * Handle payment intent failed event
 */
export async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const stripePaymentIntentId = paymentIntent.id;
  const metadata = paymentIntent.metadata || {};
  const userId = parseInt(metadata.user_id || "0");

  if (!userId || userId === 0) {
    console.error("[Webhook] Invalid user ID in payment intent");
    return;
  }

  // Check if payment already exists
  const existingPayment = await getPaymentByStripeId(stripePaymentIntentId);
  if (existingPayment) {
    // Update status
    await updatePaymentStatus(stripePaymentIntentId, "failed");
  } else {
    // Create new payment record with failed status
    await createPayment({
      userId,
      stripePaymentIntentId,
      stripeInvoiceId: (paymentIntent as any).invoice as string | undefined,
      amount: (paymentIntent.amount / 100).toString(),
      currency: paymentIntent.currency.toUpperCase(),
      status: "failed",
      description: paymentIntent.description || undefined,
    });
  }

  console.log(`[Webhook] Payment failed for user ${userId}: ${stripePaymentIntentId}`);
}
