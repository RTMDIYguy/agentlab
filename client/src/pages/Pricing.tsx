import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Clock,
  Layers,
  ShoppingBag,
  Target,
  Share2,
  TrendingUp,
  Cpu,
  Calendar,
  Smartphone,
  CheckCircle2,
  HeartHandshake,
  Users,
  Award,
  BookOpen,
  DollarSign,
  HelpCircle,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Pricing() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [selectedDeptTab, setSelectedDeptTab] = useState("mkt");
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");

  const isGodmode = user?.role === "admin" || (user as any)?.name === "Thebossrob" || (user as any)?.username === "bossrob";

  const departments = [
    {
      code: "mkt",
      name: "Marketing (MKT)",
      price: "$99/mo",
      workflowsCount: 9,
      automationRate: "92%",
      timeSaved: "6.0 hrs/wk",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      description: "Complete inbound & outbound authority engine. Autonomous scraping, lead enrichment, content syndication, and SEO audit DAGs.",
      workflows: [
        { code: "MKT-01", name: "Autonomous Lead Scraper & Prospect Discovery", impact: "Extracts verified B2B targets" },
        { code: "MKT-02", name: "Email Nurture & Drip Sequence Matrix", impact: "High-conversion follow-ups" },
        { code: "MKT-03", name: "Domain Authority & Signal Map Synthesizer", impact: "Pinpoints high-margin wedges" },
        { code: "MKT-04", name: "Multi-Channel Campaign Asset Assembler", impact: "Generates launch packets" },
        { code: "MKT-05", name: "Lead Validation & Enrichment Engine", impact: "Zero bounce rate filtering" },
        { code: "MKT-06", name: "Content Creation & Dissemination Engine", impact: "Syndicates across LinkedIn & web" },
        { code: "MKT-07", name: "Paid Acquisition Signal & Ad Budget Optimizer", impact: "Maximizes ROAS" },
        { code: "MKT-08", name: "Social Content Scheduling & Cross-Posting", impact: "Automates calendar queue" },
        { code: "MKT-09", name: "Founder Roundtable & Event Funnel Engine", impact: "Drives event attendance" }
      ]
    },
    {
      code: "sal",
      name: "Sales (SAL)",
      price: "$149/mo",
      workflowsCount: 6,
      automationRate: "89%",
      timeSaved: "5.5 hrs/client",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      description: "Founder-led deal acceleration and pipeline automation. Automated pitch briefs, custom proposal drafting, and objection matrix.",
      workflows: [
        { code: "SAL-01", name: "Inbound Lead Triage & Qualification Dispatch", impact: "Instant response routing" },
        { code: "SAL-02", name: "Discovery Call Preparation & Intelligence Dossier", impact: "Founder briefing packet" },
        { code: "SAL-03", name: "Automated Proposal & Statement of Work Generator", impact: "Closes deals in hours" },
        { code: "SAL-04", name: "Objection Handling & Value Reframing Matrix", impact: "Real-time talk tracks" },
        { code: "SAL-05", name: "Pipeline Velocity & Deal Health Forecasting", impact: "Predictive revenue signals" },
        { code: "SAL-06", name: "Closing Sequence & Contract Execution Workflow", impact: "Frictionless signing loop" }
      ]
    },
    {
      code: "ops",
      name: "Operations (OPS)",
      price: "$199/mo",
      workflowsCount: 8,
      automationRate: "94%",
      timeSaved: "7.5 hrs/wk",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      description: "Informational drift elimination and single-source-of-truth governance. SOP standardizers, Google Drive sync, and daily command briefs.",
      workflows: [
        { code: "OPS-01", name: "Daily Command Center Executive Brief Synthesizer", impact: "Morning operational brief" },
        { code: "OPS-02", name: "Cross-Workflow Identifier Control & Namespace Auditor", impact: "Eliminates naming drift" },
        { code: "OPS-03", name: "SOP Document Standardizer & Frontmatter Validator", impact: "Continuous policy audit" },
        { code: "OPS-04", name: "Automated Google Drive Workspace Mirror & Sync", impact: "Real-time file backup" },
        { code: "OPS-05", name: "Autonomous Swarm Task Queue & Worker Daemon", impact: "Background task execution" },
        { code: "OPS-06", name: "System Auditing & SAIF Compliance Verification", impact: "Deterministic AI guardrails" },
        { code: "OPS-07", name: "Agent Development Kit (ADK) Scaffold Engine", impact: "Deploys custom swarm nodes" },
        { code: "OPS-08", name: "Workspace Memory Secretary & Decision Registry", impact: "Zero context loss memory" }
      ]
    },
    {
      code: "fin",
      name: "Finance (FIN)",
      price: "$149/mo",
      workflowsCount: 7,
      automationRate: "91%",
      timeSaved: "4.5 hrs/mo",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      description: "Lean cashflow visibility and automated bookkeeping reconciliation. Burn-rate tracking, Stripe webhook auditing, and diagnostic reports.",
      workflows: [
        { code: "FIN-01", name: "Automated Bank & Stripe Ledger Reconciliation", impact: "Instant transaction matching" },
        { code: "FIN-02", name: "Client Invoice Generation & Payment Follow-Up", impact: "Accelerates receivables" },
        { code: "FIN-03", name: "Burn Rate & Cashflow Runway Forecaster", impact: "Predictive financial runway" },
        { code: "FIN-04", name: "Expense Categorization & Tax Readiness Exporter", impact: "Clean CPA-ready exports" },
        { code: "FIN-05", name: "Contract Value & Recurring Revenue Tracker", impact: "MRR & ARR analytics" },
        { code: "FIN-06", name: "Vendor Contract & Subscription Audit Engine", impact: "Cuts SaaS shelfware" },
        { code: "FIN-07", name: "Unit Economics & Gross Margin Calculator", impact: "Ensures per-client profit" }
      ]
    },
    {
      code: "ful",
      name: "Fulfillment (FUL)",
      price: "$149/mo",
      workflowsCount: 8,
      automationRate: "90%",
      timeSaved: "6.0 hrs/client",
      badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      description: "Client onboarding, deliverable staging, and QA assurance. Frictionless handoffs that delight clients and ensure 100% SLA adherence.",
      workflows: [
        { code: "FUL-01", name: "Automated Client Onboarding & Workspace Provisioner", impact: "Zero-lag day 1 setup" },
        { code: "FUL-02", name: "Deliverable Milestone & SLA Tracking Engine", impact: "Proactive status alerts" },
        { code: "FUL-03", name: "Asset Staging & Quality Assurance Auditor", impact: "Guaranteed deliverable polish" },
        { code: "FUL-04", name: "Client Feedback Ingestion & Revision Loop", impact: "Structured change requests" },
        { code: "FUL-05", name: "Handover Packet & Implementation Guide Generator", impact: "Empowers client teams" },
        { code: "FUL-06", name: "Multi-Tenant Workspace Partitioning Worker", impact: "Total data isolation" },
        { code: "FUL-07", name: "Contractor & Upwork Fulfillment Dispatcher", impact: "Scalable human-in-loop" },
        { code: "FUL-08", name: "Client Satisfaction & Net Promoter Survey Engine", impact: "Captures instant proof" }
      ]
    },
    {
      code: "cul",
      name: "Culture & Team (CUL)",
      price: "$99/mo",
      workflowsCount: 4,
      automationRate: "88%",
      timeSaved: "3.5 hrs/wk",
      badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      description: "Servant leadership alignment and team cadence. Synthesizes weekly founder syncs, maintains team values, and fosters accountability.",
      workflows: [
        { code: "CUL-01", name: "Servant Leadership Code & Core Values Evaluator", impact: "Upholds agency standard" },
        { code: "CUL-02", name: "Weekly Founder Cadence & Standup Synthesizer", impact: "Crystal-clear weekly goals" },
        { code: "CUL-03", name: "Asynchronous Team Alignment & Blocker Resolver", impact: "Unblocks engineers fast" },
        { code: "CUL-04", name: "Quarterly Performance & Growth Planning Loop", impact: "Founder & team growth" }
      ]
    },
    {
      code: "aft",
      name: "After-Sales & Retention (AFT)",
      price: "$99/mo",
      workflowsCount: 3,
      automationRate: "88%",
      timeSaved: "4.0 hrs/client",
      badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      description: "Churn prevention signal monitoring, quarterly business review synthesis, and customer advocacy funnels.",
      workflows: [
        { code: "AFT-01", name: "Early Churn Risk Signal & Engagement Monitor", impact: "Prevents client dropoff" },
        { code: "AFT-02", name: "Quarterly Business Review (QBR) Deck Synthesizer", impact: "Demonstrates ROI clearly" },
        { code: "AFT-03", name: "Customer Advocacy & Referral Capture Loop", impact: "Turns happy clients into advocates" }
      ]
    }
  ];

  const activeDept = departments.find(d => d.code === selectedDeptTab) || departments[0];

  return (
    <PageLayout>
      <div className="min-h-screen bg-background text-foreground">
        {/* Servant Leadership Hero Banner */}
        <section className="relative overflow-hidden pt-16 pb-20 border-b border-border bg-gradient-to-b from-primary/10 via-background to-background">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-semibold mb-6 shadow-sm">
              <HeartHandshake className="w-4 h-4" />
              <span>Servant Leadership Guarantee: We Win Only When You Win</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
              Our Complete Sales Showroom.
              <span className="block text-primary mt-2">Zero Lock-In. Transparent Value.</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We walk beside you every step of the journey—from nailing your first message wedge to deploying autonomous multi-agent operating systems that you truly own.
            </p>

            {/* Interval Toggle */}
            <div className="mt-10 inline-flex items-center p-1 bg-muted/60 border border-border/80 rounded-xl shadow-inner">
              <button
                onClick={() => setBillingInterval("monthly")}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                  billingInterval === "monthly"
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly Flexibility
              </button>
              <button
                onClick={() => setBillingInterval("yearly")}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  billingInterval === "yearly"
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Annual Commitment
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* The 3 Core Offer Pillars */}
        <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-2 text-xs">The Official Offer Ladder</Badge>
            <h2 className="text-3xl font-extrabold text-foreground">Choose How You Want to Partner</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
              Whether you need a rapid 1-week starter sprint, a full autonomous operations backbone, or modular brains.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Pillar 1: Starter Sprint */}
            <Card className="border border-border/80 bg-card/60 backdrop-blur flex flex-col justify-between hover:border-primary/40 transition-all shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center mb-2">
                  <Badge variant="secondary" className="text-xs font-bold">3–5 Day Sprint</Badge>
                  <span className="text-xs font-mono text-muted-foreground">One-Time Setup</span>
                </div>
                <CardTitle className="text-2xl font-black text-foreground">Founder Signal System</CardTitle>
                <CardDescription className="text-xs font-medium text-muted-foreground">
                  Know exactly who you're for, what to say, and where to say it.
                </CardDescription>
                <div className="pt-4">
                  <div className="text-4xl font-black text-foreground">$1,000</div>
                  <span className="text-xs text-muted-foreground">Turnkey Sprint & First Content Batch</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 flex-1 text-xs text-muted-foreground pt-2 border-t border-border/40">
                <div className="font-semibold text-foreground">Everything Included in Sprint:</div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Signal Brief:</strong> Precise ICP & urgent pain diagnosis.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Message Map:</strong> Value talking points & offer wedges.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>First Content Batch:</strong> 3 high-signal authority posts.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Human Outreach Matrix:</strong> 1-on-1 peer message sequence.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Proof-Capture Loop:</strong> Live response tracker (n8n & Sheets).</span>
                  </li>
                </ul>
              </CardContent>

              <CardFooter className="pt-4 border-t border-border/40">
                <Button 
                  className="w-full text-xs font-bold gap-1.5 shadow" 
                  variant="outline"
                  onClick={() => setLocation("/founder-signal-system")}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  View Sprint & Book Diagnostic
                </Button>
              </CardFooter>
            </Card>

            {/* Pillar 2: Ownable OS (Featured) */}
            <Card className="border-2 border-primary bg-gradient-to-b from-primary/10 via-card to-card flex flex-col justify-between relative shadow-xl scale-105 z-10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow">
                Most Popular • Complete Agency OS
              </div>

              <CardHeader className="pb-4 pt-6">
                <div className="flex justify-between items-center mb-2">
                  <Badge className="bg-primary text-primary-foreground text-xs font-bold">Autonomous Swarms</Badge>
                  <span className="text-xs font-mono text-emerald-400">30-Day Risk-Free Trial</span>
                </div>
                <CardTitle className="text-2xl font-black text-foreground">Ownable OS (Agentic OS)</CardTitle>
                <CardDescription className="text-xs font-medium text-muted-foreground">
                  Your full agency operational backbone with all 7 department playbooks.
                </CardDescription>
                <div className="pt-4">
                  <div className="text-4xl font-black text-primary">
                    {billingInterval === "monthly" ? "$500" : "$400"}
                    <span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Unlimited Swarms & Workflows</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 flex-1 text-xs text-muted-foreground pt-2 border-t border-primary/20">
                <div className="font-semibold text-foreground">Core OS Capabilities:</div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span><strong>All 7 Department Playbooks Mounted:</strong> MKT, SAL, OPS, FIN, FUL, CUL, AFT.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span><strong>Multi-Agent Swarm Concurrency:</strong> Deploy Alpha-Node, Coder, SDR, and Auditor bots.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span><strong>Python SDK & Colab Harness:</strong> Drive your OS programmatically via Python API.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span><strong>SAIF Telemetry & Governance:</strong> Deterministic guardrails and audit logging.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span><strong>Graceful Downgrade Protection:</strong> Never locked out. Keep 1 active agent forever.</span>
                  </li>
                </ul>
              </CardContent>

              <CardFooter className="pt-4 border-t border-primary/20">
                <Button 
                  className="w-full text-xs font-bold gap-1.5 shadow-md bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => {
                    toast.success("Starting your 30-day Ownable OS Pro Trial...");
                    setLocation("/dashboard");
                  }}
                >
                  <Zap className="w-4 h-4" />
                  Start 30-Day Pro Trial
                </Button>
              </CardFooter>
            </Card>

            {/* Pillar 3: Modular Playbooks */}
            <Card className="border border-border/80 bg-card/60 backdrop-blur flex flex-col justify-between hover:border-primary/40 transition-all shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center mb-2">
                  <Badge variant="secondary" className="text-xs font-bold">Modular Brains</Badge>
                  <span className="text-xs font-mono text-muted-foreground">Pick & Choose</span>
                </div>
                <CardTitle className="text-2xl font-black text-foreground">Department Playbooks</CardTitle>
                <CardDescription className="text-xs font-medium text-muted-foreground">
                  Mount specific department brains to solve bottlenecks à la carte.
                </CardDescription>
                <div className="pt-4">
                  <div className="text-4xl font-black text-foreground">
                    $99 – $199
                    <span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Per Department Module</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 flex-1 text-xs text-muted-foreground pt-2 border-t border-border/40">
                <div className="font-semibold text-foreground">Available Modules:</div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Marketing ($99/mo):</strong> 9 inbound & outbound DAG workflows.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Sales ($149/mo):</strong> 6 pipeline acceleration workflows.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Operations ($199/mo):</strong> 8 drift elimination & SOP workflows.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Finance ($149/mo):</strong> 7 cashflow & ledger reconciliation DAGs.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Fulfillment ($149/mo):</strong> 8 client onboarding & QA workflows.</span>
                  </li>
                </ul>
              </CardContent>

              <CardFooter className="pt-4 border-t border-border/40">
                <Button 
                  className="w-full text-xs font-bold gap-1.5 shadow" 
                  variant="outline"
                  onClick={() => setLocation("/marketplace")}
                >
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  Explore Marketplace Modules
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* The 7-Department Interactive Showroom */}
        <section className="py-16 bg-card/40 border-y border-border backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-2 text-xs">Deep Departmental Architecture</Badge>
              <h2 className="text-3xl font-extrabold text-foreground">The 7-Department Knowledge Showroom</h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
                Inspect every workflow, automation rate, and cycle-time reduction before you mount it.
              </p>
            </div>

            {/* Department Selection Tabs */}
            <Tabs defaultValue="mkt" value={selectedDeptTab} onValueChange={setSelectedDeptTab} className="w-full space-y-8">
              <TabsList className="grid grid-cols-4 sm:grid-cols-7 w-full bg-muted/60 p-1.5 rounded-xl border border-border/60">
                {departments.map((d) => (
                  <TabsTrigger key={d.code} value={d.code} className="text-xs font-bold py-2">
                    {d.code.toUpperCase()}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Department Deep Dive Content */}
              <div className="p-6 sm:p-8 rounded-2xl border border-border/80 bg-card/80 backdrop-blur shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-2xl font-extrabold text-foreground">{activeDept.name}</h3>
                      <Badge className={activeDept.badgeColor}>{activeDept.price}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                      {activeDept.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                    <div className="p-3 rounded-lg bg-muted/40 border border-border/40 text-center">
                      <span className="text-[10px] text-muted-foreground block">Workflows</span>
                      <span className="font-bold text-foreground text-sm">{activeDept.workflowsCount} Active</span>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/40 border border-border/40 text-center">
                      <span className="text-[10px] text-muted-foreground block">Automation</span>
                      <span className="font-bold text-emerald-400 text-sm">{activeDept.automationRate}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/40 border border-border/40 text-center">
                      <span className="text-[10px] text-muted-foreground block">Time Saved</span>
                      <span className="font-bold text-primary text-sm">{activeDept.timeSaved}</span>
                    </div>
                  </div>
                </div>

                {/* Workflow Cards Grid */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                    Included Workflows & Operational Actions ({activeDept.workflows.length}):
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {activeDept.workflows.map((wf) => (
                      <div key={wf.code} className="p-3.5 rounded-xl bg-background/60 border border-border/60 hover:border-primary/40 transition-all space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10">
                            {wf.code}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono">Automated DAG</span>
                        </div>
                        <div className="text-xs font-bold text-foreground line-clamp-1">{wf.name}</div>
                        <div className="text-[11px] text-muted-foreground">{wf.impact}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    size="sm" 
                    onClick={() => {
                      toast.success(`Mounting ${activeDept.name} into your workspace...`);
                      setLocation("/marketplace");
                    }}
                    className="gap-1.5 shadow"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Mount {activeDept.name} ($ {activeDept.price})
                  </Button>
                </div>
              </div>
            </Tabs>
          </div>
        </section>

        {/* Ecosystem & Mobile App Storefront */}
        <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Cross-Platform Ecosystem & Google Play Store Ready</span>
            </div>
            <h2 className="text-3xl font-extrabold text-foreground">Live Ecosystem Applications</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
              Included free inside the Ownable OS membership or available as standalone specialized tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* App 1: Market Marksman */}
            <Card className="border border-border/80 bg-card/60 backdrop-blur flex flex-col justify-between hover:border-primary/40 transition-all">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Target className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-[10px]">
                    Live on Cloud Run
                  </Badge>
                </div>
                <CardTitle className="text-lg font-bold">Market Marksman</CardTitle>
                <CardDescription className="text-xs">Predictive Opportunity Discovery</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground pb-4 space-y-2">
                <p>Pinpoints high-margin deal wedges, tracks competitor movement, and generates automated executive market briefs.</p>
                <div className="pt-2 text-xs font-mono text-primary font-bold">Included in OS • $49/mo Standalone</div>
              </CardContent>
              <CardFooter className="pt-3 border-t border-border/40">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full text-xs gap-1.5"
                  onClick={() => window.open("https://market-marksman-718497644379.us-central1.run.app/", "_blank")}
                >
                  <Target className="w-3.5 h-3.5 text-primary" />
                  Launch Market Marksman
                </Button>
              </CardFooter>
            </Card>

            {/* App 2: Pulse Social */}
            <Card className="border border-border/80 bg-card/60 backdrop-blur flex flex-col justify-between hover:border-primary/40 transition-all">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-[10px]">
                    Play Store & Web
                  </Badge>
                </div>
                <CardTitle className="text-lg font-bold">Pulse Social</CardTitle>
                <CardDescription className="text-xs">Content Syndication Engine</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground pb-4 space-y-2">
                <p>Automates multi-channel social posting, generates voice-matched LinkedIn carousels, and schedules weekly queues.</p>
                <div className="pt-2 text-xs font-mono text-primary font-bold">Included in OS • $39/mo Standalone</div>
              </CardContent>
              <CardFooter className="pt-3 border-t border-border/40">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full text-xs gap-1.5"
                  onClick={() => window.open("https://pulse-social-agentlab-projects.vercel.app", "_blank")}
                >
                  <Share2 className="w-3.5 h-3.5 text-primary" />
                  Launch Pulse Social
                </Button>
              </CardFooter>
            </Card>

            {/* App 3: LeadPulse */}
            <Card className="border border-border/80 bg-card/60 backdrop-blur flex flex-col justify-between hover:border-primary/40 transition-all">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-[10px]">
                    AI Studio Engine
                  </Badge>
                </div>
                <CardTitle className="text-lg font-bold">LeadPulse</CardTitle>
                <CardDescription className="text-xs">Lead Accuracy & Verification</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground pb-4 space-y-2">
                <p>Autonomous B2B prospect scraper, contact enrichment matrix, and real-time deliverability validator.</p>
                <div className="pt-2 text-xs font-mono text-primary font-bold">Included in OS • $49/mo Standalone</div>
              </CardContent>
              <CardFooter className="pt-3 border-t border-border/40">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full text-xs gap-1.5"
                  onClick={() => window.open("https://leadpulse-ai-lead-accuracy-enrichment-engine.ai.studio/", "_blank")}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-primary" />
                  Launch LeadPulse
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* The Uncle Robert Philosophy & FAQ */}
        <section className="py-16 bg-muted/20 border-t border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-extrabold text-foreground">Our Philosophy: We Walk Beside You</h2>
              <p className="text-sm text-muted-foreground">
                Everything we build is designed for founder sovereignty, transparency, and lasting operational quality.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-5 rounded-xl bg-card border border-border/70 space-y-2">
                <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  What happens if I cancel or downgrade?
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Your workspace is <strong>never held hostage</strong>. You keep 1 active agent node, 5 daily DAG executions, all your saved SOP documents, and exportable audit records forever on our Free Tier.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-card border border-border/70 space-y-2">
                <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                  <HeartHandshake className="w-4 h-4 text-primary" />
                  Do you offer human guidance?
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Yes! We practice servant leadership. You get direct access to Robert McCarthy during the Founder Signal System sprint and ongoing monthly proof-loop reviews.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-card border border-border/70 space-y-2">
                <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                  <Cpu className="w-4 h-4 text-primary" />
                  Can I use my own API keys?
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  100%. You can plug in your own Gemini, OpenAI, or Anthropic keys via the Settings tab to pay model providers directly at raw wholesale token cost.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-card border border-border/70 space-y-2">
                <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  Where can I read your operating doctrine?
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Check out Robert's books: <em>Startup Operational Excellence</em> ($19.99) and <em>Bootstrapper's Guide to the World</em> ($59.99), available on our Gumroad storefront.
                </p>
              </div>
            </div>

            {/* Bottom CTA Banner */}
            <div className="p-8 rounded-2xl bg-gradient-to-r from-primary to-accent text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
              <div>
                <h3 className="text-xl font-black">Ready to Eliminate Operational Chaos?</h3>
                <p className="text-xs text-white/80 mt-1">
                  Start your 30-day trial or book a 30-minute Founder Signal Diagnostic call today.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={() => setLocation("/founder-signal-system")}
                  className="font-bold text-xs shadow text-primary"
                >
                  Book $1k Sprint
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => setLocation("/dashboard")}
                  className="bg-black/80 hover:bg-black text-white text-xs font-bold shadow"
                >
                  Start Pro Trial
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
