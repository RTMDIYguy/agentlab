CREATE TABLE "agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" varchar(128) NOT NULL,
	"role" varchar(128) NOT NULL,
	"base_model" varchar(64) DEFAULT 'gemini-1.5-pro' NOT NULL,
	"system_prompt" text NOT NULL,
	"status" varchar(32) DEFAULT 'idle' NOT NULL,
	"tasks_completed" integer DEFAULT 0 NOT NULL,
	"uptime" varchar(32) DEFAULT '99.9%' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"workflow_id" uuid,
	"agent_id" uuid,
	"action_type" varchar(64) NOT NULL,
	"model" varchar(64) DEFAULT 'gemini-1.5-pro' NOT NULL,
	"payload_in" jsonb NOT NULL,
	"payload_out" jsonb,
	"tokens_prompt" integer DEFAULT 0 NOT NULL,
	"tokens_completion" integer DEFAULT 0 NOT NULL,
	"tokens_total" integer DEFAULT 0 NOT NULL,
	"cost" numeric(10, 6) DEFAULT '0.000000' NOT NULL,
	"latency_ms" integer DEFAULT 0 NOT NULL,
	"status" varchar(32) DEFAULT 'success' NOT NULL,
	"error_message" text,
	"policy_checks" jsonb DEFAULT '{"saifPassed":true,"piiDetected":0,"budgetThresholdPassed":true}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_packages" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"description" text NOT NULL,
	"department_code" varchar(32) NOT NULL,
	"monthly_price" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"stripe_product_id" varchar(128),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"open_id" varchar(64) NOT NULL,
	"workspace_id" uuid,
	"email" varchar(255) NOT NULL,
	"name" varchar(128) NOT NULL,
	"login_method" varchar(64),
	"role" varchar(32) DEFAULT 'operator' NOT NULL,
	"last_signed_in" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_open_id_unique" UNIQUE("open_id")
);
--> statement-breakpoint
CREATE TABLE "workflow_run_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"workflow_run_id" uuid NOT NULL,
	"workflow_step_id" uuid NOT NULL,
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"input_context" jsonb DEFAULT '{}'::jsonb,
	"output_payload" jsonb,
	"error_message" text,
	"cost" numeric(10, 6) DEFAULT '0.000000',
	"latency_ms" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"workflow_id" uuid NOT NULL,
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"trigger_source" varchar(64) DEFAULT 'manual' NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"error_message" text,
	"initial_context" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"workflow_id" uuid NOT NULL,
	"agent_id" uuid,
	"order_index" integer NOT NULL,
	"step_type" varchar(32) DEFAULT 'agent' NOT NULL,
	"title" varchar(128) NOT NULL,
	"action_prompt" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" varchar(128) NOT NULL,
	"description" text,
	"trigger_type" varchar(64) DEFAULT 'manual' NOT NULL,
	"status" varchar(32) DEFAULT 'draft' NOT NULL,
	"success_rate" numeric(5, 2) DEFAULT '100.00' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspace_packages" (
	"workspace_id" uuid NOT NULL,
	"package_id" varchar(64) NOT NULL,
	"status" varchar(32) DEFAULT 'active' NOT NULL,
	"stripe_subscription_id" varchar(128),
	"unlocked_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(128) NOT NULL,
	"slug" varchar(64) NOT NULL,
	"hard_monthly_budget" numeric(10, 2) DEFAULT '500.00' NOT NULL,
	"auto_pause_threshold_enabled" boolean DEFAULT true NOT NULL,
	"pii_redaction_enabled" boolean DEFAULT true NOT NULL,
	"saif_enforcement_enabled" boolean DEFAULT true NOT NULL,
	"audit_retention_days" integer DEFAULT 90 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workspaces_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_run_steps" ADD CONSTRAINT "workflow_run_steps_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_run_steps" ADD CONSTRAINT "workflow_run_steps_workflow_run_id_workflow_runs_id_fk" FOREIGN KEY ("workflow_run_id") REFERENCES "public"."workflow_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_run_steps" ADD CONSTRAINT "workflow_run_steps_workflow_step_id_workflow_steps_id_fk" FOREIGN KEY ("workflow_step_id") REFERENCES "public"."workflow_steps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_runs" ADD CONSTRAINT "workflow_runs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_runs" ADD CONSTRAINT "workflow_runs_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_steps" ADD CONSTRAINT "workflow_steps_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_steps" ADD CONSTRAINT "workflow_steps_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_steps" ADD CONSTRAINT "workflow_steps_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_packages" ADD CONSTRAINT "workspace_packages_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_packages" ADD CONSTRAINT "workspace_packages_package_id_knowledge_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."knowledge_packages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_workspace_agent_name" ON "agents" USING btree ("workspace_id","name");--> statement-breakpoint
CREATE INDEX "idx_agents_workspace" ON "agents" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_agents_status" ON "agents" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_workspace_created" ON "audit_logs" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_agent" ON "audit_logs" USING btree ("workspace_id","agent_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_workflow" ON "audit_logs" USING btree ("workspace_id","workflow_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_status" ON "audit_logs" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_workspace_user_email" ON "users" USING btree ("workspace_id","email");--> statement-breakpoint
CREATE INDEX "idx_users_workspace" ON "users" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_users_openid" ON "users" USING btree ("open_id");--> statement-breakpoint
CREATE INDEX "idx_workflow_run_steps_workspace" ON "workflow_run_steps" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_workflow_run_steps_run" ON "workflow_run_steps" USING btree ("workflow_run_id");--> statement-breakpoint
CREATE INDEX "idx_workflow_run_steps_status" ON "workflow_run_steps" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE INDEX "idx_workflow_runs_workspace" ON "workflow_runs" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_workflow_runs_workflow" ON "workflow_runs" USING btree ("workflow_id");--> statement-breakpoint
CREATE INDEX "idx_workflow_runs_status" ON "workflow_runs" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_workflow_order" ON "workflow_steps" USING btree ("workflow_id","order_index");--> statement-breakpoint
CREATE INDEX "idx_workflow_steps_workspace" ON "workflow_steps" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_workflow_steps_workflow" ON "workflow_steps" USING btree ("workflow_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_workspace_workflow_name" ON "workflows" USING btree ("workspace_id","name");--> statement-breakpoint
CREATE INDEX "idx_workflows_workspace" ON "workflows" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_workflows_status" ON "workflows" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_workspace_package" ON "workspace_packages" USING btree ("workspace_id","package_id");--> statement-breakpoint
CREATE INDEX "idx_workspaces_slug" ON "workspaces" USING btree ("slug");