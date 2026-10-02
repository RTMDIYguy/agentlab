import { eq, asc, and, sql } from "drizzle-orm";
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
  workspaces,
  auditLogs,
} from "../schema";
import { runAgentStep } from "./agent-runner";
import { evaluateArtifactQuality } from "./quality-evaluator";
import { dispatchScheduledPosts } from "./social-dispatcher";
import { draftActionPayload, parseActionDraft } from "./action-drafter";
import { resolveStepPolicy, runWithStepPolicy, StepCancelledError } from "./step-policy";
import { insertAuditLog } from "./audit-logger";

/**
 * Spend-governance gate (CC-2026-10-01-009): the workspaces row's real
 * governance columns — hard_monthly_budget, auto_pause_threshold_enabled —
 * now control execution. Monthly token spend is computed from real
 * audit_logs rows (this calendar month); if a workspace with auto-pause
 * enabled is at/over its hard budget, pending runs are left unclaimed and
 * running runs are cancelled. Operator workspaces (the seeded defaults) are
 * exempt — the OS must keep running while Robert is under budget.
 */
export interface SpendGovernanceResult {
  exempt: boolean;
  monthTokens: number;
  budgetUsd: number;
  paused: boolean;
  reason: string;
}

const GOVERNANCE_EXEMPT_WORKSPACES = new Set([
  "00000000-0000-0000-0000-000000000000",
  "00000000-0000-0000-0000-000000000001",
]);

/**
 * Estimated USD cost per 1M tokens. Honest estimate: Gemini Flash-class
 * pricing (~$0.10/M in, $0.40/M out). The audit_logs rows carry token counts
 * but per-token pricing is not recorded per model, so this is a declared
 * estimate, not a fabricated invoice.
 */
export const GOVERNANCE_EST_USD_PER_MTOK = 0.25;

export async function evaluateSpendGovernance(
  workspaceId: string
): Promise<SpendGovernanceResult> {
  const db = await getDb();
  const exempt = GOVERNANCE_EXEMPT_WORKSPACES.has(workspaceId);
  const base = { exempt, monthTokens: 0, budgetUsd: 0, paused: false, reason: "" };
  if (exempt || !db) return { ...base, reason: exempt ? "operator workspace (exempt)" : "db unavailable" };

  const [ws] = await db
    .select({
      budget: workspaces.hardMonthlyBudget,
      autoPause: workspaces.autoPauseThresholdEnabled,
    })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);
  if (!ws) return { ...base, reason: "workspace not found" };
  const budgetUsd = Number(ws.budget ?? 0);
  if (!ws.autoPause || !(budgetUsd > 0)) {
    return { ...base, budgetUsd, reason: ws.autoPause ? "no budget set" : "auto-pause disabled" };
  }

  const [agg] = await db
    .select({
      tokens: sql<number>`coalesce(sum(${auditLogs.tokensTotal}), 0)`,
    })
    .from(auditLogs)
    .where(
      and(
        eq(auditLogs.workspaceId, workspaceId),
        sql`${auditLogs.createdAt} >= date_trunc('month', now())`
      )
    );
  const monthTokens = Number(agg?.tokens ?? 0);
  const estUsd = (monthTokens / 1_000_000) * GOVERNANCE_EST_USD_PER_MTOK;
  if (estUsd >= budgetUsd) {
    return {
      exempt,
      monthTokens,
      budgetUsd,
      paused: true,
      reason: `monthly estimated spend $${estUsd.toFixed(2)} >= hard budget $${budgetUsd.toFixed(2)} (${monthTokens} tokens)`,
    };
  }
  return {
    exempt,
    monthTokens,
    budgetUsd,
    paused: false,
    reason: `within budget ($${estUsd.toFixed(2)} of $${budgetUsd.toFixed(2)}, ${monthTokens} tokens)`,
  };
}

// ---------------------------------------------------------------- lease -------
// Execution lease (2026-09-30 poller design). Any lane that executes runs —
// inline sweeps, the local executor, the Cloud Run poller Job — claims them
// through the same guard, so concurrent invocations can never double-execute
// a step (the previous "select all pending" shape had no such guard and was
// only accidentally safe because at most one lane ran at a time).

const LEASE_TTL_MINUTES = 10;

const WORKER_ID =
  (process.env.POLLER_WORKER_ID ||
    `inline-${process.pid}-${Date.now().toString(36)}`).slice(0, 128);

/**
 * Re-queue runs whose worker died mid-flight: status 'running' with a lease
 * older than the TTL. Completed steps are skipped on resume by the existing
 * run-step logic, so the requeue is exactly the established resume semantics.
 * Runs 'running' WITHOUT any lease are pre-lease legacy rows — recovery only
 * adopts rows this system claimed, never unknown ones.
 */
export async function requeueExpiredLeases(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.execute(sql`
    UPDATE workflow_runs
    SET status = 'pending',
        locked_at = NULL,
        locked_by = NULL,
        updated_at = now(),
        error_message = COALESCE(error_message, '') ||
          ' [lease expired — requeued for execution]'
    WHERE status = 'running'
      AND locked_at IS NOT NULL
      AND locked_at < now() - interval '${sql.raw(String(LEASE_TTL_MINUTES))} minutes'
    RETURNING id
  `);
  const rows = extractRows<{ id: string }>(result);
  if (rows.length > 0) {
    console.log(
      `[QueueProcessor] Requeued ${rows.length} run(s) after lease expiry:`,
      rows.map(r => r.id).join(", ")
    );
  }
  return rows.length;
}

/**
 * Extract rows from db.execute() regardless of driver shape: postgres-js
 * returns the RowList array DIRECTLY (no .rows property — proven 2026-09-30
 * via scripts probe), node-postgres returns { rows }. This is the actual
 * root cause of the two stranded-run incidents: the claim/requeue statements
 * executed correctly both times, but `.rows` access on an array returned
 * undefined and the code reported zero rows.
 */
function extractRows<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  const rows = (result as { rows?: T[] } | null)?.rows;
  return Array.isArray(rows) ? rows : [];
}

interface ClaimedRunRow {
  id: string;
  workspace_id: string;
  workflow_id: string;
  status: string;
  trigger_source: string;
  initial_context: Record<string, unknown> | null;
  locked_at: string | null;
  locked_by: string | null;
  [key: string]: unknown;
}

/**
 * Atomically claim up to $limit pending runs (unclaimed, or whose 10-minute
 * lease expired). FOR UPDATE SKIP LOCKED makes concurrent claimers safe:
 * each pending run is handed to exactly one worker. Single-statement
 * UPDATE…RETURNING (no CTE wrapper): rows come back from the UPDATE itself —
 * the earlier CTE+outer-SELECT shape set the lease but returned zero rows
 * through the drizzle driver (observed on execution agentlab-poller-b5qnv).
 */
export async function claimPendingRuns(limit = 20): Promise<ClaimedRunRow[]> {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(sql`
    UPDATE workflow_runs
    SET status = 'running',
        locked_at = now(),
        locked_by = ${WORKER_ID},
        updated_at = now(),
        started_at = COALESCE(started_at, now())
    WHERE id IN (
      SELECT id FROM workflow_runs
      WHERE status = 'pending'
        AND (locked_at IS NULL OR locked_at < now() - interval '${sql.raw(String(LEASE_TTL_MINUTES))} minutes')
      ORDER BY created_at
      FOR UPDATE SKIP LOCKED
      LIMIT ${limit}
    )
    RETURNING id, workspace_id, workflow_id, status, trigger_source,
              initial_context, locked_at, locked_by, cancel_requested, created_at
  `);
  const rows = extractRows<ClaimedRunRow>(result);
  return rows.sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
}

/**
 * Pause gate (CC-2026-10-02-011, disposition 3-A): `agents.status` had zero
 * readers — "Pause Node" on the Agents page was display-only and a paused
 * agent kept executing. A paused agent now refuses its steps loudly; the
 * step catch marks the step/failed run with this message and writes the
 * honest failure audit row.
 */
export function assertAgentRunnable(agent: {
  name: string;
  status?: string | null;
}): void {
  if (agent.status === "paused") {
    throw new Error(
      `Agent "${agent.name}" is paused by operator — activate the node on the Agents page to run this step.`
    );
  }
}

export async function processPendingRuns(limit = 20): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn("[QueueProcessor] Database not available");
    return 0;
  }

  let pendingRuns: ClaimedRunRow[] = [];
  try {
    // 1. Recover runs abandoned by dead workers (lease expired mid-flight),
    // then atomically claim pending runs. FOR UPDATE SKIP LOCKED guarantees
    // concurrent lanes (UI sweeps, the poller Job, local executors) never
    // share a run — each is handed to exactly one worker.
    await requeueExpiredLeases();
    pendingRuns = await claimPendingRuns(limit);
    console.log(`[QueueProcessor] Claimed ${pendingRuns.length} pending run(s) (worker ${WORKER_ID}).`);

    // Spend-governance cache for this batch (CC-2026-10-01-009): one
    // evaluation per workspace per sweep.
    const governanceByWorkspace = new Map<string, SpendGovernanceResult>();

    for (const raw of pendingRuns) {
      // Claim rows return snake_case from the raw CTE; map onto the shape the
      // step loop reads. The body below only uses: id, workspaceId,
      // workflowId, initialContext, cancelRequested.
      const run = {
        id: raw.id,
        workspaceId: raw.workspace_id,
        workflowId: raw.workflow_id,
        status: raw.status,
        triggerSource: raw.trigger_source,
        initialContext: raw.initial_context,
        cancelRequested: Boolean(raw.cancel_requested),
      };

      console.log(`[QueueProcessor] Processing claimed run ${run.id}...`);

      // Spend-governance gate (CC-2026-10-01-009): honor the workspace row's
      // hard_monthly_budget + auto_pause_threshold_enabled. A paused run is
      // failed with the real reason (never silently dropped), and the pause
      // event lands in audit_logs with the not-llm-dispatch label.
      const gov =
        governanceByWorkspace.get(run.workspaceId) ??
        (await evaluateSpendGovernance(run.workspaceId));
      governanceByWorkspace.set(run.workspaceId, gov);
      if (gov.paused) {
        await db
          .update(workflowRuns)
          .set({
            status: "failed",
            errorMessage: `Auto-paused by workspace budget governance: ${gov.reason}`,
            updatedAt: new Date(),
          })
          .where(eq(workflowRuns.id, run.id));
        await db.insert(auditLogs).values({
          workspaceId: run.workspaceId,
          actionType: "BUDGET_AUTOPAUSE",
          model: "not-llm-dispatch",
          payloadIn: {
            runId: run.id,
            reason: gov.reason,
            monthTokens: gov.monthTokens,
            budgetUsd: gov.budgetUsd,
          },
          status: "warning",
        });
        console.warn(`[QueueProcessor] Auto-paused run ${run.id}: ${gov.reason}`);
        continue;
      }

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
        // Lease heartbeat: extend our claim before each step so long-running
        // steps never look abandoned. Guarded by locked_by — if the run was
        // recovered and re-claimed by another worker, a stale worker cannot
        // re-stamp the lease (its updates simply match zero rows).
        await db
          .update(workflowRuns)
          .set({ lockedAt: new Date() })
          .where(
            and(
              eq(workflowRuns.id, run.id),
              eq(workflowRuns.lockedBy, WORKER_ID)
            )
          );

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
                // Pause gate (CC-2026-10-02-011, disposition 3-A): agents.status
                // previously had zero readers — "Pause Node" was display-only.
                assertAgentRunnable(agentData[0]);
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
                    // Honesty doctrine: name the model that actually answered.
                    ...(result.modelUsed ? { modelUsed: result.modelUsed } : {}),
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
              // Honest telemetry (2026-09-28): the runner reports the model
              // that actually answered; the old hard-coded "gemini-2.5-flash"
              // stopped being true when that model was withdrawn for new
              // accounts and the chain moved to the -latest aliases.
              model: result.modelUsed || "gemini-flash-latest",
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
              // The step threw before any model answered — no result object
              // exists here. "unavailable" beats naming a model that did not
              // produce the failure output.
              model: "unavailable",
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
  // Callers (the poll-tick entrypoint) use the count to decide whether
  // another drain iteration is worth doing within this tick.
  return pendingRuns.length;
}
