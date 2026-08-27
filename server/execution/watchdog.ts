import { db } from "../db";
import { auditLogs, workflowRuns, workspaces } from "../schema";
import { eq, lt, and } from "drizzle-orm";

export async function runStartupDiagnostics() {
  console.log("[System Watchdog] Running startup diagnostics...");
  
  try {
    // Check DB Connection by fetching the first workspace (usually URC)
    const allWorkspaces = await db.select().from(workspaces).limit(1);
    
    if (allWorkspaces.length > 0) {
      console.log("[System Watchdog] Startup diagnostics passed: Database connection stable.");
      // Log this to the first workspace as an info log
      await db.insert(auditLogs).values({
        workspaceId: allWorkspaces[0].id,
        actionType: "system_diagnostic",
        payloadIn: { event: "startup_diagnostics" },
        payloadOut: { result: "Database connection stable." },
        status: "success",
      });
    } else {
      console.warn("[System Watchdog] Warning: No workspaces found in database. Is this a fresh install?");
    }
  } catch (error: any) {
    console.error("[System Watchdog] Startup diagnostics failed:", error);
  }
}

export async function runPeriodicWatchdog() {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Find workflow runs that are stuck in "running" for over 1 hour
    const stuckRuns = await db.select().from(workflowRuns)
      .where(
        and(
          eq(workflowRuns.status, "running"),
          lt(workflowRuns.updatedAt, oneHourAgo)
        )
      );

    if (stuckRuns.length > 0) {
      console.warn(`[System Watchdog] Found ${stuckRuns.length} orphaned/stuck workflow runs.`);
      
      for (const run of stuckRuns) {
        // Log the anomaly
        await db.insert(auditLogs).values({
          workspaceId: run.workspaceId,
          workflowId: run.workflowId,
          actionType: "system_diagnostic",
          payloadIn: { 
            event: "orphaned_task_detected",
            runId: run.id,
            durationSinceUpdate: Date.now() - new Date(run.updatedAt).getTime()
          },
          payloadOut: { 
            message: "Workflow run stuck in running state for > 1 hour.",
            autoResolved: false 
          },
          status: "warning",
          errorMessage: "Orphaned Task Detected",
        });

        // We are currently just logging it for human review as per safe defaults, 
        // but we could auto-resolve it here if configured:
        // await db.update(workflowRuns).set({ status: 'failed', errorMessage: 'Watchdog timeout' }).where(eq(workflowRuns.id, run.id));
      }
    }
  } catch (error) {
    console.error("[System Watchdog] Periodic watchdog error:", error);
  }
}
