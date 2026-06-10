# Daily Command Brief - 2026-06-10

Status: generated

## Top 3 Actions

- Check money/client-trust items before tool experiments.
- MKT-05 Outreach & Engagement: Outreach batch setup, tracking, and reply handling
- MKT-02 Email/SMS Nurture: Nurture sequence rules, stop conditions, handoff rules

## Marketing And Sales Moves

- MKT-05 Outreach & Engagement (Manual / Reach-assisted): Live Reach testing is producing real data and must stay controlled
- MKT-02 Email/SMS Nurture (Manual / scheduled campaigns): Follow-up must be consistent once replies and interest arrive
- MKT-01 Lead Generation & Conversion (Manual CSV review): Fresh lead sourcing must avoid duplicates and bad-fit drift
- SAL-02 OnBoarding (Zapier + manual gap): Signed proposals already trigger folder creation; the second half needs automation
- SAL-01 Proposals & Contracts (Manual / template-driven): Revenue conversations need a clean path into signed work

## Follow-Ups And Handoffs

- SAL-02 OnBoarding: Google Drive packet copy, folder population, sharing
- SAL-01 Proposals & Contracts: Proposal prep, review, send, and status tracking
- FUL-02 Client Success: Client success tracker and check-in cadence
- FUL-03 Customer Service: Issue intake, tiering, and escalation
- FIN-03 Accounts Receivable & Payable: Invoice creation, receivables review, payment status, SKU/account mapping

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

- Promote this manual into the agency Operations folder / Google Drive source when Robert approves (Pending; owner: Robert + agent)
- Decide final MVP beta intake path (Pending; owner: Robert + agent)
- Draft SOP for Reach outreach batch setup and monitoring (Needed; owner: Agent)
- Draft SOP for Google Drive client-folder packet population (Needed; owner: Agent)
- Decide Independence Chapter CRM-lite bridge location and required CRM-compatible columns (Needed; owner: Robert + agent)
- Reconcile Independence Chapter messaging against MVP beta messaging (Needed; owner: Robert + agent)
- Build first repo-native Owner's Manual from the blueprint (Needed; owner: Robert + agent)
- Run weekly workflow audit bank for process completeness, stack stability, dependencies, responsibilities, and efficiency (Needed; owner: Robert + agent)

## Ask Robert

- Which one marketing or sales action should receive the first human judgment block today?
- Did any new account, tool, relationship, affiliate link, or schedule appear that needs registry capture?

## Recent Source Notes

- CC-2026-06-04-013 Operations / Daily Command Center Morning Restart: Updated the June 4 command brief and Agency Command Center to carry forward three morning restart items: money/client-trust check, Agent Lab LinkedIn content queue refill, and MKT-09 RoundTable response tracker/follow-up copy.
- CC-2026-06-04-014 Marketing / Markdown Monster Publishing Bridge: Added a scheduled plan for testing Markdown Monster as a drafting, OpenAI image-provider, weblog, and RSS-to-LinkedIn-draft bridge. Captured candidate OpenAI image-provider settings, the current weblog add-in state, route options, and a sandbox proof sequence.
- CC-2026-06-04-015 Operations / Working Memory: Created short MEMORY.md files at the top of agent-lab-site and AI Native Agency Deepened as a recovery anchor. Each file lists workspace identity, current canaries, top active priorities, active TODOs, recent decisions, sources of truth, stop conditions, and update rules. Companion docs (AGENTS.md, agency-command-center.md, Agent Handoff Prompt.md, Agent Consolidation Blueprint.md, Agent Task Queue.md) remain the rule and front-door layers.
- CC-2026-06-07-001 Operations / Session Handoff: Created the June 7 session handoff document capturing active operating context: Bootstrapper.ai/Ownable OS status, CRM inspection results (0 accounts/contacts/deals, both sync integrations platform-blocked), Build Queue contents and integration plan, CRM-lite situation (schema-only, no live sheet), 9 HubSpot KC-area leads table, pending decisions, safety rules, and technical notes.
- CC-2026-06-07-002 Dev Tools / CockroachDB Plugin Hook Fix: Removed the PostToolUse:Write/Edit/MultiEdit hook (check-sql-files.py) from the CockroachDB plugin's hooks.json. The hook used ${CLAUDE_PLUGIN_ROOT} as a path variable which does not expand on Windows, causing a broken path error on every file write operation. Preserved the PreToolUse hook (SQL validator for actual CockroachDB execute operations).

## Source Boundary

- This brief is generated from approved repo/workspace operating docs.
- It must not include secret values, backup codes, OAuth secrets, service-account private keys, or client-sensitive raw data.
