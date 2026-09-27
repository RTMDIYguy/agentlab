import type { Request, Response } from "express";
import { and, asc, eq } from "drizzle-orm";
import { getDb } from "../db";
import { opsAgentMessages } from "../schema";

// CC-2026-09-25-011: workspace-scoped persistence for the Ops Agent chat.
// The conversation previously lived in React state only — a refresh or
// dev-server restart silently erased the thread along with any DAG proposals
// still being edited. Endpoints (all workspace-scoped via req.workspaceId):
//   GET    /api/orchestrator/chat/:threadId           → ordered messages
//   POST   /api/orchestrator/chat/:threadId/messages  → append one message
//   PATCH  /api/orchestrator/chat/messages/:id        → update run outcome
//   DELETE /api/orchestrator/chat/:threadId           → clear the thread

const VALID_ROLES = new Set(["user", "assistant", "watchdog"]);
const VALID_EXECUTION_STATUSES = new Set([
  "idle",
  "running",
  "completed",
  "failed",
  "paused",
]);
const MAX_CONTENT_LENGTH = 20_000;

type ChatMessageRow = {
  id: string;
  role: string;
  content: string;
  proposal: unknown;
  runResult: unknown;
  executionStatus: string | null;
  createdAt: Date;
};

function toClientShape(row: ChatMessageRow) {
  return {
    id: row.id,
    role: row.role,
    content: row.content,
    proposal: row.proposal ?? undefined,
    runResult: row.runResult ?? undefined,
    executionStatus: row.executionStatus ?? undefined,
    createdAt: row.createdAt,
  };
}

export async function getOpsAgentThread(
  req: Request,
  res: Response
): Promise<void> {
  const workspaceId = req.workspaceId;
  if (!workspaceId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const threadId = String(req.params.threadId || "").trim().slice(0, 64);
  if (!threadId) {
    res.status(400).json({ error: "threadId is required" });
    return;
  }

  const db = await getDb();
  if (!db) {
    res.status(503).json({ error: "Database unavailable" });
    return;
  }

  const rows = await db
    .select()
    .from(opsAgentMessages)
    .where(
      and(
        eq(opsAgentMessages.workspaceId, workspaceId),
        eq(opsAgentMessages.threadId, threadId)
      )
    )
    .orderBy(asc(opsAgentMessages.createdAt))
    .limit(200);

  res.status(200).json({ messages: rows.map(toClientShape) });
}

export async function appendOpsAgentMessage(
  req: Request,
  res: Response
): Promise<void> {
  const workspaceId = req.workspaceId;
  if (!workspaceId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const threadId = String(req.params.threadId || "").trim().slice(0, 64);
  const { role, content, proposal, runResult, executionStatus } = req.body as {
    role?: string;
    content?: string;
    proposal?: unknown;
    runResult?: unknown;
    executionStatus?: string;
  };

  if (!threadId) {
    res.status(400).json({ error: "threadId is required" });
    return;
  }
  if (!role || !VALID_ROLES.has(role)) {
    res
      .status(400)
      .json({ error: `role must be one of: ${Array.from(VALID_ROLES).join(", ")}` });
    return;
  }
  if (typeof content !== "string" || !content.trim()) {
    res.status(400).json({ error: "content is required" });
    return;
  }

  const db = await getDb();
  if (!db) {
    res.status(503).json({ error: "Database unavailable" });
    return;
  }

  const [inserted] = await db
    .insert(opsAgentMessages)
    .values({
      workspaceId,
      threadId,
      role,
      content: content.slice(0, MAX_CONTENT_LENGTH),
      proposal: (proposal ?? null) as Record<string, unknown> | null,
      runResult: (runResult ?? null) as Record<string, unknown> | null,
      executionStatus:
        executionStatus && VALID_EXECUTION_STATUSES.has(executionStatus)
          ? executionStatus
          : null,
    })
    .returning();

  res.status(201).json({ message: toClientShape(inserted) });
}

export async function updateOpsAgentMessage(
  req: Request,
  res: Response
): Promise<void> {
  const workspaceId = req.workspaceId;
  if (!workspaceId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const messageId = String(req.params.id || "").trim();
  const { executionStatus, runResult } = req.body as {
    executionStatus?: string;
    runResult?: unknown;
  };

  if (
    !messageId ||
    (executionStatus !== undefined &&
      !VALID_EXECUTION_STATUSES.has(executionStatus))
  ) {
    res.status(400).json({ error: "Invalid message id or executionStatus" });
    return;
  }

  const db = await getDb();
  if (!db) {
    res.status(503).json({ error: "Database unavailable" });
    return;
  }

  const updateSet: Record<string, unknown> = {};
  if (executionStatus !== undefined) updateSet.executionStatus = executionStatus;
  if (runResult !== undefined)
    updateSet.runResult = runResult as Record<string, unknown> | null;
  if (Object.keys(updateSet).length === 0) {
    res.status(400).json({ error: "Nothing to update" });
    return;
  }

  const [updated] = await db
    .update(opsAgentMessages)
    .set(updateSet)
    .where(
      and(
        eq(opsAgentMessages.id, messageId),
        eq(opsAgentMessages.workspaceId, workspaceId)
      )
    )
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Message not found in this workspace" });
    return;
  }
  res.status(200).json({ message: toClientShape(updated) });
}

export async function clearOpsAgentThread(
  req: Request,
  res: Response
): Promise<void> {
  const workspaceId = req.workspaceId;
  if (!workspaceId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const threadId = String(req.params.threadId || "").trim().slice(0, 64);
  if (!threadId) {
    res.status(400).json({ error: "threadId is required" });
    return;
  }

  const db = await getDb();
  if (!db) {
    res.status(503).json({ error: "Database unavailable" });
    return;
  }

  await db
    .delete(opsAgentMessages)
    .where(
      and(
        eq(opsAgentMessages.workspaceId, workspaceId),
        eq(opsAgentMessages.threadId, threadId)
      )
    );

  res.status(200).json({ ok: true });
}
