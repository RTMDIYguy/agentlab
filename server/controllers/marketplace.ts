import type { Request, Response } from "express";
import { eq, and } from "drizzle-orm";
import { getDb } from "../db";
import { knowledgePackages, workspacePackages } from "../schema";
import Stripe from "stripe";

export const CANONICAL_KNOWLEDGE_PACKAGES = [
  {
    id: "mkt-playbook",
    name: "Marketing (MKT) Playbook",
    description: "Unlock all 9 automated DAG workflows for lead generation, content syndication, email nurture, and polls.",
    departmentCode: "mkt",
    monthlyPrice: "99.00",
    stripeProductId: "prod_mkt_123",
    workflowsCount: 9,
    automationRate: "90%",
    cycleTimeReduction: "4.5 hrs/day",
    tags: ["Lead Gen", "Content", "Nurture", "DAG Orchestration"],
  },
  {
    id: "sal-playbook",
    name: "Sales (SAL) Playbook",
    description: "Automated proposal generation, contract onboarding, deal discount controls, and closing playbooks.",
    departmentCode: "sal",
    monthlyPrice: "149.00",
    stripeProductId: "prod_sal_456",
    workflowsCount: 6,
    automationRate: "85%",
    cycleTimeReduction: "6.0 hrs/deal",
    tags: ["Proposals", "Contracts", "Closing", "CRM Sync"],
  },
  {
    id: "ops-playbook",
    name: "Operations (OPS) Playbook",
    description: "Enterprise system governance, automated drift scanning, SOP version control, and infrastructure monitoring.",
    departmentCode: "ops",
    monthlyPrice: "199.00",
    stripeProductId: "prod_ops_789",
    workflowsCount: 8,
    automationRate: "95%",
    cycleTimeReduction: "8.0 hrs/wk",
    tags: ["Governance", "Drift Control", "SOPs", "SAIF Checks"],
  },
  {
    id: "fin-playbook",
    name: "Finance (FIN) Playbook",
    description: "Automated cash flow reconciliation, subscription margin tracking, runway forecasting, and invoice reconciliation.",
    departmentCode: "fin",
    monthlyPrice: "149.00",
    stripeProductId: "prod_fin_101",
    workflowsCount: 7,
    automationRate: "92%",
    cycleTimeReduction: "5.0 hrs/wk",
    tags: ["Cash Flow", "Margins", "Runway", "Invoicing"],
  },
  {
    id: "ful-playbook",
    name: "Fulfillment (FUL) Playbook",
    description: "Client delivery automation, milestone quality audits, autonomous sprint tracking, and proof capture.",
    departmentCode: "ful",
    monthlyPrice: "149.00",
    stripeProductId: "prod_ful_202",
    workflowsCount: 8,
    automationRate: "88%",
    cycleTimeReduction: "7.0 hrs/sprint",
    tags: ["Delivery", "Client Onboarding", "Milestones", "QA"],
  },
  {
    id: "cul-playbook",
    name: "Culture & Team (CUL) Playbook",
    description: "Servant leadership guardrails, operator onboarding checklists, performance calibration, and feedback loops.",
    departmentCode: "cul",
    monthlyPrice: "99.00",
    stripeProductId: "prod_cul_303",
    workflowsCount: 4,
    automationRate: "85%",
    cycleTimeReduction: "3.5 hrs/wk",
    tags: ["Servant Leadership", "Onboarding", "Culture"],
  },
  {
    id: "aft-playbook",
    name: "After-Sales & Retention (AFT) Playbook",
    description: "Churn prevention signal monitoring, quarterly business review synthesis, and customer advocacy funnels.",
    departmentCode: "aft",
    monthlyPrice: "99.00",
    stripeProductId: "prod_aft_404",
    workflowsCount: 3,
    automationRate: "88%",
    cycleTimeReduction: "4.0 hrs/client",
    tags: ["Retention", "QBRs", "Advocacy", "Churn Prevention"],
  },
];

export const CANONICAL_ECOSYSTEM_APPS = [
  {
    id: "app-market-marksman",
    category: "apps",
    name: "Market Marksman",
    provider: "URC Ecosystem Apps",
    type: "Predictive Opportunity App",
    status: "Live on Cloud Run",
    statusVariant: "default",
    price: "Included in OS",
    description: "Opportunity discovery and predictive deal signal briefs for identifying high-margin market wedges.",
    iconName: "Target",
    tags: ["Opportunities", "Deal Signals", "Sales Intelligence"],
    launchUrl: "https://market-marksman-718497644379.us-central1.run.app/",
    isExternal: true,
  },
  {
    id: "app-pulse-social",
    category: "apps",
    name: "Pulse Social",
    provider: "URC Ecosystem Apps",
    type: "Content Syndication Engine",
    status: "Live",
    statusVariant: "default",
    price: "Included in OS",
    description: "Automated social content generation, multi-channel syndication, and post scheduling engine.",
    iconName: "Share2",
    tags: ["Social Media", "LinkedIn", "Content Scheduling"],
    launchUrl: "https://pulse-social-agentlab-projects.vercel.app",
    isExternal: true,
  },
  {
    id: "app-leadpulse",
    category: "apps",
    name: "LeadPulse",
    provider: "URC Ecosystem Apps",
    type: "Lead Discovery & Enrichment",
    status: "Live on AI Studio",
    statusVariant: "default",
    price: "Included in OS",
    description: "Automated B2B lead discovery, contact scraping, and enrichment engine for founder-led outreach.",
    iconName: "TrendingUp",
    tags: ["Lead Gen", "Enrichment", "B2B Prospecting"],
    launchUrl: "https://leadpulse-ai-lead-accuracy-enrichment-engine.ai.studio/",
    isExternal: true,
  },
  {
    id: "pkg-founder-signal",
    category: "apps",
    name: "Founder Signal System",
    provider: "Uncle Robert Consulting",
    type: "Starter Marketing Sprint",
    status: "Live (Beta)",
    statusVariant: "secondary",
    price: "$1,000 one-time",
    description: "3–5 day turnkey starter marketing sprint: signal brief, message map, first content batch, and proof-capture loop.",
    iconName: "Zap",
    tags: ["Founder Marketing", "Starter Sprint", "Beta"],
    launchUrl: "/command-center",
  },
  {
    id: "app-consulting-gen",
    category: "apps",
    name: "Consulting Assessment Generator",
    provider: "URC Internal Tools",
    type: "Diagnostic Tool",
    status: "Live in OS",
    statusVariant: "default",
    price: "Advisory Tool",
    description: "Automated diagnostic questionnaire generator for client maturity assessment and gap analysis.",
    iconName: "FileText",
    tags: ["Consulting", "Diagnostic", "Assessment"],
    launchUrl: "/assessment-generator",
  },
  {
    id: "pkg-48hr-linkedin",
    category: "apps",
    name: "48-Hour LinkedIn Authority",
    provider: "URC Campaign Systems",
    type: "Campaign Package",
    status: "Live & Active",
    statusVariant: "default",
    price: "Included in OS",
    description: "Rapid authority-building sprint playbook with email nurture, n8n webhook automation, and live tracking sheets.",
    iconName: "Sparkles",
    tags: ["LinkedIn", "Authority", "Campaign", "n8n Tracker"],
    launchUrl: "https://docs.google.com/spreadsheets/d/1al0EOoZwFMJHIW4wCjMvZTAZgFxo9s7Nfq4dCMHXjYY/edit",
    isExternal: true,
  },
];

export const CANONICAL_BOOKS = [
  {
    id: "book-bgw",
    category: "books",
    name: "Bootstrapper's Guide to the World",
    author: "Robert T. McCarthy",
    price: "$59.99",
    rating: 5.0,
    format: "Digital Compendium / PDF & Notion",
    description: "The complete playbook of 28 bootstrapped business models, unit economics, and operational blueprints.",
    iconName: "BookOpen",
    tags: ["Bootstrapping", "Business Models", "Funnel Core"],
    actionUrl: "/book",
    actionLabel: "Read / Order Book",
  },
  {
    id: "book-soe",
    category: "books",
    name: "Startup Operational Excellence",
    author: "Robert T. McCarthy",
    price: "$19.99",
    rating: 5.0,
    format: "Digital Book & SOP Templates",
    description: "The definitive operating manual for eliminating informational drift, structuring teams, and scaling lean.",
    iconName: "BookOpen",
    tags: ["Operations", "Governance", "Lean Scale"],
    actionUrl: "https://gumroad.com",
    actionLabel: "Buy on Gumroad ($19.99)",
    isExternal: true,
  },
];

// In-memory fallback subscriptions map for resilient local dev
const inMemorySubscriptions = new Map<string, Set<string>>();

export async function getMarketplaceItems(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.workspaceId || "00000000-0000-0000-0000-000000000001";
    const db = await getDb();

    let unlockedPackageIds = new Set<string>();

    if (workspaceId === "00000000-0000-0000-0000-000000000000") {
      // God mode has all packages
      CANONICAL_KNOWLEDGE_PACKAGES.forEach(p => unlockedPackageIds.add(p.id));
    } else {
      if (db) {
        try {
          const subs = await db
            .select()
            .from(workspacePackages)
            .where(
              and(
                eq(workspacePackages.workspaceId, workspaceId),
                eq(workspacePackages.status, "active")
              )
            );
          subs.forEach(s => unlockedPackageIds.add(s.packageId));
        } catch (dbErr) {
          console.warn("[Marketplace] DB lookup error, falling back to memory:", dbErr);
        }
      }

      const memSubs = inMemorySubscriptions.get(workspaceId);
      if (memSubs) {
        memSubs.forEach(id => unlockedPackageIds.add(id));
      } else if (unlockedPackageIds.size === 0) {
        // Default seed MKT, SAL, and OPS for default workspace
        unlockedPackageIds.add("mkt-playbook");
        unlockedPackageIds.add("ops-playbook");
      }
    }

    const playbooks = CANONICAL_KNOWLEDGE_PACKAGES.map(pkg => ({
      id: pkg.id,
      category: "playbooks",
      name: pkg.name,
      department: `Dept ${pkg.departmentCode.toUpperCase()} • ${pkg.workflowsCount} DAG Workflows`,
      departmentCode: pkg.departmentCode,
      price: `$${pkg.monthlyPrice}/mo`,
      monthlyPrice: pkg.monthlyPrice,
      description: pkg.description,
      workflowsCount: pkg.workflowsCount,
      automationRate: pkg.automationRate,
      cycleTimeReduction: pkg.cycleTimeReduction,
      iconName: "Layers",
      tags: pkg.tags,
      isMounted: unlockedPackageIds.has(pkg.id),
      status: unlockedPackageIds.has(pkg.id) ? "Mounted & Active" : "Available to Mount",
      statusVariant: unlockedPackageIds.has(pkg.id) ? "default" : "outline",
    }));

    res.status(200).json({
      workspaceId,
      playbooks,
      apps: CANONICAL_ECOSYSTEM_APPS,
      books: CANONICAL_BOOKS,
      totalCount: playbooks.length + CANONICAL_ECOSYSTEM_APPS.length + CANONICAL_BOOKS.length,
      mountedCount: playbooks.filter(p => p.isMounted).length,
    });
  } catch (error: any) {
    console.error("[Marketplace Items Error]:", error);
    res.status(500).json({ error: "Failed to fetch marketplace items" });
  }
}

export async function mountPlaybook(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.workspaceId || "00000000-0000-0000-0000-000000000001";
    const { id } = req.params;

    const db = await getDb();
    if (db) {
      try {
        const existing = await db
          .select()
          .from(workspacePackages)
          .where(
            and(
              eq(workspacePackages.workspaceId, workspaceId),
              eq(workspacePackages.packageId, id)
            )
          )
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(workspacePackages)
            .set({ status: "active", unlockedAt: new Date() })
            .where(
              and(
                eq(workspacePackages.workspaceId, workspaceId),
                eq(workspacePackages.packageId, id)
              )
            );
        } else {
          // Ensure package exists in knowledgePackages
          const pkgCheck = await db
            .select()
            .from(knowledgePackages)
            .where(eq(knowledgePackages.id, id))
            .limit(1);

          if (pkgCheck.length === 0) {
            const match = CANONICAL_KNOWLEDGE_PACKAGES.find(p => p.id === id);
            if (match) {
              await db.insert(knowledgePackages).values({
                id: match.id,
                name: match.name,
                description: match.description,
                departmentCode: match.departmentCode,
                monthlyPrice: match.monthlyPrice,
                stripeProductId: match.stripeProductId,
              });
            }
          }

          await db.insert(workspacePackages).values({
            workspaceId,
            packageId: id,
            status: "active",
            unlockedAt: new Date(),
          });
        }
      } catch (dbErr) {
        console.warn("[Marketplace] DB mount error, caching in memory:", dbErr);
      }
    }

    if (!inMemorySubscriptions.has(workspaceId)) {
      inMemorySubscriptions.set(workspaceId, new Set<string>());
    }
    inMemorySubscriptions.get(workspaceId)!.add(id);

    res.status(200).json({
      success: true,
      message: `Playbook ${id} successfully mounted to workspace.`,
      packageId: id,
      workspaceId,
    });
  } catch (error: any) {
    console.error("[Marketplace Mount Error]:", error);
    res.status(500).json({ error: "Failed to mount playbook" });
  }
}

export async function unmountPlaybook(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.workspaceId || "00000000-0000-0000-0000-000000000001";
    const { id } = req.params;

    const db = await getDb();
    if (db) {
      try {
        await db
          .update(workspacePackages)
          .set({ status: "canceled" })
          .where(
            and(
              eq(workspacePackages.workspaceId, workspaceId),
              eq(workspacePackages.packageId, id)
            )
          );
      } catch (dbErr) {
        console.warn("[Marketplace] DB unmount error:", dbErr);
      }
    }

    if (inMemorySubscriptions.has(workspaceId)) {
      inMemorySubscriptions.get(workspaceId)!.delete(id);
    }

    res.status(200).json({
      success: true,
      message: `Playbook ${id} unmounted from workspace.`,
      packageId: id,
      workspaceId,
    });
  } catch (error: any) {
    console.error("[Marketplace Unmount Error]:", error);
    res.status(500).json({ error: "Failed to unmount playbook" });
  }
}

export async function getPackages(req: Request, res: Response): Promise<void> {
  return getMarketplaceItems(req, res);
}

export async function subscribeToPackage(req: Request, res: Response): Promise<void> {
  return mountPlaybook(req, res);
}
