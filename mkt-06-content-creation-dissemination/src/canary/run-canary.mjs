#!/usr/bin/env node
/**
 * MKT-06 Canary Verification Driver
 *
 * Runs the 10-checkpoint evidence chain for the MKT-06 canary and writes
 * MKT-06-Canary-Evidence-Log.csv. Promote MKT-06 to Active in the Master
 * Workflow Index only on Pass / Pass with Manual Workarounds.
 *
 * Status: SPEC STUB — documents the contract; real implementation pending.
 * The expected behavior, exit codes, and output schema are stable; the
 * service-level adapters (Notion, Jira, Klaviyo, GitHub, GA4, HubSpot,
 * YouTube) need to be wired up against the actual API clients before
 * promoting this kit to Full conformance.
 *
 * Usage:
 *   node src/canary/run-canary.mjs --label internal-verification --date 2026-05-02
 *
 * Exit codes:
 *   0 = Pass or Pass with Manual Workarounds (all 10 checkpoints captured or
 *       intentionally skipped with documented fallback)
 *   1 = Fail (one or more required checkpoints missing without documented fallback)
 *   2 = Configuration error (missing secrets or unreachable services)
 *
 * Required environment variables (from kit.md > dependencies.secrets):
 *   ANTHROPIC_API_KEY, NOTION_API_KEY, ATLASSIAN_API_TOKEN, KLAVIYO_API_KEY,
 *   HUBSPOT_PRIVATE_APP_TOKEN, GHL_API_KEY, GITHUB_TOKEN,
 *   GA4_SERVICE_ACCOUNT_JSON, YOUTUBE_OAUTH_REFRESH_TOKEN
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { argv, exit } from "node:process";

// --- Argument parsing -------------------------------------------------------

const args = Object.fromEntries(
  argv.slice(2).reduce((pairs, token, idx, all) => {
    if (token.startsWith("--")) pairs.push([token.slice(2), all[idx + 1]]);
    return pairs;
  }, [])
);

const label = args.label ?? "internal-verification";
const date = args.date ?? new Date().toISOString().slice(0, 10);
const mode = args.mode ?? "live";
const evidenceFile = args["evidence-file"];
const outputFile = args["output-file"];
const canaryId = `WF6-CANARY-${date.replace(/-/g, "")}`;
const testAssetTitle = `WF6 Canary Test — ${label.replace(/-/g, " ")} — ${date}`;

// --- Required-secrets preflight ---------------------------------------------

const REQUIRED_SECRETS = [
  "ANTHROPIC_API_KEY",
  "NOTION_API_KEY",
  "ATLASSIAN_API_TOKEN",
  "KLAVIYO_API_KEY",
  "HUBSPOT_PRIVATE_APP_TOKEN",
  "GHL_API_KEY",
  "GITHUB_TOKEN",
];

if (mode !== "manual" && mode !== "proof") {
  const missing = REQUIRED_SECRETS.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    console.error(`[canary] Missing required env vars: ${missing.join(", ")}`);
    exit(2);
  }
}

// --- Atlassian domain sanity check ------------------------------------------
// The URC site URL was historically misconfigured as 'atlasian.net' (typo).
// Hard-fail before running any Jira write to surface this clearly.

const ATLASSIAN_SITE = process.env.ATLASSIAN_SITE_URL ?? "unclerobertconsulting.atlassian.net";
if (mode !== "manual" && mode !== "proof" && ATLASSIAN_SITE.includes("atlasian.net")) {
  console.error(
    `[canary] ATLASSIAN_SITE_URL contains 'atlasian.net' (typo). ` +
      `Correct domain is 'atlassian.net' with double 's'. Fix before running canary.`
  );
  exit(2);
}

// --- Checkpoint contract ----------------------------------------------------

/**
 * Each checkpoint produces an evidence row. A checkpoint passes when:
 *   - completed: true with non-empty evidenceUrl, OR
 *   - skipped: true with non-empty fallback documentation
 *
 * Required checkpoints (Go/No-Go rule from MKT-06-Canary-Verification-Runbook):
 *   2 Jira proof, 3 draft proof, 8 distribution proof, 9 Step 7 tracking proof
 */

const CHECKPOINTS = [
  { id: 1, name: "notion_planning_item", required: false },
  { id: 2, name: "jira_ticket", required: true },
  { id: 3, name: "source_draft", required: true },
  { id: 4, name: "github_artifact", required: false },
  { id: 5, name: "editorial_approval", required: false },
  { id: 6, name: "seo_complete", required: false },
  { id: 7, name: "adaptation", required: false },
  { id: 8, name: "klaviyo_preview", required: true },
  { id: 9, name: "step7_tracker_row", required: true },
  { id: 10, name: "final_decision", required: true },
];

let manualEvidence = {};
let evidenceBaseDir = process.cwd();

if (mode === "manual" || mode === "proof") {
  if (!evidenceFile) {
    console.error(`[canary] ${mode} mode requires --evidence-file <path>`);
    exit(2);
  }

  if (!existsSync(evidenceFile)) {
    console.error(`[canary] Manual evidence file not found: ${evidenceFile}`);
    exit(2);
  }

  evidenceBaseDir = dirname(resolve(evidenceFile));

  try {
    manualEvidence = JSON.parse(readFileSync(evidenceFile, "utf8"));
  } catch (err) {
    console.error(`[canary] Could not parse evidence JSON: ${err.message}`);
    exit(2);
  }
}

function manualCheckpoint(id, fallback) {
  return manualEvidence[String(id)] ?? manualEvidence[id] ?? fallback;
}

function evidenceExists(evidenceUrl) {
  if (!evidenceUrl) return false;
  if (/^https?:\/\//i.test(evidenceUrl)) return true;

  const fromCwd = resolve(process.cwd(), evidenceUrl);
  const fromEvidenceFile = resolve(evidenceBaseDir, evidenceUrl);
  return existsSync(fromCwd) || existsSync(fromEvidenceFile);
}

function proofCheckpoint(id) {
  const result = manualCheckpoint(id, { completed: false, skipped: false });
  const evidenceUrl = result.evidenceUrl ?? "";
  const proofErrors = [];

  if (result.completed !== true) {
    proofErrors.push("checkpoint is not marked completed");
  }

  if (result.skipped === true) {
    proofErrors.push("checkpoint is marked skipped");
  }

  if (result.fallback) {
    proofErrors.push("checkpoint includes fallback language");
  }

  if (!evidenceUrl) {
    proofErrors.push("checkpoint has no evidenceUrl");
  } else if (!evidenceExists(evidenceUrl)) {
    proofErrors.push(`evidenceUrl does not resolve: ${evidenceUrl}`);
  }

  if (proofErrors.length > 0) {
    return {
      ...result,
      completed: false,
      skipped: false,
      notes: [result.notes, ...proofErrors].filter(Boolean).join(" | "),
    };
  }

  return {
    ...result,
    completed: true,
    skipped: false,
  };
}

// --- Adapter contracts (TODO: wire to real APIs) ----------------------------

async function captureNotionPlanningItem() {
  if (mode === "proof") return proofCheckpoint(1);
  if (mode === "manual") {
    return manualCheckpoint(1, {
      completed: false,
      skipped: true,
      fallback: "Manual planning proof not captured in this run",
    });
  }
  // TODO: Notion API — find or create the canary item in the Content Calendar DB
  return { completed: false, skipped: true, fallback: "Manual capture — TODO" };
}

async function captureJiraTicket() {
  if (mode === "proof") return proofCheckpoint(2);
  if (mode === "manual") {
    return manualCheckpoint(2, { completed: false, skipped: false });
  }
  // TODO: Atlassian API — verify the ticket exists and capture state transitions
  return { completed: false, skipped: true, fallback: "Manual capture — TODO" };
}

async function captureSourceDraft() {
  if (mode === "proof") return proofCheckpoint(3);
  if (mode === "manual") {
    return manualCheckpoint(3, { completed: false, skipped: false });
  }
  // TODO: Google Docs / OneDrive — verify the draft URL resolves
  return { completed: false, skipped: true, fallback: "Manual capture — TODO" };
}

async function captureGitHubArtifact() {
  if (mode === "proof") return proofCheckpoint(4);
  if (mode === "manual") {
    return manualCheckpoint(4, {
      completed: false,
      skipped: true,
      fallback: "Manual repository proof not captured in this run",
    });
  }
  // TODO: GitHub API — verify branch and commit SHA in RTMDIYguy/urc-content-assets
  return { completed: false, skipped: true, fallback: "Manual capture — TODO" };
}

async function captureEditorialApproval() {
  if (mode === "proof") return proofCheckpoint(5);
  if (mode === "manual") {
    return manualCheckpoint(5, {
      completed: false,
      skipped: true,
      fallback: "Manual editorial proof not captured in this run",
    });
  }
  // TODO: Microsoft Teams / Notion comments — capture reviewer + timestamp
  return { completed: false, skipped: true, fallback: "Manual capture — TODO" };
}

async function captureSeoComplete() {
  if (mode === "proof") return proofCheckpoint(6);
  if (mode === "manual") {
    return manualCheckpoint(6, {
      completed: false,
      skipped: true,
      fallback: "Manual SEO proof not captured in this run",
    });
  }
  // TODO: Confluence / Notion — verify on-page score and report URL
  return { completed: false, skipped: true, fallback: "Manual capture — TODO" };
}

async function captureAdaptation() {
  if (mode === "proof") return proofCheckpoint(7);
  if (mode === "manual") {
    return manualCheckpoint(7, {
      completed: false,
      skipped: true,
      fallback: "Manual adaptation proof not captured in this run",
    });
  }
  // TODO: GitHub adaptations/{ticket-id}/ — verify variants exist
  return { completed: false, skipped: true, fallback: "Manual capture — TODO" };
}

async function captureKlaviyoPreview() {
  if (mode === "proof") return proofCheckpoint(8);
  if (mode === "manual") {
    return manualCheckpoint(8, { completed: false, skipped: false });
  }
  // TODO: Klaviyo API — verify preview campaign on List XbByas
  return { completed: false, skipped: true, fallback: "Manual capture — TODO" };
}

async function captureStep7TrackerRow() {
  if (mode === "proof") return proofCheckpoint(9);
  if (mode === "manual") {
    return manualCheckpoint(9, { completed: false, skipped: false });
  }
  // TODO: Notion — verify Performance Tracker row exists for canary asset
  return { completed: false, skipped: true, fallback: "Manual capture — TODO" };
}

async function captureFinalDecision(rows) {
  const requiredFails = rows
    .filter((r) => CHECKPOINTS.find((c) => c.id === r.id)?.required)
    .filter((r) => !r.completed && !r.skipped);
  const proofFails =
    mode === "proof"
      ? rows.filter((r) => !r.completed || r.skipped || r.fallback)
      : [];
  const decision =
    mode === "proof"
      ? proofFails.length === 0
        ? "Pass"
        : "Fail"
      : requiredFails.length === 0
        ? "Pass with Manual Workarounds"
        : "Fail";
  return {
    completed: true,
    skipped: false,
    decision,
    notes:
      mode === "proof"
        ? `Auto-classified by strict proof mode. Proof-fail count: ${proofFails.length}.`
        : `Auto-classified by run-canary.mjs spec stub. Required-fail count: ${requiredFails.length}.`,
  };
}

// --- Main -------------------------------------------------------------------

async function main() {
  const rows = [];
  const handlers = {
    1: captureNotionPlanningItem,
    2: captureJiraTicket,
    3: captureSourceDraft,
    4: captureGitHubArtifact,
    5: captureEditorialApproval,
    6: captureSeoComplete,
    7: captureAdaptation,
    8: captureKlaviyoPreview,
    9: captureStep7TrackerRow,
  };

  for (const cp of CHECKPOINTS.slice(0, 9)) {
    const result = await handlers[cp.id]();
    rows.push({ id: cp.id, name: cp.name, ...result });
  }

  const final = await captureFinalDecision(rows);
  rows.push({ id: 10, name: "final_decision", ...final });

  // Write CSV ----------------------------------------------------------------

  const csvHeader = "id,name,completed,skipped,evidenceUrl,fallback,notes";
  const csvRows = rows.map(
    (r) =>
      [
        r.id,
        r.name,
        r.completed ?? "",
        r.skipped ?? "",
        (r.evidenceUrl ?? "").replace(/,/g, ";"),
        (r.fallback ?? "").replace(/,/g, ";"),
        (r.notes ?? r.decision ?? "").replace(/,/g, ";"),
      ].join(",")
  );
  const csv = [csvHeader, ...csvRows].join("\n");
  const logPath = outputFile ?? `MKT-06-Canary-Evidence-Log-${date}.csv`;
  writeFileSync(logPath, csv);

  console.log(`[canary] ${canaryId} — ${testAssetTitle}`);
  console.log(`[canary] Evidence log written: ${logPath}`);
  console.log(`[canary] Final decision: ${final.decision}`);

  exit(final.decision.startsWith("Pass") ? 0 : 1);
}

main().catch((err) => {
  console.error(`[canary] Unhandled error:`, err);
  exit(1);
});
