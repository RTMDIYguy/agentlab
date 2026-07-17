import { afterEach, describe, expect, it, vi } from "vitest";
import { hubspotRouter } from "./router";

describe("hubspotRouter", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("treats duplicate contact creates as success without updating the existing contact", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("Conflict", {
        status: 409,
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const caller = hubspotRouter.createCaller({
      user: null,
      req: { headers: {} } as any,
      res: {} as any,
    });

    const result = await caller.createContact({
      email: "founder@example.com",
      firstname: "Changed",
      company: "Caller Supplied Company",
      source: "book-free-chapter",
    });

    expect(result).toEqual({ success: true, created: false });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.hubapi.com/crm/v3/objects/contacts",
      expect.objectContaining({
        method: "POST",
      })
    );
  });
});
