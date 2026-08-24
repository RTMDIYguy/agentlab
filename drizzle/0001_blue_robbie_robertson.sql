ALTER TABLE "audit_logs" ADD COLUMN "billed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "workspace_packages" ADD COLUMN "daily_run_limit" integer;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "stripe_customer_id" varchar(128);--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "trial_ends_at" timestamp with time zone DEFAULT now() + interval '14 days';