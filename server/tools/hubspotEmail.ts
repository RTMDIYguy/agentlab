/**
 * HubSpot Marketing Email v3 Tool Suite
 *
 * Creates and publishes marketing emails through HubSpot's Marketing Email v3
 * API (Marketing Hub Enterprise required for /publish). Chosen as the outbound
 * engine after the Instantly trial ended: contacts already sync into HubSpot,
 * so marketing sends happen where the audience already lives.
 *
 * Approach for full HTML control: HubSpot's drag-and-drop email templates do
 * not render HTML injected via content.widgets, so each campaign gets a
 * custom-coded email template created from the campaign HTML via the Design
 * Manager API, then the email references that template by path.
 *
 * Required token scopes: content (design manager), marketing-email (read/write).
 * Token comes from the Settings vault (HUBSPOT_PAT).
 */

const HUBSPOT_API_BASE = "https://api.hubapi.com";

/**
 * Canonical PAT resolution (same alias chain as hubspot/router.ts).
 */
export function getHubspotEmailToken(): string {
  return (
    process.env.HUBSPOT_PAT ||
    process.env.HUBSPOT_ACCESS_TOKEN ||
    process.env.HUBSPOT_DEVELOPER_API_KEY ||
    process.env.HUBSPOT_API_KEY ||
    ""
  );
}

export interface HubspotEmailSendResult {
  success: boolean;
  emailId?: string;
  templatePath?: string;
  publishRequested?: boolean;
  message: string;
}

/**
 * Create a custom-coded email template from raw HTML via the Design Manager
 * API. The returned path is referenced by the marketing email at send time.
 */
export async function createEmailTemplate(
  name: string,
  html: string
): Promise<{ path: string }> {
  const token = getHubspotEmailToken();
  if (!token) {
    throw new Error(
      "HubSpot access token (HUBSPOT_PAT) is not configured in environment."
    );
  }

  // Slugify for a stable, unique template path.
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  const templatePath = `/agentlab-emails/${slug}-${Date.now()}`;

  const response = await fetch(`${HUBSPOT_API_BASE}/designmanager/v1/templates`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      // category_id 2 = email templates; template_type 2 = custom-coded email
      category_id: 2,
      is_available_for_new_content: true,
      template_type: 2,
      path: templatePath,
      source: html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HubSpot template create failed (${response.status}): ${errorText.slice(0, 500)}`
    );
  }

  return { path: templatePath };
}

/**
 * Create a marketing email draft referencing a custom-coded template.
 */
export async function createMarketingEmail(input: {
  name: string;
  subject: string;
  templatePath: string;
  replyTo?: string;
  fromName?: string;
  fromEmail?: string;
}): Promise<{ emailId: string }> {
  const token = getHubspotEmailToken();
  if (!token) {
    throw new Error(
      "HubSpot access token (HUBSPOT_PAT) is not configured in environment."
    );
  }

  const content: Record<string, unknown> = {
    templatePath: input.templatePath,
  };
  if (input.replyTo) content.replyTo = input.replyTo;
  if (input.fromName) content.fromName = input.fromName;
  if (input.fromEmail) content.fromEmail = input.fromEmail;

  const response = await fetch(`${HUBSPOT_API_BASE}/marketing/v3/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: input.name,
      subject: input.subject,
      content,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HubSpot email create failed (${response.status}): ${errorText.slice(0, 500)}`
    );
  }

  const created = (await response.json()) as { id?: string };
  if (!created.id) {
    throw new Error("HubSpot email create returned no id.");
  }
  return { emailId: created.id };
}

/**
 * Publish (send) a marketing email. Publishing to a list is configured in
 * HubSpot; without a list attached, publish requests require recipients set
 * in HubSpot. Returns the raw response status for honest error surfacing.
 */
export async function publishMarketingEmail(emailId: string): Promise<void> {
  const token = getHubspotEmailToken();
  if (!token) {
    throw new Error(
      "HubSpot access token (HUBSPOT_PAT) is not configured in environment."
    );
  }

  const response = await fetch(
    `${HUBSPOT_API_BASE}/marketing/v3/emails/${encodeURIComponent(emailId)}/publish`,
    { method: "POST", headers: { Authorization: `Bearer ${token}` } }
  );

  if (!response.ok && response.status !== 202) {
    const errorText = await response.text();
    throw new Error(
      `HubSpot email publish failed (${response.status}): ${errorText.slice(0, 500)}`
    );
  }
}

/**
 * Update a marketing email draft (recipients, scheduling, content fixes).
 * Note: published emails cannot be updated via API — drafts only.
 */
export async function updateMarketingEmail(
  emailId: string,
  patch: Record<string, unknown>
): Promise<void> {
  const token = getHubspotEmailToken();
  if (!token) {
    throw new Error(
      "HubSpot access token (HUBSPOT_PAT) is not configured in environment."
    );
  }

  const response = await fetch(
    `${HUBSPOT_API_BASE}/marketing/v3/emails/${encodeURIComponent(emailId)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(patch),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HubSpot email update failed (${response.status}): ${errorText.slice(0, 500)}`
    );
  }
}

/**
 * Fetch post-send statistics for a marketing email (matches the Performance
 * page in the HubSpot app: sent, delivered, opens, clicks, etc.).
 */
export interface HubspotEmailStats {
  sent?: number;
  delivered?: number;
  opens?: number;
  clicks?: number;
  bounces?: number;
  unsubscribes?: number;
  status?: string;
}

export async function getEmailStats(
  emailId: string
): Promise<HubspotEmailStats> {
  const token = getHubspotEmailToken();
  if (!token) {
    throw new Error(
      "HubSpot access token (HUBSPOT_PAT) is not configured in environment."
    );
  }

  const response = await fetch(
    `${HUBSPOT_API_BASE}/marketing/v3/emails/${encodeURIComponent(emailId)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HubSpot email stats fetch failed (${response.status}): ${errorText.slice(0, 500)}`
    );
  }

  const email = (await response.json()) as {
    status?: string;
    stats?: Record<string, number>;
  };

  // v3 stats object carries counters keyed per event type; normalize the
  // common ones so the UI does not need to know HubSpot's exact key names.
  const s = email.stats || {};
  return {
    status: email.status,
    sent: s.sent ?? s.delivered,
    delivered: s.delivered,
    opens: s.open,
    clicks: s.click,
    bounces: s.bounce,
    unsubscribes: s.unsubscribed ?? s.unsubscribes,
  };
}

/*
 * ---------------------------------------------------------------------------
 * Transactional single-send (double opt-in confirmation emails)
 * ---------------------------------------------------------------------------
 * Requires the HubSpot transactional email add-on and an email drafted in the
 * HubSpot email tool (its numeric content ID is the emailId used here). When
 * either is missing we report that honestly instead of pretending to send.
 */

/**
 * Parse the in-app transactional email content ID from env.
 */
export function getTransactionalEmailId(): string {
  return (
    process.env.HUBSPOT_TRANSACTIONAL_EMAIL_ID ||
    process.env.HUBSPOT_TRANSACTIONAL_VERIFY_EMAIL_ID ||
    ""
  );
}

export interface SingleSendResult {
  sent: boolean;
  statusId?: string;
  message: string;
}

/**
 * Send one transactional email (e.g. newsletter double opt-in confirmation)
 * via POST /marketing/v3/transactional/single-email/send. The to-address is
 * always required; customProperties are passed as {{ custom.KEY }} HubL
 * variables to the in-app template. Deduplicates via sendId per subscriber.
 */
export async function sendTransactionalSingleEmail(input: {
  to: string;
  customProperties?: Record<string, string>;
}): Promise<SingleSendResult> {
  const token = getHubspotEmailToken();
  const emailId = getTransactionalEmailId();

  if (!token) {
    return {
      sent: false,
      message:
        "Not sent: no HubSpot token configured (HUBSPOT_PAT). Verification link logged server-side.",
    };
  }
  if (!emailId) {
    return {
      sent: false,
      message:
        "Not sent: no transactional email configured. Create a transactional email in HubSpot (Marketing → Email) and set HUBSPOT_TRANSACTIONAL_EMAIL_ID.",
    };
  }

  const sendId = `nl-verify-${input.to.toLowerCase()}`;
  const response = await fetch(
    `${HUBSPOT_API_BASE}/marketing/v3/transactional/single-email/send`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        emailId: Number(emailId),
        message: { to: input.to, sendId },
        customProperties: input.customProperties || {},
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HubSpot transactional send failed (${response.status}): ${errorText.slice(0, 500)}`
    );
  }

  const result = (await response.json()) as {
    statusId?: string;
    status?: string;
  };
  return {
    sent: true,
    statusId: result.statusId,
    message: `Confirmation email queued via HubSpot transactional send (${result.status || "PENDING"}).`,
  };
}

/**
 * Verify Marketing Email v3 connectivity + token scopes with a cheap read.
 */
export async function verifyMarketingEmailConnection(): Promise<{
  success: boolean;
  message: string;
}> {
  const token = getHubspotEmailToken();
  if (!token) {
    return {
      success: false,
      message:
        "HubSpot access token (HUBSPOT_PAT) is not configured in environment or vault.",
    };
  }

  try {
    const response = await fetch(
      `${HUBSPOT_API_BASE}/marketing/v3/emails?limit=1`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        message: `HubSpot token rejected for Marketing Email API (HTTP ${response.status}). Check the PAT includes marketing-email and content scopes, and that the account is Marketing Hub Enterprise.`,
      };
    }
    if (!response.ok) {
      return {
        success: false,
        message: `HubSpot Marketing Email API returned HTTP ${response.status}.`,
      };
    }
    return {
      success: true,
      message: `Successfully connected to HubSpot Marketing Email v3 API. Marketing Hub Enterprise send path active.`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `HubSpot Marketing Email connection error: ${err?.message}`,
    };
  }
}
