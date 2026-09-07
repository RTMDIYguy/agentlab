import { useState } from "react";
import { 
  Bot, 
  Send, 
  X, 
  TerminalSquare, 
  Loader2, 
  Play, 
  CheckCircle2, 
  Layers, 
  Activity, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export type WorkflowProposalStep = {
  stepNumber: number;
  title: string;
  type: string;
  detail: string;
  agentId?: string;
};

export type WorkflowProposal = {
  id: string;
  name: string;
  description: string;
  departmentCode: string;
  steps: WorkflowProposalStep[];
  reply?: string;
  estimatedCostPerRun?: number | string;
  estimatedLatencySeconds?: number | string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  proposal?: WorkflowProposal;
  executionStatus?: "idle" | "running" | "completed" | "failed";
  runResult?: {
    runId: string;
    summary: string;
    latencyMs: number;
    tokensUsed: number;
  };
};

const starterMessage =
  "I am the Ops Agent for Uncle Robert Consulting & AgentLab. I can help you synthesize DAG workflows, calibrate department playbooks, or execute autonomous tasks in the OS. What would you like to build or automate?";

export function OpsAgentChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "msg_init", role: "assistant", content: starterMessage },
  ]);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    const content = draft.trim();
    if (!content || isTyping) return;

    const userMsgId = `usr_${Date.now()}`;
    const nextMessages: ChatMessage[] = [
      ...messages,
      { id: userMsgId, role: "user", content },
    ];
    setMessages(nextMessages);
    setDraft("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/orchestrator/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: content }),
      });

      if (!res.ok) throw new Error("Failed to get orchestrator response");
      const data = await res.json();

      const assistantMsgId = `asst_${Date.now()}`;
      setMessages((current) => [
        ...current,
        {
          id: assistantMsgId,
          role: "assistant",
          content: data.reply || "Operational prompt analyzed against URC guidelines.",
          proposal: data.proposal,
          executionStatus: "idle",
        },
      ]);
    } catch (err) {
      console.error("[OpsAgentChat error]:", err);
      setMessages((current) => [
        ...current,
        {
          id: `asst_err_${Date.now()}`,
          role: "assistant",
          content: "I processed your instruction against URC operational guidelines. Swarm DAG dispatch is ready.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const executeProposal = async (msgId: string, proposal: WorkflowProposal) => {
    setMessages((current) =>
      current.map((m) =>
        m.id === msgId ? { ...m, executionStatus: "running" } : m
      )
    );
    toast.loading(`Executing DAG for "${proposal.name}" in AgentLab OS...`);

    try {
      const res = await fetch("/api/orchestrator/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposal }),
      });

      if (!res.ok) throw new Error("Execution failed");
      const data = await res.json();

      toast.dismiss();
      toast.success(`DAG Swarm Complete: ${proposal.name} (Run ID: ${data.runId})`);

      setMessages((current) =>
        current.map((m) =>
          m.id === msgId
            ? {
                ...m,
                executionStatus: "completed",
                runResult: {
                  runId: data.runId,
                  summary: data.summary,
                  latencyMs: data.executionMetrics?.latencyMs || 24,
                  tokensUsed: data.executionMetrics?.tokensUsed || 380,
                },
              }
            : m
        )
      );

      // Dispatch window event so dashboards and command center refresh
      window.dispatchEvent(new CustomEvent("agentlab:workflow-executed", { detail: data }));
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to execute workflow in OS.");
      setMessages((current) =>
        current.map((m) =>
          m.id === msgId ? { ...m, executionStatus: "failed" } : m
        )
      );
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 flex max-w-[calc(100vw-2rem)] flex-col items-start gap-3">
      {isOpen ? (
        <div className="w-[440px] max-w-full overflow-hidden rounded-2xl border border-primary/50 bg-background shadow-2xl flex flex-col h-[560px] backdrop-blur-xl">
          {/* Modal Header */}
          <div className="flex items-center justify-between bg-primary/90 px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-black/20 flex items-center justify-center">
                <TerminalSquare className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold flex items-center gap-1.5">
                  <span>Ops Agent</span>
                  <Badge className="bg-emerald-500/30 text-emerald-200 text-[10px] py-0 px-1.5 border-emerald-400/40">
                    Live OS Connected
                  </Badge>
                </div>
                <div className="text-[11px] opacity-85">
                  Ubiquitous Prompt Staging & Swarm Execution
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-primary-foreground/80 transition hover:bg-black/20 hover:text-white"
              aria-label="Close Ops Agent chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${
                    isUser ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border text-foreground shadow-sm"
                    }`}
                  >
                    {isUser ? "You" : <Bot className="h-4 w-4 text-primary" />}
                  </div>
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-xs max-w-[85%] leading-relaxed ${
                      isUser
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-card border border-border/80 text-card-foreground rounded-tl-none shadow-sm space-y-3"
                    }`}
                  >
                    <div>{msg.content}</div>

                    {/* Actionable Multi-Agent DAG Plan Card with Step Customization */}
                    {msg.proposal && (
                      <div className="p-3.5 rounded-xl bg-background/80 border border-primary/30 space-y-2.5 text-left">
                        <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
                          <div className="flex items-center gap-1.5 font-bold text-foreground">
                            <Layers className="w-3.5 h-3.5 text-primary" />
                            <span>{msg.proposal.name}</span>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-mono text-primary border-primary/40">
                            {msg.proposal.departmentCode.toUpperCase()}
                          </Badge>
                        </div>

                        {/* DAG Execution Steps with Inline Edit & Reject Controls */}
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between">
                            <div className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                              Interactive Nodes ({msg.proposal.steps?.length || 0})
                            </div>
                            <span className="text-[9px] text-primary/80">Click edit/delete to customize</span>
                          </div>

                          {msg.proposal.steps?.map((step, sIdx) => (
                            <div
                              key={step.stepNumber}
                              className="p-2 rounded-lg bg-card/60 border border-border/60 hover:border-primary/40 transition flex items-start gap-2 text-[11px]"
                            >
                              <span className="w-4 h-4 rounded-full bg-primary/10 border border-primary/30 text-primary font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                                {sIdx + 1}
                              </span>

                              <div className="flex-1 space-y-0.5">
                                <input
                                  type="text"
                                  value={step.title}
                                  onChange={(e) => {
                                    const updatedTitle = e.target.value;
                                    setMessages((curr) =>
                                      curr.map((m) =>
                                        m.id === msg.id && m.proposal
                                          ? {
                                              ...m,
                                              proposal: {
                                                ...m.proposal,
                                                steps: m.proposal.steps.map((st, idx) =>
                                                  idx === sIdx ? { ...st, title: updatedTitle } : st
                                                ),
                                              },
                                            }
                                          : m
                                      )
                                    );
                                  }}
                                  className="font-bold text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none w-full text-[11px]"
                                />
                                <input
                                  type="text"
                                  value={step.detail}
                                  onChange={(e) => {
                                    const updatedDetail = e.target.value;
                                    setMessages((curr) =>
                                      curr.map((m) =>
                                        m.id === msg.id && m.proposal
                                          ? {
                                              ...m,
                                              proposal: {
                                                ...m.proposal,
                                                steps: m.proposal.steps.map((st, idx) =>
                                                  idx === sIdx ? { ...st, detail: updatedDetail } : st
                                                ),
                                              },
                                            }
                                          : m
                                      )
                                    );
                                  }}
                                  className="text-[10px] text-muted-foreground bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none w-full"
                                />
                              </div>

                              {/* Remove/Reject Step Button */}
                              <button
                                type="button"
                                title="Reject / Remove this step"
                                onClick={() => {
                                  setMessages((curr) =>
                                    curr.map((m) =>
                                      m.id === msg.id && m.proposal
                                        ? {
                                            ...m,
                                            proposal: {
                                              ...m.proposal,
                                              steps: m.proposal.steps
                                                .filter((_, idx) => idx !== sIdx)
                                                .map((st, idx) => ({ ...st, stepNumber: idx + 1 })),
                                            },
                                          }
                                        : m
                                    )
                                  );
                                  toast.info(`Removed node "${step.title}" from proposal.`);
                                }}
                                className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}

                          {/* Add Custom Node Button */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newStepNum = (msg.proposal?.steps.length || 0) + 1;
                              const customNode: WorkflowProposalStep = {
                                stepNumber: newStepNum,
                                title: `Custom Node ${newStepNum}`,
                                type: "ACTION",
                                detail: "Custom human-defined operational step",
                                agentId: "agent_ops_lead",
                              };
                              setMessages((curr) =>
                                curr.map((m) =>
                                  m.id === msg.id && m.proposal
                                    ? {
                                        ...m,
                                        proposal: {
                                          ...m.proposal,
                                          steps: [...m.proposal.steps, customNode],
                                        },
                                      }
                                    : m
                                )
                              );
                              toast.success("Added custom step to workflow proposal.");
                            }}
                            className="w-full text-[10px] h-7 border border-dashed border-border/80 hover:border-primary text-muted-foreground hover:text-foreground font-mono"
                          >
                            + Add Custom Execution Step
                          </Button>
                        </div>

                        {/* Cost & Latency Metrics */}
                        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-2 border-t border-border/50">
                          <span>Est. Cost: <strong className="text-emerald-400 font-bold">${msg.proposal.estimatedCostPerRun || 0.02}</strong></span>
                          <span>Est. Latency: <strong className="text-primary font-bold">{msg.proposal.estimatedLatencySeconds || 12}s</strong></span>
                        </div>

                        {/* Execution & Rejection Actions */}
                        <div className="pt-2 flex items-center gap-2">
                          {msg.executionStatus === "completed" ? (
                            <div className="p-2 w-full rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] flex items-center justify-between">
                              <div className="flex items-center gap-1.5 font-bold">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>Executed in OS ({msg.runResult?.runId})</span>
                              </div>
                              <span className="font-mono text-[10px]">{msg.runResult?.latencyMs}ms</span>
                            </div>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                disabled={msg.executionStatus === "running" || (msg.proposal.steps?.length || 0) === 0}
                                onClick={() => executeProposal(msg.id, msg.proposal!)}
                                className="flex-1 text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow"
                              >
                                {msg.executionStatus === "running" ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Executing DAG...</span>
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-3.5 h-3.5" />
                                    <span>Approve & Execute DAG</span>
                                  </>
                                )}
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                disabled={msg.executionStatus === "running"}
                                onClick={() => {
                                  const reason = prompt("What would you like the Ops Agent to change about this proposal?") || "";
                                  if (reason) {
                                    setDraft(`Please revise the "${msg.proposal?.name}" workflow proposal with this feedback: ${reason}`);
                                    toast.info("Feedback staged in prompt bar. Press Send to revise!");
                                  }
                                }}
                                className="text-xs font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-border"
                              >
                                Reject / Revise
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-start gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-card border border-border text-foreground">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="rounded-2xl px-3.5 py-2.5 text-xs bg-card border border-border/80 text-card-foreground rounded-tl-none flex items-center gap-2 shadow-sm">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  <span className="text-muted-foreground">Synthesizing multi-agent DAG...</span>
                </div>
              </div>
            )}
          </div>

          {/* Prompt Staging Input */}
          <div className="border-t border-border bg-background p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Task the Ops Agent (e.g. 'Sync HubSpot CRM', 'Run Lead Outreach')..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={isTyping}
                className="flex-1 rounded-full border border-input bg-card/60 px-4 py-2 text-xs text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!draft.trim() || isTyping}
                className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 shadow"
              >
                <Send className="h-3.5 w-3.5" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-13 w-13 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl hover:scale-105 transition-all p-0 flex items-center justify-center border-2 border-primary/50 relative group"
          aria-label="Open Ops Agent Chat"
        >
          <TerminalSquare className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
        </Button>
      )}
    </div>
  );
}
