import { getDb } from './server/db';
import { workflows, workflowRuns } from './server/schema';
import { desc } from 'drizzle-orm';

async function test() {
  const db = await getDb();
  if(!db) return;
  const wfs = await db.select().from(workflows).orderBy(desc(workflows.createdAt)).limit(10);
  const runs = await db.select().from(workflowRuns).orderBy(desc(workflowRuns.createdAt)).limit(10);
  
  console.log("WORKFLOWS:", JSON.stringify(wfs.map(w => ({ id: w.id, ws: w.workspaceId, name: w.name })), null, 2));
  console.log("RUNS:", JSON.stringify(runs.map(r => ({ id: r.id, ws: r.workspaceId, wfId: r.workflowId })), null, 2));
}

test().catch(console.error).finally(()=>process.exit(0));
