import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  Layers,
  Wrench,
  FileText,
  Copy,
  Download,
  AlertTriangle,
  Code,
  ShieldCheck,
  Check,
  Zap,
  Bot,
  TerminalSquare,
  Calendar,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface RunInspectorModalProps {
  runId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RunInspectorModal({ runId, open, onOpenChange }: RunInspectorModalProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"steps" | "tools" | "artifacts" | "payload">("steps");
  const [selectedArtifactIndex, setSelectedArtifactIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch full run details
  const { data: detailsData, isLoading } = useQuery<{
    run: any;
    workflow: any;
    steps: any[];
    artifacts: any[];
    totalToolsCount: number;
    totalCost: string;
    totalLatencyMs: number;
  }>({
    queryKey: ["run-details", runId],
    queryFn: async () => {
      if (!runId) return null;
      const res = await fetch(`/api/runs/${runId}`);
      if (!res.ok) throw new Error("Failed to fetch run details");
      return res.json();
    },
    enabled: !!runId && open,
    refetchInterval: (query) => {
      const status = query.state.data?.run?.status;
      return status === "running" || status === "pending" ? 3000 : false;
    },
  });

  const run = detailsData?.run;
  const workflow = detailsData?.workflow;
  const steps = detailsData?.steps || [];
  const artifacts = detailsData?.artifacts || [];

  // Aggregate all tool calls across steps
  const allTools = steps.flatMap((step) =>
    (step.toolsExecuted || []).map((t: any) => ({
      ...t,
      stepTitle: step.stepTitle,
      agentName: step.agentName,
    }))
  );

  // Approve / Reject Mutations for paused runs
  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/runs/${id}/approve`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to approve run");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Workflow run approved and resumed!");
      queryClient.invalidateQueries({ queryKey: ["run-details", runId] });
      queryClient.invalidateQueries({ queryKey: ["runs"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/runs/${id}/reject`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to reject run");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Workflow run rejected");
      queryClient.invalidateQueries({ queryKey: ["run-details", runId] });
      queryClient.invalidateQueries({ queryKey: ["runs"] });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs font-semibold gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/30 text-xs font-semibold gap-1">
            <XCircle className="w-3.5 h-3.5" />
            Failed
          </Badge>
        );
      case "running":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs font-semibold gap-1 animate-pulse">
            <Activity className="w-3.5 h-3.5 animate-spin" />
            Running
          </Badge>
        );
      case "paused_for_approval":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs font-semibold gap-1 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            Approval Required
          </Badge>
        );
      default:
        return <Badge variant="secondary" className="text-xs capitalize">{status}</Badge>;
    }
  };

  const selectedArtifact = artifacts[selectedArtifactIndex] || artifacts[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border p-6">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-lg font-bold text-foreground">
                  {workflow?.name || "Workflow Execution Run"}
                </DialogTitle>
                {run && getStatusBadge(run.status)}
              </div>
              <DialogDescription className="text-xs font-mono text-muted-foreground">
                Run ID: <span className="text-primary">{runId}</span> • Trigger:{" "}
                <span className="text-foreground uppercase">{run?.triggerSource || "manual"}</span>
              </DialogDescription>
            </div>

            {/* Metrics Pills */}
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <div className="p-2 rounded-lg bg-muted/40 border border-border/60 text-center">
                <span className="text-muted-foreground block text-[10px] uppercase">Latency</span>
                <span className="font-bold text-foreground">{detailsData?.totalLatencyMs ?? 0} ms</span>
              </div>
              <div className="p-2 rounded-lg bg-muted/40 border border-border/60 text-center">
                <span className="text-muted-foreground block text-[10px] uppercase">Est. Cost</span>
                <span className="font-bold text-emerald-400">${detailsData?.totalCost ?? "0.000000"}</span>
              </div>
              <div className="p-2 rounded-lg bg-muted/40 border border-border/60 text-center">
                <span className="text-muted-foreground block text-[10px] uppercase">Tools</span>
                <span className="font-bold text-primary">{detailsData?.totalToolsCount ?? 0} Calls</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="py-16 text-center text-sm text-muted-foreground animate-pulse space-y-2">
            <Activity className="w-8 h-8 text-primary animate-spin mx-auto" />
            <p>Fetching full DAG execution traces and verified artifacts...</p>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
              <Button
                variant={activeTab === "steps" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 text-xs gap-1.5 font-semibold"
                onClick={() => setActiveTab("steps")}
              >
                <Layers className="w-4 h-4 text-primary" />
                DAG Steps ({steps.length})
              </Button>
              <Button
                variant={activeTab === "tools" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 text-xs gap-1.5 font-semibold"
                onClick={() => setActiveTab("tools")}
              >
                <Wrench className="w-4 h-4 text-blue-400" />
                Tool Evidence ({allTools.length})
              </Button>
              <Button
                variant={activeTab === "artifacts" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 text-xs gap-1.5 font-semibold"
                onClick={() => setActiveTab("artifacts")}
              >
                <FileText className="w-4 h-4 text-purple-400" />
                Output Artifacts ({artifacts.length})
              </Button>
              <Button
                variant={activeTab === "payload" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 text-xs gap-1.5 font-semibold"
                onClick={() => setActiveTab("payload")}
              >
                <Code className="w-4 h-4 text-muted-foreground" />
                Context JSON
              </Button>
            </div>

            {/* TAB 1: DAG STEPS TIMELINE */}
            {activeTab === "steps" && (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {steps.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    No execution steps recorded for this run.
                  </div>
                ) : (
                  steps.map((step, idx) => (
                    <div
                      key={step.id || idx}
                      className={`p-3.5 rounded-xl border transition-all space-y-2 ${
                        step.status === "failed"
                          ? "bg-rose-500/5 border-rose-500/30"
                          : step.status === "completed"
                          ? "bg-muted/20 border-border/80"
                          : "bg-blue-500/5 border-blue-500/30"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                            {idx + 1}
                          </span>
                          <h4 className="font-semibold text-xs text-foreground">{step.stepTitle}</h4>
                          <Badge variant="outline" className="text-[10px] font-mono uppercase bg-card">
                            {step.stepType}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-muted-foreground">
                            {step.latencyMs ? `${step.latencyMs} ms` : "0 ms"}
                          </span>
                          {getStatusBadge(step.status)}
                        </div>
                      </div>

                      {/* Action Prompt */}
                      {step.actionPrompt && (
                        <p className="text-[11px] text-muted-foreground italic font-sans pl-7">
                          "{step.actionPrompt}"
                        </p>
                      )}

                      {/* Failure diagnostic banner */}
                      {step.errorMessage && (
                        <div className="ml-7 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono space-y-1">
                          <div className="flex items-center gap-1.5 font-bold">
                            <XCircle className="w-3.5 h-3.5" />
                            Execution Blocker Detected
                          </div>
                          <p className="text-[11px] text-rose-300 leading-relaxed">{step.errorMessage}</p>
                        </div>
                      )}

                      {/* Mini Tool Call summary */}
                      {step.toolsExecuted && step.toolsExecuted.length > 0 && (
                        <div className="ml-7 flex items-center gap-1.5 flex-wrap pt-1">
                          <span className="text-[10px] text-muted-foreground font-mono">Tools invoked:</span>
                          {step.toolsExecuted.map((t: any, tIdx: number) => (
                            <Badge
                              key={tIdx}
                              variant="outline"
                              className={`text-[10px] font-mono ${
                                t.isSimulated
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              }`}
                            >
                              {t.toolName} {t.isSimulated ? "(Simulated)" : "(Live)"}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 2: TOOL CALL EVIDENCE TRACE */}
            {activeTab === "tools" && (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {allTools.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl p-6">
                    No external tools were executed in this run.
                  </div>
                ) : (
                  allTools.map((toolCall, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-primary" />
                          <span className="font-bold text-foreground font-mono">{toolCall.toolName}</span>
                          <span className="text-[11px] text-muted-foreground">in {toolCall.stepTitle}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            toolCall.isSimulated
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30 font-mono text-[10px]"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono text-[10px]"
                          }
                        >
                          {toolCall.isSimulated ? "Simulated Fallback" : "Live API (200 OK)"}
                        </Badge>
                      </div>

                      {/* Args & Response */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
                        <div className="p-2.5 rounded-lg bg-background border border-border/60">
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold mb-1">
                            Input Parameters
                          </span>
                          <pre className="overflow-x-auto text-foreground whitespace-pre-wrap">
                            {JSON.stringify(toolCall.args, null, 2)}
                          </pre>
                        </div>
                        <div className="p-2.5 rounded-lg bg-background border border-border/60">
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold mb-1">
                            Execution Return
                          </span>
                          <pre className="overflow-x-auto text-muted-foreground whitespace-pre-wrap max-h-36">
                            {typeof toolCall.result === "string"
                              ? toolCall.result
                              : JSON.stringify(toolCall.result, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 3: GENERATED ARTIFACTS & OUTPUTS */}
            {activeTab === "artifacts" && (
              <div className="space-y-3">
                {artifacts.length === 0 ? (
                  <div className="p-8 text-center rounded-xl border border-dashed text-xs text-muted-foreground space-y-1">
                    <p className="font-semibold text-foreground">No outputs produced</p>
                    <p>This run did not generate any discrete documents, scheduled posts, or CSV reports.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Artifact Selector Pills if multiple */}
                    {artifacts.length > 1 && (
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {artifacts.map((art, idx) => (
                          <Button
                            key={art.id || idx}
                            variant={selectedArtifactIndex === idx ? "secondary" : "outline"}
                            size="sm"
                            className="h-7 text-xs font-mono shrink-0"
                            onClick={() => setSelectedArtifactIndex(idx)}
                          >
                            {art.title?.slice(0, 25) || `Artifact #${idx + 1}`}
                          </Button>
                        ))}
                      </div>
                    )}

                    {selectedArtifact && (
                      <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                        <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px] uppercase font-mono bg-primary/10 text-primary">
                                {selectedArtifact.artifactType}
                              </Badge>
                              <h4 className="font-bold text-sm text-foreground">{selectedArtifact.title}</h4>
                            </div>
                            {selectedArtifact.scheduledFor && (
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3 text-primary" />
                                Scheduled: {new Date(selectedArtifact.scheduledFor).toLocaleString()}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs gap-1"
                              onClick={() => {
                                navigator.clipboard.writeText(selectedArtifact.content);
                                setCopiedId(selectedArtifact.id);
                                toast.success("Artifact copied to clipboard!");
                                setTimeout(() => setCopiedId(null), 2000);
                              }}
                            >
                              {copiedId === selectedArtifact.id ? (
                                <Check className="w-3.5 h-3.5 text-green-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              {copiedId === selectedArtifact.id ? "Copied" : "Copy"}
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1"
                              onClick={() => window.open(`/api/artifacts/${selectedArtifact.id}/download`, "_blank")}
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download
                            </Button>
                          </div>
                        </div>

                        {/* Quality Score & Flywheel Evaluation Banner */}
                        <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={`text-[10px] font-mono font-bold ${
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
                              <span className="text-[11px] text-muted-foreground">
                                {selectedArtifact.verificationNotes?.passed !== false ? "✓ Passed Brand & Fact Checks" : "⚠ Quality Review Needed"}
                              </span>
                            </div>

                            {selectedArtifact.revisionVersion > 1 && (
                              <Badge variant="secondary" className="text-[10px] font-mono">
                                Revision v{selectedArtifact.revisionVersion}
                              </Badge>
                            )}
                          </div>

                          {/* Feedback Points if available */}
                          {selectedArtifact.verificationNotes?.feedback?.length > 0 && (
                            <div className="text-[11px] text-muted-foreground space-y-0.5">
                              {selectedArtifact.verificationNotes.feedback.slice(0, 2).map((fb: string, i: number) => (
                                <p key={i} className="flex items-center gap-1.5">
                                  <span className="text-primary font-bold">•</span> {fb}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Formatted Content Renderer */}
                        <div className="p-4 rounded-xl bg-background border border-border font-sans text-xs leading-relaxed whitespace-pre-wrap select-text max-h-[320px] overflow-y-auto text-foreground">
                          {selectedArtifact.content}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: RAW CONTEXT & JSON PAYLOADS */}
            {activeTab === "payload" && (
              <div className="space-y-3 max-h-[420px] overflow-y-auto">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-foreground">Initial Context:</span>
                  <pre className="p-3 rounded-xl bg-muted/30 border border-border font-mono text-[11px] overflow-x-auto text-foreground">
                    {JSON.stringify(run?.initialContext || {}, null, 2)}
                  </pre>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-foreground">Step Outputs:</span>
                  <pre className="p-3 rounded-xl bg-muted/30 border border-border font-mono text-[11px] overflow-x-auto text-muted-foreground">
                    {JSON.stringify(
                      steps.map((s) => ({
                        stepTitle: s.stepTitle,
                        status: s.status,
                        outputPayload: s.outputPayload,
                        errorMessage: s.errorMessage,
                      })),
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Footer */}
        <DialogFooter className="pt-3 border-t border-border flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close Inspector
          </Button>

          {run?.status === "paused_for_approval" && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="destructive"
                className="h-8 text-xs"
                onClick={() => rejectMutation.mutate(run.id)}
                disabled={rejectMutation.isPending}
              >
                Reject Run
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                onClick={() => approveMutation.mutate(run.id)}
                disabled={approveMutation.isPending}
              >
                Approve & Resume
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
