/** Resets a failed run to pending so the real pipeline can re-execute it. */
import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });
const id = process.argv[2];
if (!id) { console.error("usage: node reset-run.mjs <runId>"); process.exit(1); }
await sql`update workflow_runs set status = 'pending', updated_at = now() where id = ${id}`;
console.log(JSON.stringify({ reset: id, status: "pending" }));
await sql.end({ timeout: 5 });
