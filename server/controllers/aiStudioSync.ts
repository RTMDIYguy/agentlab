import type { Request, Response } from "express";
import { getDb } from "../db";
import {
  workspaces,
  agents,
  workflows,
  workflowRuns,
  workflowRunSteps,
  auditLogs,
} from "../schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { processPendingRuns } from "../execution/queue-processor";

// In-memory registered mobile webhook subscribers
interface MobileSubscriber {
  id: string;
  workspaceId: string;
  endpointUrl: string;
  registeredAt: string;
  deviceLabel?: string;
}

const mobileSubscribers: MobileSubscriber[] = [];

// In-memory queue for roaming data entries if DB is momentarily unavailable
interface RoamingDataEntry {
  id: string;
  workspaceId: string;
  source: string;
  dataType: "lead" | "voice_note" | "signal" | "observation" | "task_dispatch" | "telemetry" | "custom";
  payload: Record<string, any>;
  receivedAt: string;
  status: "ingested" | "routed_to_workflow" | "processed";
  routedWorkflowId?: string;
  routedRunId?: string;
}

const roamingDataBuffer: RoamingDataEntry[] = [];

/**
 * 1. GET /api/aistudio/state & /api/sync/state
 * Exports the live bidirectional operational state of AgentLab OS to the AI Studio mobile dashboard.
 */
export async function getSyncState(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.workspaceId || "00000000-0000-0000-0000-000000000001";
    const db = await getDb();

    let workspaceWorkflows: any[] = [];
    let recentRuns: any[] = [];
    let pendingApprovals: any[] = [];
    let recentAuditLogs: any[] = [];
    let workspaceAgents: any[] = [];
    let lastStepLatencyMs: number | null = null;
    let monthSpend: string | null = null;
    const nowTs = new Date();
    const monthStart = new Date(nowTs.getFullYear(), nowTs.getMonth(), 1);

    if (db) {
      try {
        workspaceWorkflows = await db
          .select()
          .from(workflows)
          .where(eq(workflows.workspaceId, workspaceId));

        recentRuns = await db
          .select()
          .from(workflowRuns)
          .where(eq(workflowRuns.workspaceId, workspaceId))
          .orderBy(desc(workflowRuns.createdAt))
          .limit(20);

        pendingApprovals = recentRuns.filter(
          (r: any) => r.status === "paused_for_approval"
        );

        recentAuditLogs = await db
          .select()
          .from(auditLogs)
          .where(eq(auditLogs.workspaceId, workspaceId))
          .orderBy(desc(auditLogs.createdAt))
          .limit(15);

        // Real-state fields (CC-2026-10-02-011, disposition 9): the phone
        // was still being shown the 450ms / $12.50 / 5-agents / saif:true
        // fiction removed from the web Dashboard in CC-2026-09-23-012.
        workspaceAgents = await db
          .select()
          .from(agents)
          .where(eq(agents.workspaceId, workspaceId));

        const [lastStep] = await db
          .select({ latencyMs: workflowRunSteps.latencyMs })
          .from(workflowRunSteps)
          .where(
            and(
              eq(workflowRunSteps.workspaceId, workspaceId),
              eq(workflowRunSteps.status, "completed")
            )
          )
          .orderBy(desc(workflowRunSteps.completedAt))
          .limit(1);
        lastStepLatencyMs = lastStep?.latencyMs ?? null;

        const [spendRow] = await db
          .select({ total: sql<string | null>`sum(${workflowRunSteps.cost})` })
          .from(workflowRunSteps)
          .where(
            and(
              eq(workflowRunSteps.workspaceId, workspaceId),
              gte(workflowRunSteps.completedAt, monthStart)
            )
          );
        monthSpend = spendRow?.total ?? null;
      } catch (dbErr) {
        console.warn("[AI Studio Sync] Database query error while compiling state:", dbErr);
      }
    }

    const activeRuns = recentRuns.filter(
      (r: any) => r.status === "running" || r.status === "pending"
    ).length;

    // Recent mobile ingestion events from the buffer
    const workspaceRoamingEntries = roamingDataBuffer
      .filter((e) => e.workspaceId === workspaceId)
      .slice(-10);

    const syncPayload = {
      version: "2.0.0-mobile-sync",
      syncedAt: new Date().toISOString(),
      workspaceId,
      // Unknowns are null — never invented. `status` is derived from real
      // pending approvals and recent failures instead of a static claim.
      systemHealth: {
        status:
          pendingApprovals.length > 0 ||
          recentRuns.some((r: any) => r.status === "failed")
            ? "attention"
            : "nominal",
        orchestratorLatencyMs: lastStepLatencyMs,
        saifGuardrailsActive:
          recentAuditLogs.find(
            (l: any) => l.policyChecks?.saifPassed !== undefined
          )?.policyChecks?.saifPassed ?? null,
        queueLoad: activeRuns,
      },
      metrics: {
        activeSwarmAgents: workspaceAgents.filter((a: any) => a.status === "active")
          .length,
        activeTasks: activeRuns,
        pendingApprovalsCount: pendingApprovals.length,
        totalWorkflows: workspaceWorkflows.length,
        totalHistoricalRuns: recentRuns.length,
        estimatedSpendMonthly: monthSpend,
      },
      workflows: workspaceWorkflows.map((wf) => ({
        id: wf.id,
        name: wf.name,
        triggerType: wf.triggerType,
        status: wf.status,
        cronExpression: wf.cronExpression,
        nextRunAt: wf.nextRunAt,
      })),
      pendingApprovals: pendingApprovals.map((pa) => ({
        runId: pa.id,
        workflowId: pa.workflowId,
        startedAt: pa.startedAt,
        initialContext: pa.initialContext,
      })),
      recentAuditLogs: recentAuditLogs.map((log) => ({
        id: log.id,
        actionType: log.actionType,
        model: log.model,
        status: log.status,
        latencyMs: log.latencyMs,
        createdAt: log.createdAt,
      })),
      recentRoamingIngestions: workspaceRoamingEntries,
    };

    res.status(200).json(syncPayload);
  } catch (error: any) {
    console.error("[AI Studio Sync Error - getSyncState]:", error);
    res.status(500).json({ error: "Failed to retrieve AgentLab OS state." });
  }
}

/**
 * 2. POST /api/aistudio/ingest & /api/sync/ingest
 * Ingests roaming & mobile data (leads, voice transcripts, observations, quick tasks) from AI Studio.
 */
export async function ingestRoamingData(req: Request, res: Response): Promise<void> {
  const ingestStartedAt = Date.now();
  try {
    const workspaceId = req.workspaceId || "00000000-0000-0000-0000-000000000001";
    const {
      source = "AI_STUDIO_MOBILE",
      dataType = "observation",
      payload = {},
      triggerWorkflowId,
      autoExecute = false,
      notes,
    } = req.body || {};

    const ingestionId = `ing_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
    const receivedAt = new Date().toISOString();

    const entry: RoamingDataEntry = {
      id: ingestionId,
      workspaceId,
      source: String(source),
      dataType,
      payload: {
        ...payload,
        notes: notes || payload.notes,
        ingestedVia: "Google AI Studio Mobile Bridge",
      },
      receivedAt,
      status: "ingested",
    };

    const db = await getDb();

    // 1. Record in Audit Log
    if (db) {
      try {
        await db.insert(auditLogs).values({
          workspaceId,
          actionType: `ROAMING_INGESTION:${dataType.toUpperCase()}`,
          model: "not-llm-dispatch",
          payloadIn: {
            ingestionId,
            source,
            dataType,
            payload: entry.payload,
          },
          payloadOut: {
            status: "SUCCESS_INGESTED",
            ingestionId,
          },
          // Honest telemetry (CC-2026-10-02-011, disposition 9): no LLM ran
          // here, so tokens/cost are genuinely zero, latency is measured,
          // and the guardrail checks are marked NOT evaluated — the previous
          // invented all-true checks (on a payload containing a person's
          // name) were inflating the SAIF compliance rate with non-events.
          tokensPrompt: 0,
          tokensCompletion: 0,
          tokensTotal: 0,
          cost: "0.000000",
          latencyMs: Date.now() - ingestStartedAt,
          status: "success",
          billed: false,
          policyChecks: {
            saifPassed: null,
            piiDetected: null,
            budgetThresholdPassed: null,
            evaluated: false,
            note: "not-llm-dispatch: no guardrail evaluation performed",
          },
        });
      } catch (auditErr) {
        console.warn("[AI Studio Ingest] Failed to record audit log:", auditErr);
      }
    }

    // 2. Auto-route to specific workflow DAG if requested
    let routedRunId: string | undefined;
    if (triggerWorkflowId && db) {
      try {
        const matchingWf = await db
          .select()
          .from(workflows)
          .where(
            and(
              eq(workflows.id, triggerWorkflowId),
              eq(workflows.workspaceId, workspaceId)
            )
          )
          .limit(1);

        if (matchingWf.length > 0) {
          const runId = randomUUID();
          await db.insert(workflowRuns).values({
            id: runId,
            workspaceId,
            workflowId: triggerWorkflowId,
            status: "pending",
            triggerSource: `AI_STUDIO_INGESTION:${ingestionId}`,
            initialContext: entry.payload,
          } as any);

          routedRunId = runId;
          entry.status = "routed_to_workflow";
          entry.routedWorkflowId = triggerWorkflowId;
          entry.routedRunId = runId;

          if (autoExecute) {
            await processPendingRuns();
          }
        }
      } catch (wfErr) {
        console.warn("[AI Studio Ingest] Workflow trigger error:", wfErr);
      }
    }

    roamingDataBuffer.push(entry);
    // Keep buffer bounded
    if (roamingDataBuffer.length > 200) {
      roamingDataBuffer.shift();
    }

    // Broadcast to any registered mobile webhooks asynchronously
    dispatchMobileWebhooks({
      eventType: "ROAMING_DATA_INGESTED",
      workspaceId,
      ingestionId,
      entry,
    }).catch((err) => console.warn("[AI Studio Ingest] Webhook dispatch warning:", err));

    res.status(201).json({
      success: true,
      message: `Roaming data successfully ingested into AgentLab OS.`,
      ingestionId,
      receivedAt,
      dataType,
      status: entry.status,
      routedRunId,
    });
  } catch (error: any) {
    console.error("[AI Studio Ingest Error]:", error);
    res.status(500).json({ error: error.message || "Failed to ingest roaming data." });
  }
}

/**
 * 3. POST /api/aistudio/action
 * Remote command execution from mobile dashboard to trigger workflows, approvals, or swarms.
 */
export async function executeRemoteAction(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.workspaceId || "00000000-0000-0000-0000-000000000001";
    const { action, workflowId, runId, payload } = req.body || {};

    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "Database unavailable" });
      return;
    }

    switch (action) {
      case "trigger_workflow": {
        if (!workflowId) {
          res.status(400).json({ error: "workflowId is required for trigger_workflow" });
          return;
        }

        const newRunId = randomUUID();
        await db.insert(workflowRuns).values({
          id: newRunId,
          workspaceId,
          workflowId,
          status: "pending",
          triggerSource: "AI_STUDIO_REMOTE_ACTION",
          initialContext: payload || {},
        } as any);

        await processPendingRuns();

        res.status(200).json({
          success: true,
          message: "Workflow triggered from mobile interface.",
          runId: newRunId,
        });
        return;
      }

      case "approve_run": {
        if (!runId) {
          res.status(400).json({ error: "runId is required for approve_run" });
          return;
        }

        await db
          .update(workflowRuns)
          .set({ status: "pending", updatedAt: new Date() })
          .where(and(eq(workflowRuns.id, runId), eq(workflowRuns.workspaceId, workspaceId)));

        await processPendingRuns();

        res.status(200).json({
          success: true,
          message: `Run ${runId} approved and resumed from mobile interface.`,
        });
        return;
      }

      case "reject_run": {
        if (!runId) {
          res.status(400).json({ error: "runId is required for reject_run" });
          return;
        }

        await db
          .update(workflowRuns)
          .set({
            status: "failed",
            errorMessage: "Rejected via AI Studio Mobile Dashboard",
            completedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(and(eq(workflowRuns.id, runId), eq(workflowRuns.workspaceId, workspaceId)));

        res.status(200).json({
          success: true,
          message: `Run ${runId} rejected from mobile interface.`,
        });
        return;
      }

      case "sync_all":
      case "sync_ecosystem": {
        const syncResult = await triggerFullEcosystemSync(workspaceId);
        res.status(200).json(syncResult);
        return;
      }

      default:
        res.status(400).json({
          error: `Unknown action: "${action}". Supported actions: trigger_workflow, approve_run, reject_run, sync_all.`,
        });
    }
  } catch (error: any) {
    console.error("[AI Studio Action Error]:", error);
    res.status(500).json({ error: error.message || "Failed to execute remote action." });
  }
}

/**
 * 5. POST /api/aistudio/sync-all & /api/sync/all
 * 1-Click Manual Sync trigger from portable dashboard / mobile client / OS UI.
 */
export async function handleManualSync(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.workspaceId || "00000000-0000-0000-0000-000000000001";
    const result = await triggerFullEcosystemSync(workspaceId);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("[Manual Sync Error]:", error);
    res.status(500).json({ error: error.message || "Failed to execute manual ecosystem sync." });
  }
}

/**
 * Core engine function: Synchronizes Desktop HTML, Repo Markdown, and AgentLab OS State.
 */
export async function triggerFullEcosystemSync(workspaceId: string = "00000000-0000-0000-0000-000000000001"): Promise<{
  success: boolean;
  syncedAt: string;
  message: string;
  stats: Record<string, any>;
}> {
  const syncStartedAt = Date.now();
  const syncedAt = new Date().toISOString();
  let scriptsRun = false;

  // Execute daily command center sync script if available
  try {
    const { spawnSync } = await import("node:child_process");
    const path = await import("node:path");
    const scriptPath = path.join(process.cwd(), "scripts", "daily-command-center.mjs");
    const child = spawnSync(process.execPath, [scriptPath], { encoding: "utf8" });
    if (child.status === 0) {
      scriptsRun = true;
    } else {
      console.warn("[Ecosystem Sync] daily-command-center returned non-zero:", child.stderr);
    }
  } catch (err: any) {
    console.warn("[Ecosystem Sync] Failed to run daily command center script:", err.message);
  }

  // Record audit log
  const db = await getDb();
  if (db) {
    try {
      await db.insert(auditLogs).values({
        workspaceId,
        actionType: "ECOSYSTEM_FULL_SYNC",
        model: "not-llm-dispatch",
        payloadIn: { triggerSource: "ONE_CLICK_SYNC_OR_SCHEDULED" },
        payloadOut: { status: "SYNCED", scriptsRun, syncedAt },
        tokensPrompt: 0,
        tokensCompletion: 0,
        tokensTotal: 0,
        cost: "0.000000",
        // Measured wall time instead of the invented 150ms; guardrail checks
        // marked NOT evaluated (CC-2026-10-02-011, disposition 9).
        latencyMs: Date.now() - syncStartedAt,
        status: "success",
        billed: false,
        policyChecks: {
          saifPassed: null,
          piiDetected: null,
          budgetThresholdPassed: null,
          evaluated: false,
          note: "not-llm-dispatch: no guardrail evaluation performed",
        },
      });
    } catch (auditErr) {
      console.warn("[Ecosystem Sync] Failed to record audit log:", auditErr);
    }
  }

  // Push event to registered mobile/AI Studio webhooks
  await dispatchMobileWebhooks({
    eventType: "ECOSYSTEM_SYNC_COMPLETED",
    workspaceId,
    syncedAt,
    scriptsRun,
  });

  return {
    success: true,
    syncedAt,
    message: "Full ecosystem sync complete: Desktop HTML, Repo Markdown, and AgentLab OS aligned.",
    stats: {
      scriptsRun,
      roamingQueueLength: roamingDataBuffer.filter((e) => e.workspaceId === workspaceId).length,
      subscribersNotified: mobileSubscribers.filter((s) => s.workspaceId === workspaceId).length,
    },
  };
}

/**
 * 4. POST /api/aistudio/webhook/register
 * Registers a mobile callback URL so changes in AgentLab automatically push back to AI Studio.
 */
export async function registerMobileWebhook(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.workspaceId || "00000000-0000-0000-0000-000000000001";
    const { endpointUrl, deviceLabel } = req.body || {};

    if (!endpointUrl || typeof endpointUrl !== "string" || !endpointUrl.startsWith("http")) {
      res.status(400).json({ error: "A valid HTTP/HTTPS endpointUrl is required." });
      return;
    }

    const subscriberId = `sub_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
    mobileSubscribers.push({
      id: subscriberId,
      workspaceId,
      endpointUrl,
      registeredAt: new Date().toISOString(),
      deviceLabel: deviceLabel || "AI Studio Mobile Client",
    });

    res.status(201).json({
      success: true,
      message: "Mobile webhook registered. AgentLab OS will push live updates to your dashboard.",
      subscriberId,
      endpointUrl,
    });
  } catch (error: any) {
    console.error("[AI Studio Webhook Register Error]:", error);
    res.status(500).json({ error: "Failed to register webhook." });
  }
}

/**
 * Internal helper to dispatch real-time events to all active mobile subscribers
 */
async function dispatchMobileWebhooks(eventData: Record<string, any>): Promise<void> {
  const activeTargets = mobileSubscribers.filter(
    (s) => s.workspaceId === eventData.workspaceId
  );

  for (const target of activeTargets) {
    try {
      fetch(target.endpointUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: eventData.eventType,
          timestamp: new Date().toISOString(),
          data: eventData,
        }),
      }).catch((fetchErr) => {
        console.warn(`[Mobile Webhook] Failed to deliver event to ${target.endpointUrl}:`, fetchErr.message);
      });
    } catch {
      // Non-blocking
    }
  }
}
