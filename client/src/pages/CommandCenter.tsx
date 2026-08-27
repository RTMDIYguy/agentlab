import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2, PlayCircle, Clock, CheckCircle2, AlertCircle, PauseCircle, ChevronRight, Eye, Plus, Calendar } from "lucide-react";
import { formatDate } from "date-fns";

interface Workflow {
  id: string;
  name: string;
  description: string;
  triggerType: string;
  status: string;
  successRate: number;
  stepsCount: number;
  cronExpression?: string;
  nextRunAt?: string;
}

interface Run {
  id: string;
  workflowId: string;
  status: string;
  startedAt: string | null;
  createdAt: string;
  completedAt: string | null;
  initialContext?: any;
}

interface RunStep {
  id: string;
  status: string;
  stepName: string;
  description: string;
  outputPayload?: any;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
}

export default function CommandCenter() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  // Run Workflow Form State
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [primaryObjective, setPrimaryObjective] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [approvalRunId, setApprovalRunId] = useState<string | null>(null);

  // Create Custom Workflow Form State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [newWorkflowDescription, setNewWorkflowDescription] = useState("");
  const [newWorkflowPrompt, setNewWorkflowPrompt] = useState("");

  // Schedule Modal State
  const [scheduleWorkflowId, setScheduleWorkflowId] = useState<string | null>(null);
  const [cronExpression, setCronExpression] = useState("");

  // Fetch Workflows
  const { data: workflowsData, isLoading: isLoadingWorkflows } = useQuery<{ workflows: Workflow[] }>({
    queryKey: ["workflows", user?.uid],
    queryFn: async () => {
      const token = await user?.getIdToken();
      const res = await fetch("/api/workflows", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch workflows");
      return res.json();
    },
    enabled: !!user,
  });

  // Fetch Runs (poll every 5 seconds)
  const { data: runsData, refetch: refetchRuns } = useQuery<{ runs: Run[] }>({
    queryKey: ["runs", user?.uid],
    queryFn: async () => {
      const token = await user?.getIdToken();
      const res = await fetch("/api/runs", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch runs");
      return res.json();
    },
    enabled: !!user,
    refetchInterval: 5000,
  });

  // Fetch specific run details for timeline / approval
  const activeDetailRunId = approvalRunId || selectedRunId;
  const { data: runDetails, isLoading: isLoadingRunDetails } = useQuery<{ run: Run, steps: RunStep[] }>({
    queryKey: ["run-details", activeDetailRunId, user?.uid],
    queryFn: async () => {
      if (!activeDetailRunId) return null;
      const token = await user?.getIdToken();
      const res = await fetch(`/api/runs/${activeDetailRunId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch run details");
      return res.json();
    },
    enabled: !!activeDetailRunId && !!user,
    refetchInterval: (query) => {
      if (query.state.data?.run.status === "running") return 3000;
      return false;
    }
  });

  const selectedWorkflow = workflowsData?.workflows.find(w => w.id === selectedWorkflowId);
  const isPlaybook = selectedWorkflow ? ["wf-001", "wf-002", "wf-003"].includes(selectedWorkflow.id) || selectedWorkflow.id.startsWith("wf-") : false;
  const isDIY = !isPlaybook;

  // Run Workflow Mutation
  const triggerRunMutation = useMutation({
    mutationFn: async (workflowId: string) => {
      const parsedContext = isPlaybook 
        ? { targetData: additionalContext, formula: selectedWorkflow?.description }
        : { primaryObjective, targetAudience, additionalContext };

      const token = await user?.getIdToken();
      const res = await fetch(`/api/workflows/${workflowId}/run`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ initialContext: parsedContext, triggerSource: "manual" }),
      });
      if (!res.ok) throw new Error("Failed to trigger run");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Workflow started successfully");
      setIsRunModalOpen(false);
      setPrimaryObjective("");
      setTargetAudience("");
      setAdditionalContext("");
      refetchRuns();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Approve Run Mutation
  const approveRunMutation = useMutation({
    mutationFn: async (runId: string) => {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/runs/${runId}/approve`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to approve run");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Run approved and resumed");
      setApprovalRunId(null);
      refetchRuns();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Reject Run Mutation
  const rejectRunMutation = useMutation({
    mutationFn: async (runId: string) => {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/runs/${runId}/reject`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to reject run");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Run rejected and cancelled");
      setApprovalRunId(null);
      refetchRuns();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Create Custom Workflow Mutation
  const createWorkflowMutation = useMutation({
    mutationFn: async () => {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/workflows`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name: newWorkflowName,
          description: newWorkflowDescription,
          actionPrompt: newWorkflowPrompt
        }),
      });
      if (!res.ok) throw new Error("Failed to create workflow");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Custom workflow created");
      setIsCreateModalOpen(false);
      setNewWorkflowName("");
      setNewWorkflowDescription("");
      setNewWorkflowPrompt("");
      // @ts-ignore
      refetchRuns();
      // @ts-ignore
      window.location.reload(); 
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Update Schedule Mutation
  const scheduleWorkflowMutation = useMutation({
    mutationFn: async () => {
      if (!scheduleWorkflowId) return;
      const token = await user?.getIdToken();
      const triggerType = cronExpression ? "schedule" : "manual";
      const res = await fetch(`/api/workflows/${scheduleWorkflowId}/schedule`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ triggerType, cronExpression }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update schedule");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Schedule updated");
      setScheduleWorkflowId(null);
      setCronExpression("");
      window.location.reload();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "failed": return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "running": return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case "paused_for_approval": return <PauseCircle className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "failed": return "destructive";
      case "running": return "secondary";
      case "paused_for_approval": return "outline"; // We will style this explicitly below
      default: return "secondary";
    }
  };

  const handleRunClick = (workflowId: string, workflowName: string) => {
    setSelectedWorkflowId(workflowId);
    setPrimaryObjective("");
    setTargetAudience("");
    setAdditionalContext("");
    setIsRunModalOpen(true);
  };

  const handleScheduleClick = (workflow: Workflow) => {
    setScheduleWorkflowId(workflow.id);
    setCronExpression(workflow.cronExpression || "");
  };

  // Derived state for Categorization
  const allWorkflows = workflowsData?.workflows || [];
  const allRuns = runsData?.runs || [];

  // Deduplicate workflows by name to avoid duplicate subscription cards
  const uniqueWorkflowsMap = new Map<string, Workflow>();
  for (const wf of allWorkflows) {
    // Keep the one that has runs or is scheduled, or just the first one we see
    if (!uniqueWorkflowsMap.has(wf.name)) {
      uniqueWorkflowsMap.set(wf.name, wf);
    } else {
      const existing = uniqueWorkflowsMap.get(wf.name)!;
      const existingHasRuns = allRuns.some(r => r.workflowId === existing.id);
      const newHasRuns = allRuns.some(r => r.workflowId === wf.id);
      if (newHasRuns && !existingHasRuns) {
        uniqueWorkflowsMap.set(wf.name, wf);
      } else if (wf.triggerType === "schedule" && existing.triggerType !== "schedule") {
        uniqueWorkflowsMap.set(wf.name, wf);
      }
    }
  }
  const deduplicatedWorkflows = Array.from(uniqueWorkflowsMap.values());

  const availablePlaybooks = deduplicatedWorkflows.filter(wf => {
    const isSubscription = wf.id.startsWith("wf-") || ["Inbound Lead Enrichment", "M365 Daily Financial Reconciliation", "Automated CI/CD Test & Refactor Suite"].includes(wf.name);
    const hasRuns = allRuns.some(r => r.workflowId === wf.id);
    const isScheduled = wf.triggerType === "schedule";
    // Available = subscription workflows they haven't run and aren't scheduled
    return isSubscription && !hasRuns && !isScheduled;
  });

  const activeWorkflows = deduplicatedWorkflows.filter(wf => {
    const isSubscription = wf.id.startsWith("wf-") || ["Inbound Lead Enrichment", "M365 Daily Financial Reconciliation", "Automated CI/CD Test & Refactor Suite"].includes(wf.name);
    const hasRuns = allRuns.some(r => r.workflowId === wf.id);
    const isScheduled = wf.triggerType === "schedule";
    // Active = their own workflows, OR subscription workflows they have run or scheduled
    return !isSubscription || hasRuns || isScheduled;
  });

  return (
    <DashboardLayout>
      <div className="container py-12">
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Command Center</h1>
            <p className="text-muted-foreground">Execute, monitor, and approve your automated AgentLab workflows.</p>
          </div>
          <Button 
            variant="default"
            className="shrink-0 gap-2"
            onClick={() => window.location.href = "/marketplace"}
          >
            Browse Marketplace <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-12">
          {/* Active Workflows Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Active & Scheduled Workflows</h2>
            {isLoadingWorkflows ? (
              <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Create Custom Workflow Card */}
                <Card 
                  className="flex flex-col border-dashed border-2 border-border/60 hover:border-primary/50 transition-colors cursor-pointer bg-muted/20 items-center justify-center text-center p-6 min-h-[250px]"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Plus className="w-10 h-10 text-muted-foreground mb-4" />
                  <CardTitle className="text-xl mb-2 text-foreground">Create Custom Workflow</CardTitle>
                  <CardDescription>
                    Define your own autonomous agent workflow from scratch using a custom system prompt.
                  </CardDescription>
                </Card>

                {activeWorkflows.map((wf) => (
                  <Card key={wf.id} className="flex flex-col border-border/60 hover:border-border transition-colors">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-start justify-between">
                        {wf.name}
                        <Badge variant="secondary">{wf.stepsCount} steps</Badge>
                      </CardTitle>
                      <CardDescription>{wf.description || "Custom Workflow"}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                        <span><strong>Trigger:</strong> {wf.triggerType}</span>
                        {wf.triggerType === "schedule" && wf.cronExpression && (
                          <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                            {wf.cronExpression}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Success Rate:</strong> {wf.successRate}%
                      </p>
                    </CardContent>
                    <div className="p-6 pt-0 mt-auto flex gap-2">
                      <Button 
                        className="run-workflow-btn flex-grow gap-2" 
                        onClick={() => handleRunClick(wf.id, wf.name)}
                      >
                        <PlayCircle className="w-4 h-4" /> Run Now
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleScheduleClick(wf)}>
                        <Calendar className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Available Playbooks Section */}
          {availablePlaybooks.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-6">Available Playbooks</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availablePlaybooks.map((wf) => (
                  <Card key={wf.id} className="flex flex-col border-border/60 hover:border-border transition-colors opacity-90">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-start justify-between">
                        {wf.name}
                        <Badge variant="secondary">{wf.stepsCount} steps</Badge>
                      </CardTitle>
                      <CardDescription>{wf.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Trigger:</strong> {wf.triggerType}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Success Rate:</strong> {wf.successRate}%
                      </p>
                    </CardContent>
                    <div className="p-6 pt-0 mt-auto flex gap-2">
                      <Button 
                        className="run-workflow-btn flex-grow gap-2" 
                        onClick={() => handleRunClick(wf.id, wf.name)}
                      >
                        <PlayCircle className="w-4 h-4" /> Run Workflow
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleScheduleClick(wf)}>
                        <Calendar className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Recent Runs Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Execution History</h2>
            <Card className="border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Run ID</TableHead>
                    <TableHead>Workflow ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Started At</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runsData?.runs?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No recent runs found.
                      </TableCell>
                    </TableRow>
                  ) : runsData?.runs?.map((run) => (
                    <TableRow key={run.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => run.status !== "paused_for_approval" && setSelectedRunId(run.id)}>
                      <TableCell className="font-mono text-xs">{run.id.slice(0, 8)}</TableCell>
                      <TableCell className="text-muted-foreground">{run.workflowId.slice(0, 12)}...</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(run.status)}
                          <Badge 
                            variant={getStatusBadgeVariant(run.status)} 
                            className={`capitalize ${run.status === "paused_for_approval" ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20" : ""}`}
                          >
                            {run.status.replace(/_/g, " ")}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(new Date(run.startedAt || run.createdAt), "MMM d, HH:mm:ss")}</TableCell>
                      <TableCell className="text-right">
                        {run.status === "paused_for_approval" ? (
                          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white" onClick={(e) => { e.stopPropagation(); setApprovalRunId(run.id); }}>
                            Review Required
                          </Button>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setSelectedRunId(run.id); }}>
                            <Eye className="w-4 h-4 mr-2" /> Details
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </section>
        </div>

        {/* Run Modal (Clean Form) */}
        <Dialog open={isRunModalOpen} onOpenChange={setIsRunModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Configure Execution: {workflowsData?.workflows.find(w => w.id === selectedWorkflowId)?.name}</DialogTitle>
              <DialogDescription>
                Instructions: Provide the necessary inputs for {workflowsData?.workflows.find(w => w.id === selectedWorkflowId)?.name}.
                <br/>
                Description: {workflowsData?.workflows.find(w => w.id === selectedWorkflowId)?.description}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              {isDIY && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="objective">Primary Objective</Label>
                    <Input 
                      id="objective"
                      value={primaryObjective}
                      onChange={(e) => setPrimaryObjective(e.target.value)}
                      placeholder="Primary objective or goal..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="audience">Target Audience</Label>
                    <Input 
                      id="audience"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="Target entity, client, file, or record..."
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="context">{isPlaybook ? "Target Data / Input Context" : "Additional Context"}</Label>
                <Textarea 
                  id="context"
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder={isPlaybook ? "Paste relevant URLs, documents, or data required for this playbook..." : "Any specific instructions or constraints for the agent..."}
                  className="h-24 resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRunModalOpen(false)}>Cancel</Button>
              <Button 
                onClick={() => selectedWorkflowId && triggerRunMutation.mutate(selectedWorkflowId)}
                disabled={triggerRunMutation.isPending}
              >
                {triggerRunMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Execute Workflow
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Custom Workflow Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Custom Workflow</DialogTitle>
              <DialogDescription>
                Define the parameters and the system prompt for your new autonomous workflow.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wfName">Workflow Name</Label>
                <Input 
                  id="wfName"
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                  placeholder="e.g. Lead Generation Sweeper"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wfDesc">Description</Label>
                <Input 
                  id="wfDesc"
                  value={newWorkflowDescription}
                  onChange={(e) => setNewWorkflowDescription(e.target.value)}
                  placeholder="Brief description of the workflow's purpose..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wfPrompt">Agent Action Prompt</Label>
                <Textarea 
                  id="wfPrompt"
                  value={newWorkflowPrompt}
                  onChange={(e) => setNewWorkflowPrompt(e.target.value)}
                  placeholder="Detailed instructions for what the agent should do..."
                  className="h-32 resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
              <Button 
                onClick={() => createWorkflowMutation.mutate()}
                disabled={createWorkflowMutation.isPending}
              >
                {createWorkflowMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Create Workflow
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Schedule Modal */}
        <Dialog open={!!scheduleWorkflowId} onOpenChange={(open) => !open && setScheduleWorkflowId(null)}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Set Schedule</DialogTitle>
              <DialogDescription>
                Provide a CRON expression to automate this workflow. Clear the field to revert to manual triggers.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cron">CRON Expression</Label>
                <Input 
                  id="cron"
                  value={cronExpression}
                  onChange={(e) => setCronExpression(e.target.value)}
                  placeholder="e.g. 0 18 * * * (Daily at 6PM)"
                />
                <p className="text-xs text-muted-foreground mt-2">Format: Minute Hour Day Month Weekday</p>
                <p className="text-xs text-muted-foreground">Every Minute: * * * * *</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setScheduleWorkflowId(null)}>Cancel</Button>
              <Button 
                onClick={() => scheduleWorkflowMutation.mutate()}
                disabled={scheduleWorkflowMutation.isPending}
              >
                {scheduleWorkflowMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Timeline Details Modal */}
        <Dialog open={!!selectedRunId} onOpenChange={(open) => !open && setSelectedRunId(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Execution Timeline</DialogTitle>
              <DialogDescription className="font-mono text-xs mt-1">
                Run ID: {selectedRunId}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 max-h-[60vh] overflow-y-auto">
              {isLoadingRunDetails ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : (
                <div className="space-y-6">
                  {runDetails?.steps && runDetails.steps.length > 0 ? (
                    <div className="relative pl-6 border-l border-border ml-2 space-y-8">
                      {runDetails.steps.map((step, idx) => (
                        <div key={step.id} className="relative">
                          <div className="absolute -left-[35px] top-1 bg-background rounded-full">
                            {getStatusIcon(step.status)}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                              Step {idx + 1}: {step.stepName || `Task ${idx + 1}`}
                              <Badge variant="secondary" className="text-[10px] capitalize font-normal px-1.5 py-0">
                                {step.status}
                              </Badge>
                            </h4>
                            {step.description && (
                              <p className="text-xs text-muted-foreground mt-1 mb-2">{step.description}</p>
                            )}
                            {step.status === "failed" && step.errorMessage && (
                              <div className="mt-2 p-3 bg-destructive/10 text-destructive rounded-md text-xs border border-destructive/20">
                                {step.errorMessage}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No steps recorded yet.</p>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedRunId(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Human-in-the-Loop Approval Modal */}
        <Dialog open={!!approvalRunId} onOpenChange={(open) => !open && setApprovalRunId(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Human-in-the-Loop Review
              </DialogTitle>
              <DialogDescription>
                The agent has reached a guardrail checkpoint and requires approval before proceeding.
              </DialogDescription>
            </DialogHeader>
            <div className="py-2 max-h-[50vh] overflow-y-auto">
              {isLoadingRunDetails ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-card border border-border p-5 rounded-lg shadow-sm">
                    <h3 className="text-sm font-medium mb-4 text-foreground border-b border-border pb-2">Proposed Output payload</h3>
                    {(() => {
                      const payloadToReview = (runDetails?.steps && [...runDetails.steps].reverse().find(s => s.outputPayload)?.outputPayload) || runDetails?.run?.initialContext;
                      
                      if (payloadToReview && Object.keys(payloadToReview).length > 0) {
                        return (
                          <div className="space-y-3">
                            {Object.entries(payloadToReview).map(([key, value]) => (
                              <div key={key} className="grid grid-cols-3 gap-4 text-sm">
                                <div className="font-semibold text-muted-foreground capitalize">{key.replace(/_/g, ' ')}:</div>
                                <div className="col-span-2 text-foreground break-words">
                                  {typeof value === 'object' ? (
                                    <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>
                                  ) : (
                                    String(value)
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      
                      return <p className="text-sm text-muted-foreground italic">Empty payload.</p>;
                    })()}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => approvalRunId && rejectRunMutation.mutate(approvalRunId)}
                disabled={rejectRunMutation.isPending || isLoadingRunDetails}
              >
                {rejectRunMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Reject / Cancel
              </Button>
              <Button 
                className="bg-amber-500 hover:bg-amber-600 text-white"
                onClick={() => approvalRunId && approveRunMutation.mutate(approvalRunId)}
                disabled={approveRunMutation.isPending || isLoadingRunDetails}
              >
                {approveRunMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Approve & Continue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}
