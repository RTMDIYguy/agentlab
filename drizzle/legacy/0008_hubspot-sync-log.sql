-- CC-2026-09-23-017: Agent Lab OS → HubSpot lead handoff.
-- Durable outcome ledger for every lead-sync attempt (see
-- server/hubspot/schema-map.ts and the blueprint archived in Prospect Docs).

CREATE TABLE IF NOT EXISTS "hubspot_sync_log" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "submission_id" uuid REFERENCES "contact_submissions"("id") ON DELETE SET NULL,
  "email" varchar(255) NOT NULL,
  "outcome" varchar(32) NOT NULL,
  "hubspot_contact_id" varchar(64),
  "http_status" integer,
  "error_message" text,
  "properties_payload" text,
  "retry_of" uuid,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_hubspot_sync_log_email" ON "hubspot_sync_log" ("email");
CREATE INDEX IF NOT EXISTS "idx_hubspot_sync_log_submission" ON "hubspot_sync_log" ("submission_id");
CREATE INDEX IF NOT EXISTS "idx_hubspot_sync_log_created" ON "hubspot_sync_log" ("created_at");
