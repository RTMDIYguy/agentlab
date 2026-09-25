import { describe, it, expect } from "vitest";
import { classifyRunFailure } from "./ops-watchdog";

/**
 * Watchdog root-cause classification (CC-2026-09-24-005).
 *
 * These classes map 1:1 onto the real failure modes recorded in this
 * deployment's workflow_runs history (quota exhaustion, dead gemini-1.5
 * models, invalid API keys, refusal tripwire, ECONNREFUSED flap).
 */
describe("ops watchdog failure classification", () => {
  it("classifies provider quota exhaustion", () => {
    const out = classifyRunFailure(
      "Failed after 3 attempts. Last error: AI_APICallError: You exceeded your current quota, please check your plan and billing details."
    );
    expect(out.category).toBe("quota");
    expect(out.recommendedFix).toMatch(/billing|quota/i);
  });

  it("classifies retired models (the gemini-1.5 class)", () => {
    const out = classifyRunFailure(
      "Step 1 failed: models/gemini-1.5-pro is not found for API version v1beta, or is not supported for generateContent."
    );
    expect(out.category).toBe("dead_model");
  });

  it("classifies invalid API keys", () => {
    const out = classifyRunFailure("API key not valid. Please pass a valid API key.");
    expect(out.category).toBe("auth");
  });

  it("classifies the refusal tripwire", () => {
    const out = classifyRunFailure(
      'Agent stated execution limitation or passive non-execution: "cannot directly access" found in response.'
    );
    expect(out.category).toBe("agent_refusal");
  });

  it("classifies connectivity refusals (the ECONNREFUSED flap)", () => {
    const out = classifyRunFailure("Failed query: select ... cause: AggregateError [ECONNREFUSED]");
    expect(out.category).toBe("connectivity");
  });

  it("falls back to unknown without throwing on empty errors", () => {
    expect(classifyRunFailure(null).category).toBe("unknown");
    expect(classifyRunFailure("").category).toBe("unknown");
    expect(classifyRunFailure("mystery failure mode").category).toBe("unknown");
  });
});
