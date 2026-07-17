import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";

// PAT must be set in environment — see .env.example
const HUBSPOT_PAT = process.env.HUBSPOT_PAT ?? "";

const HUBSPOT_CONTACTS_URL = "https://api.hubapi.com/crm/v3/objects/contacts";

async function upsertContact(properties: Record<string, string>) {
  // 1. Try create
  const createRes = await fetch(HUBSPOT_CONTACTS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${HUBSPOT_PAT}`,
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

  throw new Error(
    `HubSpot create failed (${createRes.status}): ${await createRes.text()}`
  );
}

export const hubspotRouter = router({
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
});
