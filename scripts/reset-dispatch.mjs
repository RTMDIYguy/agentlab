/** One-shot: reset dispatch 2cd0f477 to awaiting_approval (approval was given in-session; the failure was environmental). */
import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });
const id = "2cd0f477-40e6-436c-ae8f-5bf651469524";
const rows = await sql`
  update action_dispatches
  set status = 'awaiting_approval', dispatch_error = null, run_outcome = null
  where id = ${id} and status = 'dispatch_failed'
  returning id, status`;
console.log(JSON.stringify(rows));
await sql.end({ timeout: 5 });
