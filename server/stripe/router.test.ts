import { describe, it, expect, vi, beforeEach } from "vitest";
import { stripeRouter } from "./router";
import { getSubscriptionByUserId, getPaymentsByUserId } from "./db";
import { createCheckoutSession } from "./checkout";

// Mock the dependencies
vi.mock("./db");
vi.mock("./checkout");

describe("stripeRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCurrentSubscription", () => {
    it("should return null when user has no subscription", async () => {
      const mockUser = {
        id: 1,
        openId: "test-user",
        name: "Test User",
        email: "test@example.com",
        role: "user" as const,
        loginMethod: "manus",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };

      vi.mocked(getSubscriptionByUserId).mockResolvedValue(null);

      const caller = stripeRouter.createCaller({
        user: mockUser,
        req: { headers: { origin: "http://localhost:3000" } } as any,
        res: {} as any,
      });

      const result = await caller.getCurrentSubscription();
      expect(result).toBeNull();
      expect(getSubscriptionByUserId).toHaveBeenCalledWith(mockUser.id);
    });

    it("should return subscription when user has one", async () => {
      const mockUser = {
        id: 1,
        openId: "test-user",
        name: "Test User",
        email: "test@example.com",
        role: "user" as const,
        loginMethod: "manus",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };

      const mockSubscription = {
        id: 1,
        userId: 1,
        stripeSubscriptionId: "sub_123",
        stripeCustomerId: "cus_123",
        plan: "professional",
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        canceledAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(getSubscriptionByUserId).mockResolvedValue(mockSubscription);

      const caller = stripeRouter.createCaller({
        user: mockUser,
        req: { headers: { origin: "http://localhost:3000" } } as any,
        res: {} as any,
      });

      const result = await caller.getCurrentSubscription();
      expect(result).toEqual(mockSubscription);
      expect(getSubscriptionByUserId).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe("getPaymentHistory", () => {
    it("should return empty array when user has no payments", async () => {
      const mockUser = {
        id: 1,
        openId: "test-user",
        name: "Test User",
        email: "test@example.com",
        role: "user" as const,
        loginMethod: "manus",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };

      vi.mocked(getPaymentsByUserId).mockResolvedValue([]);

      const caller = stripeRouter.createCaller({
        user: mockUser,
        req: { headers: { origin: "http://localhost:3000" } } as any,
        res: {} as any,
      });

      const result = await caller.getPaymentHistory();
      expect(result).toEqual([]);
      expect(getPaymentsByUserId).toHaveBeenCalledWith(mockUser.id);
    });

    it("should return payment history when user has payments", async () => {
      const mockUser = {
        id: 1,
        openId: "test-user",
        name: "Test User",
        email: "test@example.com",
        role: "user" as const,
        loginMethod: "manus",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };

      const mockPayments = [
        {
          id: 1,
          userId: 1,
          stripePaymentIntentId: "pi_123",
          stripeInvoiceId: "in_123",
          amount: "199.00",
          currency: "USD",
          status: "succeeded",
          description: "Subscription payment",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          userId: 1,
          stripePaymentIntentId: "pi_456",
          stripeInvoiceId: "in_456",
          amount: "199.00",
          currency: "USD",
          status: "succeeded",
          description: "Subscription payment",
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      ];

      vi.mocked(getPaymentsByUserId).mockResolvedValue(mockPayments);

      const caller = stripeRouter.createCaller({
        user: mockUser,
        req: { headers: { origin: "http://localhost:3000" } } as any,
        res: {} as any,
      });

      const result = await caller.getPaymentHistory();
      expect(result).toEqual(mockPayments);
      expect(getPaymentsByUserId).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe("createCheckoutSession", () => {
    it("should create checkout session for authenticated user", async () => {
      const mockUser = {
        id: 1,
        openId: "test-user",
        name: "Test User",
        email: "test@example.com",
        role: "user" as const,
        loginMethod: "manus",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };

      const mockCheckoutUrl = "https://checkout.stripe.com/pay/cs_test_123";

      vi.mocked(createCheckoutSession).mockResolvedValue(mockCheckoutUrl);

      const caller = stripeRouter.createCaller({
        user: mockUser,
        req: { headers: { origin: "http://localhost:3000" } } as any,
        res: {} as any,
      });

      const result = await caller.createCheckoutSession({
        plan: "professional",
        billingCycle: "monthly",
      });

      expect(result.checkoutUrl).toBe(mockCheckoutUrl);
      expect(createCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser.id,
          userEmail: mockUser.email,
          userName: mockUser.name,
          plan: "professional",
          billingCycle: "monthly",
        })
      );
    });

    it("should throw error when user is not authenticated", async () => {
      const caller = stripeRouter.createCaller({
        user: null,
        req: { headers: { origin: "http://localhost:3000" } } as any,
        res: {} as any,
      });

      await expect(
        caller.createCheckoutSession({
          plan: "professional",
          billingCycle: "monthly",
        })
      ).rejects.toThrow("Please login (10001)");
    });
  });
});
