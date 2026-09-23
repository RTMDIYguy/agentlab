-- Idempotent migration: newsletter, contact submissions, blog comments,
-- plus promotion of runtime-self-healed tables into the migration history.
-- Every statement is safe to run against an existing database.
CREATE TABLE IF NOT EXISTS "articles" (
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
CREATE TABLE IF NOT EXISTS "assessment_questions" (
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
CREATE TABLE IF NOT EXISTS "assessment_sessions" (
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
CREATE TABLE IF NOT EXISTS "blog_comments" (
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
CREATE TABLE IF NOT EXISTS "contact_submissions" (
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
CREATE TABLE IF NOT EXISTS "discount_codes" (
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
CREATE TABLE IF NOT EXISTS "discount_redemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"discount_code_id" uuid NOT NULL,
	"user_id" uuid,
	"user_email" varchar(255) NOT NULL,
	"target_app" varchar(64) NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"redeemed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "icp_profiles" (
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
CREATE TABLE IF NOT EXISTS "newsletter_campaigns" (
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
);--> statement-breakpoint
ALTER TABLE "newsletter_campaigns" ADD COLUMN IF NOT EXISTS "hubspot_email_id" varchar(64);--> statement-breakpoint
ALTER TABLE "newsletter_campaigns" ADD COLUMN IF NOT EXISTS "hubspot_template_path" varchar(255);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "newsletter_subscribers" (
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
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tier" varchar(64) DEFAULT 'standard' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "restricted_packages" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "articles" ADD CONSTRAINT "articles_owner_open_id_users_open_id_fk" FOREIGN KEY ("owner_open_id") REFERENCES "public"."users"("open_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "assessment_questions" ADD CONSTRAINT "assessment_questions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "assessment_sessions" ADD CONSTRAINT "assessment_sessions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_parent_comment_id_blog_comments_id_fk" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."blog_comments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "discount_redemptions" ADD CONSTRAINT "discount_redemptions_discount_code_id_discount_codes_id_fk" FOREIGN KEY ("discount_code_id") REFERENCES "public"."discount_codes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "discount_redemptions" ADD CONSTRAINT "discount_redemptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "icp_profiles" ADD CONSTRAINT "icp_profiles_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_owner_slug" ON "articles" USING btree ("owner_open_id","slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_articles_owner" ON "articles" USING btree ("owner_open_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_articles_status" ON "articles" USING btree ("owner_open_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_assessment_questions_domain" ON "assessment_questions" USING btree ("domain");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_assessment_questions_depth" ON "assessment_questions" USING btree ("depth");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_assessment_questions_workspace" ON "assessment_questions" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_assessment_sessions_workspace" ON "assessment_sessions" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_blog_comments_article" ON "blog_comments" USING btree ("article_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_blog_comments_parent" ON "blog_comments" USING btree ("parent_comment_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_contact_submissions_email" ON "contact_submissions" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_contact_submissions_created" ON "contact_submissions" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_discount_codes_code" ON "discount_codes" USING btree ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_discount_codes_app" ON "discount_codes" USING btree ("target_app");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_redemptions_code_id" ON "discount_redemptions" USING btree ("discount_code_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_redemptions_email" ON "discount_redemptions" USING btree ("user_email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_icp_profiles_workspace" ON "icp_profiles" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_icp_profiles_industry" ON "icp_profiles" USING btree ("industry");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_newsletter_subscribers_email" ON "newsletter_subscribers" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_newsletter_subscribers_status" ON "newsletter_subscribers" USING btree ("status");
