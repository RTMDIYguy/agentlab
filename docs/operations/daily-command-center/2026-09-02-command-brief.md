# Daily Command Brief - 2026-09-02

Status: generated

## Top 3 Actions

- [ ] Check money/client-trust items before tool experiments.
- [ ] MKT-05 Outreach & Engagement: Outreach batch setup, tracking, and reply handling
- [ ] MKT-02 Email/SMS Nurture: Nurture sequence rules, stop conditions, handoff rules

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
- [ ] Build first repo-native Owner's Manual from the blueprint (Needed; owner: Robert + agent)
- [ ] Run weekly workflow audit bank for process completeness, stack stability, dependencies, responsibilities, and efficiency (Needed; owner: Robert + agent)
- [ ] Define safe sandbox use plan for VPS and KNIME (Needed; owner: Robert + agent)
- [ ] Park Docker / OpenClaw infrastructure repair until money tasks are stable (Deferred; owner: Robert + agent)

## Ask Robert

- Which one marketing or sales action should receive the first human judgment block today?
- Did any new account, tool, relationship, affiliate link, or schedule appear that needs registry capture?

## Recent Source Notes

- CC-2026-08-30-001 Auth / Bugfix / Runtime: Restored missing server/_core/authRoutes.ts with complete implementations of /api/auth/signup, /api/auth/login, /api/auth/google, /api/auth/me, and /api/auth/logout. Added guaranteed fallback secret in sdk.ts to prevent JWT signing/verification failures on missing env variables. Added automated unit tests.
- CC-2026-08-30-002 Mobile / Ingestion / AI Studio Sync: Built bidirectional AI Studio mobile synchronization and roaming data ingestion bridge (GET /api/aistudio/state, POST /api/aistudio/ingest, POST /api/aistudio/action, POST /api/aistudio/webhook/register). Supports live OS telemetry exports, voice notes/lead/field observation ingestion, remote action execution, and push webhook subscriptions. Synced updated Owner's Manual to Robert's Desktop.
- CC-2026-08-30-003 UI / Command Center / Fullstack: Built and deployed full-featured Agency Command Center (/command-center) featuring: Operating Priorities / SOP Directives, Deployable SOP Workflows / DAG execution dispatch (/api/workflows/:id/run), Swarm Agents monitor (/api/agents), Human-in-the-Loop pending approval queue (/api/runs/:id/approve / reject), and Ops Orchestrator natural language terminal (/api/orchestrator/chat). Mounted /command-center in App.tsx and resolved 404 route gap.
- CC-2026-09-02-001 Governance / Drift Scanner / Catalog Standardization: Enhanced automated documentation drift scanner (scripts/drift/drift-scan.mjs) to recursively inspect the entire 74-document operations catalog with lifecycle-aware historical exemptions; standardized YAML frontmatter headers across core SOPs and navigation documents; verified zero drift findings and passed change-control checks.
- CC-2026-09-02-002 UI / Commercial Alignment / Pricing / Routing: Reduced Startup Operational Excellence digital book price from $49.99 to $19.99 across product registry, reconciliation doc, and marketplace; added /contact and /demo route aliases in App.tsx; harmonized public homepage pricing with canonical Offer Ladder (Founder Signal System $1k, Ownable OS $500/mo, Playbooks $149/mo); enriched /features with 7-department granular workflow breakdowns; wired interactive action handlers on Marketplace cards.

## Source Boundary

- This brief is generated from approved repo/workspace operating docs.
- It must not include secret values, backup codes, OAuth secrets, service-account private keys, or client-sensitive raw data.
