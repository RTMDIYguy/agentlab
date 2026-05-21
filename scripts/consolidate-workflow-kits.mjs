import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workflowsRoot = path.join(root, "workflows");
const registryPath = path.join(root, "docs", "operations", "workflow-registry.md");
const changeId = "CC-2026-05-21-013";

const departmentByPrefix = {
  afc: "AfterCare",
  cul: "Culture",
  fin: "Finance",
  ful: "Fulfillment",
  mkt: "Marketing",
  ops: "Operations",
  sal: "Sales",
};

function read(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function listFiles(dirPath, extensions = null) {
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => !extensions || extensions.some((ext) => name.endsWith(ext)))
    .sort((a, b) => a.localeCompare(b));
}

function mdEscape(text) {
  return String(text ?? "").replace(/\|/g, "\\|").trim();
}

function yamlValue(text) {
  const clean = String(text ?? "").replace(/"/g, '\\"').trim();
  return `"${clean}"`;
}

function slugToId(slug) {
  const match = slug.match(/^([a-z]+)-(\d+)/i);
  if (!match) return slug.toUpperCase();
  return `${match[1].toUpperCase()}-${match[2]}`;
}

function slugToTitle(slug) {
  return slug
    .split("-")
    .map((part) => (part.length <= 3 ? part.toUpperCase() : part[0].toUpperCase() + part.slice(1)))
    .join(" ");
}

function parseRegistry() {
  const text = read(registryPath);
  const rows = new Map();
  for (const line of text.split(/\r?\n/)) {
    if (!line.startsWith("| ")) continue;
    if (line.includes("---")) continue;
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    if (cells.length < 8 || cells[0] === "ID") continue;
    rows.set(cells[0], {
      id: cells[0],
      workflow: cells[1],
      department: cells[2],
      automationLevel: cells[3],
      owner: cells[4],
      trigger: cells[5],
      cycleTime: cells[6],
      repoStatus: cells[7],
    });
  }
  return rows;
}

function parseReadme(folderPath) {
  const text = read(path.join(folderPath, "README.md"));
  const title = text.match(/^#\s+(.+)$/m)?.[1]?.trim();
  const field = (label) =>
    text.match(new RegExp(`- ${label}:\\s*(.+)`, "i"))?.[1]?.trim() ?? "";
  return {
    text,
    title,
    department: field("Department"),
    automationLevel: field("Automation level"),
    owner: field("Owner"),
    trigger: field("Trigger"),
    cycleTime: field("Cycle time"),
  };
}

function sourceDigest(folderPath, sourceFiles) {
  const points = [];
  for (const name of sourceFiles) {
    const text = read(path.join(folderPath, "source", name));
    const purpose = text.match(/(?:\d+\.\s*)?Document Purpose\s*\r?\n+([\s\S]*?)(?:\r?\n\s*(?:\d+\.\s*)?Workflow Overview|\r?\n##\s+|\r?\n\d+\.\s+\w|$)/i)?.[1];
    const goal = text.match(/##\s*Goal\s*\r?\n+([\s\S]*?)(?:\r?\n\S|$)/i)?.[1];
    const overview = text.match(/(?:\d+\.\s*)?Workflow Overview\s*\r?\n+([\s\S]*?)(?:\r?\n\s*(?:\d+\.\s*)?Ideal|\r?\n\s*(?:\d+\.\s*)?Tools|\r?\n##\s+|$)/i)?.[1];
    const excerpt = [purpose, goal, overview]
      .filter(Boolean)
      .join("\n\n")
      .replace(/\r/g, "")
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 10)
      .join(" ");
    if (excerpt) {
      points.push(`- \`${name}\`: ${excerpt}`);
    } else {
      points.push(`- \`${name}\`: Source file imported and retained for detailed workflow extraction.`);
    }
  }
  return points.length ? points.join("\n") : "- No detailed source file has been imported yet; use the registry metadata and automation scaffold as the current operating baseline.";
}

function placeholderNotes(folderPath, files) {
  const notes = [];
  for (const { area, name } of files) {
    const text = read(path.join(folderPath, area, name));
    const matches = new Set();
    for (const match of text.matchAll(/\b(YOUR_[A-Z0-9_]+|PENDING_[A-Z0-9_]+|TODO|TBD|PLACEHOLDER|not certified|conversion pending)\b/gi)) {
      matches.add(match[0]);
    }
    const bracketFields = [...text.matchAll(/\[[A-Z][A-Z0-9 _/-]{2,}\]/g)].map((match) => match[0]);
    for (const field of bracketFields.slice(0, 6)) matches.add(field);
    if (matches.size) {
      notes.push(`- \`${area}/${name}\`: ${[...matches].slice(0, 10).join(", ")}`);
    }
  }
  return notes.length ? notes.join("\n") : "- No obvious placeholder tokens were found in imported Markdown or JSON artifacts.";
}

function relativeTable(folderPath) {
  const areas = ["source", "assets", "automation", "trackers"];
  const rows = [];
  for (const area of areas) {
    for (const name of listFiles(path.join(folderPath, area))) {
      rows.push(`| \`${area}/${name}\` | Retained provenance/input artifact now referenced by this consolidated kit. |`);
    }
  }
  return rows.length ? rows.join("\n") : "| None imported yet | Create or attach source, asset, automation, or tracker artifacts during certification. |";
}

function embeddedAutomation(folderPath, jsonFiles) {
  if (!jsonFiles.length) {
    return "No automation blueprint is currently present. Treat this workflow as a manual or framework package until a blueprint is built and tested.";
  }

  return jsonFiles
    .map((name) => {
      const body = read(path.join(folderPath, "automation", name)).trim();
      return `### ${name}\n\n\`\`\`json\n${body}\n\`\`\``;
    })
    .join("\n\n");
}

function fenceInfo(name) {
  if (name.endsWith(".md")) return "markdown";
  if (name.endsWith(".csv")) return "csv";
  if (name.endsWith(".json")) return "json";
  return "text";
}

function embeddedTextArtifacts(folderPath, artifactGroups) {
  const sections = [];
  for (const { area, files } of artifactGroups) {
    for (const name of files) {
      const absolutePath = path.join(folderPath, area, name);
      const content = read(absolutePath).trim();
      if (!content) continue;
      sections.push(`### ${area}/${name}\n\n\`\`\`\`${fenceInfo(name)}\n${content}\n\`\`\`\``);
    }
  }

  if (!sections.length) {
    return "No readable Markdown, CSV, or JSON source artifacts are available to embed yet. Binary trackers remain listed in the Source Map and should be converted only when their sheet contents are needed in the kit body.";
  }

  return sections.join("\n\n");
}

function binaryAttachmentNotes(folderPath) {
  const binaryFiles = [];
  for (const area of ["assets", "trackers"]) {
    for (const name of listFiles(path.join(folderPath, area))) {
      if (![".md", ".csv", ".json"].some((ext) => name.endsWith(ext))) {
        binaryFiles.push(`- \`${area}/${name}\`: binary attachment retained outside the Markdown kit; convert to CSV/Markdown during certification if the sheet contents become authoritative.`);
      }
    }
  }
  return binaryFiles.length ? binaryFiles.join("\n") : "- None.";
}

function buildStandardKit(folderPath, registry) {
  const slug = path.basename(folderPath);
  const id = slugToId(slug);
  const readme = parseReadme(folderPath);
  const registryRow = registry.get(id);
  const prefix = slug.split("-")[0];
  const title = registryRow?.workflow || readme.title?.replace(/^.+?-\s*/, "") || slugToTitle(slug);
  const department = registryRow?.department || readme.department || departmentByPrefix[prefix] || "Unassigned";
  const automationLevel = registryRow?.automationLevel || readme.automationLevel || "Not yet specified";
  const owner = registryRow?.owner || readme.owner || "Robert T. McCarthy";
  const trigger = registryRow?.trigger || readme.trigger || "Workflow trigger to confirm during certification";
  const cycleTime = registryRow?.cycleTime || readme.cycleTime || "Cycle time to confirm during certification";
  const repoStatus = registryRow?.repoStatus || "Imported source";
  const sourceFiles = listFiles(path.join(folderPath, "source"), [".md"]);
  const assetFiles = listFiles(path.join(folderPath, "assets"), [".md", ".csv"]);
  const trackerFiles = listFiles(path.join(folderPath, "trackers"), [".md", ".csv", ".xlsx"]);
  const jsonFiles = listFiles(path.join(folderPath, "automation"), [".json"]);
  const placeholderFiles = [
    ...sourceFiles.map((name) => ({ area: "source", name })),
    ...assetFiles.map((name) => ({ area: "assets", name })),
    ...trackerFiles.map((name) => ({ area: "trackers", name })),
    ...jsonFiles.map((name) => ({ area: "automation", name })),
  ];

  return `---
schema: kit/1.0
slug: ${slug}
title: ${yamlValue(`${id} - ${title}`)}
summary: ${yamlValue(`${department} workflow package for ${title}. Consolidates registry metadata, imported source references, setup guidance, validation notes, and automation blueprints into one operative kit file.`)}
version: 0.1.0-draft
owner: uncle-robert-consulting
license: UNLICENSED
status: imported-draft
conformance: draft
certifiedAt: null
workflowId: ${id}
department: ${yamlValue(department)}
automationLevel: ${yamlValue(automationLevel)}
primaryOwner: ${yamlValue(owner)}
trigger: ${yamlValue(trigger)}
cycleTime: ${yamlValue(cycleTime)}
sourceStatus: ${yamlValue(repoStatus)}
changeLog:
  - date: 2026-05-21
    changeId: ${changeId}
    version: 0.1.0-draft
    type: consolidation
    summary: Converted imported workflow package into a single operative kit.md with source map, quickstart, setup, validation, certification gaps, and embedded automation blueprint when available.
    author: codex
tags:
  - workflow-package
  - ${prefix}
  - ${department.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
---

# ${id} - ${title}

This is the consolidated \`kit.md\` for the workflow. It replaces the old imported-package surface as the operative file while keeping source, asset, tracker, and automation files as provenance until certification is complete.

## Goal

Run the ${title} workflow for ${department} with a repeatable trigger, owner, cycle time, outputs, and validation path. The current draft is strong enough for agent orientation and controlled internal use; certification still requires a live run or documented manual evidence.

## When to Use

Use this workflow when the trigger occurs: **${trigger}**.

Use it as part of the URC operating system first. Convert it into a client-safe variant only after URC-specific names, internal assumptions, and tool choices have been scrubbed or intentionally parameterized.

## Registry Metadata

| Field | Value |
| --- | --- |
| Workflow ID | ${mdEscape(id)} |
| Department | ${mdEscape(department)} |
| Automation level | ${mdEscape(automationLevel)} |
| Owner | ${mdEscape(owner)} |
| Trigger | ${mdEscape(trigger)} |
| Cycle time | ${mdEscape(cycleTime)} |
| Source status | ${mdEscape(repoStatus)} |

## Inputs

- Trigger event or planning cadence identified above.
- Current URC operating context for ${department}.
- Any imported source, asset, tracker, or automation artifacts listed in the Source Map.
- Human approval from the owner before external sends, money movement, access changes, or client-visible commitments.

## Setup

1. Read this kit end to end.
2. Review the Source Digest and Source Map below.
3. Bind any placeholders listed in Placeholder and Binding Notes.
4. If an automation blueprint is embedded, import or rebuild it in the chosen runtime only after credentials and fallback paths are confirmed.
5. Run the Validation checklist before treating the workflow as complete.

## Quickstart

1. Confirm the trigger: ${trigger}.
2. Open the relevant source or asset file from the Source Map.
3. Collect the minimum inputs needed for this cycle.
4. Execute the workflow steps using the imported source as the detailed operating guide.
5. Capture output evidence, exceptions, and follow-up tasks.
6. Record meaningful package or behavior changes in \`docs/operations/change-control-register.md\`.

## Source Digest

${sourceDigest(folderPath, sourceFiles)}

## Source Map

| Artifact | Purpose |
| --- | --- |
${relativeTable(folderPath)}

## Embedded Source and Asset Documents

${embeddedTextArtifacts(folderPath, [
    { area: "source", files: sourceFiles },
    { area: "assets", files: assetFiles },
    { area: "automation", files: jsonFiles },
  ])}

## Binary Attachments

${binaryAttachmentNotes(folderPath)}

## Automation Blueprint

${embeddedAutomation(folderPath, jsonFiles)}

## Placeholder and Binding Notes

${placeholderNotes(folderPath, placeholderFiles)}

Treat bracketed fields such as \`[COMPANY NAME]\`, \`[AGENCY NAME]\`, or \`YOUR_TEMPLATE_ID\` as intentional configuration points unless the source file clearly says they are unfinished draft copy. Before live use, replace tool IDs, account IDs, webhook URLs, notification channels, and client-facing business fields with the correct URC or client-safe values.

## Outputs

- Completed workflow artifact, decision, update, or handoff matching the source package.
- Evidence log or tracker entry showing what ran, who approved it, and what changed.
- Exception list for anything blocked by missing credentials, paid-tool limits, unavailable source files, or human review.

## Constraints

- Preserve the URC/internal and client-facing tracks. Do not blend them during certification.
- Keep the default route low-cost and tool-light unless the workflow truly requires a paid connector.
- Do not store secrets, API keys, private client data, or credential exports in the repo.
- Use Microsoft 365 as the default operating backbone when a general-purpose document, tracker, or email surface is needed.

## Safety Notes

- Require owner approval before sending external communications, changing access, moving money, publishing client-facing content, or modifying authoritative records.
- If the automation blueprint contains placeholder credentials or runtime-specific module IDs, rebuild and test with non-production data before enabling it.
- If the source file is missing, treat the registry metadata as orientation only and do not certify the workflow until the detailed source is recovered or rebuilt.

## Validation

- [ ] The trigger, owner, and cycle time match the current operating reality.
- [ ] Source artifacts are present or the source gap is explicitly accepted.
- [ ] Placeholder bindings have been replaced or documented as intentional template variables.
- [ ] Automation, if present, has been imported or rebuilt in the selected runtime and tested with safe data.
- [ ] Manual fallback exists for any paid-tool, credential, or platform limit.
- [ ] Evidence from at least one run is captured before certification.

## Certification Status

Status: **Draft / imported package consolidated**.

This kit is now an operative draft, but it is not certified. Certification requires at least one live or controlled manual run, proof of outputs, confirmation of placeholder bindings, and a clear URC/internal versus client-safe variant decision.

## Change Log

| Date | Change ID | Version | Type | Summary | Author |
| --- | --- | --- | --- | --- | --- |
| 2026-05-21 | ${changeId} | 0.1.0-draft | consolidation | Created consolidated kit.md from registry metadata, imported artifacts, placeholder scan, and automation blueprint. | codex |
`;
}

function updateImportedReadme(folderPath) {
  const readmePath = path.join(folderPath, "README.md");
  let text = read(readmePath);
  if (!text) return;
  text = text.replace(
    /Packaging status: Imported source; kit conversion pending/,
    "Packaging status: Consolidated kit draft created; certification pending",
  );
  text = text.replace(
    /Convert this imported source into a `kit\.md` package using the MKT-06 package as the standard\./,
    "Use `kit.md` as the operative package file. Certification still requires a live or controlled manual run, placeholder binding, and variant review.",
  );
  fs.writeFileSync(readmePath, text);
}

function consolidateFounderSignal(folderPath) {
  const kitPath = path.join(folderPath, "kit.md");
  let kit = read(kitPath);
  if (!kit) return false;
  if (kit.includes("## Consolidated Install Surface")) return false;

  const template = read(path.join(folderPath, "template.md")).trim();
  const blueprintName = "Founder-Signal-System-Make-Blueprint.json";
  const blueprint = read(path.join(folderPath, "automation", blueprintName)).trim();
  const addendum = `

## Consolidated Install Surface

This section folds the former split ` + "`template.md`" + ` and Make blueprint surface into the operative kit file. The old files are retained as legacy/provenance artifacts, but this section is the package authority.

### Runtime Decision

- Preferred v1 runtime: local n8n, because Make free-plan activation limits and OpenAI credit limits blocked the Standard-tier Make path.
- Manual tier: still active through the Markdown assets in ` + "`assets/`" + `.
- Make.com public template: deferred until a paid or otherwise enabled Make/OpenAI path is justified by revenue.

### Buyer Setup Instructions

1. Run the manual assets first: ` + "`assets/intake-questions.md`" + `, ` + "`assets/content-brief-template.md`" + `, ` + "`assets/follow-up-sequence-template.md`" + `, and ` + "`assets/proof-capture-template.md`" + `.
2. If using n8n, rebuild from ` + "`automation/n8n-v1-runtime-handoff.md`" + ` and test with one sample intake before any external send.
3. If later using Make.com, follow the staged publisher checklist and replace ` + "`PENDING_MAKE_PUBLIC_SHARING_LINK`" + ` only after a second-account install test passes.

### Former Template Notes

` + template + `

### Embedded Make Blueprint

\`\`\`json
${blueprint}
\`\`\`
`;
  kit = kit.replace(
    "The Make.com link lane also requires a public sharing link in `template.md`\nand a successful install test from a second Make.com account or team.",
    "The Make.com link lane also requires a public sharing link and a successful install test from a second Make.com account or team. The current install surface and Make blueprint are embedded below so this kit remains the operative package file.",
  );
  fs.writeFileSync(kitPath, kit + addendum);
  return true;
}

function embedFounderSignalPackage(folderPath) {
  const kitPath = path.join(folderPath, "kit.md");
  let kit = read(kitPath);
  if (!kit || kit.includes("## Embedded Package Documents")) return false;

  const fileGroups = [
    { area: ".", files: ["README.md", "source-map.md", "implementation-checklist.md", "offer-one-pager.md", "template.md"] },
    { area: "assets", files: listFiles(path.join(folderPath, "assets"), [".md", ".csv"]) },
    { area: "automation", files: listFiles(path.join(folderPath, "automation"), [".md", ".json"]) },
  ];
  const sections = [];
  for (const { area, files } of fileGroups) {
    for (const name of files) {
      const absolutePath = area === "." ? path.join(folderPath, name) : path.join(folderPath, area, name);
      const content = read(absolutePath).trim();
      if (!content) continue;
      const label = area === "." ? name : `${area}/${name}`;
      sections.push(`### ${label}\n\n\`\`\`\`${fenceInfo(name)}\n${content}\n\`\`\`\``);
    }
  }

  const appendix = `

## Embedded Package Documents

This appendix makes the Founder Signal System kit self-contained for review. The original files remain in place as editable working copies, but the kit now carries their readable contents.

${sections.join("\n\n")}
`;

  fs.writeFileSync(kitPath, kit + appendix);
  return true;
}

const registry = parseRegistry();
const folders = fs
  .readdirSync(workflowsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => path.join(workflowsRoot, entry.name))
  .filter((folderPath) => !path.basename(folderPath).startsWith("_"));

let written = 0;
for (const folderPath of folders) {
  const slug = path.basename(folderPath);
  if (slug === "marketing-founder-signal-system") {
    const changedInstallSurface = consolidateFounderSignal(folderPath);
    const changedEmbeddedDocs = embedFounderSignalPackage(folderPath);
    if (changedInstallSurface || changedEmbeddedDocs) written += 1;
    continue;
  }
  fs.writeFileSync(path.join(folderPath, "kit.md"), buildStandardKit(folderPath, registry));
  updateImportedReadme(folderPath);
  written += 1;
}

console.log(`Consolidated ${written} workflow kit files.`);
