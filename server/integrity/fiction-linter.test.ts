/**
 * Fiction linter tests.
 *
 * Part 1: unit tests of the rule engine against synthetic fixtures
 * (each audit fiction class must be caught; honest variants must pass).
 *
 * Part 2: the live workspace scan — this test FAILS the suite when any
 * new fabricated telemetry appears in client pages/components or server
 * controllers/execution code. This is the CI guard the audit lacked.
 */

import { describe, expect, it } from "vitest";
import {
  lintSource,
  lintWorkspace,
  formatReport,
  isAllowlisted,
  FICTION_RULES,
  type AllowlistEntry,
} from "./fiction-linter";
import { FICTION_ALLOWLIST } from "./fiction-allowlist";

describe("fiction linter — rule engine (synthetic fixtures)", () => {
  it("catches every audit fiction class", () => {
    const fixtures: Array<[string, string, string]> = [
      // [rule id, offending line, honest variant]
      [
        "fabricated-latency",
        `Avg Latency: 450ms`,
        `Avg Latency: \${telemetry.lastStepLatencyMs ?? "not reported"}`,
      ],
      [
        "fabricated-cost",
        `Cost: $12.50`,
        `Spend: \${formatUsd(telemetry.totalCost)}`,
      ],
      [
        "fabricated-uptime",
        `Uptime: 99.9%`,
        `Uptime: \${agent.realUptime}%`,
      ],
      [
        "fabricated-uptime",
        `Cloud SLA 99.7% guaranteed`,
        `SLA: see vendor contract`,
      ],
      [
        "fabricated-rate",
        `30%+ response rate guaranteed`,
        `Response rate: \${stats.successRate}%`,
      ],
      [
        "fabricated-rate",
        `Conversion rate: 4.2%`,
        `Conversion data loads from CRM`,
      ],
      [
        "fabricated-seed-telemetry",
        `tasksCompleted: 3102,`,
        `tasksCompleted: 0,`,
      ],
      [
        "fabricated-seed-telemetry",
        `uptime: "99.9%"`,
        `uptime: null,`,
      ],
      [
        "hardcoded-connectivity",
        `const state = "CONNECTED";`,
        `const state = integrationStatus;`,
      ],
      [
        "false-liveness-claim",
        `Simulated Tools: 0 (100% Live)`,
        `Documentation Status: Descriptive Only`,
      ],
      [
        "unhedged-run-claim",
        `title: "DAG Execution Complete: 0 Drift"`,
        `title: "Demo simulation complete (not a real run)"`,
      ],
      [
        "unhedged-run-claim",
        `toast "Workflow execution triggered successfully"`,
        `toast "Workflow execution triggered (not a real run) — demo only"`,
      ],
    ];

    for (const [ruleId, bad, good] of fixtures) {
      const rule = FICTION_RULES.find((r) => r.id === ruleId);
      expect(rule, `rule ${ruleId} must exist`).toBeTruthy();
      expect(
        rule!.test(bad),
        `${ruleId} should fire on: ${bad}`
      ).toBe(true);
      expect(
        rule!.test(good),
        `${ruleId} should NOT fire on honest variant: ${good}`
      ).toBe(false);
    }
  });

  it("does not flag data-driven rendering (no literal digits)", () => {
    expect(lintSource("x.tsx", `latencyMs && \`${"${latencyMs}"}ms\``)).toHaveLength(0);
    expect(lintSource("x.tsx", `cost from \${total.toFixed(2)}`)).toHaveLength(0);
  });

  it("reports file, line, severity, hint", () => {
    const hits = lintSource(
      "client/src/pages/Foo.tsx",
      ["const a = 1;", "Uptime: 99.9% // fake", "const b = 2;"].join("\n")
    );
    expect(hits).toHaveLength(1);
    expect(hits[0].file).toBe("client/src/pages/Foo.tsx");
    expect(hits[0].line).toBe(2);
    expect(hits[0].severity).toBe("P1");
    expect(hits[0].hint).toMatch(/real history/);
  });
});

describe("fiction linter — allowlist", () => {
  it("exempts documented entries and reports their reason", () => {
    const allowlist: AllowlistEntry[] = [
      { file: "pages/Demo.tsx", rule: "*", reason: "Explicitly labeled demo widget" },
    ];
    const hits = lintSource("client/src/pages/Demo.tsx", "Uptime: 99.9%");
    expect(hits).toHaveLength(1);
    const entry = isAllowlisted(hits[0], allowlist);
    expect(entry?.reason).toMatch(/labeled demo/);
  });
});

describe("fiction linter — LIVE workspace scan", () => {
  const result = lintWorkspace(undefined, FICTION_ALLOWLIST);

  it("scans a real set of files", () => {
    expect(result.scannedFiles).toBeGreaterThan(30);
  });

  it("finds zero unallowlisted fabricated-data sites in the repo", () => {
    const report = formatReport(result);
    expect(
      result.unallowlisted,
      `\n\n${report}\n\n^ Fix the code, or add a documented reason to server/integrity/fiction-allowlist.ts`
    ).toHaveLength(0);
  });

  it("documents every exception with a non-empty reason", () => {
    for (const entry of FICTION_ALLOWLIST) {
      expect(
        entry.reason.trim().length,
        `allowlist entry for ${entry.file} needs a real reason`
      ).toBeGreaterThan(10);
    }
  });
});
