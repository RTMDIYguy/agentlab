import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { execSync } from "node:child_process";

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
    .filter((line) => /^\| \d{4}-\d{2}-\d{2} \|/.test(line))
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

function renderList(items, emptyText = "No items found in current source scan.", isCheckbox = false) {
  if (!items.length) return `- ${emptyText}`;
  const prefix = isCheckbox ? "- [ ] " : "- ";
  return items.map((item) => `${prefix}${item}`).join("\n");
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

${renderList(actions, "No items found in current source scan.", true)}

## Marketing And Sales Moves

${renderList(marketingSales, "No items found in current source scan.", true)}

## Follow-Ups And Handoffs

${renderList(handoffs, "No items found in current source scan.", true)}

## Workflow Audit Prompt

- Start with MKT-09 until the event lane is runnable.
- Audit lanes today: ${auditLanes.map((lane) => lane.lane).join("; ")}.
- MKT-09 minimum slice:
${mkt09Checklist.slice(0, 12).map((item) => `  - ${item}`).join("\n")}

## Money And Client-Trust Checks

- Review invoices, payment status, receivables, proposals, onboarding, client issues, and promised follow-ups before optional platform experiments.
- Confirm any paid-tool, cloud, VPS, KNIME, or Stripe Connect work has a current revenue, client-trust, or learning reason.

## Parking Lot

${renderList(openNeeded, "No items found in current source scan.", true)}

## Ask Robert

- Which one marketing or sales action should receive the first human judgment block today?
- Did any new account, tool, relationship, affiliate link, or schedule appear that needs registry capture?

## Recent Source Notes

${renderList(changes, "No items found in current source scan.", false)}

## Source Boundary

- This brief is generated from approved repo/workspace operating docs.
- It must not include secret values, backup codes, OAuth secrets, service-account private keys, or client-sensitive raw data.
`;
}

async function main() {
  console.log("Synchronizing Excel activities from Desktop...");
  try {
    execSync("python scripts/incorporate_records.py", { stdio: "inherit" });
  } catch (error) {
    console.error("Warning: Excel synchronization failed:", error.message);
  }

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

  // --- UPDATE HTML COMMAND CENTER ---
  const htmlPath = "E:/OneDrive - Uncle Robert Consulting LLC/Desktop/command-center-html.html";
  try {
    const htmlContent = await readFile(htmlPath, "utf8");

    // Generate dynamic tasks HTML
    const actions = topActions(activeQueue, openBuildItems);
    const marketingSales = marketingAndSalesMoves(activeQueue);
    const handoffs = followUpsAndHandoffs(activeQueue);
    const openNeeded = openBuildItems
      .filter((item) => /Needed|Pending|Deferred/i.test(item.status))
      .slice(0, 8)
      .map((item) => `<strong>${item.item}</strong> (${item.status}; owner: ${item.owner})`);

    let tasksHtml = `<!-- DYNAMIC TASKS START -->\n`;
    tasksHtml += `  <div class="ctx"><strong>Today's context:</strong> Generated from active agency operating manual on ${new Date().toLocaleString()}.</div>\n\n`;

    // Top 3
    tasksHtml += `  <h2>⭐ Top 3 Actions <span class="progress" data-progress-for="top3">0/${actions.length} done</span></h2>\n`;
    tasksHtml += `  <div class="top3"><ol id="top3">\n`;
    actions.forEach((txt, i) => {
      tasksHtml += `    <li class="task-item" data-key="top3-${i}">\n`;
      tasksHtml += `      <label class="task"><input type="checkbox" class="chk"><span class="txt">${txt}</span></label>\n`;
      tasksHtml += `      <div class="note-wrap"><textarea class="note" placeholder="What did you do / decide?"></textarea></div>\n`;
      tasksHtml += `    </li>\n`;
    });
    tasksHtml += `  </ol></div>\n\n`;

    // Marketing & Sales
    tasksHtml += `  <h2>📣 Marketing &amp; Sales Moves <span class="progress" data-progress-for="mkt">0/${marketingSales.length} done</span></h2>\n`;
    tasksHtml += `  <ul id="mkt">\n`;
    marketingSales.forEach((txt, i) => {
      tasksHtml += `    <li class="task-item" data-key="mkt-${i}">\n`;
      tasksHtml += `      <label class="task"><input type="checkbox" class="chk"><span class="txt">${txt}</span></label>\n`;
      tasksHtml += `      <div class="note-wrap"><textarea class="note" placeholder="What did you do / decide?"></textarea></div>\n`;
      tasksHtml += `    </li>\n`;
    });
    tasksHtml += `  </ul>\n\n`;

    // Follow-ups
    tasksHtml += `  <h2>🤝 Follow-Ups &amp; Handoffs <span class="progress" data-progress-for="fu">0/${handoffs.length} done</span></h2>\n`;
    tasksHtml += `  <ul id="fu">\n`;
    handoffs.forEach((txt, i) => {
      tasksHtml += `    <li class="task-item" data-key="fu-${i}">\n`;
      tasksHtml += `      <label class="task"><input type="checkbox" class="chk"><span class="txt">${txt}</span></label>\n`;
      tasksHtml += `      <div class="note-wrap"><textarea class="note" placeholder="What did you do / decide?"></textarea></div>\n`;
      tasksHtml += `    </li>\n`;
    });
    tasksHtml += `  </ul>\n\n`;

    // Parking Lot
    tasksHtml += `  <h2>🅿️ Parking Lot <span class="progress" data-progress-for="pk">0/${openNeeded.length} done</span></h2>\n`;
    tasksHtml += `  <ul id="pk">\n`;
    openNeeded.forEach((txt, i) => {
      tasksHtml += `    <li class="task-item" data-key="pk-${i}">\n`;
      tasksHtml += `      <label class="task"><input type="checkbox" class="chk"><span class="txt">${txt}</span></label>\n`;
      tasksHtml += `      <div class="note-wrap"><textarea class="note" placeholder="What did you do / decide?"></textarea></div>\n`;
      tasksHtml += `    </li>\n`;
    });
    tasksHtml += `  </ul>\n\n`;

    // Money checks
    tasksHtml += `  <h2>💰 Money &amp; Client-Trust Checks</h2>\n`;
    tasksHtml += `  <div class="money">Review invoices, payment status, receivables, proposals, onboarding, client issues, and promised follow-ups before optional platform experiments. Confirm any paid-tool, cloud, VPS, KNIME, or Stripe Connect work has a current revenue, client-trust, or learning reason.\n`;
    tasksHtml += `    <textarea class="answer" id="money-answer" placeholder="Your answer / notes..."></textarea>\n`;
    tasksHtml += `  </div>\n\n`;

    // Ask Robert
    tasksHtml += `  <h2>❓ Ask Robert</h2>\n`;
    tasksHtml += `  <ul>\n`;
    tasksHtml += `    <li style="margin-bottom:14px"><span class="txt">Which one marketing or sales action should receive the first human judgment block today?</span><textarea class="answer" id="ask-0" placeholder="Your answer..."></textarea></li>\n`;
    tasksHtml += `    <li><span class="txt">Did any new account, tool, relationship, affiliate link, or schedule appear that needs registry capture?</span><textarea class="answer" id="ask-1" placeholder="Your answer..."></textarea></li>\n`;
    tasksHtml += `  </ul>\n`;
    tasksHtml += `<!-- DYNAMIC TASKS END -->`;

    // Replace in HTML. We either replace the DYNAMIC TASKS block if it exists, or if not, replace everything between <h1>Daily Command Brief</h1> and <!-- EXCEL RECORDS START -->.
    let newHtml = htmlContent;
    const startDyn = "<!-- DYNAMIC TASKS START -->";
    const endDyn = "<!-- DYNAMIC TASKS END -->";

    if (newHtml.includes(startDyn) && newHtml.includes(endDyn)) {
      newHtml = newHtml.slice(0, newHtml.indexOf(startDyn)) + tasksHtml + newHtml.slice(newHtml.indexOf(endDyn) + endDyn.length);
    } else {
      const h1End = newHtml.indexOf("</h1>") + 5;
      const excelStart = newHtml.indexOf("<!-- EXCEL RECORDS START -->");
      if (h1End > 4 && excelStart !== -1) {
        newHtml = newHtml.slice(0, h1End) + "\\n" + tasksHtml + "\\n" + newHtml.slice(excelStart);
      }
    }

    // Also update WEBHOOK_URL
    const oldWebhookStr = 'const WEBHOOK_URL = "https://hyperagent.com/api/webhooks/cms0rjo980xh507adw79b0xrk/receive";';
    const newWebhookStr = 'const WEBHOOK_URL = "http://localhost:1337/update";';
    newHtml = newHtml.replace(oldWebhookStr, newWebhookStr);
    
    // Update date in header
    const dateRegex = /<div class="date">[^<]+<\/div>/;
    const formattedDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());
    newHtml = newHtml.replace(dateRegex, `<div class="date">${formattedDate} · auto-refreshes 6:30 AM CT</div>`);

    await writeFile(htmlPath, newHtml, "utf8");
    console.log("Successfully updated HTML dashboard tasks at " + htmlPath);
  } catch (error) {
    console.error("Warning: Could not update HTML Command Center:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
