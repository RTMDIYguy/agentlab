# Morning Handoff — Tuesday 2026-09-29

Yesterday was the big one: the three-day-blocked HubSpot dispatch validation
(CC-2026-09-25-014) was **verified live end to end** — real CRM-Lite sheet
data → run `bf87810f` → drafted dispatch → Robert approved → production
HubSpot write → API read-back confirmed. Sandra Hill (contact
`560622406361`, portal **243478405**) is in the CRM with the full approved
payload. Suite is **480/480**, typecheck clean, change-control green. Also
shipped: ADC user-principal auth (three blockers root-caused), a refreshed
Gemini model chain, honest model telemetry, the blueprint draft→HubSpot
mapper, HubSpot property provisioning (Robert via Breeze), and the
`hubspot_marketing_email` connector + Command Center **Dispatch Decisions**
card (all local, uncommitted — see Commit Plan).

Paste-ready prompt for the next agent session:

---

**Context:** You are continuing the AgentLab OS (URC agentic operating
system). Read `docs/operations/change-control-register.md` entries dated
2026-09-28 first, then this file. Honor the honesty doctrine: probe before
believing — three of yesterday's corrections came from re-probing claims
(two of them the prior agent's own).

**Priority 1 — finish the HubSpot project upload (scopes):** The
`agentlabhs` project (build home: **newdevtest 52008786**) needs one more
upload so the three new scopes (`marketing.email.read`,
`marketing.email.write`, `content`) reach production (243). State: scope
edit already applied in `agentlabhs/src/app/app-hsmeta.json`; the three
component lockfiles were regenerated; first upload FAILED (build #1: all
three components "package-lock.json out of sync" — fixed by regen); the
retry upload **wedged at "Compressing build files"** (zip stuck at 4KB —
suspect the components' `node_modules` trees not being excluded; the
`.hsignore`/`.hubspotignore` at `agentlabhs/` only cover the project root,
NOT `src/app/*/{node_modules}` — add nested ignore rules or delete the
component `node_modules` before upload). Exact working command shape (run
from `agentlabhs/`, use the npx-cached CLI directly; npx itself hangs on
this machine — do NOT use `npx`):

```
cd agentlabhs
node "C:/Users/RobertM/AppData/Local/npm-cache/_npx/7cf6f68c96bf9721/node_modules/@hubspot/cli/bin/hs.js" project upload --account 52008786 --force --skip-npm-audit -m scopes-for-email-connector
```

Verify with `project list-builds --account 52008786` (expect SUCCESS), then
re-probe: `node scripts/probe-hubspot-email-api.mjs "<NA2_PAT>"` (the NA2
private-app token Robert stored in the OS Settings vault; also in Infisical
if mirrored there — do NOT commit token values; GitHub push protection
blocked this once already) → expect HTTP 200 (was 403 MISSING_SCOPES).
Breeze will verify the Auth screen shows the scopes.

**PORTAL GUARDRAIL (near-miss yesterday, do not repeat):** 243478405 =
Marketing Hub Enterprise = PRODUCTION (all OS data lives here; both PATs
bind to it). 52008786 newdevtest = project/app BUILD home (uploads only).
50504462 = FREE portal and the CLI's default account — never target it.
247477499 = sandbox. CLI auth uses personal access keys, NOT `pat-…`
tokens (PAT → 400; proven). Project uploads go to 52008786; data/API
operations go to 243.

**Priority 2 — the email sequence (after scopes land):** Run `bf87810f` is
`paused_for_approval` at step 6 with thin duplicate dispatch `ed7f0890`
(`hubspot_contact_upsert`, would overwrite Sandra's rich record — do NOT
approve it). Sequence: (1) reject `ed7f0890` with recorded reason
("no email connector existed at draft time; superseded by
hubspot_marketing_email; re-draft required") — use
`scripts/dispatch-approved-action.ts` pattern or extend it with a reject
mode; (2) reset run to pending, execute via
`pnpm exec infisical run --env=dev -- pnpm exec tsx scripts/execute-pending-runs.ts`
— step 6 re-drafts through `hubspot_marketing_email` (CHANNEL RULE now in
the drafter); (3) Robert approves the new dispatch (Dispatch Decisions card
is built but only live after the Cloud Run deploy); (4) the HubSpot email
draft materializes; Robert attaches recipients and sends from Marketing
Hub. Note: if the portal's own 243→52008786 app promotion doesn't refresh
automatically after upload, check the installed-app version on the 243
private-app page (53416564).

**Priority 3 — commit & deploy (Robert says go):** see Commit Plan below;
then Cloud Build trigger deploys commit `8a943dd6`→new; verify
agentlab-718497644379.us-central1.run.app shows the Dispatch Decisions
card. The remote instance ran pre-09-27 code all yesterday — stale-code
incidents are registered; deploy closes that class of bug.

## How Ops Agent works — DISCUSSION ITEM (Robert to lead)

Robert shared two screenshots (2026-09-28 ~22:56) of the **newdevtest**
(52008786) contact record for Bryan Clark (bryan@neon.tech, Neon) showing
the installed AgentLab card in production shape:

- **AgentLab OS Intelligence** panel: ICP Growth Match 94% "Tier A Founder /
  High Propensity", Signal Confidence Index bar, Active Radar badge.
- **Real-Time Ecosystem Signals** (Market Marksman Radar): SEC Form D Growth
  Filing ($1.2M Expansion); US DOT Commercial Transport Registry Verified.
- **Recommended Offer**: "48-Hour Authority Workshop → Sovereign OS
  Migration".
- **AI Voice & Email Cadence**: "Pamela AI Voice Greeting Ready | AgentMail
  Outbound".
- **1-Click OS Workflows**: "Run Gemini AI Diagnostic" button + More menu;
  "Open AgentLab OS →" link; "Powered by agentlabs-App"; Companies (0) with
  Add.

This is the "How Ops Agent works" conversation Robert wants to have
tomorrow — the screenshots show what the card is *supposed* to produce on a
contact. It is a snippet of conversation Robert will provide details for;
do NOT redesign the card before that discussion. Questions to bring:
where do ICP match %, radar signals, and recommended offer actually come
from (which tables/agents); how the card talks to the OS (the "Open
AgentLab OS" deep link); whether the 243 production portal shows the same
card; what "Pamela/AgentMail Outbound" maps to now that Instantly is gone
and HubSpot owns sending.

**Also open (non-blocking):**
- Step-5 action-step row on run `bf87810f` shows a stale `failed` row from
  the remote instance's bad re-draft (cosmetic; the real row is completed).
- Run row error_message is stale from pre-fix attempts (cosmetic).
- HubSpot property groups landed in "Custom information" instead of
  agentlab_os/agentlab_signup groups (cosmetic; Breeze noted manual
  cleanup).
- Engine observation: on resume, the processor completes guardrail steps it
  passes, so ONE approval cleared TWO guardrails. If each should gate
  individually, needs a design entry.
- Ops watchdog still checks credential *presence* not *validity*
  (CC-2026-09-25-002); yesterday's dead-model-chain incident strengthens
  the case for live pings.
- Anthropic credits still zero (fallback leg intact but unusable).
- Neon password rotation still recommended (CC-2026-09-24-007).
- The dev env injects `PORT=0` (server binds a random port); pin `PORT=3000`
  when starting `pnpm dev` manually.

**Commit Plan (coherent units, Robert approves messages):**
1. `feat(auth)`: ADC user-principal chain — google-ai.ts/.test.ts, four
   diagnostic scripts, morning handoff 09-28 (CC-2026-09-28 register
   entries).
2. `feat(execution)`: model chain refresh + honest telemetry —
   agent-runner.ts, queue-processor.ts, anthropic-fallback.test.ts,
   action-drafter.ts/.test.ts (fence handling), execute-pending-runs.ts,
   reset-run.mjs, probe-run-context.mjs.
3. `feat(hubspot)`: blueprint mapper + connector + provisioning —
   schema-map.ts, connectors.ts/.test.ts, sync.test.ts,
   ensure-hubspot-properties.ts, dispatch-approved-action.ts,
   reset-dispatch.mjs, probe-hubspot-*.mjs, agentlabhs/src/app/app-hsmeta.json
   (scopes), trigger-roundtable-validation.mjs, diagnose-gemini-env.mjs.
4. `feat(ui)`: Dispatch Decisions card — CommandCenter.tsx,
   actions/router.ts (recent-query fix), OpsAgentChat.tsx (from 09-26/27
   session).
5. `docs`: change-control-register.md, handoffs, daily command briefs,
   run-evidence.test.ts, google-ai.test.ts (already in unit 1 if cleaner).

**Guardrails:** honor the honesty doctrine; every HubSpot CLI command pins
its account (see portal map); record new work in the register; run
`pnpm change-control:check` before calling anything complete. Robert's pace
sets the pace.
