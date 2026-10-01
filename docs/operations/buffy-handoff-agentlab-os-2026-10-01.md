# Buffy Handoff: AgentLab OS — 2026-10-01 end of day

Date: 2026-10-01
Owner: Robert T. McCarthy / next agent session
Priority: Robert's three auth-gated feature checks, then the Upwork app registration; carry-over items below

Read first: `docs/operations/change-control-register.md` entries
CC-2026-10-01-001 through CC-2026-10-01-009 — today is fully recorded there.
This handoff is the fast path; the register is the audit truth.

## Production State (verified live after deploy)

- Service: `agentlab` (us-central1). Robert's URL:
  `https://agentlab-718497644379.us-central1.run.app`
- HEAD deployed: `113190ea` via the MANUAL path (Robert approved
  commit-then-deploy): build `f36c83cb` SUCCESS 5m18s → revision
  **agentlab-00207-bwt** Ready, all conditions True, **100% traffic**.
- Free verification endpoints (no auth), all green post-deploy:
  - `/api/health` → 200
  - `/api/debug/llm` → `success:true`, "ok via gemini-flash-latest"
  - `/api/dashboard/llm-ping` → alive:true, 1180ms
- **UNPUSHED**: `main` is 3 commits ahead of origin (`113190ea`, `088b6cf0`,
  `1d2bd886`). Production runs this code (deployed from the local tarball),
  but origin does NOT have it yet. Robert: review + push when ready. No
  secret values were committed (push protection should pass clean).

## What Shipped Today (2026-10-01)

1. **CC-001/003** — Dheerendar (Virtusa/HAMARASHOPS.ai) partner demo
   evidence-backed: run `07b23d1c…` "LinkedIn Lead Magnet Inbound to HubSpot
   Deal Creation", agent-authored (workflow born 333 ms before run), 3/3
   steps complete; proof log added to the sales one-pager.
2. **CC-002** — chat persistence root cause: persistence is client-driven;
   only the floating widget writes; the /ops-agent page never does. Wiring
   QUEUED (Fast Lane-eligible), not built.
3. **CC-004/005** — Upwork MCP verified (endpoint live, OAuth-gated;
   Settings row saved 18:24Z); catalog-vs-runtime finding: NO MCP client
   existed. Decision: build, generic + metadata-driven.
4. **CC-006** — MCP engine: `mcp-oauth.ts` (RFC 9728/8414 discovery, PKCE
   S256, exchange/refresh/revoke) + `mcp-client.ts` (streamable-HTTP
   JSON-RPC, session, tools list/call). Proven against Upwork LIVE metadata.
5. **CC-007** — MCP wired end to end: signed connect state, vault round-trip
   (`MCP_<NAME>_TOKEN`), `mcp_tool_call` connector behind the human gate,
   Settings Connect/Disconnect/List-Tools UI, honest testIntegration probe.
6. **CC-008/009** — Settings wiring audit + execution: stored orchestrator
   prompt + name now LEAD the Ops Agent chat (v2.4 fiction deleted);
   defaultModel leads the chain when valid; real budget governance in the
   queue processor (BUDGET_AUTOPAUSE, operator exempt); Profile/Billing/
   Notifications relabeled demo-only; Manage Auth → Sign Out; stdio presets
   marked non-executable.
- Suite at handoff: **549/549** (59 files); tsc at the documented 4-error
  cookie@2 baseline; change-control green.

## Robert's Next Steps (in order)

1. **Three auth-gated checks on the new revision:**
   a. Persona: set a distinctive orchestrator name+prompt in Settings → LLM,
      save, ask the Ops Agent its name in /ops-agent.
   b. Model: set default model to `gemini-pro-latest`, save, chat — reply
      badge should report that model.
   c. MCP: Upwork MCP row → Test Ping must HONESTLY fail ("no bearer token
      — complete the OAuth connect"), never a canned success.
2. **Upwork developer-app registration** (redirect URI `<origin>/settings`),
   save client id/secret on the row, Connect → approve on upwork.com →
   List Tools. Then Ops Agent can draft `mcp_tool_call` for real.
3. **Push the 3 unpushed commits** after review.
4. Carry-over P1s: HubSpot marketing-email scopes grant; Dispatch Decisions
   card UI test; /start intake conversational check; Notable Men sponsorship
   terms in writing; pr-posse decision; deploy.yml decision.

## Agent-Session Candidates (not started)

- Model-rot tripwire (the 09-30 class of silent death — still the top pick).
- Chat persistence wiring (CC-002) + same gap in CommandCenter's chat.
- Non-operator per-workspace MCP token storage (connect refused honestly
  today, per the 2026-09-24 multi-tenant guard).
- Root-cause: run `7c753684` step re-execution at 15:10:06.984Z + runs stuck
  `pending` with completed steps (demo run `07b23d1c` still shows pending).
- Budget UI on the LLM tab backed by the real workspaces columns.

## Environment Rules & Gotchas (hard-won, do not relearn)

- **OneDrive pnpm deadlock**: NEVER overlap pnpm installs; first full
  install of any app = Robert's real terminal.
- **`agentlab/` is GITIGNORED**: own node_modules + lockfile, never commit
  them, never add a pnpm-workspace.yaml there.
- **`code_search` tool is flaky in this build** (vendored ripgrep missing
  intermittently): use `git grep -n "pattern" -- targeted/paths`; broad
  greps on OneDrive time out.
- **Register conventions**: dated narrative entries at top (newest first),
  `## CC-YYYY-MM-DD-0NN` details at bottom in order, one row per entry in
  the Current Entries table, AMENDED pointers instead of deletions. Run
  `pnpm change-control:check` before calling doc work done.
- **Honesty doctrine**: fallbacks never fabricate; telemetry reports the
  model that ACTUALLY answered; demo transcripts must not be called
  "recorded" until chat persistence ships; spend governance uses a
  DECLARED estimate constant (exported), not a fake invoice.
- Never route anything to `fundableconsulting.online` (dead).
- Secrets via Infisical (`pnpm dev` is wrapped); never echo/commit values.
- DEPLOY IS MANUAL: `gcloud builds submit --config cloudbuild.yaml
  --substitutions COMMIT_SHA=<full-sha> .` (push does NOT deploy).

## Working Tree at Handoff

- `docs/operations/daily-command-center/2026-09-30-command-brief.md` —
  modified by ROBERT, deliberately left unstaged. Do not commit or revert
  it without asking.
- Everything else committed (4 commits ahead of origin incl. this handoff).
