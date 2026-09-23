/**
 * Documented exceptions for the fiction linter.
 *
 * Every entry needs a non-empty `reason` reviewed in change control. An
 * allowlist entry is a claim that the flagged code is NOT fabricated data
 * presented as real — e.g. a data-driven status label, a comment documenting
 * removed fiction, or a value rendered from real measurement.
 *
 * To silence a hit: match `file` (substring, forward slashes) and `rule`
 * (a rule id or "*"), and state precisely why the hit is acceptable.
 * Prefer fixing the code over allowlisting it.
 */

import type { AllowlistEntry } from "./fiction-linter";

export const FICTION_ALLOWLIST: AllowlistEntry[] = [
  {
    file: "server/controllers/dashboard-telemetry.ts",
    rule: "*",
    reason:
      "JSDoc comments that document which hardcoded fictions (450ms, ONLINE, CONNECTED, $12.50/$443) this controller replaced — the audit narrative itself, not fabricated data.",
  },
  {
    file: "server/controllers/audit.ts",
    rule: "fabricated-cost",
    reason:
      "Comment explaining the honesty doctrine (removed fabricated cost; empty means zero, unknown means null) — documentation of removal, not a presented figure.",
  },
  {
    file: "client/src/pages/Dashboard.tsx",
    rule: "hardcoded-connectivity",
    reason:
      "Label rendered from the real telemetry endpoint's connected boolean (ternary on data, kept for belt-and-braces even after the ternary refinement).",
  },
  {
    file: "client/src/pages/Settings.tsx",
    rule: "hardcoded-connectivity",
    reason:
      "Label rendered from the integration's real status field (ternary on data); the second branch uppercases the actual stored status.",
  },
];
