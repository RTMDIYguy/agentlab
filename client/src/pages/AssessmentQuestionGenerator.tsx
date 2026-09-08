import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Clipboard,
  Copy,
  FileText,
  Gauge,
  MessageSquareText,
  RefreshCcw,
  Sparkles,
  Download,
  PlusCircle,
  Database,
  Trash2,
  CheckCircle2,
  BrainCircuit,
  Loader2,
} from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Depth = "exploratory" | "diagnostic" | "executive";

type Question = {
  id: string;
  domain: string;
  depth: Depth;
  text: string;
  skill: string;
  evaluation: string;
  signals: string[];
  isCustom?: boolean;
  source?: string;
};

type Finding = {
  domain: string;
  score: number;
  gap: string;
  recommendation: string;
  evidence: string[];
};

const depthLabels: Record<Depth, string> = {
  exploratory: "Exploratory",
  diagnostic: "Diagnostic",
  executive: "Executive",
};

// Diagnostic rules linking detected signals to Gaps and Next Steps
const diagnosticRules: Record<string, { gap: string; nextStep: string }> = {
  workflow: {
    gap: "Undocumented core workflows causing inconsistent delivery.",
    nextStep:
      "Document the step-by-step Standard Operating Procedure (SOP) for fulfillment.",
  },
  handoff: {
    gap: "Friction and data drops during team or department handoffs.",
    nextStep:
      "Define clear criteria and checklist requirements for client handoffs.",
  },
  delay: {
    gap: "Operational bottlenecks dragging down project timelines.",
    nextStep:
      "Map time-to-delivery metrics to pinpoint exactly where friction occurs.",
  },
  lead: {
    gap: "Inconsistent lead tracking creating a leaky marketing funnel.",
    nextStep:
      "Implement a structured pipeline in the CRM with explicit stage definitions.",
  },
  "follow up": {
    gap: "Lost revenue due to dropped or delayed sales follow-ups.",
    nextStep:
      "Set up automated task reminders or automated email sequences for warm leads.",
  },
  crm: {
    gap: "Underutilized sales infrastructure leading to tracking blindspots.",
    nextStep:
      "Clean up historical data and enforce centralized CRM logging for all reps.",
  },
  content: {
    gap: "Marketing activity is volume-focused rather than high-intent conversation generation.",
    nextStep:
      "Shift editorial calendar toward addressing top client objections.",
  },
  cash: {
    gap: "Limited short-term financial visibility impacting real-time decisions.",
    nextStep: "Build a weekly 13-week cash flow forecasting dashboard.",
  },
  budget: {
    gap: "Tooling and operational overhead growing without ROI auditing.",
    nextStep:
      "Conduct a comprehensive software spend audit to eliminate duplicate seats.",
  },
  tool: {
    gap: "Siloed platforms causing duplicate data entry across departments.",
    nextStep:
      "Build native data integrations or utilize webhooks to sync applications.",
  },
  manual: {
    gap: "Valuable labor hours spent on repetitive data entry.",
    nextStep:
      "Deploy a workflow automation script to eliminate human-in-the-loop copying.",
  },
  automate: {
    gap: "Lack of core systems leverage preventing operational scaling.",
    nextStep:
      "Identify the highest-frequency task and map its automation logic safely.",
  },
  decision: {
    gap: "Unclear operational ownership causing decision-making latency.",
    nextStep: "Establish a clear accountability matrix for leadership roles.",
  },
  knowledge: {
    gap: "High key-person dependency with mission-critical training locked in heads.",
    nextStep: "Build a centralized internal wiki/knowledge base.",
  },
};

const defaultSeedBank: Question[] = [
  {
    id: "ops-1",
    domain: "Operations",
    depth: "exploratory",
    text: "Walk me through what happens from the moment a new client says yes to the moment the work is fully delivered.",
    skill: "Process Discovery",
    evaluation:
      "Looks for sequence clarity, hidden handoffs, undocumented steps, and delay points.",
    signals: ["workflow", "handoff", "delivery", "onboarding", "process"],
  },
  {
    id: "ops-2",
    domain: "Operations",
    depth: "diagnostic",
    text: "Where does work most often slow down, get rechecked, or require someone to chase an update?",
    skill: "Bottleneck Identification",
    evaluation:
      "Assesses whether the client can name friction points and distinguish symptoms from root causes.",
    signals: ["delay", "bottleneck", "follow up", "status", "rework", "chase"],
  },
  {
    id: "ops-3",
    domain: "Operations",
    depth: "executive",
    text: "If the business doubled next quarter, which part of the operating system would break first?",
    skill: "Scalability Assessment",
    evaluation:
      "Reveals the highest-risk constraint in people, process, tools, or decision flow.",
    signals: ["scale", "growth", "capacity", "team", "break"],
  },
  {
    id: "sales-1",
    domain: "Sales",
    depth: "exploratory",
    text: "How does a new lead usually enter the business, and what has to happen before they become a qualified opportunity?",
    skill: "Lead Path Mapping",
    evaluation:
      "Checks whether the client has a defined path from attention to qualification.",
    signals: ["lead", "prospect", "referral", "inquiry", "pipeline"],
  },
  {
    id: "sales-2",
    domain: "Sales",
    depth: "diagnostic",
    text: "Which follow-up step is most likely to be missed when someone shows interest?",
    skill: "Follow-Up Reliability",
    evaluation:
      "Identifies lost revenue risk from inconsistent nurture, ownership, or timing.",
    signals: ["follow up", "reply", "email", "call", "missed", "nurture"],
  },
  {
    id: "sales-3",
    domain: "Sales",
    depth: "executive",
    text: "What would make the current sales process easier to trust without adding more meetings?",
    skill: "Sales System Design",
    evaluation:
      "Tests whether the client needs better tracking, clearer stages, stronger handoffs, or decision rules.",
    signals: ["trust", "meeting", "crm", "stage", "decision"],
  },
  {
    id: "marketing-1",
    domain: "Marketing",
    depth: "exploratory",
    text: "What are you currently publishing or sharing that reliably starts useful conversations?",
    skill: "Content Signal Review",
    evaluation:
      "Looks for proof that content is tied to audience response rather than activity volume.",
    signals: ["content", "linkedin", "post", "campaign", "engagement"],
  },
  {
    id: "marketing-2",
    domain: "Marketing",
    depth: "diagnostic",
    text: "How do you connect marketing activity to leads, booked calls, or revenue opportunities today?",
    skill: "Marketing Attribution",
    evaluation:
      "Assesses whether the client can trace marketing effort to business outcomes.",
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
    evaluation:
      "Surfaces whether the client has a working control layer for cash, revenue, and obligations.",
    signals: ["cash", "budget", "expense", "invoice", "revenue"],
  },
  {
    id: "finance-2",
    domain: "Finance",
    depth: "diagnostic",
    text: "Where do expenses, subscriptions, or tool costs become hard to justify against current revenue?",
    skill: "Cost Control",
    evaluation:
      "Identifies free-bootstrap or paid-tool limit walls before they become emergencies.",
    signals: ["subscription", "tool", "cost", "credit", "bill", "budget"],
  },
  {
    id: "finance-3",
    domain: "Finance",
    depth: "executive",
    text: "What revenue signal would justify upgrading the next paid tool or hiring outside help?",
    skill: "Investment Threshold Design",
    evaluation:
      "Tests whether spending decisions are tied to revenue, capacity, and timing.",
    signals: ["upgrade", "hire", "funding", "investment", "revenue"],
  },
  {
    id: "technology-1",
    domain: "Technology",
    depth: "exploratory",
    text: "Which tools does the team rely on every day, and where does information have to be copied by hand?",
    skill: "Toolchain Mapping",
    evaluation:
      "Finds integration gaps, duplicate data entry, and tool sprawl.",
    signals: [
      "tool",
      "software",
      "spreadsheet",
      "copy",
      "manual",
      "integration",
    ],
  },
  {
    id: "technology-2",
    domain: "Technology",
    depth: "diagnostic",
    text: "What repetitive task would create the most relief if it were automated safely?",
    skill: "Automation Opportunity Sizing",
    evaluation:
      "Separates high-leverage automation candidates from convenience automations.",
    signals: ["automate", "automation", "repeat", "manual", "relief", "task"],
  },
  {
    id: "technology-3",
    domain: "Technology",
    depth: "executive",
    text: "Where would automation create risk if the approval step or exception path were not designed well?",
    skill: "Automation Governance",
    evaluation:
      "Checks for judgment gates, compliance needs, exception handling, and rollback plans.",
    signals: ["approval", "risk", "exception", "compliance", "automation"],
  },
  {
    id: "leadership-1",
    domain: "Leadership",
    depth: "exploratory",
    text: "Who makes the final call when priorities conflict, and how does the team know the decision was made?",
    skill: "Decision Flow",
    evaluation:
      "Reveals unclear ownership, decision latency, and communication gaps.",
    signals: ["decision", "priority", "owner", "team", "communication"],
  },
  {
    id: "leadership-2",
    domain: "Leadership",
    depth: "diagnostic",
    text: "Which responsibilities live in someone's head instead of in a process the team can repeat?",
    skill: "Knowledge Capture",
    evaluation: "Identifies key-person dependency and documentation needs.",
    signals: [
      "knowledge",
      "training",
      "sop",
      "documentation",
      "responsibility",
    ],
  },
  {
    id: "leadership-3",
    domain: "Leadership",
    depth: "executive",
    text: "What operating habit would most improve trust between leadership, staff, and clients?",
    skill: "Operating Culture",
    evaluation:
      "Surfaces cadence, transparency, accountability, and service expectations.",
    signals: ["trust", "cadence", "accountability", "client", "staff"],
  },
];

const callObjectives = [
  "Initial onboarding",
  "Systems audit",
  "Automation discovery",
  "Growth bottleneck review",
  "Follow-up consultation",
];

const domainProfiles: Record<string, { gap: string; recommendation: string }> =
  {
    Operations: {
      gap: "Work appears to depend on informal handoffs, remembered steps, or unclear delivery flow.",
      recommendation:
        "Map the current delivery path, identify the slowest handoff, and define a visible status model before adding more tools.",
    },
    Sales: {
      gap: "Lead movement and follow-up reliability may be inconsistent enough to lose warm opportunities.",
      recommendation:
        "Define the lead stages, owner, next-action rules, and follow-up timing so every interested prospect has a clear path.",
    },
    Marketing: {
      gap: "Marketing activity may not be tied tightly enough to conversations, opportunities, or revenue signals.",
      recommendation:
        "Connect each campaign or content theme to a CTA, tracking field, and weekly review metric.",
    },
    Finance: {
      gap: "Spending decisions may be ahead of the current financial control layer or revenue proof.",
      recommendation:
        "Set upgrade thresholds for tools, subscriptions, and outside help based on cash, opportunity value, and capacity.",
    },
    Technology: {
      gap: "The toolchain likely contains manual copying, duplicate entry, or automation candidates without governance.",
      recommendation:
        "Choose one high-relief repetitive task, document the field flow, and automate it with an approval or exception path.",
    },
    Leadership: {
      gap: "Decision rights, ownership, or key knowledge may be too dependent on individual memory.",
      recommendation:
        "Capture the key responsibilities, decision points, and recurring operating cadence in a short SOP or checklist.",
    },
  };

function scoreQuestion(
  question: Question,
  notes: string,
  domain: string,
  depth: Depth
) {
  const normalized = notes.toLowerCase();
  const signalHits = (question.signals || []).filter(signal =>
    normalized.includes(signal)
  ).length;
  const domainScore = domain === "Auto" || question.domain === domain ? 6 : 0;
  const depthScore = question.depth === depth ? 4 : 0;
  return domainScore + depthScore + signalHits * 3;
}

export default function AssessmentQuestionGenerator() {
  const queryClient = useQueryClient();

  const [clientName, setClientName] = useState("");
  const [objective, setObjective] = useState(callObjectives[0]);
  const [domain, setDomain] = useState("Auto");
  const [depth, setDepth] = useState<Depth>("diagnostic");
  const [count, setCount] = useState(5);
  const [notes, setNotes] = useState("");
  const [refreshSeed, setRefreshSeed] = useState(0);
  const [copied, setCopied] = useState(false);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // New Question Form State
  const [newQuestion, setNewQuestion] = useState({
    domain: "Operations",
    depth: "diagnostic" as Depth,
    text: "",
    skill: "",
    evaluation: "",
    signals: "",
  });

  // AI Generator Form State
  const [aiGenDomain, setAiGenDomain] = useState("Operations");
  const [aiGenFocus, setAiGenFocus] = useState("Bottlenecks & Hand-offs");
  const [aiGenIndustry, setAiGenIndustry] = useState("B2B Professional Services");

  // Fetch Questions from PostgreSQL Database via API
  const { data: qData, isLoading: isLoadingQuestions } = useQuery({
    queryKey: ["assessment-questions"],
    queryFn: async () => {
      const res = await fetch("/api/assessment-questions");
      if (!res.ok) throw new Error("Failed to load questions from database");
      return res.json();
    },
  });

  const questionBank: Question[] = useMemo(() => {
    if (qData?.questions && Array.isArray(qData.questions) && qData.questions.length > 0) {
      return qData.questions;
    }
    return defaultSeedBank;
  }, [qData]);

  const domains = useMemo(() => {
    return ["Auto", ...Array.from(new Set(questionBank.map(q => q.domain)))];
  }, [questionBank]);

  // Mutations
  const addQuestionMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/assessment-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save custom question");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment-questions"] });
      setIsAddModalOpen(false);
      setNewQuestion({
        domain: "Operations",
        depth: "diagnostic",
        text: "",
        skill: "",
        evaluation: "",
        signals: "",
      });
      toast.success("Question Saved", {
        description: "New diagnostic question added to the PostgreSQL question pool.",
      });
    },
    onError: (err: any) => {
      toast.error("Save Failed", {
        description: err.message || "Could not add question",
      });
    },
  });

  const aiExpandMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/assessment-questions/generate-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: aiGenDomain,
          focusArea: aiGenFocus,
          industry: aiGenIndustry,
          count: 3,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate AI questions");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["assessment-questions"] });
      setIsAiModalOpen(false);
      toast.success("Question Pool Expanded!", {
        description: `Successfully synthesized and persisted ${data.questions?.length || 3} new diagnostic questions into PostgreSQL.`,
      });
    },
    onError: (err: any) => {
      toast.error("AI Synthesis Error", {
        description: err.message || "Failed to generate AI questions",
      });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/assessment-questions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete question");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment-questions"] });
      toast.success("Question Removed");
    },
  });

  const saveSessionMutation = useMutation({
    mutationFn: async (sessionPayload: any) => {
      const res = await fetch("/api/assessment-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionPayload),
      });
      if (!res.ok) throw new Error("Failed to save session");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Session Saved to Database", {
        description: "Discovery call notes and gap findings have been recorded.",
      });
    },
  });

  const signals = useMemo(() => {
    const normalized = notes.toLowerCase();
    const hits = questionBank
      .flatMap(q => (q.signals || []).map(sig => ({ signal: sig, domain: q.domain })))
      .filter(item => normalized.includes(item.signal));

    const unique = new Map<string, string>();
    hits.forEach(item => unique.set(item.signal, item.domain));
    return Array.from(unique.entries()).map(([signal, domain]) => ({
      signal,
      domain,
    }));
  }, [notes, questionBank]);

  const activeInsights = useMemo(() => {
    return signals
      .filter(item => diagnosticRules[item.signal])
      .map(item => ({
        signal: item.signal,
        domain: item.domain,
        ...diagnosticRules[item.signal],
      }));
  }, [signals]);

  const findings = useMemo(() => {
    const normalized = notes.toLowerCase();
    return Object.entries(domainProfiles)
      .map(([d, profile]) => {
        const questions = questionBank.filter(q => q.domain === d);
        const evidence = Array.from(
          new Set(
            questions.flatMap(q =>
              (q.signals || []).filter(signal => normalized.includes(signal))
            )
          )
        );

        return {
          domain: d,
          score: evidence.length,
          gap: profile.gap,
          recommendation: profile.recommendation,
          evidence,
        };
      })
      .filter(finding => finding.score > 0)
      .sort((a, b) => b.score - a.score || a.domain.localeCompare(b.domain))
      .slice(0, 4);
  }, [notes, questionBank]);

  const selectedQuestions = useMemo(() => {
    return [...questionBank]
      .map(q => ({
        question: q,
        score: scoreQuestion(q, notes, domain, depth),
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (a.question.id + refreshSeed).localeCompare(
          b.question.id + refreshSeed
        );
      })
      .slice(0, count || 3)
      .map(item => item.question);
  }, [count, depth, domain, notes, questionBank, refreshSeed]);

  const masterReportText = useMemo(() => {
    const title = clientName.trim() || "Client";
    const diagnosticSection = activeInsights.length
      ? activeInsights.flatMap((ins, i) => [
          `DIAGNOSTIC ARCHETYPE #${i + 1}: [Domain: ${ins.domain} / Tag: ${ins.signal}]`,
          `Identified Systemic Gap: ${ins.gap}`,
          `Recommended Next Step:  ${ins.nextStep}`,
          "",
        ])
      : [
          "No core structural gaps explicitly auto-detected from current live notes yet.",
        ];

    const findingsSection = findings.length
      ? findings.flatMap((finding, i) => [
          `DOMAIN GAP #${i + 1}: ${finding.domain} (${finding.score} evidence signals)`,
          `Likely Gap: ${finding.gap}`,
          `Recommended Next Step: ${finding.recommendation}`,
          `Evidence Signals: ${finding.evidence.join(", ")}`,
          "",
        ])
      : [
          "No strong domain-level gap signals detected yet. Add more call notes for a fuller picture.",
        ];

    return [
      `==================================================`,
      `${title.toUpperCase()} ASSESSMENT RAPID DISCOVERY PACKET`,
      `==================================================`,
      `Objective Focus : ${objective}`,
      `Evaluation Depth: ${depthLabels[depth]}`,
      `Domain Filter   : ${domain}`,
      `Generated Date  : ${new Date().toLocaleDateString()}`,
      "",
      `--------------------------------------------------`,
      `I. RECOMMENDED DIAGNOSTIC QUESTIONS (${selectedQuestions.length} Selected)`,
      `--------------------------------------------------`,
      ...selectedQuestions.flatMap((q, index) => [
        `Q${index + 1} [${q.domain} • ${depthLabels[q.depth]} • Skill: ${q.skill}]`,
        `"${q.text}"`,
        `Evaluation Guide: ${q.evaluation}`,
        `Detected Signal Triggers: ${(q.signals || []).join(", ")}`,
        "",
      ]),
      `--------------------------------------------------`,
      `II. REAL-TIME DIAGNOSTIC GAPS & ACTION STEPS`,
      `--------------------------------------------------`,
      ...diagnosticSection,
      `--------------------------------------------------`,
      `III. DOMAIN MATURITY & SYSTEMIC FINDINGS`,
      `--------------------------------------------------`,
      ...findingsSection,
      `--------------------------------------------------`,
      `IV. DISCOVERY NOTES ARCHIVE`,
      `--------------------------------------------------`,
      notes.trim() || "No notes entered for this session.",
    ].join("\n");
  }, [
    activeInsights,
    clientName,
    depth,
    domain,
    findings,
    notes,
    objective,
    selectedQuestions,
  ]);

  const handleCopyReport = () => {
    navigator.clipboard.writeText(masterReportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    const filename = `${(clientName || "discovery-session").toLowerCase().replace(/[^a-z0-9]/g, "-")}-assessment-report.txt`;
    const element = document.createElement("a");
    const file = new Blob([masterReportText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSaveSession = () => {
    saveSessionMutation.mutate({
      clientName: clientName || "Client Discovery",
      domain,
      callNotes: notes || "Discovery session completed.",
      detectedSignals: signals.map(s => s.signal),
      findings,
      selectedQuestionIds: selectedQuestions.map(q => q.id),
    });
  };

  const handleAddQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.text || !newQuestion.skill || !newQuestion.evaluation) {
      toast.error("Please fill in all required fields");
      return;
    }
    const sigArray = newQuestion.signals
      .split(",")
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);

    addQuestionMutation.mutate({
      domain: newQuestion.domain,
      depth: newQuestion.depth,
      text: newQuestion.text,
      skill: newQuestion.skill,
      evaluation: newQuestion.evaluation,
      signals: sigArray,
    });
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header with DB Pool Badge & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-border/50">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Database className="w-3.5 h-3.5" />
                Postgres Database Connected
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                {questionBank.length} Questions in Pool
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Consulting Assessment Question Generator
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Live diagnostic question engine wired to the AgentLab PostgreSQL pool. Expands continuously with custom inputs and AI synthesis.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-primary" />
              Add Question
            </Button>
            <Button
              size="sm"
              onClick={() => setIsAiModalOpen(true)}
              className="gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white"
            >
              <BrainCircuit className="w-4 h-4" />
              AI Expand Pool
            </Button>
          </div>
        </div>

        {/* Main Grid: Discovery Inputs & Live Question Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Context & Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-card border border-border/60 rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Gauge className="w-5 h-5 text-primary" />
                Session Parameters
              </h2>

              <div>
                <Label htmlFor="client-name" className="text-xs font-medium">
                  Client / Company Name
                </Label>
                <Input
                  id="client-name"
                  placeholder="e.g. Apex Industrial Logistics"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">Objective Focus</Label>
                  <select
                    className="w-full mt-1 bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={objective}
                    onChange={e => setObjective(e.target.value)}
                  >
                    {callObjectives.map(obj => (
                      <option key={obj} value={obj}>
                        {obj}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-medium">Domain Filter</Label>
                  <select
                    className="w-full mt-1 bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={domain}
                    onChange={e => setDomain(e.target.value)}
                  >
                    {domains.map(d => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">Probing Depth</Label>
                  <select
                    className="w-full mt-1 bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={depth}
                    onChange={e => setDepth(e.target.value as Depth)}
                  >
                    <option value="exploratory">Exploratory</option>
                    <option value="diagnostic">Diagnostic</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-medium">Questions to Surface</Label>
                  <select
                    className="w-full mt-1 bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={count}
                    onChange={e => setCount(Number(e.target.value))}
                  >
                    <option value={3}>3 Questions</option>
                    <option value={5}>5 Questions</option>
                    <option value={8}>8 Questions</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="call-notes" className="text-xs font-medium flex justify-between">
                  <span>Live Call Notes & Discovery Signals</span>
                  <span className="text-muted-foreground">{signals.length} signals detected</span>
                </Label>
                <Textarea
                  id="call-notes"
                  rows={6}
                  placeholder="Paste raw call transcript or rough notes here. The engine detects pain tags like 'handoff', 'delay', 'crm', 'manual'..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="mt-1 font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRefreshSeed(prev => prev + 1)}
                  className="gap-1 text-xs"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  Shuffle Order
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSaveSession}
                  disabled={saveSessionMutation.isPending}
                  className="gap-1 text-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Save Session
                </Button>
              </div>
            </div>

            {/* Detected Diagnostic Gaps */}
            {activeInsights.length > 0 && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5 space-y-3">
                <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Detected Structural Gaps ({activeInsights.length})
                </h3>
                <div className="space-y-2.5">
                  {activeInsights.map((ins, i) => (
                    <div
                      key={i}
                      className="text-xs p-2.5 rounded-lg bg-card/60 border border-border/40"
                    >
                      <div className="font-medium text-foreground">
                        [{ins.domain}] {ins.gap}
                      </div>
                      <div className="text-muted-foreground mt-1">
                        → Action: {ins.nextStep}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Surfaced Questions & Report */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-card border border-border/60 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquareText className="w-5 h-5 text-primary" />
                  Surfaced Diagnostic Questions
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyReport}
                    className="gap-1.5 text-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? "Copied!" : "Copy Packet"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadReport}
                    className="gap-1.5 text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export
                  </Button>
                </div>
              </div>

              {isLoadingQuestions ? (
                <div className="py-12 flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <p className="text-xs">Connecting to Postgres Question Pool...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedQuestions.map((q, idx) => (
                    <div
                      key={q.id || idx}
                      className="p-4 rounded-lg bg-background border border-border/60 hover:border-primary/40 transition-colors relative group"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                            {q.domain}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-secondary-foreground">
                            {depthLabels[q.depth]}
                          </span>
                          <span className="text-xs text-muted-foreground font-medium">
                            Skill: {q.skill}
                          </span>
                        </div>

                        {q.isCustom && (
                          <button
                            onClick={() => deleteQuestionMutation.mutate(q.id)}
                            className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1"
                            title="Delete custom question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <p className="text-sm font-semibold text-foreground mb-2">
                        "{q.text}"
                      </p>

                      <div className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-md border border-border/30">
                        <strong className="text-foreground">What to listen for: </strong>
                        {q.evaluation}
                      </div>

                      {q.signals && q.signals.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {q.signals.map((sig, sIdx) => (
                            <span
                              key={sIdx}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/60 text-muted-foreground font-mono"
                            >
                              #{sig}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assessment Packet Output Preview */}
            <div className="bg-card border border-border/60 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-primary" />
                Live Generated Assessment Packet
              </h3>
              <pre className="text-xs font-mono bg-muted/30 p-4 rounded-lg border border-border/40 overflow-x-auto max-h-72 whitespace-pre-wrap text-muted-foreground">
                {masterReportText}
              </pre>
            </div>
          </div>
        </div>

        {/* Dialog: Add Custom Question */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Add Question to Database
              </DialogTitle>
              <DialogDescription>
                Persist a new high-signal question into the PostgreSQL pool so it is available across all sessions and agents.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddQuestionSubmit} className="space-y-3.5 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Domain</Label>
                  <select
                    className="w-full mt-1 bg-background border border-input rounded-md px-3 py-1.5 text-sm"
                    value={newQuestion.domain}
                    onChange={e => setNewQuestion({ ...newQuestion, domain: e.target.value })}
                  >
                    <option value="Operations">Operations</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                    <option value="Technology">Technology</option>
                    <option value="Leadership">Leadership</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs">Probing Depth</Label>
                  <select
                    className="w-full mt-1 bg-background border border-input rounded-md px-3 py-1.5 text-sm"
                    value={newQuestion.depth}
                    onChange={e => setNewQuestion({ ...newQuestion, depth: e.target.value as Depth })}
                  >
                    <option value="exploratory">Exploratory</option>
                    <option value="diagnostic">Diagnostic</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-xs">Consulting Skill / Archetype</Label>
                <Input
                  placeholder="e.g. Latency Audit, Revenue Attribution"
                  value={newQuestion.skill}
                  onChange={e => setNewQuestion({ ...newQuestion, skill: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label className="text-xs">Verbatim Question</Label>
                <Textarea
                  placeholder="The exact question to ask the founder..."
                  value={newQuestion.text}
                  onChange={e => setNewQuestion({ ...newQuestion, text: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label className="text-xs">Evaluation Criteria (What to listen for)</Label>
                <Textarea
                  placeholder="Red flags, indicators of maturity, or hidden bottlenecks..."
                  value={newQuestion.evaluation}
                  onChange={e => setNewQuestion({ ...newQuestion, evaluation: e.target.value })}
                  rows={2}
                  required
                />
              </div>

              <div>
                <Label className="text-xs">Signal Keywords (comma-separated)</Label>
                <Input
                  placeholder="e.g. handoff, delay, crm, rework"
                  value={newQuestion.signals}
                  onChange={e => setNewQuestion({ ...newQuestion, signals: e.target.value })}
                />
              </div>

              <DialogFooter className="pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={addQuestionMutation.isPending}>
                  {addQuestionMutation.isPending ? "Saving..." : "Save to Database"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog: AI Expand Pool */}
        <Dialog open={isAiModalOpen} onOpenChange={setIsAiModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-primary" />
                AI Question Pool Expansion
              </DialogTitle>
              <DialogDescription>
                Use Gemini to synthesize new probing diagnostic questions tailored to a specific domain or industry and save them to PostgreSQL.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <div>
                <Label className="text-xs">Target Domain</Label>
                <select
                  className="w-full mt-1 bg-background border border-input rounded-md px-3 py-2 text-sm"
                  value={aiGenDomain}
                  onChange={e => setAiGenDomain(e.target.value)}
                >
                  <option value="Operations">Operations (Fulfillment & Delivery)</option>
                  <option value="Sales">Sales (Pipeline & Conversion Velocity)</option>
                  <option value="Marketing">Marketing (ICP & Signal Ingestion)</option>
                  <option value="Finance">Finance (Control Layer & Ledger Visibility)</option>
                  <option value="Technology">Technology (Automations & Tool Sprawl)</option>
                  <option value="Leadership">Leadership (Culture & Decision Rights)</option>
                </select>
              </div>

              <div>
                <Label className="text-xs">Diagnostic Focus Area</Label>
                <Input
                  value={aiGenFocus}
                  onChange={e => setAiGenFocus(e.target.value)}
                  placeholder="e.g. Scope Creep, Commission Structure, Churn"
                />
              </div>

              <div>
                <Label className="text-xs">Client Industry / Archetype</Label>
                <Input
                  value={aiGenIndustry}
                  onChange={e => setAiGenIndustry(e.target.value)}
                  placeholder="e.g. Commercial Real Estate, MedSpas, IT Consulting"
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAiModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => aiExpandMutation.mutate()}
                disabled={aiExpandMutation.isPending}
                className="bg-primary text-primary-foreground gap-1.5"
              >
                {aiExpandMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Synthesizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate & Save 3 Questions
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}
