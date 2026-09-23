-- CC-2026-09-23-018: human-gated action dispatches (conversion plan Tier 2).
-- Lifecycle: agent drafts -> awaiting_approval -> human approves/rejects ->
-- SAIF check -> real dispatch via connector -> recorded external result.

CREATE TABLE IF NOT EXISTS "action_dispatches" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "workflow_run_id" uuid REFERENCES "workflow_runs"("id") ON DELETE SET NULL,
  "workflow_run_step_id" uuid REFERENCES "workflow_run_steps"("id") ON DELETE SET NULL,
  "workflow_step_id" uuid REFERENCES "workflow_steps"("id") ON DELETE SET NULL,
  "connector" varchar(64) NOT NULL,
  "status" varchar(32) NOT NULL DEFAULT 'awaiting_approval',
  "title" varchar(255) NOT NULL,
  "payload" jsonb NOT NULL,
  "saif_passed" boolean,
  "saif_reason" text,
  "approved_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "approved_at" timestamp with time zone,
  "rejected_reason" text,
  "dispatched_at" timestamp with time zone,
  "external_id" varchar(128),
  "external_url" varchar(512),
  "dispatch_error" text,
  "run_outcome" varchar(32),
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_action_dispatches_workspace" ON "action_dispatches" ("workspace_id");
CREATE INDEX IF NOT EXISTS "idx_action_dispatches_status" ON "action_dispatches" ("status");
CREATE INDEX IF NOT EXISTS "idx_action_dispatches_run" ON "action_dispatches" ("workflow_run_id");
