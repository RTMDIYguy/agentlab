-- Idempotent migration: teardown_sessions for the Async Screen & Video
-- Teardown Studio — recordings + notes + AI briefs persist server-side so
-- sessions survive a browser refresh. Every statement is safe to run
-- against an existing database.
CREATE TABLE IF NOT EXISTS "teardown_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"title" varchar(128) NOT NULL,
	"duration_seconds" integer DEFAULT 0 NOT NULL,
	"size_bytes" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"ai_brief" text,
	"ai_brief_model" varchar(64),
	"video_data" bytea,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "teardown_sessions" ADD CONSTRAINT "teardown_sessions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_teardown_sessions_workspace" ON "teardown_sessions" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_teardown_sessions_created" ON "teardown_sessions" USING btree ("workspace_id", "created_at");
