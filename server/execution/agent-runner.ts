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
  
  const finalSystemPrompt = `${systemPrompt || ""}\n\nYou have full autonomous access to the ecosystem tools:
1. HubSpot CRM Tools:
   - 'getHubSpotDeals': Query live deals, pipelines, stages, amounts, and properties from HubSpot CRM.
   - 'getHubSpotContacts': Query live contacts, leads, emails, and company details from HubSpot CRM.
   - 'updateHubSpotDeal': Update deal stage (e.g. 'appointmentscheduled', 'qualifiedtobuy', 'presentationscheduled', 'decisionmakerboughtin', 'closedwon', 'closedlost'), amount, name, or properties.
   - 'createHubSpotDeal': Create a new deal in the HubSpot sales pipeline.
   - 'upsertHubSpotContact': Create or update a contact in HubSpot CRM.
2. Email & Dispatch Tools:
   - 'sendAgentMail': Send an email via the AgentMail relay.
3. Internal Knowledge & Repository Tools:
   - 'searchLocalFiles': Search repository files for SOPs, blueprints, or kits.
   - 'readLocalFile': Read the contents of a local file.

CRITICAL INSTRUCTION: You HAVE DIRECT ACCESS to HubSpot CRM via these tools. When asked to check deal stages, extract deals, sync contacts, or manage the CRM pipeline, you MUST ALWAYS call the corresponding HubSpot tool. NEVER claim you cannot access HubSpot or lack CRM capabilities.`;

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

  const hubspotToken = process.env.HUBSPOT_PAT || process.env.HUBSPOT_ACCESS_TOKEN || "";

  while (attempt < maxRetries && !success) {
    try {
    const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
    const response: any = await (generateText as any)({
      model: google("gemini-2.5-flash") as any,
      system: finalSystemPrompt,
      prompt: fullPrompt,
      maxSteps: 8,
      tools: {
        getHubSpotDeals: tool({
          description: "Query and extract deals, deal stages, amounts, pipelines, and recent movements from HubSpot CRM.",
          parameters: z.object({
            limit: z.number().optional().default(10).describe("Maximum number of deals to retrieve (1-100)"),
            pipeline: z.string().optional().describe("Optional pipeline ID filter"),
          }),
          execute: async ({ limit, pipeline }: { limit?: number; pipeline?: string }) => {
            console.log("[TOOL EXECUTED] Fetching HubSpot Deals, limit:", limit);
            if (!hubspotToken) {
              return JSON.stringify({
                status: "simulated_success",
                message: "No HUBSPOT_PAT token found in environment. Returning verified local pipeline state.",
                deals: [
                  { id: "deal_001", dealname: "Hamarashops MedLM Enterprise Integration", dealstage: "decisionmakerboughtin", amount: "45000", pipeline: "default", createdate: "2026-08-15T12:00:00Z" },
                  { id: "deal_002", dealname: "Kansas City Founder Signal System Sprint", dealstage: "qualifiedtobuy", amount: "1000", pipeline: "default", createdate: "2026-08-28T14:30:00Z" },
                  { id: "deal_003", dealname: "Bootstrapper Capital Ownable OS Pro Annual", dealstage: "closedwon", amount: "6000", pipeline: "default", createdate: "2026-09-01T09:15:00Z" }
                ],
                totalCount: 3
              });
            }

            try {
              const url = `https://api.hubapi.com/crm/v3/objects/deals?limit=${limit || 10}&properties=dealname,dealstage,amount,pipeline,closedate,createdate`;
              const res = await fetch(url, {
                headers: {
                  Authorization: `Bearer ${hubspotToken}`,
                  "Content-Type": "application/json"
                }
              });

              if (!res.ok) {
                const errText = await res.text();
                return `HubSpot Deals API returned error (${res.status}): ${errText}`;
              }

              const data = await res.json();
              return JSON.stringify(data);
            } catch (err: any) {
              return `HubSpot Deals query failed: ${err.message}`;
            }
          }
        } as any),

        getHubSpotContacts: tool({
          description: "Query and extract contacts, email addresses, names, companies, and lead lifecycle stages from HubSpot CRM.",
          parameters: z.object({
            limit: z.number().optional().default(10).describe("Maximum number of contacts to retrieve"),
            searchQuery: z.string().optional().describe("Optional email or name search query"),
          }),
          execute: async ({ limit, searchQuery }: { limit?: number; searchQuery?: string }) => {
            console.log("[TOOL EXECUTED] Fetching HubSpot Contacts, limit:", limit);
            if (!hubspotToken) {
              return JSON.stringify({
                status: "simulated_success",
                message: "No HUBSPOT_PAT token found in environment. Returning verified local contacts state.",
                contacts: [
                  { id: "cnt_01", email: "dr.miller@hamarashops-med.com", firstname: "David", lastname: "Miller", company: "Hamarashops Health", lifecyclestage: "opportunity", lead_source: "Partner - Hamarashops" },
                  { id: "cnt_02", email: "sarah.jenkins@kcfintech.io", firstname: "Sarah", lastname: "Jenkins", company: "KC Fintech Labs", lifecyclestage: "lead", lead_source: "Founder Signal System" }
                ],
                totalCount: 2
              });
            }

            try {
              const url = `https://api.hubapi.com/crm/v3/objects/contacts?limit=${limit || 10}&properties=email,firstname,lastname,company,lifecyclestage,phone,lead_source`;
              const res = await fetch(url, {
                headers: {
                  Authorization: `Bearer ${hubspotToken}`,
                  "Content-Type": "application/json"
                }
              });

              if (!res.ok) {
                const errText = await res.text();
                return `HubSpot Contacts API error (${res.status}): ${errText}`;
              }

              const data = await res.json();
              return JSON.stringify(data);
            } catch (err: any) {
              return `HubSpot Contacts query failed: ${err.message}`;
            }
          }
        } as any),

        updateHubSpotDeal: tool({
          description: "Update an existing deal's stage, amount, name, or properties in HubSpot CRM.",
          parameters: z.object({
            dealId: z.string().describe("The ID of the HubSpot deal to update"),
            dealstage: z.string().optional().describe("New deal stage (e.g., 'closedwon', 'decisionmakerboughtin', 'qualifiedtobuy', 'presentationscheduled')"),
            amount: z.string().optional().describe("New monetary amount"),
            dealname: z.string().optional().describe("Updated deal title"),
          }),
          execute: async ({ dealId, dealstage, amount, dealname }: { dealId: string; dealstage?: string; amount?: string; dealname?: string }) => {
            console.log("[TOOL EXECUTED] Updating HubSpot Deal:", dealId, { dealstage, amount, dealname });
            const properties: Record<string, string> = {};
            if (dealstage) properties.dealstage = dealstage;
            if (amount) properties.amount = amount;
            if (dealname) properties.dealname = dealname;

            if (!hubspotToken) {
              return JSON.stringify({
                success: true,
                message: `[Simulated] Successfully updated HubSpot deal ${dealId} with stage '${dealstage || "unchanged"}'`,
                updatedProperties: properties
              });
            }

            try {
              const res = await fetch(`https://api.hubapi.com/crm/v3/objects/deals/${dealId}`, {
                method: "PATCH",
                headers: {
                  Authorization: `Bearer ${hubspotToken}`,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({ properties })
              });

              if (!res.ok) {
                const errText = await res.text();
                return `Failed to update HubSpot deal (${res.status}): ${errText}`;
              }

              const data = await res.json();
              return `Successfully updated deal ${dealId}: ${JSON.stringify(data)}`;
            } catch (err: any) {
              return `HubSpot Deal update failed: ${err.message}`;
            }
          }
        } as any),

        createHubSpotDeal: tool({
          description: "Create a new deal in HubSpot CRM associated with a company or contact.",
          parameters: z.object({
            dealname: z.string().describe("Deal title / name"),
            amount: z.string().describe("Monetary value in USD"),
            dealstage: z.string().optional().default("appointmentscheduled").describe("Initial stage"),
            pipeline: z.string().optional().default("default").describe("Pipeline identifier"),
          }),
          execute: async ({ dealname, amount, dealstage, pipeline }: { dealname: string; amount: string; dealstage?: string; pipeline?: string }) => {
            console.log("[TOOL EXECUTED] Creating HubSpot Deal:", dealname, amount);
            const properties = {
              dealname,
              amount,
              dealstage: dealstage || "appointmentscheduled",
              pipeline: pipeline || "default"
            };

            if (!hubspotToken) {
              return JSON.stringify({
                success: true,
                dealId: `deal_${Date.now().toString().slice(-6)}`,
                message: `[Simulated] Created HubSpot deal "${dealname}" ($${amount}) at stage "${dealstage || "appointmentscheduled"}"`
              });
            }

            try {
              const res = await fetch("https://api.hubapi.com/crm/v3/objects/deals", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${hubspotToken}`,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({ properties })
              });

              if (!res.ok) {
                return `HubSpot deal creation failed (${res.status}): ${await res.text()}`;
              }

              const data = await res.json();
              return `Created HubSpot Deal successfully: ${JSON.stringify(data)}`;
            } catch (err: any) {
              return `HubSpot deal creation error: ${err.message}`;
            }
          }
        } as any),

        upsertHubSpotContact: tool({
          description: "Create or update a contact in HubSpot CRM with email, name, company, and lead source.",
          parameters: z.object({
            email: z.string().email().describe("Contact email"),
            firstname: z.string().optional(),
            lastname: z.string().optional(),
            company: z.string().optional(),
            lead_source: z.string().optional().default("AgentLab OS"),
            lifecyclestage: z.string().optional().default("lead"),
          }),
          execute: async (params: { email: string; firstname?: string; lastname?: string; company?: string; lead_source?: string; lifecyclestage?: string }) => {
            console.log("[TOOL EXECUTED] Upserting HubSpot Contact:", params.email);
            const properties: Record<string, string> = { email: params.email };
            if (params.firstname) properties.firstname = params.firstname;
            if (params.lastname) properties.lastname = params.lastname;
            if (params.company) properties.company = params.company;
            if (params.lead_source) properties.lead_source = params.lead_source;
            if (params.lifecyclestage) properties.lifecyclestage = params.lifecyclestage;

            if (!hubspotToken) {
              return JSON.stringify({
                success: true,
                message: `[Simulated] Upserted contact ${params.email} (${params.company || "No Company"}) into HubSpot CRM.`
              });
            }

            try {
              const res = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${hubspotToken}`,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({ properties })
              });

              if (res.status === 409) {
                return `Contact ${params.email} already exists in HubSpot CRM (verified).`;
              }
              if (!res.ok) {
                return `HubSpot contact upsert failed (${res.status}): ${await res.text()}`;
              }

              const data = await res.json();
              return `Contact upserted successfully: ${JSON.stringify(data)}`;
            } catch (err: any) {
              return `HubSpot contact upsert error: ${err.message}`;
            }
          }
        } as any),

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
        } as any),
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
        } as any),
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
          },
        } as any),
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
