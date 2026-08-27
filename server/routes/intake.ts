import { Router } from "express";

export const intakeRouter = Router();

// n8n Webhook URL for the Intake Workflow
const N8N_WEBHOOK_URL = process.env.N8N_INTAKE_WEBHOOK_URL || "http://localhost:5678/webhook/agentlab-intake";

intakeRouter.post("/", async (req, res) => {
  try {
    const { contactName, email, serviceLine, source, notes, dealValue } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Forward the lead data to n8n
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "Contact Name": contactName || "Unknown",
        "Email": email,
        "Service Line": serviceLine || "General Inquiry",
        "Source": source || "AgentLab Website",
        "Notes": notes || "",
        "Deal Value ($)": dealValue || "0",
        "HubSpotSync": "" // Leave empty so SDR agent picks it up
      }),
    });

    if (!response.ok) {
      console.error(`[Intake Route] n8n Webhook failed with status: ${response.status}`);
      throw new Error("Failed to forward lead to CRM");
    }

    return res.status(200).json({ success: true, message: "Lead captured successfully" });
  } catch (error) {
    console.error("[Intake Route] Error capturing lead:", error);
    return res.status(500).json({ error: "Internal server error capturing lead" });
  }
});
