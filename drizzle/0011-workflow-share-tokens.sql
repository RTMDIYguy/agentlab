-- Migration 0011: workflow_share_tokens — client-facing read-only run consoles
-- (conversion plan Tier 1 item 3). Tokens stored hashed; revocation is a
-- timestamp so the audit trail survives.

CREATE TABLE IF NOT EXISTS "workflow_share_tokens" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "token_hash" varchar(64) NOT NULL,
  "label" varchar(128),
  "scope" varchar(16) NOT NULL DEFAULT 'all',
  "run_id" uuid,
  "created_by_email" varchar(255),
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "last_accessed_at" timestamp with time zone,
  "revoked_at" timestamp with time zone
);

CREATE UNIQUE INDEX IF NOT EXISTS "uq_share_token_hash" ON "workflow_share_tokens" ("token_hash");
CREATE INDEX IF NOT EXISTS "idx_share_tokens_workspace" ON "workflow_share_tokens" ("workspace_id");
