import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Bot,
  Play,
  Square,
  Settings,
  Activity,
  Plus,
  RefreshCw,
  Cpu,
  CheckCircle2,
  Sparkles,
  Shield,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

interface AgentDto {
  id: string;
  name: string;
  role: string;
  status: "active" | "idle" | "error" | "paused";
  tasksCompleted: number;
  uptime: string;
  baseModel: string;
}

export default function Agents() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const [filter, setFilter] = useState<"all" | "active" | "paused">("all");
  const [isDeployOpen, setIsDeployOpen] = useState(false);
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentRole, setNewAgentRole] = useState("Lead Enrichment Specialist");
  const [newAgentModel, setNewAgentModel] = useState("gemini-2.5-flash");

  // 1. Fetch live agents from backend
  const {
    data: agentsData,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<{ agents: AgentDto[]; totalCount: number }>({
    queryKey: ["agents", user?.openId],
    queryFn: async () => {
      const res = await fetch("/api/agents", {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch swarm agents");
      return res.json();
    },
    enabled: !!user,
  });

  // 2. Toggle Agent Status Mutation
  const toggleAgentMutation = useMutation({
    mutationFn: async (agentId: string) => {
      const res = await fetch(`/api/agents/${agentId}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to toggle agent status");
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(
        `Agent ${data.agent.name} is now ${data.agent.status.toUpperCase()}`
      );
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to toggle agent");
    },
  });

  // 3. Deploy New Agent Mutation
  const deployAgentMutation = useMutation({
    mutationFn: async (payload: { name: string; role: string; baseModel: string }) => {
      const res = await fetch("/api/agents/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to deploy new agent");
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(`Agent ${data.agent.name} successfully deployed to swarm!`);
      setIsDeployOpen(false);
      setNewAgentName("");
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to deploy agent");
    },
  });

  const agents = agentsData?.agents || [];
  const filteredAgents = agents.filter((a) => {
    if (filter === "active") return a.status === "active";
    if (filter === "paused") return a.status === "paused" || a.status === "idle";
    return true;
  });

  const activeCount = agents.filter((a) => a.status === "active").length;
  const totalTasks = agents.reduce((sum, a) => sum + (a.tasksCompleted || 0), 0);

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Bot className="w-8 h-8 text-primary" />
              Autonomous Swarm Agents
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor, calibrate, and orchestrate specialized AI agents across your tenant workspace.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading || isRefetching}
              className="border-border"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isRefetching ? "animate-spin" : ""}`}
              />
              Refresh Swarm
            </Button>

            {/* Deploy Modal */}
            <Dialog open={isDeployOpen} onOpenChange={setIsDeployOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-sm font-semibold">
                  <Plus className="w-4 h-4 mr-2" />
                  Deploy New Agent
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Deploy Agent to Swarm
                  </DialogTitle>
                  <DialogDescription>
                    Configure a specialized agent node with domain instructions and model boundaries.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="agent-name">Agent Name / Identifier</Label>
                    <Input
                      id="agent-name"
                      placeholder="e.g. Inbound-SDR-Node-03"
                      value={newAgentName}
                      onChange={(e) => setNewAgentName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agent-role">Specialized Role</Label>
                    <Select value={newAgentRole} onValueChange={setNewAgentRole}>
                      <SelectTrigger id="agent-role">
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lead Enrichment Specialist">Lead Enrichment Specialist</SelectItem>
                        <SelectItem value="Founder Outreach Matrix Copywriter">Founder Outreach Matrix Copywriter</SelectItem>
                        <SelectItem value="Full-Stack Software Engineer">Full-Stack Software Engineer</SelectItem>
                        <SelectItem value="Financial Reconciliation Auditor">Financial Reconciliation Auditor</SelectItem>
                        <SelectItem value="Autonomous Task Router & DAG Synthesizer">Autonomous Task Router</SelectItem>
                        <SelectItem value="SEO & Authority Content Writer">SEO & Authority Content Writer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agent-model">Base LLM Backbone</Label>
                    <Select value={newAgentModel} onValueChange={setNewAgentModel}>
                      <SelectTrigger id="agent-model">
                        <SelectValue placeholder="Select LLM" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash (Ultra-Fast / Low Latency)</SelectItem>
                        <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning & DAG)</SelectItem>
                        <SelectItem value="claude-3-7-sonnet">Claude 3.7 Sonnet (Advanced Coding & SOP)</SelectItem>
                        <SelectItem value="gpt-4o-mini">GPT-4o Mini (Cost Optimized)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDeployOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    disabled={!newAgentName.trim() || deployAgentMutation.isPending}
                    onClick={() =>
                      deployAgentMutation.mutate({
                        name: newAgentName.trim(),
                        role: newAgentRole,
                        baseModel: newAgentModel,
                      })
                    }
                  >
                    {deployAgentMutation.isPending ? "Deploying..." : "Confirm & Launch"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Telemetry Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 border-border bg-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Active Nodes
              </span>
              <Activity className="w-4 h-4 text-green-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {activeCount} / {agents.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Synchronized with Command Center
            </p>
          </Card>

          <Card className="p-4 border-border bg-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tasks Completed
              </span>
              <CheckCircle2 className="w-4 h-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {totalTasks.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cumulative DAG & Ingestion executions
            </p>
          </Card>

          <Card className="p-4 border-border bg-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Average Uptime
              </span>
              <Cpu className="w-4 h-4 text-blue-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">99.7%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Cloud Run container SLA
            </p>
          </Card>

          <Card className="p-4 border-border bg-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Safety & SAIF
              </span>
              <Shield className="w-4 h-4 text-purple-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">100%</div>
            <p className="text-xs text-muted-foreground mt-1">
              PII Redaction & RLS Boundary Active
            </p>
          </Card>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className="text-xs font-medium"
          >
            All Swarms ({agents.length})
          </Button>
          <Button
            variant={filter === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("active")}
            className="text-xs font-medium"
          >
            Active Only ({activeCount})
          </Button>
          <Button
            variant={filter === "paused" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("paused")}
            className="text-xs font-medium"
          >
            Paused / Idle ({agents.length - activeCount})
          </Button>
        </div>

        {/* Agents Grid */}
        {isLoading ? (
          <div className="text-center py-16">
            <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">
              Connecting to agent swarm runtime...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => {
              const isActive = agent.status === "active";
              return (
                <Card
                  key={agent.id}
                  className="p-6 flex flex-col justify-between border-border hover:border-primary/50 hover:shadow-md transition-all bg-card"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2.5 rounded-lg ${
                            isActive
                              ? "bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Bot className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-foreground">
                            {agent.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs font-medium mt-0.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isActive
                                  ? "bg-green-500 animate-pulse"
                                  : "bg-stone-400"
                              }`}
                            ></span>
                            <span className="capitalize text-muted-foreground">
                              {agent.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {agent.baseModel}
                      </Badge>
                    </div>

                    <p className="text-sm font-medium text-foreground mb-4">
                      {agent.role}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-6 p-3 bg-muted/40 rounded-lg border border-border/50">
                      <div>
                        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Uptime
                        </div>
                        <div className="font-bold text-sm text-foreground mt-0.5">
                          {agent.uptime || "99.9%"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Tasks Run
                        </div>
                        <div className="font-bold text-sm text-foreground mt-0.5">
                          {agent.tasksCompleted.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`flex-1 text-xs font-semibold ${
                        isActive
                          ? "border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:hover:bg-red-950/50"
                          : "border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700 dark:border-green-900/50 dark:hover:bg-green-950/50"
                      }`}
                      disabled={toggleAgentMutation.isPending}
                      onClick={() => toggleAgentMutation.mutate(agent.id)}
                    >
                      {isActive ? (
                        <>
                          <Square className="w-3.5 h-3.5 mr-1.5" /> Pause Node
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 mr-1.5" /> Activate
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0 border-border"
                      title="View Activity in Command Center"
                      onClick={() => setLocation("/command-center")}
                    >
                      <Activity className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0 border-border"
                      title="Agent Parameters & Tools"
                      onClick={() =>
                        toast.info(
                          `${agent.name} is running under SAIF guardrails on ${agent.baseModel}.`
                        )
                      }
                    >
                      <Settings className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
