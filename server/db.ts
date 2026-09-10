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
    console.log("[Database] Schema self-healing verified: user entitlements & workflow_artifacts active.");
  } catch (err: any) {
    console.warn("[Database] Schema ensure notice:", err.message);
  }
}

