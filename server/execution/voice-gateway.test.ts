import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

import {
  buildPamelaOutboundScript,
} from "../tools/elevenlabs-voice";
import {
  getAvailableVoiceSlots,
  bookVoiceAppointment,
  handleVoiceCallWebhook,
  dispatchOutboundVoiceCall,
} from "../controllers/voice";

describe("Conversational Voice Agents Gateway (Pamela & ElevenLabs)", () => {
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

  describe("Pamela Outbound Script Generation", () => {
    it("generates CRE outreach script with company and target context", () => {
      const script = buildPamelaOutboundScript({
        leadName: "Marcus Vance",
        companyName: "Vance Commercial Realty",
        campaignType: "CRE",
      });

      expect(script).toContain("Marcus Vance");
      expect(script).toContain("Vance Commercial Realty");
      expect(script).toContain("Commercial Real Estate Practice");
      expect(script).toContain("AI Expansion Radar");
    });

    it("generates MedSpa outreach script with aesthetics practice context", () => {
      const script = buildPamelaOutboundScript({
        leadName: "Dr. Elena Ramos",
        companyName: "Luxe Aesthetics",
        campaignType: "MedSpa",
      });

      expect(script).toContain("Dr. Elena Ramos");
      expect(script).toContain("Luxe Aesthetics");
      expect(script).toContain("HIPAA-compliant AI booking assistant");
    });

    it("generates Founder Signal System script as default", () => {
      const script = buildPamelaOutboundScript({
        leadName: "Alex Turner",
        campaignType: "FounderSignal",
      });

      expect(script).toContain("Alex Turner");
      expect(script).toContain("Founder Signal System sprint booking");
    });
  });

  describe("Real-time Slot Availability", () => {
    it("returns available diagnostic booking slots", async () => {
      req = {};
      await getAvailableVoiceSlots(req, res);

      expect(statusMock).toHaveBeenCalledWith(200);
      const data = jsonMock.mock.calls[0][0];
      expect(data.available).toBe(true);
      expect(Array.isArray(data.slots)).toBe(true);
      expect(data.slots.length).toBeGreaterThanOrEqual(4);
      expect(data.humanHost).toContain("Robert M.");
    });
  });

  describe("Mid-Call Booking Endpoint", () => {
    it("rejects booking if callerPhone or scheduledSlot is missing", async () => {
      req = {
        body: {
          callerName: "John Doe",
        },
      };

      await bookVoiceAppointment(req, res);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining("required") })
      );
    });

    it("successfully confirms mid-call booking and generates reference ID", async () => {
      req = {
        body: {
          callerName: "David Miller",
          callerPhone: "+17025550199",
          callerEmail: "david@heritage-realty.com",
          serviceInterest: "CRE",
          scheduledSlot: "2026-09-10T14:00:00.000Z",
        },
      };

      await bookVoiceAppointment(req, res);
      expect(statusMock).toHaveBeenCalledWith(200);
      const data = jsonMock.mock.calls[0][0];
      expect(data.success).toBe(true);
      expect(data.status).toBe("confirmed");
      expect(data.bookingRef).toContain("VBK-");
    });
  });

  describe("Post-Call Webhook Ingest", () => {
    it("rejects payload without callId", async () => {
      req = { body: {} };
      await handleVoiceCallWebhook(req, res);
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it("ingests call transcript, sentiment, and audit logs successfully", async () => {
      req = {
        body: {
          callId: "call_eleven_98234",
          callerNumber: "+17025550199",
          durationSeconds: 142,
          transcript: "Caller requested diagnostic review for multi-tenant retail expansion.",
          sentiment: "positive",
          disposition: "booked",
          summary: "Confirmed 15-minute diagnostic slot on Thursday at 2pm.",
        },
      };

      await handleVoiceCallWebhook(req, res);
      expect(statusMock).toHaveBeenCalledWith(200);
      const data = jsonMock.mock.calls[0][0];
      expect(data.received).toBe(true);
      expect(data.callId).toBe("call_eleven_98234");
      expect(data.crmStatus).toBe("logged_to_vault");
    });
  });

  describe("Outbound Voice Call Dispatch", () => {
    it("rejects dispatch without recipientPhone", async () => {
      req = { body: { campaignType: "CRE" } };
      await dispatchOutboundVoiceCall(req, res);
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it("dispatches outbound call queue with synthesized Pamela prompt", async () => {
      req = {
        body: {
          recipientPhone: "+17025550188",
          leadName: "Sarah Connor",
          companyName: "Nevada MedSpa Group",
          campaignType: "MedSpa",
        },
      };

      await dispatchOutboundVoiceCall(req, res);
      expect(statusMock).toHaveBeenCalledWith(200);
      const data = jsonMock.mock.calls[0][0];
      expect(data.success).toBe(true);
      expect(data.status).toBe("queued");
      expect(data.dispatchId).toContain("VOUT-");
      expect(data.scriptPrompt).toContain("Sarah Connor");
      expect(data.agentAssigned).toContain("Pamela");
    });
  });
});
