import { param } from "./params";
import type { Request, Response } from "express";
import { eq, and, sql } from "drizzle-orm";
import { getDb } from "../db";
import {
  knowledgePackages,
  workspacePackages,
  workflows,
  workflowSteps,
  auditLogs,
  betaEnrollments,
  betaXpEvents,
} from "../schema";
import Stripe from "stripe";
import { createPackageCheckoutSession } from "../stripe/checkout";

type Db = Awaited<ReturnType<typeof getDb>>;

// CC-2026-10-02-017 (dispositions 1 + 3): real identity and economy
// constants for the beta subsystem.
const GOD_WORKSPACE_ID = "00000000-0000-0000-0000-000000000000";
const DEFAULT_WORKSPACE_ID = "00000000-0000-0000-0000-000000000001";
// tenantMiddleware's legacy (no-Bearer) fallback assigns this placeholder
// email — it must never count as an authenticated identity.
const ANONYMOUS_EMAIL_PLACEHOLDER = "operator@agentlab.local";
// Real XP economy: enrolling in a beta awards a persisted, ledgered grant.
const BETA_XP_PER_ENROLLMENT = 50;
// Tier thresholds derived from accumulated XP (was: the constants
// 9999/350 returned unconditionally by getBetaStatus).
// Contributor sits at 100 XP — exactly the two Tier-1 public betas
// (50 XP each). The old fictional constant of 350 was unreachable for any
// honest workspace: only ~4 catalog apps are enrollable below Tier 2, so
// no real progression could ever cross it. Alpha Insider stays
// aspirational (1500) — no live Tier-3 program exists yet.
const BETA_TIERS = [
  { level: 1, name: "Explorer (Tier 1)", minPoints: 0 },
  { level: 2, name: "Contributor (Tier 2)", minPoints: 100 },
  { level: 3, name: "Alpha Insider (Tier 3)", minPoints: 1500 },
] as const;

// Program catalog surfaced by getBetaStatus. Statuses are DERIVED at
// request time (Active/Available/Locked) from the real ledger — never
// hardcoded here.
const BETA_PROGRAMS = [
  {
    id: "app-market-marksman-std",
    name: "Market Marksman (Standard Beta)",
    tierRequired: "Contributor (Tier 2)",
    // Reworded: the old "+14 … on 5 Signal Tests" referenced a signal-test
    // tracker that does not exist. The milestone now fires on 5 enrollments.
    reward: "+14 Pro Trial Days at 5 Beta Enrollments",
  },
  {
    id: "app-market-marksman-nv",
    name: "Market Marksman (Nevada Edition)",
    tierRequired: "Contributor (Tier 2)",
    reward: "Nevada Corporate & Regulatory Signal Access",
  },
  {
    id: "app-leadpulse",
    name: "LeadPulse Beta",
    tierRequired: "Explorer (Tier 1)",
    // Reworded: no feedback channel is tracked; the +7 days now fire on
    // enrollment (ENROLLMENT_TRIAL_DAY_GRANTS below).
    reward: "+7 Pro Trial Days on enrollment",
  },
  {
    id: "app-pulse-social",
    name: "Pulse Social Beta",
    tierRequired: "Explorer (Tier 1)",
    reward: "Priority Generation Rate Limits",
  },
  {
    id: "agentic-os-v2",
    name: "Agentic OS v2 (Autonomous Swarms)",
    tierRequired: "Alpha Insider (Tier 3)",
    reward: "Direct Access to Multi-Agent Python SDK",
  },
] as const;

// Trial-day rewards that actually extend trials (CC-017 Q1): granted as
// beta_xp_events rows the moment the triggering enrollment happens.
const ENROLLMENT_TRIAL_DAY_GRANTS: Record<string, number> = {
  "app-leadpulse": 7,
};
const MILESTONE_ENROLLMENTS_FOR_TRIAL = 5;
const MILESTONE_TRIAL_DAYS = 14;
const MILESTONE_REASON = "Milestone: 5 beta program enrollments";
const TRIAL_BASE_DAYS_REMAINING = 18; // illustrative base — see getTrialStatus note
const TRIAL_EXTENSION_MAX_EXTRA_DAYS = 28;

function tierForPoints(points: number) {
  return [...BETA_TIERS].reverse().find(t => points >= t.minPoints) ?? BETA_TIERS[0];
}

/** Parse a catalog betaTierRequired string into a required tier level (0 = ungated). */
function requiredTierLevel(betaTierRequired?: string): number {
  if (!betaTierRequired) return 0;
  if (betaTierRequired.includes("Tier 3")) return 3;
  if (betaTierRequired.includes("Tier 2")) return 2;
  if (betaTierRequired.includes("Tier 1")) return 1;
  return 0; // "Public …" / ungated labels
}

/**
 * Real godmode: the god workspace (GOD_MODE_EMAILS bearer tokens) or an
 * authenticated admin from the tenant middleware. CC-2026-10-02-016 found the
 * old `req.user?.role || "admin"` defaulted EVERY caller to admin because
 * nothing in the server ever assigns req.user — live probes returned godmode
 * to anonymous requests.
 */
function isBetaGodmode(req: Request, workspaceId: string): boolean {
  return (
    workspaceId === GOD_WORKSPACE_ID ||
    (req.userRole === "admin" &&
      !!req.userEmail &&
      req.userEmail !== ANONYMOUS_EMAIL_PLACEHOLDER)
  );
}

/**
 * Ensure the knowledge_packages row exists before any workspace_packages
 * insert (FK: workspace_packages.package_id → knowledge_packages.id).
 * Seeds from the canonical catalog when the entry is known but the row
 * was never persisted. No-op for unknown ids — the caller decides what
 * to do with those.
 */
export async function ensureKnowledgePackage(db: Db, packageId: string): Promise<void> {
  const existing = await db
    .select()
    .from(knowledgePackages)
    .where(eq(knowledgePackages.id, packageId))
    .limit(1);
  if (existing.length > 0) return;

  const match = CANONICAL_KNOWLEDGE_PACKAGES.find(p => p.id === packageId);
  if (!match) return;

  await db.insert(knowledgePackages).values({
    id: match.id,
    name: match.name,
    description: match.description,
    departmentCode: match.departmentCode,
    monthlyPrice: match.monthlyPrice,
    stripeProductId: match.stripeProductId,
  });
}

/**
 * Price context for a package: live DB row first, canonical catalog
 * fallback. monthlyPrice 0 (or unknown id) = free.
 */
export async function getPackageCommerceContext(
  db: Db | null | undefined,
  packageId: string
): Promise<{
  productName: string;
  monthlyPrice: number;
  stripeProductId: string | null;
}> {
  let pkgRow:
    | { name: string; monthlyPrice: string; stripeProductId: string | null }
    | undefined;
  if (db) {
    try {
      const rows = await db
        .select()
        .from(knowledgePackages)
        .where(eq(knowledgePackages.id, packageId))
        .limit(1);
      pkgRow = rows[0];
    } catch (err) {
      console.warn("[Marketplace] Package lookup failed, using canonical catalog:", err);
    }
  }
  const canonical = CANONICAL_KNOWLEDGE_PACKAGES.find(p => p.id === packageId);
  return {
    productName: pkgRow?.name || canonical?.name || packageId,
    monthlyPrice: Number(pkgRow?.monthlyPrice ?? canonical?.monthlyPrice ?? 0),
    stripeProductId: pkgRow?.stripeProductId || canonical?.stripeProductId || null,
  };
}

/**
 * Who may grant a paid package without paying when Stripe is configured:
 * the godmode workspace, admin role, or the operator identity — the
 * comp/partner grant path. Everyone else goes through /subscribe.
 */
function isPrivilegedGranter(req: Request, workspaceId: string): boolean {
  // CC-2026-10-02-017 (disposition 3/Q3 fix): the old reads used
  // (req as any).user — a field NOTHING in the server ever assigns — so all
  // three identity checks were dead code and the effective gate was
  // workspace-only. Now reads the tenant middleware's real fields. The
  // anonymous placeholder email never counts, so unauthenticated callers
  // remain non-privileged exactly as before.
  const userRole = req.userRole;
  const userEmail = req.userEmail;
  return (
    workspaceId === GOD_WORKSPACE_ID ||
    (userRole === "admin" &&
      !!userEmail &&
      userEmail !== ANONYMOUS_EMAIL_PLACEHOLDER)
  );
}

export const CANONICAL_KNOWLEDGE_PACKAGES = [
  {
    id: "pkg-founder-signal",
    name: "Founder Signal System (FSS Playbook)",
    description: "6-step automated founder market signal loop: ICP definition (MKT-01), diagnostic intake (MKT-03), authority content engine (MKT-06), 1-on-1 outreach (MKT-05), follow-up classification (MKT-02), and proof loop (MKT-04).",
    departmentCode: "mkt",
    monthlyPrice: "99.00",
    stripeProductId: "prod_fss_100",
    workflowsCount: 6,
    automationRate: "90%",
    cycleTimeReduction: "5.5 hrs/day",
    tags: ["Founder Marketing", "ICP Discovery", "Content Engine", "Outreach", "Proof Loop", "FSS"],
  },
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
    id: "app-market-marksman-std",
    category: "apps",
    name: "Market Marksman (Standard Edition)",
    provider: "URC Ecosystem Apps",
    type: "Predictive Opportunity Radar",
    status: "Live (Beta)",
    statusVariant: "default",
    price: "Included in OS",
    description: "Universal opportunity discovery and predictive deal signal briefs for identifying high-margin market wedges across all industries.",
    iconName: "Target",
    tags: ["Opportunities", "Deal Signals", "Universal Edition", "Sales Intelligence"],
    launchUrl: "https://market-marksman-718497644379.us-central1.run.app/",
    isExternal: true,
    isBetaOnly: true,
    betaTierRequired: "Contributor (Tier 2)",
    betaDescription: "Universal predictive deal sourcing engine. Requires active beta enrollment or Contributor badge.",
  },
  {
    id: "app-market-marksman-nv",
    category: "apps",
    name: "Market Marksman (Nevada Edition)",
    provider: "URC Ecosystem Apps",
    type: "State Filing & Deal Radar",
    status: "Live on Cloud Run",
    statusVariant: "secondary",
    price: "Included in OS",
    description: "Nevada state-specific filings, commercial registry signals, and regulatory business intelligence radar.",
    iconName: "Target",
    tags: ["Nevada", "State Radar", "Filings", "Specialized Edition"],
    launchUrl: "https://market-marksman-718497644379.us-central1.run.app/",
    isExternal: true,
    isBetaOnly: true,
    betaTierRequired: "Contributor (Tier 2)",
    betaDescription: "State-specific Nevada regulatory intelligence and corporate filing radar.",
  },
  {
    id: "app-market-marksman-inv",
    category: "apps",
    name: "Market Marksman (Investor's Edition)",
    provider: "URC Ecosystem Apps",
    type: "Deal Flow & Portfolio Radar",
    status: "Roadmap (Coming Soon)",
    statusVariant: "outline",
    price: "Upcoming Rollout",
    description: "Venture deal flow sourcing, startup growth traction signals, and portfolio intelligence radar.",
    iconName: "TrendingUp",
    tags: ["Investors", "Deal Flow", "Venture Radar", "Upcoming"],
    launchUrl: "#",
    isExternal: false,
    isBetaOnly: true,
    betaTierRequired: "Alpha Insider (Tier 3)",
    betaDescription: "Early roadmap preview for angels, syndicates, and venture investors.",
  },
  {
    id: "app-market-marksman-ins",
    category: "apps",
    name: "Market Marksman (Insurance Edition)",
    provider: "URC Ecosystem Apps",
    type: "Risk & Policy Signal Radar",
    status: "Roadmap (Coming Soon)",
    statusVariant: "outline",
    price: "Upcoming Rollout",
    description: "Commercial risk underwriting signals, insurance coverage gap monitoring, and business expansion alerts.",
    iconName: "Shield",
    tags: ["Insurance", "Underwriting", "Risk Radar", "Upcoming"],
    launchUrl: "#",
    isExternal: false,
    isBetaOnly: true,
    betaTierRequired: "Alpha Insider (Tier 3)",
    betaDescription: "Specialized risk signals for commercial brokerages and underwriters.",
  },
  {
    id: "app-cre-expansion-radar",
    category: "apps",
    name: "Market Marksman (Commercial Real Estate Edition)",
    provider: "URC Specialized Campaigns",
    type: "Tenant Expansion & Off-Market Radar",
    status: "Live Campaign",
    statusVariant: "default",
    price: "Included in OS",
    description: "Pinpoint 15k–50k RSF industrial, cleanroom, and life-science tenant expansions 3–9 months before public brokerage listings.",
    iconName: "Building2",
    tags: ["Real Estate", "CRE", "Expansion Radar", "Brokers", "Campaign"],
    launchUrl: "/campaigns/real-estate",
    isExternal: false,
    isBetaOnly: false,
  },
  {
    id: "app-medspa-growth-engine",
    category: "apps",
    name: "MedSpa Patient Acquisition Engine",
    provider: "URC Specialized Campaigns",
    type: "VIP Booking & Cancellation Shield",
    status: "Live Campaign",
    statusVariant: "default",
    price: "Included in OS",
    description: "24/7 AI Receptionist and VIP consultation booking system converting aesthetic inquiries in under 60 seconds.",
    iconName: "Sparkles",
    tags: ["MedSpa", "Patient Intake", "VIP Booking", "Aesthetics", "Campaign"],
    launchUrl: "/campaigns/medspa",
    isExternal: false,
    isBetaOnly: false,
  },
  {
    id: "app-market-marksman-leg",
    category: "apps",
    name: "Market Marksman (Legal Edition)",
    provider: "URC Ecosystem Apps",
    type: "Statutory & Compliance Radar",
    status: "Roadmap (Coming Soon)",
    statusVariant: "outline",
    price: "Upcoming Rollout",
    description: "Statutory filing changes, litigation signals, corporate formation monitoring, and compliance alerts.",
    iconName: "FileText",
    tags: ["Legal", "Compliance", "Statutory Radar", "Upcoming"],
    launchUrl: "#",
    isExternal: false,
    isBetaOnly: true,
    betaTierRequired: "Alpha Insider (Tier 3)",
    betaDescription: "Specialized statutory and corporate intelligence for law firms and compliance teams.",
  },
  {
    id: "app-pulse-social",
    category: "apps",
    name: "Pulse Social",
    provider: "URC Ecosystem Apps",
    type: "Content Syndication Engine",
    status: "Live (Beta)",
    statusVariant: "default",
    price: "Included in OS",
    description: "Automated social content generation, multi-channel syndication, and post scheduling engine.",
    iconName: "Share2",
    tags: ["Social Media", "LinkedIn", "Content Scheduling"],
    launchUrl: "https://pulse-social-agentlab-projects.vercel.app",
    isExternal: true,
    isBetaOnly: true,
    betaTierRequired: "Explorer (Tier 1)",
    betaDescription: "Multi-channel content scheduling & syndication engine.",
  },
  {
    id: "app-leadpulse",
    category: "apps",
    name: "LeadPulse",
    provider: "URC Ecosystem Apps",
    type: "Lead Discovery & Enrichment",
    status: "Live (Beta)",
    statusVariant: "default",
    price: "Included in OS",
    description: "Automated B2B lead discovery, contact scraping, and enrichment engine for founder-led outreach.",
    iconName: "TrendingUp",
    tags: ["Lead Gen", "Enrichment", "B2B Prospecting"],
    launchUrl: "https://leadpulse-ai-lead-accuracy-enrichment-engine.ai.studio/",
    isExternal: true,
    isBetaOnly: true,
    betaTierRequired: "Explorer (Tier 1)",
    betaDescription: "Autonomous lead enrichment & verification matrix.",
  },
  {
    id: "pkg-founder-signal",
    category: "apps",
    name: "Founder Signal System",
    provider: "Uncle Robert Consulting",
    type: "Starter Marketing Sprint",
    status: "Live Sprint",
    statusVariant: "secondary",
    price: "$1,000 one-time",
    description: "3–5 day turnkey starter marketing sprint: signal brief, message map, first content batch, and proof-capture loop.",
    iconName: "Zap",
    tags: ["Founder Marketing", "Starter Sprint", "Beta"],
    launchUrl: "/founder-signal-system",
    actionLabel: "View Sprint & Diagnostic",
    isBetaOnly: false,
    betaTierRequired: "Public Sprint Access",
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
    isBetaOnly: false,
    betaTierRequired: "Public Access",
  },
  {
    id: "app-icp-generator",
    category: "apps",
    name: "ICP Generator & Targeting Vault",
    provider: "URC Strategy & Growth Tools",
    type: "GTM Intelligence Tool",
    status: "Live in OS",
    statusVariant: "default",
    price: "Included in OS",
    description: "Synthesize precision buyer personas, urgent pain triggers, buying signals, and message hooks wired directly into your operating database.",
    iconName: "Target",
    tags: ["ICP", "Targeting", "Sales Strategy", "Go-To-Market"],
    launchUrl: "/icp-generator",
    isBetaOnly: false,
    betaTierRequired: "Public Access",
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
    isBetaOnly: false,
    betaTierRequired: "Public Access",
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
    description: "Compendium of 28 bootstrapped business models, operational architectures, and cashflow playbooks.",
    iconName: "BookOpen",
    tags: ["Bootstrap", "Business Models", "Funnel Asset"],
    actionLabel: "Get Book ($59.99)",
    gumroadUrl: "https://bossrob.gumroad.com/l/bootstrappersguide",
  },
  {
    id: "book-soe",
    category: "books",
    name: "Startup Operational Excellence",
    author: "Robert T. McCarthy",
    price: "$19.99",
    rating: 4.9,
    format: "Digital E-Book & Audio (Reduced to $19.99)",
    description: "Eliminating informational drift, standardizing team execution, and building resilient agency workflows.",
    iconName: "Bookmark",
    tags: ["Operations", "Governance", "SOPs"],
    actionLabel: "Get Book ($19.99)",
    gumroadUrl: "https://bossrob.gumroad.com/l/soe",
  },
];

// In-memory fallback subscriptions map for resilient local dev
const inMemorySubscriptions = new Map<string, Set<string>>();

export async function getMarketplaceItems(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = (req as any).workspaceId || "00000000-0000-0000-0000-000000000001";
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
          subs.forEach((s: any) => unlockedPackageIds.add(s.packageId));
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
      department: `Dept ${pkg.departmentCode.toUpperCase()}`,
      departmentCode: pkg.departmentCode,
      price: `$${pkg.monthlyPrice}/mo`,
      monthlyPrice: pkg.monthlyPrice,
      description: pkg.description,
      // CC-017 (disposition 2): static per-department "N DAG Workflows"
      // claims dropped — no per-department workflow table exists, and only
      // the FSS family provisions workflows on mount. The client shows the
      // real mount/entitlement state instead.
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
  const mountStartedAt = Date.now(); // CC-017: measured latency for the audit row
  try {
    const workspaceId = (req as any).workspaceId || "00000000-0000-0000-0000-000000000001";
    const id = param(req, "id");

    const db = await getDb();

    // Payment gate (CC-2026-10-02-003): with Stripe configured, paid
    // packages no longer activate through mount — buyers go
    // /subscribe → Checkout Session → webhook provisioning. Free
    // packages, local dev (no STRIPE_SECRET_KEY), and privileged grants
    // (admin/godmode comps) are exempt.
    const commerce = await getPackageCommerceContext(db, id);
    if (
      process.env.STRIPE_SECRET_KEY &&
      commerce.monthlyPrice > 0 &&
      !isPrivilegedGranter(req, workspaceId)
    ) {
      res.status(402).json({
        error: "payment_required",
        message: `${commerce.productName} is a paid package ($${commerce.monthlyPrice}/mo). Subscribe to unlock it.`,
        packageId: id,
        checkoutEndpoint: `/api/marketplace/packages/${id}/subscribe`,
      });
      return;
    }

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

        // If mounting Founder Signal System or Marketing Playbook, guarantee FSS DAG exists in workflows table
        if (id === "pkg-founder-signal" || id === "mkt-playbook" || id === "fss-playbook") {
          const fssName = "Founder Signal System (6-Step Operating Loop)";
          const existingWf = await db
            .select()
            .from(workflows)
            .where(and(eq(workflows.workspaceId, workspaceId), eq(workflows.name, fssName)))
            .limit(1);

          let targetWfId = existingWf[0]?.id;

          if (!targetWfId) {
            const [createdWf] = await db
              .insert(workflows)
              .values({
                workspaceId,
                name: fssName,
                description: "End-to-end founder market signal engine: ICP definition (MKT-01), diagnostic intake (MKT-03), authority content engine (MKT-06), 1-on-1 outreach (MKT-05), follow-up classification (MKT-02), and proof loop (MKT-04).",
                triggerType: "Scheduled & Event Triggered",
                status: "active",
              })
              .returning();

            targetWfId = createdWf.id;

            const fssSteps = [
              { title: "[MKT-01] ICP & Core Pain Definition", detail: "Extract target customer, urgent bottleneck, founder POV, and exclusion criteria into a 1-page Signal Brief.", type: "agent" },
              { title: "[MKT-03] Diagnostic Intake & Segmentation", detail: "Process inbound diagnostic intake submissions to surface acute friction and score sprint fit before pitching.", type: "agent" },
              { title: "[MKT-06] Authority Content Batch Generator", detail: "Draft 3-5 high-signal LinkedIn thought leadership posts directly from customer pain verbatim.", type: "agent" },
              { title: "[MKT-05] 1-on-1 Founder Outreach Sequence", detail: "Assemble personalized, non-spammy first-touch outreach matrix for 10-25 named contacts per cycle.", type: "agent" },
              { title: "[MKT-02] 3-Touch Follow-Up & Reply Classifier", detail: "Classify replies (interested, not now, referral, objection) and draft context-aware follow-ups.", type: "agent" },
              { title: "[MKT-04] Proof Loop & Traction Signal Capture", detail: "Record objections, market signals, and case testimonials to feed into the next operating cycle.", type: "guardrail" },
            ];

            const stepValues = fssSteps.map((st, idx) => ({
              workspaceId,
              workflowId: targetWfId,
              orderIndex: idx,
              stepType: st.type,
              title: st.title.substring(0, 128),
              actionPrompt: st.detail,
            }));

            await db.insert(workflowSteps).values(stepValues);
          }

          // Record formal audit trail. CC-2026-10-02-017 (disposition 3):
          // this is a non-LLM entitlement write — measured wall time, zero
          // tokens/cost, and policy checks recorded as NOT evaluated (was
          // hardcoded 270 tokens / $0.000150 / 120 ms on a not-llm row).
          await db.insert(auditLogs).values({
            workspaceId,
            workflowId: targetWfId,
            actionType: "PLAYBOOK_MOUNT",
            model: "not-llm-dispatch",
            payloadIn: { packageId: id, triggeredAt: new Date().toISOString(), source: "Marketplace / FSS Portal" },
            payloadOut: { status: "active", workflowName: fssName, workflowId: targetWfId, totalSteps: 6 },
            tokensPrompt: 0,
            tokensCompletion: 0,
            tokensTotal: 0,
            cost: "0.000000",
            latencyMs: Date.now() - mountStartedAt,
            status: "success",
            policyChecks: {
              evaluated: false,
              saifPassed: null,
              piiDetected: null,
              budgetThresholdPassed: null,
              note: "not-llm-dispatch",
            },
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
      message: `Playbook ${id} successfully mounted and active in Command Center workflows.`,
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
    const workspaceId = (req as any).workspaceId || "00000000-0000-0000-0000-000000000001";
    const id = param(req, "id");

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

/**
 * POST /marketplace/packages/:packageId/subscribe
 *
 * Paid packages with STRIPE_SECRET_KEY configured go through a real Stripe
 * Checkout Session carrying { workspaceId, packageId } in metadata — the
 * webhook (server/stripe/webhook.ts) provisions on payment. Free packages
 * and local dev (no Stripe key) keep the Phase 11 direct-activation path.
 * A checkout failure NEVER falls back to a free grant: that would be a
 * payment bypass, so it returns an honest 502 instead.
 */
export async function subscribeToPackage(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = (req as any).workspaceId || "00000000-0000-0000-0000-000000000001";
    const packageId = param(req, "packageId");
    if (!packageId) {
      res.status(400).json({ error: "packageId is required" });
      return;
    }

    // Price context: live DB row first, canonical catalog as fallback.
    const db = await getDb();
    const { productName, monthlyPrice, stripeProductId } = await getPackageCommerceContext(
      db,
      packageId
    );

    // Local dev (no key) and free packages activate directly — no money path.
    if (!process.env.STRIPE_SECRET_KEY || !(monthlyPrice > 0)) {
      if (!process.env.STRIPE_SECRET_KEY) {
        console.warn(
          `[Marketplace] STRIPE_SECRET_KEY not set — activating ${packageId} directly (local dev path).`
        );
      }
      // mountPlaybook reads param(req, "id"); this route names it packageId.
      req.params.id = packageId;
      return mountPlaybook(req, res);
    }

    // Pre-create the catalog row so the webhook's FK insert cannot fail.
    // Non-fatal: the webhook re-runs the same ensure on delivery.
    if (db) {
      try {
        await ensureKnowledgePackage(db, packageId);
      } catch (err) {
        console.warn("[Marketplace] Could not pre-create package row; webhook will retry:", err);
      }
    }

    const body = (req.body || {}) as Record<string, unknown>;
    // CC-017 (disposition 8): read the tenant middleware's real identity —
    // req.user is never assigned anywhere in the server, so this Stripe
    // receipt email was silently undefined for every caller. The anonymous
    // placeholder never reaches Stripe.
    const customerEmail =
      req.userEmail && req.userEmail !== ANONYMOUS_EMAIL_PLACEHOLDER
        ? req.userEmail
        : undefined;
    const origin =
      (req.headers.origin as string) ||
      process.env.APP_ORIGIN ||
      // CC-017 (disposition 7): was the stale "https://agentlab.manus.space".
      // Fall back to the host that actually served this request.
      `${req.protocol}://${req.get("host")}`;

    const checkoutUrl = await createPackageCheckoutSession({
      workspaceId,
      packageId,
      productName,
      monthlyPrice,
      stripeProductId,
      priceId: typeof body.priceId === "string" && body.priceId ? body.priceId : undefined,
      customerEmail,
      successUrl: `${origin}/marketplace?checkout=success&packageId=${encodeURIComponent(packageId)}`,
      cancelUrl: `${origin}/marketplace?checkout=canceled&packageId=${encodeURIComponent(packageId)}`,
    });

    res.status(200).json({
      success: true,
      mode: "stripe",
      checkoutUrl,
      packageId,
      workspaceId,
    });
  } catch (error: any) {
    console.error("[Marketplace] Subscribe checkout error:", error);
    res.status(502).json({
      error: "Failed to create checkout session",
      detail: error?.message || "unknown error",
    });
  }
}

/**
 * Sum a workspace's real beta state from the two ledger tables.
 * XP = Σ points, trial days = Σ trial_days, memberships = enrollment rows.
 * (CC-017 disposition 1: these were process-local Map constants before.)
 */
async function readBetaLedger(db: Db, workspaceId: string): Promise<{
  xp: number;
  trialDays: number;
  enrolled: string[];
}> {
  const [enrollRows, xpRows] = await Promise.all([
    db.select().from(betaEnrollments).where(eq(betaEnrollments.workspaceId, workspaceId)),
    db.select().from(betaXpEvents).where(eq(betaXpEvents.workspaceId, workspaceId)),
  ]);
  return {
    xp: xpRows.reduce((sum, r) => sum + (r.points ?? 0), 0),
    trialDays: xpRows.reduce((sum, r) => sum + (r.trialDays ?? 0), 0),
    enrolled: enrollRows.map(r => r.appId),
  };
}

export async function getBetaStatus(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.workspaceId || DEFAULT_WORKSPACE_ID;
    const isGodmode = isBetaGodmode(req, workspaceId);

    let xp = 0;
    let enrolled: string[] = [];
    const db = await getDb();
    if (db) {
      try {
        const ledger = await readBetaLedger(db, workspaceId);
        xp = ledger.xp;
        enrolled = ledger.enrolled;
      } catch (err) {
        // Honest failure mode: report the real zero rather than fabricated constants.
        console.warn("[Beta Status] ledger read failed; reporting 0 XP / no enrollments:", err);
      }
    }

    const tier = isGodmode
      ? { level: 3, name: "Alpha Insider (Tier 3 - Godmode)" }
      : tierForPoints(xp);

    // Godmode owns every catalog program; everyone else gets their real memberships.
    const enrolledApps = isGodmode
      ? CANONICAL_ECOSYSTEM_APPS.map(a => a.id)
      : enrolled;

    const availablePrograms = BETA_PROGRAMS.map(prog => {
      const enrollable = CANONICAL_ECOSYSTEM_APPS.some(a => a.id === prog.id);
      let status: string;
      if (isGodmode || enrolledApps.includes(prog.id)) {
        status = "Active";
      } else if (enrollable && tier.level >= requiredTierLevel(prog.tierRequired)) {
        status = "Available";
      } else {
        status = "Locked";
      }
      return { ...prog, status };
    });

    res.status(200).json({
      success: true,
      isGodmode,
      currentTier: tier.name,
      tierLevel: tier.level,
      betaPoints: xp, // real ledger sum — was a constant 9999/350
      enrolledApps,
      freeBookPerk: {
        title: "Startup Operational Excellence",
        author: "Robert McCarthy (Uncle Robert)",
        value: "$19.99",
        // CC-017 disposition 7: no unlock event is ever verified, so state
        // the offer instead of claiming an unlock we cannot see.
        status: "Included with Beta participation",
        downloadUrl: "https://bossrob.gumroad.com/l/soe",
        description: "Complimentary operational doctrine included for all Beta participants and Pro subscribers to provide clear direction for your endeavors.",
      },
      availablePrograms,
    });
  } catch (error: any) {
    console.error("[Beta Status Error]:", error);
    res.status(500).json({ error: "Failed to fetch beta status" });
  }
}

export async function enrollBeta(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.workspaceId || DEFAULT_WORKSPACE_ID;
    const appId = param(req, "appId");
    if (!appId) {
      res.status(400).json({ error: "appId is required" });
      return;
    }

    const app = CANONICAL_ECOSYSTEM_APPS.find(a => a.id === appId);
    if (!app) {
      res.status(404).json({
        error: "unknown_beta_app",
        message: `${appId} is not a beta program in this catalog.`,
        appId,
      });
      return;
    }

    const db = await getDb();
    if (!db) {
      res.status(503).json({
        error: "beta_storage_unavailable",
        message: "Beta enrollment requires the database.",
      });
      return;
    }

    const ledger = await readBetaLedger(db, workspaceId);
    const isGodmode = isBetaGodmode(req, workspaceId);
    const tier = isGodmode
      ? { level: 3, name: "Alpha Insider (Tier 3 - Godmode)" }
      : tierForPoints(ledger.xp);

    // Tier gate: enrollment below the program's required tier is refused
    // with the real numbers (was: everyone could enroll in everything).
    const requiredLevel = requiredTierLevel(app.betaTierRequired);
    if (requiredLevel > tier.level) {
      res.status(403).json({
        error: "tier_requirement_not_met",
        message: `${app.name} requires ${app.betaTierRequired}; this workspace is at ${tier.name} (${ledger.xp} XP).`,
        appId,
        requiredTier: app.betaTierRequired,
        currentTier: tier.name,
        tierLevel: tier.level,
        betaPoints: ledger.xp,
      });
      return;
    }

    const alreadyEnrolled = ledger.enrolled.includes(appId);
    let xpAwarded = 0;
    let trialDaysAwarded = 0;

    if (!alreadyEnrolled) {
      // The unique index makes this race-safe: returning() yields a row only
      // on a genuine first enrollment, so XP can never double-award.
      const inserted = await db
        .insert(betaEnrollments)
        .values({ workspaceId, appId, xpGranted: BETA_XP_PER_ENROLLMENT })
        .onConflictDoNothing()
        .returning();

      if (inserted.length > 0) {
        xpAwarded = BETA_XP_PER_ENROLLMENT;
        await db.insert(betaXpEvents).values({
          workspaceId,
          eventType: "enrollment",
          appId,
          points: xpAwarded,
          reason: `Enrolled in ${app.name} beta program`,
        });

        // Reward that actually extends trials: per-app enrollment grants.
        const grantDays = ENROLLMENT_TRIAL_DAY_GRANTS[appId] ?? 0;
        if (grantDays > 0) {
          trialDaysAwarded = grantDays;
          await db.insert(betaXpEvents).values({
            workspaceId,
            eventType: "trial_extension",
            appId,
            trialDays: grantDays,
            reason: `${app.name} enrollment reward (+${grantDays} Pro Trial days)`,
          });
        }

        // Milestone reward: +14 Pro Trial days once at 5 enrolled programs.
        // Idempotent via the reason marker (enrollments only ever grow).
        const enrollCount = ledger.enrolled.length + 1;
        if (enrollCount >= MILESTONE_ENROLLMENTS_FOR_TRIAL) {
          const prior = await db
            .select()
            .from(betaXpEvents)
            .where(
              and(
                eq(betaXpEvents.workspaceId, workspaceId),
                eq(betaXpEvents.eventType, "trial_extension"),
                eq(betaXpEvents.reason, MILESTONE_REASON)
              )
            )
            .limit(1);
          if (prior.length === 0) {
            trialDaysAwarded += MILESTONE_TRIAL_DAYS;
            await db.insert(betaXpEvents).values({
              workspaceId,
              eventType: "trial_extension",
              trialDays: MILESTONE_TRIAL_DAYS,
              reason: MILESTONE_REASON,
            });
          }
        }
      }
    }

    const refreshed = await readBetaLedger(db, workspaceId);

    res.status(200).json({
      success: true,
      message: alreadyEnrolled
        ? `Already enrolled in ${app.name} Beta Program.`
        : `Successfully enrolled in ${app.name} Beta Program! +${xpAwarded} Beta XP${
            trialDaysAwarded ? `, +${trialDaysAwarded} Pro Trial days` : ""
          } awarded.`,
      appId,
      workspaceId,
      alreadyEnrolled,
      xpAwarded,
      trialDaysAwarded,
      betaPoints: refreshed.xp,
      trialDaysGranted: refreshed.trialDays,
      enrolledApps: refreshed.enrolled,
    });
  } catch (error: any) {
    console.error("[Beta Enroll Error]:", error);
    res.status(500).json({ error: "Failed to enroll in beta program" });
  }
}

export async function getTrialStatus(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.workspaceId || DEFAULT_WORKSPACE_ID;

    let extraDays = 0;
    const db = await getDb();
    if (db) {
      try {
        const ledger = await readBetaLedger(db, workspaceId);
        extraDays = ledger.trialDays;
      } catch (err) {
        console.warn("[Trial Status] ledger read failed; reporting base trial only:", err);
      }
    }

    const totalDaysRemaining = TRIAL_BASE_DAYS_REMAINING + extraDays;

    res.status(200).json({
      success: true,
      plan: "AgentLab OS Pro Trial",
      // CC-017 (Q1): extension days come from the real beta_xp_events ledger.
      // The base 30-day window remains illustrative until the entitlements
      // rollout — stated explicitly instead of implied (CC-008 demo labeling).
      tracking: "demo-base-real-extensions",
      note: "Base trial dates are illustrative (CC-008); extension days are real ledgered grants.",
      totalTrialDays: 30 + extraDays,
      daysRemaining: totalDaysRemaining,
      trialEndDate: new Date(Date.now() + totalDaysRemaining * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      canExtend: extraDays < TRIAL_EXTENSION_MAX_EXTRA_DAYS,
      extensionDaysGranted: extraDays,
      freeBookPerk: {
        title: "Startup Operational Excellence",
        author: "Robert McCarthy (Uncle Robert)",
        value: "$19.99",
        status: "Included with Beta participation",
        downloadUrl: "https://bossrob.gumroad.com/l/soe",
        description: "Complimentary copy included for all active Betas & Pro trial accounts.",
      },
      downgradePolicy: {
        retained: [
          "1 Active Swarm Agent (Alpha-Node-01)",
          "5 Daily Autonomous DAG Runs",
          "Full Access to Workspace Knowledge Base & Saved SOPs",
          "Exportable Audit Logs & Compliance Reports",
        ],
        paused: [
          "Multi-Agent Swarm Concurrency (>1 agent)",
          "Real-Time Automated Background Schedulers",
          "Beta Ecosystem App Integration Hub",
        ]
      }
    });
  } catch (error: any) {
    console.error("[Trial Status Error]:", error);
    res.status(500).json({ error: "Failed to fetch trial status" });
  }
}

export async function extendTrial(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.workspaceId || DEFAULT_WORKSPACE_ID;
    const { reason } = (req.body || {}) as { reason?: string };

    // CC-017: this endpoint used to hand +14 days to ANY caller from a
    // process-local Map (and had zero callers). It is now a real ledger
    // write, gated to the founder/admin grant path — ordinary workspaces
    // earn extensions through the enrollment milestone instead.
    if (!isPrivilegedGranter(req, workspaceId)) {
      res.status(403).json({
        error: "forbidden",
        message: "Trial extensions are granted by the beta enrollment milestone or an admin.",
      });
      return;
    }

    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "beta_storage_unavailable" });
      return;
    }

    const ledger = await readBetaLedger(db, workspaceId);
    const remaining = TRIAL_EXTENSION_MAX_EXTRA_DAYS - ledger.trialDays;
    if (remaining <= 0) {
      res.status(409).json({
        error: "extension_cap_reached",
        message: `Workspace already holds ${ledger.trialDays} of ${TRIAL_EXTENSION_MAX_EXTRA_DAYS} extension days.`,
        extensionDaysGranted: ledger.trialDays,
      });
      return;
    }

    // Capped grant: never push the total past the published 28-day ceiling.
    const granted = Math.min(14, remaining);
    const appliedReason =
      typeof reason === "string" && reason.trim() ? reason.trim() : "Founder Beta Extension";
    await db.insert(betaXpEvents).values({
      workspaceId,
      eventType: "trial_extension",
      trialDays: granted,
      reason: appliedReason,
    });

    const refreshed = await readBetaLedger(db, workspaceId);
    res.status(200).json({
      success: true,
      message: `Trial successfully extended by ${granted} days!`,
      addedDays: granted,
      totalExtensionDays: refreshed.trialDays,
      daysRemaining: TRIAL_BASE_DAYS_REMAINING + refreshed.trialDays,
      reason: appliedReason,
    });
  } catch (error: any) {
    console.error("[Extend Trial Error]:", error);
    res.status(500).json({ error: "Failed to extend trial" });
  }
}

