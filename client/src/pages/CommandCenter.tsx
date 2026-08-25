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
import { PageLayout } from "@/components/PageLayout";
import { Loader2, PlayCircle, Clock, CheckCircle2, AlertCircle, PauseCircle, ChevronRight, Eye } from "lucide-react";
import { formatDate } from "date-fns";

interface Workflow {
  id: string;
  name: string;
  description: string;
  triggerType: string;
  status: string;
  successRate: number;
  stepsCount: number;
}

interface Run {
  id: string;
  workflowId: string;
  status: string;
  startedAt: string | null;
  createdAt: string;
  completedAt: string | null;
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
  // Run Workflow Form State
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [primaryObjective, setPrimaryObjective] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  
  // Tracking & Approval State
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [approvalRunId, setApprovalRunId] = useState<string | null>(null);

  // Fetch Workflows
  const { data: workflowsData, isLoading: isLoadingWorkflows } = useQuery<{ workflows: Workflow[] }>({
    queryKey: ["workflows"],
    queryFn: async () => {
      const res = await fetch("/api/workflows");
      if (!res.ok) throw new Error("Failed to fetch workflows");
      return res.json();
    },
  });

  // Fetch Runs (poll every 5 seconds)
  const { data: runsData, refetch: refetchRuns } = useQuery<{ runs: Run[] }>({
    queryKey: ["runs"],
    queryFn: async () => {
      const res = await fetch("/api/runs");
      if (!res.ok) throw new Error("Failed to fetch runs");
      return res.json();
    },
    refetchInterval: 5000,
  });

  // Fetch specific run details for timeline / approval
  const activeDetailRunId = approvalRunId || selectedRunId;
  const { data: runDetails, isLoading: isLoadingRunDetails } = useQuery<{ run: Run, steps: RunStep[] }>({
    queryKey: ["run-details", activeDetailRunId],
    queryFn: async () => {
      if (!activeDetailRunId) return null;
      const res = await fetch(`/api/runs/${activeDetailRunId}`);
      if (!res.ok) throw new Error("Failed to fetch run details");
      return res.json();
    },
    enabled: !!activeDetailRunId,
    refetchInterval: (query) => {
      if (query.state.data?.run.status === "running") return 3000;
      return false;
    }
  });

  // Run Workflow Mutation
  const triggerRunMutation = useMutation({
    mutationFn: async (workflowId: string) => {
      const parsedContext = {
        primaryObjective,
        targetAudience,
        additionalContext
      };
      const res = await fetch(`/api/workflows/${workflowId}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      const res = await fetch(`/api/runs/${runId}/approve`, {
        method: "POST",
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

  return (
    <PageLayout>
      <div className="container py-12">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Command Center</h1>
            <p className="text-muted-foreground">Execute, monitor, and approve your automated AgentLab workflows.</p>
          </div>
        </div>

        <div className="space-y-12">
          {/* Workflows Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Available Workflows</h2>
            {isLoadingWorkflows ? (
              <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workflowsData?.workflows.map((wf) => (
                  <Card key={wf.id} className="flex flex-col border-border/60 hover:border-border transition-colors">
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
                    <div className="p-6 pt-0 mt-auto">
                      <Button 
                        className="run-workflow-btn w-full gap-2" 
                        onClick={() => handleRunClick(wf.id, wf.name)}
                      >
                        <PlayCircle className="w-4 h-4" /> Run Workflow
                      </Button>
                    </div>
                  </Card>
                ))}
                {workflowsData?.workflows.length === 0 && (
                  <p className="text-muted-foreground col-span-3 py-4">No active workflows found. Unlock packages in the Marketplace to see workflows here.</p>
                )}
              </div>
            )}
          </section>

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
                Provide context for this workflow run. These parameters will be passed to the agent.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="objective">Workflow Objective / Goal</Label>
                <Input 
                  id="objective"
                  value={primaryObjective}
                  onChange={(e) => setPrimaryObjective(e.target.value)}
                  placeholder="e.g. Generate 5 warm leads"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="audience">Target Entity (Client, File, or Record)</Label>
                <Input 
                  id="audience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. B2B SaaS Founders"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="context">Additional Context</Label>
                <Textarea 
                  id="context"
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="Any specific instructions or constraints for the agent..."
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
                    {runDetails?.steps && runDetails.steps.length > 0 ? (
                      <div className="space-y-3">
                        {Object.entries(runDetails.steps[runDetails.steps.length - 1].outputPayload || {}).map(([key, value]) => (
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
                        {!runDetails.steps[runDetails.steps.length - 1].outputPayload && (
                           <p className="text-sm text-muted-foreground italic">Empty payload.</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No data available for review.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setApprovalRunId(null)}>Reject / Cancel</Button>
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
    </PageLayout>
  );
}
