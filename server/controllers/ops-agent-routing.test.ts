import { describe, it, expect } from "vitest";
import { shouldProposeWorkflow } from "./orchestrator";
import { classifyStepType } from "./orchestrator-execute";

// CC-2026-09-25-011: mode-routing regression tests. The original keyword
// regex forced a structured DAG proposal on question forms like "run that by
// me again" — the founder asked a question and got a workflow card.

describe("shouldProposeWorkflow", () => {
  it("proposes for clear build requests", () => {
    expect(shouldProposeWorkflow("build me a lead outreach workflow")).toBe(true);
    expect(shouldProposeWorkflow("create a DAG for onboarding")).toBe(true);
    expect(shouldProposeWorkflow("synthesize a workflow for HubSpot sync")).toBe(true);
    expect(shouldProposeWorkflow("set up automated follow-ups")).toBe(true);
  });

  it("does NOT propose for question forms containing build verbs", () => {
    expect(shouldProposeWorkflow("run that by me again?")).toBe(false);
    expect(shouldProposeWorkflow("what runs do we have?")).toBe(false);
    expect(shouldProposeWorkflow("how do we execute onboarding today?")).toBe(false);
    expect(shouldProposeWorkflow("can you automate this?")).toBe(false);
    expect(shouldProposeWorkflow("is there a workflow for this?")).toBe(false);
    expect(shouldProposeWorkflow("what does the DAG cost to run?")).toBe(false);
  });

  it("does NOT propose for plain conversation with no build verbs", () => {
    expect(shouldProposeWorkflow("good morning")).toBe(false);
    expect(shouldProposeWorkflow("summarize yesterday's failures")).toBe(false);
    expect(shouldProposeWorkflow("")).toBe(false);
  });

  it("forceProposal wins over the interrogative guard", () => {
    expect(shouldProposeWorkflow("what workflows exist?", true)).toBe(true);
  });

  it("a leading imperative still proposes even with a trailing question mark", () => {
    // The imperative opener is unambiguous commissioning language.
    expect(shouldProposeWorkflow("build the onboarding DAG, ok?")).toBe(true);
  });
});

describe("classifyStepType", () => {
  it("maps the four pipeline types", () => {
    expect(classifyStepType("agent")).toBe("agent");
    expect(classifyStepType("guardrail")).toBe("guardrail");
    expect(classifyStepType("trigger")).toBe("trigger");
    expect(classifyStepType("destination")).toBe("destination");
  });

  it("maps the new action type (human-gated outbound)", () => {
    expect(classifyStepType("action")).toBe("action");
    expect(classifyStepType("ACTION")).toBe("action");
    expect(classifyStepType("human-gated action step")).toBe("action");
  });

  it("maps approval-flavored free text to guardrail", () => {
    expect(classifyStepType("human approval required")).toBe("guardrail");
    expect(classifyStepType("HITL review")).toBe("guardrail");
  });

  it("defaults unknown types to agent (the honest general case)", () => {
    expect(classifyStepType("mystery")).toBe("agent");
    expect(classifyStepType(undefined)).toBe("agent");
  });
});
