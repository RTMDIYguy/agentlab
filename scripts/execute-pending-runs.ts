/**
 * Executes pending workflow runs through the REAL pipeline (the same
 * processPendingRuns the dev server's poller calls). Used because the local
 * dev server is currently down; a background server process cannot be
 * spawned from this session.
 */
import { processPendingRuns } from "../server/execution/queue-processor";

processPendingRuns()
  .then(() => {
    console.log("[execute-pending] processPendingRuns completed.");
    process.exit(0);
  })
  .catch(err => {
    console.error("[execute-pending] failed:", err?.message ?? err);
    process.exit(1);
  });
