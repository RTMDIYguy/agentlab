/**
 * Tests for the Agent Lab OS → HubSpot lead handoff (blueprint Phase 1).
 *
 * Covers:
 *  - the Phase-1 property mapping (identity, source, offer, handoff stamps)
 *  - the honesty doctrine: fields the OS does not collect are omitted, never
 *    invented (no fake intent levels, booking statuses, or "now" dates)
 *  - sync outcome logging: every attempt writes an honest hubspot_sync_log
 *    row; the submission flips to `synced` only on a real HubSpot confirmation
 *  - the portal setup contract (custom property definitions are exposed for
 *    portal configuration)
 */

import { describe, expect, it, vi, beforeEach } from "vitest";

// ---- db mock -----------------------------------------------------------------

const insertValues = vi.fn();
const insertMock = vi.fn(() => ({ values: insertValues }));
const updateSet = vi.fn();
const updateWhere = vi.fn();
const selectWhere = vi.fn();

vi.mock("../db", () => ({
  getDb: vi.fn(async () => ({
    insert: insertMock,
    update: vi.fn(() => ({ set: updateSet.mockReturnValue({ where: updateWhere }) })),
    select: vi.fn(() => ({ from: vi.fn(() => ({ where: selectWhere })) })),
  })),
}));

vi.mock("../schema", () => ({
  contactSubmissions: { id: "contact_submissions.id" },
  hubspotSyncLog: {},
}));

import {
  mapSubmissionToHubSpotProperties,
  normalizeChannel,
  splitName,
  extractHubSpotPropertyErrors,
  HUBSPOT_CONTACT_PROPERTIES,
} from "./schema-map";
import { upsertContactByEmail, syncContactSubmission } from "./sync";

// ---- mapping -----------------------------------------------------------------

describe("mapSubmissionToHubSpotProperties (blueprint Phase 1)", () => {
  const base = {
    id: "b7e6a0d2-1111-4111-8111-111111111111",
    name: "Jane van der Berg",
    email: "jane@example.com",
    company: "Acme Clinic",
    painPoint: "Weekend patient intake is manual",
    interest: "Agent Lab OS demo",
    subject: "Workflow consult",
    message: "Please reach out Tuesday",
    source: "founder-intake-chat",
    createdAt: new Date("2026-09-23T15:00:00Z"),
  };

  it("maps identity, source, offer, and handoff stamps", () => {
    const p = mapSubmissionToHubSpotProperties(base);
    expect(p.email).toBe("jane@example.com");
    expect(p.firstname).toBe("Jane");
    expect(p.lastname).toBe("van der Berg");
    expect(p.company).toBe("Acme Clinic");
    expect(p.lead_source_system).toBe("Agent Lab OS");
    expect(p.lifecyclestage).toBe("lead");
    expect(p.signup_source).toBe("founder-intake-chat");
    expect(p.agentlab_source_channel).toBe("chat");
    expect(p.product_of_interest).toBe("Agent Lab OS demo");
    expect(p.offer_of_interest).toBe("Workflow consult");
    expect(p.agentlab_stated_challenge).toBe("Weekend patient intake is manual");
    expect(p.agentlab_lead_id).toBe(base.id);
    expect(p.agentlab_signup_date).toBe("2026-09-23");
    expect(p.agentlab_intake_summary).toContain("Weekend patient intake");
  });

  it("omits fields the OS does not collect — never invents intent/booking/consent", () => {
    const p = mapSubmissionToHubSpotProperties({
      email: "bare@example.com",
    });
    expect(p).toEqual({
      email: "bare@example.com",
      lead_source_system: "Agent Lab OS",
      lifecyclestage: "lead",
    });
    expect(p.agentlab_intent_level).toBeUndefined();
    expect(p.agentlab_booking_status).toBeUndefined();
    expect(p.sms_consent_status).toBeUndefined();
    expect(p.preferred_contact_method).toBeUndefined();
  });

  it("derives signup_date from the submission's own createdAt, never 'now'", () => {
    const p = mapSubmissionToHubSpotProperties({
      email: "x@example.com",
      createdAt: new Date("2025-01-02T00:00:00Z"),
    });
    expect(p.agentlab_signup_date).toBe("2025-01-02");
  });
});

describe("normalizeChannel + splitName", () => {
  it("maps OS sources into the blueprint channel dropdown", () => {
    expect(normalizeChannel("founder-intake-chat")).toBe("chat");
    expect(normalizeChannel("sms-capture")).toBe("sms");
    expect(normalizeChannel("video-consult-request")).toBe("video consult");
    expect(normalizeChannel("newsletter")).toBe("newsletter");
    expect(normalizeChannel("weekend-intake-form")).toBe("intake form");
    expect(normalizeChannel("homepage")).toBe("website form");
  });

  it("splits names honestly", () => {
    expect(splitName("Jane van der Berg")).toEqual({
      firstname: "Jane",
      lastname: "van der Berg",
    });
    expect(splitName("Cher")).toEqual({ firstname: "Cher" });
    expect(splitName(null)).toEqual({});
    expect(splitName("   ")).toEqual({});
  });
});

describe("extractHubSpotPropertyErrors", () => {
  it("names the missing property from HubSpot's structured error", () => {
    const body = JSON.stringify({
      correlationId: "abc-123",
      errors: [
        {
          message: "Property was not found",
          context: { property: "agentlab_intent_level" },
        },
      ],
    });
    const out = extractHubSpotPropertyErrors(body);
    expect(out[0]).toContain("correlationId=abc-123");
    expect(out[1]).toContain('"agentlab_intent_level"');
  });

  it("returns [] for non-JSON bodies", () => {
    expect(extractHubSpotPropertyErrors("<html>Bad Gateway</html>")).toEqual([]);
  });
});

// ---- sync behavior -----------------------------------------------------------

const fetchMock = vi.fn();

function okJson(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("upsertContactByEmail", () => {
  beforeEach(() => {
    vi.resetModules();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    delete process.env.HUBSPOT_PAT;
    delete process.env.HUBSPOT_ACCESS_TOKEN;
    delete process.env.HUBSPOT_DEVELOPER_API_KEY;
    delete process.env.HUBSPOT_API_KEY;
    insertValues.mockReset();
    updateSet.mockReset();
    updateWhere.mockReset();
    selectWhere.mockReset();
  });

  it("skips honestly with guidance when no token is configured", async () => {
    const out = await upsertContactByEmail({ email: "a@b.com" });
    expect(out.outcome).toBe("skipped_no_token");
    expect(out.errorMessage).toMatch(/Settings/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("creates when lookup 404s, reports the real contact id", async () => {
    process.env.HUBSPOT_PAT = "pat-test";
    fetchMock
      .mockResolvedValueOnce(new Response("not found", { status: 404 }))
      .mockResolvedValueOnce(okJson({ id: "701550001" }, 201));

    const out = await upsertContactByEmail({ email: "a@b.com" });
    expect(out.outcome).toBe("synced");
    expect(out.hubspotContactId).toBe("701550001");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe("https://api.hubapi.com/crm/v3/objects/contacts");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body).properties.email).toBe("a@b.com");
  });

  it("patches the existing contact when lookup succeeds", async () => {
    process.env.HUBSPOT_PAT = "pat-test";
    fetchMock
      .mockResolvedValueOnce(okJson({ id: "555" }))
      .mockResolvedValueOnce(okJson({ id: "555" }));

    const out = await upsertContactByEmail({ email: "a@b.com", company: "Acme" });
    expect(out.outcome).toBe("synced");
    const [, init] = fetchMock.mock.calls[1];
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body).properties.company).toBe("Acme");
  });

  it("surfaces HubSpot property errors by name (portal setup guidance)", async () => {
    process.env.HUBSPOT_PAT = "pat-test";
    fetchMock
      .mockResolvedValueOnce(new Response("not found", { status: 404 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            correlationId: "cid-9",
            errors: [
              {
                message: "Property was not found",
                context: { property: "agentlab_lead_id" },
              },
            ],
          }),
          { status: 400 }
        )
      );

    const out = await upsertContactByEmail({ email: "a@b.com" });
    expect(out.outcome).toBe("error");
    expect(out.httpStatus).toBe(400);
    expect(out.errorMessage).toContain('"agentlab_lead_id"');
  });
});

describe("syncContactSubmission — honest ledger + status flip", () => {
  beforeEach(() => {
    vi.resetModules();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    delete process.env.HUBSPOT_PAT;
    delete process.env.HUBSPOT_ACCESS_TOKEN;
    delete process.env.HUBSPOT_DEVELOPER_API_KEY;
    delete process.env.HUBSPOT_API_KEY;
    insertValues.mockReset();
    updateSet.mockReset();
    updateWhere.mockReset();
    selectWhere.mockReset();
    insertValues.mockResolvedValue([]);
    updateWhere.mockResolvedValue([]);
  });

  it("logs the real outcome and flips status only on confirmed sync", async () => {
    process.env.HUBSPOT_PAT = "pat-test";
    fetchMock
      .mockResolvedValueOnce(new Response("not found", { status: 404 }))
      .mockResolvedValueOnce(okJson({ id: "701550002" }, 201));

    const out = await syncContactSubmission({
      id: "b7e6a0d2-2222-4222-8222-222222222222",
      email: "lead@example.com",
      source: "website",
    });

    expect(out.outcome).toBe("synced");
    // ledger row written with the real payload
    const ledgerRow = insertValues.mock.calls[0][0];
    expect(ledgerRow.outcome).toBe("synced");
    expect(ledgerRow.hubspotContactId).toBe("701550002");
    expect(JSON.parse(ledgerRow.propertiesPayload).email).toBe("lead@example.com");
    // submission flipped
    expect(updateSet).toHaveBeenCalledWith(
      expect.objectContaining({ status: "synced" })
    );
  });

  it("logs failures honestly and never flips status on error", async () => {
    process.env.HUBSPOT_PAT = "pat-test";
    fetchMock.mockRejectedValue(new Error("ECONNREFUSED"));

    const out = await syncContactSubmission({
      id: "b7e6a0d2-3333-4333-8333-333333333333",
      email: "lead@example.com",
    });

    expect(out.outcome).toBe("error");
    expect(out.errorMessage).toContain("ECONNREFUSED");
    const ledgerRow = insertValues.mock.calls[0][0];
    expect(ledgerRow.outcome).toBe("error");
    expect(ledgerRow.errorMessage).toContain("ECONNREFUSED");
    expect(updateSet).not.toHaveBeenCalled();
  });

  it("logs skipped_no_token attempts too (no silent sync pretending)", async () => {
    const out = await syncContactSubmission({
      id: "b7e6a0d2-4444-4444-8444-444444444444",
      email: "lead@example.com",
    });
    expect(out.outcome).toBe("skipped_no_token");
    expect(insertValues).toHaveBeenCalled();
    const ledgerRow = insertValues.mock.calls[0][0];
    expect(ledgerRow.outcome).toBe("skipped_no_token");
    expect(updateSet).not.toHaveBeenCalled();
  });
});

describe("portal setup contract", () => {
  it("exposes custom property definitions for portal configuration", () => {
    const custom = HUBSPOT_CONTACT_PROPERTIES.filter((p) => p.custom);
    const mvpNames = HUBSPOT_CONTACT_PROPERTIES.filter((p) => p.mvp).map(
      (p) => p.name
    );
    expect(custom.length).toBeGreaterThanOrEqual(20);
    // Blueprint MVP essentials present (handoff_path is deliberately Phase 2:
    // routing is applied once qualification lands, not in Phase 1 handoff)
    for (const name of [
      "lead_source_system",
      "agentlab_source_channel",
      "agentlab_lead_id",
      "agentlab_sync_status",
      "agentlab_last_sync_at",
      "agentlab_intent_level",
      "agentlab_booking_status",
      "agentlab_intake_summary",
      "lifecyclestage",
    ]) {
      expect(mvpNames).toContain(name);
    }
    expect(mvpNames).not.toContain("agentlab_handoff_path");
  });
});
