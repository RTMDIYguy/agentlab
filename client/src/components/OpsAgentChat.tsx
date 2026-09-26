import { useState, useEffect, useRef } from "react";
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
  Sparkles,
  RotateCcw,
  Trash2,
  XCircle
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
  executionStatus?: "idle" | "running" | "completed" | "failed" | "paused";
  runResult?: {
    runId: string;
    summary: string;
    latencyMs: number | null;
    tokensUsed: number | null;
  };
};

const starterMessage =
  "I am the Ops Agent for Uncle Robert Consulting & AgentLab. I can help you synthesize DAG workflows, calibrate department playbooks, or execute autonomous tasks in the OS. What would you like to build or automate?";

const WATCHDOG_POLL_MS = 60_000;
const LAST_SEEN_FAILURE_KEY = "opsagent_last_seen_failure";
const LAST_CRED_STATE_KEY = "opsagent_last_credential_state";

/**
 * Watchdog (2026-09-24): every 60s, check for DAG runs that failed since the
 * last failure we showed, and proactively report them in this chat with the
 * real recorded error + a server-classified root cause. No waiting to be asked.
 */
function useFailureWatchdog(enabled: boolean) {
  const [reports, setReports] = useState<ChatMessage[]>([]);
  const lastSeenRef = useRef<string>(localStorage.getItem(LAST_SEEN_FAILURE_KEY) || new Date(0).toISOString());

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const check = async () => {
      try {
        const res = await fetch(`/api/ops-watchdog/failed-runs?since=${encodeURIComponent(lastSeenRef.current)}&limit=5`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || data.error || !Array.isArray(data.failures) || data.failures.length === 0) return;

        const newMsgs: ChatMessage[] = data.failures.map((f: any) => {
          const wf = f.workflowName ? `"${f.workflowName}"` : "a workflow";
          const rc = f.rootCause || {};
          return {
            id: `watchdog_${f.runId}`,
            role: "assistant" as const,
            content:
              `⚠️ Watchdog: run ${String(f.runId).slice(0, 8)} of ${wf} FAILED${f.failedAt ? ` at ${new Date(f.failedAt).toLocaleTimeString()}` : ""}.\n\n` +
              `Recorded error: ${f.errorMessage || "(none recorded)"}\n\n` +
              `Root cause (${rc.category ?? "unknown"}): ${rc.summary ?? ""}\n` +
              `Recommended fix: ${rc.recommendedFix ?? "open the run inspector"}`,
          };
        });

        // Advance the cursor to the newest failure we just delivered.
        const newest = data.failures[0]?.failedAt;
        if (newest) {
          lastSeenRef.current = newest;
          localStorage.setItem(LAST_SEEN_FAILURE_KEY, newest);
        }
        setReports(prev => [...prev, ...newMsgs].slice(-20));
      } catch {
        // Watchdog must never break the chat; retry on next tick.
      }
    };

    check();
    const t = setInterval(check, WATCHDOG_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [enabled]);

  return reports;
}

/**
 * Credential-health watchdog (2026-09-25): on the same 60s tick, probe
 * /api/ops-watchdog/credential-health and announce a missing or broken LLM
 * credential ONCE per state change — auth rot gets reported before runs
 * fail, and doesn't spam the chat while it stays broken.
 */
function useCredentialWatchdog() {
  const [reports, setReports] = useState<ChatMessage[]>([]);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const res = await fetch("/api/ops-watchdog/credential-health");
        if (!res.ok) return;
        const health = await res.json();
        if (cancelled || !health?.state) return;

        const prevState = localStorage.getItem(LAST_CRED_STATE_KEY);
        // Announce only on a transition (or first observation). The ok-state
        // announcement on first boot is useful silence: stored, not shown.
        if (health.state !== prevState) {
          localStorage.setItem(LAST_CRED_STATE_KEY, health.state);
          if (health.state !== "ok" || prevState === undefined) {
            const content =
              health.state === "missing"
                ? `🔔 Watchdog: no LLM credential is configured. ${health.detail}\n\nFix: ${health.recommendedFix}`
                : health.state === "mint_failed"
                  ? `🔔 Watchdog: the Gemini credential is present but BROKEN. ${health.detail}\n\nFix: ${health.recommendedFix}`
                  : `🔔 Watchdog: LLM credential check could not complete. ${health.detail}`;
            setReports(prev => [
              ...prev,
              {
                id: `cred_${health.state}_${Date.now()}`,
                role: "assistant" as const,
                content,
              },
            ].slice(-20));
          }
        }
      } catch {
        // Must never break the chat; retry on next tick.
      }
    };

    check();
    const t = setInterval(check, WATCHDOG_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  return reports;
}

export function OpsAgentChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "msg_init", role: "assistant", content: starterMessage },
  ]);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  // Inline revision box state (CC-2026-09-25-007)
  const [revisingMsgId, setRevisingMsgId] = useState<string | null>(null);
  const [revisionDraft, setRevisionDraft] = useState("");

  const clearChat = () => {
    setMessages([{ id: "msg_init", role: "assistant", content: starterMessage }]);
    setDraft("");
    setRevisingMsgId(null);
    setRevisionDraft("");
    toast.info("Ops Agent conversation cleared.");
  };

  // The watchdogs run regardless of whether the chat window is open; their
  // reports merge into the message list so they're waiting when opened.
  const watchdogReports = useFailureWatchdog(true);
  const credentialReports = useCredentialWatchdog();
  const shownReportsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const fresh = [...watchdogReports, ...credentialReports].filter(
      m => !shownReportsRef.current.has(m.id)
    );
    if (fresh.length === 0) return;
    fresh.forEach(m => shownReportsRef.current.add(m.id));
    setMessages(current => [...current, ...fresh]);
    if (!isOpen) {
      const isCredential = credentialReports.includes(fresh[fresh.length - 1]);
      toast.warning(
        isCredential
          ? "Ops Agent: LLM credential needs attention — details in chat."
          : "Ops Agent: a DAG run just failed — details in chat.",
        {
          description: fresh[fresh.length - 1]?.content?.slice(0, 120),
        }
      );
    }
  }, [watchdogReports, credentialReports, isOpen]);

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
      // Send the recent conversation so the Ops Agent keeps thread context
      // (single-turn chat made it unable to follow a dialogue).
      const history = messages
        .filter(m => !m.id.startsWith("msg_init"))
        .slice(-10)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/orchestrator/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: content, history }),
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
      // Honesty fix (2026-09-24): this catch previously displayed a canned
      // "I processed your instruction... dispatch is ready" success message
      // even when the API call itself failed.
      setMessages((current) => [
        ...current,
        {
          id: `asst_err_${Date.now()}`,
          role: "assistant",
          content: "I couldn't reach the orchestrator just now — your message wasn't processed. Check the connection and try again.",
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

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Execution failed (${res.status})`);
      }
      const data = await res.json();

      toast.dismiss();

      // Report the run's REAL outcome — completed, paused at a guardrail,
      // or failed — never a canned success.
      if (data.status === "failed") {
        toast.error(`Run failed: ${data.errorMessage || "see run inspector"}`);
      } else if (data.status === "paused_for_approval") {
        toast.info(`Run paused for approval at a guardrail — approve it in Command Center.`);
      } else {
        toast.success(
          `Run ${data.status}: ${data.artifactsCount} artifact(s) created (Run ID: ${data.runId})`
        );
      }

      setMessages((current) =>
        current.map((m) =>
          m.id === msgId
            ? {
                ...m,
                executionStatus:
                  data.status === "failed"
                    ? "failed"
                    : data.status === "paused_for_approval"
                      ? "paused"
                      : "completed",
                runResult: {
                  runId: data.runId,
                  summary: data.summary,
                  latencyMs: data.executionMetrics?.latencyMs ?? null,
                  tokensUsed: data.executionMetrics?.tokensUsed ?? null,
                },
              }
            : m
        )
      );

      // Dispatch window event so dashboards and command center refresh
      window.dispatchEvent(new CustomEvent("agentlab:workflow-executed", { detail: data }));
    } catch (err: any) {
      toast.dismiss();
      toast.error(`Failed to execute workflow in OS: ${err?.message ?? "unknown error"}`);
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
                                // No agentId (CC-2026-09-25-007): the old
                                // hardcoded "agent_ops_lead" was neither a UUID
                                // nor a real agent row, and crashed runs on the
                                // uuid column binding. Agent-less steps run on
                                // the default specialist prompt.
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
                          {msg.executionStatus === "failed" && (
                            <div className="p-2 w-full rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1.5 font-bold">
                                <XCircle className="w-4 h-4 text-rose-400" />
                                <span>Run failed ({msg.runResult?.runId?.slice(0, 8)})</span>
                              </div>
                            </div>
                          )}
                          {msg.executionStatus === "paused" ? (
                            <div className="p-2 w-full rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] flex items-center justify-between">
                              <div className="flex items-center gap-1.5 font-bold">
                                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                                <span>Paused for approval ({msg.runResult?.runId})</span>
                              </div>
                              <span className="font-[10px] font-mono">guardrail reached</span>
                            </div>
                          ) : msg.executionStatus === "completed" ? (
                            <div className="p-2 w-full rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] flex items-center justify-between">
                              <div className="flex items-center gap-1.5 font-bold">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>Executed in OS ({msg.runResult?.runId})</span>
                              </div>
                              <span className="font-mono text-[10px]">
                                {msg.runResult?.latencyMs != null ? `${msg.runResult.latencyMs}ms` : "latency not reported"}
                              </span>
                            </div>
                          ) : null}

                          {/* Run controls: available from idle AND after a
                              failed/completed run (CC-2026-09-25-007) — a
                              finished run no longer locks the card. Edit any
                              step above, then re-run or ask for a revision. */}
                          {msg.executionStatus !== "paused" && msg.executionStatus !== "running" && (
                            <>
                              <Button
                                size="sm"
                                disabled={(msg.proposal.steps?.length || 0) === 0}
                                onClick={() => executeProposal(msg.id, msg.proposal!)}
                                className="flex-1 text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow"
                              >
                                <Play className="w-3.5 h-3.5" />
                                <span>
                                  {msg.executionStatus === "failed" || msg.executionStatus === "completed"
                                    ? "Re-run Amended DAG"
                                    : "Approve & Execute DAG"}
                                </span>
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setRevisingMsgId(msg.id)}
                                className="text-xs font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-border"
                              >
                                Revise
                              </Button>
                            </>
                          )}
                          {msg.executionStatus === "running" && (
                            <Button size="sm" disabled className="flex-1 text-xs font-bold gap-1.5">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Executing DAG...</span>
                            </Button>
                          )}
                        </div>

                        {/* Inline revision box (CC-2026-09-25-007): replaces
                            the browser prompt() — the feedback stays in the
                            conversation and sends as a normal chat turn. */}
                        {revisingMsgId === msg.id && (
                          <div className="pt-2 space-y-1.5">
                            <textarea
                              autoFocus
                              value={revisionDraft}
                              onChange={(e) => setRevisionDraft(e.target.value)}
                              placeholder={`What should change about "${msg.proposal.name}"? (e.g. remove step 3, change the destination to AgentMail...)`}
                              rows={2}
                              className="w-full rounded-lg border border-input bg-card/60 px-2.5 py-2 text-[11px] text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                            />
                            <div className="flex items-center gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 text-[10px]"
                                onClick={() => {
                                  setRevisingMsgId(null);
                                  setRevisionDraft("");
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                className="h-6 text-[10px] gap-1"
                                disabled={!revisionDraft.trim() || isTyping}
                                onClick={() => {
                                  const feedback = revisionDraft.trim();
                                  setRevisingMsgId(null);
                                  setRevisionDraft("");
                                  setDraft(`Please revise the "${msg.proposal?.name}" workflow proposal with this feedback: ${feedback}`);
                                  // Send immediately — the staged draft is the
                                  // message; no extra click required.
                                  setTimeout(() => {
                                    const input = document.querySelector<HTMLInputElement>("[data-opsagent-input]");
                                    input?.form?.requestSubmit();
                                  }, 0);
                                }}
                              >
                                <Send className="w-3 h-3" />
                                Send revision
                              </Button>
                            </div>
                          </div>
                        )}
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
                  <span className="text-muted-foreground">Thinking...</span>
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
                data-opsagent-input
                placeholder="Task the Ops Agent (e.g. 'Sync HubSpot CRM', 'Run Lead Outreach')..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={isTyping}
                className="flex-1 rounded-full border border-input bg-card/60 px-4 py-2 text-xs text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={clearChat}
                disabled={isTyping}
                title="Clear conversation and start a new task"
                className="h-8 w-8 rounded-full shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-border"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="sr-only">Clear chat</span>
              </Button>
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
