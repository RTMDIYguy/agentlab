import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

/**
 * Google AI authentication for AgentLab (2026-09-24, CC-2026-09-24-006).
 *
 * ORGANIZATIONAL POLICY: Robert's GCP org forbids API keys. Gemini access is
 * through a GCP service account using the OAuth2 JWT-bearer grant instead:
 *
 *   Service account: ais-gemini-key-c716673060c044c@718497644379.iam.gserviceaccount.com
 *   Key file:        secrets/gemini-service-account.json  (git-ignored)
 *   Or inline:       GOOGLE_SERVICE_ACCOUNT_JSON env var (raw JSON)
 *
 * Token minting uses Node's built-in crypto (RS256 signing) — no extra
 * dependency. Tokens are cached in memory and refreshed 5 minutes before
 * expiry. The @ai-sdk/google provider is wrapped with a custom fetch that
 * injects `Authorization: Bearer <token>` and strips the x-goog-api-key
 * header, because the Gemini endpoint accepts OAuth bearer tokens.
 *
 * An API-key fallback is preserved for environments without the org policy
 * (GOOGLE_GENERATIVE_AI_API_KEY / GEMINI_API_KEY), but the service account
 * always wins when present.
 *
 * ADC user-principal path (2026-09-27, CC-2026-09-25-016): probes proved this
 * org's gateway treats the Gemini API as PRINCIPAL-ONLY — the new AQ. AI
 * Studio keys are rejected with API_KEY_SERVICE_BLOCKED no matter the header
 * style or API version, so NO API key can authenticate. The credential that
 * DOES assert a principal is the gcloud user login. After a one-time
 * `gcloud auth application-default login --scopes=…,generative-language`,
 * the ADC authorized_user file at %APPDATA%|~/.config/gcloud/
 * application_default_credentials.json mints refresh-grant tokens that the
 * API accepts. Precedence: service account (org policy) → ADC user →
 * API key. Path override: GOOGLE_AI_ADC_FILE (also how tests stay hermetic).
 */

const OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";

// Scope for the consumer Gemini API (generativelanguage.googleapis.com).
export const GEMINI_OAUTH_SCOPE = "https://www.googleapis.com/auth/generative-language";
// Broad scope required by Vertex AI endpoints.
const CLOUD_PLATFORM_SCOPE = "https://www.googleapis.com/auth/cloud-platform";

/**
 * Endpoint selection (2026-09-24): the default is the consumer Gemini API.
 * If Robert's org routes model access through Vertex AI (his service account
 * holds roles/mcp.toolUser at project level), set GOOGLE_AI_BASE_URL to the
 * Vertex prefix — the SDK's `{baseURL}/{modelId}:generateContent` shape maps
 * 1:1 onto Vertex's URL format:
 *
 *   GOOGLE_AI_BASE_URL=https://us-central1-aiplatform.googleapis.com/v1beta1/projects/PROJECT/locations/us-central1
 *
 * with model ids like "publishers/google/models/gemini-2.5-flash". Vertex
 * requires the cloud-platform scope, which is selected automatically when
 * the base URL mentions aiplatform (or explicitly via GOOGLE_AI_OAUTH_SCOPE).
 */
function resolveBaseUrl(): string | undefined {
  const url = process.env.GOOGLE_AI_BASE_URL;
  return url && url.trim() ? url.trim().replace(/\/$/, "") : undefined;
}

function resolveScopes(): string[] {
  const explicit = process.env.GOOGLE_AI_OAUTH_SCOPE;
  if (explicit && explicit.trim()) return [explicit.trim()];
  const baseUrl = resolveBaseUrl();
  if (baseUrl && /aiplatform\.googleapis\.com/.test(baseUrl)) return [CLOUD_PLATFORM_SCOPE];
  return [GEMINI_OAUTH_SCOPE, CLOUD_PLATFORM_SCOPE];
}

type ServiceAccountKey = {
  client_email: string;
  private_key: string;
  project_id?: string;
  type?: string;
};

type AdcAuthorizedUser = {
  type: "authorized_user";
  client_id: string;
  client_secret: string;
  refresh_token: string;
  quota_project_id?: string;
};

/**
 * Locate a gcloud ADC authorized_user credential. Order: explicit override
 * (GOOGLE_AI_ADC_FILE), then GOOGLE_APPLICATION_CREDENTIALS if it points at
 * an authorized_user file, then the standard gcloud locations. Only
 * authorized_user files are usable here — service-account files go through
 * resolveServiceAccount instead.
 */
export function resolveAdcUserCredentials(): { creds: AdcAuthorizedUser | null; source: string } {
  // Explicit overrides short-circuit: if GOOGLE_AI_ADC_FILE or
  // GOOGLE_APPLICATION_CREDENTIALS is set, the machine-default ADC file is
  // NOT consulted — an explicit pointer that is absent or unusable means
  // "no ADC credential", never "silently use whatever is lying around".
  const explicit = process.env.GOOGLE_AI_ADC_FILE || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const label = process.env.GOOGLE_AI_ADC_FILE ? "GOOGLE_AI_ADC_FILE" : "GOOGLE_APPLICATION_CREDENTIALS";
  const candidates: Array<{ p: string; source: string }> = explicit
    ? [{ p: explicit, source: `${label}: ${explicit}` }]
    : [];
  if (!explicit) {
    const gcloudDir = process.env.APPDATA
      ? path.join(process.env.APPDATA, "gcloud")
      : process.env.HOME
        ? path.join(process.env.HOME, ".config", "gcloud")
        : null;
    if (gcloudDir) {
      candidates.push({
        p: path.join(gcloudDir, "application_default_credentials.json"),
        source: "gcloud ADC default",
      });
    }
  }

  for (const { p, source } of candidates) {
    try {
      if (!fs.existsSync(p)) continue;
      const parsed = JSON.parse(fs.readFileSync(p, "utf-8"));
      if (
        parsed?.type === "authorized_user" &&
        typeof parsed?.client_id === "string" &&
        typeof parsed?.client_secret === "string" &&
        typeof parsed?.refresh_token === "string"
      ) {
        return { creds: parsed as AdcAuthorizedUser, source };
      }
    } catch {
      // Unreadable/malformed candidate — treated as absent.
    }
  }
  return { creds: null, source: "" };
}

/**
 * Mint an access token from the ADC refresh grant. The granted scopes come
 * from the ORIGINAL interactive login (`gcloud auth application-default
 * login --scopes=...`) — the token endpoint clamps to what was consented,
 * so a login without the generative-language scope cannot be elevated here.
 */
export async function mintAdcUserToken(
  creds: AdcAuthorizedUser
): Promise<{ token: string; expiresInSec: number }> {
  const res = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: creds.client_id,
      client_secret: creds.client_secret,
      refresh_token: creds.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ADC refresh-token exchange failed (${res.status}): ${text.slice(0, 300)}`);
  }
  const data = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) throw new Error("ADC refresh-token exchange returned no access_token.");
  return { token: data.access_token, expiresInSec: data.expires_in ?? 3600 };
}

let cachedToken: { token: string; expiryMs: number } | null = null;
// Which scope the token endpoint actually accepted (avoid re-probing).
let workingScope: string | null = null;

/** Locate the service-account key: inline env JSON first, then file. */
export function resolveServiceAccount(): { key: ServiceAccountKey | null; source: string } {
  const inline = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (inline && inline.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(inline) as ServiceAccountKey;
      if (parsed.client_email && parsed.private_key) {
        return { key: parsed, source: "GOOGLE_SERVICE_ACCOUNT_JSON (inline)" };
      }
    } catch {
      // Malformed inline JSON — fall through to file detection.
    }
  }

  const filePath =
    process.env.GOOGLE_SERVICE_ACCOUNT_FILE ||
    path.resolve(process.cwd(), "secrets", "gemini-service-account.json");
  if (fs.existsSync(filePath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(filePath, "utf-8")) as ServiceAccountKey;
      if (parsed.client_email && parsed.private_key) {
        return { key: parsed, source: filePath };
      }
    } catch {
      // Key file exists but is not valid JSON — treat as absent and let the
      // caller report honestly rather than crash the request path.
    }
  }

  return { key: null, source: "" };
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Mint a short-lived access token via the JWT-bearer grant (RFC 7523). */
export async function mintServiceAccountToken(
  key: ServiceAccountKey,
  scope: string
): Promise<{ token: string; expiresInSec: number }> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      iss: key.client_email,
      scope,
      aud: OAUTH_TOKEN_URL,
      iat: now,
      exp: now + 3600,
    })
  );

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(`${header}.${payload}`);
  signer.end();
  const signature = base64url(signer.sign(key.private_key));
  const assertion = `${header}.${payload}.${signature}`;

  const res = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Google OAuth token exchange failed (${res.status}): ${text.slice(0, 300)}`
    );
  }

  const data = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) {
    throw new Error("Google OAuth token exchange returned no access_token.");
  }
  return { token: data.access_token, expiresInSec: data.expires_in ?? 3600 };
}

/**
 * Get a valid access token, using the cache when fresh. Tries the
 * generative-language scope first, then cloud-platform.
 */
export async function getGoogleAccessToken(): Promise<{ token: string; scope: string; source: string }> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiryMs - now > 5 * 60 * 1000) {
    return { token: cachedToken.token, scope: workingScope || GEMINI_OAUTH_SCOPE, source: "cache" };
  }

  // Precedence (org policy): service account first, then the ADC user
  // principal (the only credential class this org's gateway accepts for the
  // Gemini API), then the legacy API-key path at the call sites.
  const { key, source } = resolveServiceAccount();
  if (key) {
    const scopes = workingScope ? [workingScope] : resolveScopes();
    let lastError: Error | null = null;
    for (const scope of scopes) {
      try {
        const { token, expiresInSec } = await mintServiceAccountToken(key, scope);
        cachedToken = { token, expiryMs: now + expiresInSec * 1000 };
        workingScope = scope;
        return { token, scope, source };
      } catch (err: any) {
        lastError = err;
        // invalid_scope → try the next candidate; anything else is fatal.
        if (!/invalid_scope|Scope/i.test(err?.message || "")) throw err;
      }
    }
    throw lastError || new Error("Google OAuth token exchange failed for all candidate scopes.");
  }

  const adc = resolveAdcUserCredentials();
  if (adc.creds) {
    const { token, expiresInSec } = await mintAdcUserToken(adc.creds);
    cachedToken = { token, expiryMs: now + expiresInSec * 1000 };
    // The refresh grant returns whatever scopes were originally consented;
    // record the Gemini scope as the effective one for telemetry.
    workingScope = GEMINI_OAUTH_SCOPE;
    return { token, scope: GEMINI_OAUTH_SCOPE, source: adc.source };
  }

  throw new Error(
    "GOOGLE AI AUTH: no usable credential. This org's gateway is principal-only (API keys are rejected with API_KEY_SERVICE_BLOCKED). Run: gcloud auth application-default login --scopes=https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/generative-language — or place a service-account key at secrets/gemini-service-account.json."
  );
}

/**
 * Clear the cached access token. Used by tests and by credential rotation
 * (e.g. the service-account key file was replaced at runtime).
 */
export function clearGoogleTokenCache(): void {
  cachedToken = null;
  workingScope = null;
}

/** True when Gemini is reachable through any auth path (SA, ADC user, or key). */
export function isGoogleAiConfigured(): boolean {
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY) return true;
  if (process.env.GOOGLE_AI_ADC_DISABLED === "1") return resolveServiceAccount().key !== null;
  return resolveAdcUserCredentials().creds !== null || resolveServiceAccount().key !== null;
}

function mergeHeaders(input: any, init: any): Headers {
  const merged = new Headers();
  const fromInput =
    input && typeof input === "object" && typeof input.headers !== "undefined"
      ? input.headers
      : undefined;
  for (const source of [fromInput, init?.headers]) {
    if (!source) continue;
    if (source instanceof Headers || (source && typeof source.forEach === "function")) {
      (source as Headers).forEach((value, name) => merged.set(name, value));
    } else if (Array.isArray(source)) {
      for (const [name, value] of source) merged.set(name, value as string);
    } else if (typeof source === "object") {
      for (const [name, value] of Object.entries(source)) merged.set(name, String(value));
    }
  }
  return merged;
}

/**
 * Wrap fetch so every request to the Gemini endpoint carries the
 * service-account bearer token instead of an API key.
 */
export function createOAuthFetch(source: string): typeof fetch {
  return async (input: any, init?: any) => {
    const { token } = await getGoogleAccessToken();
    const headers = mergeHeaders(input, init);
    headers.set("authorization", `Bearer ${token}`);
    headers.delete("x-goog-api-key");
    if (init || (input && typeof input === "object" && typeof input.body !== "undefined")) {
      return fetch(input, { ...(init || {}), headers });
    }
    if (typeof input === "string" || input instanceof URL) {
      return fetch(input, { headers });
    }
    // input is a Request — re-issue with merged headers.
    return fetch(new Request(input, { headers, method: input.method, body: input.body, duplex: "half" } as any));
  };
}

/**
 * Create the @ai-sdk/google provider with the best available auth:
 * service account (org policy) first, API key fallback second.
 * Callers keep their own "not configured → 503" guards via isGoogleAiConfigured().
 */
export function createGoogleProvider() {
  const { key, source } = resolveServiceAccount();
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  const adc = process.env.GOOGLE_AI_ADC_DISABLED === "1" ? { creds: null } : resolveAdcUserCredentials();

  // ADC user-principal bearer: the only credential class this org's gateway
  // accepts for the Gemini API (principal-only — see header comment). It
  // outranks the API-key fallback because keys are PROVEN unusable on this
  // gateway (API_KEY_SERVICE_BLOCKED); a stale key must not shadow it.
  if (adc.creds) {
    const baseUrl = resolveBaseUrl();
    return createGoogleGenerativeAI({
      apiKey: "adc-user-oauth",
      ...(baseUrl ? { baseURL: baseUrl } : {}),
      fetch: createOAuthFetch(adc.source) as any,
    });
  }

  if (key) {
    // The SDK requires a non-empty apiKey string at construction; the real
    // auth happens in the fetch wrapper (Bearer token, x-goog-api-key stripped).
    const baseUrl = resolveBaseUrl();
    return createGoogleGenerativeAI({
      apiKey: apiKey || "service-account-oauth",
      ...(baseUrl ? { baseURL: baseUrl } : {}),
      fetch: createOAuthFetch(source) as any,
    });
  }

  // API-key fallback (legacy path, unchanged behavior).
  return createGoogleGenerativeAI(
    apiKey ? { apiKey } : (undefined as unknown as { apiKey: string })
  );
}

/**
 * Default model fallback chain for new Gemini calls (2026-09-30 evening,
 * CC-2026-09-30-012).
 *
 * Google RETIRED the pinned 2.x ids ("gemini-2.5-flash" et al.) for new
 * accounts: every call 404s with "no longer available to new users" while
 * pointing at the 3.x family. This was invisible behind per-call try/catch
 * fallbacks that let hallucinated/fabricated output quietly replace the
 * model. The "-latest" aliases track the current GA model on every account
 * (the same chain agent-runner has used since 2026-09-28), so they lead;
 * a pinned 3.x id follows as a concrete fallback. IMPORTANT: never call
 * google(...) with a pinned 2.x id again — new aliases replace old ones.
 */
export const GOOGLE_MODEL_CHAIN = [
  "gemini-flash-latest",
  "gemini-3.8-flash",
  "gemini-pro-latest",
] as const;

export type GoogleModelChainEntry = (typeof GOOGLE_MODEL_CHAIN)[number];

/**
 * Iterate the model chain, invoking `fn` with the provider bound to each
 * model until one succeeds. Returns { model, value } of the first success
 * or rethrows the LAST model's error (preferring errors whose message names
 * a credential problem, which no model id can fix). Never used silently:
 * the caller's catch must degrade to an HONEST fallback (no fabricated
 * content, no invented numbers), per the honesty-audit contract.
 */
export async function withGoogleModelChain<T>(
  fn: (model: GoogleModelChainEntry) => Promise<T>
): Promise<{ model: GoogleModelChainEntry; value: T }> {
  let lastError: unknown;
  for (const model of GOOGLE_MODEL_CHAIN) {
    try {
      return { model, value: await fn(model) };
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}
