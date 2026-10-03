# REST Auth-Posture Audit — 2026-10-03

Date: 2026-10-03
Owner: Robert T. McCarthy / Buffy (audit)
Companion register entry: **CC-2026-10-03-001** (audit only — no code changed in this pass)
Trigger: deferred by CC-2026-10-02-017 disposition 8 ("REST `/api` auth posture explicitly deferred to a dedicated pass"); ranked build candidate #1 in the 2026-10-02 handoff.
Scope: every route reachable under `/api` on the deployed service `agentlab`.
Method: static sweep of the mount chain (`server/_core/index.ts` → `tenantMiddleware` → `apiRouter`), per-controller gate inventory across `server/controllers/`, client call-site inventory, and **live anonymous probes against production — GET only. No mutating request was sent.**

---

## Verdict

The REST surface is **unauthenticated end to end, and tenant isolation is caller-controlled**.

This is not one missing check. One defect in the middleware makes the entire authorization layer below it decorative:

> `tenantMiddleware` never verifies any credential, and its legacy fallback **guarantees** `req.workspaceId` is truthy for every anonymous request. Every controller in the app gates on `if (!req.workspaceId) return 401`. That guard therefore can never fire.

13 of 27 controllers contain that guard. It is dead code. The other 14 contain no guard at all, and 6 of those hard-code the default workspace as a fallback, so they would proceed even if the guard were removed from the middleware.

Live probes confirm it: **every endpoint tested returned 200 to a curl with no credentials**, including `GET /api/audit-logs` (45 KB of real audit rows), `GET /api/artifacts` (395 KB), `GET /api/workflows` (132 KB) and `GET /api/runs` (85 KB).

Separately: `x-workspace-id` is a **caller-supplied header that selects the tenant**. Sending the god-workspace id returned a different run set than the default workspace — cross-tenant read is a header away, not a bypass.

---

## Evidence (live, production, anonymous)

Base: `https://agentlab-718497644379.us-central1.run.app` — no `Authorization`, no cookies, no custom headers.

| Probe | Result | Note |
| --- | --- | --- |
| `GET /api/health` | 200 (143 B) | public by design |
| `GET /api/orchestrator/models` | 200 (326 B) | public by design (deploy check) |
| `GET /api/runs` | **200 (85,279 B)** | real run records, default workspace `…0001` |
| `GET /api/agents` | **200 (1,585 B)** | |
| `GET /api/workflows` | **200 (132,426 B)** | |
| `GET /api/audit-logs` | **200 (45,122 B)** | agent, action, model, tokens, latency, policyChecks |
| `GET /api/artifacts` | **200 (395,497 B)** | |
| `GET /api/snapshots` | **200 (3,979 B)** | includes `snap_kc_hq_primary`, `snap_franchise_starter` |
| `GET /api/dashboard/telemetry` | 200 (191 B) | |
| `GET /api/ops-watchdog/credential-health` | **200 (592 B)** | credential state + remediation detail |
| `GET /api/share/tokens` | 200 | operator share-token lifecycle |
| `GET /api/marketplace/items` | 200 (13,109 B) | |
| `GET /api/trials/status` | 200 (924 B) | |

**Tenant-selection probe:**

```bash
curl -H 'x-workspace-id: 00000000-0000-0000-0000-000000000000' \
     -H 'x-user-role: admin' -H 'x-user-email: probe@example.com' \
     "$U/api/runs"
# -> 200, 21,882 B, run ids DIFFERENT from the default-workspace response
curl -H 'x-workspace-id: 11111111-1111-1111-1111-111111111111' "$U/api/runs"
# -> 200 (empty workspace answers 200, not 401)
```

Precedent: CC-2026-10-02-015 already recorded the weaker version of this ("an anonymous `GET /api/runs` answers 200 for the default workspace instead of 401"). This pass establishes that it generalises to **the whole router** and that the header selects the tenant.

---

## Root cause

`server/middleware/tenant.ts`

```ts
// line 39 — decodeJwt() DECODES ONLY. jose's decodeJwt never checks the
// signature. No key, no issuer, no audience, no expiry.
const decoded = decodeJwt(token);
...
// lines 89-95 — no Bearer at all:
} else {
  // Legacy fallback
  const workspaceHeader = req.headers["x-workspace-id"] as string;
  req.workspaceId  = workspaceHeader || "00000000-0000-0000-0000-000000000001";
  req.userEmail    = (req.headers["x-user-email"] as string)   || "operator@agentlab.local";
  req.userRole     = (req.headers["x-user-role"] as string)    || "admin";
}
...
// lines 98-101 — fail open:
} catch (error) {
  console.error("[Tenant Middleware] Error:", error);
  next();
}
```

Three independent ways in, all unauthenticated:

1. **Forged Bearer** — any JWT carrying `email: <one of GOD_MODE_EMAILS>` decodes to god workspace `0000…0000` + `role: admin` (lines 51-53). An unknown email instead **auto-provisions a workspace and a user row** (lines 65-82): unauthenticated writes to `workspaces` and `users`.
2. **No Bearer** — role defaults to `admin`, and role/email/workspace are all **caller-controlled headers**.
3. **Any error** — `next()` without setting identity; the request proceeds.

---

## Findings

| ID | Sev | Finding |
| --- | --- | --- |
| F-01 | **Critical** | Legacy fallback grants `role: "admin"` to every unauthenticated caller; `x-user-role`, `x-user-email`, `x-workspace-id` are trusted verbatim (`tenant.ts:91-94`). |
| F-02 | **Critical** | Bearer path never verifies the signature — `decodeJwt` at `tenant.ts:39`. Forged email → god workspace + admin; unknown email → unauthenticated `INSERT` into `workspaces`/`users`. |
| F-03 | **Critical** | Tenant isolation is a request header. Live-proven: `x-workspace-id: 0000…0000` returned a different run set than the default workspace. |
| F-04 | High | The `if (!req.workspaceId) → 401` guard appears in 13 controllers (`agents`, `artifacts`, `create-artifact`, `dashboard-telemetry`, `export`, `image-generation`, `ops-chat`, `ops-watchdog`, `orchestrator-execute`, `runs`, `share`, `teardown-video`, `workflows`) and is **unreachable dead code**, because the fallback always assigns a workspace. |
| F-05 | High | 14 controllers have **no** 401 at all: `aiStudioSync`, `assessment-questions`, `audit`, `campaigns`, `discounts`, `fulfillment`, `icp`, `instantly`, `marketplace`, `orchestrator`, `playbooks`, `snapshots`, `voice`, (`params` is a helper). Six hard-code `‖ "00000000-0000-0000-0000-000000000001"` so they proceed regardless of middleware state. |
| F-06 | High | `POST /api/sync/action` (`aiStudioSync.ts:341`, `executeRemoteAction`) has no gate and defaults the workspace itself. Actions: `trigger_workflow` (inserts a `workflow_runs` row and calls `processPendingRuns()`), `approve_run`, `reject_run`. **Unauthenticated workflow execution and approval.** |
| F-07 | Medium | Fail-open: `tenant.ts:98-101` calls `next()` on any middleware error instead of 401/500. |
| F-08 | Medium | Webhooks with **no signature or shared-secret verification**: `POST /api/webhooks/instantly`, `POST /api/voice/webhook`, `POST /api/aistudio/ingest` + `/api/sync/ingest`, `POST /api/fulfillment/onboarding/ingest`, `POST /api/aistudio/webhook/register`. `POST /api/aicoaches/webhook` checks a token **only if `AICOACHES_WEBHOOK_TOKEN` is set** — unset means open. Correct patterns already exist in this codebase to copy: Stripe (`constructWebhookEvent`), poller-kick (Google JWKS + `sub` pin + 503 when unconfigured), Autonoma (HMAC over raw bytes). |
| F-09 | Medium | Role checks are header-satisfiable. CC-017's `isPrivilegedGranter` / `isBetaGodmode` correctly require `role === "admin"` **and** a non-placeholder email — but `x-user-role: admin` + `x-user-email: anything@x` satisfies both. The gates are well-built and standing on sand. |
| F-10 | Low | `GET /api/debug/llm` returns auth mode, credential status, service-account email and a raw stack trace to anonymous callers (`routes/api.ts:116`). |
| F-11 | Low | `GET /api/ops-watchdog/credential-health` leaks internal credential state and remediation commands anonymously. |
| F-12 | Low | `server/index.ts` is a dead second entry point (not imported, not in the build script — `build` emits `server/_core/index.ts`). It carries its own `tenantMiddleware` + `apiRouter` mount and should be deleted so a future edit cannot revive the wrong one. **Concrete damage already proven:** it was the *only* mount for `POST /api/intake`, so the live server had no intake route and five lead-capture forms silently failed (see side-finding; fixed by CC-2026-10-03-002). |
| F-13 | Info | Autonoma's `sharedSecret`/`signingSecret` default to `""` when unset (`autonomaSdk.ts:16-17`). Confirm the SDK refuses an empty secret rather than accepting unsigned requests. |

---## Side-finding (outside auth scope, lead generation)

**`POST /api/intake` has a complete handler that no running server mounts.**

Five public marketing pages post lead captures to it: `Book.tsx` (free chapter),
`Careers.tsx`, `Community.tsx`, `HelpCenter.tsx`, `Bootcamp.tsx`. Each does
`if (!res.ok) throw` → `toast.error("Something went wrong. Try again.")`.

The handler itself — `server/routes/intake.ts`, committed 2026-09-23 — is fine:
validates the email, persists to `contact_submissions`, opens a messenger DM
thread, relays to n8n, marks the row synced, and answers 503 honestly when the
lead landed nowhere. **But the only mount for it is `server/index.ts:42`, an
entry point the build never emits** (build = `esbuild server/_core/index.ts`,
Docker `CMD ["node", "dist/index.js"]`). `server/_core/index.ts` had no intake
mount at all.

So on production `GET /api/intake` returns **200 with the SPA HTML shell** —
that is what "no API route matched" looks like when the static handler answers —
and the POST misses the route too. Every submission from those five forms fails.

**This is F-12 in action, not a separate problem.** The dead second entry point
did not merely sit there; it silently orphaned a live lead-capture route.

> **Correction to the first draft of this audit.** The original text here said
> "`POST /api/intake` does not exist" and "no `intake` route is registered
> anywhere under `server/`". That was wrong: it came from a `git grep` truncated
> by `head -20`. The file was there all along, mounted on the dead entry. The
> accurate statement is the one above.

Fixed as **CC-2026-10-03-002**: mounted on the live entry point, ahead of the
tenant chain, with 7 hermetic tests including a mount-regression guard.

---

## Route inventory

105 routes in `apiRouter` (`server/routes/api.ts`), plus 12 pre-mount handlers registered on `app` before it:
`/api/auth/*` (signup, login, google, me, logout), `/api/oauth/callback`,
`/api/oauth/hubspot/callback` (+ its `/oauth/hubspot/callback` alias),
`/api/stripe/webhook`, `/api/autonoma`, `/api/aicoaches/webhook`,
`/api/internal/poller-kick`, and `/api/trpc`.

### A. Keep public — verified, correct, or genuinely anonymous

| Route | Why it stays open |
| --- | --- |
| `GET /api/health` | deploy verification |
| `GET /api/orchestrator/models` | deploy verification (CC-021) |
| `GET /api/dashboard/llm-ping` | deploy verification |
| `POST /api/stripe/webhook` | Stripe signature verified via `constructWebhookEvent` |
| `POST /api/autonoma` | SDK HMAC over raw bytes (verify F-13) |
| `POST /api/internal/poller-kick` | Google JWKS + `sub` pin; 503 when unconfigured — **the reference implementation** |
| `POST /api/aicoaches/webhook` | token gate exists; make it fail closed (see F-08) |
| `/api/auth/{signup,login,google,me,logout}` | the login flow itself |
| `/api/oauth/{callback,hubspot/callback}` | OAuth redirects |
| `/api/trpc` | context runs `sdk.authenticateRequest` → real HS256 verify; each procedure declares its own visibility |
| `GET /api/share/runs`, `GET /api/share/runs/:runId` | token-scoped by design; workspace resolved from the token hash, not the middleware |
| `POST /api/discounts/validate` | candidate for public (pricing page) — **decision needed** |
| `POST /api/campaigns/founder-sprint/book` | called from the public FounderSignalSystem page — **decision needed; needs abuse protection rather than auth** |
| `POST /api/intake` | **handler exists but was mounted only on the dead entry point** (F-12) — mounted on the live entry by CC-2026-10-03-002; anonymous by design |

### B. Webhooks — need signature/secret verification, not user auth

`POST /api/webhooks/instantly` · `POST /api/voice/webhook` · `POST /api/aistudio/ingest` · `POST /api/sync/ingest` · `POST /api/fulfillment/onboarding/ingest` · `POST /api/aistudio/webhook/register`

### C. Require verified identity — currently anonymous (~85 routes)

Highest risk first:

- `POST /api/sync/action` — trigger/approve/reject runs (F-06)
- `DELETE /api/workflows/:workflowId`, `POST /api/workflows/:workflowId/run`, `POST /api/agents/deploy`
- `POST /api/snapshots/:id/restore`, `DELETE /api/snapshots/:id`, `POST /api/snapshots/:id/clone`
- `GET /api/audit-logs`, `GET /api/audit-logs/export`, `GET /api/audit-logs/stats`
- `GET/DELETE /api/artifacts*`, `POST /api/artifacts/:id/{evaluate,refine}`
- `POST /api/generate-image` (Imagen quota), `POST /api/orchestrator/chat` (Gemini quota)
- `POST /api/voice/dispatch` (**outbound calls**), `POST /api/campaigns/outreach/{cre,medspa}` (outbound dispatch)
- `POST /api/assessment-questions/generate-ai`, `POST /api/icp/generate` (model spend)
- `GET /api/ops-watchdog/*`, `GET /api/debug/llm` (disclosure)
- `GET /api/share/tokens`, `POST /api/share/tokens`, `DELETE /api/share/tokens/:tokenId` (operator share lifecycle — distinct from the public token-scoped reads)
- `PATCH/PUT/DELETE` across workflows, agents, runs, artifacts, marketplace, teardown

---

## Proposed design (for Robert's review — NOT implemented in this pass)

1. **Verify, don't decode.** Replace `decodeJwt` with the verification the rest of the app already uses: `sdk.authenticateRequest` (HS256 session cookie, `COOKIE_NAME`, httpOnly, already issued by `/api/auth/login|signup|google`) as the primary path, and `jwtVerify` against Google's JWKS for Bearer tokens.
2. **Delete the legacy fallback.** `x-workspace-id`, `x-user-email`, `x-user-role` must stop being trusted. Identity comes from a verified credential only. If a local/test convenience is wanted, gate it behind an explicit non-production flag that fails closed in prod.
3. **Fail closed.** `catch` in `tenantMiddleware` → 401, not `next()`.
4. **Add `requireAuth` on the router**, with an explicit public allowlist from section A mounted ahead of it. Route-level exceptions are listed once, in one place, instead of being implied by 27 different controllers.
5. **Keep the `!workspaceId → 401` guards** as defence in depth — but stop relying on them as the sole control.
6. **Webhooks get their own verification** (signature or shared secret), each **failing closed when unconfigured** — copying poller-kick's 503 behaviour rather than aicoaches' current open-when-unset.
7. **Fix the role model.** After (1)-(2), `req.userRole` comes from the `users` table or the god-mode list, never from a header — which makes CC-017's `isPrivilegedGranter` actually mean something.
8. **Delete `server/index.ts`** (F-12) so there is exactly one mount chain.

### Migration risk (the reason this was audit-first)

The client calls `/api` from **28 files via raw `fetch`**. Only 11 pass `credentials: "include"` and only 8 set `Authorization`. The saving grace: `fetch` defaults to `credentials: "same-origin"`, and every call uses relative `/api/...` paths, so a **session-cookie**-based fix should work for logged-in users **without touching those 27 call sites**.

That has to be *verified*, not assumed — it depends on which flows actually set `COOKIE_NAME`, and on the public pages above that legitimately have no session. Flipping `requireAuth` on without that verification would 401 the app's own UI.

---

## Open questions for Robert

1. **Approve the fix design above**, or adjust it (e.g. keep a scoped header-based mode for local dev only)?
2. **Anonymous-by-design list** — confirm section A, and decide `discounts/validate` and `founder-sprint/book`.
3. **`/api/intake`** — ~~rebuild the handler, or repoint the five forms?~~
   **Resolved the same day, as CC-2026-10-03-002.** The handler needed no
   rebuild — only a mount on the entry point that actually runs. Left to watch:
   the first genuine submission in `contact_submissions` after deploy.
4. **Rollout** — deploy under standing authorization, or hold until you have reviewed? The current posture is open to the internet, so delay has a cost.
5. **Autonoma empty-secret behaviour** (F-13) — confirm before relying on it as public-by-design.

---

## Fix executed — 2026-10-03, CC-2026-10-03-003

Robert approved the design above with three scope calls: **the full design, webhooks included, failing closed**; **the four lead-generation endpoints stay anonymous**; **`/api/voice/tts` gets protected**.

### What shipped

1. **Verify, don't decode** — `middleware/tenant.ts` rewritten. Identity comes from `sdk.verifySession` (HS256, the session secret) on the httpOnly session cookie or the same value in a Bearer header, read through the *same* `getSessionTokenFromRequest` the login routes write with. `decodeJwt` is gone.
2. **Legacy fallback deleted** — `x-user-role`, `x-user-email` and `x-workspace-id` are no longer read anywhere in the identity path. With no verifiable session there is no identity at all: no default workspace, no default role. `req.authenticated` is false.
3. **Fail closed without breaking the public routes** — see the deviation note below.
4. **`requireAuth` as one gate** — new `middleware/apiAuth.ts`, mounted once at the top of `apiRouter` (`apiRouter.use(apiAuthGate)`), so routes inherit it without opting in. Public list is 8 entries, each justified inline; webhook class is 8 routes.
5. **The `!workspaceId → 401` guards stay** as defence in depth — they are no longer load-bearing, because nothing unverified reaches them.
6. **Webhooks authenticate** — `WEBHOOK_INGEST_SECRET` via `x-webhook-secret` header or `?secret=`, timing-safe compare. Unconfigured → **503**, wrong → **401**. Includes `POST /sync/action` and `/aistudio/action` (the audit's worst open route). A service caller may name its own workspace *only after* the secret is proved — the distinction the old fallback lacked. `AICOACHES_WEBHOOK_TOKEN` went from "check it if set" to the same fail-closed contract.
7. **Role is header-free** — `users.role`, with the god-mode address list promoted to `admin` over `0000…0000`. `isPrivilegedGranter` in the marketplace now means something.
8. **`server/index.ts` deleted** (F-12) — exactly one mount chain remains.

Client side: `PamelaVoiceWidget` and `OpsAgentChat` name the 401 truthfully ("sign in to hear Pamela's voice" / "needs a session") instead of reporting a connection or synthesis failure that never happened.

### One deliberate deviation from the draft design

The draft said "catch → 401". Taken literally that 401s `/api/health`, `/api/orchestrator/models` and `/api/dashboard/llm-ping` whenever identity resolution hiccups — taking down the deploy smoke test for a problem those routes do not have. So `tenantMiddleware` **never blocks; it only withholds identity**, and `apiAuthGate` refuses anything not explicitly public. The same fail-closed outcome, without collateral damage. The reasoning is recorded in the file header.

### Verification (live, production, revision `agentlab-00242-psk` @ 100%)

| Check | Result |
| --- | --- |
| Public: `/api/health`, `/api/orchestrator/models`, `/api/dashboard/llm-ping` | 200 anonymous ✓ |
| `POST /api/intake` (mounted outside the router) | 400 on missing email ✓ |
| 12 protected routes anonymous (`/runs`, `/audit-logs`, `/artifacts`, `/workflows`, `/agents`, `/snapshots`, `/ops-watchdog/credential-health`, `/share/tokens`, `/dashboard/telemetry`, `/debug/llm`, `/marketplace/items`, `/playbooks`) | **all 401** ✓ |
| Header spoof: god `x-workspace-id` + `x-user-role: admin`, no session | **401** (was 200 with 85 KB of operator runs) ✓ |
| `POST /sync/action`, `/webhooks/instantly`, `/aicoaches/webhook` with no secret configured | **503** fail-closed ✓ |
| `POST /voice/tts` anonymous | **401** ✓ |
| **Authenticated path** — signed up a throwaway account, replayed its real `app_session_id` cookie | `/api/runs` → **200**, `{"runs":[],"total":0}` (21 bytes); `/workflows`, `/agents`, `/audit-logs`, `/artifacts`, `/snapshots`, `/credential-health`, `/share/tokens`, `/dashboard/telemetry`, `/playbooks` → all **200** ✓ |
| Same session + god-workspace header | still 21 bytes — **header cannot widen the tenant** ✓ |
| Same route, cookie vs no cookie | 200 vs **401** ✓ |
| Deleted account → its old cookie | **401** (a verified session naming no user grants nothing) ✓ |
| `/api/share/runs` anonymous | 401 with the *handler's* own `Invalid or revoked share link`, not the gate's `Unauthorized` — the gate passed it, the token check did the refusing ✓ |
| Cloud Run logs since deploy | three `severity>=ERROR` entries, all Cloud Run request logs for the three deliberate 503 probes (`curl/8.21.0`). **Zero application errors.** ✓ |

**Test data removed:** the throwaway user and its workspace were deleted (re-query returns 0; the reserved `…0001` / `…0000` workspaces were explicitly excluded). No test account remains.

Checks: **687/687 across 71 files** (was 625/68 at the handoff; +7 intake, +55 auth), `tsc --noEmit` at the documented 4-error cookie@2 baseline (a fifth error from importing `cookie` in tenant.ts was removed by reusing `getSessionTokenFromRequest` instead), `pnpm build` exit 0, `pnpm change-control:check` green.

### New finding raised by this verification (F-14)

`GET /api/snapshots` returns byte-identical data for two unrelated workspaces. Cause: `server/controllers/snapshots.ts` serves a module-level `let snapshotsStore` — seeded templates, **zero `workspaceId` references in the whole file** — and `saveSnapshot` unshifts user-created snapshots into it. So any signed-in workspace can read, clone, restore and delete every other workspace's snapshots, and they vanish on restart. Pre-existing, unrelated to the auth work, and now reachable by any authenticated user rather than by the whole internet. Not fixed here: it needs a data-model decision (scope the rows, or declare snapshots global templates). Recorded as **F-14**.

**RESOLVED — CC-2026-10-03-004 (same day).** Data-model decision: one column, two classes. `workspace_id IS NULL` = built-in template — globally visible and clonable (Settings.tsx hardcodes both template ids), and never deletable through the API (**403**). `workspace_id = yours` = your snapshot — invisible and undeletable everywhere else, which reads as **404** byte-identical to nonexistent so nothing leaks. The controller was rewritten onto a new `workspace_snapshots` table (schema + `CREATE TABLE IF NOT EXISTS` self-heal DDL); all five handlers pass every read through a `visibleFilter()` of templates-or-own; `saveSnapshot` stamps the caller's workspace; clones always land in the caller's workspace; a session with no workspace gets 401. The two templates are seeded idempotently (`onConflictDoNothing`, once per process) instead of living in process memory, so deploys no longer wipe user saves. Response shapes are byte-for-byte what `Settings.tsx` already expects — zero client change. 16 hermetic tests in `server/controllers/snapshots.test.ts`, including assertions on the drizzle SQL atoms that prove the `workspace_id` filter is actually applied.

**Live proof on revision agentlab-00243-h7h**: anonymous `GET /api/snapshots` → 401; account A sees exactly the 2 templates, saves → 201, template delete → 403; account B's list shows exactly 2 templates with A's snapshot id **absent**, and B's `DELETE` of A's id → 404 `Snapshot not found.` — the cross-tenant leak that raised F-14 is closed in production. Direct DB read confirms `workspace_snapshots` exists (self-heal DDL) with TEMPLATE_ROWS=2 (`workspace_id NULL`) and zero private leftovers; zero `severity>=ERROR` since the deploy. Test accounts and workspaces deleted.

### What is left for Robert

1. Set **`WEBHOOK_INGEST_SECRET`** on the Cloud Run service if any inbound webhook should work (Instantly, voice, AI Studio ingest/remote-action, fulfillment). Until then they answer 503 by design. Send it as `x-webhook-secret: <value>` or `?secret=<value>`.
2. Set **`AICOACHES_WEBHOOK_TOKEN`** for the AI Coaches lead webhook (same contract).
3. One **logged-in click-through** in a browser. The session mechanism is the same one tRPC has used in production all along, and the cookie path is proven live above — but no real browser session was exercised in this run.
4. ~~Decide the **F-14** snapshot-scoping question.~~ **Done the same day** — decided and executed as CC-2026-10-03-004 (templates global and undeletable, snapshots workspace-private).

---

## Change control

Register entry **CC-2026-10-03-001** — audit only, no code changed, dispositions pending Robert.
Register entry **CC-2026-10-03-002** — the `/api/intake` mount fix.
Register entry **CC-2026-10-03-003** — this fix, executed.
Register entry **CC-2026-10-03-004** — F-14: workspace-scoped snapshots, global undeletable templates.
Run `pnpm change-control:check` before calling workflow-package changes complete.

Register entry **CC-2026-10-03-001** — audit only, no code changed, dispositions pending Robert.
Run `pnpm change-control:check` before any follow-up build is called complete.
