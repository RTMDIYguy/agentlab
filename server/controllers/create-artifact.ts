import type { Request, Response } from "express";
import { eq, desc, and } from "drizzle-orm";
import { getDb } from "../db";
import { workflowArtifacts, workflows, workflowRuns } from "../schema";

const SYSTEM_RUN_WORKFLOW_TITLE = "System Artifacts";

/**
 * Standalone artifacts (e.g. blog-manager posts) have no workflow run, but
 * workflow_artifacts.workflow_run_id is NOT NULL. Attach them to a stable
 * per-workspace "System Artifacts" workflow/run pair, creating it once.
 * All timestamps are real — nothing is backdated.
 */
async function ensureSystemRun(db: any, workspaceId: string): Promise<string> {
  let [wf] = await db
    .select()
    .from(workflows)
    .where(and(eq(workflows.workspaceId, workspaceId), eq(workflows.name, SYSTEM_RUN_WORKFLOW_TITLE)))
    .limit(1);

  if (!wf) {
    [wf] = await db
      .insert(workflows)
      .values({
        workspaceId,
        name: SYSTEM_RUN_WORKFLOW_TITLE,
        description: "Attachment point for standalone artifacts created outside a workflow run.",
        triggerType: "system",
        status: "active",
      })
      .returning();
  }

  const [existingRun] = await db
    .select()
    .from(workflowRuns)
    .where(and(eq(workflowRuns.workflowId, wf.id), eq(workflowRuns.status, "completed")))
    .orderBy(desc(workflowRuns.createdAt))
    .limit(1);

  if (existingRun) return existingRun.id;

  const [run] = await db
    .insert(workflowRuns)
    .values({
      workspaceId,
      workflowId: wf.id,
      status: "completed",
      triggerSource: "system",
      startedAt: new Date(),
      completedAt: new Date(),
      initialContext: { source: "standalone_artifact" },
    })
    .returning();

  return run.id;
}

/** Create a new workflow artifact (used by the blog manager as a post). */
export async function createArtifact(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.workspaceId;
    if (!workspaceId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const {
      title,
      content,
      artifactType = "post",
      targetPlatform = "blog",
      status = "draft",
      summary,
      scheduledFor,
      metadata = {},
    } = req.body as any;

    if (!title || !content) {
      res.status(400).json({ error: "title and content are required" });
      return;
    }

    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "Database unavailable" });
      return;
    }

    const scheduledForDate =
      scheduledFor && status === "scheduled"
        ? new Date(scheduledFor)
        : null;

    const systemRunId = await ensureSystemRun(db, workspaceId);

    const [row] = await db
      .insert(workflowArtifacts)
      .values({
        workspaceId,
        workflowRunId: systemRunId,
        artifactType,
        targetPlatform,
        title,
        content,
        summary: summary || null,
        status,
        scheduledFor: scheduledForDate,
        metadata: {
          ...(metadata || {}),
          createdAt: new Date().toISOString(),
        },
        revisionVersion: 1,
      })
      .returning();

    res.status(201).json({ success: true, artifact: row });
  } catch (error) {
    console.error("[Create Artifact Error]:", error);
    res.status(500).json({ error: "Failed to create artifact" });
  }
}
