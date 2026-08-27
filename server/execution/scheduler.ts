import { db } from "../db";
import { workflows, workflowRuns } from "../schema";
import { eq, and, lte } from "drizzle-orm";
import cronParser from "cron-parser";

/**
 * Evaluates all active workflows with a trigger_type of "schedule"
 * and triggers a run if next_run_at is <= now.
 */
export async function processScheduledWorkflows() {
  try {
    const now = new Date();
    
    // Find scheduled workflows that are due
    const dueWorkflows = await db.select().from(workflows)
      .where(
        and(
          eq(workflows.status, "active"),
          eq(workflows.triggerType, "schedule"),
          lte(workflows.nextRunAt, now)
        )
      );

    for (const wf of dueWorkflows) {
      console.log(`[Scheduler] Triggering scheduled run for workflow: ${wf.name} (${wf.id})`);
      
      // Calculate next run time
      let nextRunAt: Date | null = null;
      if (wf.cronExpression) {
        try {
          const interval = cronParser.parseExpression(wf.cronExpression, { currentDate: now });
          nextRunAt = interval.next().toDate();
        } catch (e) {
          console.error(`[Scheduler] Invalid CRON expression for workflow ${wf.id}:`, e);
        }
      }

      // Create a pending run
      await db.insert(workflowRuns).values({
        workspaceId: wf.workspaceId,
        workflowId: wf.id,
        status: "pending",
        triggerSource: "schedule",
        initialContext: {},
      });

      // Update the workflow with the next run time
      if (nextRunAt) {
        await db.update(workflows)
          .set({ nextRunAt })
          .where(eq(workflows.id, wf.id));
      } else {
        // Fallback: If cron was invalid or something broke, pause it so it doesn't loop infinitely
        await db.update(workflows)
          .set({ status: "paused" })
          .where(eq(workflows.id, wf.id));
      }
    }
  } catch (error) {
    console.error("[Scheduler] Error processing scheduled workflows:", error);
  }
}
