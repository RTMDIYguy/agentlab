/**
 * READ-ONLY poller for a validation run: run status, per-step rows,
 * and any action_dispatches parked for approval.
 * Usage: node probe-run-context.mjs [runId|runIdPrefix]  (default: d68deaa9 legacy run)
 * Accepts the short-ID prefixes used in the change-control register — the full
 * UUID is resolved from workflow_runs before probing.
 */
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not present — run via infisical.");
  process.exit(1);
}
const sql = postgres(url, { prepare: false, max: 1 });
const RUN_ARG = process.argv[2] || "d68deaa9-ed7d-44aa-a611-a9f1d25dd974";

let RUN_ID = RUN_ARG;
if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(RUN_ARG)) {
  const matches = await sql`
    select id from workflow_runs where id::text like ${RUN_ARG + "%"} order by created_at desc`;
  if (matches.length === 0) {
    console.error(`No workflow_runs row matches prefix "${RUN_ARG}".`);
    await sql.end({ timeout: 5 });
    process.exit(1);
  }
  if (matches.length > 1) {
    console.error(`Prefix "${RUN_ARG}" is ambiguous (${matches.length} runs):`);
    for (const m of matches) console.error("  " + m.id);
    await sql.end({ timeout: 5 });
    process.exit(1);
  }
  RUN_ID = matches[0].id;
  console.log(`[probe] resolved prefix ${RUN_ARG} -> ${RUN_ID}`);
}

try {
  const run = await sql`
    select id, status, error_message, created_at, updated_at
    from workflow_runs where id = ${RUN_ID}`;
  console.log("== run ==");
  console.log(JSON.stringify(run, null, 2));

  const steps = await sql`
    select s.order_index, s.title, s.step_type, rs.status as run_status,
           left(rs.error_message, 200) as error_head, rs.completed_at
    from workflow_run_steps rs
    join workflow_steps s on s.id = rs.workflow_step_id
    where rs.workflow_run_id = ${RUN_ID}
    order by s.order_index asc`;
  console.log("== steps ==");
  console.log(JSON.stringify(steps, null, 2));

  const dispatches = await sql`
    select id, status, connector, left(title, 120) as title_head, payload, created_at
    from action_dispatches where workflow_run_id = ${RUN_ID}`;
  console.log("== action_dispatches ==");
  console.log(JSON.stringify(dispatches, null, 2));
} catch (err) {
  console.error("Probe failed:", err?.message ?? err);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
