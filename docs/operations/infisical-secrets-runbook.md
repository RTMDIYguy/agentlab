---
document_id: DOC-INFISICAL-SECRETS-RUNBOOK
title: "Infisical Secrets Delivery Runbook (AgentLab OS)"
document_type: security_runbook
authority_level: operational
status: active
owner: "Robert T. McCarthy / OPS"
canonical_sources:
  - docs/operations/secret-handling-standard.md
  - docs/operations/change-control-register.md
last_reviewed: 2026-09-25
next_review: 2026-10-25
version: "1.0.0"
related_change: CC-2026-09-25-005
---

# Infisical Secrets Delivery Runbook (AgentLab OS)

Date created: 2026-09-25
Status: active
Change record: `CC-2026-09-25-005`

## Why

AgentLab OS read its credentials from `.env` / `.env.local` on this laptop. That
worked, but it meant the business ran only as long as one disk survived, one
person knew where the file was, and nobody rotated anything. Infisical makes the
credential store central: values live in one dashboard, the app receives them at
startup, and the laptop stops being a single point of failure.

This runbook keeps the move honest. It also does not pretend the local files are
gone on day one - the app supports both, and tells you which one it used.

## Delivery matrix (decide before touching anything)

| Context | How secrets arrive | Status |
| --- | --- | --- |
| Local development (this laptop) | `infisical run --env=dev -- <cmd>`, wrapped by `pnpm dev` | implemented, pending Robert's login |
| Offline fallback | `.env.local` on disk via `pnpm dev:local` | implemented (kept for outages) |
| CI/CD (GitHub Actions) | Machine identity (Universal Auth) or the Infisical GitHub App | documented, not wired |
| Production (Cloud Run, `us-central1`) | Machine identity; see "Production" below | documented, not wired |
| Kubernetes | Not used by this system | n/a |

Stop and schedule rather than improvise if a change would touch
`.github/workflows/deploy.yml` or the Cloud Run service: that path is the only
way the live product ships today.

## Key inventory (metadata only - never values)

Names the runtime reads. Full list with grouping: `pnpm secrets:check`.

- Database: `DATABASE_URL`, optional `NEON_KEEPALIVE_MINUTES`
- Gemini: `GOOGLE_GENERATIVE_AI_API_KEY` or `GEMINI_API_KEY`, or
  `GOOGLE_SERVICE_ACCOUNT_JSON` / `GOOGLE_SERVICE_ACCOUNT_FILE`, plus optional
  `GOOGLE_AI_BASE_URL`, `GOOGLE_AI_MODEL`, `GOOGLE_AI_OAUTH_SCOPE`
- Sessions: `COOKIE_SECRET` / `JWT_SECRET`
- Integrations: `HUBSPOT_PAT`, `INSTANTLY_API_KEY`, `ELEVENLABS_API_KEY`,
  `AGENTMAIL_API_KEY`, `BROWSERBASE_API_KEY`, Stripe keys,
  `AUTONOMA_SHARED_SECRET`, `AUTONOMA_SIGNING_SECRET`
- Social: `LINKEDIN_ACCESS_TOKEN`, `FACEBOOK_PAGE_TOKEN`,
  `INSTAGRAM_APP_SECRET`, `THREADS_APP_SECRET`
- Build-time (Vite, baked at build not runtime): `VITE_APP_ID`,
  `VITE_FIREBASE_*`, `VITE_N8N_URL`, `VITE_*_URL`

Handling of the actual values stays under
`docs/operations/secret-handling-standard.md`; log the handling action in the
metadata-only log at
`C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\Compliance Audits\secret-handling-log.md`.

## Step 1 - Inspect the project (done, record only)

- Language/runtime: TypeScript, Node 22, Express 5 + Vite/React, pnpm.
- Dev command: `pnpm dev` (`tsx watch server/_core/index.ts`).
- Prod command: `node dist/index.js` in a Cloud Run container.
- Env loading today: `server/_core/env.ts` (now delegating to
  `server/_core/secrets-source.ts`).
- Config present: `Dockerfile`, `cloudbuild.yaml`, `.github/workflows/*`,
  `.env`, `.env.local` (both git-ignored, never committed - verified in history).
- This is **dev on Windows first**, then CI/CD and Cloud Run.

## Step 2 - Create the account and the project

1. Sign up at https://app.infisical.com.
2. Secrets Management -> `+ Add New Project`, name it `AgentLab OS`.
3. Every new project starts with Development, Staging, Production
   (CLI slugs: `dev`, `staging`, `prod`).
4. Import in one move: drag `.env.local` (and `.env` if it has anything extra)
   onto the Secrets Overview page. Review the discovered keys, then set
   **Target Environments = Development only** for now. Production gets its own
   deliberate promotion, not an accidental copy of laptop values.
5. Rotate anything you no longer trust while you are in there. Known debt:
   the Neon password that was hardcoded in the deleted `test-db.mjs`
   (`CC-2026-09-24-007`).

   How to find the Secrets Overview page (it sits inside a project, not on
   the organization home):

   app.infisical.com (Organization Home) -> Secrets Management card ->
   click the project (AgentLab OS) -> you land on the project's Secrets
   Overview; select the Development tab at the top, then drop the file.

   How the drag-and-drop actually works (it sounds stranger than it is):

   1. Open File Explorer (Win+E) to the repo folder, e.g.
      `E:\...\AI Native Agency Deepened\AgentLab`.
   2. In the browser, be on the Infisical Secrets Overview page for the
      `AgentLab OS` project, Development environment
      (app.infisical.com -> project -> Secrets Management).
   3. Position the two windows side by side (drag one window to the left
      edge of the screen and the other to the right edge).
   4. Click and HOLD `.env.local` in File Explorer, drag it out of the
      window, over the browser page, then release. The page accepts the
      drop - nothing is uploaded to the repo, only to Infisical's own
      encrypted store.
   5. Infisical shows every key it discovered for review BEFORE saving:
      key names, values, and target environments. Check the list, set
      Target Environments to Development, then confirm the upload.
   6. No File Explorer? Use "Paste Secrets" on the same page instead: open
      `.env.local` in Notepad, Ctrl+A, Ctrl+C, paste into the box,
      continue. Same result, no dragging.

   6. This repo has TWO disk files: `.env.local` (the newer override) and
      `.env` (older base). If an import comes up short, the missing lines
      usually live in the other file - paste `.env`'s contents too.
   7. Gotcha seen live (2026-09-25): dropping the file anywhere the page
      does not catch makes the BROWSER open the file in a new tab instead
      of uploading it. That is only a local preview - nothing was sent
      anywhere; close the tab and switch to the paste route, which always
      works:

      a. From the repo root in PowerShell:  notepad .env.local
      b. Ctrl+A, Ctrl+C (copy the whole file).
      c. Infisical Secrets Overview -> + Add New Secret -> Paste Secrets
         (or the overflow menu's Import option).
      d. Paste, continue to the review screen, upload as in step 5.

   Security note: this is one of the few places where briefly handling the
   file's contents is unavoidable for a human; the values go from your
   screen straight into Infisical's encrypted store, never into chat,
   git, or a document. The approved-vault doctrine
   (`docs/operations/secret-handling-standard.md`) is satisfied the
   moment the upload completes.


## Step 3 - Install the CLI and log in

Windows (this machine):

```powershell
winget install infisical          # or: scoop install infisical
# or, if neither package manager is available:
npm install -g @infisical/cli
```

After installing, **open a NEW terminal** so PATH refreshes, then check
`infisical --version` works before continuing. If it still says
"'infisical' is not recognized" after a fresh terminal, log out and back in
(Windows refreshes PATH for existing sessions only at sign-in).

macOS/Linux equivalents and every other installer:
https://infisical.com/docs/cli/overview

Then:

```powershell
pnpm secrets:login                # infisical login (opens the browser)
```

No browser available (WSL, Codespaces, SSH session):

```powershell
infisical login --interactive
```

## Step 4 - Link this clone

```powershell
pnpm secrets:link                 # infisical init
```

This writes `.infisical.json` (project id + default environment). It contains
no secret values and is safe to commit - commit it so every clone and every
agent links to the same project.

## Step 5 - Inject secrets at runtime

`package.json` already wraps the commands:

| Script | What it runs |
| --- | --- |
| `pnpm dev` | `infisical run --env=dev -- cross-env NODE_ENV=development SECRETS_SOURCE=infisical tsx watch server/_core/index.ts` |
| `pnpm dev:local` | the old command, straight from disk (offline fallback) |
| `pnpm start:infisical` | production bundle against `--env=prod` |
| `pnpm secrets:check` | credential report for the current mode |
| `pnpm secrets:check:infisical` | same report while running under `infisical run` |

**Loader contract (important).** `server/_core/secrets-source.ts` decides who
owns the environment:

- `SECRETS_SOURCE=infisical` (set by the wrapped scripts) or a present
  `INFISICAL_PROJECT_ID`: injected values win. `.env.local` / `.env` may only
  fill keys Infisical does not provide. This is what stops a stale local file
  from silently beating the central store.
- Neither set: legacy disk behavior, unchanged (`.env.local` overrides `.env`).

No application code changed: the app still reads `process.env` as before.
Two consequences worth knowing:

1. The boot log now states its source, e.g.
   `[env] secrets source: Infisical (project injected via infisical run) - 4 key(s) still filled from disk: ...`.
   That line is the migration to-do list.
2. Saving a credential in the in-app Settings vault under Infisical applies it
   to the running process only and warns instead of writing `.env.local`
   again (`persistSecretToEnvFile`). Persist it in the Infisical dashboard.

## Step 6 - CI/CD and production (scheduled, not done yet)

Do not use interactive login outside this laptop.

1. Create a machine identity, scoped to the `AgentLab OS` project and the
   environments it needs: https://infisical.com/docs/documentation/platform/identities/machine-identities
2. Give it Universal Auth: https://infisical.com/docs/documentation/platform/identities/universal-auth
3. Kubernetes is not in play; for Cloud Run prefer the native GCP identity
   instead of a static client secret where possible:
   `infisical login --method=gcp-id-token --machine-identity-id=<id>`. This is
   also the cleanest answer to the org policy that blocks service-account key
   creation (`iam.disableServiceAccountKeyCreation`).
4. Where a client secret is unavoidable, keep it in the platform's own secret
   store (GitHub Actions secret / GCP Secret Manager), never in the repo.
5. Add the CLI to the production image or sync Infisical to GCP Secret Manager
   and let Cloud Run mount the values; either way the app keeps reading
   `process.env`. Pin the CLI version in a production image.
6. Related findings to fold into that scheduled change (observed, not yet fixed):
   `.github/workflows/deploy.yml` authenticates with `secrets.GCP_SA_KEY`
   (a service-account key - the thing the org policy is moving away from);
   `autonoma.yml` holds `AUTONOMA_AL_SHARED_SECRET` as a GitHub secret; the
   Docker build declares `VITE_*` build args but `deploy.yml` passes none, so
   build-time frontend values need an explicit decision when this is wired.

## Step 7 - Verify

```powershell
pnpm secrets:check:infisical      # expects: source = infisical, required keys PASS
```

The report prints key names, presence and **length** only - never a value.
Then prove the disk file is no longer needed:

```powershell
Rename-Item .env .env.backup
pnpm dev                          # app must start and boot its DB schema
```

Strict version (the real finish line): rename `.env.local` too and start again.
If something breaks, the boot log line and `pnpm secrets:check:infisical` name
the keys that are still missing from Infisical - upload those, then repeat.
When the "still filled from disk" list is empty, the laptop copy is dead weight.

`.env.backup` and `.env.local.backup` are already git-ignored by the `.env.*`
rule; keep them until the Infisical path has run clean for a few days, then
delete them.

## Step 8 - Cleanup and leak control

- `.gitignore` already ignores `.env`, `.env.*` (with `!.env.example`), and
  `secrets/`. Verified with history: no `.env`, `.env.local`, or `secrets/`
  file was ever committed in this repo.
- One real leak did happen earlier: `test-db.mjs` (tracked) contained a Neon
  password. It was deleted, but history keeps it - **rotate that Neon
  password** if that has not happened yet (`CC-2026-09-24-007`).
- Scan for leftovers: https://infisical.com/docs/cli/scanning-overview
  (`infisical scan`, run from the repo root).
- Never commit, echo, or paste a real value into a doc, script, or chat.

## Troubleshooting

**`Command "dev" not found` / [ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL]** — the
prompt was in `C:\Users\RobertM` (home directory), not the repo, so pnpm found
some OTHER workspace above the home folder and looked for the script there.
Nothing in our repo ran and nothing was modified. Fix: `cd` into the repo
first:

```powershell
cd "E:\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\AgentLab"
```

Rule of thumb: every command in this runbook is run FROM the repo root. If the
prompt does not end in `...AgentLab>`, stop and navigate first.

**`infisical` is not recognized** — the CLI install finished but PATH was not
refreshed; open a NEW terminal and retry. If winget was skipped, install the
CLI (Step 3).

**`pnpm dev` exits without printing the `[env] secrets source` line** — the
Infisical CLI ran but could not fetch secrets (login expired, project not
linked, or network down). Read the CLI error above the line; the app only
starts after Infisical answers. For offline work use `pnpm dev:local`
deliberately.

**Booted but an integration is disconnected** — run
`pnpm secrets:check:infisical`: any key it lists as still supplied by disk is
missing from the Infisical Development environment. Add it in the dashboard,
then restart (`infisical run` injects at process start only).

## Offline and outage behavior (deliberate design choice)

`infisical run` fetches secrets at process start, so it needs network and a
live session. This business runs on a connection that can be cut (unpaid bill,
carrier problem). That is why `pnpm dev:local` exists: it is the documented
escape hatch, not a hidden one. Choose it knowingly - disk mode means the
credentials on this laptop are in play again, so prefer short outages only.

## Rollback

1. `pnpm dev` -> `pnpm dev:local` in muscle memory (or revert the `dev` script
   line in `package.json`).
2. Delete `.infisical.json`, restore `.env` / `.env.local` from the `.backup`
   copies.
3. Revert `server/_core/env.ts` to its previous inline dotenv loading and delete
   `server/_core/secrets-source.ts`, `server/_core/secrets-source.test.ts`, and
   `scripts/verify-secrets-source.mjs`.
4. Record the rollback in the change-control register.

## Open actions for Robert

- [ ] Create the Infisical account + `AgentLab OS` project, import `.env.local`
      into Development.
- [ ] `winget install infisical`, then `pnpm secrets:login`, then
      `pnpm secrets:link`.
- [ ] Store the Gemini credential (`GOOGLE_GENERATIVE_AI_API_KEY` or
      `GOOGLE_SERVICE_ACCOUNT_JSON`) in the dashboard - then nobody has to
      hand-edit a local file to unblock the AI paths
      (`CC-2026-09-25-001`/`-002`/`-004`).
- [ ] Run `pnpm secrets:check:infisical`, work the "still filled from disk"
      list down to empty.
- [ ] Rotate the Neon password exposed by the deleted `test-db.mjs`.
- [ ] Schedule the CI/CD + Cloud Run machine-identity change.
