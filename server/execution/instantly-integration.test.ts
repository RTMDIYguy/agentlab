import { describe, it, expect } from "vitest";
import { processInstantlyWebhook, getInstantlyApiKey, verifyInstantlyConnection } from "../tools/instantly";

describe("Instantly.ai Outbound Engine & Webhook Suite", () => {
  it("retrieves the configured INSTANTLY_API_KEY from environment", () => {
    const apiKey = getInstantlyApiKey();
    expect(apiKey).toBeDefined();
    expect(apiKey).toContain("YmYxNmQ3OGMtNmI4MS00MjViLTlkNDUtZjVkMTQ5NzUyYTJj");
  });

  it("classifies positive founder replies as hot leads for immediate diagnostic booking", () => {
    const hotReply = processInstantlyWebhook({
      event_type: "reply_received",
      campaign_id: "camp_12345",
      campaign_name: "Founder M365 Modernization Q3",
      lead_email: "ceo@acmegroup.com",
      lead_first_name: "Alex",
      company_name: "Acme Group",
      reply_text: "Hey Robert, this looks very interesting. Let's schedule a 15-min diagnostic call this Thursday.",
      timestamp: new Date().toISOString(),
    });

    expect(hotReply.isHotLead).toBe(true);
    expect(hotReply.actionTaken).toBe("flagged_hot_lead");
    expect(hotReply.leadEmail).toBe("ceo@acmegroup.com");
    expect(hotReply.summary).toContain("Hot Outbound Lead detected");
  });

  it("handles lead_interested explicit webhook events", () => {
    const interestedEvent = processInstantlyWebhook({
      event_type: "lead_interested",
      campaign_id: "camp_9876",
      campaign_name: "CRE Expansion Radar",
      lead_email: "broker@apexcommercial.com",
      lead_first_name: "Sarah",
      company_name: "Apex Commercial",
    });

    expect(interestedEvent.isHotLead).toBe(true);
    expect(interestedEvent.actionTaken).toBe("flagged_hot_lead");
    expect(interestedEvent.leadEmail).toBe("broker@apexcommercial.com");
  });

  it("logs standard engagement events without triggering false positive alerts", () => {
    const openEvent = processInstantlyWebhook({
      event_type: "email_opened",
      lead_email: "contact@prospect.com",
    });

    expect(openEvent.isHotLead).toBe(false);
    expect(openEvent.actionTaken).toBe("logged_activity");
  });
});
