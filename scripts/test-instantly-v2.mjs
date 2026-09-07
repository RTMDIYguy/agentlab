import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const apiKey = process.env.INSTANTLY_API_KEY;

async function testInstantlyAuth() {
  console.log("Testing Instantly v2 and v1 auth headers...");

  // Test 1: v2 API with Bearer token
  const v2Res = await fetch("https://api.instantly.ai/api/v2/campaigns", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
  });
  console.log("v2 Bearer Auth Response:", v2Res.status);
  if (v2Res.ok) {
    const data = await v2Res.json();
    console.log("v2 Campaigns:", data);
  } else {
    console.log("v2 Error:", await v2Res.text());
  }

  // Test 2: v1 API with Bearer header
  const v1Bearer = await fetch("https://api.instantly.ai/api/v1/campaign/list", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
  });
  console.log("v1 Bearer Auth Response:", v1Bearer.status);
}

testInstantlyAuth().catch(console.error);
