ALTER TABLE "visitor_profiles" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "visitor_profiles" ADD COLUMN "visitor_key" varchar(64);--> statement-breakpoint
CREATE INDEX "idx_visitor_profiles_visitor_key" ON "visitor_profiles" USING btree ("visitor_key");