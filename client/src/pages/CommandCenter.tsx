import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { PageLayout } from "@/components/PageLayout";
import { Loader2, PlayCircle, Clock, CheckCircle2, AlertCircle, PauseCircle } from "lucide-react";
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
  outputPayload?: any;
  errorMessage?: string;
}

export default function CommandCenter() {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [initialContext, setInitialContext] = useState<string>("");
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  
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

  // Fetch specific run details for approval modal
  const { data: approvalRunDetails, isLoading: isLoadingApprovalDetails } = useQuery<{ run: Run, steps: RunStep[] }>({
    queryKey: ["run-details", approvalRunId],
    queryFn: async () => {
      if (!approvalRunId) return null;
      const res = await fetch(`/api/runs/${approvalRunId}`);
      if (!res.ok) throw new Error("Failed to fetch run details");
      return res.json();
    },
    enabled: !!approvalRunId,
  });

  const triggerRunMutation = useMutation({
    mutationFn: async (workflowId: string) => {
      let parsedContext = {};
      if (initialContext) {
        try {
          parsedContext = JSON.parse(initialContext);
        } catch (e) {
          throw new Error("Initial context must be valid JSON");
        }
      }
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
      setInitialContext("");
      refetchRuns();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

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
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "failed": return "destructive";
      case "running": return "secondary";
      case "paused_for_approval": return "outline";
      default: return "secondary";
    }
  };

  const handleRunClick = (workflowId: string) => {
    setSelectedWorkflowId(workflowId);
    setInitialContext("{\n  \n}");
    setIsRunModalOpen(true);
  };

  return (
    <PageLayout>
      <div className="container py-12">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Command Center</h1>
            <p className="text-muted-foreground">Manage and monitor your automated AgentLab workflows.</p>
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
                  <Card key={wf.id} className="flex flex-col">
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
                        className="w-full gap-2" 
                        onClick={() => handleRunClick(wf.id)}
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
            <h2 className="text-2xl font-semibold mb-6">Recent Runs</h2>
            <Card>
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
                    <TableRow key={run.id}>
                      <TableCell className="font-mono text-xs">{run.id.slice(0, 8)}</TableCell>
                      <TableCell>{run.workflowId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(run.status)}
                          <Badge variant={getStatusBadgeVariant(run.status)} className="capitalize">
                            {run.status.replace(/_/g, " ")}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(new Date(run.startedAt || run.createdAt), "MMM d, yyyy HH:mm:ss")}</TableCell>
                      <TableCell className="text-right">
                        {run.status === "paused_for_approval" && (
                          <Button size="sm" onClick={() => setApprovalRunId(run.id)}>
                            Review Required
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

        {/* Run Modal */}
        <Dialog open={isRunModalOpen} onOpenChange={setIsRunModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Run Workflow</DialogTitle>
              <DialogDescription>
                Provide optional initial context in JSON format for the workflow execution.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea 
                value={initialContext}
                onChange={(e) => setInitialContext(e.target.value)}
                placeholder="{\n  \n}"
                className="font-mono text-sm h-32"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRunModalOpen(false)}>Cancel</Button>
              <Button 
                onClick={() => selectedWorkflowId && triggerRunMutation.mutate(selectedWorkflowId)}
                disabled={triggerRunMutation.isPending}
              >
                {triggerRunMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Start Run
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Approval Modal */}
        <Dialog open={!!approvalRunId} onOpenChange={(open) => !open && setApprovalRunId(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Human-in-the-Loop Review</DialogTitle>
              <DialogDescription>
                This workflow run has paused and requires your approval to proceed.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {isLoadingApprovalDetails ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Latest Step Output Payload:</h3>
                  <div className="bg-muted p-4 rounded-md overflow-auto max-h-96">
                    <pre className="text-xs">
                      {approvalRunDetails?.steps && approvalRunDetails.steps.length > 0 
                        ? JSON.stringify(approvalRunDetails.steps[approvalRunDetails.steps.length - 1].outputPayload, null, 2)
                        : "No output payload found."}
                    </pre>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApprovalRunId(null)}>Cancel</Button>
              <Button 
                onClick={() => approvalRunId && approveRunMutation.mutate(approvalRunId)}
                disabled={approveRunMutation.isPending || isLoadingApprovalDetails}
              >
                {approveRunMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Approve & Continue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </PageLayout>
  );
}
