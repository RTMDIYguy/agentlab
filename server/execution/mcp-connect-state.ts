/**
 * Signed OAuth connect-state for MCP integrations (CC-2026-10-01-007).
 *
 * The PKCE verifier must survive the browser round-trip to the provider, but
 * it must never be guessable or tamperable by the browser. The verifier and
 * client metadata are packed into a payload that is HMAC-signed server-side;
 * the state URL parameter carries payload+signature. On callback the OS
 * verifies the signature BEFORE using anything, so a forged or replayed state
 * fails loudly instead of producing a token for an attacker-chosen server.
 *
 * Replay protection: each state carries its own `nonce` and an expiry; the
 * consuming route must ensure a state is only ever redeemed once (record the
 * nonce on the integration row or an in-memory one-shot set at call time).
 * Signing key: MCP_OAUTH_STATE_SECRET, falling back to the database URL for
 * local/dev parity (documented honesty: fallback is dev-grade, production
 * should set the dedicated secret).
 */
import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";

export interface McpConnectStatePayload {
  /** workspace_integrations row id this connect belongs to. */
  integrationId: string;
  workspaceId: string;
  /** PKCE verifier (43+ chars, URL-safe). */
  verifier: string;
  /** Persisted credential metadata, re-checked at exchange time. */
  clientId: string;
  clientSecretPresent: boolean;
  redirectUri: string;
  /** RFC 8707 resource indicator for the token exchange, when used. */
  resource?: string;
  /** One-shot nonce (also usable for replay detection at the callback). */
  nonce: string;
  createdAt: number;
}

const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes to finish the provider round-trip

function stateSecret(): string {
  return (
    process.env.MCP_OAUTH_STATE_SECRET ||
    process.env.DATABASE_URL ||
    "agentlab-dev-only-state-secret"
  );
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(payloadB64: string): string {
  return createHmac("sha256", stateSecret()).update(payloadB64).digest("base64url");
}

export function createMcpConnectState(
  payload: Omit<McpConnectStatePayload, "nonce" | "createdAt">
): string {
  const full: McpConnectStatePayload = {
    ...payload,
    nonce: randomBytes(12).toString("base64url"),
    createdAt: Date.now(),
  };
  const payloadB64 = b64url(JSON.stringify(full));
  return `${payloadB64}.${sign(payloadB64)}`;
}

export function verifyMcpConnectState(
  state: string
): { ok: true; payload: McpConnectStatePayload } | { ok: false; reason: string } {
  const dot = state.lastIndexOf(".");
  if (dot <= 0) return { ok: false, reason: "state is malformed" };
  const payloadB64 = state.slice(0, dot);
  const sig = state.slice(dot + 1);
  const expected = sign(payloadB64);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "state signature mismatch" };
  }
  let payload: McpConnectStatePayload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as McpConnectStatePayload;
  } catch {
    return { ok: false, reason: "state payload is not parseable" };
  }
  if (!payload.integrationId || !payload.workspaceId || !payload.verifier || !payload.clientId) {
    return { ok: false, reason: "state payload is missing required fields" };
  }
  if (Date.now() - payload.createdAt > STATE_TTL_MS) {
    return { ok: false, reason: "state expired (provider round-trip took too long)" };
  }
  return { ok: true, payload };
}

export function newPkceVerifier(): string {
  return randomBytes(32).toString("base64url");
}
