import { Request, Response } from "express";
import { db } from "../db";
import { icpProfiles } from "../schema";
import { eq, desc, and, or, isNull } from "drizzle-orm";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

// Default seed ICP profiles for initial bootstrap
export const defaultIcpSeed = [
  {
    name: "Nevada Industrial CRE Brokers",
    industry: "Commercial Real Estate",
    targetRole: "Managing Director / Principal Broker",
    companySize: "10-50 employees",
    revenueRange: "$2M - $10M GCI",
    acutePainTriggers: [
      "Stale lead lists and manual property parcel lookup dragging down prospecting velocity",
      "Missing fast-moving institutional capital deployment signals in Northern & Southern Nevada",
      "Hours wasted researching owner entities across county assessor databases",
    ],
    buyingSignals: [
      "New commercial broker license registrations in Clark or Washoe County",
      "Subdivision or zoning application filings on local county records",
      "Brokerage expansion or team hiring postings on LinkedIn",
    ],
    disqualifiers: [
      "Pure residential single-family agents with no commercial transaction history",
      "Inactive brokerages with no active public listings in the past 12 months",
      "Teams unwilling to adopt automated intelligence feeds",
    ],
    valueProposition: "Autonomous Opportunity Radar that monitors Nevada county records, tax assessor parcel deeds, and corporate filings to deliver verified off-market industrial transaction leads directly to your inbox.",
    outreachAngles: [
      "Nevada Parcel Alert: Pinpointed 14 industrial lots in Apex Industrial Park with recent zoning variances.",
      "Off-Market Radar: Automated owner entity unmasking for commercial warehouse assets in Reno-Sparks.",
    ],
    source: "system",
  },
  {
    name: "Independent MedSpa & Aesthetic Clinic Owners",
    industry: "Healthcare & Aesthetics",
    targetRole: "Founder / Medical Director / Practice Owner",
    companySize: "5-25 staff",
    revenueRange: "$1M - $5M ARR",
    acutePainTriggers: [
      "High patient acquisition cost from paid Meta ads with 40%+ no-show rates",
      "Front desk receptionist overwhelmed by phone calls during peak injection hours",
      "Lack of automated VIP rebooking and continuity membership retention loops",
    ],
    buyingSignals: [
      "Expanding to a second clinic location or adding new laser/body contouring devices",
      "Running heavy Instagram promotional campaigns with manual DM booking",
      "Hiring additional Nurse Injectors or Estheticians",
    ],
    disqualifiers: [
      "Single-operator solo booth renters with no dedicated clinic location",
      "Clinics without online scheduling or modern EMR infrastructure",
    ],
    valueProposition: "24/7 AI Patient Concierge & VIP Retention Engine that answers every inbound inquiry within 4 seconds, books consultations directly into your EMR, and reduces appointment no-shows by 65%.",
    outreachAngles: [
      "After-Hours Booking Leak: Recovering the 30% of high-ticket aesthetic consultations lost after 6 PM.",
      "Pamela MedSpa Concierge: Live voice receptionist demo tailored for neurotoxin & filler inquiries.",
    ],
    source: "system",
  },
  {
    name: "Founder-Led B2B Agency & Professional Services",
    industry: "Professional Services & Consulting",
    targetRole: "Founder / Managing Partner / CEO",
    companySize: "5-30 employees",
    revenueRange: "$750k - $3M ARR",
    acutePainTriggers: [
      "Founder trapped in day-to-day fulfillment and sales calls (Key-Person Dependency)",
      "Lumpy revenue and feast-or-famine pipeline caused by inconsistent outbound marketing",
      "Undocumented SOPs causing delivery friction whenever a new team member is hired",
    ],
    buyingSignals: [
      "Founder actively posting on LinkedIn about hiring or capacity bottlenecks",
      "Inconsistent lead volume and relying 100% on word-of-mouth referrals",
      "Expressed goal to build transferable equity or prepare the firm for exit/acquisition",
    ],
    disqualifiers: [
      "Pre-revenue solopreneurs without product-market fit or proven client case studies",
      "Businesses without a repeatable core offering",
    ],
    valueProposition: "Turn your founder-dependent agency into a standardized, autonomous, and ownable operating asset with pre-built department playbooks, automated lead generation, and verifiable valuation metrics.",
    outreachAngles: [
      "Founder Signal Diagnostic: 3-5 day sprint to nail your ICP, message map, and proof loops.",
      "Ownable OS Blueprint: Elevate your valuation score and automate delivery handoffs across all 7 departments.",
    ],
    source: "system",
  },
];

/**
 * Seed baseline ICP profiles if the database table is empty.
 */
export async function seedIcpProfilesIfEmpty(workspaceId?: string) {
  try {
    const existing = await db.select().from(icpProfiles).limit(1);
    if (existing.length === 0) {
      console.log("[ICP Generator] Seeding baseline ICP profiles...");
      await db.insert(icpProfiles).values(
        defaultIcpSeed.map(p => ({
          ...p,
          workspaceId: workspaceId || null,
        }))
      );
      console.log("[ICP Generator] Seeded default ICP profiles successfully.");
    }
  } catch (err) {
    console.error("[ICP Generator] Error seeding default profiles:", err);
  }
}

/**
 * GET /api/icp/profiles
 * List saved ICP profiles.
 */
export async function listIcpProfiles(req: Request, res: Response) {
  try {
    const workspaceId = (req as any).workspaceId || (req.query.workspaceId as string);
    await seedIcpProfilesIfEmpty(workspaceId);

    const { industry } = req.query;
    const conditions = [];

    if (workspaceId) {
      conditions.push(or(isNull(icpProfiles.workspaceId), eq(icpProfiles.workspaceId, workspaceId)));
    }

    if (industry && typeof industry === "string" && industry.toLowerCase() !== "all") {
      conditions.push(eq(icpProfiles.industry, industry));
    }

    const profiles = await db
      .select()
      .from(icpProfiles)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(icpProfiles.createdAt));

    res.status(200).json({
      success: true,
      count: profiles.length,
      profiles,
    });
  } catch (error: any) {
    console.error("[ICP Generator] Error listing profiles:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to list ICP profiles",
    });
  }
}

/**
 * POST /api/icp/generate
 * Use Gemini AI to synthesize a comprehensive Ideal Customer Profile.
 */
export async function generateIcpProfile(req: Request, res: Response) {
  try {
    const {
      businessName = "Uncle Robert Consulting Client",
      offering = "B2B Professional Services / Operational Systems",
      industry = "Professional Services",
      targetAudience = "Founder / CEO",
      primaryGoal = "High-Ticket Client Acquisition & Retainer Growth",
      saveToDb = true,
    } = req.body;

    const workspaceId = (req as any).workspaceId || req.body.workspaceId;
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        success: false,
        error: "GOOGLE_GENERATIVE_AI_API_KEY is not configured.",
      });
    }

    const google = createGoogleGenerativeAI({ apiKey });
    const prompt = `You are an elite B2B Go-To-Market Strategist and Chief Revenue Officer for Uncle Robert Consulting (URC) & AgentLab.
Synthesize a deep, actionable Ideal Customer Profile (ICP) dossier for:

Business/Client: ${businessName}
Core Offering: ${offering}
Target Industry: ${industry}
Target Persona: ${targetAudience}
Primary Revenue Objective: ${primaryGoal}

Generate a comprehensive JSON response matching this EXACT schema:
{
  "name": "Concise Descriptive Title for this ICP (e.g. Scaling B2B Agency Founders ($1M-$3M))",
  "industry": "${industry}",
  "targetRole": "Exact job title(s) of the economic buyer (e.g. Founder / Managing Partner / VP Sales)",
  "companySize": "Ideal headcount range (e.g. 10-50 employees)",
  "revenueRange": "Annual revenue qualification (e.g. $1M - $5M ARR)",
  "acutePainTriggers": [
    "3 to 5 urgent, burning operational/revenue problems they experience daily"
  ],
  "buyingSignals": [
    "3 to 5 external observable triggers indicating they are ready to buy now (hiring, funding, tool fatigue, regulatory changes)"
  ],
  "disqualifiers": [
    "3 to 4 firmographic or behavioral red flags that make a prospect bad fit"
  ],
  "valueProposition": "A powerful 2-3 sentence positioning statement highlighting wedge equity, risk reversal, and measurable ROI.",
  "outreachAngles": [
    "3 specific, punchy hooks or message angles for LinkedIn cold outreach, email sequences, or founder roundtables"
  ]
}

Respond ONLY with the valid JSON object. Do not include markdown codeblocks or surrounding conversational text.`;

    let rawResponse = "";
    const models = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
    let succeeded = false;

    for (const modelName of models) {
      try {
        const result = await generateText({
          model: google(modelName) as any,
          prompt,
          temperature: 0.7,
        });
        rawResponse = result.text.trim();
        succeeded = true;
        break;
      } catch (mErr: any) {
        console.warn(`[ICP Generator] Model ${modelName} failed, falling back:`, mErr.message);
      }
    }

    if (!succeeded || !rawResponse) {
      throw new Error("All AI models failed to synthesize ICP.");
    }

    const cleanedJson = rawResponse.replace(/^```json\s*/, "").replace(/```$/, "").trim();
    const parsedIcp = JSON.parse(cleanedJson);

    let savedRecord = null;
    if (saveToDb) {
      const [inserted] = await db
        .insert(icpProfiles)
        .values({
          workspaceId: workspaceId || null,
          name: parsedIcp.name || `${industry} ICP Dossier`,
          industry: parsedIcp.industry || industry,
          targetRole: parsedIcp.targetRole || targetAudience,
          companySize: parsedIcp.companySize || "10-50 employees",
          revenueRange: parsedIcp.revenueRange || "$1M - $5M ARR",
          acutePainTriggers: parsedIcp.acutePainTriggers || [],
          buyingSignals: parsedIcp.buyingSignals || [],
          disqualifiers: parsedIcp.disqualifiers || [],
          valueProposition: parsedIcp.valueProposition || "",
          outreachAngles: parsedIcp.outreachAngles || [],
          source: "ai_synthesized",
        })
        .returning();
      savedRecord = inserted;
    }

    res.status(200).json({
      success: true,
      message: "ICP Profile synthesized successfully",
      profile: savedRecord || parsedIcp,
    });
  } catch (error: any) {
    console.error("[ICP Generator] Generation error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate ICP profile",
    });
  }
}

/**
 * POST /api/icp/profiles
 * Create/save a custom ICP profile.
 */
export async function createIcpProfile(req: Request, res: Response) {
  try {
    const workspaceId = (req as any).workspaceId || req.body.workspaceId;
    const {
      name,
      industry,
      targetRole,
      companySize,
      revenueRange,
      acutePainTriggers,
      buyingSignals,
      disqualifiers,
      valueProposition,
      outreachAngles,
    } = req.body;

    if (!name || !industry || !targetRole || !valueProposition) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: name, industry, targetRole, valueProposition",
      });
    }

    const [created] = await db
      .insert(icpProfiles)
      .values({
        workspaceId: workspaceId || null,
        name,
        industry,
        targetRole,
        companySize: companySize || "10-50",
        revenueRange: revenueRange || "$1M-$5M",
        acutePainTriggers: Array.isArray(acutePainTriggers) ? acutePainTriggers : [],
        buyingSignals: Array.isArray(buyingSignals) ? buyingSignals : [],
        disqualifiers: Array.isArray(disqualifiers) ? disqualifiers : [],
        valueProposition,
        outreachAngles: Array.isArray(outreachAngles) ? outreachAngles : [],
        source: "manual",
      })
      .returning();

    res.status(201).json({
      success: true,
      message: "ICP profile created successfully",
      profile: created,
    });
  } catch (error: any) {
    console.error("[ICP Generator] Create error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create ICP profile",
    });
  }
}

/**
 * DELETE /api/icp/profiles/:id
 * Delete an ICP profile.
 */
export async function deleteIcpProfile(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: "ID required" });
    }

    await db.delete(icpProfiles).where(eq(icpProfiles.id, id));

    res.status(200).json({
      success: true,
      message: "ICP profile deleted",
    });
  } catch (error: any) {
    console.error("[ICP Generator] Delete error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to delete ICP profile",
    });
  }
}
