/**
 * Prove WHERE each credential in this process came from (2026-09-25,
 * CC-2026-09-25-005).
 *
 *   pnpm secrets:check              # disk mode: what the app would load today
 *   pnpm secrets:check:infisical    # Infisical mode: what `infisical run` injects
 *
 * It uses the app's own loader (server/_core/secrets-source.ts), so anything it
 * reports is what server/_core/env.ts actually does.
 *
 * SECRET DISCIPLINE: this script never prints a secret value — not whole,
 * not truncated, not reversed. Only key names, presence, length, and which
 * layer supplied the value. Do not "improve" it by adding previews.
 *
 * Run under tsx because it imports the app's TypeScript loader:
 *   npx tsx scripts/verify-secrets-source.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import dotenv from "dotenv";

const ROOT = path.resolve(process.cwd());
const { loadSecretLayers, isInfisicalManaged } = await import(
  pathToFileURL(path.join(ROOT, "server", "_core", "secrets-source.ts")).href
);

/** Credentials the OS cannot operate without. Key names only. */
const REQUIRED = [
  ["DATABASE_URL", "Postgres (Neon) connection string"],
  [
    "GOOGLE_GENERATIVE_AI_API_KEY | GEMINI_API_KEY | GOOGLE_SERVICE_ACCOUNT_JSON",
    "Gemini credential (one of these three)",
  ],
];

/** Everything else the OS reads, grouped for readability. */
const TRACKED = {
  "Database": ["DATABASE_URL", "NEON_KEEPALIVE_MINUTES"],
  "AI / LLM": [
    "GOOGLE_GENERATIVE_AI_API_KEY",
    "GEMINI_API_KEY",
    "GOOGLE_SERVICE_ACCOUNT_JSON",
    "GOOGLE_SERVICE_ACCOUNT_FILE",
    "GOOGLE_AI_BASE_URL",
    "GOOGLE_AI_MODEL",
    "ANTHROPIC_API_KEY",
    "OPENAI_API_KEY",
    "OPENAI_OPS_AGENT_MODEL",
  ],
  "Sessions / app": ["COOKIE_SECRET", "JWT_SECRET", "OAUTH_SERVER_URL", "OWNER_OPEN_ID", "APP_BASE_URL", "PUBLIC_BASE_URL"],
  "Integrations": [
    "HUBSPOT_PAT",
    "INSTANTLY_API_KEY",
    "ELEVENLABS_API_KEY",
    "AGENTMAIL_API_KEY",
    "BROWSERBASE_API_KEY",
    "AUTONOMA_SHARED_SECRET",
    "AUTONOMA_SIGNING_SECRET",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
  ],
  "Social": [
    "LINKEDIN_ACCESS_TOKEN",
    "FACEBOOK_PAGE_TOKEN",
    "INSTAGRAM_APP_SECRET",
    "THREADS_APP_SECRET",
  ],
};

/** Key names defined by a disk env file — values stay in memory and are dropped. */
function diskKeyNames(file) {
  try {
    return Object.keys(dotenv.parse(fs.readFileSync(file, "utf8")));
  } catch {
    return [];
  }
}

function state(value) {
  if (value === undefined) return "missing";
  if (value === "") return "empty";
  return `present (len=${value.length})`;
}

function main() {
  const declaredInfisical = isInfisicalManaged(process.env);
  const result = loadSecretLayers();

  console.log("=== AgentLab secrets source verification ===\n");
  console.log(`Infisical-managed process : ${declaredInfisical ? "YES" : "NO"}`);
  console.log(`Resolved source           : ${result.source}`);
  console.log(
    `Disk files read           : ${
      result.loadedFiles.map(file => path.relative(ROOT, file)).join(", ") || "none"
    }`
  );
  console.log(
    `Keys supplied by disk     : ${result.contributedKeys.length}` +
      (result.contributedKeys.length
        ? ` (${result.contributedKeys.slice(0, 12).join(", ")}${
            result.contributedKeys.length > 12 ? ", …" : ""
          })`
        : "")
  );

  if (result.source === "infisical") {
    const diskKeys = new Set(result.loadedFiles.flatMap(diskKeyNames));
    const overridden = [...diskKeys].filter(key => !result.contributedKeys.includes(key));
    console.log(`Disk keys overridden by Infisical : ${overridden.length}`);
    console.log(
      overridden.length
        ? "  → these values are now delivered centrally; they can be deleted from .env.local.\n"
        : "  → nothing on disk is shadowed yet (no overlapping keys).\n"
    );
  } else {
    console.log(
      "\nNOTE: not running under Infisical — values below come from disk/env as before.\n" +
        "      Run `pnpm secrets:check:infisical` to verify the Infisical path.\n"
    );
  }

  console.log("--- Credential report (names, presence, length — never values) ---");
  for (const [group, keys] of Object.entries(TRACKED)) {
    console.log(`\n${group}:`);
    for (const key of keys) {
      const value = process.env[key];
      if (value === undefined && !result.contributedKeys.includes(key)) continue;
      const origin = result.contributedKeys.includes(key) ? "disk" : "env/Infisical";
      console.log(`  ${key.padEnd(34)} ${state(value).padEnd(22)} [${origin}]`);
    }
  }

  const problems = [];
  for (const [label, description] of REQUIRED) {
    const alternatives = label.split(" | ");
    const ok = alternatives.some(key => (process.env[key] || "").length > 0);
    console.log(`\n${ok ? "PASS" : "FAIL"}  ${description} (${label})`);
    if (!ok) problems.push(description);
  }

  if (problems.length) {
    console.error(
      `\n❌ ${problems.length} required credential(s) unresolved: ${problems.join("; ")}.\n` +
        "   Add them in the Infisical dashboard (Development environment) or to .env.local, then re-run."
    );
    process.exit(1);
  }

  console.log("\n✅ All required credentials resolved. No secret value was printed.");
}

main();
