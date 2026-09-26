import { describe, it, expect, vi } from "vitest";
import { insertAuditLog, type AuditLogValues } from "./audit-logger";

type Call = Record<string, unknown>;

// Minimal drizzle-shaped db double: insert(table).values(row) with a
// scripted error sequence, recording every attempted row.
function makeDb(errors: unknown[]) {
  const calls: Call[] = [];
  const values = vi.fn(async (v: Call) => {
    calls.push(v);
    const err = errors[calls.length - 1];
    if (err) throw err;
    return undefined;
  });
  const db = { insert: vi.fn(() => ({ values })) };
  return { db, calls };
}

const baseLog: AuditLogValues = {
  workspaceId: "00000000-0000-0000-0000-000000000001",
  workflowId: "a98c5024-c5db-4f26-9d6f-ddc4fa6cec89",
  agentId: "75ee7a40-5aca-430b-917c-ef67847e209b",
  actionType: "agent_step_execution",
  model: "gemini-2.5-flash",
  payloadIn: { result: "" },
  payloadOut: { result: "", artifactsCount: 0 },
  status: "success",
  policyChecks: { saifPassed: true, toolsExecutedCount: 1 },
};

// Raw postgres.js error shape for a dangling agents reference.
const rawFkError = Object.assign(
  new Error("insert into \"audit_logs\" violates foreign key constraint"),
  {
    code: "23503",
    constraint: "audit_logs_agent_id_agents_id_fk",
    detail:
      'Key (agent_id)=(75ee7a40-5aca-430b-917c-ef67847e209b) is not present in table "agents".',
  }
);

describe("insertAuditLog", () => {
  it("returns true and forwards values on a clean insert", async () => {
    const { db, calls } = makeDb([null]);
    const ok = await insertAuditLog(db, baseLog);
    expect(ok).toBe(true);
    expect(calls).toHaveLength(1);
    expect(calls[0].agentId).toBe("75ee7a40-5aca-430b-917c-ef67847e209b");
  });

  it("never rejects: FK violation on agent_id retries once with NULL and marks policy_checks", async () => {
    const { db, calls } = makeDb([rawFkError, null]);
    const ok = await insertAuditLog(db, baseLog);
    expect(ok).toBe(true);
    expect(calls).toHaveLength(2);
    expect(calls[0].agentId).toBe("75ee7a40-5aca-430b-917c-ef67847e209b");
    expect(calls[1].agentId).toBeNull();
    const checks = calls[1].policyChecks as Record<string, unknown>;
    expect(checks.agentIdDropped).toBe(true);
    expect(checks.droppedAgentId).toBe("75ee7a40-5aca-430b-917c-ef67847e209b");
    // Everything else survives the fallback untouched.
    expect(calls[1].actionType).toBe("agent_step_execution");
    expect(calls[1].status).toBe("success");
  });

  it("detects FK violations wrapped by drizzle (DrizzleQueryError.cause chain)", async () => {
    const wrapped = Object.assign(new Error('Failed query: insert into "audit_logs"'), {
      cause: { code: "23503", detail: 'Key (agent_id)=(x) is not present in table "agents".' },
    });
    const { db, calls } = makeDb([wrapped, null]);
    const ok = await insertAuditLog(db, { ...baseLog, agentId: "x" });
    expect(ok).toBe(true);
    expect(calls).toHaveLength(2);
    expect(calls[1].agentId).toBeNull();
  });

  it("does not retry when agentId is already NULL and some other FK breaks", async () => {
    const { db, calls } = makeDb([
      Object.assign(new Error("fk"), { code: "23503", detail: 'Key (workflow_id)=(x) not in "workflows".' }),
    ]);
    const ok = await insertAuditLog(db, { ...baseLog, agentId: null });
    expect(ok).toBe(false);
    expect(calls).toHaveLength(1);
  });

  it("degrades unrelated insert failures to a false return, never a throw", async () => {
    const { db, calls } = makeDb([new Error("connection terminated unexpectedly")]);
    await expect(insertAuditLog(db, baseLog)).resolves.toBe(false);
    expect(calls).toHaveLength(1);
    expect(calls[0].agentId).toBe("75ee7a40-5aca-430b-917c-ef67847e209b");
  });

  it("returns false (without throw) when even the NULL-agent retry fails", async () => {
    const { db, calls } = makeDb([rawFkError, new Error("still failing")]);
    await expect(insertAuditLog(db, baseLog)).resolves.toBe(false);
    expect(calls).toHaveLength(2);
  });
});
