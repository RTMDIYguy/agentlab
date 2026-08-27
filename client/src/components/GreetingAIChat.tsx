import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Bot, Send, User, Sparkles } from "lucide-react";

export function GreetingAIChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Welcome to AgentLab. The show is about to begin. What kind of agency are you building today?",
      id: "1",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input, id: Date.now().toString() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'll start preparing the instruments. In the meantime, you can explore the features or sign up to save this context to your Orchestrator.",
          id: (Date.now() + 1).toString(),
        },
      ]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[400px] w-full max-w-md mx-auto neon-border bg-background/80 backdrop-blur-xl">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50 relative overflow-hidden">
            <Bot className="w-4 h-4 text-primary relative z-10" />
            <div className="absolute inset-0 bg-primary/20 animate-pulse-glow"></div>
          </div>
          <div>
            <h3 className="font-semibold text-sm flex items-center gap-2">
              AgentLab Orchestrator
              <Sparkles className="w-3 h-3 text-accent animate-pulse-glow" />
            </h3>
            <p className="text-xs text-muted-foreground">Online & Ready</p>
          </div>
        </div>
        <div className="flex gap-1 h-3">
          <div className="w-1 bg-primary/50 animate-soundwave" style={{ animationDelay: "0ms" }}></div>
          <div className="w-1 bg-primary/50 animate-soundwave" style={{ animationDelay: "150ms" }}></div>
          <div className="w-1 bg-primary/50 animate-soundwave" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex gap-3 max-w-[85%] ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "user"
                    ? "bg-secondary/20 border border-secondary/50 text-secondary"
                    : "bg-primary/20 border border-primary/50 text-primary"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              <div
                className={`p-3 rounded-2xl text-sm ${
                  msg.role === "user"
                    ? "bg-secondary text-secondary-foreground rounded-tr-sm"
                    : "bg-card border border-border text-card-foreground rounded-tl-sm shadow-[0_0_15px_rgba(0,102,255,0.15)]"
                }`}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-primary/20 border border-primary/50 text-primary">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-2xl bg-card border border-border rounded-tl-sm flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-card/50">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your vision..."
            className="w-full bg-background border border-border rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 shadow-inner"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isTyping}
            className="absolute right-1.5 top-1.5 rounded-full w-9 h-9 bg-primary hover:bg-primary/90 text-white button-glow"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
