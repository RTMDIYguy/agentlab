/**
 * Phase 12: POST /marketplace/packages/:packageId/subscribe
 *
 * - paid package + STRIPE_SECRET_KEY → Stripe Checkout Session with
 *   { workspaceId, packageId } in metadata, no silent free grant
 * - checkout failure → honest 502, workspace_packages untouched
 * - local dev (no key) and free packages → Phase 11 direct activation
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { workspacePackages } from "../schema";
import { createPackageCheckoutSession } from "../stripe/checkout";
import { subscribeToPackage, mountPlaybook } from "./marketplace";

const insertCalls: { table: unknown; values: any }[] = [];
let selectRows: any[] = [];

function makeDb() {
  return {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(async () => selectRows),
        })),
      })),
    })),
    insert: vi.fn((table: unknown) => ({
      values: (values: any) => {
        insertCalls.push({ table, values });
        return Promise.resolve([values]);
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
    params: { packageId: "sal-playbook" },
    headers: { origin: "http://localhost:5173" },
    body: {},
    workspaceId: "ws-1",
    user: { email: "founder@example.com" },
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

/** workspace_packages inserts are the "free grant" signature. */
function freeGrantInserts() {
  return insertCalls.filter(
    c => c.table === workspacePackages || (c.values && "packageId" in c.values)
  );
}

describe("subscribeToPackage", () => {
  beforeEach(() => {
    insertCalls.length = 0;
    selectRows = [];
    delete process.env.STRIPE_SECRET_KEY;
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
    vi.restoreAllMocks();
    vi.mocked(createPackageCheckoutSession).mockReset();
  });

  it("rejects a request without a packageId", async () => {
    const { req, res } = setup({ params: {} });
    await subscribeToPackage(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/packageId/);
    expect(createPackageCheckoutSession).not.toHaveBeenCalled();
  });

  it("local dev (no Stripe key): activates directly, no checkout", async () => {
    const { req, res } = setup();

    await subscribeToPackage(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ success: true, packageId: "sal-playbook" });
    expect(createPackageCheckoutSession).not.toHaveBeenCalled();
    expect(
      insertCalls.some(
        c => c.table === workspacePackages && c.values.packageId === "sal-playbook"
      )
    ).toBe(true);
  });

  it("paid package with Stripe key: returns checkoutUrl with workspace/package metadata", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_xyz";
    vi.mocked(createPackageCheckoutSession).mockResolvedValue(
      "https://checkout.stripe.com/c/pay/cs_test_123"
    );
    const { req, res } = setup();

    await subscribeToPackage(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      mode: "stripe",
      checkoutUrl: "https://checkout.stripe.com/c/pay/cs_test_123",
      packageId: "sal-playbook",
      workspaceId: "ws-1",
    });
    expect(createPackageCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: "ws-1",
        packageId: "sal-playbook",
        monthlyPrice: 149,
        stripeProductId: "prod_sal_456",
        customerEmail: "founder@example.com",
        successUrl: expect.stringContaining("packageId=sal-playbook"),
        cancelUrl: expect.stringContaining("checkout=canceled"),
      })
    );
    // No free grant on the Stripe path — provisioning belongs to the webhook.
    expect(freeGrantInserts()).toHaveLength(0);
  });

  it("checkout failure returns an honest 502 and never grants the package free", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_xyz";
    vi.mocked(createPackageCheckoutSession).mockRejectedValue(
      new Error("No Stripe product configured for pkg-x")
    );
    const { req, res } = setup();

    await subscribeToPackage(req, res);

    expect(res.statusCode).toBe(502);
    expect(res.body.error).toMatch(/checkout session/i);
    expect(res.body.detail).toMatch(/No Stripe product configured/);
    expect(freeGrantInserts()).toHaveLength(0);
  });

  it("free package (price 0) activates directly even with a Stripe key set", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_xyz";
    const { req, res } = setup({ params: { packageId: "free-legacy-pack" } });

    await subscribeToPackage(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ success: true, packageId: "free-legacy-pack" });
    expect(createPackageCheckoutSession).not.toHaveBeenCalled();
  });
});

describe("mountPlaybook payment gate (CC-2026-10-02-003)", () => {
  beforeEach(() => {
    insertCalls.length = 0;
    selectRows = [];
    delete process.env.STRIPE_SECRET_KEY;
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
    vi.restoreAllMocks();
    vi.mocked(createPackageCheckoutSession).mockReset();
  });

  it("local dev (no Stripe key): paid packages still mount directly", async () => {
    const { req, res } = setup({ params: { id: "sal-playbook" } });

    await mountPlaybook(req, res);

    expect(res.statusCode).toBe(200);
    expect(
      insertCalls.some(
        c => c.table === workspacePackages && c.values.packageId === "sal-playbook"
      )
    ).toBe(true);
  });

  it("Stripe configured: paid package mount is refused with 402 + checkout path", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_xyz";
    const { req, res } = setup({ params: { id: "sal-playbook" } });

    await mountPlaybook(req, res);

    expect(res.statusCode).toBe(402);
    expect(res.body).toMatchObject({
      error: "payment_required",
      packageId: "sal-playbook",
      checkoutEndpoint: "/api/marketplace/packages/sal-playbook/subscribe",
    });
    expect(res.body.message).toMatch(/paid package/);
    // No free grant happened.
    expect(insertCalls.filter(c => c.table === workspacePackages)).toHaveLength(0);
  });

  it("admin comp grants still activate with Stripe configured", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_xyz";
    const { req, res } = setup({
      params: { id: "sal-playbook" },
      user: { role: "admin" },
    });

    await mountPlaybook(req, res);

    expect(res.statusCode).toBe(200);
    expect(
      insertCalls.some(c => c.table === workspacePackages)
    ).toBe(true);
  });

  it("free packages mount with Stripe configured", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_xyz";
    const { req, res } = setup({ params: { id: "free-legacy-pack" } });

    await mountPlaybook(req, res);

    expect(res.statusCode).toBe(200);
    expect(
      insertCalls.some(
        c => c.table === workspacePackages && c.values.packageId === "free-legacy-pack"
      )
    ).toBe(true);
  });
});
