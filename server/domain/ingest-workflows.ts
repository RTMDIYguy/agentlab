import fs from 'fs';
import path from 'path';
import { URC_DEPARTMENTS, getAvailableWorkflows } from './urc-model';

const OUTPUT_PATH = path.join(__dirname, 'workflows_export.json');

export const ingestWorkflows = () => {
  console.log('Starting workflow ingestion...');
  
  const workflows = getAvailableWorkflows();
  console.log(`Found ${workflows.length} standard operating procedure folders.`);

  const exportData = {
    generatedAt: new Date().toISOString(),
    departments: URC_DEPARTMENTS,
    workflows: workflows
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(exportData, null, 2));
  console.log(`Workflow definitions exported successfully to ${OUTPUT_PATH}`);
  
  return exportData;
};

// Execute if run directly
if (require.main === module) {
  ingestWorkflows();
}
