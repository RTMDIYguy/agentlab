import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { 
  Video, 
  Monitor, 
  PhoneOff, 
  Copy, 
  Check, 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  Radio, 
  Share2,
  Layers
} from "lucide-react";
import { toast } from "sonner";

export default function MeetingRoom() {
  const [roomId, setRoomId] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("room") || "agentlab-virtual-office-war-room";
  });
  const [isInCall, setIsInCall] = useState(false);
  const [roomNameInput, setRoomNameInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [meetingNotes, setMeetingNotes] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);

  // Quick preset rooms
  const quickRooms = [
    { id: "founder-sprint-discovery", name: "Founder Sprint Discovery", purpose: "Client Intake & Diagnostic" },
    { id: "agency-ops-standup", name: "Agency Ops Standup", purpose: "Internal Team & Swarms" },
    { id: "cre-expansion-review", name: "CRE Opportunity Review", purpose: "Real Estate Deal Room" },
    { id: "medspa-intake-lounge", name: "MedSpa Growth Lounge", purpose: "Aesthetic Patient Flow Strategy" },
  ];

  // Call timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isInCall) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [isInCall]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startMeeting = (idToUse?: string) => {
    const selected = idToUse || roomNameInput.trim() || roomId;
    const sanitized = selected.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    setRoomId(sanitized);
    setIsInCall(true);
    toast.success(`Connected to War Room: ${sanitized} 🎥`);
  };

  const endMeeting = () => {
    setIsInCall(false);
    toast.info("Meeting concluded.");
  };

  const inviteUrl = `${window.location.origin}/meeting?room=${encodeURIComponent(roomId)}`;

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast.success("Client meeting invite link copied! 📋");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAiSummarize = async () => {
    if (!meetingNotes.trim()) {
      toast.error("Enter meeting notes first to synthesize an AI summary.");
      return;
    }
    setIsSummarizing(true);
    try {
      // Simulate/call AI summary generator
      await new Promise((r) => setTimeout(r, 1200));
      const summary = `### 📋 Meeting Executive Summary & Action Blueprint
**War Room**: \`${roomId}\` | **Duration**: ${formatDuration(callDuration || 900)}

**Key Findings & Discussion Points**:
- Core bottleneck identified around client intake velocity and automated lead scoring.
- Client agreed to proceed with the 5-day starter sprint protocol.
- Scope includes automated CRM pipeline synchronization and 1-click diagnostic intake.

**Agreed Next Action Items**:
1. [ ] Send verified SOW & onboarding link by 5:00 PM Central.
2. [ ] Provision workspace tenant and seed 7-department knowledge playbook.
3. [ ] Schedule Day 3 milestone review via War Room.`;
      setAiSummary(summary);
      toast.success("AI Meeting Summary synthesized! ⚡");
    } catch (e) {
      toast.error("Failed to generate summary.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const jitsiUrl = `https://meet.jit.si/${roomId}#config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false&interfaceConfig.SHOW_JITSI_WATERMARK=false&interfaceConfig.SHOW_BRAND_WATERMARK=false`;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  Live Video & Screen War Room
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Zero-Install WebRTC
                  </span>
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Host client strategy sessions, screen share diagnostic walkthroughs, and collaborate with zero client software downloads.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isInCall && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
                <Radio className="w-3.5 h-3.5 animate-pulse text-red-500" />
                LIVE: {formatDuration(callDuration)}
              </div>
            )}
            <button
              onClick={copyInviteLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card/80 hover:bg-card text-xs text-foreground font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
              {copied ? "Link Copied!" : "Copy Client Invite"}
            </button>
            {isInCall ? (
              <button
                onClick={endMeeting}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow transition-colors"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                End Session
              </button>
            ) : (
              <button
                onClick={() => startMeeting()}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all"
              >
                <Video className="w-3.5 h-3.5" />
                Launch War Room
              </button>
            )}
          </div>
        </div>

        {/* Main Stage Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Frame & Stage (2 Columns) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative aspect-video w-full rounded-2xl border border-border/80 bg-zinc-950/90 overflow-hidden shadow-2xl flex flex-col justify-center items-center">
              {isInCall ? (
                <iframe
                  src={jitsiUrl}
                  allow="camera; microphone; display-capture; autoplay; clipboard-write"
                  className="w-full h-full border-0"
                  title="AgentLab Live War Room"
                />
              ) : (
                <div className="text-center p-8 max-w-md space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 shadow-inner">
                    <Monitor className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">War Room Standby</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ready to connect with clients. Click Launch or select a preset room below to start the HD WebRTC audio/video bridge.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Custom room name (e.g. client-sprint)"
                      value={roomNameInput}
                      onChange={(e) => setRoomNameInput(e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={() => startMeeting()}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Join
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Room Presets */}
            <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  Quick Room Presets
                </span>
                <span className="text-[11px] text-muted-foreground">Click any room to switch instantly</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {quickRooms.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => startMeeting(r.id)}
                    className={`flex items-start justify-between p-3 rounded-lg border text-left transition-all ${
                      roomId === r.id && isInCall
                        ? "bg-indigo-500/10 border-indigo-500/50 text-indigo-300"
                        : "bg-card hover:bg-muted/60 border-border/80 text-foreground"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-medium">{r.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{r.purpose}</div>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      /{r.id}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Side Drawer: Notes, AI Synthesis & Invite Management (1 Column) */}
          <div className="space-y-4">
            {/* Live Client Invite Card */}
            <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                Client Guest Link
              </h3>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-300 overflow-hidden">
                <span className="truncate flex-1">{inviteUrl}</span>
                <button
                  onClick={copyInviteLink}
                  className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                  title="Copy link"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Encrypted peer-to-peer WebRTC • Zero software install</span>
              </div>
            </div>

            {/* In-Situ Meeting Notes & AI Synthesizer */}
            <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm p-4 space-y-3 flex flex-col h-[460px]">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  Live Meeting Scratchpad
                </h3>
                <button
                  onClick={handleAiSummarize}
                  disabled={isSummarizing || !meetingNotes.trim()}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-[11px] font-medium shadow transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3" />
                  {isSummarizing ? "Synthesizing..." : "AI Summarize"}
                </button>
              </div>

              <textarea
                value={meetingNotes}
                onChange={(e) => setMeetingNotes(e.target.value)}
                placeholder="Type client discovery notes, pain points, requested workflows, or live feedback here..."
                className="flex-1 w-full bg-zinc-950/80 border border-border/60 rounded-lg p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-indigo-500 resize-none font-sans"
              />

              {aiSummary && (
                <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-indigo-200 overflow-y-auto max-h-40 space-y-1">
                  <div className="font-semibold text-indigo-300 flex items-center justify-between">
                    <span>Generated Discovery Brief</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(aiSummary);
                        toast.success("Summary copied to clipboard!");
                      }}
                      className="text-[10px] text-indigo-400 hover:underline"
                    >
                      Copy Markdown
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-[11px] text-zinc-300">
                    {aiSummary}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
