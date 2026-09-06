/**
 * QUALITY EVALUATOR & SELF-CORRECTION FLYWHEEL
 * Evaluates generated workflow artifacts (social posts, briefs, reports) against
 * brand alignment, factual integrity, readability, and actionable CTA standards.
 */

export interface QualityRubric {
  brandAlignment: number; // 0-100
  actionableCta: number; // 0-100
  factualIntegrity: number; // 0-100
  formatting: number; // 0-100
}

export interface QualityEvaluationResult {
  score: number; // 0-100 composite
  grade: "A" | "B" | "C" | "F";
  passed: boolean;
  feedback: string[];
  suggestions: string[];
  rubric: QualityRubric;
  evaluatedAt: string;
}

/**
 * Deterministic & heuristic quality evaluator for generated workflow outputs.
 */
export function evaluateArtifactQuality(artifact: {
  title?: string;
  content: string;
  targetPlatform?: string | null;
  artifactType?: string | null;
}): QualityEvaluationResult {
  const content = artifact.content || "";
  const title = artifact.title || "";
  const platform = (artifact.targetPlatform || "linkedin").toLowerCase();
  const artifactType = (artifact.artifactType || "document").toLowerCase();

  const feedback: string[] = [];
  const suggestions: string[] = [];

  let brandAlignment = 95;
  let actionableCta = 90;
  let factualIntegrity = 100;
  let formatting = 90;

  // 1. Factual Integrity & Placeholder Detection
  const placeholderRegexes = [
    /\[(?:INSERT|YOUR|COMPANY|NAME|LINK|DATE|RECIPIENT|PROMPT|URL|PHONE|CLIENT)[^\]]*\]/i,
    /<(?:insert|your|company|link|url|name)[^>]*>/i,
    /TODO\s*:/i,
    /\b(example\.com|company_name_here|yourwebsite\.com|foo@bar\.com)\b/i,
    /\{\{(?:name|company|title|url)\}\}/i,
  ];

  const foundPlaceholders: string[] = [];
  for (const regex of placeholderRegexes) {
    const match = content.match(regex);
    if (match) {
      foundPlaceholders.push(match[0]);
    }
  }

  if (foundPlaceholders.length > 0) {
    factualIntegrity -= Math.min(60, foundPlaceholders.length * 25);
    feedback.push(`Contains unpopulated template placeholders: ${foundPlaceholders.join(", ")}`);
    suggestions.push("Populate or remove raw bracketed placeholders before scheduling/publishing.");
  } else {
    feedback.push("No raw placeholders or template leakage detected.");
  }

  // 2. Brand Voice & Doctrine (Concise, authentic, no corporate boilerplate)
  const fluffPhrases = [
    /in today'?s fast[- ]paced (?:world|digital landscape|environment)/i,
    /revolutionary game[- ]changer/i,
    /unlock the full potential/i,
    /synergistic paradigm shift/i,
    /delve into/i,
    /in conclusion, it is important to remember/i,
  ];

  let fluffCount = 0;
  for (const phrase of fluffPhrases) {
    if (phrase.test(content)) {
      fluffCount++;
    }
  }

  if (fluffCount > 0) {
    brandAlignment -= fluffCount * 15;
    feedback.push(`Detected ${fluffCount} generic AI filler phrase(s).`);
    suggestions.push("Replace generic phrasing with direct operator insights or specific numbers.");
  } else {
    feedback.push("Voice is direct, operator-focused, and free of generic AI fluff.");
  }

  // Positive Brand signals (mention of SOE, operating systems, leverage, workflow, systems)
  const positiveSignals = /\b(operating system|workflow|system|soes?|agentic|leverage|diagnostic|playbook|metrics?|roi|founders?)\b/i;
  if (positiveSignals.test(content)) {
    brandAlignment = Math.min(100, brandAlignment + 5);
  }

  // 3. CTA & Value Proposition
  const hasCta = /\b(comment|dm|reply|reach out|check out|read|download|link in|share your thoughts|what do you think|how do you)\b/i.test(
    content
  );

  if (!hasCta && artifactType === "post") {
    actionableCta -= 25;
    feedback.push("Missing clear call-to-action (CTA) or engagement hook.");
    suggestions.push("Add an engaging closing question, resource offer, or clear next step.");
  } else if (hasCta) {
    feedback.push("Includes clear actionable CTA / discussion prompt.");
  }

  // 4. Formatting & Readability
  const charCount = content.trim().length;
  const lineBreaks = (content.match(/\n/g) || []).length;

  if (charCount < 60) {
    formatting -= 30;
    feedback.push("Content length is extremely short (< 60 characters).");
    suggestions.push("Expand body with supporting context or takeaways.");
  } else if (charCount > 3500 && platform === "linkedin") {
    formatting -= 15;
    feedback.push("Content exceeds typical LinkedIn character limit (3,000 chars).");
    suggestions.push("Condense into a concise 1,200 - 2,000 character post.");
  }

  if (lineBreaks < 2 && charCount > 300) {
    formatting -= 15;
    feedback.push("Content appears as a single wall of text without paragraph breaks.");
    suggestions.push("Add spacing between paragraphs or bullet points to improve readability.");
  }

  // Calculate composite score (weighted average)
  brandAlignment = Math.max(0, Math.min(100, brandAlignment));
  actionableCta = Math.max(0, Math.min(100, actionableCta));
  factualIntegrity = Math.max(0, Math.min(100, factualIntegrity));
  formatting = Math.max(0, Math.min(100, formatting));

  const compositeScore = Math.round(
    brandAlignment * 0.3 +
    factualIntegrity * 0.35 +
    actionableCta * 0.2 +
    formatting * 0.15
  );

  let grade: "A" | "B" | "C" | "F" = "A";
  if (compositeScore >= 88) grade = "A";
  else if (compositeScore >= 75) grade = "B";
  else if (compositeScore >= 60) grade = "C";
  else grade = "F";

  const passed = compositeScore >= 70 && foundPlaceholders.length === 0;

  return {
    score: compositeScore,
    grade,
    passed,
    feedback,
    suggestions,
    rubric: {
      brandAlignment,
      actionableCta,
      factualIntegrity,
      formatting,
    },
    evaluatedAt: new Date().toISOString(),
  };
}

/**
 * Refines an artifact's content given operator feedback or automated suggestions.
 */
export function buildRefinementPrompt(
  originalContent: string,
  userInstructions: string,
  evaluation: QualityEvaluationResult
): string {
  return `You are refining an operational artifact for AgentLab OS.

CURRENT DRAFT:
"""
${originalContent}
"""

QUALITY EVALUATION ISSUES:
${evaluation.feedback.map(f => `- ${f}`).join("\n")}

RECOMMENDED FIXES:
${evaluation.suggestions.map(s => `- ${s}`).join("\n")}

USER OPERATOR INSTRUCTIONS:
"${userInstructions || "Address all quality evaluation issues and make the output punchier and ready to publish."}"

Please produce an updated, refined, ready-to-use version of this artifact. Return only the refined content directly without conversational filler.`;
}
