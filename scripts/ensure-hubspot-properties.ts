/**
 * One-time (idempotent) provisioning of the Agent Lab OS → HubSpot blueprint
 * contract: property groups + custom contact properties from
 * server/hubspot/schema-map.ts. Nothing is invented — every property, label,
 * type, and option comes verbatim from the committed blueprint.
 *
 * Tolerates 409 (already exists) so repeated runs converge; surfaces every
 * real rejection honestly.
 *
 * Usage: infisical run --env=dev -- tsx scripts/ensure-hubspot-properties.ts
 */
import {
  HUBSPOT_CONTACT_PROPERTIES,
  HUBSPOT_PROPERTY_GROUP_DEFS,
} from "../server/hubspot/schema-map";

const TOKEN =
  process.env.HUBSPOT_PAT ||
  process.env.HUBSPOT_ACCESS_TOKEN ||
  process.env.HUBSPOT_DEVELOPER_API_KEY ||
  process.env.HUBSPOT_API_KEY ||
  "";
if (!TOKEN) {
  console.error("No HubSpot token configured (HUBSPOT_PAT).");
  process.exit(1);
}

const BASE = "https://api.hubapi.com/crm/v3/properties/contacts";
const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

async function tryCreate(url: string, body: unknown): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (res.ok) return "created";
  const text = await res.text();
  if (res.status === 409 || /already exists|PROPERTY_NAME_ALREADY_EXISTS/i.test(text)) {
    return "exists";
  }
  return `FAILED (${res.status}): ${text.slice(0, 200)}`;
}

// 1. Property groups.
for (const g of HUBSPOT_PROPERTY_GROUP_DEFS) {
  const outcome = await tryCreate(`${BASE}/groups`, g);
  console.log(`group ${g.name}: ${outcome}`);
}

// 2. Custom properties (standard HubSpot fields must never be re-created).
let created = 0;
let exists = 0;
let failed = 0;
for (const p of HUBSPOT_CONTACT_PROPERTIES.filter((p) => p.custom)) {
  const body: Record<string, unknown> = {
    name: p.name,
    label: p.label,
    type: p.type,
    fieldType: p.fieldType,
    groupName: p.group,
  };
  if (p.type === "enumeration" && p.options) {
    body.options = p.options.map((o, i) => ({
      value: o,
      label: o,
      displayOrder: i,
      hidden: false,
    }));
  }
  const outcome = await tryCreate(BASE, body);
  console.log(`property ${p.name}: ${outcome}`);
  if (outcome === "created") created++;
  else if (outcome === "exists") exists++;
  else failed++;
}

console.log(`\nsummary: ${created} created, ${exists} already existed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
