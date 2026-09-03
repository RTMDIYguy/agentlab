import { useState } from "react";
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
  BookOpen
} from "lucide-react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [showDowngradePolicy, setShowDowngradePolicy] = useState(false);
  const [extensionReason, setExtensionReason] = useState("Testing autonomous swarm DAGs & Beta Apps");

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
  });

  const { data: agentsData } = useQuery<{ agents: any[] }>({
    queryKey: ["agents"],
    queryFn: async () => {
      const res = await fetch("/api/agents");
      if (!res.ok) throw new Error("Failed to fetch agents");
      return res.json();
    },
  });

  // Fetch 30-day Trial Status
  const { data: trialData, refetch: refetchTrial } = useQuery<{
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
  const activeAgents = agentsData?.agents?.filter(a => a.status === "active")?.length || 2;

  const daysRemaining = trialData?.daysRemaining ?? 18;
  const totalTrialDays = trialData?.totalTrialDays ?? 30;
  const progressPercent = Math.min(100, Math.round((daysRemaining / totalTrialDays) * 100));

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/60 backdrop-blur">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Operational Overview</h1>
          <p className="text-sm text-muted-foreground">
            System performance, swarm utilization, and trial governance
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* 30-Day Pro Trial & Graceful Downgrade Status Card */}
        <Card className="border border-primary/30 bg-gradient-to-r from-primary/10 via-card/80 to-accent/10 shadow-sm overflow-hidden backdrop-blur-md">
          <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge variant="default" className="bg-primary hover:bg-primary text-primary-foreground gap-1.5 px-2.5 py-0.5 text-xs font-semibold">
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
                    className="text-primary hover:underline text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Info className="w-3 h-3" />
                    How does downgrade work?
                  </button>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-muted/60 overflow-hidden border border-border/40">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-500 rounded-full"
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
                className="text-xs border-border/70 hover:bg-muted/60"
              >
                Downgrade Policy
              </Button>
              <Button
                size="sm"
                onClick={() => setShowExtensionModal(true)}
                className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5 shadow-sm"
              >
                <Calendar className="w-3.5 h-3.5" />
                Extend Trial (+14 Days)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Complimentary Book Perk Banner */}
        <Card className="border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-card/70 to-card/90 shadow-sm backdrop-blur-md">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
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
          </CardContent>
        </Card>

        {/* Operational Metric Tiles */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/70 bg-card/60 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
              <Cpu className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeAgents}</div>
              <p className="text-xs text-muted-foreground">Running autonomic swarm nodes</p>
            </CardContent>
          </Card>
          <Card className="border-border/70 bg-card/60 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
              <Activity className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoadingRuns ? "-" : activeRuns}</div>
              <p className="text-xs text-muted-foreground">In progress or pending review</p>
            </CardContent>
          </Card>
          <Card className="border-border/70 bg-card/60 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
              <PlayCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoadingRuns ? "-" : totalRuns}</div>
              <p className="text-xs text-muted-foreground">Autonomous DAG executions</p>
            </CardContent>
          </Card>
          <Card className="border-border/70 bg-card/60 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estimated Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12.50</div>
              <p className="text-xs text-muted-foreground">Spend this billing cycle</p>
            </CardContent>
          </Card>
        </div>

        {/* System Health & Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 border-border/70 bg-card/60 backdrop-blur">
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>All primary Orchestrator systems are nominal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <p className="text-sm font-medium">Orchestrator LLM (Gemini 2.5)</p>
                  <p className="text-xs text-muted-foreground">Latency: 450ms • High-Signal</p>
                </div>
                <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-pulse" />
              </div>
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <p className="text-sm font-medium">Task Queue & DAG Dispatch</p>
                  <p className="text-xs text-muted-foreground">Pending jobs: 0</p>
                </div>
                <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full" />
              </div>
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <p className="text-sm font-medium">Knowledge Access</p>
                  <p className="text-xs text-muted-foreground">Available packages: {isLoadingWorkflows ? "-" : totalWorkflows}</p>
                </div>
                <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full" />
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3 border-border/70 bg-card/60 backdrop-blur">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Direct navigation across your Agentic OS.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start text-xs h-9" variant="outline" onClick={() => navigate("/command-center")}>
                <PlayCircle className="mr-2 h-4 w-4 text-primary" /> Command Center (DAGs)
              </Button>
              <Button className="w-full justify-start text-xs h-9" variant="outline" onClick={() => navigate("/agents")}>
                <Cpu className="mr-2 h-4 w-4 text-primary" /> Active Swarm Agents
              </Button>
              <Button className="w-full justify-start text-xs h-9" variant="outline" onClick={() => navigate("/marketplace")}>
                <GitMerge className="mr-2 h-4 w-4 text-primary" /> Ecosystem Marketplace
              </Button>
              <Button className="w-full justify-start text-xs h-9" variant="outline" onClick={() => navigate("/founder-signal-system")}>
                <Sparkles className="mr-2 h-4 w-4 text-amber-500" /> Founder Signal System ($1k Sprint)
              </Button>
            </CardContent>
          </Card>
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
    </DashboardLayout>
  );
}
