import fs from 'fs';
import path from 'path';

const WORKFLOWS_DIR = path.join(process.cwd(), 'workflows');

export interface UrcDepartment {
  code: string;
  name: string;
  description: string;
}

export const URC_DEPARTMENTS: UrcDepartment[] = [
  { code: 'mkt', name: 'Marketing', description: 'Lead generation, content, outreach, and events.' },
  { code: 'sal', name: 'Sales', description: 'Proposals, deals, onboarding, and fundraising.' },
  { code: 'ful', name: 'Fulfillment', description: 'Client success, customer service, and analytics.' },
  { code: 'fin', name: 'Finance', description: 'Pricing, taxes, AP/AR, and accounting.' },
  { code: 'ops', name: 'Operations', description: 'Strategy, governance, tech/IT, and quality assurance.' },
  { code: 'cul', name: 'Culture/HR', description: 'Vision, training, and organization security.' },
  { code: 'afc', name: 'Alternative Financial Channels', description: 'Subscriptions, memberships, and communities.' }
];

export interface UrcTool {
  name: string;
  description: string;
  capabilities: string[];
}

export const URC_TOOLS: UrcTool[] = [
  { name: 'HubSpot', description: 'CRM and marketing automation.', capabilities: ['read_contact', 'create_contact', 'create_deal', 'send_email'] },
  { name: 'Apollo', description: 'B2B contact database and sales engagement.', capabilities: ['search_contacts', 'enrich_company', 'add_to_sequence'] },
  { name: 'N8N', description: 'Workflow automation platform.', capabilities: ['trigger_webhook', 'execute_workflow'] },
  { name: 'Playwright', description: 'Browser automation and testing.', capabilities: ['navigate', 'scrape_data', 'take_screenshot'] }
];

export const getAvailableWorkflows = () => {
  try {
    const dirs = fs.readdirSync(WORKFLOWS_DIR, { withFileTypes: true });
    return dirs
      .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('_'))
      .map(dirent => {
        const id = dirent.name;
        // Basic parsing of the directory name (e.g., mkt-06-content-creation)
        const parts = id.split('-');
        const deptCode = parts[0];
        const name = parts.slice(2).join(' ').replace(/-/g, ' ');
        return {
          id,
          department: URC_DEPARTMENTS.find(d => d.code === deptCode)?.name || deptCode,
          name: name.charAt(0).toUpperCase() + name.slice(1),
          path: path.join(WORKFLOWS_DIR, id)
        };
      });
  } catch (error) {
    console.error('Error reading workflows directory:', error);
    return [];
  }
};
