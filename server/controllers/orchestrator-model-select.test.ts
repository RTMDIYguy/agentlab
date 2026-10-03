import { readFileSync } from "fs";
import path from "node:path";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  handleOrchestratorChat,
  listAvailableChatModels,
  listOrchestratorModels,
  resolveChatModelRequest,
} from "./orchestrator";
import { GOOGLE_MODEL_CHAIN } from "../_core/google-ai";
import { generateText, generateObject } from "ai";

// CC-2026-10-02-021 regression pins. Before this entry the ops-agent model
// selector was display-only: req.body.model was read and never used, and the
// stored defaultModel lead documented in CC-2026-10-01-009 was never passed
// to the chain helper. These tests pin: (1) the catalog only offers what the
// deployment can run (GPT-4o is never offered — no OpenAI provider exists);
// (2) requested Gemini ids lead the chain and are reported back; (3) unknown
// ids fall to the chain WITH an honest modelNote; (4) urc-fallback is the
// explicit deterministic mode (CC-2026-09-30-012's silent-fallback ban stays
// untouched — the LLM is never called implicitly); (5) Claude routes to
// Anthropic only when a key exists.

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

vi.mock("@ai-sdk/anthropic", () => ({
  createAnthropic: vi.fn(() => (modelId: string) => ({ anthropicModelId: modelId })),
}));

const OPERATOR_WS = "11111111-1111-1111-1111-111111111111";
const ALL_ACCESS_WS = "00000000-0000-0000-0000-000000000000";

function makeReqRes(prompt: string, model?: string, workspaceId = OPERATOR_WS) {
  const res: any = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
  const req: any = {
    body: { prompt, ...(model !== undefined ? { model } : {}) },
    workspaceId,
  };
  return { req, res };
}

function jsonPayload(res: any): any {
  expect(res.json).toHaveBeenCalledTimes(1);
  return res.json.mock.calls[0][0];
}

beforeEach(() => {
  vi.clearAllMocks();
  // Tests own the key presence explicitly — the host machine's env must not
  // leak into "no Anthropic key" expectations.
  vi.stubEnv("ANTHROPIC_API_KEY", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("data-driven selector catalog (GET /api/orchestrator/models)", () => {
  it("offers only what the deployment can run — never GPT-4o", () => {
    const withGoogle = listAvailableChatModels({
      googleConfigured: true,
      anthropicKey: null,
    }).map(m => m.id);
    expect(withGoogle).toContain("gemini-flash-latest");
    expect(withGoogle).toContain("gemini-pro-latest");
    expect(withGoogle).toContain("urc-fallback");
    expect(withGoogle).not.toContain("gpt-4o");
    expect(withGoogle).not.toContain("claude-haiku-4-5");

    const withClaude = listAvailableChatModels({
      googleConfigured: true,
      anthropicKey: "sk-ant-test",
    }).map(m => m.id);
    expect(withClaude).toContain("claude-haiku-4-5");

    const offline = listAvailableChatModels({
      googleConfigured: false,
      anthropicKey: null,
    }).map(m => m.id);
    expect(offline).toEqual(["urc-fallback"]);
  });

  it("the HTTP endpoint returns the runnable catalog", () => {
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    listOrchestratorModels({} as any, res);
    expect(res.status).toHaveBeenCalledWith(200);
    const payload = jsonPayload(res);
    const ids = payload.models.map((m: any) => m.id);
    expect(ids).toContain("gemini-flash-latest");
    expect(ids).toContain("urc-fallback");
    expect(ids).not.toContain("gpt-4o");
    for (const m of payload.models) {
      expect(m.name).toBeTruthy();
      expect(m.provider).toBeTruthy();
    }
  });
});

describe("request resolution (resolveChatModelRequest)", () => {
  it("maps every selector id to a request the server can honor", () => {
    expect(resolveChatModelRequest("gemini-pro-latest", { anthropicKey: null })).toEqual({
      kind: "google",
      lead: "gemini-pro-latest",
    });
    expect(resolveChatModelRequest(undefined, { anthropicKey: null })).toEqual({
      kind: "google",
      lead: null,
    });
    expect(resolveChatModelRequest("urc-fallback", { anthropicKey: null })).toEqual({
      kind: "deterministic",
    });
    expect(resolveChatModelRequest("claude-haiku-4-5", { anthropicKey: "k" })).toEqual({
      kind: "anthropic",
      id: "claude-haiku-4-5",
      key: "k",
    });
    expect(resolveChatModelRequest("claude-haiku-4-5", { anthropicKey: null })).toEqual({
      kind: "unsupported",
      requested: "claude-haiku-4-5",
    });
    expect(resolveChatModelRequest("gpt-4o", { anthropicKey: "k" })).toEqual({
      kind: "unsupported",
      requested: "gpt-4o",
    });
  });
});

describe("chat honors the requested model (handleOrchestratorChat)", () => {
  it("a requested Gemini id leads the chain and is the model reported back", async () => {
    vi.mocked(generateText).mockResolvedValue({
      text: "Your last run completed 12 minutes ago.",
      usage: { totalTokens: 5 },
    } as any);

    const { req, res } = makeReqRes("What time was your last update?", "gemini-pro-latest");
    await handleOrchestratorChat(req, res);
    const payload = jsonPayload(res);

    const firstCall = vi.mocked(generateText).mock.calls[0][0] as any;
    expect(firstCall.model.modelId).toBe("gemini-pro-latest");
    expect(payload.executionMetrics.model).toBe("gemini-pro-latest");
    expect(payload.executionMetrics.tokensUsed).toBe(5);
    expect(payload.executionMetrics.modelNote).toBeUndefined();
  });

  it("the requested id leads the proposal path too", async () => {
    vi.mocked(generateObject).mockResolvedValue({
      object: { name: "Lead Outreach", departmentCode: "sal", reply: "Here is your DAG." },
      usage: { totalTokens: 7 },
    } as any);

    const { req, res } = makeReqRes("build me a lead outreach workflow", "gemini-pro-latest");
    await handleOrchestratorChat(req, res);
    const payload = jsonPayload(res);

    const firstCall = vi.mocked(generateObject).mock.calls[0][0] as any;
    expect(firstCall.model.modelId).toBe("gemini-pro-latest");
    expect(payload.proposal).toBeDefined();
    expect(payload.executionMetrics.model).toBe("gemini-pro-latest");
  });

  it("an unwired model (gpt-4o) falls to the chain and the response says so", async () => {
    vi.mocked(generateText).mockResolvedValue({
      text: "Chain answered.",
      usage: { totalTokens: 3 },
    } as any);

    const { req, res } = makeReqRes("What time was your last update?", "gpt-4o");
    await handleOrchestratorChat(req, res);
    const payload = jsonPayload(res);

    const firstCall = vi.mocked(generateText).mock.calls[0][0] as any;
    expect(firstCall.model.modelId).toBe(GOOGLE_MODEL_CHAIN[0]);
    expect(payload.executionMetrics.model).toBe(GOOGLE_MODEL_CHAIN[0]);
    expect(payload.executionMetrics.modelNote).toContain("gpt-4o");
    expect(payload.executionMetrics.modelNote).toContain("not available on this deployment");
  });

  it("Claude routes to Anthropic when a key exists — and is reported honestly", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "sk-ant-test");
    vi.mocked(generateText).mockResolvedValue({
      text: "Claude answered.",
      usage: { totalTokens: 9 },
    } as any);

    const { req, res } = makeReqRes("What time was your last update?", "claude-haiku-4-5");
    await handleOrchestratorChat(req, res);
    const payload = jsonPayload(res);

    const firstCall = vi.mocked(generateText).mock.calls[0][0] as any;
    expect(firstCall.model.anthropicModelId).toBe("claude-haiku-4-5");
    expect(vi.mocked(generateText)).toHaveBeenCalledTimes(1); // Google chain untouched
    expect(payload.executionMetrics.model).toBe("anthropic:claude-haiku-4-5");
    expect(payload.executionMetrics.modelNote).toBeUndefined();
  });

  it("Claude without a key falls to the chain with an honest note", async () => {
    vi.mocked(generateText).mockResolvedValue({
      text: "Chain answered.",
      usage: { totalTokens: 3 },
    } as any);

    const { req, res } = makeReqRes("What time was your last update?", "claude-haiku-4-5");
    await handleOrchestratorChat(req, res);
    const payload = jsonPayload(res);

    const firstCall = vi.mocked(generateText).mock.calls[0][0] as any;
    expect(firstCall.model.modelId).toBe(GOOGLE_MODEL_CHAIN[0]);
    expect(payload.executionMetrics.modelNote).toContain("claude-haiku-4-5");
  });

  it("a failed Claude call degrades to the Google chain with a note", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "sk-ant-test");
    vi.mocked(generateText).mockImplementation(async (opts: any) => {
      if (opts?.model?.anthropicModelId) throw new Error("anthropic down");
      return { text: "Google saved it.", usage: { totalTokens: 4 } } as any;
    });

    const { req, res } = makeReqRes("What time was your last update?", "claude-haiku-4-5");
    await handleOrchestratorChat(req, res);
    const payload = jsonPayload(res);

    expect(payload.executionMetrics.model).toBe(GOOGLE_MODEL_CHAIN[0]);
    expect(payload.executionMetrics.modelNote).toBe(
      "Claude request failed — the Google chain answered instead."
    );
  });
});

describe("explicit deterministic mode (urc-fallback)", () => {
  it("synthesizes the deterministic proposal without any model call", async () => {
    const { req, res } = makeReqRes(
      "build me a lead outreach workflow",
      "urc-fallback",
      ALL_ACCESS_WS
    );
    await handleOrchestratorChat(req, res);
    const payload = jsonPayload(res);

    expect(generateObject).not.toHaveBeenCalled();
    expect(generateText).not.toHaveBeenCalled();
    expect(payload.proposal).toBeDefined();
    expect(payload.executionMetrics.model).toBe("urc-deterministic");
    expect(payload.executionMetrics.tokensUsed).toBeNull();
    expect(payload.executionMetrics.modelNote).toContain("no model was consulted");
  });

  it("refuses conversational questions honestly — never a canned answer", async () => {
    const { req, res } = makeReqRes("What time was your last update?", "urc-fallback");
    await handleOrchestratorChat(req, res);
    const payload = jsonPayload(res);

    expect(generateObject).not.toHaveBeenCalled();
    expect(generateText).not.toHaveBeenCalled();
    expect(payload.proposal).toBeUndefined();
    expect(payload.reply).toContain("no model was consulted");
    expect(payload.executionMetrics.model).toBe("urc-deterministic");
  });
});

describe("wiring source pins", () => {
  it("the chain is called in exactly ONE place — through dispatchModelRun with the lead argument", () => {
    const src = readFileSync(
      path.join(process.cwd(), "server", "controllers", "orchestrator.ts"),
      "utf8"
    );
    // CC-2026-10-01-009 documented a chain lead that was never passed: the
    // only remaining call must carry the second argument.
    expect(src.split("withGoogleModelChainLeading(").length - 1).toBe(1);
    const callIdx = src.indexOf("withGoogleModelChainLeading(");
    expect(src.slice(callIdx, callIdx + 300)).toContain("chainLead");
    // Both chat modes route through the provider dispatch (proposal + chat).
    expect(src.split("dispatchModelRun(").length - 1).toBe(2);
    // The dead display-only variable is gone.
    expect(src).not.toContain("const requestedModel =");
  });
});
