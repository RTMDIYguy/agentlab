import { describe, it, expect, vi } from "vitest";

vi.mock("../db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

import { detectAgentRefusal, extractArtifactsFromOutput } from "./agent-runner";

describe("AgentLab Phase 1 Verification - Refusal & Evidence Gate", () => {
  it("correctly identifies agent capability refusals and excuses", () => {
    const refusal1 = "I apologize, but I do not have access to your local files to perform this operation.";
    const refusal2 = "As an AI, I cannot connect to external databases or live HubSpot without credentials.";
    const refusal3 = "Unable to retrieve files from the filesystem because my current capabilities do not include that.";
    const validOutput = "I have extracted 5 deals from HubSpot CRM and drafted the syndication schedule.";

    expect(detectAgentRefusal(refusal1).isRefusal).toBe(true);
    expect(detectAgentRefusal(refusal2).isRefusal).toBe(true);
    expect(detectAgentRefusal(refusal3).isRefusal).toBe(true);
    expect(detectAgentRefusal(validOutput).isRefusal).toBe(false);
  });

  it("extracts structured social posts and scheduled drafts into tangible artifacts", () => {
    const payloadWithPosts = {
      posts: [
        {
          title: "Startup Operational Excellence Launch",
          content: "Announcing the release of the new operating framework. #agentlab #AIVoice",
          platform: "linkedin",
          scheduledFor: "2026-09-10T14:00:00Z",
        },
        {
          title: "Founder Signal System Sprint Analysis",
          content: "Key findings from this week's sprint teardowns.",
          platform: "linkedin",
          scheduledFor: "2026-09-11T14:00:00Z",
        },
      ],
    };

    const artifacts = extractArtifactsFromOutput("", payloadWithPosts, []);
    expect(artifacts.length).toBe(2);
    expect(artifacts[0].title).toBe("Startup Operational Excellence Launch");
    expect(artifacts[0].targetPlatform).toBe("linkedin");
    expect(artifacts[1].scheduledFor).toBe("2026-09-11T14:00:00Z");
  });

  it("extracts markdown formatted posts from raw model text", () => {
    const rawMarkdownText = `
### Post 1: Bootstrapper Guide Release
Here is the first LinkedIn post draft detailing the launch.
**Hashtags**: #agentlab #Bootstrapper

### Post 2: AI Native Agency Architecture
Here is the second post highlighting the new DAG execution engine.
    `;

    const artifacts = extractArtifactsFromOutput(rawMarkdownText, { result: rawMarkdownText }, []);
    expect(artifacts.length).toBe(2);
    expect(artifacts[0].title).toContain("Post 1");
    expect(artifacts[1].title).toContain("Post 2");
  });
});
