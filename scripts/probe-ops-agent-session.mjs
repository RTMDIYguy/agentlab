/**
 * READ-ONLY probe: recent Ops Agent sessions with hard evidence.
 *
 * Lists ops_agent_messages inside a time window, then resolves every
 * runResult.runId it finds against workflow_runs (status, DAG name via
 * workflows) and workflow_run_steps (per-step status/cost/latency).
 * Also surfaces any "Model:" telemetry line from the assistant content.
 *
 * Never writes. Single pooled connection, closed on exit.
 *
 * Usage: node scripts/probe-ops-agent-session.mjs [hoursBack]  (default 36)
 * Run via: pnpm exec infisical run --env=dev -- node scripts/probe-ops-agent-session.mjs
 */
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not present — run via infisical.");
  process.exit(1);
}
const sql = postgres(url, { prepare: false, max: 1 });
const hoursBack = Number(process.argv[2] || 36);

const clip = (s, n = 220) =>
  String(s ?? "").replace(/\s+/g, " ").trim().slice(0, n);
const modelLine = (s) => {
  const m = String(s ?? "").match(/Model:[^\n|]*/);
  return m ? clip(m[0], 160) : null;
};

try {
  const health = await sql`
    select (select count(*) from ops_agent_messages) as ops_msgs_total,
           (select max(created_at) from ops_agent_messages) as ops_last_msg,
           (select count(*) from workflow_runs) as runs_total,
           (select max(created_at) from workflow_runs) as runs_last,
           (select max(created_at) from workflow_run_steps) as steps_last`;
  console.log("== db health ==");
  console.log(JSON.stringify(health, null, 2));

  const msgs = await sql`
    select m.id, m.workspace_id, m.thread_id, m.role, m.content,
           m.proposal, m.run_result, m.execution_status, m.created_at
    from ops_agent_messages m
    where m.created_at > now() - make_interval(hours => ${hoursBack})
    order by m.thread_id, m.created_at asc`;

  console.log(`== ops_agent_messages (last ${hoursBack}h): ${msgs.length} rows ==`);
  const runIds = new Set();
  const threads = new Map();
  for (const m of msgs) {
    const t = threads.get(m.thread_id) ?? { workspaceId: m.workspace_id, roles: {} };
    t.roles[m.role] = (t.roles[m.role] ?? 0) + 1;
    threads.set(m.thread_id, t);
    const rr = m.run_result ?? {};
    if (rr.runId) runIds.add(rr.runId);
    console.log(
      [
        m.created_at?.toISOString?.() ?? m.created_at,
        `thread=${m.thread_id}`,
        `role=${m.role}`,
        m.execution_status ? `exec=${m.execution_status}` : null,
        rr.runId ? `runId=${rr.runId}` : null,
        rr.tokensUsed != null ? `tokens=${rr.tokensUsed}` : null,
        rr.latencyMs != null ? `latencyMs=${rr.latencyMs}` : null,
        m.proposal?.title ? `proposal="${clip(m.proposal.title, 80)}"` : null,
        modelLine(m.content) ? `| ${modelLine(m.content)}` : null,
        `:: ${clip(m.content, 200)}`,
      ]
        .filter(Boolean)
        .join(" ")
    );
  }
  console.log(`\n== threads == ${threads.size}`);
  for (const [threadId, t] of threads)
    console.log(`  ${threadId}  workspace=${t.workspaceId}  ${JSON.stringify(t.roles)}`);

  for (const runId of runIds) {
    console.log(`\n== workflow_run ${runId} ==`);
    const runs = await sql`
      select r.id, r.status, r.trigger_source, r.started_at, r.completed_at,
             r.created_at, w.name as workflow_name, w.id as workflow_id
      from workflow_runs r
      join workflows w on w.id = r.workflow_id
      where r.id = ${runId}`;
    console.log(JSON.stringify(runs, null, 2));

    const steps = await sql`
      select s.order_index, s.title, s.step_type,
             rs.status as run_status, rs.cost, rs.latency_ms,
             rs.started_at, rs.completed_at,
             left(rs.error_message, 160) as error_head
      from workflow_run_steps rs
      join workflow_steps s on s.id = rs.workflow_step_id
      where rs.workflow_run_id = ${runId}
      order by s.order_index asc`;
    console.log(`== steps (${steps.length}) ==`);
    console.log(JSON.stringify(steps, null, 2));
  }
  if (runIds.size === 0)
    console.log("\n(no runResult.runId found in window — check threads above)");

  const recent = await sql`
    select r.id, r.status, r.trigger_source, r.created_at, r.started_at,
           r.completed_at, r.workflow_id, w.name as workflow_name,
           w.created_at as workflow_created_at
    from workflow_runs r
    join workflows w on w.id = r.workflow_id
    where r.created_at > now() - make_interval(hours => ${hoursBack})
    order by r.created_at desc`;
  console.log(`\n== workflow_runs (last ${hoursBack}h): ${recent.length} ==`);
  for (const r of recent)
    console.log(
      [
        r.created_at?.toISOString?.() ?? r.created_at,
        `run=${r.id}`,
        r.status,
        `src=${r.trigger_source}`,
        `wf="${clip(r.workflow_name, 60)}"`,
        r.workflow_created_at
          ? `wfCreated=${r.workflow_created_at?.toISOString?.() ?? r.workflow_created_at}`
          : null,
      ].filter(Boolean).join(" ")
    );

  const audits = await sql`
    select a.action_type, a.model, a.tokens_prompt, a.tokens_completion,
           a.tokens_total, a.cost, a.latency_ms, a.status, a.created_at,
           w.name as workflow_name
    from audit_logs a
    left join workflows w on w.id = a.workflow_id
    where a.created_at > now() - make_interval(hours => ${hoursBack})
    order by a.created_at desc`;
  console.log(`\n== audit_logs (last ${hoursBack}h): ${audits.length} ==`);
  for (const a of audits)
    console.log(
      [
        a.created_at?.toISOString?.() ?? a.created_at,
        `model=${a.model}`,
        `act=${a.action_type}`,
        `tok=${a.tokens_total} (p${a.tokens_prompt}/c${a.tokens_completion})`,
        `cost=${a.cost}`,
        `lat=${a.latency_ms}ms`,
        a.status,
        a.workflow_name ? `wf="${clip(a.workflow_name, 50)}"` : null,
      ]
        .filter(Boolean)
        .join(" ")
    );

  const detailIds = new Set([...runIds, ...recent.map((r) => r.id)]);
  for (const runId of detailIds) {
    console.log(`\n== workflow_run detail ${runId} ==`);
    const steps = await sql`
      select s.order_index, s.title, s.step_type,
             rs.status as run_status, rs.cost, rs.latency_ms,
             rs.started_at, rs.completed_at,
             left(rs.error_message, 160) as error_head
      from workflow_run_steps rs
      join workflow_steps s on s.id = rs.workflow_step_id
      where rs.workflow_run_id = ${runId}
      order by s.order_index asc`;
    console.log(`== steps (${steps.length}) ==`);
    console.log(JSON.stringify(steps, null, 2));
  }
} catch (err) {
  console.error("Probe failed:", err?.message ?? err);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
