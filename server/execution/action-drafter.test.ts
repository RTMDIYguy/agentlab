/**
 * Action drafter tests: the draft contract between the agent runner and the
 * dispatch ledger must be strict — unknown connectors, missing titles, and
 * non-object payloads fail the step honestly instead of dispatching defaults.
 */

import { describe, expect, it, vi } from "vitest";

const runAgentStepMock = vi.fn();

vi.mock("./agent-runner", () => ({
  runAgentStep: (...args: unknown[]) => runAgentStepMock(...args),
}));

vi.mock("./connectors", () => ({
  CONNECTORS: {
    hubspot_contact_upsert: {
      name: "hubspot_contact_upsert",
      label: "HubSpot Contact Upsert",
      description: "test",
      requiredKeys: ["email"],
      optionalKeys: [] as string[],
      dispatch: vi.fn(),
    },
  },
}));

import {
  draftActionPayload,
  parseActionDraft,
  extractJsonObject,
} from "./action-drafter";

describe("parseActionDraft", () => {
  it("parses a valid draft", () => {
    const out = parseActionDraft(
      JSON.stringify({
        connector: "hubspot_contact_upsert",
        title: "Upsert Jane",
        payload: { email: "jane@example.com" },
      })
    );
    expect(out.ok).toBe(true);
    expect(out.connector).toBe("hubspot_contact_upsert");
    expect(out.title).toBe("Upsert Jane");
  });

  it("rejects unknown connectors", () => {
    const out = parseActionDraft(
      JSON.stringify({
        connector: "blast_email_blast",
        title: "Spam everyone",
        payload: {},
      })
    );
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error).toContain("connector");
  });

  it("rejects missing title", () => {
    const out = parseActionDraft(
      JSON.stringify({
        connector: "hubspot_contact_upsert",
        payload: { email: "a@b.com" },
      })
    );
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error).toContain("title");
  });

  it("rejects non-object payloads", () => {
    const out = parseActionDraft(
      JSON.stringify({
        connector: "hubspot_contact_upsert",
        title: "t",
        payload: [1, 2],
      })
    );
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error).toContain("payload");
  });

  it("rejects unparseable drafts", () => {
    expect(parseActionDraft("not json at all").ok).toBe(false);
  });
});

describe("extractJsonObject", () => {
  it("extracts the first balanced JSON object from mixed text", () => {
    const text =
      'Sure! Here is the draft:\n```json\n{"connector":"hubspot_contact_upsert","title":"T","payload":{"email":"a@b.com"}}\n```\nDone.';
    const extracted = extractJsonObject(text);
    expect(JSON.parse(extracted)).toEqual({
      connector: "hubspot_contact_upsert",
      title: "T",
      payload: { email: "a@b.com" },
    });
  });

  it("handles braces inside strings", () => {
    const text = `{"connector":"x","title":"has } brace","payload":{"a":1}} trailing`;
    const extracted = extractJsonObject(text);
    expect(JSON.parse(extracted).title).toBe("has } brace");
  });
});

describe("draftActionPayload (runner integration)", () => {
  it("returns the runner's structured draft field when present", async () => {
    runAgentStepMock.mockResolvedValueOnce({
      outputPayload: {
        draft: JSON.stringify({
          connector: "hubspot_contact_upsert",
          title: "Upsert",
          payload: { email: "a@b.com" },
        }),
      },
      hasRefusal: false,
    });

    const draft = await draftActionPayload("upsert the lead", {}, "ws-1");
    const parsed = parseActionDraft(draft);
    expect(parsed.ok).toBe(true);
    expect(runAgentStepMock).toHaveBeenCalledTimes(1);
  });

  it("throws on agent refusal instead of producing a draft", async () => {
    runAgentStepMock.mockResolvedValueOnce({
      outputPayload: { result: "cannot comply" },
      hasRefusal: true,
      refusalReason: "test refusal",
    });

    await expect(draftActionPayload("upsert", {}, "ws-1")).rejects.toThrow(
      /refused/
    );
  });
});
