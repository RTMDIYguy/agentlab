import fs from "node:fs";
import path from "node:path";

const SOURCE_FILE = "E:\\OneDrive - Uncle Robert Consulting LLC\\Working Docs\\AI Native Agency Deepened\\Lead Vault\\01_Missouri_Tech_Founders_Agency_Owners_Reviewed.csv";
const OUT_FILE = "E:\\OneDrive - Uncle Robert Consulting LLC\\Working Docs\\AI Native Agency Deepened\\Lead Vault\\instantly_import_batch_01.csv";

// Parse CSV manually with quote handling
function parseCSV(content) {
  const rows = [];
  let currentRow = [];
  let currentVal = "";
  let insideQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = "";
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentVal.trim());
      if (currentRow.some(c => c.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = "";
    } else {
      currentVal += char;
    }
  }

  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some(c => c.length > 0)) rows.push(currentRow);
  }

  return rows;
}

const rawText = fs.readFileSync(SOURCE_FILE, "utf-8");
const rows = parseCSV(rawText);

const header = rows[0];
const emailIdx = header.indexOf("Email");
const fnIdx = header.indexOf("First Name");
const lnIdx = header.indexOf("Last Name");
const companyIdx = header.indexOf("Company Name");
const titleIdx = header.indexOf("Title");
const websiteIdx = header.indexOf("Website");
const phoneIdx = header.indexOf("Corporate Phone");
const techIdx = header.indexOf("Technologies");
const cityIdx = header.indexOf("City");
const stateIdx = header.indexOf("State");

console.log(`Parsed ${rows.length - 1} contact rows from source.`);

// Build Instantly format CSV
let outCSV = `"email","firstName","lastName","companyName","title","website","phone","location","techStack"\n`;

let validCount = 0;
for (let r = 1; r < rows.length; r++) {
  const row = rows[r];
  const email = row[emailIdx] || "";
  const fn = row[fnIdx] || "";
  const ln = row[lnIdx] || "";
  const comp = row[companyIdx] || "";
  const title = (row[titleIdx] || "").replace(/"/g, '""');
  const web = row[websiteIdx] || "";
  const phone = (row[phoneIdx] || "").replace(/['+]/g, '');
  const loc = `${row[cityIdx] || ""}, ${row[stateIdx] || ""}`.trim();
  const tech = (row[techIdx] || "").substring(0, 80).replace(/"/g, '""');

  if (email && email.includes("@") && !email.includes("apollo.io")) {
    outCSV += `"${email}","${fn}","${ln}","${comp}","${title}","${web}","${phone}","${loc}","${tech}"\n`;
    validCount++;
  }
}

fs.writeFileSync(OUT_FILE, outCSV);
console.log(`✅ Generated Instantly import batch: ${OUT_FILE} (${validCount} verified leads)`);
