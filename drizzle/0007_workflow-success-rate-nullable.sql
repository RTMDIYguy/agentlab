-- CC-2026-09-23-016: honesty doctrine for workflow success rates.
-- The old NOT NULL DEFAULT 100.00 presented every never-run workflow as
-- having a perfect success rate. Rates are now computed from real
-- workflow_runs history; this column is retained (nullable) for future use.

ALTER TABLE "workflows" ALTER COLUMN "success_rate" DROP NOT NULL;
ALTER TABLE "workflows" ALTER COLUMN "success_rate" DROP DEFAULT;
UPDATE "workflows" SET "success_rate" = NULL;
