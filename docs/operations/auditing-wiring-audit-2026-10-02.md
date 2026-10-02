# Auditing Wiring Audit — 2026-10-02

**Document ID:** DOC-OPS-AUDITING-AUDIT-2026-10-02
**Scope:** the System Auditing & Governance surface (`client/src/pages/Auditing.tsx`), its controller (`server/controllers/audit.ts`), the tRPC `auditing` router, the audit-logger used by the execution pipeline, and every writer that inserts into `audit_logs`
**Method:** inventory → trace each control/number to route → controller → storage → **writer/consumer** → classify **WIRED / UNCONSUMED / FICTIONAL / BROKEN**. A control is WIRED only if changing it changes real behavior; a claim is WIRED only if the rows behind it exist.
**Companion register entry:** CC-2026-10-02-013
**Series:** requested directly by Robert mid-series (the approved order was Dashboard → Command Center → Agents → Apps; this page was skipped and is swept now as a supplementary entry).
**Trigger:** "I forgot all about this page … Useful but we need to make sure everything in it is accurate."

---

## Verdict at a glance

| # | Widget / control | Verdict |
|---|---|---|
| 1 | Stats query `GET /api/audit-logs/stats` (Pending Reviews, SAIF rate) | **WIRED** — pendingReviews counts real `paused_for_approval` runs; `saifComplianceRate` is real and null-honest post CC-012 |
| 2 | **"Total Events (24h)" tile** | **MISLEADING LABEL** — the server counts **all-time** (`count(*)` with no time predicate); live value 563 is the all-time total |
| 3 | **"Security Alerts" tile** | **FICTIONAL** — `let securityAlerts = 0;` is never assigned anywhere in `getAuditStats`; the tile always renders 0 under the caption "Zero unhandled breaches" |
| 4 | Log table, status tabs, search, details modal, CSV export | **WIRED** — server-side filter/search honest; CSV writes TRUE/FALSE/blank from real `policyChecks`; latency/tokens have honest "not reported" states |
| 5 | **"Pending Approval" tab + Approve/Reject buttons** | **UNREACHABLE** — no writer anywhere writes `requires_approval` to `audit_logs` (repo-wide grep; schema comment says `'success' | 'warning' | 'error'`); live probe `status=requires_approval` → 0 rows |
| 6 | **`POST /api/audit-logs/:id/approve` / `reject`** | **FICTIONAL — stubs** — both handlers only `console.log` and return `{success: true}`; no DB write, no run resumed, no run halted. The client toasts *"Workflow execution has resumed."* and *"The proposed mutation was safely halted."* The real Human-in-the-Loop approvals live in Command Center's Approval Queue (`paused_for_approval` runs) |
| 7 | **Details modal "SAIF Guardrails: PASSED"** | **FICTIONAL BY DEFAULT** — renders `saifPassed !== false ? "PASSED" : "FLAGGED"`, so **absent, null, or `evaluated:false` policy checks all display as PASSED**; since CC-012 the non-LLM rows carry `saifPassed: null` and would render as passed. `PII Detected: … \|\| 0` compounds it: not-evaluated renders "0 items" |
| 8 | **Per-step agent telemetry (the page's core promise: "agent telemetry traces")** | **BROKEN — nothing has ever been recorded** — `insertAuditLog` calls `db.insert("audit_logs")` with a **string** instead of the drizzle table object; drizzle's dialect reads `table[Symbol.Columns]` → undefined → TypeError. Production Cloud Run log proof: `[AuditLogger] audit insert failed (non-fatal): Cannot read properties of undefined (reading 'workspaceId')`. Live probe `q=step` → **0 rows of 563**. Unit tests pass because the mock `AuditDbLike` accepts strings — the tests never exercised real drizzle |
| 9 | **voice.ts (×3), campaigns.ts (×3), fulfillment.ts (×1) audit writers** | **BROKEN / LATENT** — they insert `agent`, `action`, `message`, `details`, and `id: "aud_…"` — none of which exist in the `audit_logs` schema (uuid `id`, `actionType`, `payloadIn`, …). Live probes `q=CRE` → 0, `q=CALL_TRANSCRIPT` → 0: none of those events are in the trail. Either the inserts fail or the flows were never exercised in prod — either way the columns they write cannot land as written |
| 10 | Trail composition | **CONSEQUENCE OF #8** — latest 100 rows: 52 `ECOSYSTEM_FULL_SYNC` + 48 `ROAMING_INGESTION`, all success. The compliance trail records sync noise and no agent work; Warnings/Errors tabs are empty in prod because the failure writer (#8) can't write and the budget/watchdog events haven't fired |
| 11 | tRPC `auditing.getAuditLogs` / `auditing.resolveLog` | **UNCONSUMED + DANGEROUS** — zero client consumers; `resolveLog` would rewrite history (`SET status='success'` on any log row, marked "Placeholder"). Dead code to remove or wire deliberately |
| 12 | `totalCost24h` stats field | **DEAD** — always `"0.000000"` (never computed), never rendered by the page |
| 13 | Timestamp column, search placeholder | **MINOR ACCURACY** — table renders time only (no date): rows from different days are indistinguishable; placeholder promises searching "prompt…" but the server searches action/agent/message/model only |
| 14 | Schema defaults (`server/schema.ts:270,285`) | **DEFAULTS TELL LIES** — `audit_logs.model` defaults to the retired `gemini-1.5-pro`; `policy_checks` defaults to all-true `{saifPassed: true, piiDetected: 0, budgetThresholdPassed: true}`, so any writer omitting the field records an unaudited pass |

---

## Data-source trace

| Client call | Route | Controller | Storage / reality | Verdict |
|---|---|---|---|---|
| `GET /api/audit-logs/stats` | api.ts:264 | `getAuditStats` | counts over `audit_logs` + `workflow_runs` | **WIRED** (24h label and securityAlerts excepted — #2, #3) |
| `GET /api/audit-logs` | api.ts:263 | `getAuditLogs` — limit 100, status + q filters | `audit_logs` rows | **WIRED** |
| `POST /api/audit-logs/:id/approve` | api.ts:266 | `approveAuditAction` — `console.log` + success JSON | **nothing** | **FICTIONAL** (#6) |
| `POST /api/audit-logs/:id/reject` | api.ts:267 | `rejectAuditAction` — `console.log` + success JSON | **nothing** | **FICTIONAL** (#6) |
| `GET /api/audit-logs/export` | api.ts:265 | `exportAuditLogs` | reads real rows; TRUE/FALSE/blank for saifPassed; empty cells for unknown | **WIRED** |
| *(never called from this page)* tRPC `auditing.getAuditLogs` / `resolveLog` | server/auditing/router.ts | trpc | `resolveLog` writes `status='success'` | **UNCONSUMED** (#11) |
| *(writers)* `insertAuditLog` — queue-processor success + failure rows | — | audit-logger.ts | **string table name → TypeError → false** | **BROKEN** (#8) |
| *(writers)* voice/campaigns/fulfillment direct inserts | — | their controllers | columns not in schema | **BROKEN/LATENT** (#9) |
| *(writers)* watchdog, budget-autopause, aiStudioSync, marketplace, agent-runner | — | various | correct columns | **WIRED** (but #8 hides the runner's rows) |

---

## Findings

### The big one — the audit trail's core is silently empty

8. **`insertAuditLog` has never written a row in production.** `db.insert("audit_logs")` passes a string where drizzle expects a table object; the query builder dereferences `table[Table.Symbol.Columns]` and throws `Cannot read properties of undefined (reading 'workspaceId')`. The helper's contract ("never throws, never rejects") swallows it into `console.warn` + `return false`. Evidence: (a) production Cloud Run logs contain the exact error; (b) live `GET /api/audit-logs?q=step` returns 0 of 563 rows although real runs executed after the helper shipped (e.g. run `07b23d1c`, 3/3 steps completed 2026-10-01); (c) `audit-logger.test.ts` passes because its mock accepts any argument. Consequences: no `agent_step_execution` rows, no `agent_step_execution_failure` rows — the Auditing page's "agent telemetry traces" claim has no data behind it, and CC-2026-09-25-008's FK-fallback machinery has never run against a real database.

9. **Three controllers write audit rows in a shape the table cannot hold.** `voice.ts` (3 sites), `campaigns.ts` (3 sites), `fulfillment.ts` (1 site) pass `agent`, `action`, `message`, `details`, and string ids `aud_*` — the schema declares `actionType`, `payload_in/out`, `error_message`, and a uuid `id`. Live probes find zero CRE or voice rows in the trail.

### Fictional numbers and controls

3. **Security Alerts is a constant.** `getAuditStats` initializes `securityAlerts = 0` and never changes it; the tile's caption "Zero unhandled breaches" asserts a conclusion from that constant.

2. **"Total Events (24h)" counts all time.** The field name, the tile label, and the CC-2026-09-02-004 changelog ("real-time 24h event counters") all say 24h; the query has no `createdAt >= now() - 24h` predicate.

6. **Approve/Reject is theater.** Even if a `requires_approval` row existed, approving it changes nothing anywhere: no audit row of the approval, no run resumed, no dispatch unpaused. The toasts assert both.

5. **The details modal defaults to PASSED.** `saifPassed !== false` is true for `undefined`, `null`, and `evaluated:false` alike. CC-012 made honest nulls common (`note: "not-llm-dispatch"`), so the fiction got *more* exposed, not less. PII `|| 0` renders "0 items" for rows that were never evaluated.

14. **Column defaults pre-install a pass.** Any writer omitting `policyChecks` records an all-true pass; `model` defaults to the retired `gemini-1.5-pro`.

### Dead and minor

11. The tRPC `auditing` router is unconsumed; `resolveLog` is a history-rewriting placeholder.
12. `totalCost24h` is always zero and never displayed.
13. Timestamps render time-only; the search placeholder promises "prompt…" search that does not exist.

### WIRED and HONEST (the good list)

The stats query (post-CC-012), the log list with genuine server-side status filter and search, honest "not reported" cells for latency/tokens, the details payload viewer with copy/wrap controls, the Run Inspector opening real run detail when the payload carries a run id, the CSV export's three-state SAIF column and empty-cell unknowns, and the 503-when-no-DB export refusal. The warning writers that do exist (watchdog `system_diagnostic`, `BUDGET_AUTOPAUSE`) use correct columns.

---

## Recommended dispositions (Robert decides)

| # | Item | Recommendation | Status |
|---|---|---|---|
| 1 | Approve/Reject stubs + unreachable Pending Approval tab (#5, #6) | **Decision needed** — (A) wire for real; (B) remove the buttons, tab, and stub endpoints, and label the page to point at Command Center's Approval Queue. Recommendation: **B** | **DONE (B, Robert's choice)** — mutations, buttons, Pending Approval tab, requires_approval badge/icon cases, and both stub endpoints removed; subtitle no longer claims a "Human-in-the-Loop review log"; a pointer line links to Command Center → Approval Queue |
| 2 | Security Alerts constant (#3) | **Compute real** — count `status='error'` audit rows in the last 24h; fix the caption | **DONE** — `getAuditStats` counts error-status rows in the same 24h window; caption now "Error events in the last 24 hours" |
| 3 | Total Events (24h) label (#2) | **Add the real 24h window** (`createdAt >= now() - 24h`) | **DONE** — real window in the query; caption "events in the last 24 hours"; all-time count dropped |
| 4 | SAIF/PII details default-to-pass (#7) | **Tri-state honest display** | **DONE** — `policyEvaluated` gate: absent/null/`evaluated:false` → "Not evaluated" (muted); `true` → PASSED (emerald); `false` → FLAGGED (rose); PII shows "not evaluated" instead of 0 items |
| 5 | `insertAuditLog` string-table bug (#8) | **Fix + regression test + prod verification** | **DONE (fix + test)** — logger now passes the real `auditLogs` table object (both insert sites, incl. the FK-retry path); regression test asserts table identity (`toBe(auditLogs)`, `not.toBe("audit_logs")`) and captures tables through the mock; prod verification post-deploy |
| 6 | voice/campaigns/fulfillment writers + schema defaults (#9, #14) | **Map to real columns + align defaults** | **DONE** — all 7 inserts remapped to `actionType`/`payloadIn`/`payloadOut` (message rides in payloadOut where the reader expects it), non-uuid `id`/`workspaceId` fallbacks replaced with the default workspace uuid, `as any` removed so tsc enforces columns; invented token/cost claims on `not-llm-dispatch` rows zeroed (static templates), hardcoded latencies replaced with measured handler wall time; `policyChecks` written explicitly as `evaluated:false` shape; schema defaults changed (`model` → `not-llm-dispatch`, `policy_checks` → not-evaluated shape) with matching self-heal DDL in db.ts |
| 7 | Dead tRPC router + `totalCost24h` (#11, #12) | **Remove / compute real** | **DONE** — `server/auditing/router.ts` deleted (incl. history-rewriting `resolveLog`), registration removed from routers.ts; `totalCost24h` now computed as real 24h cost sum |
| 8 | Minor accuracy (#13) | **Fix copy** | **DONE** — `formatTimestamp` shows date + time for anything not today (time-only for today); placeholder now "Search action, agent, or message..." |

---

## Honest limits of this audit

- Findings 8 and 9 rest on live production probes (2026-10-02, revision `agentlab-00220-68s`) plus Cloud Run log reads; the voice/campaigns/fulfillment flows could not be exercised on demand, so their failure mode (fail vs never-exercised) is proven at the column level and by absence, not by a captured insert error.
- Whether prod contains `warning`/`error` rows outside the latest 100 was probed by status filter (both 0) — writers exist and are correct, so emptiness is attributed to #8 and non-occurrence, not to broken writers.
- The drizzle string-table failure mode was verified against the installed `drizzle-orm@0.45.2` source (PgInsertBuilder accepts any argument; symbol dereference happens at build) and confirmed by the production TypeError message — not by a local repro against a live DB.

---

*Audit method note: claims were verified against live production responses and Cloud Run logs, not by UI appearance. Each finding names its file/line or probe and is reproducible.*
