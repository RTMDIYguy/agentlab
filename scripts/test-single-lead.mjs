import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const apiKey = process.env.INSTANTLY_API_KEY;
const CAMPAIGN_ID = "901aed5b-2c0b-4cd8-9658-470d15ab4dee";

async function testSingleLead() {
  console.log("Testing adding single lead to campaign...");

  // Schema variation 1: { campaign_id, email, first_name, ... }
  const res1 = await fetch("https://api.instantly.ai/api/v2/leads", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      campaign_id: CAMPAIGN_ID,
      email: "mac@noladigitalmarketingandseo.com",
      first_name: "Mac",
      last_name: "Link",
      company_name: "NOLA Digital Marketing and SEO",
      custom_variables: {
        location: "St. Louis, Missouri",
      },
    }),
  });

  console.log("Single lead payload response:", res1.status);
  const data1 = await res1.json();
  console.log("Response data:", data1);
}

testSingleLead().catch(console.error);
