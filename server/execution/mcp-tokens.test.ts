import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const dbBehavior = { row: null as Record<string, unknown> | null, throws: false };

vi.mock("../db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => {
            if (dbBehavior.throws) throw new Error("db down");
            return dbBehavior.row ? [dbBehavior.row] : [];
          },
        }),
      }),
    }),
  },
}));

vi.mock("../schema", () => ({ workspaceIntegrations: {} }));

vi.mock("../_core/env", () => ({
  generateMaskedPreview: (v: string) =>
    v.length <= 8 ? "••••" : `${v.slice(0, 4)}••••${v.slice(-4)}`,
}));

import { resolveMcpToken, maskMcpToken, mcpTokenEnvKey } from "./mcp-tokens";

describe("MCP token resolution (vault round-trip, CC-2026-10-01-007)", () => {
  beforeEach(() => {
    dbBehavior.row = null;
    dbBehavior.throws = false;
    delete process.env.MCP_UPWORK_MCP_TOKEN;
  });
  afterEach(() => {
    delete process.env.MCP_UPWORK_MCP_TOKEN;
  });

  it("prefers the integration row's own catalog credential first", async () => {
    dbBehavior.row = { id: "r", workspaceId: "ws-1", name: "Upwork MCP", config: { apiKey: "catalog-key" } };
    process.env.MCP_UPWORK_MCP_TOKEN = "env-token";
    const res = await resolveMcpToken("Upwork MCP", "ws-1");
    expect(res).toEqual({ ok: true, token: "catalog-key", source: "workspace-catalog" });
  });

  it("falls back to the mapped env key when the catalog has no key", async () => {
    dbBehavior.row = { id: "r", workspaceId: "ws-1", name: "Upwork MCP", config: { apiKey: "" } };
    process.env.MCP_UPWORK_MCP_TOKEN = "env-token";
    const res = await resolveMcpToken("Upwork MCP", "ws-1");
    expect(res).toEqual({ ok: true, token: "env-token", source: "workspace-vault" });
  });

  it("still resolves when the DB is unavailable (env-only path)", async () => {
    dbBehavior.throws = true;
    process.env.MCP_UPWORK_MCP_TOKEN = "env-token";
    const res = await resolveMcpToken("Upwork MCP", "ws-1");
    expect(res).toEqual({ ok: true, token: "env-token", source: "workspace-vault" });
  });

  it("fails with the connect-first instruction when nothing resolves", async () => {
    dbBehavior.row = { id: "r", workspaceId: "ws-1", name: "Upwork MCP", config: {} };
    const res = await resolveMcpToken("Upwork MCP", "ws-1");
    expect(res.ok).toBe(false);
    expect(res.error).toContain("OAuth connect in Settings");
  });

  it("maps integration names to env keys safely", () => {
    expect(mcpTokenEnvKey("Upwork MCP")).toBe("MCP_UPWORK_MCP_TOKEN");
    expect(mcpTokenEnvKey("hostinger-mcp")).toBe("MCP_HOSTINGER_MCP_TOKEN");
  });

  it("masks previews without exposing the token", () => {
    const masked = maskMcpToken("abcd1234wxyz");
    expect(masked).toContain("abcd");
    expect(masked).toContain("wxyz");
    expect(masked).not.toBe("abcd1234wxyz");
    expect(masked).toContain("•");
  });
});
