import type { Request, Response } from "express";
import { asc, eq, sql } from "drizzle-orm";
import { getDb } from "../db";
import { playbookHandoffs, playbooks } from "../schema";
import { CANONICAL_PLAYBOOKS } from "../domain/playbook-model";

/**
 * Auto-seeds canonical playbooks if database is empty.
 */
async function autoSeedPlaybooksIfEmpty(db: any) {
  try {
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
