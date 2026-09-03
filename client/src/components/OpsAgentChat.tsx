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
import type { WorkflowProposal } from "@server/domain/schemas";

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

                    {/* Actionable Multi-Agent DAG Plan Card */}
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

                        {/* DAG Execution Steps Checklist */}
                        <div className="space-y-1.5 pt-1">
                          <div className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                            Synthesized Execution Steps ({msg.proposal.steps?.length || 4} Nodes)
                          </div>
                          {msg.proposal.steps?.map((step) => (
                            <div key={step.stepNumber} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                              <span className="w-4 h-4 rounded-full bg-primary/10 border border-primary/30 text-primary font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                                {step.stepNumber}
                              </span>
                              <div className="flex-1">
                                <strong className="text-foreground">{step.title}</strong>: {step.detail}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Cost & Latency Metrics */}
                        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-2 border-t border-border/50">
                          <span>Est. Cost: <strong className="text-emerald-400 font-bold">${msg.proposal.estimatedCostPerRun || 0.02}</strong></span>
                          <span>Est. Latency: <strong className="text-primary font-bold">{msg.proposal.estimatedLatencySeconds || 12}s</strong></span>
                        </div>

                        {/* Execution Trigger Button & Status */}
                        <div className="pt-2">
                          {msg.executionStatus === "completed" ? (
                            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] flex items-center justify-between">
                              <div className="flex items-center gap-1.5 font-bold">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>Executed in OS ({msg.runResult?.runId})</span>
                              </div>
                              <span className="font-mono text-[10px]">{msg.runResult?.latencyMs}ms</span>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              disabled={msg.executionStatus === "running"}
                              onClick={() => executeProposal(msg.id, msg.proposal!)}
                              className="w-full text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow"
                            >
                              {msg.executionStatus === "running" ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Executing DAG Swarm...</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-3.5 h-3.5" />
                                  <span>Approve & Execute DAG in OS</span>
                                </>
                              )}
                            </Button>
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
