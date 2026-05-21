#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import assert from "node:assert/strict";

const runDir = mkdtempSync(path.join(tmpdir(), "mkt06-canary-"));
const driverPath = path.resolve(
  "mkt-06-content-creation-dissemination/src/canary/run-canary.mjs"
);
const evidencePath = path.join(runDir, "manual-evidence.json");

writeFileSync(
  evidencePath,
  JSON.stringify(
    {
      2: {
        completed: false,
        skipped: true,
        fallback: "Manual task record created in local canary packet",
      },
      3: {
        completed: true,
        evidenceUrl: "canary-runs/WF6-CANARY-20260521/source-draft.md",
      },
      8: {
        completed: false,
        skipped: true,
        fallback: "Distribution preview represented by local email/social adaptation files",
      },
      9: {
        completed: true,
        evidenceUrl: "canary-runs/WF6-CANARY-20260521/performance-tracker-row.md",
      },
    },
    null,
    2
  )
);

const output = execFileSync(
  process.execPath,
  [
    driverPath,
    "--mode",
    "manual",
    "--date",
    "2026-05-21",
    "--label",
    "internal-verification",
    "--evidence-file",
    evidencePath,
  ],
  {
    cwd: runDir,
    env: { PATH: process.env.PATH ?? "" },
    encoding: "utf8",
  }
);

assert.match(output, /Final decision: Pass with Manual Workarounds/);
const csv = readFileSync(
  path.join(runDir, "MKT-06-Canary-Evidence-Log-2026-05-21.csv"),
  "utf8"
);
assert.match(csv, /source_draft,true/);
assert.match(csv, /Manual task record created in local canary packet/);

console.log("run-canary manual mode test passed");
