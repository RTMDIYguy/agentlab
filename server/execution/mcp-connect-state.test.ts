import { describe, it, expect } from "vitest";
import {
  createMcpConnectState,
  verifyMcpConnectState,
  newPkceVerifier,
} from "./mcp-connect-state";

const basePayload = {
  integrationId: "11111111-1111-1111-1111-111111111111",
  workspaceId: "22222222-2222-2222-2222-222222222222",
  verifier: newPkceVerifier(),
  clientId: "client-abc",
  clientSecretPresent: true,
  redirectUri: "https://os.example/settings",
  resource: "https://mcp.example/mcp",
};

describe("MCP connect state (signed, expiring)", () => {
  it("round-trips a valid state", () => {
    const state = createMcpConnectState(basePayload);
    const result = verifyMcpConnectState(state);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.integrationId).toBe(basePayload.integrationId);
      expect(result.payload.workspaceId).toBe(basePayload.workspaceId);
      expect(result.payload.verifier).toBe(basePayload.verifier);
      expect(result.payload.clientId).toBe("client-abc");
      expect(result.payload.clientSecretPresent).toBe(true);
      expect(result.payload.resource).toBe("https://mcp.example/mcp");
      expect(result.payload.nonce).toBeTruthy();
    }
  });

  it("rejects a tampered payload (signature mismatch)", () => {
    const state = createMcpConnectState(basePayload);
    const [payloadB64] = state.split(".");
    // Decode, alter the client id, re-encode — signature must fail.
    const decoded = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    decoded.clientId = "attacker-chosen";
    const forged = `${Buffer.from(JSON.stringify(decoded)).toString("base64url")}.${state.split(".")[1]}`;
    const result = verifyMcpConnectState(forged);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/signature/i);
  });

  it("rejects a structurally malformed state", () => {
    expect(verifyMcpConnectState("not-a-state").ok).toBe(false);
    expect(verifyMcpConnectState("abc.def.ghi").ok).toBe(false);
  });

  it("rejects an expired state rather than accepting stale verifiers", () => {
    const state = createMcpConnectState(basePayload);
    const [payloadB64, sig] = state.split(".");
    const decoded = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    decoded.createdAt = Date.now() - 11 * 60 * 1000; // beyond the 10-minute TTL
    const expired = `${Buffer.from(JSON.stringify(decoded)).toString("base64url")}.${sig}`;
    // NOTE: re-signing with the module's own key is impossible from outside;
    // instead we test expiry through the real module by monkey-patching Date.
    const realNow = Date.now;
    Date.now = () => realNow() + 11 * 60 * 1000;
    try {
      const result = verifyMcpConnectState(state);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toMatch(/expired/i);
    } finally {
      Date.now = realNow;
    }
  });

  it("verifier is URL-safe and long enough for PKCE S256", () => {
    const v = newPkceVerifier();
    expect(v.length).toBeGreaterThanOrEqual(43);
    expect(v).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});
