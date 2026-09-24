# Demo → Real Conversion Plan

**Date**: 2026-09-23
**Owner**: Robert (approvals) + agents (implementation)
**Trigger**: Public interest and inquiries are arriving for AgentLab OS. The 2026-09-23 honesty audit (CC-003 → CC-016) removed every fabricated-data surface. This plan converts the remaining demo surfaces into real ones, defines what may and may not be promised, and turns incoming interest into the governed funnel.

---

## 1. Where the system actually stands

Every surface flagged by the honesty audit now reads real state: telemetry from `workflow_run_steps`, liveness from a real LLM round-trip, agents seeded identity-only with stats computed from run history, workflow success rates computed from real runs (never a default 100%), teardowns persisted to Postgres, and the orchestrator executing the real agent-runner pipeline. A fiction linter (CC-016) now fails CI on regression.

That is a real product posture — but honesty has a corollary: **what the system does not yet do is now the binding constraint on what we may sell.** The conversion plan below exists to close that gap in the order that protects client trust.

## 2. The demo-to-real inventory

Two classes remain. They need different work.

### Class A — labeled demo interactions (cosmetic, low risk)

| Surface | Today | Real version |
|---|---|---|
| Home DAG visualizer | Simulated animation, honestly labeled | Keep. It is a visualization of a real pipeline; relabel copy to "see a walkthrough of how the real pipeline executes" and link to Ops Agent Center |
| ComponentShowcase chat | Simulated responses, labeled | Keep as internal component demo; hide from public nav |
| Documentation health strip | Now "Descriptive Only" | Keep; doc content itself needs a pass against current behavior (see §5) |

### Class B — real pipeline, missing real-world side effects (the actual work)

The orchestrator genuinely executes LLM steps and produces real artifacts with real cost/latency telemetry. What it cannot yet do is **act on the outside world**: no step can send an email, post to LinkedIn, upsert a HubSpot contact, or write to M365. Today a "lead enrichment" workflow produces the *analysis* of a lead; it does not touch the CRM.

This is the gap a paying client will hit in week one. Closing it is the roadmap (§4).

## 3. What may and may not be promised (the honesty contract, commercialized)

The audit's doctrine becomes the sales doctrine. This is a competitive advantage: **the OS can prove every number it shows a prospect.**

**May promise** (demonstrable in a live diagnostic):
- Multi-step agentic workflows with real per-step artifacts, cost, and latency
- Guardrail/HITL steps that genuinely pause execution for human approval
- Workspace-scoped data isolation, persisted runs and artifacts, audit trail
- Every dashboard number traces to a real DB row (offer to show the query)

**May not promise** (until Class B closes / connectors exist):
- Autonomous outbound actions on external systems (emails, LinkedIn posts, CRM writes)
- Any uptime/availability percentage (there is no uptime measurement; there is a real success-rate computation)
- "Fully autonomous business in a box"
- Fixated ROI figures ("$443 saved") — offer the *measurement* of savings, not a number

**Inquiries discipline**: every reply to an inquiry uses the real feature list plus a dated roadmap for the rest. Never let a demo screenshot stand in for a capability claim.

## 4. Roadmap: from real pipeline to real-world actions

Ordered so that each tier is independently sellable.

**Tier 1 — Make the existing real pipeline client-ready (1–2 weeks)**
1. Runner hardening: per-step retry/timeout policy, dead-letter marking, run cancellation (server already has pause/resume primitives from HITL) — **✅ BUILT (CC-2026-09-23-021)**: `workflow_steps.timeout_seconds`/`max_retries` (migration 0010) drive `runWithStepPolicy` (clamped bounds, bounded retries, cooperative cancel checks between attempts), and `POST /api/runs/:runId/cancel` sets `cancel_requested` with in-step and between-step cancellation honoring — cancelled is recorded honestly, not as a failure
2. Artifact export (Markdown/PDF) so deliverables leave the system — **✅ BUILT (Markdown, CC-2026-09-23-021)**: `GET /api/runs/:runId/export` returns a per-run Markdown bundle (manifest, per-step transcripts, artifacts with grades) and `GET /api/artifacts/:artifactId/export` returns a single artifact; PDF deferred to when a client asks
3. A "runs" view for clients: real status, real costs, real artifacts — the honesty console as a client deliverable — **✅ BUILT (CC-2026-09-23-022)**: hashed share tokens (shown once, revocable, audit trail kept), token-scoped public read-only endpoints with explicit field projections (workspace identity resolves from the token, never the tenant middleware), operator Run Console page (`/run-console`) for link lifecycle, and public `/shared/runs?token=…` page rendering real status, per-step cost/latency, artifacts with grades, and live totals — auto-refreshing every 15s
4. Workspace invite flow + roles (owner/collaborator/viewer)

**Tier 2 — First real side effects via human-gated actions (2–4 weeks)**
Convert "agent writes the thing" into "agent drafts, human approves with one click" — this uses the *existing* guardrail step machinery as the approval surface:
1. `action` step type alongside `agent`/`guardrail`: draft artifact → HITL approval → dispatch — **✅ BUILT (CC-2026-09-23-018)**: `action` steps draft via the real agent-runner, park in `action_dispatches` as `awaiting_approval`, and pause the run like a guardrail; approve/reject via the `actions` router with a SAIF tripwire, strict connector-shape validation, and real-dispatch-only status flips
2. Dispatch connectors, in promise order: **HubSpot contact upsert** — **✅ BUILT (CC-2026-09-23-018, `hubspot_contact_upsert`, email id-lookup create-or-update on the vault PAT)**; **email via Microsoft 365** (next); **LinkedIn post draft queue** (paste-ready, not auto-post)
3. Every dispatch writes a real row (`action_dispatches`: step, approver, timestamp, real external id / real error) — the audit trail *is* the product — **✅ the row IS the ledger; per-dispatch outcome recorded against the external response**
4. SAIF check on dispatch payloads before release — **✅ BUILT**: credential patterns, prompt-injection phrasing, PII tripwires, and payload-size guard run at approval time

**Tier 3 — Scheduled and event-driven runs (2–3 weeks, can overlap)**
1. Real cron execution of the existing `cronExpression` field (runner-side scheduler)
2. Inbound webhook trigger endpoint with HMAC verification (the "Event / Inbound Webhook" trigger type becomes real)
3. Connector rate-limiting and backoff; per-workspace daily action budget

**Tier 4 — The Agentic OS migration path (ongoing)**
This is the URC front-end→back-end ladder from AGENTS.md: clients enter via workshops/continuity on the simplified-tools promise, and the migration offer is the *measured* upgrade — their real run history and cost data from Tier 1–3 becomes the business case for migrating their workflows into the managed OS.

## 5. Docs and site truth pass (this week, before more inquiries)

1. Sweep Documentation pages against current behavior — the "Descriptive Only" card was honest; now make the content match reality (remove pages describing connectors that don't exist yet, mark Tier 2+ items as "on roadmap") — **✅ DONE (CC-2026-09-23-020)**: every doc page now carries a live/partial/roadmap status with availability notes, vapor claims (SHA-256 artifact hashes, hardcoded "0 Drift") corrected or quarantined, and regression tests keep it honest
2. Pricing page: remove any implication of autonomous external actions; the deliverable is the measured pipeline + approvals — **pending** (Features/Pricing SLA wording already fixed in CC-016; remaining check is for autonomy implications)
3. Prepare a one-page "What AgentLab OS actually does today" from §3 — this becomes the inquiry reply attachment — **✅ DONE (CC-2026-09-23-019)**

## 6. Inquiry → funnel playbook (use the existing lead flow)

The AGENTS.md flow is: content → CTA → founder roundtable or diagnostic → follow-up → workshop/continuity/consulting → Agentic OS migration. Incoming inquiries enter at the diagnostic step:

1. **Capture** — every inquiry becomes a `contact_submissions` row (the messenger wiring from this repo already DMs new leads automatically); log source and date
2. **Qualify** — one founder-led reply: "Here's what the OS does today (one-pager). Worth a 30-minute diagnostic?" — qualification criteria: founder-led ops team, existing tool stack to simplify, budget authority
3. **Diagnostic call** — live demo of a real run on *their* workflow material; show the telemetry console and the audit trail; explicitly state the roadmap boundary from §3
4. **First offer** — the $1k Starter Sprint (existing offer ladder): a real workflow built on their stack, delivered as measured runs they own
5. **Follow-up** — MKT-02 nurture; roundtable invite (Bootstrapper Capital lane)
6. **Migration** — Tier 4 offer after delivery proves the system

**Capacity honesty**: while the pipeline is pre-Tier-2, sell the sprint tier only as fast as Robert can do founder-led diagnostics (this is the one step agents must not automate — judgment and trust). One to two diagnostics per week is the honest capacity until automation lands.

## 7. Decisions needed from Robert

1. Approve §3 as the standing claims policy (y/n or edits)
2. Pick the Tier 2 dispatch order: HubSpot first, or M365 email first?
3. Confirm the inquiry reply one-pager is derived from this doc (or assign drafting)
4. Capacity: how many founder-led diagnostics per week are actually sustainable this month?

## 8. Change control

This plan is a planning artifact, not an implementation. Each tier item lands as its own change-control entry as built. Scheduled items go to `scheduled-change-queue.md`.
