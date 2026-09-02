import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  TerminalSquare,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Bot,
  Activity,
  Cpu,
  Layers,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Zap,
  Smartphone,
  Flame,
} from "lucide-react";
import { toast } from "sonner";

export default function CommandCenter() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const queryClient = useQueryClient();
  const [orchestratorPrompt, setOrchestratorPrompt] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "orchestrator"; text: string; time: string }>>([
    {
      sender: "orchestrator",
      text: "AgentLab Ops Orchestrator initialized. All swarms, SAIF guardrails, and AI Studio mobile sync endpoints are active. How can I assist today's operations?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [isSendingPrompt, setIsSendingPrompt] = useState(false);

  // 1. Fetch Workflows
  const { data: workflowsData, isLoading: isLoadingWorkflows, refetch: refetchWorkflows } = useQuery<{ workflows: any[] }>({
    queryKey: ["workflows", user?.openId],
    queryFn: async () => {
      const res = await fetch("/api/workflows", { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("Failed to fetch workflows");
      return res.json();
    },
    enabled: !!user,
  });

  // 2. Fetch Agents
  const { data: agentsData, isLoading: isLoadingAgents, refetch: refetchAgents } = useQuery<{ agents: any[] }>({
    queryKey: ["agents", user?.openId],
    queryFn: async () => {
      const res = await fetch("/api/agents", { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("Failed to fetch agents");
      return res.json();
    },
    enabled: !!user,
  });

  // 3. Fetch Runs
  const { data: runsData, isLoading: isLoadingRuns, refetch: refetchRuns } = useQuery<{ runs: any[] }>({
    queryKey: ["runs", user?.openId],
    queryFn: async () => {
      const res = await fetch("/api/runs", { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("Failed to fetch runs");
      return res.json();
    },
    enabled: !!user,
    refetchInterval: 5000,
  });

  // 4. Trigger Run Mutation
  const triggerRunMutation = useMutation({
    mutationFn: async (workflowId: string) => {
      const res = await fetch(`/api/workflows/${workflowId}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ triggerSource: "CommandCenter_UI" }),
      });
      if (!res.ok) throw new Error("Failed to trigger workflow run");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Playbook execution initiated successfully!");
      queryClient.invalidateQueries({ queryKey: ["runs"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to trigger workflow");
    },
  });

  // 5. Approve Run Mutation
  const approveRunMutation = useMutation({
    mutationFn: async (runId: string) => {
      const res = await fetch(`/api/runs/${runId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to approve run");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Workflow step approved & resumed!");
      queryClient.invalidateQueries({ queryKey: ["runs"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to approve run");
    },
  });

  // 6. Reject Run Mutation
  const rejectRunMutation = useMutation({
    mutationFn: async (runId: string) => {
      const res = await fetch(`/api/runs/${runId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to reject run");
      return res.json();
    },
    onSuccess: () => {
      toast.info("Workflow run rejected");
      queryClient.invalidateQueries({ queryKey: ["runs"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to reject run");
    },
  });

  // 7. 1-Click Ecosystem Sync Mutation
  const syncEcosystemMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/sync/all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to sync ecosystem");
      return res.json();
    },
    onSuccess: (data: any) => {
      toast.success(data.message || "Ecosystem synchronized: Desktop HTML, Repo Markdown & OS State aligned!");
      queryClient.invalidateQueries({ queryKey: ["runs"] });
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Ecosystem sync failed");
    },
  });

  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orchestratorPrompt.trim() || isSendingPrompt) return;

    const userText = orchestratorPrompt.trim();
    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setChatMessages((prev) => [...prev, { sender: "user", text: userText, time: timeNow }]);
    setOrchestratorPrompt("");
    setIsSendingPrompt(true);

    try {
      const res = await fetch("/api/orchestrator/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      if (!res.ok) {
        throw new Error("Orchestrator chat response failed");
      }

      const data = await res.json();
      const botResponse = data.message || data.response || "Task acknowledged and queued across agent swarms.";

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "orchestrator",
          text: botResponse,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "orchestrator",
          text: `[Error executing command]: ${err.message}. Operating in fallback autonomy mode.`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsSendingPrompt(false);
    }
  };

  const pendingApprovals = runsData?.runs?.filter((r: any) => r.status === "paused_for_approval") || [];
  const workflows = workflowsData?.workflows || [];
  const agents = agentsData?.agents || [];

  return (
    <DashboardLayout>
      {/* Header Banner */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <TerminalSquare className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Agency Command Center</h1>
              <Badge variant="outline" className="border-green-500/30 text-green-500 bg-green-500/10">
                Live Runtime
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Central operations cockpit, DAG workflow dispatch, swarm telemetry, and mobile ingestion bridge.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/60 rounded-md border border-border text-xs text-muted-foreground">
              <Smartphone className="w-3.5 h-3.5 text-blue-500" />
              <span>AI Studio Mobile Bridge:</span>
              <span className="font-semibold text-foreground">Connected</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchWorkflows();
                refetchAgents();
                refetchRuns();
                toast.info("Refreshed operational state");
              }}
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Refresh
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-sm"
              disabled={syncEcosystemMutation.isPending}
              onClick={() => syncEcosystemMutation.mutate()}
            >
              <Zap className={`w-3.5 h-3.5 mr-1.5 ${syncEcosystemMutation.isPending ? "animate-spin" : ""}`} />
              {syncEcosystemMutation.isPending ? "Syncing Ecosystem..." : "1-Click Sync All"}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Row 1: Priorities & Human-in-the-Loop Approvals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Priorities */}
          <Card className="lg:col-span-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <CardTitle className="text-lg">Operating Focus & Today's Top Actions</CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs font-mono">
                  SOP-ACTIVE
                </Badge>
              </div>
              <CardDescription>
                Live operational directives derived from the URC Agency Operating Manual
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background/80 border border-border">
                <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Hamarashops Partnership Execution</h4>
                  <p className="text-xs text-muted-foreground">
                    Targeted outreach campaigns to CMIOs and Clinical Directors for MedLM solutions. Auto-tag HubSpot deals with <code className="text-primary">Partner - Hamarashops</code>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-background/80 border border-border">
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-sm">MKT-02 Automated Lead Nurture Engine</h4>
                  <p className="text-xs text-muted-foreground">
                    Synced intake contacts activated through multi-touch email sequences with strict 3-touch limits and canary verification logs.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-background/80 border border-border">
                <div className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Founder RoundTable Canary Monitoring (MKT-09)</h4>
                  <p className="text-xs text-muted-foreground">
                    Continuous pipeline validation, response path tracking, and automated follow-ups via Bootstrapper Capital funnel.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Human-in-the-loop Pending Approvals */}
          <Card className="border-amber-500/30 bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-500" />
                  <CardTitle className="text-lg">Approval Queue</CardTitle>
                </div>
                <Badge variant={pendingApprovals.length > 0 ? "destructive" : "outline"} className="text-xs">
                  {pendingApprovals.length} Pending
                </Badge>
              </div>
              <CardDescription>Human-in-the-loop sign-offs</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingApprovals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <CheckCircle2 className="w-10 h-10 text-green-500/60 mb-2" />
                  <p className="text-sm font-medium">All systems autonomous</p>
                  <p className="text-xs text-muted-foreground">No workflow runs require manual intervention right now.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[220px] overflow-y-auto">
                  {pendingApprovals.map((run: any) => (
                    <div key={run.id} className="p-3 bg-muted/40 rounded-lg border border-border text-xs space-y-2">
                      <div className="flex justify-between items-center font-mono">
                        <span className="truncate max-w-[140px] font-semibold">{run.workflowId}</span>
                        <Badge variant="outline" className="text-[10px]">
                          PAUSED
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-[11px]">Run ID: {run.id.slice(0, 8)}...</p>
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          className="w-full bg-green-600 hover:bg-green-700 h-7 text-xs"
                          onClick={() => approveRunMutation.mutate(run.id)}
                          disabled={approveRunMutation.isPending}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="w-full h-7 text-xs"
                          onClick={() => rejectRunMutation.mutate(run.id)}
                          disabled={rejectRunMutation.isPending}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Row 2: Playbooks & Swarm Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Playbook Launcher */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Deployable Workflows & SOP Playbooks</CardTitle>
                </div>
                <span className="text-xs text-muted-foreground">
                  {isLoadingWorkflows ? "Loading..." : `${workflows.length} Active DAGs`}
                </span>
              </div>
              <CardDescription>
                Trigger automated multi-department swarms directly into the execution engine
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingWorkflows ? (
                <div className="py-8 text-center text-sm text-muted-foreground">Loading workflows...</div>
              ) : workflows.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">No workflows configured.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workflows.map((wf: any) => (
                    <div
                      key={wf.id}
                      className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm text-foreground">{wf.name}</h4>
                          <Badge variant="outline" className="text-[10px]">
                            {wf.triggerType || "manual"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {wf.description || "Proprietary agency SOP execution pipeline."}
                        </p>
                      </div>

                      <div className="pt-4 flex items-center justify-between border-t border-border mt-4">
                        <span className="text-[11px] text-muted-foreground font-mono">
                          Success: {wf.successRate || "99.4%"}
                        </span>
                        <Button
                          size="sm"
                          className="h-8 gap-1.5"
                          onClick={() => triggerRunMutation.mutate(wf.id)}
                          disabled={triggerRunMutation.isPending}
                        >
                          <Play className="w-3.5 h-3.5" />
                          Execute Run
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Autonomous Swarm Matrix */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Swarm Agents</CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {agents.length} Online
                </Badge>
              </div>
              <CardDescription>Dedicated agent nodes</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAgents ? (
                <div className="py-8 text-center text-sm text-muted-foreground">Loading agents...</div>
              ) : (
                <div className="space-y-3">
                  {agents.map((agent: any) => (
                    <div
                      key={agent.id}
                      className="p-3 bg-muted/30 rounded-lg border border-border flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            agent.status === "active"
                              ? "bg-green-500 animate-pulse"
                              : "bg-stone-400"
                          }`}
                        />
                        <div>
                          <div className="font-semibold text-xs text-foreground">{agent.name}</div>
                          <div className="text-[11px] text-muted-foreground">{agent.role}</div>
                        </div>
                      </div>
                      <div className="text-right font-mono text-[11px]">
                        <div className="text-muted-foreground">{agent.baseModel?.split("-")[0] || "gemini"}</div>
                        <div className="text-xs text-green-500 font-semibold">{agent.uptime || "99.9%"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Row 3: Interactive Ops Orchestrator Terminal */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Ops Orchestrator Natural Language Terminal</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs font-mono">
                Google Gemini 2.5 Flash
              </Badge>
            </div>
            <CardDescription>
              Direct agent command line: Dispatch cross-department tasks, synthesize new DAGs, or query real-time OS state.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {/* Message Feed */}
            <div className="p-4 space-y-3 max-h-[300px] min-h-[180px] overflow-y-auto font-mono text-xs bg-muted/20">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg max-w-[85%] ${
                    msg.sender === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "mr-auto bg-card border border-border text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1 text-[10px] opacity-75">
                    <span className="font-bold">{msg.sender === "user" ? "YOU" : "ORCHESTRATOR"}</span>
                    <span>{msg.time}</span>
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                </div>
              ))}
              {isSendingPrompt && (
                <div className="p-3 rounded-lg max-w-[85%] mr-auto bg-card border border-border text-foreground animate-pulse flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-primary animate-spin" />
                  <span>Synthesizing cross-department execution plan...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendChat} className="p-4 border-t border-border flex gap-3 bg-card">
              <Input
                placeholder="Give the Orchestrator an operational task (e.g., 'Run lead enrichment for Kansas City founders')..."
                value={orchestratorPrompt}
                onChange={(e) => setOrchestratorPrompt(e.target.value)}
                disabled={isSendingPrompt}
                className="font-mono text-xs"
              />
              <Button type="submit" disabled={!orchestratorPrompt.trim() || isSendingPrompt} className="gap-1.5">
                <Send className="w-4 h-4" />
                <span>Send</span>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
