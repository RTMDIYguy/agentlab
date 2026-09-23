-- CC-2026-09-23-021: Tier 1 runner hardening.
-- Per-step execution policy on workflow_steps + cooperative cancellation on
-- workflow_runs.

ALTER TABLE "workflow_steps" ADD COLUMN IF NOT EXISTS "timeout_seconds" integer;
ALTER TABLE "workflow_steps" ADD COLUMN IF NOT EXISTS "max_retries" integer;

ALTER TABLE "workflow_runs" ADD COLUMN IF NOT EXISTS "cancel_requested" boolean NOT NULL DEFAULT false;
ALTER TABLE "workflow_runs" ADD COLUMN IF NOT EXISTS "cancelled_at" timestamp with time zone;
