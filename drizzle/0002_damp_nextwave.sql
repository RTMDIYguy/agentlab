CREATE TABLE "workspace_integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"type" varchar(64) NOT NULL,
	"name" varchar(128) NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" varchar(32) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspace_secrets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"provider" varchar(64) NOT NULL,
	"gsm_secret_id" varchar(255) NOT NULL,
	"version" varchar(64) DEFAULT '1' NOT NULL,
	"masked_preview" varchar(64),
	"status" varchar(32) DEFAULT 'connected' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workspaces" ALTER COLUMN "trial_ends_at" SET DEFAULT now() + interval '30 days';--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "cron_expression" varchar(64);--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "next_run_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "orchestrator_name" varchar(128) DEFAULT 'Orchestrator' NOT NULL;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "orchestrator_system_prompt" text DEFAULT 'You are the central Ops Agent.' NOT NULL;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "default_model" varchar(64) DEFAULT 'gemini-1.5-pro' NOT NULL;--> statement-breakpoint
ALTER TABLE "workspace_integrations" ADD CONSTRAINT "workspace_integrations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_secrets" ADD CONSTRAINT "workspace_secrets_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_workspace_integrations_workspace" ON "workspace_integrations" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_workspace_secret_provider" ON "workspace_secrets" USING btree ("workspace_id","provider");--> statement-breakpoint
CREATE INDEX "idx_workspace_secrets_workspace" ON "workspace_secrets" USING btree ("workspace_id");