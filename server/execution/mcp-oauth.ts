/**
 * Metadata-driven OAuth 2.1 connect flow for MCP servers (CC-2026-10-01-005/006).
 *
 * Generic by design: endpoints are DISCOVERED from the server's own RFC 9728
 * (protected resource) and RFC 8414 (authorization server) metadata, so any
 * OAuth-gated MCP server connects without bespoke code. Upwork MCP is the
 * first tenant — its live metadata was captured in register CC-2026-10-01-005:
 *   authorize  https://www.upwork.com/ab/account-security/oauth2/authorize
 *   token      https://www.upwork.com/api/v3/oauth2/token
 *   grants     authorization_code + refresh_token, PKCE S256
 *   token auth client_secret_post/basic/none/private_key_jwt
 *
 * Honesty rules: no token values are ever logged; every HTTP failure throws
 * with the real status and response head; nothing is cached or fabricated.
 */
import { createHash, randomBytes } from "node:crypto";

export interface ProtectedResourceMetadata {
  resource: string;
  authorization_servers?: string[];
  bearer_methods_supported?: string[];
  resource_name?: string;
  scopes_supported?: string[];
}

export interface AuthorizationServerMetadata {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  revocation_endpoint?: string;
  registration_endpoint?: string;
  response_types_supported?: string[];
  grant_types_supported?: string[];
  code_challenge_methods_supported?: string[];
  token_endpoint_auth_methods_supported?: string[];
  scopes_supported?: string[];
}

export interface TokenSet {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  obtainedAt: number;
}

export class OAuthFlowError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly bodyHead?: string,
    readonly oauthError?: string
  ) {
    super(message);
    this.name = "OAuthFlowError";
  }
}

type FetchImpl = (url: string, init?: RequestInit) => Promise<Response>;
const defaultFetch: FetchImpl = (url, init) => fetch(url, init);

async function getJson(
  url: string,
  fetchImpl: FetchImpl,
  what: string
): Promise<Record<string, unknown>> {
  let res: Response;
  try {
    res = await fetchImpl(url, { method: "GET", headers: { Accept: "application/json" } });
  } catch (err) {
    throw new OAuthFlowError(`${what}: network error reaching ${url}: ${(err as Error).message}`);
  }
  const bodyText = await res.text();
  const head = bodyText.slice(0, 500);
  if (!res.ok) {
    throw new OAuthFlowError(`${what}: ${url} returned HTTP ${res.status}`, res.status, head);
  }
  try {
    return JSON.parse(bodyText) as Record<string, unknown>;
  } catch {
    throw new OAuthFlowError(`${what}: ${url} returned non-JSON body`, res.status, head);
  }
}

/**
 * RFC 9728 discovery for the protected-resource metadata that guards an MCP
 * endpoint. Tries `/.well-known/oauth-protected-resource<mcp-pathname>` first
 * (the shape Upwork serves live) then the origin-level document.
 */
export async function discoverProtectedResource(
  mcpEndpointUrl: string,
  fetchImpl: FetchImpl = defaultFetch
): Promise<ProtectedResourceMetadata> {
  const url = new URL(mcpEndpointUrl);
  const origin = url.origin;
  const path = url.pathname.replace(/\/+$/, "");
  const candidates = [
    `${origin}/.well-known/oauth-protected-resource${path}`,
    `${origin}/.well-known/oauth-protected-resource`,
  ];
  let lastError: OAuthFlowError | undefined;
  for (const candidate of candidates) {
    try {
      const doc = await getJson(candidate, fetchImpl, "protected-resource metadata");
      if (typeof doc.resource === "string") return doc as unknown as ProtectedResourceMetadata;
      lastError = new OAuthFlowError(
        `protected-resource metadata at ${candidate} has no "resource" field`
      );
    } catch (err) {
      lastError = err as OAuthFlowError;
    }
  }
  throw lastError ?? new OAuthFlowError("protected-resource discovery failed");
}

/**
 * RFC 8414 discovery for the authorization server that fronts the MCP
 * resource. Falls back to treating the resource origin itself as the AS when
 * no authorization_servers list is present (common for self-hosted gateways).
 */
export async function discoverAuthorizationServer(
  resource: ProtectedResourceMetadata,
  fetchImpl: FetchImpl = defaultFetch
): Promise<AuthorizationServerMetadata> {
  const servers = resource.authorization_servers?.length
    ? resource.authorization_servers
    : [new URL(resource.resource).origin];
  let lastError: OAuthFlowError | undefined;
  for (const server of servers) {
    const base = new URL(server).origin;
    const candidates = [
      `${base}/.well-known/oauth-authorization-server`,
      `${base}/.well-known/openid-configuration`,
    ];
    for (const candidate of candidates) {
      try {
        const doc = await getJson(candidate, fetchImpl, "authorization-server metadata");
        if (typeof doc.authorization_endpoint === "string" && typeof doc.token_endpoint === "string") {
          return doc as unknown as AuthorizationServerMetadata;
        }
        lastError = new OAuthFlowError(
          `authorization-server metadata at ${candidate} lacks endpoints`
        );
      } catch (err) {
        lastError = err as OAuthFlowError;
      }
    }
  }
  throw lastError ?? new OAuthFlowError("authorization-server discovery failed");
}

// ---------------------------------------------------------------------------
// PKCE (S256)
// ---------------------------------------------------------------------------

export function createPkcePair(): { verifier: string; challenge: string } {
  const verifier = randomBytes(32).toString("base64url"); // 43-char URL-safe
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

// ---------------------------------------------------------------------------
// Authorize URL + token exchange + refresh + revoke
// ---------------------------------------------------------------------------

export interface AuthorizeUrlInput {
  metadata: AuthorizationServerMetadata;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  state: string;
  /** RFC 8707 resource indicator — some MCP gateways require it. */
  resource?: string;
  scopes?: string[];
}

export function buildAuthorizationUrl(input: AuthorizeUrlInput): string {
  const url = new URL(input.metadata.authorization_endpoint);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", input.clientId);
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("code_challenge", input.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("state", input.state);
  if (input.scopes?.length) url.searchParams.set("scope", input.scopes.join(" "));
  if (input.resource) url.searchParams.set("resource", input.resource);
  return url.toString();
}

export interface ExchangeInput {
  tokenEndpoint: string;
  code: string;
  codeVerifier: string;
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  resource?: string;
  fetchImpl?: FetchImpl;
}

async function postTokenForm(
  tokenEndpoint: string,
  params: Record<string, string>,
  fetchImpl: FetchImpl
): Promise<TokenSet> {
  let res: Response;
  try {
    res = await fetchImpl(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams(params).toString(),
    });
  } catch (err) {
    throw new OAuthFlowError(
      `token endpoint network error: ${(err as Error).message}`
    );
  }
  const bodyText = await res.text();
  let parsed: Record<string, unknown> | undefined;
  try {
    parsed = JSON.parse(bodyText) as Record<string, unknown>;
  } catch {
    parsed = undefined;
  }
  if (!res.ok) {
    throw new OAuthFlowError(
      `token endpoint returned HTTP ${res.status}`,
      res.status,
      bodyText.slice(0, 500),
      typeof parsed?.error === "string" ? parsed.error : undefined
    );
  }
  if (!parsed || typeof parsed.access_token !== "string") {
    throw new OAuthFlowError(
      "token endpoint response has no access_token",
      res.status,
      bodyText.slice(0, 500)
    );
  }
  return {
    access_token: parsed.access_token as string,
    token_type: typeof parsed.token_type === "string" ? parsed.token_type : undefined,
    expires_in: typeof parsed.expires_in === "number" ? parsed.expires_in : undefined,
    refresh_token:
      typeof parsed.refresh_token === "string" ? parsed.refresh_token : undefined,
    scope: typeof parsed.scope === "string" ? parsed.scope : undefined,
    obtainedAt: Date.now(),
  };
}

export async function exchangeCodeForTokens(input: ExchangeInput): Promise<TokenSet> {
  const params: Record<string, string> = {
    grant_type: "authorization_code",
    code: input.code,
    redirect_uri: input.redirectUri,
    client_id: input.clientId,
    code_verifier: input.codeVerifier,
  };
  if (input.clientSecret) params.client_secret = input.clientSecret;
  if (input.resource) params.resource = input.resource;
  return postTokenForm(input.tokenEndpoint, params, input.fetchImpl ?? defaultFetch);
}

export async function refreshAccessToken(
  input: Omit<ExchangeInput, "code" | "codeVerifier" | "redirectUri"> & {
    refreshToken: string;
  }
): Promise<TokenSet> {
  const params: Record<string, string> = {
    grant_type: "refresh_token",
    refresh_token: input.refreshToken,
    client_id: input.clientId,
  };
  if (input.clientSecret) params.client_secret = input.clientSecret;
  if (input.resource) params.resource = input.resource;
  return postTokenForm(input.tokenEndpoint, params, input.fetchImpl ?? defaultFetch);
}

export async function revokeToken(input: {
  revocationEndpoint: string;
  token: string;
  clientId: string;
  clientSecret?: string;
  fetchImpl?: FetchImpl;
}): Promise<void> {
  const params: Record<string, string> = { token: input.token, client_id: input.clientId };
  if (input.clientSecret) params.client_secret = input.clientSecret;
  const res = await (input.fetchImpl ?? defaultFetch)(input.revocationEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams(params).toString(),
  });
  if (!res.ok && res.status !== 200 && res.status !== 204) {
    const head = (await res.text()).slice(0, 300);
    throw new OAuthFlowError(
      `revocation endpoint returned HTTP ${res.status}`,
      res.status,
      head
    );
  }
}

/** True when the token will expire within `marginSeconds` (default 120). */
export function isTokenExpiring(token: TokenSet, marginSeconds = 120): boolean {
  if (!token.expires_in) return false;
  const elapsed = (Date.now() - token.obtainedAt) / 1000;
  return elapsed >= token.expires_in - marginSeconds;
}

/**
 * One-call helper: full discovery for an MCP endpoint. Returns everything the
 * Settings connect flow needs to render the authorize step.
 */
export async function discoverMcpOAuthFlow(
  mcpEndpointUrl: string,
  fetchImpl: FetchImpl = defaultFetch
): Promise<{ resource: ProtectedResourceMetadata; server: AuthorizationServerMetadata }> {
  const resource = await discoverProtectedResource(mcpEndpointUrl, fetchImpl);
  const server = await discoverAuthorizationServer(resource, fetchImpl);
  return { resource, server };
}
