# Command Center Wiring Audit — 2026-10-02

**Document ID:** DOC-OPS-COMMAND-CENTER-AUDIT-2026-10-02
**Scope:** every widget, number, label, and control on `/command-center` (`client/src/pages/CommandCenter.tsx`, 2,709 lines)
**Method:** inventory → trace each query/mutation to route → controller → storage → classify **WIRED / UNCONSUMED / FICTIONAL**. A widget is WIRED only if its value comes from real state; FICTIONAL means hardcoded or invented while presenting itself as live.
**Companion register entry:** CC-2026-10-02-009
**Series:** third entry in the approved OS audit order (Dashboard → **Command Center** → Agents → Apps), same method as the Settings audit (CC-2026-10-01-008) and Dashboard audit (CC-2026-10-02-007).

---

## Verdict at a glance

| # | Section | Verdict |
|---|---|---|
| 1 | Header banner (Live Runtime, AI Studio Mobile, Refresh, 1-Click Sync) | **Mixed** — Refresh + Sync WIRED; "Live Runtime" and "AI Studio Mobile: Connected" are unconditional badges |
| 2 | Operating Focus queue (Top Actions) | **WIRED, browser-local** — functional localStorage queue; not shared across devices/browsers (limitation, not fiction) |
| 3 | Approval Queue | **WIRED** (correct `paused_for_approval` vocabulary) — but renders the workflow **UUID** instead of the name |
| 4 | Dispatch Decisions | **WIRED** — trpc list/approve/reject behind the human gate |
| 5 | Deployable Workflows + Adjust Steps modal | **WIRED with defects** — server is hardened (name→UUID resolution) but the client writes legacy agent names that silently save as *null assignments*, displays null as "Alpha-Node-01", and displays UUIDs raw; CRON trigger selectable with **no cron field** → inert workflow |
| 6 | Swarm Agents card | **Mixed** — roster/real success rates WIRED; badge counts all agents as "Online"; description and explainer hardcode "5 nodes / 6 DAGs" next to live counts that disagree |
| 7 | Ops Orchestrator Terminal | **WIRED backend, stale claims** — real hardened chat; badge advertises retired "Gemini 2.5 Flash"; greeting claims everything active; "fallback autonomy mode" error is fiction; messages not persisted |
| 8 | Content Calendar | **WIRED** — real counts/statuses; invented `qualityScore ?? 90` fallbacks |
| 9 | Generated Assets Vault | **Mixed** — real list; **false "Linked" sync claim** (file does not exist in the repo, no write path anywhere); engine badge mislabels non-Imagen engines as "Flux Schnell"; totalCount capped by `limit=30` |
| 10 | Artifact inspector (grade/verification) | **FICTIONAL defaults** — missing grade renders "A", missing score renders 90%, missing verification renders "✓ Passed Brand & Fact Checks" |

---

## Data-source trace

| Client call | Route | Controller | Verdict |
|---|---|---|---|
| `GET /api/workflows[?status=archived]` | api.ts:189 | `workflows.ts:getWorkflows` (statusFilter + archivedCount) | **WIRED** |
| `GET /api/agents` | api.ts:184 | `agents.ts:getAgents` (real per-agent stats) | **WIRED** |
| `GET /api/runs` (5s) | api.ts:201 | `runs.ts:listRuns` | **WIRED** (now with `total`, CC-008) |
| `GET /api/artifacts/content-calendar` (10s) | api.ts:274 | `artifacts.ts:getContentCalendar` (real counts; also reads a local `Agent Lab LinkedIn/Content-Queue.md` that **does not exist in this repo**) | **WIRED** + one dead read |
| `GET /api/artifacts?limit=30` (10s) | api.ts:272 | `artifacts.ts:listArtifacts` → `{artifacts, totalCount: rows}` | **WIRED**, totalCount capped at the limit |
| `POST /api/workflows/:id/run` | api.ts:202 | `triggerRun` | **WIRED** |
| `POST /api/runs/:id/approve\|reject` | api.ts:203-204 | `approveRun`/`rejectRun` | **WIRED** |
| `trpc actions.listDispatches/approve/reject` | settings/actions router | human-gated dispatch (CC-2026-10-01-007) | **WIRED** |
| `PATCH /api/artifacts/:id`, `POST …/evaluate\|refine` | api.ts:278-281 | real evaluation + revision pipeline | **WIRED** |
| `POST /api/generate-image` | api.ts:285 | `image-generation.ts` (Imagen 3 → Flux → Neural fallbacks) | **WIRED** |
| `POST /api/sync/all` | api.ts:258 | `aiStudioSync.ts:handleManualSync` (real generator spawn) | **WIRED** |
| `POST /api/orchestrator/chat` | api.ts:185 | `orchestrator.ts` — hardened (honest refusal, truthful `executionMetrics.model`) | **WIRED — `executionMetrics` unconsumed by this UI** |
| `POST /api/workflows/deploy` | api.ts:191 | `deployWorkflow` | **WIRED** |
| Workflow PATCH + steps PUT | api.ts:196-197 | `updateWorkflow`/`updateWorkflowSteps` (server resolves names→UUID, **invalid → null**) | **WIRED — client sends values the server must discard** |
| Archive/restore/delete | api.ts:209-211 | server enforces delete-only-without-runs | **WIRED** |
| Focus queue | none | `localStorage: agentlab_command_center_priorities_v1` | **Browser-local by design** |
| *(never called)* `GET /api/aistudio/state` | api.ts:242 | `aiStudioSync.ts:getSyncState` — real state snapshot exists | **UNCONSUMED — header pill hardcodes "Connected"** |
| *(never read)* `localContentQueueExcerpt` | — | returned by content-calendar | **UNCONSUMED** |

---

## Findings

### FICTIONAL (presented as live, backed by nothing)

1. **Swarm card description**: `"5 Autonomous compute nodes executing across 6 active DAGs (M:N Swarm Runtime)"` — hardcoded. The badge directly above it shows the real agent count (live roster is currently 3), and the workflows header shows the real DAG count. The explainer callout *"Why 6 DAGs vs 5 Swarm Nodes?"* repeats the same invented numbers.
2. **Model badge**: `"Google Gemini 2.5 Flash"` — the server deliberately **never** calls that id: `GOOGLE_MODEL_CHAIN = [gemini-flash-latest, gemini-3.8-flash, gemini-pro-latest]`, the pinned `gemini-2.5-flash` is documented as retired for new accounts (orchestrator.ts:433, orchestrator-fallback.test.ts asserts no 2.5 calls), and each response reports the model that actually answered in `executionMetrics.model` — which this UI ignores.
3. **Initial greeting**: *"All swarms, SAIF guardrails, and AI Studio mobile sync endpoints are active."* — static claim shown before any state is fetched.
4. **Error text**: *"[Error …]: …. Operating in fallback autonomy mode."* — there is no fallback autonomy mode; the chat simply failed.
5. **Artifact inspector defaults**: `qualityGrade || "A"` + `qualityScore ?? 90` + *"`✓ Passed Brand & Fact Checks`"* when `verificationNotes` is absent — an ungraded artifact is presented as grade-A, 90%, verified. The `?? 90` fallback also appears twice in list views.
6. **Header badges**: `"Live Runtime"` and `"AI Studio Mobile: Connected"` — unconditional. A real state endpoint (`GET /api/aistudio/state`) exists and is never called.
7. **LinkedIn queue sync claim**: the `"Linked"` badge and *"Artifacts synced with `Agent Lab LinkedIn/Content-Queue.md`"* are false in every environment this repo runs — the folder does not exist in the working tree (verified), no server or script path writes to it, and the content-calendar's `localContentQueueExcerpt` (the one field that could prove it) is fetched and never rendered. On Cloud Run the read simply returns `""`.
8. **Engine badge mislabel**: `engine.includes("Imagen") ? "Imagen 3" : "Flux Schnell"` — the server also returns `Neural Turbo Engine` / `Neural Fast Render` (the honest fallbacks when Imagen/Flux keys are absent); both get labeled "Flux Schnell".

### DEFECTS (real bugs)

9. **Legacy agent names → silent null assignments.** The step editor's default template (stepless workflow) and `handleAddStep` write `agentId: "Alpha-Node-01"` / `"Workflow-Planner-04"` / `"Auditor-Bot-9"`. `updateWorkflowSteps.resolveAgentId` maps known names→UUIDs, else **null** — so on any workspace whose roster doesn't contain those legacy names (the current roster: Client Health Monitor, Operations Analyst, Financial Controller), the assignment the user just saw in the modal saves as *unassigned*, silently. The step card then renders `step.agentId || "Alpha-Node-01"` — **claiming** Alpha-Node-01 is assigned when the value is actually null. Properly assigned steps render their **raw UUID** (no name lookup).
10. **CRON trigger with no cron field.** The modal offers `triggerType: schedule` but PATCHes only name/description/triggerType. Result: `triggerType = schedule`, `cronExpression = null`, `nextRunAt = null` → the scheduler's `lte(nextRunAt, now)` never selects it (NULL comparison) — an **inert workflow** that will never fire and never self-pause. Cross-page impact: the Dashboard's new AUTOPILOT badge (CC-008) counts `triggerType === "schedule"` as armed, so this inert state would show "AUTOPILOT ENGAGED" falsely.
11. **Approval Queue shows `run.workflowId`** (UUID) where the workflow name is one map away — the page already fetches workflows.
12. **`{agents.length} Online Nodes`** — counts every agent regardless of status as "Online".
13. **Assets `totalCount`** = rows returned after `limit=30` — freezes at 30 (same class as the Dashboard's old 50-cap).

### WIRED AND HONEST (the good list)

The **focus queue** (works exactly as labeled; browser-local persistence), **Approval Queue** logic (correct status vocabulary, real approve/reject), **Dispatch Decisions** (human-gated trpc), **workflow lifecycle** (archive/restore/delete with server-side evidence protection), **execute run**, **content calendar counts**, **evaluate/refine/image pipeline**, **1-Click Sync**, **orchestrator chat backend** (after its honesty lineage: honest refusal without fabricated proposals, truthful per-request model), and the **roster rows** (real names/roles/status dots, honest `no steps yet`). All navigation targets (`/ops-agent` etc.) exist.

---

## Recommended dispositions (Robert decides)

Robert approved the full order on 2026-10-02 ("Execute all 12 in order") plus disposition 13 as "label session-only now"; execution recorded as CC-2026-10-02-010.

| # | Item | Recommendation | Status |
|---|---|---|---|
| 1 | Swarm card "5 nodes / 6 DAGs" description + explainer | **Wire to live counts** (agents.length × workflows.length) or replace with a static *mechanics* explanation carrying no counts | **DONE** — description derives from live counts; explainer is now count-free ("Why DAGs vs Swarm Nodes?") |
| 2 | `{n} Online Nodes` badge | **Count `status === "active"`** (or relabel "Nodes") | **DONE** — `{active} Active / {total} Nodes` |
| 3 | Model badge "Google Gemini 2.5 Flash" | **Honest label**: show the last response's `executionMetrics.model` when available, else "Gemini (chain)" | **DONE** — `lastModel` state fed from `executionMetrics.model`; fallback badge "Gemini (chain)" with tooltip |
| 4 | Greeting + "fallback autonomy mode" error text | **Rewrite** to state nothing unverified; error text says the plain truth | **DONE** — greeting makes no claims; failure reads "No reply was received — try again"; dormant invented-ack fallback replaced with "returned no reply text" |
| 5 | Grade/score/verification defaults (`A`, `90`, `✓ Passed`) | **Show "Not evaluated"** states; add a Re-evaluate affordance for ungraded artifacts | **DONE** — inspector shows "Not evaluated" + "Not yet verified — run Re-evaluate" (Re-evaluate button already existed); list views drop the `?? 90` invention and show the score only when it exists |
| 6 | "Live Runtime" + "AI Studio Mobile: Connected" pills | **Drop or relabel**: "Live Runtime" → remove; mobile pill → call `GET /api/aistudio/state` (real endpoint, currently unused) or relabel "Bridge ready" | **DONE (wired)** — badge removed; pill is now "AI Studio Bridge: Online/Offline/Checking…" from a 60s poll of the real endpoint |
| 7 | LinkedIn "Linked" badge + sync claim | **Remove the claim** (file absent, no sync path); keep a neutral note that the repo queue lives outside this service | **DONE** — badge "External"; copy states Content-Queue.md lives in OneDrive and is NOT synced automatically |
| 8 | Engine badge non-Imagen → "Flux Schnell" | **Show the server's engine string as-is** | **DONE** — both badges render the server string; studio description no longer promises Imagen 3 exclusively |
| 9 | Step editor legacy agentIds + null/UUID display | **Client fix**: default/add-step agentId = `null` (or first real agent); step card resolves UUID→name from agentsData and renders "Unassigned" when null | **DONE** — default template + Add Step start `agentId: null`; cards resolve via `agentNameById`, else "Unassigned"; the legacy-name `<option>` fallback list is removed |
| 10 | CRON trigger with no cron field | **Add a cron input** to the modal (validated like `updateWorkflowSchedule`) AND tighten the Dashboard autopilot condition to `triggerType === "schedule" && cronExpression && status === "active"` | **DONE (client + server + Dashboard)** — cron field added; save routes trigger/cron through `PATCH /workflows/:id/schedule` (computes nextRunAt → armed); server now 400s schedule-without-cron in BOTH `updateWorkflowSchedule` and `createCustomWorkflow`; Dashboard autopilot condition tightened; 6 new guard tests |
| 11 | Approval Queue UUID | **Resolve workflowId → name** via the workflows already fetched (same fix as Dashboard) | **DONE** — `workflowNameById` with UUID fallback |
| 12 | Assets totalCount cap | **Server-side count** (same additive pattern as `listRuns.total`) or relabel | **DONE** — `listArtifacts` returns additive `total` (failure-tolerant, 2 tests); badge reads `total ?? totalCount` |
| 13 | Chat persistence | **Decision**: the `/ops-agent` page persists through `ops-chat`; this terminal is ephemeral. Wire it to the same thread endpoints, or label the panel "session-only chat" | **DONE (label)** — CardDescription now states "Session-only — this thread is not persisted; reloading clears it." Wiring to ops-chat deferred to the Ops Agent audit pass |

### Cross-page note (found here, applies to Dashboard)

Disposition 10's second half corrects the Dashboard AUTOPILOT condition introduced in CC-2026-10-02-008: `triggerType === "schedule"` alone is not sufficient — the scheduler also requires `status = "active"` and a due `nextRunAt` (set from a valid cron). The badge condition should require a non-null `cronExpression`.

---

## Honest limits of this audit

- Rendering audited by code reading, not browser clicking; every claim names its file/line and the presence or absence of its consumer.
- Server controllers behind artifacts/image/sync were spot-traced (routes, response shapes, engine strings, scheduler selection criteria), not exhaustively re-audited — they were covered by their own test suites and the honesty lineage entries.
- The focus queue's localStorage persistence is documented as a limitation, not a defect: it functions as labeled, per browser.

---

*Audit method note: "wired" was verified by tracing consumers in server and client code (search + read), not by UI appearance. Findings are reproducible: each claim names its file, line, and the absence or presence of its consumer.*
