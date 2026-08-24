import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import {
  createCheckoutSession,
  createOneTimeCheckoutSession,
  updateSubscriptionPlan as updateStripeSubscriptionPlan,
  getCustomerInvoices,
  getInvoicePdfUrl,
  getSubscription as getStripeSubscription,
} from "./checkout";
import {
  getSubscriptionByUserId,
  getPaymentsByUserId,
  cancelSubscription as cancelSubscriptionDb,
  updateSubscriptionPlan as updateSubscriptionPlanDb,
} from "./db";
import { BillingCycle, PlanId, getPriceId } from "./products";

// Book price ID lives server-side only — never expose in client bundles
const BOOK_PRICE_ID = "price_1TgRz4GmUFddSefto4jcH4Jv";
const BOOTCAMP_PRICE_ID = process.env.STRIPE_BOOTCAMP_PRICE_ID || "";

export const stripeRouter = router({
  /**
   * Create a checkout session for one-time book purchase ($59.99)
   * Price ID is kept server-side only for security.
   */
  createBookCheckout: publicProcedure.mutation(async ({ ctx }) => {
    const user = ctx.user;
    const origin = ctx.req.headers.origin || "https://agentlab.manus.space";

    const checkoutUrl = await createOneTimeCheckoutSession({
      userId: user?.id,
      userEmail: user?.email || undefined,
      userName: user?.name || undefined,
      product: "book",
      priceId: BOOK_PRICE_ID,
      successUrl: `${origin}/book?success=true`,
      cancelUrl: `${origin}/book?canceled=true`,
    });

    return { checkoutUrl };
  }),

  /**
   * Create a checkout session for the entry-level $1 bootcamp.
   */
  createBootcampCheckout: publicProcedure.mutation(async ({ ctx }) => {
    if (!BOOTCAMP_PRICE_ID) {
      throw new Error("Bootcamp checkout is not configured yet.");
    }

    const user = ctx.user;
    const origin = ctx.req.headers.origin || "https://agentlab.manus.space";

    const checkoutUrl = await createOneTimeCheckoutSession({
      userId: user?.id,
      userEmail: user?.email || undefined,
      userName: user?.name || undefined,
      product: "bootcamp",
      priceId: BOOTCAMP_PRICE_ID,
      successUrl: `${origin}/bootcamp?success=true`,
      cancelUrl: `${origin}/bootcamp?canceled=true`,
    });

    return { checkoutUrl };
  }),

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

      const newPriceId = getPriceId(
        input.newPlan as PlanId,
        input.billingCycle as BillingCycle
      );
      await updateStripeSubscriptionPlan(
        subscription.stripeSubscriptionId,
        newPriceId
      );
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
    return invoices.data.map(invoice => ({
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

/**
 * Admin procedures for analytics and customer management
 */
export const adminRouter = router({
  /**
   * Get subscription analytics (admin only)
   */
  getAnalytics: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    if (!user || user.role !== "admin")
      throw new Error("Admin access required");

    const {
      getSubscriptionCountByStatus,
      calculateMRR,
      getChurnRate,
      getTotalRevenue,
    } = await import("./db");

    const [statusCounts, mrr, churnRate, totalRevenue] = await Promise.all([
      getSubscriptionCountByStatus(),
      calculateMRR(),
      getChurnRate(),
      getTotalRevenue(),
    ]);

    return {
      subscriptionCounts: statusCounts,
      mrr,
      churnRate,
      totalRevenue,
      timestamp: new Date(),
    };
  }),

  /**
   * Get all customers with subscriptions (admin only)
   */
  getAllCustomers: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    if (!user || user.role !== "admin")
      throw new Error("Admin access required");

    const { getAllCustomersWithSubscriptions } = await import("./db");
    return getAllCustomersWithSubscriptions();
  }),

  /**
   * Get customer details (admin only)
   */
  getCustomerDetails: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.user;
      if (!user || user.role !== "admin")
        throw new Error("Admin access required");

      const { getCustomerWithSubscription } = await import("./db");
      return getCustomerWithSubscription(input.userId);
    }),

  /**
   * Update customer subscription status (admin only)
   */
  updateCustomerStatus: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        newStatus: z.enum(["active", "canceled", "past_due"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user;
      if (!user || user.role !== "admin")
        throw new Error("Admin access required");

      const { updateCustomerSubscriptionStatus } = await import("./db");
      await updateCustomerSubscriptionStatus(input.userId, input.newStatus);

      return { success: true, message: "Customer status updated" };
    }),
});
