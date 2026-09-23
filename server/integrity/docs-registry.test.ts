/**
 * Docs-registry honesty tests (conversion plan §5 truth pass).
 *
 * The Documentation pages describe the OS to prospects and operators; these
 * tests pin that the registry's claims stay reconciled with shipped status:
 * every entry declares a status, roadmap entries explain what is real today,
 * known vapor phrases stay out, and documented routes actually exist.
 */

import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { DOCS_REGISTRY, type DocPageEntry } from "../../client/src/data/docsRegistry";

const ROOT = path.resolve(__dirname, "..", "..");
const CLIENT_PAGES = path.join(ROOT, "client", "src", "pages");

/** Route aliases that intentionally map to an existing component. */
const ROUTE_ALIASES: Record<string, string> = {
  "/dashboard/settings": "/settings",
  "/meeting": "/meeting",
  "/messages": "/messages",
};

function routeExists(route: string): boolean {
  const appSource = readFileSync(path.join(ROOT, "client", "src", "App.tsx"), "utf8")
    // JSX may brace-wrap the prop: path={"/x"} — normalize both forms.
    .replace(/\{\"/g, '"')
    .replace(/\"\}/g, '"');
  const candidates = [route, ROUTE_ALIASES[route] ?? route];
  return candidates.some((r) => appSource.includes(`path="${r}"`));
}

describe("docs registry — truth-pass contract", () => {
  it("has a status on every entry", () => {
    for (const doc of DOCS_REGISTRY) {
      expect(["live", "partial", "roadmap"]).toContain(doc.status);
    }
  });

  it("roadmap entries must explain what is real today", () => {
    for (const doc of DOCS_REGISTRY) {
      if (doc.status === "roadmap") {
        expect(
          doc.availabilityNote?.trim().length ?? 0,
          `${doc.slug} is status "roadmap" but has no availabilityNote`
        ).toBeGreaterThan(20);
      }
    }
  });

  it("partial entries carry an availability note too", () => {
    for (const doc of DOCS_REGISTRY) {
      if (doc.status === "partial") {
        expect(doc.availabilityNote?.trim().length ?? 0).toBeGreaterThan(20);
      }
    }
  });

  it("every targetRoute exists in the router", () => {
    for (const doc of DOCS_REGISTRY) {
      expect(
        routeExists(doc.targetRoute),
        `${doc.slug} documents targetRoute ${doc.targetRoute} which is not routed`
      ).toBe(true);
    }
  });

  it("billing's monitoring claims stay roadmap-quarantined", () => {
    const billing = DOCS_REGISTRY.find((d) => d.slug === "billing");
    expect(billing?.status).toBe("roadmap");
    expect(billing?.availabilityNote).toMatch(/not built yet/i);
  });

  it("no undocumented artifact-hash or agent-uptime claims return", () => {
    const source = path.join(ROOT, "client", "src", "data", "docsRegistry.ts");
    const text = readFileSync(source, "utf8");
    expect(text).not.toMatch(/SHA-256 artifact hashes/);
    expect(text).not.toMatch(/verify its tamper-proof hash/);
    expect(text).not.toMatch(/current task, uptime/);
    expect(text).not.toMatch(/0 Drift/);
  });

  it("every documented page component exists on disk", () => {
    const expectedPages: Record<string, string> = {
      "command-center": "CommandCenter.tsx",
      agents: "Agents.tsx",
      auditing: "Auditing.tsx",
      "founder-signal-system": "FounderSignalSystem.tsx",
      settings: "Settings.tsx",
      marketplace: "Marketplace.tsx",
      "blog-manager": "BlogManager.tsx",
      billing: "Settings.tsx",
      "meeting-room": "MeetingRoom.tsx",
      "client-messenger": "ClientMessenger.tsx",
      "screen-recorder": "ScreenRecorder.tsx",
      "icp-generator": "IcpGenerator.tsx",
      "assessment-generator": "AssessmentQuestionGenerator.tsx",
    };
    for (const doc of DOCS_REGISTRY as Array<DocPageEntry & { _page?: string }>) {
      const page = expectedPages[doc.slug];
      expect(page, `${doc.slug} has no mapped page file`).toBeTruthy();
      expect(existsSync(path.join(CLIENT_PAGES, page!))).toBe(true);
    }
  });
});
