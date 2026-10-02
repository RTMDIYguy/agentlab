/**
 * Phase 12 / CC-2026-10-02-003: package checkout price resolution.
 *
 * Proves the zero-catalog design Robert relies on (he has NOT finished
 * cataloging products at Stripe):
 * - first checkout of an uncataloged package creates the product (seeded
 *   id) + monthly price, even when prices.list answers resource_missing
 * - later checkouts reuse the active price — no duplicate catalog entries
 * - env override pins the one price Robert already created
 * - an unpriceable package fails honestly instead of guessing
 * - session metadata always carries { workspaceId, packageId } — the
 *   exact contract server/stripe/webhook.ts provisions from
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const pricesList = vi.fn();
const pricesRetrieve = vi.fn();
const pricesCreate = vi.fn();
const productsRetrieve = vi.fn();
const productsCreate = vi.fn();
const sessionsCreate = vi.fn();

vi.mock("stripe", () => ({
  default: class FakeStripe {
    prices = {
      list: pricesList,
      retrieve: pricesRetrieve,
      create: pricesCreate,
    };
    products = { retrieve: productsRetrieve, create: productsCreate };
    checkout = { sessions: { create: sessionsCreate } };
    constructor(_key?: string, _config?: unknown) {}
  },
}));

import { createPackageCheckoutSession } from "./checkout";

const baseParams = {
  workspaceId: "ws-1",
  packageId: "sal-playbook",
  productName: "Sales (SAL) Playbook",
  monthlyPrice: 149,
  stripeProductId: "prod_sal_456",
  successUrl: "http://localhost:3000/marketplace?checkout=success&packageId=sal-playbook",
  cancelUrl: "http://localhost:3000/marketplace?checkout=canceled&packageId=sal-playbook",
};

const missing = () =>
  Object.assign(new Error("No such product"), { code: "resource_missing" });

describe("createPackageCheckoutSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "sk_test_xyz";
    delete process.env.STRIPE_PACKAGE_PRICE_ID;
    delete process.env.STRIPE_PACKAGE_PRICE_ID_SAL_PLAYBOOK;
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_PACKAGE_PRICE_ID;
    delete process.env.STRIPE_PACKAGE_PRICE_ID_SAL_PLAYBOOK;
    vi.restoreAllMocks();
  });

  it("first checkout: creates the missing product + monthly price and returns the session URL", async () => {
    // Even the price LIST may answer resource_missing for an uncataloged product.
    pricesList.mockRejectedValue(missing());
    productsRetrieve.mockRejectedValue(missing());
    productsCreate.mockResolvedValue({ id: "prod_sal_456" });
    pricesCreate.mockResolvedValue({ id: "price_created_1", type: "recurring" });
    sessionsCreate.mockResolvedValue({ url: "https://checkout.stripe.com/c/pay/cs_1" });

    const url = await createPackageCheckoutSession(baseParams);

    expect(url).toBe("https://checkout.stripe.com/c/pay/cs_1");
    expect(productsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ id: "prod_sal_456", name: "Sales (SAL) Playbook" })
    );
    expect(pricesCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        product: "prod_sal_456",
        unit_amount: 14900,
        recurring: { interval: "month" },
        metadata: { packageId: "sal-playbook" },
      })
    );
    expect(sessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "subscription",
        client_reference_id: "ws-1",
        line_items: [{ price: "price_created_1", quantity: 1 }],
        metadata: {
          workspaceId: "ws-1",
          packageId: "sal-playbook",
          source: "marketplace-subscribe",
        },
      })
    );
  });

  it("later checkout: reuses the active price without creating anything", async () => {
    pricesList.mockResolvedValue({ data: [{ id: "price_existing", type: "recurring" }] });
    sessionsCreate.mockResolvedValue({ url: "https://checkout.stripe.com/c/pay/cs_2" });

    await createPackageCheckoutSession(baseParams);

    expect(productsCreate).not.toHaveBeenCalled();
    expect(pricesCreate).not.toHaveBeenCalled();
    expect(sessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [{ price: "price_existing", quantity: 1 }],
      })
    );
  });

  it("env override pins the one price Robert already created (per-package slug)", async () => {
    process.env.STRIPE_PACKAGE_PRICE_ID_SAL_PLAYBOOK = "price_from_env";
    pricesRetrieve.mockResolvedValue({ id: "price_from_env", type: "recurring" });
    sessionsCreate.mockResolvedValue({ url: "https://checkout.stripe.com/c/pay/cs_3" });

    await createPackageCheckoutSession(baseParams);

    expect(pricesRetrieve).toHaveBeenCalledWith("price_from_env");
    expect(pricesList).not.toHaveBeenCalled();
    expect(sessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [{ price: "price_from_env", quantity: 1 }],
      })
    );
  });

  it("one-time env price produces a payment-mode session", async () => {
    process.env.STRIPE_PACKAGE_PRICE_ID = "price_onetime";
    pricesRetrieve.mockResolvedValue({ id: "price_onetime", type: "one_time" });
    sessionsCreate.mockResolvedValue({ url: "https://checkout.stripe.com/c/pay/cs_4" });

    await createPackageCheckoutSession(baseParams);

    expect(sessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ mode: "payment" })
    );
  });

  it("an unpriceable package fails with an honest error, never a $0 checkout", async () => {
    await expect(
      createPackageCheckoutSession({
        ...baseParams,
        stripeProductId: null,
        monthlyPrice: 0,
      })
    ).rejects.toThrow(/no Stripe product configured/);

    expect(sessionsCreate).not.toHaveBeenCalled();
  });

  it("a price-less product with monthlyPrice 0 refuses to invent a charge", async () => {
    pricesList.mockResolvedValue({ data: [] });
    productsRetrieve.mockResolvedValue({ id: "prod_free" });

    await expect(
      createPackageCheckoutSession({
        ...baseParams,
        stripeProductId: "prod_free",
        monthlyPrice: 0,
      })
    ).rejects.toThrow(/no configured price to charge/);

    expect(sessionsCreate).not.toHaveBeenCalled();
  });
});
