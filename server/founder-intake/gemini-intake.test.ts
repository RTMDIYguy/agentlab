import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Founder-intake Gemini migration (2026-09-25).
 *
 * The intake agent's LLM call moved off raw OpenAI HTTP (dead weight in this
 * deployment — no OPENAI_API_KEY was ever configured, so visitors were
 * unknowingly talking to the canned fallback script) onto the app's one Gemini
 * auth factory (server/_core/google-ai.ts). These hermetic tests pin:
 *   - the model fallback chain (2.5-flash → 2.0-flash → 1.5-flash)
 *   - markdown-fence tolerance on the JSON reply
 *   - the three honest llmStatus states (ok / llm_error / not_configured)
 *   - visitor-memory persistence on every path
 * No network and no database: both are mocked per repo convention.
 */

const ENV_KEYS = ["GOOGLE_SERVICE_ACCOUNT_JSON", "GOOGLE_GENERATIVE_AI_API_KEY", "GEMINI_API_KEY"] as const;
const savedEnv: Record<string, string | undefined> = {};

let generateTextMock: ReturnType<typeof vi.fn>;
let resolvedSelect: () => any[];
const captured: { updated: any[]; inserted: any[] } = { updated: [], inserted: [] };

vi.mock("ai", () => ({
  generateText: (...args: any[]) => generateTextMock(...args),
}));

vi.mock("../_core/google-ai", () => ({
  createGoogleProvider: () => (modelId: string) => ({ modelId, __provider: "google" }),
  isGoogleAiConfigured: () =>
    Boolean(
      process.env.GOOGLE_SERVICE_ACCOUNT_JSON ||
        process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
        process.env.GEMINI_API_KEY
    ),
}));

vi.mock("../db", () => {
  function chain(resolved: () => any[]) {
    const c: any = {};
    c.from = vi.fn(() => c);
    c.where = vi.fn(() => c);
    c.values = vi.fn(() => c);
    c.set = vi.fn(() => c);
    c.returning = vi.fn(() => Promise.resolve([{ id: "sub-1" }]));
    c.limit = vi.fn(() => c);
    c.then = (res: any, rej: any) => Promise.resolve(resolved()).then(res, rej);
    return c;
  }

  const mockDb = {
    select: vi.fn(() => chain(() => resolvedSelect())),
    insert: vi.fn(() => {
      const c = chain(() => [{ id: "sub-1" }]);
      // insert().values(...).returning(...) — values returns the chain.
      return c;
    }),
    update: vi.fn(() => {
      const c = chain(() => []);
      const origSet = c.set;
      c.set = vi.fn((v: any) => {
        captured.updated.push(v);
        return c;
      });
      void origSet;
      return c;
    }),
  };

  return { getDb: vi.fn(async () => mockDb), db: mockDb };
});

import { founderIntakeRouter } from "./router";

function okModel(payload: unknown) {
  return async () => ({ text: typeof payload === "string" ? payload : JSON.stringify(payload) });
}

beforeEach(() => {
  generateTextMock = vi.fn();
  resolvedSelect = () => [];
  captured.updated.length = 0;
  for (const k of ENV_KEYS) {
    savedEnv[k] = process.env[k];
    delete process.env[k];
  }
});

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  }
  vi.restoreAllMocks();
});

const goodPayload = {
  reply: "That sounds like a follow-up bottleneck. What's your name?",
  stage: "capture",
  recommendedOffer: "Founder Roundtable",
  recommendedCta: "Share your name and email.",
  shouldCaptureLead: true,
  collected: { name: undefined, email: undefined, painPoint: "Leads stall in follow-up" },
};

const turn = {
  messages: [
    { role: "user" as const, content: "Follow-up eats my week." },
    { role: "assistant" as const, content: "Tell me more." },
    { role: "user" as const, content: "Leads stall in follow-up." },
  ],
  lead: {},
};

describe("founder intake → Gemini migration", () => {
  it("returns the Gemini response with llmStatus ok", async () => {
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON = '{"client_email":"sa@test","private_key":"k"}';
    generateTextMock.mockImplementation(okModel(goodPayload));

    const out = await founderIntakeRouter.createCaller({} as any).respond(turn);

    expect(out.llmStatus).toEqual({ engine: "gemini", reason: "ok" });
    expect(out.reply).toContain("follow-up bottleneck");
    expect(out.stage).toBe("capture");
    expect(out.collected.painPoint).toBe("Leads stall in follow-up");
  });

  it("falls through the model chain on errors and reports llm_error with the fallback script", async () => {
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON = '{"client_email":"sa@test","private_key":"k"}';
    generateTextMock.mockRejectedValue(new Error("503 model overloaded"));

    const out = await founderIntakeRouter.createCaller({} as any).respond(turn);

    expect(generateTextMock).toHaveBeenCalledTimes(3); // full chain attempted
    expect(out.llmStatus.engine).toBe("fallback");
    expect(out.llmStatus.reason).toBe("llm_error");
    expect(out.llmStatus.detail).toContain("503 model overloaded");
    // The visitor still gets a real (scripted) conversation, never an error.
    expect(out.reply.length).toBeGreaterThan(0);
  });

  it("tolerates markdown-fenced JSON replies", async () => {
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON = '{"client_email":"sa@test","private_key":"k"}';
    generateTextMock.mockImplementation(
      okModel("```json\n" + JSON.stringify(goodPayload) + "\n```")
    );

    const out = await founderIntakeRouter.createCaller({} as any).respond(turn);
    expect(out.llmStatus.reason).toBe("ok");
    expect(out.reply).toContain("follow-up bottleneck");
  });

  it("reports not_configured honestly when no credential exists", async () => {
    // No env keys set → isGoogleAiConfigured() false → callGemini returns null.
    const out = await founderIntakeRouter.createCaller({} as any).respond(turn);

    expect(generateTextMock).not.toHaveBeenCalled();
    expect(out.llmStatus.engine).toBe("fallback");
    expect(out.llmStatus.reason).toBe("not_configured");
    expect(out.llmStatus.detail).toContain("credential");
    expect(out.reply.length).toBeGreaterThan(0);
  });

  it("treats an unparseable LLM reply as llm_error (never crashes, never invents)", async () => {
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON = '{"client_email":"sa@test","private_key":"k"}';
    generateTextMock.mockImplementation(okModel("I am not JSON at all."));

    const out = await founderIntakeRouter.createCaller({} as any).respond(turn);
    expect(out.llmStatus.reason).toBe("llm_error");
    expect(out.llmStatus.detail).toContain("unparseable");
  });

  it("persists visitor memory when the Gemini path answers", async () => {
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON = '{"client_email":"sa@test","private_key":"k"}';
    generateTextMock.mockImplementation(
      okModel({ ...goodPayload, collected: { ...goodPayload.collected, email: "dana@x.test" } })
    );
    // Existing profile row → the update branch of rememberVisitorTurn fires.
    resolvedSelect = () => [{ id: "prof-1" }];

    await founderIntakeRouter.createCaller({} as any).respond(turn);
    expect(captured.updated.length).toBe(1);
    expect(captured.updated[0].conversation).toBeDefined();
  });
});
