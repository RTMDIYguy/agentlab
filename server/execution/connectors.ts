/**
 * Dispatch connectors for human-gated actions (conversion plan Tier 2).
 *
 * A connector knows how to (a) validate a payload's shape and (b) perform the
 * real outbound call. Dispatch only ever happens after explicit human approval
 * (see server/actions/router.ts) — the connector layer itself is deliberately
 * dumb: no approval checks, just validated transport.
 *
 * Every connector returns an honest DispatchResult: `dispatched` only when the
 * external system actually accepted the payload, with the real external id.
 */

import { getDb } from "../db";
import { users } from "../schema";
import { eq } from "drizzle-orm";

export interface DispatchResult {
  ok: boolean;
  /** Real id from the external system (present only on success). */
  externalId?: string;
  externalUrl?: string;
  /** Real error from the external system on failure. */
  error?: string;
}

export interface ConnectorDef {
  name: string;
  label: string;
  description: string;
  /** Required top-level keys (string-valued) in the connector payload. */
  requiredKeys: string[];
  /** Optional keys; unknown keys are stripped — no silent payload invention. */
  optionalKeys: string[];
  dispatch: (payload: Record<string, unknown>) => Promise<DispatchResult>;
}

// ----------------------------------------------------------------- HubSpot ----

function getHubspotToken(): string {
  return (
    process.env.HUBSPOT_PAT ||
    process.env.HUBSPOT_ACCESS_TOKEN ||
    process.env.HUBSPOT_DEVELOPER_API_KEY ||
    process.env.HUBSPOT_API_KEY ||
    ""
  );
}

const HUBSPOT_CONTACTS_URL = "https://api.hubapi.com/crm/v3/objects/contacts";

/**
 * HubSpot contact upsert — the first dispatch connector (per Robert's decision;
 * see CC-2026-09-23-017 and the lead-handoff blueprint).
 *
 * Lookup by email (idProperty=email) then create or patch, so repeated
 * approvals for the same lead update instead of duplicating.
 */
async function dispatchHubSpotContactUpsert(
  payload: Record<string, unknown>
): Promise<DispatchResult> {
  const token = getHubspotToken();
  if (!token) {
    return {
      ok: false,
      error:
        "HUBSPOT_PAT not configured — add it in Settings → Integrations. Dispatch NOT sent.",
    };
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  try {
    const email = String(payload.email);
    const lookupRes = await fetch(
      `${HUBSPOT_CONTACTS_URL}/${encodeURIComponent(email)}/id-lookup?idProperty=email`,
      { headers }
    );

    let contactId: string | null = null;
    if (lookupRes.ok) {
      const body = (await lookupRes.json()) as { id?: string };
      contactId = body?.id ?? null;
    } else if (lookupRes.status !== 404) {
      return {
        ok: false,
        error: `HubSpot lookup failed (${lookupRes.status}): ${(await lookupRes.text()).slice(0, 300)}`,
      };
    }

    // Only pass properties the connector contract knows; strings only.
    const properties: Record<string, string> = {};
    for (const [k, v] of Object.entries(payload)) {
      if (v !== undefined && v !== null && typeof v !== "object") {
        properties[k] = String(v);
      }
    }
    const propertyKeys = Object.keys(properties);
    if (propertyKeys.length === 0) {
      return { ok: false, error: "Payload has no writable properties" };
    }

    const res = contactId
      ? await fetch(`${HUBSPOT_CONTACTS_URL}/${contactId}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ properties }),
        })
      : await fetch(HUBSPOT_CONTACTS_URL, {
          method: "POST",
          headers,
          body: JSON.stringify({ properties }),
        });

    if (!res.ok) {
      return {
        ok: false,
        error: `HubSpot upsert failed (${res.status}): ${(await res.text()).slice(0, 300)}`,
      };
    }

    const body = (await res.json()) as { id?: string; portalId?: number | string };
    const contactUrl = contactId
      ? `https://app.hubspot.com/contacts/${body?.portalId ?? "0"}/contact/${contactId}`
      : undefined;
    return {
      ok: true,
      externalId: body?.id,
      externalUrl: contactId ? contactUrl : undefined,
    };
  } catch (err: any) {
    return { ok: false, error: `HubSpot network error: ${err?.message ?? String(err)}` };
  }
}

// ----------------------------------------------------------------- registry ----

export const CONNECTORS: Record<string, ConnectorDef> = {
  hubspot_contact_upsert: {
    name: "hubspot_contact_upsert",
    label: "HubSpot Contact Upsert",
    description:
      "Creates or updates a HubSpot contact (dedupe on email). Properties follow the lead-handoff blueprint contract (server/hubspot/schema-map.ts).",
    requiredKeys: ["email"],
    optionalKeys: [
      "firstname",
      "lastname",
      "company",
      "phone",
      "agentlab_lead_id",
      "agentlab_source_channel",
      "agentlab_stated_challenge",
      "agentlab_intake_summary",
      "lifecyclestage",
    ],
    dispatch: dispatchHubSpotContactUpsert,
  },
};

export function listConnectors(): Array<Pick<ConnectorDef, "name" | "label" | "description" | "requiredKeys">> {
  return Object.values(CONNECTORS).map(({ name, label, description, requiredKeys }) => ({
    name,
    label,
    description,
    requiredKeys,
  }));
}

/**
 * Validates and strips a payload to the connector's known keys.
 * Unknown keys are rejected loudly rather than silently forwarded.
 */
export function validatePayloadForConnector(
  connectorName: string,
  payload: Record<string, unknown>
): { ok: true; cleaned: Record<string, unknown> } | { ok: false; error: string } {
  const def = CONNECTORS[connectorName];
  if (!def) return { ok: false, error: `Unknown connector: ${connectorName}` };

  for (const key of def.requiredKeys) {
    const v = payload[key];
    if (v === undefined || v === null || (typeof v === "string" && v.trim() === "")) {
      return { ok: false, error: `Missing required payload key "${key}" for ${connectorName}` };
    }
  }

  const allowed = new Set([...def.requiredKeys, ...def.optionalKeys]);
  const unknown = Object.keys(payload).filter((k) => !allowed.has(k));
  if (unknown.length > 0) {
    return {
      ok: false,
      error: `Payload contains keys not in the ${connectorName} contract: ${unknown.join(", ")}`,
    };
  }

  const cleaned: Record<string, unknown> = {};
  for (const k of Array.from(allowed)) {
    if (payload[k] !== undefined && payload[k] !== null) cleaned[k] = payload[k];
  }
  return { ok: true, cleaned };
}

// --------------------------------------------------------------------- SAIF ----

export interface SaifCheckResult {
  passed: boolean;
  reason?: string;
}

/**
 * SAIF-style safety gate on the outbound payload, evaluated at approval time:
 * secrets-looking strings, obviously dangerous instructions to external
 * systems, PII in fields that should not carry it, and payload size sanity.
 * This is a pre-dispatch tripwire, not a full compliance suite — it blocks
 * the clear failure classes before a human-approved payload leaves the OS.
 */
export function runSaifCheck(payload: Record<string, unknown>): SaifCheckResult {
  const serialized = JSON.stringify(payload).toLowerCase();

  // 1. Secrets must never ride in dispatch payloads
  const secretPatterns = [
    /bearer\s+[a-z0-9._-]{20,}/,
    /\b(sk|pk)-[a-z0-9]{20,}/,
    /api[_-]?key['"]?\s*[:=]\s*['"][a-z0-9._-]{16,}/,
    /private key/,
    /begin (rsa|ec) private key/,
  ];
  for (const p of secretPatterns) {
    if (p.test(serialized)) {
      return { passed: false, reason: `Payload appears to contain a credential matching /${p.source}/ — remove it before dispatch.` };
    }
  }

  // 2. Instruction-injection patterns aimed at external systems
  const injectionPatterns = [
    /ignore (all )?(previous|prior) instructions/,
    /disregard your (system )?prompt/,
    /you are now/,
  ];
  for (const p of injectionPatterns) {
    if (p.test(serialized)) {
      return { passed: false, reason: `Payload contains prompt-injection phrasing ("${p.source}") — refusing to dispatch.` };
    }
  }

  // 3. PII tripwires in fields that should not carry identity documents
  const piiInWrongField = ["notes", "summary", "title"];
  for (const field of piiInWrongField) {
    const v = payload[field];
    if (typeof v === "string") {
      if (/\b\d{3}-\d{2}-\d{4}\b/.test(v)) {
        return { passed: false, reason: `Field "${field}" looks like it contains an SSN — refusing to dispatch.` };
      }
      if (/\b(?:\d[ -]*?){13,16}\b/.test(v.replace(/\s+/g, "")) && /\d{13,}/.test(v.replace(/\D/g, ""))) {
        return { passed: false, reason: `Field "${field}" looks like it contains a card number — refusing to dispatch.` }
      }
    }
  }

  // 4. Size sanity
  if (serialized.length > 100_000) {
    return { passed: false, reason: "Payload exceeds 100KB — likely a runaway artifact; refusing to dispatch." };
  }

  return { passed: true };
}

/**
 * Resolves the workspace's HubSpot connectivity truthfully (used by the
 * actions router to show whether the connector can actually fire).
 */
export async function isHubSpotConfigured(): Promise<boolean> {
  return !!getHubspotToken();
}

/** Resolves a user id to an email for audit lines (never fabricates). */
export async function resolveUserEmail(userId: string): Promise<string | null> {
  try {
    const db = await getDb();
    if (!db) return null;
    const [row] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
    return row?.email ?? null;
  } catch {
    return null;
  }
}
