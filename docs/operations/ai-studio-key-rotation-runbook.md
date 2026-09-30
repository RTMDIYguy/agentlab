---
document_id: DOC-AI-STUDIO-KEY-ROTATION-RUNBOOK
title: "Runbook: Rotate Google AI Studio Key + Update Cloud Run Safely"
document_type: runbook
authority_level: operational
status: active
owner: "Robert T. McCarthy / OPS"
created: 2026-09-30
applies_to: >
  GOOGLE_GENERATIVE_AI_API_KEY on Cloud Run service `agentlab`
  (project `project-36330a6c-5e91-4901-9dd`, number 718497644379,
  region us-central1, URL https://agentlab-718497644379.us-central1.run.app)
version: "1.0.0"
---

# Runbook: Rotate the Gemini API Key Without Downtime

**Why rotate now:** the current key (`…bHtg`) crossed three untrusted channels —
this chat, a Cloud Run command line, and a local `.env`-adjacent session. Treat
it as exposed. Expected cadence after this first rotation: every 90 days, or
immediately on any suspected leak.

> **First rotation completed 2026-09-30** (revision `agentlab-00184-qcg`, new
> key suffix `…-hQVw`). Field learnings folded into the steps below: run gcloud
> from the LOCAL machine (already installed + authed — no Cloud Shell needed),
> never set `/...` path env vars from Git Bash (MSYS path mangling), inventory
> EVERY key location (three distinct stale keys were found in circulation:
> `…oLgQ`, `…dQ_`, `…bHtg`), and `/api/dashboard/llm-ping` is the Forge leg
> (its error message names OPENAI_API_KEY but the check is `FORGE_API_KEY`) —
> real proof is a small workflow run completing its agent step.

**The one rule:** the old key stays *valid but condemned* until the new key is
verified in production. Only then is it deleted. That ordering is the entire
safety net — it makes the operation reversible with one command at every step.

Commands run from a terminal authenticated as Robert. The local machine
already has gcloud (SDK 586+) signed in as `agentlab.tech@gmail.com` — **no
Cloud Shell or Cloud Run console terminal is needed** (Cloud Run has no
terminal; the console's `>_` Cloud Shell is only a fallback). In Git Bash,
NEVER pass `/...` path values to `gcloud` env vars: MSYS rewrites them
(`GOOGLE_SERVICE_ACCOUNT_FILE=/nonexistent/…` landed as
`C:/Program Files/Git/nonexistent/…` on 2026-09-29). `MSYS_NO_PATHCONV=1`
breaks the gcloud launcher itself — the reliable lane is PowerShell:
`powershell -NoProfile -Command "gcloud run services update …"`. Never echo a
key value into the terminal history or the register; variables only.

## 0. Pre-flight (2 min)

```bash
PROJECT_ID=project-36330a6c-5e91-4901-9dd
REGION=us-central1
SERVICE=agentlab

gcloud config set project "$PROJECT_ID"
gcloud run services describe "$SERVICE" --region "$REGION" \
  --format="value(status.latestReadyRevisionName,status.traffic[0].percent)"
```

Expect a Ready revision at `100`. If the service isn't Ready,
stop and fix that first — never rotate onto a broken baseline.

Also inventory EVERY location the old key lives before issuing the new one —
missed locations are how three stale keys ended up in circulation:
Cloud Run service env (`gcloud run services describe … --format=json` and
grep the env block), local `.env` / `.env.local`, the operator Keys folder,
and (once implemented) the poller Job env.

## 1. Issue the new key (manual, ~2 min)

1. https://aistudio.google.com → signed in as Robert → **Get API key**.
2. **Create API key in the existing project** (`My First Project` /
   `718497644379`) — do NOT let AI Studio scaffold a fresh project; the Tier-1
   Prepay billing linkage lives on this one ($9.82 credit, all keys Tier 1).
3. Copy the new key (`AQ.` prefix, ~53 chars). Note its last 4 chars in your
   working notes only — that suffix is what the register records.

Verify the new key directly before it touches anything (must return HTTP 200):

```bash
NEW_KEY="<paste>"   # variable only; never echo
curl -s -o /dev/null -w "%{http_code}\n" \
  -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent" \
  -H "x-goog-api-key: $NEW_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"reply with the single word pong"}]}]}'
```

## 2. Land the new key on Cloud Run (~2 min)

`--update-env-vars` touches ONLY the listed vars; everything else
(`GOOGLE_AI_ADC_DISABLED`, the SA sentinel, HubSpot keys, `DATABASE_URL`) is
preserved. This is the same command shape used on 2026-09-29 (revision 00181).

```bash
gcloud run services update "$SERVICE" --region "$REGION" \
  --update-env-vars="GOOGLE_GENERATIVE_AI_API_KEY=$NEW_KEY"
```

This creates a new revision (e.g. `agentlab-00182-…`) and shifts traffic 100%.
Watch it go Ready before proceeding:

```bash
gcloud run services describe "$SERVICE" --region "$REGION" \
  --format="value(status.latestReadyRevisionName,status.traffic[0].percent)"
```

**Historical trap (cookie@2):** revisions 00176–00178 crashed on boot after a
dependency change. A new revision can go non-Ready even when the env change is
innocent. If `latestReadyRevisionName` stalls or traffic is not 100:

```bash
gcloud run revisions list --service "$SERVICE" --region "$REGION" --limit 3
gcloud logging read 'resource.type=cloud_run_revision AND severity>=ERROR' \
  --limit 20 --format="value(textPayload)"   # boot logs
```

Rollback here is trivial because the old key still exists:
`gcloud run services update "$SERVICE" --region "$REGION" --update-env-vars="GOOGLE_GENERATIVE_AI_API_KEY=$OLD_KEY"`.

## 3. Verify in production (~2 min)

Three independent signals — env plumbing alone proves nothing:

1. **Smoke HTTP 200** (the service boots and serves):
   ```bash
   curl -s -o /dev/null -w "%{http_code}\n" https://agentlab-718497644379.us-central1.run.app/
   ```
2. **Gemini integration tile**: OS dashboard → "Google Gemini 2.5 LLM Engine"
   shows **CONNECTED** (proven live indicator on 2026-09-30).
3. **A real generation**: trigger any small workflow run in the UI and confirm
   its agent step completes with a model-named audit row (or run the sweep lane
   on any pending run). No step-level `LLM_RETRIES_EXHAUSTED` / 401 in the
   inspector.

Known trap, do not use: `GET /api/dashboard/llm-ping` goes through
`invokeLLM` — the **Forge leg** (`FORGE_API_KEY` → forge.manus.im), not Gemini
(and not OpenAI either, despite the error text naming `OPENAI_API_KEY`). The
dashboard Gemini tile is presence-based, not a live call, and
Settings → Test Integration has no Gemini branch. The only true end-to-end
proof on this app today: trigger a small workflow (e.g. "Vision purpose (2)",
4 steps, no dispatch left behind) and confirm its agent step completes
quickly with no `LLM_RETRIES_EXHAUSTED`/401 — a real server-side Gemini
generation.

## 4. Sync the other key holders (~3 min)

The key lives in more places than Cloud Run. Update each, then re-verify each:

- **Local `.env.local`** (gitignored — confirmed): replace the
  `GOOGLE_GENERATIVE_AI_API_KEY=` line. This feeds local `pnpm dev` and every
  `scripts/*.ts` lane (dispatch-approved-action, execute-pending-runs).
- **Poller Job (once the 2026-09-30 poller design is implemented):**
  ```bash
  gcloud run jobs update agentlab-poller --region "$REGION" \
    --update-env-vars="GOOGLE_GENERATIVE_AI_API_KEY=$NEW_KEY"
  ```
  Service and Job must never drift — a stale Job key reintroduces exactly the
  failure class this rotation is closing.
- **Optional hardening, same sitting:** move the key to Secret Manager and
  reference via `--update-secrets`, eliminating plaintext in env-var
  descriptions and future command lines entirely. (Design-doc deferred item;
  pairs naturally with rotation.)

## 5. Kill the old key (only after step 3 is green)

1. AI Studio → API keys → locate the `…bHtg` key → **Delete**.
   (Lesson from the `…oLgQ` incident: if a key is NOT in the list, it is already
   dead — don't hunt for a delete that already happened.)
2. Confirm the condemned key now 401s:
   ```bash
   OLD_KEY="<paste>"
   curl -s -o /dev/null -w "%{http_code}\n" \
     -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent" \
     -H "x-goog-api-key: $OLD_KEY" -H "Content-Type: application/json" -d '{}'
   ```
   Expect `400`/`403`/`404` — anything but `200`.
3. Clear shell history of key values: `history -c` (Git Bash) or close the
   terminal. The full key should now exist in exactly two places: AI Studio and
   Cloud Run's env (Secret Manager if step 4's hardening was done).

## 6. Record it

One register line (no key values, suffix only):

> `CC-YYYY-MM-DD — Rotated GOOGLE_GENERATIVE_AI_API_KEY on agentlab (revision
> …) to key suffix …XXXX; old key …bHtg deleted after production verification
> (smoke 200, Gemini tile CONNECTED, live step executed). Key previously
> traversed chat/CLI/local env — treated as exposed per 2026-09-30 entry.`

Run `node scripts/verify-change-control.mjs` after.

## Failure modes at a glance

| Symptom | Cause | Fix |
|---|---|---|
| New revision never Ready | Boot crash (dep drift), not the key | Check boot logs; revert env to old key; fix deps separately |
| Tile still shows disconnected | Vault sync ran before env change? No — sync runs at boot; new revision rebooted with the new key | Hard-refresh dashboard; if still stale, check `workspace_secrets.google_ai` row status |
| Steps fail with 401 after update | Job or local `.env.local` still on old key | Step 4 syncs both |
| `AQ.` key fails as `Authorization: Bearer` | Wrong header, not a bad key | Use `x-goog-api-key` (settled 2026-09-29) |
| Model errors naming `gemini-2.5-pro` | Old model retired for new users | Not a key issue — model chain lives in `agent-runner.ts` |
