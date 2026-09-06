import { Request, Response } from "express";
import {
  verifyInstantlyConnection,
  listInstantlyCampaigns,
  addLeadToCampaign,
  processInstantlyWebhook,
  InstantlyLeadPayload,
  InstantlyWebhookEvent,
} from "../tools/instantly";

/**
 * Check Instantly API connectivity
 */
export async function handleInstantlyVerify(_req: Request, res: Response) {
  try {
    const result = await verifyInstantlyConnection();
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * List campaigns from Instantly
 */
export async function handleInstantlyListCampaigns(req: Request, res: Response) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;
    const campaigns = await listInstantlyCampaigns(limit, skip);
    return res.status(200).json({ success: true, count: campaigns.length, campaigns });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Enroll a lead into an Instantly campaign
 */
export async function handleInstantlyEnrollLead(req: Request, res: Response) {
  try {
    const { campaignId, email, firstName, lastName, companyName, phone, customVariables } = req.body;

    if (!campaignId || !email) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: campaignId and email are required.",
      });
    }

    const payload: InstantlyLeadPayload = {
      email,
      firstName,
      lastName,
      companyName,
      phone,
      customVariables,
    };

    const result = await addLeadToCampaign(campaignId, payload);
    return res.status(200).json({
      success: true,
      message: `Lead ${email} enrolled into Instantly campaign ${campaignId}.`,
      result,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Instantly Webhook Receiver
 * Triggered on positive reply, link click, or lead interested event
 */
export async function handleInstantlyWebhook(req: Request, res: Response) {
  try {
    const event: InstantlyWebhookEvent = req.body;

    if (!event || !event.lead_email) {
      return res.status(400).json({
        success: false,
        error: "Invalid webhook payload: lead_email is required.",
      });
    }

    const processed = processInstantlyWebhook(event);

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      processed,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
