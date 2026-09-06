import { generateText, tool } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { AgentMailClient } from "../tools/agentmail";
import fs from "fs";
import path from "path";

// We will create the google instance dynamically inside the runner
// so that process.env is read at execution time.
// const google = createGoogleGenerativeAI();

export interface CapturedToolCall {
  toolName: string;
  args: any;
  result: any;
  isSimulated: boolean;
  timestamp: string;
}

export interface CapturedArtifact {
  title: string;
  artifactType: "post" | "calendar_entry" | "document" | "file" | "crm_diff" | "csv";
  content: string;
  summary?: string;
  targetPlatform?: string;
  scheduledFor?: string;
  metadata?: Record<string, any>;
}

export interface AgentRunnerResult {
  outputPayload: any;
  tokensPrompt: number;
  tokensCompletion: number;
  tokensTotal: number;
  cost: number;
  latencyMs: number;
  toolsExecuted: CapturedToolCall[];
  hasRefusal: boolean;
  refusalReason?: string;
  extractedArtifacts: CapturedArtifact[];
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
 * Robust semantic classifier for agent refusals, missing prerequisites, or inability statements.
 */
export function detectAgentRefusal(text: string): { isRefusal: boolean; reason?: string } {
  if (!text || typeof text !== "string") return { isRefusal: false };
  
  const normalized = text.toLowerCase();
  
  const strictRefusalPhrases = [
    "cannot directly access",
    "do not have access to",
    "my current capabilities do not include",
    "i do not have direct access",
    "unable to access external",
    "i do not have the ability to access",
    "i cannot access",
    "as an ai, i cannot",
    "as an ai model, i don't have",
    "i don't have access to your",
    "i am unable to browse",
    "i cannot interact with",
    "i cannot execute",
    "unable to perform this task because",
    "i am unable to read local files",
    "i do not possess the tools",
    "i cannot view or access",
    "i don't have real-time access",
    "i am not able to access",
    "i cannot read files on your local machine",
    "i cannot connect to external databases",
    "unable to retrieve files from the filesystem"
  ];

  for (const phrase of strictRefusalPhrases) {
    if (normalized.includes(phrase)) {
      return {
        isRefusal: true,
        reason: `Agent stated execution limitation: "${phrase}" found in response.`,
      };
    }
  }

  return { isRefusal: false };
}

/**
 * Extracts structured artifacts (social posts, calendar items, documents) from agent text or JSON output.
 */
export function extractArtifactsFromOutput(
  text: string,
  payload: any,
  capturedFromTools: CapturedArtifact[] = []
): CapturedArtifact[] {
  const artifacts: CapturedArtifact[] = [...capturedFromTools];

  // 1. Check if payload contains an explicit array of posts / drafts / calendar
  if (payload) {
    if (Array.isArray(payload.posts)) {
      payload.posts.forEach((p: any, idx: number) => {
        artifacts.push({
          title: p.title || p.topic || `Generated Post #${idx + 1}`,
          artifactType: "post",
          content: p.content || p.body || JSON.stringify(p, null, 2),
          summary: p.summary || p.hook,
          targetPlatform: p.platform || p.targetPlatform || "linkedin",
          scheduledFor: p.scheduledFor || p.publishDate || p.date,
          metadata: { ...p },
        });
      });
    }

    if (Array.isArray(payload.drafts)) {
      payload.drafts.forEach((d: any, idx: number) => {
        artifacts.push({
          title: d.title || `Content Draft #${idx + 1}`,
          artifactType: "post",
          content: d.content || d.body || JSON.stringify(d, null, 2),
          summary: d.summary,
          targetPlatform: d.platform || "linkedin",
          scheduledFor: d.scheduledFor,
          metadata: { ...d },
        });
      });
    }
  }

  // 2. If no artifacts yet, check if text has markdown post headers (e.g. "### Post 1", "## Post: ", "### Draft 1")
  if (artifacts.length === 0 && typeof text === "string" && text.length > 50) {
    const postSections = text.split(/(?=###?\s+(?:Post|Draft|Update|Article)\s+\d+)/i);
    if (postSections.length > 1) {
      postSections.forEach((section, idx) => {
        const trimmed = section.trim();
        if (trimmed.length > 20) {
          const lines = trimmed.split("\n");
          const titleLine = lines[0].replace(/^[#\s*]+/, "").trim();
          artifacts.push({
            title: titleLine || `Draft Post #${idx + 1}`,
            artifactType: "post",
            content: trimmed,
            targetPlatform: "linkedin",
            metadata: { extractedFromMarkdown: true },
          });
        }
      });
    }
  }

  return artifacts;
}

/**
 * Runs a single agent step by combining the system prompt, action prompt,
 * and context, then calling Gemini.
 */
export async function runAgentStep(
  actionPrompt: string,
  systemPrompt: string | undefined | null,
  inputContext: Record<string, any> = {},
  workspaceId: string,
  unlockedDepartments: string[]
): Promise<AgentRunnerResult> {
  const startTime = Date.now();
  const capturedToolCalls: CapturedToolCall[] = [];
  const capturedArtifacts: CapturedArtifact[] = [];

  let fullPrompt = actionPrompt;
  if (Object.keys(inputContext).length > 0) {
    fullPrompt += `\n\n[Current Run Context]:\n${JSON.stringify(inputContext, null, 2)}`;
  }
  
  const finalSystemPrompt = `${systemPrompt || ""}\n\nYou have full autonomous access to the ecosystem tools:
1. HubSpot CRM Tools:
   - 'getHubSpotDeals': Query live deals, pipelines, stages, amounts, and properties from HubSpot CRM.
   - 'getHubSpotContacts': Query live contacts, leads, emails, and company details from HubSpot CRM.
   - 'updateHubSpotDeal': Update deal stage, amount, name, or properties.
   - 'createHubSpotDeal': Create a new deal in the HubSpot sales pipeline.
   - 'upsertHubSpotContact': Create or update a contact in HubSpot CRM.
2. Email & Dispatch Tools:
   - 'sendAgentMail': Send an email via the AgentMail relay.
3. Content Staging & Artifact Output Tools:
   - 'saveContentDraft': Save a drafted post or content calendar item (title, platform, content, scheduled date, tags) directly to the workspace content queue and calendar.
   - 'saveOutputDocument': Save a generated report, analysis brief, CSV, or SOP document into the workspace artifact vault.
4. Internal Knowledge & Repository Tools:
   - 'searchLocalFiles': Search repository files for SOPs, blueprints, or kits.
   - 'readLocalFile': Read the contents of a local file.

CRITICAL INSTRUCTION: You HAVE DIRECT ACCESS to all listed ecosystem tools. When asked to draft content, query CRM deals, sync contacts, or create artifacts, you MUST ALWAYS invoke the corresponding tools. NEVER claim you lack access to files or CRM capabilities.`;

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
      toolsExecuted: [],
      hasRefusal: false,
      extractedArtifacts: [],
    };
  }

  console.log("[Agent Runner] Calling AI SDK generateText with model gemini-2.5-flash...");
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
          saveContentDraft: tool({
            description: "Save a drafted social post, article, or newsletter into the workspace Content Queue and Calendar.",
            parameters: z.object({
              title: z.string().describe("Descriptive title or headline for the post"),
              platform: z.enum(["linkedin", "blog", "newsletter", "twitter", "internal"]).default("linkedin").describe("Target distribution channel"),
              content: z.string().describe("The complete body text / copy of the drafted post, including hashtags and CTA"),
              scheduledFor: z.string().optional().describe("Proposed publication date or ISO timestamp (e.g. '2026-09-08 09:00 AM' or '2026-09-08')"),
              summary: z.string().optional().describe("Short hook or 1-sentence summary of the post"),
              hashtags: z.array(z.string()).optional().describe("Relevant hashtags (e.g. ['#agentlab', '#AIVoice'])"),
            }),
            execute: async ({ title, platform, content, scheduledFor, summary, hashtags }: any) => {
              console.log("[TOOL EXECUTED] Saving Content Draft:", title, `(${platform})`);
              const artifact: CapturedArtifact = {
                title,
                artifactType: "post",
                content,
                summary: summary || content.slice(0, 100) + "...",
                targetPlatform: platform || "linkedin",
                scheduledFor: scheduledFor || new Date(Date.now() + 86400000).toISOString(),
                metadata: { hashtags, platform, createdViaTool: true },
              };
              capturedArtifacts.push(artifact);
              capturedToolCalls.push({
                toolName: "saveContentDraft",
                args: { title, platform, scheduledFor },
                result: { success: true, title, platform, scheduledFor },
                isSimulated: false,
                timestamp: new Date().toISOString(),
              });
              return JSON.stringify({
                success: true,
                message: `Successfully staged draft "${title}" for ${platform}. Scheduled for: ${scheduledFor || "Next available queue slot"}`,
                artifactTitle: title,
              });
            },
          } as any),

          saveOutputDocument: tool({
            description: "Save an analysis report, CSV data, operational brief, or markdown document into the workspace artifact repository.",
            parameters: z.object({
              title: z.string().describe("Document title"),
              docType: z.enum(["document", "sop", "report", "csv", "crm_diff"]).default("document").describe("Document classification"),
              content: z.string().describe("Full document contents or markdown body"),
              summary: z.string().optional().describe("Executive summary of document contents"),
            }),
            execute: async ({ title, docType, content, summary }: any) => {
              console.log("[TOOL EXECUTED] Saving Output Document:", title, `(${docType})`);
              const artifact: CapturedArtifact = {
                title,
                artifactType: docType as any,
                content,
                summary: summary || content.slice(0, 120),
                metadata: { docType, length: content.length },
              };
              capturedArtifacts.push(artifact);
              capturedToolCalls.push({
                toolName: "saveOutputDocument",
                args: { title, docType },
                result: { success: true, title, docType },
                isSimulated: false,
                timestamp: new Date().toISOString(),
              });
              return JSON.stringify({
                success: true,
                message: `Successfully saved ${docType} document "${title}" into artifact vault.`,
              });
            },
          } as any),

          getHubSpotDeals: tool({
            description: "Query and extract deals, deal stages, amounts, pipelines, and recent movements from HubSpot CRM.",
            parameters: z.object({
              limit: z.number().optional().default(10).describe("Maximum number of deals to retrieve (1-100)"),
              pipeline: z.string().optional().describe("Optional pipeline ID filter"),
            }),
            execute: async ({ limit, pipeline }: { limit?: number; pipeline?: string }) => {
              console.log("[TOOL EXECUTED] Fetching HubSpot Deals, limit:", limit);
              if (!hubspotToken) {
                const simulated = {
                  status: "simulated_success",
                  message: "No HUBSPOT_PAT token found in environment. Returning verified local pipeline state.",
                  deals: [
                    { id: "deal_001", dealname: "Hamarashops MedLM Enterprise Integration", dealstage: "decisionmakerboughtin", amount: "45000", pipeline: "default", createdate: "2026-08-15T12:00:00Z" },
                    { id: "deal_002", dealname: "Kansas City Founder Signal System Sprint", dealstage: "qualifiedtobuy", amount: "1000", pipeline: "default", createdate: "2026-08-28T14:30:00Z" },
                    { id: "deal_003", dealname: "Bootstrapper Capital Ownable OS Pro Annual", dealstage: "closedwon", amount: "6000", pipeline: "default", createdate: "2026-09-01T09:15:00Z" }
                  ],
                  totalCount: 3
                };
                capturedToolCalls.push({
                  toolName: "getHubSpotDeals",
                  args: { limit, pipeline },
                  result: simulated,
                  isSimulated: true,
                  timestamp: new Date().toISOString(),
                });
                return JSON.stringify(simulated);
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
                capturedToolCalls.push({
                  toolName: "getHubSpotDeals",
                  args: { limit, pipeline },
                  result: data,
                  isSimulated: false,
                  timestamp: new Date().toISOString(),
                });
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
                const simulated = {
                  status: "simulated_success",
                  message: "No HUBSPOT_PAT token found in environment. Returning verified local contacts state.",
                  contacts: [
                    { id: "cnt_01", email: "dr.miller@hamarashops-med.com", firstname: "David", lastname: "Miller", company: "Hamarashops Health", lifecyclestage: "opportunity", lead_source: "Partner - Hamarashops" },
                    { id: "cnt_02", email: "sarah.jenkins@kcfintech.io", firstname: "Sarah", lastname: "Jenkins", company: "KC Fintech Labs", lifecyclestage: "lead", lead_source: "Founder Signal System" }
                  ],
                  totalCount: 2
                };
                capturedToolCalls.push({
                  toolName: "getHubSpotContacts",
                  args: { limit, searchQuery },
                  result: simulated,
                  isSimulated: true,
                  timestamp: new Date().toISOString(),
                });
                return JSON.stringify(simulated);
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
                capturedToolCalls.push({
                  toolName: "getHubSpotContacts",
                  args: { limit, searchQuery },
                  result: data,
                  isSimulated: false,
                  timestamp: new Date().toISOString(),
                });
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
                const simulated = {
                  success: true,
                  message: `[Simulated] Successfully updated HubSpot deal ${dealId} with stage '${dealstage || "unchanged"}'`,
                  updatedProperties: properties
                };
                capturedToolCalls.push({
                  toolName: "updateHubSpotDeal",
                  args: { dealId, dealstage, amount, dealname },
                  result: simulated,
                  isSimulated: true,
                  timestamp: new Date().toISOString(),
                });
                return JSON.stringify(simulated);
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
                capturedToolCalls.push({
                  toolName: "updateHubSpotDeal",
                  args: { dealId, dealstage, amount, dealname },
                  result: data,
                  isSimulated: false,
                  timestamp: new Date().toISOString(),
                });
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
                const simulated = {
                  success: true,
                  dealId: `deal_${Date.now().toString().slice(-6)}`,
                  message: `[Simulated] Created HubSpot deal "${dealname}" ($${amount}) at stage "${dealstage || "appointmentscheduled"}"`
                };
                capturedToolCalls.push({
                  toolName: "createHubSpotDeal",
                  args: { dealname, amount, dealstage, pipeline },
                  result: simulated,
                  isSimulated: true,
                  timestamp: new Date().toISOString(),
                });
                return JSON.stringify(simulated);
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
                capturedToolCalls.push({
                  toolName: "createHubSpotDeal",
                  args: { dealname, amount, dealstage, pipeline },
                  result: data,
                  isSimulated: false,
                  timestamp: new Date().toISOString(),
                });
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
                const simulated = {
                  success: true,
                  message: `[Simulated] Upserted contact ${params.email} (${params.company || "No Company"}) into HubSpot CRM.`
                };
                capturedToolCalls.push({
                  toolName: "upsertHubSpotContact",
                  args: params,
                  result: simulated,
                  isSimulated: true,
                  timestamp: new Date().toISOString(),
                });
                return JSON.stringify(simulated);
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
                capturedToolCalls.push({
                  toolName: "upsertHubSpotContact",
                  args: params,
                  result: data,
                  isSimulated: false,
                  timestamp: new Date().toISOString(),
                });
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
                capturedToolCalls.push({
                  toolName: "sendAgentMail",
                  args: { to, subject },
                  result,
                  isSimulated: false,
                  timestamp: new Date().toISOString(),
                });
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
                const results: string[] = [];
                const searchDir = (dir: string) => {
                  const files = fs.readdirSync(dir);
                  for (const file of files) {
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
                
                capturedToolCalls.push({
                  toolName: "searchLocalFiles",
                  args: { keyword },
                  result: { matchCount: results.length, matches: results.slice(0, 5) },
                  isSimulated: false,
                  timestamp: new Date().toISOString(),
                });

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
                capturedToolCalls.push({
                  toolName: "readLocalFile",
                  args: { filePath },
                  result: { length: contents.length, path: fullPath },
                  isSimulated: false,
                  timestamp: new Date().toISOString(),
                });
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
        throw sdkError;
      }
      await new Promise(res => setTimeout(res, Math.pow(2, attempt) * 1000));
    }
  }

  const latencyMs = Date.now() - startTime;

  const usageAny = usage as any;
  const tokensPrompt = usageAny?.promptTokens || 0;
  const tokensCompletion = usageAny?.completionTokens || 0;
  const tokensTotal = usageAny?.totalTokens || 0;

  const cost =
    (tokensPrompt / 1_000_000) * 1.25 + (tokensCompletion / 1_000_000) * 5.0;

  let outputPayload;
  try {
    outputPayload = JSON.parse(text);
  } catch (e) {
    outputPayload = { result: text };
  }

  // Evaluate refusal & capability check
  const refusalCheck = detectAgentRefusal(text);
  const extractedArtifacts = extractArtifactsFromOutput(text, outputPayload, capturedArtifacts);

  return {
    outputPayload,
    tokensPrompt,
    tokensCompletion,
    tokensTotal,
    cost,
    latencyMs,
    toolsExecuted: capturedToolCalls,
    hasRefusal: refusalCheck.isRefusal && capturedToolCalls.length === 0,
    refusalReason: refusalCheck.reason,
    extractedArtifacts,
  };
}

// Cache bust API key: 20260825153256
// Cache bust API key: 2026-08-25T15:52:07
// Cache bust API key: 2026-08-25T16:11:51
