---
document_id: DOC-CLOUD-RUN-POLLER-DESIGN
title: "Design: Background Execution Poller on Cloud Run"
document_type: design_doc
authority_level: operational
status: proposal
owner: "Robert T. McCarthy / OPS"
created: 2026-09-30
version: "1.0.0"
---

# Design: Background Execution Poller on Cloud Run

## Problem

Pending workflow runs never execute in the background in production. The deployed
container runs `server/_core/index.ts`, which registers only the daily 5AM CT
ecosystem scheduler — **no queue poller**. The 5-second `setInterval` poller lives
in `server/index.ts`, which is not what ships. Boot logs show
`Server running on http://0.0.0.0:8080/` and the Scheduler line but never
`Background poller started`.

Consequence: a run only executes when an *authenticated request path* happens to
call `processPendingRuns()` inline:

| Lane | Trigger | Evidence |
|---|---|---|
| UI run trigger | `POST /api/workflows/:id/run` | sweeps ALL pending runs (2026-09-30 `buffy_sweep` vehicle) |
| Run approve/reject | `/api/runs/:id/approve` etc. | resumes only that run |
| Ops Agent execute | orchestrator-execute controller | same inline sweep |
| Local script | `scripts/execute-pending-runs.ts` | what we used all session; blocked by local pnpm repair |

Between manual triggers, runs sit `pending` indefinitely (bf87810f waited ~26 h
across two credential failures).

## Why the obvious fixes are wrong here

| Option | Rejection reason |
|---|---|
| Enable `setInterval` in the deployed entrypoint | Cloud Run terminates CPU when no request is in flight → timer starves; with multiple instances each runs its own poller → duplicate execution; instance recycling kills the timer silently. |
| `min-instances=1` + in-service poller | Pays for a always-on instance (~$10–15/mo) and *still* has no at-most-once guarantee across instances or deploys. The correctness problem is unsolved; only the starvation problem is. |
| HTTP endpoint + Cloud Scheduler calling `processPendingRuns()` directly | Service request timeout caps at 60 min; observed runs chain multiple 2–7 min steps (Founder RoundTable run exceeded 50 min total). A mid-step timeout kills the request, leaves the run `running`, and the retry re-executes steps → duplicates. |
| Cloud Tasks task per run at creation | Requires touching every run-creation path, still needs the same lease guard for retries, and misses pre-existing pending rows. More moving parts for the same correctness work. |

## Two code facts any design must respect (observed 2026-09-30)

1. **`processPendingRuns()` has no claim guard.** It selects `status = 'pending'`
   and executes. Two concurrent invocations double-execute steps (duplicate LLM
   drafts, duplicate HubSpot upserts). Today it is accidentally safe only because
   at most one lane runs at a time. A background poller makes concurrency the
   normal case → the lease below is a *prerequisite*, not an optimization.
2. **Steps are long.** Per-step policy timeout is 120 s but a run chains steps
   sequentially; observed full runs run 7–52 min. Any per-invocation time cap
   under that must hand the run to the next invocation *cleanly* (which the
   current "skip completed steps" resume logic already supports — that part is
   good and stays).

## Recommended design: Cloud Run Job + Cloud Scheduler + DB lease

Three pieces, each minimal:

### 1. DB lease (schema + processor change) — the correctness foundation

Add to `workflow_runs`:

```sql
locked_at   timestamptz,
locked_by   text,
-- index
create index workflow_runs_claim_idx on workflow_runs (status, locked_at);
```

(Drizzle schema change + migration; `ensureDatabaseSchema` backfill is fine for
the columns — existing rows get `NULL` = unclaimed.)

Claim atomically at the top of `processPendingRuns()` — the canonical Postgres
queue pattern:

```sql
WITH claimed AS (
  UPDATE workflow_runs
  SET status = 'running', locked_at = now(), locked_by = $WORKER_ID, updated_at = now()
  WHERE id IN (
    SELECT id FROM workflow_runs
    WHERE status = 'pending'
      AND (locked_at IS NULL OR locked_at < now() - interval '10 minutes')
    ORDER BY created_at
    FOR UPDATE SKIP LOCKED
    LIMIT 20
  )
  RETURNING *
)
SELECT * FROM claimed ORDER BY created_at;
```

`FOR UPDATE SKIP LOCKED` guarantees two concurrent pollers never claim the same
run — correctness no longer depends on there being only one poller.

**Heartbeat:** the processor already loops steps; bump `locked_at = now()` once
per step start. TTL 10 min then means "worker died mid-step," not "run is long."
Longest observed run (52 min) stays safe.

**Crash recovery:** a run `running` with `locked_at` older than the TTL is
re-queued (`status = 'pending'`, lease cleared, `errorMessage` annotated
`lease expired — requeued`) at the start of each poller tick. Resumed execution
skips completed steps, so the requeue is exactly the existing resume semantics.

### 2. Poller Job (`agentlab-poller`)

A Cloud Run **Job** — same container image as the service (no new build), a
different entry command, and it runs to completion outside any request:

- Task count 1, parallelism 1, max retries 1, task timeout 55 min
  (under the 24 h Job ceiling; the 1-minute kick makes long tasks moot anyway).
- Command: `node` with args pointing at a small new `scripts/poll-tick.mjs`
  (plain JS, no tsx dependency question in-image) that:
  1. re-queues lease-expired runs (recovery pass),
  2. loops the claim query → `processPendingRuns()` per claimed run,
  3. exits when no claimable runs remain (typically seconds; the Scheduler
     re-kicks next minute), hard exit at a 50 min budget.
- Env: same set as the service minus `PORT` — **`DATABASE_URL`,
  `GOOGLE_GENERATIVE_AI_API_KEY`, `GOOGLE_AI_ADC_DISABLED=1`,
  `GOOGLE_SERVICE_ACCOUNT_FILE=/nonexistent/…`, HubSpot keys**. The Job executes
  the same agent steps as inline execution, so it needs the full credential set.
  Keep service and Job env in sync (rotation runbook covers both).

Concurrency is safe by construction (claim query), so an occasional overlapping
execution is harmless — but add a cheap guard in the kick path anyway to save
quota.

### 3. Kick path: Cloud Scheduler → service endpoint → Job Run API

Cloud Scheduler cannot target a Job directly; it targets HTTP. Use the service
as the thin trigger:

- New authenticated endpoint in `server/_core/index.ts`:
  `POST /api/internal/poller-kick`.
  - Auth: service stays IAM-gated for this route via the Scheduler's OIDC token
    (grant the Scheduler's service account `roles/run.invoker`); the handler
    also verifies the audience. No new secrets.
  - Handler: one GET to the Run API
    (`https://run.googleapis.com/v2/projects/PROJECT/locations/us-central1/jobs/agentlab-poller:run`)
    with the service's own access token (metadata server; grant the runtime SA
    `roles/run.jobs.runToRun` on the Job). Fire-and-forget: respond `202` before
    the execution finishes.
  - Optional quota guard: list executions; if one is `ACTIVE`, skip and `202`.
- Cloud Scheduler job: every 1 minute (Scheduler's floor), HTTP target, OIDC.

### Latency, cost, and what 5 seconds buys

- Scheduler floor is 1 minute, so worst-case dispatch latency is
  ~60 s (kick) + ~20–40 s (Job cold start) ≈ **runs start within ~2 min of
  creation, with zero manual action**. That is the honest cadence this platform
  gives without paying for always-on compute; "5 seconds" was an artifact of the
  dev-server poller, not a requirement — the OS needs *reliable*, not *instant*.
- Cost: Scheduler ~free tier; Job bills only while executing (seconds per tick at
  current volume — pennies/month). No min-instances anywhere. Kicks hit the
  service once a minute; with `min-instances=0` each kick may cold-start an
  instance (~2 s, only delays the kick, not the job).

### Rollout order

1. Migration + lease + heartbeat + recovery in `queue-processor.ts` (all lanes
   benefit: inline sweeps become safe under overlap too). Suite + typecheck.
2. `scripts/poll-tick.mjs`; local sanity: run it against dev DB with one seeded
   pending run.
3. Deploy service revision (no behavior change yet) → create the Job (same
   image, poll command) → grant `roles/run.jobs.runToRun` → wire endpoint +
   Scheduler → disable-then-enable the Scheduler job in CI as the kill switch.
4. Verify: insert a pending run directly (SQL), wait ≤ 2 min, confirm
   `running → completed/paused` with the Job's `locked_by` stamped, and audit
   log rows present. Then re-run the bf87810f-style manual sweep once as a
   regression check of the UI lane.
5. Rollback = pause the Scheduler job (one `gcloud` command); service unaffected.

### Success criterion

A pending run created by *any* path (seed, UI, webhook) executes to its next
parking point (completed / paused_for_approval / failed) within ~2 minutes with
no human action — verified by the Job's execution logs showing the claim line
`claimed N runs (worker <id>)`.

### Explicitly deferred

- Moving the Gemini/HubSpot credentials from env vars into Secret Manager with
  `--update-secrets` (nice hardening; do it during the key rotation, optional).
- Retrying failed steps automatically (policy question for Robert, not plumbing).
- The Dispatch Decisions workspace-visibility fix (separate product gap,
  2026-09-30 register entry).
