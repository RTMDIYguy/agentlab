import type { Request, Response } from "express";
import { decodeJwt } from "jose";
import { and, eq } from "drizzle-orm";
import { getDb } from "../db";
import { users, teardownSessions } from "../schema";
import { param } from "./params";
import {
  TEARDOWN_MAX_VIDEO_BYTES,
  TEARDOWN_MAX_BASE64_CHARS,
} from "../teardown/router";

/**
 * REST endpoints for teardown session video blobs.
 *
 * The metadata (title/duration/notes/brief) travels through the tRPC
 * teardown router; the .webm binary travels through these endpoints:
 *  - POST   /api/teardown/:id/video   upload/replace the .webm (base64 JSON)
 *  - GET    /api/teardown/:id/video   stream the .webm
 *  - DELETE /api/teardown/:id/video   delete only the video, keep metadata
 *
 * All endpoints authenticate through tenantMiddleware (Bearer JWT, or the
 * legacy fallback the rest of the app uses) and scope every query to
 * req.workspaceId so a workspace can never read another's recordings.
 */

/**
 * Resolve the caller's workspace the same way tenantMiddleware does: Bearer
 * JWT email -> users row (by email column) -> workspaceId. req.workspaceId
 * from the middleware is only a fallback because its god-mode list maps to
 * a different workspace constant than the user's actual record.
 */
async function resolveWorkspaceId(req: Request): Promise<string | null> {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const decoded = decodeJwt(authHeader.slice("Bearer ".length));
      const email = decoded?.email as string | undefined;
      if (email) {
        const db = await getDb();
        if (db) {
          const rows = await db
            .select({ workspaceId: users.workspaceId })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);
          if (rows[0]?.workspaceId) return rows[0].workspaceId;
        }
      }
    } catch {
      // fall through to the middleware-resolved value
    }
  }
  return req.workspaceId ?? null;
}

function notAuthorized(res: Response): boolean {
  res.status(401).json({ error: "Unauthorized" });
  return false;
}

export async function uploadTeardownVideo(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const workspaceId = await resolveWorkspaceId(req);
    if (!workspaceId) {
      notAuthorized(res);
      return;
    }

    const sessionId = param(req, "id");
    if (!sessionId) {
      res.status(400).json({ error: "Missing session id" });
      return;
    }

    const raw = req.body?.videoData;
    if (typeof raw !== "string" || raw.length === 0) {
      res.status(400).json({ error: "Missing videoData base64 payload" });
      return;
    }

    if (raw.length > TEARDOWN_MAX_BASE64_CHARS) {
      res.status(413).json({ error: "Recording exceeds the 36 MB limit" });
      return;
    }

    const buffer = Buffer.from(raw, "base64");
    if (buffer.length === 0) {
      res.status(400).json({ error: "Invalid base64 video payload" });
      return;
    }
    if (buffer.length > TEARDOWN_MAX_VIDEO_BYTES) {
      res.status(413).json({ error: "Recording exceeds the 36 MB limit" });
      return;
    }

    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "Database unavailable" });
      return;
    }

    const updated = await db
      .update(teardownSessions)
      .set({
        videoData: buffer,
        sizeBytes: buffer.length,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(teardownSessions.id, sessionId),
          eq(teardownSessions.workspaceId, workspaceId)
        )
      )
      .returning({ id: teardownSessions.id });

    if (updated.length === 0) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    res.status(200).json({ ok: true, sizeBytes: buffer.length });
  } catch (error) {
    console.error("[TeardownVideo] upload error:", error);
    res.status(500).json({ error: "Failed to store recording" });
  }
}

export async function downloadTeardownVideo(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const workspaceId = await resolveWorkspaceId(req);
    if (!workspaceId) {
      notAuthorized(res);
      return;
    }

    const sessionId = param(req, "id");
    if (!sessionId) {
      res.status(400).json({ error: "Missing session id" });
      return;
    }

    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "Database unavailable" });
      return;
    }

    const rows = await db
      .select({
        videoData: teardownSessions.videoData,
        title: teardownSessions.title,
      })
      .from(teardownSessions)
      .where(
        and(
          eq(teardownSessions.id, sessionId),
          eq(teardownSessions.workspaceId, workspaceId)
        )
      )
      .limit(1);

    const row = rows[0];
    if (!row || row.videoData == null) {
      res.status(404).json({ error: "Recording not found" });
      return;
    }

    const buffer = row.videoData as Buffer;

    res.setHeader("Content-Type", "video/webm");
    res.setHeader("Content-Length", String(buffer.length));
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${row.title.replace(/[^\w.-]+/g, "_").slice(0, 80)}.webm"`
    );
    res.status(200).end(buffer);
  } catch (error) {
    console.error("[TeardownVideo] download error:", error);
    res.status(500).json({ error: "Failed to retrieve recording" });
  }
}

export async function deleteTeardownVideo(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const workspaceId = await resolveWorkspaceId(req);
    if (!workspaceId) {
      notAuthorized(res);
      return;
    }

    const sessionId = param(req, "id");
    if (!sessionId) {
      res.status(400).json({ error: "Missing session id" });
      return;
    }

    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "Database unavailable" });
      return;
    }

    const updated = await db
      .update(teardownSessions)
      .set({
        videoData: null,
        sizeBytes: 0,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(teardownSessions.id, sessionId),
          eq(teardownSessions.workspaceId, workspaceId)
        )
      )
      .returning({ id: teardownSessions.id });

    if (updated.length === 0) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("[TeardownVideo] delete error:", error);
    res.status(500).json({ error: "Failed to delete recording" });
  }
}
