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
import {
  ensureKnowledgePackage,
} from "../controllers/marketplace";

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
 * Handle checkout session completed event.
 *
 * Provisions marketplace packages for BOTH session modes:
 * - subscription mode (session.subscription set) — recurring package plans
 * - payment mode (no subscription) — one-time package purchases
 *
 * Payment gating: a completed checkout with an unpaid session means an
 * async payment method (card later, bank transfer) that may still fail.
 * We never unlock on "unpaid"; checkout.session.async_payment_succeeded
 * re-enters this handler once the money actually lands.
 */
export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const metadata = session.metadata || {};
  const workspaceId = metadata.workspaceId;
  const packageId = metadata.packageId;

  if (!workspaceId || !packageId) {
    // Plan/book checkouts carry different metadata — not a package unlock.
    console.error("[Webhook] Missing workspaceId or packageId in checkout session metadata");
    return;
  }

  if (
    session.payment_status !== "paid" &&
    session.payment_status !== "no_payment_required"
  ) {
    console.warn(
      `[Webhook] Session ${session.id} for package ${packageId} is ${session.payment_status}; ` +
        `not unlocking. Will provision on checkout.session.async_payment_succeeded if the payment clears.`
    );
    return;
  }

  // Subscription ID is nullable: one-time (mode "payment") sessions have
  // none, and workspace_packages.stripe_subscription_id accepts NULL.
  const subscriptionId =
    typeof session.subscription === "string" ? session.subscription : null;

  const db = await getDb();
  if (!db) {
    console.error("[Webhook] Database unavailable");
    return;
  }

  try {
    // FK: workspace_packages.package_id references knowledge_packages.id.
    // Make sure the row exists so a paid unlock can never fail on a
    // package that was catalogued but never persisted.
    await ensureKnowledgePackage(db, packageId);

    await db.insert(workspacePackages).values({
      workspaceId,
      packageId,
      status: "active",
      stripeSubscriptionId: subscriptionId,
      unlockedAt: new Date(),
    }).onConflictDoUpdate({
      target: [workspacePackages.workspaceId, workspacePackages.packageId],
      set: {
        status: "active",
        stripeSubscriptionId: subscriptionId,
        unlockedAt: new Date(),
      },
    });

    console.log(
      `[Webhook] Package ${packageId} unlocked for workspace ${workspaceId}` +
        (subscriptionId ? ` with subscription ${subscriptionId}` : " (one-time payment)")
    );
  } catch (error: any) {
    console.error(
      `[Webhook] Failed to provision package ${packageId} for workspace ${workspaceId}:`,
      error?.message || error
    );
  }
}

/**
 * Subscription id from an invoice — handles both the legacy
 * `invoice.subscription` and the newer `invoice.parent.subscription_details`.
 */
function invoiceSubscriptionId(invoice: any): string | null {
  const raw =
    invoice?.parent?.subscription_details?.subscription ??
    invoice?.subscription ??
    null;
  if (typeof raw === "string") return raw;
  if (raw && typeof raw.id === "string") return raw.id;
  return null;
}

/**
 * Lifecycle transitions keyed by stripe_subscription_id — the honest
 * status trail for recurring package purchases:
 * renewal paid → active, renewal failed → past_due, canceled → canceled.
 */
async function setPackageStatusForSubscription(
  subscriptionId: string | null,
  status: "active" | "past_due" | "canceled",
  reason: string
): Promise<void> {
  if (!subscriptionId) {
    console.warn(`[Webhook] ${reason}: no subscription id on event; nothing to update.`);
    return;
  }
  const db = await getDb();
  if (!db) {
    console.error("[Webhook] Database unavailable");
    return;
  }
  try {
    const updated = await db
      .update(workspacePackages)
      .set({ status })
      .where(eq(workspacePackages.stripeSubscriptionId, subscriptionId))
      .returning({ packageId: workspacePackages.packageId });
    if (updated.length === 0) {
      console.warn(
        `[Webhook] ${reason}: no workspace_packages row for subscription ${subscriptionId}; nothing to update.`
      );
    } else {
      console.log(
        `[Webhook] ${reason}: ${updated.map(r => r.packageId).join(", ")} → ${status} (subscription ${subscriptionId})`
      );
    }
  } catch (error: any) {
    console.error(`[Webhook] ${reason} update failed:`, error?.message || error);
  }
}

/** Recurring payment failed — package goes past_due, never silently active. */
export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  await setPackageStatusForSubscription(
    invoiceSubscriptionId(invoice),
    "past_due",
    "invoice.payment_failed"
  );
}

/** Renewal (or any subscription invoice) paid — package is active again. */
export async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  await setPackageStatusForSubscription(
    invoiceSubscriptionId(invoice),
    "active",
    "invoice.payment_succeeded"
  );
}

/** Subscription ended (canceled, expired, non-renewing) — package canceled. */
export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  await setPackageStatusForSubscription(
    subscription.id || null,
    "canceled",
    "customer.subscription.deleted"
  );
}
