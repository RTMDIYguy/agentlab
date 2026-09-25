import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Watchdog credential-health probe (2026-09-25, handoff move 4).
 *
 * Auth rot must be caught before runs fail. These hermetic tests pin the
 * three honest states (missing / ok / mint_failed), the exact-fix mapping for
 * the real failure classes (invalid_client, scope refusal, 403, network), and
 * the 5-minute cache that keeps the network probe polite while still picking
 * up a freshly added key file immediately.
 */

const googleAi = vi.hoisted(() => ({
  isGoogleAiConfigured: vi.fn<() => boolean>(),
  getGoogleAccessToken: vi.fn<() => Promise<{ token: string; scope: string; source: string }>>(),
}));

vi.mock("../_core/google-ai", () => googleAi);

import {
  probeCredentialHealth,
  resetCredentialHealthCache,
  getCredentialHealth,
} from "./ops-watchdog";

beforeEach(() => {
  resetCredentialHealthCache();
  googleAi.isGoogleAiConfigured.mockReset();
  googleAi.getGoogleAccessToken.mockReset();
});

describe("probeCredentialHealth", () => {
  it("reports missing with the exact fix when no credential is configured", async () => {
    googleAi.isGoogleAiConfigured.mockReturnValue(false);

    const health = await probeCredentialHealth();

    expect(health.healthy).toBe(false);
    expect(health.state).toBe("missing");
    expect(health.detail).toContain("secrets/gemini-service-account.json");
    expect(health.recommendedFix).toContain("secrets/gemini-service-account.json");
    // Missing is checked fresh every call — a new key file is seen instantly.
    expect(googleAi.getGoogleAccessToken).not.toHaveBeenCalled();
  });

  it("reports ok when the token mint succeeds", async () => {
    googleAi.isGoogleAiConfigured.mockReturnValue(true);
    googleAi.getGoogleAccessToken.mockResolvedValue({
      token: "ya29.test",
      scope: "https://www.googleapis.com/auth/generative-language",
      source: "test",
    });

    const health = await probeCredentialHealth();

    expect(health.healthy).toBe(true);
    expect(health.state).toBe("ok");
    expect(health.recommendedFix).toBeNull();
    expect(health.detail).toContain("generative-language");
  });

  it("maps invalid_client (rotated/deleted key) to the create-fresh-key fix", async () => {
    googleAi.isGoogleAiConfigured.mockReturnValue(true);
    googleAi.getGoogleAccessToken.mockRejectedValue(
      new Error("Google OAuth token exchange failed (400): {\"error\":\"invalid_client\"}")
    );

    const health = await probeCredentialHealth();

    expect(health.healthy).toBe(false);
    expect(health.state).toBe("mint_failed");
    expect(health.detail).toContain("invalid_client");
    expect(health.recommendedFix).toMatch(/fresh JSON key/i);
  });

  it("maps a 403 to the API-enablement / Vertex-escape-hatch fix", async () => {
    googleAi.isGoogleAiConfigured.mockReturnValue(true);
    googleAi.getGoogleAccessToken.mockRejectedValue(new Error("403 permission denied"));

    const health = await probeCredentialHealth();

    expect(health.state).toBe("mint_failed");
    expect(health.recommendedFix).toMatch(/Generative Language API|aiplatform\.user/);
  });

  it("maps scope refusal to the cloud-platform scope fix", async () => {
    googleAi.isGoogleAiConfigured.mockReturnValue(true);
    googleAi.getGoogleAccessToken.mockRejectedValue(new Error("invalid_scope requested"));

    const health = await probeCredentialHealth();

    expect(health.recommendedFix).toMatch(/GOOGLE_AI_OAUTH_SCOPE/);
  });

  it("maps network failure to a connectivity fix without blaming the key", async () => {
    googleAi.isGoogleAiConfigured.mockReturnValue(true);
    googleAi.getGoogleAccessToken.mockRejectedValue(new Error("fetch failed: ENOTFOUND"));

    const health = await probeCredentialHealth();

    expect(health.state).toBe("mint_failed");
    expect(health.recommendedFix).toMatch(/connectivity/i);
  });

  it("caches mint probes for 5 minutes but re-checks after reset", async () => {
    googleAi.isGoogleAiConfigured.mockReturnValue(true);
    googleAi.getGoogleAccessToken
      .mockResolvedValueOnce({ token: "ya29.1", scope: "s", source: "test" })
      .mockResolvedValueOnce({ token: "ya29.2", scope: "s", source: "test" });

    await probeCredentialHealth();
    await probeCredentialHealth();
    expect(googleAi.getGoogleAccessToken).toHaveBeenCalledTimes(1);

    resetCredentialHealthCache();
    await probeCredentialHealth();
    expect(googleAi.getGoogleAccessToken).toHaveBeenCalledTimes(2);
  });

  it("re-checks the missing state on every call (cache must not hide a new key file)", async () => {
    googleAi.isGoogleAiConfigured
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    googleAi.getGoogleAccessToken.mockResolvedValue({ token: "ya29.x", scope: "s", source: "test" });

    const before = await probeCredentialHealth();
    const after = await probeCredentialHealth();

    expect(before.state).toBe("missing");
    expect(after.state).toBe("ok");
  });
});

describe("getCredentialHealth handler", () => {
  it("answers 200 with the health shape", async () => {
    googleAi.isGoogleAiConfigured.mockReturnValue(false);
    const status = vi.fn(() => ({ json: jsonSpy }));
    const jsonSpy = vi.fn();
    const res: any = { status };

    await getCredentialHealth({} as any, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(jsonSpy).toHaveBeenCalledTimes(1);
    const body = jsonSpy.mock.calls[0][0];
    expect(body.state).toBe("missing");
    expect(typeof body.checkedAt).toBe("string");
  });
});
