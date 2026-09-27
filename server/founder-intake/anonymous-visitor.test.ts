import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Anonymous visitor capture (CC-2026-09-25-013).
 *
 * The front door (/start) persists EVERY curious visitor: anonymous turns
 * under an opaque visitor_key, email-keyed once an address is shared, with
 * the anonymous row stamped on first-email. Signup claims anonymous history
 * via the same browser key. Hermetic per repo convention: ../db, ai, and
 * google-ai are mocked — no network, no live database.
 */

const captured: { inserted: any[]; updated: any[]; selectResolved: any[] } = {
  inserted: [],
  updated: [],
  selectResolved: [],
};

vi.mock("ai", () => ({
  generateText: vi.fn(async () => {
    throw new Error("no llm in test");
  }),
}));

vi.mock("../_core/google-ai", () => ({
  createGoogleProvider: () => (modelId: string) => ({ modelId }),
  isGoogleAiConfigured: () => false,
}));

vi.mock("../db", () => {
  function chain(resolved: () => any[]) {
    const c: any = {};
    c.from = vi.fn(() => c);
    c.where = vi.fn(() => c);
    c.values = vi.fn(() => c);
    c.returning = vi.fn(() => Promise.resolve([{ id: "sub-1" }]));
    c.limit = vi.fn(() => c);
    c.then = (res: any, rej: any) =>
      Promise.resolve(resolved()).then(res, rej);
    return c;
  }

  const mockDb = {
    select: vi.fn(() => chain(() => captured.selectResolved.shift() ?? [])),
    insert: vi.fn(() => {
      const c = chain(() => [{ id: "prof-new" }]);
      const origValues = c.values;
      c.values = vi.fn((v: any) => {
        captured.inserted.push(v);
        return origValues(v);
      });
      return c;
    }),
    update: vi.fn(() => {
      const c = chain(() => []);
      c.set = vi.fn((v: any) => {
        captured.updated.push(v);
        return c;
      });
      return c;
    }),
  };

  return { getDb: vi.fn(async () => mockDb), db: mockDb };
});

import {
  founderIntakeRouter,
  claimAnonymousVisitorProfile,
} from "./router";

const turn = (overrides: Record<string, unknown> = {}) => ({
  messages: [{ role: "user" as const, content: "Cash flow is a mess and I live in spreadsheets." }],
  lead: {},
  ...overrides,
});

describe("anonymous visitor memory (front door)", () => {
  beforeEach(() => {
    captured.inserted.length = 0;
    captured.updated.length = 0;
    captured.selectResolved.length = 0;
  });

  it("persists a fully anonymous turn under the visitor key (no email anywhere)", async () => {
    await founderIntakeRouter.createCaller({} as any).respond(
      turn({ visitorKey: "v_abc123" })
    );

    expect(captured.inserted).toHaveLength(1);
    const row = captured.inserted[0];
    expect(row.visitorKey).toBe("v_abc123");
    expect(row.email).toBeNull();
    // The visitor's words persist in the bounded transcript even when the
    // structured fields stay empty (fallback path does not extract).
    expect(row.conversation.transcript).toContain("spreadsheets");
  });

  it("does nothing when neither email nor visitor key is present", async () => {
    await founderIntakeRouter.createCaller({} as any).respond(turn());
    expect(captured.inserted).toHaveLength(0);
    expect(captured.updated).toHaveLength(0);
  });

  it("stamps the anonymous row with the email on the turn where it is shared", async () => {
    // First lookup (by email) misses; second lookup (by key) finds the row.
    captured.selectResolved.push([]);
    captured.selectResolved.push([{ id: "prof-anon", email: null }]);

    await founderIntakeRouter.createCaller({} as any).respond(
      turn({
        visitorKey: "v_abc123",
        lead: { email: "Dana@Northwind.test", name: "Dana" },
      })
    );

    expect(captured.updated).toHaveLength(1);
    expect(captured.updated[0].email).toBe("dana@northwind.test");
  });
});

describe("claimAnonymousVisitorProfile (signup handoff)", () => {
  beforeEach(() => {
    captured.inserted.length = 0;
    captured.updated.length = 0;
    captured.selectResolved.length = 0;
  });

  it("returns the anonymous profile and marks it claimed", async () => {
    captured.selectResolved.push([
      {
        id: "prof-anon",
        email: null,
        claimedByWorkspaceId: null,
        claimedAt: null,
        name: null,
        company: "Northwind Logistics",
        painPoint: "Manual freight invoice reconciliation",
        interest: "Business Systems Diagnostic",
        conversation: { transcript: "Visitor: invoices..." },
      },
    ]);

    const out = await claimAnonymousVisitorProfile("v_abc123", "ws-777");
    expect(out).not.toBeNull();
    expect(out?.company).toBe("Northwind Logistics");
    expect(out?.transcript).toContain("invoices");
    expect(captured.updated).toHaveLength(1);
    expect(captured.updated[0].claimedByWorkspaceId).toBe("ws-777");
    expect(captured.updated[0].claimedAt).toBeInstanceOf(Date);
  });

  it("refuses an already-claimed profile", async () => {
    captured.selectResolved.push([
      {
        id: "prof-anon",
        email: null,
        claimedByWorkspaceId: "ws-earlier",
        claimedAt: new Date(),
        name: null,
        company: null,
        painPoint: null,
        interest: null,
        conversation: null,
      },
    ]);

    const out = await claimAnonymousVisitorProfile("v_abc123", "ws-777");
    expect(out).toBeNull();
    expect(captured.updated).toHaveLength(0);
  });

  it("returns null for a missing profile", async () => {
    captured.selectResolved.push([]);
    const out = await claimAnonymousVisitorProfile("v_missing", "ws-777");
    expect(out).toBeNull();
    expect(captured.updated).toHaveLength(0);
  });
});
