/**
 * Pause gate regression tests (CC-2026-10-02-011, disposition 3-A):
 * `agents.status` had zero readers — "Pause Node" on the Agents page was
 * display-only and a paused agent kept executing its steps. The queue
 * processor now refuses a paused agent's step loudly; the step catch turns
 * this message into the step/run failure reason and the honest audit row.
 */

import { describe, expect, it } from "vitest";
import { assertAgentRunnable } from "./queue-processor";

describe("assertAgentRunnable — paused agents refuse their steps", () => {
  it("throws for a paused agent, naming the agent and the remedy", () => {
    expect(() =>
      assertAgentRunnable({ name: "Client Health Monitor", status: "paused" })
    ).toThrow(/Agent "Client Health Monitor" is paused by operator/);
    expect(() =>
      assertAgentRunnable({ name: "Node", status: "paused" })
    ).toThrow(/activate the node on the Agents page/);
  });

  it("stays silent for active and idle agents (normal dispatch)", () => {
    expect(() =>
      assertAgentRunnable({ name: "a", status: "active" })
    ).not.toThrow();
    expect(() =>
      assertAgentRunnable({ name: "b", status: "idle" })
    ).not.toThrow();
    expect(() =>
      assertAgentRunnable({ name: "c", status: "error" })
    ).not.toThrow();
  });

  it("stays silent when status is missing (legacy rows)", () => {
    expect(() => assertAgentRunnable({ name: "d" })).not.toThrow();
    expect(() =>
      assertAgentRunnable({ name: "e", status: null })
    ).not.toThrow();
  });
});
