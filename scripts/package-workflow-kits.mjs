import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workflowsRoot = path.join(root, "workflows");
const outputRoot = path.join(root, "output", "workflow-kit-packages");
const changeId = "CC-2026-05-21-014";

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

function listFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function read(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function parseFrontmatterValue(text, key) {
  const match = text.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  if (!match) return "";
  return match[1].trim().replace(/^"|"$/g, "");
}

function packageMetadata(slug, kit) {
  if (slug === "marketing-founder-signal-system") {
    return {
      title: "Founder Signal System",
      department: "Marketing",
      workflowId: "FSS-01",
    };
  }

  return {
    title: parseFrontmatterValue(kit, "title") || slug,
    department: parseFrontmatterValue(kit, "department") || "Unassigned",
    workflowId: parseFrontmatterValue(kit, "workflowId") || slug,
  };
}

function packageReadme({ slug, title, trackerFiles }) {
  const trackerList = trackerFiles.length
    ? trackerFiles.map((name) => `- \`trackers/${name}\``).join("\n")
    : "- No tracker/dashboard workbook is currently attached. Build or attach one before client delivery if the workflow requires a working surface.";

  return `# ${title || slug} Package

Package generated: 2026-05-21

This folder is the package-ready shape for the workflow:

- \`kit.md\` is the AI-readable operating guide and automation/build-spec authority.
- \`trackers/\` contains the workflow's workbook/dashboard attachments when available.

## Files

- \`kit.md\`

## Trackers and Dashboards

${trackerList}

## Client Use

Give the client this folder when the workflow is ready for delivery. They can upload or paste \`kit.md\` into their preferred AI assistant and use the tracker/dashboard files as the working surfaces.

## Packaging Status

This is a package assembly, not a certification claim. Certification still depends on the status inside \`kit.md\`.

Change-control reference: \`${changeId}\`
`;
}

removeDir(outputRoot);
ensureDir(outputRoot);

const packageRows = [];

for (const entry of fs.readdirSync(workflowsRoot, { withFileTypes: true })) {
  if (!entry.isDirectory() || entry.name === "_template") continue;

  const slug = entry.name;
  const sourceFolder = path.join(workflowsRoot, slug);
  const kitPath = path.join(sourceFolder, "kit.md");
  if (!fs.existsSync(kitPath)) continue;

  const packageFolder = path.join(outputRoot, slug);
  const trackerFolder = path.join(packageFolder, "trackers");
  ensureDir(trackerFolder);

  copyFile(kitPath, path.join(packageFolder, "kit.md"));

  const trackerSource = path.join(sourceFolder, "trackers");
  const trackerFiles = listFiles(trackerSource);
  for (const tracker of trackerFiles) {
    copyFile(path.join(trackerSource, tracker), path.join(trackerFolder, tracker));
  }

  if (!trackerFiles.length) {
    fs.writeFileSync(
      path.join(trackerFolder, "README.md"),
      `# Trackers\n\nNo tracker/dashboard attachment is currently present for \`${slug}\`. Build or attach the working surface before client delivery if this workflow needs one.\n`,
    );
  }

  const kit = read(kitPath);
  const { title, department, workflowId } = packageMetadata(slug, kit);

  fs.writeFileSync(path.join(packageFolder, "README.md"), packageReadme({ slug, title, trackerFiles }));

  packageRows.push({
    slug,
    workflowId,
    title,
    department,
    trackerCount: trackerFiles.length,
    trackers: trackerFiles.join("; "),
  });
}

packageRows.sort((a, b) => a.slug.localeCompare(b.slug));

const index = `# Workflow Kit Packages

Generated: 2026-05-21

These folders are the package-ready workflow kit assemblies. Each workflow package contains:

- \`kit.md\` as the AI-readable operating guide and automation/build-spec authority
- \`trackers/\` with workbook/dashboard attachments when available
- \`README.md\` with delivery notes

The source workflow folders under \`workflows/\` remain the editable provenance and regeneration lane.

| Workflow | Department | Package | Tracker Count | Trackers |
| --- | --- | --- | ---: | --- |
${packageRows
  .map(
    (row) =>
      `| ${row.workflowId} - ${row.title.replace(`${row.workflowId} - `, "")} | ${row.department} | \`${row.slug}/\` | ${row.trackerCount} | ${row.trackers || "Pending"} |`,
  )
  .join("\n")}

Change-control reference: \`${changeId}\`
`;

fs.writeFileSync(path.join(outputRoot, "README.md"), index);
fs.writeFileSync(
  path.join(outputRoot, "package-index.csv"),
  [
    "workflow_id,slug,title,department,tracker_count,trackers",
    ...packageRows.map((row) =>
      [
        row.workflowId,
        row.slug,
        `"${row.title.replace(/"/g, '""')}"`,
        `"${row.department.replace(/"/g, '""')}"`,
        row.trackerCount,
        `"${row.trackers.replace(/"/g, '""')}"`,
      ].join(","),
    ),
  ].join("\n"),
);

console.log(`Packaged ${packageRows.length} workflow kits into ${path.relative(root, outputRoot)}.`);
