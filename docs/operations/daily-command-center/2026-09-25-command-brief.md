# Daily Command Brief - 2026-09-25

Status: generated

## Top 3 Actions

- [ ] Check money/client-trust items before tool experiments.
- [ ] MKT-05 Outreach & Engagement: Outreach batch setup, tracking, and reply handling
- [ ] MKT-02 Email/SMS Nurture: Nurture sequence rules, stop conditions, handoff rules

## Bootstrapper.ai & Ownable OS Daily Operating Routine

- [ ] 🌟 Independence Chapter Home: Check 90-day plan card, chapter context, sponsor updates, and current activation step.
- [ ] 🧭 Ownable OS Command Center: Review Ownable Score, business valuation, wedge equity, discount rate, and active Simple Bets.
- [ ] 📈 Profit Engine & CRM Workspace: Check CRM Inbox, triage replies, advance deal pipeline (Lead -> Qualified -> Proposal -> Negotiation -> Won), and review Scorecard.
- [ ] 💳 Financial Engine (Mercury): Review real-time cash balance, burn/runway projection, verify account classifications, and scan recent transactions.
- [ ] ⚙️ Value Engine & Protocols: Select ProfitFlow targets, review diagnostics, and assess packaged workflow protocol readiness.
- [ ] 👥 People Engine & Hours: Check owner focused work allocation vs. delegation targets, contractor capacity, and seat assignments.
- [ ] 🔄 Control Layer Bridge & Sync: Mirror any serious business/revenue commitments into local control sheet/repo without manual duplicate drift.

## Marketing And Sales Moves

- [ ] MKT-05 Outreach & Engagement (Manual / Reach-assisted): Live Reach testing is producing real data and must stay controlled
- [ ] MKT-02 Email/SMS Nurture (Manual / scheduled campaigns): Follow-up must be consistent once replies and interest arrive
- [ ] MKT-01 Lead Generation & Conversion (Manual CSV review): Fresh lead sourcing must avoid duplicates and bad-fit drift
- [ ] SAL-02 OnBoarding (Zapier + manual gap): Signed proposals already trigger folder creation; the second half needs automation
- [ ] SAL-01 Proposals & Contracts (Manual / template-driven): Revenue conversations need a clean path into signed work

## Follow-Ups And Handoffs

- [ ] SAL-02 OnBoarding: Google Drive packet copy, folder population, sharing
- [ ] SAL-01 Proposals & Contracts: Proposal prep, review, send, and status tracking
- [ ] FUL-02 Client Success: Client success tracker and check-in cadence
- [ ] FUL-03 Customer Service: Issue intake, tiering, and escalation
- [ ] FIN-03 Accounts Receivable & Payable: Invoice creation, receivables review, payment status, SKU/account mapping

## Workflow Audit Prompt

- Start with MKT-09 until the event lane is runnable.
- Audit lanes today: Process steps completeness; Stack stabilization; Workflow viability; Dependencies and handoffs; Action responsibilities; Flow efficiency.
- MKT-09 minimum slice:
  - event type: RoundTable Chapter meeting already scheduled in Ownable OS
  - audience and offer relationship
  - event source: book, content, outreach, referral, community, or partner
  - invite path
  - RSVP or registration path
  - reminder path
  - attendance record
  - follow-up sequence
  - CRM-lite bridge update fields
  - finance handoff if paid
  - proof/referral handoff into `MKT-04`
  - aftercare/community handoff into `AFC-04` when applicable

## Money And Client-Trust Checks

- Review invoices, payment status, receivables, proposals, onboarding, client issues, and promised follow-ups before optional platform experiments.
- Confirm any paid-tool, cloud, VPS, KNIME, or Stripe Connect work has a current revenue, client-trust, or learning reason.

## Parking Lot

- [ ] Promote this manual into the agency Operations folder / Google Drive source when Robert approves (Pending; owner: Robert + agent)
- [ ] Decide final MVP beta intake path (Pending; owner: Robert + agent)
- [ ] Decide Independence Chapter CRM-lite bridge location and required CRM-compatible columns (Needed; owner: Robert + agent)
- [ ] Reconcile Independence Chapter messaging against MVP beta messaging (Needed; owner: Robert + agent)
- [ ] Run weekly workflow audit bank for process completeness, stack stability, dependencies, responsibilities, and efficiency (Needed; owner: Robert + agent)
- [ ] Define safe sandbox use plan for VPS and KNIME (Needed; owner: Robert + agent)
- [ ] Park Docker / OpenClaw infrastructure repair until money tasks are stable (Deferred; owner: Robert + agent)

## Ask Robert

- Which one marketing or sales action should receive the first human judgment block today?
- Did any new account, tool, relationship, affiliate link, or schedule appear that needs registry capture?

## Recent Source Notes

- CC-2026-09-23-010 Fullstack / Screen Teardown / Persistence: Added real persistence for the Async Screen and Video Teardown Studio: new teardown_sessions table (workspace-scoped, bytea video_data, notes, ai_brief, ai_brief_model; schema + self-heal DDL + idempotent migration 0006), teardownRouter extended with list (hasVideo/hasBrief computed in SQL, never ships blobs) / save (metadata only) / updateBrief / delete, all workspace-scoped via the same user-record resolution sibling tRPC routers use; new REST controller teardown-video.ts for the binary path (POST/GET/DELETE /api/teardown/:id/video, base64 upload with a 36MB cap sized to the 50mb body-parser limit, workspace resolved from the JWT email through the users table exactly as tenantMiddleware does); ScreenRecorder rewired from useState session library to React Query (load with video on demand, save uploads the .webm, delete, honest toasts, partial-failure handling when metadata saves but the video upload fails); Autonoma teardownSessions factory added with disposable-workspace provisioning.
- CC-2026-09-23-011 Fullstack / Ops Agent / Real Pipeline Execution: Rewired executeOrchestratorWorkflow onto the real agent pipeline, removing the last P1-class fiction: previously it inserted an instant-completed run with a backdated startedAt (now minus 3600ms), inserted pre-canned template artifacts (hardcoded ICP brief, message map, 3 LinkedIn posts with invented stats and quality scores up to 98), wrote an audit row with fabricated telemetry (latencyMs 32, tokensTotal 1250, cost 0.00125, saifPassed true), and always returned success. Now: proposal steps are synced into real workflow_steps rows (create-once per workflow so re-executions reuse the DAG instead of duplicating cascade-linked rows), the run is inserted as pending with real timestamps, processPendingRuns executes it through the actual agent runner (real per-step LLM execution, artifact extraction with quality evaluation, guardrail steps pausing for approval, real failure marking with error messages), and the response reports the run's actual DB state including paused_for_approval and failed outcomes, per-step cost summed from workflow_run_steps, artifacts counted from the run's real rows, and tokens as null because per-run token counts are not persisted anywhere. OpsAgentChat renders the real outcome (failed toast with error, amber paused-for-approval state, success only on actual completion) and the old free 'latency 450ms' style fakes are gone. 8 hermetic regression tests pin the behavior including a no-fabricated-template-strings check.
- CC-2026-09-23-012 UI / Dashboard / Real Telemetry: Made the Dashboard System Telemetry Console read real state via new GET /api/dashboard/telemetry: the HubSpot badge now reflects the vault-synced workspace_integrations row (running the same syncWorkspaceVaultSecrets call Settings uses, counting configured tools from the row config) instead of a hardcoded CONNECTED; the LLM badge reflects actual OPENAI_API_KEY presence with CONFIGURED / NOT CONFIGURED states and a pointer to Settings - Secrets when absent; latency comes from the most recent completed workflow_run_steps row (real per-step latencyMs) with 'not reported' when none exists; the spend tile shows the real cumulative cost summed from executed steps by SQL (or an honest empty-state) replacing the hardcoded $12.50 / ($443 saved) marketing fiction; the cockpit header readout drops the fake 'NOMINAL / 450ms' strip for real node count and last-step latency; vault-sync errors surface in the console without breaking it; also fixed the agents fallback that invented '6 active' when the list was empty. 7 hermetic regression tests including a check that the hardcoded fiction strings never reappear in the Dashboard source.
- CC-2026-09-23-013 UI / Dashboard / Verified LLM Liveness: Added a real LLM health-ping: new GET /api/dashboard/llm-ping performs a minimal round-trip through the app's actual invokeLLM path (single 'reply pong' prompt, 512 max tokens), measures wall latency, and distinguishes three honest states - LIVE with measured round-trip ms, NOT CONFIGURED when the API key is absent (matched on the not-configured error), and PING FAILED with the real error when the endpoint is reachable but failing; an empty model response is explicitly not liveness. The Dashboard LLM badge now shows verified liveness from this ping (fired on mount and every 5 minutes, deliberately separate from the cheap 30s telemetry poll so polling never triggers model calls) with the pipeline's last-step latency still shown alongside from the telemetry endpoint. 6 new hermetic tests cover round-trip success, prompt minimality, not-configured vs erroring distinction, empty-response rejection, and array-content flattening.
- CC-2026-09-23-014 Fullstack / Agents / Honest Stats: Swept the audit's remaining Agents/CommandCenter findings and found the fiction ran deeper than the UI: the agents controller seeded six default agents with entirely fabricated histories (tasksCompleted up to 3102, uptime strings 98.5-99.9%) on first boot, and the schema itself defaulted every new agent row to uptime 99.9%. Now: (1) seeding is identity-only - name, role, model, system prompt, status idle, stats at zero, real numbers accumulate from actual executions; (2) schema uptime default dropped (column nullable, no longer trusted or displayed); (3) per-agent tasksCompleted, successRate, and lastStepAt are computed from real workflow run history by joining workflow_run_steps to workflow_steps on agentId; (4) Agents.tsx replaced the hardcoded 'Average Uptime 99.7% - Cloud Run container SLA' card with a real Average Success Rate (or an honest no-runs-yet empty state) and per-agent cards show real success rate or an em dash; (5) CommandCenter's agent list shows real success rate or 'no steps yet' instead of the 99.9% fallback. 4 regression tests including a check that the fabricated seed values never reappear in the controller.

## Source Boundary

- This brief is generated from approved repo/workspace operating docs.
- It must not include secret values, backup codes, OAuth secrets, service-account private keys, or client-sensitive raw data.
