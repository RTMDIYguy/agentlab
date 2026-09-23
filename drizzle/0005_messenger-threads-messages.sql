-- Idempotent migration: messenger_threads & messenger_messages for
-- ClientMessenger persistence (replaces localStorage-only chat storage).
-- Every statement is safe to run against an existing database.
CREATE TABLE IF NOT EXISTS "messenger_threads" (
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
CREATE TABLE IF NOT EXISTS "messenger_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"thread_id" uuid NOT NULL,
	"sender" varchar(16) DEFAULT 'founder' NOT NULL,
	"sender_name" varchar(128) NOT NULL,
	"content" text NOT NULL,
	"is_meeting_link" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "messenger_messages" ADD CONSTRAINT "messenger_messages_thread_id_messenger_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."messenger_threads"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_messenger_threads_slug" ON "messenger_threads" USING btree ("slug");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_messenger_threads_type" ON "messenger_threads" USING btree ("type");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_messenger_messages_thread" ON "messenger_messages" USING btree ("thread_id","created_at");
