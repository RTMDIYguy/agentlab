import express from 'express';
import cors from 'cors';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const app = express();
app.use(cors());
app.use(express.json());

const root = process.cwd();
const agencyManualPath = path.join(root, "docs/operations/agency-operating-manual.md");

app.post('/update', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'No message provided' });
    }

    // Example message format from HTML:
    // [x] Draft SOP for Reach outreach batch setup and monitoring (Needed; owner: Agent)
    //     note: some note

    const lines = message.split('\n');
    let manualContent = await readFile(agencyManualPath, "utf8");
    let changed = false;

    // We only care about tracking items from the Open Build Items / Parking Lot for now
    // Parse completed tasks
    const completedTasks = [];
    let currentTask = null;
    
    for (const line of lines) {
      if (line.startsWith('[x] ')) {
        const text = line.substring(4).trim();
        const cleanName = text.replace(/\s*\(.*owner:.*\)$/i, '').trim();
        currentTask = { name: cleanName, note: '' };
        completedTasks.push(currentTask);
      } else if (currentTask && line.startsWith('    note: ')) {
        currentTask.note = line.substring(10).trim();
      } else if (line.startsWith('[ ] ')) {
        currentTask = null;
      }
    }

    if (completedTasks.length > 0) {
      // Find rows in the manual
      const rows = manualContent.split('\n');
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row.trim().startsWith('|') && !row.trim().startsWith('| ---')) {
          for (const task of completedTasks) {
            if (row.includes(task.name)) {
              // Update status to Done
              const parts = row.split('|');
              if (parts.length >= 4) {
                const newStatus = task.note ? ` Done (notes: ${task.note}) ` : ` Done `;
                parts[3] = newStatus;
                rows[i] = parts.join('|');
                changed = true;
                console.log(`Marked as Done: ${task.name}`);
              }
            }
          }
        }
      }

      if (changed) {
        await writeFile(agencyManualPath, rows.join('\n'), 'utf8');
        console.log("Successfully updated agency-operating-manual.md with completed items.");
      }
    }

    res.json({ success: true, message: 'Updated successfully' });
  } catch (error) {
    console.error("Error updating manual:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 1337;
app.listen(PORT, () => {
  console.log(`Command Center local webhook server running on http://localhost:${PORT}`);
});
