/**
 * ADC user-principal probe: mints an access token from the local ADC
 * refresh grant WITH an explicit scope, then calls the Gemini API.
 * Prints status/error only — never tokens, client secrets, or refresh tokens.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const adcPath = join(process.env.APPDATA, "gcloud", "application_default_credentials.json");
const adc = JSON.parse(readFileSync(adcPath, "utf8"));
if (adc.type !== "authorized_user" || !adc.refresh_token) {
  console.log("ADC is not an authorized_user credential with a refresh token; aborting.");
  process.exit(1);
}

const scope = process.argv[2] || "https://www.googleapis.com/auth/generative-language";
const body = new URLSearchParams({
  client_id: adc.client_id,
  client_secret: adc.client_secret,
  refresh_token: adc.refresh_token,
  grant_type: "refresh_token",
  scope,
});

const tokenRes = await fetch("https://oauth2.googleapis.com/token", { method: "POST", body });
const tokenJson = await tokenRes.json();
if (!tokenJson.access_token) {
  console.log("token mint failed:", tokenJson.error ?? "unknown", tokenJson.error_description ?? "");
  process.exit(1);
}
console.log("token minted OK with scope:", scope);

const headers = { Authorization: `Bearer ${tokenJson.access_token}` };
if (adc.quota_project_id) headers["x-goog-user-project"] = adc.quota_project_id;

const apiRes = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=1", { headers });
const apiBody = await apiRes.json().catch(() => ({}));
console.log("API HTTP status:", apiRes.status);
if (apiRes.status === 200) {
  console.log("SUCCESS — user principal accepted by the Gemini API.");
} else {
  console.log("error message:", apiBody?.error?.message ?? "(none)");
  const d = (apiBody?.error?.details ?? []).find(x => x?.reason);
  if (d) console.log("reason:", d.reason);
}
