// CC-2026-09-25-008: audit_logs is governance telemetry, not a step's product.
// On 2026-09-26 a re-run of the "Initiate Partnership Workflow" executed the
// Market Analyst agent successfully (1995 tokens, 1 real tool call) and then
// FAILED the step because the success-path audit insert hit a foreign-key
// violation: the step row was synced before CC-2026-09-25-007 and carried an
// agent_id whose agents row no longer exists. An insert of evidence must never
// be able to kill the work it is evidence FOR.
//
// Contract of insertAuditLog:
//   1. Best effort — never throws, never rejects.
//   2. On FK violation naming agent_id (postgres SQLSTATE 23503), retries once
//      with agentId bound to NULL and records the drop in policy_checks so the
//      audit trail stays honest about what happened.
//   3. On any other failure (missing column, connection blip, malformed jsonb),
//      logs a warning and returns false. The workflow run continues.

export interface AuditLogValues {
  workspaceId: string | null;
  workflowId: string | null;
  agentId?: string | null;
  actionType: string;
  model: string;
  payloadIn: unknown;
  payloadOut: unknown;
  tokensPrompt?: number;
  tokensCompletion?: number;
  tokensTotal?: number;
  cost?: string;
  latencyMs?: number;
  status: string;
  errorMessage?: string | null;
  policyChecks?: Record<string, unknown>;
}

// Structural db type so the helper is unit-testable without a live database.
// Deliberately loose (any param) so any drizzle PostgresJsDatabase satisfies
// it without dragging drizzle's generics into the contract.
export interface AuditDbLike {
  insert: (table: any) => {
    values: (values: Record<string, unknown>) => PromiseLike<unknown>;
  };
}

interface FkErrorShape {
  code?: string;
  constraint?: string;
  detail?: string;
  cause?: FkErrorShape;
}

// postgres.js raises the raw pg error; drizzle may wrap it, so walk the cause
// chain looking for SQLSTATE 23503 (foreign_key_violation) on agent_id.
function findAgentIdFkViolation(err: unknown): FkErrorShape | undefined {
  let cursor = err as FkErrorShape | undefined;
  for (let depth = 0; cursor && depth < 5; depth++) {
    const mentionsAgentId =
      typeof cursor.constraint === "string" &&
      cursor.constraint.includes("agent_id");
    const detailMentionsAgentId =
      typeof cursor.detail === "string" && cursor.detail.includes("agent_id");
    if (cursor.code === "23503" && (mentionsAgentId || detailMentionsAgentId)) {
      return cursor;
    }
    cursor = cursor.cause;
  }
  return undefined;
}

export async function insertAuditLog(
  db: AuditDbLike,
  log: AuditLogValues
): Promise<boolean> {
  try {
    await db.insert("audit_logs").values(log as unknown as Record<string, unknown>);
    return true;
  } catch (err) {
    const fk = findAgentIdFkViolation(err);
    if (fk && log.agentId) {
      // The agents row behind this id is gone (deleted agent, or a stale id
      // synced before CC-2026-09-25-007). Retry with the agent reference
      // dropped, and say so in policy_checks instead of losing the event.
      try {
        await db.insert("audit_logs").values({
          ...(log as unknown as Record<string, unknown>),
          agentId: null,
          policyChecks: {
            ...(log.policyChecks || {}),
            agentIdDropped: true,
            droppedAgentId: log.agentId,
          },
        });
        console.warn(
          `[AuditLogger] audit insert hit dangling agent_id ${log.agentId}; retried with NULL (recorded in policy_checks).`
        );
        return true;
      } catch (retryErr) {
        console.warn(
          "[AuditLogger] audit insert failed after agent_id fallback (non-fatal):",
          retryErr instanceof Error ? retryErr.message : retryErr
        );
        return false;
      }
    }
    console.warn(
      "[AuditLogger] audit insert failed (non-fatal):",
      err instanceof Error ? err.message : err
    );
    return false;
  }
}
