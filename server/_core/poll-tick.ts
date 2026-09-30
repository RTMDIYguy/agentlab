/**
 * Poller tick entrypoint for the agentlab-poller Cloud Run Job (2026-09-30
 * poller design). Bundled to dist/poll-tick.js by the build script (kept in
 * server/_core/ so esbuild's flat outbase emits dist/index.js AND
 * dist/poll-tick.js — the Dockerfile CMD for the web service is untouched).
 *
 * The Job runs `node dist/poll-tick.js` with the same env as the service.
 * One tick = recovery pass + claim/drain loop:
 *   - processPendingRuns() claims via FOR UPDATE SKIP LOCKED (concurrent
 *     lanes can never share a run), executes each claimed run to its next
 *     parking point, and returns how many runs it claimed.
 *   - The loop repeats while runs keep being claimed, then exits. Cloud
 *     Scheduler re-kicks every minute, so this process normally lives for
 *     seconds — the budget below is only a runaway guard.
 */
import "./env";
import { processPendingRuns } from "../execution/queue-processor";

const TICK_BUDGET_MS = Number(process.env.POLLER_TICK_BUDGET_MS || 50 * 60 * 1000);
const startedAt = Date.now();

async function main() {
  console.log(
    `[PollerTick] started (worker ${(process.env.POLLER_WORKER_ID || "job").slice(0, 32)})`
  );
  let passes = 0;
  let totalClaimed = 0;
  while (Date.now() - startedAt < TICK_BUDGET_MS) {
    const claimed = await processPendingRuns(20);
    passes += 1;
    totalClaimed += claimed;
    if (claimed === 0) {
      console.log("[PollerTick] no claimable runs — exiting.");
      break;
    }
  }
  console.log(
    `[PollerTick] done: ${passes} pass(es), ${totalClaimed} run(s) claimed, ${Date.now() - startedAt}ms.`
  );
  process.exit(0);
}

main().catch(err => {
  console.error("[PollerTick] fatal:", err?.message ?? err);
  process.exit(1);
});
