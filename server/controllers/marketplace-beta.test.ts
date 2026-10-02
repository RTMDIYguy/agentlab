/**
 * CC-2026-10-02-017 — beta subsystem built "for real" (Robert's Q1 choice).
 *
 * - getBetaStatus: anonymous/placeholder callers are NEVER godmode, XP and
 *   tier come from the real ledger (was: constants 9999/350 + role default)
 * - enrollBeta: catalog validation, 403 tier gate, +50 XP ledger award,
 *   LeadPulse +7 trial days, +14 trial-day milestone at 5 enrollments
 * - getTrialStatus: extension days summed from the ledger
 * - extendTrial: privileged-gated real ledger write with 28-day cap
 * - mountPlaybook: PLAYBOOK_MOUNT audit row carries zero tokens/cost
 * - getMarketplaceItems: no static per-department workflow-count claims
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  auditLogs,
  betaEnrollments,
  betaXpEvents,
} from "../schema";
import {
  getBetaStatus,
  enrollBeta,
  getTrialStatus,
  extendTrial,
  mountPlaybook,
  getMarketplaceItems,
} from "./marketplace";

const insertCalls: { table: unknown; values: any }[] = [];
// FIFO of result rows: every select().from()...() shifts the next entry.
// Callers must queue in the order the controller issues its reads.
const selectQueue: any[][] = [];

function shiftRows(): any[] {
  return selectQueue.shift() ?? [];
}

function makeDb() {
  const result = (rows: any[]) => {
    const p: any = Promise.resolve(rows);
    p.limit = (n: number) => Promise.resolve(rows.slice(0, n));
    return p;
  };
  return {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => result(shiftRows())),
        limit: vi.fn(() => result(shiftRows())),
      })),
    })),
    insert: vi.fn((table: unknown) => ({
      values: (values: any) => {
        insertCalls.push({ table, values });
        const p: any = Promise.resolve([values]);
        p.returning = () => Promise.resolve([values]);
        p.onConflictDoNothing = () => {
          const p2: any = Promise.resolve([values]);
          p2.returning = () => Promise.resolve([values]);
          return p2;
        };
        return p;
      },
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(async () => []),
      })),
    })),
  };
}

vi.mock("../db", () => ({
  getDb: vi.fn(async () => makeDb()),
}));

vi.mock("../stripe/checkout", () => ({
  createPackageCheckoutSession: vi.fn(),
}));

function setup(overrides: Record<string, unknown> = {}) {
  const req: any = {
    params: {},
    headers: {},
    body: {},
    ...overrides,
  };
  const res: any = { statusCode: 0, body: undefined as unknown };
  res.status = vi.fn((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.json = vi.fn((payload: unknown) => {
    res.body = payload;
    return res;
  });
  return { req, res };
}

function xpInserts() {
  return insertCalls.filter(c => c.table === betaXpEvents);
}

function enrollmentInserts() {
  return insertCalls.filter(c => c.table === betaEnrollments);
}

beforeEach(() => {
  insertCalls.length = 0;
  selectQueue.length = 0;
  delete process.env.STRIPE_SECRET_KEY;
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getBetaStatus — identity (CC-016 finding: anonymous godmode)", () => {
  it("anonymous caller is not godmode and sees the real zero state", async () => {
    const { req, res } = setup();

    await getBetaStatus(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.isGodmode).toBe(false);
    expect(res.body.betaPoints).toBe(0); // was 350
    expect(res.body.tierLevel).toBe(1); // was 2
    expect(res.body.currentTier).toBe("Explorer (Tier 1)");
    expect(res.body.enrolledApps).toEqual([]); // was ["app-leadpulse","app-pulse-social"]
    expect(res.body.freeBookPerk.status).toBe("Included with Beta participation");
  });

  it("legacy tenant fallback (admin role + placeholder email) is NOT godmode", async () => {
    // tenantMiddleware's no-Bearer fallback assigns exactly this pair —
    // the old `req.user?.role || "admin"` treated it as full godmode.
    const { req, res } = setup({
      userRole: "admin",
      userEmail: "operator@agentlab.local",
    });

    await getBetaStatus(req, res);

    expect(res.body.isGodmode).toBe(false);
    expect(res.body.betaPoints).toBe(0);
    expect(res.body.tierLevel).toBe(1);
  });

  it("god workspace is godmode with every catalog program active", async () => {
    const { req, res } = setup({
      workspaceId: "00000000-0000-0000-0000-000000000000",
      userRole: "admin",
      userEmail: "thebossrob@gmail.com",
    });

    await getBetaStatus(req, res);

    expect(res.body.isGodmode).toBe(true);
    expect(res.body.tierLevel).toBe(3);
    expect(res.body.currentTier).toContain("Godmode");
    expect(res.body.enrolledApps.length).toBeGreaterThanOrEqual(13);
    expect(res.body.availablePrograms.every((p: any) => p.status === "Active")).toBe(true);
  });

  it("tier and XP are derived from the ledger, not constants", async () => {
    // 100 XP (two Tier-1 enrollments) → Contributor at the new 100-XP threshold
    selectQueue.push([], [{ points: 50 }, { points: 50 }]);
    const { req, res } = setup({ workspaceId: "ws-1" });

    await getBetaStatus(req, res);

    expect(res.body.betaPoints).toBe(100);
    expect(res.body.tierLevel).toBe(2);
    expect(res.body.currentTier).toBe("Contributor (Tier 2)");
    // MM std/nv become Available at Tier 2; Tier-3 program stays Locked
    const byId = Object.fromEntries(
      res.body.availablePrograms.map((p: any) => [p.id, p.status])
    );
    expect(byId["app-market-marksman-std"]).toBe("Available");
    expect(byId["agentic-os-v2"]).toBe("Locked");
  });
});

describe("enrollBeta — tier gate + real XP ledger", () => {
  it("rejects unknown app ids", async () => {
    const { req, res } = setup({ params: { appId: "app-not-real" } });

    await enrollBeta(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("unknown_beta_app");
    expect(insertCalls).toHaveLength(0);
  });

  it("403s below the required tier with real numbers", async () => {
    selectQueue.push([], []); // empty ledger
    const { req, res } = setup({
      workspaceId: "ws-1",
      params: { appId: "app-market-marksman-std" }, // Contributor (Tier 2)
    });

    await enrollBeta(req, res);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe("tier_requirement_not_met");
    expect(res.body.requiredTier).toBe("Contributor (Tier 2)");
    expect(res.body.betaPoints).toBe(0);
    expect(insertCalls).toHaveLength(0);
  });

  it("first enrollment awards +50 XP and LeadPulse's +7 trial days", async () => {
    selectQueue.push(
      [], // enrollments
      [], // xp events
      [], // refreshed enrollments
      [{ points: 50 }, { trialDays: 7 }] // refreshed xp events
    );
    const { req, res } = setup({
      workspaceId: "ws-1",
      params: { appId: "app-leadpulse" },
    });

    await enrollBeta(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.alreadyEnrolled).toBe(false);
    expect(res.body.xpAwarded).toBe(50);
    expect(res.body.trialDaysAwarded).toBe(7);
    expect(res.body.betaPoints).toBe(50);

    expect(enrollmentInserts()).toHaveLength(1);
    expect(enrollmentInserts()[0].values).toMatchObject({
      workspaceId: "ws-1",
      appId: "app-leadpulse",
      xpGranted: 50,
    });

    const events = xpInserts().map(c => c.values);
    expect(events).toContainEqual(
      expect.objectContaining({ eventType: "enrollment", appId: "app-leadpulse", points: 50 })
    );
    expect(events).toContainEqual(
      expect.objectContaining({ eventType: "trial_extension", trialDays: 7, appId: "app-leadpulse" })
    );
  });

  it("re-enrolling the same app awards nothing", async () => {
    selectQueue.push(
      [{ appId: "app-leadpulse" }], // already a member
      [{ points: 50 }],
      [{ appId: "app-leadpulse" }],
      [{ points: 50 }]
    );
    const { req, res } = setup({
      workspaceId: "ws-1",
      params: { appId: "app-leadpulse" },
    });

    await enrollBeta(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.alreadyEnrolled).toBe(true);
    expect(res.body.xpAwarded).toBe(0);
    expect(insertCalls).toHaveLength(0);
  });

  it("5th enrollment fires the +14-day milestone exactly once", async () => {
    selectQueue.push(
      [
        { appId: "a" }, { appId: "b" }, { appId: "c" }, { appId: "d" },
      ], // 4 existing memberships
      [{ points: 200 }],
      [], // milestone prior-check: no milestone yet
      [{ appId: "a" }, { appId: "b" }, { appId: "c" }, { appId: "d" }, { appId: "app-pulse-social" }],
      [{ points: 250 }, { trialDays: 14 }]
    );
    const { req, res } = setup({
      workspaceId: "ws-1",
      params: { appId: "app-pulse-social" },
    });

    await enrollBeta(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.trialDaysAwarded).toBe(14);
    expect(xpInserts().map(c => c.values)).toContainEqual(
      expect.objectContaining({
        eventType: "trial_extension",
        trialDays: 14,
        reason: "Milestone: 5 beta program enrollments",
      })
    );
  });

  it("does not re-grant the milestone when it already exists", async () => {
    selectQueue.push(
      [{ appId: "a" }, { appId: "b" }, { appId: "c" }, { appId: "d" }],
      [{ points: 200 }],
      [{ eventType: "trial_extension", reason: "Milestone: 5 beta program enrollments" }], // prior grant
      [{ appId: "a" }, { appId: "b" }, { appId: "c" }, { appId: "d" }, { appId: "app-pulse-social" }],
      [{ points: 250 }, { trialDays: 14 }]
    );
    const { req, res } = setup({
      workspaceId: "ws-1",
      params: { appId: "app-pulse-social" },
    });

    await enrollBeta(req, res);

    expect(res.body.trialDaysAwarded).toBe(0);
    const milestoneRows = xpInserts().filter(
      c => c.values.reason === "Milestone: 5 beta program enrollments"
    );
    expect(milestoneRows).toHaveLength(0);
  });
});

describe("getTrialStatus — real extension ledger", () => {
  it("sums ledger trial days into the response", async () => {
    selectQueue.push([], [{ trialDays: 14 }, { trialDays: 7 }]);
    const { req, res } = setup({ workspaceId: "ws-1" });

    await getTrialStatus(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.extensionDaysGranted).toBe(21);
    expect(res.body.daysRemaining).toBe(39); // illustrative base 18 + 21
    expect(res.body.totalTrialDays).toBe(51);
    expect(res.body.canExtend).toBe(true); // 21 < 28
    expect(res.body.tracking).toBe("demo-base-real-extensions");
    expect(res.body.note).toContain("illustrative");
  });
});

describe("extendTrial — privileged, capped, ledgered", () => {
  it("refuses anonymous callers", async () => {
    const { req, res } = setup({ workspaceId: "ws-1" });

    await extendTrial(req, res);

    expect(res.statusCode).toBe(403);
    expect(insertCalls).toHaveLength(0);
  });

  it("refuses the legacy admin+placeholder identity", async () => {
    const { req, res } = setup({
      workspaceId: "ws-1",
      userRole: "admin",
      userEmail: "operator@agentlab.local",
    });

    await extendTrial(req, res);

    expect(res.statusCode).toBe(403);
  });

  it("admin grant writes a real ledger row", async () => {
    selectQueue.push(
      [], // ledger: enrollments
      [], // ledger: xp events
      [], // refreshed enrollments
      [{ trialDays: 14 }] // refreshed xp events
    );
    const { req, res } = setup({
      workspaceId: "ws-1",
      userRole: "admin",
      userEmail: "rob@example.com",
      body: { reason: "Comp for partner" },
    });

    await extendTrial(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.addedDays).toBe(14);
    expect(res.body.totalExtensionDays).toBe(14);
    expect(res.body.daysRemaining).toBe(32);
    expect(xpInserts()[0].values).toMatchObject({
      eventType: "trial_extension",
      trialDays: 14,
      reason: "Comp for partner",
    });
  });

  it("rejects once the 28-day cap is reached", async () => {
    selectQueue.push([], [{ trialDays: 28 }]); // enrollments, then xp events
    const { req, res } = setup({
      workspaceId: "ws-1",
      userRole: "admin",
      userEmail: "rob@example.com",
    });

    await extendTrial(req, res);

    expect(res.statusCode).toBe(409);
    expect(res.body.error).toBe("extension_cap_reached");
    expect(insertCalls).toHaveLength(0);
  });
});

describe("mountPlaybook — PLAYBOOK_MOUNT telemetry honesty (disposition 3)", () => {
  it("records zero tokens/cost, measured latency, and unevaluated policy checks", async () => {
    selectQueue.push(
      [], // commerce context (knowledgePackages)
      [], // existing workspace_packages
      [], // pkgCheck
      [] // workflows lookup → create FSS workflow
    );
    const { req, res } = setup({
      params: { id: "pkg-founder-signal" },
      workspaceId: "ws-1",
    });

    await mountPlaybook(req, res);

    expect(res.statusCode).toBe(200);
    const audit = insertCalls.find(
      c => c.table === auditLogs && c.values.actionType === "PLAYBOOK_MOUNT"
    );
    expect(audit).toBeDefined();
    expect(audit!.values).toMatchObject({
      model: "not-llm-dispatch",
      tokensPrompt: 0,
      tokensCompletion: 0,
      tokensTotal: 0,
      cost: "0.000000",
      status: "success",
    });
    expect(typeof audit!.values.latencyMs).toBe("number");
    expect(audit!.values.latencyMs).toBeGreaterThanOrEqual(0);
    expect(audit!.values.policyChecks).toMatchObject({
      evaluated: false,
      note: "not-llm-dispatch",
    });
    // The old row hardcoded 270 tokens on a not-llm dispatch:
    expect(
      (audit!.values.tokensPrompt ?? 0) + (audit!.values.tokensCompletion ?? 0)
    ).toBe(0);
  });
});

describe("getMarketplaceItems — no fabricated workflow claims (disposition 2)", () => {
  it("labels departments honestly and omits workflowsCount", async () => {
    selectQueue.push([]); // workspace_packages lookup
    const { req, res } = setup({ workspaceId: "ws-1" });

    await getMarketplaceItems(req, res);

    expect(res.statusCode).toBe(200);
    const playbooks = res.body.playbooks;
    expect(playbooks.length).toBeGreaterThan(0);
    for (const pb of playbooks) {
      expect(pb.department).toMatch(/^Dept [A-Z]+$/); // was "Dept MKT • N DAG Workflows"
      expect(pb).not.toHaveProperty("workflowsCount"); // static claim dropped
    }
    expect(res.body.mountedCount).toBe(playbooks.filter((p: any) => p.isMounted).length);
  });
});
