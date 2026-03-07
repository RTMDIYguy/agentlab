import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { createCheckoutSession } from "./checkout";
import { getSubscriptionByUserId, getPaymentsByUserId } from "./db";
import { BillingCycle, PlanId } from "./products";

export const stripeRouter = router({
  /**
   * Create a checkout session for subscription purchase
   */
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        plan: z.enum(["starter", "professional", "enterprise"]),
        billingCycle: z.enum(["monthly", "yearly"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user;
      if (!user) throw new Error("User not authenticated");

      // Get origin from request headers
      const origin = ctx.req.headers.origin || "https://agentlab.manus.space";

      const checkoutUrl = await createCheckoutSession({
        userId: user.id,
        userEmail: user.email || "",
        userName: user.name || "User",
        plan: input.plan as PlanId,
        billingCycle: input.billingCycle as BillingCycle,
        successUrl: `${origin}/dashboard?success=true`,
        cancelUrl: `${origin}/?canceled=true`,
      });

      return { checkoutUrl };
    }),

  /**
   * Get current subscription for user
   */
  getCurrentSubscription: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    if (!user) throw new Error("User not authenticated");

    const subscription = await getSubscriptionByUserId(user.id);
    return subscription || null;
  }),

  /**
   * Get payment history for user
   */
  getPaymentHistory: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    if (!user) throw new Error("User not authenticated");

    const payments = await getPaymentsByUserId(user.id);
    return payments;
  }),
});
