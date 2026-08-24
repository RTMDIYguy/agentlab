import type { Request, Response } from "express";
import { eq, and } from "drizzle-orm";
import { getDb } from "../db";
import { knowledgePackages, workspacePackages } from "../schema";
import Stripe from "stripe";

const DEFAULT_PACKAGES = [
  {
    id: "mkt-playbook",
    name: "Marketing Playbook",
    description:
      "Unlock the complete suite of Marketing (MKT) automated DAG workflows, lead gen, and content creation tools.",
    departmentCode: "mkt",
    monthlyPrice: "99.00",
    stripeProductId: "prod_mkt_123",
  },
  {
    id: "sal-playbook",
    name: "Sales Playbook",
    description:
      "Unlock the Sales (SAL) outreach, CRM sync, and qualification DAG workflows.",
    departmentCode: "sal",
    monthlyPrice: "149.00",
    stripeProductId: "prod_sal_456",
  },
  {
    id: "ops-playbook",
    name: "Operations Playbook",
    description:
      "Unlock the Operations (OPS) governance, change control, and system integrity workflows.",
    departmentCode: "ops",
    monthlyPrice: "199.00",
    stripeProductId: "prod_ops_789",
  },
];

export async function getPackages(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.workspaceId;
    if (!workspaceId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "Database unavailable" });
      return;
    }

    let catalog = await db.select().from(knowledgePackages);

    if (catalog.length === 0) {
      // Seed default packages
      await db.insert(knowledgePackages).values(DEFAULT_PACKAGES);
      catalog = await db.select().from(knowledgePackages);
    }

    const subscriptions = await db
      .select()
      .from(workspacePackages)
      .where(
        and(
          eq(workspacePackages.workspaceId, workspaceId),
          eq(workspacePackages.status, "active")
        )
      );

    const unlockedPackageIds = new Set(subscriptions.map((sub) => sub.packageId));

    const packagesWithStatus = catalog.map((pkg) => ({
      ...pkg,
      isUnlocked: unlockedPackageIds.has(pkg.id),
    }));

    res.status(200).json({
      packages: packagesWithStatus,
    });
  } catch (error) {
    console.error("[Marketplace Controller Error]:", error);
    res.status(500).json({ error: "Failed to fetch knowledge packages" });
  }
}

export async function subscribeToPackage(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const workspaceId = req.workspaceId;
    if (!workspaceId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { packageId } = req.params;

    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "Database unavailable" });
      return;
    }

    const pkgCheck = await db
      .select()
      .from(knowledgePackages)
      .where(eq(knowledgePackages.id, packageId))
      .limit(1);
    if (pkgCheck.length === 0) {
      res.status(404).json({ error: "Package not found" });
      return;
    }

    const existingSub = await db
      .select()
      .from(workspacePackages)
      .where(
        and(
          eq(workspacePackages.workspaceId, workspaceId),
          eq(workspacePackages.packageId, packageId)
        )
      )
      .limit(1);

    if (existingSub.length > 0) {
      if (existingSub[0].status === "active") {
        res.status(400).json({ error: "Already subscribed to this package" });
        return;
      }
    }

    if (process.env.STRIPE_SECRET_KEY && pkgCheck[0].stripeProductId) {
      // Create Stripe Checkout Session
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product: pkgCheck[0].stripeProductId,
              recurring: {
                interval: "month",
              },
              unit_amount: Math.round(parseFloat(pkgCheck[0].monthlyPrice) * 100),
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${req.protocol}://${req.get("host")}/marketplace?success=true`,
        cancel_url: `${req.protocol}://${req.get("host")}/marketplace?canceled=true`,
        metadata: {
          workspaceId,
          packageId,
        },
      });

      res.status(200).json({ checkoutUrl: session.url });
      return;
    } else {
      // Fallback: direct DB insert
      if (existingSub.length > 0) {
        await db
          .update(workspacePackages)
          .set({ status: "active", unlockedAt: new Date() })
          .where(
            and(
              eq(workspacePackages.workspaceId, workspaceId),
              eq(workspacePackages.packageId, packageId)
            )
          );
      } else {
        await db.insert(workspacePackages).values({
          workspaceId,
          packageId,
          status: "active",
          unlockedAt: new Date(),
        });
      }
    }

    res.status(200).json({
      message: "Successfully subscribed to package",
      packageId,
    });
  } catch (error) {
    console.error("[Marketplace Controller Error]:", error);
    res.status(500).json({ error: "Failed to subscribe to package" });
  }
}
