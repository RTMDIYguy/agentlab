import { eq } from "drizzle-orm";
import { getDb } from "../server/db";
import { playbookHandoffs, playbooks } from "../server/schema";
import { CANONICAL_PLAYBOOKS } from "../server/domain/playbook-model";

async function seedPlaybookLayer() {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

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
