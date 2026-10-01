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
import { mapDraftToHubSpotProperties } from "../hubspot/schema-map";
import {
  createEmailTemplate,
  createMarketingEmail,
  publishMarketingEmail,
} from "../tools/hubspotEmail";
import { eq } from "drizzle-orm";

/**
 * Lazy import guard: the MCP client stack is only loaded when an mcp_tool_call
 * dispatch actually runs, so MCP plumbing never sits on the hot path of the
 * established connectors.
 */
type McpCallOutcome = { ok: boolean; externalId?: string; error?: string; result?: unknown };
async function dispatchMcpToolCall(payload: Record<string, unknown>): Promise<McpCallOutcome> {
  const mod = await import("./mcp-tool-bridge");
  return mod.dispatchMcpToolCall(payload);
}

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

    // Translate the draft onto the blueprint contract (2026-09-28,
    // CC-2026-09-25-014): the drafter is not taught the HubSpot property
    // list, so the connector maps informal keys to their contract homes and
    // preserves unmatched approved signal in agentlab_intake_summary.
    // Nothing invented, nothing silently dropped.
    const properties = mapDraftToHubSpotProperties(payload);
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

// ------------------------------------------------- HubSpot marketing email ----

/**
 * HubSpot marketing email connector (2026-09-28; outbound channel after the
 * Instantly trial ended — Marketing Hub Enterprise owns delivery, tracking,
 * and compliance where the contacts already live).
 *
 * Contract: builds a custom-coded email template from the draft HTML via the
 * Design Manager, creates the marketing email draft, and (optionally)
 * requests an API publish. Without a recipient list attached in HubSpot, the
 * API publish is refused by HubSpot — the honest outcome surfaces as a real
 * error; the draft always remains in HubSpot for human send/scheduling.
 * Required PAT scopes: content, marketing-email read/write (probed 403
 * 2026-09-28 — grant pending; the connector reports it honestly).
 */
async function dispatchHubSpotMarketingEmail(
  payload: Record<string, unknown>
): Promise<DispatchResult> {
  try {
    const name = String(payload.name || "AgentLab outreach");
    // Transparent 1:1 labeling: the target and event travel in the email NAME
    // so a human sees exactly who this draft is for inside HubSpot. This does
    // NOT send to the address — recipients are attached in HubSpot.
    const labelBits: string[] = [];
    if (payload.to_email) labelBits.push(String(payload.to_email));
    if (payload.event_id) labelBits.push(String(payload.event_id));
    const emailName = labelBits.length > 0 ? `${name} [${labelBits.join(" | ")}]` : name;

    const template = await createEmailTemplate(emailName, String(payload.html));
    const { emailId } = await createMarketingEmail({
      name: emailName,
      subject: String(payload.subject),
      templatePath: template.path,
      fromName: payload.from_name ? String(payload.from_name) : undefined,
      fromEmail: payload.from_email ? String(payload.from_email) : undefined,
      replyTo: payload.reply_to ? String(payload.reply_to) : undefined,
    });

    if (payload.publish === true) {
      await publishMarketingEmail(emailId);
      return { ok: true, externalId: emailId };
    }

    return { ok: true, externalId: emailId };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? String(err) };
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
      // Informal drafter keys the blueprint mapper understands (2026-09-28,
      // CC-2026-09-25-014): translated to contract homes or folded into
      // agentlab_intake_summary. Anything outside this list still fails
      // validation loudly.
      "notes",
      "event_id",
      "event_name",
      "deal_stage",
      "deal_value_usd",
      "service_line",
      "next_steps",
      "lead_source",
      "profit_engine_link",
      "engagement_score",
    ],
    dispatch: dispatchHubSpotContactUpsert,
  },
  hubspot_marketing_email: {
    name: "hubspot_marketing_email",
    label: "HubSpot Marketing Email",
    description:
      "Creates a HubSpot marketing email (custom-coded template from the draft HTML; Marketing Hub Enterprise). Recipients/scheduling are attached in HubSpot; publish:true attempts the API publish. Delivery and open/click tracking live natively in HubSpot.",
    requiredKeys: ["name", "subject", "html"],
    optionalKeys: [
      "from_name",
      "from_email",
      "reply_to",
      "publish",
      "list_id",
      "to_email",
      "event_id",
    ],
    dispatch: dispatchHubSpotMarketingEmail,
  },
  mcp_tool_call: {
    name: "mcp_tool_call",
    label: "MCP Tool Call",
    description:
      "Calls one tool on a connected MCP server through the OS's MCP runtime client (CC-2026-10-01-007). The payload names the integration (as registered in Settings), the tool, and its arguments; the bearer token resolves through the vault round-trip. Requires the integration to be connected first.",
    requiredKeys: ["server", "tool", "arguments"],
    optionalKeys: [],
    dispatch: dispatchMcpToolCall,
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
