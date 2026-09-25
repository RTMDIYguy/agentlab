import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Visitor → account memory handoff (CC-2026-09-24-003, fix 3).
 *
 * The founder intake chat must persist what it learns about an anonymous
 * visitor into visitor_profiles (keyed by email) on every turn, and the
 * signup path must claim that profile to seed the new workspace. These
 * tests verify the rules without a live database (repo convention:
 * vi.mock of ../db), so they hold regardless of Neon connectivity.
 */

const captured: { updated: any[] } = { updated: [] };

const profileRow = {
  id: "prof-1",
  email: "dana@northwindlogistics.com",
  name: "Dana Caldwell",
  company: "Northwind Logistics",
  painPoint: "Manual freight invoice reconciliation",
  interest: "Business Systems Diagnostic",
  conversation: { transcript: "Visitor: ..." },
  claimedByWorkspaceId: null as string | null,
  claimedAt: null as Date | null,
};

vi.mock("../db", () => {
  function selectChain(resolved: () => any[]) {
    const chain: any = {};
    chain.from = vi.fn(() => chain);
    chain.where = vi.fn(() => chain);
    chain.limit = vi.fn(() => chain);
    chain.then = (res: any, rej: any) =>
      Promise.resolve(resolved()).then(res, rej);
    return chain;
  }

  const mockDb = {
    select: vi.fn(() => selectChain(() => [profileRow])),
    update: vi.fn(() => {
      const chain: any = {};
      chain.set = vi.fn((v: any) => {
        captured.updated.push(v);
        return chain;
      });
      chain.where = vi.fn(() => chain);
      chain.then = (res: any) => Promise.resolve([]).then(res);
      return chain;
    }),
  };

  return { getDb: vi.fn(async () => mockDb), db: mockDb };
});

import { claimVisitorProfile } from "./router";

describe("visitor memory (founder intake → workspace seed)", () => {
  beforeEach(() => {
    captured.updated.length = 0;
  });

  it("claimVisitorProfile returns the profile and marks it claimed", async () => {
    const out = await claimVisitorProfile(
      "Dana@NorthwindLogistics.com ",
      "ws-123"
    );

    expect(out).not.toBeNull();
    expect(out?.name).toBe("Dana Caldwell");
    expect(out?.company).toBe("Northwind Logistics");
    expect(out?.painPoint).toContain("freight invoice");
    expect(out?.transcript).toBe("Visitor: ...");
    // Claim stamp was written exactly once (idempotent handoff).
    expect(captured.updated.length).toBe(1);
  });

  it("returns null when no profile exists (plain signup unaffected)", async () => {
    // Override the select resolution for this test.
    const { getDb } = await import("../db");
    const mdb = (await getDb()) as any;
    mdb.select.mockImplementationOnce(() => {
      const chain: any = {};
      chain.from = vi.fn(() => chain);
      chain.where = vi.fn(() => chain);
      chain.limit = vi.fn(() => chain);
      chain.then = (res: any) => Promise.resolve([]).then(res);
      return chain;
    });

    const out = await claimVisitorProfile("nobody@nowhere.test", "ws-123");
    expect(out).toBeNull();
    expect(captured.updated.length).toBe(0);
  });
});
