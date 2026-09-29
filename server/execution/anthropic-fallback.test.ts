/**
 * Anthropic fallback leg (2026-09-27, CC-2026-09-25-015).
 *
 * The Gemini credential can fail in ways no project enablement fixes (the
 * AI Studio "AQ." auth-key rejection). These pins guard the cross-provider
 * last-resort attempt so it cannot silently disappear from the runner.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, "agent-runner.ts"), "utf8");

describe("anthropic fallback leg in the agent runner", () => {
  it("keeps the three Gemini attempts before the Anthropic attempt", () => {
    // 2026-09-28: chain refreshed to the -latest aliases plus a pinned 3.x id
    // — the old 2.5-era ids are withdrawn for new Gemini API accounts (live-
    // verified 2026-09-28; see CC-2026-09-25-014 evidence).
    expect(src).toContain('fallbackModels = ["gemini-flash-latest", "gemini-3.8-flash", "gemini-pro-latest"]');
    expect(src).toMatch(/maxRetries = 3 \+ \(anthropicKey \? 1 : 0\)/);
  });

  it("only uses Anthropic when ANTHROPIC_API_KEY is configured", () => {
    expect(src).toMatch(/anthropicKey = process\.env\.ANTHROPIC_API_KEY/);
    expect(src).toMatch(/useAnthropic = !!anthropicKey && attempt === maxRetries - 1/);
  });

  it("records the provider that actually answered for honest telemetry", () => {
    expect(src).toContain("modelUsed: usedAnthropic");
    // Cost ternary: Anthropic branch priced at Claude rates (1.0 in),
    // Gemini branch keeps the legacy 1.25 in / 5.0 out formula.
    expect(src).toMatch(/cost = usedAnthropic\s*\?\s*\(tokensPrompt \/ 1_000_000\) \* 1\.0/);
    expect(src).toMatch(/: \(tokensPrompt \/ 1_000_000\) \* 1\.25/);
  });
});
