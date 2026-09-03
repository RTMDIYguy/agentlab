import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Zap,
  Brain,
  Network,
  Clock,
  Shield,
  Cpu,
  Sparkles,
  Layers,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Compass,
  Play,
  Check,
  Building2,
  Users,
  Repeat,
  HelpCircle,
  BarChart3,
  Flame,
  Globe
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { PageLayout } from "@/components/PageLayout";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeDagStep, setActiveDagStep] = useState(2);
  const [simulatedRunStatus, setSimulatedRunStatus] = useState<"idle" | "running" | "complete">("idle");

  const runSimulation = () => {
    setSimulatedRunStatus("running");
    toast.info("Simulating Multi-Agent Swarm DAG Execution...");
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setActiveDagStep(step);
      if (step >= 4) {
        clearInterval(interval);
        setSimulatedRunStatus("complete");
        toast.success("DAG Execution Complete: 0 Drift, SAIF Verified (14ms, $0.02)");
      }
    }, 800);
  };

  const capabilities = [
    {
      icon: Network,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      title: "Multi-Agent DAG Swarms",
      description:
        "Orchestrate autonomous agent nodes across Marketing, Sales, Operations, Finance, and Fulfillment with sub-second latency.",
      badge: "Real-time Swarms",
    },
    {
      icon: ShieldCheck,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      title: "SAIF Guardrails & RLS",
      description:
        "Enterprise-grade Row Level Security and SAIF auditing guarantee zero data leakage between client workspaces.",
      badge: "Zero Leakage",
    },
    {
      icon: Compass,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
      title: "Ownable OS & Equity Model",
      description:
        "Transform messy services into verifiable, transferable business equity and an exit-ready Ownable OS on Bootstrapper.ai.",
      badge: "Equity Independence",
    },
    {
      icon: DollarSign,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      title: "Bank & Stripe Reconciliation",
      description:
        "Automated cash runway modeling, expense categorization, and zero-leakage bookkeeping built on your M365 backbone.",
      badge: "Cashflow Control",
    },
    {
      icon: Brain,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      title: "7 Modular Playbooks",
      description:
        "Mount 45+ pre-certified operational workflows across all 7 agency departments in 1 click from the Marketplace.",
      badge: "Turnkey SOPs",
    },
    {
      icon: Cpu,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      title: "Hard Token Budget Caps",
      description:
        "Never get surprised by LLM bills. Direct API secrets pass-through lets you pay wholesale token costs with automatic budget caps.",
      badge: "Cost Governed",
    },
  ];

  return (
    <PageLayout>
      <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
        {/* Ambient Glow Lighting Orbs */}
        <div className="ambient-orb-blue top-[-100px] left-[15%]" />
        <div className="ambient-orb-purple top-[30%] right-[5%]" />
        <div className="ambient-orb-emerald bottom-[20%] left-[5%]" />

        {/* Hero Section */}
        <section className="relative pt-16 pb-20 border-b border-border/80 bg-grid-mesh">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            {/* Top Badge & Brand Pillar */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-semibold shadow-sm backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>The Sovereign Business Operating Backbone</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-4xl mx-auto leading-[1.1]">
                An Autonomous Agency OS.
                <span className="block gradient-heading mt-2">Zero Chaos. Total Equity.</span>
              </h1>

              <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Connect your 7 departments into a unified multi-agent swarm. Automate routine grind, eliminate SaaS shelfware, and graduate into the <strong className="text-foreground">Ownable OS</strong> on Bootstrapper.ai.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
                <Button 
                  size="lg" 
                  onClick={() => setLocation("/pricing")} 
                  className="font-bold text-xs gap-2 shadow-lg shadow-primary/25 button-glow"
                >
                  <ShoppingBag className="w-4 h-4" />
                  View Pricing & Showroom
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => setLocation("/founder-signal-system")} 
                  className="text-xs font-bold gap-2 glass-card"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Explore $1k Starter Sprint
                </Button>
                <Button 
                  size="lg" 
                  variant="ghost" 
                  onClick={() => setLocation("/features")} 
                  className="text-xs font-bold gap-1 text-muted-foreground hover:text-foreground"
                >
                  See 7 Departments <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Interactive Multi-Agent DAG Visualizer Widget */}
            <div className="p-6 sm:p-8 rounded-3xl glass-card border border-white/10 relative overflow-hidden space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
                    <Activity className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      Live Multi-Agent DAG Orchestration
                      <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] font-mono border-emerald-500/30">
                        Active Swarm
                      </Badge>
                    </h3>
                    <p className="text-xs text-muted-foreground">Deterministic task routing with SAIF compliance guardrails</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-lg bg-card border border-border text-[11px] font-mono text-muted-foreground">
                    Avg Latency: <span className="text-emerald-400 font-bold">14ms</span> | Cost: <span className="text-primary font-bold">$0.02</span>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={runSimulation}
                    disabled={simulatedRunStatus === "running"}
                    className="text-xs font-bold gap-1.5 shadow"
                  >
                    <Play className="w-3.5 h-3.5" />
                    {simulatedRunStatus === "running" ? "Running..." : "Test DAG Execution"}
                  </Button>
                </div>
              </div>

              {/* DAG Nodes Flow Diagram */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 relative">
                {[
                  { step: 0, title: "1. Trigger Ingestion", type: "Event / Webhook", detail: "Scrapes lead signals & parses webhook payload.", color: "border-blue-500/40 text-blue-400" },
                  { step: 1, title: "2. Master Orchestrator", type: "Gemini 2.5 Flash", detail: "Synthesizes multi-agent execution plan & task DAG.", color: "border-purple-500/40 text-purple-400" },
                  { step: 2, title: "3. Specialist Swarm", type: "MKT / SAL / OPS", detail: "Enriches CRM dossier, drafts proposal & SOP doc.", color: "border-cyan-500/40 text-cyan-400" },
                  { step: 3, title: "4. SAIF Guardrail Gate", type: "Security & PII Check", detail: "Verifies tenant boundaries & human approval token.", color: "border-amber-500/40 text-amber-400" },
                  { step: 4, title: "5. Sovereign Commit", type: "M365 & Audit Ledger", detail: "Writes to Microsoft 365 and logs audit trail.", color: "border-emerald-500/40 text-emerald-400" },
                ].map((node) => {
                  const isActive = activeDagStep === node.step;
                  return (
                    <div
                      key={node.step}
                      onClick={() => setActiveDagStep(node.step)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                        isActive
                          ? "bg-primary/15 border-primary shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-[1.02]"
                          : "bg-background/60 border-border/70 hover:border-primary/40"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono font-bold text-muted-foreground">{node.title}</span>
                        {isActive && <span className="w-2 h-2 rounded-full bg-primary animate-ping" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">{node.type}</div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{node.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* The 4 Engines of Ownable OS & Independence Model */}
        <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <Badge variant="outline" className="text-xs">The Strategic North Star</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              Prepping Founders for Ownable OS & Equity Independence
            </h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              We connect your business operations into the 4 foundational engines of <a href="https://bootstrapper.ai/@agentlab" target="_blank" rel="noopener noreferrer" className="text-primary underline font-semibold">Bootstrapper.ai</a>, transforming your daily hustle into transferable enterprise value.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Engine 1: Financial */}
            <Card className="glass-card p-6 flex flex-col justify-between space-y-4 border-amber-500/20 hover:border-amber-500/40">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">Engine 01</span>
                  <h3 className="text-lg font-bold text-foreground">Financial Engine</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Bank-connected ledger intelligence, automated cash runway forecasting, and lean CPA-ready bookkeeping.
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-border/40 text-[11px] font-mono text-muted-foreground space-y-1">
                <div className="flex justify-between"><span>Runway:</span><strong className="text-foreground">14.2 mo</strong></div>
                <div className="flex justify-between"><span>Ledger Match:</span><strong className="text-emerald-400">100%</strong></div>
              </div>
            </Card>

            {/* Engine 2: Profit */}
            <Card className="glass-card p-6 flex flex-col justify-between space-y-4 border-cyan-500/20 hover:border-cyan-500/40">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">Engine 02</span>
                  <h3 className="text-lg font-bold text-foreground">Profit Engine</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    CRM-driven sales pipeline velocity, automated SOW proposals, and inbound prospect discovery.
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-border/40 text-[11px] font-mono text-muted-foreground space-y-1">
                <div className="flex justify-between"><span>Pipeline Auto:</span><strong className="text-foreground">92%</strong></div>
                <div className="flex justify-between"><span>Close Velocity:</span><strong className="text-cyan-400">3.5x Faster</strong></div>
              </div>
            </Card>

            {/* Engine 3: Value */}
            <Card className="glass-card p-6 flex flex-col justify-between space-y-4 border-purple-500/20 hover:border-purple-500/40">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold">Engine 03</span>
                  <h3 className="text-lg font-bold text-foreground">Value Engine</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Standardized SOP protocol library, autonomous DAG workers, and multi-tenant delivery pipelines.
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-border/40 text-[11px] font-mono text-muted-foreground space-y-1">
                <div className="flex justify-between"><span>Protocols:</span><strong className="text-foreground">45 Standardized</strong></div>
                <div className="flex justify-between"><span>SOP Drift:</span><strong className="text-purple-400">0% Verified</strong></div>
              </div>
            </Card>

            {/* Engine 4: People */}
            <Card className="glass-card p-6 flex flex-col justify-between space-y-4 border-rose-500/20 hover:border-rose-500/40">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <Users className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold">Engine 04</span>
                  <h3 className="text-lg font-bold text-foreground">People Engine</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Servant leadership cadence, async unblocking, quarterly growth reviews, and client retention QBRs.
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-border/40 text-[11px] font-mono text-muted-foreground space-y-1">
                <div className="flex justify-between"><span>Code of Conduct:</span><strong className="text-foreground">Servant 100%</strong></div>
                <div className="flex justify-between"><span>LTV Expansion:</span><strong className="text-rose-400">+45%</strong></div>
              </div>
            </Card>
          </div>

          {/* Direct Link to Bootstrapper.ai Build Equity */}
          <div className="p-6 rounded-2xl border border-primary/30 bg-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                <Compass className="w-4 h-4 text-primary" />
                Graduating into the Independence Model on Bootstrapper.ai
              </h4>
              <p className="text-xs text-muted-foreground">
                Measure your Ownable Score, compress discount rates, and explore equity pathways.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button 
                size="sm" 
                variant="outline"
                className="text-xs font-bold gap-1 bg-background"
                onClick={() => window.open("https://bootstrapper.ai/@agentlab", "_blank")}
              >
                <Globe className="w-3.5 h-3.5" />
                View @agentlab Hub
              </Button>
              <Button 
                size="sm" 
                className="text-xs font-bold gap-1 shadow"
                onClick={() => window.open("https://bootstrapper.ai/build-equity?p_grain=LW", "_blank")}
              >
                Explore Build Equity <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Agency Brand Hierarchy Section */}
        <section className="py-16 bg-card/40 border-y border-border backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-2">
              <Badge variant="outline" className="text-xs">Integrated Ecosystem</Badge>
              <h2 className="text-3xl font-extrabold text-foreground">The Uncle Robert Consulting Ecosystem</h2>
              <p className="text-xs text-muted-foreground max-w-xl mx-auto">
                How our advisory, audience, fulfillment, and operating systems interconnect.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-card p-6 space-y-3">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  <span>Uncle Robert Consulting (URC)</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The primary business brand. High-touch servant leadership advisory guiding founders from operational grind into ownable operating independence.
                </p>
              </Card>

              <Card className="glass-card p-6 space-y-3">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <Compass className="w-5 h-5 text-cyan-400" />
                  <span>Bootstrapper Capital</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The audience, founder roundtables, and community funnel hosting the Independence Chapter and Ownable OS cockpits.
                </p>
              </Card>

              <Card className="glass-card p-6 space-y-3">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <Cpu className="w-5 h-5 text-purple-400" />
                  <span>Tactix</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The fulfillment and delivery execution arm. Dispatches vetted contractor pods to implement and maintain client swarms.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Capabilities Grid */}
        <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <Badge variant="outline" className="text-xs">Operating Superpowers</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              Built for Sovereign Business Scale
            </h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Everything required to run an autonomous, high-margin agency without adding headcount or expensive software subscriptions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap, index) => {
              const Icon = cap.icon;
              return (
                <Card key={index} className="glass-card p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${cap.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge variant="secondary" className="text-[10px] font-mono">{cap.badge}</Badge>
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{cap.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{cap.description}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="py-16 bg-gradient-to-b from-card/30 to-background border-t border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-primary via-indigo-600 to-accent text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
              <div className="space-y-2 text-center sm:text-left">
                <h3 className="text-2xl font-black">Ready to Take Operational Control?</h3>
                <p className="text-xs sm:text-sm text-white/80 max-w-md">
                  Start your 30-day Pro Trial, book your $1k Founder Signal Sprint, or launch a Bootstrapper.ai diagnostic.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={() => setLocation("/founder-signal-system")}
                  className="font-bold text-xs shadow text-primary w-full sm:w-auto"
                >
                  Book $1k Sprint
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => setLocation("/pricing")}
                  className="bg-black/80 hover:bg-black text-white text-xs font-bold shadow w-full sm:w-auto"
                >
                  View Pricing Showroom
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
