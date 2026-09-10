import { Request, Response } from "express";
import { getDb } from "../db";
import * as schema from "../schema";
import { eq, and } from "drizzle-orm";

/**
 * REST endpoint: Validate a promo / discount / VIP code
 * POST /api/discounts/validate
 */
export async function validateDiscountCode(req: Request, res: Response) {
  try {
    const { code, targetApp = "all" } = req.body;
    if (!code || typeof code !== "string") {
      return res.status(400).json({ valid: false, error: "Discount code is required" });
    }

    const db = await getDb();
    if (!db) {
      return res.status(503).json({ valid: false, error: "Database unavailable" });
    }

    const normalizedCode = code.trim().toUpperCase();

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
      return res.status(404).json({ valid: false, error: "Invalid or expired promotion code" });
    }

    if (promo.targetApp !== "all" && promo.targetApp !== targetApp) {
      return res.status(400).json({
        valid: false,
        error: `This code is valid exclusively for ${promo.targetApp.replace(/_/g, " ")}`,
      });
    }

    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return res.status(400).json({ valid: false, error: "This promotion code has expired" });
    }

    if (promo.maxRedemptions && promo.timesRedeemed >= promo.maxRedemptions) {
      return res.status(400).json({ valid: false, error: "This code has reached maximum redemption limit" });
    }

    return res.status(200).json({
      valid: true,
      code: promo.code,
      campaignName: promo.campaignName,
      discountType: promo.discountType,
      discountValue: Number(promo.discountValue),
      targetApp: promo.targetApp,
      stripePromoId: promo.stripePromoId,
    });
  } catch (error: any) {
    console.error("[Discount API] Validate Error:", error);
    return res.status(500).json({ valid: false, error: error.message || "Internal server error" });
  }
}

/**
 * REST endpoint: Redeem a promo / discount / VIP code
 * POST /api/discounts/redeem
 */
export async function redeemDiscountCode(req: Request, res: Response) {
  try {
    const { code, targetApp = "all", userEmail, metadata = {} } = req.body;
    if (!code || !userEmail) {
      return res.status(400).json({ success: false, error: "Code and userEmail are required" });
    }

    const db = await getDb();
    if (!db) {
      return res.status(503).json({ success: false, error: "Database unavailable" });
    }

    const normalizedCode = code.trim().toUpperCase();

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
      return res.status(404).json({ success: false, error: "Invalid promotion code" });
    }

    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return res.status(400).json({ success: false, error: "Promotion code has expired" });
    }

    if (promo.maxRedemptions && promo.timesRedeemed >= promo.maxRedemptions) {
      return res.status(400).json({ success: false, error: "Maximum redemptions limit reached" });
    }

    // Insert redemption record
    await db.insert(schema.discountRedemptions).values({
      discountCodeId: promo.id,
      userEmail: userEmail.toLowerCase(),
      targetApp,
      metadata,
    });

    // Increment counter
    await db
      .update(schema.discountCodes)
      .set({
        timesRedeemed: promo.timesRedeemed + 1,
        updatedAt: new Date(),
      })
      .where(eq(schema.discountCodes.id, promo.id));

    return res.status(200).json({
      success: true,
      campaignName: promo.campaignName,
      discountType: promo.discountType,
      discountValue: Number(promo.discountValue),
      unlocked: promo.discountType === "vip_bypass" || Number(promo.discountValue) === 100,
    });
  } catch (error: any) {
    console.error("[Discount API] Redeem Error:", error);
    return res.status(500).json({ success: false, error: error.message || "Internal server error" });
  }
}
