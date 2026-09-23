import { Router } from "express";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { contactSubmissions } from "../schema";
import { ensureLeadDmThread } from "../messenger/leadThread";

export const intakeRouter = Router();

// n8n Webhook URL for the Intake Workflow
const N8N_WEBHOOK_URL = process.env.N8N_INTAKE_WEBHOOK_URL || "";

intakeRouter.post("/", async (req, res) => {
  try {
    const { contactName, email, serviceLine, source, notes, dealValue, company } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Persist first: a webhook failure must never lose a lead.
    let submissionId: string | null = null;
    try {
      const db = await getDb();
      const [row] = await db
        .insert(contactSubmissions)
        .values({
          name: contactName ?? null,
          email: String(email).toLowerCase(),
          company: company ?? null,
          subject: serviceLine ?? null,
          message: notes ?? null,
          source: source || "website",
          status: "new",
        })
        .returning({ id: contactSubmissions.id });
      submissionId = row.id;
    } catch (dbErr: any) {
      // DB down should not block the CRM relay path entirely; log loudly.
      console.error("[Intake Route] Failed to persist lead:", dbErr?.message);
    }

    // DM thread in the messenger for this lead. Best-effort: fires only when
    // persistence succeeded (submissionId exists) and never blocks the CRM    // relay or the response.
    if (submissionId) {
      await ensureLeadDmThread({
        submissionId,
        name: contactName ?? null,
        email: String(email).toLowerCase(),
        company: company ?? null,
        topic: serviceLine ?? null,
        message: notes ?? null,
        source: source || "website",
      });
    }

    // Forward the lead data to n8n CRM pipeline
    let crmSynced = false;
    if (N8N_WEBHOOK_URL) {
      try {
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
        } else {
          crmSynced = true;
        }
      } catch (relayErr: any) {
        console.error("[Intake Route] n8n relay error:", relayErr?.message);
      }
    }

    if (submissionId) {
      try {
        const db = await getDb();
        if (crmSynced) {
          await db
            .update(contactSubmissions)
            .set({ status: "synced", crmSyncedAt: new Date() })
            .where(eq(contactSubmissions.id, submissionId));
        }
      } catch {
        // non-fatal
      }
    }

    if (!submissionId && !crmSynced) {
      return res
        .status(503)
        .json({ error: "Lead could not be captured. Please try again." });
    }

    return res.status(200).json({
      success: true,
      message: "Lead captured successfully",
      submissionId,
    });
  } catch (error) {
    console.error("[Intake Route] Error capturing lead:", error);
    return res.status(500).json({ error: "Internal server error capturing lead" });
  }
});
