import { describe, it, expect } from "vitest";
import { CONNECTORS, listConnectors, validatePayloadForConnector } from "./connectors";

describe("mcp_tool_call connector registration (CC-2026-10-01-007)", () => {
  it("is registered alongside the HubSpot connectors", () => {
    expect(CONNECTORS.mcp_tool_call).toBeDefined();
    expect(CONNECTORS.mcp_tool_call.requiredKeys).toEqual(["server", "tool", "arguments"]);
    expect(CONNECTORS.mcp_tool_call.optionalKeys).toEqual([]);
  });

  it("appears in the drafter-facing connector list", () => {
    const listed = listConnectors().map((c) => c.name);
    expect(listed).toContain("mcp_tool_call");
    expect(listed).toContain("hubspot_contact_upsert");
  });

  it("validates payloads strictly: requires server, tool, object arguments", () => {
    expect(validatePayloadForConnector("mcp_tool_call", {})).toMatchObject({ ok: false });
    expect(
      validatePayloadForConnector("mcp_tool_call", { server: "Upwork MCP", tool: "search" })
    ).toMatchObject({ ok: false });
    expect(
      validatePayloadForConnector("mcp_tool_call", {
        server: "Upwork MCP",
        tool: "search_jobs",
        arguments: { query: "react" },
      })
    ).toMatchObject({ ok: true });
    // Unknown keys are rejected loudly (no optional keys on this connector).
    expect(
      validatePayloadForConnector("mcp_tool_call", {
        server: "Upwork MCP",
        tool: "search_jobs",
        arguments: {},
        smuggled: "value",
      })
    ).toMatchObject({ ok: false });
  });

  it("rejects unknown connectors and unknown connector names in general", () => {
    expect(validatePayloadForConnector("nope_nope", {})).toMatchObject({ ok: false });
  });
});
