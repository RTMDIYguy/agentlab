# Session Handoff — June 7, 2026

## Who You're Working With
Robert McCarthy — Uncle Robert Consulting LLC (URC). Founder building an AI-native agency/consulting practice. Primary tool is **Claude Desktop (Cowork)**. Separate Claude Code CLI installation called **Codex** exists but is secondary and currently has auth issues (parked).

---

## Active Operating System: Bootstrapper.ai / Ownable OS

Platform for founder operations. Key modules:
- **Profit Engine** — CRM (pipeline, accounts, contacts, deals)
- **Financial Engine** — revenue/expense tracking
- **Value Engine** — offer management
- **People Engine** — team/contractor layer
- **Weekly Close** — operating cadence mechanic
- **Exit Studio** — long-range value planning
- **Independence Chapter** — community membership layer

**Current platform status**: Ownable OS is NOT fully functional. Both email/calendar sync integrations are blocked:
- Google OAuth: blocked — Bootstrapper.ai has not completed Google verification
- Microsoft/Nylas: error 31004 (integration_not_found) — platform-side bug
- DO NOT attempt to reconnect these until Bootstrapper.ai team resolves them
- Platform IS usable for CRM cockpit/pipeline management

---

## Source-of-Record Files

All operations docs live in the GitHub repo that syncs to:
`C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\agent-lab-site\`

Key files:
- `docs/operations/bootstrapper-ai-operating-field-guide.md` — v1 field guide (June 5). Full CRM inspection from June 3, sync blocker details, 7-day sprint plan, safety rules, glossary
- `docs/operations/session-handoff-2026-06-05.md` — previous handoff
- `docs/operations/session-handoff-2026-06-07.md` — this file

---

## CRM Status (Day 1 Inspection — COMPLETE)

Inspection confirmed June 3 (screenshots captured, documented in field guide):
- 0 accounts, 0 contacts, 0 deals, $0 pipeline
- Setup checklist: 1/5 complete (pipeline stages only)
- Both sync integrations blocked (platform-side, not user error)

**Sprint Day 1 is DONE. Day 2 = Financial Engine review.**

---

## The Build Queue — APPROVED, AWAITING INTEGRATION

Location: `C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\Build Queue\`

Contents:
- `01-roundtable-opt-in-form.html` — ready to deploy
- `02-independence-chapter-event-tracker-template.html` — ready to deploy
- `03-book-landing-page.html` — ready to deploy
- `04-bootcamp-topic-recommendation.md` — content asset
- `hubspot-crm-exports-linkedin-first-touch-2026-05-19.csv` — **9 real KC-area prospects** (the only actual lead data that exists)
- `Reference Exports 2026-05-21/` — browser bookmarks
- `Root Intake 2026-05-21/` — 15 docs including playbooks, prompts, CRM schema, Codex handoff

Robert said "amazing, approved" — these are cleared for use. Integration plan:
1. Read each HTML file and determine deploy destination (Agent Lab site or standalone)
2. Route HubSpot CSV leads into working CRM (Bootstrapper.ai OR Google Sheet CRM-lite)
3. Triage Root Intake playbooks against what's already in the repo
4. `04-bootcamp-topic-recommendation.md` feeds offer development

---

## CRM-Lite Situation — SHEET DOES NOT EXIST

The "local CRM-lite" referenced in the field guide is a **SCHEMA PLAN only**, not a live sheet.

- Schema doc: `Build Queue/Root Intake 2026-05-21/CRM lite.docx`
- Planned sheet name: `URC-Phase1-CRM-Lite`
- Columns: ID, Name, Email, Phone, Creator Type, Lead Source, Offer, Pipeline Stage, Deal Value, Last Touch Date, Next Action Date, Next Action, Notes, Date Created
- Creator Types: Writer, Model, Graphic Artist, Trades, Other
- Lead Sources: Referral, LinkedIn, Organic Social, Downstairs Neighbor, Other
- Offers: Audit $97, Launch Pack $497, Retainer $397/mo, Other
- Pipeline Stages: New Lead → Audit Booked → Audit Delivered → Offer Made → Active Client → Closed-Lost

**NOTE**: These pipeline stages differ from Bootstrapper.ai's stages. Reconciliation needed before importing any leads.

The HubSpot CSV (9 KC companies) is the **only actual lead data** that exists. These are the real prospects.

**Decision pending**: Create the Google Sheet now OR skip it and go straight to Bootstrapper.ai CRM as primary (after sandbox is set up)?

---

## HubSpot CSV Leads (the 9 KC companies)

All created 2026-04-29, LinkedIn first-touch, owned by Robert McCarthy:

| Company | City | Website |
|---------|------|---------|
| Advanced Solutions Inc. | Chicago | advsolutionspros.com |
| Novus Power Products LLC | Independence | novuspower.com |
| Ferguson Computer Services | Independence | fcskc.com |
| Weber TC | Independence | webertc.com |
| Matchstick Websites | Lee's Summit | matchstickwebsites.com |
| CPros | Blue Springs | cprosinc.com |
| IT Nachos | Independence | itnachos.com |
| Binary Noggin | North Kansas City | binarynoggin.com |
| Illumisoft | Kansas City | illumisoft.com |

---

## Pending Decisions / Immediate Next Actions

1. **Build Queue HTML files** — read each one, decide deploy destination
2. **CRM-lite decision** — create Google Sheet with schema, OR go straight to Bootstrapper.ai CRM sandbox
3. **Enter the 9 HubSpot leads** into whichever CRM is chosen (do NOT bulk-import to Bootstrapper.ai until sandbox company is tested first)
4. **Day 2 sprint** — Financial Engine review
5. **Developer note to Lorenzo** (joinbootstrapper.com) — document Google OAuth + Nylas 31004 errors; not yet sent
6. **Reconcile pipeline stage naming** — CRM-lite schema vs. Bootstrapper.ai stages

---

## Safety Rules (DO NOT VIOLATE)

- DO NOT connect email/calendar sync in Bootstrapper.ai until Google OAuth and Microsoft Nylas errors resolved by platform team
- DO NOT bulk-import leads into Bootstrapper.ai CRM until a sandbox company is created and tested first
- DO NOT disconnect bank accounts casually
- DO NOT delete CRM records, targets, protocols, or chapter material while learning the system
- DO NOT publish screenshots with private financial, banking, personal, prospect, or email details
- DO NOT delete `C:\Users\thebo\AppData\Local\NEO\User Data\LocalLLM\2025.4.4.1\model.gguf` — Robert actively uses this local LLM model

---

## Technical Notes

- **RAM**: 8GB total, tight. Docker Desktop should stay closed during Cowork sessions (frees ~400 MB). WSL2 issue is resolved.
- **Codex auth**: Parked. Has conflict between claude.ai session and ANTHROPIC_API_KEY. Fix = run `claude /logout` in Codex terminal, keep API key. Not a priority.
- **Broken hook (check-sql-files.py)**: Fires on every PostToolUse:Edit in Codex. Cosmetic only, no work blocked. Low priority.
- **Agent Lab site**: GitHub repo at `C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\agent-lab-site\`. Source of record for all operations docs.
