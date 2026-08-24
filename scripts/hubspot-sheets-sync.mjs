import { readFile } from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const ADC_PATH =
  "C:\\Users\\RobertM\\AppData\\Roaming\\gcloud\\application_default_credentials.json";
const SPREADSHEET_ID = "14HMhMB4uJOTAPS1dpiOR7r6XwKr81WjhwSDUczXxwIw";
const TAB_NAME = "Lead Follow-Up";
// Get active Google access token using the authorized refresh token
async function getGoogleAccessToken() {
  const fileContent = await readFile(ADC_PATH, "utf8");
  const adc = JSON.parse(fileContent);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: adc.client_id,
      client_secret: adc.client_secret,
      refresh_token: adc.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh Google token: ${await response.text()}`);
  }
  const data = await response.json();
  return data.access_token;
}
// Read Google Sheet values
async function readSheet(accessToken) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(TAB_NAME)}!A:Z`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error(`Failed to read sheet: ${await response.text()}`);
  }
  const data = await response.json();
  return data.values || [];
}

// Update specific cells in Google Sheets
async function updateSheetCell(accessToken, range, value) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(TAB_NAME)}!${range}?valueInputOption=RAW`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [[value]] }),
  });
  if (!response.ok) {
    throw new Error(
      `Failed to update sheet cell ${range}: ${await response.text()}`
    );
  }
}
// Search for contact in HubSpot by email
async function searchHubSpotContact(email) {
  const url = "https://api.hubapi.com/crm/v3/objects/contacts/search";
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filterGroups: [
        {
          filters: [{ propertyName: "email", operator: "EQ", value: email }],
        },
      ],
    }),
  });
  if (!response.ok) {
    throw new Error(
      `Failed to search HubSpot contact: ${await response.text()}`
    );
  }
  const data = await response.json();
  return data.results && data.results.length > 0 ? data.results[0] : null;
}
// Create a new HubSpot Contact
async function createHubSpotContact(firstName, lastName, email) {
  const url = "https://api.hubapi.com/crm/v3/objects/contacts";
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: { email, firstname: firstName, lastname: lastName },
    }),
  });
  if (!response.ok) {
    throw new Error(
      `Failed to create HubSpot contact: ${await response.text()}`
    );
  }
  return await response.json();
}
// Create a new HubSpot Deal
async function createHubSpotDeal(dealName) {
  const url = "https://api.hubapi.com/crm/v3/objects/deals";
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        dealname: dealName,
        dealstage: "appointmentscheduled",
        pipeline: "default",
      },
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to create HubSpot deal: ${await response.text()}`);
  }
  return await response.json();
}
// Associate a Deal to a Contact
async function associateDealToContact(dealId, contactId) {
  const url = `https://api.hubapi.com/crm/v4/objects/deals/${dealId}/associations/contacts/${contactId}`;
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      {
        associationCategory: "HUBSPOT_DEFINED",
        associationTypeId: 3, // deal_to_contact is 3
      },
    ]),
  });
  if (!response.ok) {
    throw new Error(
      `Failed to associate deal to contact: ${await response.text()}`
    );
  }
}
// Main Orchestrator Sync Function
async function syncSDRLeads() {
  console.log("Starting HubSpot Sheets Sync SDR Agent...");
  if (
    !process.env.HUBSPOT_ACCESS_TOKEN ||
    process.env.HUBSPOT_ACCESS_TOKEN === "pat-your-token-here"
  ) {
    console.error(
      "CRITICAL ERROR: Please add your actual HubSpot Private App Access Token to .env.local!"
    );
    return;
  }

  try {
    const googleToken = await getGoogleAccessToken();
    const rows = await readSheet(googleToken);

    if (rows.length < 2) {
      console.log("No leads to process (empty sheet or only headers).");
      return;
    }

    const headers = rows[0].map(h => h.trim().toLowerCase());
    const emailIndex = headers.indexOf("email");
    const firstNameIndex = headers.indexOf("first name");
    const lastNameIndex = headers.indexOf("last name");
    const offerIndex = headers.indexOf("offer");
    const syncStatusIndex = headers.indexOf("hubspotsync");
    const hubspotIdIndex = headers.indexOf("hubspotid");

    if (emailIndex === -1 || syncStatusIndex === -1) {
      console.error(
        "CRITICAL ERROR: Spreadsheet must have 'Email' and 'HubSpotSync' columns!"
      );
      return;
    }
    let syncCount = 0;
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const email = row[emailIndex]?.trim();
      const syncStatus = row[syncStatusIndex]?.trim();

      if (!email || syncStatus === "SUCCESS") {
        continue;
      }

      const firstName =
        firstNameIndex !== -1 ? row[firstNameIndex]?.trim() || "" : "";
      const lastName =
        lastNameIndex !== -1 ? row[lastNameIndex]?.trim() || "" : "";
      const offer =
        offerIndex !== -1
          ? row[offerIndex]?.trim() || "General Lead"
          : "General Lead";

      console.log(
        `Processing Lead: ${firstName} ${lastName} (${email}) for Offer: ${offer}...`
      );

      // 1. Search for existing contact in HubSpot
      let contactId;
      const existingContact = await searchHubSpotContact(email);
      if (existingContact) {
        contactId = existingContact.id;
        console.log(`Found existing HubSpot Contact with ID: ${contactId}`);
      } else {
        // 2. Create brand-new contact if missing
        const newContact = await createHubSpotContact(
          firstName,
          lastName,
          email
        );
        contactId = newContact.id;
        console.log(`Created new HubSpot Contact with ID: ${contactId}`);
      }
      // 3. Create HubSpot Deal
      const dealName = `${firstName} ${lastName} - ${offer} (Local SDR Agent)`;
      const deal = await createHubSpotDeal(dealName);
      console.log(`Created HubSpot Deal with ID: ${deal.id}`);

      // 4. Associate Deal to Contact
      await associateDealToContact(deal.id, contactId);
      console.log(`Associated Deal ${deal.id} to Contact ${contactId}`);

      // 5. Update Google Sheet
      const rowIndex = i + 1;
      const syncColLetter = String.fromCharCode(65 + syncStatusIndex); // A, B, C, etc.
      await updateSheetCell(
        googleToken,
        `${syncColLetter}${rowIndex}`,
        "SUCCESS"
      );

      if (hubspotIdIndex !== -1) {
        const idColLetter = String.fromCharCode(65 + hubspotIdIndex);
        await updateSheetCell(
          googleToken,
          `${idColLetter}${rowIndex}`,
          contactId
        );
      }

      console.log(`Successfully synced row ${rowIndex} to HubSpot!`);
      syncCount++;
    }

    console.log(
      `HubSpot Sheets Sync SDR Agent completed successfully! Synced ${syncCount} leads.`
    );
  } catch (error) {
    console.error("CRITICAL ERROR during sync execution:", error);
  }
}

syncSDRLeads();
