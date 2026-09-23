import { readFileSync } from "fs";
import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  getDashboardTelemetry,
  pingLlm,
} from "./dashboard-telemetry";
import { getDb } from "../db";
import { syncWorkspaceVaultSecrets } from "../_core/env";
import { invokeLLM } from "../_core/llm";
import {
  workflowRunSteps,
  workspaceIntegrations,
} from "../schema";

vi.mock("../db", () => ({ getDb: vi.fn() }));
vi.mock("../_core/env", () => ({ syncWorkspaceVaultSecrets: vi.fn() }));
vi.mock("../_core/llm", () => ({ invokeLLM: vi.fn() }));

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
    process.env.OPENAI_API_KEY = "test-key";
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

  it("reports the LLM as not configured when the API key is absent", async () => {
    delete process.env.OPENAI_API_KEY;
    const db = makeDb({ integrationRows: [], lastStep: null });
    vi.mocked(getDb).mockResolvedValue(db);

    const res = await call(db);

    expect(res.body.llm.configured).toBe(false);
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

describe("pingLlm (verified liveness)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reports alive with measured latency on a real round-trip", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({
      model: "gemini-2.5-flash",
      choices: [{ message: { content: "pong" } }],
    } as any);

    const res = makeRes();
    await pingLlm({} as any, res);

    expect(res.body.alive).toBe(true);
    expect(res.body.model).toBe("gemini-2.5-flash");
    expect(typeof res.body.latencyMs).toBe("number");
    expect(res.body.checkedAt).toBeTruthy();
  });

  it("pings with a minimal prompt through the app's invokeLLM path", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({
      model: "m",
      choices: [{ message: { content: "pong" } }],
    } as any);

    await pingLlm({} as any, makeRes());

    const call = vi.mocked(invokeLLM).mock.calls[0][0];
    expect(call.messages).toHaveLength(1);
    expect(JSON.stringify(call.messages)).toMatch(/pong/i);
    expect(call.maxTokens).toBeLessThanOrEqual(512);
  });

  it("reports not-configured distinctly when the API key is absent", async () => {
    vi.mocked(invokeLLM).mockRejectedValue(
      new Error("OPENAI_API_KEY is not configured")
    );

    const res = makeRes();
    await pingLlm({} as any, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.alive).toBe(false);
    expect(res.body.notConfigured).toBe(true);
    expect(res.body.reason).toMatch(/not configured/i);
  });

  it("reports reachable-but-erroring without the notConfigured flag", async () => {
    vi.mocked(invokeLLM).mockRejectedValue(
      new Error("LLM invoke failed: 503 Service Unavailable – upstream down")
    );

    const res = makeRes();
    await pingLlm({} as any, res);

    expect(res.body.alive).toBe(false);
    expect(res.body.notConfigured).toBeFalsy();
    expect(res.body.reason).toMatch(/503/);
  });

  it("never claims liveness on an empty model response", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({
      model: "m",
      choices: [{ message: { content: "" } }],
    } as any);

    const res = makeRes();
    await pingLlm({} as any, res);

    expect(res.body.alive).toBe(false);
    expect(res.body.reason).toMatch(/empty response/i);
  });

  it("flattens array-content responses before judging liveness", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({
      model: "m",
      choices: [
        {
          message: {
            content: [{ type: "text", text: "pong" }],
          },
        },
      ],
    } as any);

    const res = makeRes();
    await pingLlm({} as any, res);

    expect(res.body.alive).toBe(true);
  });
});
