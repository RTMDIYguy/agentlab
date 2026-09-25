/**
 * Live verification of the Gemini credential path (2026-09-24, extended
 * 2026-09-25 for the AI Studio API-key route — CC-2026-09-25-004/005).
 *
 * Supports BOTH credential modes and reports which one is in play:
 *   1. Service account (org no-API-key policy):
 *      JSON key at secrets/gemini-service-account.json or inline
 *      GOOGLE_SERVICE_ACCOUNT_JSON — run under tsx because it loads the
 *      app's TypeScript auth module.
 *   2. Consumer Gemini API key (AI Studio route, primary under
 *      Secure-by-Default orgs): GOOGLE_GENERATIVE_AI_API_KEY / GEMINI_API_KEY
 *      in the environment or .env.local.
 *
 *   npx tsx scripts/verify-gemini-service-account.mjs
 *
 * What it does (prints NO secret material — only statuses, emails, model ids):
 *   Note: Google now issues "Auth keys" (prefix AQ.) from AI Studio; both
 *   formats are accepted as opaque strings by the SDK and the Gemini API.
 *  1. Resolves the best available credential (service account wins when present).
 *  2. SA mode: mints an OAuth access token via the JWT-bearer grant.
 *  3. Calls Gemini with a "pong" prompt through the same provider factory
 *     the app uses (@ai-sdk/google via server/_core/google-ai.ts).
 *  4. On failure, prints the exact likely fix (API not enabled, missing
 *     IAM role, wrong scope, or bad key file).
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import dotenv from "dotenv";

const ROOT = path.resolve(process.cwd());
const KEY_PATH =
  process.env.GOOGLE_SERVICE_ACCOUNT_FILE ||
  path.join(ROOT, "secrets", "gemini-service-account.json");

// Mirror the app loader (server/_core/secrets-source.ts): under `infisical run`
// the injected values win and .env.local only fills gaps — otherwise .env.local
// keeps its legacy override behavior. Never override an Infisical-managed value
// with disk state, or this script would verify the wrong credential.
const infisicalManaged =
  process.env.SECRETS_SOURCE === "infisical" || Boolean(process.env.INFISICAL_PROJECT_ID);
dotenv.config({ path: path.join(ROOT, ".env.local"), override: !infisicalManaged });
dotenv.config();

function maskEmail(email) {
  const [name, domain] = String(email).split("@");
  return `${name.slice(0, 8)}...@${domain}`;
}

function printResult(ok, label, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
}

async function main() {
  console.log("== Gemini credential verification ==\n");

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  const saFileExists = fs.existsSync(KEY_PATH);
  const inlineSa = Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON &&
      process.env.GOOGLE_SERVICE_ACCOUNT_JSON.trim().startsWith("{")
  );
  const useServiceAccount = saFileExists || inlineSa;

  // Step 1: resolve the credential (service account wins when present).
  if (!useServiceAccount && !apiKey) {
    printResult(false, "Credential found", "neither a service-account key nor an API key is configured");
    console.log("\nFIX (either path works):");
    console.log(" - AI Studio route: create a key at https://aistudio.google.com/apikey and set");
    console.log("     GOOGLE_GENERATIVE_AI_API_KEY=<key>   in .env.local (git-ignored)");
    console.log(" - Service-account route: download the JSON key (GCP Console → IAM & Admin →");
    console.log("     Service Accounts → Keys → Add key → JSON) and save it as");
    console.log("     secrets/gemini-service-account.json — requires the ORG-level policy");
    console.log("     iam.disableServiceAccountKeyCreation to be Not enforced (Secure by Default blocks it).");
    process.exit(1);
  }

  const authMode = useServiceAccount ? "service-account (org no-API-key policy)" : "AI Studio API key";
  printResult(true, "Credential found", `auth_mode=${authMode}`);

  // Step 2 (service-account mode only): mint a token through the real module.
  if (useServiceAccount) {
    process.env.GOOGLE_SERVICE_ACCOUNT_FILE = KEY_PATH;
    const mod = await import(pathToFileURL(path.join(ROOT, "server/_core/google-ai.ts")).href);
    try {
      const tokenResult = await mod.getGoogleAccessToken();
      printResult(true, "OAuth token minted", `scope accepted: ${tokenResult.scope}`);
    } catch (e) {
      printResult(false, "OAuth token minted", e.message);
      console.log("\nFIX hints:");
      console.log(" - 'invalid_client' → the JSON key was deleted/rotated; create a fresh key.");
      console.log(" - 'invalid_scope'  → the scope is refused; try GOOGLE_AI_OAUTH_SCOPE=https://www.googleapis.com/auth/cloud-platform");
      console.log(" - network errors   → check internet/proxy.");
      process.exit(1);
    }
  }

  // Step 3: call Gemini through the app's provider factory.
  try {
    const { generateText } = await import("ai");
    const mod = await import(pathToFileURL(path.join(ROOT, "server/_core/google-ai.ts")).href);
    const provider = mod.createGoogleProvider();
    const modelId = process.env.GOOGLE_AI_MODEL || "gemini-2.5-flash";
    const result = await generateText({
      model: provider(modelId),
      prompt: "Reply with the single word: pong",
    });
    printResult(true, "Gemini responded", `model=${modelId} text=${JSON.stringify((result.text || "").slice(0, 40))}`);
    console.log(`\nALL GREEN — the OS can now call Gemini (auth_mode: ${authMode}).`);
  } catch (e) {
    const msg = String(e?.message || e);
    printResult(false, "Gemini responded", msg.slice(0, 400));
    console.log("\nFIX hints (most likely first):");
    if (/api key not valid|api_key_invalid|invalid api key|API_KEY_INVALID/i.test(msg)) {
      console.log(" - The API key was rejected: re-copy it from https://aistudio.google.com/apikey");
      console.log("   (keys created there work against generativelanguage.googleapis.com).");
    } else if (/403|permission|denied/i.test(msg)) {
      console.log(" - Service-account route: enable 'Generative Language API' on the project, OR");
      console.log("     grant roles/aiplatform.user and set GOOGLE_AI_BASE_URL to the Vertex prefix:");
      console.log("       GOOGLE_AI_BASE_URL=https://us-central1-aiplatform.googleapis.com/v1beta1/projects/<PROJECT>/locations/us-central1");
      console.log("       (model ids become publishers/google/models/gemini-2.5-flash)");
    } else if (/404|not found/i.test(msg)) {
      console.log(" - Model id or API version not available on this project — try GOOGLE_AI_MODEL=gemini-2.0-flash, or the Vertex base URL above.");
    } else if (/429|quota/i.test(msg)) {
      console.log(" - Quota exhausted for the project — wait or raise quota.");
    } else if (/scope/i.test(msg)) {
      console.log(" - Wrong scope: try GOOGLE_AI_OAUTH_SCOPE=https://www.googleapis.com/auth/cloud-platform");
    }
    process.exit(1);
  }
}

main().catch(e => {
  console.error("Unexpected verification error:", e);
  process.exit(1);
});
