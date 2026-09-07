import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const apiKey = process.env.INSTANTLY_API_KEY;

async function checkInstantlyCampaignsAndCreate() {
  console.log("Checking Instantly API connection...");

  // 1. Check existing campaigns
  const listRes = await fetch(`https://api.instantly.ai/api/v1/campaign/list?api_key=${encodeURIComponent(apiKey)}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!listRes.ok) {
    console.error("List campaigns error:", listRes.status, await listRes.text());
    return;
  }

  const campaigns = await listRes.json();
  console.log("Current campaigns in Instantly:", campaigns);

  // 2. Test create campaign if v1 / v2 endpoint supports it or display campaign status
  console.log("Instantly API is connected and active.");
}

checkInstantlyCampaignsAndCreate().catch(console.error);
