-- CC-2026-09-25-009: complete the audit_logs half of the runner-hardening
-- column pair. f33439d8 added cancelRequested/cancelledAt to schema.ts on both
-- workflow_runs and audit_logs, but 0010-runner-hardening.sql only shipped the
-- workflow_runs DDL. The live dev database's drizzle journal had stopped at
-- 0002 (dev relies on the ensureDatabaseSchema self-heal, which also missed
-- audit_logs), so every audit insert naming these columns failed with
-- SQLSTATE 42703 from 2026-09-23 onward. Mirrors the 0010 workflow_runs DDL.

ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "cancel_requested" boolean NOT NULL DEFAULT false;
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "cancelled_at" timestamp with time zone;
