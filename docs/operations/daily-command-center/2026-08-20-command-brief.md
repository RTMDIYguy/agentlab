# Daily Command Brief - 2026-08-20

Status: generated

## Top 3 Actions

- [ ] **Virtusa / Dheerendar Walkthrough**: Execute 15-minute technical demonstration and partnership walkthrough of Founder Signal System & Pulse Social (NDA sent via LinkedIn message; review `output/Dheerendar_Walkthrough_Plan.md`).
- [ ] **MKT-02 Automated Nurture Engine**: Leverage synced HubSpot contacts to trigger automated email sequences or activate the n8n Resend email-sending loop for 3-touch nurture flow.
- [ ] **Money & Client-Trust Check**: Verify proposals, active pipeline receivables, and client follow-ups before sandbox tool experiments.

## Marketing And Sales Moves

- [ ] **Virtusa / Dheerendar Walkthrough**: Host scheduled demo using `run_pulse_social.bat` and `Dheerendar_Walkthrough_Plan.md`; confirm NDA signature received from LinkedIn message.
- [ ] **MKT-02 Email Nurture Automation**: Connect synced HubSpot SDR leads to automated email-sending loop (n8n Resend / HubSpot Sequences) with 3-touch guardrail.
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

- CC-2026-08-09-001 Testing / Autonoma: Created a postmortem record of the Pulse Social Autonoma onboarding process.
- CC-2026-08-09-002 Testing / Autonoma Onboarding Troubleshooting: Updated the Autonoma onboarding postmortem to document the 'Invalid signature' Custom Webhook bug, the Vercel OAuth double-installation trap, and added a clear intent to share this postmortem with the Autonoma team.
- CC-2026-08-11-001 Sales / Gumroad Integration: Designed, verified, and published custom Gumroad landing pages for Startup Operational Excellence and Bootstrapper's Guide to the World. Updated outreach SOPs and content queue to drive traffic.
- CC-2026-08-18-001 Automation / CRM-Lite: Repaired and activated the n8n SDR-Agent CRM-Lite to HubSpot Sync workflow, replacing legacy nodes with Service Key auth, modern upsert nodes, and dedicated Filter logic.
- CC-2026-08-18-002 Automation / Marketing: Built and published the MKT-02 stateful nurture engine in n8n. Daily CRON (9 AM) queries HubSpot for contacts due for a nurture touch, routes by step (Switch node), sends email via Resend SMTP from robert@unclerobertconsulting.com, then advances the step and schedules the next date in HubSpot. Three-touch limit enforced per the Founder Signal System rule. Also added unclerobertconsulting.com as a verified Resend sending domain and registered the n8n MCP server in .agents/mcp_config.json for programmatic agent access.

## Source Boundary

- This brief is generated from approved repo/workspace operating docs.
- It must not include secret values, backup codes, OAuth secrets, service-account private keys, or client-sensitive raw data.
