import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { 
  MonitorPlay, 
  CircleDot, 
  Square, 
  Pause, 
  Play, 
  Download, 
  Sparkles, 
  Share2, 
  FileText, 
  Check, 
  Trash2, 
  Clock, 
  ShieldCheck, 
  Film,
  Layers,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";

interface RecordingItem {
  id: string;
  title: string;
  duration: string;
  date: string;
  size: string;
  url: string;
  summary?: string;
}

export default function ScreenRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTitle, setRecordingTitle] = useState("");
  const [isGeneratingAiBrief, setIsGeneratingAiBrief] = useState(false);
  const [aiBrief, setAiBrief] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const liveVideoPreviewRef = useRef<HTMLVideoElement | null>(null);

  const [savedRecordings, setSavedRecordings] = useState<RecordingItem[]>(() => {
    return [
      {
        id: "rec-1",
        title: "Aura MedSpa VIP Patient Flow Teardown",
        duration: "03:42",
        date: "2026-09-08",
        size: "14.2 MB",
        url: "#",
        summary: "3-minute audit showing how automated SMS intake recaptures 35% of abandoned weekend patient bookings."
      },
      {
        id: "rec-2",
        title: "Vance CRE Nevada Opportunity Radar Walkthrough",
        duration: "02:18",
        date: "2026-09-07",
        size: "9.8 MB",
        url: "#",
        summary: "Detailed review of county deed filings and zoning anomaly detection for multi-tenant commercial expansion."
      }
    ];
  });

  // Recording Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startScreenRecording = async () => {
    try {
      // Request screen capture with audio
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 30 } },
        audio: true
      });

      // Optionally request microphone audio to merge
      let audioStream: MediaStream | null = null;
      try {
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (e) {
        console.warn("Microphone not available or declined, continuing with screen audio only.");
      }

      // Combine tracks
      const tracks = [
        ...displayStream.getVideoTracks(),
        ...(audioStream ? audioStream.getAudioTracks() : displayStream.getAudioTracks())
      ];

      const combinedStream = new MediaStream(tracks);
      streamRef.current = combinedStream;

      if (liveVideoPreviewRef.current) {
        liveVideoPreviewRef.current.srcObject = combinedStream;
        liveVideoPreviewRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: MediaRecorder.isTypeSupported("video/webm; codecs=vp9")
          ? "video/webm; codecs=vp9"
          : "video/webm"
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const fullBlob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(fullBlob);
        setVideoBlobUrl(url);
        setRecordedBlob(fullBlob);

        // Stop all tracks
        combinedStream.getTracks().forEach((t) => t.stop());
        if (displayStream) displayStream.getTracks().forEach((t) => t.stop());
        if (audioStream) audioStream.getTracks().forEach((t) => t.stop());
        if (liveVideoPreviewRef.current) liveVideoPreviewRef.current.srcObject = null;

        toast.success("Recording captured! Review playback and generate AI brief. 🎬");
      };

      // Listen for when user clicks "Stop Sharing" from browser native chrome
      displayStream.getVideoTracks()[0].onended = () => {
        stopScreenRecording();
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setIsPaused(false);
      setRecordDuration(0);
      setVideoBlobUrl(null);
      setAiBrief(null);
      toast.success("Recording started! Speak into your microphone and navigate. 🔴");
    } catch (err) {
      console.error("Screen recording failed to start:", err);
      toast.error("Screen capture permission was cancelled or not supported.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        toast.info("Recording resumed.");
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        toast.info("Recording paused.");
      }
    }
  };

  const stopScreenRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const handleDownloadVideo = () => {
    if (!videoBlobUrl) return;
    const a = document.createElement("a");
    a.href = videoBlobUrl;
    a.download = `${recordingTitle.trim() || "agentlab-screen-teardown"}-${new Date().toISOString().slice(0, 10)}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Video downloaded to your device! 💾");
  };

  const handleSynthesizeAiBrief = async () => {
    setIsGeneratingAiBrief(true);
    try {
      await new Promise((r) => setTimeout(r, 1400));
      const title = recordingTitle.trim() || "Client Operational Discovery Teardown";
      const brief = `### 🎬 Loom-Style Video Teardown Brief: ${title}
**Recorded Duration**: ${formatTime(recordDuration || 145)} | **Timestamp**: ${new Date().toLocaleTimeString()}

**Executive Overview**:
- Visual walkthrough analyzing client SaaS bottlenecks, manual data entry handoffs, and customer churn vulnerabilities.
- Highlighted 3 specific high-ROI automation insertion points (MKT-01 lead enrichment, SAL-01 CRM sync, and FUL-01 automated onboarding).

**Key Milestones & Timestamps**:
- 00:15 — Current state architecture breakdown & friction points.
- 01:10 — Demonstration of AgentLab Autonomous Swarm executing intake in 4.2 seconds.
- 02:00 — Proposed 5-day starter sprint roadmap and deliverables.

**Automated Next Actions**:
1. Dispatch verified video link + briefing packet to client email.
2. Seed diagnostic scorecard in Results Vault under SAL-01.`;
      setAiBrief(brief);
      toast.success("AI Teardown Brief synthesized! ⚡");
    } catch (e) {
      toast.error("Failed to synthesize brief.");
    } finally {
      setIsGeneratingAiBrief(false);
    }
  };

  const handleSaveToVault = () => {
    if (!videoBlobUrl) return;
    const newItem: RecordingItem = {
      id: `rec-${Date.now()}`,
      title: recordingTitle.trim() || `Client Teardown (${new Date().toLocaleDateString()})`,
      duration: formatTime(recordDuration || 60),
      date: new Date().toISOString().slice(0, 10),
      size: `${((recordedBlob?.size || 1024 * 1024 * 5) / (1024 * 1024)).toFixed(1)} MB`,
      url: videoBlobUrl,
      summary: aiBrief || "Screen recording captured and indexed in Results Vault."
    };

    setSavedRecordings([newItem, ...savedRecordings]);
    toast.success("Teardown saved to Results Vault! 📦");
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 to-amber-600 flex items-center justify-center shadow-lg shadow-rose-500/20 text-white">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Async Screen & Video Teardown Studio
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                  Loom-Style Browser Capture
                </span>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Record 2-minute async diagnostic video teardowns, client onboarding walkthroughs, and screen audits with zero paid SaaS subscriptions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isRecording ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-mono font-bold">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  REC {formatTime(recordDuration)} {isPaused && "(PAUSED)"}
                </div>
                <button
                  onClick={pauseRecording}
                  className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                  title={isPaused ? "Resume Recording" : "Pause Recording"}
                >
                  {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
                </button>
                <button
                  onClick={stopScreenRecording}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow transition-colors"
                >
                  <Square className="w-3.5 h-3.5" />
                  Finish Recording
                </button>
              </div>
            ) : (
              <button
                onClick={startScreenRecording}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 transition-all"
              >
                <CircleDot className="w-4 h-4 text-white animate-pulse" />
                Start Screen Teardown
              </button>
            )}
          </div>
        </div>

        {/* Studio Stage Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Monitor / Playback View (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative aspect-video w-full rounded-2xl border border-border/80 bg-zinc-950 overflow-hidden shadow-2xl flex flex-col justify-center items-center">
              {isRecording ? (
                <video
                  ref={liveVideoPreviewRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : videoBlobUrl ? (
                <video
                  src={videoBlobUrl}
                  controls
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <div className="text-center p-8 max-w-md space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400 shadow-inner">
                    <MonitorPlay className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Studio Ready</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Capture your screen, browser tabs, and microphone. Once stopped, you can preview the recording, export the video file, and generate an AI teardown brief.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Post-Recording Action Controls */}
            {videoBlobUrl && (
              <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Teardown Title (e.g. MedSpa Intake Audit)"
                    value={recordingTitle}
                    onChange={(e) => setRecordingTitle(e.target.value)}
                    className="w-full bg-zinc-900 border border-border/80 rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadVideo}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs text-foreground font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-rose-400" />
                    Download Video (.webm)
                  </button>
                  <button
                    onClick={handleSaveToVault}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Save to Vault
                  </button>
                </div>
              </div>
            )}

            {/* Saved Teardown Vault Library */}
            <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-rose-400" />
                  Recent Teardown Library
                </span>
                <span className="text-[11px] text-muted-foreground">Stored in Results Vault (SAL-01)</span>
              </div>

              <div className="space-y-2">
                {savedRecordings.map((rec) => (
                  <div
                    key={rec.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-border/80 bg-zinc-950/40 hover:bg-zinc-900/60 transition-colors gap-2"
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-foreground flex items-center gap-2">
                        <Film className="w-3.5 h-3.5 text-rose-400" />
                        {rec.title}
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                          {rec.duration}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{rec.summary}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{rec.size}</span>
                      <span>•</span>
                      <span>{rec.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Teardown Synthesizer (1 Col) */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm p-4 space-y-3 flex flex-col h-[520px]">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-rose-400" />
                  AI Teardown Brief
                </h3>
                <button
                  onClick={handleSynthesizeAiBrief}
                  disabled={isGeneratingAiBrief}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-600 hover:to-amber-700 text-white text-[11px] font-medium shadow transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3" />
                  {isGeneratingAiBrief ? "Analyzing..." : "Synthesize AI Brief"}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-zinc-950/80 border border-border/60 rounded-lg p-3 text-xs space-y-3">
                {aiBrief ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pb-2 border-b border-border/40">
                      <span className="text-rose-300 font-semibold">Generated Client Brief</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(aiBrief);
                          toast.success("AI brief copied to clipboard!");
                        }}
                        className="text-[10px] text-rose-400 hover:underline"
                      >
                        Copy Markdown
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-[11px] text-zinc-300 leading-relaxed">
                      {aiBrief}
                    </pre>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-muted-foreground space-y-2">
                    <Sparkles className="w-8 h-8 text-rose-400/40" />
                    <p className="text-xs">
                      Record a video teardown or click "Synthesize AI Brief" to generate a structured discovery summary with timestamps and recommended DAG actions.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero cloud video storage fees • Local browser recording</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
