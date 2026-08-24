import { eq, asc } from "drizzle-orm";
import { getDb } from "../db";
import {
  workflowRuns,
  workflowSteps,
  workflowRunSteps,
  auditLogs,
  agents,
} from "../schema";
import { runAgentStep } from "./agent-runner";

export async function processPendingRuns() {
  const db = await getDb();
  if (!db) {
    console.warn("[QueueProcessor] Database not available");
    return;
  }

  try {
    // 1. Query pending runs
    const pendingRuns = await db
      .select()
      .from(workflowRuns)
      .where(eq(workflowRuns.status, "pending"));

    for (const run of pendingRuns) {
      // 2. Update status to running
      await db
        .update(workflowRuns)
        .set({ status: "running", updatedAt: new Date() })
        .where(eq(workflowRuns.id, run.id));

      // 3. Fetch all workflow_steps ordered by orderIndex
      const steps = await db
        .select()
        .from(workflowSteps)
        .where(eq(workflowSteps.workflowId, run.workflowId))
        .orderBy(asc(workflowSteps.orderIndex));

      // Ensure initialContext is treated as an object
      let currentContext = (run.initialContext as Record<string, any>) || {};
      let runFailed = false;

      // 4. Iterate sequentially
      for (const step of steps) {
        // 5. Create workflow_run_steps record (status running)
        // Using crypto.randomUUID() since uuid() in pgTable isn't autoincrement in this setup without db support
        const runStepId = crypto.randomUUID();

        await db.insert(workflowRunSteps).values({
          id: runStepId,
          workspaceId: run.workspaceId,
          workflowRunId: run.id,
          workflowStepId: step.id,
          status: "running",
          startedAt: new Date(),
          inputContext: currentContext,
        } as any); // Using 'as any' safely assuming DB handles default values well

        // 6. Guardrail check
        if (step.stepType === "guardrail") {
          await db
            .update(workflowRuns)
            .set({ status: "paused_for_approval", updatedAt: new Date() })
            .where(eq(workflowRuns.id, run.id));

          await db
            .update(workflowRunSteps)
            .set({ status: "completed", completedAt: new Date() })
            .where(eq(workflowRunSteps.id, runStepId));

          runFailed = true; // Halted, not technically failed
          break; // Halt the loop
        }

        // 7. Agent execution
        if (step.stepType === "agent") {
          try {
            // Fetch agent for system prompt
            let systemPrompt: string | undefined = undefined;
            if (step.agentId) {
              const agentData = await db
                .select()
                .from(agents)
                .where(eq(agents.id, step.agentId))
                .limit(1);
              if (agentData.length > 0) {
                systemPrompt = agentData[0].systemPrompt;
              }
            }

            const result = await runAgentStep(
              step.actionPrompt,
              systemPrompt,
              currentContext
            );

            // 8. Save output and update context
            currentContext = { ...currentContext, ...result.outputPayload };

            // 9. Mark run step as completed
            await db
              .update(workflowRunSteps)
              .set({
                status: "completed",
                completedAt: new Date(),
                outputPayload: result.outputPayload,
                cost: result.cost.toString(),
                latencyMs: result.latencyMs,
              })
              .where(eq(workflowRunSteps.id, runStepId));

            // 10. Create auditLog entry
            await db.insert(auditLogs).values({
              workspaceId: run.workspaceId,
              workflowId: run.workflowId,
              agentId: step.agentId,
              actionType: "agent_step_execution",
              model: "gemini-1.5-pro",
              payloadIn: currentContext,
              payloadOut: result.outputPayload,
              tokensPrompt: result.tokensPrompt,
              tokensCompletion: result.tokensCompletion,
              tokensTotal: result.tokensTotal,
              cost: result.cost.toString(),
              latencyMs: result.latencyMs,
              status: "success",
            } as any);
          } catch (error: any) {
            console.error(`[QueueProcessor] Step failed:`, error);

            await db
              .update(workflowRunSteps)
              .set({
                status: "failed",
                completedAt: new Date(),
                errorMessage: error.message,
              })
              .where(eq(workflowRunSteps.id, runStepId));

            await db
              .update(workflowRuns)
              .set({
                status: "failed",
                completedAt: new Date(),
                errorMessage: `Step ${step.orderIndex} failed: ${error.message}`,
                updatedAt: new Date(),
              })
              .where(eq(workflowRuns.id, run.id));

            runFailed = true;
            break;
          }
        }
      }

      // 11. Complete run if not failed/halted
      if (!runFailed) {
        await db
          .update(workflowRuns)
          .set({
            status: "completed",
            completedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(workflowRuns.id, run.id));
      }
    }
  } catch (err) {
    console.error("[QueueProcessor] Error processing runs:", err);
  }
}
