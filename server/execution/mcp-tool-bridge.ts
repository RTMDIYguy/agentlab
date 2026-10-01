/**
 * The bridge between the human-gated connector registry and the MCP runtime
 * client (CC-2026-10-01-007). This is the ONLY code path by which an approved
 * action can reach an MCP server — the SAIF gate, connector validation, and
 * human approval all happen upstream in server/actions/router.ts before this
 * module is ever invoked.
 *
 * Honesty rules: the resolved token is passed to the runtime client as a
 * header and never logged; failures carry the integration's name and the
 * real error; a missing token is an explicit instruction to connect first,
 * not a fallback to an operator credential.
 */
import { resolveMcpToken } from "./mcp-tokens";
import {
  initializeMcpSession,
  listMcpTools,
  callMcpTool,
  McpClientError,
} from "./mcp-client";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { workspaceIntegrations } from "../schema";

export interface McpDispatchOutcome {
  ok: boolean;
  externalId?: string;
  error?: string;
  /** The server's flattened text answer, when the tool produced one. */
  text?: string;
  /** The raw MCP result object (content blocks), when the call succeeded. */
  result?: unknown;
}

/**
 * Resolve the https endpoint for an MCP integration by name in a workspace.
 * stdio/local-command rows are rejected: this bridge is HTTP-borne only.
 */
async function resolveMcpEndpoint(
  serverName: string,
  workspaceId: string
): Promise<{ ok: true; endpoint: string } | { ok: false; error: string }> {
  try {
    const [row] = await db
      .select()
      .from(workspaceIntegrations)
      .where(eq(workspaceIntegrations.name, serverName))
      .limit(1);
    if (!row) return { ok: false, error: `No MCP integration named "${serverName}" is registered in Settings` };
    // Multi-tenant guard: the row must belong to the dispatching workspace.
    if (row.workspaceId !== workspaceId) {
      return { ok: false, error: `MCP integration "${serverName}" is not registered in this workspace` };
    }
    const endpoint = (row.config as Record<string, unknown> | undefined)?.endpoint;
    if (typeof endpoint !== "string" || !/^https:\/\//i.test(endpoint)) {
      return {
        ok: false,
        error: `MCP integration "${serverName}" has no https endpoint (stdio/local servers are not reachable by this connector)`,
      };
    }
    return { ok: true, endpoint };
  } catch (err) {
    return { ok: false, error: `MCP endpoint lookup failed: ${(err as Error).message}` };
  }
}

/**
 * Real dispatch: resolve token + endpoint, open an MCP session, list tools to
 * verify the named tool exists (honest failure naming available tools when it
 * does not), then call it.
 */
export async function dispatchMcpToolCall(
  payload: Record<string, unknown>
): Promise<McpDispatchOutcome> {
  const workspaceId = typeof payload.__workspaceId === "string" ? payload.__workspaceId : "";
  const serverName = typeof payload.server === "string" ? payload.server.trim() : "";
  const toolName = typeof payload.tool === "string" ? payload.tool.trim() : "";
  const args =
    payload.arguments && typeof payload.arguments === "object" && !Array.isArray(payload.arguments)
      ? (payload.arguments as Record<string, unknown>)
      : null;

  if (!serverName) return { ok: false, error: 'MCP payload missing "server" (the integration name from Settings)' };
  if (!toolName) return { ok: false, error: 'MCP payload missing "tool" (the exact tool name on that server)' };
  if (!args) return { ok: false, error: 'MCP payload "arguments" must be an object' };

  const endpointRes = await resolveMcpEndpoint(serverName, workspaceId);
  if (!endpointRes.ok) return { ok: false, error: endpointRes.error };

  const tokenRes = await resolveMcpToken(serverName, workspaceId);
  if (!tokenRes.ok) return { ok: false, error: tokenRes.error };

  try {
    const session = await initializeMcpSession(endpointRes.endpoint, tokenRes.token!);
    const tools = await listMcpTools(session);
    if (!tools.some((t) => t.name === toolName)) {
      const available = tools.map((t) => t.name).join(", ") || "(server listed no tools)";
      return {
        ok: false,
        error: `Tool "${toolName}" is not offered by MCP server "${serverName}". Available: ${available}`,
      };
    }
    const call = await callMcpTool(session, toolName, args);
    if (call.isError) {
      return {
        ok: false,
        error: call.text || `MCP tool "${toolName}" returned isError on "${serverName}"`,
      };
    }
    return {
      ok: true,
      externalId: `mcp:${serverName}:${toolName}`,
      text: call.text,
      result: call.result,
    };
  } catch (err) {
    if (err instanceof McpClientError) {
      return {
        ok: false,
        error: `MCP call failed on "${serverName}": ${err.message}${err.status ? ` (HTTP ${err.status})` : ""}`,
      };
    }
    return { ok: false, error: `MCP call failed on "${serverName}": ${(err as Error).message}` };
  }
}

/** Tool names currently offered by an integration — for the drafter prompt. */
export async function listMcpIntegrationTools(
  serverName: string,
  workspaceId: string
): Promise<{ ok: boolean; tools?: string[]; error?: string }> {
  const endpointRes = await resolveMcpEndpoint(serverName, workspaceId);
  if (!endpointRes.ok) return { ok: false, error: endpointRes.error };
  const tokenRes = await resolveMcpToken(serverName, workspaceId);
  if (!tokenRes.ok) return { ok: false, error: tokenRes.error };
  try {
    const session = await initializeMcpSession(endpointRes.endpoint, tokenRes.token!);
    const tools = await listMcpTools(session);
    return { ok: true, tools: tools.map((t) => t.name) };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof McpClientError ? err.message : (err as Error).message,
    };
  }
}
