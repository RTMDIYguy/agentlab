import { getDb } from './server/db';
import { workflows, workflowRuns, workflowRunSteps, auditLogs } from './server/schema';
import { eq, inArray } from 'drizzle-orm';

async function migrateGodMode() {
  const db = await getDb();
  if(!db) return;
  const oldWs = '00000000-0000-0000-0000-000000000001';
  const newWs = '00000000-0000-0000-0000-000000000000';

  console.log('Migrating data from', oldWs, 'to', newWs);

  try {
    const wfs = await db.select({ id: workflows.id }).from(workflows).where(eq(workflows.workspaceId, oldWs));
    const wfIds = wfs.map(w => w.id);
    console.log(`Found ${wfIds.length} workflows in old workspace`);

    if (wfIds.length > 0) {
      // For workflows, there might be unique constraint conflicts.
      // We will loop and handle them one by one.
      for (const wf of wfs) {
        try {
          await db.update(workflows).set({ workspaceId: newWs }).where(eq(workflows.id, wf.id));
        } catch (err: any) {
           if (err.code === '23505') {
             // Conflict! Just append a suffix to the workflow name
             console.log(`Conflict on workflow ${wf.id}, updating name`);
             await db.update(workflows)
               .set({ workspaceId: newWs, name: db.select({name: workflows.name}).from(workflows).where(eq(workflows.id, wf.id)) as any + ' (Migrated)' })
               .where(eq(workflows.id, wf.id));
           } else {
             throw err;
           }
        }
      }
    }

    const runs = await db.update(workflowRuns).set({ workspaceId: newWs }).where(eq(workflowRuns.workspaceId, oldWs)).returning({ id: workflowRuns.id });
    console.log(`Migrated ${runs.length} workflow runs`);

    const runSteps = await db.update(workflowRunSteps).set({ workspaceId: newWs }).where(eq(workflowRunSteps.workspaceId, oldWs)).returning({ id: workflowRunSteps.id });
    console.log(`Migrated ${runSteps.length} workflow run steps`);

    const logs = await db.update(auditLogs).set({ workspaceId: newWs }).where(eq(auditLogs.workspaceId, oldWs)).returning({ id: auditLogs.id });
    console.log(`Migrated ${logs.length} audit logs`);

    console.log('Migration complete');
  } catch(err) {
    console.error('Migration failed', err);
  }
}

migrateGodMode().catch(console.error).finally(()=>process.exit(0));
