import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  MessageSquare,
  Send,
  Sparkles,
  Video,
  Search,
  Hash,
  Bot,
  Plus,
  MoreVertical,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

const MIGRATION_KEY = "agentlab_messenger_chats";

type Thread = {
  id: string;
  type: string; // 'channel' | 'dm' (varchar from DB, narrowed at usage sites)
  slug: string | null;
  name: string;
  tagline: string | null;
  role: string | null;
  company: string | null;
};

type Msg = {
  id: string;
  threadId: string;
  sender: string; // 'founder' | 'client' | 'bot'
  senderName: string;
  content: string;
  isMeetingLink: boolean;
  createdAt: string;
};

function formatTime(iso: string) {
  const d = new Date(iso);
  const isToday = d.toDateString() === new Date().toDateString();
  if (isToday) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function ClientMessenger() {
  const [, setLocation] = useLocation();

  // Live updates: poll the thread roster and the active conversation so new
  // client/bot messages appear without a manual refresh. Window-focus refetch
  // comes free from React Query defaults; the intervals catch background
  // arrivals while the page stays open.
  const threadsQuery = trpc.messenger.listThreads.useQuery(undefined, {
    refetchInterval: 15000,
  });
  const threads: Thread[] = threadsQuery.data ?? [];

  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [inputContent, setInputContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const migratedRef = useRef(false);

  const activeThread =
    threads.find(t => t.id === activeThreadId) ?? threads[0] ?? null;

  const messagesQuery = trpc.messenger.getMessages.useQuery(
    { threadId: activeThread!.id },
    {
      enabled: !!activeThread,
      refetchInterval: 5000,
    }
  );
  const messages: Msg[] = messagesQuery.data ?? [];

  const invalidateMessages = () => messagesQuery.refetch();

  const sendMessageMutation = trpc.messenger.sendMessage.useMutation({
    onSuccess: invalidateMessages,
    onError: (err: any) => toast.error(`Message not saved: ${err?.message ?? "unknown error"}`),
  });

  const createThreadMutation = trpc.messenger.createThread.useMutation({
    onSuccess: () => threadsQuery.refetch(),
    onError: (err: any) => toast.error(`Could not create channel: ${err?.message ?? "unknown error"}`),
  });

  const draftReplyMutation = trpc.messenger.draftReply.useMutation({
    onSuccess: (result: any) => {
      setInputContent(result.draft);
      toast.success("AI draft ready! Review and press Send. ⚡");
    },
    onError: (err: any) =>
      toast.error(`AI draft unavailable: ${err?.message ?? "unknown error"}`),
  });

  // One-time migration: founder messages previously trapped in localStorage are
  // persisted to the real DB, then the local cache is retired. Only founder
  // messages are migrated — the old scaffold's bot/client entries were fiction.
  useEffect(() => {
    if (migratedRef.current || threads.length === 0) return;
    migratedRef.current = true;

    let parsed: Record<string, any[]> | null = null;
    try {
      const saved = localStorage.getItem(MIGRATION_KEY);
      if (saved) parsed = JSON.parse(saved);
    } catch {
      parsed = null;
    }
    localStorage.removeItem(MIGRATION_KEY);
    if (!parsed) return;

    let migrated = 0;
    for (const [slug, msgs] of Object.entries(parsed)) {
      const thread = threads.find(t => t.slug === slug);
      if (!thread || !Array.isArray(msgs)) continue;
      for (const m of msgs) {
        if (m?.sender !== "founder" || typeof m?.content !== "string" || !m.content.trim())
          continue;
        sendMessageMutation.mutate({
          threadId: thread.id,
          content: m.content.slice(0, 10000),
          isMeetingLink: !!m.isMeetingLink,
        });
        migrated++;
      }
    }
    if (migrated > 0) {
      toast.success(`Migrated ${migrated} saved message${migrated === 1 ? "" : "s"} into the database`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threads]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeThreadId]);

  const handleSendMessage = () => {
    if (!inputContent.trim() || !activeThread) return;
    sendMessageMutation.mutate({
      threadId: activeThread.id,
      content: inputContent.trim(),
      isMeetingLink: false,
    });
    setInputContent("");
  };

  const handleSendMeetingInvite = () => {
    if (!activeThread) return;
    const roomName =
      activeThread.slug === "dm-lorenzo" ? "lorenzo-beta-review" : "client-discovery-sprint";
    sendMessageMutation.mutate({
      threadId: activeThread.id,
      content: `Let's connect in the Live War Room: ${window.location.origin}/meeting?room=${roomName}`,
      isMeetingLink: true,
    });
    toast.success("War Room invite sent in chat! 🎥");
  };

  const handleAiDraftResponse = () => {
    if (!activeThread) return;
    draftReplyMutation.mutate({ threadId: activeThread.id });
  };

  const handleNewChannel = () => {
    const name = window.prompt("New office channel name (e.g. growth-experiments):");
    if (!name || !name.trim()) return;
    createThreadMutation.mutate({ type: "channel", name: name.trim() });
  };

  const filteredThreads = threads.filter(
    t =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.tagline ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isAiGenerating = draftReplyMutation.isPending;
  const isSending = sendMessageMutation.isPending;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Client Messenger & Office Channels
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  Synced to Database
                </span>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Direct client text messaging, proposal sharing, and autonomous swarm communication channels.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChannel}
              disabled={createThreadMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium transition-colors disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5" />
              New Channel
            </button>
            <button
              onClick={() => setLocation("/meeting")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-medium transition-colors"
            >
              <Video className="w-3.5 h-3.5" />
              Launch Live Meeting Room
            </button>
          </div>
        </div>

        {/* Messenger Shell Grid */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-md overflow-hidden shadow-2xl">
          {/* Thread List Sidebar (1 Col) */}
          <div className="border-r border-border/60 flex flex-col bg-zinc-950/40">
            <div className="p-3 border-b border-border/60">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search channels & clients..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900/80 border border-border/60 rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-4">
              {threadsQuery.isLoading && (
                <div className="text-xs text-muted-foreground px-2 py-4">Loading threads…</div>
              )}
              {threadsQuery.isError && (
                <div className="text-xs text-red-400 px-2 py-4">
                  Could not load threads: {(threadsQuery.error as any)?.message}
                </div>
              )}

              {/* Channels Section */}
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-1.5">
                  Office Channels
                </div>
                <div className="space-y-0.5">
                  {filteredThreads
                    .filter(t => t.type === "channel")
                    .map(t => (
                      <button
                        key={t.id}
                        onClick={() => setActiveThreadId(t.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-all ${
                          activeThread?.id === t.id
                            ? "bg-cyan-500/15 text-cyan-300 font-medium border border-cyan-500/30"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-xs truncate">{t.name}</span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              {/* Direct Messages Section */}
              {filteredThreads.filter(t => t.type === "dm").length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-1.5">
                    Direct Messages & Clients
                  </div>
                  <div className="space-y-0.5">
                    {filteredThreads
                      .filter(t => t.type === "dm")
                      .map(t => (
                        <button
                          key={t.id}
                          onClick={() => setActiveThreadId(t.id)}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-all ${
                            activeThread?.id === t.id
                              ? "bg-cyan-500/15 text-cyan-300 font-medium border border-cyan-500/30"
                              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <div className="w-5 h-5 rounded-full bg-zinc-800 border border-border flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-foreground">
                              {t.name.charAt(0)}
                            </div>
                            <div className="truncate">
                              <div className="text-xs truncate">{t.name}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat Window (3 Cols) */}
          <div className="md:col-span-2 lg:col-span-3 flex flex-col bg-zinc-950/20">
            {/* Thread Top Bar */}
            <div className="p-3.5 px-5 border-b border-border/60 flex items-center justify-between bg-zinc-950/40">
              <div className="flex items-center gap-3">
                {activeThread?.type === "channel" ? (
                  <div className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center text-muted-foreground">
                    <Hash className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {activeThread?.name.charAt(0) ?? "?"}
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-foreground flex items-center gap-2">
                    {activeThread?.name ?? "No thread selected"}
                    {activeThread?.role && (
                      <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-border">
                        {activeThread.role}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {activeThread?.tagline ?? "Create a channel or pick a thread to begin"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSendMeetingInvite}
                  disabled={!activeThread || isSending}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition-colors disabled:opacity-40"
                  title="Invite to War Room"
                >
                  <Video className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Send Meeting Invite</span>
                </button>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesQuery.isLoading && (
                <div className="text-xs text-muted-foreground">Loading messages…</div>
              )}
              {messagesQuery.isError && (
                <div className="text-xs text-red-400">
                  Could not load messages: {(messagesQuery.error as any)?.message}
                </div>
              )}
              {!messagesQuery.isLoading && !messagesQuery.isError && messages.length === 0 && (
                <div className="text-xs text-muted-foreground">
                  No messages yet — say hello.
                </div>
              )}
              {messages.map(msg => {
                const isMe = msg.sender === "founder";
                const isBot = msg.sender === "bot";

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold shadow">
                      {isMe ? (
                        <div className="w-full h-full rounded-full bg-cyan-600 text-white flex items-center justify-center">
                          RM
                        </div>
                      ) : isBot ? (
                        <div className="w-full h-full rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-full h-full rounded-full bg-purple-600 text-white flex items-center justify-center">
                          {msg.senderName.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div
                      className={`max-w-[75%] space-y-1 ${isMe ? "items-end text-right" : "items-start text-left"}`}
                    >
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground px-1">
                        <span className="font-semibold text-zinc-300">{msg.senderName}</span>
                        <span>•</span>
                        <span>{formatTime(msg.createdAt)}</span>
                      </div>

                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed shadow-md ${
                          isMe
                            ? "bg-cyan-600 text-white rounded-tr-none"
                            : isBot
                              ? "bg-zinc-900 border border-emerald-500/30 text-emerald-200 rounded-tl-none font-mono text-[11px]"
                              : "bg-zinc-800 text-zinc-200 border border-border/80 rounded-tl-none"
                        }`}
                      >
                        {msg.content}

                        {msg.isMeetingLink && (
                          <div className="mt-2 pt-2 border-t border-white/20">
                            <button
                              onClick={() => setLocation("/meeting")}
                              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-colors"
                            >
                              <Video className="w-3.5 h-3.5" />
                              Join War Room Now
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar & AI Response Assistant */}
            <div className="p-3 border-t border-border/60 bg-zinc-950/60 space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Messages persist to the AgentLab database</span>
                </div>
                <button
                  onClick={handleAiDraftResponse}
                  disabled={isAiGenerating || !activeThread}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 hover:border-cyan-500/60 text-cyan-300 text-[10px] font-medium transition-all disabled:opacity-40"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  {isAiGenerating ? "Drafting…" : "AI Response Assistant"}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Message ${activeThread?.name ?? "thread"}...`}
                  value={inputContent}
                  onChange={e => setInputContent(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 bg-zinc-900 border border-border/60 rounded-xl px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputContent.trim() || isSending || !activeThread}
                  className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-colors disabled:opacity-40"
                  title="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
