# Changelog

All notable changes to the AI Native Agency Deepened/agentlab repo are documented here.

---

## [Unreleased] - 2026-08-24

### Added

- **Multi-Tenant Postgres Schema**: Rebuilt the database schema using Drizzle ORM to support isolated workspaces, enabling "blank models" for clients.
- **Execution Engine**: Implemented a Postgres-backed background queue processor (`queue-processor.ts`) and Gemini 1.5 Pro agent runner (`agent-runner.ts`) to execute Directed Acyclic Graph (DAG) workflows autonomously.
- **Marketplace Storefront**: Built the backend APIs and UI to catalog monetizable Knowledge Packages (Playbooks) and manage tenant subscriptions via Stripe.
- **Firebase Authentication**: Integrated Google Cloud Identity (Firebase Auth) for secure login, complete with a "God-Mode" middleware bypass for agency admins.
- **Adaptive Billing & Metering**: Created a Stripe metering job to bill workflow execution costs at a margin, plus an AI-driven `adaptive-downgrade.ts` script that uses Gemini to intelligently tailor free-tier limits for expiring trials.
- **Command Center UI Overhaul**: Replaced raw JSON inputs with dynamic forms, live step-by-step execution tracking, and a dedicated Human-in-the-Loop "Review Required" modal.
- **Proprietary Playbook Ingestion**: Successfully seeded the active database with the actual URC Ops, Finance, Fulfillment, Marketing, and Sales playbooks.
- **Cloud Infrastructure**: Dockerized the full stack (Vite + Node.js) into a multi-stage `Dockerfile` and deployed the live application to Google Cloud Run.

### Changed

- **Database Migration**: Switched the entire backend ORM driver from MySQL to PostgreSQL (Neon Serverless Postgres), including connection pooling for serverless scaling.
- **UI Alignment**: Swept the marketing pages (Features, About, Blog) to fully support the dynamic Tailwind dark mode theme and accurately reflect all 7 URC departments.

---

## [Unreleased] - 2026-08-21

### Added

- **Hamarashops Partnership**: Established a revenue-sharing cross-promotional partnership with Dheerendar (HAMARASHOPS.ai). Medical services AI (MedLM) marketed to doctors in exchange for Founder Signal System marketed to companies in India.
- **Hamarashops Assets**: Created `Hamarashops_Partnership` directory to track strategy PDFs, outreach templates, plans, and NDAs.
- **HubSpot CRM Ecosystem Architecture**: Implemented a master `Lead / Campaign Source` custom property on Deals. Enables single-pipeline tagging for AgentLab roundtables, app betas, signal systems, URC, and Hamarashops partnership leads, bypassing the free tier 1-pipeline limit.
- **Healthcare Outreach Template**: Created targeted outreach messaging for CMIOs and Clinical Directors focusing on automating clinical documentation and reducing physician burnout.

---

## [Unreleased] - 2026-08-20

### Added

- **Postman API Collections & Environment Sync**: Exported and tracked Postman workspace collections (`Hostinger API`, `Postman API`, `My Collection`) and the `Uncle Robert Site` environment, registering cloud-to-local resource bindings in `.postman/resources.yaml`.
- **Standalone AgentLab UI Prototype (`output/agentlab-ui/`)**: Staged a standalone Vite + React UI prototype containing component builds and configuration for the refreshed AgentLab interface.
- **Mutual NDA (`output/Evaluation_NDA_Dheerendar.md`)**: Staged a tailored Mutual Non-Disclosure and Evaluation Agreement for the upcoming technical demonstration with Virtusa / Dheerendar Srivastav.
- **Daily Command Brief**: Generated the dated operating brief at `docs/operations/daily-command-center/2026-08-20-command-brief.md`.

### Changed

- **Change Control Verification Script**: Enhanced `scripts/verify-change-control.mjs` path resolution for `Journey_Kit.md` to cleanly handle both local repository and parent workspace layouts.

---

## [Unreleased] - 2026-08-19

### Added

- **Dheerendar Walkthrough Assets**: Generated a pre-filled double-click `.ics` Google Meet invite, a 15-minute presentation playbook (`Dheerendar_Walkthrough_Plan.md`), and a single-click script (`run_pulse_social.bat`) to launch the Pulse Social App frontend and backend seamlessly.
- **AgentLab UI Phase 1 & 2 Overhaul**: Initiated a "Startup Operational Excellence" (SOE) redesign workflow using a chained prompt sequence. Established "Modern Tech-Forward Minimalism" design tokens in `index.css`, updated `tailwind.config.ts`, and completely refactored `button.tsx`, `card.tsx`, and `input.tsx` to strictly use functional styling without hardcoded colors.

### Changed

- **n8n SDR Pipeline Logic Fixes**: Corrected 3 silent logical bugs in the HubSpot Google Sheets Sync workflow (ID: `EG0XMr8W70ioenUx`). Eliminated a duplicate Deal association node and bundled creation/association directly inside `HubSpot: Create Deal`. Corrected the `Deal Name` parameter which was previously leaving cards blank in HubSpot. Updated the Google Sheets write-back node to push `Done` successfully, breaking an infinite duplication loop.

---

## [Unreleased] - 2026-08-17

### Added

- **Local SDR Sheets Sync Agent (`scripts/hubspot-sheets-sync.mjs`)**: Created a lightweight, dependency-free Node.js script that reads Google Sheet lead records using local Application Default Credentials (ADC) and synchronizes them directly into the HubSpot Free Sales CRM Pipeline as Deals and Contacts. Bypasses Google Cloud OAuth2 "This app is blocked" web browser security constraints completely.
- **n8n Workflow Blueprint**: Designed a robust n8n CRM-lite sync canvas JSON (`MKT06-Content-Distribution-Blueprint.json` sibling) for local sheets-to-CRM pipelines.
- **Environment Variables**: Appended `HUBSPOT_ACCESS_TOKEN` configuration to `.env.local` to securely feed your Private App access keys to local scripts.

### Changed

- **Database Cleansing (HubSpot CRM)**: Merged the duplicate `notifications@reclaim.ai` record into Sheena Burns' main corporate profile, corrected her primary email domain typo (`@gmiail.com` -> `@gmail.com`), and updated her corporate domain to `@unclerobertconsulting.com`.

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
