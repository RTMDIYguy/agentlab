import type { Request, Response } from "express";
import { asc, eq } from "drizzle-orm";
import { getDb } from "../db";
import { playbookHandoffs, playbooks } from "../schema";
import { CANONICAL_PLAYBOOKS } from "../domain/playbook-model";

/**
 * Auto-seeds canonical playbooks if database is empty.
 */
async function autoSeedPlaybooksIfEmpty(db: any) {
  try {
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
        .onConflictDoNothing();

      if (playbook.handoffs && playbook.handoffs.length > 0) {
        for (const handoff of playbook.handoffs) {
          await db
            .insert(playbookHandoffs)
            .values({
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
            })
            .onConflictDoNothing();
        }
      }
    }
  } catch (seedErr) {
    console.warn("[Playbooks AutoSeed Note]:", seedErr);
  }
}

export async function getPlaybooks(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const db = await getDb();
    if (db) {
      try {
        const records = await db
          .select()
          .from(playbooks)
          .orderBy(asc(playbooks.ownerDepartmentCode), asc(playbooks.name));

        if (records && records.length > 0) {
          const handoffs = await db
            .select()
            .from(playbookHandoffs)
            .orderBy(
              asc(playbookHandoffs.playbookId),
              asc(playbookHandoffs.sequence)
            );
          const handoffsByPlaybook = handoffs.reduce<Record<string, typeof handoffs>>(
            (result, handoff) => {
              (result[handoff.playbookId] ||= []).push(handoff);
              return result;
            },
            {}
          );

          res.status(200).json({
            playbooks: records.map(playbook => ({
              ...playbook,
              handoffs: handoffsByPlaybook[playbook.id] || [],
            })),
            totalCount: records.length,
          });
          return;
        }

        // Trigger background seed if DB is available but empty
        autoSeedPlaybooksIfEmpty(db).catch(() => {});
      } catch (dbQueryErr) {
        console.warn("[Playbooks DB Query]: Falling back to canonical definitions:", dbQueryErr);
      }
    }

    // Graceful Canonical Fallback
    res.status(200).json({
      playbooks: CANONICAL_PLAYBOOKS,
      totalCount: CANONICAL_PLAYBOOKS.length,
    });
  } catch (error) {
    console.error("[Playbooks Controller Error]:", error);
    // Even in case of unexpected errors, return the canonical layer
    res.status(200).json({
      playbooks: CANONICAL_PLAYBOOKS,
      totalCount: CANONICAL_PLAYBOOKS.length,
    });
  }
}

export async function getPlaybook(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    const db = await getDb();
    if (db) {
      try {
        const [playbook] = await db
          .select()
          .from(playbooks)
          .where(eq(playbooks.id, id))
          .limit(1);

        if (playbook) {
          const handoffs = await db
            .select()
            .from(playbookHandoffs)
            .where(eq(playbookHandoffs.playbookId, playbook.id))
            .orderBy(asc(playbookHandoffs.sequence));

          res.status(200).json({ playbook: { ...playbook, handoffs } });
          return;
        }
      } catch (dbErr) {
        console.warn("[Playbook Detail DB Query]: Falling back to canonical definitions:", dbErr);
      }
    }

    // Fallback to canonical playbook in memory
    const canonical = CANONICAL_PLAYBOOKS.find(p => p.id === id);
    if (canonical) {
      res.status(200).json({ playbook: canonical });
      return;
    }

    res.status(404).json({ error: "Playbook not found." });
  } catch (error) {
    console.error("[Playbook Detail Controller Error]:", error);
    const canonical = CANONICAL_PLAYBOOKS.find(p => p.id === id);
    if (canonical) {
      res.status(200).json({ playbook: canonical });
      return;
    }
    res.status(500).json({ error: "Failed to fetch playbook." });
  }
}
