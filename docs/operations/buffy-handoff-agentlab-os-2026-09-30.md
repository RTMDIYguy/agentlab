# Buffy Handoff: AgentLab OS — 2026-09-30 night

Date: 2026-09-30 (session ran into 2026-10-01 UTC)
Owner: Robert T. McCarthy / next agent session
Priority: verification of tonight's deploys, then the pending-decision list below

Read first: `docs/operations/change-control-register.md` entries
CC-2026-09-30-001 through CC-2026-09-30-012 — tonight is fully recorded there.
This handoff is the fast path; the register is the audit truth.

## Production State (verified live before handoff)

- Service: `agentlab` (us-central1). Robert's URL:
  `https://agentlab-718497644379.us-central1.run.app` (same service as
  `agentlab-ckkstfvrea-uc.a.run.app`).
- HEAD deployed: `ca7b9ede` (build SUCCESS 5m18s) — model-chain hardening.
  Prior deploys tonight: `0125f2c6` (chain fix, build 88c52ba4) and docs.
- Free verification endpoints (no auth):
  - `/api/health` → 200
  - `/api/debug/llm` → makes a REAL chain call; expect `success:true` and
    `"ok via gemini-flash-latest"` in `error_message`
  - `/api/dashboard/llm-ping` → `{"alive":true,"model":"gemini-flash-latest",...}`
- Local chain probe: `npx tsx scripts/probe-gemini-chain.ts` (kept tool, CC-012).
- DEPLOY IS MANUAL: push does NOT deploy (`deploy.yml` broken since 09-16,
  missing `GCP_SA_KEY` secret — Robert decision pending: add secret or delete
  deploy.yml and make the manual path canonical). Manual path:
  `powershell -NoProfile -Command "gcloud builds submit --config cloudbuild.yaml --substitutions COMMIT_SHA=<full-sha> ."`

## What Shipped Tonight (2026-09-30)

1. **CC-011** — `agentlab/` standalone app made self-contained: Robert ran
   `pnpm install --ignore-workspace --prefer-offline` from a REAL terminal
   (879 pkgs, warm store). firebase 12.19.0 resolves locally; app audit clean.
2. **CC-012** — ROOT CAUSE of "Ops Agent answers everything with a canned DAG":
   Google RETIRED pinned `gemini-2.5-flash` (404 "no longer available to new
   users"). Fix: shared `GOOGLE_MODEL_CHAIN` (gemini-flash-latest →
   gemini-3.8-flash → gemini-pro-latest) + `withGoogleModelChain` in
   `server/_core/google-ai.ts`; both orchestrator chat paths ride the chain;
   fallback is mode-aware and HONEST (no proposal object, no fabricated
   analysis, `modelUsed = "urc-model-unavailable"`). Founder-intake chat chain
   was 100% dead ids — healed. Suite 495/495 (8 new pins).
3. **CC-012 hardening** (`ca7b9ede`) — Robert's confirmation screenshot showed
   the model confabulating "AgentLab DAG Orchestration Engine v2.4" and raw
   `**markdown**` in the card. Conversational prompt now bans invented
   versions and markdown; source-pin test enforces.
4. **Environment repair** — root `node_modules` was missing the
   `@trpc/react-query` junction (plain `pnpm install` says "Already up to
   date" WITHOUT healing). Restored; ~11 phantom client tsc errors vanished.
   Typecheck baseline is the documented **4 errors** (cookie@2 parseCookie in
   `server/_core/authRoutes.ts` + `sdk.ts`).

Also earlier same day: Notable Men press capture + 90% sponsorship record
(CC-001..005), Services brand-family section (CC-003), dashboard LLM
telemetry fix (CC-006), Dispatch Decisions cross-workspace fix (CC-007),
audit-to-zero + firebase restore w/ grpc override (CC-008/009), standalone
install attempt + queue (CC-010).

## Pending Items

**Robert actions:**
- Hard-refresh `/ops-agent` once more on the newest revision: answers should
  be plain text (no raw `**`), no invented version numbers.
- Test the **Dispatch Decisions card** end-to-end in the UI (CC-007 shipped,
  never UI-tested): approve an awaiting dispatch, confirm the run resumes.
- Visit `/start` and confirm the public intake chat now answers conversationally
  (its LLM chain was silently dead for new accounts until tonight).
- HubSpot **marketing-email scopes grant** — still the P1 blocker.
- Notable Men: get the 90% sponsorship terms **in writing** (amount, schedule,
  coverage) for the finance tracker; LinkedIn post URL still unrecorded.
- pr-posse decision queued (scheduled-change-queue CC-2026-09-30-008): bump
  agentic-flow to 1.10.2 (breaking major) or formally accept 2 findings.
- deploy.yml decision: restore GCP_SA_KEY or delete the file.

**Agent-session candidates (not started):**
- Tripwire for silent model rot: daily smoke question through the chat path;
  alert when the chain exhausts or `urc-model-unavailable` appears (the 404
  sat silent for DAYS because DAG runs worked and the fallback lied).
- Sweep for other fabrication patterns like tonight's "Engine v2.4".
- CC-012 follow-ups (recorded, not forced): `workspaces.defaultModel` is
  stored via Settings but consumed by NO call site (wire it or remove the
  dropdown); `server/schema.ts` DB column defaults still say `gemini-1.5-pro`
  (dormant — changing needs coordinated self-heal DDL); docs/marketing copy
  still says "Gemini 2.5 Flash" (descriptive only); `server/_core/llm.ts`
  Forge leg (unconfigured in this deployment) now uses the alias label.

## Environment Rules & Gotchas (hard-won, do not relearn)

- **OneDrive pnpm deadlock**: NEVER overlap pnpm installs; installs >~10 min
  get killed by the agent tool shell ceiling AND detached children die
  between calls. First full install of any app = Robert's real terminal.
- **`agentlab/` is GITIGNORED**: its `node_modules` + `pnpm-lock.yaml` are
  never committed; do NOT add a `pnpm-workspace.yaml` to it (a `packages:`
  field corrupted its tree once — CC-010). Standalone apps resolve upward
  into root when they have no own install — that upward coupling was the
  phantom-dependency incident (CC-008/009).
- **`code_search` tool is broken in this build** (vendored ripgrep missing):
  use `git grep -n "pattern" -- path` with targeted paths; broad greps time
  out on OneDrive.
- **Register conventions**: dated narrative entries at top (newest first),
  `## CC-YYYY-MM-DD-0NN` detail entries at bottom in strict numeric order,
  one row per entry in the Current Entries table, AMENDED pointers on
  superseded entries (never delete history). Run `pnpm change-control:check`
  before calling doc changes done (currently green; 1 known pre-existing
  Medium 'project folder' terminology finding).
- **Honesty doctrine**: fallbacks must never fabricate (no fake DAGs, no
  invented versions/numbers); telemetry reports the model that ACTUALLY
  answered (`modelUsed`); deterministic-path audit labels say
  `not-llm-dispatch`. Fiction linter runs in CI.
- Never route anything to `fundableconsulting.online` (dead, parked at
  GoDaddy auction — placement rule CC-002).
- Secrets come from Infisical (`pnpm dev` is wrapped); never echo/commit
  secret values.

## Working Tree at Handoff

- `docs/operations/daily-command-center/2026-09-30-command-brief.md` —
  modified by ROBERT, deliberately left unstaged. Do not commit or revert it
  without asking.
- Everything else committed & pushed through `ca7b9ede`.
