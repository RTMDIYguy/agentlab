/**
 * Run-evidence citation tests (2026-09-27, CC-2026-09-25-014 follow-up).
 *
 * The ops agent once attributed a Sept-5 failure of "Daily Agency Operations
 * & State Report" to the RoundTable DAG because the telemetry fed it a bare
 * UUID wall. Every run citation the agent sees must now carry the joined
 * workflow NAME and the run's DATE next to the id.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { formatRunEvidence } from "./orchestrator";

const here = dirname(fileURLToPath(import.meta.url));

const NAMES = new Map<string, string>([
  ["c93d4c1c-891a-4894-8fe8-a23efadea0bb", "Founder RoundTable Post-Event Engagement & Nurture"],
  ["c8b910e7-3aed-4d90-9417-f843bfc48c94", "Daily Agency Operations & State Report"],
]);

describe("formatRunEvidence", () => {
  it("cites the joined workflow NAME, id, run date, and recorded error", () => {
    const line = formatRunEvidence(
      {
        id: "c5a8f2d5-150e-4eee-b6d0-df57c10d8a86",
        workflowId: "c93d4c1c-891a-4894-8fe8-a23efadea0bb",
        createdAt: new Date("2026-09-27T21:15:55.026Z"),
        status: "failed",
        errorMessage: "Action draft invalid: unknown or missing connector",
      },
      NAMES
    );
    expect(line).toContain('workflow "Founder RoundTable Post-Event Engagement & Nurture"');
    expect(line).toContain("c93d4c1c-891a-4894-8fe8-a23efadea0bb");
    expect(line).toContain("2026-09-27");
    expect(line).toContain("Action draft invalid");
  });

  it("says 'unknown workflow' instead of inventing a name, and still cites the id", () => {
    const line = formatRunEvidence(
      {
        id: "e977032c-e3a2-4214-8929-b0782b1864e4",
        workflowId: "c8b910e7-3aed-4d90-9417-f843bfc48c94",
        createdAt: "2026-09-05T01:53:23.092Z",
        status: "failed",
        errorMessage: "Agent execution failed capability check",
      },
      new Map() // name unresolvable — must not be fabricated
    );
    expect(line).toContain('workflow "unknown workflow"');
    expect(line).toContain("c8b910e7-3aed-4d90-9417-f843bfc48c94");
    expect(line).toContain("2026-09-05");
  });

  it("marks an unparseable or missing date as 'date unknown' rather than guessing", () => {
    const line = formatRunEvidence(
      { id: "r1", workflowId: "c93d4c1c-891a-4894-8fe8-a23efadea0bb", createdAt: null, status: "failed" },
      NAMES
    );
    expect(line).toContain("date unknown");
  });

  it("cites a recorded status for completed runs (no invented error text)", () => {
    const line = formatRunEvidence(
      {
        id: "a13239ba-0896-473d-bb2c-e5c9a4a0b14a",
        workflowId: "c8b910e7-3aed-4d90-9417-f843bfc48c94",
        createdAt: "2026-09-21T16:48:48.138Z",
        status: "completed",
        errorMessage: null,
      },
      NAMES
    );
    expect(line).toContain("status=completed");
    expect(line).toContain('workflow "Daily Agency Operations & State Report"');
  });

  it("never leaves a failed run without an outcome statement", () => {
    const line = formatRunEvidence(
      { id: "r2", workflowId: null, createdAt: null, status: "failed", errorMessage: null },
      NAMES
    );
    expect(line).toContain("no recorded error message");
    expect(line).toContain("workflow id n/a");
  });
});

describe("evidence-hygiene source pins (regression against silent removal)", () => {
  it("watchdogTick no longer maps workflowName: null", () => {
    const src = readFileSync(join(here, "ops-watchdog.ts"), "utf8");
    expect(src).not.toMatch(/workflowName:\s*null/);
    expect(src).toContain("resolveWorkflowNames");
  });

  it("the ops-agent system prompt carries the EVIDENCE CITATION RULE", () => {
    const src = readFileSync(join(here, "orchestrator.ts"), "utf8");
    expect(src).toContain("EVIDENCE CITATION RULE");
    expect(src).toContain("formatRunEvidence");
  });
});
