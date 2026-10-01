import { readFileSync } from "fs";
import path from "node:path";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { handleOrchestratorChat } from "./orchestrator";
import { createGoogleProvider, isGoogleAiConfigured } from "../_core/google-ai";
import { generateText, generateObject } from "ai";

// CC-2026-09-30-012 regression pins. Live evidence 2026-09-30: the pinned
// "gemini-2.5-flash" id 404s for new accounts ("no longer available to new
// users"); the old catch-all then synthesized the CANNED fallback DAG for
// every failure — so a conversational question ("What time was your last
// update?") died into a fabricated 4-step proposal speaking in the first
// person. These tests pin: (1) both chat paths ride the resilient model
// chain; (2) when the chain is exhausted the response degrades HONESTLY —
// no proposal object, no fabricated analysis, model named truthfully.

vi.mock("../db", () => ({ getDb: vi.fn(async () => null) }));

// Keep the REAL withGoogleModelChain/GOOGLE_MODEL_CHAIN; fake only the
// credential gate and provider construction.
vi.mock("../_core/google-ai", async importOriginal => ({
  ...(await importOriginal<typeof import("../_core/google-ai")>()),
  isGoogleAiConfigured: vi.fn(() => true),
  createGoogleProvider: vi.fn(() => (modelId: string) => ({ modelId })),
}));

vi.mock("ai", () => ({
  generateText: vi.fn(),
  generateObject: vi.fn(),
}));

function makeReqRes(prompt: string) {
  const res: any = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
  const req: any = { body: { prompt }, workspaceId: "11111111-1111-1111-1111-111111111111" };
  return { req, res };
}

// handleOrchestratorChat responds via res.json; pull the payload out of it.
function jsonPayload(res: any): any {
  expect(res.json).toHaveBeenCalledTimes(1);
  return res.json.mock.calls[0][0];
}

describe("orchestrator chat fallback honesty (CC-2026-09-30-012)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("conversational question + exhausted chain: NO canned DAG, honest unavailability reply", async () => {
    vi.mocked(generateText).mockRejectedValue(
      new Error("404 NOT_FOUND: This model is no longer available to new users.")
    );

    const { req, res } = makeReqRes("What time was your last update?");
    await handleOrchestratorChat(req, res);
    const payload = jsonPayload(res);

    // The exact user-reported symptom: a question producing the template DAG.
    expect(payload.proposal).toBeUndefined();
    expect(payload.reply).toContain("could not reach the Gemini model");
    expect(payload.executionMetrics.model).toBe("urc-model-unavailable");
    expect(payload.executionMetrics.tokensUsed).toBeNull();
    // The chain was actually tried before giving up.
    expect(vi.mocked(generateText)).toHaveBeenCalledTimes(3);
    // The canned template's fingerprint must not leak into the reply.
    expect(payload.reply).not.toContain("Event Trigger Ingestion");
  });

  it("proposal request + exhausted chain: honest refusal, no fabricated proposal object", async () => {
    vi.mocked(generateObject).mockRejectedValue(
      new Error("404 NOT_FOUND: This model is no longer available to new users.")
    );

    const { req, res } = makeReqRes("build me a lead outreach workflow");
    await handleOrchestratorChat(req, res);
    const payload = jsonPayload(res);

    expect(payload.proposal).toBeUndefined();
    expect(payload.reply).toContain("NOT synthesized a DAG proposal");
    expect(payload.executionMetrics.model).toBe("urc-model-unavailable");
    expect(vi.mocked(generateObject)).toHaveBeenCalledTimes(3);
  });

  it("conversational success reports the model that actually answered", async () => {
    vi.mocked(generateText).mockResolvedValue({
      text: "Your last run completed 12 minutes ago.",
      usage: { totalTokens: 42 },
    } as any);

    const { req, res } = makeReqRes("What time was your last update?");
    await handleOrchestratorChat(req, res);
    const payload = jsonPayload(res);

    expect(payload.reply).toContain("12 minutes ago");
    expect(payload.proposal).toBeUndefined();
    expect(payload.executionMetrics.model).toBe("gemini-flash-latest");
    expect(payload.executionMetrics.tokensUsed).toBe(42);
  });

  it("proposal success reports the model that actually answered", async () => {
    vi.mocked(generateObject).mockResolvedValue({
      object: { name: "Lead Outreach", departmentCode: "sal", reply: "Here is your DAG." },
      usage: { totalTokens: 7 },
    } as any);

    const { req, res } = makeReqRes("build me a lead outreach workflow");
    await handleOrchestratorChat(req, res);
    const payload = jsonPayload(res);

    expect(payload.proposal).toBeDefined();
    expect(payload.reply).toBe("Here is your DAG.");
    expect(payload.executionMetrics.model).toBe("gemini-flash-latest");
    expect(payload.executionMetrics.tokensUsed).toBe(7);
  });

  it("source pin: no retired pinned model ids and no deterministic-DAG catch-all", () => {
    const src = readFileSync(
      path.join(process.cwd(), "server", "controllers", "orchestrator.ts"),
      "utf8"
    );
    // Retired ids must never be bound to google(...) again.
    expect(src).not.toMatch(/google\(\s*["'`]gemini-(1\.5|2\.0|2\.5)/);
    // The catch-all that fabricated DAGs for every failure is gone.
    expect(src).not.toContain("falling back to deterministic URC engine");
    expect(src).toContain("urc-model-unavailable");
    // Both paths ride the shared resilient chain.
    expect(src).toContain("withGoogleModelChain");
    expect(createGoogleProvider).toBeDefined();
    expect(isGoogleAiConfigured).toBeDefined();
  });
});
