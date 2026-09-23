/**
 * Best-effort HubSpot sync for contact submissions.
 *
 * Doctrine: the lead is durable in the DB the moment it is captured. HubSpot
 * sync is a best-effort leg — a sync failure never fails the capture, but it
 * is always *logged honestly* (outcome, http status, HubSpot error body) so
 * nothing silently pretends to have synced.
 */

import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { contactSubmissions, hubspotSyncLog } from "../schema";
import {
  extractHubSpotPropertyErrors,
  mapSubmissionToHubSpotProperties,
  type ContactSubmissionLike,
} from "./schema-map";

const HUBSPOT_CONTACTS_URL = "https://api.hubapi.com/crm/v3/objects/contacts";

function getHubspotToken(): string {
  return (
    process.env.HUBSPOT_PAT ||
    process.env.HUBSPOT_ACCESS_TOKEN ||
    process.env.HUBSPOT_DEVELOPER_API_KEY ||
    process.env.HUBSPOT_API_KEY ||
    ""
  );
}

export interface SyncOutcome {
  outcome: "synced" | "skipped_no_token" | "error";
  hubspotContactId: string | null;
  httpStatus: number | null;
  errorMessage: string | null;
}

export async function upsertContactByEmail(
  properties: Record<string, string>
): Promise<SyncOutcome> {
  const token = getHubspotToken();
  if (!token) {
    return {
      outcome: "skipped_no_token",
      hubspotContactId: null,
      httpStatus: null,
      errorMessage:
        "HUBSPOT_PAT not configured — add it in Settings → Integrations. Lead stored locally; not synced.",
    };
  }

  const email = properties.email;
  const authHeaders = { Authorization: `Bearer ${token}` };

  try {
    // 1. Look up existing contact by email (create-or-update contract)
    const lookupRes = await fetch(
      `${HUBSPOT_CONTACTS_URL}/${encodeURIComponent(email)}/id-lookup?idProperty=email`,
      { headers: { ...authHeaders } }
    );

    let contactId: string | null = null;
    if (lookupRes.ok) {
      const body = (await lookupRes.json()) as { id?: string };
      contactId = body?.id ?? null;
    } else if (lookupRes.status !== 404) {
      const bodyText = await lookupRes.text();
      return {
        outcome: "error",
        hubspotContactId: null,
        httpStatus: lookupRes.status,
        errorMessage: `Lookup failed (${lookupRes.status}): ${bodyText.slice(0, 400)}`,
      };
    }

    // 2. Create or patch
    const res = contactId
      ? await fetch(`${HUBSPOT_CONTACTS_URL}/${contactId}`, {
          method: "PATCH",
          headers: { ...authHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({ properties }),
        })
      : await fetch(HUBSPOT_CONTACTS_URL, {
          method: "POST",
          headers: { ...authHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({ properties }),
        });

    if (res.ok) {
      const body = (await res.json()) as { id?: string };
      return {
        outcome: "synced",
        hubspotContactId: body?.id ?? null,
        httpStatus: res.status,
        errorMessage: null,
      };
    }

    const bodyText = await res.text();
    const propErrors = extractHubSpotPropertyErrors(bodyText);
    return {
      outcome: "error",
      hubspotContactId: null,
      httpStatus: res.status,
      errorMessage:
        propErrors.length > 0
          ? `HubSpot rejected properties (are custom properties created in the portal?): ${propErrors.join("; ")}`
          : `Upsert failed (${res.status}): ${bodyText.slice(0, 400)}`,
    };
  } catch (err: any) {
    return {
      outcome: "error",
      hubspotContactId: null,
      httpStatus: null,
      errorMessage: `Network error: ${err?.message ?? String(err)}`,
    };
  }
}

/**
 * Syncs one submission and writes an honest outcome row to hubspot_sync_log,
 * then flips the submission to `synced` only on a real HubSpot confirmation.
 */
export async function syncContactSubmission(
  submission: ContactSubmissionLike & { id?: string }
): Promise<SyncOutcome> {
  const db = await getDb();
  if (!db) {
    return {
      outcome: "error",
      hubspotContactId: null,
      httpStatus: null,
      errorMessage: "Database unavailable — sync not attempted",
    };
  }

  const properties = mapSubmissionToHubSpotProperties(submission);
  const result = await upsertContactByEmail(properties);

  // Durable, honest outcome log — written for every attempt, success or not.
  try {
    await db.insert(hubspotSyncLog).values({
      submissionId: submission.id ?? null,
      email: submission.email.toLowerCase(),
      outcome: result.outcome,
      hubspotContactId: result.hubspotContactId,
      httpStatus: result.httpStatus,
      errorMessage: result.errorMessage,
      propertiesPayload: JSON.stringify(properties),
    });
  } catch (logErr: any) {
    console.error("[HubSpot Sync] Failed to write sync log:", logErr?.message);
  }

  if (result.outcome === "synced" && submission.id) {
    try {
      await db
        .update(contactSubmissions)
        .set({ status: "synced", crmSyncedAt: new Date() })
        .where(eq(contactSubmissions.id, submission.id));
    } catch (err: any) {
      console.error("[HubSpot Sync] Failed to update submission status:", err?.message);
    }
  }

  return result;
}
