/**
 * Fiction linter — regression guard for the 2026-09-23 honesty audit.
 *
 * Scans client pages/components and server controllers/execution code for
 * "fabricated data presented as real": hardcoded latencies, invented costs,
 * fake uptimes, seeded task counts, connectivity claims, and liveness claims
 * that no measurement backs.
 *
 * Design rule: every pattern requires LITERAL digits/strings. Data-driven
 * rendering (e.g. `${step.latencyMs}ms`) passes automatically because there
 * is no literal number in the source — which is exactly the distinction the
 * audit drew between telemetry and theater.
 *
 * Known-false-positive or explicitly-labeled-demo sites are allowlisted in
 * ./fiction-allowlist.ts with a non-empty documented reason.
 */

import { readdirSync, readFileSync } from "fs";
import path from "path";

export type FictionSeverity = "P1" | "P2" | "P3";

export interface FictionRule {
  id: string;
  severity: FictionSeverity;
  description: string;
  /** What to do when this fires. */
  hint: string;
  /** Returns true when the line is a violation. */
  test: (line: string) => boolean;
}

// ---- context matchers -------------------------------------------------------

const LATENCY_CONTEXT = /\b(latency|round[- ]?trip|response time|avg response)\b/i;
const MS_VALUE = /\b\d{1,5}\s*ms\b/;
const COST_CONTEXT = /\b(cost|costs|spend|saved|burn)\b/i;
const MONEY = /\$\s?\d{1,7}(?:[.,]\d{1,2})?\b/;
const UPTIME_CONTEXT = /\b(uptime|availability)\b|\bsla\b/i;
const PERCENT = /\b\d{1,3}(?:\.\d+)?\s?%/;
const RATE_CONTEXT =
  /\b(success rate|response rate|error rate|conversion rate|accuracy)\b/i;
const CONNECTIVITY_LITERAL = /["'](CONNECTED|ONLINE)["']/;
// A ternary on real data (`x.connected ? "CONNECTED" : "NOT CONNECTED"`) is
// data-driven presentation, not a claim — only bare literals are fiction.
const TERNARY = /\?[^\n]*:/;
const FALSE_LIVENESS = /\b(100%\s*live|0 simulated|zero simulated)\b/i;
const SEED_NONZERO_UPTIME = /\buptime:\s*["']?[1-9]/;
const SEED_BIG_COUNT = /\b(?:tasksCompleted|tasks_completed|messagesSent|messages_sent):\s*["']?\d{3,}\b/;
const RUN_CLAIM = /\b(execution triggered|execution complete)\b/i;
const RUN_HEDGE = /\b(not a real run|demo|simulated|simulation)\b/i;

export const FICTION_RULES: FictionRule[] = [
  {
    id: "fabricated-latency",
    severity: "P1",
    description: "Hardcoded latency number presented alongside latency wording",
    hint:
      "Latency must come from real measurements (workflow_run_steps.latencyMs / llm-ping). Render `${value}ms` from data, not a literal.",
    test: (line) => LATENCY_CONTEXT.test(line) && MS_VALUE.test(line),
  },
  {
    id: "fabricated-cost",
    severity: "P1",
    description: "Hardcoded money amount presented alongside cost/spend wording",
    hint:
      "Cost must be summed from real workflow_run_steps rows. Render from data; marketing prices (no cost wording) are fine.",
    test: (line) => COST_CONTEXT.test(line) && MONEY.test(line),
  },
  {
    id: "fabricated-uptime",
    severity: "P1",
    description: "Hardcoded uptime/availability percentage or SLA claim",
    hint:
      "There is no uptime measurement in this system. Remove the claim or compute it from real history.",
    test: (line) => UPTIME_CONTEXT.test(line) && PERCENT.test(line),
  },
  {
    id: "fabricated-rate",
    severity: "P1",
    description: "Hardcoded success/response/error/conversion rate percentage",
    hint:
      "Rates must be computed from real run history (e.g. per-agent success rate). Never a literal.",
    test: (line) => RATE_CONTEXT.test(line) && PERCENT.test(line),
  },
  {
    id: "fabricated-seed-telemetry",
    severity: "P1",
    description: "Seeded/initial telemetry counters with invented values",
    hint:
      "Seed identity-only (name, role, model, status idle). Numbers accumulate from real executions.",
    test: (line) => SEED_NONZERO_UPTIME.test(line) || SEED_BIG_COUNT.test(line),
  },
  {
    id: "hardcoded-connectivity",
    severity: "P2",
    description: 'String literal claiming a service is "CONNECTED"/"ONLINE"',
    hint:
      "Connection state must come from vault-synced integrations or a real health check.",
    test: (line) =>
      CONNECTIVITY_LITERAL.test(line) && !TERNARY.test(line),
  },
  {
    id: "false-liveness-claim",
    severity: "P2",
    description: 'Claims like "100% live" or "0 simulated tools"',
    hint:
      "Describe surfaces as what they are. Verification comes from the honesty audit, not a hardcoded badge.",
    test: (line) => FALSE_LIVENESS.test(line),
  },
  {
    id: "unhedged-run-claim",
    severity: "P2",
    description:
      '"Execution triggered/complete" message without a demo/simulation hedge',
    hint:
      'Demo interactions must say so: "(not a real run)". Real executions report real run state.',
    test: (line) => RUN_CLAIM.test(line) && !RUN_HEDGE.test(line),
  },
];

// ---- engine -----------------------------------------------------------------

export interface FictionHit {
  file: string;
  line: number;
  ruleId: string;
  severity: FictionSeverity;
  description: string;
  hint: string;
  excerpt: string;
}

export interface AllowlistEntry {
  /** Substring matched against the normalized (forward-slash) file path. */
  file: string;
  /** Rule id, or "*" for any rule. */
  rule: string;
  /** Required non-empty justification. */
  reason: string;
}

export function lintSource(filePath: string, source: string): FictionHit[] {
  const hits: FictionHit[] = [];
  const lines = source.split(/\r?\n/);
  lines.forEach((line, idx) => {
    for (const rule of FICTION_RULES) {
      if (rule.test(line)) {
        hits.push({
          file: filePath,
          line: idx + 1,
          ruleId: rule.id,
          severity: rule.severity,
          description: rule.description,
          hint: rule.hint,
          excerpt: line.trim().slice(0, 160),
        });
      }
    }
  });
  return hits;
}

function normalize(p: string): string {
  return p.replace(/\\/g, "/");
}

export function isAllowlisted(
  hit: FictionHit,
  allowlist: AllowlistEntry[]
): AllowlistEntry | undefined {
  return allowlist.find(
    (entry) =>
      normalize(hit.file).includes(normalize(entry.file)) &&
      (entry.rule === "*" || entry.rule === hit.ruleId)
  );
}

const SCAN_DIRS = [
  "client/src/pages",
  "client/src/components",
  "server/controllers",
  "server/execution",
];

const TEST_FILE = /[.](test|spec)[.]tsx?$/;

function listSourceFiles(dir: string, root: string): string[] {
  let entries;
  try {
    entries = readdirSync(path.resolve(root, dir), {
      withFileTypes: true,
      recursive: true,
    });
  } catch {
    return [];
  }
  return entries
    .filter(
      (e) =>
        e.isFile() && /\.(ts|tsx)$/.test(e.name) && !TEST_FILE.test(e.name)
    )
    .map((e) => normalize(path.join(e.parentPath ?? dir, e.name)));
}

export interface WorkspaceLintResult {
  scannedFiles: number;
  unallowlisted: FictionHit[];
  allowlisted: Array<FictionHit & { reason: string }>;
}

/**
 * Scans the live workspace relative to `root` (default: repo root inferred
 * from this file's location). Excludes *.test.ts — regression tests are the
 * one legitimate home for known-fiction strings (they assert their absence).
 */
export function lintWorkspace(
  root: string = path.resolve(import.meta.dirname, "..", ".."),
  allowlist: AllowlistEntry[] = []
): WorkspaceLintResult {
  const files = SCAN_DIRS.flatMap((dir) => listSourceFiles(dir, root));
  const unallowlisted: FictionHit[] = [];
  const allowlisted: Array<FictionHit & { reason: string }> = [];
  for (const file of files) {
    let source: string;
    try {
      source = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    for (const hit of lintSource(file, source)) {
      const entry = isAllowlisted(hit, allowlist);
      if (entry) allowlisted.push({ ...hit, reason: entry.reason });
      else unallowlisted.push(hit);
    }
  }
  return { scannedFiles: files.length, unallowlisted, allowlisted };
}

export function formatReport(result: WorkspaceLintResult): string {
  if (result.unallowlisted.length === 0) {
    return `Fiction linter: clean (${result.scannedFiles} files scanned, ${result.allowlisted.length} documented exception(s))`;
  }
  const lines = [
    `Fiction linter: ${result.unallowlisted.length} unallowlisted hit(s) across ${result.scannedFiles} files:`,
  ];
  for (const hit of result.unallowlisted) {
    lines.push(
      `  ${hit.file}:${hit.line} [${hit.severity}] ${hit.ruleId} — ${hit.description}`,
      `    ${hit.excerpt}`,
      `    → ${hit.hint}`,
      `    (or add a documented entry to server/integrity/fiction-allowlist.ts)`
    );
  }
  return lines.join("\n");
}
