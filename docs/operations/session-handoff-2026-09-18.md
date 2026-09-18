# Session Handoff: 2026-09-18

## Current Status

We finished the social media posting dispatcher build for AgentLab OS. The dispatcher is fully wired into the queue processor and will run every 5 seconds, scanning for scheduled posts and posting them to LinkedIn, Facebook, Instagram, or Threads. **LinkedIn and Facebook tokens are obtained and saved.** Some details need follow-up.

## What We Accomplished

### Social Media Posting Infrastructure (NEW)

**`server/execution/social-dispatcher.ts`** (492 lines) — new file, 5 exported functions:
- `postToLinkedIn(content, title, metadata)` — LinkedIn UGC API `/v2/ugcPosts`
- `postToFacebook(content, title, metadata)` — Facebook Graph API `/{pageId}/feed`
- `postToInstagram(content, title, metadata)` — Instagram Graph API (2-step: create container → publish)
- `postToThreads(content, title, metadata)` — Threads Graph API `/{threads-user-id}/threads`
- `dispatchScheduledPosts()` — scans `workflowArtifacts` for `status="scheduled"` + `scheduledFor <= now`, posts to `targetPlatform`, updates status to `"published"` or `"failed"`
- `postArtifactNow(artifactId, platform?)` — immediate posting for orchestrator use

**`server/execution/queue-processor.ts`** — wired:
- Import: `import { dispatchScheduledPosts } from "./social-dispatcher"`
- Call: `dispatchScheduledPosts()` after each workflow run completes (line ~360)

**`server/execution/agent-runner.ts`** — 4 `scheduledFor` defaults changed from null/1-day to `now`:
- Line 142: `payload.posts[]` — `+ \|\| new Date().toISOString()`
- Line 156: `payload.drafts[]` — `+ \|\| new Date().toISOString()`
- Line 199: Markdown `### Post` extraction — `+ scheduledFor: new Date().toISOString()`
- Line 329: `saveContentDraft` tool — `new Date(Date.now() + 86400000)` → `new Date().toISOString()`

**`.env.local`** — social credentials added:
- LinkedIn: `LINKEDIN_CLIENT_ID=865eewqkmfsb77`, `LINKEDIN_CLIENT_SECRET=[REDACTED]`, `LINKEDIN_ACCESS_TOKEN=AQWPzn...K4XA` (60 days, `w_member_social` scope, obtained via OAuth callback server)
- Facebook: `FACEBOOK_APP_ID=1554248856054288`, `FACEBOOK_APP_SECRET=d9b41b...333d`, `FACEBOOK_PAGE_TOKEN=EAAWFl...ZDZD`, `FACEBOOK_PAGE_ID=61578455727746` (Uncle Robert OldvProf Page)
- Instagram: `INSTAGRAM_APP_ID=991700740393544`, `INSTAGRAM_APP_SECRET=a27070...b682`
- Threads: `THREADS_APP_ID=3510622799087458`, `THREADS_APP_SECRET=a6cf5a...d345`
- Google OAuth (2 sets): Portable Founder Dashboard + Main

### OAuth Helper Scripts (NEW — for future use)
- `server/execution/linkedin-callback-server.py` — background OAuth callback server on `localhost:8080` (path bug in `.env.local` resolution — fixed to 3 levels up)
- `server/execution/linkedin-get-token.py` — single-shot token exchange: run, authorize in Chrome, paste callback URL, token saved directly (no server needed)

### Pulse Social (separate system — NOT in this repo)
- FastAPI backend on Google Cloud Run (`pulse-social-backend-1071630138981.us-central1.run.app`)
- MongoDB Atlas (`cluster1pulse.nq0qfzk.mongodb.net`)
- Vercel frontend (`pulse-social-agentlab-projects.vercel.app`)
- Code lives in `RTMDIYguy/pulse-social` (separate GitHub repo)
- Extraction scripts in `scripts/`: `extract_all_pulse_files.py`, `extract_pulse_code.py`, `move_and_push_pulse.bat`, `push_pulse_code.bat`
- Likely issues: Cloud Scheduler `pulse-post-checker` trigger may not be active; APScheduler `poll_scheduled_posts` job may not be running

## Known Issues (for tomorrow)

1. **LinkedIn `postToLinkedIn` author field** — the function uses `urn:li:person:UNKNOWN` as author. The UGC Posts API requires a valid member URN (`urn:li:person:{numericId}`). The token only has `w_member_social` scope (posting only), not `r_liteprofile` (read), so we can't look up the member ID. Fix: re-authorize with `scope=w_member_social+r_liteprofile`, extract member ID from `/v2/me`, update function to use real URN.

2. **Facebook page posting** — the page token (`EAAWFl...`) was granted but may be a User token, not a Page token. Need to test `POST /{pageId}/feed` to verify it can post. If it fails, need a proper Page Access Token with `pages_manage_posts`.

3. **Instagram User ID** — not set. Can be obtained from the Facebook Page via `GET /{pageId}?fields=connected_instagram_account` using the FB page token. Save as `INSTAGRAM_USER_ID`.

4. **Threads User ID** — not set. May be the same as Instagram User ID. Set as `THREADS_USER_ID`.

5. **LinkedIn callback server path bug** — `linkedin-callback-server.py` had a bug resolving `.env.local` path (was 1 level up from `server/execution/`, needed 3 levels up to project root). Fixed. The `linkedin-get-token.py` script has the correct path.

## Where to Look for Context

- `server/execution/social-dispatcher.ts` — the dispatcher (492 lines, all platform posting functions)
- `server/execution/queue-processor.ts` — dispatch call at line ~360
- `server/execution/agent-runner.ts` — 4 `scheduledFor` default changes
- `.env.local` — social credentials (LinkedIn, Facebook, Instagram, Threads, Google OAuth x2)
- `server/execution/linkedin-get-token.py` — single-shot token capture (use this instead of the callback server)
- `docs/operations/daily-command-center/2026-09-18-command-brief.md` — today's command brief
- `docs/operations/session-handoff-2026-08-08.md` — Pulse Social session handoff (APScheduler, Cloud Run, OAuth details)
- `docs/operations/workflow-registry.md` — MKT-08 Social Media Management (listed as "Automation scaffold only")
- `governance/registry/services.yaml` — Pulse Social listed as `SVC-PULSE-SOCIAL` (social_syndication_app)
