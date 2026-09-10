import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import * as schema from "../schema";
import { eq, sql, and } from "drizzle-orm";

export const discountRouter = router({
  /**
   * Validate a promo / discount / VIP code for any app surface
   */
  validate: publicProcedure
    .input(
      z.object({
        code: z.string().min(1).max(64),
        targetApp: z.enum(["all", "agentlab_os", "market_marksman", "pulse_social"]).default("all"),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database unavailable");
      }

      const normalizedCode = input.code.trim().toUpperCase();

      const [promo] = await db
        .select()
        .from(schema.discountCodes)
        .where(
          and(
            eq(schema.discountCodes.code, normalizedCode),
            eq(schema.discountCodes.isActive, true)
          )
        )
        .limit(1);

      if (!promo) {
        return {
          valid: false,
          error: "Invalid or expired promotion code",
        };
      }

      // Check target app compatibility
      if (promo.targetApp !== "all" && promo.targetApp !== input.targetApp) {
        return {
          valid: false,
          error: `This code is only valid for ${promo.targetApp.replace(/_/g, " ")}`,
        };
      }

      // Check expiration
      if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
        return {
          valid: false,
          error: "This promotion code has expired",
        };
      }

      // Check max redemptions
      if (promo.maxRedemptions && promo.timesRedeemed >= promo.maxRedemptions) {
        return {
          valid: false,
          error: "This promotion code has reached its maximum redemptions limit",
        };
      }

      return {
        valid: true,
        code: promo.code,
        campaignName: promo.campaignName,
        discountType: promo.discountType, // 'percent_off' | 'amount_off' | 'vip_bypass' | 'extended_trial'
        discountValue: Number(promo.discountValue),
        targetApp: promo.targetApp,
        stripePromoId: promo.stripePromoId,
      };
    }),

  /**
   * Redeem a promo / VIP code
   */
  redeem: publicProcedure
    .input(
      z.object({
        code: z.string().min(1).max(64),
        targetApp: z.enum(["all", "agentlab_os", "market_marksman", "pulse_social"]).default("all"),
        userEmail: z.string().email(),
        metadata: z.record(z.any()).optional().default({}),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database unavailable");
      }

      const normalizedCode = input.code.trim().toUpperCase();

      const [promo] = await db
        .select()
        .from(schema.discountCodes)
        .where(
          and(
            eq(schema.discountCodes.code, normalizedCode),
            eq(schema.discountCodes.isActive, true)
          )
        )
        .limit(1);

      if (!promo) {
        throw new Error("Invalid or inactive promotion code");
      }

      if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
        throw new Error("This promotion code has expired");
      }

      if (promo.maxRedemptions && promo.timesRedeemed >= promo.maxRedemptions) {
        throw new Error("This promotion code has reached its maximum redemptions limit");
      }

      // Record redemption
      await db.insert(schema.discountRedemptions).values({
        discountCodeId: promo.id,
        userId: ctx.user?.id || null,
        userEmail: input.userEmail.toLowerCase(),
        targetApp: input.targetApp,
        metadata: input.metadata,
      });

      // Increment count
      await db
        .update(schema.discountCodes)
        .set({
          timesRedeemed: promo.timesRedeemed + 1,
          updatedAt: new Date(),
        })
        .where(eq(schema.discountCodes.id, promo.id));

      return {
        success: true,
        campaignName: promo.campaignName,
        discountType: promo.discountType,
        discountValue: Number(promo.discountValue),
        unlocked: promo.discountType === "vip_bypass" || Number(promo.discountValue) === 100,
      };
    }),

  /**
   * List all campaign codes (Admin only)
   */
  listCampaigns: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    return db
      .select()
      .from(schema.discountCodes)
      .orderBy(sql`${schema.discountCodes.createdAt} DESC`);
  }),

  /**
   * Create a new campaign code (Admin only)
   */
  createCampaign: protectedProcedure
    .input(
      z.object({
        code: z.string().min(2).max(64),
        campaignName: z.string().min(2).max(128),
        discountType: z.enum(["percent_off", "amount_off", "vip_bypass", "extended_trial"]),
        discountValue: z.number().min(0),
        targetApp: z.enum(["all", "agentlab_os", "market_marksman", "pulse_social"]).default("all"),
        stripePromoId: z.string().optional(),
        maxRedemptions: z.number().int().positive().optional(),
        expiresAt: z.string().datetime().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const [created] = await db
        .insert(schema.discountCodes)
        .values({
          code: input.code.trim().toUpperCase(),
          campaignName: input.campaignName,
          discountType: input.discountType,
          discountValue: input.discountValue.toString(),
          targetApp: input.targetApp,
          stripePromoId: input.stripePromoId || null,
          maxRedemptions: input.maxRedemptions || null,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
          isActive: true,
        })
        .returning();

      return created;
    }),
});
