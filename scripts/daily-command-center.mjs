import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Chicago",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

const sources = {
  agencyManual: "docs/operations/agency-operating-manual.md",
  executionChecklist: "docs/operations/urc-agent-execution-checklist.md",
  workflowAuditBank: "docs/operations/weekly-workflow-audit-bank.md",
  workflowRelationshipMap: "docs/operations/workflow-relationship-map.md",
  changeControl: "docs/operations/change-control-register.md",
  ownersManualBlueprint: "docs/operations/agency-owners-manual-blueprint.md",
};

async function readText(relativePath) {
  try {
    return await readFile(path.join(root, relativePath), "utf8");
  } catch (error) {
    return `SOURCE_UNAVAILABLE: ${relativePath} (${error.code ?? error.message})`;
  }
}

function extractSection(markdown, heading) {
  const start = markdown.indexOf(heading);
  if (start === -1) return "";

  const after = markdown.slice(start);
  const nextHeading = after.slice(heading.length).search(/\n##?\s/);
  return nextHeading === -1 ? after : after.slice(0, heading.length + nextHeading);
}

function extractTableRows(markdown, heading) {
  return extractSection(markdown, heading)
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith("|"))
    .filter((line) => !/^\|\s*-+/.test(line));
}

function stripCode(value) {
  return value.replace(/`/g, "").trim();
}

function tableRowCells(row) {
  return row
    .split("|")
    .slice(1, -1)
    .map((cell) => stripCode(cell));
}

function bulletLines(markdown, heading) {
  return extractSection(markdown, heading)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim());
}

function getActiveQueue(agencyManual) {
  const rows = extractTableRows(agencyManual, "## Workflow Test And Implementation Queue")
    .map(tableRowCells)
    .filter((cells) => cells.length >= 5 && cells[0] !== "Priority");

  return rows.map(([priority, workflow, why, mode, target]) => ({
    priority,
    workflow,
    why,
    mode,
    target,
  }));
}

function getOpenBuildItems(agencyManual) {
  const rows = extractTableRows(agencyManual, "## Open Build Items")
    .map(tableRowCells)
    .filter((cells) => cells.length >= 3 && cells[0] !== "Item");

  return rows.map(([item, owner, status]) => ({ item, owner, status }));
}

function getRecentChangeRows(changeControl) {
  return changeControl
    .split(/\r?\n/)
    .filter((line) => line.startsWith("| 2026-06-03 |"))
    .slice(-5)
    .map((line) => tableRowCells(line))
    .filter((cells) => cells.length >= 8)
    .map((cells) => ({
      id: cells[1],
      area: cells[2],
      summary: cells[4],
      status: cells[8] ?? "Active",
    }));
}

function getAuditLanes(workflowAuditBank) {
  const rows = extractTableRows(workflowAuditBank, "## Audit Questions")
    .map(tableRowCells)
    .filter((cells) => cells.length >= 4 && cells[0] !== "Audit Lane");

  return rows.map(([lane, question, passSignal, reviewSignal]) => ({
    lane,
    question,
    passSignal,
    reviewSignal,
  }));
}

function getMkt09Checklist(workflowAuditBank) {
  return bulletLines(workflowAuditBank, "## MKT-09 Minimum Viable Slice");
}

function topActions(activeQueue, openBuildItems) {
  const queueActions = activeQueue.slice(0, 3).map((item) => {
    return `${item.workflow}: ${item.target}`;
  });

  const ownerManualItem = openBuildItems.find((item) =>
    item.item.toLowerCase().includes("owner's manual"),
  );

  const auditItem = openBuildItems.find((item) =>
    item.item.toLowerCase().includes("workflow audit"),
  );

  return [
    "Check money/client-trust items before tool experiments.",
    ...queueActions,
    ownerManualItem ? ownerManualItem.item : null,
    auditItem ? auditItem.item : null,
  ].filter(Boolean).slice(0, 3);
}

function marketingAndSalesMoves(activeQueue) {
  return activeQueue
    .filter((item) => /MKT-|SAL-/.test(item.workflow))
    .slice(0, 5)
    .map((item) => `${item.workflow} (${item.mode}): ${item.why}`);
}

function followUpsAndHandoffs(activeQueue) {
  return activeQueue
    .filter((item) => /SAL-|FUL-|FIN-|AFC-/.test(item.workflow))
    .slice(0, 5)
    .map((item) => `${item.workflow}: ${item.target}`);
}

function renderList(items, emptyText = "No items found in current source scan.") {
  if (!items.length) return `- ${emptyText}`;
  return items.map((item) => `- ${item}`).join("\n");
}

function renderBrief({ activeQueue, openBuildItems, recentChanges, auditLanes, mkt09Checklist }) {
  const actions = topActions(activeQueue, openBuildItems);
  const marketingSales = marketingAndSalesMoves(activeQueue);
  const handoffs = followUpsAndHandoffs(activeQueue);
  const openNeeded = openBuildItems
    .filter((item) => /Needed|Pending|Deferred/i.test(item.status))
    .slice(0, 8)
    .map((item) => `${item.item} (${item.status}; owner: ${item.owner})`);
  const changes = recentChanges.map((change) => `${change.id} ${change.area}: ${change.summary}`);

  return `# Daily Command Brief - ${today}

Status: generated

## Top 3 Actions

${renderList(actions)}

## Marketing And Sales Moves

${renderList(marketingSales)}

## Follow-Ups And Handoffs

${renderList(handoffs)}

## Workflow Audit Prompt

- Start with MKT-09 until the event lane is runnable.
- Audit lanes today: ${auditLanes.map((lane) => lane.lane).join("; ")}.
- MKT-09 minimum slice:
${mkt09Checklist.slice(0, 12).map((item) => `  - ${item}`).join("\n")}

## Money And Client-Trust Checks

- Review invoices, payment status, receivables, proposals, onboarding, client issues, and promised follow-ups before optional platform experiments.
- Confirm any paid-tool, cloud, VPS, KNIME, or Stripe Connect work has a current revenue, client-trust, or learning reason.

## Parking Lot

${renderList(openNeeded)}

## Ask Robert

- Which one marketing or sales action should receive the first human judgment block today?
- Did any new account, tool, relationship, affiliate link, or schedule appear that needs registry capture?

## Recent Source Notes

${renderList(changes)}

## Source Boundary

- This brief is generated from approved repo/workspace operating docs.
- It must not include secret values, backup codes, OAuth secrets, service-account private keys, or client-sensitive raw data.
`;
}

async function main() {
  const [
    agencyManual,
    executionChecklist,
    workflowAuditBank,
    workflowRelationshipMap,
    changeControl,
    ownersManualBlueprint,
  ] = await Promise.all(Object.values(sources).map(readText));

  const activeQueue = getActiveQueue(agencyManual);
  const openBuildItems = getOpenBuildItems(agencyManual);
  const recentChanges = getRecentChangeRows(changeControl);
  const auditLanes = getAuditLanes(workflowAuditBank);
  const mkt09Checklist = getMkt09Checklist(workflowAuditBank);

  const brief = renderBrief({
    activeQueue,
    openBuildItems,
    recentChanges,
    auditLanes,
    mkt09Checklist,
    executionChecklist,
    workflowRelationshipMap,
    ownersManualBlueprint,
  });

  const outDir = path.join(root, "docs/operations/daily-command-center");
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, `${today}-command-brief.md`);
  await writeFile(outPath, brief, "utf8");
  console.log(`Daily command brief written: ${path.relative(root, outPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
