import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Sparkles, 
  Video, 
  Search, 
  Hash, 
  User, 
  Bot, 
  CheckCheck, 
  Smile, 
  Phone, 
  MoreVertical, 
  ShieldCheck,
  FileCheck,
  Zap,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface Message {
  id: string;
  sender: "founder" | "client" | "bot";
  senderName: string;
  avatar?: string;
  content: string;
  timestamp: string;
  attachments?: { name: string; size: string; type: string }[];
  isMeetingLink?: boolean;
}

interface Thread {
  id: string;
  type: "channel" | "dm";
  name: string;
  tagline: string;
  unreadCount: number;
  online: boolean;
  role?: string;
  company?: string;
}

export default function ClientMessenger() {
  const [, setLocation] = useLocation();

  const initialThreads: Thread[] = [
    { id: "chan-general", type: "channel", name: "general-office", tagline: "Agency-wide team & ops sync", unreadCount: 0, online: true },
    { id: "chan-sales", type: "channel", name: "sales-and-leads", tagline: "Inbound diagnostics & CRM pipeline", unreadCount: 2, online: true },
    { id: "chan-fulfillment", type: "channel", name: "fulfillment-briefs", tagline: "Active sprints & DAG delivery", unreadCount: 0, online: true },
    { id: "chan-portal", type: "channel", name: "client-portal", tagline: "Client-facing updates & approvals", unreadCount: 1, online: true },
    { id: "dm-lorenzo", type: "dm", name: "Lorenzo McCarthy", tagline: "NWN Advisory • Financial Advisor & Beta Partner", unreadCount: 0, online: true, role: "Beta Partner", company: "NWN Advisory" },
    { id: "dm-sarah", type: "dm", name: "Dr. Sarah Lin", tagline: "Aura MedSpa • Aesthetic Patient Acquisition Lead", unreadCount: 1, online: false, role: "Founder / Medical Director", company: "Aura MedSpa" },
    { id: "dm-marcus", type: "dm", name: "Marcus Vance", tagline: "Vance Commercial Realty • Multi-Tenant Expansion", unreadCount: 0, online: true, role: "Principal Broker", company: "Vance CRE" },
    { id: "dm-sheena", type: "dm", name: "Sheena Burns", tagline: "Uncle Robert Consulting • Co-Founder", unreadCount: 0, online: true, role: "Co-Founder", company: "URC" },
  ];

  const defaultMessages: Record<string, Message[]> = {
    "chan-general": [
      { id: "m1", sender: "bot", senderName: "Ops Swarm Bot", content: "Daily Command Center heartbeat synchronized at 05:00 AM Central. All 10 DAG pipelines healthy.", timestamp: "08:00 AM" },
      { id: "m2", sender: "founder", senderName: "Robert McCarthy", content: "Great work. Let's focus on the Founder Sprint onboarding today.", timestamp: "08:15 AM" }
    ],
    "chan-sales": [
      { id: "m3", sender: "bot", senderName: "LeadPulse Agent", content: "New inbound diagnostic completed: Dr. Sarah Lin (Aura MedSpa). Severity Score: 88/100 (Patient Churn & Manual Booking).", timestamp: "09:30 AM" },
      { id: "m4", sender: "client", senderName: "Dr. Sarah Lin", content: "Hi Robert, reviewed the MedSpa blueprint. When can we hop on a quick screen share to see the VIP booking workflow?", timestamp: "09:42 AM" }
    ],
    "chan-fulfillment": [
      { id: "m5", sender: "bot", senderName: "Delivery Agent (FUL-01)", content: "Customer Onboarding & Retention Swarm generated SHA-256 scorecard #a9f82d for new client. SOW delivered.", timestamp: "10:00 AM" }
    ],
    "chan-portal": [
      { id: "m6", sender: "founder", senderName: "Robert McCarthy", content: "Welcome to your AgentLab Client Portal! All active deliverables and sprint milestones will be tracked here.", timestamp: "Yesterday" }
    ],
    "dm-lorenzo": [
      { id: "m7", sender: "client", senderName: "Lorenzo McCarthy", content: "Hey Robert! Thanks for provisioning my beta partner access. The new CRM and GTM tools look great.", timestamp: "11:15 AM" },
      { id: "m8", sender: "founder", senderName: "Robert McCarthy", content: "Awesome! Let me know if you need anything as you explore the marketing and operations swarms.", timestamp: "11:20 AM" }
    ],
    "dm-sarah": [
      { id: "m9", sender: "client", senderName: "Dr. Sarah Lin", content: "Hello! We are looking to automate our weekend patient intake. Could we schedule a 15-minute War Room meeting?", timestamp: "10:14 AM" }
    ],
    "dm-marcus": [
      { id: "m10", sender: "client", senderName: "Marcus Vance", content: "Robert, the Nevada CRE opportunity radar brief was super helpful. We identified two target industrial parks.", timestamp: "Yesterday" }
    ],
    "dm-sheena": [
      { id: "m11", sender: "client", senderName: "Sheena Burns", content: "Good morning! The new live documentation visual tour looks super clean.", timestamp: "Yesterday" }
    ]
  };

  const [threads] = useState<Thread[]>(initialThreads);
  const [activeThreadId, setActiveThreadId] = useState<string>("chan-sales");
  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem("agentlab_messenger_chats");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return defaultMessages;
  });

  const [inputContent, setInputContent] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];
  const currentMessages = messages[activeThreadId] || [];

  useEffect(() => {
    localStorage.setItem("agentlab_messenger_chats", JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeThreadId]);

  const handleSendMessage = () => {
    if (!inputContent.trim()) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "founder",
      senderName: "Robert McCarthy",
      content: inputContent.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => ({
      ...prev,
      [activeThreadId]: [...(prev[activeThreadId] || []), newMsg],
    }));

    setInputContent("");
  };

  const handleSendMeetingInvite = () => {
    const roomName = activeThread.id === "dm-lorenzo" ? "lorenzo-beta-review" : "client-discovery-sprint";
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "founder",
      senderName: "Robert McCarthy",
      content: `Let's connect in the Live War Room: ${window.location.origin}/meeting?room=${roomName}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isMeetingLink: true,
    };

    setMessages((prev) => ({
      ...prev,
      [activeThreadId]: [...(prev[activeThreadId] || []), newMsg],
    }));

    toast.success("War Room invite sent in chat! 🎥");
  };

  const handleAiDraftResponse = async () => {
    setIsAiGenerating(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      let draft = "";
      if (activeThread.id === "dm-sarah") {
        draft = "Hi Dr. Lin, absolutely! I just generated a dedicated War Room for us. Let's walk through the 5-day aesthetic intake workflow together. Join here: " + window.location.origin + "/meeting?room=medspa-intake-lounge";
      } else if (activeThread.id === "dm-lorenzo") {
        draft = "Thanks Lorenzo! Feel free to test the 1-click integration launchers on your dashboard as well. Let me know if any custom webhooks would be helpful.";
      } else {
        draft = "Thanks for the update! All systems are performing within nominal thresholds. Let me know if you want to inspect the latest execution trace.";
      }
      setInputContent(draft);
      toast.success("AI draft ready! Review and press Send. ⚡");
    } catch (e) {
      toast.error("Failed to generate draft.");
    } finally {
      setIsAiGenerating(false);
    }
  };

  const filteredThreads = threads.filter((t) => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.tagline.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                  Real-Time Encrypted
                </span>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Direct client text messaging, proposal sharing, and autonomous swarm communication channels.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900/80 border border-border/60 rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-4">
              {/* Channels Section */}
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-1.5">
                  Office Channels
                </div>
                <div className="space-y-0.5">
                  {filteredThreads.filter((t) => t.type === "channel").map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveThreadId(t.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-all ${
                        activeThreadId === t.id
                          ? "bg-cyan-500/15 text-cyan-300 font-medium border border-cyan-500/30"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs truncate">{t.name}</span>
                      </div>
                      {t.unreadCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-cyan-500 text-[10px] font-bold text-black">
                          {t.unreadCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct Messages Section */}
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-1.5">
                  Direct Messages & Clients
                </div>
                <div className="space-y-0.5">
                  {filteredThreads.filter((t) => t.type === "dm").map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveThreadId(t.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-all ${
                        activeThreadId === t.id
                          ? "bg-cyan-500/15 text-cyan-300 font-medium border border-cyan-500/30"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className="relative flex-shrink-0">
                          <div className="w-5 h-5 rounded-full bg-zinc-800 border border-border flex items-center justify-center text-[10px] font-bold text-foreground">
                            {t.name.charAt(0)}
                          </div>
                          {t.online && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute -bottom-0.5 -right-0.5 ring-2 ring-zinc-950" />
                          )}
                        </div>
                        <div className="truncate">
                          <div className="text-xs truncate">{t.name}</div>
                        </div>
                      </div>
                      {t.unreadCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-cyan-500 text-[10px] font-bold text-black">
                          {t.unreadCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Chat Window (3 Cols) */}
          <div className="md:col-span-2 lg:col-span-3 flex flex-col bg-zinc-950/20">
            {/* Thread Top Bar */}
            <div className="p-3.5 px-5 border-b border-border/60 flex items-center justify-between bg-zinc-950/40">
              <div className="flex items-center gap-3">
                {activeThread.type === "channel" ? (
                  <div className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center text-muted-foreground">
                    <Hash className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {activeThread.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-foreground flex items-center gap-2">
                    {activeThread.name}
                    {activeThread.role && (
                      <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-border">
                        {activeThread.role}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{activeThread.tagline}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSendMeetingInvite}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition-colors"
                  title="Invite to War Room"
                >
                  <Video className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Send Meeting Invite</span>
                </button>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentMessages.map((msg) => {
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

                    <div className={`max-w-[75%] space-y-1 ${isMe ? "items-end text-right" : "items-start text-left"}`}>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground px-1">
                        <span className="font-semibold text-zinc-300">{msg.senderName}</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
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
                  <span>Encrypted Client Channel</span>
                </div>
                <button
                  onClick={handleAiDraftResponse}
                  disabled={isAiGenerating}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 hover:border-cyan-500/60 text-cyan-300 text-[10px] font-medium transition-all"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  {isAiGenerating ? "Drafting..." : "AI Response Assistant"}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Message ${activeThread.name}...`}
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 bg-zinc-900 border border-border/60 rounded-xl px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputContent.trim()}
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
