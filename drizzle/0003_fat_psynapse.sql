CREATE TABLE "playbook_handoffs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"playbook_id" varchar(96) NOT NULL,
	"sequence" integer NOT NULL,
	"from_workflow_code" varchar(64) NOT NULL,
	"to_workflow_code" varchar(64) NOT NULL,
	"from_department_code" varchar(32) NOT NULL,
	"to_department_code" varchar(32) NOT NULL,
	"trigger_signal" text NOT NULL,
	"required_payload" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"receiving_owner" varchar(128) NOT NULL,
	"approval_required" boolean DEFAULT false NOT NULL,
	"fallback_protocol" text NOT NULL,
	"stop_condition" text NOT NULL,
	"evidence_required" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "playbooks" (
	"id" varchar(96) PRIMARY KEY NOT NULL,
	"name" varchar(160) NOT NULL,
	"description" text NOT NULL,
	"status" varchar(32) DEFAULT 'draft' NOT NULL,
	"owner_department_code" varchar(32) NOT NULL,
	"source_document" varchar(255),
	"primary_owner" varchar(128) NOT NULL,
	"approval_owner" varchar(128) NOT NULL,
	"trigger" text NOT NULL,
	"completion_criteria" text NOT NULL,
	"stop_conditions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"required_inputs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"expected_outputs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"evidence_requirements" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_artifacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"workflow_run_id" uuid NOT NULL,
	"workflow_run_step_id" uuid,
	"workflow_id" uuid,
	"artifact_type" varchar(64) DEFAULT 'document' NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"summary" text,
	"status" varchar(32) DEFAULT 'draft' NOT NULL,
	"scheduled_for" timestamp with time zone,
	"target_platform" varchar(64) DEFAULT 'linkedin',
	"quality_score" integer DEFAULT 90,
	"quality_grade" varchar(10) DEFAULT 'A',
	"verification_notes" jsonb DEFAULT '{"feedback":["Initial generation verified."],"suggestions":[],"passed":true,"rubric":{"brandAlignment":95,"actionableCta":90,"factualIntegrity":95,"formatting":90}}'::jsonb,
	"revision_version" integer DEFAULT 1 NOT NULL,
	"parent_artifact_id" uuid,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "playbook_handoffs" ADD CONSTRAINT "playbook_handoffs_playbook_id_playbooks_id_fk" FOREIGN KEY ("playbook_id") REFERENCES "public"."playbooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_artifacts" ADD CONSTRAINT "workflow_artifacts_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_artifacts" ADD CONSTRAINT "workflow_artifacts_workflow_run_id_workflow_runs_id_fk" FOREIGN KEY ("workflow_run_id") REFERENCES "public"."workflow_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_artifacts" ADD CONSTRAINT "workflow_artifacts_workflow_run_step_id_workflow_run_steps_id_fk" FOREIGN KEY ("workflow_run_step_id") REFERENCES "public"."workflow_run_steps"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_artifacts" ADD CONSTRAINT "workflow_artifacts_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_playbook_handoff_sequence" ON "playbook_handoffs" USING btree ("playbook_id","sequence");--> statement-breakpoint
CREATE INDEX "idx_playbook_handoffs_playbook" ON "playbook_handoffs" USING btree ("playbook_id");--> statement-breakpoint
CREATE INDEX "idx_playbook_handoffs_from" ON "playbook_handoffs" USING btree ("from_workflow_code");--> statement-breakpoint
CREATE INDEX "idx_playbook_handoffs_to" ON "playbook_handoffs" USING btree ("to_workflow_code");--> statement-breakpoint
CREATE INDEX "idx_playbooks_owner_department" ON "playbooks" USING btree ("owner_department_code");--> statement-breakpoint
CREATE INDEX "idx_playbooks_status" ON "playbooks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_workflow_artifacts_workspace" ON "workflow_artifacts" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_workflow_artifacts_run" ON "workflow_artifacts" USING btree ("workflow_run_id");--> statement-breakpoint
CREATE INDEX "idx_workflow_artifacts_type" ON "workflow_artifacts" USING btree ("workspace_id","artifact_type");--> statement-breakpoint
CREATE INDEX "idx_workflow_artifacts_status" ON "workflow_artifacts" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE INDEX "idx_workflow_artifacts_scheduled" ON "workflow_artifacts" USING btree ("workspace_id","scheduled_for");