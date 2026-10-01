import { describe, it, expect, afterAll } from "vitest";
import { createHash } from "node:crypto";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import {
  OAuthFlowError,
  buildAuthorizationUrl,
  createPkcePair,
  discoverMcpOAuthFlow,
  discoverProtectedResource,
  discoverAuthorizationServer,
  exchangeCodeForTokens,
  isTokenExpiring,
  refreshAccessToken,
} from "./mcp-oauth";

const runningServers: Server[] = [];

async function startServer(
  handler: (req: import("node:http").IncomingMessage, res: import("node:http").ServerResponse) => void
): Promise<string> {
  const server = createServer(handler);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  runningServers.push(server);
  const { port } = server.address() as AddressInfo;
  return `http://127.0.0.1:${port}`;
}

afterAll(async () => {
  await Promise.all(
    runningServers.map(
      (s) => new Promise<void>((resolve) => s.close(() => resolve()))
    )
  );
});

function json(res: import("node:http").ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function readBody(req: import("node:http").IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => resolve(data));
  });
}

describe("MCP OAuth module (hermetic)", () => {
  it("discovers protected-resource then authorization-server metadata end to end", async () => {
    const asBase = await startServer((req, res) => {
      if (req.url === "/.well-known/oauth-authorization-server") {
        json(res, 200, {
          issuer: "https://as.example",
          authorization_endpoint: "https://as.example/authorize",
          token_endpoint: "https://as.example/token",
          grant_types_supported: ["authorization_code", "refresh_token"],
          code_challenge_methods_supported: ["S256"],
        });
        return;
      }
      json(res, 404, { error: "not found" });
    });
    const resourceBase = await startServer((req, res) => {
      if (req.url === "/.well-known/oauth-protected-resource/mcp") {
        json(res, 200, {
          resource: `${resourceBase}/mcp`,
          authorization_servers: [asBase],
          bearer_methods_supported: ["header"],
        });
        return;
      }
      json(res, 404, { error: "not found" });
    });

    const { resource, server } = await discoverMcpOAuthFlow(`${resourceBase}/mcp`);
    expect(resource.resource).toBe(`${resourceBase}/mcp`);
    expect(server.token_endpoint).toBe("https://as.example/token");
  });

  it("falls back to the resource origin as authorization server when no list is present", async () => {
    const base = await startServer((req, res) => {
      if (req.url === "/.well-known/oauth-protected-resource") {
        json(res, 200, { resource: `${base}/mcp` });
        return;
      }
      if (req.url === "/.well-known/oauth-authorization-server") {
        json(res, 200, {
          issuer: base,
          authorization_endpoint: `${base}/authorize`,
          token_endpoint: `${base}/token`,
        });
        return;
      }
      json(res, 404, {});
    });
    const resource = await discoverProtectedResource(`${base}/mcp`);
    const server = await discoverAuthorizationServer(resource);
    expect(server.authorization_endpoint).toBe(`${base}/authorize`);
  });

  it("builds an authorize URL carrying PKCE S256, state, and resource", () => {
    const url = buildAuthorizationUrl({
      metadata: {
        issuer: "https://as.example",
        authorization_endpoint: "https://as.example/authorize",
        token_endpoint: "https://as.example/token",
      },
      clientId: "client-123",
      redirectUri: "https://os.example/oauth/callback",
      codeChallenge: "challenge-abc",
      state: "state-xyz",
      resource: "https://mcp.example/mcp",
      scopes: ["jobs:read"],
    });
    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe("https://as.example/authorize");
    expect(parsed.searchParams.get("response_type")).toBe("code");
    expect(parsed.searchParams.get("client_id")).toBe("client-123");
    expect(parsed.searchParams.get("code_challenge_method")).toBe("S256");
    expect(parsed.searchParams.get("code_challenge")).toBe("challenge-abc");
    expect(parsed.searchParams.get("state")).toBe("state-xyz");
    expect(parsed.searchParams.get("resource")).toBe("https://mcp.example/mcp");
    expect(parsed.searchParams.get("scope")).toBe("jobs:read");
  });

  it("PKCE pair: challenge is the S256 of the verifier", () => {
    const { verifier, challenge } = createPkcePair();
    expect(verifier.length).toBeGreaterThanOrEqual(43);
    expect(challenge).not.toBe(verifier);
    // Round-trip verification: recompute S256(verifier) and compare.
    expect(createHash("sha256").update(verifier).digest("base64url")).toBe(challenge);
  });

  it("exchanges a code for tokens via client_secret_post with PKCE verifier", async () => {
    let seenBody = "";
    const base = await startServer(async (req, res) => {
      if (req.url === "/token" && req.method === "POST") {
        seenBody = await readBody(req);
        json(res, 200, {
          access_token: "at-123",
          token_type: "Bearer",
          expires_in: 3600,
          refresh_token: "rt-456",
          scope: "jobs:read",
        });
        return;
      }
      json(res, 404, {});
    });
    const tokens = await exchangeCodeForTokens({
      tokenEndpoint: `${base}/token`,
      code: "the-code",
      codeVerifier: "the-verifier",
      clientId: "client-123",
      clientSecret: "shh",
      redirectUri: "https://os.example/oauth/callback",
    });
    const params = new URLSearchParams(seenBody);
    expect(params.get("grant_type")).toBe("authorization_code");
    expect(params.get("code")).toBe("the-code");
    expect(params.get("code_verifier")).toBe("the-verifier");
    expect(params.get("client_id")).toBe("client-123");
    expect(params.get("client_secret")).toBe("shh");
    expect(params.get("redirect_uri")).toBe("https://os.example/oauth/callback");
    expect(tokens.access_token).toBe("at-123");
    expect(tokens.refresh_token).toBe("rt-456");
    expect(tokens.expires_in).toBe(3600);
  });

  it("surfaces token endpoint OAuth errors honestly (status + error code)", async () => {
    const base = await startServer((req, res) => {
      json(res, 400, { error: "invalid_grant", error_description: "code expired" });
    });
    await expect(
      exchangeCodeForTokens({
        tokenEndpoint: `${base}/token`,
        code: "bad",
        codeVerifier: "bad",
        clientId: "c",
        redirectUri: "https://os.example/cb",
      })
    ).rejects.toMatchObject({
      name: "OAuthFlowError",
      status: 400,
      oauthError: "invalid_grant",
    });
  });

  it("refreshes tokens with the refresh_token grant", async () => {
    let seenBody = "";
    const base = await startServer(async (req, res) => {
      if (req.url === "/token" && req.method === "POST") {
        seenBody = await readBody(req);
        json(res, 200, { access_token: "at-new", expires_in: 7200 });
        return;
      }
      json(res, 404, {});
    });
    const tokens = await refreshAccessToken({
      tokenEndpoint: `${base}/token`,
      refreshToken: "rt-456",
      clientId: "client-123",
    });
    const params = new URLSearchParams(seenBody);
    expect(params.get("grant_type")).toBe("refresh_token");
    expect(params.get("refresh_token")).toBe("rt-456");
    expect(tokens.access_token).toBe("at-new");
  });

  it("flags tokens inside the expiry margin and ignores tokens without expires_in", () => {
    const now = Date.now();
    const expiring: Parameters<typeof isTokenExpiring>[0] = {
      access_token: "a",
      expires_in: 600,
      obtainedAt: now - 500_000, // 500s elapsed of 600s lifetime -> inside 120s margin
    };
    expect(isTokenExpiring(expiring)).toBe(true);
    const fresh: Parameters<typeof isTokenExpiring>[0] = {
      access_token: "a",
      expires_in: 3600,
      obtainedAt: now,
    };
    expect(isTokenExpiring(fresh)).toBe(false);
    const noExpiry: Parameters<typeof isTokenExpiring>[0] = {
      access_token: "a",
      obtainedAt: now - 10_000_000,
    };
    expect(isTokenExpiring(noExpiry)).toBe(false);
  });

  it("treats metadata 404s and non-JSON bodies as honest failures", async () => {
    const base = await startServer((req, res) => {
      if (req.url?.includes("oauth-protected-resource")) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "not found" }));
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end("<html>not json</html>");
    });
    await expect(discoverProtectedResource(`${base}/mcp`)).rejects.toBeInstanceOf(
      OAuthFlowError
    );
  });
});
