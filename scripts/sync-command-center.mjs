import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const commandCenterDir = path.join(root, "docs/operations/daily-command-center");
const agencyManualPath = path.join(root, "docs/operations/agency-operating-manual.md");

async function sync() {
  try {
    const files = await readdir(commandCenterDir);
    const briefs = files.filter(f => /^\d{4}-\d{2}-\d{2}-command-brief\.md$/.test(f)).sort();
    if (briefs.length === 0) {
      console.log("No daily briefs found to sync.");
      return;
    }
    const latestBriefPath = path.join(commandCenterDir, briefs[briefs.length - 1]);
    const briefContent = await readFile(latestBriefPath, "utf8");

    // Extract all checked items
    const checkedItems = [];
    const lines = briefContent.split(/\r?\n/);
    for (const line of lines) {
      const match = line.match(/^\s*-\s*\[[xX]\]\s+(.+)$/);
      if (match) {
        checkedItems.push(match[1]);
      }
    }

    if (checkedItems.length === 0) {
      console.log(`No checked items found in ${briefs[briefs.length - 1]}.`);
      return;
    }

    let manualContent = await readFile(agencyManualPath, "utf8");
    let manualLines = manualContent.split(/\r?\n/);
    let updated = false;

    // We only reliably support updating the "Open Build Items" table for now.
    // The items in the brief look like: "Item text (Status; owner: Owner)"
    for (const checkedText of checkedItems) {
      // Extract the core item text by removing the parenthetical status/owner if present
      // e.g. "Draft SOP for Reach outreach batch setup and monitoring (Needed; owner: Agent) - done!"
      let coreText = checkedText;
      const parenMatch = checkedText.match(/^(.*?)\s*\([^)]+owner:[^)]+\)(.*)$/i);
      let notes = "";
      if (parenMatch) {
        coreText = parenMatch[1].trim();
        notes = parenMatch[2].trim();
      }

      // Find this in the manual's "Open Build Items" table
      const openBuildItemsIndex = manualLines.findIndex(l => l.startsWith("## Open Build Items"));
      if (openBuildItemsIndex !== -1) {
        for (let i = openBuildItemsIndex + 1; i < manualLines.length; i++) {
          if (manualLines[i].startsWith("## ")) break; // Next section
          if (manualLines[i].trim().startsWith("|") && manualLines[i].includes(coreText)) {
            // It's a table row containing the text. Update the status column.
            // Format: | Item | Owner | Status |
            const cells = manualLines[i].split("|");
            if (cells.length >= 4) {
              // cells[1] is Item, cells[2] is Owner, cells[3] is Status
              let newStatus = "Done";
              if (notes) {
                // If the user added notes, we can append them to the status or item
                // Let's replace any dashes or colons leading the notes
                notes = notes.replace(/^[-:\s]+/, "");
                if (notes) newStatus += ` (notes: ${notes})`;
              }
              // Only update if it's not already Done
              if (!cells[3].includes("Done")) {
                cells[3] = ` ${newStatus} `;
                manualLines[i] = cells.join("|");
                updated = true;
                console.log(`Marked as Done: ${coreText}`);
              }
            }
          }
        }
      }
    }

    if (updated) {
      await writeFile(agencyManualPath, manualLines.join("\n"), "utf8");
      console.log("Successfully updated agency-operating-manual.md with completed items.");
    } else {
      console.log("Checked items were found, but could not be mapped to updatable source tables.");
    }
  } catch (error) {
    console.error("Error syncing command center:", error);
    process.exitCode = 1;
  }
}

sync();
