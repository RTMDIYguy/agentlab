# Daily Command Brief - 2026-10-01

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

- CC-2026-10-01-005 Integrations / MCP runtime + OAuth / decision to build: Confirmed for Robert that workspace_integrations is a catalog, not a connection layer (working integrations run through vault+code; all MCP rows are inert bookmarks, several with placeholder endpoints). Captured Upwork's full OAuth discovery metadata live (authorize/token/revoke endpoints, authorization_code+refresh_token, PKCE S256, client_id metadata docs supported). Decision: BUILD a generic metadata-driven MCP runtime client (streamable-HTTP/SSE, Bearer) + OAuth connect flow (PKCE from Settings, tokens in workspaceSecrets vault); Upwork first, any OAuth-gated MCP server second. Queued CC-2026-10-01-005.
- CC-2026-10-01-006 Fullstack / MCP / OAuth module + runtime client shipped: Built the metadata-driven MCP capability decided in CC-2026-10-01-005: OAuth 2.1 module (RFC 9728/8414 discovery, PKCE S256, authorize URL, code exchange, refresh, revoke, expiry margin) and streamable-HTTP JSON-RPC MCP client (initialize/session, tools/list, tools/call, Bearer + protocol headers, SSE response parsing, honest errors). 15 new hermetic tests against local stub servers; full suite 511/511; tsc at documented 4-error baseline; live probe ran the OS's own discovery against Upwork's real server successfully. Honest scope: engine only — Settings wiring, vault round-trip, and Ops Agent exposure are the next slice; stdio servers out of scope by design.
- CC-2026-10-01-007 Fullstack / MCP / connect UI + vault round-trip + human-gated tool dispatch: Wired the MCP capability end to end: signed expiring OAuth state carrying the PKCE verifier; token resolution catalog-first then MCP_<NAME>_TOKEN env with explicit connect-first failure; connect lifecycle (start/complete/disconnect/refresh) storing token bundles through the standard vault pattern (applySecretToEnv + masked workspace_secrets row + integration active); mcp_tool_call connector as the only approval-to-MCP path (per-workspace endpoint+token resolution, tool-existence verification naming available tools, isError surfaced as dispatch failure); Settings Connect/Disconnect/List-Tools UI with callback auto-complete; testIntegration for MCP now a real session probe. 23 new hermetic tests; suite 534/534; tsc at 4-error baseline.
- CC-2026-10-01-008 Operations / Honesty audit / Settings wiring sweep: Swept every Settings control and traced each to a runtime consumer. Verdict: Secrets + Integrations/MCP genuinely wired (today's lineage); LLM tab's three DB-persisted controls (orchestrator name/system prompt/default model) have NO consumer — chat uses buildSystemPrompt(departments, telemetry); the other 12 LLM controls are localStorage-only decorations; the workspaces table's real governance columns (hard_monthly_budget, auto_pause, pii_redaction, saif_enforcement, audit_retention) have zero consumers; Profile/Billing/Notifications save to localStorage only; Security tab has hardcoded badges and a dead Manage Auth button. Recommendations: wire orchestrator prompt (highest leverage), wire-or-remove default model, wire budget+auto-pause or relabel as roadmap, relabel/hide the four fictional tabs, mark stdio presets not runtime-reachable.
- CC-2026-09-23-014 Fullstack / Agents / Honest Stats: Swept the audit's remaining Agents/CommandCenter findings and found the fiction ran deeper than the UI: the agents controller seeded six default agents with entirely fabricated histories (tasksCompleted up to 3102, uptime strings 98.5-99.9%) on first boot, and the schema itself defaulted every new agent row to uptime 99.9%. Now: (1) seeding is identity-only - name, role, model, system prompt, status idle, stats at zero, real numbers accumulate from actual executions; (2) schema uptime default dropped (column nullable, no longer trusted or displayed); (3) per-agent tasksCompleted, successRate, and lastStepAt are computed from real workflow run history by joining workflow_run_steps to workflow_steps on agentId; (4) Agents.tsx replaced the hardcoded 'Average Uptime 99.7% - Cloud Run container SLA' card with a real Average Success Rate (or an honest no-runs-yet empty state) and per-agent cards show real success rate or an em dash; (5) CommandCenter's agent list shows real success rate or 'no steps yet' instead of the 99.9% fallback. 4 regression tests including a check that the fabricated seed values never reappear in the controller.

## Source Boundary

- This brief is generated from approved repo/workspace operating docs.
- It must not include secret values, backup codes, OAuth secrets, service-account private keys, or client-sensitive raw data.
