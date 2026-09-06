import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const apiKey = process.env.INSTANTLY_API_KEY;

const CAMPAIGN_NAME = "KC & Missouri Founders - M365 Diagnostic Sprint (Batch 01)";

const STEP_1_SUBJECT = "quick question regarding {{companyName}} ops / tool stack";
const STEP_1_BODY = `<div>Hey {{firstName}},<br><br>Came across {{companyName}} while reviewing digital and agency operations in {{location}}.<br><br>Most founders and agency owners we work with are spending $1,500+ a month duct-taping Zapier, separate CRMs, and multiple AI subscriptions—when they already own 80% of the operational infrastructure inside Microsoft 365.<br><br>We built an autonomous system that collapses tool sprawl into a clean, self-hosted architecture.<br><br>Would you be open to taking a look at a free 15-minute diagnostic map for your stack? No pitch, just a 1-page architecture breakdown of where you can cut software costs.<br><br>Best,<br><strong>Robert McCarthy</strong><br>Founder & Lead Architect | Uncle Robert Consulting & Agent Lab<br>(816) 237-8697 | agent-lab.tech</div>`;

const STEP_2_BODY = `<div>Hey {{firstName}},<br><br>Following up on this quickly.<br><br>If you're currently happy with your tool stack, no worries at all. But if you're feeling the friction of tool sprawl or manual data handoffs between your team, I'd be glad to send over our 1-page M365 consolidation blueprint.<br><br>Either way, wishing you and the {{companyName}} team continued growth!<br><br>Best,<br><strong>Robert</strong></div>`;

async function createCampaign() {
  console.log(`Creating campaign "${CAMPAIGN_NAME}" in Instantly...`);

  const payload = {
    name: CAMPAIGN_NAME,
    campaign_schedule: {
      schedules: [
        {
          name: "Standard Central Time (Mon-Fri)",
          timing: {
            from: "09:00",
            to: "17:00",
          },
          days: {
            "1": true,
            "2": true,
            "3": true,
            "4": true,
            "5": true,
          },
          timezone: "America/Chicago",
        },
      ],
    },
    sequences: [
      {
        steps: [
          {
            type: "email",
            variants: [
              {
                subject: STEP_1_SUBJECT,
                body: STEP_1_BODY,
              },
            ],
            delay: 0,
          },
          {
            type: "email",
            variants: [
              {
                subject: "",
                body: STEP_2_BODY,
              },
            ],
            delay: 3,
          },
        ],
      },
    ],
  };

  const res = await fetch("https://api.instantly.ai/api/v2/campaigns", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    console.error("Create campaign error:", res.status, await res.text());
    return;
  }

  const created = await res.json();
  console.log("✅ Campaign created successfully in Instantly:", created);
}

createCampaign().catch(console.error);
