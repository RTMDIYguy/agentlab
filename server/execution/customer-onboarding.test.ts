import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

import { ingestCustomerPurchase } from "../controllers/fulfillment";

describe("Autonomous Customer Onboarding & Retention Swarm (FUL-01 / SAL-03)", () => {
  let req: any;
  let res: any;
  let statusMock: any;
  let jsonMock: any;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  it("rejects purchase ingestion if customer name, email, or product is missing", async () => {
    req = {
      body: {
        amount: 149,
        source: "stripe",
      },
    };

    await ingestCustomerPurchase(req, res);
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining("required") })
    );
  });

  it("successfully ingests purchase, generates onboarding blueprint with SHA-256 checksum, and enrolls in retention sequence", async () => {
    req = {
      body: {
        customerName: "Jessica Reynolds",
        customerEmail: "jessica@apexhealth.com",
        productPurchased: "Ownable OS Pro Membership",
        amount: 500,
        currency: "USD",
        source: "stripe",
        transactionId: "ch_3N9xKl2eZvKYlo2C",
        tier: "pro",
      },
      workspaceId: "test-workspace-id",
    };

    await ingestCustomerPurchase(req, res);
    expect(statusMock).toHaveBeenCalledWith(200);
    const data = jsonMock.mock.calls[0][0];

    expect(data.success).toBe(true);
    expect(data.status).toBe("provisioned_and_enrolled");
    expect(data.onboardingId).toContain("onb_");
    expect(data.transactionId).toBe("ch_3N9xKl2eZvKYlo2C");
    expect(data.checksum).toBeDefined();
    expect(data.preview).toContain("Customer Onboarding & Retention Blueprint");
  });
});
