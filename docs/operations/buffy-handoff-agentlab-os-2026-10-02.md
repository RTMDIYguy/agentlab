# Buffy Handoff: AgentLab OS — 2026-10-02 end of day

Date: 2026-10-02 (for the 2026-10-03 session)
Owner: Robert T. McCarthy / next agent session
Priority: review the 21 register entries pending Robert, then pick the next build from the candidate list below

Read first: `docs/operations/change-control-register.md` entries
CC-2026-10-02-001 through CC-2026-10-02-021 — today is fully recorded there.
This handoff is the fast path; the register is the audit truth.

## Production State (verified live after deploy)

- Service: `agentlab` (us-central1). Robert's URL:
  `https://agentlab-718497644379.us-central1.run.app`
- Legacy alias: `https://agentlab-ckkstfvrea-uc.a.run.app`
- HEAD deployed: `0c881f04` → revision **agentlab-00239-wd8** @ **100% traffic**
  (DEPLOY_EXIT 0). Latest build commit is `68bb035b`; `0c881f04` is its
  register-evidence commit.
- Free verification endpoints (no auth), all green post-deploy:
  - `/api/health` → 200 on BOTH service URLs
  - `GET /api/orchestrator/models` → exactly
    `[gemini-flash-latest, gemini-pro-latest, urc-fallback]`
  - `/api/dashboard/llm-ping` → alive
- Cloud Run logs: **zero severity>=ERROR** across today's deploy window.
- **Git is clean and fully synced.** Working tree empty, zero stashes, and
  all four local branches are 0 ahead / 0 behind their remotes:
  `main`, `agents/setup-agent-martin`, `autonoma-integration`,
  `archive/stash-20260830-marketplace`. Nothing to push.

## What Shipped Today (2026-10-02)

Twenty-one register entries, **nine deploys** (00209 → 00239). The
**approved honesty-audit order is now COMPLETE**: Dashboard → Command
Center → Agents → Auditing → Apps → Owner's Manual — six sweeps, each one's
audit entry followed by its dispositions executed.

**Commerce / platform work (CC-001 → 006):**

1. **CC-001** — Marketplace Phase 12: postgres-only + Stripe package
   webhooks.
2. **CC-002** — Daily Command Center queue-status awareness.
3. **CC-003** — Marketplace storefront checkout enforcement + billing
   lifecycle.
4. **CC-004** — Stripe webhook endpoint registration → **agentlab-00209-jzt**.
5. **CC-005** — `deploy.yml` push trigger disabled (push no longer deploys).
6. **CC-006** — `aiStudioSync` side effect silenced in tests.

**The honesty-audit order (CC-007 → 021):**

7. **CC-007/008** — Dashboard wiring sweep → dispositions executed
   (**agentlab-00215-zk6**).
8. **CC-009/010** — Command Center wiring sweep → dispositions executed
   (**agentlab-00218-6vq**).
9. **CC-011/012** — Agents wiring sweep (incl. a test-suite prod-write
   discovery) → dispositions executed + test-suite prod isolation
   (**agentlab-00220-68s**).
10. **CC-013/014/015** — Auditing hub sweep; Footer "I ♥ Buffy" partner badge
    (Freebuff referral link); Auditing dispositions executed with Option B
    on all 8 — approvals theater removed, stats made true (real 24h
    windows), the silent `insertAuditLog` string-vs-table loss closed,
    7 writers remapped (**agentlab-00225-d6r**).
11. **CC-016/017** — Apps (Ecosystem Marketplace) sweep: entitlement spine
    production-grade, but the beta/gamification layer was entirely fictional
    (`isGodmode` always true — `req.user` is never assigned server-side) →
    dispositions executed: real `beta_enrollments` + `beta_xp_events` tables
    with self-heal DDL, rewards that actually fire, mount claims made honest,
    all four `req.user` reads closed (**agentlab-00228-lw8**).
12. **CC-018/019** — Owner's Manual wiring sweep (12 findings, incl. the
    13-of-56 coverage framing) → dispositions executed: auditing/agents/
    marketplace/settings/command-center entries rewritten to today's truth,
    dead registry fields pruned, dual-identity cross-link + governance
    registration, 8 new consistency tests (**agentlab-00233-847**).
13. **CC-020** — Owner's Manual **coverage expansion**: five new module
    entries (`/dashboard`, `/ops-agent`, `/playbooks`, `/vault`,
    `/run-console`), registry **13 → 18**, header count now derives from
    `DOCS_REGISTRY.length` so the framing can't silently go stale
    (**agentlab-00236-tmg**).
14. **CC-021** — **Ops Agent model selector wired for real** — two dead
    wires: `req.body.model` was read and never used, and the stored
    `defaultModel` chain-lead documented by CC-2026-10-01-009 was never
    passed to `withGoogleModelChainLeading`. New
    `GET /api/orchestrator/models` (only what this deployment can run —
    **GPT-4o never**, no OpenAI provider exists), `dispatchModelRun`, honest
    deterministic mode, `executionMetrics.modelNote`. Registry claims flipped
    display-only → data-driven (**agentlab-00239-wd8**).

- Suite at handoff: **625/625 across 68 files**; tsc at the documented
  4-error cookie@2 baseline; `pnpm change-control:check` green;
  `pnpm build` exit 0.

## Workspace Cleanup (also today, after the deploys)

- **stash@{1} (Aug 30) SALVAGED**, then both stashes dropped (0 remain):
  - Canonical preservation: branch **`archive/stash-20260830-marketplace`**
    (commit `63a1709f`, tree `c9faf2c6` — verified identical to the stash),
    **pushed to origin**. It carries all THREE stash parents, including the
    untracked third parent that `stash show -p` would have missed
    (`2026-08-29`/`2026-08-30` command briefs + an `authRoutes.ts` copy).
  - Readable copies + restore instructions:
    `output/stash-archive/README.md` (patch, verbatim untracked files).
  - What's in it if Robert wants it later: a rebuilt `Marketplace.tsx`
    app-store page (~190 lines: card grid, tabs, search), a `PLAT-IONOS`
    platform registry entry, `Status.tsx` + governance reconciliation edits.
- **stash@{0} (Sep 22) dropped** — ~95% already in `main`; residue was
  lockfile churn plus 4 stray lines (the companion `package.json`/
  `pnpm-lock.yaml` backups went with it).
- Clutter cleared: `deploy.log`, `dev-server.log`, three Sep 22 backup files
  (`package.json.before-wouter-pin-*`, both `pnpm-lock.yaml.*`), a 0-byte
  `_tmp_*` file, empty `tmp/`.
- Deliberately KEPT: `output/` (business briefs, gumroad, notebook,
  stash-archive), `secrets/`, `.env*`, local `pgsql/` install.

## Robert's Next Steps (in order)

1. **Twenty-one register entries await Robert review** (CC-001 → CC-021).
   Two classes: audit-only entries whose dispositions were then executed,
   and build entries marked `pending Robert review`. No push needed —
   everything is already on origin.
2. **Choose the next build.** Top candidates, in my order:
   a. **REST `/api` auth posture pass** — explicitly deferred in CC-017.
      The REST router has no auth middleware and the tenant legacy fallback
      assigns anonymous callers role `"admin"`. This is the biggest known
      open security finding.
   b. **Ops Agent chat persistence** (queue `CC-2026-10-01-002`,
      Fast-Lane-eligible, `Proposed`) — partner demos leave zero transcript
      evidence; Robert already decided to persist before the next demo.
      Client-only, no server change.
   c. **Model-rot tripwire** — the recurring silent-death class; still the
      top agent-session pick from the 09-30 handoff.
   d. **Upwork developer-app registration** (Robert's step, blocks live MCP
      tool calls): redirect URI `<origin>/settings`, save creds on the
      Settings row, Connect → List Tools.
3. **Open scheduled-change-queue rows**: ~20 Proposed/Active, incl.
   `CC-2026-09-30-008` pr-posse dependency decision, `CC-2026-08-20-002`
   nurture send loop, `CC-2026-05-24-004` blog publish columns.
4. **Agent Lab LinkedIn Content-Queue check** (AGENTS.md opening routine) —
   confirm ≥5 ready/reviewable active drafts, else refill or flag.

## Agent-Session Candidates (not started)

- **REST auth-posture audit** (see above — the flagged cross-cutting finding).
- **Marketplace rebuild decision**: review
  `archive/stash-20260830-marketplace` and decide if it still ships against
  current main (the live `Marketplace.tsx` has moved on since Aug 30).
- **Owner's Manual coverage, round 2**: 18 of 56 routes documented; the next
  tier would be the remaining operational surfaces.
- Root-cause: run `7c753684` step re-execution + runs stuck `pending` with
  completed steps (demo run `07b23d1c` still shows pending); the CC-015
  `q=step` positive-capture still awaits the first real step execution.
- Budget UI on the LLM tab backed by real workspaces columns.
- Non-operator per-workspace MCP token storage.

## Environment Rules & Gotchas (hard-won, do not relearn)

- **tsc baseline is 4 errors** in `server/_core/authRoutes.ts` /
  `server/_core/sdk.ts` (cookie@2) — NOT a regression. Filter with:
  `pnpm exec tsc --noEmit 2>&1 | grep -v "authRoutes.ts\|_core/sdk.ts"`
- **Line endings matter.** CRLF: `client/src/data/docsRegistry.ts`,
  `server/routes/api.ts`, `server/controllers/orchestrator.ts`,
  `docs/operations/change-control-register.md` and the other register/queue
  docs. LF: `DocVisualBlueprint.tsx`, `Documentation.tsx`,
  `OpsCleanupAgent.tsx`, the registry/controller test files, and this
  `buffy-handoff-*` series. Edit CRLF files
  with `\r\n` in oldString/newString.
- **Multi-line insert hazard**: writing bare `\r` separators when splicing LF
  content creates lone-CR pollution (cost 60+ repair replaces in
  OpsCleanupAgent.tsx during CC-021). After edits, re-scan for join
  artifacts: `grep -E "\S{80,}"` on added lines, and check
  `d.count(b'\r')` on the file.
- **Preview compositor is flaky** — screenshots often capture top-of-page or
  stale tiles regardless of scroll. DOM / accessibility-tree probes are the
  reliable evidence; screenshots are supplementary.
- **`code_search` tool is flaky in this build**: prefer
  `git grep -n "pattern" -- targeted/paths`; broad greps on OneDrive time out.
- **OneDrive pnpm deadlock**: NEVER overlap pnpm installs; first full install
  of any app must run from Robert's real terminal (agent tool shells kill
  detached children and cap at 10 minutes).
- **`agentlab/` is GITIGNORED**: own node_modules + lockfile; never commit
  them or add a pnpm-workspace.yaml there.
- **Register conventions**: one row per entry in the Current Entries table
  (anchor new rows after `... | Buffy (build) / pending Robert review | Active |`),
  narrative sections appended at file end after the last `## CC-...` section,
  AMENDED pointers instead of deletions. Validate each new entry with
  `grep -c "CC-2026-10-02-0NN"` = 2. File is 100% CRLF.
- **Run `pnpm change-control:check`** before calling workflow-package or doc
  changes complete (a pre-existing MEDIUM "project folder" drift is known
  and tolerated).
- **Honesty doctrine**: fallbacks never fabricate; telemetry reports the model
  that ACTUALLY answered; never label demo transcripts "recorded"; the
  deterministic path must refuse conversational turns with "no model was
  consulted"; `gpt-4o` must never appear in the model catalog (no OpenAI
  provider exists); CC-2026-09-30-012's silent-fallback ban is guarded by
  tests that must stay 6/6.
- Never route anything to `fundableconsulting.online` (dead).
- Secrets via Infisical (`pnpm dev` is wrapped); never echo, commit, or paste
  values; prod secrets are Cloud Run env vars (no `ANTHROPIC_API_KEY`,
  no OpenAI keys today).
- **DEPLOY IS STANDING-AUTHORIZED** but manual — push does NOT deploy:
  ```
  rm -f /tmp/agentlab-deploy-NNN.log
  nohup bash -c 'gcloud run deploy agentlab --source . --region us-central1 \
    --project project-36330a6c-5e91-4901-9dd; echo "DEPLOY_EXIT=$?"' \
    > /tmp/agentlab-deploy-NNN.log 2>&1 & echo started
  ```
  then poll for `DEPLOY_EXIT` (~6–9 min). **Never chain git+deploy with
  `&& ... &`.** Log check requires SINGLE quotes:
  ```
  gcloud logging read 'resource.type=cloud_run_revision AND resource.labels.service_name=agentlab AND timestamp>="..." AND severity>=ERROR' --project project-36330a6c-5e91-4901-9dd --limit 5 --format='value(timestamp,textPayload)'
  ```

## Open Threads / Known-Issue Notes

- Second worktree **`AgentLab-ANA-7`** (detached at `47328854`) HUNG on
  access this session — likely OneDrive sync locking it. Left untouched;
  investigate or prune before relying on `git worktree list`.
- `output/stash-archive/` is gitignored local-only; the durable copy is the
  pushed archive branch.
- Pre-existing MEDIUM change-control drift: "project folder" (tolerated).

## Working Tree at Handoff

- Clean. Zero modified, zero untracked, zero stashes.
- Nothing ahead of origin on any branch.
- This handoff file is the only new file; commit it with the usual
  `docs(register)/docs(handoff)` message when convenient.
