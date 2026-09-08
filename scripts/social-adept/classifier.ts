import process from "node:process";
import type { RawSignalItem, SignalClassification, ClassifiedSignal, SignalCategory } from "./types.js";

const CLASSIFICATION_SYSTEM_PROMPT = `
You are the intelligence classifier for AgentLab's "Social Adept" market listener.
Your role is to analyze raw online forum posts / discussion snippets from founders, agency operators, and software builders.

Extract key actionable signals:
1. Category:
   - "founder_pain": Founders complaining about manual operations, broken integrations, or messy tools.
   - "tool_bloat": Frustration with paying for too many SaaS tools, expensive seats, or underutilized software.
   - "contrarian_debate": Heated debate or emerging contrarian perspective on AI agents, automation, or agency business models.
   - "buying_intent": Founder actively asking for recommendations, agency help, or an alternative to existing stacks.
   - "general_intel": General industry chatter or lower-relevance discussion.
2. frictionSummary: 1-sentence crisp summary of what is broken or frustrating.
3. founderVerbatim: A short, exact or near-exact quote illustrating the pain in real human words.
4. linkedInHookIdea: A 1-2 sentence hook idea for a LinkedIn thought leadership post that responds to this pain with a Bootstrapper / Agentic OS perspective.
5. roundtableAngle: A question or discussion prompt suitable for a Bootstrapper Capital founder roundtable.
6. actionableScore: Integer 1 to 5 (5 = urgent, high-conviction buying signal or killer post hook; 1 = generic noise).
7. tags: 2-4 short keywords (e.g., ["zapier", "crm-bloat", "founder-time"]).

Respond ONLY with valid JSON matching this structure:
{
  "category": "founder_pain",
  "frictionSummary": "...",
  "founderVerbatim": "...",
  "linkedInHookIdea": "...",
  "roundtableAngle": "...",
  "actionableScore": 4,
  "tags": ["..."]
}
`;

export class SignalClassifier {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;
  }

  private heuristicClassify(item: RawSignalItem): SignalClassification {
    const text = `${item.title} ${item.body}`.toLowerCase();
    
    let category: SignalCategory = "general_intel";
    let score = 2;
    const tags: string[] = [];

    if (text.includes("expensive") || text.includes("cost") || text.includes("pricing") || text.includes("cancel") || text.includes("subscription")) {
      category = "tool_bloat";
      score = 4;
      tags.push("tool-bloat", "cost-cutting");
    } else if (text.includes("looking for") || text.includes("recommend") || text.includes("need someone") || text.includes("hire") || text.includes("agency")) {
      category = "buying_intent";
      score = 5;
      tags.push("inbound-intent", "agency-search");
    } else if (text.includes("stuck") || text.includes("waste") || text.includes("manual") || text.includes("broken") || text.includes("hours")) {
      category = "founder_pain";
      score = 4;
      tags.push("workflow-bottleneck", "manual-ops");
    } else if (text.includes("overhyped") || text.includes("useless") || text.includes("myth") || text.includes("future of")) {
      category = "contrarian_debate";
      score = 3;
      tags.push("ai-debate", "contrarian-pov");
    }

    const snippet = item.body.length > 20 ? item.body.slice(0, 120) : item.title;

    return {
      category,
      frictionSummary: item.title,
      founderVerbatim: `"${snippet}..."`,
      linkedInHookIdea: `Founders are still losing hours to "${item.title.slice(0, 60)}". Here is how an Agentic OS replaces that whole mess:`,
      roundtableAngle: `How are other founders handling "${item.title.slice(0, 50)}" without adding more bloated SaaS seats?`,
      actionableScore: score,
      tags: tags.length ? tags : ["market-signal"],
    };
  }

  private async classifyWithLLM(item: RawSignalItem): Promise<SignalClassification> {
    if (!this.apiKey) {
      return this.heuristicClassify(item);
    }

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;
      const prompt = `Title: ${item.title}\nSource: ${item.source} (${item.query})\nContent: ${item.body}\nURL: ${item.url}`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${CLASSIFICATION_SYSTEM_PROMPT}\n\nAnalyze this post:\n${prompt}` }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        }),
      });

      if (!res.ok) {
        return this.heuristicClassify(item);
      }

      const data = (await res.json()) as any;
      const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResponse) return this.heuristicClassify(item);

      const parsed = JSON.parse(textResponse) as SignalClassification;
      return parsed;
    } catch {
      return this.heuristicClassify(item);
    }
  }

  public async classifyItem(item: RawSignalItem): Promise<ClassifiedSignal> {
    const classification = await this.classifyWithLLM(item);
    return {
      ...item,
      classification,
    };
  }

  public async classifyBatch(items: RawSignalItem[]): Promise<ClassifiedSignal[]> {
    const results: ClassifiedSignal[] = [];
    for (const item of items) {
      const classified = await this.classifyItem(item);
      results.push(classified);
    }
    return results;
  }
}
