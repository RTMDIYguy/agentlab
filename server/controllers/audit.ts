import type { Request, Response } from "express";
import { desc, eq, and, gte, sql } from "drizzle-orm";
import { getDb } from "../db";
import { auditLogs, workflowRuns } from "../schema";

// NOTE ON HONESTY (see docs/operations/honesty-audit-2026-09-23.md, P1-1):
// This controller previously served six fabricated audit records whenever the
// database was empty, exported them from the CSV endpoint as "compliance
// evidence", and defaulted stats to invented values (1248 events, 99.8% SAIF,
// $0.48 cost). All of that is removed: empty means zero, unknown means null.

export async function getAuditLogs(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.workspaceId || "00000000-0000-0000-0000-000000000001";
    const statusFilter = req.query.status as string | undefined;
    const searchQuery = (req.query.q as string | undefined)?.toLowerCase();

    const db = await getDb();
    let logs: any[] = [];

    if (db) {
      try {
        const query = db
          .select()
          .from(auditLogs)
          .where(eq(auditLogs.workspaceId, workspaceId))
          .orderBy(desc(auditLogs.createdAt))
          .limit(100);

        const rows = await query;
        if (rows && rows.length > 0) {
          logs = rows.map(r => ({
            id: r.id,
            timestamp: r.createdAt.toISOString(),
            agent: r.agentId ? `Agent-${r.agentId.slice(0, 8)}` : "System",
            action: r.actionType,
            status: r.status,
            model: r.model,
            latencyMs: r.latencyMs,
            tokensTotal: r.tokensTotal,
            cost: r.cost,
            message: r.errorMessage || (r.payloadOut as any)?.message || `Executed ${r.actionType}`,
            policyChecks: r.policyChecks,
            details: r.payloadOut || r.payloadIn,
          }));
        }
      } catch (dbErr) {
        console.warn("[Audit Controller] DB query failed, using resilient fallback:", dbErr);
      }
    }

    // No fabricated fallback rows: an empty audit trail is reported as empty.

    if (statusFilter && statusFilter !== "all") {
      logs = logs.filter(l => l.status === statusFilter);
    }

    if (searchQuery) {
      logs = logs.filter(l =>
        l.action.toLowerCase().includes(searchQuery) ||
        l.agent.toLowerCase().includes(searchQuery) ||
        l.message.toLowerCase().includes(searchQuery) ||
        l.model.toLowerCase().includes(searchQuery)
      );
    }

    res.status(200).json({
      workspaceId,
      logs,
      totalCount: logs.length,
    });
  } catch (error: any) {
    console.error("[Audit Controller Error]:", error);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
}

export async function getAuditStats(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.workspaceId || "00000000-0000-0000-0000-000000000001";
    const db = await getDb();

    // Honest defaults: zero means zero. No invented events, alerts, cost, or
    // compliance percentage when the database has nothing to count.
    // CC-2026-10-02-013 (dispositions 2, 3, 7): the 24h fields are now
    // computed over a real 24-hour window — previously totalEvents24h counted
    // ALL time, securityAlerts was a never-assigned constant, and
    // totalCost24h was a hardcoded "0.000000".
    let totalEvents24h = 0;
    let pendingReviews = 0;
    let securityAlerts = 0;
    let totalCost24h = "0.000000";
    let saifComplianceRate: string | null = null;

    if (db) {
      try {
        const [pendingRunsCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(workflowRuns)
          .where(
            and(
              eq(workflowRuns.workspaceId, workspaceId),
              eq(workflowRuns.status, "paused_for_approval")
            )
          );

        if (pendingRunsCount) {
          pendingReviews = Number(pendingRunsCount.count);
        }

        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const eventsWindow = and(
          eq(auditLogs.workspaceId, workspaceId),
          gte(auditLogs.createdAt, dayAgo)
        );

        const [eventsCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(auditLogs)
          .where(eventsWindow);

        if (eventsCount) {
          totalEvents24h = Number(eventsCount.count);
        }

        // Real security alerts: error-status audit rows in the same 24h
        // window (was a constant 0 captioned "Zero unhandled breaches").
        const [alertsCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(auditLogs)
          .where(and(eventsWindow, eq(auditLogs.status, "error")));

        if (alertsCount) {
          securityAlerts = Number(alertsCount.count);
        }

        // Real 24h cost from persisted per-row costs.
        const [costRow] = await db
          .select({ total: sql<string>`coalesce(sum(${auditLogs.cost}), 0)` })
          .from(auditLogs)
          .where(eventsWindow);

        if (costRow) {
          totalCost24h = String(costRow.total);
        }

        // SAIF compliance rate computed from real policy checks; null (rendered
        // as "not reported") when no audited events exist yet.
        // CC-2026-10-02-011 (disposition 9): non-LLM events (syncs,
        // ingestions) now record evaluated:false instead of the all-true
        // default — counting those as "passed" would inflate compliance with
        // non-events, so they are excluded from the denominator. Legacy rows
        // (no `evaluated` key) keep counting as before.
        const [saifRow] = await db
          .select({
            total: sql<number>`count(*) filter (where (${auditLogs.policyChecks} ->> 'evaluated') is distinct from 'false')`,
            passed: sql<number>`count(*) filter (where (${auditLogs.policyChecks} -> 'saifPassed')::text = 'true')`,
          })
          .from(auditLogs)
          .where(eq(auditLogs.workspaceId, workspaceId));

        if (saifRow && Number(saifRow.total) > 0) {
          saifComplianceRate = `${((Number(saifRow.passed) / Number(saifRow.total)) * 100).toFixed(1)}%`;
        }
      } catch (dbErr) {
        console.warn("[Audit Stats] DB count warning:", dbErr);
      }
    }

    res.status(200).json({
      workspaceId,
      totalEvents24h,
      pendingReviews,
      securityAlerts,
      totalCost24h,
      saifComplianceRate,
    });
  } catch (error: any) {
    console.error("[Audit Stats Error]:", error);
    res.status(500).json({ error: "Failed to fetch audit telemetry stats" });
  }
}

export async function exportAuditLogs(req: Request, res: Response): Promise<void> {
  try {
    // Compliance export must reflect the REAL audit trail — never fabricated
    // rows. Unknown metrics export as empty cells.
    const workspaceId = req.workspaceId || "00000000-0000-0000-0000-000000000001";
    const db = await getDb();

    const headers = [
      "Log ID",
      "Timestamp",
      "Agent / Source",
      "Action Type",
      "Model",
      "Status",
      "Latency (ms)",
      "Tokens Total",
      "Cost ($)",
      "SAIF Passed",
      "PII Redactions",
      "Summary / Message",
    ];

    let rows: string[][] = [];
    if (db) {
      try {
        const dbLogs = await db
          .select()
          .from(auditLogs)
          .where(eq(auditLogs.workspaceId, workspaceId))
          .orderBy(desc(auditLogs.createdAt))
          .limit(1000);

        rows = dbLogs.map(r => [
          r.id,
          r.createdAt.toISOString(),
          `"${r.agentId ? `Agent-${r.agentId.slice(0, 8)}` : "System"}"`,
          `"${r.actionType}"`,
          r.model,
          r.status,
          r.latencyMs === null || r.latencyMs === undefined ? "" : String(r.latencyMs),
          r.tokensTotal === null || r.tokensTotal === undefined ? "" : String(r.tokensTotal),
          r.cost === null || r.cost === undefined ? "" : String(r.cost),
          (r.policyChecks as any)?.saifPassed === true ? "TRUE" : (r.policyChecks as any)?.saifPassed === false ? "FALSE" : "",
          String((r.policyChecks as any)?.piiDetected ?? ""),
          `"${String(r.errorMessage || (r.payloadOut as any)?.message || r.actionType).replace(/"/g, '""')}"`,
        ]);
      } catch (dbErr) {
        console.error("[Audit Export] DB query failed:", dbErr);
        res.status(500).json({ error: "Failed to read audit logs for export" });
        return;
      }
    } else {
      res.status(503).json({ error: "Database unavailable — audit export requires the real audit trail" });
      return;
    }

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="agentlab-audit-logs-${Date.now()}.csv"`);
    res.status(200).send(csvContent);
  } catch (error: any) {
    console.error("[Audit Export Error]:", error);
    res.status(500).json({ error: "Failed to export audit logs" });
  }
}

// CC-2026-10-02-013 (disposition 1): approveAuditAction / rejectAuditAction
// were removed — they were console.log stubs that returned success while the
// UI claimed "Workflow execution has resumed." The real Human-in-the-Loop
// approval surface is Command Center's Approval Queue (paused_for_approval
// runs), which is wired end to end.
