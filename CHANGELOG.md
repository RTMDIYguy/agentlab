# Changelog

All notable changes to the AI Native Agency Deepened/agentlab repo are documented here.

---

## [Unreleased]

### 2026-08-07 — Session 7 (Cowork / Claude)

**Operations & Spreadsheet Integration**
- Created `scripts/incorporate_records.py` Python sync script. It utilizes Node.js shared-stream copying to safely duplicate `Uncle Robert Records.xlsx` (bypassing OneDrive and Windows Excel exclusive read locks) and parse live tracker data from sheets `Apps Builds`, `Accomplished TW`, `New Accounts Added TW`, `Lead List`, and the `90-Day Posting Calendar`.
- Reconfigured Desktop `command-center-html.html` to inject these live tracking cards dynamically via `<!-- EXCEL RECORDS START -->` markers.
- Modified `scripts/daily-command-center.mjs` to run the Excel synchronizer automatically at start. Now, executing `pnpm daily-command:center` updates both the desktop dashboard and today's brief simultaneously.
- Created `docs/operations/session-handoff-2026-08-07.md` handoff and logged today's command brief at `docs/operations/daily-command-center/2026-08-07-command-brief.md`.

**Marketing & Pulse Social Scheduler App**
- Recovered, restructured, and built the complete `Pulse Social` React/FastAPI codebase from your 2,664-paragraph Word backup document (`Pulse Social App.docx`) using a python XML extractor.
- Created your private GitHub repository `RTMDIYguy/pulse-social` and committed the code there.
- Deployed your Python FastAPI container to Google Cloud Run, connected directly to your cloud MongoDB Atlas database, with Claude Sonnet 4.5 AI caption generation fully integrated.
- Configured Vercel's framework settings (Root Directory = `frontend`, Framework = Create React App) and resolved all compilation blockers (wrote mounting templates `index.js` and `public/index.html`, added missing Shadcn UI files `sonner.jsx`, `calendar.jsx`, `popover.jsx`, `tabs.jsx`, and `dropdown-menu.jsx`, and wrote a Python cleanup script `clean_jsx_escapes.py` to strip escaped quotes `\"` from all 14 pages).
- **Successfully compiled and deployed the frontend on Vercel**! Your interactive app is live at: [https://pulse-social-agentlab-projects.vercel.app](https://pulse-social-agentlab-projects.vercel.app)!
- **Replaced Mock Data with Live API Integrations (Phase 3 & 4)**: Integrated actual OAuth 2.0 flows for LinkedIn and Facebook. The backend APScheduler now automatically pushes scheduled posts directly to the live LinkedIn UGC API and Facebook Graph API. 
- Implemented a background Real-time Analytics Engine that queries LinkedIn and Meta every 2 hours to pull live engagement data (Likes, Comments, Shares) and syncs it securely to the Analytics dashboard graphs.
---

### 2026-06-10 — Session 6 (Cowork / Claude)

**Operations**
- Expanded `docs/operations/agency-owners-manual.md` with updated operating procedures
- Created `docs/operations/daily-command-center/2026-06-10-command-brief.md` — today's command brief
- Created `docs/operations/session-handoff-2026-06-05.md` — session 5 handoff anchor
- Created `docs/operations/session-handoff-template.md` — reusable handoff template for future sessions
- Created root-level `MEMORY.md` — working memory index for agent session continuity

**Marketing / Founders Signal System (FSS)**
- Beta delivery planning for Lorenzo Marrese (barter: bookkeeping setup for free FSS delivery)
- Intake questionnaire at `workflows/marketing-founder-signal-system/assets/intake-questions.md` identified for Lorenzo pre-call
- Day 0 diagnostic call scheduled 2026-06-17; Days 1-5 sprint week of June 17-21
- FSS package version `0.1.0-draft` previously committed; no code changes this session

**Dev / Codex P1 Tasks (pending)**
- Task #3/#7: Stripe procedure mismatch — `Book.tsx` + `server/stripe/router.ts` / `server/stripe/checkout.ts` (in progress)
- Task #4: HubSpot unauthenticated patch — `server/hubspot/router.ts` (pending)
- Task #5: Service worker caching authenticated API responses — `client/public/sw.js` (pending)

---

## [0.1.0] — 2026-06-07

### Session 5 (Cowork / Claude)

**Dev**
- Added `Community`, `Book`, `AdminEvents`, `Bootcamp` pages with HubSpot + Stripe wiring
  (`e62b562`)
- Disabled CockroachDB PostToolUse hook (`check-sql-files.py`) that broke on Windows due to
  unexpanded `${CLAUDE_PLUGIN_ROOT}` path variable (`2c76d7a`)

**Operations**
- Updated operations docs after agent workflow testing (`6cb85e4`)
- Linked Google Drive sync to repo update cycle (`f12bfa7`)
- Added Agency Command Center to operating manual (`96e72c6`)
- Created June 7 session handoff document

---

## [0.0.1] — 2026-06-04

### Session 1-4 (Cowork / Claude)

**Operations**
- Bootstrapped `WORKSPACE-STANDARD.md`, `agency-operating-manual.md`, `agency-command-center.md`
- Created Daily Command Center script (`scripts/daily-command-center.mjs`) with CT timezone fix
- Built `change-control-register.md` and `scheduled-change-queue.md` control layer
- Added `workflow-registry.md`, `sop-manual-index.md`, `workflow-relationship-map.md`
- Documented Bootstrapper.ai / Ownable OS system including CRM inventory (0 accounts/contacts,
  both sync integrations platform-blocked)
- Added Markdown Monster publishing bridge plan

**Marketing**
- MKT-09 RoundTable Operating Slice v0 (free chapter meetings, Google Sheet response path)
- Agent Lab LinkedIn content queue health correction
- Founder Signal System (FSS) package scaffolded at `workflows/marketing-founder-signal-system/`
- FSS offer one-pager, intake questionnaire, implementation checklist, source map, kit.md

**Dev**
- Drizzle schema and migration files
- tRPC router stubs for HubSpot, Stripe, admin
- Client pages: `Book.tsx`, `Community.tsx`, `AdminEvents.tsx`, `Bootcamp.tsx`
