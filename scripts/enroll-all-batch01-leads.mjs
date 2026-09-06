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
    const raw = lines[i];
    const parts = raw.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
    const clean = parts.map(p => p.replace(/^"|"$/g, '').trim());

    if (clean.length >= 4 && clean[0].includes("@")) {
      leads.push({
        campaign_id: CAMPAIGN_ID,
        email: clean[0],
        first_name: clean[1] || "",
        last_name: clean[2] || "",
        company_name: clean[3] || "",
        title: clean[4] || "",
        website: clean[5] || "",
        phone: clean[6] || "",
        custom_variables: {
          location: clean[7] || "Missouri",
          tech_stack: clean[8] || "M365",
        },
      });
    }
  }
  return leads;
}

async function enrollAll() {
  const text = fs.readFileSync(CSV_FILE, "utf-8");
  const leads = parseCleanCSV(text);
  console.log(`Enrolling ${leads.length} leads into campaign ${CAMPAIGN_ID}...`);

  let successCount = 0;
  for (const lead of leads) {
    try {
      const res = await fetch("https://api.instantly.ai/api/v2/leads", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(lead),
      });

      if (res.ok) {
        successCount++;
        console.log(`✅ Enrolled: ${lead.email} (${lead.first_name} at ${lead.company_name})`);
      } else {
        console.error(`❌ Failed: ${lead.email} - ${res.status}: ${await res.text()}`);
      }
    } catch (e) {
      console.error(`Error for ${lead.email}:`, e.message);
    }
  }

  console.log(`\n🎉 Completed! Successfully enrolled ${successCount} / ${leads.length} leads in Instantly.`);
}

enrollAll().catch(console.error);
