import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import {
  subscribeToNewsletter,
  verifyNewsletterSubscription,
  unsubscribeFromNewsletter,
  unsubscribeWithToken,
  getActiveSubscribers,
  getSubscriberByEmail,
  getSubscriberCountByStatus,
  createNewsletterCampaign,
  getNewsletterCampaigns,
  getCampaignById,
  updateCampaignStatus,
  createNewsletterTemplate,
  getNewsletterTemplates,
  getTemplateById,
  getCampaignStats,
  getNewsletterStats,
} from "./db";
import { sendNewsletterCampaign, sendVerificationEmail } from "./email-service";

export const newsletterRouter = router({
  // Subscribe to newsletter (public)
  subscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        name: z.string().optional(),
        source: z.string().default("website"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Check if already subscribed
        const existing = await getSubscriberByEmail(input.email);
        if (existing && existing.status === "subscribed") {
          return {
            success: false,
            message: "Email is already subscribed to our newsletter",
          };
        }

        // Subscribe
        const result = await subscribeToNewsletter(
          input.email,
          input.name,
          input.source
        );

        // Send verification email
        await sendVerificationEmail(input.email, input.name || "Subscriber");

        return {
          success: true,
          message:
            "Successfully subscribed! Check your email for confirmation.",
        };
      } catch (error) {
        console.error("Error subscribing to newsletter:", error);
        throw new Error("Failed to subscribe to newsletter");
      }
    }),

  // Verify newsletter subscription
  verify: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const subscriber = await verifyNewsletterSubscription(input.token);
        return {
          success: true,
          message: "Email verified successfully!",
          email: subscriber.email,
        };
      } catch (error) {
        console.error("Error verifying newsletter subscription:", error);
        throw new Error("Invalid or expired verification link");
      }
    }),

  // Unsubscribe from newsletter (public)
  unsubscribe: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      try {
        await unsubscribeFromNewsletter(input.email);
        return {
          success: true,
          message: "Successfully unsubscribed from newsletter",
        };
      } catch (error) {
        console.error("Error unsubscribing from newsletter:", error);
        throw new Error("Failed to unsubscribe");
      }
    }),

  // Unsubscribe with token (public - for email links)
  unsubscribeWithToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const subscriber = await unsubscribeWithToken(input.token);
        return {
          success: true,
          message: "Successfully unsubscribed from newsletter",
          email: subscriber.email,
        };
      } catch (error) {
        console.error("Error unsubscribing with token:", error);
        throw new Error("Invalid or expired unsubscribe link");
      }
    }),

  // Get newsletter statistics (admin only)
  getStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new Error("Unauthorized");
    }

    try {
      const stats = await getNewsletterStats();
      return stats;
    } catch (error) {
      console.error("Error fetching newsletter stats:", error);
      throw new Error("Failed to fetch statistics");
    }
  }),

  // Get all subscribers (admin only)
  getSubscribers: protectedProcedure
    .input(z.object({ limit: z.number().default(100) }))
    .query(async ({ ctx, input }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }

      try {
        const subscribers = await getActiveSubscribers(input.limit);
        return subscribers;
      } catch (error) {
        console.error("Error fetching subscribers:", error);
        throw new Error("Failed to fetch subscribers");
      }
    }),

  // Create newsletter campaign (admin only)
  createCampaign: protectedProcedure
    .input(
      z.object({
        title: z.string().min(3, "Title must be at least 3 characters"),
        subject: z.string().min(5, "Subject must be at least 5 characters"),
        content: z.string().min(10, "Content must be at least 10 characters"),
        templateId: z.number().optional(),
        scheduledFor: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }

      try {
        const subscribers = await getActiveSubscribers();
        const result = await createNewsletterCampaign({
          title: input.title,
          subject: input.subject,
          content: input.content,
          templateId: input.templateId,
          status: input.scheduledFor ? "scheduled" : "draft",
          scheduledFor: input.scheduledFor,
          recipientCount: subscribers.length,
          createdBy: ctx.user.id,
        });

        return {
          success: true,
          message: "Campaign created successfully",
          campaignId: (result as any).insertId,
        };
      } catch (error) {
        console.error("Error creating campaign:", error);
        throw new Error("Failed to create campaign");
      }
    }),

  // Get all campaigns (admin only)
  getCampaigns: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }

      try {
        const campaigns = await getNewsletterCampaigns(input.limit);
        return campaigns;
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        throw new Error("Failed to fetch campaigns");
      }
    }),

  // Get campaign details (admin only)
  getCampaignDetails: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }

      try {
        const stats = await getCampaignStats(input.id);
        return stats;
      } catch (error) {
        console.error("Error fetching campaign details:", error);
        throw new Error("Failed to fetch campaign details");
      }
    }),

  // Send campaign (admin only)
  sendCampaign: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }

      try {
        const campaign = await getCampaignById(input.id);
        if (!campaign) {
          throw new Error("Campaign not found");
        }

        if (campaign.status !== "draft" && campaign.status !== "scheduled") {
          throw new Error("Campaign cannot be sent in its current status");
        }

        // Update campaign status to sending
        await updateCampaignStatus(input.id, "sending");

        // Send campaign to all active subscribers
        const subscribers = await getActiveSubscribers();
        const sentCount = await sendNewsletterCampaign(campaign, subscribers);

        // Update campaign with sent count
        await updateCampaignStatus(input.id, "sent");

        return {
          success: true,
          message: `Campaign sent to ${sentCount} subscribers`,
          sentCount,
        };
      } catch (error) {
        console.error("Error sending campaign:", error);
        // Update status to failed
        await updateCampaignStatus(input.id, "failed");
        throw new Error("Failed to send campaign");
      }
    }),

  // Create newsletter template (admin only)
  createTemplate: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3, "Name must be at least 3 characters"),
        description: z.string().optional(),
        content: z.string().min(10, "Content must be at least 10 characters"),
        category: z.string().default("general"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }

      try {
        const result = await createNewsletterTemplate({
          name: input.name,
          description: input.description,
          content: input.content,
          category: input.category,
          isDefault: false,
          createdBy: ctx.user.id,
        });

        return {
          success: true,
          message: "Template created successfully",
          templateId: (result as any).insertId,
        };
      } catch (error) {
        console.error("Error creating template:", error);
        throw new Error("Failed to create template");
      }
    }),

  // Get all templates (admin only)
  getTemplates: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }

      try {
        const templates = await getNewsletterTemplates(input.limit);
        return templates;
      } catch (error) {
        console.error("Error fetching templates:", error);
        throw new Error("Failed to fetch templates");
      }
    }),
});
