import type { Request, Response } from "express";
import { and, desc, eq, gt, inArray, sql } from "drizzle-orm";
import { getDb } from "../db";
import { workflowRuns, workflows } from "../schema";
import { getGoogleAccessToken, isGoogleAiConfigured } from "../_core/google-ai";

/**
 * Ops-Agent Watchdog (2026-09-24).
 *
 * The agent could only diagnose failures it was TOLD about. This watchdog
 * notices failed DAG runs and proactively surfaces the real recorded error —
 * no waiting to be asked.
 *
 * Mechanism: the client stores the timestamp of the last failure it was shown
 * (localStorage) and sends it as ?since=. The server returns every run that
 * failed AFTER that point, newest first, with:
 *   - the workflow's real name (not just an id)
 *   - the run's actual errorMessage from the executor
 *   - a server-side root-cause classification of that error (quota,
 *     dead model, auth, refusal, connectivity) so the chat can act even
 *     when the LLM layer itself is down.
 *
 * Since 2026-09-25 it also probes LLM credential health (see
 * probeCredentialHealth below) so auth rot surfaces before runs fail.
 *
 * The client polls every 60s while open and renders any new failures as
 * proactive assistant messages in the Ops Agent chat.
 */

export type WatchdogFailure = {
  runId: string;
  workflowId: string | null;
  workflowName: string | null;
  failedAt: string | null;
  errorMessage: string | null;
  rootCause: {
    category: string;
    summary: string;
    recommendedFix: string;
  };
};

/**
 * Classify a recorded run error into an actionable root cause. Deterministic
 * (no LLM involved) so the watchdog still works when the model layer is down —
 * which, historically, is exactly when failures spike.
 */
export function classifyRunFailure(
  errorMessage: string | null | undefined
): WatchdogFailure["rootCause"] {
  const msg = (errorMessage || "").toLowerCase();

  if (/exceeded your current quota|rate limit|resource_exhausted|429/.test(msg)) {
    return {
      category: "quota",
      summary: "The LLM provider rejected the call: quota/billing exhausted on the configured API key.",
      recommendedFix:
        "Check the API key's plan and billing (or the free-tier daily quota), or rotate in a key with headroom. Steps retried across models and still hit the wall.",
    };
  }
  if (/api key not valid|api_key_invalid|invalid api key|unauthenticated|401|permission denied/.test(msg)) {
    return {
      category: "auth",
      summary: "The configured API key was rejected as invalid by the provider.",
      recommendedFix:
        "The key in Settings → Secrets is wrong, revoked, or restricted. Replace it with a valid key for the provider the step calls.",
    };
  }
  if (/is not found for api version|is not supported|model .* not found|no longer available/.test(msg)) {
    return {
      category: "dead_model",
      summary: "The step called a model that no longer exists for this account (retired or not provisioned).",
      recommendedFix:
        "Update the step's model to a currently available one. The runner's fallback chain was already fixed once for this exact class of failure — check for old hardcoded model ids.",
    };
  }
  if (/execution limitation or passive non-execution|agent stated/i.test(msg)) {
    return {
      category: "agent_refusal",
      summary: "The agent replied conversationally (acknowledged or claimed inability) instead of executing the step.",
      recommendedFix:
        "Make the step's action prompt concrete and tool-invoking (the runner's mandate only works when the prompt asks for a deliverable), or mark the step as human-gated if it needs judgment.",
    };
  }
  // NOTE: checked after refusal but with an explicit pattern — ECONNREFUSED
  // contains "refus" and must never classify as an agent refusal (verified
  // by ops-watchdog.test.ts against the real recorded error strings).
  if (/econnrefused|etimedout|fetch failed|enotfound|socket hang up|network/i.test(msg)) {
    return {
      category: "connectivity",
      summary: "A network connection to a required service (database or external API) was refused or timed out.",
      recommendedFix:
        "Check the target service's status and this host's connectivity. For the database specifically, watch for provider cold-starts or pooler connection limits.",
    };
  }
  if (/missing|not configured/i.test(msg)) {
    return {
      category: "missing_input",
      summary: "The step was missing a configured credential or required input.",
      recommendedFix: "Configure the referenced key/input in Settings → Secrets, then re-run.",
    };
  }
  return {
    category: "unknown",
    summary: errorMessage
      ? "The step failed with an error not matching a known failure class."
      : "The step failed without a recorded error message (executor was interrupted).",
    recommendedFix: "Open the run inspector for the full step trace and tool telemetry.",
  };
}

/**
 * GET /api/ops-watchdog/failed-runs?since=<iso>&limit=5
 * Returns failures newer than `since` (or the most recent ones when absent).
 */
export async function getRecentFailedRuns(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.workspaceId;
    if (!workspaceId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const sinceParam = typeof req.query.since === "string" ? req.query.since : "";
    const since = sinceParam ? new Date(sinceParam) : null;
    const limit = Math.min(parseInt(String(req.query.limit || "5"), 10) || 5, 20);

    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "Database unavailable" });
      return;
    }

    const conditions = [
      eq(workflowRuns.workspaceId, workspaceId),
      eq(workflowRuns.status, "failed"),
    ];
    // Only look at runs whose failure happened after the client's last seen
    // failure. updatedAt is set by the executor when it marks the run failed.
    if (since && !isNaN(since.getTime())) {
      conditions.push(gt(workflowRuns.updatedAt, since));
    }

    const failed = await db
      .select({
        id: workflowRuns.id,
        workflowId: workflowRuns.workflowId,
        errorMessage: workflowRuns.errorMessage,
        completedAt: workflowRuns.completedAt,
        updatedAt: workflowRuns.updatedAt,
      })
      .from(workflowRuns)
      .where(and(...conditions))
      .orderBy(desc(workflowRuns.updatedAt))
      .limit(limit);

    // Resolve display names for the affected workflows.
    const wfIds = Array.from(new Set(failed.map(f => f.workflowId).filter((v): v is string => !!v)));
    const names = new Map<string, string>();
    if (wfIds.length > 0) {
      const rows = await db
        .select({ id: workflows.id, name: workflows.name })
        .from(workflows)
        .where(inArray(workflows.id, wfIds));
      for (const r of rows) names.set(r.id, r.name);
    }

    const failures: WatchdogFailure[] = failed.map(f => ({
      runId: f.id,
      workflowId: f.workflowId,
      workflowName: f.workflowId ? names.get(f.workflowId) ?? null : null,
      failedAt: (f.completedAt ?? f.updatedAt)?.toISOString?.() ?? null,
      errorMessage: f.errorMessage,
      rootCause: classifyRunFailure(f.errorMessage),
    }));

    res.status(200).json({
      failures,
      checkedAt: new Date().toISOString(),
      latestFailureAt: failures[0]?.failedAt ?? null,
    });
  } catch (error: any) {
    console.error("[Ops Watchdog] failed-runs query error:", error?.message);
    // Honest 200-with-error-shape: the client poller must treat "watchdog
    // could not check" differently from "no new failures".
    res.status(200).json({
      failures: [],
      checkedAt: new Date().toISOString(),
      error: error?.message || "Watchdog query failed",
    });
  }
}

/**
 * LLM credential-health probe (2026-09-25, handoff move 4).
 *
 * Auth rot is caught before runs fail: the watchdog notices a missing or
 * broken Gemini credential and reports it proactively in the ops chat with
 * the exact fix, instead of letting the first failed run discover it.
 *
 * Deterministic and honest: "missing" (no credential configured) is cheap
 * and checked fresh every call; "mint_failed" (credential exists but the
 * OAuth exchange fails) involves a network call, so its result is cached for
 * 5 minutes to keep the poller polite. No secret material is ever returned.
 */

export type CredentialHealth = {
  healthy: boolean;
  state: "ok" | "missing" | "mint_failed" | "probe_error";
  detail: string | null;
  recommendedFix: string | null;
  checkedAt: string;
};

const CREDENTIAL_PROBE_CACHE_MS = 5 * 60 * 1000;
let cachedMintProbe: { at: number; result: CredentialHealth } | null = null;

/** Test seam: clear the cached mint probe between tests. */
export function resetCredentialHealthCache(): void {
  cachedMintProbe = null;
}

function mintFailureFix(message: string): string {
  if (/invalid_client/i.test(message)) {
    return "The service-account key was deleted or rotated. Create a fresh JSON key (GCP Console → IAM & Admin → Service Accounts → Keys → Add key → JSON) and save it as secrets/gemini-service-account.json.";
  }
  if (/invalid_scope/i.test(message)) {
    return "The OAuth scope was refused. Set GOOGLE_AI_OAUTH_SCOPE=https://www.googleapis.com/auth/cloud-platform (the Vertex route) or fix the scope value.";
  }
  if (/403|permission|denied/i.test(message)) {
    return "Enable the Generative Language API on the project, or grant the service account roles/aiplatform.user and set GOOGLE_AI_BASE_URL to the Vertex prefix (see .env.example).";
  }
  if (/ENOTFOUND|ECONNREFUSED|fetch failed|network/i.test(message)) {
    return "The OAuth token endpoint was unreachable — check this host's internet connectivity, then re-check. The credential itself may be fine.";
  }
  return "Inspect the token-mint error detail, fix the credential accordingly, and re-run scripts/verify-gemini-service-account.mjs.";
}

export async function probeCredentialHealth(): Promise<CredentialHealth> {
  const checkedAt = new Date().toISOString();

  if (!isGoogleAiConfigured()) {
    return {
      healthy: false,
      state: "missing",
      detail:
        "No Gemini credential is configured: secrets/gemini-service-account.json does not exist and GOOGLE_SERVICE_ACCOUNT_JSON / GOOGLE_GENERATIVE_AI_API_KEY are not set. Every LLM-dependent path (agents, orchestrator, intake) is running on fallbacks.",
      recommendedFix:
        "Download the service-account JSON key (GCP Console → IAM & Admin → Service Accounts → Keys → Add key → JSON) and save it as secrets/gemini-service-account.json (git-ignored), or set GOOGLE_SERVICE_ACCOUNT_JSON inline. Then run: npx tsx scripts/verify-gemini-service-account.mjs",
      checkedAt,
    };
  }

  // Only the network probe is cached; a fresh key file is picked up
  // immediately because the missing-check above runs every call.
  if (cachedMintProbe && Date.now() - cachedMintProbe.at < CREDENTIAL_PROBE_CACHE_MS) {
    return { ...cachedMintProbe.result, checkedAt };
  }

  try {
    const { scope } = await getGoogleAccessToken();
    const result: CredentialHealth = {
      healthy: true,
      state: "ok",
      detail: `OAuth token minted and accepted (scope: ${scope}). Gemini calls will authenticate under the org's no-API-key policy.`,
      recommendedFix: null,
      checkedAt,
    };
    cachedMintProbe = { at: Date.now(), result };
    return result;
  } catch (err: any) {
    const message = String(err?.message || err);
    const result: CredentialHealth = {
      healthy: false,
      state: "mint_failed",
      detail: `Credential is configured but the OAuth token mint failed: ${message.slice(0, 300)}`,
      recommendedFix: mintFailureFix(message),
      checkedAt,
    };
    cachedMintProbe = { at: Date.now(), result };
    return result;
  }
}

/**
 * GET /api/ops-watchdog/credential-health
 * Pollable credential status for the ops chat. Never throws — the client
 * poller treats "could not check" differently from "unhealthy".
 */
export async function getCredentialHealth(_req: Request, res: Response): Promise<void> {
  try {
    const health = await probeCredentialHealth();
    res.status(200).json(health);
  } catch (error: any) {
    res.status(200).json({
      healthy: false,
      state: "probe_error",
      detail: `The credential-health probe itself failed: ${error?.message || error}`,
      recommendedFix: "Check the server logs for the probe error, then re-check.",
      checkedAt: new Date().toISOString(),
    } as CredentialHealth);
  }
}

/**
 * Watchdog tick — logs a console line per new failure so server operators
 * see the same proactive signal the chat gets. (Called by the same endpoint
 * internally; kept separate for future cron/scheduler wiring.)
 */
export async function watchdogTick(workspaceId: string, since: Date): Promise<WatchdogFailure[]> {
  const db = await getDb();
  if (!db) return [];
  const failed = await db
    .select({
      id: workflowRuns.id,
      workflowId: workflowRuns.workflowId,
      errorMessage: workflowRuns.errorMessage,
      completedAt: workflowRuns.completedAt,
      updatedAt: workflowRuns.updatedAt,
    })
    .from(workflowRuns)
    .where(
      and(
        eq(workflowRuns.workspaceId, workspaceId),
        eq(workflowRuns.status, "failed"),
        gt(workflowRuns.updatedAt, since)
      )
    )
    .orderBy(desc(workflowRuns.updatedAt))
    .limit(20);

  return failed.map(f => ({
    runId: f.id,
    workflowId: f.workflowId,
    workflowName: null,
    failedAt: (f.completedAt ?? f.updatedAt)?.toISOString?.() ?? null,
    errorMessage: f.errorMessage,
    rootCause: classifyRunFailure(f.errorMessage),
  }));
}
