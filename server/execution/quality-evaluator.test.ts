import { describe, it, expect } from "vitest";
import {
  evaluateArtifactQuality,
  buildRefinementPrompt,
} from "./quality-evaluator";

describe("Quality Evaluator & Self-Correction Engine", () => {
  it("scores high-quality, authentic agency posts with Grade A", () => {
    const post = {
      title: "How We Reduced Pipeline Friction",
      targetPlatform: "linkedin",
      artifactType: "post",
      content: `Most agency founders try to fix revenue bottlenecks by hiring more reps. That is the most expensive mistake in the book.

At URC, we build an agentic operating system where 6 autonomous compute nodes handle the initial diagnosis, triage, and lead enrichment before a human ever steps in.

The result: 450ms turnaround and 100% data audit trails.

What operating bottlenecks are slowing down your team this quarter? Share your thoughts below or DM for our diagnostic playbook. #AgencyOps #AgentLab #Automation`,
    };

    const evaluation = evaluateArtifactQuality(post);

    expect(evaluation.score).toBeGreaterThanOrEqual(85);
    expect(evaluation.grade).toBe("A");
    expect(evaluation.passed).toBe(true);
    expect(evaluation.rubric.factualIntegrity).toBe(100);
    expect(evaluation.feedback).toContain("No raw placeholders or template leakage detected.");
    expect(evaluation.feedback).toContain("Includes clear actionable CTA / discussion prompt.");
  });

  it("detects raw template placeholders and flags factual integrity failure", () => {
    const flawedPost = {
      title: "Draft Post",
      targetPlatform: "linkedin",
      artifactType: "post",
      content: `Hello [INSERT NAME], we are excited to work with [COMPANY NAME]. Please click [YOUR LINK] or visit http://example.com/demo. TODO: add metric.`,
    };

    const evaluation = evaluateArtifactQuality(flawedPost);

    expect(evaluation.score).toBeLessThan(75);
    expect(evaluation.passed).toBe(false);
    expect(evaluation.rubric.factualIntegrity).toBeLessThan(70);
    expect(evaluation.feedback.some(f => f.includes("unpopulated template placeholders"))).toBe(true);
    expect(evaluation.suggestions.some(s => s.includes("bracketed placeholders"))).toBe(true);
  });

  it("penalizes generic AI fluff phrases and offers actionable suggestions", () => {
    const fluffyPost = {
      title: "Generic Article",
      targetPlatform: "linkedin",
      artifactType: "post",
      content: `In today's fast-paced digital landscape, businesses must unlock the full potential of synergistic paradigm shift technology to revolutionize their workflows. Delve into the exciting journey ahead.`,
    };

    const evaluation = evaluateArtifactQuality(fluffyPost);

    expect(evaluation.rubric.brandAlignment).toBeLessThan(70);
    expect(evaluation.feedback.some(f => f.includes("generic AI filler"))).toBe(true);
    expect(evaluation.suggestions.some(s => s.includes("direct operator insights"))).toBe(true);
  });

  it("builds a structured refinement prompt for agent self-correction", () => {
    const original = "In today's fast-paced world, [COMPANY] does stuff.";
    const evaluation = evaluateArtifactQuality({ content: original, artifactType: "post" });
    const prompt = buildRefinementPrompt(original, "Make it punchy for agency founders", evaluation);

    expect(prompt).toContain("CURRENT DRAFT:");
    expect(prompt).toContain("QUALITY EVALUATION ISSUES:");
    expect(prompt).toContain("RECOMMENDED FIXES:");
    expect(prompt).toContain("Make it punchy for agency founders");
  });
});
