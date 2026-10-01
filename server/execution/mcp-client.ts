/**
 * MCP runtime client (CC-2026-10-01-005/006): JSON-RPC 2.0 over the MCP
 * streamable-HTTP transport, with SSE-framed response bodies supported and
 * Bearer auth from the OAuth module's token sets.
 *
 * Scope boundary (honest): this slice covers HTTP-borne MCP servers — the
 * Upwork MCP (streamable HTTP + Bearer) is the first tenant. The stdio servers
 * in the Settings catalog spawn local processes and are NOT reachable by this
 * client; wiring stdio spawns is a separate, sandbox-reviewable change.
 *
 * Honesty rules: tokens are sent as headers only and never logged; every
 * failure carries the real HTTP status and a bounded body head; protocol
 * errors surface the server's JSON-RPC error object verbatim.
 */

export const MCP_PROTOCOL_VERSION = "2025-06-18";

export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: number | string;
  method: string;
  params?: Record<string, unknown>;
}

export interface JsonRpcResponse {
  jsonrpc: "2.0";
  id?: number | string;
  result?: Record<string, unknown>;
  error?: { code: number; message: string; data?: unknown };
}

export class McpClientError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly bodyHead?: string,
    readonly rpcError?: { code: number; message: string; data?: unknown }
  ) {
    super(message);
    this.name = "McpClientError";
  }
}

type FetchImpl = (url: string, init?: RequestInit) => Promise<Response>;
const defaultFetch: FetchImpl = (url, init) => fetch(url, init);

function baseHeaders(token: string, sessionId?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    "MCP-Protocol-Version": MCP_PROTOCOL_VERSION,
    Authorization: `Bearer ${token}`,
  };
  if (sessionId) headers["Mcp-Session-Id"] = sessionId;
  return headers;
}

/** Parse a JSON or SSE-framed body into a single JSON-RPC response. */
export function parseRpcBody(bodyText: string, contentType: string): JsonRpcResponse {
  if (contentType.includes("text/event-stream")) {
    // Take the last data: line that parses as a JSON-RPC response.
    let parsed: JsonRpcResponse | undefined;
    for (const line of bodyText.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const candidate = JSON.parse(payload) as JsonRpcResponse;
        if (candidate && (candidate.result !== undefined || candidate.error !== undefined)) {
          parsed = candidate;
        }
      } catch {
        // keep scanning; SSE frames may include comments/pings
      }
    }
    if (!parsed) {
      throw new McpClientError(
        "SSE response body contained no JSON-RPC response",
        undefined,
        bodyText.slice(0, 500)
      );
    }
    return parsed;
  }
  try {
    return JSON.parse(bodyText) as JsonRpcResponse;
  } catch {
    throw new McpClientError(
      "response body was neither JSON nor SSE-framed JSON-RPC",
      undefined,
      bodyText.slice(0, 500)
    );
  }
}

async function postRpc(
  endpoint: string,
  body: JsonRpcRequest,
  token: string,
  sessionId: string | undefined,
  fetchImpl: FetchImpl
): Promise<{ response?: JsonRpcResponse; sessionId?: string }> {
  let res: Response;
  try {
    res = await fetchImpl(endpoint, {
      method: "POST",
      headers: baseHeaders(token, sessionId),
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new McpClientError(`network error reaching ${endpoint}: ${(err as Error).message}`);
  }
  const newSessionId = res.headers.get("mcp-session-id") ?? undefined;
  if (res.status === 202) return { sessionId: newSessionId }; // accepted notification
  const bodyText = await res.text();
  if (!res.ok) {
    throw new McpClientError(
      `MCP endpoint returned HTTP ${res.status}`,
      res.status,
      bodyText.slice(0, 500)
    );
  }
  const response = parseRpcBody(bodyText, res.headers.get("content-type") ?? "");
  if (response.error) {
    throw new McpClientError(
      `MCP server error ${response.error.code}: ${response.error.message}`,
      res.status,
      bodyText.slice(0, 500),
      response.error
    );
  }
  return { response, sessionId: newSessionId ?? sessionId };
}

export interface McpSession {
  endpoint: string;
  token: string;
  sessionId?: string;
  serverInfo?: { name?: string; version?: string };
  protocolVersion?: string;
  capabilities?: Record<string, unknown>;
}

/**
 * Initialize a session: sends `initialize`, consumes the result, then sends
 * the `notifications/initialized` notification. Returns the session handle
 * (including any Mcp-Session-Id the server assigned).
 */
export async function initializeMcpSession(
  endpoint: string,
  token: string,
  fetchImpl: FetchImpl = defaultFetch
): Promise<McpSession> {
  const { response, sessionId } = await postRpc(
    endpoint,
    {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: MCP_PROTOCOL_VERSION,
        capabilities: {},
        clientInfo: { name: "agentlab-os", version: "1.0.0" },
      },
    },
    token,
    undefined,
    fetchImpl
  );
  const result = response?.result ?? {};
  await postRpc(
    endpoint,
    { jsonrpc: "2.0", method: "notifications/initialized" },
    token,
    sessionId,
    fetchImpl
  ).catch(() => undefined); // notification acceptance is best-effort per spec
  return {
    endpoint,
    token,
    sessionId,
    protocolVersion:
      typeof result.protocolVersion === "string" ? result.protocolVersion : undefined,
    serverInfo:
      (result.serverInfo as { name?: string; version?: string } | undefined) ?? undefined,
    capabilities: (result.capabilities as Record<string, unknown> | undefined) ?? undefined,
  };
}

export interface McpToolSummary {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
}

/** List the tools an MCP server exposes. */
export async function listMcpTools(
  session: McpSession,
  fetchImpl: FetchImpl = defaultFetch
): Promise<McpToolSummary[]> {
  const { response } = await postRpc(
    session.endpoint,
    { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} },
    session.token,
    session.sessionId,
    fetchImpl
  );
  const tools = response?.result?.tools;
  if (!Array.isArray(tools)) {
    throw new McpClientError(
      "tools/list result contained no tools array",
      undefined,
      JSON.stringify(response?.result ?? {}).slice(0, 500)
    );
  }
  return tools.map((t) => {
    const tool = t as Record<string, unknown>;
    return {
      name: String(tool.name ?? ""),
      description: typeof tool.description === "string" ? tool.description : undefined,
      inputSchema: (tool.inputSchema as Record<string, unknown> | undefined) ?? undefined,
    };
  });
}

export interface McpToolCallResult {
  /** The raw MCP result object: { content: [...], isError?, ... } */
  result: Record<string, unknown>;
  /** Flattened text content for quick display — joined text blocks. */
  text: string;
  isError: boolean;
}

/** Call a tool on the MCP server. Human gating stays the caller's job. */
export async function callMcpTool(
  session: McpSession,
  toolName: string,
  args: Record<string, unknown>,
  fetchImpl: FetchImpl = defaultFetch
): Promise<McpToolCallResult> {
  const { response } = await postRpc(
    session.endpoint,
    {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: { name: toolName, arguments: args },
    },
    session.token,
    session.sessionId,
    fetchImpl
  );
  const result = response?.result ?? {};
  const content = Array.isArray(result.content) ? result.content : [];
  const text = content
    .map((c) => {
      const block = c as Record<string, unknown>;
      return typeof block.text === "string" ? block.text : "";
    })
    .filter(Boolean)
    .join("\n");
  return { result, text, isError: result.isError === true };
}

/**
 * One-call convenience for the Ops Agent: open a session and list tools.
 * Tokens come from the OAuth module's exchange/refresh flow.
 */
export async function openMcpAndListTools(
  endpoint: string,
  token: string,
  fetchImpl: FetchImpl = defaultFetch
): Promise<{ session: McpSession; tools: McpToolSummary[] }> {
  const session = await initializeMcpSession(endpoint, token, fetchImpl);
  const tools = await listMcpTools(session, fetchImpl);
  return { session, tools };
}
