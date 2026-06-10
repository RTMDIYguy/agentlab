import Stripe from "stripe";
import { getPriceId, PlanId, BillingCycle } from "./products";

let stripeClient: Stripe | null = null;

function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key is not configured");
  }

  stripeClient ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripeClient;
}

export interface CreateCheckoutSessionParams {
  userId: number;
  userEmail: string;
  userName: string;
  plan: PlanId;
  billingCycle: BillingCycle;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Create a Stripe checkout session for subscription
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<string> {
  const {
    userId,
    userEmail,
    userName,
    plan,
    billingCycle,
    successUrl,
    cancelUrl,
  } = params;

  const priceId = getPriceId(plan, billingCycle);

  const session = await getStripeClient().checkout.sessions.create({
    customer_email: userEmail,
    client_reference_id: userId.toString(),
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    metadata: {
      user_id: userId.toString(),
      customer_email: userEmail,
      customer_name: userName,
      plan,
      billing_cycle: billingCycle,
    },
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session: no URL returned");
  }

  return session.url;
}

export interface CreateOneTimeCheckoutSessionParams {
  userId?: number;
  userEmail?: string;
  userName?: string;
  product?: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Create a Stripe checkout session for a one-time payment (e.g. book purchase)
 */
export async function createOneTimeCheckoutSession(
  params: CreateOneTimeCheckoutSessionParams
): Promise<string> {
  const {
    userId,
    userEmail,
    userName,
    product = "one_time",
    priceId,
    successUrl,
    cancelUrl,
  } = params;

  const session = await getStripeClient().checkout.sessions.create({
    ...(userEmail ? { customer_email: userEmail } : {}),
    ...(userId ? { client_reference_id: userId.toString() } : {}),
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    metadata: {
      product,
      ...(userId ? { user_id: userId.toString() } : {}),
      ...(userEmail ? { customer_email: userEmail } : {}),
      ...(userName ? { customer_name: userName } : {}),
    },
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session: no URL returned");
  }

  return session.url;
}

/**
 * Retrieve a checkout session by ID
 */
export async function getCheckoutSession(sessionId: string) {
  return getStripeClient().checkout.sessions.retrieve(sessionId);
}

/**
 * Retrieve subscription details
 */
export async function getSubscription(subscriptionId: string) {
  return getStripeClient().subscriptions.retrieve(subscriptionId);
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  return getStripeClient().subscriptions.cancel(subscriptionId);
}

/**
 * Update subscription to a new plan
 */
export async function updateSubscriptionPlan(
  subscriptionId: string,
  newPriceId: string
) {
  const subscription =
    await getStripeClient().subscriptions.retrieve(subscriptionId);

  if (!subscription.items.data[0]) {
    throw new Error("Subscription has no items");
  }

  return getStripeClient().subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
  });
}

/**
 * Get customer invoices
 */
export async function getCustomerInvoices(customerId: string) {
  return getStripeClient().invoices.list({
    customer: customerId,
    limit: 100,
  });
}

/**
 * Get invoice PDF URL
 */
export async function getInvoicePdfUrl(invoiceId: string) {
  const invoice = await getStripeClient().invoices.retrieve(invoiceId);
  return invoice.hosted_invoice_url;
}

/**
 * Get customer by ID
 */
export async function getCustomer(customerId: string) {
  return getStripeClient().customers.retrieve(customerId);
}
