// Weekly usage brief (CC-2026-09-25-013): answers "is anyone using the
// platform?" from the three evidence layers.
//   1. Accounts & interest: new users + visitor_profiles (incl. anonymous)
//   2. Real usage: intake conversations, ops-agent chats, runs, artifacts
//   3. Raw clicks: Cloud Run request logs (last 7 days), humans vs scanners
// Run: pnpm usage:weekly   (DB via Infisical; gcloud optional - skipped if unavailable)
// Prints owner emails only for accounts; visitor content is summarized by
// counts and dates, never raw transcripts.
import postgres from "postgres";
import { execFileSync } from "node:child_process";

const since = new Date(Date.now() - 7 * 24 * 3600 * 1000);
const iso = since.toISOString();
console.log(`# Weekly Usage Brief — week of ${iso.slice(0, 10)}\n`);

const sql = postgres(process.env.DATABASE_URL, {
  prepare: false,
  connect_timeout: 15,
  max: 1,
});

// 1. Accounts
const newUsers = await sql`
  SELECT email, created_at FROM users WHERE created_at >= ${iso} ORDER BY created_at`;
const totalUsers = await sql`SELECT COUNT(*)::int AS n FROM users`;
console.log(`## Accounts\n- total: ${totalUsers[0].n}; new this week: ${newUsers.length}`);
for (const u of newUsers) console.log(`  - ${u.created_at.toISOString()} ${u.email}`);

// 2. Interest (front door)
const visitors = await sql`
  SELECT
    COUNT(*)::int AS total,
    COUNT(*) FILTER (WHERE email IS NOT NULL)::int AS with_email,
    COUNT(*) FILTER (WHERE email IS NULL)::int AS anonymous,
    COUNT(*) FILTER (WHERE created_at >= ${iso})::int AS new_this_week,
    COUNT(*) FILTER (WHERE claimed_by_workspace_id IS NOT NULL)::int AS claimed
  FROM visitor_profiles`;
const v = visitors[0];
console.log(`\n## Front-door visitors (founder intake)\n- total: ${v.total} (${v.with_email} with email, ${v.anonymous} anonymous)\n- new this week: ${v.new_this_week}; claimed into workspaces: ${v.claimed}`);
const recentVisitors = await sql`
  SELECT COALESCE(NULLIF(email, ''), 'anonymous browser (' || visitor_key || ')') AS who,
         pain_point IS NOT NULL AS shared_pain,
         created_at
  FROM visitor_profiles WHERE created_at >= ${iso} ORDER BY created_at DESC LIMIT 10`;
for (const r of recentVisitors) {
  console.log(`  - ${r.created_at.toISOString()} ${r.who}${r.shared_pain ? " (shared a pain point)" : ""}`);
}

// 3. Real usage
const chats = await sql`
  SELECT COUNT(*)::int AS n, COUNT(DISTINCT workspace_id)::int AS ws
  FROM ops_agent_messages WHERE created_at >= ${iso}`;
const runs = await sql`
  SELECT COUNT(*)::int AS n, COUNT(DISTINCT workspace_id)::int AS ws
  FROM workflow_runs WHERE created_at >= ${iso}`;
const arts = await sql`
  SELECT COUNT(*)::int AS n, COUNT(DISTINCT workspace_id)::int AS ws
  FROM workflow_artifacts WHERE created_at >= ${iso}`;
console.log(`\n## Platform activity (this week)\n- ops-agent chat messages: ${chats[0].n} across ${chats[0].ws} workspace(s)\n- workflow runs: ${runs[0].n} across ${runs[0].ws} workspace(s)\n- artifacts created: ${arts[0].n} across ${arts[0].ws} workspace(s)`);

await sql.end();

// 4. Raw clicks from Cloud Run logs (optional — needs gcloud auth)
console.log(`\n## Raw clicks (Cloud Run, last 7 days)`);
try {
  // Cross-platform notes (each discovered the hard way):
  //  - Node (CVE-2024-27980) refuses to spawn .cmd wrappers with shell:false,
  //    so Windows goes through cmd.exe (shell:true), where Node joins args
  //    VERBATIM — no quoting is added. The filter therefore carries its own
  //    outer double quotes, and to survive cmd's quote parsing it contains
  //    NO inner quotes: values are barewords (valid Logging syntax) and the
  //    timestamp clause became --freshness (its '>' had been read by cmd as
  //    redirection when unquoted).
  //  - Everywhere else: no shell, args array, one argv element, no quotes.
  const plainFilter =
    'resource.type=cloud_run_revision AND resource.labels.service_name=agentlab AND httpRequest.requestUrl:run.app';
  let out = "";
  if (process.platform === "win32") {
    out = execFileSync(
      "gcloud.cmd",
      [
        "logging",
        "read",
        `"${plainFilter}"`,
        "--freshness=7d",
        "--limit=2000",
        "--format=value(httpRequest.remoteIp,httpRequest.userAgent)",
      ],
      // stderr piped (not ignored) so the catch block can surface gcloud's
      // actual error message instead of an opaque Command failed.
      { encoding: "utf8", timeout: 60_000, stdio: ["ignore", "pipe", "pipe"], shell: true }
    ).trim();
  } else {
    out = execFileSync(
      "gcloud",
      [
        "logging",
        "read",
        plainFilter,
        "--freshness=7d",
        "--limit=2000",
        "--format=value(httpRequest.remoteIp,httpRequest.userAgent)",
      ],
      { encoding: "utf8", timeout: 60_000, stdio: ["ignore", "pipe", "ignore"] }
    ).trim();
  }
  const lines = out ? out.split("\n").filter(Boolean) : [];
  const human = lines.filter((l) => !/Tsunami|Scanner|bot|spider|crawler/i.test(l));
  const ips = new Set(human.map((l) => l.split("\t")[0]));
  console.log(`- sampled ${lines.length} requests; ${lines.length - human.length} scanner/bot, ${human.length} non-bot from ${ips.size} distinct address(es)`);
  if (human.length > 0 && human.length <= 20) {
    for (const l of human) console.log(`  - ${l.split("\t").join(" via ")}`);
  }
  if (lines.length === 0) console.log("- no request logs found in window (or gcloud unavailable)");
} catch (err) {
  const stderr = String(err?.stderr || "").split("\n").filter(Boolean)[0];
  const msg = stderr || String(err?.message || err).split("\n")[0];
  console.log(`- click counts skipped (gcloud subprocess failed: ${msg}). Run manually: gcloud logging read ...`);
}

console.log("\nDONE");
