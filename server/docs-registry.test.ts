/**
 * CC-2026-10-02-018/019 — Owner's Manual registry consistency.
 *
 * The /docs directory is 100% static content, so nothing at runtime checks
 * that what it says still exists. These tests pin the mechanical claims:
 *
 *  - every architecture filePath points at a file on disk
 *  - every targetRoute resolves to a route declared in App.tsx
 *  - roadmap/partial entries carry the honesty availabilityNote (CC-020)
 *  - slugs are unique (the /docs/:slug lookup is a find-first)
 *  - the blueprint keeps its global ILLUSTRATIVE tag and the fabricated
 *    agentlab.urc.internal host stays gone (CC-018 finding 6)
 */

import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { DOCS_REGISTRY } from "../client/src/data/docsRegistry";

const root = process.cwd();

function appRouteTable(): Set<string> {
  const src = readFileSync(resolve(root, "client/src/App.tsx"), "utf8");
  const routes = new Set<string>();
  // Matches both `<Route path="/x"` and `<Route path={"/x"}` forms.
  for (const m of src.matchAll(/path=\{?"(\/[^"}]*)"?/g)) {
    routes.add(m[1]);
  }
  return routes;
}

describe("docsRegistry — mechanical claims", () => {
  it("every architecture filePath exists in the repo", () => {
    const missing: string[] = [];
    for (const doc of DOCS_REGISTRY) {
      for (const item of doc.architecture) {
        if (!existsSync(resolve(root, item.filePath))) {
          missing.push(`${doc.slug}: ${item.filePath}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it("every targetRoute exists in the App.tsx route table", () => {
    const routes = appRouteTable();
    const unresolved = DOCS_REGISTRY.filter(d => !routes.has(d.targetRoute)).map(
      d => `${d.slug} → ${d.targetRoute}`
    );
    expect(unresolved).toEqual([]);
    // Sanity: the parser itself found routes.
    expect(routes.size).toBeGreaterThan(30);
  });

  it("roadmap and partial entries carry an availabilityNote", () => {
    const withoutNote = DOCS_REGISTRY.filter(
      d => d.status !== "live" && !d.availabilityNote?.trim()
    ).map(d => `${d.slug} (${d.status})`);
    expect(withoutNote).toEqual([]);
  });

  it("slugs are unique and non-empty", () => {
    const slugs = DOCS_REGISTRY.map(d => d.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.every(s => s.trim().length > 0)).toBe(true);
  });

  it("status values stay within the honest enum", () => {
    const allowed = new Set(["live", "partial", "roadmap"]);
    for (const doc of DOCS_REGISTRY) {
      expect(allowed.has(doc.status), `${doc.slug}: ${doc.status}`).toBe(true);
    }
  });
});

describe("blueprint honesty markers (CC-018 finding 6)", () => {
  const src = readFileSync(
    resolve(root, "client/src/components/docs/DocVisualBlueprint.tsx"),
    "utf8"
  );

  it("keeps the global UI BLUEPRINT — ILLUSTRATIVE tag on the browser bar", () => {
    expect(src).toContain("UI BLUEPRINT — ILLUSTRATIVE");
  });

  it("does not reintroduce the fabricated agentlab.urc.internal host", () => {
    expect(src).not.toContain("agentlab.urc.internal");
  });

  it("does not re-claim an 81-SOP pass count or VERIFIED hash rows", () => {
    expect(src).not.toContain("81 / 81");
    expect(src).not.toContain("(VERIFIED)");
  });
});
