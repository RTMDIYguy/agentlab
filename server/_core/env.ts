import fs from "fs";
import path from "path";
import { db } from "../db";
import { loadSecretLayers, isInfisicalManaged } from "./secrets-source";
import { workspaceSecrets, workspaceIntegrations, workspaces } from "../schema";
import { eq, and } from "drizzle-orm";

/**
 * True when running inside a test runner (vitest).
 * Test processes must never write to .env.local or reload it with override —
 * a prior test run persisted dummy secrets over the real ones on disk.
 */
function isTestProcess(): boolean {
  return process.env.VITEST === "true" || process.env.NODE_ENV === "test";
}

// 1. Load the on-disk secret layers (.env.local overrides .env) — unless
// Infisical owns this process, in which case the CLI-injected values win and
// the files may only fill gaps. See server/_core/secrets-source.ts.
const secretsLoad = loadSecretLayers();
console.log(
  secretsLoad.source === "infisical"
    ? `[env] secrets source: Infisical (project injected via infisical run)${
        secretsLoad.contributedKeys.length
          ? ` — ${secretsLoad.contributedKeys.length} key(s) still filled from disk: ${secretsLoad.contributedKeys
              .slice(0, 8)
              .join(", ")}${secretsLoad.contributedKeys.length > 8 ? ", …" : ""}`
          : " — no key read from disk"
      }`
    : `[env] secrets source: local disk (${
        secretsLoad.loadedFiles.map(file => path.basename(file)).join(", ") || "no .env files found"
      })`
);

export const ENV = {
  get ownerOpenId(): string { return process.env.OWNER_OPEN_ID || ""; },
  get forgeApiUrl(): string { return process.env.BUILT_IN_FORGE_API_URL || process.env.FORGE_API_URL || ""; },
  get forgeApiKey(): string { return process.env.BUILT_IN_FORGE_API_KEY || process.env.FORGE_API_KEY || ""; },
  get appId(): string { return process.env.VITE_APP_ID || process.env.APP_ID || ""; },
  get cookieSecret(): string { return process.env.COOKIE_SECRET || process.env.JWT_SECRET || ""; },
  get databaseUrl(): string { return process.env.DATABASE_URL || ""; },
  ...process.env,
};

// 2. Canonicalize & Normalize environment variable aliases
export function normalizeEnvironmentVariables() {
  // Reload .env.local (local secrets override) — but never inside tests:
  // test runs must not read potentially stale disk state over live process env.
  if (!isTestProcess()) {
    // Same precedence rules as boot: Infisical-injected values are never
    // clobbered by disk files (see server/_core/secrets-source.ts).
    loadSecretLayers();
  }

  // HubSpot aliases
  if (!process.env.HUBSPOT_PAT) {
    process.env.HUBSPOT_PAT =
      process.env.HUBSPOT_SERVICE_KEY ||
      process.env.HUBSPOT_ACCESS_TOKEN ||
      process.env.HUBSPOT_DEVELOPER_API_KEY ||
      process.env.HUBSPOT_API_KEY ||
      "";
  }

  if (!process.env.HUBSPOT_ACCESS_TOKEN) {
    process.env.HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_PAT;
  }

  if (!process.env.HUBSPOT_SERVICE_KEY && process.env.HUBSPOT_PAT?.startsWith("pat-")) {
    process.env.HUBSPOT_SERVICE_KEY = process.env.HUBSPOT_PAT;
  }

  // Instantly aliases
  if (!process.env.INSTANTLY_API_KEY) {
    process.env.INSTANTLY_API_KEY =
      process.env.INSTANTLY_KEY ||
      process.env.INSTANTLY_TOKEN ||
      "";
  }

  // ElevenLabs aliases
  if (!process.env.ELEVENLABS_API_KEY) {
    process.env.ELEVENLABS_API_KEY =
      process.env.ELEVENLABS_KEY ||
      process.env.XI_API_KEY ||
      "";
  }

  if (!process.env.ELEVENLABS_VOICE_ID_PAMELA) {
    process.env.ELEVENLABS_VOICE_ID_PAMELA = "EXAVITQu4vr4xnSDxMaL";
  }

  // AgentMail aliases
  if (!process.env.AGENTMAIL_API_KEY) {
    process.env.AGENTMAIL_API_KEY =
      process.env.AGENT_MAIL_API_KEY ||
      "";
  }
}

// Initial normalization
normalizeEnvironmentVariables();

/**
 * Generate standard masked preview (e.g., "sk_1e0a••••••••881")
 */
export function generateMaskedPreview(value: string): string {
  if (!value) return "••••••••";
  if (value.length <= 8) return "••••••••";
  const start = value.substring(0, Math.min(4, Math.floor(value.length / 3)));
  const end = value.substring(value.length - Math.min(4, Math.floor(value.length / 3)));
  return `${start}••••••••${end}`;
}

/**
 * Map provider string to standard process.env key and vice versa
 */
export function mapProviderToEnvKey(provider: string): string {
  const normalized = provider.toLowerCase().trim();
  if (normalized.includes("instantly")) return "INSTANTLY_API_KEY";
  if (normalized.includes("hubspot") || normalized === "hubspot_pat" || normalized === "hubspot_access_token") return "HUBSPOT_PAT";
  if (normalized.includes("elevenlabs") || normalized === "xi_api_key") return "ELEVENLABS_API_KEY";
  if (normalized.includes("agentmail")) return "AGENTMAIL_API_KEY";
  if (normalized.includes("google") || normalized.includes("gemini")) return "GOOGLE_GENERATIVE_AI_API_KEY";
  if (normalized.includes("openai")) return "OPENAI_API_KEY";
  if (normalized.includes("anthropic") || normalized.includes("claude")) return "ANTHROPIC_API_KEY";
  if (normalized.includes("stripe")) return "STRIPE_SECRET_KEY";
  return provider.toUpperCase();
}

/**
 * Apply a newly saved vault secret to the live process.env
 * and persist it to .env.local so it survives server restarts.
 */
export function applySecretToEnv(provider: string, value: string): void {
  const envKey = mapProviderToEnvKey(provider);
  // Persist to .env.local so the real value survives restarts
  persistSecretToEnvFile(provider, value);
  // Apply to the live process
  process.env[envKey] = value;
  if (envKey === "HUBSPOT_PAT") {
    process.env.HUBSPOT_ACCESS_TOKEN = value;
    process.env.HUBSPOT_SERVICE_KEY = value;
  }
  // Normalize aliases for the keys we just set (without re-reading .env.local,
  // which would clobber our in-memory values with the old placeholders)
  if (envKey === "HUBSPOT_PAT") {
    if (!process.env.HUBSPOT_ACCESS_TOKEN) process.env.HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_PAT;
    if (!process.env.HUBSPOT_SERVICE_KEY && process.env.HUBSPOT_PAT?.startsWith("pat-")) {
      process.env.HUBSPOT_SERVICE_KEY = process.env.HUBSPOT_PAT;
    }
  }
  if (envKey === "INSTANTLY_API_KEY" && !process.env.INSTANTLY_KEY && !process.env.INSTANTLY_TOKEN) {
    // canonical key already set
  }
  if (envKey === "ELEVENLABS_API_KEY" && !process.env.ELEVENLABS_KEY && !process.env.XI_API_KEY) {
    // canonical key already set
  }
  if (envKey === "AGENTMAIL_API_KEY" && !process.env.AGENT_MAIL_API_KEY) {
    // canonical key already set
  }
}

const HUBSPOT_ALIAS_KEYS = [
  "HUBSPOT_PAT",
  "HUBSPOT_SERVICE_KEY",
  "HUBSPOT_ACCESS_TOKEN",
  "HUBSPOT_DEVELOPER_API_KEY",
  "HUBSPOT_API_KEY",
];

/**
 * Persist a secret value into `.env.local` so it survives server restarts.
 * For hubspot, all alias keys present in the file are updated to the same value
 * so the file stays self-consistent with the runtime alias logic in
 * `normalizeEnvironmentVariables()`.
 *
 * No-ops (with a warning) when the process is Infisical-managed: writing
 * credentials back to disk would re-create the local secret store the
 * Infisical migration removed.
 */
export function persistSecretToEnvFile(provider: string, value: string): void {
  // Hard guard: tests call applySecretToEnv with dummy values; persisting them
  // here would overwrite real secrets on disk (this exact bug destroyed the
  // HubSpot/Instantly/ElevenLabs keys in .env.local once already).
  if (isTestProcess()) {
    return;
  }
  // Infisical guard (2026-09-25): under `infisical run` the vault is the
  // source of truth. Writing a UI-saved credential back to .env.local would
  // silently re-create the on-disk secret store this migration removed, so
  // the value is applied to this process only and the operator is told where
  // to persist it properly.
  if (isInfisicalManaged()) {
    console.warn(
      `[Vault] ${mapProviderToEnvKey(provider)} was applied to this running process only — secrets are managed by Infisical, so nothing was written to .env.local. Add the value in the Infisical dashboard (project → env) to persist it across restarts.`
    );
    return;
  }
  const envLocalPath = path.resolve(process.cwd(), ".env.local");
  const envKey = mapProviderToEnvKey(provider);
  const keysToUpdate: string[] = envKey === "HUBSPOT_PAT" ? HUBSPOT_ALIAS_KEYS : [envKey];

  let lines: string[] = [];
  if (fs.existsSync(envLocalPath)) {
    lines = fs.readFileSync(envLocalPath, "utf-8").split(/\r?\n/);
  }

  const formatted = value.includes('"') || value.includes("\\") || value.includes("\n")
    ? `"${value.replace(/"/g, '\\"').replace(/\\/g, "\\\\")}"`
    : value;

  let anyUpdated = false;
  const out: string[] = [];
  for (const line of lines) {
    const m = line.trim().match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=/);
    if (m && keysToUpdate.includes(m[1])) {
      out.push(`${m[1]}=${formatted}`);
      anyUpdated = true;
    } else {
      out.push(line);
    }
  }
  for (const key of keysToUpdate) {
    if (!out.some(l => l.trim().startsWith(key + "="))) {
      out.push(`${key}=${formatted}`);
    }
  }

  try {
    fs.writeFileSync(envLocalPath, out.join("\n"), "utf-8");
  } catch (err) {
    console.error(
      `[Vault] Failed to persist secret to .env.local: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

/**
 * Known core integrations to auto-bridge between vault/env and database
 */
export const CORE_PROVIDERS_CONFIG = [
  {
    provider: "instantly",
    envKey: "INSTANTLY_API_KEY",
    integrationType: "outbound",
    integrationName: "Instantly.ai Outbound Engine",
    defaultStatus: "active",
  },
  {
    provider: "hubspot",
    envKey: "HUBSPOT_PAT",
    integrationType: "crm",
    integrationName: "HubSpot CRM",
    defaultStatus: "active",
  },
  {
    provider: "elevenlabs",
    envKey: "ELEVENLABS_API_KEY",
    integrationType: "voice",
    integrationName: "ElevenLabs / Pamela Telephony",
    defaultStatus: "active",
  },
  {
    provider: "agentmail",
    envKey: "AGENTMAIL_API_KEY",
    integrationType: "email",
    integrationName: "AgentMail Inbound & Direct SMTP",
    defaultStatus: "active",
  },
  {
    provider: "google_ai",
    envKey: "GOOGLE_GENERATIVE_AI_API_KEY",
    integrationType: "llm",
    integrationName: "Google Gemini 2.5 LLM Engine",
    defaultStatus: "active",
  },
];

/**
 * Synchronize workspace_secrets and workspace_integrations in DB
 * with current active process.env keys for a given workspace (or all workspaces).
 *
 * SECURITY (multi-tenant credential isolation, 2026-09-24): the operator's
 * local process.env keys are the OPERATOR's credentials. They must only ever
 * be bridged into the operator's own workspace — never into other tenants'.
 * Callers that pass an explicit targetWorkspaceId must therefore resolve to
 * the operator workspace; other workspaces only get their own rows cleaned
 * up (stale rows flipped to disconnected) but never receive operator keys.
 */
function resolveOperatorWorkspaceIds(): Set<string> {
  const ids = new Set<string>();
  const explicit = [
    process.env.OPERATOR_WORKSPACE_ID,
    process.env.DEFAULT_WORKSPACE_ID,
  ].filter(Boolean) as string[];
  for (const id of explicit) ids.add(id);
  // The canonical operator workspace used across the OS (auth fallback,
  // demo telemetry, workspace creation fallback).
  ids.add("00000000-0000-0000-0000-000000000001");
  return ids;
}

export function isOperatorWorkspace(workspaceId: string): boolean {
  return resolveOperatorWorkspaceIds().has(workspaceId);
}

export async function syncWorkspaceVaultSecrets(targetWorkspaceId?: string): Promise<void> {
  normalizeEnvironmentVariables();

  try {
    let workspaceList: Array<{ id: string }> = [];

    if (targetWorkspaceId) {
      workspaceList = [{ id: targetWorkspaceId }];
    } else {
      workspaceList = await db.select({ id: workspaces.id }).from(workspaces).limit(10);
    }

    if (workspaceList.length === 0) return;

    const operatorIds = resolveOperatorWorkspaceIds();

    for (const ws of workspaceList) {
      const workspaceId = ws.id;

      // Multi-tenant guard: operator env keys flow ONLY into operator
      // workspaces. Non-operator workspaces never receive them; their stale
      // connected rows (if any were created before this guard) are flipped
      // to disconnected so the UI stops claiming live operator credentials.
      if (!operatorIds.has(workspaceId)) {
        await db
          .update(workspaceSecrets)
          .set({ status: "disconnected", updatedAt: new Date() })
          .where(
            and(
              eq(workspaceSecrets.workspaceId, workspaceId),
              eq(workspaceSecrets.status, "connected")
            )
          );
        await db
          .update(workspaceIntegrations)
          .set({ status: "inactive", updatedAt: new Date() })
          .where(
            and(
              eq(workspaceIntegrations.workspaceId, workspaceId),
              eq(workspaceIntegrations.status, "active")
            )
          );
        continue;
      }

      for (const item of CORE_PROVIDERS_CONFIG) {
        const secretVal = process.env[item.envKey];
        if (!secretVal) {
          // Key absent/empty (e.g. trial expired and key removed): flip any
          // stale vault rows to disconnected so the Settings UI stops
          // claiming the integration is live.
          await db
            .update(workspaceSecrets)
            .set({ status: "disconnected", updatedAt: new Date() })
            .where(
              and(
                eq(workspaceSecrets.workspaceId, workspaceId),
                eq(workspaceSecrets.provider, item.provider),
                eq(workspaceSecrets.status, "connected")
              )
            );
          await db
            .update(workspaceIntegrations)
            .set({ status: "inactive", updatedAt: new Date() })
            .where(
              and(
                eq(workspaceIntegrations.workspaceId, workspaceId),
                eq(workspaceIntegrations.name, item.integrationName),
                eq(workspaceIntegrations.status, "active")
              )
            );
          continue;
        }

        const maskedPreview = generateMaskedPreview(secretVal);

        // 1. Sync workspaceSecrets
        const [existingSecret] = await db
          .select()
          .from(workspaceSecrets)
          .where(
            and(
              eq(workspaceSecrets.workspaceId, workspaceId),
              eq(workspaceSecrets.provider, item.provider)
            )
          )
          .limit(1);

        if (!existingSecret) {
          await db.insert(workspaceSecrets).values({
            workspaceId,
            provider: item.provider,
            gsmSecretId: `workspace_${workspaceId.substring(0, 8)}_${item.provider}`,
            version: "1",
            maskedPreview,
            status: "connected",
          });
        } else if (existingSecret.status !== "connected" || existingSecret.maskedPreview !== maskedPreview) {
          await db
            .update(workspaceSecrets)
            .set({
              maskedPreview,
              status: "connected",
              updatedAt: new Date(),
            })
            .where(eq(workspaceSecrets.id, existingSecret.id));
        }

        // 2. Sync workspaceIntegrations
        const [existingIntegration] = await db
          .select()
          .from(workspaceIntegrations)
          .where(
            and(
              eq(workspaceIntegrations.workspaceId, workspaceId),
              eq(workspaceIntegrations.name, item.integrationName)
            )
          )
          .limit(1);

        if (!existingIntegration) {
          await db.insert(workspaceIntegrations).values({
            workspaceId,
            type: item.integrationType,
            name: item.integrationName,
            config: {
              provider: item.provider,
              envKey: item.envKey,
              maskedPreview,
              configured: true,
            },
            status: item.defaultStatus,
          });
        } else if (existingIntegration.status !== "active") {
          await db
            .update(workspaceIntegrations)
            .set({
              status: "active",
              config: {
                ...(existingIntegration.config as object || {}),
                provider: item.provider,
                envKey: item.envKey,
                maskedPreview,
                configured: true,
              },
              updatedAt: new Date(),
            })
            .where(eq(workspaceIntegrations.id, existingIntegration.id));
        }
      }
    }
  } catch (err: any) {
    // Re-throw so callers can retry (boot wrapper in index.ts). Original
    // behavior only warned, which let a cold-start failure silently disable
    // vault sync for the entire process lifetime.
    console.warn("[Vault Sync] Vault secret sync warning:", err?.message || err);
    throw err;
  }
}
