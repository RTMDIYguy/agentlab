/** READ-ONLY: identify which HubSpot portal a PAT belongs to. */
const TOKEN =
  process.argv[2] ||
  process.env.HUBSPOT_PAT ||
  process.env.HUBSPOT_ACCESS_TOKEN ||
  process.env.HUBSPOT_DEVELOPER_API_KEY ||
  process.env.HUBSPOT_API_KEY ||
  "";
if (!TOKEN) { console.log("NO TOKEN"); process.exit(1); }
console.log("token prefix:", TOKEN.slice(0, 8) + "…");

// v1 contact-by-email returns portalId in its response body.
const res = await fetch(
  "https://api.hubapi.com/contacts/v1/contact/email/agentlab.tech@gmail.com/profile",
  { headers: { Authorization: `Bearer ${TOKEN}` } }
);
console.log("HTTP", res.status);
const j = await res.json();
console.log("portal-id:", j["portal-id"] ?? j.portalId ?? "(not in response)");
console.log("contact id (canonical v3):", j["canonical-vid"] ?? j.vid ?? "(n/a)");
if (j.properties) {
  const p = j.properties;
  console.log("firstname:", p.firstname?.value);
  console.log("lastname:", p.lastname?.value);
  console.log("company:", p.company?.value);
  console.log("intent_level:", p.agentlab_intent_level?.value ?? "(unset)");
}
