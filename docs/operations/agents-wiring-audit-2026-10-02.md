# Agents Wiring Audit — 2026-10-02

**Document ID:** DOC-OPS-AGENTS-AUDIT-2026-10-02
**Scope:** the Agents surface (`client/src/pages/Agents.tsx`, 462 lines) plus its controller (`server/controllers/agents.ts`), its schema rows, and its consumption across the execution pipeline
**Method:** inventory → trace each control/number to route → controller → storage → **runtime consumer** → classify **WIRED / UNCONSUMED / FICTIONAL**. A control is WIRED only if changing it changes real behavior.
**Companion register entry:** CC-2026-10-02-011
**Series:** fourth entry in the approved OS audit order (Dashboard → Command Center → **Agents** → Apps).
**Trigger:** Robert (via Ops Agent) launched Phase 2 with DAG proposal WFP-OPS-AGENTS-001; its Operator Audit Review Gate paused awaiting this audit. Assessment of the DAG itself is at the end.

---

## Verdict at a glance

| # | Widget / control | Verdict |
|---|---|---|
| 1 | Agents query, roster cards, status dots, filters | **WIRED** — real roster + real per-agent stats (CC-2026-09-23-014 lineage) |
| 2 | Active Nodes / Tasks Completed / Success Rate tiles | **WIRED** — real counts with honest "—" empty states |
| 3 | **Safety & SAIF tile: hardcoded "100%"** | **FICTIONAL** — hardcoded percentage claiming PII redaction & RLS active; an honest `saifComplianceRate` already exists in `GET /api/audit-logs/stats` and is never called here |
| 4 | **Base LLM Backbone selector (deploy modal) + `baseModel` badges** | **UNCONSUMED** — zero consumers in `server/execution/`: every step runs the fixed Gemini chain (`GOOGLE_MODEL_CHAIN`) regardless of the selected backbone; choosing "Claude 3.7 Sonnet" or "GPT-4o Mini" changes a badge, not the model |
| 5 | **Pause Node / Activate button** | **UNCONSUMED by dispatch** — `toggleAgentStatus` flips `active ↔ paused` in the DB (write is real) but `agents.status` has **zero server-side readers** (repo-wide grep, non-test): a paused agent still executes every step assigned to it |
| 6 | Settings gear button | **Dead control with a claim** — it toasts `"{name} is running under SAIF guardrails on {baseModel}."` instead of opening parameters/tools; the model claim can be false (see #4) |
| 7 | Deploy modal description ("domain instructions and model boundaries") | **Misleading** — the form collects name/role/model only; `deployAgent` defaults `systemPrompt` to the one-liner `Autonomous agent persona for {role}`, which **is** the prompt the pipeline runs |
| 8 | Agent `systemPrompt` | **WIRED but invisible** — consumed by queue-processor → `runAgentStep`, yet no UI anywhere displays or edits it after seed/deploy |
| 9 | Activity button / Refresh / filters / nav | **WIRED** |

---

## Data-source trace

| Client call | Route | Controller | Runtime consumer | Verdict |
|---|---|---|---|---|
| `GET /api/agents` | api.ts:184 | `getAgents` → `{agents: agentsWithStats}` (tasksCompleted/successRate/lastStepAt computed from run history) | Dashboards, gauges | **WIRED** |
| `POST /api/agents/:id/toggle` | api.ts:185 | `toggleAgentStatus` — sets `active`/`paused` | **none** (display counts only) | **Stored, unconsumed by execution** |
| `POST /api/agents/deploy` | api.ts:186 | `deployAgent` — insert with `systemPrompt` default | `systemPrompt` consumed at run time; `baseModel` consumed by nothing | **Half-wired** |
| `baseModel` column | schema.ts:153-155 (default `"gemini-1.5-pro"` — a retired id) | — | badge + toast text only | **UNCONSUMED** |
| `agents.status` column | schema.ts:157 (`'active' | 'idle' | 'error' | 'paused'`, default `idle`) | written by toggle/deploy | **zero `eq(agents.status` / readers in server code** | **UNCONSUMED** |
| *(never called here)* `GET /api/audit-logs/stats` | api.ts | `audit.ts:getAuditStats` — honest `saifComplianceRate` (null when unknown) | Auditing page | **UNCONSUMED by this page — tile hardcodes 100% instead** |
| Execution path | — | `queue-processor.ts:478` selects the agent **by id only** (no status filter, no baseModel) → `runAgentStep(prompt, systemPrompt, …)` → Gemini chain | — | proves #4 and #5 |

---

## Findings

### FICTIONAL

1. **Safety & SAIF tile** — `100%` / "PII Redaction & RLS Boundary Active" is hardcoded. This is the exact pattern the Sept 23 honesty sweep removed from the Auditing page (CC-2026-09-23-007 made `getAuditStats` compute a real, nullable `saifComplianceRate`). The honest source exists; this page just doesn't call it.

### STORED-BUT-UNCONSUMED (the Settings-tab class)

2. **`baseModel` does nothing.** The deploy modal offers Gemini Flash / Gemini Pro / Claude 3.7 Sonnet / GPT-4o Mini; the seeded roster stores `claude-3-7-sonnet`, `gpt-4o`, `gpt-4o-mini`; cards and toasts display these values — but `server/execution/` never reads `baseModel`. `runAgentStep` takes only the prompt and system prompt, and the model comes from `GOOGLE_MODEL_CHAIN` (`gemini-flash-latest → gemini-3.8-flash → gemini-pro-latest`). Every agent runs Gemini; the selector is a model-picker-shaped label.
3. **`agents.status` gates nothing.** "Pause Node" writes `paused` for real, filters/cards reflect it, the Dashboard counts it — and the queue processor will happily dispatch the next step to that agent. The control's name is a promise the pipeline doesn't keep.

### MISLEADING / DEAD CONTROLS

4. **Settings gear** — canned toast instead of a dialog; asserts SAIF guardrails + backbone model without checking either.
5. **Deploy modal copy** promises "domain instructions and model boundaries" the form cannot collect; the resulting system prompt is the one-line default (`Autonomous agent persona for {role}`), which then silently governs every run of that agent.
6. **No systemPrompt visibility** — the one agent field the pipeline genuinely consumes is the one field no UI shows.

### Cross-cutting finding from the DAG's own evidence (bigger than this page)

7. **The test suite writes to the production database on every `pnpm test` run.** The DAG's `inspectExecutionLogs` output shows five `ROAMING_INGESTION:VOICE_NOTE` rows carrying the identical "Alex Vance / Vance AI" transcript with fresh `ingestionId`s, each paired (≈60 ms apart) with an `ECOSYSTEM_FULL_SYNC` audit row — timestamps 17:07, 17:53, 18:33, 18:38, 18:42 UTC match today's five vitest invocations almost exactly. Root cause: `server/aiStudioSync.test.ts` mocks only `spawnSync` (CC-2026-10-02-006); it calls the REAL `ingestRoamingData`, `handleManualSync`, and `registerMobileWebhook` controllers against the live `DATABASE_URL`. Consequences: fake `ECOSYSTEM_FULL_SYNC` rows in the compliance trail, duplicate voice-note ingests, and — newly noticed — **a fresh mobile webhook subscription (`sub_*`) registered on every test run**, which risks duplicate outbound push fanout. CC-006 flagged the audit-row half as "left as noted"; the ingest and webhook halves are recorded here for the first time.

### Extra finding raised during disposition review (approved as disposition 9)

8. **The AI Studio mobile-sync state payload and its audit rows were fictional.** `getSyncState` in `server/controllers/aiStudioSync.ts` hardcoded `orchestratorLatencyMs: 450`, `estimatedSpendMonthly: "12.50"`, `activeSwarmAgents: 5`, `saifGuardrailsActive: true`, and `status: "nominal"`, and the ingest/sync write paths recorded invented tokens (75), cost, latency (120/150 ms), and all-true `policyChecks` on every audit row — the same fabrication class as finding 1, but inside the compliance trail itself. Robert approved fixing it in this pass.

### WIRED AND HONEST (the good list)

The roster and its stats (real names/roles, run-history-derived task counts and success rates with honest `—`), the three count tiles, filter counts, toggle/deploy mutations reaching the DB, refresh, nav — and `deployAgent`'s `systemPrompt` genuinely feeding execution. The capability refusal behind the DAG's cited run `e977032c-e3a2-4214-8929-b0782b1864e4` is **verified real**: failed 2026-09-05 with *"Agent execution failed capability check: I am sorry, but I cannot directly access or query AgentLab OS activity logs … limited to the HubSpot CRM, email dispatch, and internal knowledge base tools"* — a system-prompt-vs-step-prompt mismatch, exactly the class this audit's #5/#6 findings feed.

---

## Assessment of DAG WFP-OPS-AGENTS-001 (as executed)

- **Premise: real.** The cited run exists and shows a genuine capability refusal.
- **Step 1 (Agent Registry & Schema Introspection) returned `matchCount: 0`** — it ran `searchLocalFiles`, which cannot introspect a database. Wrong tool for the claim.
- **Step 2 (Capability Boundary Check) returned ten recent generic audit rows** — no lookup of the cited run, no capability-refusal analysis; it did not surface the evidence its own prompt referenced.
- **Recommendation:** adjust before deploying — step 1 should read the live registry (`GET /api/agents` / a DB query over `agents`), step 2 should fetch the cited run detail (`GET /api/runs/:id`) and classify its `errorMessage`, and the gate should present *those* results. As executed, the gate paused with no findings to verify.

---

## Recommended dispositions (Robert decides)

| # | Item | Recommendation | Status |
|---|---|---|---|
| 1 | Safety & SAIF tile hardcoded 100% | **Wire** to `GET /api/audit-logs/stats` (`saifComplianceRate`, honest "—" when null) | **DONE** — tile fetches the stats route (shared `audit-stats` query cache with the Auditing page); renders the real rate, `…` while loading, `—` + "Not reported yet — no evaluated policy checks" when null |
| 2 | `baseModel` selector + badges (unconsumed) | **Honest relabel now** — remove Claude/GPT options and label the field as metadata (runtime model is the fixed Gemini chain); wiring other providers is its own project (needs credentials) | **DONE** — deploy selector reduced to the two Gemini chain entries and relabeled "Model Badge (metadata)" with a note that steps run the fixed chain; card badge carries the same tooltip |
| 3 | Pause Node gates nothing | **Decision needed** — (A) enforce in the queue processor: a step whose agent is `paused` fails honestly with "agent paused by operator"; (B) relabel the control to "Deactivate (visibility only)" until enforcement is designed | **DONE (Option A — enforce honestly, per Robert)** — `assertAgentRunnable` in the queue processor fails a paused agent's step with an operator-readable message before dispatch; 3 tests in `server/execution/agent-pause-gate.test.ts` |
| 4 | Settings gear canned toast | **Replace with a real detail dialog** (shows the actual `systemPrompt`, baseModel metadata, real stats) or remove the button | **DONE** — gear opens a dialog rendering the stored `systemPrompt` (or an honest empty state), the baseModel badge with the chain caveat, and real success rate / tasks / last-step stats |
| 5 | Deploy modal copy + missing instructions field | **Add an optional "System Instructions" textarea** (falls back to the current default) and fix the description | **DONE** — optional System Instructions textarea now sent as `systemPrompt` (server keeps its role-based fallback when blank); description states what the form really collects and that the badge does not change the runtime model |
| 6 | Test suite writes to prod DB (ingest fixture, ECOSYSTEM_FULL_SYNC rows, duplicate webhook registrations) | **Mock `getDb` in `aiStudioSync.test.ts`** (or env-gate the file) so tests stop mutating the shared DB; audit existing duplicate `sub_*` webhook rows for push fanout | **DONE** — `aiStudioSync.test.ts` mocks `./db` (`getDb` → null) and stubs `fetch` so no ingest/sync/webhook path reaches the live DB or network; isolation proof: last prod rows were 2026-10-02T18:42:27Z (test-run artifacts), verification at 19:27Z showed no new rows after the fix |
| 7 | Schema default `baseModel: "gemini-1.5-pro"` (retired id) | **Change default** to `gemini-flash-latest` (code-level; deploy path passes explicit values) | **DONE** — default now `gemini-flash-latest` with a comment naming the runtime chain |
| 8 | DAG WFP-OPS-AGENTS-001 | **Adjust, don't deploy as-is** — swap step tools for real registry/run lookups as described above | **DONE (adjust)** — corrected step prompts delivered to Robert (step 1 reads the live registry via `GET /api/agents`; step 2 fetches `GET /api/runs/:id` and classifies `errorMessage`; the gate presents those results); DAG not deployed as-is |
| 9 | AI Studio mobile-sync payload + audit-row fiction (raised during disposition review) | **Fix in this pass** (Robert's approval) | **DONE** — `getSyncState` now derives real state (measured month-to-date spend, real active-agent count, last-step latency or null, derived `status`/`saifGuardrailsActive`); ingest/sync audit rows record measured latency, zero tokens/cost for non-LLM dispatch, and `policyChecks` with `evaluated: false` instead of invented all-true checks |

---

## Honest limits of this audit

- Consumption traces (`baseModel`, `agents.status`) are grep+read proofs over `server/` excluding tests; absence of a consumer is reproducible by searching those identifiers.
- The system prompts of the three live roster agents were not read row-by-row (would need a DB query); the refusal evidence in run `e977032c` shows prompt-level scoping in practice.
- The webhook fanout risk (finding 7) is inferred from repeated `sub_*` registrations in the test path — actual push behavior needs one confirmation pass over the webhook dispatcher.

---

*Audit method note: "wired" was verified by tracing consumers in server and client code (search + read), not by UI appearance. Findings are reproducible: each claim names its file, line, and the absence or presence of its consumer.*
