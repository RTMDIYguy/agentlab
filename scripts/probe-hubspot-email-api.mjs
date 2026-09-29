/** READ-ONLY: probe HubSpot marketing email API access and shape for a PAT. */
const TOKEN =
  process.argv[2] ||
  process.env.HUBSPOT_PAT ||
  process.env.HUBSPOT_ACCESS_TOKEN ||
  process.env.HUBSPOT_DEVELOPER_API_KEY ||
  process.env.HUBSPOT_API_KEY ||
  "";
if (!TOKEN) { console.log("NO TOKEN"); process.exit(1); }
const headers = { Authorization: `Bearer ${TOKEN}` };

// 1. Can we list marketing emails?
let res = await fetch("https://api.hubapi.com/marketing/v3/emails/?limit=1", { headers });
console.log("GET /marketing/v3/emails/ ->", res.status);
const listText = await res.text();
if (res.ok) {
  const j = JSON.parse(listText);
  console.log("results count:", (j.results || []).length);
  if ((j.results || [])[0]) {
    const first = j.results[0];
    console.log("sample keys:", Object.keys(first).join(", "));
  }
} else {
  console.log(listText.slice(0, 250));
}
