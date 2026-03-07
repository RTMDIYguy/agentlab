import Stripe from "stripe";
import { getPriceId, PlanId, BillingCycle } from "./products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

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
  const { userId, userEmail, userName, plan, billingCycle, successUrl, cancelUrl } = params;

  const priceId = getPriceId(plan, billingCycle);

  const session = await stripe.checkout.sessions.create({
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

/**
 * Retrieve a checkout session by ID
 */
export async function getCheckoutSession(sessionId: string) {
  return stripe.checkout.sessions.retrieve(sessionId);
}

/**
 * Retrieve subscription details
 */
export async function getSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.cancel(subscriptionId);
}
