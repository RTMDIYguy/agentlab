/**
 * Stripe Products Configuration
 * Define all pricing plans and their corresponding Stripe product/price IDs
 */

export const STRIPE_PRODUCTS = {
  starter: {
    id: "starter",
    name: "Starter",
    description: "Perfect for small teams and startups",
    monthlyPriceId: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || "",
    yearlyPriceId: process.env.STRIPE_STARTER_YEARLY_PRICE_ID || "",
    monthlyPrice: 40,
    yearlyPrice: 400,
    features: [
      "Up to 5 AI agents",
      "Basic automation workflows",
      "Email support",
      "Community access",
      "Monthly updates",
    ],
  },
  professional: {
    id: "professional",
    name: "Professional",
    description: "For growing businesses and teams",
    monthlyPriceId: process.env.STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID || "",
    yearlyPriceId: process.env.STRIPE_PROFESSIONAL_YEARLY_PRICE_ID || "",
    monthlyPrice: 199,
    yearlyPrice: 1990,
    features: [
      "Unlimited AI agents",
      "Advanced automation workflows",
      "Priority email & chat support",
      "Custom integrations",
      "Weekly updates",
      "Analytics dashboard",
    ],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations",
    monthlyPriceId: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || "",
    yearlyPriceId: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || "",
    monthlyPrice: 599,
    yearlyPrice: 5990,
    features: [
      "Unlimited everything",
      "Custom AI agent development",
      "24/7 dedicated support",
      "White-label options",
      "Real-time updates",
      "Advanced security features",
      "SLA guarantee",
    ],
  },
};

export type PlanId = keyof typeof STRIPE_PRODUCTS;
export type BillingCycle = "monthly" | "yearly";

export function getPriceId(plan: PlanId, cycle: BillingCycle): string {
  const product = STRIPE_PRODUCTS[plan];
  const priceId = cycle === "monthly" ? product.monthlyPriceId : product.yearlyPriceId;
  
  if (!priceId) {
    throw new Error(`Price ID not configured for ${plan} ${cycle} plan`);
  }
  
  return priceId;
}
