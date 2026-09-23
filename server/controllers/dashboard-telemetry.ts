import type { Request, Response } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "../db";
import {
  workflowRuns,
  workflowRunSteps,
  workspaceIntegrations,
} from "../schema";
import { syncWorkspaceVaultSecrets } from "../_core/env";
import { invokeLLM } from "../_core/llm";

/**
 * Real-state telemetry for the Dashboard's System Telemetry Console.
 *
 * Replaces the previous hardcoded fiction ("Latency: 450ms", "ONLINE",
 * "HubSpot CONNECTED", "$12.50 spend / $443 saved") with numbers computed
 * from the operator's own tables. Everything is nullable when unknown —
 * the UI renders "not reported" instead of inventing a value.
 *
 * GET /api/dashboard/telemetry (mounted on the workspace-scoped apiRouter).
 */
export async function getDashboardTelemetry(
  req: Request,
  res: Response
): Promise<void> {
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

    // Vault-sync first so the integration badges reflect env/vault state
    // (same call Settings makes before reading workspace_integrations).
    let hubspot = { connected: false as boolean, toolsConfigured: null as number | null };
    let integrationsError: string | null = null;
    try {
      await syncWorkspaceVaultSecrets(workspaceId);
      const rows = await db
        .select({
          name: workspaceIntegrations.name,
          config: workspaceIntegrations.config,
          status: workspaceIntegrations.status,
        })
        .from(workspaceIntegrations)
        .where(eq(workspaceIntegrations.workspaceId, workspaceId));

      const hubspotRow = rows.find(r =>
        r.name.toLowerCase().includes("hubspot")
      );
      hubspot = {
        connected: !!hubspotRow && hubspotRow.status === "active",
        toolsConfigured: hubspotRow
          ? countConfiguredTools(hubspotRow.config)
          : 0,
      };
    } catch (err: any) {
      integrationsError = err?.message || "Vault sync failed";
    }

    // Real latency: the pipeline records per-step latencyMs on completed
    // steps; the console shows the most recent completed step's real value.
    let lastStepLatencyMs: number | null = null;
    let totalCost: string | null = null;
    try {
      const [lastStep] = await db
        .select({ latencyMs: workflowRunSteps.latencyMs })
        .from(workflowRunSteps)
        .where(
          and(
            eq(workflowRunSteps.status, "completed"),
            eq(
              workflowRunSteps.workspaceId,
              workspaceId
            )
          )
        )
        .orderBy(desc(workflowRunSteps.completedAt))
        .limit(1);
      lastStepLatencyMs = lastStep?.latencyMs ?? null;

      // Real spend: sum of per-step costs the pipeline persisted.
      const [costRow] = await db
        .select({
          total: sql<string | null>`sum(${workflowRunSteps.cost})`,
        })
        .from(workflowRunSteps)
        .where(eq(workflowRunSteps.workspaceId, workspaceId));
      totalCost = costRow?.total ?? null;
    } catch {
      // telemetry stays null — honest unknown
    }

    res.status(200).json({
      hubspot,
      llm: {
        provider: "gemini-2.5-flash",
        configured: !!process.env.OPENAI_API_KEY,
        // Per-request LLM latency is not persisted anywhere; report the
        // real pipeline latency instead of a made-up number.
        lastStepLatencyMs,
      },
      compute: {
        // Real cumulative cost of executed steps, or null when no runs
        // have reported cost. No invented "saved" figure.
        totalCost,
      },
      integrationsError,
    });
  } catch (error) {
    console.error("[DashboardTelemetry] Error:", error);
    res.status(500).json({ error: "Failed to compute telemetry" });
  }
}

function countConfiguredTools(config: unknown): number {
  if (!config || typeof config !== "object") return 0;
  const cfg = config as Record<string, unknown>;
  if (Array.isArray(cfg.tools)) return cfg.tools.length;
  if (cfg.tools && typeof cfg.tools === "object") {
    return Object.keys(cfg.tools).length;
  }
  return 0;
}

/**
 * Verified LLM liveness: a minimal real round-trip through the app's
 * invokeLLM path with measured wall latency. Kept separate from the main
 * telemetry endpoint so the cheap 30s console poll never triggers a model
 * call — the Dashboard pings this on mount and every 5 minutes.
 *
 * GET /api/dashboard/llm-ping
 */
export async function pingLlm(req: Request, res: Response): Promise<void> {
  const startedAt = Date.now();

  try {
    const result = await invokeLLM({
      messages: [
        {
          role: "user",
          content: "Reply with the single word: pong",
        },
      ],
      maxTokens: 512,
    });

    const latencyMs = Date.now() - startedAt;
    const choice = result.choices?.[0] as any;
    const rawContent = choice?.message?.content;
    const replied =
      typeof rawContent === "string"
        ? rawContent.trim()
        : Array.isArray(rawContent)
          ? rawContent
              .filter((p: any) => p?.type === "text")
              .map((p: any) => p.text)
              .join("")
              .trim()
          : "";

    // A 200 with an empty body is not liveness — report what happened.
    if (!replied) {
      res.status(200).json({
        alive: false,
        reason: "Model returned an empty response.",
        latencyMs,
        checkedAt: new Date().toISOString(),
      });
      return;
    }

    res.status(200).json({
      alive: true,
      latencyMs,
      model: result.model ?? "unknown",
      checkedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    // Honest failure: not configured vs reachable-but-erroring are
    // different states and the badge needs to distinguish them.
    const message = error?.message || "Unknown error";
    const notConfigured = /not configured/i.test(message);
    res.status(200).json({
      alive: false,
      reason: message,
      notConfigured,
      latencyMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString(),
    });
  }
}
