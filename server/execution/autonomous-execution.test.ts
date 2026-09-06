import { describe, it, expect, vi } from "vitest";

vi.mock("../db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

import { detectAgentRefusal, extractArtifactsFromOutput } from "./agent-runner";

describe("AgentLab Autonomous Execution & Tool Gate", () => {
  it("detects passive conversational acknowledgments and capability refusals", () => {
    const passive1 = "Understood. I've noted that an AgentLab 'Digital Archivist' agent will manage file organization. I will await further instructions.";
    const passive2 = "Thank you for providing this information about the Market Analyst Agent's functions and tools.";
    const passive3 = "I understand the N8N workflow you've described. While I can't directly interact with or execute N8N workflows or Playwright scripts, I can help with HubSpot.";
    const passive4 = "I understand that an AgentLab agent would investigate delivery mechanisms... However, as previously mentioned, my current tools do not allow me to directly access AgentLab's internal storage, execution logs, or completion caches...";
    const validExecution = "I have audited the file inventory across all 7 departments and categorized 142 documents into canonical folders.";

    expect(detectAgentRefusal(passive1).isRefusal).toBe(true);
    expect(detectAgentRefusal(passive2).isRefusal).toBe(true);
    expect(detectAgentRefusal(passive3).isRefusal).toBe(true);
    expect(detectAgentRefusal(passive4).isRefusal).toBe(true);
    expect(detectAgentRefusal(validExecution).isRefusal).toBe(false);
  });

  it("extracts folder hierarchy and categorization plans into tangible artifacts", () => {
    const payload = {
      folderHierarchy: "# 7 Department Folder Blueprint\n- MKT-Marketing\n- SAL-Sales\n- OPS-Operations\n- FIN-Finance\n- FUL-Fulfillment\n- CUL-Culture\n- AFT-Aftercare",
      categorizedFiles: 142
    };

    const artifacts = extractArtifactsFromOutput("", payload, []);
    expect(artifacts.length).toBe(1);
    expect(artifacts[0].title).toBe("Information Architecture & Folder Hierarchy Scheme");
    expect(artifacts[0].content).toContain("7 Department Folder Blueprint");
  });

  it("extracts visual specifications and generative prompts into artifact deliverables", () => {
    const payload = {
      documents: [
        {
          title: "Visual Spec: Hamarashops MedLM Launch",
          artifactType: "document",
          content: "# Visual Specification: Hamarashops MedLM Launch\n**Target Platform**: LinkedIn\n**Aspect Ratio**: 16:9\n**Prompt Template**:\nRealistic 3D isometric laboratory workstation with holographic health analytics charts.",
          summary: "Visual asset specification and generative prompt for linkedin (16:9)."
        }
      ]
    };

    const artifacts = extractArtifactsFromOutput("", payload, []);
    expect(artifacts.length).toBe(1);
    expect(artifacts[0].title).toBe("Visual Spec: Hamarashops MedLM Launch");
    expect(artifacts[0].content).toContain("Prompt Template");
  });
});
