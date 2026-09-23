import { readFileSync } from "fs";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { getDb } from "../db";
import { getAuditLogs } from "./audit";

/**
 * Honesty regression tests (honesty-audit P1-1 / CC-2026-09-23-007).
 *
 * These pin the rule: the audit surface must never serve fabricated records,
 * invented stats, or random telemetry. If someone reintroduces fake fallback
 * data, these tests fail.
 */

vi.mock("../db", () => ({ getDb: vi.fn() }));

describe("audit honesty guarantees", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("serves an empty log list (not fabricated fallback rows) when the DB has no audit events", async () => {
    // select().from().where().orderBy().limit() chain resolving to []
    const chain: any = {
      where: () => chain,
      orderBy: () => chain,
      limit: async () => [],
    };
    vi.mocked(getDb).mockResolvedValue({
      select: () => ({ from: () => chain }),
    } as any);

    const res = {
      status(code: number) {
        expect(code).toBe(200);
        return {
          json: (body: any) => {
            expect(body.logs).toEqual([]);
            expect(body.totalCount).toBe(0);
          },
        };
      },
    } as any;

    await getAuditLogs(
      { workspaceId: "00000000-0000-0000-0000-000000000001", query: {} } as any,
      res
    );
  });

  it("getAuditLogs response contract carries no fabricated sample records", () => {
    const source = readFileSync("server/controllers/audit.ts", "utf-8");

    // The old fabricated array must never return in any form.
    expect(source).not.toContain("FALLBACK_AUDIT_LOGS");
    expect(source).not.toContain("aud_01_triage");
    expect(source).not.toContain("Auditor-Bot-9");
    expect(source).not.toContain("Coder-Agent-07");
    expect(source).not.toContain("Math.random");

    // The export must read from the database, not a constant list.
    expect(source).toContain("exportAuditLogs");
    expect(source).not.toContain("const logs = [...FALLBACK_AUDIT_LOGS]");
  });

  it("orchestrator never fabricates telemetry with Math.random", () => {
    const source = readFileSync("server/controllers/orchestrator.ts", "utf-8");

    expect(source).not.toContain("Math.random");
    expect(source).toContain("tokensUsed: number | null");
  });

  it("agent-runner mock responses report null telemetry, not invented numbers", () => {
    const source = readFileSync("server/execution/agent-runner.ts", "utf-8");

    const mockBranch = source.slice(
      source.indexOf("GOOGLE_GENERATIVE_AI_API_KEY")
    );
    expect(mockBranch).toContain("tokensPrompt: null");
    expect(mockBranch).toContain("latencyMs: null");
  });

  it("audit stats never return the old invented defaults", () => {
    const source = readFileSync("server/controllers/audit.ts", "utf-8");

    // The invented defaults must not appear in code (comments documenting the
    // old behavior are allowed; executable defaults are not).
    const codeWithoutComments = source
      .split("\n")
      .filter(l => !l.trim().startsWith("//"))
      .join("\n");
    expect(codeWithoutComments).not.toContain("1248");
    expect(codeWithoutComments).not.toContain("99.8%");
    expect(codeWithoutComments).not.toContain("0.4821");
    // SAIF rate must be null-able, not a constant string
    expect(source).toContain("saifComplianceRate: string | null");
  });
});
