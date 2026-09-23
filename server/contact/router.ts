import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { contactSubmissions } from "../schema";
import { ensureLeadDmThread } from "../messenger/leadThread";
import { syncContactSubmission } from "../hubspot/sync";

const submitSchema = z.object({
  name: z.string().trim().max(128).optional(),
  email: z.string().trim().max(255),
  company: z.string().trim().max(128).optional(),
  painPoint: z.string().max(4000).optional(),
  interest: z.string().trim().max(128).optional(),
  subject: z.string().trim().max(255).optional(),
  message: z.string().max(10000).optional(),
  source: z.string().trim().max(128).default("website"),
});

async function relayToN8nIfConfigured(payload: Record<string, unknown>) {
  const webhookUrl = process.env.N8N_INTAKE_WEBHOOK_URL;
  if (!webhookUrl) return false;

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      console.error(
        `[Contact] n8n relay failed with status ${response.status}`
      );
      return false;
    }
    return true;
  } catch (err: any) {
    console.error("[Contact] n8n relay error:", err?.message);
    return false;
  }
}

export const contactRouter = router({
  /** Public: capture any site contact/lead into the DB, optionally relaying to n8n. */
  submitContact: publicProcedure
    .input(submitSchema)
    .mutation(async ({ input }) => {
      const db = await getDb();
      const email = input.email.toLowerCase();

      const [row] = await db
        .insert(contactSubmissions)
        .values({
          name: input.name ?? null,
          email,
          company: input.company ?? null,
          painPoint: input.painPoint ?? null,
          interest: input.interest ?? null,
          subject: input.subject ?? null,
          message: input.message ?? null,
          source: input.source,
          status: "new",
        })
        .returning();

      // Optional CRM relay — the submission is already durable in the DB, so a
      // webhook failure never loses the lead.
      const relayed = await relayToN8nIfConfigured({
        ContactName: input.name ?? "Unknown",
        Email: email,
        Company: input.company ?? "",
        Interest: input.interest ?? "",
        Subject: input.subject ?? "",
        Message: input.message ?? "",
        Source: input.source,
      });

      if (relayed) {
        await db
          .update(contactSubmissions)
          .set({ status: "synced", crmSyncedAt: new Date() })
          .where(eq(contactSubmissions.id, row.id));
      }

      // DM thread in the messenger for this lead. Best-effort: a messenger
      // failure must never fail the lead capture itself.
      await ensureLeadDmThread({
        submissionId: row.id,
        name: input.name ?? null,
        email,
        company: input.company ?? null,
        topic: input.interest ?? input.subject ?? null,
        message: input.message ?? input.painPoint ?? null,
        source: input.source,
      });

      // HubSpot lead handoff (blueprint Phase 1). Best-effort and honestly
      // logged: a sync failure never fails the capture and never pretends
      // success — outcome rows land in hubspot_sync_log either way.
      try {
        await syncContactSubmission(row);
      } catch (syncErr: any) {
        console.error("[Contact] HubSpot sync error:", syncErr?.message);
      }

      return { success: true, submissionId: row.id };
    }),

  /** Admin: recent submissions for triage. */
  listSubmissions: adminProcedure
    .input(
      z
        .object({ limit: z.number().min(1).max(200).default(50) })
        .default({ limit: 50 })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      const rows = await db
        .select()
        .from(contactSubmissions)
        .orderBy(desc(contactSubmissions.createdAt))
        .limit(input.limit);
      return rows.map(row => ({
        ...row,
        createdAt: row.createdAt.toISOString(),
      }));
    }),
});
