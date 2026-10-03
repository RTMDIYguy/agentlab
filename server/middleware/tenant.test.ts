/**
 * CC-2026-10-03-003 — identity resolution for the REST surface.
 *
 * The old middleware had three ways in: `decodeJwt` (no signature check), a
 * legacy fallback that handed `role: "admin"` to every credential-less caller
 * and trusted x-user-role / x-user-email / x-workspace-id verbatim, and a
 * catch that called next() after granting whatever it had. This file pins the
 * replacement:
 *
 *   - identity only from a session we signed ourselves
 *   - caller-supplied identity headers are inert
 *   - no session -> no identity at all (not a default one)
 *   - a resolution error withholds identity instead of inventing one
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SignJWT } from "jose";
import { COOKIE_NAME } from "@shared/const";
import { sdk } from "../_core/sdk";
import { tenantMiddleware } from "./tenant";
import { apiAuthGate } from "./apiAuth";

// Queued rows for the single users read tenant.ts performs.
let userRows: any[] = [];
let selectShouldThrow = false;

vi.mock("../db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(async () => {
            if (selectShouldThrow) throw new Error("connection reset (test)");
            return userRows;
          }),
        })),
      })),
    })),
  },
}));

const OPERATOR = {
  openId: "usr_test_operator",
  email: "operator@example.com",
  role: "operator",
  workspaceId: "00000000-0000-0000-0000-000000000001",
};

function makeReq(headers: Record<string, string> = {}) {
  return { headers } as any;
}

function runMiddleware(req: any) {
  const state = { nextCalled: false };
  const res = { status: () => res, json: () => undefined } as any;
  return tenantMiddleware(req, res, () => {
    state.nextCalled = true;
  }).then(() => ({ ...state, req }));
}

beforeEach(() => {
  userRows = [OPERATOR];
  selectShouldThrow = false;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("no session", () => {
  it("grants no identity whatsoever", async () => {
    const { nextCalled, req } = await runMiddleware(makeReq());
    expect(nextCalled).toBe(true);
    expect(req.authenticated).toBe(false);
    expect(req.workspaceId).toBeUndefined();
    expect(req.userRole).toBeUndefined();
    expect(req.userEmail).toBeUndefined();
  });

  it("IGNORES x-user-role / x-user-email / x-workspace-id — the regression itself", async () => {
    const { req } = await runMiddleware(
      makeReq({
        "x-user-role": "admin",
        "x-user-email": "attacker@evil.example",
        "x-workspace-id": "00000000-0000-0000-0000-000000000000",
      })
    );

    expect(req.authenticated).toBe(false);
    expect(req.userRole).toBeUndefined();
    expect(req.userEmail).toBeUndefined();
    expect(req.workspaceId).toBeUndefined();
  });
});

describe("verified session", () => {
  async function sessionHeaders(openId: string) {
    const token = await sdk.createSessionToken(openId, { name: "Test" });
    return { cookie: `${COOKIE_NAME}=${token}` };
  }

  it("resolves identity from the users row", async () => {
    const { req } = await runMiddleware(
      makeReq(await sessionHeaders(OPERATOR.openId))
    );

    expect(req.authenticated).toBe(true);
    expect(req.openId).toBe(OPERATOR.openId);
    expect(req.userEmail).toBe(OPERATOR.email);
    expect(req.userRole).toBe("operator");
    expect(req.workspaceId).toBe(OPERATOR.workspaceId);
  });

  it("accepts the same session value in an Authorization: Bearer header", async () => {
    const token = await sdk.createSessionToken(OPERATOR.openId, { name: "T" });
    const { req } = await runMiddleware(makeReq({ authorization: `Bearer ${token}` }));

    expect(req.authenticated).toBe(true);
    expect(req.workspaceId).toBe(OPERATOR.workspaceId);
  });

  it("promotes a god-mode address to admin over the god workspace", async () => {
    userRows = [
      {
        ...OPERATOR,
        email: "thebossrob@gmail.com",
        role: "operator",
      },
    ];

    const { req } = await runMiddleware(
      makeReq(await sessionHeaders(OPERATOR.openId))
    );

    expect(req.authenticated).toBe(true);
    expect(req.userRole).toBe("admin");
    expect(req.workspaceId).toBe("00000000-0000-0000-0000-000000000000");
  });

  it("grants nothing when the verified session names no user", async () => {
    userRows = [];
    const { req } = await runMiddleware(
      makeReq(await sessionHeaders("usr_deleted_account"))
    );

    expect(req.authenticated).toBe(false);
    expect(req.workspaceId).toBeUndefined();
    expect(req.userRole).toBeUndefined();
  });

  it("rejects a token signed with someone else's key (the decodeJwt hole)", async () => {
    const attackerKey = new TextEncoder().encode("attacker-chosen-secret-32b");
    const forged = await new SignJWT({ openId: OPERATOR.openId })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(Math.floor(Date.now() / 1000) + 3600)
      .sign(attackerKey);

    const { req } = await runMiddleware(
      makeReq({ cookie: `${COOKIE_NAME}=${forged}` })
    );

    expect(req.authenticated).toBe(false);
    expect(req.workspaceId).toBeUndefined();
  });

  it("rejects a structurally valid but unsigned/garbage token", async () => {
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
      "base64url"
    );
    const payload = Buffer.from(
      JSON.stringify({ openId: OPERATOR.openId, email: "thebossrob@gmail.com" })
    ).toString("base64url");
    const forged = `${header}.${payload}.not-a-real-signature`;

    const { req } = await runMiddleware(
      makeReq({ cookie: `${COOKIE_NAME}=${forged}` })
    );

    expect(req.authenticated).toBe(false);
    expect(req.userRole).toBeUndefined();
  });
});

describe("failure handling", () => {
  it("withholds identity when the lookup throws, but never blocks the request", async () => {
    selectShouldThrow = true;
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { nextCalled, req } = await runMiddleware(
      makeReq(await (async () => {
        const token = await sdk.createSessionToken(OPERATOR.openId, { name: "T" });
        return { cookie: `${COOKIE_NAME}=${token}` };
      })())
    );

    expect(nextCalled).toBe(true);
    expect(req.authenticated).toBe(false);
    expect(req.workspaceId).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

describe("end to end: cookie -> tenant -> gate", () => {
  function gate(req: any) {
    const state: {
      nextCalled: boolean;
      status?: number;
      body?: unknown;
    } = { nextCalled: false };
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
    apiAuthGate(req, res, () => {
      state.nextCalled = true;
    });
    return state;
  }

  it("a signed-in caller passes a protected route", async () => {
    const token = await sdk.createSessionToken(OPERATOR.openId, { name: "T" });
    const req: any = { method: "GET", path: "/audit-logs", headers: { cookie: `${COOKIE_NAME}=${token}` } };

    await tenantMiddleware(req, { status: () => undefined } as any, () => undefined);
    const out = gate(req);

    expect(req.authenticated).toBe(true);
    expect(out.nextCalled).toBe(true);
    expect(out.status).toBeUndefined();
  });

  it("an anonymous caller is refused the same route", async () => {
    const req: any = { method: "GET", path: "/audit-logs", headers: {} };

    await tenantMiddleware(req, { status: () => undefined } as any, () => undefined);
    const out = gate(req);

    expect(req.authenticated).toBe(false);
    expect(out.nextCalled).toBe(false);
    expect(out.status).toBe(401);
  });

  it("a forged session never passes the gate", async () => {
    const attackerKey = new TextEncoder().encode("attacker-chosen-secret-32b");
    const forged = await new SignJWT({ openId: OPERATOR.openId })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(Math.floor(Date.now() / 1000) + 3600)
      .sign(attackerKey);

    const req: any = {
      method: "GET",
      path: "/runs",
      headers: { cookie: `${COOKIE_NAME}=${forged}` },
    };

    await tenantMiddleware(req, { status: () => undefined } as any, () => undefined);
    const out = gate(req);

    expect(out.nextCalled).toBe(false);
    expect(out.status).toBe(401);
  });

  it("public routes answer for anonymous callers regardless of identity", async () => {
    const req: any = { method: "GET", path: "/health", headers: {} };
    await tenantMiddleware(req, { status: () => undefined } as any, () => undefined);
    expect(gate(req).nextCalled).toBe(true);
  });
});
