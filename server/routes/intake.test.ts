/**
 * CC-2026-10-03-002 — /api/intake rebuilt onto the entry point that actually runs.
 *
 * The handler in routes/intake.ts was complete all along. It was mounted only in
 * server/index.ts — an entry point the build never emits (build = esbuild
 * server/_core/index.ts, Docker CMD = node dist/index.js). The live server
 * therefore had no /api/intake at all: all five public marketing forms posted
 * into the SPA shell, got HTML back instead of JSON, failed the `res.ok` check
 * and showed "Something went wrong" on every submission.
 *
 * What this file guards:
 *  - the mount itself (the exact regression class: a working handler nobody mounts)
 *  - 400 when the email is missing
 *  - the field mapping the five forms actually send
 *    (contactName / serviceLine / notes -> name / subject / message)
 *  - a dead n8n webhook never loses an already-persisted lead
 *  - an honest 503 when the lead landed nowhere at all
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { intakeRouter } from "./intake";
import { ensureLeadDmThread } from "../messenger/leadThread";

const insertCalls: { table: unknown; values: any }[] = [];
const updateCalls: { table: unknown; values: any }[] = [];
let failInsert = false;

function makeDb() {
  return {
    insert: vi.fn((table: unknown) => ({
      values: (values: any) => {
        // NOTE: intake.ts awaits `.returning()`, so the rejection has to live on
        // that promise. Rejecting the intermediate one would surface as an
        // unhandled rejection instead of a caught DB failure. The row is only
        // counted as inserted when the write actually succeeds.
        const p: any = Promise.resolve([values]);
        p.returning = () => {
          if (failInsert) {
            return Promise.reject(new Error("connection refused (test)"));
          }
          insertCalls.push({ table, values });
          return Promise.resolve([{ id: "sub-1111-2222" }]);
        };
        p.onConflictDoNothing = () => {
          const p2: any = Promise.resolve([values]);
          p2.returning = () => Promise.resolve([{ id: "thread-1111" }]);
          return p2;
        };
        return p;
      },
    })),
    update: vi.fn((table: unknown) => ({
      set: (values: any) => ({
        where: vi.fn(async () => {
          updateCalls.push({ table, values });
          return [];
        }),
      }),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(async () => []),
        })),
      })),
    })),
  };
}

vi.mock("../db", () => ({ getDb: vi.fn(async () => makeDb()) }));

// The messenger thread is a separate concern with its own suite
// (server/messenger/leadThread.test.ts); intake only has to call it.
vi.mock("../messenger/leadThread", () => ({
  ensureLeadDmThread: vi.fn(async () => true),
}));

function setup(body: unknown) {
  const req: any = { body, headers: {} };
  const res: any = { statusCode: 0, body: undefined as unknown };
  res.status = vi.fn((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.json = vi.fn((payload: unknown) => {
    res.body = payload;
    return res;
  });
  return { req, res };
}

/** Find the POST / handler on an express Router (Express 5 keeps it in route.stack). */
function handlerOf(router: any) {
  const layer = router.stack.find((l: any) => l.route?.path === "/");
  if (!layer) throw new Error("POST / handler not registered on intakeRouter");
  const handler = layer.route.stack?.[0]?.handle ?? layer.route.handle;
  if (typeof handler !== "function") {
    throw new Error(
      `route handler is ${typeof handler}, expected function — Express route shape changed`
    );
  }
  return handler;
}

const intakeHandler = handlerOf(intakeRouter);

/** Set (or clear) the relay env var for one test. Read per request, so no reload needed. */
function setWebhook(url: string | undefined) {
  if (url === undefined) delete process.env.N8N_INTAKE_WEBHOOK_URL;
  else process.env.N8N_INTAKE_WEBHOOK_URL = url;
}

beforeEach(() => {
  insertCalls.length = 0;
  updateCalls.length = 0;
  failInsert = false;
  setWebhook(undefined);
  vi.mocked(ensureLeadDmThread).mockClear();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("mount guard (the bug this entry fixes)", () => {
  const liveEntry = readFileSync(
    new URL("../_core/index.ts", import.meta.url),
    "utf8"
  );

  it("registers /api/intake on the entry point the build emits", () => {
    expect(liveEntry).toContain('app.use("/api/intake", intakeRouter)');
    expect(liveEntry).toContain('import { intakeRouter } from "../routes/intake"');
  });

  it("mounts it OUTSIDE the tenant chain so it stays anonymous", () => {
    const mount = liveEntry.indexOf('app.use("/api/intake", intakeRouter)');
    const tenantMount = liveEntry.indexOf(
      'app.use("/api", tenantMiddleware, apiRouter)'
    );
    expect(mount).toBeGreaterThan(-1);
    // Registered ahead of the /api mount: the marketing forms have no session.
    expect(mount).toBeLessThan(tenantMount);
  });
});

describe("POST /api/intake", () => {
  it("400s when the email is missing", async () => {
    const { req, res } = setup({
      contactName: "No Email",
      source: "AgentLab Careers Page",
    });

    await intakeHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(insertCalls).toHaveLength(0);
  });

  it("persists the lead and maps the fields the five forms actually send", async () => {
    const { req, res } = setup({
      email: "Founder@Example.com",
      contactName: "Ada Lovelace",
      source: "AgentLab Website - KC Bootstrapper Roundtable",
      serviceLine: "Community",
      notes: "Company: Analytical Engines\nConsent: true",
    });

    await intakeHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ success: true, submissionId: "sub-1111-2222" });

    expect(insertCalls).toHaveLength(1);
    expect(insertCalls[0].values).toMatchObject({
      name: "Ada Lovelace",
      email: "founder@example.com", // lowercased
      subject: "Community", // serviceLine
      message: "Company: Analytical Engines\nConsent: true", // notes
      source: "AgentLab Website - KC Bootstrapper Roundtable",
      status: "new",
    });

    // The lead gets a DM thread so the founder can reply in one place.
    expect(ensureLeadDmThread).toHaveBeenCalledTimes(1);
    expect(vi.mocked(ensureLeadDmThread).mock.calls[0][0]).toMatchObject({
      submissionId: "sub-1111-2222",
      email: "founder@example.com",
      topic: "Community",
    });
  });

  it("still returns 200 when the n8n relay is down, because the lead is durable", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("ECONNREFUSED"));
    vi.stubGlobal("fetch", fetchMock);
    setWebhook("https://n8n.example.test/webhook/intake");

    const { req, res } = setup({
      email: "relay@example.com",
      contactName: "Relay Test",
      source: "AgentLab Website - Book Free Chapter",
      serviceLine: "Book Free Chapter",
    });

    await intakeHandler(req, res);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ success: true });
    expect(insertCalls).toHaveLength(1);
    expect(ensureLeadDmThread).toHaveBeenCalledTimes(1);
    // Relay failed, so the row must NOT claim it synced.
    expect(updateCalls).toHaveLength(0);
  });

  it("503s honestly when the lead could not be persisted anywhere", async () => {
    failInsert = true;
    const { req, res } = setup({
      email: "lost@example.com",
      source: "AgentLab Website - Help Center",
    });

    await intakeHandler(req, res);

    expect(res.statusCode).toBe(503);
    expect(res.body).toMatchObject({
      error: "Lead could not be captured. Please try again.",
    });
    expect(ensureLeadDmThread).not.toHaveBeenCalled();
    expect(insertCalls).toHaveLength(0); // the failed write counts as no write
  });

  it("marks the row synced only when the relay actually answered", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("ok", { status: 200 }))
    );
    setWebhook("https://n8n.example.test/webhook/intake");

    const { req, res } = setup({
      email: "synced@example.com",
      source: "AgentLab Website - Bootcamp Quiz",
    });

    await intakeHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(updateCalls).toHaveLength(1);
    expect(updateCalls[0].values).toHaveProperty("status", "synced");
  });
});
