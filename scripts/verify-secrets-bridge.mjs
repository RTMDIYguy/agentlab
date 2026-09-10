import fs from "fs";
import path from "path";
import dotenv from "dotenv";

const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true });
}
dotenv.config();

function normalizeEnvironmentVariables() {
  const hubspotKeys = [
    process.env.HUBSPOT_SERVICE_KEY,
    process.env.HUBSPOT_PAT,
    process.env.HUBSPOT_ACCESS_TOKEN,
    process.env.HUBSPOT_DEVELOPER_API_KEY,
    process.env.HUBSPOT_API_KEY,
  ].filter(Boolean);

  const resolvedHubspotKey = hubspotKeys.find(k => k.startsWith("pat-")) || hubspotKeys[0] || "";
  process.env.HUBSPOT_PAT = resolvedHubspotKey;
  process.env.HUBSPOT_ACCESS_TOKEN = resolvedHubspotKey;
  process.env.HUBSPOT_SERVICE_KEY = resolvedHubspotKey;
  if (!process.env.INSTANTLY_API_KEY) {
    process.env.INSTANTLY_API_KEY =
      process.env.INSTANTLY_KEY ||
      process.env.INSTANTLY_TOKEN ||
      "";
  }
  if (!process.env.ELEVENLABS_API_KEY) {
    process.env.ELEVENLABS_API_KEY =
      process.env.ELEVENLABS_KEY ||
      process.env.XI_API_KEY ||
      "";
  }
  if (!process.env.AGENTMAIL_API_KEY) {
    process.env.AGENTMAIL_API_KEY =
      process.env.AGENT_MAIL_API_KEY ||
      "";
  }
}

function generateMaskedPreview(value) {
  if (!value) return "••••••••";
  if (value.length <= 8) return "••••••••";
  const start = value.substring(0, Math.min(4, Math.floor(value.length / 3)));
  const end = value.substring(value.length - Math.min(4, Math.floor(value.length / 3)));
  return `${start}••••••••${end}`;
}

normalizeEnvironmentVariables();

console.log("=== AgentLab Vault & Secrets Bridge Verification ===");
console.log("1. Environment Key Resolution:");
console.log("   - INSTANTLY_API_KEY:", process.env.INSTANTLY_API_KEY ? `✅ Present (${generateMaskedPreview(process.env.INSTANTLY_API_KEY)})` : "❌ Missing");
console.log("   - HUBSPOT_PAT:", process.env.HUBSPOT_PAT ? `✅ Present (${generateMaskedPreview(process.env.HUBSPOT_PAT)})` : "❌ Missing");
console.log("   - HUBSPOT_ACCESS_TOKEN:", process.env.HUBSPOT_ACCESS_TOKEN ? `✅ Present (${generateMaskedPreview(process.env.HUBSPOT_ACCESS_TOKEN)})` : "❌ Missing");
console.log("   - ELEVENLABS_API_KEY:", process.env.ELEVENLABS_API_KEY ? `✅ Present (${generateMaskedPreview(process.env.ELEVENLABS_API_KEY)})` : "❌ Missing");
console.log("   - AGENTMAIL_API_KEY:", process.env.AGENTMAIL_API_KEY ? `✅ Present (${generateMaskedPreview(process.env.AGENTMAIL_API_KEY)})` : "❌ Missing");

console.log("\n2. Live API Handshake Tests:");

try {
  const instantlyRes = await fetch("https://api.instantly.ai/api/v2/campaigns?limit=1", {
    headers: { Authorization: `Bearer ${process.env.INSTANTLY_API_KEY}`, Accept: "application/json" }
  });
  console.log("   - Instantly API Status:", instantlyRes.ok ? `✅ Connected (${instantlyRes.status})` : `⚠️ HTTP ${instantlyRes.status} (${await instantlyRes.text()})`);
} catch (e) {
  console.log("   - Instantly API:", `❌ Error: ${e.message}`);
}

try {
  const elevenRes = await fetch("https://api.elevenlabs.io/v1/user", {
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY }
  });
  console.log("   - ElevenLabs API Status:", elevenRes.ok ? `✅ Connected (${elevenRes.status})` : `⚠️ HTTP ${elevenRes.status} (${await elevenRes.text()})`);
} catch (e) {
  console.log("   - ElevenLabs API:", `❌ Error: ${e.message}`);
}

try {
  const hubspotRes = await fetch("https://api.hubapi.com/crm/v3/objects/contacts?limit=1", {
    headers: { Authorization: `Bearer ${process.env.HUBSPOT_PAT}` }
  });
  console.log("   - HubSpot API Status:", hubspotRes.ok ? `✅ Connected (${hubspotRes.status})` : `⚠️ HTTP ${hubspotRes.status} (${await hubspotRes.text()})`);
} catch (e) {
  console.log("   - HubSpot API:", `❌ Error: ${e.message}`);
}

console.log("\n✅ All Secrets Bridge Checks Completed!");
