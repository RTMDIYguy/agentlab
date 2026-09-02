import { describe, expect, it } from "vitest";
import express from "express";
import { apiRouter } from "./routes/api";

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
    await handleManualSync(req, res);

    expect(statusCode).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.syncedAt).toBeDefined();
    expect(responseData.message).toContain("Full ecosystem sync complete");
  }, 15000);
});

