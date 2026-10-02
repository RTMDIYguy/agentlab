/**
 * Phase 12: Stripe webhook package provisioning.
 *
 * Guards the two behaviours the handoff asked for and the gap it left open:
 * - subscription-mode checkouts unlock with their subscription id
 * - ONE-TIME package payments (session.subscription === null) also unlock —
 *   before this, a paid one-time purchase silently provisioned nothing
 * - missing metadata and still-unpaid async sessions never unlock
 * - the catalog row is seeded before the FK insert when the package row
 *   does not exist yet
 * - provisioning failures are logged, never thrown as webhook 400s
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { workspacePackages, knowledgePackages } from "../schema";
import {
  handleCheckoutSessionCompleted,
  handleInvoicePaymentFailed,
  handleInvoicePaymentSucceeded,
  handleSubscriptionDeleted,
} from "./webhook";

type InsertCall = { table: unknown; values: any; conflict?: any };
type UpdateCall = { table: unknown; set: any };

const insertCalls: InsertCall[] = [];
const updateCalls: UpdateCall[] = [];
let selectRows: any[] = [];
let updateRows: any[] = [{ packageId: "sal-playbook" }];
let insertError: Error | null = null;

function makeDb() {
  return {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(async () => selectRows),
        })),
      })),
    })),
    update: vi.fn((table: unknown) => ({
      set: vi.fn((set: any) => ({
        where: vi.fn(() => ({
          returning: vi.fn(async () => {
            updateCalls.push({ table, set });
            return updateRows;
          }),
        })),
      })),
    })),
    insert: vi.fn((table: unknown) => ({
      values: (values: any) => {
        const call: InsertCall = { table, values };
        const record = () => {
          if (insertError) throw insertError;
          insertCalls.push(call);
        };
        return {
          onConflictDoUpdate: vi.fn(async (opts: any) => {
            call.conflict = opts;
            record();
            return [values];
          }),
          then: (resolve: any, reject: any) => {
            try {
              record();
              Promise.resolve([values]).then(resolve, reject);
            } catch (err) {
              Promise.reject(err).then(resolve, reject);
            }
          },
        };
      },
    })),
  };
}

vi.mock("../db", () => ({
  getDb: vi.fn(async () => makeDb()),
}));

vi.mock("./db", () => ({
  upsertSubscription: vi.fn(),
  getPaymentByStripeId: vi.fn(),
  createPayment: vi.fn(),
  updatePaymentStatus: vi.fn(),
}));

const paidSession = {
  id: "cs_test_1",
  status: "complete",
  payment_status: "paid",
  metadata: { workspaceId: "ws-1", packageId: "sal-playbook" },
};

function unlockCall() {
  return insertCalls.find(c => c.table === workspacePackages);
}

describe("handleCheckoutSessionCompleted", () => {
  beforeEach(() => {
    insertCalls.length = 0;
    updateCalls.length = 0;
    selectRows = [{}]; // package row already exists in the catalog
    updateRows = [{ packageId: "sal-playbook" }];
    insertError = null;
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("unlocks a subscription-mode checkout with its subscription id", async () => {
    await handleCheckoutSessionCompleted({
      ...paidSession,
      subscription: "sub_abc",
    } as any);

    const call = unlockCall();
    expect(call).toBeTruthy();
    expect(call!.values).toMatchObject({
      workspaceId: "ws-1",
      packageId: "sal-playbook",
      status: "active",
      stripeSubscriptionId: "sub_abc",
    });
    expect(call!.values.unlockedAt).toBeInstanceOf(Date);
    expect(call!.conflict.target).toEqual([
      workspacePackages.workspaceId,
      workspacePackages.packageId,
    ]);
  });

  it("unlocks a ONE-TIME payment checkout (no subscription id)", async () => {
    await handleCheckoutSessionCompleted({
      ...paidSession,
      mode: "payment",
      subscription: null,
    } as any);

    const call = unlockCall();
    expect(call).toBeTruthy();
    expect(call!.values).toMatchObject({
      workspaceId: "ws-1",
      packageId: "sal-playbook",
      status: "active",
      stripeSubscriptionId: null,
    });
    expect(call!.values.unlockedAt).toBeInstanceOf(Date);
  });

  it("never unlocks without workspaceId/packageId metadata", async () => {
    await handleCheckoutSessionCompleted({
      ...paidSession,
      metadata: { plan: "professional" },
    } as any);

    expect(insertCalls).toHaveLength(0);
    expect(console.error).toHaveBeenCalled();
  });

  it("does not unlock while an async payment is still unpaid", async () => {
    await handleCheckoutSessionCompleted({
      ...paidSession,
      payment_status: "unpaid",
      subscription: null,
    } as any);

    expect(unlockCall()).toBeUndefined();
    expect(console.warn).toHaveBeenCalled();
  });

  it("seeds the catalog row when the package row does not exist (FK safety)", async () => {
    selectRows = [];

    await handleCheckoutSessionCompleted({
      ...paidSession,
      subscription: null,
    } as any);

    const seed = insertCalls.find(c => c.table === knowledgePackages);
    expect(seed).toBeTruthy();
    expect(seed!.values.id).toBe("sal-playbook");

    expect(unlockCall()).toBeTruthy();
    expect(unlockCall()!.values.status).toBe("active");
  });

  it("logs provisioning failures instead of throwing them", async () => {
    insertError = new Error("FK violation on workspace_packages");

    await expect(
      handleCheckoutSessionCompleted({
        ...paidSession,
        subscription: null,
      } as any)
    ).resolves.toBeUndefined();

    expect(console.error).toHaveBeenCalled();
  });
});

describe("subscription lifecycle webhooks", () => {
  beforeEach(() => {
    insertCalls.length = 0;
    updateCalls.length = 0;
    updateRows = [{ packageId: "sal-playbook" }];
    selectRows = [{}];
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("marks the package past_due when a renewal invoice payment fails", async () => {
    await handleInvoicePaymentFailed({ subscription: "sub_lifecycle" } as any);

    expect(updateCalls).toHaveLength(1);
    expect(updateCalls[0].table).toBe(workspacePackages);
    expect(updateCalls[0].set).toMatchObject({ status: "past_due" });
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("sub_lifecycle")
    );
  });

  it("reads the subscription id from the modern invoice parent shape", async () => {
    await handleInvoicePaymentFailed({
      parent: { subscription_details: { subscription: "sub_modern" } },
    } as any);

    expect(updateCalls).toHaveLength(1);
    expect(updateCalls[0].set).toMatchObject({ status: "past_due" });
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("sub_modern")
    );
  });

  it("re-activates the package when a renewal invoice is paid", async () => {
    await handleInvoicePaymentSucceeded({ subscription: "sub_lifecycle" } as any);

    expect(updateCalls).toHaveLength(1);
    expect(updateCalls[0].set).toMatchObject({ status: "active" });
  });

  it("cancels the package when the subscription ends", async () => {
    await handleSubscriptionDeleted({ id: "sub_lifecycle" } as any);

    expect(updateCalls).toHaveLength(1);
    expect(updateCalls[0].set).toMatchObject({ status: "canceled" });
  });

  it("is an honest no-op when no workspace package matches the subscription", async () => {
    updateRows = [];

    await expect(
      handleSubscriptionDeleted({ id: "sub_unknown" } as any)
    ).resolves.toBeUndefined();

    expect(updateCalls).toHaveLength(1);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("no workspace_packages row")
    );
  });

  it("warns instead of guessing when an invoice carries no subscription id", async () => {
    await handleInvoicePaymentFailed({} as any);

    expect(updateCalls).toHaveLength(0);
    expect(console.warn).toHaveBeenCalled();
  });
});
