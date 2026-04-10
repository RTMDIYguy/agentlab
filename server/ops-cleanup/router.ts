import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";

const DEFAULT_BUSINESS_ROOT =
  "C:\\Users\\thebo\\OneDrive - Uncle Robert Consulting LLC\\Working Docs\\AI Native Agency Deepened";
const DEFAULT_RECOVERY_DIRS = [
  "D:\\Business Docs Recovered",
  "D:\\Misc Recovered",
  "D:\\Recover",
];

type ContextDoc = {
  label: string;
  filePath: string;
  content: string;
};

async function safeReadTextFile(label: string, filePath: string): Promise<ContextDoc | null> {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return {
      label,
      filePath,
      content: content.slice(0, 12000),
    };
  } catch {
    return null;
  }
}

async function safeListDirectory(targetPath: string) {
  try {
    const entries = await fs.readdir(targetPath, { withFileTypes: true });
    return entries
      .slice(0, 60)
      .map(entry => ({
        name: entry.name,
        type: entry.isDirectory() ? "dir" : "file",
      }));
  } catch {
    return [];
  }
}

function getRepoDocsRoot() {
  return path.join(process.cwd(), "docs", "operations");
}

async function loadContextDocs() {
  const repoDocsRoot = getRepoDocsRoot();
  const businessRoot = process.env.OPS_AGENT_BUSINESS_ROOT || DEFAULT_BUSINESS_ROOT;

  const docs = await Promise.all([
    safeReadTextFile("Repo Agent Guide", path.join(process.cwd(), "AGENTS.md")),
    safeReadTextFile(
      "URC Agent Execution Checklist",
      path.join(repoDocsRoot, "urc-agent-execution-checklist.md"),
    ),
    safeReadTextFile(
      "URC V1 Operating Architecture",
      path.join(repoDocsRoot, "urc-v1-operating-architecture.md"),
    ),
    safeReadTextFile(
      "URC 90-Day Implementation Plan",
      path.join(repoDocsRoot, "urc-90-day-implementation-plan.md"),
    ),
    safeReadTextFile(
      "Founder Intake Agent Notes",
      path.join(repoDocsRoot, "founder-intake-agent.md"),
    ),
    safeReadTextFile(
      "Business Agent Handoff Prompt",
      path.join(businessRoot, "Agent Handoff Prompt.md"),
    ),
    safeReadTextFile(
      "Business Consolidation Blueprint",
      path.join(businessRoot, "Agent Consolidation Blueprint.md"),
    ),
    safeReadTextFile(
      "Business Agent Task Queue",
      path.join(businessRoot, "Agent Task Queue.md"),
    ),
  ]);

  return docs.filter(Boolean) as ContextDoc[];
}

async function loadInventories() {
  const businessRoot = process.env.OPS_AGENT_BUSINESS_ROOT || DEFAULT_BUSINESS_ROOT;
  const recoveryRoots = (process.env.OPS_AGENT_RECOVERY_ROOTS || "")
    .split(";")
    .map(value => value.trim())
    .filter(Boolean);

  const targets = recoveryRoots.length > 0 ? recoveryRoots : DEFAULT_RECOVERY_DIRS;

  const [businessWorkspace, ...recoveryInventories] = await Promise.all([
    safeListDirectory(businessRoot),
    ...targets.map(target => safeListDirectory(target)),
  ]);

  return {
    businessWorkspace,
    recoveryInventories: targets.map((target, index) => ({
      path: target,
      entries: recoveryInventories[index] ?? [],
    })),
  };
}

function buildFallbackReply(task: string, docs: ContextDoc[], inventory: Awaited<ReturnType<typeof loadInventories>>) {
  const recoverySummary = inventory.recoveryInventories
    .map(item => `- ${item.path}: ${item.entries.length} top-level entries sampled`)
    .join("\n");

  const docSummary = docs.map(doc => `- ${doc.label}`).join("\n");

  return [
    "Fallback Ops Cleanup Guidance",
    "",
    `Task: ${task}`,
    "",
    "Available context docs:",
    docSummary || "- No context docs found",
    "",
    "Sampled recovery inventory:",
    recoverySummary || "- No recovery folders available",
    "",
    "Recommended next actions:",
    "1. Confirm the active source-of-truth files for Sales, Marketing, Operations, Finance, and the business architecture docs.",
    "2. Build a keep/archive/review triage list for the recovered material before moving anything into active Working Docs.",
    "3. Create one executive cleanup board with columns for source-of-truth, duplicate, archive, merge-review, and next action.",
    "4. Use the book and Bootstrapper Capital docs to separate lead-generation assets from internal operating documents.",
    "5. Only after triage, begin controlled merges into the active business structure.",
    "",
    "If you add OPENAI_API_KEY, this agent will return more tailored cleanup plans and implementation guidance.",
  ].join("\n");
}

async function callOpenAI(task: string, docs: ContextDoc[], inventory: Awaited<ReturnType<typeof loadInventories>>) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_OPS_AGENT_MODEL || "gpt-5-mini";
  const contextBlock = docs
    .map(
      doc =>
        `## ${doc.label}\nPATH: ${doc.filePath}\n${doc.content}`,
    )
    .join("\n\n");

  const inventoryBlock = [
    "## Business Workspace Top-Level Sample",
    inventory.businessWorkspace.map(entry => `- [${entry.type}] ${entry.name}`).join("\n") || "- None",
    "",
    ...inventory.recoveryInventories.flatMap(item => [
      `## Recovery Sample: ${item.path}`,
      item.entries.map(entry => `- [${entry.type}] ${entry.name}`).join("\n") || "- None",
      "",
    ]),
  ].join("\n");

  const prompt = `
You are the internal Ops Cleanup Agent for Uncle Robert Consulting.

Your job:
- help clean up and consolidate the business operating system
- identify source-of-truth files
- help triage recovered business files
- recommend concrete implementation steps
- avoid destructive actions and avoid reinventing the system

Rules:
- be concise and practical
- produce action-oriented markdown
- favor keep/archive/review guidance
- do not suggest deleting files without review
- remember that URC is the main business, Bootstrapper Capital is the funnel, Tactix is the fulfillment arm, and Ownable OS is the destination system

User task:
${task}

Context docs:
${contextBlock}

Inventory:
${inventoryBlock}

Return:
- a short diagnosis
- a recommended action plan
- a keep/archive/review split when relevant
- the top 3 next actions
`.trim();

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: prompt,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[Ops Cleanup Agent] OpenAI error:", response.status, errorText);
    return null;
  }

  const payload = await response.json() as any;
  const outputText =
    typeof payload.output_text === "string"
      ? payload.output_text
      : Array.isArray(payload.output)
        ? payload.output
            .flatMap((item: any) => item.content || [])
            .map((item: any) => item.text || "")
            .join("")
        : "";

  return outputText || null;
}

export const opsCleanupRouter = router({
  analyze: protectedProcedure
    .input(
      z.object({
        task: z.string().min(10).max(5000),
      }),
    )
    .mutation(async ({ input }) => {
      const [docs, inventory] = await Promise.all([
        loadContextDocs(),
        loadInventories(),
      ]);

      const aiReply = await callOpenAI(input.task, docs, inventory);

      return {
        mode: aiReply ? "openai" : "fallback",
        reply: aiReply ?? buildFallbackReply(input.task, docs, inventory),
        contextFiles: docs.map(doc => ({
          label: doc.label,
          filePath: doc.filePath,
        })),
        inventory,
      };
    }),
});
