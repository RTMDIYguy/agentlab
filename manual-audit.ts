import { db } from "./server/db";
import { auditLogs, workflowRuns, workspaces } from "./server/schema";
import { eq } from "drizzle-orm";
import { runStartupDiagnostics } from "./server/execution/watchdog";
import { processScheduledWorkflows } from "./server/execution/scheduler";

async function main() {
  console.log("--- Running Startup Diagnostics Manually ---");
  await runStartupDiagnostics();
  
  console.log("--- Running Scheduler Manually ---");
  await processScheduledWorkflows();

  console.log("--- Checking Audit Logs ---");
  const logs = await db.select().from(auditLogs).limit(5);
  console.log(`Found ${logs.length} audit logs. First log:`, logs[0]);
  
  console.log("--- Checking Workspaces ---");
  const allWorkspaces = await db.select().from(workspaces);
  console.log(`Found ${allWorkspaces.length} workspaces.`);
  if (allWorkspaces.length > 0) {
    allWorkspaces.forEach(w => console.log(`- ${w.name} (slug: ${w.slug}, id: ${w.id})`));
  }
  
  process.exit(0);
}

main().catch(console.error);
