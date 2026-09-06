/**
 * Instantly.ai Tool & Integration Suite
 * 
 * Provides automated campaign listing, lead enrollment, API key validation,
 * and webhook event ingestion (handling positive replies, meeting bookings, and lead interest).
 */

export interface InstantlyLeadPayload {
  email: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  phone?: string;
  website?: string;
  customVariables?: Record<string, string | number | boolean>;
}

export interface InstantlyWebhookEvent {
  event_type: "reply_received" | "lead_interested" | "lead_not_interested" | "email_sent" | "email_opened" | "link_clicked";
  campaign_id?: string;
  campaign_name?: string;
  lead_email: string;
  lead_first_name?: string;
  lead_last_name?: string;
  company_name?: string;
  reply_text?: string;
  timestamp?: string;
}

const INSTANTLY_BASE_URL = "https://api.instantly.ai/api/v1";

/**
 * Get the configured Instantly API key
 */
export function getInstantlyApiKey(): string {
  const apiKey = process.env.INSTANTLY_API_KEY;
  if (!apiKey) {
    throw new Error("INSTANTLY_API_KEY is not configured in environment.");
  }
  return apiKey;
}

/**
 * Verify connectivity and authentication with Instantly API
 */
export async function verifyInstantlyConnection(): Promise<{ success: boolean; message: string; campaignCount?: number }> {
  try {
    const apiKey = getInstantlyApiKey();
    // Instantly v1 /authenticate or /campaign/list check
    const response = await fetch(`${INSTANTLY_BASE_URL}/campaign/list?api_key=${encodeURIComponent(apiKey)}&limit=1`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        message: `Instantly API responded with status ${response.status}: ${errorText}`,
      };
    }

    const data = await response.json();
    const count = Array.isArray(data) ? data.length : (data.campaigns ? data.campaigns.length : 0);
    return {
      success: true,
      message: "Instantly.ai connected successfully. Authentication and permissions verified.",
      campaignCount: count,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to connect to Instantly: ${err.message}`,
    };
  }
}

/**
 * List campaigns from Instantly.ai
 */
export async function listInstantlyCampaigns(limit = 10, skip = 0): Promise<any[]> {
  const apiKey = getInstantlyApiKey();
  const response = await fetch(
    `${INSTANTLY_BASE_URL}/campaign/list?api_key=${encodeURIComponent(apiKey)}&limit=${limit}&skip=${skip}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Instantly campaign list failed (${response.status}): ${await response.text()}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data.campaigns || [];
}

/**
 * Add a lead to an Instantly campaign
 */
export async function addLeadToCampaign(campaignId: string, lead: InstantlyLeadPayload): Promise<{ success: boolean; data: any }> {
  const apiKey = getInstantlyApiKey();
  const response = await fetch(`${INSTANTLY_BASE_URL}/lead/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      api_key: apiKey,
      campaign_id: campaignId,
      skip_if_in_workspace: true,
      leads: [
        {
          email: lead.email,
          first_name: lead.firstName || "",
          last_name: lead.lastName || "",
          company_name: lead.companyName || "",
          phone: lead.phone || "",
          website: lead.website || "",
          custom_variables: lead.customVariables || {},
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Instantly lead addition failed (${response.status}): ${await response.text()}`);
  }

  const data = await response.json();
  return { success: true, data };
}

/**
 * Process inbound Instantly Webhook Event (e.g., positive reply, interest detected)
 */
export function processInstantlyWebhook(event: InstantlyWebhookEvent): {
  actionTaken: "booked_diagnostic" | "flagged_hot_lead" | "logged_activity" | "nurture";
  leadEmail: string;
  summary: string;
  isHotLead: boolean;
} {
  const isInterested =
    event.event_type === "lead_interested" ||
    (event.event_type === "reply_received" &&
      event.reply_text &&
      /interested|yes|schedule|calendar|call|diagnostic|demo|pricing|talk/i.test(event.reply_text));

  if (isInterested) {
    return {
      actionTaken: "flagged_hot_lead",
      leadEmail: event.lead_email,
      summary: `Hot Outbound Lead detected via Instantly. Campaign: ${event.campaign_name || "Outbound"}. Reply snippet: "${(event.reply_text || "").substring(0, 100)}"`,
      isHotLead: true,
    };
  }

  return {
    actionTaken: "logged_activity",
    leadEmail: event.lead_email,
    summary: `Instantly activity logged (${event.event_type}) for ${event.lead_email}.`,
    isHotLead: false,
  };
}
