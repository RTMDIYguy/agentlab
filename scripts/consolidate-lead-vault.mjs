import fs from "node:fs";
import path from "node:path";

const LEAD_VAULT = "E:\\OneDrive - Uncle Robert Consulting LLC\\Working Docs\\AI Native Agency Deepened\\Lead Vault";

if (!fs.existsSync(LEAD_VAULT)) {
  fs.mkdirSync(LEAD_VAULT, { recursive: true });
}

const CANDIDATE_FILES = [
  {
    name: "01_Missouri_Tech_Founders_Agency_Owners_Reviewed.csv",
    source: "E:\\OneDrive - Uncle Robert Consulting LLC\\Working Docs\\Bootstrapper Capital\\Lead Lists\\Apollo\\2026-05-16_Apollo_Missouri-Tech-Founders-Owners_Bootstrapper-Capital-Chapter_Reviewed.csv",
    category: "ICP 1 & 2: Founders & Agency Owners (Local MO / KC)",
    status: "🔥 High Quality (Verified Emails, Tech Stacks, LinkedIns)",
  },
  {
    name: "02_Missouri_Tech_Founders_Raw_Enriched.csv",
    source: "E:\\OneDrive - Uncle Robert Consulting LLC\\Working Docs\\Bootstrapper Capital\\Lead Lists\\Apollo\\2026-05-16_Apollo_Missouri-Tech-Founders-Owners_Bootstrapper-Capital-Chapter_Enriched-Raw.csv",
    category: "ICP 1: Tech & Digital Founders (Raw Apollo Extract)",
    status: "Ready for Deduplication & Verification",
  },
  {
    name: "03_Family_Office_Investors_Fixed.xlsx",
    source: "E:\\OneDrive - Uncle Robert Consulting LLC\\Working Docs\\AI Native Agency Deepened\\Sales Department\\2025-April-12_family_office_list_fixed_investors_.xlsx",
    category: "ICP 3: Family Offices & Capital Partners",
    status: "High Quality (Target for Bootstrapper Capital Roundtables)",
  },
  {
    name: "04_Lead_Scrape_Jan2026.xlsx",
    source: "E:\\OneDrive - Uncle Robert Consulting LLC\\Working Docs\\_Workspace Cleanup\\2026-05-21-root-unclassified-downloads\\Lead Scrape #1_334_2026-01-24.xlsx",
    category: "General Outbound Scrape",
    status: "Needs Column Mapping & Scrubbing",
  },
  {
    name: "05_HubSpot_CRM_Export_March2026.csv",
    source: "E:\\OneDrive - Uncle Robert Consulting LLC\\Working Docs\\_Agency Shared Assets and Projects\\Agency Docs\\Our Agency - Documents\\hubspot-crm-exports-all-products-2026-03-21.csv",
    category: "HubSpot Historical Product & Lead Records",
    status: "CRM Historical",
  },
];

const consolidatedReport = [];

for (const item of CANDIDATE_FILES) {
  if (fs.existsSync(item.source)) {
    const dest = path.join(LEAD_VAULT, item.name);
    fs.copyFileSync(item.source, dest);
    const stat = fs.statSync(dest);
    consolidatedReport.push({
      ...item,
      sizeKb: Math.round(stat.size / 1024),
      destPath: dest,
    });
    console.log(`✅ Consolidated: ${item.name} (${Math.round(stat.size / 1024)} KB)`);
  } else {
    console.log(`⚠️ Source not found: ${item.source}`);
  }
}

let reportMd = `# Centralized Lead Vault & Prospect Registry\n\n`;
reportMd += `Location: \`${LEAD_VAULT}\`\n\n`;
reportMd += `| # | Lead List Name | Category / ICP Fit | Status & Usability | Size | Action |\n`;
reportMd += `| :-: | :--- | :--- | :--- | :-: | :--- |\n`;

consolidatedReport.forEach((r, idx) => {
  reportMd += `| **${idx + 1}** | \`${r.name}\` | **${r.category}** | ${r.status} | ${r.sizeKb} KB | [Open File](file:///${r.destPath.replace(/\\/g, "/")}) |\n`;
});

const reportFile = path.join(LEAD_VAULT, "README-Lead-Vault-Audit.md");
fs.writeFileSync(reportFile, reportMd);
console.log(`✅ Written Lead Vault Audit to: ${reportFile}`);
