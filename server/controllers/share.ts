import type { Request, Response } from "express";
import { createHash, randomBytes } from "crypto";
import { and, desc, eq, isNull } from "drizzle-orm";
import { param } from "./params";
import { getDb } from "../db";
import {
  workflowArtifacts,
  workflowRunSteps,
  workflowRuns,
  workflowShareTokens,
  workflows,
} from "../schema";

/**
 * Client-facing run consoles (conversion plan Tier 1 item 3).
 *
 * Share tokens let an operator hand a client a read-only view of real run
 * state — real status, real per-step costs, real artifacts — without giving
 * the client an account in the OS. Doctrine:
 *
 *  - Tokens are stored only as sha256 hashes; the raw value is returned once
 *    at creation and is not recoverable afterwards (rotate = revoke + create).
 *  - All public reads resolve the workspace FROM THE TOKEN, never from
 *    req.workspaceId (the tenant middleware assigns unauthenticated requests
 *    a sentinel workspace; it must never be trusted here).
 *  - Every payload is an explicit field projection. If a column is sensitive
 *    or irrelevant to the client story, it is simply not in the projection —
 *    there is no `...row` spread anywhere in this file.
 *  - Nothing here can mutate run state. The only writes are token lifecycle
 *    (operator-authenticated) and a lastAccessedAt touch.
 */

const TOKEN_PREFIX = "als_";

function hashToken(raw: string): string {
  return createHash("sha256").update(raw, "utf8").digest("hex");
}

function resolveToken(raw: string): string {
  const bare = String(raw || "").trim();
  return bare.startsWith(TOKEN_PREFIX) ? bare.slice(TOKEN_PREFIX.length) : bare;
}

export async function listShareTokens(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.workspaceId;
    if (!workspaceId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "Database unavailable" });
      return;
    }
    const tokens = await db
      .select()
      .from(workflowShareTokens)
      .where(eq(workflowShareTokens.workspaceId, workspaceId))
      .orderBy(desc(workflowShareTokens.createdAt))
      .limit(100);
    // tokenHash never leaves the server.
    res.status(200).json({
      tokens: tokens.map((t: any) => ({ ...t, tokenHash: undefined })),
    });
  } catch (error) {
    console.error("[Share Controller Error] listShareTokens:", error);
    res.status(500).json({ error: "Failed to list share tokens" });
  }
}

export async function createShareToken(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.workspaceId;
    if (!workspaceId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "Database unavailable" });
      return;
    }

    const { label, scope, runId } = req.body || {};
    const effectiveScope = scope === "single" ? "single" : "all";
    if (effectiveScope === "single" && !runId) {
      res.status(400).json({ error: "runId is required when scope is 'single'" });
      return;
    }
    if (effectiveScope === "single") {
      const owned = await db
        .select({ id: workflowRuns.id })
        .from(workflowRuns)
        .where(
          and(
            eq(workflowRuns.id, String(runId)),
            eq(workflowRuns.workspaceId, workspaceId)
          )
        )
        .limit(1);
      if (owned.length === 0) {
        res.status(404).json({ error: "Run not found in this workspace" });
        return;
      }
    }

    const raw = `${TOKEN_PREFIX}${randomBytes(32).toString("base64url")}`;

    const id = crypto.randomUUID();
    await db.insert(workflowShareTokens).values({
      id,
      workspaceId,
      // Hash the bare value (prefix optional at lookup), so a client pasting
      // the token with or without the als_ prefix resolves identically.
      tokenHash: hashToken(raw.startsWith(TOKEN_PREFIX) ? raw.slice(TOKEN_PREFIX.length) : raw),
      label: typeof label === "string" ? label.slice(0, 128) : null,
      scope: effectiveScope,
      runId: effectiveScope === "single" ? String(runId) : null,
      createdByEmail: req.userEmail || null,
    } as any);

    res.status(201).json({
      token: raw, // shown exactly once — the DB holds only the hash
      id,
      scope: effectiveScope,
      runId: effectiveScope === "single" ? String(runId) : null,
      label: typeof label === "string" ? label.slice(0, 128) : null,
    });
  } catch (error) {
    console.error("[Share Controller Error] createShareToken:", error);
    res.status(500).json({ error: "Failed to create share token" });
  }
}

export async function revokeShareToken(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.workspaceId;
    if (!workspaceId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "Database unavailable" });
      return;
    }
    const id = param(req, "tokenId");
    const updated = await db
      .update(workflowShareTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(workflowShareTokens.id, id),
          eq(workflowShareTokens.workspaceId, workspaceId),
          isNull(workflowShareTokens.revokedAt)
        )
      )
      .returning()
      .then((rows: any[]) => rows.map((r) => ({ id: r.id })));
    if (updated.length === 0) {
      res.status(404).json({ error: "Active share token not found" });
      return;
    }
    res.status(200).json({ message: "Share token revoked", id });
  } catch (error) {
    console.error("[Share Controller Error] revokeShareToken:", error);
    res.status(500).json({ error: "Failed to revoke share token" });
  }
}

// -----------------------------------------------------------------------------
// Public, token-scoped reads. Workspace identity comes from the token hash.
// -----------------------------------------------------------------------------

async function resolveShare(req: Request): Promise<{
  token: any;
  db: any;
} | null> {
  const db = await getDb();
  if (!db) return null;
  const raw = resolveToken(
    String(req.headers["x-share-token"] || req.query?.token || "")
  );
  if (!raw) return null;
  const tokenRows = await db
    .select()
    .from(workflowShareTokens)
    .where(
      and(
        eq(workflowShareTokens.tokenHash, hashToken(raw)),
        isNull(workflowShareTokens.revokedAt)
      )
    )
    .limit(1);
  if (tokenRows.length === 0) return null;
  return { token: tokenRows[0], db };
}

function scopeFilter(token: any) {
  return token.scope === "single" && token.runId
    ? eq(workflowRuns.id, token.runId)
    : undefined;
}

export async function getSharedRuns(req: Request, res: Response): Promise<void> {
  try {
    const resolved = await resolveShare(req);
    if (!resolved) {
      res.status(401).json({ error: "Invalid or revoked share link" });
      return;
    }
    const { token, db } = resolved;

    const where = scopeFilter(token);
    const base = db.select().from(workflowRuns);
    const rows = where
      ? await base.where(where).orderBy(desc(workflowRuns.createdAt)).limit(50)
      : await base.where(eq(workflowRuns.workspaceId, token.workspaceId)).orderBy(desc(workflowRuns.createdAt)).limit(50);

    // Explicit projection: nothing tenant-sensitive, no spreads of the row.
    const runs = rows.map((r: any) => ({
      id: r.id,
      workflowId: r.workflowId,
      status: r.status,
      triggerSource: r.triggerSource,
      startedAt: r.startedAt,
      completedAt: r.completedAt,
      errorMessage: r.errorMessage,
      createdAt: r.createdAt,
    }));

    // Real workflow names for the runs in this page (batched, workspace-scoped).
    const wfIds = Array.from(
      new Set(
        rows.map((r: any) => r.workflowId).filter(Boolean) as string[]
      )
    );
    const names = new Map<string, string>();
    for (const wfId of wfIds) {
      const wf = await db
        .select({ id: workflows.id, name: workflows.name })
        .from(workflows)
        .where(
          and(eq(workflows.id, wfId), eq(workflows.workspaceId, token.workspaceId))
        )
        .limit(1);
      if (wf.length > 0) names.set(wfId, wf[0].name);
    }

    // Touch access stamp (best-effort; never blocks the read).
    try {
      await db
        .update(workflowShareTokens)
        .set({ lastAccessedAt: new Date() })
        .where(eq(workflowShareTokens.id, token.id));
    } catch {
      /* non-fatal */
    }

    res.status(200).json({
      runs: runs.map((r: any) => ({ ...r, workflowName: names.get(r.workflowId) || "Workflow" })),
      scope: token.scope,
      label: token.label || null,
    });
  } catch (error) {
    console.error("[Share Controller Error] getSharedRuns:", error);
    res.status(500).json({ error: "Failed to load shared runs" });
  }
}

export async function getSharedRunDetail(req: Request, res: Response): Promise<void> {
  try {
    const resolved = await resolveShare(req);
    if (!resolved) {
      res.status(401).json({ error: "Invalid or revoked share link" });
      return;
    }
    const { token, db } = resolved;
    const runId = String(req.params?.runId || "");

    const runRows = await db
      .select()
      .from(workflowRuns)
      .where(and(eq(workflowRuns.id, runId), eq(workflowRuns.workspaceId, token.workspaceId)))
      .limit(1);
    if (runRows.length === 0) {
      res.status(404).json({ error: "Run not found" });
      return;
    }
    const run = runRows[0];

    const wfRows = await db
      .select({ id: workflows.id, name: workflows.name, description: workflows.description })
      .from(workflows)
      .where(eq(workflows.id, run.workflowId))
      .limit(1);

    const artifacts = await db
      .select({
        id: workflowArtifacts.id,
        title: workflowArtifacts.title,
        artifactType: workflowArtifacts.artifactType,
        status: workflowArtifacts.status,
        summary: workflowArtifacts.summary,
        content: workflowArtifacts.content,
        qualityScore: workflowArtifacts.qualityScore,
        qualityGrade: workflowArtifacts.qualityGrade,
        verificationNotes: workflowArtifacts.verificationNotes,
        createdAt: workflowArtifacts.createdAt,
      })
      .from(workflowArtifacts)
      .where(eq(workflowArtifacts.workflowRunId, runId));

    const steps = await db
      .select({
        id: workflowRunSteps.id,
        status: workflowRunSteps.status,
        startedAt: workflowRunSteps.startedAt,
        completedAt: workflowRunSteps.completedAt,
        latencyMs: workflowRunSteps.latencyMs,
        cost: workflowRunSteps.cost,
        errorMessage: workflowRunSteps.errorMessage,
      })
      .from(workflowRunSteps)
      .where(eq(workflowRunSteps.workflowRunId, runId));

    const totalCost = steps.reduce(
      (sum: number, s: any) => sum + (parseFloat(s.cost || "0") || 0),
      0
    );
    const totalLatencyMs = steps.reduce(
      (sum: number, s: any) => sum + (s.latencyMs || 0),
      0
    );

    res.status(200).json({
      run: {
        id: run.id,
        status: run.status,
        triggerSource: run.triggerSource,
        startedAt: run.startedAt,
        completedAt: run.completedAt,
        errorMessage: run.errorMessage,
      },
      workflow: wfRows.length > 0 ? wfRows[0] : null,
      steps,
      artifacts,
      totalCost: totalCost.toFixed(6),
      totalLatencyMs,
      scope: token.scope,
    });
  } catch (error) {
    console.error("[Share Controller Error] getSharedRunDetail:", error);
    res.status(500).json({ error: "Failed to load shared run detail" });
  }
}
