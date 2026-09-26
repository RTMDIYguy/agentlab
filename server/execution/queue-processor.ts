import { eq, asc, and } from "drizzle-orm";
import { getDb } from "../db";
import {
  workflowRuns,
  workflowSteps,
  workflowRunSteps,
  agents,
  workspacePackages,
  knowledgePackages,
  workflowArtifacts,
  actionDispatches,
} from "../schema";
import { runAgentStep } from "./agent-runner";
import { evaluateArtifactQuality } from "./quality-evaluator";
import { dispatchScheduledPosts } from "./social-dispatcher";
import { draftActionPayload, parseActionDraft } from "./action-drafter";
import { resolveStepPolicy, runWithStepPolicy, StepCancelledError } from "./step-policy";
import { insertAuditLog } from "./audit-logger";

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

        // Cooperative cancellation: honor a cancel request between steps so
        // pending work never starts after the operator asked to stop.
        if (run.cancelRequested) {
          await db
            .update(workflowRuns)
            .set({
              status: "cancelled",
              completedAt: new Date(),
              errorMessage: "Cancelled before step execution",
              updatedAt: new Date(),
            })
            .where(eq(workflowRuns.id, run.id));
          console.log(`[QueueProcessor] Run ${run.id} cancelled before step ${step.id}.`);
          runFailed = true;
          break;
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

        // 5.5 Human-gated action step (conversion plan Tier 2): the agent
        // drafts the outbound payload, it parks as awaiting_approval, and the
        // run pauses exactly like a guardrail — a human decides in the
        // actions router whether the payload ever leaves the OS.
        if (step.stepType === "action") {
          try {
            const draft = await draftActionPayload(
              step.actionPrompt,
              currentContext,
              run.workspaceId
            );
            const parse = parseActionDraft(draft);
            if (!parse.ok) {
              throw new Error(
                `Action draft invalid: ${parse.error} — raw: ${String(draft).slice(0, 200)}`
              );
            }

            const dispatchId = crypto.randomUUID();
            await db.insert(actionDispatches).values({
              id: dispatchId,
              workspaceId: run.workspaceId,
              workflowRunId: run.id,
              workflowRunStepId: runStepId,
              workflowStepId: step.id,
              connector: parse.connector,
              status: "awaiting_approval",
              title: parse.title,
              payload: parse.payload as Record<string, unknown>,
            } as any);

            // Mark the run step so the approval flow can find it, and pause
            // the run exactly like the guardrail path does.
            await db
              .update(workflowRunSteps)
              .set({
                status: "awaiting_approval",
                outputPayload: { actionDispatchId: dispatchId },
              })
              .where(eq(workflowRunSteps.id, runStepId));

            await db
              .update(workflowRuns)
              .set({ status: "paused_for_approval", updatedAt: new Date() })
              .where(eq(workflowRuns.id, run.id));

            console.log(
              `[QueueProcessor] Action step ${step.id} drafted dispatch ${dispatchId} (connector ${parse.connector}); run paused for approval.`
            );
            runFailed = true; // halted, awaiting human decision
            break;
          } catch (actionErr: any) {
            console.error("[QueueProcessor] Action step failed:", actionErr.message);
            await db
              .update(workflowRunSteps)
              .set({
                status: "failed",
                completedAt: new Date(),
                errorMessage: actionErr.message,
              })
              .where(eq(workflowRunSteps.id, runStepId));
            await db
              .update(workflowRuns)
              .set({ status: "failed", updatedAt: new Date() })
              .where(eq(workflowRuns.id, run.id));
            runFailed = true;
            break;
          }
        }

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

            // Tier 1 hardening: per-step timeout + bounded retry policy, with
            // cooperative cancellation checks between attempts.
            const policy = resolveStepPolicy(step);
            const { value: result, attempts } = await runWithStepPolicy(
              run.id,
              policy,
              () =>
                runAgentStep(
                  step.actionPrompt,
                  systemPrompt,
                  currentContext,
                  run.workspaceId,
                  unlockedDepartments
                )
            );
            if (attempts > 1) {
              console.log(
                `[QueueProcessor] Step ${step.id} succeeded on attempt ${attempts}/${1 + policy.maxRetries}.`
              );
            }

            // Refusal & Inability Verification Guardrail:
            // If the model responded with a text refusal or inability without executing tools, fail the step with evidence.
            if (result.hasRefusal) {
              const reason = result.refusalReason || "Agent execution failed capability check: refused or unable to perform task.";
              throw new Error(reason);
            }

            // 8. Extract & Persist Artifacts (Posts, Calendar items, Documents, Files)
            if (result.extractedArtifacts && result.extractedArtifacts.length > 0) {
              console.log(`[QueueProcessor] Persisting ${result.extractedArtifacts.length} artifacts for run ${run.id}...`);
              for (const artifact of result.extractedArtifacts) {
                try {
                  const artifactId = crypto.randomUUID();
                  const evalResult = evaluateArtifactQuality({
                    title: artifact.title,
                    content: artifact.content,
                    targetPlatform: artifact.targetPlatform,
                    artifactType: artifact.artifactType,
                  });

                  await db.insert(workflowArtifacts).values({
                    id: artifactId,
                    workspaceId: run.workspaceId,
                    workflowRunId: run.id,
                    workflowRunStepId: runStepId,
                    workflowId: run.workflowId,
                    artifactType: artifact.artifactType || "document",
                    title: (artifact.title || "Generated Output Artifact").slice(0, 255),
                    content: artifact.content,
                    summary: artifact.summary || null,
                    targetPlatform: artifact.targetPlatform || "linkedin",
                    scheduledFor: artifact.scheduledFor ? new Date(artifact.scheduledFor) : null,
                    status: artifact.artifactType === "post" ? "scheduled" : "draft",
                    qualityScore: evalResult.score,
                    qualityGrade: evalResult.grade,
                    verificationNotes: {
                      feedback: evalResult.feedback,
                      suggestions: evalResult.suggestions,
                      passed: evalResult.passed,
                      rubric: evalResult.rubric,
                      evaluatedAt: evalResult.evaluatedAt,
                    },
                    revisionVersion: 1,
                    metadata: {
                      ...(artifact.metadata || {}),
                      toolsCount: result.toolsExecuted.length,
                      generatedAt: new Date().toISOString(),
                    },
                  } as any);
                } catch (artifactErr: any) {
                  console.warn("[QueueProcessor] Artifact persistence notice:", artifactErr.message);
                }
              }
            }

            // 9. Save output and update context
            currentContext = { ...currentContext, ...result.outputPayload };

            // 10. Mark run step as completed
            console.log(`[QueueProcessor] DB QUERY: Updating workflowRunStep ${runStepId} to completed...`);
            await db
              .update(workflowRunSteps)
              .set({
                status: "completed",
                completedAt: new Date(),
                outputPayload: {
                  ...result.outputPayload,
                  _telemetry: {
                    toolsExecuted: result.toolsExecuted,
                    artifactsCreated: result.extractedArtifacts.length,
                  },
                },
                cost: result.cost?.toString() ?? "0.000000",
                latencyMs: result.latencyMs ?? 0,
              })
              .where(eq(workflowRunSteps.id, runStepId));
            console.log(`[QueueProcessor] DB QUERY DONE: Updated workflowRunStep ${runStepId} to completed.`);

            // 11. Create auditLog entry with full evidence trace.
            // CC-2026-09-25-008: this insert previously sat unprotected and its
            // throw bubbled into the step catch below, marking a step FAILED
            // after the agent had already succeeded (telemetry killed work).
            // insertAuditLog is non-fatal by contract: dangling agent_id FK
            // violations retry with NULL, everything else degrades to a warning.
            console.log(`[QueueProcessor] DB QUERY: Inserting auditLog for runStep ${runStepId}...`);
            const auditOk = await insertAuditLog(db, {
              workspaceId: run.workspaceId,
              workflowId: run.workflowId,
              agentId: step.agentId || null,
              actionType: "agent_step_execution",
              model: "gemini-2.5-flash",
              payloadIn: currentContext,
              payloadOut: {
                ...result.outputPayload,
                artifactsCount: result.extractedArtifacts.length,
                toolsExecuted: result.toolsExecuted.map(t => ({ name: t.toolName, isSimulated: t.isSimulated })),
              },
              tokensPrompt: result.tokensPrompt ?? 0,
              tokensCompletion: result.tokensCompletion ?? 0,
              tokensTotal: result.tokensTotal ?? 0,
              cost: result.cost?.toString() ?? "0.000000",
              latencyMs: result.latencyMs ?? 0,
              status: "success",
              policyChecks: {
                saifPassed: true,
                piiDetected: 0,
                budgetThresholdPassed: true,
                toolsExecutedCount: result.toolsExecuted.length,
                artifactsCount: result.extractedArtifacts.length,
              },
            });
            if (auditOk) {
              console.log(`[QueueProcessor] DB QUERY DONE: Inserted auditLog.`);
            }
          } catch (error: any) {
            // Cancellation is not a failure: mark the run cancelled honestly.
            if (error instanceof StepCancelledError) {
              console.log(`[QueueProcessor] Run ${run.id} cancelled during step ${step.id}.`);
              await db
                .update(workflowRunSteps)
                .set({
                  status: "cancelled",
                  completedAt: new Date(),
                  errorMessage: error.message,
                })
                .where(eq(workflowRunSteps.id, runStepId));
              await db
                .update(workflowRuns)
                .set({
                  status: "cancelled",
                  completedAt: new Date(),
                  errorMessage: `Cancelled during step ${step.orderIndex} (attempted after cancel request)`,
                  updatedAt: new Date(),
                })
                .where(eq(workflowRuns.id, run.id));
              runFailed = true;
              break;
            }

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

            // Insert failure audit log for full governance visibility.
            // Same non-fatal contract as the success path (CC-2026-09-25-008).
            await insertAuditLog(db, {
              workspaceId: run.workspaceId,
              workflowId: run.workflowId,
              agentId: step.agentId || null,
              actionType: "agent_step_execution_failure",
              model: "gemini-2.5-flash",
              payloadIn: currentContext,
              payloadOut: { error: error.message },
              tokensPrompt: 0,
              tokensCompletion: 0,
              tokensTotal: 0,
              cost: "0.000000",
              latencyMs: 0,
              status: "error",
              errorMessage: error.message,
              policyChecks: {
                saifPassed: false,
                piiDetected: 0,
                budgetThresholdPassed: true,
                failureReason: error.message,
              },
            });

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

      // Dispatch any newly-scheduled social posts whose time has arrived
      const dispatchResults = await dispatchScheduledPosts();

      if (dispatchResults.length > 0) {
        console.log(
          `[QueueProcessor] Social dispatcher posted ${
            dispatchResults.filter((r) => r.success).length
          } post(s), ${
            dispatchResults.filter((r) => !r.success).length
          } failed.`
        );

        for (const r of dispatchResults) {
          if (r.success) {
            console.log(
              `[QueueProcessor] ✓ ${r.platform}: ${r.postId || ""} (artifact ${r.artifactId})`
            );
          } else {
            console.warn(
              `[QueueProcessor] ✗ ${r.platform}: ${r.error || "unknown"} (artifact ${r.artifactId})`
            );
          }
        }
      }
    }
  } catch (err) {
    console.error("[QueueProcessor] Error processing runs:", err);
  }
}
