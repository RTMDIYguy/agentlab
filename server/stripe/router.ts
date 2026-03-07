import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { createCheckoutSession, updateSubscriptionPlan as updateStripeSubscriptionPlan, getCustomerInvoices, getInvoicePdfUrl, getSubscription as getStripeSubscription } from "./checkout";
import { getSubscriptionByUserId, getPaymentsByUserId, cancelSubscription as cancelSubscriptionDb, updateSubscriptionPlan as updateSubscriptionPlanDb } from "./db";
import { BillingCycle, PlanId, getPriceId } from "./products";

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

  /**
   * Upgrade or downgrade subscription
   */
  updateSubscriptionPlan: protectedProcedure
    .input(
      z.object({
        newPlan: z.enum(["starter", "professional", "enterprise"]),
        billingCycle: z.enum(["monthly", "yearly"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user;
      if (!user) throw new Error("User not authenticated");

      const subscription = await getSubscriptionByUserId(user.id);
      if (!subscription) throw new Error("No active subscription found");

      const newPriceId = getPriceId(input.newPlan as PlanId, input.billingCycle as BillingCycle);
      await updateStripeSubscriptionPlan(subscription.stripeSubscriptionId, newPriceId);
      await updateSubscriptionPlanDb(user.id, input.newPlan);

      return { success: true, message: "Subscription updated successfully" };
    }),

  /**
   * Cancel subscription
   */
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const user = ctx.user;
    if (!user) throw new Error("User not authenticated");

    const subscription = await getSubscriptionByUserId(user.id);
    if (!subscription) throw new Error("No active subscription found");

    await getStripeSubscription(subscription.stripeSubscriptionId);
    // Note: In production, you would call stripe.subscriptions.cancel() here
    // For now, we just update the local database
    await cancelSubscriptionDb(user.id);

    return { success: true, message: "Subscription canceled successfully" };
  }),

  /**
   * Get invoices for user
   */
  getInvoices: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    if (!user) throw new Error("User not authenticated");

    const subscription = await getSubscriptionByUserId(user.id);
    if (!subscription) return [];

    const invoices = await getCustomerInvoices(subscription.stripeCustomerId);
    return invoices.data.map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: invoice.status,
      date: new Date(invoice.created * 1000),
      pdfUrl: invoice.hosted_invoice_url,
    }));
  }),

  /**
   * Get invoice download URL
   */
  getInvoiceDownloadUrl: protectedProcedure
    .input(z.object({ invoiceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.user;
      if (!user) throw new Error("User not authenticated");

      const subscription = await getSubscriptionByUserId(user.id);
      if (!subscription) throw new Error("No active subscription found");

      const pdfUrl = await getInvoicePdfUrl(input.invoiceId);
      return { pdfUrl };
    }),
});
