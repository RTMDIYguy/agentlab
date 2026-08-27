import { generateText, tool } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { AgentMailClient } from "../tools/agentmail";
import fs from "fs";
import path from "path";

// We will create the google instance dynamically inside the runner
// so that process.env is read at execution time.
// const google = createGoogleGenerativeAI();

export interface AgentRunnerResult {
  outputPayload: any;
  tokensPrompt: number;
  tokensCompletion: number;
  tokensTotal: number;
  cost: number;
  latencyMs: number;
}

function isPathAllowed(filePath: string, unlockedDepartments: string[]): boolean {
  if (unlockedDepartments.includes("ALL")) return true;
  
  // Normalize paths for cross-platform checking
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  // Enforce the paywall if path includes the workflows directory
  const workflowsMatch = normalizedPath.match(/\/workflows\/([a-z]{3})-[^\/]+\/?/i);
  if (workflowsMatch) {
    const deptCode = workflowsMatch[1].toLowerCase();
    if (!unlockedDepartments.includes(deptCode)) {
      return false; // Paywall block
    }
  }
  return true;
}

/**
 * Runs a single agent step by combining the system prompt, action prompt,
 * and context, then calling Gemini 1.5 Pro.
 */
export async function runAgentStep(
  actionPrompt: string,
  systemPrompt: string | undefined | null,
  inputContext: Record<string, any> = {},
  workspaceId: string,
  unlockedDepartments: string[]
): Promise<AgentRunnerResult> {
  const startTime = Date.now();

  let fullPrompt = actionPrompt;
  if (Object.keys(inputContext).length > 0) {
    fullPrompt += `\n\n[Current Run Context]:\n${JSON.stringify(inputContext, null, 2)}`;
  }
  
  const finalSystemPrompt = `${systemPrompt || ""}\n\nYou have access to tools. If the step requires sending an email or updating a CRM, you MUST call the appropriate tool. For sending an email, use the sendAgentMail tool. If you need to read internal documentation, standard operating procedures (SOPs), blueprints, or workflow kits, you MUST use the searchLocalFiles tool to find the document path, and then the readLocalFile tool to read its contents.`;

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.warn("[Agent Runner] Missing GOOGLE_GENERATIVE_AI_API_KEY, returning mock response.");
    const mockOutput = { result: "Mocked success response because GOOGLE_GENERATIVE_AI_API_KEY is missing." };
    return {
      outputPayload: mockOutput,
      tokensPrompt: 0,
      tokensCompletion: 0,
      tokensTotal: 0,
      cost: 0,
      latencyMs: 100,
    };
  }

  console.log("[Agent Runner] Calling AI SDK generateText with model gemini-2.5-flash...");
  // Generate text using the AI SDK
  let text = "";
  let usage: any = {};
  const maxRetries = 3;
  let attempt = 0;
  let success = false;

  while (attempt < maxRetries && !success) {
    try {
    const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
    const response = await generateText({
      model: google("gemini-2.5-flash") as any,
      system: finalSystemPrompt,
      prompt: fullPrompt,
      maxSteps: 5,
      tools: {
        sendAgentMail: tool({
          description: "Send an email via the AgentMail relay.",
          parameters: z.object({
            to: z.string(),
            subject: z.string(),
            body: z.string(),
          }),
          execute: async ({ to, subject, body }: { to: string; subject: string; body: string; }) => {
            console.log("[TOOL EXECUTED] Sending email to:", to);
            try {
              const mailClient = new AgentMailClient();
              const result = await mailClient.sendEmail(
                "urcagentcomms@agentmail.to",
                to,
                subject,
                body
              );
              if (result.success) {
                return `Email successfully sent. Message ID: ${result.messageId}`;
              } else {
                return `Failed to send email. Error: ${result.error || result.reason}`;
              }
            } catch (e: any) {
              return `Failed to send email. Exception: ${e.message}`;
            }
          },
        }),
        searchLocalFiles: tool({
          description: "Search the local repository for files matching a keyword. Use this to find the exact file path of SOPs, blueprints, or workflow kits.",
          parameters: z.object({
            keyword: z.string().describe("The keyword to search for in filenames (e.g., 'cul-03', 'workflow-registry')"),
          }),
          execute: async ({ keyword }: { keyword: string }) => {
            console.log("[TOOL EXECUTED] Searching local files for:", keyword);
            try {
              // Extremely simple recursive search in current directory (Cloud Run repo root)
              const results: string[] = [];
              const searchDir = (dir: string) => {
                const files = fs.readdirSync(dir);
                for (const file of files) {
                  // Skip node_modules and .git
                  if (file === "node_modules" || file === ".git" || file === "dist") continue;
                  
                  const fullPath = path.join(dir, file);
                  const stat = fs.statSync(fullPath);
                  
                  if (stat.isDirectory()) {
                    searchDir(fullPath);
                  } else if (file.toLowerCase().includes(keyword.toLowerCase())) {
                    if (isPathAllowed(fullPath, unlockedDepartments)) {
                      results.push(fullPath);
                    }
                  }
                }
              };
              searchDir(process.cwd());
              
              if (results.length === 0) {
                return `No files found matching keyword: ${keyword}`;
              }
              return `Found ${results.length} files matching '${keyword}':\n${results.join("\n")}`;
            } catch (e: any) {
              return `Search failed: ${e.message}`;
            }
          },
        }),
        readLocalFile: tool({
          description: "Read the text contents of a local file in the repository.",
          parameters: z.object({
            filePath: z.string().describe("The absolute or relative path to the file to read, as returned by searchLocalFiles."),
          }),
          execute: async ({ filePath }: { filePath: string }) => {
            console.log("[TOOL EXECUTED] Reading local file:", filePath);
            try {
              const fullPath = path.resolve(process.cwd(), filePath);
              if (!fs.existsSync(fullPath)) {
                return `File not found at path: ${fullPath}`;
              }
              if (!isPathAllowed(fullPath, unlockedDepartments)) {
                return `UNAUTHORIZED: You do not have the required Playbook installed to read this file. Please visit the Marketplace to unlock it.`;
              }
              const contents = fs.readFileSync(fullPath, "utf-8");
              // Truncate if insanely large to prevent breaking the prompt limit, but typically MD files are fine
              if (contents.length > 50000) {
                return contents.substring(0, 50000) + "\n\n...[FILE TRUNCATED DUE TO SIZE]...";
              }
              return contents;
            } catch (e: any) {
              return `Failed to read file: ${e.message}`;
            }
          }
        }),
      },
    });
    text = response.text;
    usage = response.usage;
    console.log("[Agent Runner] AI SDK generateText succeeded.");
    success = true;
  } catch (sdkError: any) {
    attempt++;
    console.error(`[Agent Runner] AI SDK generateText threw an error (Attempt ${attempt}/${maxRetries}):`, sdkError);
    if (attempt >= maxRetries) {
      if (sdkError.stack) {
        console.error("[Agent Runner] SDK Error Stack:", sdkError.stack);
      }
      throw sdkError; // Re-throw to be caught by queue-processor
    }
    // Exponential backoff
    await new Promise(res => setTimeout(res, Math.pow(2, attempt) * 1000));
  }
  }

  const latencyMs = Date.now() - startTime;

  const usageAny = usage as any;
  const tokensPrompt = usageAny?.promptTokens || 0;
  const tokensCompletion = usageAny?.completionTokens || 0;
  const tokensTotal = usageAny?.totalTokens || 0;

  // Example cost calculation for gemini-2.5-flash ($1.25/1M input, $5.00/1M output)
  const cost =
    (tokensPrompt / 1_000_000) * 1.25 + (tokensCompletion / 1_000_000) * 5.0;

  let outputPayload;
  try {
    // Attempt to parse JSON if the model happens to return it
    outputPayload = JSON.parse(text);
  } catch (e) {
    // Otherwise wrap it in a result object
    outputPayload = { result: text };
  }

  return {
    outputPayload,
    tokensPrompt,
    tokensCompletion,
    tokensTotal,
    cost,
    latencyMs,
  };
}
// Cache bust API key: 20260825153256
// Cache bust API key: 2026-08-25T15:52:07
// Cache bust API key: 2026-08-25T16:11:51
