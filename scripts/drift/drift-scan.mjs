#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

console.log("=================================================");
console.log("  AGENT LAB DOCUMENTATION DRIFT SCANNER");
console.log("  Canonical Registry vs. Operational Documents");
console.log("=================================================\n");

const registryDir = path.join(root, "governance", "registry");
const docsToScan = [
  "docs/operations/agency-owners-manual.md",
  "docs/operations/urc-v1-operating-architecture.md",
  "docs/operations/urc-90-day-implementation-plan.md",
  "workflows/marketing-founder-signal-system/offer-one-pager.md",
];

if (!fs.existsSync(registryDir)) {
  console.error("❌ Error: governance/registry directory not found.");
  process.exit(1);
}

const findings = [];

function checkDocument(relPath) {
  const fullPath = path.join(root, relPath);
  if (!fs.existsSync(fullPath)) {
    findings.push({
      severity: "HIGH",
      doc: relPath,
      message: `Registered document missing from filesystem: ${relPath}`,
      canonical: "Document should exist",
      observed: "File not found",
    });
    return;
  }

  const content = fs.readFileSync(fullPath, "utf8");

  // Test 1: SQLite as production database conflict
  if (
    content.includes("Database = SQLite") ||
    content.includes("production database TBD") ||
    /SQLite for development.*production database TBD/i.test(content)
  ) {
    findings.push({
      severity: "CRITICAL",
      doc: relPath,
      message: "Outdated database definition (SQLite / TBD) found.",
      canonical: "PostgreSQL with Drizzle ORM (PLAT-POSTGRES)",
      observed: "SQLite / production database TBD",
    });
  }

  // Test 2: Google Cloud listed as unconfirmed/TBD when Cloud Run is active runtime
  if (
    content.includes("formal platform decisions pending") &&
    relPath.includes("agency-owners-manual.md")
  ) {
    findings.push({
      severity: "HIGH",
      doc: relPath,
      message: "Platform decisions marked pending when Cloud Run + Postgres are implemented in runtime.",
      canonical: "Cloud Run backend + PostgreSQL active (PLAT-GCP, PLAT-POSTGRES)",
      observed: "formal platform decisions pending",
    });
  }

  // Test 3: Missing YAML Frontmatter metadata
  if (!content.startsWith("---") || !content.includes("document_id:")) {
    findings.push({
      severity: "LOW",
      doc: relPath,
      message: "Missing standardized YAML frontmatter metadata header.",
      canonical: "document_id, authority_level, status required",
      observed: "No YAML frontmatter header found",
    });
  }

  // Test 4: Terminology collision check (Workspace vs Project folder)
  if (content.includes("project folder") && (content.includes("workspace_id") || relPath.includes("schema"))) {
    findings.push({
      severity: "MEDIUM",
      doc: relPath,
      message: "Potential terminology collision: 'project folder' used in place of canonical 'Workspace'.",
      canonical: "Workspace (isolated tenant environment)",
      observed: "project folder",
    });
  }
}

for (const doc of docsToScan) {
  checkDocument(doc);
}

let criticalCount = 0;
let highCount = 0;
let mediumCount = 0;
let lowCount = 0;

for (const f of findings) {
  if (f.severity === "CRITICAL") criticalCount++;
  if (f.severity === "HIGH") highCount++;
  if (f.severity === "MEDIUM") mediumCount++;
  if (f.severity === "LOW") lowCount++;
}

console.log(`Scanned ${docsToScan.length} documents against Canonical Registry.`);
console.log(`Findings Summary:`);
console.log(`  🔴 Critical : ${criticalCount}`);
console.log(`  🟠 High     : ${highCount}`);
console.log(`  🟡 Medium   : ${mediumCount}`);
console.log(`  🟢 Low      : ${lowCount}\n`);

if (findings.length === 0) {
  console.log("✅ All scanned documents are consistent with the Canonical Registry!\n");
  process.exit(0);
}

console.log("Detailed Findings:\n");
for (const f of findings) {
  const icon =
    f.severity === "CRITICAL"
      ? "🔴 [CRITICAL]"
      : f.severity === "HIGH"
      ? "🟠 [HIGH]"
      : f.severity === "MEDIUM"
      ? "🟡 [MEDIUM]"
      : "🟢 [LOW]";

  console.log(`${icon} in ${f.doc}`);
  console.log(`   Issue:     ${f.message}`);
  console.log(`   Canonical: ${f.canonical}`);
  console.log(`   Observed:  ${f.observed}\n`);
}

if (process.argv.includes("--strict") && (criticalCount > 0 || highCount > 0)) {
  console.error("❌ Drift scan failed in --strict mode due to CRITICAL/HIGH findings.");
  process.exit(1);
} else {
  console.log("ℹ️  Drift scan complete. Run with --strict in CI to enforce zero drift.");
}
