import fs from 'fs';
import path from 'path';

// Define base paths
const workflowsDir = path.resolve('./workflows');

if (!fs.existsSync(workflowsDir)) {
  console.error(`❌ Workflows directory not found at: ${workflowsDir}`);
  process.exit(1);
}

// 1. Get all workflow directories (skipping templates or hidden files)
const workflows = fs.readdirSync(workflowsDir).filter(file => {
  const fullPath = path.join(workflowsDir, file);
  return fs.statSync(fullPath).isDirectory() && !file.startsWith('_') && !file.startsWith('.');
});

console.log(`📂 Found ${workflows.length} workflows to process...\n`);

// 2. Loop through each workflow directory sequentially
workflows.forEach((workflow, index) => {
  const workflowPath = path.join(workflowsDir, workflow);
  const kitPath = path.join(workflowPath, 'kit.md');
  
  console.log(`[${index + 1}/${workflows.length}] Processing: ${workflow}...`);

  let combinedContent = `---\nworkflow: ${workflow}\nstatus: consolidated\n---\n\n`;

  // --- Step A: Grab the Registry Metadata (README.md) ---
  const readmePath = path.join(workflowPath, 'README.md');
  if (fs.existsSync(readmePath)) {
    combinedContent += `## 1. Registry Metadata\n\n${fs.readFileSync(readmePath, 'utf8')}\n\n`;
  } else {
    combinedContent += `## 1. Registry Metadata\n\n⚠️ No README.md metadata found.\n\n`;
  }

  // --- Step B: Grab Core Workflow Source Docs ---
  const sourceDir = path.join(workflowPath, 'source');
  combinedContent += `## 2. Core Workflow Source\n\n`;
  if (fs.existsSync(sourceDir)) {
    const sourceFiles = fs.readdirSync(sourceDir).filter(f => f.endsWith('.md'));
    if (sourceFiles.length > 0) {
      sourceFiles.forEach(file => {
        const fileContent = fs.readFileSync(path.join(sourceDir, file), 'utf8');
        combinedContent += `### Source File: ${file}\n\n${fileContent}\n\n`;
      });
    } else {
      combinedContent += `No markdown files found in source directory.\n\n`;
    }
  } else {
    combinedContent += `⚠️ No source directory found.\n\n`;
  }

  // --- Step C: Grab Automation Blueprints (JSON) ---
  const autoDir = path.join(workflowPath, 'automation');
  combinedContent += `## 3. Automation Blueprints\n\n`;
  if (fs.existsSync(autoDir)) {
    const autoFiles = fs.readdirSync(autoDir).filter(f => f.endsWith('.json'));
    if (autoFiles.length > 0) {
      autoFiles.forEach(file => {
        const jsonContent = fs.readFileSync(path.join(autoDir, file), 'utf8');
        combinedContent += `### Blueprint: ${file}\n\`\`\`json\n${jsonContent}\n\`\`\`\n\n`;
      });
    } else {
      combinedContent += `No JSON blueprints found in automation directory.\n\n`;
    }
  } else {
    combinedContent += `⚠️ No automation directory found.\n\n`;
  }

  // --- Step D: Grab Trackers Reference ---
  const trackerDir = path.join(workflowPath, 'trackers');
  combinedContent += `## 4. Trackers and Assets\n\n`;
  if (fs.existsSync(trackerDir)) {
    const trackerFiles = fs.readdirSync(trackerDir).filter(f => !f.startsWith('.'));
    if (trackerFiles.length > 0) {
      combinedContent += `The following tracker assets are coupled with this workflow:\n\n`;
      trackerFiles.forEach(file => {
        combinedContent += `* **File:** \`${file}\` (Stored locally in tracking folder)\n`;
      });
      combinedContent += `\n`;
    } else {
      combinedContent += `No asset files found in trackers directory.\n\n`;
    }
  } else {
    combinedContent += `⚠️ No trackers directory found.\n\n`;
  }

  // 3. Write everything cleanly to the targeted kit.md file
  try {
    fs.writeFileSync(kitPath, combinedContent, 'utf8');
    console.log(`   └─ ✅ Successfully generated: ${kitPath}\n`);
  } catch (error) {
    console.error(`   └─ ❌ Failed writing to ${workflow}: ${error.message}\n`);
  }
});

console.log('🎉 All workflow kits have been consolidated successfully!');
