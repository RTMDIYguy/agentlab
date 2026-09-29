/** READ-ONLY: introspect the configured HubSpot token — scopes only, no secret material. */
const TOKEN =
  process.env.HUBSPOT_PAT ||
  process.env.HUBSPOT_ACCESS_TOKEN ||
  process.env.HUBSPOT_DEVELOPER_API_KEY ||
  process.env.HUBSPOT_API_KEY ||
  "";
if (!TOKEN) {
  console.log("NO TOKEN CONFIGURED");
  process.exit(0);
}
console.log("token present: yes (len " + TOKEN.length + ", starts " + TOKEN.slice(0, 4) + ")");
const res = await fetch("https://api.hubapi.com/oauth/v1/access-tokens/" + TOKEN);
console.log("HTTP", res.status);
const body = await res.text();
try {
  const j = JSON.parse(body);
  console.log(JSON.stringify({ hub_id: j.hub_id, app_id: j.app_id, token_type: j.token_type, scopes: j.scopes, message: j.message }, null, 2));
} catch {
  console.log(body.slice(0, 300));
}
