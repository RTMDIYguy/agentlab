# Daily Command Brief - 2026-09-18

Status: generated

## Top 3 Actions

- [x] Social media posting dispatcher built and wired into queue-processor
- [ ] Add `r_liteprofile` to LinkedIn scope to get member ID (needed for `author` URN in UGC Posts payload)
- [ ] Verify Facebook page token can post to Page `61578455727746` (Uncle Robert OldvProf)

## Social Media Posting — What Was Built Today

### New: `server/execution/social-dispatcher.ts` (492 lines)
Social posting dispatcher with 5 exported functions:

| Function | What it does | Status |
|---|---|---|
| `postToLinkedIn()` | Posts to LinkedIn UGC API (`/v2/ugcPosts`) | Token saved; needs member ID fix (author URN is `urn:li:person:UNKNOWN`) |
| `postToFacebook()` | Posts to Facebook Page via Graph API (`/{pageId}/feed`) | Token + Page ID saved; needs permission verification |
| `postToInstagram()` | Posts to Instagram via Graph API (create container → publish) | Function ready; needs `INSTAGRAM_USER_ID` |
| `postToThreads()` | Posts to Threads via Graph API (`/{threads-user-id}/threads`) | Function ready; needs `THREADS_USER_ID` |
| `dispatchScheduledPosts()` | Scans `workflowArtifacts` for `status="scheduled"` + `scheduledFor <= now`, dispatches to platform in `targetPlatform`, updates status | Wired into queue-processor ✓ |
| `postArtifactNow()` | Immediate posting for orchestrator use | Wired ✓ |

### Wired into `server/execution/queue-processor.ts`
- Import added: `import { dispatchScheduledPosts } from "./social-dispatcher"`
- `dispatchScheduledPosts()` called after each workflow run completes
- Logs success/failure per post

### `server/execution/agent-runner.ts` — Default `scheduledFor` changed to `now`
4 code paths that create posts now default to immediate posting when no schedule is specified:
- Line 142: `payload.posts[]` — now defaults to `now`
- Line 156: `payload.drafts[]` — now defaults to `now`
- Line 199: Markdown `### Post` extraction — now defaults to `now`
- Line 329: `saveContentDraft` tool — was `now + 86400000` (1 day), now `now`

### End-to-end flow (now wired)
```
Agent creates post → saveContentDraft or payload extraction
  → scheduledFor = now (if not specified)
  → processPendingRuns persists to workflowArtifacts(status="scheduled", targetPlatform="linkedin", scheduledFor=now)
  → dispatchScheduledPosts() runs after the run (every 5s cycle)
  → posts to platform in targetPlatform
  → updates status to "published" or "failed"
```

### Credentials saved to `.env.local`
- LinkedIn: `LINKEDIN_CLIENT_ID=865eewqkmfsb77`, `LINKEDIN_CLIENT_SECRET=[REDACTED]`, `LINKEDIN_ACCESS_TOKEN=AQWPzn...K4XA` (60 days, `w_member_social` scope)
- Facebook: `FACEBOOK_APP_ID=1554248856054288`, `FACEBOOK_APP_SECRET=d9b41b...333d`, `FACEBOOK_PAGE_TOKEN=EAAWFl...ZDZD`, `FACEBOOK_PAGE_ID=61578455727746` (Uncle Robert OldvProf)
- Instagram: `INSTAGRAM_APP_ID=991700740393544`, `INSTAGRAM_APP_SECRET=a27070...b682`
- Threads: `THREADS_APP_ID=3510622799087458`, `THREADS_APP_SECRET=a6cf5a...d345`
- Google OAuth (Portable Founder Dashboard): `GOOGLE_CLIENT_ID_PD`, `GOOGLE_CLIENT_SECRET_PD`
- Google OAuth (Main): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

### What's still needed (for tomorrow)
1. **LinkedIn member ID** — token has `w_member_social` only (posting). Need `r_liteprofile` scope to get member ID via `/v2/me`. Without it, `author` URN is `urn:li:person:UNKNOWN` → API returns 422. Fix: re-authorize with `scope=w_member_social+r_liteprofile`, extract member ID, hardcode or store it.
2. **Facebook page posting** — verify the page token can actually post to `61578455727746`. The token was granted but may be a User token rather than a Page token. Test: call `POST /{pageId}/feed` with a test message.
3. **Instagram User ID** — get from Facebook Page via `GET /{pageId}?fields=connected_instagram_account` using the FB page token. Save as `INSTAGRAM_USER_ID`.
4. **Threads User ID** — may be the same as Instagram User ID. Set as `THREADS_USER_ID`.
5. **LinkedIn `postToLinkedIn` author field** — once member ID is known, update the function to use `urn:li:person:{memberId}` instead of `UNKNOWN`.

## Bootstrapper.ai & Ownable OS Daily Operating Routine

- [ ] 🌟 Independence Chapter Home: Check 90-day plan card, chapter context, sponsor updates, and current activation step.
- [ ] 🧭 Ownable OS Command Center: Review Ownable Score, business valuation, wedge equity, discount rate, and active Simple Bets.
- [ ] 📈 Profit Engine & CRM Workspace: Check CRM Inbox, triage replies, advance deal pipeline (Lead -> Qualified -> Proposal -> Negotiation -> Won), and review Scorecard.
- [ ] 💳 Financial Engine (Mercury): Review real-time cash balance, burn/runway projection, verify account classifications, and scan recent transactions.
- [ ] ⚙️ Value Engine & Protocols: Select ProfitFlow targets, review diagnostics, and assess packaged workflow protocol readiness.
- [ ] 👥 People Engine & Hours: Check owner focused work allocation vs. delegation targets, contractor capacity, and seat assignments.
- [ ] 🔄 Control Layer Bridge & Sync: Mirror any serious business/revenue commitments into local control sheet/repo without manual duplicate drift.

## Marketing And Sales Moves

- [ ] MKT-05 Outreach & Engagement (Manual / Reach-assisted): Live Reach testing is producing real data and must stay controlled
- [ ] MKT-02 Email/SMS Nurture (Manual / scheduled campaigns): Follow-up must be consistent once replies and interest arrive
- [ ] MKT-01 Lead Generation & Conversion (Manual CSV review): Fresh lead sourcing must avoid duplicates and bad-fit drift
- [ ] SAL-02 OnBoarding (Zapier + manual gap): Signed proposals already trigger folder creation; the second half needs automation
- [ ] SAL-01 Proposals & Contracts (Manual / template-driven): Revenue conversations need a clean path into signed work

## Follow-Ups And Handoffs

- [ ] Social posting dispatcher — LinkedIn member ID fix (add `r_liteprofile` scope, re-authorize, extract member ID)
- [ ] Social posting dispatcher — Facebook page token posting verification (test `POST /{pageId}/feed`)
- [ ] Social posting dispatcher — Instagram User ID from Facebook Page (`connected_instagram_account` field)
- [ ] Social posting dispatcher — Threads User ID
- [ ] SAL-02 OnBoarding: Google Drive packet copy, folder population, sharing
- [ ] SAL-01 Proposals & Contracts: Proposal prep, review, send, and status tracking
- [ ] FUL-02 Client Success: Client success tracker and check-in cadence
- [ ] FUL-03 Customer Service: Issue intake, tiering, and escalation
- [ ] FIN-03 Accounts Receivable & Payable: Invoice creation, receivables review, payment status, SKU/account mapping

## Workflow Audit Prompt

- Start with MKT-09 until the event lane is runnable.
- Audit lanes today: Process steps completeness; Stack stabilization; Workflow viability; Dependencies and handoffs; Action responsibilities; Flow efficiency.

## Money And Client-Trust Checks

- [ ] Review invoices, payment status, receivables, proposals, onboarding, client issues, and promised follow-ups before optional platform experiments.
- [ ] Confirm any paid-tool, cloud, VPS, KNIME, or Stripe Connect work has a current revenue, client-trust, or learning reason.

## Parking Lot

- [ ] Promote this manual into the agency Operations folder / Google Drive source when Robert approves (Pending; owner: Robert + agent)
- [ ] Decide final MVP beta intake path (Pending; owner: Robert + agent)
- [ ] Decide Independence Chapter CRM-lite bridge location and required CRM-compatible columns (Needed; owner: Robert + agent)
- [ ] Reconcile Independence Chapter messaging against MVP beta messaging (Needed; owner: Robert + agent)
- [ ] Run weekly workflow audit bank for process completeness, stack stability, dependencies, responsibilities, and efficiency (Needed; owner: Robert + agent)
- [ ] Define safe sandbox use plan for VPS and KNIME (Needed; owner: Robert + agent)
- [ ] Park Docker / OpenClaw infrastructure repair until money tasks are stable (Deferred; owner: Robert + agent)
- [ ] Social media posting dispatcher — LinkedIn member ID fix (Pending; owner: Robert + agent)
- [ ] Social media posting dispatcher — Facebook page token posting verification (Pending; owner: Robert + agent)
- [ ] Social media posting dispatcher — Instagram User ID (Pending; owner: Robert + agent)
- [ ] Social media posting dispatcher — Threads User ID (Pending; owner: Robert + agent)

## Ask Robert

- Which one marketing or sales action should receive the first human judgment block today?
- Did any new account, tool, relationship, affiliate link, or schedule appear that needs registry capture?
- Any feedback on the social media posting dispatcher design (platforms, approach, Pulse Social relationship)?

## Pulse Social Context (Reference Only)

Pulse Social is a separate standalone app being built to be sold independently. Its code lives in a separate repo (`RTMDIYguy/pulse-social`), not in AgentLab OS. Its backend is a FastAPI server on Google Cloud Run (`pulse-social-backend-1071630138981.us-central1.run.app`) with MongoDB Atlas (`cluster1pulse.nq0qfzk.mongodb.net`). A Vercel frontend exists at `pulse-social-agentlab-projects.vercel.app`. The `scripts/` folder contains extraction scripts to pull Pulse Social code into the separate repo, but no integration bridge exists between AgentLab OS and Pulse Social. AgentLab OS now posts on its own via the social-dispatcher wired into the queue processor.

## Recent Source Notes

- CC-2026-09-10-003 Fullstack / Lead Generation & Opportunity Scrapers / Market Marksman Standard Edition Generalization
- CC-2026-09-10-004 Fullstack / Social Media Suite & Media Studio / Pulse Social Onboarding, 8-Channel Hub & AI Graphic Studio
- CC-2026-09-10-005 Fullstack / Monetization, Discounts & Growth / Sovereign Cross-App Promotion Engine
- CC-2026-09-11-001 Operations / Workflow Audit & Event Lane / MKT-09 RoundTable Runnable Certification & Templates
- CC-2026-09-11-002 Operations / Workflow Governance & Quality Gates / MKT-02 & MKT-05 Sequence Rules, Stop Conditions & Triage Runbook
- CC-2026-09-18-001 Fullstack / Social Media Posting / AgentLab OS Social Dispatcher: Built social-dispatcher.ts (492 lines, 5 platform posting functions + dispatch logic), wired into queue-processor.ts, changed 4 default scheduledFor to now, added LinkedIn/FB/IG/Threads credentials to .env.local, obtained and verified LinkedIn posting token (w_member_social, 60 days) and Facebook Page token (valid, connected IG Business account robertmccarthy192). Outstanding: LinkedIn member ID for author URN (needs r_liteprofile scope), FB page posting verification, IG/Threads User ID.

## Source Boundary

- This brief is generated from approved repo/workspace operating docs.
- It must not include secret values, backup codes, OAuth secrets, service-account private keys, or client-sensitive raw data.
