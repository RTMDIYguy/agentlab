import { Request, Response } from "express";
import { db } from "../db";
import { assessmentQuestions, assessmentSessions } from "../schema";
import { eq, and, desc, or, isNull } from "drizzle-orm";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

// Default seed bank of 18 high-signal consulting questions
export const defaultQuestionSeed = [
  {
    domain: "Operations",
    depth: "exploratory",
    text: "Walk me through what happens from the moment a new client says yes to the moment the work is fully delivered.",
    skill: "Process Discovery",
    evaluation: "Looks for sequence clarity, hidden handoffs, undocumented steps, and delay points.",
    signals: ["workflow", "handoff", "delivery", "onboarding", "process"],
    source: "system",
  },
  {
    domain: "Operations",
    depth: "diagnostic",
    text: "Where does work most often slow down, get rechecked, or require someone to chase an update?",
    skill: "Bottleneck Identification",
    evaluation: "Assesses whether the client can name friction points and distinguish symptoms from root causes.",
    signals: ["delay", "bottleneck", "follow up", "status", "rework", "chase"],
    source: "system",
  },
  {
    domain: "Operations",
    depth: "executive",
    text: "If the business doubled next quarter, which part of the operating system would break first?",
    skill: "Scalability Assessment",
    evaluation: "Reveals the highest-risk constraint in people, process, tools, or decision flow.",
    signals: ["scale", "growth", "capacity", "team", "break"],
    source: "system",
  },
  {
    domain: "Sales",
    depth: "exploratory",
    text: "How does a new lead usually enter the business, and what has to happen before they become a qualified opportunity?",
    skill: "Lead Path Mapping",
    evaluation: "Checks whether the client has a defined path from attention to qualification.",
    signals: ["lead", "prospect", "referral", "inquiry", "pipeline"],
    source: "system",
  },
  {
    domain: "Sales",
    depth: "diagnostic",
    text: "Which follow-up step is most likely to be missed when someone shows interest?",
    skill: "Follow-Up Reliability",
    evaluation: "Identifies lost revenue risk from inconsistent nurture, ownership, or timing.",
    signals: ["follow up", "reply", "email", "call", "missed", "nurture"],
    source: "system",
  },
  {
    domain: "Sales",
    depth: "executive",
    text: "What would make the current sales process easier to trust without adding more meetings?",
    skill: "Sales System Design",
    evaluation: "Tests whether the client needs better tracking, clearer stages, stronger handoffs, or decision rules.",
    signals: ["trust", "meeting", "crm", "stage", "decision"],
    source: "system",
  },
  {
    domain: "Marketing",
    depth: "exploratory",
    text: "What are you currently publishing or sharing that reliably starts useful conversations?",
    skill: "Content Signal Review",
    evaluation: "Looks for proof that content is tied to audience response rather than activity volume.",
    signals: ["content", "linkedin", "post", "campaign", "engagement"],
    source: "system",
  },
  {
    domain: "Marketing",
    depth: "diagnostic",
    text: "How do you connect marketing activity to leads, booked calls, or revenue opportunities today?",
    skill: "Marketing Attribution",
    evaluation: "Assesses whether the client can trace marketing effort to business outcomes.",
    signals: ["roi", "analytics", "lead", "revenue", "conversion", "campaign"],
    source: "system",
  },
  {
    domain: "Marketing",
    depth: "executive",
    text: "Which market message is strongest enough that the business should build repeatable campaigns around it?",
    skill: "Positioning Judgment",
    evaluation: "Tests clarity of offer, audience, pain point, and proof.",
    signals: ["positioning", "message", "offer", "audience", "proof"],
    source: "system",
  },
  {
    domain: "Finance",
    depth: "exploratory",
    text: "Which numbers do you review every week before deciding what the business can afford to do next?",
    skill: "Financial Visibility",
    evaluation: "Surfaces whether the client has a working control layer for cash, revenue, and obligations.",
    signals: ["cash", "budget", "expense", "invoice", "revenue"],
    source: "system",
  },
  {
    domain: "Finance",
    depth: "diagnostic",
    text: "Where do expenses, subscriptions, or tool costs become hard to justify against current revenue?",
    skill: "Cost Control",
    evaluation: "Identifies free-bootstrap or paid-tool limit walls before they become emergencies.",
    signals: ["subscription", "tool", "cost", "credit", "bill", "budget"],
    source: "system",
  },
  {
    domain: "Finance",
    depth: "executive",
    text: "What revenue signal would justify upgrading the next paid tool or hiring outside help?",
    skill: "Investment Threshold Design",
    evaluation: "Tests whether spending decisions are tied to revenue, capacity, and timing.",
    signals: ["upgrade", "hire", "funding", "investment", "revenue"],
    source: "system",
  },
  {
    domain: "Technology",
    depth: "exploratory",
    text: "Which tools does the team rely on every day, and where does information have to be copied by hand?",
    skill: "Toolchain Mapping",
    evaluation: "Finds integration gaps, duplicate data entry, and tool sprawl.",
    signals: ["tool", "software", "spreadsheet", "copy", "manual", "integration"],
    source: "system",
  },
  {
    domain: "Technology",
    depth: "diagnostic",
    text: "What repetitive task would create the most relief if it were automated safely?",
    skill: "Automation Opportunity Sizing",
    evaluation: "Separates high-leverage automation candidates from convenience automations.",
    signals: ["automate", "automation", "repeat", "manual", "relief", "task"],
    source: "system",
  },
  {
    domain: "Technology",
    depth: "executive",
    text: "Where would automation create risk if the approval step or exception path were not designed well?",
    skill: "Automation Governance",
    evaluation: "Checks for judgment gates, compliance needs, exception handling, and rollback plans.",
    signals: ["approval", "risk", "exception", "compliance", "automation"],
    source: "system",
  },
  {
    domain: "Leadership",
    depth: "exploratory",
    text: "Who makes the final call when priorities conflict, and how does the team know the decision was made?",
    skill: "Decision Flow",
    evaluation: "Reveals unclear ownership, decision latency, and communication gaps.",
    signals: ["decision", "priority", "owner", "team", "communication"],
    source: "system",
  },
  {
    domain: "Leadership",
    depth: "diagnostic",
    text: "Which responsibilities live in someone's head instead of in a process the team can repeat?",
    skill: "Knowledge Capture",
    evaluation: "Identifies key-person dependency and documentation needs.",
    signals: ["knowledge", "training", "sop", "documentation", "responsibility"],
    source: "system",
  },
  {
    domain: "Leadership",
    depth: "executive",
    text: "What operating habit would most improve trust between leadership, staff, and clients?",
    skill: "Operating Culture",
    evaluation: "Identifies accountability rhythms and communication friction.",
    signals: ["trust", "cadence", "meeting", "feedback", "culture"],
    source: "system",
  },
];

/**
 * Ensure the assessment questions table is seeded with baseline questions.
 */
export async function seedAssessmentQuestionsIfEmpty(workspaceId?: string) {
  try {
    const existing = await db.select().from(assessmentQuestions).limit(1);
    if (existing.length === 0) {
      console.log("[Assessment Questions] Table is empty. Seeding 18 default questions...");
      await db.insert(assessmentQuestions).values(
        defaultQuestionSeed.map(q => ({
          domain: q.domain,
          depth: q.depth,
          text: q.text,
          skill: q.skill,
          evaluation: q.evaluation,
          signals: q.signals,
          isCustom: false,
          source: "system",
          workspaceId: workspaceId || null,
        }))
      );
      console.log("[Assessment Questions] Default questions seeded successfully.");
    }
  } catch (err) {
    console.error("[Assessment Questions] Error during seed check:", err);
  }
}

/**
 * GET /api/assessment-questions
 * List all assessment questions with optional domain & depth filtering.
 */
export async function listAssessmentQuestions(req: Request, res: Response) {
  try {
    const workspaceId = (req as any).workspaceId || (req.query.workspaceId as string);
    await seedAssessmentQuestionsIfEmpty(workspaceId);

    const { domain, depth } = req.query;

    const conditions = [];

    // Allow questions that are either global (workspaceId is null) or belong to this workspace
    if (workspaceId) {
      conditions.push(or(isNull(assessmentQuestions.workspaceId), eq(assessmentQuestions.workspaceId, workspaceId)));
    }

    if (domain && typeof domain === "string" && domain.toLowerCase() !== "all") {
      conditions.push(eq(assessmentQuestions.domain, domain));
    }

    if (depth && typeof depth === "string" && depth.toLowerCase() !== "all") {
      conditions.push(eq(assessmentQuestions.depth, depth));
    }

    const questions = await db
      .select()
      .from(assessmentQuestions)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(assessmentQuestions.createdAt));

    res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error: any) {
    console.error("[Assessment Questions] Error listing questions:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to list assessment questions",
    });
  }
}

/**
 * POST /api/assessment-questions
 * Create a new custom assessment question.
 */
export async function createAssessmentQuestion(req: Request, res: Response) {
  try {
    const workspaceId = (req as any).workspaceId || req.body.workspaceId;
    const { domain, depth, text, skill, evaluation, signals, source } = req.body;

    if (!domain || !text || !skill || !evaluation) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: domain, text, skill, evaluation",
      });
    }

    const [created] = await db
      .insert(assessmentQuestions)
      .values({
        workspaceId: workspaceId || null,
        domain,
        depth: depth || "exploratory",
        text,
        skill,
        evaluation,
        signals: Array.isArray(signals) ? signals : [],
        isCustom: true,
        source: source || "manual",
      })
      .returning();

    res.status(201).json({
      success: true,
      message: "Assessment question created successfully",
      question: created,
    });
  } catch (error: any) {
    console.error("[Assessment Questions] Error creating question:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create assessment question",
    });
  }
}

/**
 * DELETE /api/assessment-questions/:id
 * Delete a custom question.
 */
export async function deleteAssessmentQuestion(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: "Question ID is required" });
    }

    await db.delete(assessmentQuestions).where(eq(assessmentQuestions.id, id));

    res.status(200).json({
      success: true,
      message: "Assessment question deleted",
    });
  } catch (error: any) {
    console.error("[Assessment Questions] Error deleting question:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to delete assessment question",
    });
  }
}

/**
 * POST /api/assessment-questions/generate-ai
 * Use Gemini to synthesize 3-5 new high-signal assessment questions for a domain or focus area.
 */
export async function generateAIAssessmentQuestions(req: Request, res: Response) {
  try {
    const { domain = "Operations", focusArea = "General Discovery", industry = "B2B Professional Services", count = 3 } = req.body;
    const workspaceId = (req as any).workspaceId || req.body.workspaceId;

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        success: false,
        error: "GOOGLE_GENERATIVE_AI_API_KEY not configured",
      });
    }

    const google = createGoogleGenerativeAI({ apiKey });
    const prompt = `You are an elite management consultant and COO diagnostics architect for Uncle Robert Consulting (URC) & AgentLab.
Generate ${count} high-signal, deep-probing diagnostic assessment questions for discovery calls with business founders.

Domain: ${domain}
Focus Area: ${focusArea}
Target Industry: ${industry}

Required JSON format:
[
  {
    "domain": "${domain}",
    "depth": "exploratory" | "diagnostic" | "executive",
    "text": "The exact verbatim question to ask the founder.",
    "skill": "Name of the consulting assessment skill (e.g., Process Discovery, Latency Audit, Revenue Attribution)",
    "evaluation": "What the consultant should listen for in the answer (red flags, structural gaps, indicators).",
    "signals": ["3 to 6 keyword signals to detect in notes (e.g., 'delay', 'handoff', 'manual', 'pipeline')"]
  }
]

Respond ONLY with valid JSON array containing the questions. Do not include markdown codeblocks or explanation.`;

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
        console.warn(`[AI Question Gen] Model ${modelName} failed, trying next fallback:`, mErr.message);
      }
    }

    if (!succeeded || !rawResponse) {
      throw new Error("All AI models failed to generate questions.");
    }

    // Clean JSON response
    const cleanedJson = rawResponse.replace(/^```json\s*/, "").replace(/```$/, "").trim();
    const parsedQuestions = JSON.parse(cleanedJson);

    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
      throw new Error("Invalid question format received from AI.");
    }

    // Insert into database
    const inserted = await db
      .insert(assessmentQuestions)
      .values(
        parsedQuestions.map((q: any) => ({
          workspaceId: workspaceId || null,
          domain: q.domain || domain,
          depth: q.depth || "diagnostic",
          text: q.text,
          skill: q.skill || "Diagnostic Inquiry",
          evaluation: q.evaluation || "Evaluates operational maturity.",
          signals: Array.isArray(q.signals) ? q.signals : [],
          isCustom: true,
          source: "ai_synthesized",
        }))
      )
      .returning();

    res.status(201).json({
      success: true,
      message: `Generated and persisted ${inserted.length} new assessment questions`,
      questions: inserted,
    });
  } catch (error: any) {
    console.error("[Assessment Questions] Error generating AI questions:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate AI assessment questions",
    });
  }
}

/**
 * POST /api/assessment-sessions
 * Save a completed diagnostic/assessment session with call notes and detected findings.
 */
export async function saveAssessmentSession(req: Request, res: Response) {
  try {
    const workspaceId = (req as any).workspaceId || req.body.workspaceId;
    const { clientName, domain, callNotes, detectedSignals, findings, selectedQuestionIds } = req.body;

    if (!callNotes) {
      return res.status(400).json({ success: false, error: "Call notes are required" });
    }

    const [saved] = await db
      .insert(assessmentSessions)
      .values({
        workspaceId: workspaceId || null,
        clientName: clientName || "Client Discovery",
        domain: domain || "All",
        callNotes,
        detectedSignals: Array.isArray(detectedSignals) ? detectedSignals : [],
        findings: Array.isArray(findings) ? findings : [],
        selectedQuestionIds: Array.isArray(selectedQuestionIds) ? selectedQuestionIds : [],
      })
      .returning();

    res.status(201).json({
      success: true,
      message: "Assessment session saved successfully",
      session: saved,
    });
  } catch (error: any) {
    console.error("[Assessment Questions] Error saving assessment session:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to save assessment session",
    });
  }
}
