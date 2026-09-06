import fs from "node:fs";
import path from "node:path";

const WORKING_DOCS_ROOT = "E:\\OneDrive - Uncle Robert Consulting LLC\\Working Docs";
const IGNORE_DIRS = new Set(["node_modules", ".git", "dist", "build", ".next", ".gemini", "tmp", ".cache"]);

const LEAD_EXTENSIONS = new Set([".csv", ".xlsx", ".xls"]);
const LEAD_KEYWORDS = ["lead", "contact", "prospect", "client", "customer", "email", "subscriber", "list", "apollo", "zoominfo", "outreach", "pipeline", "crm"];

const results = [];

function scanDirectory(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!IGNORE_DIRS.has(entry.name) && !entry.name.startsWith(".")) {
          scanDirectory(path.join(dir, entry.name));
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        const baseName = entry.name.toLowerCase();

        const isLeadExt = LEAD_EXTENSIONS.has(ext);
        const hasLeadKeyword = LEAD_KEYWORDS.some(k => baseName.includes(k));

        if (isLeadExt || hasLeadKeyword) {
          try {
            const fullPath = path.join(dir, entry.name);
            const stats = fs.statSync(fullPath);
            if (stats.size > 0 && stats.size < 100 * 1024 * 1024) { // ignore 0-byte or >100MB
              results.push({
                name: entry.name,
                path: fullPath,
                relPath: path.relative(WORKING_DOCS_ROOT, fullPath),
                sizeKb: Math.round(stats.size / 1024),
                modified: stats.mtime.toISOString().split("T")[0],
                ext: ext || "unknown",
              });
            }
          } catch (e) {}
        }
      }
    }
  } catch (err) {}
}

console.log(`Starting fast lead inventory scan across: ${WORKING_DOCS_ROOT}...`);
scanDirectory(WORKING_DOCS_ROOT);
console.log(`Found ${results.length} candidate lead/contact files.`);

// Sort by file size & modification date
results.sort((a, b) => b.sizeKb - a.sizeKb);

// Generate Markdown report
let md = `# Working Docs Lead & Contact File Inventory\n\n`;
md += `Generated: ${new Date().toISOString().split("T")[0]}\n`;
md += `Total Candidate Files Discovered: **${results.length}**\n\n`;
md += `| File Name | Size (KB) | Last Modified | Relative Path |\n`;
md += `| :--- | :--- | :--- | :--- |\n`;

for (const f of results) {
  md += `| \`${f.name}\` | ${f.sizeKb.toLocaleString()} KB | ${f.modified} | \`${f.relPath}\` |\n`;
}

const outPath = path.resolve("docs/operations/lead-inventory-registry.md");
fs.writeFileSync(outPath, md);
console.log(`✅ Written registry to: ${outPath}`);

// Also write copy in parent working docs
const parentOut = path.resolve("../Lead-Inventory-Registry.md");
try {
  fs.writeFileSync(parentOut, md);
  console.log(`✅ Written copy to: ${parentOut}`);
} catch (e) {}
