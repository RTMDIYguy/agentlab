import { describe, expect, it, vi, beforeEach } from "vitest";
import express from "express";
import { apiRouter } from "./routes/api";

/**
 * The full ecosystem sync spawns the REAL daily-command-center generator,
 * which regenerates today's brief, attempts the Desktop HTML rewrite, and
 * runs the Python Excel sync — tracked-file mutation and out-of-repo writes
 * as a side effect of `pnpm test`. Stub spawnSync (child_process otherwise
 * untouched: exec/spawn/fork stay real) and assert the interception.
 */
const spawnSyncMock = vi.fn(() => ({ status: 0, stdout: "", stderr: "" }));
vi.mock("node:child_process", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:child_process")>();
  return {
    ...actual,
    spawnSync: (...args: unknown[]) => spawnSyncMock(...args),
  };
});

// Production-data isolation (CC-2026-10-02-011, disposition 6): these tests
// previously called the REAL controllers against the live DATABASE_URL —
// every `pnpm test` run wrote an ECOSYSTEM_FULL_SYNC audit row and a duplicate
// "Alex Vance" roaming-ingest row into the production compliance trail (the
// spawnSync mock from CC-2026-10-02-006 covered only the script step).
// getDb now returns null: each controller skips its DB branch while still
// exercising its contract (status codes, payload shape, id formats), and
// nothing is written anywhere.
vi.mock("./db", () => ({
  db: {},
  getDb: vi.fn(async () => null),
  startDatabaseKeepalive: vi.fn(),
  upsertUser: vi.fn(async () => {}),
  getUserByOpenId: vi.fn(async () => null),
  ensureDatabaseSchema: vi.fn(async () => {}),
}));

// The webhook-registration test stores an external endpoint in the module's
// in-memory subscriber list; the later sync fires dispatchMobileWebhooks at
// it. Stub fetch so the suite never makes real outbound calls.
vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, status: 200 })));

describe("AI Studio Mobile Sync & Roaming Ingestion Bridge", () => {
  const app = express();
  app.use(express.json());
  app.use("/api", apiRouter);

  it("exports live operational state to AI Studio mobile dashboard", async () => {
    let statusCode = 200;
    let responseData: any = null;

    const req = {
      workspaceId: "00000000-0000-0000-0000-000000000001",
      headers: {},
    } as any;

    const res = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(data: any) {
        responseData = data;
        return this;
      },
    } as any;

    const { getSyncState } = await import("./controllers/aiStudioSync");
    await getSyncState(req, res);

    expect(statusCode).toBe(200);
    expect(responseData).toBeDefined();
    expect(responseData.version).toBe("2.0.0-mobile-sync");
    expect(responseData.metrics).toBeDefined();
    expect(responseData.systemHealth).toBeDefined();
    expect(responseData.systemHealth.status).toBe("nominal");
  });

  it("ingests roaming observations and mobile field data into AgentLab OS", async () => {
    let statusCode = 200;
    let responseData: any = null;

    const req = {
      workspaceId: "00000000-0000-0000-0000-000000000001",
      body: {
        source: "AI_STUDIO_MOBILE",
        dataType: "voice_note",
        payload: {
          transcript: "Met with founder at KC meetup. Interested in SOE and SDR matrix.",
          founderName: "Alex Vance",
          company: "Vance AI",
        },
      },
      headers: {},
    } as any;

    const res = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(data: any) {
        responseData = data;
        return this;
      },
    } as any;

    const { ingestRoamingData } = await import("./controllers/aiStudioSync");
    await ingestRoamingData(req, res);

    expect(statusCode).toBe(201);
    expect(responseData.success).toBe(true);
    expect(responseData.ingestionId).toMatch(/^ing_/);
    expect(responseData.dataType).toBe("voice_note");
  });

  it("registers mobile push webhooks for outbound notification dispatch", async () => {
    let statusCode = 200;
    let responseData: any = null;

    const req = {
      workspaceId: "00000000-0000-0000-0000-000000000001",
      body: {
        endpointUrl: "https://aistudio.google.com/webhook/mobile-client-01",
        deviceLabel: "Robert's Mobile Command Interface",
      },
      headers: {},
    } as any;

    const res = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(data: any) {
        responseData = data;
        return this;
      },
    } as any;

    const { registerMobileWebhook } = await import("./controllers/aiStudioSync");
    await registerMobileWebhook(req, res);

    expect(statusCode).toBe(201);
    expect(responseData.success).toBe(true);
    expect(responseData.subscriberId).toMatch(/^sub_/);
  });

  it(
    "executes 1-click full ecosystem sync across Desktop HTML, Repo Brief, and OS",
    async () => {
      let statusCode = 200;
    let responseData: any = null;

    const req = {
      workspaceId: "00000000-0000-0000-0000-000000000001",
      headers: {},
    } as any;

    const res = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(data: any) {
        responseData = data;
        return this;
      },
    } as any;

    const { handleManualSync } = await import("./controllers/aiStudioSync");
    spawnSyncMock.mockClear();
    await handleManualSync(req, res);

    expect(statusCode).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.syncedAt).toBeDefined();
    expect(responseData.message).toContain("Full ecosystem sync complete");
    // The sync still REPORTS the script step as run — via the stub, not by
    // actually executing the generator.
    expect(responseData.stats.scriptsRun).toBe(true);
    expect(spawnSyncMock).toHaveBeenCalledTimes(1);
    const [, scriptArgs] = spawnSyncMock.mock.calls[0];
    expect(String(scriptArgs)).toContain("daily-command-center.mjs");
  }, 15000);
});

