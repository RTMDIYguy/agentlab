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
  userId: string;
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
  userId?: string;
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

// -----------------------------------------------------------------------------
// Marketplace package checkout (Phase 12)
// -----------------------------------------------------------------------------

export interface CreatePackageCheckoutSessionParams {
  workspaceId: string;
  packageId: string;
  productName: string;
  /** USD amount from knowledge_packages.monthly_price (0 = free, caller skips Stripe) */
  monthlyPrice: number;
  stripeProductId?: string | null;
  /** Explicit price override (request body or ops config) */
  priceId?: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Env overrides: STRIPE_PACKAGE_PRICE_ID_<SLUG> (per package) wins over
 * the global STRIPE_PACKAGE_PRICE_ID. Nothing here is ever sent to the client.
 */
function envPackagePriceId(packageId: string): string {
  const slug = packageId.toUpperCase().replace(/[^A-Z0-9]+/g, "_");
  return (
    process.env[`STRIPE_PACKAGE_PRICE_ID_${slug}`] ||
    process.env.STRIPE_PACKAGE_PRICE_ID ||
    ""
  );
}

/**
 * Resolve (or lazily create) the Stripe Price for a marketplace package.
 * Order: explicit priceId → env override → active price on the package's
 * Stripe product → create a monthly price on that product from monthlyPrice.
 * Products seeded in the catalog but missing from the live Stripe account
 * are created on demand, so a checkout never dead-ends on a placeholder id.
 */
async function resolvePackagePrice(
  stripe: Stripe,
  params: CreatePackageCheckoutSessionParams
): Promise<Stripe.Price> {
  if (params.priceId) return stripe.prices.retrieve(params.priceId);

  const envPrice = envPackagePriceId(params.packageId);
  if (envPrice) return stripe.prices.retrieve(envPrice);

  if (!params.stripeProductId) {
    throw new Error(
      `Package ${params.packageId} has no Stripe product configured ` +
        `(set knowledge_packages.stripe_product_id or STRIPE_PACKAGE_PRICE_ID).`
    );
  }

  // A product id that does not exist yet can surface as resource_missing
  // on the LIST call as well — treat that as "no prices yet" and fall
  // through to product creation below instead of failing the first-ever
  // checkout for a package nobody has cataloged at Stripe.
  let prices: { data: Stripe.Price[] };
  try {
    prices = await stripe.prices.list({
      product: params.stripeProductId,
      active: true,
      limit: 1,
    });
  } catch (err: any) {
    if (err?.code !== "resource_missing") throw err;
    prices = { data: [] };
  }
  if (prices.data.length > 0) return prices.data[0];

  if (!(params.monthlyPrice > 0)) {
    throw new Error(
      `Package ${params.packageId} has no configured price to charge.`
    );
  }

  // Product missing in this Stripe account (common with seeded catalog ids).
  let productId = params.stripeProductId;
  try {
    await stripe.products.retrieve(productId);
  } catch (err: any) {
    if (err?.code === "resource_missing" || err?.status === 404) {
      const product = await stripe.products.create({
        id: params.stripeProductId as string,
        name: params.productName,
        metadata: { source: "agentlab-marketplace" },
      });
      productId = product.id;
    } else {
      throw err;
    }
  }

  return stripe.prices.create({
    product: productId,
    currency: "usd",
    unit_amount: Math.round(params.monthlyPrice * 100),
    recurring: { interval: "month" },
    metadata: { packageId: params.packageId },
  });
}

/**
 * Create a Stripe Checkout Session for a marketplace package purchase.
 * The session metadata carries { workspaceId, packageId } — exactly what
 * server/stripe/webhook.ts reads to provision workspace_packages on payment.
 * Returns the hosted checkout URL.
 */
export async function createPackageCheckoutSession(
  params: CreatePackageCheckoutSessionParams
): Promise<string> {
  const stripe = getStripeClient();
  const price = await resolvePackagePrice(stripe, params);

  const session = await stripe.checkout.sessions.create({
    mode: price.type === "recurring" ? "subscription" : "payment",
    line_items: [{ price: price.id, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    client_reference_id: params.workspaceId,
    ...(params.customerEmail ? { customer_email: params.customerEmail } : {}),
    metadata: {
      workspaceId: params.workspaceId,
      packageId: params.packageId,
      source: "marketplace-subscribe",
    },
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session: no URL returned");
  }

  return session.url;
}
