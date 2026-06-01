#!/usr/bin/env node
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const runDir = mkdtempSync(path.join(tmpdir(), "mkt06-proof-"));
const driverPath = path.resolve(
  "mkt-06-content-creation-dissemination/src/canary/run-canary.mjs"
);
const evidencePath = path.join(runDir, "proof-evidence.json");
const outputPath = path.join(runDir, "proof-log.csv");

const proofFiles = [
  "content-brief.md",
  "task-record.md",
  "source-draft.md",
  "repo-artifact.md",
  "editorial-approval.md",
  "seo-check.md",
  "adaptation.md",
  "distribution-proof.md",
  "performance-tracker-row.md",
];

mkdirSync(path.join(runDir, "evidence"));
for (const file of proofFiles) {
  writeFileSync(path.join(runDir, "evidence", file), `# ${file}\n`);
}

writeFileSync(
  evidencePath,
  JSON.stringify(
    Object.fromEntries(
      proofFiles.map((file, idx) => [
        String(idx + 1),
        {
          completed: true,
          evidenceUrl: `evidence/${file}`,
          notes: `Checkpoint ${idx + 1} has concrete proof.`,
        },
      ])
    ),
    null,
    2
  )
);

const output = execFileSync(
  process.execPath,
  [
    driverPath,
    "--mode",
    "proof",
    "--date",
    "2026-05-31",
    "--label",
    "strict-proof",
    "--evidence-file",
    evidencePath,
    "--output-file",
    outputPath,
  ],
  {
    cwd: runDir,
    env: { PATH: process.env.PATH ?? "" },
    encoding: "utf8",
  }
);

assert.match(output, /Final decision: Pass\n/);
const csv = readFileSync(outputPath, "utf8");
assert.match(csv, /jira_ticket,true,false,evidence\/task-record.md/);
assert.doesNotMatch(csv, /Manual Workarounds/);
assert.doesNotMatch(csv, /fallback language/i);

console.log("run-canary proof mode test passed");
