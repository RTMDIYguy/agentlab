# Daily Command Brief - 2026-09-22

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

- CC-2026-09-11-002 Operations / Workflow Governance & Quality Gates / MKT-02 & MKT-05 Sequence Rules, Stop Conditions & Triage Runbook: Operationalized priority marketing workflows: (1) In MKT-02 Email/SMS Nurture, codified 5-stage value-first nurture cadence, 5 universal non-negotiable stop conditions (Sales Engagement, Unsubscribe, Hard Bounce, Disqualification, Negative Sentiment), and handoff contracts to SAL-01, MKT-09, and AFC-04; (2) In MKT-05 Outreach & Engagement, established 10-25 contact batch limit, 3-touch maximum rule, 5-category reply handling triage matrix (Positive, Pricing/Objection, Deferral, Opt-out, No-reply), and pre-batch deduplication runbook against lead-inventory-registry.md.
- CC-2026-09-22-001 Fullstack / Lead Capture / Newsletter / Blog: Wired previously scaffolded features to real backends: added newsletter (double opt-in subscribers + campaigns), contact submissions, and blog comments tables/routers; replaced phantom trpc calls (newsletter.*, blog.*, contact.*) that silently no-oped with fake success toasts; replaced founder-intake console.log lead stubs with durable DB persistence + optional n8n relay; made /api/intake persist leads before CRM relay; re-enabled commented-out artifact evaluate route that CommandCenter depends on; rewired public Blog/BlogArticle to real published-articles endpoints instead of hardcoded fake articles; rewired Status page to live health probes instead of hardcoded uptime/fake incidents; extended Autonoma factories for new models; migration 0004 made idempotent.
- CC-2026-09-22-002 Fullstack / Security / Secrets: Incident + fix: discovered settings-integrations test suite was persisting dummy secrets (test_hubspot_pat_67890, test_instantly_key_12345, test_elevenlabs_key_abcde) over the real HubSpot PAT (5 alias keys), Instantly key, and ElevenLabs key in .env.local on every test run, because applySecretToEnv unconditionally calls persistSecretToEnvFile. Restored real keys from Robert's vault files; added isTestProcess() guard so tests never write to or reload .env.local; made all three previously-failing tests hermetic (env set in-process, no file writes, no real keys in committed test files); removed real Instantly key that was embedded in the committed instantly-integration test.
- CC-2026-09-22-003 Fullstack / Secrets / Settings UI: Instantly trial expired and was not upgraded: removed the dead trial key from .env.local; vault sync now flips stale vault rows to disconnected/inactive when a provider key is absent instead of skipping silently; Settings UI no longer advertises a hardcoded fragment of the dead key and now renders connected vs disconnected badge states honestly with an accurate vault count.

## Source Boundary

- This brief is generated from approved repo/workspace operating docs.
- It must not include secret values, backup codes, OAuth secrets, service-account private keys, or client-sensitive raw data.
