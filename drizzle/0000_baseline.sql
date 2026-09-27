CREATE TABLE "action_dispatches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"workflow_run_id" uuid,
	"workflow_run_step_id" uuid,
	"workflow_step_id" uuid,
	"connector" varchar(64) NOT NULL,
	"status" varchar(32) DEFAULT 'awaiting_approval' NOT NULL,
	"title" varchar(255) NOT NULL,
	"payload" jsonb NOT NULL,
	"saif_passed" boolean,
	"saif_reason" text,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"rejected_reason" text,
	"dispatched_at" timestamp with time zone,
	"external_id" varchar(128),
	"external_url" varchar(512),
	"dispatch_error" text,
	"run_outcome" varchar(32),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" varchar(128) NOT NULL,
	"role" varchar(128) NOT NULL,
	"base_model" varchar(64) DEFAULT 'gemini-1.5-pro' NOT NULL,
	"system_prompt" text NOT NULL,
	"status" varchar(32) DEFAULT 'idle' NOT NULL,
	"tasks_completed" integer DEFAULT 0 NOT NULL,
	"uptime" varchar(32),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "articles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"owner_open_id" varchar(64) NOT NULL,
	"title" varchar(255) NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"slug" varchar(255) NOT NULL,
	"category" varchar(64) DEFAULT 'General' NOT NULL,
	"status" varchar(32) DEFAULT 'draft' NOT NULL,
	"scheduled_for" timestamp with time zone,
	"featured_image" text,
	"views" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid,
	"domain" varchar(64) NOT NULL,
	"depth" varchar(32) DEFAULT 'exploratory' NOT NULL,
	"text" text NOT NULL,
	"skill" varchar(128) NOT NULL,
	"evaluation" text NOT NULL,
	"signals" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_custom" boolean DEFAULT false NOT NULL,
	"source" varchar(64) DEFAULT 'system' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid,
	"client_name" varchar(128) DEFAULT 'Client' NOT NULL,
	"domain" varchar(64) DEFAULT 'All' NOT NULL,
	"call_notes" text NOT NULL,
	"detected_signals" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"findings" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"selected_question_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
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
	"cancel_requested" boolean DEFAULT false NOT NULL,
	"cancelled_at" timestamp with time zone,
	"billed" boolean DEFAULT false NOT NULL,
	"policy_checks" jsonb DEFAULT '{"saifPassed":true,"piiDetected":0,"budgetThresholdPassed":true}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"article_id" integer NOT NULL,
	"user_id" uuid,
	"parent_comment_id" uuid,
	"content" text NOT NULL,
	"status" varchar(32) DEFAULT 'visible' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(128),
	"email" varchar(255) NOT NULL,
	"company" varchar(128),
	"pain_point" text,
	"interest" varchar(128),
	"subject" varchar(255),
	"message" text,
	"source" varchar(128) DEFAULT 'website' NOT NULL,
	"status" varchar(32) DEFAULT 'new' NOT NULL,
	"crm_synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discount_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(64) NOT NULL,
	"campaign_name" varchar(128) NOT NULL,
	"discount_type" varchar(32) DEFAULT 'percent_off' NOT NULL,
	"discount_value" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"target_app" varchar(64) DEFAULT 'all' NOT NULL,
	"stripe_promo_id" varchar(128),
	"max_redemptions" integer,
	"times_redeemed" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "discount_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "discount_redemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"discount_code_id" uuid NOT NULL,
	"user_id" uuid,
	"user_email" varchar(255) NOT NULL,
	"target_app" varchar(64) NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"redeemed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hubspot_sync_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid,
	"email" varchar(255) NOT NULL,
	"outcome" varchar(32) NOT NULL,
	"hubspot_contact_id" varchar(64),
	"http_status" integer,
	"error_message" text,
	"properties_payload" text,
	"retry_of" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "icp_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid,
	"name" varchar(128) NOT NULL,
	"industry" varchar(128) NOT NULL,
	"target_role" varchar(128) NOT NULL,
	"company_size" varchar(64) NOT NULL,
	"revenue_range" varchar(64) NOT NULL,
	"acute_pain_triggers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"buying_signals" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"disqualifiers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"value_proposition" text NOT NULL,
	"outreach_angles" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"source" varchar(64) DEFAULT 'ai_synthesized' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
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
CREATE TABLE "messenger_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"thread_id" uuid NOT NULL,
	"sender" varchar(16) DEFAULT 'founder' NOT NULL,
	"sender_name" varchar(128) NOT NULL,
	"content" text NOT NULL,
	"is_meeting_link" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messenger_threads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(16) DEFAULT 'channel' NOT NULL,
	"slug" varchar(96),
	"name" varchar(128) NOT NULL,
	"tagline" varchar(255),
	"role" varchar(96),
	"company" varchar(128),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"status" varchar(32) DEFAULT 'draft' NOT NULL,
	"recipient_count" integer DEFAULT 0 NOT NULL,
	"sent_count" integer DEFAULT 0 NOT NULL,
	"open_count" integer DEFAULT 0 NOT NULL,
	"click_count" integer DEFAULT 0 NOT NULL,
	"sent_at" timestamp with time zone,
	"hubspot_email_id" varchar(64),
	"hubspot_template_path" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(128),
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"source" varchar(64) DEFAULT 'website' NOT NULL,
	"verify_token" varchar(128),
	"unsubscribe_token" varchar(128),
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
CREATE TABLE "teardown_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"title" varchar(128) NOT NULL,
	"duration_seconds" integer DEFAULT 0 NOT NULL,
	"size_bytes" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"ai_brief" text,
	"ai_brief_model" varchar(64),
	"video_data" "bytea",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
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
	"tier" varchar(64) DEFAULT 'standard' NOT NULL,
	"restricted_packages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"last_signed_in" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_open_id_unique" UNIQUE("open_id")
);
--> statement-breakpoint
CREATE TABLE "visitor_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(128),
	"company" varchar(128),
	"pain_point" text,
	"interest" varchar(128),
	"conversation" jsonb,
	"claimed_by_workspace_id" uuid,
	"claimed_at" timestamp with time zone,
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
	"cancel_requested" boolean DEFAULT false NOT NULL,
	"cancelled_at" timestamp with time zone,
	"initial_context" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_share_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"label" varchar(128),
	"scope" varchar(16) DEFAULT 'all' NOT NULL,
	"run_id" uuid,
	"created_by_email" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_accessed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone
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
	"timeout_seconds" integer,
	"max_retries" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" varchar(128) NOT NULL,
	"description" text,
	"trigger_type" varchar(64) DEFAULT 'manual' NOT NULL,
	"cron_expression" varchar(64),
	"next_run_at" timestamp with time zone,
	"status" varchar(32) DEFAULT 'draft' NOT NULL,
	"success_rate" numeric(5, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
CREATE TABLE "workspace_packages" (
	"workspace_id" uuid NOT NULL,
	"package_id" varchar(64) NOT NULL,
	"status" varchar(32) DEFAULT 'active' NOT NULL,
	"stripe_subscription_id" varchar(128),
	"daily_run_limit" integer,
	"unlocked_at" timestamp with time zone DEFAULT now() NOT NULL
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
CREATE TABLE "workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(128) NOT NULL,
	"slug" varchar(64) NOT NULL,
	"hard_monthly_budget" numeric(10, 2) DEFAULT '500.00' NOT NULL,
	"auto_pause_threshold_enabled" boolean DEFAULT true NOT NULL,
	"pii_redaction_enabled" boolean DEFAULT true NOT NULL,
	"saif_enforcement_enabled" boolean DEFAULT true NOT NULL,
	"audit_retention_days" integer DEFAULT 90 NOT NULL,
	"stripe_customer_id" varchar(128),
	"orchestrator_name" varchar(128) DEFAULT 'Orchestrator' NOT NULL,
	"orchestrator_system_prompt" text DEFAULT 'You are the central Ops Agent.' NOT NULL,
	"default_model" varchar(64) DEFAULT 'gemini-1.5-pro' NOT NULL,
	"onboarding_context" jsonb,
	"trial_ends_at" timestamp with time zone DEFAULT now() + interval '30 days',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workspaces_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "action_dispatches" ADD CONSTRAINT "action_dispatches_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_dispatches" ADD CONSTRAINT "action_dispatches_workflow_run_id_workflow_runs_id_fk" FOREIGN KEY ("workflow_run_id") REFERENCES "public"."workflow_runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_dispatches" ADD CONSTRAINT "action_dispatches_workflow_run_step_id_workflow_run_steps_id_fk" FOREIGN KEY ("workflow_run_step_id") REFERENCES "public"."workflow_run_steps"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_dispatches" ADD CONSTRAINT "action_dispatches_workflow_step_id_workflow_steps_id_fk" FOREIGN KEY ("workflow_step_id") REFERENCES "public"."workflow_steps"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_dispatches" ADD CONSTRAINT "action_dispatches_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_owner_open_id_users_open_id_fk" FOREIGN KEY ("owner_open_id") REFERENCES "public"."users"("open_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_questions" ADD CONSTRAINT "assessment_questions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_sessions" ADD CONSTRAINT "assessment_sessions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_parent_comment_id_blog_comments_id_fk" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."blog_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_redemptions" ADD CONSTRAINT "discount_redemptions_discount_code_id_discount_codes_id_fk" FOREIGN KEY ("discount_code_id") REFERENCES "public"."discount_codes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_redemptions" ADD CONSTRAINT "discount_redemptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hubspot_sync_log" ADD CONSTRAINT "hubspot_sync_log_submission_id_contact_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."contact_submissions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "icp_profiles" ADD CONSTRAINT "icp_profiles_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messenger_messages" ADD CONSTRAINT "messenger_messages_thread_id_messenger_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."messenger_threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playbook_handoffs" ADD CONSTRAINT "playbook_handoffs_playbook_id_playbooks_id_fk" FOREIGN KEY ("playbook_id") REFERENCES "public"."playbooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teardown_sessions" ADD CONSTRAINT "teardown_sessions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_artifacts" ADD CONSTRAINT "workflow_artifacts_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_artifacts" ADD CONSTRAINT "workflow_artifacts_workflow_run_id_workflow_runs_id_fk" FOREIGN KEY ("workflow_run_id") REFERENCES "public"."workflow_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_artifacts" ADD CONSTRAINT "workflow_artifacts_workflow_run_step_id_workflow_run_steps_id_fk" FOREIGN KEY ("workflow_run_step_id") REFERENCES "public"."workflow_run_steps"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_artifacts" ADD CONSTRAINT "workflow_artifacts_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_run_steps" ADD CONSTRAINT "workflow_run_steps_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_run_steps" ADD CONSTRAINT "workflow_run_steps_workflow_run_id_workflow_runs_id_fk" FOREIGN KEY ("workflow_run_id") REFERENCES "public"."workflow_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_run_steps" ADD CONSTRAINT "workflow_run_steps_workflow_step_id_workflow_steps_id_fk" FOREIGN KEY ("workflow_step_id") REFERENCES "public"."workflow_steps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_runs" ADD CONSTRAINT "workflow_runs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_runs" ADD CONSTRAINT "workflow_runs_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_share_tokens" ADD CONSTRAINT "workflow_share_tokens_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_steps" ADD CONSTRAINT "workflow_steps_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_steps" ADD CONSTRAINT "workflow_steps_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_steps" ADD CONSTRAINT "workflow_steps_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_integrations" ADD CONSTRAINT "workspace_integrations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_packages" ADD CONSTRAINT "workspace_packages_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_packages" ADD CONSTRAINT "workspace_packages_package_id_knowledge_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."knowledge_packages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_secrets" ADD CONSTRAINT "workspace_secrets_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_action_dispatches_workspace" ON "action_dispatches" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_action_dispatches_status" ON "action_dispatches" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_action_dispatches_run" ON "action_dispatches" USING btree ("workflow_run_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_workspace_agent_name" ON "agents" USING btree ("workspace_id","name");--> statement-breakpoint
CREATE INDEX "idx_agents_workspace" ON "agents" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_agents_status" ON "agents" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_owner_slug" ON "articles" USING btree ("owner_open_id","slug");--> statement-breakpoint
CREATE INDEX "idx_articles_owner" ON "articles" USING btree ("owner_open_id");--> statement-breakpoint
CREATE INDEX "idx_articles_status" ON "articles" USING btree ("owner_open_id","status");--> statement-breakpoint
CREATE INDEX "idx_assessment_questions_domain" ON "assessment_questions" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "idx_assessment_questions_depth" ON "assessment_questions" USING btree ("depth");--> statement-breakpoint
CREATE INDEX "idx_assessment_questions_workspace" ON "assessment_questions" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_assessment_sessions_workspace" ON "assessment_sessions" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_workspace_created" ON "audit_logs" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_agent" ON "audit_logs" USING btree ("workspace_id","agent_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_workflow" ON "audit_logs" USING btree ("workspace_id","workflow_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_status" ON "audit_logs" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE INDEX "idx_blog_comments_article" ON "blog_comments" USING btree ("article_id");--> statement-breakpoint
CREATE INDEX "idx_blog_comments_parent" ON "blog_comments" USING btree ("parent_comment_id");--> statement-breakpoint
CREATE INDEX "idx_contact_submissions_email" ON "contact_submissions" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_contact_submissions_created" ON "contact_submissions" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_discount_codes_code" ON "discount_codes" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_discount_codes_app" ON "discount_codes" USING btree ("target_app");--> statement-breakpoint
CREATE INDEX "idx_redemptions_code_id" ON "discount_redemptions" USING btree ("discount_code_id");--> statement-breakpoint
CREATE INDEX "idx_redemptions_email" ON "discount_redemptions" USING btree ("user_email");--> statement-breakpoint
CREATE INDEX "idx_hubspot_sync_log_email" ON "hubspot_sync_log" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_hubspot_sync_log_submission" ON "hubspot_sync_log" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "idx_hubspot_sync_log_created" ON "hubspot_sync_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_icp_profiles_workspace" ON "icp_profiles" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_icp_profiles_industry" ON "icp_profiles" USING btree ("industry");--> statement-breakpoint
CREATE INDEX "idx_messenger_messages_thread" ON "messenger_messages" USING btree ("thread_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_messenger_threads_slug" ON "messenger_threads" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_messenger_threads_type" ON "messenger_threads" USING btree ("type");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_newsletter_subscribers_email" ON "newsletter_subscribers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_newsletter_subscribers_status" ON "newsletter_subscribers" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_playbook_handoff_sequence" ON "playbook_handoffs" USING btree ("playbook_id","sequence");--> statement-breakpoint
CREATE INDEX "idx_playbook_handoffs_playbook" ON "playbook_handoffs" USING btree ("playbook_id");--> statement-breakpoint
CREATE INDEX "idx_playbook_handoffs_from" ON "playbook_handoffs" USING btree ("from_workflow_code");--> statement-breakpoint
CREATE INDEX "idx_playbook_handoffs_to" ON "playbook_handoffs" USING btree ("to_workflow_code");--> statement-breakpoint
CREATE INDEX "idx_playbooks_owner_department" ON "playbooks" USING btree ("owner_department_code");--> statement-breakpoint
CREATE INDEX "idx_playbooks_status" ON "playbooks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_teardown_sessions_workspace" ON "teardown_sessions" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_teardown_sessions_created" ON "teardown_sessions" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_workspace_user_email" ON "users" USING btree ("workspace_id","email");--> statement-breakpoint
CREATE INDEX "idx_users_workspace" ON "users" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_users_openid" ON "users" USING btree ("open_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_visitor_profiles_email" ON "visitor_profiles" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_visitor_profiles_workspace" ON "visitor_profiles" USING btree ("claimed_by_workspace_id");--> statement-breakpoint
CREATE INDEX "idx_workflow_artifacts_workspace" ON "workflow_artifacts" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_workflow_artifacts_run" ON "workflow_artifacts" USING btree ("workflow_run_id");--> statement-breakpoint
CREATE INDEX "idx_workflow_artifacts_type" ON "workflow_artifacts" USING btree ("workspace_id","artifact_type");--> statement-breakpoint
CREATE INDEX "idx_workflow_artifacts_status" ON "workflow_artifacts" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE INDEX "idx_workflow_artifacts_scheduled" ON "workflow_artifacts" USING btree ("workspace_id","scheduled_for");--> statement-breakpoint
CREATE INDEX "idx_workflow_run_steps_workspace" ON "workflow_run_steps" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_workflow_run_steps_run" ON "workflow_run_steps" USING btree ("workflow_run_id");--> statement-breakpoint
CREATE INDEX "idx_workflow_run_steps_status" ON "workflow_run_steps" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE INDEX "idx_workflow_runs_workspace" ON "workflow_runs" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_workflow_runs_workflow" ON "workflow_runs" USING btree ("workflow_id");--> statement-breakpoint
CREATE INDEX "idx_workflow_runs_status" ON "workflow_runs" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_share_token_hash" ON "workflow_share_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "idx_share_tokens_workspace" ON "workflow_share_tokens" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_workflow_order" ON "workflow_steps" USING btree ("workflow_id","order_index");--> statement-breakpoint
CREATE INDEX "idx_workflow_steps_workspace" ON "workflow_steps" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_workflow_steps_workflow" ON "workflow_steps" USING btree ("workflow_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_workspace_workflow_name" ON "workflows" USING btree ("workspace_id","name");--> statement-breakpoint
CREATE INDEX "idx_workflows_workspace" ON "workflows" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_workflows_status" ON "workflows" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE INDEX "idx_workspace_integrations_workspace" ON "workspace_integrations" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_workspace_package" ON "workspace_packages" USING btree ("workspace_id","package_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_workspace_secret_provider" ON "workspace_secrets" USING btree ("workspace_id","provider");--> statement-breakpoint
CREATE INDEX "idx_workspace_secrets_workspace" ON "workspace_secrets" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_workspaces_slug" ON "workspaces" USING btree ("slug");