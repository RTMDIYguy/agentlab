import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { contactSubmissions, hubspotSyncLog } from "../schema";
import { syncContactSubmission } from "./sync";
import {
  HUBSPOT_CONTACT_PROPERTIES,
  extractHubSpotPropertyErrors,
} from "./schema-map";

function getHubspotToken(): string {
  return (
    process.env.HUBSPOT_PAT ||
    process.env.HUBSPOT_ACCESS_TOKEN ||
    process.env.HUBSPOT_DEVELOPER_API_KEY ||
    process.env.HUBSPOT_API_KEY ||
    ""
  );
}

const HUBSPOT_CONTACTS_URL = "https://api.hubapi.com/crm/v3/objects/contacts";

async function upsertContact(properties: Record<string, string>) {
  const token = getHubspotToken();
  if (!token) {
    throw new Error("HubSpot access token (HUBSPOT_PAT or HUBSPOT_ACCESS_TOKEN) is not configured in environment.");
  }

  // 1. Try create
  const createRes = await fetch(HUBSPOT_CONTACTS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ properties }),
  });

  if (createRes.ok) return { success: true, created: true };

  // 2. On 409 (contact already exists) → treat as success, no patch
  // Patching here would allow unauthenticated callers to overwrite any
  // existing contact by supplying a known email address.
  if (createRes.status === 409) {
    return { success: true, created: false };
  }

  const bodyText = await createRes.text();
  const propErrors = extractHubSpotPropertyErrors(bodyText);
  throw new Error(
    propErrors.length > 0
      ? `HubSpot create failed (${createRes.status}): ${propErrors.join("; ")}`
      : `HubSpot create failed (${createRes.status}): ${bodyText.slice(0, 400)}`
  );
}

export const hubspotRouter = router({
  /** Admin: recent lead-handoff sync outcomes (the honest funnel ledger). */
  listSyncLog: adminProcedure
    .input(
      z
        .object({ limit: z.number().min(1).max(200).default(50) })
        .default({ limit: 50 })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const rows = await db
        .select()
        .from(hubspotSyncLog)
        .orderBy(desc(hubspotSyncLog.createdAt))
        .limit(input.limit);
      return rows.map((row) => ({
        ...row,
        createdAt: row.createdAt.toISOString(),
      }));
    }),

  /** Admin: retry the HubSpot handoff for a submission that failed or was skipped. */
  retrySync: adminProcedure
    .input(z.object({ submissionId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const [row] = await db
        .select()
        .from(contactSubmissions)
        .where(eq(contactSubmissions.id, input.submissionId));
      if (!row) throw new Error("Submission not found");
      const result = await syncContactSubmission(row);
      return result;
    }),
  createContact: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        firstname: z.string().optional(),
        lastname: z.string().optional(),
        company: z.string().optional(),
        what_are_you_building: z.string().optional(),
        referral_code: z.string().optional(),
        source: z.string().optional(), // e.g. "community", "book", "bootcamp"
        consent: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const properties: Record<string, string> = {
        email: input.email,
      };

      if (input.firstname) properties.firstname = input.firstname;
      if (input.lastname) properties.lastname = input.lastname;
      if (input.company) properties.company = input.company;
      if (input.what_are_you_building)
        properties.what_are_you_building = input.what_are_you_building;
      if (input.referral_code) properties.referral_code = input.referral_code;
      if (input.source) properties.lead_source = input.source;

      return upsertContact(properties);
    }),

  /** Admin: the property contract this OS syncs against (for portal setup). */
  getPropertyContract: adminProcedure.query(async () => {
    return {
      properties: HUBSPOT_CONTACT_PROPERTIES,
      groups: [
        { name: "agentlab_os", label: "Agent Lab OS" },
        { name: "agentlab_signup", label: "Agent Lab Signup" },
      ],
      source: "Agent Lab OS to HubSpot Lead Handoff Blueprint (Breeze, 2026-09-23)",
    };
  }),
});
