import "dotenv/config";
import { eq, sql } from "drizzle-orm";
import { getDb } from "../server/db";
import { playbookHandoffs, playbooks } from "../server/schema";
import { CANONICAL_PLAYBOOKS } from "../server/domain/playbook-model";

async function seedPlaybookLayer() {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  // Ensure tables exist
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "playbooks" (
      "id" varchar(96) PRIMARY KEY,
      "name" varchar(160) NOT NULL,
      "description" text NOT NULL,
      "status" varchar(32) NOT NULL DEFAULT 'draft',
      "owner_department_code" varchar(32) NOT NULL,
      "source_document" varchar(255),
      "primary_owner" varchar(128) NOT NULL,
      "approval_owner" varchar(128) NOT NULL,
      "trigger" text NOT NULL,
      "completion_criteria" text NOT NULL,
      "stop_conditions" jsonb NOT NULL DEFAULT '[]',
      "required_inputs" jsonb NOT NULL DEFAULT '[]',
      "expected_outputs" jsonb NOT NULL DEFAULT '[]',
      "evidence_requirements" jsonb NOT NULL DEFAULT '[]',
      "created_at" timestamp with time zone NOT NULL DEFAULT now(),
      "updated_at" timestamp with time zone NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS "playbook_handoffs" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "playbook_id" varchar(96) NOT NULL REFERENCES "playbooks"("id") ON DELETE CASCADE,
      "sequence" integer NOT NULL,
      "from_workflow_code" varchar(64) NOT NULL,
      "to_workflow_code" varchar(64) NOT NULL,
      "from_department_code" varchar(32) NOT NULL,
      "to_department_code" varchar(32) NOT NULL,
      "trigger_signal" text NOT NULL,
      "required_payload" jsonb NOT NULL DEFAULT '[]',
      "receiving_owner" varchar(128) NOT NULL,
      "approval_required" boolean NOT NULL DEFAULT false,
      "fallback_protocol" text NOT NULL,
      "stop_condition" text NOT NULL,
      "evidence_required" jsonb NOT NULL DEFAULT '[]',
      "created_at" timestamp with time zone NOT NULL DEFAULT now()
    );
  `);

  for (const playbook of CANONICAL_PLAYBOOKS) {
    await db
      .insert(playbooks)
      .values({
        id: playbook.id,
        name: playbook.name,
        description: playbook.description,
        status: "active",
        ownerDepartmentCode: playbook.ownerDepartmentCode,
        sourceDocument: "docs/operations/workflow-relationship-map.md",
        primaryOwner: playbook.primaryOwner,
        approvalOwner: playbook.approvalOwner,
        trigger: playbook.trigger,
        completionCriteria: playbook.completionCriteria,
        stopConditions: playbook.stopConditions,
        requiredInputs: playbook.requiredInputs,
        expectedOutputs: playbook.expectedOutputs,
        evidenceRequirements: playbook.evidenceRequirements,
      })
      .onConflictDoUpdate({
        target: playbooks.id,
        set: {
          name: playbook.name,
          description: playbook.description,
          status: "active",
          ownerDepartmentCode: playbook.ownerDepartmentCode,
          primaryOwner: playbook.primaryOwner,
          approvalOwner: playbook.approvalOwner,
          trigger: playbook.trigger,
          completionCriteria: playbook.completionCriteria,
          stopConditions: playbook.stopConditions,
          requiredInputs: playbook.requiredInputs,
          expectedOutputs: playbook.expectedOutputs,
          evidenceRequirements: playbook.evidenceRequirements,
          updatedAt: new Date(),
        },
      });

    await db
      .delete(playbookHandoffs)
      .where(eq(playbookHandoffs.playbookId, playbook.id));
    if (playbook.handoffs.length > 0) {
      await db.insert(playbookHandoffs).values(
        playbook.handoffs.map(handoff => ({
          playbookId: playbook.id,
          sequence: handoff.sequence,
          fromWorkflowCode: handoff.fromWorkflowCode,
          toWorkflowCode: handoff.toWorkflowCode,
          fromDepartmentCode: handoff.fromDepartmentCode,
          toDepartmentCode: handoff.toDepartmentCode,
          triggerSignal: handoff.triggerSignal,
          requiredPayload: handoff.requiredPayload,
          receivingOwner: handoff.receivingOwner,
          approvalRequired: handoff.approvalRequired,
          fallbackProtocol: handoff.fallbackProtocol,
          stopCondition: handoff.stopCondition,
          evidenceRequired: handoff.evidenceRequired,
        }))
      );
    }
  }

  console.log(`Seeded ${CANONICAL_PLAYBOOKS.length} governed playbooks.`);
}

seedPlaybookLayer().catch(error => {
  console.error("Failed to seed playbook layer:", error);
  process.exitCode = 1;
});
