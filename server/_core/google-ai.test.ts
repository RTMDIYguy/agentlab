import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import {
  resolveServiceAccount,
  mintServiceAccountToken,
  createOAuthFetch,
  isGoogleAiConfigured,
  clearGoogleTokenCache,
  GEMINI_OAUTH_SCOPE,
} from "./google-ai";

// Service-account handling is security-critical: these tests pin the
// resolution order (inline env → file), honest absence, JWT minting
// (RS256, correct claims), and the fetch wrapper's header contract
// (Bearer injected, x-goog-api-key stripped). All network is mocked.

const ENV_KEYS = [
  "GOOGLE_SERVICE_ACCOUNT_JSON",
  "GOOGLE_SERVICE_ACCOUNT_FILE",
  "GOOGLE_GENERATIVE_AI_API_KEY",
  "GEMINI_API_KEY",
] as const;

function makeRsaKeyPem(): string {
  return crypto
    .generateKeyPairSync("rsa", { modulusLength: 2048 })
    .privateKey.export({ type: "pkcs8", format: "pem" })
    .toString();
}

function makeServiceAccount(): { email: string; key: Record<string, unknown> } {
  const email = `test-sa-${Date.now()}@test-project.iam.gserviceaccount.com`;
  return {
    email,
    key: {
      type: "service_account",
      client_email: email,
      private_key: makeRsaKeyPem(),
      project_id: "test-project",
    },
  };
}

let tmpDir: string;
const savedEnv: Record<string, string | undefined> = {};

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "google-ai-test-"));
  clearGoogleTokenCache();
  for (const k of ENV_KEYS) {
    savedEnv[k] = process.env[k];
    delete process.env[k];
  }
});

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  }
  fs.rmSync(tmpDir, { recursive: true, force: true });
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("resolveServiceAccount", () => {
  it("prefers inline GOOGLE_SERVICE_ACCOUNT_JSON over the file", () => {
    const { key } = makeServiceAccount();
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON = JSON.stringify(key);
    process.env.GOOGLE_SERVICE_ACCOUNT_FILE = path.join(tmpDir, "does-not-matter.json");

    const resolved = resolveServiceAccount();
    expect(resolved.key).not.toBeNull();
    expect(resolved.key!.client_email).toBe((key as any).client_email);
    expect(resolved.source).toContain("inline");
  });

  it("falls back to the file when no inline JSON is set", () => {
    const { key } = makeServiceAccount();
    const file = path.join(tmpDir, "sa.json");
    fs.writeFileSync(file, JSON.stringify(key));
    process.env.GOOGLE_SERVICE_ACCOUNT_FILE = file;

    const resolved = resolveServiceAccount();
    expect(resolved.key).not.toBeNull();
    expect(resolved.source).toBe(file);
  });

  it("returns null honestly when nothing is configured", () => {
    process.env.GOOGLE_SERVICE_ACCOUNT_FILE = path.join(tmpDir, "absent.json");
    const resolved = resolveServiceAccount();
    expect(resolved.key).toBeNull();
    expect(resolved.source).toBe("");
  });

  it("treats malformed inline JSON as absent (no crash)", () => {
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON = "{not valid json";
    process.env.GOOGLE_SERVICE_ACCOUNT_FILE = path.join(tmpDir, "absent.json");
    expect(resolveServiceAccount().key).toBeNull();
  });
});

describe("mintServiceAccountToken", () => {
  it("sends an RS256 JWT-bearer grant and returns the access token", async () => {
    const { key } = makeServiceAccount();
    const fetchMock = vi.fn(async (_url: any, init?: any) =>
      new Response(JSON.stringify({ access_token: "ya29.test-token", expires_in: 3600 }), {
        status: 200,
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const { token, expiresInSec } = await mintServiceAccountToken(key as any, GEMINI_OAUTH_SCOPE);
    expect(token).toBe("ya29.test-token");
    expect(expiresInSec).toBe(3600);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://oauth2.googleapis.com/token");
    const body = new URLSearchParams(init.body);
    expect(body.get("grant_type")).toBe("urn:ietf:params:oauth:grant-type:jwt-bearer");

    // Decode the JWT assertion and verify signature + claims with node crypto.
    const assertion = body.get("assertion") || "";
    const [h, p, s] = assertion.split(".");
    const header = JSON.parse(Buffer.from(h, "base64").toString());
    const payload = JSON.parse(Buffer.from(p, "base64").toString());
    expect(header.alg).toBe("RS256");
    expect(payload.iss).toBe((key as any).client_email);
    expect(payload.scope).toBe(GEMINI_OAUTH_SCOPE);
    expect(payload.aud).toBe("https://oauth2.googleapis.com/token");
    expect(payload.exp - payload.iat).toBe(3600);

    const verifier = crypto.createVerify("RSA-SHA256");
    verifier.update(`${h}.${p}`);
    verifier.end();
    expect(verifier.verify((key as any).private_key, Buffer.from(s, "base64"))).toBe(true);
  });

  it("throws with the provider's error detail when the exchange fails", async () => {
    const { key } = makeServiceAccount();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ error: "invalid_client" }), { status: 401 }))
    );
    await expect(mintServiceAccountToken(key as any, GEMINI_OAUTH_SCOPE)).rejects.toThrow(
      /401.*invalid_client/s
    );
  });
});

describe("createOAuthFetch", () => {
  it("injects Bearer token and strips x-goog-api-key on Gemini calls", async () => {
    const { key } = makeServiceAccount();
    const apiCalls: Array<{ url: string; auth?: string; hasKeyHeader: boolean }> = [];

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: any, init?: any) => {
        const url = String(typeof input === "string" || input instanceof URL ? input : input.url);
        if (url.includes("oauth2.googleapis.com")) {
          return new Response(JSON.stringify({ access_token: "ya29.cached", expires_in: 3600 }), {
            status: 200,
          });
        }
        const headers = new Headers(init?.headers);
        apiCalls.push({
          url,
          auth: headers.get("authorization") || undefined,
          hasKeyHeader: headers.has("x-goog-api-key"),
        });
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      })
    );

    // Resolve the SA from the env so the wrapper can mint a token.
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON = JSON.stringify(key);
    // Force the module to re-resolve by clearing any cached scope via a fresh
    // token fetch (cache is warmed on first call inside the wrapper).

    const wrapped = createOAuthFetch("test");
    await wrapped("https://generativelanguage.googleapis.com/v1beta/models", {
      headers: { "x-goog-api-key": "should-be-removed", "content-type": "application/json" },
    });

    expect(apiCalls).toHaveLength(1);
    expect(apiCalls[0].auth).toBe("Bearer ya29.cached");
    expect(apiCalls[0].hasKeyHeader).toBe(false);
  });

  it("uses the cached token on the second call without re-minting", async () => {
    const { key } = makeServiceAccount();
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON = JSON.stringify(key);

    let tokenMints = 0;
    let apiCalls = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: any, init?: any) => {
        const url = String(typeof input === "string" || input instanceof URL ? input : input.url);
        if (url.includes("oauth2.googleapis.com")) {
          tokenMints += 1;
          return new Response(JSON.stringify({ access_token: `ya29.t${tokenMints}`, expires_in: 3600 }), {
            status: 200,
          });
        }
        apiCalls += 1;
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      })
    );

    const wrapped = createOAuthFetch("test");
    await wrapped("https://generativelanguage.googleapis.com/v1beta/models/a", { method: "POST" });
    await wrapped("https://generativelanguage.googleapis.com/v1beta/models/b", { method: "POST" });

    expect(apiCalls).toBe(2);
    expect(tokenMints).toBe(1);
  });
});

describe("isGoogleAiConfigured", () => {
  it("is true with an API key only (legacy path)", () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "legacy-key";
    process.env.GOOGLE_SERVICE_ACCOUNT_FILE = path.join(tmpDir, "absent.json");
    expect(isGoogleAiConfigured()).toBe(true);
  });

  it("is true with an inline service account only", () => {
    const { key } = makeServiceAccount();
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON = JSON.stringify(key);
    process.env.GOOGLE_SERVICE_ACCOUNT_FILE = path.join(tmpDir, "absent.json");
    expect(isGoogleAiConfigured()).toBe(true);
  });

  it("is false when no credential exists", () => {
    process.env.GOOGLE_SERVICE_ACCOUNT_FILE = path.join(tmpDir, "absent.json");
    expect(isGoogleAiConfigured()).toBe(false);
  });
});
