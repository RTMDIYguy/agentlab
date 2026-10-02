# Dashboard Wiring Audit — 2026-10-02

**Document ID:** DOC-OPS-DASHBOARD-AUDIT-2026-10-02
**Scope:** every widget, number, label, and control on the Dashboard surface (`/dashboard`, `client/src/pages/Dashboard.tsx`, 1,265 lines)
**Method:** each rendered value was traced to its data source (query → route → controller → storage) and each control to its runtime consumer. A widget is **WIRED** only if its displayed value comes from real state and changing that state changes what is displayed. **FICTIONAL** means the value is hardcoded or computed from nothing while presenting itself as live. **UNCONSUMED** means a real API returns a field the UI ignores (or vice versa).
**Companion register entry:** CC-2026-10-02-007
**Trigger:** the OS audit series approved by Robert (Dashboard → Command Center → Agents → Apps), executed in the same inventory → trace → classify → dispositions method as the Settings audit (CC-2026-10-01-008).

---

## Verdict at a glance

| # | Section | Verdict |
|---|---|---|
| 1 | Header (Autopilot badge, Nodes Online, Last Step Latency) | **Mixed** — numbers WIRED, "AUTOPILOT ENGAGED" badge is unconditional decoration |
| 2 | Viewport Horizon Selector (Tron/Cyber/Tropical/Space) | **WIRED** (localStorage theme; cosmetic by design) |
| 3 | Autonomic Swarm Node Array (6 pods) | **FICTIONAL** — hardcoded node names, always-"Active" statuses, invented task counts; ignores the real `agents` data the page already fetches |
| 4 | 30-Day Pro Trial card + Extend modal | **FICTIONAL backend** — server hardcodes 18 base days, recomputes the end date from "now" on every call (the trial can never expire), extensions live in a process-local `Map` lost on every deploy |
| 5 | Complimentary Book banner | **Static marketing copy** — consistent with the server's equally-static `freeBookPerk`; reader button WIRED |
| 6 | Metric gauges (4 tiles) | **3 WIRED, 1 with bugs** — Active Tasks counts a status value that does not exist; Total DAG Runs is capped at 50 by the query |
| 7 | System Telemetry Console (LLM, HubSpot, Workflows rows) | **WIRED** — real vault/step/cost data, tested controller; the "SYNCED" badge is unconditional decoration |
| 8 | Tactical Flight Controls (6 nav buttons) | **WIRED** — all target routes exist in App.tsx |
| 9 | Virtual Office & Client Comms (3 cards) | **WIRED** — /meeting, /messages, /screen-recorder all exist |
| 10 | Connected Integrations launcher | **FICTIONAL badges** — every card says "CONNECTED" unconditionally, contradicting the HubSpot row in the telemetry console above it on the same page |
| 11 | Live Pipeline Execution Runs | **WIRED with a display defect** — the query never joins workflows, so `run.workflow.name` is always undefined and every card shows a raw UUID |
| 12 | Graceful Downgrade Policy modal | **FICTIONAL copy** — "$500/mo" contradicts the live Stripe price ($149/mo); the free-tier limits it promises have zero enforcement in code |

---

## Data-source trace

| Query (Dashboard.tsx) | Route | Controller | Verdict |
|---|---|---|---|
| `GET /api/runs` (5s poll) | routes/api.ts:201 | `runs.ts:listRuns` — workspace-scoped, LIMIT 50, **no workflow join** | Real data; two defects (below) |
| `GET /api/workflows` (5s poll) | routes/api.ts:189 | `workflows.ts:getWorkflows` → `{workflows: workflowsWithStats}` | **WIRED** |
| `GET /api/agents` (5s poll) | routes/api.ts:184 | `agents.ts:getAgents` → `{agents: agentsWithStats}` with real per-agent stats (CC-2026-09-23-014) | **WIRED — but the swarm pod array ignores it** |
| `GET /api/trials/status` (30s) | routes/api.ts:235 | `marketplace.ts:getTrialStatus` — `baseDaysRemaining = 18` hardcoded; `trialEndDate = now + daysRemaining` recomputed per call; extensions from `inMemoryTrialExtensions` (module `Map`) | **FICTIONAL** — cannot expire, resets every deploy |
| `POST /api/trials/extend` | routes/api.ts:236 | `marketplace.ts:extendTrial` — `Map.set(+14)`; `canExtend` (extra < 28) is advisory only, never enforced; `reason` echoed but never stored | **FICTIONAL persistence** |
| `GET /api/dashboard/telemetry` (30s) | routes/api.ts:394 | `dashboard-telemetry.ts` — vault-synced HubSpot state, real last-step latency, real `sum(workflow_run_steps.cost)` | **WIRED** (tested) |
| `GET /api/dashboard/llm-ping` (5 min) | routes/api.ts:395 | `dashboard-telemetry.ts:pingLlm` — real Gemini round-trip | **WIRED** (tested) |
| `trpc.settings.getIntegrations` | settings router | `workspace_integrations` rows | **WIRED** (merged with the canonical list, deduped by name) |

Client-side consumption of the trial response: `canExtend` and `downgradePolicy` are declared in the query type and **never read** — the downgrade modal renders its own hardcoded copy instead.

---

## Section-by-section findings

### 1. Header
- **WIRED:** `Nodes Online: {activeAgents}` (agents with status `active`), `Last Step Latency` (real completed-step latency or honest "not reported").
- **FICTIONAL:** the `AUTOPILOT ENGAGED` badge with the pinging Radio icon renders unconditionally (line ~400) — a status claim backed by nothing.

### 3. Autonomic Swarm Node Array — fictional
The six pods (Alpha-Node-01 … Workflow-Planner-04) are a literal array in the JSX: fixed names, `status: "Active"` for every pod, invented task counts (24/19/14/31/42/16), and the subtitle "6 active intelligence nodes synchronized via PostgreSQL" is fixed copy. This is the same fabrication class removed from the Agents page in CC-2026-09-23-014 — and the page *already fetches* the real roster (`agentsData`) with real per-agent task stats computed from run history. The pods read none of it.

### 4. Pro Trial card — fictional backend
- Server: `baseDaysRemaining = 18` hardcoded; the "trial end date" is **recomputed from the current timestamp on every request**, so the trial is always ~18 days away and can never end regardless of when the workspace was created. There is no `trial_started_at` anywhere; `inMemoryTrialExtensions` is a module-level `Map` — every Cloud Run deploy or cold start silently wipes all extensions.
- `canExtend` (cap of +28) is computed in the status response but enforced **nowhere** — neither the UI button nor `extendTrial` checks it.
- Client fallbacks: `daysRemaining ?? 18`, `totalTrialDays ?? 30`, and `trialEndDate || "2026-09-21"` — a **hardcoded date already 11 days in the past**, shown while loading or on any error.
- Toast wording: "Your trial is now active until {daysRemaining} days from now" — prints a day count where a date belongs ("until 32 days from now").
- Plan-name inconsistency: server says "AgentLab OS Pro Trial", the client fallback says "Ownable OS Pro Trial".
- Progress bar renders `daysRemaining / totalTrialDays` (starts at 60% and shrinks) — defensible as a "remaining" bar, but it never represents elapsed time.

### 6. Metric gauges
- **Swarm Nodes** `{activeAgents} / 6` — numerator WIRED; denominator and the caption "2 Techs, 1 SDR, 1 Auditor, 1 Planner" are hardcoded (agent roles come from the DB and need not match).
- **Active Tasks** — WIRED intent, broken filter: `status === "running" || status === "pending_approval"`, but the schema vocabulary is `pending | running | completed | failed | paused_for_approval` (schema.ts:315). **`pending_approval` does not exist** — every run waiting for human approval is excluded from the count the widget is named for.
- **Total DAG Runs** — `runs.length` over a query capped at `LIMIT 50` (runs.ts:91). Past 50 runs the "total" silently freezes.
- **Compute Spend** — WIRED and honest (real `sum(cost)`, null-safe "No cost reported yet" copy).

### 7. System Telemetry Console — wired
Both rows are real: LLM liveness is a genuine Gemini round-trip with distinct not-configured/failed states; HubSpot reflects the vault-synced `workspace_integrations` row; latency and cost come from `workflow_run_steps`. The row label "Available packages: {workflows count}" is a misnomer — it counts workflows, not marketplace packages. The "SYNCED" badge next to it is unconditional.

### 10. Connected Integrations launcher — fictional badges
The nine canonical entries are static launch links (n8n points at `http://35.225.47.185:5678` by design — commented, env-overridable; same for Marksman/Pulse). The defect: **every card carries a hardcoded green "CONNECTED" badge**, including custom rows the user just added. On the same page the telemetry console can truthfully say "HubSpot NOT CONNECTED" while the launcher card below says "HubSpot CRM — CONNECTED".

### 11. Live Pipeline Execution Runs — wired, one display defect
Runs are real, statuses real, the Inspect button opens a real `RunInspectorModal`. But `listRuns` does a bare `select()` with no join, so `run.workflow?.name` is **always undefined** — every card falls back to the raw `workflowId` UUID. The fix is free: the Dashboard already fetches `/api/workflows`; map id → name client-side.

### 12. Downgrade Policy modal — fictional copy
- **"Ownable OS ($500/mo)"** contradicts the live Stripe catalog: the active price is **$149.00/mo** (`price_1UM9iUKAbfp5cgErj0SD6Tuw`, created and verified in CC-2026-10-02-004). A prospective buyer reading $500 next to a $149 checkout is a trust defect on the money path.
- The promised free tier ("1 Active Swarm Agent", "5 Daily DAG Executions", pausing of schedulers/apps) has **no enforcement anywhere**: `daily_run_limit` exists only as a schema column (schema.ts:472) with zero readers (the only writer is `scripts/adaptive-downgrade.ts`); no agent-count cap exists in code; nothing gates a trial's expiry because the trial itself never ends.
- The server response *does* carry `downgradePolicy.retained/paused` — real fields the UI ignores in favor of its own copy.

### Dead client state
`activeTab`/`setActiveTab` (line 63) and `user` (line 64) are declared and never used; `canExtend` and `downgradePolicy` are typed but unread.

---

## What is genuinely wired across the Dashboard

For the record, the honest list: the **metric gauges** (runs, agents, real compute spend), the **System Telemetry Console** and **LLM ping** (tested, real-state), the **integration launcher merge logic** (canonical + custom DB rows, deduped), the **run list and inspector**, the **viewport theme**, and **every navigation control** — all 15 buttons/cards resolve to routes that exist. The bones are good; the fiction is concentrated in the swarm pods, the trial subsystem, the CONNECTED badges, and the downgrade copy.

---

## Recommended dispositions (Robert decides)

Robert approved the full order on 2026-10-02 ("Execute all in order") plus trial Option B (honest demotion); execution recorded as CC-2026-10-02-008.

| # | Item | Recommendation | Status |
|---|---|---|---|
| 1 | `activeRuns` status bug (`pending_approval` → `paused_for_approval`) | **Fix** — one line; approval-waiting runs currently invisible in the Active Tasks count | **DONE** |
| 2 | Run cards show UUIDs instead of workflow names | **Fix client-side** — map `workflowsData` id→name (server untouched) | **DONE** |
| 3 | Extend toast wording + stale `2026-09-21` fallback + plan-name inconsistency | **Fix** — honest date/count phrasing, "—" fallback, one plan name | **DONE** — date fallback `—` and plan name fixed; the toast itself was removed together with the Extend button (item 11-B) |
| 4 | Dead state (`activeTab`, `user`, unread trial fields) | **Remove** (or start reading `canExtend` to gate the Extend button) | **DONE** — `activeTab`, `user`, `useAuth`/`useMutation`/`useQueryClient` imports, and the unread `canExtend`/`downgradePolicy`/`success` type fields removed |
| 5 | "Available packages" mislabel | **Rename** to "Workflows" | **DONE** |
| 6 | "AUTOPILOT ENGAGED" + "SYNCED" unconditional badges | **Make conditional or remove** (e.g. SYNCED reflects last successful query; Autopilot reflects a real scheduler state or goes) | **DONE** — AUTOPILOT shows iff a workflow is armed on `triggerType = "schedule"` (the exact set execution/scheduler.ts polls), otherwise MANUAL MODE; SYNCED/SYNCING/FETCH ERROR reflects the live query state |
| 7 | Integration-card "CONNECTED" badges | **Honest state**: HubSpot from telemetry; unknown integrations get a neutral LAUNCH badge instead of a false green | **DONE** — HubSpot from live telemetry, custom rows from their DB `status`, everything else a neutral LINK badge with tooltip |
| 8 | Downgrade modal "$500/mo" | **Fix to $149/mo** — must match the live Stripe price | **DONE** |
| 9 | Free-tier promises (1 agent / 5 runs / no enforcement) | **Relabel as policy intent ("on the roadmap / not yet enforced")** OR wire `daily_run_limit` enforcement — enforcement is entitlements work, its own task | **DONE (relabel)** — policy note added to the modal; enforcement deliberately deferred to the entitlements rollout |
| 10 | Swarm pod array | **Wire to `agentsData`** (real names, roles, statuses, real task stats already computed) — keeps the visual, kills the fiction | **DONE** — pods render the real roster with status-colored dots and real `tasksCompleted`; loading/empty states honest; header count, gauge denominator/caption, and nav-deck count now derive from the roster |
| 11 | Trial subsystem (hardcoded 18 days, never expires, in-memory extensions, unenforced cap) | **Robert's call — three options below** | **DONE (Option B)** — card kept with DEMO badge + tooltip + footnote; Extend button, extension modal, mutation, and reason state removed; `GET/POST /api/trials/*` endpoints left in place, documented as demo until entitlements |
| 12 | "Total DAG Runs" capped at 50 | **Relabel** ("Recent Runs, last 50") or add a real COUNT query | **DONE (real count)** — `listRuns` now returns an additive `total` (workspace-wide `count(*)`); dashboard reads `total ?? runs.length` |

### Trial subsystem — the one real decision (resolved: **Option B** on 2026-10-02)

- **Option A — Make it real (recommended if the trial stays customer-facing):** derive the end date from `workspaces.created_at` (exists today, no DDL), persist extensions on the workspace row (settings JSONB, no DDL), enforce `canExtend` server-side, store the extension `reason` for the record. Consequence: existing workspaces (created Aug 24) show an **expired** trial immediately — honest, but a visible flip for current users.
- **Option B — Honest demotion (recommended if no external trial users exist yet):** keep the card but relabel it as a demo/presentation element with a tooltip stating trials are not yet enforced; remove the Extend button or make it a no-op with an honest toast. Cheapest path to zero fiction.
- **Option C — Remove the card** until the entitlements work (with the free-tier enforcement, item 9) lands as one coherent billing feature.

---

## Honest limits of this audit

- Client rendering was audited by reading code, not by clicking every control in a browser; all claims above are line-traceable.
- The Virtual Office cards' internal claims (WebRTC, encryption, AI assistant) belong to the target pages and were not audited here — only that the routes exist.
- `trpc.settings.getIntegrations` was audited on the Dashboard side (merge/dedupe logic); its producer was covered by the Settings audit (CC-2026-10-01-008).

---

*Audit method note: "wired" was verified by tracing consumers in server and client code (search + read), not by UI appearance. Findings are reproducible: each claim names its file, line, and the absence or presence of its consumer.*
