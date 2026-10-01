/**
 * READ-ONLY probe: workspace_integrations rows (MCP/webhook/oauth registry).
 * Shows what the OS Settings actually stored, without printing secret values —
 * any config key matching /token|secret|key|password|authorization|pat/i is
 * masked to "***present(len N)***".
 *
 * Usage: node scripts/probe-workspace-integrations.mjs [hoursBack=720]
 * Run via: pnpm exec infisical run --env=dev -- node scripts/probe-workspace-integrations.mjs
 */
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not present — run via infisical.");
  process.exit(1);
}
const sql = postgres(url, { prepare: false, max: 1 });
const hoursBack = Number(process.argv[2] || 720);

const SECRET_KEY = /token|secret|key|password|authorization|pat\b|bearer/i;

function maskConfig(value, depth = 0) {
  if (value == null) return value;
  if (Array.isArray(value)) return value.map((v) => maskConfig(v, depth + 1));
  if (typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] =
        SECRET_KEY.test(k) && typeof v === "string" && v.length > 0
          ? `***present(len ${v.length})***`
          : maskConfig(v, depth + 1);
    }
    return out;
  }
  return value;
}

try {
  const rows = await sql`
    select id, workspace_id, type, name, config, status, created_at, updated_at
    from workspace_integrations
    where updated_at > now() - make_interval(hours => ${hoursBack})
    order by updated_at desc`;

  console.log(`== workspace_integrations (last ${hoursBack}h): ${rows.length} ==`);
  for (const r of rows) {
    const isMcp = /mcp|upwork/i.test(`${r.type} ${r.name} ${JSON.stringify(r.config ?? {})}`);
    console.log(
      [
        isMcp ? ">>> " : "    ",
        r.updated_at?.toISOString?.() ?? r.updated_at,
        `type=${r.type}`,
        `name="${r.name}"`,
        `status=${r.status}`,
        `workspace=${r.workspace_id}`,
        `id=${r.id}`,
      ].join(" ")
    );
    console.log("      config:", JSON.stringify(maskConfig(r.config), null, 2).replace(/\n/g, "\n      "));
  }
  if (rows.length === 0) console.log("(no rows in window)");
} catch (err) {
  console.error("Probe failed:", err?.message ?? err);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
