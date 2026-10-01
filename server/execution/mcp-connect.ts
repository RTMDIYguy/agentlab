/**
 * MCP OAuth connect orchestration (CC-2026-10-01-007).
 *
 * Ties the discovery module (mcp-oauth.ts), the signed browser state
 * (mcp-connect-state.ts), and the vault round-trip (mcp-tokens.ts pattern +
 * server/_core/env.ts applySecretToEnv) into the Settings-facing lifecycle:
 *
 *   startConnect    → discovery + PKCE + signed state + authorize URL
 *   completeConnect → verify state once → exchange code → vault round-trip
 *                     → integration flips active
 *   disconnectMcp   → revoke (best-effort) → clear token + vault row → inactive
 *
 * Credential metadata (client id/secret) lives in the integration row's
 * config JSON — the catalog Robert already edits — while the TOKEN itself
 * never persists in the row: it goes through applySecretToEnv into
 * process.env under MCP_<NAME>_TOKEN (real value) with a masked-preview
 * workspace_secrets row (metadata), exactly like every other provider.
 */
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { workspaceIntegrations, workspaceSecrets } from "../schema";
import {
  discoverMcpOAuthFlow,
  createPkcePair,
  exchangeCodeForTokens,
  refreshAccessToken,
  revokeToken,
  OAuthFlowError,
  type AuthorizationServerMetadata,
  type TokenSet,
} from "./mcp-oauth";
import { createMcpConnectState, verifyMcpConnectState } from "./mcp-connect-state";
import { generateMaskedPreview, applySecretToEnv, isOperatorWorkspace } from "../_core/env";

export interface StartConnectResult {
  ok: boolean;
  authorizeUrl?: string;
  discovery?: {
    authorizationEndpoint: string;
    tokenEndpoint: string;
    revocationEndpoint?: string;
    scopesSupported?: string[];
  };
  error?: string;
}

export interface CompleteConnectResult {
  ok: boolean;
  connected?: boolean;
  maskedPreview?: string;
  toolCountHint?: undefined; // honesty: tool availability is verified by a real session, not assumed here
  error?: string;
}

function oauthErrorMessage(err: unknown): string {
  if (err instanceof OAuthFlowError) {
    return `OAuth flow failed${err.oauthError ? ` (${err.oauthError})` : ""}: ${err.message}`;
  }
  return (err as Error)?.message ?? "Unknown OAuth error";
}

export async function startMcpConnect(input: {
  integrationId: string;
  workspaceId: string;
  redirectUri: string;
}): Promise<StartConnectResult> {
  const [row] = await db
    .select()
    .from(workspaceIntegrations)
    .where(
      and(
        eq(workspaceIntegrations.id, input.integrationId),
        eq(workspaceIntegrations.workspaceId, input.workspaceId),
        eq(workspaceIntegrations.type, "mcp")
      )
    )
    .limit(1);
  if (!row) return { ok: false, error: "MCP integration not found in this workspace" };

  const config = (row.config ?? {}) as Record<string, unknown>;
  const endpoint = config.endpoint;
  if (typeof endpoint !== "string" || !/^https:\/\//i.test(endpoint)) {
    return {
      ok: false,
      error:
        "OAuth connect requires an https MCP endpoint URL (stdio/local command servers are not OAuth-connectable).",
    };
  }
  const clientId = typeof config.clientId === "string" ? config.clientId : "";
  if (!clientId) {
    return {
      ok: false,
      error:
        "No client_id on this integration yet — save the provider's OAuth app credentials (client id + secret) on the MCP server first.",
    };
  }
  const clientSecret = typeof config.clientSecret === "string" ? config.clientSecret : "";

  let metadata: AuthorizationServerMetadata;
  let resource: { resource: string };
  try {
    const discovered = await discoverMcpOAuthFlow(endpoint);
    metadata = discovered.server;
    resource = { resource: discovered.resource.resource };
  } catch (err) {
    return { ok: false, error: oauthErrorMessage(err) };
  }

  const { verifier, challenge } = createPkcePair();
  const state = createMcpConnectState({
    integrationId: row.id,
    workspaceId: input.workspaceId,
    verifier,
    clientId,
    clientSecretPresent: clientSecret.length > 0,
    redirectUri: input.redirectUri,
    resource: resource.resource,
  });

  // Persist the credential metadata needed at callback time. The verifier
  // rides ONLY inside the signed state — never stored server-side.
  await db
    .update(workspaceIntegrations)
    .set({
      config: {
        ...config,
        transport: "sse",
        oauth: {
          authorizationEndpoint: metadata.authorization_endpoint,
          tokenEndpoint: metadata.token_endpoint,
          revocationEndpoint: metadata.revocation_endpoint ?? null,
          clientIdPresent: clientId.length > 0,
          clientSecretPresent: clientSecret.length > 0,
          stateCreatedAt: Date.now(),
        },
      },
      updatedAt: new Date(),
    })
    .where(eq(workspaceIntegrations.id, row.id));

  const authorizeUrl = new URL(metadata.authorization_endpoint);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", input.redirectUri);
  authorizeUrl.searchParams.set("code_challenge", challenge);
  authorizeUrl.searchParams.set("code_challenge_method", "S256");
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("resource", resource.resource);

  return {
    ok: true,
    authorizeUrl: authorizeUrl.toString(),
    discovery: {
      authorizationEndpoint: metadata.authorization_endpoint,
      tokenEndpoint: metadata.token_endpoint,
      revocationEndpoint: metadata.revocation_endpoint,
      scopesSupported: metadata.scopes_supported,
    },
  };
}

export async function completeMcpConnect(input: {
  code: string;
  state: string;
}): Promise<CompleteConnectResult> {
  const verified = verifyMcpConnectState(input.state);
  if (!verified.ok) return { ok: false, error: `Connect state rejected: ${verified.reason}` };
  const statePayload = verified.payload;

  const [row] = await db
    .select()
    .from(workspaceIntegrations)
    .where(
      and(
        eq(workspaceIntegrations.id, statePayload.integrationId),
        eq(workspaceIntegrations.workspaceId, statePayload.workspaceId),
        eq(workspaceIntegrations.type, "mcp")
      )
    )
    .limit(1);
  if (!row) return { ok: false, error: "MCP integration not found for this connect state" };

  const config = (row.config ?? {}) as Record<string, unknown>;
  const clientSecret =
    statePayload.clientSecretPresent && typeof config.clientSecret === "string"
      ? config.clientSecret
      : undefined;

  // The token endpoint recorded at startConnect time; re-discover if absent
  // (e.g. the row was edited between start and callback).
  const oauthMeta = (config.oauth ?? {}) as Record<string, unknown>;
  let tokenEndpoint = typeof oauthMeta.tokenEndpoint === "string" ? oauthMeta.tokenEndpoint : "";
  if (!tokenEndpoint) {
    try {
      tokenEndpoint = (await discoverMcpOAuthFlow(String(config.endpoint))).server.token_endpoint;
    } catch (err) {
      return { ok: false, error: oauthErrorMessage(err) };
    }
  }

  let tokens: TokenSet;
  try {
    tokens = await exchangeCodeForTokens({
      tokenEndpoint,
      code: input.code,
      codeVerifier: statePayload.verifier,
      clientId: statePayload.clientId,
      clientSecret,
      redirectUri: statePayload.redirectUri,
      resource: statePayload.resource,
    });
  } catch (err) {
    return { ok: false, error: oauthErrorMessage(err) };
  }

  // Vault round-trip: real value into process.env under the mapped key,
  // masked-preview metadata row in workspace_secrets. Tokens are stored as
  // JSON (access + refresh + expiry) so refresh can use the SAME key.
  // Multi-tenant guard (same rule as upsertSecret, 2026-09-24): only the
  // operator's workspace may touch shared process.env. A non-operator
  // workspace's connect is refused honestly rather than silently storing a
  // token the request path could never resolve (or leaking it cross-tenant).
  if (!isOperatorWorkspace(row.workspaceId)) {
    return {
      ok: false,
      error:
        "OAuth connect for non-operator workspaces is not wired yet: per-workspace token storage is a recorded follow-up. The provider round-trip was NOT completed into the vault.",
    };
  }
  const tokenBundle = JSON.stringify({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token ?? null,
    expires_at: tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : null,
    scope: tokens.scope ?? null,
  });
  applySecretToEnv(`mcp_${row.name}`, tokenBundle);

  const [existingSecret] = await db
    .select()
    .from(workspaceSecrets)
    .where(
      and(
        eq(workspaceSecrets.workspaceId, row.workspaceId),
        eq(workspaceSecrets.provider, `mcp_${row.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`)
      )
    )
    .limit(1);
  const maskedPreview = generateMaskedPreview(tokens.access_token);
  if (existingSecret) {
    await db
      .update(workspaceSecrets)
      .set({ maskedPreview, status: "connected", updatedAt: new Date() })
      .where(eq(workspaceSecrets.id, existingSecret.id));
  } else {
    await db.insert(workspaceSecrets).values({
      workspaceId: row.workspaceId,
      provider: `mcp_${row.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
      gsmSecretId: `workspace_${row.workspaceId.substring(0, 8)}_mcp_${row.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")}`,
      version: "1",
      maskedPreview,
      status: "connected",
    });
  }

  await db
    .update(workspaceIntegrations)
    .set({ status: "active", updatedAt: new Date() })
    .where(eq(workspaceIntegrations.id, row.id));

  return { ok: true, connected: true, maskedPreview };
}

export async function disconnectMcp(input: {
  integrationId: string;
  workspaceId: string;
}): Promise<{ ok: boolean; error?: string }> {
  const [row] = await db
    .select()
    .from(workspaceIntegrations)
    .where(
      and(
        eq(workspaceIntegrations.id, input.integrationId),
        eq(workspaceIntegrations.workspaceId, input.workspaceId),
        eq(workspaceIntegrations.type, "mcp")
      )
    )
    .limit(1);
  if (!row) return { ok: false, error: "MCP integration not found in this workspace" };

  const config = (row.config ?? {}) as Record<string, unknown>;
  const oauth = (config.oauth ?? {}) as Record<string, unknown>;
  const clientId = typeof config.clientId === "string" ? config.clientId : "";
  const clientSecret = typeof config.clientSecret === "string" ? config.clientSecret : "";

  // Best-effort revocation with the stored bundle's access token (may already
  // be expired — revocation of a dead token is still a success for our goal).
  const envKey = `MCP_${row.name.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}_TOKEN`;
  const bundleRaw = process.env[envKey];
  if (
    bundleRaw &&
    typeof oauth.revocationEndpoint === "string" &&
    clientId
  ) {
    try {
      const bundle = JSON.parse(bundleRaw) as { access_token?: string };
      if (bundle.access_token) {
        await revokeToken({
          revocationEndpoint: oauth.revocationEndpoint,
          token: bundle.access_token,
          clientId,
          clientSecret: clientSecret || undefined,
        });
      }
    } catch {
      // revocation is best-effort; local cleanup continues regardless
    }
  }

  // Clear the process env token and the vault metadata row.
  delete process.env[envKey];
  await db
    .delete(workspaceSecrets)
    .where(
      and(
        eq(workspaceSecrets.workspaceId, row.workspaceId),
        eq(workspaceSecrets.provider, `mcp_${row.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`)
      )
    );

  await db
    .update(workspaceIntegrations)
    .set({
      status: "inactive",
      config: { ...config, oauth: { ...oauth, stateCreatedAt: null } },
      updatedAt: new Date(),
    })
    .where(eq(workspaceIntegrations.id, row.id));

  return { ok: true };
}

/** Refresh helper for the request path when the stored bundle is expiring. */
export async function refreshMcpToken(
  integrationName: string,
  workspaceId: string
): Promise<{ ok: boolean; accessToken?: string; error?: string }> {
  const [row] = await db
    .select()
    .from(workspaceIntegrations)
    .where(
      and(
        eq(workspaceIntegrations.workspaceId, workspaceId),
        eq(workspaceIntegrations.name, integrationName),
        eq(workspaceIntegrations.type, "mcp")
      )
    )
    .limit(1);
  if (!row) return { ok: false, error: "MCP integration not found" };
  const config = (row.config ?? {}) as Record<string, unknown>;
  const oauth = (config.oauth ?? {}) as Record<string, unknown>;
  const tokenEndpoint = typeof oauth.tokenEndpoint === "string" ? oauth.tokenEndpoint : "";
  const clientId = typeof config.clientId === "string" ? config.clientId : "";
  const clientSecret = typeof config.clientSecret === "string" ? config.clientSecret : "";
  const envKey = `MCP_${integrationName.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}_TOKEN`;
  const bundleRaw = process.env[envKey];
  if (!tokenEndpoint || !clientId || !bundleRaw) {
    return { ok: false, error: "No stored OAuth session to refresh for this MCP integration" };
  }
  let bundle: { refresh_token?: string | null };
  try {
    bundle = JSON.parse(bundleRaw);
  } catch {
    return { ok: false, error: "Stored MCP token bundle is unreadable" };
  }
  if (!bundle.refresh_token) {
    return { ok: false, error: "No refresh token was stored for this MCP integration" };
  }
  try {
    const tokens = await refreshAccessToken({
      tokenEndpoint,
      refreshToken: bundle.refresh_token,
      clientId,
      clientSecret: clientSecret || undefined,
    });
    const tokenBundle = JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? bundle.refresh_token,
      expires_at: tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : null,
      scope: tokens.scope ?? null,
    });
    applySecretToEnv(`mcp_${integrationName}`, tokenBundle);
    return { ok: true, accessToken: tokens.access_token };
  } catch (err) {
    return { ok: false, error: oauthErrorMessage(err) };
  }
}
