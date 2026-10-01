import { describe, it, expect, afterAll } from "vitest";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import {
  McpClientError,
  callMcpTool,
  initializeMcpSession,
  listMcpTools,
  openMcpAndListTools,
  parseRpcBody,
} from "./mcp-client";

const runningServers: Server[] = [];

async function startServer(
  handler: (req: IncomingMessage, res: ServerResponse) => void
): Promise<string> {
  const server = createServer(handler);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  runningServers.push(server);
  const { port } = server.address() as AddressInfo;
  return `http://127.0.0.1:${port}`;
}

afterAll(async () => {
  await Promise.all(runningServers.map((s) => new Promise<void>((r) => s.close(() => r()))));
});

function json(res: ServerResponse, status: number, body: unknown, headers: Record<string, string> = {}) {
  res.writeHead(status, { "Content-Type": "application/json", ...headers });
  res.end(JSON.stringify(body));
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => resolve(data));
  });
}

describe("MCP runtime client (hermetic)", () => {
  it("initializes a session with Bearer + protocol headers, honors Mcp-Session-Id, and sends the initialized notification", async () => {
    const seen: { url: string; auth?: string; proto?: string; accept?: string; session?: string; body: string }[] = [];
    const base = await startServer(async (req, res) => {
      const body = await readBody(req);
      seen.push({
        url: req.url ?? "",
        auth: req.headers.authorization,
        proto: req.headers["mcp-protocol-version"] as string | undefined,
        accept: req.headers.accept as string | undefined,
        session: req.headers["mcp-session-id"] as string | undefined,
        body,
      });
      if (req.url === "/mcp" && body.includes("\"initialize\"")) {
        json(
          res,
          200,
          {
            jsonrpc: "2.0",
            id: 1,
            result: {
              protocolVersion: "2025-06-18",
              serverInfo: { name: "stub-mcp", version: "0.2.0" },
              capabilities: { tools: {} },
            },
          },
          { "Mcp-Session-Id": "sess-42" }
        );
        return;
      }
      if (req.url === "/mcp" && body.includes("notifications/initialized")) {
        res.writeHead(202);
        res.end();
        return;
      }
      json(res, 404, { error: "nope" });
    });

    const session = await initializeMcpSession(`${base}/mcp`, "tok-abc");
    expect(session.sessionId).toBe("sess-42");
    expect(session.serverInfo?.name).toBe("stub-mcp");
    expect(session.protocolVersion).toBe("2025-06-18");

    const init = seen[0];
    expect(init.auth).toBe("Bearer tok-abc");
    expect(init.proto).toBe("2025-06-18");
    expect(init.accept).toContain("text/event-stream");
    const notif = seen[1];
    expect(notif.session).toBe("sess-42");
    expect(notif.body).toContain("notifications/initialized");
  });

  it("lists tools and parses SSE-framed JSON-RPC responses", async () => {
    const base = await startServer(async (req, res) => {
      const body = await readBody(req);
      if (body.includes("\"initialize\"")) {
        json(res, 200, { jsonrpc: "2.0", id: 1, result: { protocolVersion: "2025-06-18", serverInfo: { name: "s" } } });
        return;
      }
      if (body.includes("notifications/initialized")) {
        res.writeHead(202);
        res.end();
        return;
      }
      if (body.includes("tools/list")) {
        res.writeHead(200, { "Content-Type": "text/event-stream" });
        res.end(
          [
            ": ping",
            `event: message`,
            `data: {"jsonrpc":"2.0","id":2,"result":{"tools":[{"name":"search_jobs","description":"Find jobs","inputSchema":{"type":"object"}}]}}`,
            "",
            `data: [DONE]`,
            "",
          ].join("\n")
        );
        return;
      }
      json(res, 404, { error: "nope" });
    });
    const { tools } = await openMcpAndListTools(`${base}/mcp`, "tok-1");
    expect(tools).toHaveLength(1);
    expect(tools[0].name).toBe("search_jobs");
    expect(tools[0].description).toBe("Find jobs");
    expect(tools[0].inputSchema).toEqual({ type: "object" });
  });

  it("calls a tool and flattens text content, honoring isError", async () => {
    const base = await startServer(async (req, res) => {
      const body = await readBody(req);
      if (body.includes("\"initialize\"")) {
        json(res, 200, { jsonrpc: "2.0", id: 1, result: {} });
        return;
      }
      if (body.includes("notifications/initialized")) {
        res.writeHead(202);
        res.end();
        return;
      }
      if (body.includes("tools/call")) {
        const parsed = JSON.parse(body);
        expect(parsed.params).toEqual({
          name: "submit_proposal",
          arguments: { job_id: "u-9", text: "hello" },
        });
        json(res, 200, {
          jsonrpc: "2.0",
          id: 3,
          result: {
            content: [
              { type: "text", text: "proposal drafted" },
              { type: "text", text: "id=u-9" },
            ],
            isError: false,
          },
        });
        return;
      }
      json(res, 404, { error: "nope" });
    });
    const session = await initializeMcpSession(`${base}/mcp`, "t");
    const result = await callMcpTool(session, "submit_proposal", {
      job_id: "u-9",
      text: "hello",
    });
    expect(result.text).toBe("proposal drafted\nid=u-9");
    expect(result.isError).toBe(false);
  });

  it("surfaces HTTP failures with status and body head", async () => {
    const base = await startServer((req, res) => {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "invalid_token" }));
    });
    await expect(initializeMcpSession(`${base}/mcp`, "bad-token")).rejects.toMatchObject({
      name: "McpClientError",
      status: 401,
      bodyHead: expect.stringContaining("invalid_token"),
    });
  });

  it("surfaces JSON-RPC protocol errors verbatim", async () => {
    const base = await startServer(async (req, res) => {
      const body = await readBody(req);
      if (body.includes("\"initialize\"")) {
        json(res, 200, { jsonrpc: "2.0", id: 1, result: {} });
        return;
      }
      if (body.includes("notifications/initialized")) {
        res.writeHead(202);
        res.end();
        return;
      }
      if (body.includes("tools/list")) {
        json(res, 200, {
          jsonrpc: "2.0",
          id: 2,
          error: { code: -32601, message: "Method not found" },
        });
        return;
      }
      json(res, 404, {});
    });
    const session = await initializeMcpSession(`${base}/mcp`, "t");
    await expect(listMcpTools(session)).rejects.toMatchObject({
      name: "McpClientError",
      rpcError: { code: -32601, message: "Method not found" },
    });
  });

  it("parseRpcBody: picks the last valid JSON-RPC data frame and rejects non-JSON bodies", () => {
    const sse = [
      "data: {\"jsonrpc\":\"2.0\",\"id\":9,\"result\":{\"seq\":1}}",
      "data: [DONE]",
      "data: {\"jsonrpc\":\"2.0\",\"id\":9,\"result\":{\"seq\":2}}",
    ].join("\n");
    expect(parseRpcBody(sse, "text/event-stream").result).toEqual({ seq: 2 });
    expect(parseRpcBody("{\"jsonrpc\":\"2.0\",\"id\":1,\"result\":{}}", "application/json").id).toBe(1);
    expect(() => parseRpcBody("<html>nope</html>", "text/html")).toThrow(McpClientError);
  });
});
