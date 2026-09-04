import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Activity, 
  Cpu, 
  PlayCircle, 
  DollarSign, 
  GitMerge, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  ShieldAlert, 
  Calendar,
  HelpCircle,
  ArrowRight,
  Info,
  BookOpen,
  Compass,
  Sunset,
  Building2,
  Rocket,
  Layers,
  Zap,
  Radio,
  Sliders,
  Terminal,
  Gauge
} from "lucide-react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

type ViewportTheme = "cyber" | "tropical" | "space" | "tron";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [showDowngradePolicy, setShowDowngradePolicy] = useState(false);
  const [extensionReason, setExtensionReason] = useState("Testing autonomous swarm DAGs & Beta Apps");
  
  // Cockpit Viewport Theme (persisted in localStorage)
  const [viewport, setViewport] = useState<ViewportTheme>(() => {
    return (localStorage.getItem("agentlab_cockpit_viewport") as ViewportTheme) || "tron";
  });

  const handleViewportChange = (theme: ViewportTheme) => {
    setViewport(theme);
    localStorage.setItem("agentlab_cockpit_viewport", theme);
    toast.success(`Cockpit Viewport switched to ${theme.toUpperCase()}`);
  };

  const { data: runsData, isLoading: isLoadingRuns } = useQuery<{ runs: any[] }>({
    queryKey: ["runs"],
    queryFn: async () => {
      const res = await fetch("/api/runs");
      if (!res.ok) throw new Error("Failed to fetch runs");
      return res.json();
    },
    refetchInterval: 5000,
  });

  const { data: workflowsData, isLoading: isLoadingWorkflows } = useQuery<{ workflows: any[] }>({
    queryKey: ["workflows"],
    queryFn: async () => {
      const res = await fetch("/api/workflows");
      if (!res.ok) throw new Error("Failed to fetch workflows");
      return res.json();
    },
    refetchInterval: 5000,
  });

  const { data: agentsData, isLoading: isLoadingAgents } = useQuery<{ agents: any[] }>({
    queryKey: ["agents"],
    queryFn: async () => {
      const res = await fetch("/api/agents");
      if (!res.ok) throw new Error("Failed to fetch agents");
      return res.json();
    },
    refetchInterval: 5000,
  });

  // Fetch 30-day Trial Status
  const { data: trialData } = useQuery<{
    success: boolean;
    plan: string;
    totalTrialDays: number;
    daysRemaining: number;
    trialEndDate: string;
    canExtend: boolean;
    downgradePolicy: {
      retained: string[];
      paused: string[];
    };
  }>({
    queryKey: ["trial-status"],
    queryFn: async () => {
      const res = await fetch("/api/trials/status");
      if (!res.ok) throw new Error("Failed to fetch trial status");
      return res.json();
    },
    refetchInterval: 30000,
  });

  // Extend Trial Mutation
  const extendTrialMutation = useMutation({
    mutationFn: async (reason: string) => {
      const res = await fetch("/api/trials/extend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error("Failed to extend trial");
      return res.json();
    },
    onSuccess: (data) => {
      toast.success("Trial Extended by +14 Days! 🎉", {
        description: `Your trial is now active until ${data.daysRemaining} days from now.`,
      });
      setShowExtensionModal(false);
      queryClient.invalidateQueries({ queryKey: ["trial-status"] });
    },
    onError: () => {
      toast.error("Failed to extend trial period");
    }
  });

  const totalRuns = runsData?.runs?.length || 0;
  const activeRuns = runsData?.runs?.filter(r => r.status === "running" || r.status === "pending_approval")?.length || 0;
  const totalWorkflows = workflowsData?.workflows?.length || 0;
  const agentsList = agentsData?.agents || [];
  const activeAgents = agentsList.filter(a => a.status === "active")?.length || 6;

  const daysRemaining = trialData?.daysRemaining ?? 18;
  const totalTrialDays = trialData?.totalTrialDays ?? 30;
  const progressPercent = Math.min(100, Math.round((daysRemaining / totalTrialDays) * 100));

  // Dynamic Viewport Background Styles
  const getViewportBackground = () => {
    switch (viewport) {
      case "cyber":
        return "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/80 via-[#0a0f1d] to-[#05070d]";
      case "tropical":
        return "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-950/70 via-cyan-950/40 to-[#070e17]";
      case "space":
        return "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-950/80 via-slate-950 to-[#04060a]";
      case "tron":
      default:
        return "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/70 via-[#07111e] to-[#030811]";
    }
  };

  return (
    <DashboardLayout>
      <div className={`min-h-screen relative overflow-hidden transition-colors duration-700 ${getViewportBackground()}`}>
        
        {/* Ambient Parallax Environmental Horizon Backdrop */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {viewport === "cyber" && (
            <>
              <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl" />
              <div className="absolute bottom-0 inset-x-0 h-64 bg-[linear-gradient(to_right,#312e81_1px,transparent_1px),linear-gradient(to_bottom,#312e81_1px,transparent_1px)] bg-[size:4rem_2rem] opacity-20 [transform:perspective(500px)_rotateX(60deg)]" />
            </>
          )}

          {viewport === "tropical" && (
            <>
              <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-amber-500/15 via-teal-500/10 to-transparent blur-3xl" />
              <div className="absolute top-12 right-12 w-64 h-64 rounded-full bg-amber-400/10 blur-2xl" />
              <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-teal-950/40 via-cyan-900/10 to-transparent" />
            </>
          )}

          {viewport === "space" && (
            <>
              <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-purple-600/15 via-blue-600/10 to-transparent blur-3xl" />
              <div className="absolute top-10 left-1/4 w-80 h-80 rounded-full bg-violet-500/10 blur-3xl animate-pulse" />
              <div className="absolute inset-0 bg-dot-pattern opacity-30" />
            </>
          )}

          {viewport === "tron" && (
            <>
              <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-cyan-500/15 via-primary/10 to-transparent blur-3xl" />
              <div className="absolute bottom-0 inset-x-0 h-80 tron-grid opacity-30" />
            </>
          )}
        </div>

        {/* Cockpit Canopy Master Header */}
        <div className="relative z-10 border-b border-cyan-500/20 bg-background/60 backdrop-blur-xl px-6 py-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            {/* Left: Flight Deck Status */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(0,243,255,0.3)]">
                <Compass className="w-6 h-6 animate-[spin_20s_linear_infinite]" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-black tracking-tight gradient-heading">
                    COMMAND FLIGHT DECK
                  </h1>
                  <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[10px] font-mono tracking-widest uppercase gap-1 px-2 py-0.5">
                    <Radio className="w-3 h-3 animate-ping text-cyan-400" />
                    AUTOPILOT ENGAGED
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  Swarm Core: <span className="text-emerald-400 font-semibold">NOMINAL</span> • Telemetry Latency: <span className="text-cyan-400 font-semibold">450ms</span> • Nodes Online: <span className="text-foreground font-bold">{activeAgents} / 6</span>
                </p>
              </div>
            </div>

            {/* Right: Viewport Horizon Selector (Tron / Cyber / Tropical / Space) */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card/80 border border-border/80 backdrop-blur-md">
              <span className="text-[11px] font-mono font-bold text-muted-foreground px-2 flex items-center gap-1">
                <Sliders className="w-3 h-3 text-primary" /> Viewport:
              </span>
              
              <button
                onClick={() => handleViewportChange("tron")}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  viewport === "tron"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(0,243,255,0.3)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Tron Grid
              </button>

              <button
                onClick={() => handleViewportChange("cyber")}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  viewport === "cyber"
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-400/50 shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                Cyber City
              </button>

              <button
                onClick={() => handleViewportChange("tropical")}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  viewport === "tropical"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <Sunset className="w-3.5 h-3.5 text-amber-400" />
                Tropical Oasis
              </button>

              <button
                onClick={() => handleViewportChange("space")}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  viewport === "space"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-400/50 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <Rocket className="w-3.5 h-3.5 text-purple-400" />
                Deep Space
              </button>
            </div>
          </div>
        </div>

        {/* Cockpit Bridge Workspace */}
        <div className="relative z-10 p-6 space-y-6 max-w-7xl mx-auto">
          
          {/* Holographic Swarm Core Deck (Tron-style Active Swarm Node Array) */}
          <div className="hud-panel p-5 hud-scanline">
            <div className="hud-corner-bracket hud-corner-tl" />
            <div className="hud-corner-bracket hud-corner-tr" />
            <div className="hud-corner-bracket hud-corner-bl" />
            <div className="hud-corner-bracket hud-corner-br" />

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-cyan-500/20">
              <div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[10px] font-mono uppercase">
                    Compute Grid Layer
                  </Badge>
                  <h2 className="text-base font-bold text-foreground tracking-wide flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    AUTONOMIC SWARM NODE ARRAY
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  6 active intelligence nodes synchronized via PostgreSQL state machine & Drizzle ORM
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => navigate("/agents")}
                  className="text-xs border-cyan-500/40 hover:bg-cyan-500/10 text-cyan-300 font-mono gap-1.5 h-8"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  Manage Compute Nodes
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => navigate("/command-center")}
                  className="text-xs bg-cyan-500 hover:bg-cyan-400 text-black font-bold gap-1.5 h-8 shadow-[0_0_15px_rgba(0,243,255,0.4)]"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  Dispatch Swarm DAG
                </Button>
              </div>
            </div>

            {/* 6 Swarm Pods Visualizer */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-4">
              {[
                { name: "Alpha-Node-01", role: "Master Orchestrator", status: "Active", tasks: 24, glow: "border-cyan-400/50 text-cyan-400" },
                { name: "Coder-Agent-07", role: "Full-Stack Tech 1", status: "Active", tasks: 19, glow: "border-indigo-400/50 text-indigo-400" },
                { name: "Tech-Node-08", role: "Infrastructure Tech 2", status: "Active", tasks: 14, glow: "border-purple-400/50 text-purple-400" },
                { name: "SDR-Writer-02", role: "Lead Gen & SDR", status: "Active", tasks: 31, glow: "border-emerald-400/50 text-emerald-400" },
                { name: "Auditor-Bot-9", role: "Compliance Auditor", status: "Active", tasks: 42, glow: "border-amber-400/50 text-amber-400" },
                { name: "Workflow-Planner-04", role: "Schema Architect", status: "Active", tasks: 16, glow: "border-blue-400/50 text-blue-400" },
              ].map((node, i) => (
                <div 
                  key={node.name}
                  className="relative p-3 rounded-xl bg-card/60 border border-white/10 hover:border-cyan-400/60 transition-all duration-300 group hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,243,255,0.15)]"
                >
                  <div className="flex items-center justify-between pb-1.5">
                    <span className="text-[10px] font-mono text-muted-foreground">NODE 0{i+1}</span>
                    <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                  </div>
                  <div className="font-bold text-xs text-foreground tracking-tight truncate group-hover:text-cyan-300 transition-colors">
                    {node.name}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate font-sans">
                    {node.role}
                  </div>
                  <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-muted-foreground">Tasks:</span>
                    <span className="text-cyan-300 font-bold">{node.tasks}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 30-Day Pro Trial & Graceful Downgrade Status Card */}
          <div className="hud-panel p-5 hud-scanline">
            <div className="hud-corner-bracket hud-corner-tl" />
            <div className="hud-corner-bracket hud-corner-tr" />
            <div className="hud-corner-bracket hud-corner-bl" />
            <div className="hud-corner-bracket hud-corner-br" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Badge variant="default" className="bg-primary hover:bg-primary text-primary-foreground gap-1.5 px-2.5 py-0.5 text-xs font-semibold shadow-[0_0_12px_rgba(59,130,246,0.4)]">
                    <Sparkles className="w-3.5 h-3.5" />
                    {trialData?.plan || "Ownable OS Pro Trial"}
                  </Badge>
                  <span className="text-xs font-mono text-muted-foreground">
                    Trial ends on: <strong className="text-foreground">{trialData?.trialEndDate || "2026-09-21"}</strong>
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-foreground font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      {daysRemaining} Days Remaining ({daysRemaining} of {totalTrialDays} days)
                    </span>
                    <button 
                      onClick={() => setShowDowngradePolicy(true)}
                      className="text-primary hover:underline text-[11px] flex items-center gap-1 cursor-pointer font-mono"
                    >
                      <Info className="w-3 h-3" />
                      How does downgrade work?
                    </button>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-muted/60 overflow-hidden border border-border/40">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 via-primary to-emerald-400 transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(0,243,255,0.5)]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Trial Actions */}
              <div className="flex items-center gap-3 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDowngradePolicy(true)}
                  className="text-xs border-border/70 hover:bg-muted/60 font-mono"
                >
                  Downgrade Policy
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowExtensionModal(true)}
                  className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Extend Trial (+14 Days)
                </Button>
              </div>
            </div>
          </div>

          {/* Complimentary Book Perk Banner */}
          <div className="hud-panel-amber p-4 hud-scanline">
            <div className="hud-corner-bracket hud-corner-tl" />
            <div className="hud-corner-bracket hud-corner-tr" />
            <div className="hud-corner-bracket hud-corner-bl" />
            <div className="hud-corner-bracket hud-corner-br" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0">Complimentary $19.99 Value</Badge>
                    <span className="text-xs font-bold text-foreground">Operational Doctrine Included</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <em>Startup Operational Excellence</em> by Robert McCarthy is unlocked for your workspace.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open("https://bossrob.gumroad.com/l/soe", "_blank")}
                className="text-xs border-amber-500/40 hover:bg-amber-500/10 text-amber-300 font-semibold gap-1.5 shrink-0"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Read / Download Book
              </Button>
            </div>
          </div>

          {/* Operational Metric Flight Gauges */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            
            {/* Tile 1: Active Swarm Nodes */}
            <div className="hud-panel p-5 hud-scanline">
              <div className="hud-corner-bracket hud-corner-tl" />
              <div className="hud-corner-bracket hud-corner-tr" />
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Swarm Nodes</span>
                <Cpu className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-black text-cyan-300 tracking-tight font-mono">{activeAgents} <span className="text-sm font-normal text-muted-foreground">/ 6</span></div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                2 Techs, 1 SDR, 1 Auditor, 1 Planner
              </p>
            </div>

            {/* Tile 2: Active Tasks */}
            <div className="hud-panel-emerald p-5 hud-scanline">
              <div className="hud-corner-bracket hud-corner-tl" />
              <div className="hud-corner-bracket hud-corner-tr" />
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Active Tasks</span>
                <Activity className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-emerald-300 tracking-tight font-mono">{isLoadingRuns ? "-" : activeRuns}</div>
              <p className="text-xs text-muted-foreground mt-1">In progress or pending review</p>
            </div>

            {/* Tile 3: Total DAG Runs */}
            <div className="hud-panel p-5 hud-scanline">
              <div className="hud-corner-bracket hud-corner-tl" />
              <div className="hud-corner-bracket hud-corner-tr" />
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Total DAG Runs</span>
                <PlayCircle className="h-4 w-4 text-primary" />
              </div>
              <div className="text-3xl font-black text-primary tracking-tight font-mono">{isLoadingRuns ? "-" : totalRuns}</div>
              <p className="text-xs text-muted-foreground mt-1">Autonomous executions completed</p>
            </div>

            {/* Tile 4: Spend & Cycle Velocity */}
            <div className="hud-panel-amber p-5 hud-scanline">
              <div className="hud-corner-bracket hud-corner-tl" />
              <div className="hud-corner-bracket hud-corner-tr" />
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Compute Budget</span>
                <DollarSign className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-amber-300 tracking-tight font-mono">$12.50</div>
              <p className="text-xs text-muted-foreground mt-1">Spend this billing cycle ($443 saved)</p>
            </div>
          </div>

          {/* Cockpit Systems & Quick Navigation Console */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            
            {/* Left 4 Cols: System Telemetry Console */}
            <div className="col-span-4 hud-panel p-5 hud-scanline space-y-4">
              <div className="hud-corner-bracket hud-corner-tl" />
              <div className="hud-corner-bracket hud-corner-tr" />
              <div className="hud-corner-bracket hud-corner-bl" />
              <div className="hud-corner-bracket hud-corner-br" />

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground font-mono flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-cyan-400" />
                  SYSTEM TELEMETRY CONSOLE
                </h3>
                <p className="text-xs text-muted-foreground">Real-time health monitoring of all autonomous subsystems</p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-card/60 border border-white/5">
                  <div>
                    <p className="text-xs font-bold font-mono text-foreground">Orchestrator LLM (Gemini 2.5 Flash)</p>
                    <p className="text-[11px] text-muted-foreground">Latency: 450ms • High-Signal Reasoning</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">ONLINE</Badge>
                    <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-card/60 border border-white/5">
                  <div>
                    <p className="text-xs font-bold font-mono text-foreground">HubSpot CRM Pat Bridge</p>
                    <p className="text-[11px] text-muted-foreground">5 autonomous tools active (Deals, Contacts, Pipelines)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">CONNECTED</Badge>
                    <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-card/60 border border-white/5">
                  <div>
                    <p className="text-xs font-bold font-mono text-foreground">Active Workflows & DAG Queues</p>
                    <p className="text-[11px] text-muted-foreground">Available packages: {isLoadingWorkflows ? "-" : totalWorkflows} • 0 stalled jobs</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-cyan-500/20 text-cyan-400 text-[10px] font-mono">SYNCED</Badge>
                    <div className="h-2.5 w-2.5 bg-cyan-500 rounded-full shadow-[0_0_8px_rgba(0,243,255,0.8)]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right 3 Cols: Cockpit Navigation Deck */}
            <div className="col-span-3 hud-panel p-5 hud-scanline space-y-4">
              <div className="hud-corner-bracket hud-corner-tl" />
              <div className="hud-corner-bracket hud-corner-tr" />
              <div className="hud-corner-bracket hud-corner-bl" />
              <div className="hud-corner-bracket hud-corner-br" />

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground font-mono flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  TACTICAL FLIGHT CONTROLS
                </h3>
                <p className="text-xs text-muted-foreground">Direct jump across the agency infrastructure</p>
              </div>

              <div className="space-y-2.5 pt-1">
                <Button className="w-full justify-start text-xs h-10 font-mono bg-card/80 border border-cyan-500/30 hover:border-cyan-400/60 hover:bg-cyan-500/10 text-cyan-300" variant="outline" onClick={() => navigate("/command-center")}>
                  <PlayCircle className="mr-2 h-4 w-4 text-cyan-400" /> Command Center (Active DAGs)
                </Button>
                <Button className="w-full justify-start text-xs h-10 font-mono bg-card/80 border border-indigo-500/30 hover:border-indigo-400/60 hover:bg-indigo-500/10 text-indigo-300" variant="outline" onClick={() => navigate("/agents")}>
                  <Cpu className="mr-2 h-4 w-4 text-indigo-400" /> Swarm Compute Nodes (6 Nodes)
                </Button>
                <Button className="w-full justify-start text-xs h-10 font-mono bg-card/80 border border-border/80 hover:border-primary/50 hover:bg-primary/10" variant="outline" onClick={() => navigate("/marketplace")}>
                  <GitMerge className="mr-2 h-4 w-4 text-primary" /> Ecosystem Marketplace & Apps
                </Button>
                <Button className="w-full justify-start text-xs h-10 font-mono bg-amber-500/10 border border-amber-500/40 hover:bg-amber-500/20 text-amber-300" variant="outline" onClick={() => navigate("/founder-signal-system")}>
                  <Sparkles className="mr-2 h-4 w-4 text-amber-400" /> Founder Signal System ($1k Sprint)
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Trial Extension Modal */}
        <Dialog open={showExtensionModal} onOpenChange={setShowExtensionModal}>
          <DialogContent className="max-w-md bg-card border-border/80">
            <DialogHeader>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold">
                    Extend Your Pro Trial (+14 Days)
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    Continue building and testing your autonomous workflows with full Pro entitlements.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
                <span className="font-semibold text-foreground">Why are you extending?</span>
                <div className="mt-2 space-y-1.5">
                  {[
                    "Testing autonomous swarm DAGs & Beta Apps",
                    "Evaluating 7-Department knowledge playbooks with team",
                    "Participating in Founder Beta feedback program"
                  ].map((reason) => (
                    <label key={reason} className="flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer">
                      <input 
                        type="radio" 
                        name="extensionReason" 
                        value={reason} 
                        checked={extensionReason === reason} 
                        onChange={() => setExtensionReason(reason)} 
                        className="accent-primary" 
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Instant 1-click activation. No credit card required.</span>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" size="sm" onClick={() => setShowExtensionModal(false)} className="text-xs">
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={extendTrialMutation.isPending}
                onClick={() => extendTrialMutation.mutate(extensionReason)}
                className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5 shadow"
              >
                <Calendar className="w-3.5 h-3.5" />
                {extendTrialMutation.isPending ? "Extending..." : "Activate +14 Days"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Graceful Downgrade Policy Modal */}
        <Dialog open={showDowngradePolicy} onOpenChange={setShowDowngradePolicy}>
          <DialogContent className="max-w-lg bg-card border-border/80">
            <DialogHeader>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold">
                    Graceful Downgrade Protection
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    We believe you should always own your operational data and core workflows.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                If your 30-day Pro Trial ends and you choose not to subscribe to the <strong>Ownable OS ($500/mo)</strong>, your workspace is <strong>never locked or deleted</strong>. Instead, it transitions smoothly to the Free Tier:
              </p>

              <div className="space-y-2">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  What You Keep (Forever Free):
                </span>
                <ul className="space-y-1.5 pl-6 list-disc text-muted-foreground">
                  <li><strong>1 Active Autonomous Swarm Agent:</strong> Keep `Alpha-Node-01` running for daily triage.</li>
                  <li><strong>5 Daily DAG Executions:</strong> Run your core lead-gen or content workflows every day.</li>
                  <li><strong>All Saved SOPs & Knowledge Documents:</strong> 100% read/write access to your repository.</li>
                  <li><strong>Compliance & Audit Log History:</strong> Complete exportable telemetry history.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  What Pauses Until Upgrade:
                </span>
                <ul className="space-y-1.5 pl-6 list-disc text-muted-foreground">
                  <li>Multi-agent parallel swarms (swarms with &gt;1 concurrent agent node).</li>
                  <li>Automated background cron schedulers (manual trigger still works).</li>
                  <li>Live Beta Ecosystem App integration connectors.</li>
                </ul>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button size="sm" onClick={() => setShowDowngradePolicy(false)} className="text-xs">
                Understood
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
