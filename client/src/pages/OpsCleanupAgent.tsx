import { useState } from "react";
import { Bot, FolderTree, Sparkles, CheckCircle2 } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

const starterTasks = [
  "Review the current operating docs and tell me the top 3 cleanup actions I should take this week.",
  "Help me triage recovered files into keep, archive, and review based on the current business architecture.",
  "Identify the likely source-of-truth docs for URC, Bootstrapper Capital, Tactix, and Ownable OS planning.",
];

type WorkflowProposalStep = {
  stepNumber: number;
  title: string;
  type: string;
  detail: string;
  agentId?: string;
};

type OrchestratorChatResponse = {
  reply: string;
  proposal?: {
    id: string;
    name: string;
    description: string;
    departmentCode: string;
    steps: WorkflowProposalStep[];
  };
  executionMetrics?: {
    model: string;
  };
};

export default function OpsCleanupAgent() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [task, setTask] = useState(starterTasks[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [agentResponse, setAgentResponse] = useState<OrchestratorChatResponse | null>(null);
  const [, setLocation] = useLocation();

  const handleAnalyze = async () => {
    if (!task.trim()) return;
    setIsAnalyzing(true);
    setAgentResponse(null);

    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/orchestrator/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: task })
      });

      if (res.ok) {
        const data = await res.json();
        setAgentResponse(data);
      } else {
        console.error("Failed to analyze", res.statusText);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeploy = async () => {
    if (!agentResponse?.proposal) return;
    setIsDeploying(true);

    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/workflows/deploy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ proposal: agentResponse.proposal })
      });

      if (res.ok) {
        setLocation("/command-center");
      } else {
        console.error("Failed to deploy", res.statusText);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeploying(false);
    }
  };

  if (loading) {
    return (
      <PageLayout className="bg-background">
        <div className="container py-16 text-sm text-muted-foreground">
          Loading Ops Cleanup Agent...
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="bg-background">
      <div className="container py-10">
        <div className="mb-8 max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-primary">
            <Bot className="h-3.5 w-3.5" />
            Internal Agent
          </div>
          <h1 className="font-serif text-4xl text-foreground">
            Ops Cleanup Agent
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            This internal agent reads your operating docs, samples the recovered
            folders, and helps you clean up the business system without
            rebuilding everything from scratch.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Ask the agent
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {starterTasks.map(starter => (
                <button
                  key={starter}
                  type="button"
                  onClick={() => setTask(starter)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary hover:text-foreground"
                >
                  {starter}
                </button>
              ))}
            </div>

            <textarea
              value={task}
              onChange={event => setTask(event.target.value)}
              rows={8}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-7 text-foreground outline-none transition focus:border-primary"
              placeholder="Describe the cleanup or operating-system task you want help with..."
            />

            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing || task.trim().length < 10}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAnalyzing ? "Analyzing..." : "Run analysis"}
              </button>
              <div className="text-xs text-muted-foreground">
                {agentResponse?.executionMetrics?.model
                  ? `Using ${agentResponse.executionMetrics.model}`
                  : "Using Orchestrator AI"}
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-muted/30 border border-border p-5 text-sm leading-7 text-foreground">
              <div className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Agent Output
              </div>
              {agentResponse ? (
                <div className="space-y-4">
                  <pre className="whitespace-pre-wrap font-sans">
                    {agentResponse.reply}
                  </pre>
                  
                  {agentResponse.proposal && (
                    <div className="mt-6 border-t border-border pt-4">
                      <h4 className="font-semibold mb-3 text-primary flex items-center gap-2">
                        <FolderTree className="w-4 h-4" />
                        Proposed Workflow DAG
                      </h4>
                      <div className="space-y-3">
                        {agentResponse.proposal.steps.map((step) => (
                          <div key={step.stepNumber} className="bg-background rounded-lg p-3 border border-border text-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-foreground">Step {step.stepNumber}: {step.title}</span>
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded uppercase">{step.type}</span>
                            </div>
                            <p className="text-muted-foreground text-xs">{step.detail}</p>
                            {step.agentId && <p className="text-xs text-primary mt-1 font-mono">{step.agentId}</p>}
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={handleDeploy}
                          disabled={isDeploying}
                          className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-indigo-700 disabled:opacity-50 transition"
                        >
                          {isDeploying ? "Deploying..." : "Deploy & Execute"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Run a task and the agent will return a cleanup plan,
                  keep/archive/review guidance, and the next actions to take.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Active Playbooks
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  The Ops Agent uses your unlocked Marketplace Playbooks to evaluate requests and route to the correct departments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
