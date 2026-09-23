/**
 * HubSpot Lists (Segments) v3 + CRM contacts tooling
 *
 * Mirrors the local newsletter_subscribers roster into a HubSpot static
 * (MANUAL) contact list so Marketing Hub sends target the real local list.
 *
 * Flow per sync:
 *   1. Batch-upsert contacts keyed by email (creates/updates HubSpot contacts)
 *   2. Ensure the static list exists (create if missing)
 *   3. Add-and-remove memberships so the list exactly matches the local roster
 *
 * API notes (verified against HubSpot docs, 2026-09):
 *   - POST /crm/v3/objects/contacts/batch/upsert with idProperty: "email"
 *   - POST /crm/v3/lists            { name, objectTypeId: "0-1", processingType: "MANUAL" }
 *   - GET  /crm/v3/lists/object-type-id/0-1/name/{name}
 *   - PUT  /crm/v3/lists/{listId}/memberships/add-and-remove
 *          { recordIdsToAdd: [], recordIdsToRemove: [] }
 *   Membership endpoints only work on MANUAL/SNAPSHOT lists — which is exactly
 *   what we create here.
 */

import { getHubspotEmailToken } from "./hubspotEmail";

const HUBSPOT_API_BASE = "https://api.hubapi.com";

export const NEWSLETTER_LIST_NAME = "AgentLab Newsletter Subscribers";

async function hubspotFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const token = getHubspotEmailToken();
  if (!token) {
    throw new Error(
      "HubSpot access token (HUBSPOT_PAT) is not configured in environment."
    );
  }
  return fetch(`${HUBSPOT_API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });
}

async function readError(response: Response, label: string): Promise<never> {
  const errorText = await response.text();
  throw new Error(
    `${label} failed (${response.status}): ${errorText.slice(0, 500)}`
  );
}

export interface ContactInput {
  email: string;
  name?: string | null;
}

export interface UpsertedContact {
  email: string;
  recordId: string;
}

/**
 * Batch-upsert HubSpot contacts keyed by email. Chunks of 100 (API max).
 * Name is split into firstname/lastname when provided.
 */
export async function upsertContactsByEmail(
  contacts: ContactInput[]
): Promise<UpsertedContact[]> {
  const out: UpsertedContact[] = [];
  for (let i = 0; i < contacts.length; i += 100) {
    const chunk = contacts.slice(i, i + 100);
    const inputs = chunk.map(c => {
      const props: Record<string, string> = { email: c.email.toLowerCase() };
      const trimmed = (c.name || "").trim();
      if (trimmed) {
        const parts = trimmed.split(/\s+/);
        props.firstname = parts[0];
        if (parts.length > 1) props.lastname = parts.slice(1).join(" ");
      }
      return { idProperty: "email", id: props.email, properties: props };
    });

    const response = await hubspotFetch(
      "/crm/v3/objects/contacts/batch/upsert",
      { method: "POST", body: JSON.stringify({ inputs }) }
    );
    if (!response.ok) await readError(response, "HubSpot contact upsert");

    const created = (await response.json()) as {
      results?: Array<{ id: string; properties?: { email?: string } }>;
    };
    const results = created.results || [];
    if (results.length === chunk.length) {
      results.forEach((r, idx) =>
        out.push({ email: chunk[idx].email.toLowerCase(), recordId: r.id })
      );
    } else {
      // HubSpot may return results in arbitrary order — match by email.
      const byEmail = new Map(
        results.map(r => [(r.properties?.email || "").toLowerCase(), r.id])
      );
      for (const c of chunk) {
        const id = byEmail.get(c.email.toLowerCase());
        if (id) out.push({ email: c.email.toLowerCase(), recordId: id });
      }
    }
  }
  return out;
}

/**
 * Ensure a MANUAL static contact list exists; return its ILS listId.
 * Looks it up by name first so repeated syncs reuse the same list.
 */
export async function ensureNewsletterList(
  name: string = NEWSLETTER_LIST_NAME
): Promise<string> {
  const lookup = await hubspotFetch(
    `/crm/v3/lists/object-type-id/0-1/name/${encodeURIComponent(name)}`
  );
  if (lookup.ok) {
    const found = (await lookup.json()) as { list?: { listId?: string } };
    if (found.list?.listId) return found.list.listId;
  } else if (lookup.status !== 404) {
    await readError(lookup, "HubSpot list lookup");
  }

  const create = await hubspotFetch("/crm/v3/lists", {
    method: "POST",
    body: JSON.stringify({
      name,
      objectTypeId: "0-1",
      processingType: "MANUAL",
    }),
  });
  if (!create.ok) {
    // Race tolerance: another sync created it between lookup and create.
    if (create.status === 409 || create.status === 400) {
      const retry = await hubspotFetch(
        `/crm/v3/lists/object-type-id/0-1/name/${encodeURIComponent(name)}`
      );
      if (retry.ok) {
        const found = (await retry.json()) as { list?: { listId?: string } };
        if (found.list?.listId) return found.list.listId;
      }
    }
    await readError(create, "HubSpot list create");
  }
  const created = (await create.json()) as { list?: { listId?: string } };
  if (!created.list?.listId) {
    throw new Error("HubSpot list create returned no listId.");
  }
  return created.list.listId;
}

async function fetchListMemberIds(listId: string): Promise<string[]> {
  const response = await hubspotFetch(
    `/crm/v3/lists/${encodeURIComponent(listId)}/memberships`
  );
  if (!response.ok) await readError(response, "HubSpot list members fetch");

  const body: unknown = await response.json();
  const raw: any[] = Array.isArray(body)
    ? body
    : ((body as { results?: any[] })?.results ?? []);
  return raw
    .map(item =>
      String(item?.recordId ?? item?.properties?.hs_object_id ?? "")
    )
    .filter(Boolean);
}

export interface ListSyncReport {
  listId: string;
  listName: string;
  upserted: number;
  added: number;
  removed: number;
  totalActive: number;
}

/**
 * Mirror a contact roster onto a HubSpot static list: upsert contacts, ensure
 * the list, then add-and-remove memberships so the list exactly matches.
 */
export async function syncContactsToList(
  contacts: ContactInput[],
  listName: string = NEWSLETTER_LIST_NAME
): Promise<ListSyncReport> {
  if (!getHubspotEmailToken()) {
    throw new Error(
      "HubSpot access token (HUBSPOT_PAT) is not configured in environment."
    );
  }

  const recordIds = await upsertContactsByEmail(contacts);
  const listId = await ensureNewsletterList(listName);

  const activeIds = new Set(recordIds.map(r => r.recordId));
  const memberIds = await fetchListMemberIds(listId);

  const recordIdsToAdd = recordIds
    .map(r => r.recordId)
    .filter(id => !memberIds.includes(id));
  const recordIdsToRemove = memberIds.filter(id => !activeIds.has(id));

  if (recordIdsToAdd.length || recordIdsToRemove.length) {
    const response = await hubspotFetch(
      `/crm/v3/lists/${encodeURIComponent(listId)}/memberships/add-and-remove`,
      {
        method: "PUT",
        body: JSON.stringify({ recordIdsToAdd, recordIdsToRemove }),
      }
    );
    if (!response.ok) {
      await readError(response, "HubSpot list membership update");
    }
  }

  return {
    listId,
    listName,
    upserted: recordIds.length,
    added: recordIdsToAdd.length,
    removed: recordIdsToRemove.length,
    totalActive: contacts.length,
  };
}
