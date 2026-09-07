import fs from "node:fs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const apiKey = process.env.INSTANTLY_API_KEY;
const CAMPAIGN_ID = "901aed5b-2c0b-4cd8-9658-470d15ab4dee";
const CSV_FILE = "E:\\OneDrive - Uncle Robert Consulting LLC\\Working Docs\\AI Native Agency Deepened\\Lead Vault\\instantly_import_batch_01.csv";

function parseCleanCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  const leads = [];

  for (let i = 1; i < lines.length; i++) {
    // split by "," with quotes trimmed
    const raw = lines[i];
    const parts = raw.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
    const cleanParts = parts.map(p => p.replace(/^"|"$/g, '').trim());

    if (cleanParts.length >= 4 && cleanParts[0].includes("@")) {
      leads.push({
        email: cleanParts[0],
        first_name: cleanParts[1] || "",
        last_name: cleanParts[2] || "",
        company_name: cleanParts[3] || "",
        phone: cleanParts[6] || "",
        website: cleanParts[5] || "",
        custom_variables: {
          location: cleanParts[7] || "Missouri",
          tech_stack: cleanParts[8] || "M365",
        },
      });
    }
  }
  return leads;
}

async function enrollLeads() {
  const text = fs.readFileSync(CSV_FILE, "utf-8");
  const leads = parseCleanCSV(text);
  console.log(`Parsed ${leads.length} valid leads. Sample lead:`, leads[0]);

  const payload = {
    campaign_id: CAMPAIGN_ID,
    skip_if_in_workspace: true,
    leads: leads,
  };

  const res = await fetch("https://api.instantly.ai/api/v2/leads", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    console.error("Enrollment error:", res.status, await res.text());
    return;
  }

  const result = await res.json();
  console.log("✅ Successfully enrolled leads into Instantly campaign:", result);
}

enrollLeads().catch(console.error);
