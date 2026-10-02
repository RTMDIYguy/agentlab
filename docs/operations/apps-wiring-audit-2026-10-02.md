# Apps (Ecosystem Marketplace) Wiring Audit — 2026-10-02

**Document ID:** DOC-OPS-APPS-AUDIT-2026-10-02
**Scope:** the "Apps" surface of the approved audit order = `client/src/pages/Marketplace.tsx` (969 lines, the page whose Live Apps tab carries the `category: "apps"` catalog — there is no `/apps` route; the Marketplace **is** the Apps surface), plus `server/controllers/marketplace.ts` (964 lines: catalog, mount/unmount, subscribe, beta, trial endpoints)
**Method:** inventory → trace each control/number to route → controller → storage → **runtime consumer** → classify **WIRED / UNCONSUMED / FICTIONAL / DEFECT**, with live production probes and external liveness checks
**Companion register entry:** CC-2026-10-02-016
**Series:** fifth and final page-level entry in the approved OS audit order (Dashboard → Command Center → Agents → **Apps**; the Auditing hub was swept as a supplementary entry per Robert's direct request).
**Trigger:** "Run the Apps wiring audit as the next phase of the approved OS audit order."

---

## Verdict at a glance

| # | Widget / control | Verdict |
|---|---|---|
| 1 | Catalog tabs & counts (`All Items / Playbooks / Live Apps / Books`) | **WIRED** — lengths and `mountedCount` come from the live `GET /api/marketplace/items` response (live: 23 items = 8 playbooks + 13 apps + 2 books, mounted 8) |
| 2 | Entitlement → execution spine | **WIRED — the deepest real wiring on this surface** — mount writes `workspace_packages`, unmount marks it `canceled`, and the queue processor reads active entitlements into `unlockedDepartments` which gates department steps and annotates the agent's system prompt with an ACCESS CONTROL clause |
| 3 | Paid-package path | **WIRED** (CC-2026-10-02-003/004 lineage) — mount of a paid package with Stripe configured returns an honest **402 payment_required**; subscribe creates a real Checkout Session; webhook provisions; checkout failure returns 502 and never falls back to a free grant |
| 4 | **Beta program layer (tier pill, XP, programs, enrollment, locks)** | **FICTIONAL — entirely** — `getBetaStatus` returns constants (`betaPoints: 9999` godmode / `350` otherwise, static tiers and programs), enrollments live only in a process-local `Map`, and the rewards ("+50 Beta XP", "+14 / +7 Pro Trial Days") are **never awarded by anything**. Worse, root cause: **`req.user` is never assigned anywhere in the server** — `userRole = req.user?.role \|\| "admin"` therefore always resolves to admin, so `isGodmode` is ALWAYS true. Live probe: anonymous `GET /api/beta/status` → `isGodmode: true, currentTier: "Alpha Insider (Tier 3 - Godmode)", betaPoints: 9999`, **all 13 apps pre-enrolled** — the "Beta Access" lock never renders for anyone, and the pill/modal display godmode numbers to every caller |
| 5 | **Mount provisioning claims (toast + blueprint modal)** | **MISLEADING for 6 of 8 playbooks** — toast: "DAG workflows for {id} are now unlocked and active in Command Center"; blueprint: "Mounting this playbook provisions all associated DAG steps, human-in-the-loop review triggers, and model prompts directly into your workspace." Reality: `mountPlaybook` provisions workflows **only for the FSS family** (`pkg-founder-signal` / `mkt-playbook` / `fss-playbook` → the real 6-step loop); sal/fin/ful/cul/aft/ops mounts only flip an entitlement flag. Live proof: prod has 38 workflows and **none carry department SOP names** (no SAL-01…, OPS-01…) — mounting e.g. the Sales playbook surfaces no Sales workflows. The catalog's `workflowsCount` (6/9/8/7/8/4/3) is static product copy with no backing |
| 6 | **PLAYBOOK_MOUNT audit row** | **FICTIONAL TELEMETRY — same class as CC-2026-10-02-013 disposition 6** — every mount records `model: "not-llm-dispatch"` with `tokensPrompt: 180, tokensCompletion: 90, cost: "0.000150", latencyMs: 120` — hardcoded, and self-contradictory (270 tokens on a row that says no LLM ran) |
| 7 | **Client fallback numbers** | **FICTIONAL FALLBACKS** — `mountedCount \|\| 2` renders **"2 of 8 Playbooks"** on a fresh workspace that has mounted nothing (0 is falsy); `betaPoints \|\| 350` (0 → 350); `currentTier \|\| "Contributor (Tier 2)"` shown while loading or on error; blueprint/card `automationRate \|\| "90%"`, `cycleTimeReduction \|\| "5.0 hrs/wk"`, `workflowsCount \|\| 8` invent metrics if canonical values are ever absent |
| 8 | **Trial claims** | **DEMO presented as real (known from CC-2026-10-02-008, still open here)** — header pill "30-Day Pro Trial"; beta modal "earn extra Pro Trial days"; reward rows "+14 / +7 Pro Trial Days". Live `GET /api/trials/status` → `daysRemaining: 18` hardcoded, `trialEndDate` recomputed from now (2026-10-20), `canExtend: true`; `POST /api/trials/extend` has **zero client callers** since CC-008 removed the button — dead endpoint |
| 9 | **Roadmap apps launchable** | **DEFECT** — Investor/Insurance/Legal editions (`status: "Roadmap (Coming Soon)"`, `launchUrl: "#"`) are `isBetaOnly` → godmode/enrollment bypasses the lock → `handleAppLaunch` sees `"#"` is not http → `setLocation("#")` — a dead navigation where a disabled "Roadmap" state belongs |
| 10 | Minor accuracy | `subscribeToPackage` success/cancel URLs fall back to the stale origin `https://agentlab.manus.space` when no Origin header is sent; godmode identity criteria differ client (role/name/`username: bossrob`) vs server (`role`/`name` only — moot while `req.user` is unset); `freeBookPerk.status: "Unlocked & Complimentary"` is static copy over a public Gumroad link (no entitlement check); DB mount errors "fall back to memory" (display-only until restart); `pkg-founder-signal` id is shared by the apps and playbooks categories |
| 11 | Cross-cutting (beyond this page) | **`req.user` is never set anywhere** — the tenant middleware assigns `req.userRole`/`req.userEmail`/`req.workspaceId`, never `req.user`; marketplace.ts is the **only** consumer (4 sites), so blast radius is contained today, but the pattern is a trap. Related posture: the REST `/api` router has no auth middleware — the tenant legacy fallback assigns anonymous callers workspace `…0001` and header-default `role: "admin"` into `req.userRole`. Flagged for a dedicated decision, not fixed here |

---

## Data-source trace

| Client call | Route | Controller | Storage / reality | Verdict |
|---|---|---|---|---|
| `GET /api/marketplace/items` | api.ts | `getMarketplaceItems` — canonical catalog + `workspace_packages` entitlements (memory fallback + default seed mkt/ops on empty) | `workspace_packages` rows | **WIRED** |
| `POST /api/marketplace/mount/:id` | api.ts | `mountPlaybook` — 402 payment gate → `workspace_packages` upsert; FSS family provisions workflow+6 steps+audit row | DB + memory | **WIRED** (claims overstated — #5) |
| `POST /api/marketplace/unmount/:id` | api.ts | `unmountPlaybook` — status `canceled` + memory delete | `workspace_packages` | **WIRED** |
| `POST /api/marketplace/packages/:id/subscribe` | api.ts | `subscribeToPackage` — real Stripe Checkout Session, webhook provisioning, 502 on failure | Stripe + webhook | **WIRED** |
| `GET /api/beta/status` | api.ts:231 | `getBetaStatus` — **constants; always godmode** (`req.user` never set) | nothing (in-memory) | **FICTIONAL** (#4) |
| `POST /api/beta/enroll/:appId` | api.ts:232 | `enrollBeta` — process-local `Map` (wiped every deploy); awards nothing | nothing persistent | **FICTIONAL** (#4) |
| `GET /api/trials/status` `POST /api/trials/extend` | api.ts:233-234 | demo endpoints (CC-008): base 18 hardcoded, date recomputed; extend has no callers | process-local `Map` | **DEMO / DEAD** (#8) |
| *(runtime consumer)* | — | `queue-processor.ts:298-308, 512` — `unlockedDepartments` from active entitlements gates execution and annotates the prompt | `workspace_packages` | **WIRED — the real spine** |

---

## Findings

### The beta layer is theater, and the server thinks everyone is godmode

4. `getBetaStatus` fabricates the entire gamification state: points are the constants `9999`/`350`, tiers are role-conditional strings, the five "Available Programs" are literals, and `enrolled` defaults to `["app-leadpulse", "app-pulse-social"]`. The root cause is one line: `(req as any).user?.role || "admin"` — nothing in the server ever assigns `req.user` (verified repo-wide; the tenant middleware writes `req.userRole` instead), so the default "admin" always wins and **every anonymous caller receives godmode**: live probe returned `betaPoints: 9999` and all 13 apps enrolled. Consequences: the amber "Beta Access" lock and the enrollment modal are unreachable in practice (the server pre-enrolls everyone); `enrollBeta` writes only `inMemoryBetaEnrollments` (gone on every deploy); and the reward copy — "+50 Beta XP and unlocks +14 Days Pro Trial Extension", "+14 Pro Trial Days on 5 Signal Tests", "+7 Pro Trial Days on Feedback" — is disconnected from everything: enrollment touches no points (they are constants) and never calls `extendTrial`.

5. Mount's provisioning story overshoots the code: only the FSS family creates workflows; the other six playbooks flip an entitlement that genuinely gates execution but provisions nothing to Command Center, while the catalog promises `workflowsCount` per playbook and live production has no department-named workflows to show.

6. The mount audit row repeats the invented-telemetry pattern CC-013 just removed elsewhere: hardcoded 270 tokens / $0.000150 / 120 ms on a `not-llm-dispatch` row.

7. Client fallbacks fabricate when real values are zero or pending — most consequentially `mountedCount || 2`, which tells a fresh workspace it has mounted two playbooks it has not.

8. Trial copy persists across three surfaces (header pill, beta modal, reward rows) even though the trial subsystem is a labeled demo everywhere else since CC-008, and the extend endpoint now has no caller at all.

9. Roadmap editions should be inert; instead enrollment (always granted) leads to `setLocation("#")`.

### WIRED and honest (the good list)

The entitlement spine is genuinely production-grade: mount → `workspace_packages` → queue-processor department gating with prompt-level access-control annotation; the paid-package 402 gate and Stripe checkout/webhook money path (CC-003/004) hold for non-privileged callers; the FSS mount provisions a real 6-step workflow with a real audit row; catalog counts and `mountedCount` are live (8/13/2, mounted 8 — real DB rows); all three external "Live" apps answered **HTTP 200** in this audit (market-marksman Cloud Run, Pulse Social on Vercel, LeadPulse on AI Studio), every internal launch route exists (`/book`, `/campaigns/*`, `/founder-signal-system`, generators), books route to real Gumroad pages, unmount persists `canceled`, and the page's own "Godmode Active" badge derives from real auth (`useAuth`), not the fictional server value.

---

## Live evidence (2026-10-02, revision `agentlab-00225-d6r`)

- `GET /api/beta/status` (no credentials) → `isGodmode: true`, `currentTier: "Alpha Insider (Tier 3 - Godmode)"`, `betaPoints: 9999`, `enrolledApps` = all 13 catalog apps.
- `GET /api/marketplace/items` → `workspaceId …0001`, `playbooks 8 / apps 13 / books 2 / totalCount 23 / mountedCount 8`, all eight playbooks `Mounted & Active`, canonical automation rates present.
- `GET /api/trials/status` → `totalTrialDays 30, daysRemaining 18, trialEndDate 2026-10-20, canExtend true` (demo values).
- External liveness: `market-marksman-718497644379.us-central1.run.app` → 200; `pulse-social-agentlab-projects.vercel.app` → 200; `leadpulse-ai-lead-accuracy-enrichment-engine.ai.studio` → 200.
- Workflow census: `GET /api/workflows?limit=50` → 38 workflows, name-prefix histogram contains no department SOP codes (HubSpot ×4, Founder ×3, …; only a loose "Proposals contracts" SAL-ish row).

---

## Recommended dispositions (Robert decides)

| # | Item | Recommendation | Status |
|---|---|---|---|
| 1 | Beta/gamification layer (#4) | **Decision needed** — (A) honest relabel now: kill the fabricated points/tier/program/reward claims (or clearly mark the whole subsystem DEMO), remove reward copy that never fires, fix the `role \|\| "admin"` default so the response isn't a lie even as a demo; wire to persistence later with the entitlements rollout. (B) build it for real: DB-persisted enrollments, real XP ledger, rewards that actually extend trials. (C) remove the subsystem (pill, modal, enrollment flow). Recommendation: **A** — consistent with the CC-008 trial demotion | Pending |
| 2 | Mount provisioning claims (#5) | **Honest copy + real numbers** — toast/blueprint state what mount really does (entitlement unlock that gates department execution; provisioning named only for the FSS family); `workflowsCount` shown as the real live count per department (0 today) or dropped from the claim | Pending |
| 3 | PLAYBOOK_MOUNT invented telemetry (#6) | **Same pattern as CC-013 disposition 6** — tokens/cost 0, measured latency, `policyChecks: evaluated:false` note not-llm-dispatch | Pending |
| 4 | Client fabricated fallbacks (#7) | **Remove** — render real `0` / "—" / loading states; never `|| 2`, `|| 350`, `|| "90%"`, `|| 8` | Pending |
| 5 | Trial copy on this page (#8) | **Align with CC-008 DEMO labeling** — pill and reward copy say demo/roadmap or go; dead `POST /trials/extend` removed or left documented as demo | Pending |
| 6 | Roadmap "#" launches (#9) | **Disable** — roadmap-status apps render an inert "Roadmap — coming soon" button instead of enroll→navigate-to-# | Pending |
| 7 | Minor accuracy (#10) | **Fix copy** — stale `agentlab.manus.space` origin fallback, godmode criteria alignment, `freeBookPerk` "Unlocked" wording | Pending |
| 8 | Cross-cutting `req.user` + open REST posture (#11) | **Decision needed** — (A) document only (contained today: marketplace.ts is the only reader), schedule a dedicated auth-posture pass; (B) fix the `req.user` default in this pass (read `req.userRole` instead) and leave REST posture for later. Recommendation: **A or B** — either way the REST auth posture deserves its own audit | Pending |

---

## Honest limits of this audit

- Beta/trial behavior was probed from an unauthenticated client; an authenticated (Bearer) caller may receive different `req.user`-independent results — but `req.user` is never set for anyone, so the constants apply universally by code reading.
- The entitlement gate's *prompt-level* ACCESS CONTROL clause was read in the queue processor; whether the model can technically reach SOPs outside its entitlement was not exercised (no adversarial run was dispatched).
- `workflowsCount` per department was checked against the live workflow name census, not against a per-department table (none exists); department workflows may be created in the future by seeding scripts.
- The Stripe checkout path was not re-executed (money movement); CC-2026-10-02-003/004 evidence stands as prior proof.

---

*Audit method note: claims were verified against live production responses, external HTTP probes, and code traces — not by UI appearance. Each finding names its file/line or probe and is reproducible.*
