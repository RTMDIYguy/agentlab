#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

console.log("=================================================");
console.log("  AGENT LAB DOCUMENTATION DRIFT SCANNER");
console.log("  Canonical Registry vs. Operational Catalog");
console.log("=================================================\n");

const registryDir = path.join(root, "governance", "registry");
const operationsDir = path.join(root, "docs", "operations");

if (!fs.existsSync(registryDir)) {
  console.error("❌ Error: governance/registry directory not found.");
  process.exit(1);
}

// Gather all markdown files in docs/operations recursively
function getMarkdownFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getMarkdownFiles(fullPath));
    } else if (file.endsWith(".md")) {
      results.push(path.relative(root, fullPath).replace(/\\/g, "/"));
    }
  }
  return results;
}

const operationalDocs = getMarkdownFiles(operationsDir);
const additionalDocs = [
  "governance/README.md",
  "governance/current-state-reconciliation.md",
  "Agent Task Queue.md",
  "Agent Consolidation Blueprint.md",
  "workflows/marketing-founder-signal-system/offer-one-pager.md",
];

const allDocs = Array.from(new Set([...operationalDocs, ...additionalDocs])).filter(
  doc => fs.existsSync(path.join(root, doc))
);

const findings = [];

function parseFrontmatter(content) {
  if (!content.startsWith("---")) return null;
  const endIdx = content.indexOf("\n---", 3);
  if (endIdx === -1) return null;
  const fmBlock = content.substring(3, endIdx);
  const metadata = {};
  for (const line of fmBlock.split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx > 0) {
      const key = line.substring(0, colonIdx).trim();
      const val = line.substring(colonIdx + 1).trim().replace(/^["']|["']$/g, "");
      metadata[key] = val;
    }
  }
  return metadata;
}

function isHistorical(relPath, metadata) {
  if (metadata) {
    if (
      metadata.authority_level === "historical" ||
      metadata.status === "historical" ||
      metadata.status === "archived" ||
      metadata.status === "deprecated" ||
      metadata.document_type === "reconciliation_report" ||
      metadata.document_type === "drift_report" ||
      metadata.document_type === "audit_ledger"
    ) {
      return true;
    }
  }
  const basename = path.basename(relPath).toLowerCase();
  if (
    basename.startsWith("session-handoff-") ||
    basename.includes("-audit-") ||
    basename.includes("-recap-") ||
    basename.includes("drift-report") ||
    basename.includes("current-state-reconciliation") ||
    relPath.includes("bootstrapper-uploads") ||
    relPath.includes("versions/")
  ) {
    return true;
  }
  return false;
}

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
  const metadata = parseFrontmatter(content);
  const historical = isHistorical(relPath, metadata);

  // If document is historical/archived, skip technology drift checks
  if (historical) {
    return;
  }

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

  // Test 2: Platform decisions marked pending when Cloud Run + Postgres are active
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

  // Test 3: Terminology collision check (Workspace vs Project folder)
  if (
    content.includes("project folder") &&
    (content.includes("workspace_id") || relPath.includes("schema"))
  ) {
    findings.push({
      severity: "MEDIUM",
      doc: relPath,
      message: "Potential terminology collision: 'project folder' used in place of canonical 'Workspace'.",
      canonical: "Workspace (isolated tenant environment)",
      observed: "project folder",
    });
  }
}

for (const doc of allDocs) {
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

console.log(`Scanned ${allDocs.length} documents across operations catalog.`);
console.log(`Findings Summary:`);
console.log(`  🔴 Critical : ${criticalCount}`);
console.log(`  🟠 High     : ${highCount}`);
console.log(`  🟡 Medium   : ${mediumCount}`);
console.log(`  🟢 Low      : ${lowCount}\n`);

if (findings.length === 0) {
  console.log("✅ All operational documents are consistent with the Canonical Registry!\n");
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
