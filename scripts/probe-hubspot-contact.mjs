/** READ-ONLY verification: fetch the dispatched HubSpot contact by external id. */
const TOKEN =
  process.env.HUBSPOT_PAT ||
  process.env.HUBSPOT_ACCESS_TOKEN ||
  process.env.HUBSPOT_DEVELOPER_API_KEY ||
  process.env.HUBSPOT_API_KEY ||
  "";
const CONTACT_ID = process.argv[2] || "560622406361";
const res = await fetch(
  `https://api.hubapi.com/crm/v3/objects/contacts/${CONTACT_ID}?properties=email,firstname,lastname,company,lifecyclestage,lead_source_system,agentlab_intent_level,agentlab_intake_summary`,
  { headers: { Authorization: `Bearer ${TOKEN}` } }
);
console.log("HTTP", res.status);
const j = await res.json();
if (j.properties) {
  console.log(JSON.stringify(j.properties, null, 2));
} else {
  console.log(JSON.stringify(j).slice(0, 300));
}
