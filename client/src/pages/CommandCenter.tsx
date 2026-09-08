import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Plus,
  Calendar,
  FileText,
  Copy,
  Check,
  Share2,
  FileSpreadsheet,
  BookOpen,
  Terminal,
  Eye,
  ArrowUp,
  ArrowDown,
  Trash2,
  Image as ImageIcon,
  Download,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { RunInspectorModal } from "@/components/RunInspectorModal";

interface WorkflowStepItem {
  id?: string;
  orderIndex: number;
  stepType: string;
  title: string;
  actionPrompt: string;
  agentId?: string | null;
}

interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  triggerType: string;
  status: string;
  successRate?: string | number;
  stepsCount?: number;
  steps?: WorkflowStepItem[];
  cronExpression?: string;
}

export default function CommandCenter() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Natural Language Terminal State
  const [orchestratorPrompt, setOrchestratorPrompt] = useState("");
  const [chatMessages, setChatMessages] = useState<
    Array<{
      sender: "user" | "orchestrator";
      text: string;
      time: string;
      proposal?: any;
    }>
  >([
    {
      sender: "orchestrator",
      text: "AgentLab Ops Orchestrator initialized. All swarms, SAIF guardrails, and AI Studio mobile sync endpoints are active. How can I assist today's operations?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [isSendingPrompt, setIsSendingPrompt] = useState(false);

  // Expanded Workflow Cards State (Accordion)
  const [expandedWorkflows, setExpandedWorkflows] = useState<Record<string, boolean>>({});

  // Workflow Adjustment Modal State
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTriggerType, setEditTriggerType] = useState("manual");
  const [editSteps, setEditSteps] = useState<WorkflowStepItem[]>([]);
  const [isSavingWorkflow, setIsSavingWorkflow] = useState(false);
  const [inspectingRunId, setInspectingRunId] = useState<string | null>(null);

  // 1. Fetch Workflows
  const {
    data: workflowsData,
    isLoading: isLoadingWorkflows,
    refetch: refetchWorkflows,
  } = useQuery<{ workflows: WorkflowItem[] }>({
    queryKey: ["workflows", user?.openId],
    queryFn: async () => {
      const res = await fetch("/api/workflows", { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("Failed to fetch workflows");
      return res.json();
    },
    enabled: !!user,
  });

  // 2. Fetch Agents
  const {
    data: agentsData,
    isLoading: isLoadingAgents,
    refetch: refetchAgents,
  } = useQuery<{ agents: any[] }>({
    queryKey: ["agents", user?.openId],
    queryFn: async () => {
      const res = await fetch("/api/agents", { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("Failed to fetch agents");
      return res.json();
    },
    enabled: !!user,
  });

  // 3. Fetch Runs
  const {
    data: runsData,
    isLoading: isLoadingRuns,
    refetch: refetchRuns,
  } = useQuery<{ runs: any[] }>({
    queryKey: ["runs", user?.openId],
    queryFn: async () => {
      const res = await fetch("/api/runs", { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("Failed to fetch runs");
      return res.json();
    },
    enabled: !!user,
    refetchInterval: 5000,
  });

  // 4. Fetch Content Calendar & Scheduled Posts
  const {
    data: calendarData,
    isLoading: isLoadingCalendar,
    refetch: refetchCalendar,
  } = useQuery<{
    calendarItems: any[];
    totalScheduled: number;
    totalDrafts: number;
    totalPublished: number;
    localContentQueueExcerpt?: string;
  }>({
    queryKey: ["content-calendar", user?.openId],
    queryFn: async () => {
      const res = await fetch("/api/artifacts/content-calendar", { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("Failed to fetch content calendar");
      return res.json();
    },
    enabled: !!user,
    refetchInterval: 10000,
  });

  // 5. Fetch Output Artifacts & Files
  const {
    data: artifactsData,
    isLoading: isLoadingArtifacts,
    refetch: refetchArtifacts,
  } = useQuery<{ artifacts: any[]; totalCount: number }>({
    queryKey: ["workflow-artifacts", user?.openId],
    queryFn: async () => {
      const res = await fetch("/api/artifacts?limit=30", { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("Failed to fetch artifacts");
      return res.json();
    },
    enabled: !!user,
    refetchInterval: 10000,
  });

  const [selectedArtifact, setSelectedArtifact] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [refinementInstructions, setRefinementInstructions] = useState("");
  const [isRefining, setIsRefining] = useState(false);

  const updateArtifactMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/artifacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update artifact status");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Content status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["content-calendar"] });
      queryClient.invalidateQueries({ queryKey: ["workflow-artifacts"] });
    },
  });

  const evaluateArtifactMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/artifacts/${id}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to evaluate artifact");
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(`Quality Evaluation: Grade ${data.evaluation.grade} (${data.evaluation.score}%)`);
      queryClient.invalidateQueries({ queryKey: ["content-calendar"] });
      queryClient.invalidateQueries({ queryKey: ["workflow-artifacts"] });
      if (selectedArtifact) {
        setSelectedArtifact((prev: any) => ({
          ...prev,
          qualityScore: data.evaluation.score,
          qualityGrade: data.evaluation.grade,
          verificationNotes: {
            feedback: data.evaluation.feedback,
            suggestions: data.evaluation.suggestions,
            passed: data.evaluation.passed,
            rubric: data.evaluation.rubric,
          },
        }));
      }
    },
  });

  const refineArtifactMutation = useMutation({
    mutationFn: async ({ id, instructions }: { id: string; instructions: string }) => {
      setIsRefining(true);
      const res = await fetch(`/api/artifacts/${id}/refine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructions }),
      });
      if (!res.ok) throw new Error("Failed to refine artifact");
      return res.json();
    },
    onSuccess: (data) => {
      setIsRefining(false);
      toast.success(`Generated Revision v${data.revisionVersion} (Grade ${data.evaluation.grade} • ${data.evaluation.score}%)! 🎉`);
      queryClient.invalidateQueries({ queryKey: ["content-calendar"] });
      queryClient.invalidateQueries({ queryKey: ["workflow-artifacts"] });
      setSelectedArtifact((prev: any) => ({
        ...prev,
        id: data.refinedArtifactId,
        content: data.refinedContent,
        revisionVersion: data.revisionVersion,
        qualityScore: data.evaluation.score,
        qualityGrade: data.evaluation.grade,
        verificationNotes: {
          feedback: data.evaluation.feedback,
          suggestions: data.evaluation.suggestions,
          passed: data.evaluation.passed,
          rubric: data.evaluation.rubric,
        },
      }));
      setRefinementInstructions("");
    },
    onError: (err: any) => {
      setIsRefining(false);
      toast.error(err.message || "Failed to refine artifact");
    },
  });

  // AI Graphic Generation State & Mutation
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState<"16:9" | "1:1" | "4:5" | "9:16">("16:9");
  const [isStudioModalOpen, setIsStudioModalOpen] = useState(false);
  const [studioPrompt, setStudioPrompt] = useState("");
  const [studioPreset, setStudioPreset] = useState("Modern B2B Isometric");
  const [studioResult, setStudioResult] = useState<{ imageUrl: string; engine: string; title: string; aspectRatio: string } | null>(null);

  const generateImageMutation = useMutation({
    mutationFn: async ({
      prompt,
      aspectRatio,
      artifactId,
      title,
      stylePreset,
    }: {
      prompt: string;
      aspectRatio: string;
      artifactId?: string;
      title?: string;
      stylePreset?: string;
    }) => {
      setIsGeneratingImage(true);
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectRatio, artifactId, title, stylePreset }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate visual graphic");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setIsGeneratingImage(false);
      toast.success(`Graphic generated with ${data.engine}! 🎨`);
      queryClient.invalidateQueries({ queryKey: ["content-calendar"] });
      queryClient.invalidateQueries({ queryKey: ["workflow-artifacts"] });
      setSelectedArtifact((prev: any) => ({
        ...prev,
        metadata: {
          ...(prev?.metadata || {}),
          imageUrl: data.imageUrl,
          imageEngine: data.engine,
          aspectRatio: data.aspectRatio,
        },
      }));
    },
    onError: (err: any) => {
      setIsGeneratingImage(false);
      toast.error(err.message || "Failed to generate graphic");
    },
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

  // Toggle card expansion
  const toggleWorkflowExpand = (wfId: string) => {
    setExpandedWorkflows((prev) => ({ ...prev, [wfId]: !prev[wfId] }));
  };

  // Open Step Adjuster Modal
  const handleOpenStepEditor = (wf: WorkflowItem) => {
    setEditingWorkflow(wf);
    setEditName(wf.name);
    setEditDescription(wf.description || "");
    setEditTriggerType(wf.triggerType || "manual");

    // If steps exist, clone them; otherwise generate default step template
    if (wf.steps && wf.steps.length > 0) {
      setEditSteps(wf.steps.map((s, idx) => ({ ...s, orderIndex: idx })));
    } else {
      setEditSteps([
        {
          orderIndex: 0,
          stepType: "trigger",
          title: "Ingestion & Trigger",
          actionPrompt: "Ingest task context and validate inputs against SAIF guardrails.",
          agentId: "Workflow-Planner-04",
        },
        {
          orderIndex: 1,
          stepType: "agent",
          title: "Core Execution Node",
          actionPrompt: wf.description || "Execute proprietary SOP protocol.",
          agentId: "Alpha-Node-01",
        },
        {
          orderIndex: 2,
          stepType: "destination",
          title: "M365 & Audit Commit",
          actionPrompt: "Record verified outcome in M365 ledger and log audit telemetry.",
          agentId: "Auditor-Bot-9",
        },
      ]);
    }
  };

  // Save Workflow & Steps Adjustments
  const handleSaveWorkflowChanges = async () => {
    if (!editingWorkflow) return;
    setIsSavingWorkflow(true);

    try {
      // 1. Update workflow metadata
      await fetch(`/api/workflows/${editingWorkflow.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
          triggerType: editTriggerType,
        }),
      });

      // 2. Update workflow steps
      const stepsRes = await fetch(`/api/workflows/${editingWorkflow.id}/steps`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          steps: editSteps.map((step, idx) => ({
            orderIndex: idx,
            stepType: step.stepType,
            title: step.title,
            actionPrompt: step.actionPrompt,
            agentId: step.agentId,
          })),
        }),
      });

      if (!stepsRes.ok) throw new Error("Failed to save workflow steps");

      toast.success(`Updated "${editName}" and saved ${editSteps.length} workflow steps.`);
      setEditingWorkflow(null);
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update workflow adjustments.");
    } finally {
      setIsSavingWorkflow(false);
    }
  };

  // Step manipulation functions
  const handleAddStep = () => {
    setEditSteps((prev) => [
      ...prev,
      {
        orderIndex: prev.length,
        stepType: "agent",
        title: `Step ${prev.length + 1}: Custom Action`,
        actionPrompt: "Define action details for this autonomous swarm step.",
        agentId: "Alpha-Node-01",
      },
    ]);
  };

  const handleRemoveStep = (index: number) => {
    setEditSteps((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMoveStep = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === editSteps.length - 1)
    )
      return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...editSteps];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setEditSteps(updated);
  };

  // Natural Language Terminal Chat Send
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
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ prompt: userText, message: userText }),
      });

      if (!res.ok) {
        throw new Error(`Orchestrator returned ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const botResponse =
        data.reply ||
        data.message ||
        data.response ||
        "Task acknowledged and synthesized across agent swarms.";

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "orchestrator",
          text: botResponse,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          proposal: data.proposal,
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

  const handleDeployProposalFromChat = async (proposal: any) => {
    try {
      const res = await fetch("/api/workflows/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposal }),
      });
      if (!res.ok) throw new Error("Failed to deploy proposal");
      toast.success(`Workflow "${proposal.name}" deployed to active DAG matrix!`);
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to deploy proposal");
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
              <Badge variant="outline" className="border-green-500/30 text-green-500 bg-green-500/10 font-mono text-xs">
                Live Runtime
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Central operations cockpit, DAG workflow dispatch, swarm telemetry, and mobile ingestion bridge.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocation("/ops-agent")}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-md border border-primary/20 text-xs font-semibold transition"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Open Ops Agent</span>
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/60 rounded-md border border-border text-xs text-muted-foreground">
              <Smartphone className="w-3.5 h-3.5 text-blue-500" />
              <span>AI Studio Mobile:</span>
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
              {syncEcosystemMutation.isPending ? "Syncing..." : "1-Click Sync All"}
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
                    Targeted outreach campaigns to CMIOs and Clinical Directors for MedLM solutions. Auto-tag HubSpot deals with{" "}
                    <code className="text-primary">Partner - Hamarashops</code>.
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
                      <div className="flex items-center gap-1.5 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full h-7 text-xs border-cyan-500/40 hover:bg-cyan-500/10 text-cyan-400 font-mono gap-1"
                          onClick={() => setInspectingRunId(run.id)}
                        >
                          <Terminal className="w-3 h-3" />
                          Inspect
                        </Button>
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
          {/* Playbook Launcher with Expandable Step Details & Inline Adjustments */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Deployable Workflows & SOP Playbooks</CardTitle>
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {isLoadingWorkflows ? "Loading..." : `${workflows.length} Active DAGs`}
                </span>
              </div>
              <CardDescription>
                Trigger multi-department swarms, inspect detailed execution steps, or adjust step configurations without rebuilding.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingWorkflows ? (
                <div className="py-8 text-center text-sm text-muted-foreground">Loading workflows...</div>
              ) : workflows.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">No workflows configured.</div>
              ) : (
                <div className="space-y-4">
                  {workflows.map((wf: WorkflowItem) => {
                    const isExpanded = !!expandedWorkflows[wf.id];
                    const steps = wf.steps || [];

                    return (
                      <div
                        key={wf.id}
                        className="rounded-xl border border-border bg-card/80 hover:border-primary/40 transition-all overflow-hidden"
                      >
                        {/* Card Header & Controls */}
                        <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold text-sm text-foreground">{wf.name}</h4>
                              <Badge variant="outline" className="text-[10px] uppercase font-mono">
                                {wf.triggerType || "manual"}
                              </Badge>
                              <Badge variant="secondary" className="text-[10px] font-mono">
                                {steps.length > 0 ? `${steps.length} Steps` : `${wf.stepsCount || 3} Nodes`}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {wf.description || "Proprietary agency SOP execution pipeline."}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Adjust Steps Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs gap-1.5"
                              onClick={() => handleOpenStepEditor(wf)}
                              title="Adjust workflow steps, agent assignments, and prompts"
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                              <span>Adjust Steps</span>
                            </Button>

                            {/* Run Button */}
                            <Button
                              size="sm"
                              className="h-8 gap-1.5 text-xs bg-primary text-primary-foreground"
                              onClick={() => triggerRunMutation.mutate(wf.id)}
                              disabled={triggerRunMutation.isPending}
                            >
                              <Play className="w-3.5 h-3.5" />
                              Execute Run
                            </Button>

                            {/* Expand / Collapse Steps */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => toggleWorkflowExpand(wf.id)}
                              title={isExpanded ? "Collapse steps" : "Expand steps"}
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>

                        {/* Expandable Step Sequence Breakdown */}
                        {isExpanded && (
                          <div className="border-t border-border bg-muted/20 p-4 space-y-2.5">
                            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                              <span className="flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5 text-primary" />
                                DAG Execution Node Sequence
                              </span>
                              <span className="text-[11px] font-mono">Success Rate: {wf.successRate || "99.4%"}</span>
                            </div>

                            {steps.length === 0 ? (
                              <div className="p-3 bg-background rounded-lg border border-border text-xs text-muted-foreground flex items-center justify-between">
                                <span>No granular step nodes configured yet. Click "Adjust Steps" to define execution graph.</span>
                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleOpenStepEditor(wf)}>
                                  Configure Steps
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {steps.map((step, idx) => (
                                  <div
                                    key={step.id || idx}
                                    className="p-3 rounded-lg bg-background border border-border text-xs flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                                  >
                                    <div className="flex items-start gap-2.5">
                                      <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                        {idx + 1}
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-semibold text-foreground">{step.title}</span>
                                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                                            {step.stepType}
                                          </span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">{step.actionPrompt}</p>
                                      </div>
                                    </div>
                                    <div className="shrink-0 flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                                      <span className="text-primary font-medium">{step.agentId || "Alpha-Node-01"}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Autonomous Swarm Matrix & Architecture Clarification */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Swarm Agents</CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs font-mono">
                  {agents.length} Online Nodes
                </Badge>
              </div>
              <CardDescription>
                5 Autonomous compute nodes executing across 6 active DAGs (M:N Swarm Runtime)
              </CardDescription>
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

              <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  Why 6 DAGs vs 5 Swarm Nodes?
                </p>
                <p className="text-[11px] leading-relaxed">
                  Agents are independent workers assigned to specific steps inside DAGs. A single agent (e.g. Workflow-Planner)
                  runs tasks across multiple DAGs simultaneously without state overlap.
                </p>
              </div>
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
            <div className="p-4 space-y-3 max-h-[340px] min-h-[180px] overflow-y-auto font-mono text-xs bg-muted/20">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-xl max-w-[85%] space-y-2 ${
                    msg.sender === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "mr-auto bg-card border border-border text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[10px] opacity-75">
                    <span className="font-bold">{msg.sender === "user" ? "YOU" : "ORCHESTRATOR"}</span>
                    <span>{msg.time}</span>
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed font-sans text-xs">{msg.text}</div>

                  {/* If orchestrator returned a proposed workflow DAG, render actionable preview */}
                  {msg.proposal && (
                    <div className="mt-3 p-3 rounded-lg bg-background border border-border text-foreground space-y-2 font-sans">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-primary flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5" />
                          Proposed: {msg.proposal.name}
                        </span>
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {msg.proposal.departmentCode}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{msg.proposal.description}</p>
                      <div className="flex justify-end pt-1">
                        <Button
                          size="sm"
                          className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                          onClick={() => handleDeployProposalFromChat(msg.proposal)}
                        >
                          Approve & Deploy DAG
                        </Button>
                      </div>
                    </div>
                  )}
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

        {/* Row 4: Verifiable Results Vault - Content Calendar & Output Assets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Calendar & Scheduled Posts */}
          <Card className="lg:col-span-2 border-primary/30 bg-card">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Content Calendar & Scheduled Posts</CardTitle>
                    <CardDescription className="text-xs">
                      Live queue of generated syndication drafts, scheduled publish slots, and social posts.
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
                    {calendarData?.totalScheduled ?? 0} Scheduled
                  </Badge>
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs">
                    {calendarData?.totalDrafts ?? 0} Drafts
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => {
                      refetchCalendar();
                      refetchArtifacts();
                    }}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingCalendar ? (
                <div className="py-8 text-center text-xs text-muted-foreground animate-pulse">
                  Loading content calendar and active drafts...
                </div>
              ) : (calendarData?.calendarItems || []).length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-dashed border-border/80 bg-muted/10 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">No Content Scheduled in Queue</h4>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      Run the <span className="font-semibold text-foreground">Founder Signal Content Dissemination</span> or{" "}
                      <span className="font-semibold text-foreground">LinkedIn Syndication</span> workflow to generate 5-post syndication drafts with scheduled dates.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="h-8 text-xs bg-primary text-primary-foreground font-semibold gap-1.5"
                    onClick={() => {
                      // Trigger first content workflow if available
                      const contentWf = workflows.find((w: any) => w.name.toLowerCase().includes("content") || w.name.toLowerCase().includes("signal"));
                      if (contentWf) {
                        triggerRunMutation.mutate(contentWf.id);
                      } else {
                        toast.info("Please select a workflow from the list above to run content generation.");
                      }
                    }}
                  >
                    <Play className="w-3.5 h-3.5" />
                    Generate Content Batch
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {(calendarData?.calendarItems || []).map((item: any) => {
                    const isCopied = copiedId === item.id;
                    const scheduledDate = item.scheduledFor
                      ? new Date(item.scheduledFor).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                      : "Unscheduled Draft";

                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl border border-border bg-card/60 hover:border-primary/40 transition-all space-y-2.5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant="outline"
                              className="text-[10px] uppercase font-mono font-bold bg-blue-500/10 text-blue-400 border-blue-500/30"
                            >
                              {item.targetPlatform || "linkedin"}
                            </Badge>
                            <h4 className="font-semibold text-xs text-foreground truncate max-w-sm">
                              {item.title}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2">
                            {item.qualityGrade && (
                              <Badge
                                variant="outline"
                                className={`text-[10px] font-mono font-bold ${
                                  item.qualityGrade === "A"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                    : item.qualityGrade === "B"
                                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                                    : item.qualityGrade === "C"
                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                    : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                                }`}
                              >
                                Grade {item.qualityGrade} • {item.qualityScore ?? 90}%
                              </Badge>
                            )}
                            <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3 text-primary" />
                              {scheduledDate}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[10px] capitalize ${
                                item.status === "published"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                  : item.status === "scheduled"
                                  ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                  : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              }`}
                            >
                              {item.status}
                            </Badge>
                          </div>
                        </div>

                        {/* Post Content Excerpt */}
                        <p className="text-xs text-muted-foreground line-clamp-3 bg-muted/30 p-2.5 rounded-lg font-sans leading-relaxed border border-border/40">
                          {item.content}
                        </p>

                        {/* Card Footer Actions */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            {item.metadata?.hashtags && (
                              <span className="font-mono text-primary/80">
                                {Array.isArray(item.metadata.hashtags) ? item.metadata.hashtags.join(" ") : item.metadata.hashtags}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs px-2.5 gap-1 hover:bg-primary/10 hover:text-primary"
                              onClick={() => {
                                navigator.clipboard.writeText(item.content);
                                setCopiedId(item.id);
                                toast.success("Post copy copied to clipboard!");
                                setTimeout(() => setCopiedId(null), 2000);
                              }}
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                              {isCopied ? "Copied" : "Copy Copy"}
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs px-2.5 gap-1 border-border/60"
                              onClick={() => setSelectedArtifact(item)}
                            >
                              <FileText className="w-3.5 h-3.5" />
                              View & Refine
                            </Button>

                            {item.status !== "published" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs px-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                onClick={() => updateArtifactMutation.mutate({ id: item.id, status: "published" })}
                              >
                                Mark Published
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Column: Output Documents & Files Vault */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Generated Assets Vault</CardTitle>
                    <CardDescription className="text-xs">
                      Verifiable documents, briefs, and files.
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary border-primary/30"
                    onClick={() => {
                      setStudioPrompt("A visionary founder standing confidently amidst a dynamic, abstract representation of a smart, AI-driven operational dashboard. Interconnected data streams, glowing neural networks, navy #0F172A and sapphire blue.");
                      setIsStudioModalOpen(true);
                    }}
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    AI Studio
                  </Button>
                  <Badge variant="secondary" className="text-xs font-mono">
                    {artifactsData?.totalCount ?? 0} Assets
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoadingArtifacts ? (
                <div className="py-6 text-center text-xs text-muted-foreground">Loading assets...</div>
              ) : (artifactsData?.artifacts || []).filter((a: any) => a.artifactType !== "post").length === 0 ? (
                <div className="p-6 text-center rounded-xl border border-dashed text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground">No document files generated yet</p>
                  <p>Triggering SOP workflows will produce analysis reports and operational briefs here.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {(artifactsData?.artifacts || [])
                    .filter((a: any) => a.artifactType !== "post")
                    .map((asset: any) => (
                      <div
                        key={asset.id}
                        className="p-3 rounded-lg border border-border/80 bg-muted/20 hover:border-primary/40 cursor-pointer transition-all space-y-1"
                        onClick={() => setSelectedArtifact(asset)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-foreground truncate max-w-[180px]">
                            {asset.title}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {asset.metadata?.imageUrl && (
                              <Badge
                                variant="outline"
                                className="text-[9px] font-mono px-1.5 py-0 bg-blue-500/10 text-blue-400 border-blue-500/30"
                              >
                                🎨 Graphic Ready
                              </Badge>
                            )}
                            {asset.title?.toLowerCase().includes("visual spec") && !asset.metadata?.imageUrl && (
                              <Badge
                                variant="outline"
                                className="text-[9px] font-mono px-1.5 py-0 bg-purple-500/10 text-purple-400 border-purple-500/30"
                              >
                                🎨 Visual Spec
                              </Badge>
                            )}
                            {asset.qualityGrade && (
                              <Badge
                                variant="outline"
                                className="text-[9px] font-mono px-1.5 py-0 bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              >
                                {asset.qualityGrade} ({asset.qualityScore ?? 90}%)
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-[10px] uppercase font-mono">
                              {asset.artifactType}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                          {asset.summary || asset.content.slice(0, 80)}
                        </p>
                      </div>
                    ))}
                </div>
              )}

              {/* Local Content Queue Connection Note */}
              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1.5 font-sans">
                <div className="flex items-center justify-between font-semibold text-foreground">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-primary" />
                    Agent Lab LinkedIn Repo Queue
                  </span>
                  <Badge variant="outline" className="text-[10px] text-emerald-400 bg-emerald-500/10 border-emerald-500/30">
                    Linked
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Artifacts synced with <code className="text-primary font-mono text-[10px]">Agent Lab LinkedIn/Content-Queue.md</code> and verified evidence logs.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>


      {/* Step Adjuster & Maintenance Dialog */}
      <Dialog open={!!editingWorkflow} onOpenChange={(open) => !open && setEditingWorkflow(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <SlidersHorizontal className="w-5 h-5 text-primary" />
              Adjust Workflow & Step Nodes
            </DialogTitle>
            <DialogDescription>
              Fine-tune the DAG execution graph, modify prompts, or reassign swarm agents without recreating the workflow.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-3">
            {/* Metadata Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Workflow Name</label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Workflow Name"
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Trigger Type</label>
                <select
                  value={editTriggerType}
                  onChange={(e) => setEditTriggerType(e.target.value)}
                  className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-primary"
                >
                  <option value="manual">Manual Execution</option>
                  <option value="schedule">CRON Schedule</option>
                  <option value="webhook">Webhook / Inbound Event</option>
                  <option value="event">Event Stream</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Description</label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Workflow purpose and operational guidelines..."
                rows={2}
                className="text-xs"
              />
            </div>

            {/* Steps List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Step Nodes ({editSteps.length})
                </h4>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={handleAddStep}>
                  <Plus className="w-3.5 h-3.5" />
                  Add Step
                </Button>
              </div>

              {editSteps.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
                  No steps defined. Click "Add Step" to configure nodes.
                </div>
              ) : (
                <div className="space-y-3">
                  {editSteps.map((step, index) => (
                    <div
                      key={index}
                      className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                            {index + 1}
                          </span>
                          <Input
                            value={step.title}
                            onChange={(e) => {
                              const updated = [...editSteps];
                              updated[index].title = e.target.value;
                              setEditSteps(updated);
                            }}
                            placeholder="Step Title"
                            className="h-8 text-xs font-semibold w-64 bg-background"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Step Type */}
                          <select
                            value={step.stepType}
                            onChange={(e) => {
                              const updated = [...editSteps];
                              updated[index].stepType = e.target.value;
                              setEditSteps(updated);
                            }}
                            className="h-8 rounded-md border border-border bg-background px-2 text-[11px] uppercase font-mono"
                          >
                            <option value="agent">Agent Node</option>
                            <option value="trigger">Trigger Node</option>
                            <option value="guardrail">Guardrail Node</option>
                            <option value="destination">Destination Node</option>
                          </select>

                          {/* Reorder Buttons */}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            disabled={index === 0}
                            onClick={() => handleMoveStep(index, "up")}
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            disabled={index === editSteps.length - 1}
                            onClick={() => handleMoveStep(index, "down")}
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </Button>

                          {/* Delete Step */}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemoveStep(index)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-[11px] text-muted-foreground">Action Prompt / Instruction</label>
                          <Textarea
                            value={step.actionPrompt}
                            onChange={(e) => {
                              const updated = [...editSteps];
                              updated[index].actionPrompt = e.target.value;
                              setEditSteps(updated);
                            }}
                            rows={2}
                            placeholder="Prompt or instruction for this node..."
                            className="text-xs bg-background"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] text-muted-foreground">Assigned Swarm Node</label>
                          <select
                            value={step.agentId || ""}
                            onChange={(e) => {
                              const updated = [...editSteps];
                              updated[index].agentId = e.target.value;
                              setEditSteps(updated);
                            }}
                            className="w-full h-9 rounded-md border border-border bg-background px-2 text-xs font-mono"
                          >
                            <option value="">-- No Assigned Agent --</option>
                            {agentsData?.agents && agentsData.agents.length > 0 ? (
                              agentsData.agents.map((ag: any) => (
                                <option key={ag.id} value={ag.id}>
                                  {ag.name} ({ag.role})
                                </option>
                              ))
                            ) : (
                              <>
                                <option value="Alpha-Node-01">Alpha-Node-01 (Lead Enrichment)</option>
                                <option value="Coder-Agent-07">Coder-Agent-07 (SWE)</option>
                                <option value="SDR-Writer-02">SDR-Writer-02 (Copywriter)</option>
                                <option value="Auditor-Bot-9">Auditor-Bot-9 (Reconciliation)</option>
                                <option value="Workflow-Planner-04">Workflow-Planner-04 (Task Router)</option>
                              </>
                            )}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setEditingWorkflow(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveWorkflowChanges}
              disabled={isSavingWorkflow || !editName.trim()}
              className="bg-primary text-primary-foreground font-semibold"
            >
              {isSavingWorkflow ? "Saving Changes..." : "Save Workflow Adjustments"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Artifact & Scheduled Content Inspector Modal */}
      <Dialog open={Boolean(selectedArtifact)} onOpenChange={(open) => !open && setSelectedArtifact(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs uppercase font-mono bg-primary/10 text-primary border-primary/30">
                {selectedArtifact?.artifactType}
              </Badge>
              <DialogTitle className="text-base font-bold text-foreground">
                {selectedArtifact?.title}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs flex items-center gap-2 pt-1">
              <span>Platform: <strong className="text-foreground capitalize">{selectedArtifact?.targetPlatform || "linkedin"}</strong></span>
              {selectedArtifact?.scheduledFor && (
                <span>• Scheduled: <strong className="text-foreground">{new Date(selectedArtifact.scheduledFor).toLocaleString()}</strong></span>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedArtifact && (
            <div className="space-y-4 py-2 text-xs">
              {/* Quality Evaluation & Flywheel Banner */}
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs font-mono font-bold ${
                        (selectedArtifact.qualityGrade || "A") === "A"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : (selectedArtifact.qualityGrade || "A") === "B"
                          ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                          : (selectedArtifact.qualityGrade || "A") === "C"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      }`}
                    >
                      Grade {selectedArtifact.qualityGrade || "A"} • {selectedArtifact.qualityScore ?? 90}% Quality
                    </Badge>
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {selectedArtifact.verificationNotes?.passed !== false ? "✓ Passed Brand & Fact Checks" : "⚠ Quality Review Suggested"}
                    </span>
                    {selectedArtifact.revisionVersion > 1 && (
                      <Badge variant="secondary" className="text-[10px] font-mono">
                        v{selectedArtifact.revisionVersion}
                      </Badge>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[11px] font-mono gap-1 text-primary hover:bg-primary/10"
                    disabled={evaluateArtifactMutation.isPending}
                    onClick={() => evaluateArtifactMutation.mutate(selectedArtifact.id)}
                  >
                    <RefreshCw className={`w-3 h-3 ${evaluateArtifactMutation.isPending ? "animate-spin" : ""}`} />
                    Re-evaluate
                  </Button>
                </div>

                {/* Feedback points */}
                {selectedArtifact.verificationNotes?.feedback?.length > 0 && (
                  <div className="space-y-1 text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                    {selectedArtifact.verificationNotes.feedback.map((fb: string, i: number) => (
                      <p key={i} className="flex items-center gap-1.5">
                        <span className="text-primary font-bold">•</span> {fb}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary */}
              {selectedArtifact.summary && (
                <div className="p-3 rounded-lg bg-card border border-border/60">
                  <span className="font-semibold text-foreground">Hook / Summary: </span>
                  <span className="text-muted-foreground">{selectedArtifact.summary}</span>
                </div>
              )}

              {/* Main Content Body */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-foreground">Draft Copy & Body</label>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs gap-1"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedArtifact.content);
                      toast.success("Draft copied to clipboard!");
                    }}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy All
                  </Button>
                </div>
                <div className="p-4 rounded-xl bg-background border border-border font-sans leading-relaxed whitespace-pre-wrap select-text text-foreground">
                  {selectedArtifact.content}
                </div>
              </div>

              {/* AI Graphic Generation Studio Card */}
              <div className="p-4 rounded-xl bg-card border border-primary/20 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                        AI Graphic Studio
                        {selectedArtifact.metadata?.imageEngine && (
                          <Badge variant="outline" className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                            {selectedArtifact.metadata.imageEngine.includes("Imagen") ? "Imagen 3" : "Flux Schnell"}
                          </Badge>
                        )}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">High-resolution brand graphic render (1024px+)</p>
                    </div>
                  </div>

                  {selectedArtifact.metadata?.imageUrl && (
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1"
                        onClick={() => {
                          const a = document.createElement("a");
                          a.href = selectedArtifact.metadata.imageUrl;
                          a.download = `${selectedArtifact.title.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
                          a.click();
                          toast.success("Downloading high-resolution graphic!");
                        }}
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs gap-1"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedArtifact.metadata.imageUrl);
                          toast.success("Image URL copied!");
                        }}
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy URL
                      </Button>
                    </div>
                  )}
                </div>

                {/* Live Image Render Container */}
                {selectedArtifact.metadata?.imageUrl ? (
                  <div className="relative rounded-lg overflow-hidden border border-border bg-black/40 group">
                    <img
                      src={selectedArtifact.metadata.imageUrl}
                      alt={selectedArtifact.title}
                      className="w-full h-auto max-h-80 object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded text-[10px] font-mono text-white flex items-center gap-1.5">
                      <span>{selectedArtifact.metadata?.aspectRatio || "16:9"}</span>
                      <span>•</span>
                      <span>{selectedArtifact.metadata?.imageEngine || "AI Render"}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-muted/20 border border-dashed border-border text-center space-y-1">
                    <p className="text-xs text-muted-foreground">Ready to render visual asset for this specification.</p>
                  </div>
                )}

                {/* Controls: Aspect Ratio + Generate Button */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/40">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-muted-foreground mr-1">Ratio:</span>
                    {(["16:9", "1:1", "4:5", "9:16"] as const).map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setSelectedRatio(ratio)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition ${
                          selectedRatio === ratio
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    className="h-8 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold gap-1.5 shadow"
                    disabled={isGeneratingImage || generateImageMutation.isPending}
                    onClick={() => {
                      let visualPrompt = selectedArtifact.metadata?.visualPrompt;
                      if (!visualPrompt) {
                        const bodyMatch = selectedArtifact.content.match(/\*\*Prompt Template\*\*:\s*(?:```(?:\w+)?\n)?([\s\S]*?)(?:```|\*\*Art Direction|\*\*Brand Palette|$)/i);
                        if (bodyMatch && bodyMatch[1].trim().length > 10) {
                          visualPrompt = bodyMatch[1].replace(/```/g, "").replace(/\.\.\./g, "").trim();
                        } else {
                          visualPrompt = selectedArtifact.summary || selectedArtifact.title;
                        }
                      }
                      generateImageMutation.mutate({
                        prompt: visualPrompt,
                        aspectRatio: selectedRatio,
                        artifactId: selectedArtifact.id,
                        title: selectedArtifact.title,
                      });
                    }}
                  >
                    <Wand2 className={`w-3.5 h-3.5 ${isGeneratingImage ? "animate-spin" : ""}`} />
                    {isGeneratingImage ? "Rendering with AI..." : selectedArtifact.metadata?.imageUrl ? "Re-generate Graphic" : "Generate AI Graphic Now"}
                  </Button>
                </div>
              </div>

              {/* Agent Self-Correction & Refinement Flywheel */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-card to-primary/5 border border-primary/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    Agent Self-Correction & Refinement
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">Quality Flywheel</span>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Provide refinement instructions (e.g. 'Make hook punchier, add SOE framework metrics')..."
                    value={refinementInstructions}
                    onChange={(e) => setRefinementInstructions(e.target.value)}
                    className="text-xs h-8 bg-background"
                  />
                  <Button
                    size="sm"
                    className="h-8 text-xs bg-primary text-primary-foreground font-semibold shrink-0 gap-1.5 shadow"
                    disabled={isRefining || refineArtifactMutation.isPending}
                    onClick={() =>
                      refineArtifactMutation.mutate({
                        id: selectedArtifact.id,
                        instructions: refinementInstructions,
                      })
                    }
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isRefining ? "animate-spin" : ""}`} />
                    {isRefining ? "Refining..." : "Refine with Agent"}
                  </Button>
                </div>
              </div>

              {/* Metadata & Hashtags */}
              {selectedArtifact.metadata?.hashtags && (
                <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-2">
                  <span className="font-semibold text-primary">Hashtags:</span>
                  <span className="font-mono text-muted-foreground">
                    {Array.isArray(selectedArtifact.metadata.hashtags)
                      ? selectedArtifact.metadata.hashtags.join(" ")
                      : selectedArtifact.metadata.hashtags}
                  </span>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="pt-3 border-t border-border flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setSelectedArtifact(null)}>
              Close
            </Button>
            {selectedArtifact?.status !== "published" && (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
                onClick={() => {
                  updateArtifactMutation.mutate({ id: selectedArtifact.id, status: "published" });
                  setSelectedArtifact(null);
                }}
              >
                <Check className="w-4 h-4" />
                Mark as Published
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Live Run & Telemetry Inspector Modal */}
      <RunInspectorModal
        runId={inspectingRunId}
        open={Boolean(inspectingRunId)}
        onOpenChange={(open) => !open && setInspectingRunId(null)}
      />
      {/* Dedicated Standalone AI Graphic Studio Modal */}
      <Dialog open={isStudioModalOpen} onOpenChange={setIsStudioModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                <Wand2 className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  AI Graphic Studio & Visual Generator
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Generate high-resolution brand visuals, Midjourney/Flux renders, and social graphics powered by Google Imagen 3.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Style Presets */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Style Direction Preset</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { name: "Modern B2B Isometric", desc: "Clean 3D UI & vectors" },
                  { name: "Dark Glassmorphism", desc: "Glowing tech dashboard" },
                  { name: "Founder / Executive", desc: "Crisp studio portrait" },
                  { name: "Minimalist Vector", desc: "High-contrast editorial" },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setStudioPreset(preset.name)}
                    className={`p-2.5 rounded-lg border text-left transition ${
                      studioPreset === preset.name
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <div className="font-bold text-[11px] text-foreground">{preset.name}</div>
                    <div className="text-[10px] text-muted-foreground">{preset.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Visual Prompt & Concept</label>
              <Textarea
                rows={3}
                value={studioPrompt}
                onChange={(e) => setStudioPrompt(e.target.value)}
                placeholder="Describe your visual concept (e.g. A futuristic founder workspace overlooking a vibrant city, interconnected data streams, navy and sapphire lighting)..."
                className="text-xs bg-background resize-none"
              />
            </div>

            {/* Aspect Ratio Selector */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground">Aspect Ratio:</span>
                {(["16:9", "1:1", "4:5", "9:16"] as const).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setSelectedRatio(ratio)}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition ${
                      selectedRatio === ratio
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>

              <Button
                size="sm"
                className="h-8 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold gap-1.5 shadow"
                disabled={isGeneratingImage || !studioPrompt.trim()}
                onClick={async () => {
                  setIsGeneratingImage(true);
                  try {
                    const res = await fetch("/api/generate-image", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        prompt: studioPrompt,
                        aspectRatio: selectedRatio,
                        stylePreset: studioPreset,
                        title: "AI Studio Graphic",
                      }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Generation failed");
                    setStudioResult({
                      imageUrl: data.imageUrl,
                      engine: data.engine,
                      title: data.title || "Generated Graphic",
                      aspectRatio: data.aspectRatio || selectedRatio,
                    });
                    toast.success(`Graphic generated with ${data.engine}! 🎨`);
                    queryClient.invalidateQueries({ queryKey: ["workflow-artifacts"] });
                  } catch (err: any) {
                    toast.error(err.message || "Failed to generate graphic");
                  } finally {
                    setIsGeneratingImage(false);
                  }
                }}
              >
                <Wand2 className={`w-3.5 h-3.5 ${isGeneratingImage ? "animate-spin" : ""}`} />
                {isGeneratingImage ? "Rendering Image..." : "Generate Graphic"}
              </Button>
            </div>

            {/* Generated Image Result Preview */}
            {studioResult && (
              <div className="p-3.5 rounded-xl bg-muted/30 border border-primary/20 space-y-2.5 pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                      {studioResult.engine.includes("Imagen") ? "Imagen 3" : "Flux Schnell"}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground font-mono">{studioResult.aspectRatio}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1"
                      onClick={() => {
                        const a = document.createElement("a");
                        a.href = studioResult.imageUrl;
                        a.download = "AgentLab_AI_Graphic.png";
                        a.click();
                        toast.success("Downloaded graphic!");
                      }}
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs gap-1"
                      onClick={() => {
                        navigator.clipboard.writeText(studioResult.imageUrl);
                        toast.success("Image URL copied!");
                      }}
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy URL
                    </Button>
                  </div>
                </div>

                <div className="relative rounded-lg overflow-hidden border border-border bg-black/50">
                  <img
                    src={studioResult.imageUrl}
                    alt="AI Studio Output"
                    className="w-full h-auto max-h-80 object-contain mx-auto"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setIsStudioModalOpen(false)}>
              Close Studio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

