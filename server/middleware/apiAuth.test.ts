/**
 * CC-2026-10-03-003 — the REST authorization gate.
 *
 * The gate is the thing standing between an anonymous internet caller and
 * ~85 operator routes, so this file pins both directions:
 *   - what stays open (every public entry is a deliberate hole), and
 *   - what must NOT be open (the routes the audit found leaking).
 *
 * It also covers the webhook class: fail closed when unconfigured, 401 on a
 * bad secret, and header-supplied workspace accepted ONLY after the secret
 * has been proved — the whole difference from the old legacy fallback.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  apiAuthGate,
  PUBLIC_API_ROUTES,
  WEBHOOK_API_ROUTES,
} from "./apiAuth";

type Handler = (
  req: any,
  res: any
) => { nextCalled: boolean; status?: number; body?: unknown };

function run(method: string, url: string, req: Record<string, unknown> = {}): Handler {
  const state: any = { nextCalled: false };
  // Express always populates req.headers and req.query; the helper mirrors that.
  const reqObj: any = { method, url, path: url, headers: {}, query: {}, ...req };
  const res: any = {
    status(code: number) {
      state.status = code;
      return this;
    },
    json(body: unknown) {
      state.body = body;
      return this;
    },
  };

  apiAuthGate(reqObj, res, () => {
    state.nextCalled = true;
  });

  return state;
}

const SECRET = "test-webhook-secret-do-not-use";

beforeEach(() => {
  process.env.WEBHOOK_INGEST_SECRET = SECRET;
});

afterEach(() => {
  delete process.env.WEBHOOK_INGEST_SECRET;
});

describe("public allowlist", () => {
  const publicCases: [string, string][] = [
    ["GET", "/health"],
    ["GET", "/orchestrator/models"],
    ["GET", "/dashboard/llm-ping"],
    ["GET", "/share/runs"],
    ["GET", "/share/runs/0ad550ac-1111-2222-3333-444444444444"],
    ["POST", "/campaigns/founder-sprint/book"],
    ["POST", "/campaigns/outreach/medspa"],
    ["POST", "/campaigns/outreach/cre"],
  ];

  for (const [method, path] of publicCases) {
    it(`${method} ${path} is reachable with no session`, () => {
      const out = run(method, path);
      expect(out.nextCalled).toBe(true);
      expect(out.status).toBeUndefined();
    });
  }

  it("never matches a public path on the wrong method", () => {
    // POST /health would otherwise be a free hole on a route nobody checks.
    expect(run("POST", "/health").nextCalled).toBe(false);
    expect(run("DELETE", "/share/runs").nextCalled).toBe(false);
  });

  it("does not let a path parameter smuggle a public match", () => {
    const out = run("GET", "/share/runs/../../audit-logs");
    // Normalised away rather than matched literally; either way it is not
    // treated as a share read.
    expect(PUBLIC_API_ROUTES.some(r => r.path.test("/share/runs/../../audit-logs"))).toBe(
      false
    );
    expect(out.nextCalled).toBe(false);
  });
});

describe("session enforcement", () => {
  const sensitive: [string, string][] = [
    ["GET", "/runs"],
    ["GET", "/audit-logs"],
    ["GET", "/audit-logs/export"],
    ["GET", "/artifacts"],
    ["GET", "/workflows"],
    ["GET", "/agents"],
    ["GET", "/ops-watchdog/credential-health"],
    ["GET", "/debug/llm"],
    ["GET", "/snapshots"],
    ["GET", "/share/tokens"],
    ["POST", "/voice/tts"],
    ["POST", "/sync/action"],
    ["POST", "/aistudio/action"],
    ["POST", "/agents/deploy"],
    ["DELETE", "/workflows/wf-1"],
    ["POST", "/run/run-1/approve"],
    ["POST", "/orchestrator/chat"],
    ["POST", "/intake"],
  ];

  for (const [method, path] of sensitive) {
    it(`${method} ${path} is refused to an anonymous caller`, () => {
      const out = run(method, path);
      expect(out.nextCalled).toBe(false);
      expect(out.status).toBe(401);
      expect(out.body).toEqual({ error: "Unauthorized" });
    });
  }

  it("admits a verified session", () => {
    const out = run("GET", "/runs", { authenticated: true });
    expect(out.nextCalled).toBe(true);
    expect(out.status).toBeUndefined();
  });

  it("refuses a caller whose identity failed to resolve (workspace but not authenticated)", () => {
    // The old code 401'd on `!workspaceId`; a caller with a workspace but no
    // verified session must still be refused.
    const out = run("GET", "/runs", {
      authenticated: false,
      workspaceId: "00000000-0000-0000-0000-000000000001",
      userRole: "admin",
    });
    expect(out.nextCalled).toBe(false);
    expect(out.status).toBe(401);
  });

  it("treats a mount-prefixed url the same as a mount-relative one", () => {
    expect(run("GET", "/api/runs").status).toBe(401);
    expect(run("GET", "/api/health").nextCalled).toBe(true);
  });
});

describe("webhook class", () => {
  it("answers 503 when no secret is configured — never open, never a hopeful 401", () => {
    delete process.env.WEBHOOK_INGEST_SECRET;
    const out = run("POST", "/webhooks/instantly");
    expect(out.nextCalled).toBe(false);
    expect(out.status).toBe(503);
    expect(out.body).toEqual({ error: "Webhook ingestion is not configured" });
  });

  it("answers 401 on a wrong secret", () => {
    const out = run("POST", "/webhooks/instantly", {
      headers: { "x-webhook-secret": "wrong" },
    });
    expect(out.nextCalled).toBe(false);
    expect(out.status).toBe(401);
  });

  it("answers 401 when the header is missing entirely", () => {
    const out = run("POST", "/sync/action");
    expect(out.status).toBe(401);
    expect(out.nextCalled).toBe(false);
  });

  it("admits a correct secret from the header", () => {
    const out = run("POST", "/sync/action", {
      headers: { "x-webhook-secret": SECRET },
    });
    expect(out.nextCalled).toBe(true);
  });

  it("admits a correct secret from the query string (providers that cannot set headers)", () => {
    const out = run("POST", "/voice/webhook", {
      query: { secret: SECRET },
    });
    expect(out.nextCalled).toBe(true);
  });

  it("rejects a wrong query secret", () => {
    const out = run("POST", "/voice/webhook", {
      query: { secret: SECRET + "x" },
    });
    expect(out.nextCalled).toBe(false);
    expect(out.status).toBe(401);
  });

  it("binds a workspace from the header ONLY after the secret is proved", () => {
    const req: any = {
      method: "POST",
      path: "/sync/action",
      headers: { "x-webhook-secret": SECRET, "x-workspace-id": "11111111-2222-3333-4444-555555555555" },
    };
    let nextCalled = false;
    apiAuthGate(req, { status: () => ({ json: () => undefined }) } as any, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(true);
    expect(req.workspaceId).toBe("11111111-2222-3333-4444-555555555555");
    expect(req.userRole).toBe("service");
    // A service caller is NOT a session: it must not pass session-gated routes.
    expect(req.authenticated).toBeUndefined();
  });

  it("falls back to the service workspace when the header is absent or malformed", () => {
    for (const header of [undefined, "not-a-uuid", ""]) {
      const req: any = {
        method: "POST",
        path: "/sync/ingest",
        headers: { "x-webhook-secret": SECRET },
      };
      if (header !== undefined) req.headers["x-workspace-id"] = header;

      apiAuthGate(req, { status: () => ({ json: () => undefined }) } as any, () => undefined);

      expect(req.workspaceId).toBe("00000000-0000-0000-0000-000000000001");
      expect(req.userRole).toBe("service");
    }
  });

  it("covers every webhook route the audit listed", () => {
    const expected = [
      "/webhooks/instantly",
      "/voice/webhook",
      "/aistudio/ingest",
      "/sync/ingest",
      "/fulfillment/onboarding/ingest",
      "/aistudio/webhook/register",
      "/aistudio/action",
      "/sync/action",
    ];
    for (const path of expected) {
      expect(
        WEBHOOK_API_ROUTES.some(re => re.test(path)),
        `${path} must be in the webhook class`
      ).toBe(true);
    }
  });
});

describe("pins — the routes the audit found leaking", () => {
  it("no operator route leaked into the public list", () => {
    const forbidden = [
      "/runs",
      "/audit-logs",
      "/artifacts",
      "/workflows",
      "/agents",
      "/voice/tts",
      "/debug/llm",
      "/snapshots",
      "/share/tokens",
      "/ops-watchdog/credential-health",
      "/orchestrator/chat",
    ];
    for (const path of forbidden) {
      const isOpen = PUBLIC_API_ROUTES.some(r => r.path.test(path));
      expect(isOpen, `${path} must not be public`).toBe(false);
    }
  });

  it("the public list stays small and is all GET except the four funnels", () => {
    expect(PUBLIC_API_ROUTES).toHaveLength(8);
    const posts = PUBLIC_API_ROUTES.filter(r => r.method === "POST").map(
      r => r.path.source
    );
    expect(posts).toEqual([
      /^\/campaigns\/founder-sprint\/book$/.source,
      /^\/campaigns\/outreach\/medspa$/.source,
      /^\/campaigns\/outreach\/cre$/.source,
    ]);
  });
});
