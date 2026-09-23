# Honesty Audit — Simulated & Fabricated Data Presenting as Real

**Date**: 2026-09-23
**Scope**: All client pages (`client/src/pages/*.tsx`) + server controllers/execution paths
**Trigger**: Session found ClientMessenger (localStorage fiction) and MeetingRoom (fake AI summaries). This audit sweeps for every remaining instance of the same pattern.

**Classification**:
- **P1 — Fraud-grade**: fabricated data presented as real that can drive business or compliance decisions
- **P2 — Dishonest UI**: fake statuses/metrics shown to the operator (no decision-grade weight, but still lies)
- **P3 — Acceptable demo**: explicitly labeled demo/simulation on marketing or showcase surfaces
- **P4 — Legitimate**: random/timeout usage with a real technical purpose

---

## P1 — Fraud-grade (fix first)

### 1. Orchestrator writes RANDOM telemetry into the audit database — ✅ FIXED 2026-09-23 (CC-2026-09-23-007)
**Files**: `server/controllers/orchestrator.ts` (lines ~464, 477, 785-786)
**What**: When the LLM response lacks usage data, the controller falls back to
`Math.floor(Math.random() * 200) + 50` for `tokensUsed` and
`Math.floor(Math.random() * 40) + 20` for `latencyMs`, then **persists these
numbers to `audit_logs` / run telemetry**. The Auditing page
(`/auditing`) presents them as "SAIF compliance" evidence and "model trace
telemetry", complete with CSV export (`GET /api/audit-logs/export`).
**Why it matters**: exported compliance CSVs contain fabricated token spend and
latency. Any cost analysis or compliance claim built on this data is fiction.
**Fix shipped** (scope grew during the fix — three more fabrication sources
found in the same data path): (a) all `Math.random()` fallbacks removed —
usage-not-reported now records null end to end (orchestrator response type,
agent-runner mock branch, queue-processor persistence with ?? 0 guards for
the notNull columns); (b) `FALLBACK_AUDIT_LOGS` — six entirely fabricated
audit records served whenever the DB was empty — deleted, empty means zero;
(c) `exportAuditLogs` no longer exports the fabricated array as compliance
evidence, it reads the real audit trail from the DB (503 when DB unavailable);
(d) `getAuditStats` no longer defaults to invented 1248 events / 99.8% SAIF /
$0.48 cost — SAIF rate is computed from real policy checks and returned null
("not reported") when no events exist; (e) Auditing UI, OpsAgentChat, and
OpsCleanupAgent render "not reported" instead of inventing fallback numbers;
(f) 5 regression tests in `server/controllers/audit-honesty.test.ts` pin all
of this (fail if anyone reintroduces Math.random or fake fallbacks).
**Known remaining fiction in the same endpoint (new audit item)**:
`executeOrchestratorWorkflow` inserted runs with fabricated `startedAt =
now − 3600ms`, instant `status: "completed"`, and pre-canned template
artifacts (hardcoded ICP/message-map/post content presented as freshly
generated deliverables with quality scores).
**→ ✅ FIXED 2026-09-23 (CC-2026-09-23-011)**: the endpoint was rewired onto
the real agent pipeline — proposal steps sync into real `workflow_steps`
(create-once, reuse on re-execution), the run is queued as `pending` with
real timestamps and executed by `processPendingRuns` (real per-step agent
execution, artifact extraction, guardrail HITL pauses, failure marking), and
the response reports the run's actual DB state (completed / paused_for_approval
/ failed with the real error), per-step cost sums from `workflow_run_steps`,
and tokens as null (per-run token counts are not persisted anywhere).
OpsAgentChat now renders paused/failed states honestly. 8 hermetic regression
tests pin the new behavior.

### 2. OpsCleanupAgent "verified execution" is a fake progress theater — ✅ FIXED 2026-09-23 (CC-2026-09-23-006)
**File**: `client/src/pages/OpsCleanupAgent.tsx` (lines ~322-340)
**What**: After a real DAG deploy, steps are marked "running"→"completed" on an
800ms timer with `Math.random()` durations and the output
`"Verified & executed by Agent Node. SAIF cryptographic hash valid."` — while the
real backend run (which it does correctly trigger afterwards) may not have
finished or may fail. The user is told execution was verified when it was not.
**Why it matters**: this is the Ops Agent Robert uses to run the business; it
claims SAIF verification that never happened.
**Fix shipped**: step tracker now polls the real `GET /api/runs/:runId` endpoint
every 2s (5-minute cap) and renders genuine `workflow_run_steps` status,
latency, agent names, tool counts, and artifact counts; failed steps render
red with an honest run-status chip (run: failed / paused_for_approval /
poll timeout) instead of a fake success toast.

## P2 — Dishonest UI (hardcoded statuses/metrics)

### 3. Dashboard "SYSTEM TELEMETRY CONSOLE" is largely hardcoded
**File**: `client/src/pages/Dashboard.tsx` (lines ~630-680, ~340)
- "Orchestrator LLM (Gemini 2.5 Flash) — Latency: 450ms" + ONLINE badge: static text
- "HubSpot CRM Pat Bridge — CONNECTED" badge: static, ignores real vault sync
  state (Settings now computes real connected/disconnected — this page doesn't)
- "Swarm Core: NOMINAL • Telemetry Latency: 450ms" cockpit readout: static
- Spend "$12.50 this cycle ($443 saved)" is hardcoded marketing, not billing data
**Fix**: source latency from real run telemetry, HubSpot badge from the
existing vault-sync state (reuse the settings/integrations source), and either
remove the spend widget or wire it to real token usage totals.
**→ ✅ FIXED 2026-09-23 (CC-2026-09-23-012)**: new
`GET /api/dashboard/telemetry` computes real state — HubSpot badge from the
vault-synced `workspace_integrations` row (same `syncWorkspaceVaultSecrets`
call Settings uses), last-step latency from `workflow_run_steps`, cumulative
step cost from a real SQL sum, LLM badge from actual `OPENAI_API_KEY`
presence. The console renders CONFIGURED/NOT CONFIGURED,
CONNECTED/NOT CONNECTED, and "not reported"/"no cost reported yet"
instead of invented values; the header readout drops the fake NOMINAL/450ms;
the spend tile shows the real cumulative cost or an empty-state. Vault-sync
errors surface honestly without breaking the console. 7 regression tests
including a no-hardcoded-fiction check.

### 4. Agents page uptime numbers are fabricated
**File**: `client/src/pages/Agents.tsx` (lines ~270, ~380)
- "Average Uptime 99.7% — Cloud Run container SLA": hardcoded constant
- Per-agent `agent.uptime || "99.9%"`: falls back to a fake value when the
  record has no uptime
**→ ✅ FIXED 2026-09-23 (CC-2026-09-23-014)** — and the fiction ran deeper
than the UI: the controller seeded six agents with invented histories (task
counts up to 3102, uptimes 98.5–99.9%) and the schema itself defaulted new
agents to "99.9%". Now: seeding is identity-only (stats start at zero), the
schema default is dropped, and per-agent task counts + success rates are
computed from real workflow run history (run steps joined to step
definitions). UI shows real numbers or "—"/"no steps yet"; the fake "Average
Uptime 99.7% — Cloud Run container SLA" card became a real Average Success
Rate with an honest empty-state. 4 regression tests pin it.

### 5. CommandCenter agent list fabricates uptime the same way
**File**: `client/src/pages/CommandCenter.tsx` (line ~1422)
- `{agent.uptime || "99.9%"}` — same fake fallback as Agents.tsx
**→ ✅ FIXED 2026-09-23 (CC-2026-09-23-014)**: same controller fix — the
badge now shows the agent's real success rate from run history or
"no steps yet".

### 6. ScreenRecorder "AI teardown brief" is fabricated — ✅ FIXED 2026-09-23 (CC-2026-09-23-008)
**File**: `client/src/pages/ScreenRecorder.tsx` (lines ~200-215)
**What**: 1400ms delay, then a canned "Loom-Style Video Teardown Brief" with
invented findings ("3 specific high-ROI automation insertion points"), fake
milestone timestamps, and fake claims about the video contents.
**Why it matters**: these briefs get "indexed in Results Vault" as if they were
real analysis of the recorded screen session. Same fraud class as MeetingRoom.
**Fix shipped** (plus two adjacent fakes found on the same page): new tRPC
`teardownRouter.summarizeTeardown` (invokeLLM) — since the browser recording
never leaves the user's machine, the brief is grounded strictly in a new
founder-written notes field plus real recording metadata, with explicit
do-not-invent-timestamps rules; deleted two hardcoded fake client recordings
("Aura MedSpa VIP Patient Flow", "Vance CRE Nevada Opportunity Radar") that
seeded the library; replaced the false "Stored in Results Vault (SAL-01)"
label with "Session library — browser only, not persisted server-side" and an
empty-state explaining to download the .webm to keep recordings. 7 hermetic
tests including a no-old-fabrication-regression check.
**Persistence follow-up 2026-09-23 (CC-2026-09-23-010)**: the interim
"browser only" labeling is now obsolete — recordings, notes, and briefs
persist in the new `teardown_sessions` table (bytea video blobs via REST,
metadata via tRPC) and the library survives refresh. Briefs are still
grounded strictly in founder notes; nothing about the honesty model changed.

## P3 — Acceptable demo (explicitly labeled, marketing surface)

### 7. Home "Test DAG Execution" simulation — `Home.tsx` (~43-60, ~193-197)
Runs a visible fake DAG on the public marketing page and toasts "DAG Execution
Complete: 0 Drift, SAIF Verified (14ms, $0.02)". It is a demo, but the toast
reads like a real result. Recommendation: reword toast to "Demo simulation
complete (not a real run)" — one line of copy.

**✅ FIXED (CC-2026-09-23-015)**: toasts now say "Simulating Multi-Agent Swarm
DAG Execution..." and "Demo simulation complete (not a real run — no DAG was
executed)". The hero line "Avg Latency: 14ms | Cost: $0.02" (invented figures
on a marketing page) was removed and the widget's badge is now "Interactive
Demo" with subtitle "Simulated visualization of deterministic task routing —
not a live system".

### 8. ComponentShowcase chat demo — `ComponentShowcase.tsx` (~218-227, ~1427)
Simulated responses, but the page itself says "This is a demo with simulated
responses." Labeled correctly. No action.

### 9. Documentation "0 (100% Live) Simulated Tools" counter — `Documentation.tsx` (~495-505)
Ironically claims "0 simulated tools, 100% live" on a hardcoded card. The claim
is false today (see P1/P2). Either make it true (fix #1-#6) or relabel as
"Design target".

**✅ FIXED (CC-2026-09-23-015)**: card now reads "Documentation Status:
Descriptive Only" (these pages document intended behavior, they don't assert
system health), and the "Active Cloud Fleet 6/6 Run" tile — false after the
agents honesty pass made agents seed idle — now reads "Docs Layer". Removed the
two hardcoded health claims entirely rather than relabeling them.

## P4 — Legitimate (verified, no action)

- `server/controllers/image-generation.ts` random seeds (135, 167): standard
  diffusion seed parameter, correct usage.
- All other `setTimeout`/interval uses in pages: UI timers, copy feedback,
  call-duration clocks, demo intervals — legitimate.

---

## Recommended fix order

1. **P1-1 Orchestrator random telemetry** — data corruption at the source; a
   small, contained server fix with the highest integrity payoff. (Blocks a
   future honest cost/compliance dashboard.)
2. **P1-2 OpsCleanupAgent real step status** — ✅ FIXED (CC-2026-09-23-006)
3. **P2-6 ScreenRecorder AI brief** — same tRPC+invokeLLM pattern just shipped
   for MeetingRoom (CC-2026-09-23-003); mostly copy-paste work.
4. **P2-3/4/5 Dashboard/Agents/CommandCenter honesty pass** — badge/number
   sourcing; largest but shallowest change set.
5. **P3-7 Home toast reword** — one-line fix.

## Session context

**Prevention (CC-2026-09-23-016)**: a fiction linter now runs as part of the test suite (`server/integrity/fiction-linter.ts`), scanning client pages/components and server controllers/execution for every fiction class this audit catalogued — hardcoded latencies, invented costs, uptime/SLA claims, seeded telemetry counters, connectivity and liveness literals, unhedged run claims. Regressions fail CI; exceptions require a documented allowlist entry. Its first sweep caught four sites this audit missed (a CommandCenter rate fallback, two marketing SLA claims, an illustrative uptime chip) and traced one to its root: the workflows controller's fabricated seed rates and the schema's `success_rate DEFAULT 100.00` — both removed (see `demo-to-real-conversion-plan-2026-09-23.md` for how the honesty doctrine extends into sales claims).
- Already fixed this session: ClientMessenger (CC-2026-09-23-001), lead DM
  threads (CC-2026-09-23-002), MeetingRoom AI summary (CC-2026-09-23-003),
  messenger live polling (CC-2026-09-23-004).
- Known separate debt: 48 pre-existing typecheck errors in
  `server/controllers/workflows.ts` + `server/execution/social-dispatcher.ts`
  (unrelated to this audit, blocking repo-wide `pnpm check`).
