/**
 * Artifact export (Tier 1): deliverables leave the OS as Markdown.
 *
 * - GET /api/runs/:runId/artifacts/:artifactId/export  → one .md file
 * - GET /api/runs/:runId/export                        → one bundled .md
 *   containing every artifact from the run, with real metadata headers.
 *
 * Export is transport only: content is served exactly as stored, with its
 * real title, grade, and timestamps. Nothing is regenerated or embellished.
 */

import type { Request, Response } from "express";
import { and, asc, eq } from "drizzle-orm";
import { getDb } from "../db";
import { workflowArtifacts, workflowRuns } from "../schema";
import { param } from "./params";

function sanitizeFilename(name: string): string {
  return (
    name
      .replace(/[^a-zA-Z0-9-_ ]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 80) || "artifact"
  );
}

function setMarkdownHeaders(res: Response, filename: string) {
  res.setHeader("Content-Type", "text/markdown; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}.md"`
  );
}

function artifactSection(a: {
  title: string;
  artifactType: string;
  targetPlatform: string | null;
  qualityScore: number | null;
  qualityGrade: string | null;
  createdAt: Date;
  content: string;
  summary?: string | null;
}): string {
  const lines = [
    `# ${a.title}`,
    "",
    `- **Type:** ${a.artifactType}`,
    `- **Platform:** ${a.targetPlatform ?? "—"}`,
    `- **Quality:** ${a.qualityScore != null ? `${a.qualityScore}/100` : "not evaluated"}${
      a.qualityGrade ? ` (grade ${a.qualityGrade})` : ""
    }`,
    `- **Generated:** ${a.createdAt.toISOString()}`,
    "",
  ];
  if (a.summary) lines.push(`> ${a.summary}`, "");
  lines.push("---", "", a.content, "");
  return lines.join("\n");
}

export async function exportRunArtifact(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.workspaceId;
    if (!workspaceId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const runId = param(req, "runId");
    const artifactId = param(req, "artifactId");

    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "Database unavailable" });
      return;
    }

    const [artifact] = await db
      .select()
      .from(workflowArtifacts)
      .where(
        and(
          eq(workflowArtifacts.id, artifactId),
          eq(workflowArtifacts.workflowRunId, runId),
          eq(workflowArtifacts.workspaceId, workspaceId)
        )
      )
      .limit(1);

    if (!artifact) {
      res.status(404).json({ error: "Artifact not found for this run" });
      return;
    }

    setMarkdownHeaders(
      res,
      `${sanitizeFilename(artifact.title)}-${artifact.id.slice(0, 8)}`
    );
    res.status(200).send(
      artifactSection({
        title: artifact.title,
        artifactType: artifact.artifactType,
        targetPlatform: artifact.targetPlatform,
        qualityScore: artifact.qualityScore,
        qualityGrade: artifact.qualityGrade,
        createdAt: artifact.createdAt,
        content: artifact.content,
        summary: artifact.summary,
      })
    );
  } catch (error) {
    console.error("[Export] artifact export failed:", error);
    res.status(500).json({ error: "Export failed" });
  }
}

export async function exportRunBundle(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.workspaceId;
    if (!workspaceId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const runId = param(req, "runId");

    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "Database unavailable" });
      return;
    }

    const [run] = await db
      .select()
      .from(workflowRuns)
      .where(and(eq(workflowRuns.id, runId), eq(workflowRuns.workspaceId, workspaceId)))
      .limit(1);
    if (!run) {
      res.status(404).json({ error: "Run not found" });
      return;
    }

    const artifacts = await db
      .select()
      .from(workflowArtifacts)
      .where(
        and(
          eq(workflowArtifacts.workflowRunId, runId),
          eq(workflowArtifacts.workspaceId, workspaceId)
        )
      )
      .orderBy(asc(workflowArtifacts.createdAt));

    if (artifacts.length === 0) {
      res.status(404).json({ error: "Run has no artifacts to export" });
      return;
    }

    const header = [
      `# Run Export — ${run.id.slice(0, 8)}`,
      "",
      `- **Status:** ${run.status}`,
      `- **Started:** ${run.startedAt?.toISOString() ?? "not recorded"}`,
      `- **Completed:** ${run.completedAt?.toISOString() ?? "not completed"}`,
      `- **Artifacts:** ${artifacts.length}`,
      "",
      "---",
      "",
    ].join("\n");

    const bundle =
      header +
      artifacts
        .map((a) =>
          artifactSection({
            title: a.title,
            artifactType: a.artifactType,
            targetPlatform: a.targetPlatform,
            qualityScore: a.qualityScore,
            qualityGrade: a.qualityGrade,
            createdAt: a.createdAt,
            content: a.content,
            summary: a.summary,
          })
        )
        .join("\n");

    setMarkdownHeaders(res, `run-${run.id.slice(0, 8)}-artifacts`);
    res.status(200).send(bundle);
  } catch (error) {
    console.error("[Export] run bundle export failed:", error);
    res.status(500).json({ error: "Export failed" });
  }
}
