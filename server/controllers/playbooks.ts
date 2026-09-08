import type { Request, Response } from "express";
import { asc, eq } from "drizzle-orm";
import { getDb } from "../db";
import { playbookHandoffs, playbooks } from "../schema";

export async function getPlaybooks(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "Database unavailable" });
      return;
    }

    const records = await db
      .select()
      .from(playbooks)
      .orderBy(asc(playbooks.ownerDepartmentCode), asc(playbooks.name));
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
  } catch (error) {
    console.error("[Playbooks Controller Error]:", error);
    res.status(500).json({ error: "Failed to fetch playbooks." });
  }
}

export async function getPlaybook(req: Request, res: Response): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "Database unavailable" });
      return;
    }

    const [playbook] = await db
      .select()
      .from(playbooks)
      .where(eq(playbooks.id, req.params.id))
      .limit(1);

    if (!playbook) {
      res.status(404).json({ error: "Playbook not found." });
      return;
    }

    const handoffs = await db
      .select()
      .from(playbookHandoffs)
      .where(eq(playbookHandoffs.playbookId, playbook.id))
      .orderBy(asc(playbookHandoffs.sequence));

    res.status(200).json({ playbook: { ...playbook, handoffs } });
  } catch (error) {
    console.error("[Playbook Detail Controller Error]:", error);
    res.status(500).json({ error: "Failed to fetch playbook." });
  }
}
