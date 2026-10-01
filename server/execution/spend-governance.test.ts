import { describe, it, expect, vi, beforeEach } from "vitest";

const dbState = {
  workspaceRow: null as Record<string, unknown> | null,
  monthTokens: 0 as number,
  throws: false,
};

vi.mock("../schema", () => {
  // Distinct object identities let the db mock tell which table is queried.
  return {
    workspaces: { __table: "workspaces" },
    auditLogs: { __table: "audit_logs", workspaceId: "workspace_id", tokensTotal: "tokens_total", createdAt: "created_at" },
  };
});

vi.mock("../db", () => ({
  getDb: async () => {
    if (dbState.throws) return null;
    // Chainable thenable: await resolves the rows; .limit(...) does too.
    const makeBuilder = (getRows: () => unknown[]) => {
      const p: any = Promise.resolve().then(() => getRows());
      p.limit = async () => getRows();
      p.where = () => makeBuilder(getRows);
      p.from = () => makeBuilder(getRows);
      p.select = () => makeBuilder(getRows);
      return p;
    };
    return {
      select: () => ({
        from: (table: any) =>
          makeBuilder(() =>
            table?.__table === "workspaces"
              ? dbState.workspaceRow
                ? [dbState.workspaceRow]
                : []
              : [{ tokens: dbState.monthTokens }]
          ),
      }),
    };
  },
}));

import { evaluateSpendGovernance, GOVERNANCE_EST_USD_PER_MTOK } from "./queue-processor";

const WS = "ws-governed";

describe("spend governance gate (CC-2026-10-01-009)", () => {
  beforeEach(() => {
    dbState.workspaceRow = { budget: "20.00", autoPause: true };
    dbState.monthTokens = 0;
    dbState.throws = false;
  });

  it("pauses when estimated monthly spend reaches the hard budget", async () => {
    dbState.monthTokens = 100_000_000; // 100M tokens * $0.25/M = $25 >= $20
    const res = await evaluateSpendGovernance(WS);
    expect(res.paused).toBe(true);
    expect(res.monthTokens).toBe(100_000_000);
    expect(res.budgetUsd).toBe(20);
    expect(res.reason).toContain("$25.00 >= hard budget $20.00");
  });

  it("lets runs proceed within budget", async () => {
    dbState.monthTokens = 10_000_000; // $2.50 of $20
    const res = await evaluateSpendGovernance(WS);
    expect(res.paused).toBe(false);
    expect(res.reason).toContain("within budget");
  });

  it("does not pause when auto-pause is disabled, even far over budget", async () => {
    dbState.workspaceRow = { budget: "20.00", autoPause: false };
    dbState.monthTokens = 1_000_000_000;
    const res = await evaluateSpendGovernance(WS);
    expect(res.paused).toBe(false);
    expect(res.reason).toContain("auto-pause disabled");
  });

  it("does not pause when no budget is set (zero budget)", async () => {
    dbState.workspaceRow = { budget: "0.00", autoPause: true };
    dbState.monthTokens = 50_000_000;
    const res = await evaluateSpendGovernance(WS);
    expect(res.paused).toBe(false);
    expect(res.reason).toContain("no budget set");
  });

  it("exempts the operator workspaces entirely", async () => {
    const res = await evaluateSpendGovernance("00000000-0000-0000-0000-000000000001");
    expect(res.exempt).toBe(true);
    expect(res.paused).toBe(false);
  });

  it("fails safe (no pause) when the database is unavailable", async () => {
    dbState.throws = true;
    const res = await evaluateSpendGovernance(WS);
    expect(res.paused).toBe(false);
    expect(res.reason).toContain("db unavailable");
  });

  it("uses a declared per-token estimate constant (not a fabricated invoice)", () => {
    expect(GOVERNANCE_EST_USD_PER_MTOK).toBeGreaterThan(0);
    expect(GOVERNANCE_EST_USD_PER_MTOK).toBeLessThan(1);
  });
});
