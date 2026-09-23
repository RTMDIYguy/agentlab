#!/usr/bin/env node
/**
 * HubSpot portal setup for the Agent Lab OS lead handoff.
 *
 * Creates the property groups and contact properties defined in
 * server/hubspot/schema-map.ts (from the "Agent Lab OS to HubSpot Lead
 * Handoff Blueprint", 2026-09-23) so the OS's lead sync is accepted by the
 * portal. Idempotent: an existing property (HTTP 409) counts as success.
 *
 * Usage:
 *   node scripts/hubspot-setup-properties.mjs           # dry run: prints the plan
 *   node scripts/hubspot-setup-properties.mjs --apply   # actually create
 *
 * Requires HUBSPOT_PAT in the environment (or .env.local at repo root).
 * Use a private-app token with these scopes:
 *   - crm.objects.contacts.write   (lead upserts)
 *   - crm.schemas.custom.write     (creating the property groups/properties)
 */

import { readFileSync, existsSync } from "fs";

// --- load .env.local if present (same priority rules as server/_core/env.ts) ---
const envCandidates = [".env.local", ".env"];
for (const p of envCandidates) {
  if (existsSync(p)) {
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
    break;
  }
}

const TOKEN =
  process.env.HUBSPOT_PAT ||
  process.env.HUBSPOT_ACCESS_TOKEN ||
  process.env.HUBSPOT_DEVELOPER_API_KEY ||
  process.env.HUBSPOT_API_KEY;

if (!TOKEN) {
  console.error(
    "No HubSpot token found. Set HUBSPOT_PAT in .env.local or the environment\n(Settings → Integrations in the OS stores it in the vault)."
  );
  process.exit(1);
}

const API = "https://api.hubapi.com/crm/v3";
const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

const GROUPS = [
  { name: "agentlab_os", label: "Agent Lab OS" },
  { name: "agentlab_signup", label: "Agent Lab Signup" },
];

const PROPERTIES = [
  // [name, label, type, fieldType, group, options]
  ["lead_source_system", "Lead Source System", "enumeration", "select", "agentlab_os", ["Agent Lab OS"]],
  ["signup_source", "Signup Source", "string", "text", "agentlab_signup", null],
  ["agentlab_source_channel", "Agent Lab Source Channel", "enumeration", "select", "agentlab_os",
    ["website form", "chat", "sms", "video consult", "intake form", "newsletter", "direct"]],
  ["agentlab_entry_point", "Agent Lab Entry Point", "string", "text", "agentlab_os", null],
  ["agentlab_campaign", "Agent Lab Campaign/Source", "string", "text", "agentlab_os", null],
  ["product_of_interest", "Product of Interest", "string", "text", "agentlab_signup", null],
  ["offer_of_interest", "Offer of Interest", "string", "text", "agentlab_signup", null],
  ["agentlab_intent_level", "Agent Lab Intent Level", "enumeration", "select", "agentlab_os", ["Low", "Medium", "High"]],
  ["agentlab_priority_score", "Agent Lab Priority Score", "number", "number", "agentlab_os", null],
  ["agentlab_qualification_reason", "Qualification Reason", "string", "textarea", "agentlab_os", null],
  ["agentlab_sales_ready", "Sales Ready", "bool", "booleancheckbox", "agentlab_os", null],
  ["preferred_contact_method", "Preferred Contact Method", "enumeration", "select", "agentlab_os", ["email", "call", "sms", "video"]],
  ["sms_consent_status", "SMS Consent Status", "enumeration", "select", "agentlab_os", ["consented", "not_consented", "unknown"]],
  ["agentlab_meeting_requested", "Meeting Requested", "bool", "booleancheckbox", "agentlab_os", null],
  ["agentlab_meeting_type", "Meeting Type Requested", "enumeration", "select", "agentlab_os",
    ["15-minute consult", "demo request", "workflow discovery call", "VIP consult"]],
  ["agentlab_booking_status", "Booking Status", "enumeration", "select", "agentlab_os",
    ["requested", "link_sent", "booked", "no_show"]],
  ["agentlab_last_comm_channel", "Last Communication Channel", "enumeration", "select", "agentlab_os",
    ["email", "sms", "chat", "video", "call"]],
  ["agentlab_last_comm_at", "Last Communication Timestamp", "datetime", "date", "agentlab_os", null],
  ["agentlab_primary_use_case", "Primary Use Case", "enumeration", "select", "agentlab_os",
    ["lead generation", "workflow automation", "client intake", "operations automation", "other"]],
  ["agentlab_stated_challenge", "Stated Challenge", "string", "textarea", "agentlab_os", null],
  ["agentlab_decision_timeline", "Decision Timeline", "enumeration", "select", "agentlab_os",
    ["immediate", "30 days", "90 days", "exploring"]],
  ["agentlab_lead_id", "Agent Lab Lead ID", "string", "text", "agentlab_os", null],
  ["agentlab_sync_status", "Agent Lab Sync Status", "enumeration", "select", "agentlab_os", ["new", "updated", "failed"]],
  ["agentlab_last_sync_at", "Last Sync Timestamp", "datetime", "date", "agentlab_os", null],
  ["agentlab_handoff_path", "Handoff Path", "enumeration", "select", "agentlab_os",
    ["nurture", "direct sales", "book meeting", "manual review"]],
  ["agentlab_intake_summary", "Agent Lab Intake Summary", "string", "textarea", "agentlab_os", null],
  ["agentlab_account_created", "AgentLab Account Created", "bool", "booleancheckbox", "agentlab_signup", null],
  ["agentlab_signup_date", "AgentLab Signup Date", "date", "date", "agentlab_signup", null],
  ["signup_counted", "Signup Counted", "bool", "booleancheckbox", "agentlab_signup", null],
  ["signup_page_or_funnel", "Signup Page or Funnel", "string", "text", "agentlab_signup", null],
  ["audience_bucket", "Audience Bucket", "string", "text", "agentlab_signup", null],
  ["activation_status", "Activation Status", "enumeration", "select", "agentlab_signup",
    ["not_activated", "activating", "activated"]],
  ["first_intended_use_case", "First Intended Use Case", "string", "text", "agentlab_signup", null],
  ["first_key_action_completed", "First Key Action Completed", "string", "text", "agentlab_signup", null],
  ["feedback_requested", "Feedback Requested", "bool", "booleancheckbox", "agentlab_signup", null],
  ["feedback_received", "Feedback Received", "bool", "booleancheckbox", "agentlab_signup", null],
  ["first_blocker", "First Blocker", "string", "text", "agentlab_signup", null],
  ["follow_up_status", "Follow-up Status", "string", "text", "agentlab_signup", null],
  ["follow_up_date", "Follow-up Date", "date", "date", "agentlab_signup", null],
];

const APPLY = process.argv.includes("--apply");

async function api(path, method, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return res;
}

async function main() {
  console.log(
    APPLY
      ? "Applying HubSpot portal setup (groups + properties)…"
      : "DRY RUN — pass --apply to create. Plan:"
  );

  for (const g of GROUPS) {
    if (!APPLY) {
      console.log(`  group: ${g.name} (${g.label})`);
      continue;
    }
    const res = await api("/properties/contacts/groups", "POST", g);
    if (res.ok || res.status === 409) {
      console.log(`  ✅ group ${g.name}${res.status === 409 ? " (already exists)" : ""}`);
    } else {
      console.error(`  ❌ group ${g.name}: ${res.status} ${await res.text()}`);
    }
  }

  let created = 0;
  let existing = 0;
  let failed = 0;
  for (const [name, label, type, fieldType, group, options] of PROPERTIES) {
    const body = {
      name,
      label,
      type,
      fieldType,
      groupName: group,
      ...(options ? { options: options.map((o) => ({ name: o, label: o })) } : {}),
    };
    if (!APPLY) {
      console.log(`  property: ${name} (${type}${options ? ": " + options.join("|") : ""}) → group ${group}`);
      continue;
    }
    const res = await api("/properties/contacts", "POST", body);
    if (res.ok) {
      created++;
      console.log(`  ✅ ${name}`);
    } else if (res.status === 409) {
      existing++;
      console.log(`  ⏭  ${name} (already exists)`);
    } else {
      failed++;
      console.error(`  ❌ ${name}: ${res.status} ${(await res.text()).slice(0, 200)}`);
    }
  }

  if (APPLY) {
    console.log(
      `\nDone: ${created} created, ${existing} existing, ${failed} failed.`
    );
    if (failed > 0) process.exit(2);
  } else {
    console.log(`\n${GROUPS.length} groups + ${PROPERTIES.length} properties planned.`);
  }
}

main().catch((err) => {
  console.error("Setup failed:", err?.message ?? err);
  process.exit(1);
});
