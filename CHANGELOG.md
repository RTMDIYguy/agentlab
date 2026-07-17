# Changelog

All notable changes to the agent-lab-site repo are documented here.

---

## [Unreleased]

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
