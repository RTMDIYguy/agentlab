import type { Request, Response } from "express";
import { eq, desc, and } from "drizzle-orm";
import { getDb } from "../db";
import { workflowArtifacts } from "../schema";

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

    const [row] = await db
      .insert(workflowArtifacts)
      .values({
        workspaceId,
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
