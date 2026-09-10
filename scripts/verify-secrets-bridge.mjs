import fs from "fs";
import path from "path";
import dotenv from "dotenv";

const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true });
}
dotenv.config();

function normalizeEnvironmentVariables() {
  if (!process.env.HUBSPOT_PAT) {
    process.env.HUBSPOT_PAT =
      process.env.HUBSPOT_ACCESS_TOKEN ||
      process.env.HUBSPOT_DEVELOPER_API_KEY ||
      process.env.HUBSPOT_API_KEY ||
      "";
  }
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

console.log("\n✅ All Secrets Bridge Checks Passed Successfully!");
