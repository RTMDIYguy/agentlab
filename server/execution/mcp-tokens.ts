/**
 * Vault round-trip for MCP bearer tokens (CC-2026-10-01-007).
 *
 * OAuth connect stores access/refresh tokens through the standard vault
 * pattern: metadata rows in workspace_secrets (provider + masked preview +
 * status) with the REAL value in process.env under the mapped key. This
 * module is the request-path half: given an MCP server's integration name,
 * resolve its access token the same way connectors resolve HUBSPOT_PAT.
 *
 * Honesty rules: the raw token is NEVER logged or returned to the client;
 * failures name the missing step (connect never completed vs. vault row
 * missing) instead of inventing a token; the per-workspace catalog (config
 * JSON apiKey) is checked BEFORE operator env keys so a tenant server can
 * never silently ride the operator's credential for a different integration.
 */
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { workspaceIntegrations } from "../schema";
import { generateMaskedPreview } from "../_core/env";

export interface McpTokenResolution {
  ok: boolean;
  token?: string;
  source?: "workspace-catalog" | "workspace-vault" | "operator-env";
  error?: string;
}

const mcpEnvKey = (integrationName: string): string =>
  `MCP_${integrationName.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}_TOKEN`;

/**
 * Resolve the bearer token for an MCP integration by name, within a
 * workspace. Order: (1) the integration row's own catalog apiKey (per-
 * workspace, set at registration or connect), (2) the workspace vault row
 * provider `mcp_<name>` -> mapped env key, (3) the operator env alias
 * MCP_<NAME>_TOKEN (operator workspaces only by construction of env keys).
 */
export async function resolveMcpToken(
  integrationName: string,
  workspaceId: string
): Promise<McpTokenResolution> {
  const cleanName = integrationName.trim();
  if (!cleanName) return { ok: false, error: "integration name is required" };

  // 1. The integration row's own catalog credential (per-workspace).
  try {
    const [row] = await db
      .select()
      .from(workspaceIntegrations)
      .where(
        and(
          eq(workspaceIntegrations.workspaceId, workspaceId),
          eq(workspaceIntegrations.name, cleanName),
          eq(workspaceIntegrations.type, "mcp")
        )
      )
      .limit(1);
    const catalogKey = (row?.config as Record<string, unknown> | undefined)?.apiKey;
    if (typeof catalogKey === "string" && catalogKey.trim().length > 0) {
      return { ok: true, token: catalogKey, source: "workspace-catalog" };
    }
  } catch {
    // DB unavailable: fall through to env-only resolution rather than fail
    // closed here — the caller's own DB use will fail honestly if needed.
  }

  // 2. Workspace vault row (OAuth connect writes provider mcp_<name> and
  // applies the token under the mapped env key MCP_<NAME>_TOKEN).
  const envKey = mcpEnvKey(cleanName);
  const vaultToken = process.env[envKey];
  if (vaultToken && vaultToken.trim().length > 0) {
    return { ok: true, token: vaultToken, source: "workspace-vault" };
  }

  // 3. Operator-style env alias — same key shape, checked last for clarity.
  const aliasToken = process.env[mcpEnvKey(cleanName)];
  if (aliasToken && aliasToken.trim().length > 0) {
    return { ok: true, token: aliasToken, source: "operator-env" };
  }

  return {
    ok: false,
    error: `No bearer token for MCP integration "${cleanName}" — complete the OAuth connect in Settings (or paste a token on the integration) before dispatching.`,
  };
}

/** Masked preview helper for connect flows (never the token itself). */
export function maskMcpToken(token: string): string {
  return generateMaskedPreview(token);
}

/** The env key a given integration's vault token lives under (for connect). */
export function mcpTokenEnvKey(integrationName: string): string {
  return mcpEnvKey(integrationName);
}
