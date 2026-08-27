import { eq, asc, and } from "drizzle-orm";
import { getDb } from "../db";
import {
  workflowRuns,
  workflowSteps,
  workflowRunSteps,
  auditLogs,
  agents,
  workspacePackages,
  knowledgePackages,
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
    console.log("[QueueProcessor] DB QUERY: Selecting pending runs from workflowRuns...");
    const pendingRuns = await db
      .select()
      .from(workflowRuns)
      .where(eq(workflowRuns.status, "pending"));
    console.log(`[QueueProcessor] DB QUERY DONE: Found ${pendingRuns.length} pending runs.`);

    if (pendingRuns.length > 0) {
      console.log(`[QueueProcessor] Found ${pendingRuns.length} pending runs.`);
    }

    for (const run of pendingRuns) {
      console.log(`[QueueProcessor] Processing run ${run.id}...`);
      
      let unlockedDepartments: string[] = [];
      if (run.workspaceId === "00000000-0000-0000-0000-000000000000") {
        unlockedDepartments = ["ALL"];
      } else if (run.workspaceId) {
        const subs = await db
          .select({ departmentCode: knowledgePackages.departmentCode })
          .from(workspacePackages)
          .innerJoin(knowledgePackages, eq(workspacePackages.packageId, knowledgePackages.id))
          .where(and(eq(workspacePackages.workspaceId, run.workspaceId), eq(workspacePackages.status, "active")));
        unlockedDepartments = subs.map((s: any) => s.departmentCode);
      }

      // 2. Update status to running
      console.log(`[QueueProcessor] DB QUERY: Updating run ${run.id} to running...`);
      await db
        .update(workflowRuns)
        .set({ status: "running", updatedAt: new Date() })
        .where(eq(workflowRuns.id, run.id));
      console.log(`[QueueProcessor] DB QUERY DONE: Updated run ${run.id} to running.`);

      // 3. Fetch all workflow_steps ordered by orderIndex
      console.log(`[QueueProcessor] DB QUERY: Selecting workflowSteps for workflow ${run.workflowId}...`);
      const steps = await db
        .select()
        .from(workflowSteps)
        .where(eq(workflowSteps.workflowId, run.workflowId))
        .orderBy(asc(workflowSteps.orderIndex));
      console.log(`[QueueProcessor] DB QUERY DONE: Found ${steps.length} steps.`);

      // 3.5 Fetch existing completed workflowRunSteps for this run
      console.log(`[QueueProcessor] DB QUERY: Selecting existing workflowRunSteps for run ${run.id}...`);
      const existingRunSteps = await db
        .select()
        .from(workflowRunSteps)
        .where(eq(workflowRunSteps.workflowRunId, run.id));
      console.log(`[QueueProcessor] DB QUERY DONE: Found ${existingRunSteps.length} existing run steps.`);

      const completedStepIds = new Set(
        existingRunSteps.filter(rs => rs.status === "completed").map(rs => rs.workflowStepId)
      );
      
      const existingStepPayloads = new Map(
        existingRunSteps.filter(rs => rs.status === "completed" && rs.outputPayload).map(rs => [rs.workflowStepId, rs.outputPayload])
      );

      // Ensure initialContext is treated as an object
      let currentContext = (run.initialContext as Record<string, any>) || {};
      let runFailed = false;

      // 4. Iterate sequentially
      for (const step of steps) {
        if (completedStepIds.has(step.id)) {
          // Skip already completed step
          const payload = existingStepPayloads.get(step.id);
          if (payload) {
             currentContext = { ...currentContext, ...(payload as Record<string, any>) };
          }
          continue;
        }
        // 5. Create workflow_run_steps record (status running)
        // Using crypto.randomUUID() since uuid() in pgTable isn't autoincrement in this setup without db support
        const runStepId = crypto.randomUUID();

        console.log(`[QueueProcessor] DB QUERY: Inserting workflowRunStep ${runStepId}...`);
        await db.insert(workflowRunSteps).values({
          id: runStepId,
          workspaceId: run.workspaceId,
          workflowRunId: run.id,
          workflowStepId: step.id,
          status: "running",
          startedAt: new Date(),
          inputContext: currentContext,
        } as any); // Using 'as any' safely assuming DB handles default values well
        console.log(`[QueueProcessor] DB QUERY DONE: Inserted workflowRunStep ${runStepId}.`);

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
              console.log(`[QueueProcessor] DB QUERY: Selecting agent ${step.agentId}...`);
              const agentData = await db
                .select()
                .from(agents)
                .where(eq(agents.id, step.agentId))
                .limit(1);
              console.log(`[QueueProcessor] DB QUERY DONE: Found agent ${step.agentId}.`);
              if (agentData.length > 0) {
                systemPrompt = agentData[0].systemPrompt;
              }
            }

            if (unlockedDepartments.length > 0 && !unlockedDepartments.includes("ALL")) {
               systemPrompt = (systemPrompt || "") + `\n\n[ACCESS CONTROL]: You are operating with the following active Playbook contexts: ${unlockedDepartments.join(", ")}. The system will actively block you from accessing SOPs outside these areas.`;
            }

            const result = await runAgentStep(
              step.actionPrompt,
              systemPrompt,
              currentContext,
              run.workspaceId,
              unlockedDepartments
            );

            // 8. Save output and update context
            currentContext = { ...currentContext, ...result.outputPayload };

            // 9. Mark run step as completed
            console.log(`[QueueProcessor] DB QUERY: Updating workflowRunStep ${runStepId} to completed...`);
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
            console.log(`[QueueProcessor] DB QUERY DONE: Updated workflowRunStep ${runStepId} to completed.`);

            // 10. Create auditLog entry
            console.log(`[QueueProcessor] DB QUERY: Inserting auditLog for runStep ${runStepId}...`);
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
            console.log(`[QueueProcessor] DB QUERY DONE: Inserted auditLog.`);
          } catch (error: any) {
            console.error(`[QueueProcessor] Step failed. error.message=${error.message}`, error);
            if (error.stack) {
              console.error(`[QueueProcessor] Stack trace:`, error.stack);
            }

            console.log(`[QueueProcessor] DB QUERY: Updating workflowRunStep ${runStepId} to failed...`);
            await db
              .update(workflowRunSteps)
              .set({
                status: "failed",
                completedAt: new Date(),
                errorMessage: error.message,
              })
              .where(eq(workflowRunSteps.id, runStepId));
            console.log(`[QueueProcessor] DB QUERY DONE: Updated workflowRunStep ${runStepId} to failed.`);

            console.log(`[QueueProcessor] DB QUERY: Updating workflowRuns ${run.id} to failed...`);
            await db
              .update(workflowRuns)
              .set({
                status: "failed",
                completedAt: new Date(),
                errorMessage: `Step ${step.orderIndex} failed: ${error.message}`,
                updatedAt: new Date(),
              })
              .where(eq(workflowRuns.id, run.id));
            console.log(`[QueueProcessor] DB QUERY DONE: Updated workflowRuns ${run.id} to failed.`);

            runFailed = true;
            break;
          }
        } else if (step.stepType !== "guardrail") {
          // Handle 'trigger', 'destination', or other non-agent steps that were previously left "running"
          console.log(`[QueueProcessor] DB QUERY: Updating non-agent workflowRunStep ${runStepId} to completed...`);
          await db
            .update(workflowRunSteps)
            .set({
              status: "completed",
              completedAt: new Date(),
              outputPayload: { message: `Step of type ${step.stepType} completed implicitly.` }
            })
            .where(eq(workflowRunSteps.id, runStepId));
          console.log(`[QueueProcessor] DB QUERY DONE: Updated workflowRunStep ${runStepId} to completed.`);
        }
      }

      console.log(`[QueueProcessor] Finished processing run ${run.id}. runFailed=${runFailed}`);
      // 11. Complete run if not failed/halted
      if (!runFailed) {
        console.log(`[QueueProcessor] DB QUERY: Updating run ${run.id} to completed...`);
        await db
          .update(workflowRuns)
          .set({
            status: "completed",
            completedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(workflowRuns.id, run.id));
        console.log(`[QueueProcessor] DB QUERY DONE: Updated run ${run.id} to completed.`);
      }
    }
  } catch (err) {
    console.error("[QueueProcessor] Error processing runs:", err);
  }
}
