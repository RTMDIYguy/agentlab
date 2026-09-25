# Morning Handoff — Thursday 2026-09-25

Paste-ready prompt for the next agent session:

---

**Context:** You are continuing work on the AgentLab OS (URC agentic operating system). Yesterday (2026-09-24) delivered four change-control entries (CC-2026-09-24-003 through -006). Full suite is at **416/416 passing, typecheck clean, change-control green**. Start by reading `docs/operations/change-control-register.md` entries dated 2026-09-24, then this file.

**State of the workspace:**
- ~32 files are modified/new and **uncommitted** (tenant isolation, orchestrator conversation mode, visitor memory, artifact vault, workflow archive/delete, ops-agent watchdog, service-account Gemini auth, Neon keepalive). First action: review `git status`/`git diff`, then commit in coherent units with Robert's OK.
- Workspace litter was cleaned 2026-09-24 evening: 24 `_tmp_*` artifacts and four tracked scratch files deleted. `test-db.mjs` (which contained a hardcoded Neon password) is gone from the working tree — **the password still exists in git history; recommend Robert rotate it in the Neon console**.

**Waiting on Robert (action items from yesterday):**
1. **Gemini key file**: service-account JSON must be saved as `secrets/gemini-service-account.json` (already git-ignored). The SA is `ais-gemini-key-c716673060c044c@718497644379.iam.gserviceaccount.com` with `roles/mcp.toolUser` — which does **not** grant model invocation. The moment the file lands, run `npx tsx scripts/verify-gemini-service-account.mjs`; on 403 either enable the Generative Language API on project-36330a6c-5e91-4901-9dd, or grant `roles/aiplatform.user` and set `GOOGLE_AI_BASE_URL` to the Vertex prefix (documented in `.env.example`).
2. **Neon keepalive decision**: opt in via `NEON_KEEPALIVE_MINUTES=5` in `.env.local` (cost math in `server/db.ts`) to stop the free-plan auto-suspend cold starts.
3. **Neon password rotation** (see history note above).
4. Legacy note: a valid `ANTHROPIC_API_KEY` exists in `.env.local` and both `@ai-sdk/google` and `@ai-sdk/anthropic` are installed — Anthropic remains a plan-B provider but is not wired into the runner.

**The four suggested next moves (in priority order):**
1. **Run live Gemini verification** — BLOCKED ON ROBERT, with a corrected route (2026-09-25 midday, CC-2026-09-25-004): the service-account JSON key is **unobtainable** — org-level policy `iam.disableServiceAccountKeyCreation` (Secure by Default) blocks key creation, and the project-level override Robert disabled was only the sibling API-key-binding policy. Primary path is now a **consumer Gemini API key** from aistudio.google.com/apikey → give it to the agent → stored as `GOOGLE_GENERATIVE_AI_API_KEY` in git-ignored `.env.local` → then run `npx tsx scripts/verify-gemini-service-account.mjs`. The service-account route remains available only after disabling the ORG-level policy (resource picker → organization → Organization Policies → `iam.disableServiceAccountKeyCreation` → enforcement Off), followed by API enablement + role grant.
2. **Migrate intake agent to Gemini** — wire the founder-intake agent off OpenAI onto the org-compliant service-account path so visitor conversations are policy-compliant too.
3. **Enable + verify Neon keepalive** — set it to 5 minutes, restart the dev server, and confirm the endpoint no longer shows INACTIVE bands during a two-hour idle window.
4. **Watchdog for credential health** — make the ops-agent watchdog detect an unhealthy LLM credential (missing key file, failed token mint, failed ping) and proactively report it in chat with the exact fix, so auth rot is caught before runs fail.

**Guardrails:** honor the repo's honesty doctrine (the test suite rejected two overreach attempts on 2026-09-24 — read the test failures before "fixing" them), keep multi-tenant credential isolation intact, record new work in the change-control register, and run `pnpm change-control:check` before calling anything complete.
