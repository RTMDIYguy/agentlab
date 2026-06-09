import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../_core/trpc";

// PAT must be set in environment — see .env.example
const HUBSPOT_PAT = process.env.HUBSPOT_PAT ?? "";

const HUBSPOT_CONTACTS_URL =
  "https://api.hubapi.com/crm/v3/objects/contacts";

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

  // 2. On 409 (contact already exists) → search then patch
  if (createRes.status === 409) {
    const searchRes = await fetch(`${HUBSPOT_CONTACTS_URL}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HUBSPOT_PAT}`,
      },
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              {
                propertyName: "email",
                operator: "EQ",
                value: properties.email,
              },
            ],
          },
        ],
      }),
    });

    if (!searchRes.ok) {
      throw new Error(`HubSpot search failed: ${await searchRes.text()}`);
    }

    const searchData = (await searchRes.json()) as {
      results: Array<{ id: string }>;
    };
    const contactId = searchData.results?.[0]?.id;

    if (!contactId) {
      throw new Error("HubSpot: 409 but contact not found in search");
    }

    const patchRes = await fetch(`${HUBSPOT_CONTACTS_URL}/${contactId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HUBSPOT_PAT}`,
      },
      body: JSON.stringify({ properties }),
    });

    if (!patchRes.ok) {
      throw new Error(`HubSpot patch failed: ${await patchRes.text()}`);
    }

    return { success: true, created: false };
  }

  throw new Error(`HubSpot create failed (${createRes.status}): ${await createRes.text()}`);
}

export const hubspotRouter = createTRPCRouter({
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
