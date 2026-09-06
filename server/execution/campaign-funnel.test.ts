import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

import { dispatchCreBrief, dispatchMedSpaDiagnostic, bookFounderSprint } from "../controllers/campaigns";

describe("Campaign Outreach (SAL-01) & Founder Signal Funnel", () => {
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

  describe("Nevada CRE Campaign Outreach (SAL-01)", () => {
    it("rejects invalid submission missing name or email", async () => {
      req = {
        body: {
          firm: "CBRE Las Vegas",
          territory: "Southern Nevada"
        }
      };

      await dispatchCreBrief(req, res);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Name and email are required" });
    });

    it("generates a 1-page off-market expansion brief with verifiable checksum and SAL-01 signals", async () => {
      req = {
        body: {
          name: "David Miller",
          email: "david@heritage-realty.com",
          firm: "Heritage Realty & Industrial",
          territory: "Henderson West Technology Corridor",
          notes: "Looking for 25k RSF cleanroom spec space"
        },
        workspaceId: "test-workspace"
      };

      await dispatchCreBrief(req, res);
      expect(statusMock).toHaveBeenCalledWith(200);
      const responseData = jsonMock.mock.calls[0][0];
      
      expect(responseData.success).toBe(true);
      expect(responseData.briefId).toContain("cre-brief-");
      expect(responseData.title).toContain("Heritage Realty & Industrial");
      expect(responseData.territory).toBe("Henderson West Technology Corridor");
      expect(responseData.checksum).toBeDefined();
      expect(responseData.preview).toContain("Off-Market Tenant Expansion Signal Brief");
    });
  });

  describe("MedSpa Speed-to-Lead Diagnostic (SAL-01)", () => {
    it("rejects invalid submission missing practice email", async () => {
      req = {
        body: {
          name: "Dr. Shannon Pearson",
          practiceName: "Pearson Aesthetics"
        }
      };

      await dispatchMedSpaDiagnostic(req, res);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Name and email are required" });
    });

    it("calculates response decay rate, recovered monthly revenue, and generates patient flow blueprint", async () => {
      req = {
        body: {
          name: "Dr. Shannon Pearson",
          email: "shannon@pearsonmedspa.com",
          practiceName: "Pearson Aesthetics & MedSpa",
          monthlyInquiries: "150–300 leads/mo",
          phone: "702-555-0199"
        },
        workspaceId: "test-workspace"
      };

      await dispatchMedSpaDiagnostic(req, res);
      expect(statusMock).toHaveBeenCalledWith(200);
      const responseData = jsonMock.mock.calls[0][0];

      expect(responseData.success).toBe(true);
      expect(responseData.diagnosticId).toContain("medspa-diag-");
      expect(responseData.practiceName).toBe("Pearson Aesthetics & MedSpa");
      expect(responseData.recoveredRevenueEst).toBeDefined();
      expect(responseData.preview).toContain("MedSpa Speed-to-Lead & Patient Flow Blueprint");
      expect(responseData.checksum).toBeDefined();
    });
  });

  describe("Founder Signal System 5-Day Sprint Booking", () => {
    it("rejects booking without founder contact information", async () => {
      req = {
        body: {
          company: "Tactix Agency",
          icp: "Solo founders"
        }
      };

      await bookFounderSprint(req, res);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Name and email are required" });
    });

    it("books 5-day sprint diagnostic and generates intake profile under SAL-01", async () => {
      req = {
        body: {
          name: "Robert McCarthy",
          email: "robert@uncle-robert.com",
          company: "Tactix & Uncle Robert Consulting",
          icp: "B2B Founders & Small Business Operators",
          primaryGoal: "Validate core messaging and deploy first 3 autonomous workflows"
        },
        workspaceId: "test-workspace"
      };

      await bookFounderSprint(req, res);
      expect(statusMock).toHaveBeenCalledWith(200);
      const responseData = jsonMock.mock.calls[0][0];

      expect(responseData.success).toBe(true);
      expect(responseData.sprintId).toContain("sprint-intake-");
      expect(responseData.scheduledReview).toBe("Within 24 Hours");
      expect(responseData.dossierPreview).toContain("Founder Signal System 5-Day Sprint Intake");
      expect(responseData.checksum).toBeDefined();
    });
  });
});
