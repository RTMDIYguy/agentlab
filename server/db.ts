import { ENV } from "./_core/env";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/agentlab';
const client = postgres(connectionString);
export const db = drizzle(client, { schema });

export async function getDb() {
  return db;
}

export async function upsertUser(user: schema.NewUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: schema.NewUser = {
      openId: user.openId,
      email: user.email,
      name: user.name,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      (values as any)[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(schema.users).values(values).onConflictDoUpdate({
      target: schema.users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Auto self-healing schema initialization
export async function ensureDatabaseSchema(): Promise<void> {
  try {
    // Ensure users table has tier and restricted_packages
    await client`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tier" varchar(64) NOT NULL DEFAULT 'standard';
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "restricted_packages" jsonb NOT NULL DEFAULT '[]'::jsonb;
    `;

    // Ensure Lorenzo beta entitlement is recorded
    await client`
      UPDATE "users" 
      SET "role" = 'beta_partner', "tier" = 'beta_partner', "restricted_packages" = '["financial-package", "finance-control-loop", "fin-department"]'::jsonb
      WHERE LOWER("email") = 'lorenzo@nwnadvisory.com';
    `;

    await client`
      CREATE TABLE IF NOT EXISTS "workflow_artifacts" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
        "workflow_run_id" uuid NOT NULL REFERENCES "workflow_runs"("id") ON DELETE CASCADE,
        "workflow_run_step_id" uuid REFERENCES "workflow_run_steps"("id") ON DELETE SET NULL,
        "workflow_id" uuid REFERENCES "workflows"("id") ON DELETE SET NULL,
        "artifact_type" varchar(64) NOT NULL DEFAULT 'document',
        "title" varchar(255) NOT NULL,
        "content" text NOT NULL,
        "summary" text,
        "status" varchar(32) NOT NULL DEFAULT 'draft',
        "scheduled_for" timestamp with time zone,
        "target_platform" varchar(64) DEFAULT 'linkedin',
        "quality_score" integer DEFAULT 90,
        "quality_grade" varchar(10) DEFAULT 'A',
        "verification_notes" jsonb DEFAULT '{"feedback":["Initial generation verified."],"suggestions":[],"passed":true,"rubric":{"brandAlignment":95,"actionableCta":90,"factualIntegrity":95,"formatting":90}}'::jsonb,
        "revision_version" integer NOT NULL DEFAULT 1,
        "parent_artifact_id" uuid,
        "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "created_at" timestamp with time zone NOT NULL DEFAULT now(),
        "updated_at" timestamp with time zone NOT NULL DEFAULT now()
      );
    `;
    await client`CREATE INDEX IF NOT EXISTS "idx_workflow_artifacts_workspace" ON "workflow_artifacts" ("workspace_id");`;
    await client`CREATE INDEX IF NOT EXISTS "idx_workflow_artifacts_run" ON "workflow_artifacts" ("workflow_run_id");`;
    await client`CREATE INDEX IF NOT EXISTS "idx_workflow_artifacts_type" ON "workflow_artifacts" ("workspace_id", "artifact_type");`;
    await client`CREATE INDEX IF NOT EXISTS "idx_workflow_artifacts_status" ON "workflow_artifacts" ("workspace_id", "status");`;
    await client`CREATE INDEX IF NOT EXISTS "idx_workflow_artifacts_scheduled" ON "workflow_artifacts" ("workspace_id", "scheduled_for");`;

    // Ensure discount_codes and discount_redemptions tables
    await client`
      CREATE TABLE IF NOT EXISTS "discount_codes" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "code" varchar(64) NOT NULL UNIQUE,
        "campaign_name" varchar(128) NOT NULL,
        "discount_type" varchar(32) NOT NULL DEFAULT 'percent_off',
        "discount_value" numeric(10, 2) NOT NULL DEFAULT 0.00,
        "target_app" varchar(64) NOT NULL DEFAULT 'all',
        "stripe_promo_id" varchar(128),
        "max_redemptions" integer,
        "times_redeemed" integer NOT NULL DEFAULT 0,
        "expires_at" timestamp with time zone,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamp with time zone NOT NULL DEFAULT now(),
        "updated_at" timestamp with time zone NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "idx_discount_codes_app" ON "discount_codes" ("target_app");

      CREATE TABLE IF NOT EXISTS "discount_redemptions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "discount_code_id" uuid NOT NULL REFERENCES "discount_codes"("id") ON DELETE CASCADE,
        "user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "user_email" varchar(255) NOT NULL,
        "target_app" varchar(64) NOT NULL,
        "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "redeemed_at" timestamp with time zone NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "idx_redemptions_code_id" ON "discount_redemptions" ("discount_code_id");
      CREATE INDEX IF NOT EXISTS "idx_redemptions_email" ON "discount_redemptions" ("user_email");
    `;

    // Seed default starter promotional & VIP discount codes
    await client`
      INSERT INTO "discount_codes" ("code", "campaign_name", "discount_type", "discount_value", "target_app", "max_redemptions")
      VALUES 
        ('FOUNDERVIP', 'Founding Member Master Access', 'vip_bypass', 100.00, 'all', 100),
        ('BOOTSTRAPPER', 'Bootstrapper Capital Founder Pass', 'percent_off', 50.00, 'all', 500),
        ('BOOKREADER', 'Bootstrappers Guide Authority Offer', 'percent_off', 30.00, 'all', 1000),
        ('ROUNDTABLE', 'Founder Roundtable 48H Sprint', 'extended_trial', 60.00, 'all', 250),
        ('MARKSMAN50', 'Market Marksman Launch Offer', 'percent_off', 50.00, 'market_marksman', 200),
        ('PULSE30', 'Pulse Social 30-Day Pro Pass', 'vip_bypass', 100.00, 'pulse_social', 300)
      ON CONFLICT ("code") DO NOTHING;
    `;

    console.log("[Database] Schema self-healing verified: user entitlements, workflow_artifacts, discount_codes & articles active.");
    // Blog manager articles table self-heal
    await client`
      CREATE TABLE IF NOT EXISTS "articles" (
        "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        "owner_open_id" varchar(64) NOT NULL REFERENCES "users"("open_id") ON DELETE CASCADE,
        "title" varchar(255) NOT NULL,
        "excerpt" text,
        "content" text NOT NULL,
        "slug" varchar(255) NOT NULL,
        "category" varchar(64) NOT NULL DEFAULT 'General',
        "status" varchar(32) NOT NULL DEFAULT 'draft',
        "scheduled_for" timestamp with time zone,
        "featured_image" text,
        "views" integer NOT NULL DEFAULT 0,
        "created_at" timestamp with time zone NOT NULL DEFAULT now(),
        "updated_at" timestamp with time zone NOT NULL DEFAULT now()
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_owner_slug" ON "articles" ("owner_open_id", "slug");
      CREATE INDEX IF NOT EXISTS "idx_articles_owner" ON "articles" ("owner_open_id");
      CREATE INDEX IF NOT EXISTS "idx_articles_status" ON "articles" ("owner_open_id", "status");
    `;
    console.log("[Database] Articles table self-healed for blog manager.");

    // Newsletter subscribers & campaigns (double opt-in audience list)
    await client`
      CREATE TABLE IF NOT EXISTS "newsletter_subscribers" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" varchar(255) NOT NULL UNIQUE,
        "name" varchar(128),
        "status" varchar(32) NOT NULL DEFAULT 'pending',
        "source" varchar(64) NOT NULL DEFAULT 'website',
        "verify_token" varchar(128),
        "unsubscribe_token" varchar(128),
        "verified_at" timestamp with time zone,
        "created_at" timestamp with time zone NOT NULL DEFAULT now(),
        "updated_at" timestamp with time zone NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "idx_newsletter_subscribers_status" ON "newsletter_subscribers" ("status");

      CREATE TABLE IF NOT EXISTS "newsletter_campaigns" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" varchar(255) NOT NULL,
        "subject" varchar(255) NOT NULL,
        "content" text NOT NULL,
        "status" varchar(32) NOT NULL DEFAULT 'draft',
        "recipient_count" integer NOT NULL DEFAULT 0,
        "sent_count" integer NOT NULL DEFAULT 0,
        "open_count" integer NOT NULL DEFAULT 0,
        "click_count" integer NOT NULL DEFAULT 0,
        "sent_at" timestamp with time zone,
        "hubspot_email_id" varchar(64),
        "hubspot_template_path" varchar(255),
        "created_at" timestamp with time zone NOT NULL DEFAULT now(),
        "updated_at" timestamp with time zone NOT NULL DEFAULT now()
      );
      ALTER TABLE "newsletter_campaigns" ADD COLUMN IF NOT EXISTS "hubspot_email_id" varchar(64);
      ALTER TABLE "newsletter_campaigns" ADD COLUMN IF NOT EXISTS "hubspot_template_path" varchar(255);
    `;

    // Contact submissions (every site lead in one place)
    await client`
      CREATE TABLE IF NOT EXISTS "contact_submissions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar(128),
        "email" varchar(255) NOT NULL,
        "company" varchar(128),
        "pain_point" text,
        "interest" varchar(128),
        "subject" varchar(255),
        "message" text,
        "source" varchar(128) NOT NULL DEFAULT 'website',
        "status" varchar(32) NOT NULL DEFAULT 'new',
        "crm_synced_at" timestamp with time zone,
        "created_at" timestamp with time zone NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "idx_contact_submissions_email" ON "contact_submissions" ("email");
      CREATE INDEX IF NOT EXISTS "idx_contact_submissions_created" ON "contact_submissions" ("created_at");
    `;

    // Blog comments (threaded, soft-delete)
    await client`
      CREATE TABLE IF NOT EXISTS "blog_comments" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "article_id" integer NOT NULL REFERENCES "articles"("id") ON DELETE CASCADE,
        "user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "parent_comment_id" uuid REFERENCES "blog_comments"("id") ON DELETE CASCADE,
        "content" text NOT NULL,
        "status" varchar(32) NOT NULL DEFAULT 'visible',
        "created_at" timestamp with time zone NOT NULL DEFAULT now(),
        "updated_at" timestamp with time zone NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "idx_blog_comments_article" ON "blog_comments" ("article_id");
      CREATE INDEX IF NOT EXISTS "idx_blog_comments_parent" ON "blog_comments" ("parent_comment_id");
    `;

    // Messenger threads & messages (ClientMessenger persistence)
    await client`
      CREATE TABLE IF NOT EXISTS "messenger_threads" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "type" varchar(16) NOT NULL DEFAULT 'channel',
        "slug" varchar(96),
        "name" varchar(128) NOT NULL,
        "tagline" varchar(255),
        "role" varchar(96),
        "company" varchar(128),
        "created_at" timestamp with time zone NOT NULL DEFAULT now(),
        "updated_at" timestamp with time zone NOT NULL DEFAULT now()
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_messenger_threads_slug" ON "messenger_threads" ("slug");
      CREATE INDEX IF NOT EXISTS "idx_messenger_threads_type" ON "messenger_threads" ("type");

      CREATE TABLE IF NOT EXISTS "messenger_messages" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "thread_id" uuid NOT NULL REFERENCES "messenger_threads"("id") ON DELETE CASCADE,
        "sender" varchar(16) NOT NULL DEFAULT 'founder',
        "sender_name" varchar(128) NOT NULL,
        "content" text NOT NULL,
        "is_meeting_link" boolean NOT NULL DEFAULT false,
        "created_at" timestamp with time zone NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "idx_messenger_messages_thread" ON "messenger_messages" ("thread_id", "created_at");
    `;

    // Screen teardown sessions (Async Screen & Video Teardown Studio)
    await client`
      CREATE TABLE IF NOT EXISTS "teardown_sessions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
        "title" varchar(128) NOT NULL,
        "duration_seconds" integer NOT NULL DEFAULT 0,
        "size_bytes" integer NOT NULL DEFAULT 0,
        "notes" text,
        "ai_brief" text,
        "ai_brief_model" varchar(64),
        "video_data" bytea,
        "created_at" timestamp with time zone NOT NULL DEFAULT now(),
        "updated_at" timestamp with time zone NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "idx_teardown_sessions_workspace" ON "teardown_sessions" ("workspace_id");
      CREATE INDEX IF NOT EXISTS "idx_teardown_sessions_created" ON "teardown_sessions" ("workspace_id", "created_at");
    `;

    // Honesty doctrine: workflow success_rate is computed from real run
    // history, never stored as a default. Clear the fabricated NOT NULL
    // DEFAULT 100.00 from earlier schema versions.
    await client`
      ALTER TABLE "workflows" ALTER COLUMN "success_rate" DROP NOT NULL;
      ALTER TABLE "workflows" ALTER COLUMN "success_rate" DROP DEFAULT;
    `;

    // Lead handoff sync ledger (Agent Lab OS → HubSpot blueprint, 2026-09-23):
    // every sync attempt is logged with its real outcome — success, skip, or
    // failure with the actual HubSpot error — so the funnel never silently
    // pretends a lead reached the CRM.
    await client`
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
    `;

    // Human-gated action dispatches (conversion plan Tier 2): outbound actions
    // park here for approval, and every dispatch records the real external
    // result — nothing is 'dispatched' unless the target system accepted it.
    await client`
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
    `;

    // Tier 1 runner hardening: per-step execution policy + run cancellation.
    await client`
      ALTER TABLE "workflow_steps" ADD COLUMN IF NOT EXISTS "timeout_seconds" integer;
      ALTER TABLE "workflow_steps" ADD COLUMN IF NOT EXISTS "max_retries" integer;
      ALTER TABLE "workflow_runs" ADD COLUMN IF NOT EXISTS "cancel_requested" boolean NOT NULL DEFAULT false;
      ALTER TABLE "workflow_runs" ADD COLUMN IF NOT EXISTS "cancelled_at" timestamp with time zone;
    `;

    // Client-facing run consoles (Tier 1 item 3): hashed share tokens. Raw
    // token values are shown once at creation and never stored.
    await client`
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
    `;

    // Seed the default office channels so a fresh environment boots usable
    await client`
      INSERT INTO "messenger_threads" ("type", "slug", "name", "tagline")
      VALUES
        ('channel', 'chan-general', 'general-office', 'Agency-wide team & ops sync'),
        ('channel', 'chan-sales', 'sales-and-leads', 'Inbound diagnostics & CRM pipeline'),
        ('channel', 'chan-fulfillment', 'fulfillment-briefs', 'Active sprints & DAG delivery'),
        ('channel', 'chan-portal', 'client-portal', 'Client-facing updates & approvals')
      ON CONFLICT ("slug") DO NOTHING;
    `;

    console.log("[Database] Newsletter, contact, blog comments & messenger tables verified.");
  } catch (err: any) {
    console.warn("[Database] Schema ensure notice:", err.message);
  }
}

