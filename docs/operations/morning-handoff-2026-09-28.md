# Morning Handoff — Monday 2026-09-28

Robert had an incident at home on the evening of 2026-09-27. Nothing here is
urgent except the single action in Priority 1, and even that is five minutes.
Everything else keeps until he says go.

Paste-ready prompt for the next agent session:

---

**Context:** You are continuing work on the AgentLab OS (URC agentic operating
system). Yesterday (2026-09-27) was a deep diagnostic day on the LLM credential
chain and produced three change-control entries (CC-2026-09-25-014, -015,
-016). Full suite is at **475/475 passing, typecheck clean, change-control
green**. Start by reading `docs/operations/change-control-register.md` entries
dated 2026-09-27, then this file.

**State of the workspace:**
- Changes from 2026-09-26/27 are **uncommitted** (action-drafter fence fix,
  run-evidence hardening, Anthropic fallback leg, ADC user-principal auth
  path, four kept diagnostic/trigger scripts, two handoff docs). First action:
  review `git status` / `git diff`, then commit in coherent units with
  Robert's OK.
- The local **dev server is DOWN**: an unrelated ~6MB node process squats
  port 3000 and 404s everything; the app is not listening on 3001–3005.
  Runs were executed via `scripts/execute-pending-runs.ts` (the real
  `processPendingRuns`) instead. Retire the squatter, then `pnpm dev`.
- The HubSpot dispatch fix (CC-2026-09-25-014) is **still awaiting live
  end-to-end validation** — blocked only on an LLM credential, never on the
  fix itself. Run `d68deaa9` (real CRM-Lite sheet data, 10 contacts) failed
  honestly at step 1 twice: 3× Gemini 401, then 1× Claude 402.

**Priority 1 — the five-minute Robert action (the only blocker):**

```
gcloud auth application-default login --client-id-file="secrets/gemini-adc-oauth-client.json" --scopes="https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/generative-language.retriever"
```

Then verify instantly: `node scripts/probe-adc-scope.mjs https://www.googleapis.com/auth/generative-language.retriever`
→ should print `SUCCESS` (verified 2026-09-28, HTTP 200). The no-arg default
now fails at mint with `invalid_scope` — expected: the ADC is consented only
for `.retriever` + `cloud-platform`. The app path needs no change: its ADC
mint sends no scope parameter, so tokens inherit the consented set. In PowerShell, the scopes value MUST stay quoted (`--scopes="a,b"`):
an unquoted comma makes PowerShell split it into an array, and the array gets
flattened with the comma replaced by a space, so gcloud receives one mangled
scope and rejects it with a misleading `scope is required but not requested`
error (reproduced and root-caused via the gcloud debug log, SDK 584.0.0,
2026-09-28). Second blocker: bare `generative-language` gets `Error 400:
invalid_scope` at Google's consent screen — the consentable Gemini ADC scope
is `.retriever` (per Google's official Gemini OAuth quickstart). Third
blocker: "This app is blocked" on Google's default SDK client, then
`org_internal` on our own client — the org project's OAuth audience was set to
Internal, which blocks consumer Gmail accounts. Fixed in console on
2026-09-28: audience flipped to External/Testing (one-way), test user
`agentlab.tech@gmail.com` added, and a dedicated Desktop OAuth client
"AgentLab ADC Gateway" created with its client JSON stored at
`secrets/gemini-adc-oauth-client.json` (gitignored) — the command above uses
`--client-id-file` with that client. In the browser: pick
`agentlab.tech@gmail.com`, accept the "Google hasn't verified this app"
warning (Advanced → Go to "My-gemini-app" → Allow). If the probe then 403s on
quota project, run `gcloud auth application-default set-quota-project
project-36330a6c-5e91-4901-9dd` and retry. Why: yesterday's probes proved this org's gateway treats the
Gemini API as **principal-only** — the new `AQ.` AI Studio keys are rejected
with `API_KEY_SERVICE_BLOCKED` regardless of header style, API version, or
project enablement (the Gemini API was enabled on every visible project
yesterday; did not help). The user principal **authenticates fine** (first
403 of the day, `ACCESS_TOKEN_SCOPE_INSUFFICIENT`) — the existing ADC was
consented without the Gemini scope, and the re-login above adds it. The
ADC path is already fully wired in `server/_core/google-ai.ts`
(CC-2026-09-25-016) — no code changes needed, no restart needed.

**Priority 2 — finish the HubSpot validation (agent action once P1 lands):**
1. `pnpm exec infisical run --env=dev -- node scripts/trigger-roundtable-validation.mjs`
2. `pnpm exec infisical run --env=dev -- node scripts/execute-pending-runs.ts`
3. Expect: steps 0–4 complete → step 5 (Update HubSpot CRM with Event
   Engagement, `hubspot_contact_upsert`) parks a dispatch as
   **`awaiting_approval`** with a valid draft. Verify via
   `action_dispatches` for the new run id, then record the closure in the
   register (CC-2026-09-25-014's verification note) and tell Robert to
   approve or reject it in the UI. Do NOT auto-approve — the dispatch goes
   to the live production HubSpot CRM.

**Known-fallback if the ADC route is refused by the gateway (unlikely):
fund Anthropic credits** (console.anthropic.com → Plans & Billing). The
runner's Anthropic leg is built and proven to reach the API
(CC-2026-09-25-015); the stored `ANTHROPIC_API_KEY` is auth-valid but the
account has **zero credits**. Either route unblocks validation alone.

**Also open (not blocking):**
- Watchdog gap: credential-health checks (CC-2026-09-25-002) detect
  *presence*, not *validity* — yesterday's dead key sailed through as "ok".
  Candidate fix: live-ping the provider (or shape-check `AIza`/`AQ.` — both
  are now legitimate formats) and announce in ops chat before runs fail.
- `modelUsed` from the Anthropic leg is captured in the runner result but
  not surfaced in run-console step telemetry.
- Two overlapping RoundTable DAGs exist (Sept 2 `2731feb1` and Sept 27
  `c93d4c1c`) — reconcile/archive one before both process a real event.
- Neon password rotation still recommended (CC-2026-09-24-007, git history).

**Guardrails:** honor the repo's honesty doctrine (three of yesterday's
corrections came from probing before believing — including two of *my own*
earlier claims; keep that standard). Multi-tenant credential isolation and
the strict action-draft contract are intentional. Record new work in the
change-control register; run `pnpm change-control:check` before calling
anything complete. Robert's pace sets the pace today.
