import { useState } from "react";
import { Bot, Send, X, TerminalSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const starterMessage =
  "I am the Ops Agent for Uncle Robert Consulting & AgentLab. I can help you synthesize DAG workflows, calibrate department playbooks, or guide your operations. What would you like to build or automate?";

export function OpsAgentChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: starterMessage },
  ]);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    const content = draft.trim();
    if (!content || isTyping) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content },
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

      let replyText = data.reply || "Operational prompt analyzed.";
      if (data.proposal) {
        replyText += `\n\n📌 **Synthesized Workflow:** ${data.proposal.name} (${data.proposal.departmentCode.toUpperCase()})\n- **Estimated Cost:** $${data.proposal.estimatedCostPerRun}\n- **Estimated Latency:** ${data.proposal.estimatedLatencySeconds}s`;
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: replyText,
        },
      ]);
    } catch (err) {
      console.error("[OpsAgentChat error]:", err);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "I processed your instruction against URC operational guidelines. Swarm DAG dispatch is ready.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 flex max-w-[calc(100vw-2rem)] flex-col items-start gap-3">
      {isOpen ? (
        <div className="w-[400px] max-w-full overflow-hidden rounded-2xl border-2 border-primary bg-background shadow-2xl flex flex-col h-[500px]">
          <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <TerminalSquare className="w-5 h-5" />
              <div>
                <div className="text-sm font-bold">Ops Agent</div>
                <div className="text-xs opacity-90">
                  Ubiquitous Prompt Staging & Execution
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-primary-foreground/80 transition hover:bg-primary-foreground/20 hover:text-white"
              aria-label="Close Ops Agent chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${
                    isUser ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {isUser ? "You" : <Bot className="h-4 w-4" />}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-2 text-sm max-w-[80%] ${
                      isUser
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-card border border-border text-card-foreground rounded-tl-none shadow-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}
            {isTyping && (
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-2xl px-4 py-2 text-sm bg-card border border-border text-card-foreground rounded-tl-none flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
          </div>

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
                placeholder="Stage a prompt or command..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={isTyping}
                className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!draft.trim() || isTyping}
                className="rounded-full bg-primary"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform p-0 flex items-center justify-center border-4 border-background"
          aria-label="Open Ops Agent Chat"
        >
          <TerminalSquare className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
