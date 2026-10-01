import { describe, it, expect, vi, beforeEach } from "vitest";
import { dispatchMcpToolCall } from "./mcp-tool-bridge";
import { initializeMcpSession, listMcpTools, callMcpTool, McpClientError } from "./mcp-client";
import { resolveMcpToken } from "./mcp-tokens";

vi.mock("./mcp-tokens", () => ({
  resolveMcpToken: vi.fn(),
}));

vi.mock("./mcp-client", () => ({
  initializeMcpSession: vi.fn(),
  listMcpTools: vi.fn(),
  callMcpTool: vi.fn(),
  McpClientError: class extends Error {
    constructor(
      message: string,
      readonly status?: number,
      readonly bodyHead?: string,
      readonly rpcError?: unknown
    ) {
      super(message);
      this.name = "McpClientError";
    }
  },
}));

const dbState = { row: null as Record<string, unknown> | null };

vi.mock("../db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => (dbState.row ? [dbState.row] : []),
        }),
      }),
    }),
  },
}));

vi.mock("../schema", () => ({
  workspaceIntegrations: {},
}));

const mockedToken = vi.mocked(resolveMcpToken);
const mockedInit = vi.mocked(initializeMcpSession);
const mockedTools = vi.mocked(listMcpTools);
const mockedCall = vi.mocked(callMcpTool);

beforeEach(() => {
  vi.clearAllMocks();
  dbState.row = {
    id: "row-1",
    workspaceId: "ws-1",
    name: "Upwork MCP",
    type: "mcp",
    config: { endpoint: "https://mcp.example/mcp", transport: "sse" },
  };
  mockedToken.mockResolvedValue({ ok: true, token: "tok-123", source: "workspace-vault" });
  mockedInit.mockResolvedValue({ endpoint: "https://mcp.example/mcp", token: "tok-123" });
  mockedTools.mockResolvedValue([
    { name: "search_jobs", description: "Find jobs" },
    { name: "submit_proposal", description: "Send a proposal" },
  ]);
  mockedCall.mockResolvedValue({
    result: { content: [{ type: "text", text: "3 jobs found" }] },
    text: "3 jobs found",
    isError: false,
  });
});

describe("mcp_tool_call dispatch bridge (CC-2026-10-01-007)", () => {
  it("resolves endpoint + token, verifies the tool exists, and calls it", async () => {
    const outcome = await dispatchMcpToolCall({
      __workspaceId: "ws-1",
      server: "Upwork MCP",
      tool: "search_jobs",
      arguments: { query: "react developer" },
    });
    expect(mockedToken).toHaveBeenCalledWith("Upwork MCP", "ws-1");
    expect(mockedInit).toHaveBeenCalledWith("https://mcp.example/mcp", "tok-123");
    expect(mockedTools).toHaveBeenCalledOnce();
    expect(mockedCall).toHaveBeenCalledWith(
      expect.objectContaining({ endpoint: "https://mcp.example/mcp" }),
      "search_jobs",
      { query: "react developer" }
    );
    expect(outcome).toMatchObject({
      ok: true,
      externalId: "mcp:Upwork MCP:search_jobs",
      text: "3 jobs found",
    });
  });

  it("honestly names the available tools when the requested tool does not exist", async () => {
    const outcome = await dispatchMcpToolCall({
      __workspaceId: "ws-1",
      server: "Upwork MCP",
      tool: "delete_everything",
      arguments: {},
    });
    expect(outcome.ok).toBe(false);
    expect(outcome.error).toContain("delete_everything");
    expect(outcome.error).toContain("search_jobs, submit_proposal");
    expect(mockedCall).not.toHaveBeenCalled();
  });

  it("rejects non-https (stdio) endpoints with an explicit message", () => {
    dbState.row = {
      id: "row-2",
      workspaceId: "ws-1",
      name: "Filesystem MCP",
      type: "mcp",
      config: { endpoint: "npx -y @modelcontextprotocol/server-filesystem", transport: "stdio" },
    };
    return dispatchMcpToolCall({
      __workspaceId: "ws-1",
      server: "Filesystem MCP",
      tool: "list_files",
      arguments: {},
    }).then((outcome) => {
      expect(outcome.ok).toBe(false);
      expect(outcome.error).toContain("https");
      expect(mockedInit).not.toHaveBeenCalled();
    });
  });

  it("refuses cross-workspace server access", async () => {
    dbState.row = {
      id: "row-1",
      workspaceId: "ws-OTHER",
      name: "Upwork MCP",
      type: "mcp",
      config: { endpoint: "https://mcp.example/mcp" },
    };
    const outcome = await dispatchMcpToolCall({
      __workspaceId: "ws-1",
      server: "Upwork MCP",
      tool: "search_jobs",
      arguments: {},
    });
    expect(outcome.ok).toBe(false);
    expect(outcome.error).toContain("not registered in this workspace");
  });

  it("fails with the connect-first instruction when no token resolves", async () => {
    mockedToken.mockResolvedValue({
      ok: false,
      error: 'No bearer token for MCP integration "Upwork MCP" — complete the OAuth connect in Settings (or paste a token on the integration) before dispatching.',
    });
    const outcome = await dispatchMcpToolCall({
      __workspaceId: "ws-1",
      server: "Upwork MCP",
      tool: "search_jobs",
      arguments: {},
    });
    expect(outcome.ok).toBe(false);
    expect(outcome.error).toContain("OAuth connect in Settings");
    expect(mockedInit).not.toHaveBeenCalled();
  });

  it("propagates HTTP 401 from the MCP server as an honest failure", async () => {
    mockedInit.mockRejectedValue(
      new McpClientError("MCP endpoint returned HTTP 401", 401, "invalid_token")
    );
    const outcome = await dispatchMcpToolCall({
      __workspaceId: "ws-1",
      server: "Upwork MCP",
      tool: "search_jobs",
      arguments: {},
    });
    expect(outcome.ok).toBe(false);
    expect(outcome.error).toContain("HTTP 401");
  });

  it("surfaces isError tool results as failures with the server's text", async () => {
    mockedCall.mockResolvedValue({
      result: { content: [{ type: "text", text: "rate limited" }], isError: true },
      text: "rate limited",
      isError: true,
    });
    const outcome = await dispatchMcpToolCall({
      __workspaceId: "ws-1",
      server: "Upwork MCP",
      tool: "search_jobs",
      arguments: {},
    });
    expect(outcome.ok).toBe(false);
    expect(outcome.error).toBe("rate limited");
  });

  it("validates the payload shape before doing anything", async () => {
    const noServer = await dispatchMcpToolCall({ __workspaceId: "ws-1", tool: "t", arguments: {} });
    const noTool = await dispatchMcpToolCall({ __workspaceId: "ws-1", server: "S", arguments: {} });
    const badArgs = await dispatchMcpToolCall({
      __workspaceId: "ws-1",
      server: "S",
      tool: "t",
      arguments: "not-an-object",
    });
    expect(noServer.ok).toBe(false);
    expect(noTool.ok).toBe(false);
    expect(badArgs.ok).toBe(false);
    expect(mockedInit).not.toHaveBeenCalled();
  });
});
