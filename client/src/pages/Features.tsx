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
  FileText,
  Workflow,
  Network,
  Activity,
  Compass,
  Repeat,
  ShieldAlert
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Features() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [selectedDept, setSelectedDept] = useState("mkt");

  const departments = [
    {
      code: "mkt",
      name: "Marketing (MKT)",
      badge: "Growth Engine",
      workflowsCount: 9,
      automationRate: "92%",
      timeSaved: "6.0 hrs/wk",
      color: "from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400",
      tagline: "High-Signal Inbound Authority & Autonomous Prospecting",
      purpose: "Why it exists: Most founders waste 15+ hours weekly struggling with content creation and cold outreach guesswork. The Marketing Brain automates signal detection, lead enrichment, and omnichannel authority publishing so you attract ideal clients on autopilot.",
      synergy: "Cross-Department Synergy: Feeds high-intent, enriched prospects directly into the Sales (SAL) pipeline for instant triage and qualification.",
      workflows: [
        { code: "MKT-01", name: "Autonomous Lead Scraper & Prospect Discovery", desc: "Extracts verified B2B targets matching your ICP from web signals.", how: "Scrapes social and directory signals, verifies domain deliverability, and formats CRM records." },
        { code: "MKT-02", name: "Email Nurture & Drip Sequence Matrix", desc: "Behavioral nurture sequences via verified email relays.", how: "Triggers contextual follow-ups based on prospect engagement and content downloads." },
        { code: "MKT-03", name: "Domain Authority & Signal Map Synthesizer", desc: "Pinpoints high-margin market wedges and competitor gaps.", how: "Analyzes competitor positioning and generates weekly market intelligence briefings." },
        { code: "MKT-04", name: "Multi-Channel Campaign Asset Assembler", desc: "Generates launch packets, landing copy, and ad briefs.", how: "Synthesizes cross-platform copy matched to your unique brand voice." },
        { code: "MKT-05", name: "Lead Validation & Enrichment Engine", desc: "Zero bounce rate filtering with corporate registry lookup.", how: "Enriches leads with revenue tiers, employee count, and verified decision-maker emails." },
        { code: "MKT-06", name: "Content Creation & Dissemination Engine", desc: "Syndicates authority content across LinkedIn & web.", how: "Transforms raw founder voice notes into carousel decks, articles, and scheduled posts." },
        { code: "MKT-07", name: "Paid Acquisition Signal & Ad Budget Optimizer", desc: "Monitors ROAS and reallocates spend automatically.", how: "Tracks conversion signals across campaigns to eliminate wasted ad spend." },
        { code: "MKT-08", name: "Social Content Scheduling & Cross-Posting", desc: "Automates multi-channel social queues (Pulse Social).", how: "Syncs with Pulse Social engine to post across LinkedIn, X, and newsletters." },
        { code: "MKT-09", name: "Founder Roundtable & Event Funnel Engine", desc: "Drives event attendance and post-roundtable follow-ups.", how: "Coordinates RSVP tracking, automated calendar invites, and recap distribution." }
      ]
    },
    {
      code: "sal",
      name: "Sales (SAL)",
      badge: "Revenue Acceleration",
      workflowsCount: 6,
      automationRate: "89%",
      timeSaved: "5.5 hrs/client",
      color: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400",
      tagline: "Frictionless Deal Velocity & Founder-Led Closing",
      purpose: "Why it exists: Long sales cycles and manual proposal drafting cause founder fatigue and lost revenue. The Sales Brain creates tailored client dossiers, dynamic SOW proposals, and real-time objection talk tracks in minutes.",
      synergy: "Cross-Department Synergy: Once a deal closes, immediately triggers Finance (FIN) for invoice generation and Fulfillment (FUL) for instant workspace setup.",
      workflows: [
        { code: "SAL-01", name: "Inbound Lead Triage & Qualification Dispatch", desc: "Instant response routing and qualification scoring.", how: "Evaluates inbound inquiries against budget, timeline, and need before scheduling." },
        { code: "SAL-02", name: "Discovery Call Preparation & Intelligence Dossier", desc: "Pre-call founder briefing packet and pain point analysis.", how: "Aggregates prospect company history, recent news, and tech stack into a 1-page brief." },
        { code: "SAL-03", name: "Automated Proposal & Statement of Work Generator", desc: "Closes deals in hours with custom scope and dynamic pricing.", how: "Synthesizes modular SOW documents complete with payment milestones and deliverables." },
        { code: "SAL-04", name: "Objection Handling & Value Reframing Matrix", desc: "Real-time talk tracks and proof anchors for sales conversations.", how: "Surfaces relevant case studies and objection reframes matched to prospect concerns." },
        { code: "SAL-05", name: "Pipeline Velocity & Deal Health Forecasting", desc: "Predictive revenue signals and deal stall alerts.", how: "Monitors communication cadence and alerts founders when high-value deals need attention." },
        { code: "SAL-06", name: "Closing Sequence & Contract Execution Workflow", desc: "Frictionless signing loop and Stripe checkout initialization.", how: "Orchestrates DocuSign/e-sign links, deposit collection, and welcome onboarding." }
      ]
    },
    {
      code: "ops",
      name: "Operations (OPS)",
      badge: "Operational Backbone",
      workflowsCount: 8,
      automationRate: "94%",
      timeSaved: "7.5 hrs/wk",
      color: "from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400",
      tagline: "Single-Source-of-Truth Governance & Drift Elimination",
      purpose: "Why it exists: Growing agencies collapse under undocumented processes and stale files. The Operations Brain continuously audits SOPs, syncs cloud storage, and coordinates autonomous multi-agent background workers.",
      synergy: "Cross-Department Synergy: Serves as the central governor, ensuring all departmental DAGs adhere to brand standards and SAIF compliance.",
      workflows: [
        { code: "OPS-01", name: "Daily Command Center Executive Brief Synthesizer", desc: "Morning executive brief across all swarm activity.", how: "Summarizes overnight DAG runs, pending human approvals, and system telemetry." },
        { code: "OPS-02", name: "Cross-Workflow Identifier Control & Namespace Auditor", desc: "Eliminates naming drift across files, database, and APIs.", how: "Enforces strict canonical ID schemas across all 7 departments." },
        { code: "OPS-03", name: "SOP Document Standardizer & Frontmatter Validator", desc: "Continuous policy audit and markdown standardizer.", how: "Validates documentation structure and ensures operational manuals stay 100% current." },
        { code: "OPS-04", name: "Automated Google Drive Workspace Mirror & Sync", desc: "Real-time bidirectional document backup.", how: "Mirrors local operational docs to team Google Drive folders with zero manual uploads." },
        { code: "OPS-05", name: "Autonomous Swarm Task Queue & Worker Daemon", desc: "Coordinates background execution of multi-agent tasks.", how: "Manages task queues, retries, and resource caps across local and cloud agents." },
        { code: "OPS-06", name: "System Auditing & SAIF Compliance Verification", desc: "Deterministic AI guardrails and telemetry logging.", how: "Logs every model decision, token expenditure, and safety check to audit tables." },
        { code: "OPS-07", name: "Agent Development Kit (ADK) Scaffold Engine", desc: "Deploys custom swarm nodes in seconds.", how: "Generates typed Python/TypeScript agent scaffolds configured with tools and guardrails." },
        { code: "OPS-08", name: "Workspace Memory Secretary & Decision Registry", desc: "Zero context loss memory across conversations and projects.", how: "Records key architectural and strategic decisions in persistent workspace memory." }
      ]
    },
    {
      code: "fin",
      name: "Finance (FIN)",
      badge: "Financial Control",
      workflowsCount: 7,
      automationRate: "91%",
      timeSaved: "4.5 hrs/mo",
      color: "from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-400",
      tagline: "Lean Cashflow Visibility & Automated Bookkeeping",
      purpose: "Why it exists: Small agencies overspend on expensive bookkeeping tools or fly blind on cash runway. The Finance Brain automates Stripe ledger reconciliation, AR follow-up, and vendor audit checks.",
      synergy: "Cross-Department Synergy: Validates payment receipts before Fulfillment unlocks deliverables and informs Culture/Team on quarterly budgets.",
      workflows: [
        { code: "FIN-01", name: "Automated Bank & Stripe Ledger Reconciliation", desc: "Instant transaction matching and revenue categorization.", how: "Reconciles incoming webhook receipts with internal invoices and Excel trackers." },
        { code: "FIN-02", name: "Client Invoice Generation & Payment Follow-Up", desc: "Accelerates receivables with polite automated reminders.", how: "Sends automated reminders before and after due dates to ensure timely cashflow." },
        { code: "FIN-03", name: "Burn Rate & Cashflow Runway Forecaster", desc: "Predictive runway modeling based on current MRR and expenses.", how: "Calculates break-even horizons and warns founders before cash crunches occur." },
        { code: "FIN-04", name: "Expense Categorization & Tax Readiness Exporter", desc: "Clean CPA-ready exports with zero manual receipt sorting.", how: "Tags all business expenses and exports standardized CSV packets for tax filings." },
        { code: "FIN-05", name: "Contract Value & Recurring Revenue Tracker", desc: "MRR, ARR, and client lifetime value analytics.", how: "Tracks subscription renewals, expansion revenue, and churn signals in real-time." },
        { code: "FIN-06", name: "Vendor Contract & Subscription Audit Engine", desc: "Cuts SaaS shelfware and duplicate licenses automatically.", how: "Audits active software subscriptions monthly and flags unused tools for cancellation." },
        { code: "FIN-07", name: "Unit Economics & Gross Margin Calculator", desc: "Ensures healthy profit margins on every client project.", how: "Measures agent compute, contractor costs, and founder hours against client fees." }
      ]
    },
    {
      code: "ful",
      name: "Fulfillment (FUL)",
      badge: "Delivery Excellence",
      workflowsCount: 8,
      automationRate: "90%",
      timeSaved: "6.0 hrs/client",
      color: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/30 text-cyan-400",
      tagline: "Delightful Client Onboarding & 100% SLA Adherence",
      purpose: "Why it exists: Inconsistent client handoffs lead to scope creep and client churn. The Fulfillment Brain automates workspace provisioning, milestone tracking, and quality assurance packets.",
      synergy: "Cross-Department Synergy: Delivers finalized client assets to After-Sales (AFT) for case study generation and quarterly reviews.",
      workflows: [
        { code: "FUL-01", name: "Automated Client Onboarding & Workspace Provisioner", desc: "Zero-lag day 1 setup and portal provisioning.", how: "Spins up client workspaces, permissions, and welcome guides immediately upon payment." },
        { code: "FUL-02", name: "Deliverable Milestone & SLA Tracking Engine", desc: "Proactive status alerts and milestone checkpoints.", how: "Tracks task progress and sends weekly delivery status reports to client stakeholders." },
        { code: "FUL-03", name: "Asset Staging & Quality Assurance Auditor", desc: "Guaranteed deliverable polish and error checking.", how: "Performs automated QA sweeps on code, copy, and designs prior to client review." },
        { code: "FUL-04", name: "Client Feedback Ingestion & Revision Loop", desc: "Structured change requests with zero scope creep.", how: "Captures feedback into structured tickets and updates project timelines accordingly." },
        { code: "FUL-05", name: "Handover Packet & Implementation Guide Generator", desc: "Empowers client teams with turnkey documentation.", how: "Auto-generates user manuals, Loom video agendas, and implementation SOPs." },
        { code: "FUL-06", name: "Multi-Tenant Workspace Partitioning Worker", desc: "Total data isolation and privacy protection.", how: "Enforces strict tenant boundaries so client data never crosses projects." },
        { code: "FUL-07", name: "Contractor & Upwork Fulfillment Dispatcher", desc: "Scalable human-in-the-loop task dispatching (Tactix).", how: "Packages specialized execution briefs for vetted freelance contractors." },
        { code: "FUL-08", name: "Client Satisfaction & Net Promoter Survey Engine", desc: "Captures instant proof and sentiment upon milestone delivery.", how: "Dispatches short 1-click satisfaction surveys upon milestone completion." }
      ]
    },
    {
      code: "cul",
      name: "Culture & Team (CUL)",
      badge: "Servant Leadership",
      workflowsCount: 4,
      automationRate: "88%",
      timeSaved: "3.5 hrs/wk",
      color: "from-rose-500/20 to-rose-600/5 border-rose-500/30 text-rose-400",
      tagline: "Servant Leadership Cadence & Asynchronous Harmony",
      purpose: "Why it exists: Fast-moving agencies risk burnout and communication silos. The Culture Brain aligns human and AI agents with the servant leadership code, synthesizes weekly syncs, and unblocks engineers.",
      synergy: "Cross-Department Synergy: Calibrates system prompts and agent behavior across all other departments to ensure consistent, empathetic communication.",
      workflows: [
        { code: "CUL-01", name: "Servant Leadership Code & Core Values Evaluator", desc: "Upholds agency standard: 'We win only when you win.'", how: "Reviews client-facing communications to ensure humility, transparency, and high empathy." },
        { code: "CUL-02", name: "Weekly Founder Cadence & Standup Synthesizer", desc: "Crystal-clear weekly goals and milestone summaries.", how: "Aggregates asynchronous updates into a concise 5-minute Monday founder brief." },
        { code: "CUL-03", name: "Asynchronous Team Alignment & Blocker Resolver", desc: "Unblocks engineers and contractors fast.", how: "Identifies dependency bottlenecks in task queues and surfaces proactive solutions." },
        { code: "CUL-04", name: "Quarterly Performance & Growth Planning Loop", desc: "Empowers founder and team professional growth.", how: "Tracks quarterly skill acquisition and sets next 90-day learning horizons." }
      ]
    },
    {
      code: "aft",
      name: "After-Sales & Retention (AFT)",
      badge: "LTV & Advocacy",
      workflowsCount: 3,
      automationRate: "88%",
      timeSaved: "4.0 hrs/client",
      color: "from-indigo-500/20 to-indigo-600/5 border-indigo-500/30 text-indigo-400",
      tagline: "Proactive Churn Prevention & Proof-Capture Loops",
      purpose: "Why it exists: The highest-margin revenue is expansion revenue from happy clients. The After-Sales Brain monitors client usage signals, prepares quarterly ROI decks, and turns successes into referrals.",
      synergy: "Cross-Department Synergy: Feeds testimonial proof back into Marketing (MKT) for case study publishing and Sales (SAL) for closing decks.",
      workflows: [
        { code: "AFT-01", name: "Early Churn Risk Signal & Engagement Monitor", desc: "Prevents client dropoff with early warning indicators.", how: "Monitors login frequency and task activity to flag clients who need strategic check-ins." },
        { code: "AFT-02", name: "Quarterly Business Review (QBR) Deck Synthesizer", desc: "Demonstrates clear ROI and time-saved metrics to stakeholders.", how: "Compiles 90-day execution metrics, cost savings, and next quarter roadmap into a polished deck." },
        { code: "AFT-03", name: "Customer Advocacy & Referral Capture Loop", desc: "Turns delighted clients into enthusiastic advocates.", how: "Automates testimonial collection, case study formatting, and referral reward tracking." }
      ]
    }
  ];

  const active = departments.find(d => d.code === selectedDept) || departments[0];

  return (
    <PageLayout>
      <div className="min-h-screen bg-background text-foreground">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-20 border-b border-border bg-gradient-to-b from-primary/10 via-background to-background">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-semibold shadow-sm">
              <Compass className="w-4 h-4" />
              <span>The 7-Department Operating Architecture</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
              An Entire Agency Operating Backbone.
              <span className="block text-primary mt-2">Zero Chaos. Total Sovereignty.</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover how all 7 departmental brains interconnect to automate manual grind, eliminate documentation drift, and give you the operational power of a 20-person agency.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Button onClick={() => setLocation("/pricing")} className="font-bold text-xs gap-1.5 shadow">
                <ShoppingBag className="w-4 h-4" />
                View Sales Showroom & Pricing
              </Button>
              <Button onClick={() => setLocation("/founder-signal-system")} variant="outline" className="text-xs font-bold gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Explore $1k Starter Sprint
              </Button>
            </div>
          </div>
        </section>

        {/* Cross-Department Synergy Flow Diagram */}
        <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-2 text-xs">How They Work Together</Badge>
            <h2 className="text-3xl font-extrabold text-foreground">The Unified Autonomous Revenue Loop</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl mx-auto">
              No more siloed apps or copy-pasting data between disconnected tools. Information flows seamlessly across all 7 departments.
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-border/80 bg-card/60 backdrop-blur shadow-sm space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 text-center">
              {[
                { code: "MKT", label: "1. Inbound Signal", desc: "Lead scraping & authority content" },
                { code: "SAL", label: "2. Deal Velocity", desc: "Dossier brief & automated SOW" },
                { code: "FIN", label: "3. Cashflow", desc: "Stripe checkout & ledger match" },
                { code: "FUL", label: "4. Fulfillment", desc: "Workspace setup & deliverable QA" },
                { code: "OPS", label: "5. Governance", desc: "Audit logging & SOP validation" },
                { code: "AFT", label: "6. Retention", desc: "QBR deck & referral capture" },
                { code: "CUL", label: "7. Alignment", desc: "Servant leadership & weekly sync" },
              ].map((step, idx) => (
                <div key={step.code} className="p-4 rounded-xl bg-background/80 border border-border/60 flex flex-col justify-between space-y-2 relative">
                  <div className="text-[10px] font-mono font-bold text-primary">{step.label}</div>
                  <div className="text-lg font-black text-foreground">{step.code}</div>
                  <div className="text-[11px] text-muted-foreground leading-tight">{step.desc}</div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary font-medium text-center flex items-center justify-center gap-2">
              <Network className="w-4 h-4 shrink-0" />
              <span>Autonomous Multi-Agent DAGs coordinate between nodes with zero data loss or context switching.</span>
            </div>
          </div>
        </section>

        {/* 7 Department Deep Dive Tabs */}
        <section className="py-16 bg-card/40 border-y border-border backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-2">
              <Badge variant="outline" className="text-xs">Deep Department Inspection</Badge>
              <h2 className="text-3xl font-extrabold text-foreground">Explore Every Workflow & Mechanism</h2>
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                Select a department below to see why it was built, how it functions, and the specific tasks it takes off your plate.
              </p>
            </div>

            <Tabs defaultValue="mkt" value={selectedDept} onValueChange={setSelectedDept} className="w-full space-y-8">
              <TabsList className="grid grid-cols-4 sm:grid-cols-7 w-full bg-muted/60 p-1.5 rounded-xl border border-border/60">
                {departments.map((d) => (
                  <TabsTrigger key={d.code} value={d.code} className="text-xs font-bold py-2">
                    {d.code.toUpperCase()}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="p-6 sm:p-8 rounded-2xl border border-border/80 bg-card/80 backdrop-blur shadow-sm space-y-8">
                {/* Department Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border/60">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-black text-foreground">{active.name}</h3>
                      <Badge variant="secondary" className="text-xs font-bold">{active.badge}</Badge>
                    </div>
                    <p className="text-sm font-semibold text-primary">{active.tagline}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">{active.purpose}</p>
                    <div className="p-3 rounded-lg bg-muted/40 border border-border/40 text-xs text-foreground/80 flex items-start gap-2">
                      <Repeat className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{active.synergy}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono shrink-0">
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/40 text-center min-w-[90px]">
                      <span className="text-[10px] text-muted-foreground block">Workflows</span>
                      <span className="font-bold text-foreground text-sm">{active.workflowsCount} Active</span>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/40 text-center min-w-[90px]">
                      <span className="text-[10px] text-muted-foreground block">Automation</span>
                      <span className="font-bold text-emerald-400 text-sm">{active.automationRate}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/40 text-center min-w-[90px]">
                      <span className="text-[10px] text-muted-foreground block">Time Saved</span>
                      <span className="font-bold text-primary text-sm">{active.timeSaved}</span>
                    </div>
                  </div>
                </div>

                {/* Workflow Cards Grid with Details */}
                <div className="space-y-4">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                    All Included Workflows & Execution Details ({active.workflows.length}):
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {active.workflows.map((wf) => (
                      <Card key={wf.code} className="border border-border/60 bg-background/60 hover:border-primary/40 transition-all flex flex-col justify-between">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-mono font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10">
                              {wf.code}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Automated DAG
                            </span>
                          </div>
                          <CardTitle className="text-sm font-bold text-foreground line-clamp-1">{wf.name}</CardTitle>
                          <CardDescription className="text-xs text-muted-foreground line-clamp-2">{wf.desc}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-2 text-[11px] text-muted-foreground border-t border-border/30 bg-muted/20">
                          <strong className="text-foreground block mb-0.5">How it executes:</strong>
                          <span>{wf.how}</span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border/40">
                  <Button 
                    size="sm" 
                    onClick={() => {
                      toast.success(`Opening Marketplace to mount ${active.name}...`);
                      setLocation("/marketplace");
                    }}
                    className="gap-1.5 shadow"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Mount {active.name} in Marketplace
                  </Button>
                </div>
              </div>
            </Tabs>
          </div>
        </section>

        {/* Quantified Founder ROI Section */}
        <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-2">
            <Badge variant="outline" className="text-xs">Tangible Business Impact</Badge>
            <h2 className="text-3xl font-extrabold text-foreground">Why This Levels the Playing Field</h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              How deploying the Ownable OS translates into direct time savings, lower expenses, and superhuman output.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border border-border/70 bg-card/60 backdrop-blur p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Reclaim 25+ Hours Weekly</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Offload routine lead scraping, proposal drafting, documentation updates, and invoice reminders to autonomous swarms so you focus on high-leverage client relationships.
              </p>
            </Card>

            <Card className="border border-border/70 bg-card/60 backdrop-blur p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Eliminate $18k/Year in SaaS Shelfware</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Replace 8+ fragmented, expensive subscriptions with a single unified operating backbone built on top of your existing Microsoft 365 and open-source agent runtimes.
              </p>
            </Card>

            <Card className="border border-border/70 bg-card/60 backdrop-blur p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">100% Data Sovereignty</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You own your workflows, SOPs, and database. No black-box lock-in, and our Graceful Downgrade Protection guarantees your workspace is never locked out.
              </p>
            </Card>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="py-12 bg-muted/20 border-t border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-8 rounded-2xl bg-gradient-to-r from-primary to-accent text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
              <div>
                <h3 className="text-xl font-black">Ready to Supercharge Your Operations?</h3>
                <p className="text-xs text-white/80 mt-1">
                  Start your 30-day Pro Trial or book your 3–5 day Founder Signal Sprint.
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
                  onClick={() => setLocation("/pricing")}
                  className="bg-black/80 hover:bg-black text-white text-xs font-bold shadow"
                >
                  View Pricing & Plans
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
