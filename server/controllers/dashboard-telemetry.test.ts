import { readFileSync } from "fs";
import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  getDashboardTelemetry,
  pingLlm,
} from "./dashboard-telemetry";
import { getDb } from "../db";
import { syncWorkspaceVaultSecrets } from "../_core/env";
import {
  isGoogleAiConfigured,
  createGoogleProvider,
} from "../_core/google-ai";
import { generateText } from "ai";
import {
  workflowRunSteps,
  workspaceIntegrations,
} from "../schema";

vi.mock("../db", () => ({ getDb: vi.fn() }));
vi.mock("../_core/env", () => ({ syncWorkspaceVaultSecrets: vi.fn() }));
vi.mock("../_core/google-ai", () => ({
  isGoogleAiConfigured: vi.fn(),
  createGoogleProvider: vi.fn(),
}));
vi.mock("ai", () => ({ generateText: vi.fn() }));

function makeRes() {
  const res: any = {
    statusCode: 200,
    body: undefined as Record<string, any> | undefined,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(payload: Record<string, any>) {
      res.body = payload;
      return res;
    },
  };
  return res;
}

function makeDb(config: {
  integrationRows?: any[];
  lastStep?: any;
  costTotal?: { total: string | null } | null;
}) {
  const db: any = {
    select: vi.fn(() => {
      const b: any = {};
      b.from = (table: any) => {
        b._table = table;
        if (table === workspaceIntegrations) {
          const rows = config.integrationRows ?? [];
          b.where = () => b;
          b.orderBy = () => b;
          b.limit = async () => rows;
          b.then = (resolve: any, reject: any) =>
            Promise.resolve(rows).then(resolve, reject);
        } else if (table === workflowRunSteps) {
          // Two shapes hit this table: the latency query
          // (where -> orderBy -> limit) and the cost sum (where -> await).
          b.where = () => ({
            orderBy: () => ({
              limit: async () => (config.lastStep ? [config.lastStep] : []),
            }),
            then: (resolve: any, reject: any) =>
              Promise.resolve(
                config.costTotal ? [config.costTotal] : []
              ).then(resolve, reject),
          });
          b.orderBy = () => ({
            limit: async () => (config.lastStep ? [config.lastStep] : []),
          });
          b.then = (resolve: any, reject: any) =>
            Promise.resolve(config.lastStep ? [config.lastStep] : []).then(
              resolve,
              reject
            );
        } else {
          b.where = () => b;
          b.orderBy = () => b;
          b.limit = async () => [];
          b.then = (resolve: any, reject: any) =>
            Promise.resolve([]).then(resolve, reject);
        }
        return b;
      };
      return b;
    }),
  };
  return db;
}

function call(db: any) {
  const req: any = { workspaceId: "ws-1" };
  const res = makeRes();
  return getDashboardTelemetry(req, res).then(() => res);
}

describe("getDashboardTelemetry (real state)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(syncWorkspaceVaultSecrets).mockResolvedValue(undefined);
    // The badge reports the ORCHESTRATOR leg (Gemini), not the OpenAI leg.
    vi.mocked(isGoogleAiConfigured).mockReturnValue(true);
  });

  it("reports HubSpot connected from the real vault-synced integration row", async () => {
    const db = makeDb({
      integrationRows: [
        {
          name: "HubSpot CRM PAT Bridge",
          config: { tools: { deals: {}, contacts: {}, pipelines: {} } },
          status: "active",
        },
      ],
      lastStep: { latencyMs: 1234 },
      costTotal: { total: "0.420000" },
    });
    vi.mocked(getDb).mockResolvedValue(db);

    const res = await call(db);

    expect(syncWorkspaceVaultSecrets).toHaveBeenCalledWith("ws-1");
    expect(res.body.hubspot).toEqual({ connected: true, toolsConfigured: 3 });
    expect(res.body.llm.configured).toBe(true);
    expect(res.body.llm.lastStepLatencyMs).toBe(1234);
    expect(res.body.compute.totalCost).toBe("0.420000");
  });

  it("reports not-connected when no HubSpot row exists (no fake CONNECTED)", async () => {
    const db = makeDb({ integrationRows: [], lastStep: null });
    vi.mocked(getDb).mockResolvedValue(db);

    const res = await call(db);

    expect(res.body.hubspot).toEqual({ connected: false, toolsConfigured: 0 });
  });

  it("still returns 200 with an honest error when vault sync fails", async () => {
    vi.mocked(syncWorkspaceVaultSecrets).mockRejectedValue(
      new Error("vault unreachable")
    );
    const db = makeDb({ integrationRows: [], lastStep: null });
    vi.mocked(getDb).mockResolvedValue(db);

    const res = await call(db);

    expect(res.statusCode).toBe(200);
    expect(res.body.hubspot.connected).toBe(false);
    expect(res.body.integrationsError).toMatch(/vault unreachable/);
  });

  it("reports null latency and cost when no steps have run", async () => {
    const db = makeDb({ integrationRows: [], lastStep: null });
    vi.mocked(getDb).mockResolvedValue(db);

    const res = await call(db);

    expect(res.body.llm.lastStepLatencyMs).toBeNull();
    expect(res.body.compute.totalCost).toBeNull();
  });

  it("reports the LLM as not configured when the Gemini leg is unconfigured", async () => {
    vi.mocked(isGoogleAiConfigured).mockReturnValue(false);
    const db = makeDb({ integrationRows: [], lastStep: null });
    vi.mocked(getDb).mockResolvedValue(db);

    const res = await call(db);

    expect(res.body.llm.configured).toBe(false);
  });

  it("does not key the orchestrator badge on the never-used OPENAI leg", () => {
    const source = readFileSync("server/controllers/dashboard-telemetry.ts", "utf-8");
    expect(source).not.toContain("!!process.env.OPENAI_API_KEY");
  });

  it("401s without a workspace and never invents telemetry", async () => {
    const res = makeRes();
    await getDashboardTelemetry({ workspaceId: undefined } as any, res);
    expect(res.statusCode).toBe(401);
  });

  it("no trace of the old hardcoded telemetry fiction remains in the Dashboard", () => {
    const source = readFileSync("client/src/pages/Dashboard.tsx", "utf-8");
    expect(source).not.toContain("450ms");
    expect(source).not.toContain("$12.50");
    expect(source).not.toContain("$443 saved");
    expect(source).not.toContain('"NOMINAL"');
  });
});

describe("pingLlm (verified liveness of the ORCHESTRATOR leg)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isGoogleAiConfigured).mockReturnValue(true);
    vi.mocked(createGoogleProvider).mockReturnValue(
      ((model: string) => ({ modelId: model })) as any
    );
  });

  it("reports alive with measured latency on a real round-trip", async () => {
    vi.mocked(generateText).mockResolvedValue({
      text: "pong",
      model: "gemini-flash-latest",
    } as any);

    const res = makeRes();
    await pingLlm({} as any, res);

    expect(res.body.alive).toBe(true);
    expect(res.body.model).toBe("gemini-flash-latest");
    expect(typeof res.body.latencyMs).toBe("number");
    expect(res.body.checkedAt).toBeTruthy();
  });

  it("pings through the SAME provider construction the agent pipeline uses", async () => {
    vi.mocked(generateText).mockResolvedValue({
      text: "pong",
      model: "m",
    } as any);

    await pingLlm({} as any, makeRes());

    // createGoogleProvider is the agent-runner construction path.
    expect(vi.mocked(createGoogleProvider)).toHaveBeenCalled();
    const call = vi.mocked(generateText).mock.calls[0][0] as any;
    expect(call.prompt).toMatch(/pong/i);
    expect(call.maxOutputTokens).toBeLessThanOrEqual(512);
    expect(call.model).toEqual({ modelId: "gemini-flash-latest" });
  });

  it("short-circuits not-configured without burning a model call", async () => {
    vi.mocked(isGoogleAiConfigured).mockReturnValue(false);

    const res = makeRes();
    await pingLlm({} as any, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.alive).toBe(false);
    expect(res.body.notConfigured).toBe(true);
    expect(vi.mocked(generateText)).not.toHaveBeenCalled();
  });

  it("reports not-configured distinctly when the provider reports a missing credential", async () => {
    vi.mocked(generateText).mockRejectedValue(
      new Error("no api key configured for provider")
    );

    const res = makeRes();
    await pingLlm({} as any, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.alive).toBe(false);
    expect(res.body.notConfigured).toBe(true);
  });

  it("reports reachable-but-erroring without the notConfigured flag", async () => {
    vi.mocked(generateText).mockRejectedValue(
      new Error("503 Service Unavailable – upstream down")
    );

    const res = makeRes();
    await pingLlm({} as any, res);

    expect(res.body.alive).toBe(false);
    expect(res.body.notConfigured).toBeFalsy();
    expect(res.body.reason).toMatch(/503/);
  });

  it("never claims liveness on an empty model response", async () => {
    vi.mocked(generateText).mockResolvedValue({
      text: "",
      model: "m",
    } as any);

    const res = makeRes();
    await pingLlm({} as any, res);

    expect(res.body.alive).toBe(false);
    expect(res.body.reason).toMatch(/empty response/i);
  });

  it("the ping never routes through the OpenAI-compatible Forge leg", () => {
    const source = readFileSync("server/controllers/dashboard-telemetry.ts", "utf-8");
    const pingSection = source.slice(source.indexOf("export async function pingLlm"));
    expect(pingSection).not.toContain("invokeLLM");
    expect(pingSection).toContain("createGoogleProvider");
  });
});
