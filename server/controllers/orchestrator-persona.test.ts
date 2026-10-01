import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "./orchestrator";
import { withGoogleModelChainLeading, GOOGLE_MODEL_CHAIN } from "../_core/google-ai";

describe("operator persona wiring (CC-2026-10-01-009)", () => {
  it("uses the stored orchestrator prompt as the lead when present", () => {
    const prompt = buildSystemPrompt(
      ["ALL"],
      undefined,
      { customPrompt: "You are Robert's lieuten ant; speak plainly.", name: "Bosun" }
    );
    expect(prompt.startsWith("You are Robert's lieuten ant; speak plainly.")).toBe(true);
    expect(prompt).toContain('"Bosun"');
  });

  it("falls back to the built-in lead when no persona is stored", () => {
    const prompt = buildSystemPrompt(["ALL"], undefined, {});
    expect(prompt).toContain("Ops Agent & Master Orchestrator for AgentLab");
  });

  it("omits the name clause when no name is stored", () => {
    const prompt = buildSystemPrompt(["ALL"], undefined, { customPrompt: null, name: null });
    expect(prompt).not.toContain("operator-assigned name");
  });

  it("no longer carries the fabricated Engine v2.4 string in the base prompt", () => {
    const withPersona = buildSystemPrompt(["ALL"], undefined, {
      customPrompt: "Be terse.",
      name: "X",
    });
    const withoutPersona = buildSystemPrompt(["ALL"], undefined, {});
    for (const p of [withPersona, withoutPersona]) {
      expect(p).not.toContain("v2.4");
      expect(p).not.toContain("powered exclusively");
    }
  });
});

describe("operator-preferred model chain (CC-2026-10-01-009)", () => {
  it("tries the preferred model first when it is in the chain", async () => {
    const order: string[] = [];
    const result = await withGoogleModelChainLeading(
      async (model) => {
        order.push(model);
        if (model !== GOOGLE_MODEL_CHAIN[1]) throw new Error("fail on purpose");
        return "ok";
      },
      GOOGLE_MODEL_CHAIN[1]
    );
    expect(order[0]).toBe(GOOGLE_MODEL_CHAIN[1]);
    expect(result.model).toBe(GOOGLE_MODEL_CHAIN[1]);
  });

  it("falls back to the full chain without duplicates when the preferred model fails", async () => {
    const order: string[] = [];
    const result = await withGoogleModelChainLeading(
      async (model) => {
        order.push(model);
        if (model === "gemini-flash-latest") throw new Error("dead");
        return "ok";
      },
      "gemini-flash-latest"
    );
    expect(order[0]).toBe("gemini-flash-latest");
    expect(new Set(order).size).toBe(order.length);
    expect(result.value).toBe("ok");
  });

  it("behaves as the plain chain when no preference is given", async () => {
    const order: string[] = [];
    const result = await withGoogleModelChainLeading(async (model) => {
      order.push(model);
      return model;
    });
    // The loop returns on the FIRST success, so a healthy fn tries exactly one model.
    expect(order).toEqual([GOOGLE_MODEL_CHAIN[0]]);
    expect(result.model).toBe(GOOGLE_MODEL_CHAIN[0]);
  });

  it("ignores a preferred id that is not in the chain (invalidated at call site, defensive here)", async () => {
    const order: string[] = [];
    const result = await withGoogleModelChainLeading(
      async (model) => {
        order.push(model);
        return model;
      },
      "gemini-2.5-flash" as any
    );
    expect(order).toEqual([GOOGLE_MODEL_CHAIN[0]]);
    expect(result.model).toBe(GOOGLE_MODEL_CHAIN[0]);
  });
});
