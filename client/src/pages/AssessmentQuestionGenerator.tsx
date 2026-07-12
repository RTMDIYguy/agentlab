import { useMemo, useState } from "react";
import {
  Clipboard,
  Copy,
  Gauge,
  MessageSquareText,
  RefreshCcw,
  Sparkles,
  Download,
  PlusCircle,
} from "lucide-react";
import { PageLayout } from "@/components/PageLayout";

type Depth = "exploratory" | "diagnostic" | "executive";

type Question = {
  id: string;
  domain: string;
  depth: Depth;
  text: string;
  skill: string;
  evaluation: string;
  signals: string[];
};

const depthLabels: Record<Depth, string> = {
  exploratory: "Exploratory",
  diagnostic: "Diagnostic",
  executive: "Executive",
};

// Diagnostic rules linking detected signals to Gaps and Next Steps
const diagnosticRules: Record<string, { gap: string; nextStep: string }> = {
  workflow: { gap: "Undocumented core workflows causing inconsistent delivery.", nextStep: "Document the step-by-step Standard Operating Procedure (SOP) for fulfillment." },
  handoff: { gap: "Friction and data drops during team or department handoffs.", nextStep: "Define clear criteria and checklist requirements for client handoffs." },
  delay: { gap: "Operational bottlenecks dragging down project timelines.", nextStep: "Map time-to-delivery metrics to pinpoint exactly where friction occurs." },
  lead: { gap: "Inconsistent lead tracking creating a leaky marketing funnel.", nextStep: "Implement a structured pipeline in the CRM with explicit stage definitions." },
  "follow up": { gap: "Lost revenue due to dropped or delayed sales follow-ups.", nextStep: "Set up automated task reminders or automated email sequences for warm leads." },
  crm: { gap: "Underutilized sales infrastructure leading to tracking blindspots.", nextStep: "Clean up historical data and enforce centralized CRM logging for all reps." },
  content: { gap: "Marketing activity is volume-focused rather than high-intent conversation generation.", nextStep: "Shift editorial calendar toward addressing top client objections." },
  cash: { gap: "Limited short-term financial visibility impacting real-time decisions.", nextStep: "Build a weekly 13-week cash flow forecasting dashboard." },
  budget: { gap: "Tooling and operational overhead growing without ROI auditing.", nextStep: "Conduct a comprehensive software spend audit to eliminate duplicate seats." },
  tool: { gap: "Siloed platforms causing duplicate data entry across departments.", nextStep: "Build native data integrations or utilize webhooks to sync applications." },
  manual: { gap: "Valuable labor hours spent on repetitive data entry.", nextStep: "Deploy a workflow automation script to eliminate human-in-the-loop copying." },
  automate: { gap: "Lack of core systems leverage preventing operational scaling.", nextStep: "Identify the highest-frequency task and map its automation logic safely." },
  decision: { gap: "Unclear operational ownership causing decision-making latency.", nextStep: "Establish a clear accountability matrix for leadership roles." },
  knowledge: { gap: "High key-person dependency with mission-critical training locked in heads.", nextStep: "Build a centralized internal wiki/knowledge base." },
};

const questionBank: Question[] = [
  { id: "ops-1", domain: "Operations", depth: "exploratory", text: "Walk me through what happens from the moment a new client says yes to the moment the work is fully delivered.", skill: "Process Discovery", evaluation: "Looks for sequence clarity, hidden handoffs, undocumented steps, and delay points.", signals: ["workflow", "handoff", "delivery", "onboarding", "process"] },
  { id: "ops-2", domain: "Operations", depth: "diagnostic", text: "Where does work most often slow down, get rechecked, or require someone to chase an update?", skill: "Bottleneck Identification", evaluation: "Assesses whether the client can name friction points and distinguish symptoms from root causes.", signals: ["delay", "bottleneck", "follow up", "status", "rework", "chase"] },
  { id: "ops-3", domain: "Operations", depth: "executive", text: "If the business doubled next quarter, which part of the operating system would break first?", skill: "Scalability Assessment", evaluation: "Reveals the highest-risk constraint in people, process, tools, or decision flow.", signals: ["scale", "growth", "capacity", "team", "break"] },
  { id: "sales-1", domain: "Sales", depth: "exploratory", text: "How does a new lead usually enter the business, and what has to happen before they become a qualified opportunity?", skill: "Lead Path Mapping", evaluation: "Checks whether the client has a defined path from attention to qualification.", signals: ["lead", "prospect", "referral", "inquiry", "pipeline"] },
  { id: "sales-2", domain: "Sales", depth: "diagnostic", text: "Which follow-up step is most likely to be missed when someone shows interest?", skill: "Follow-Up Reliability", evaluation: "Identifies lost revenue risk from inconsistent nurture, ownership, or timing.", signals: ["follow up", "reply", "email", "call", "missed", "nurture"] },
  { id: "sales-3", domain: "Sales", depth: "executive", text: "What would make the current sales process easier to trust without adding more meetings?", skill: "Sales System Design", evaluation: "Tests whether the client needs better tracking, clearer stages, stronger handoffs, or decision rules.", signals: ["trust", "meeting", "crm", "stage", "decision"] },
  { id: "marketing-1", domain: "Marketing", depth: "exploratory", text: "What are you currently publishing or sharing that reliably starts useful conversations?", skill: "Content Signal Review", evaluation: "Looks for proof that content is tied to audience response rather than activity volume.", signals: ["content", "linkedin", "post", "campaign", "engagement"] },
  { id: "marketing-2", domain: "Marketing", depth: "diagnostic", text: "How do you connect marketing activity to leads, booked calls, or revenue opportunities today?", skill: "Marketing Attribution", evaluation: "Assesses whether the client can trace marketing effort to business outcomes.", signals: ["roi", "analytics", "lead", "revenue", "conversion", "campaign"] },
  { id: "marketing-3", domain: "Marketing", depth: "executive", text: "Which market message is strongest enough that the business should build repeatable campaigns around it?", skill: "Positioning Judgment", evaluation: "Tests clarity of offer, audience, pain point, and proof.", signals: ["positioning", "message", "offer", "audience", "proof"] },
  { id: "finance-1", domain: "Finance", depth: "exploratory", text: "Which numbers do you review every week before deciding what the business can afford to do next?", skill: "Financial Visibility", evaluation: "Surfaces whether the client has a working control layer for cash, revenue, and obligations.", signals: ["cash", "budget", "expense", "invoice", "revenue"] },
  { id: "finance-2", domain: "Finance", depth: "diagnostic", text: "Where do expenses, subscriptions, or tool costs become hard to justify against current revenue?", skill: "Cost Control", evaluation: "Identifies free-bootstrap or paid-tool limit walls before they become emergencies.", signals: ["subscription", "tool", "cost", "credit", "bill", "budget"] },
  { id: "finance-3", domain: "Finance", depth: "executive", text: "What revenue signal would justify upgrading the next paid tool or hiring outside help?", skill: "Investment Threshold Design", evaluation: "Tests whether spending decisions are tied to revenue, capacity, and timing.", signals: ["upgrade", "hire", "funding", "investment", "revenue"] },
  { id: "technology-1", domain: "Technology", depth: "exploratory", text: "Which tools does the team rely on every day, and where does information have to be copied by hand?", skill: "Toolchain Mapping", evaluation: "Finds integration gaps, duplicate data entry, and tool sprawl.", signals: ["tool", "software", "spreadsheet", "copy", "manual", "integration"] },
  { id: "technology-2", domain: "Technology", depth: "diagnostic", text: "What repetitive task would create the most relief if it were automated safely?", skill: "Automation Opportunity Sizing", evaluation: "Separates high-leverage automation candidates from convenience automations.", signals: ["automate", "automation", "repeat", "manual", "relief", "task"] },
  { id: "technology-3", domain: "Technology", depth: "executive", text: "Where would automation create risk if the approval step or exception path were not designed well?", skill: "Automation Governance", evaluation: "Checks for judgment gates, compliance needs, exception handling, and rollback plans.", signals: ["approval", "risk", "exception", "compliance", "automation"] },
  { id: "leadership-1", domain: "Leadership", depth: "exploratory", text: "Who makes the final call when priorities conflict, and how does the team know the decision was made?", skill: "Decision Flow", evaluation: "Reveals unclear ownership, decision latency, and communication gaps.", signals: ["decision", "priority", "owner", "team", "communication"] },
  { id: "leadership-2", domain: "Leadership", depth: "diagnostic", text: "Which responsibilities live in someone's head instead of in a process the team can repeat?", skill: "Knowledge Capture", evaluation: "Identifies key-person dependency and documentation needs.", signals: ["knowledge", "training", "sop", "documentation", "responsibility"] },
  { id: "leadership-3", domain: "Leadership", depth: "executive", text: "What operating habit would most improve trust between leadership, staff, and clients?", skill: "Operating Culture", evaluation: "Surfaces cadence, transparency, accountability, and service expectations.", signals: ["trust", "cadence", "accountability", "client", "staff"] },
];

const domains = ["Auto", ...Array.from(new Set(questionBank.map(q => q.domain)))];
const callObjectives = ["Initial onboarding", "Systems audit", "Automation discovery", "Growth bottleneck review", "Follow-up consultation"];

function scoreQuestion(question: Question, notes: string, domain: string, depth: Depth) {
  const normalized = notes.toLowerCase();
  const signalHits = question.signals.filter(signal => normalized.includes(signal)).length;
  const domainScore = domain === "Auto" || question.domain === domain ? 6 : 0;
  const depthScore = question.depth === depth ? 4 : 0;
  return domainScore + depthScore + signalHits * 3;
}

function inferSignals(notes: string) {
  const normalized = notes.toLowerCase();
  const hits = questionBank
    .flatMap(q => q.signals.map(sig => ({ signal: sig, domain: q.domain })))
    .filter(item => normalized.includes(item.signal));

  const unique = new Map<string, string>();
  hits.forEach(item => unique.set(item.signal, item.domain));
  return Array.from(unique.entries()).map(([signal, domain]) => ({ signal, domain }));
}

export default function AssessmentQuestionGenerator() {
  const [clientName, setClientName] = useState("");
  const [objective, setObjective] = useState(callObjectives[0]);
  const [domain, setDomain] = useState("Auto");
  const [depth, setDepth] = useState<Depth>("diagnostic");
  const [count, setCount] = useState(5);
  const [notes, setNotes] = useState("");
  const [refreshSeed, setRefreshSeed] = useState(0);
  const [copied, setCopied] = useState(false);

  const signals = useMemo(() => inferSignals(notes), [notes]);

  const activeInsights = useMemo(() => {
    return signals
      .filter(item => diagnosticRules[item.signal])
      .map(item => ({
        signal: item.signal,
        domain: item.domain,
        ...diagnosticRules[item.signal],
      }));
  }, [signals]);

  const selectedQuestions = useMemo(() => {
    return [...questionBank]
      .map(q => ({ question: q, score: scoreQuestion(q, notes, domain, depth) }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (a.question.id + refreshSeed).localeCompare(b.question.id + refreshSeed);
      })
      .slice(0, count || 3)
      .map(item => item.question);
  }, [count, depth, domain, notes, refreshSeed]);

  const masterReportText = useMemo(() => {
    const title = clientName.trim() || "Client";
    const diagnosticSection = activeInsights.length 
      ? activeInsights.flatMap((ins, i) => [
          `DIAGNOSTIC ARCHETYPE #${i + 1}: [Domain: ${ins.domain} / Tag: ${ins.signal}]`,
          `Identified Systemic Gap: ${ins.gap}`,
          `Recommended Next Step:  ${ins.nextStep}`,
          ""
        ])
      : ["No core structural gaps explicitly auto-detected from current live notes yet."];

    return [
      `==================================================`,
      `${title.toUpperCase()} ASSESSMENT RAPID DISCOVERY PACKET`,
      `==================================================`,
      `Objective Focus : ${objective}`,
      `Evaluation Depth: ${depthLabels[depth]}`,
      `Primary Domain  : ${domain}`,
      `--------------------------------------------------`,
      "",
      `### RAW CONSULTING CALL NOTES & OBSERVATIONS`,
      `--------------------------------------------------`,
      notes.trim() || "No live consultation session text recorded yet.",
      "",
      `### SYSTEMIC GAPS & NEXT STEPS SYNTHESIS`,
      `--------------------------------------------------`,
      ...diagnosticSection,
      `### UTILIZED EVALUATION ASSESSMENT QUESTIONS`,
      `--------------------------------------------------`,
      ...selectedQuestions.flatMap((q, idx) => [
        `${idx + 1}. ${q.text}`,
        `   Targeted Metric: ${q.skill}`,
        `   Evaluation Gate: ${q.evaluation}`,
        ""
      ])
    ].join("\n");
  }, [clientName, objective, depth, domain, notes, activeInsights, selectedQuestions]);

  const copyQuestions = async () => {
    await navigator.clipboard.writeText(masterReportText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const appendInsightsToNotes = () => {
    if (!activeInsights.length) return;
    const reportAppend = [
      "\n\n--- AUTO-SYNTHESIZED METRICS DISCOVERED ---",
      ...activeInsights.map(ins => `• [${ins.domain}] Gap: ${ins.gap} -> Next Step: ${ins.nextStep}`)
    ].join("\n");
    setNotes(prev => prev + reportAppend);
  };

  const exportClientPacketFile = () => {
    const blob = new Blob([masterReportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${clientName.trim().toLowerCase().replace(/\s+/g, "-") || "client"}-discovery-packet.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <PageLayout className="bg-slate-50">
      <div className="container py-6 lg:py-8">
        <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase text-blue-700">
              <Sparkles className="h-4 w-4" />
              Internal Discovery Hub
            </div>
            <h1 className="text-3xl font-semibold text-slate-950">
              Consulting Assessment Question Generator
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyQuestions}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-800 px-4 text-sm font-semibold text-white transition hover:bg-slate-900"
            >
              <Copy className="h-4 w-4" />
              {copied ? "Copied Packet!" : "Copy Full Report"}
            </button>
            <button
              type="button"
              onClick={exportClientPacketFile}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              <Download className="h-4 w-4" />
              Export Client Packet
            </button>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
          <section className="space-y-4">
            {/* Call Setup Container */}
            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Clipboard className="h-4 w-4 text-blue-700" />
                Call Setup
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  Client Name
                  <input
                    value={clientName}
                    onChange={event => setClientName(event.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-blue-700"
                    placeholder="Client or company name"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Objective
                  <select
                    value={objective}
                    onChange={event => setObjective(event.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-700"
                  >
                    {callObjectives.map(item => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Focus Focus
                  <select
                    value={domain}
                    onChange={event => setDomain(event.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-700"
                  >
                    {domains.map(item => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Question Count
                  <input
                    type="number"
                    min={3}
                    max={8}
                    value={count || ""}
                    onChange={event => {
                      const val = event.target.value === "" ? 0 : Number(event.target.value);
                      setCount(Math.min(8, Math.max(0, val)));
                    }}
                    onBlur={() => { if (count < 3) setCount(3); }}
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-blue-700"
                  />
                </label>
              </div>

              <div className="mt-4">
                <div className="mb-2 text-sm font-medium text-slate-700">Depth</div>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(depthLabels) as Depth[]).map(item => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setDepth(item)}
                      className={`h-10 rounded-md border px-2 text-sm font-medium transition ${
                        depth === item
                          ? "border-blue-700 bg-blue-700 text-white"
                          : "border-slate-300 bg-white text-slate-700 hover:border-blue-700"
                      }`}
                    >
                      {depthLabels[item]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Consultation Note Workspace */}
            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <MessageSquareText className="h-4 w-4 text-blue-700" />
                  Live Consultation Notes
                </div>
                <div className="flex gap-2">
                  {activeInsights.length > 0 && (
                    <button
                      type="button"
                      onClick={appendInsightsToNotes}
                      className="inline-flex h-8 items-center gap-1.5 rounded-md bg-emerald-50 border border-emerald-200 px-3 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      Append to Notes
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setRefreshSeed(seed => seed + 1)}
                    className="inline-flex h-8 items-center gap-2 rounded-md border border-slate-300 px-3 text-xs font-medium text-slate-700 hover:border-blue-700 hover:text-blue-700"
                  >
                    <RefreshCcw className="h-3.5 w-3.5" />
                    Refresh
                  </button>
                </div>
              </div>
              <textarea
                value={notes}
                onChange={event => setNotes(event.target.value)}
                rows={12}
                className="w-full resize-none rounded-md border border-slate-300 px-3 py-3 text-sm leading-6 text-slate-900 outline-none focus:border-blue-700"
                placeholder="Type short notes as the client talks: missed follow-ups, manual copying, onboarding delays, tool costs, unclear ownership..."
              />

              <div className="mt-3 min-h-12 text-xs text-slate-600">
                {signals.length ? (
                  <div className="flex flex-wrap gap-2">
                    {signals.slice(0, 10).map(item => (
                      <span
                        key={`${item.domain}-${item.signal}`}
                        className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1"
                      >
                        {item.domain}: {item.signal}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span>Signal tags appear here as notes mention workflow, leads, tools, costs, automation, ownership, or follow-up.</span>
                )}
              </div>
            </div>
          </section>

          {/* RIGHT SIDEBAR: Output Results Workspace */}
          <section className="space-y-4">
            {/* Live Diagnostic Report Synthesis Section */}
            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 text-sm font-semibold text-slate-900">
                Live Diagnostic Report Synthesis
              </div>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {activeInsights.length ? (
                  activeInsights.map((ins, i) => (
                    <div key={i} className="rounded border border-slate-100 bg-slate-50 p-2.5 text-xs">
                      <div className="font-bold text-blue-700 uppercase tracking-wide mb-1">
                        [{ins.domain}] Detected Signal: "{ins.signal}"
                      </div>
                      <div className="text-slate-900 mb-1"><span className="font-semibold text-slate-700">Systemic Gap:</span> {ins.gap}</div>
                      <div className="text-slate-600"><span className="font-semibold text-slate-700">Immediate Action:</span> {ins.nextStep}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 py-4 text-center border border-dashed border-slate-200 rounded">
                    Operational gap detections and strategic actionable next steps will generate automatically here as you capture live keywords.
                  </div>
                )}
              </div>
            </div>

            {/* Suggested Question Sequence */}
            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Gauge className="h-4 w-4 text-blue-700" />
                  Suggested Assessment Matrix
                </div>
                <div className="text-xs font-medium text-slate-500">
                  Focus: {domain} · Depth: {depthLabels[depth]}
                </div>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {selectedQuestions.map((question, index) => (
                  <article key={question.id} className="rounded-md border border-slate-200 bg-slate-50 p-4 text-xs">
                    <div className="mb-2 flex flex-wrap items-center gap-2 font-semibold uppercase text-slate-500">
                      <span className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">{index + 1}</span>
                      <span>{question.domain}</span>
                      <span>{depthLabels[question.depth]}</span>
                    </div>
                    <p className="text-base font-semibold leading-7 text-slate-950 my-1.5">{question.text}</p>
                    <div className="grid gap-2 border-t border-slate-200 pt-3 mt-3 text-sm leading-6 md:grid-cols-2">
                      <div>
                        <div className="font-semibold text-slate-800">Skill Evaluation Metric</div>
                        <div className="text-slate-600">{question.skill}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">Target Indicator Gate</div>
                        <div className="text-slate-600">{question.evaluation}</div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}

    evaluation: "Looks for sequence clarity, hidden handoffs, undocumented steps, and delay points.",
    signals: ["workflow", "handoff", "delivery", "onboarding", "process"],
  },
  {
    id: "ops-2",
    domain: "Operations",
    depth: "diagnostic",
    text: "Where does work most often slow down, get rechecked, or require someone to chase an update?",
    skill: "Bottleneck Identification",
    evaluation: "Assesses whether the client can name friction points and distinguish symptoms from root causes.",
    signals: ["delay", "bottleneck", "follow up", "status", "rework", "chase"],
  },
  {
    id: "ops-3",
    domain: "Operations",
    depth: "executive",
    text: "If the business doubled next quarter, which part of the operating system would break first?",
    skill: "Scalability Assessment",
    evaluation: "Reveals the highest-risk constraint in people, process, tools, or decision flow.",
    signals: ["scale", "growth", "capacity", "team", "break"],
  },
  {
    id: "sales-1",
    domain: "Sales",
    depth: "exploratory",
    text: "How does a new lead usually enter the business, and what has to happen before they become a qualified opportunity?",
    skill: "Lead Path Mapping",
    evaluation: "Checks whether the client has a defined path from attention to qualification.",
    signals: ["lead", "prospect", "referral", "inquiry", "pipeline"],
  },
  {
    id: "sales-2",
    domain: "Sales",
    depth: "diagnostic",
    text: "Which follow-up step is most likely to be missed when someone shows interest?",
    skill: "Follow-Up Reliability",
    evaluation: "Identifies lost revenue risk from inconsistent nurture, ownership, or timing.",
    signals: ["follow up", "reply", "email", "call", "missed", "nurture"],
  },
  {
    id: "sales-3",
    domain: "Sales",
    depth: "executive",
    text: "What would make the current sales process easier to trust without adding more meetings?",
    skill: "Sales System Design",
    evaluation: "Tests whether the client needs better tracking, clearer stages, stronger handoffs, or decision rules.",
    signals: ["trust", "meeting", "crm", "stage", "decision"],
  },
  {
    id: "marketing-1",
    domain: "Marketing",
    depth: "exploratory",
    text: "What are you currently publishing or sharing that reliably starts useful conversations?",
    skill: "Content Signal Review",
    evaluation: "Looks for proof that content is tied to audience response rather than activity volume.",
    signals: ["content", "linkedin", "post", "campaign", "engagement"],
  },
  {
    id: "marketing-2",
    domain: "Marketing",
    depth: "diagnostic",
    text: "How do you connect marketing activity to leads, booked calls, or revenue opportunities today?",
    skill: "Marketing Attribution",
    evaluation: "Assesses whether the client can trace marketing effort to business outcomes.",
    signals: ["roi", "analytics", "lead", "revenue", "conversion", "campaign"],
  },
  {
    id: "marketing-3",
    domain: "Marketing",
    depth: "executive",
    text: "Which market message is strongest enough that the business should build repeatable campaigns around it?",
    skill: "Positioning Judgment",
    evaluation: "Tests clarity of offer, audience, pain point, and proof.",
    signals: ["positioning", "message", "offer", "audience", "proof"],
  },
  {
    id: "finance-1",
    domain: "Finance",
    depth: "exploratory",
    text: "Which numbers do you review every week before deciding what the business can afford to do next?",
    skill: "Financial Visibility",
    evaluation: "Surfaces whether the client has a working control layer for cash, revenue, and obligations.",
    signals: ["cash", "budget", "expense", "invoice", "revenue"],
  },
  {
    id: "finance-2",
    domain: "Finance",
    depth: "diagnostic",
    text: "Where do expenses, subscriptions, or tool costs become hard to justify against current revenue?",
    skill: "Cost Control",
    evaluation: "Identifies free-bootstrap or paid-tool limit walls before they become emergencies.",
    signals: ["subscription", "tool", "cost", "credit", "bill", "budget"],
  },
  {
    id: "finance-3",
    domain: "Finance",
    depth: "executive",
    text: "What revenue signal would justify upgrading the next paid tool or hiring outside help?",
    skill: "Investment Threshold Design",
    evaluation: "Tests whether spending decisions are tied to revenue, capacity, and timing.",
    signals: ["upgrade", "hire", "funding", "investment", "revenue"],
  },
  {
    id: "technology-1",
    domain: "Technology",
    depth: "exploratory",
    text: "Which tools does the team rely on every day, and where does information have to be copied by hand?",
    skill: "Toolchain Mapping",
    evaluation: "Finds integration gaps, duplicate data entry, and tool sprawl.",
    signals: ["tool", "software", "spreadsheet", "copy", "manual", "integration"],
  },
  {
    id: "technology-2",
    domain: "Technology",
    depth: "diagnostic",
    text: "What repetitive task would create the most relief if it were automated safely?",
    skill: "Automation Opportunity Sizing",
    evaluation: "Separates high-leverage automation candidates from convenience automations.",
    signals: ["automate", "automation", "repeat", "manual", "relief", "task"],
  },
  {
    id: "technology-3",
    domain: "Technology",
    depth: "executive",
    text: "Where would automation create risk if the approval step or exception path were not designed well?",
    skill: "Automation Governance",
    evaluation: "Checks for judgment gates, compliance needs, exception handling, and rollback plans.",
    signals: ["approval", "risk", "exception", "compliance", "automation"],
  },
  {
    id: "leadership-1",
    domain: "Leadership",
    depth: "exploratory",
    text: "Who makes the final call when priorities conflict, and how does the team know the decision was made?",
    skill: "Decision Flow",
    evaluation: "Reveals unclear ownership, decision latency, and communication gaps.",
    signals: ["decision", "priority", "owner", "team", "communication"],
  },
  {
    id: "leadership-2",
    domain: "Leadership",
    depth: "diagnostic",
    text: "Which responsibilities live in someone's head instead of in a process the team can repeat?",
    skill: "Knowledge Capture",
    evaluation: "Identifies key-person dependency and documentation needs.",
    signals: ["knowledge", "training", "sop", "documentation", "responsibility"],
  },
  {
    id: "leadership-3",
    domain: "Leadership",
    depth: "executive",
    text: "What operating habit would most improve trust between leadership, staff, and clients?",
    skill: "Operating Culture",
    evaluation: "Surfaces cadence, transparency, accountability, and service expectations.",
    signals: ["trust", "cadence", "accountability", "client", "staff"],
  },
];

const domains = ["Auto", ...Array.from(new Set(questionBank.map(question => question.domain)))];
const callObjectives = [
  "Initial onboarding",
  "Systems audit",
  "Automation discovery",
  "Growth bottleneck review",
  "Follow-up consultation",
];

function scoreQuestion(question: Question, notes: string, domain: string, depth: Depth) {
  const normalized = notes.toLowerCase();
  const signalHits = question.signals.filter(signal => normalized.includes(signal)).length;
  const domainScore = domain === "Auto" || question.domain === domain ? 6 : 0;
  const depthScore = question.depth === depth ? 4 : 0;
  return domainScore + depthScore + signalHits * 3;
}

function inferSignals(notes: string) {
  const normalized = notes.toLowerCase();
  const hits = questionBank
    .flatMap(question => question.signals.map(signal => ({ signal, domain: question.domain })))
    .filter(item => normalized.includes(item.signal));

  const unique = new Map<string, string>();
  hits.forEach(item => unique.set(item.signal, item.domain));
  return Array.from(unique.entries()).map(([signal, domain]) => ({ signal, domain }));
}

function buildExportText(
  clientName: string,
  objective: string,
  domain: string,
  depth: Depth,
  selectedQuestions: Question[],
) {
  const title = clientName.trim() || "Client";
  const lines = [
    `${title} Assessment Questions`,
    `Objective: ${objective}`,
    `Focus: ${domain}`,
    `Depth: ${depthLabels[depth]}`,
    "",
    ...selectedQuestions.flatMap((question, index) => [
      `${index + 1}. ${question.text}`,
      `Skill: ${question.skill}`,
      `Evaluation: ${question.evaluation}`,
      "",
    ]),
  ];

  return lines.join("\n");
}

export default function AssessmentQuestionGenerator() {
  const [clientName, setClientName] = useState("");
  const [objective, setObjective] = useState(callObjectives[0]);
  const [domain, setDomain] = useState("Auto");
  const [depth, setDepth] = useState<Depth>("diagnostic");
  const [count, setCount] = useState(5);
  const [notes, setNotes] = useState("");
  const [refreshSeed, setRefreshSeed] = useState(0);
  const [copied, setCopied] = useState(false);

  const signals = useMemo(() => inferSignals(notes), [notes]);

  const selectedQuestions = useMemo(() => {
    return [...questionBank]
      .map(question => ({
        question,
        score: scoreQuestion(question, notes, domain, depth),
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (a.question.id + refreshSeed).localeCompare(b.question.id + refreshSeed);
      })
      .slice(0, count)
      .map(item => item.question);
  }, [count, depth, domain, notes, refreshSeed]);

  const exportText = useMemo(
    () => buildExportText(clientName, objective, domain, depth, selectedQuestions),
    [clientName, depth, domain, objective, selectedQuestions],
  );

  const copyQuestions = async () => {
    await navigator.clipboard.writeText(exportText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <PageLayout className="bg-slate-50">
      <div className="container py-6 lg:py-8">
        <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase text-blue-700">
              <Sparkles className="h-4 w-4" />
              Internal Client Tool
            </div>
            <h1 className="text-3xl font-semibold text-slate-950">
              Consulting Assessment Question Generator
            </h1>
          </div>
          <button
            type="button"
            onClick={copyQuestions}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Copied" : "Copy Questions"}
          </button>
        </div>

        <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
          <section className="space-y-4">
            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Clipboard className="h-4 w-4 text-blue-700" />
                Call Setup
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  Client
                  <input
                    value={clientName}
                    onChange={event => setClientName(event.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-blue-700"
                    placeholder="Client or company name"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Objective
                  <select
                    value={objective}
                    onChange={event => setObjective(event.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-700"
                  >
                    {callObjectives.map(item => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Focus
                  <select
                    value={domain}
                    onChange={event => setDomain(event.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-700"
                  >
                    {domains.map(item => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Question Count
                  <input
                    type="number"
                    min={3}
                    max={8}
                    value={count}
                    onChange={event => setCount(Number(event.target.value))}
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-blue-700"
                  />
                </label>
              </div>

              <div className="mt-4">
                <div className="mb-2 text-sm font-medium text-slate-700">Depth</div>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(depthLabels) as Depth[]).map(item => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setDepth(item)}
                      className={`h-10 rounded-md border px-2 text-sm font-medium transition ${
                        depth === item
                          ? "border-blue-700 bg-blue-700 text-white"
                          : "border-slate-300 bg-white text-slate-700 hover:border-blue-700"
                      }`}
                    >
                      {depthLabels[item]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <MessageSquareText className="h-4 w-4 text-blue-700" />
                  Live Notes
                </div>
                <button
                  type="button"
                  onClick={() => setRefreshSeed(seed => seed + 1)}
                  className="inline-flex h-8 items-center gap-2 rounded-md border border-slate-300 px-3 text-xs font-medium text-slate-700 hover:border-blue-700 hover:text-blue-700"
                >
                  <RefreshCcw className="h-3.5 w-3.5" />
                  Refresh
                </button>
              </div>
              <textarea
                value={notes}
                onChange={event => setNotes(event.target.value)}
                rows={13}
                className="w-full resize-none rounded-md border border-slate-300 px-3 py-3 text-sm leading-6 text-slate-900 outline-none focus:border-blue-700"
                placeholder="Type short notes as the client talks: missed follow-ups, manual copying, onboarding delays, tool costs, unclear ownership..."
              />

              <div className="mt-3 min-h-12 text-xs text-slate-600">
                {signals.length ? (
                  <div className="flex flex-wrap gap-2">
                    {signals.slice(0, 10).map(item => (
                      <span
                        key={`${item.domain}-${item.signal}`}
                        className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1"
                      >
                        {item.domain}: {item.signal}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span>Signal tags appear here as notes mention workflow, leads, tools, costs, automation, ownership, or follow-up.</span>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Gauge className="h-4 w-4 text-blue-700" />
                Suggested Next Questions
              </div>
              <div className="text-xs text-slate-500">
                {domain} · {depthLabels[depth]}
              </div>
            </div>

            <div className="space-y-3">
              {selectedQuestions.map((question, index) => (
                <article
                  key={question.id}
                  className="rounded-md border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                    <span>{index + 1}</span>
                    <span>{question.domain}</span>
                    <span>{depthLabels[question.depth]}</span>
                  </div>
                  <p className="text-base font-semibold leading-7 text-slate-950">{question.text}</p>
                  <div className="mt-3 grid gap-2 text-sm leading-6 md:grid-cols-2">
                    <div>
                      <div className="font-semibold text-slate-800">Skill</div>
                      <div className="text-slate-600">{question.skill}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">Evaluation</div>
                      <div className="text-slate-600">{question.evaluation}</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
