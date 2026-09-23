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
  FileText, 
  Check, 
  Trash2, 
  ShieldCheck, 
  Film,
  Layers,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type TeardownSessionRow = {
  id: string;
  title: string;
  durationSeconds: number;
  sizeBytes: number;
  hasVideo: boolean;
  hasBrief: boolean;
  notes: string | null;
  aiBrief: string | null;
  createdAt: string;
};

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function formatSize(bytes: number) {
  if (!bytes) return "—";
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("manus-runtime-token");
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export default function ScreenRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTitle, setRecordingTitle] = useState("");
  const [teardownNotes, setTeardownNotes] = useState("");
  const [aiBrief, setAiBrief] = useState<string | null>(null);
  const [aiBriefModel, setAiBriefModel] = useState<string | null>(null);
  const [loadedSessionId, setLoadedSessionId] = useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const liveVideoPreviewRef = useRef<HTMLVideoElement | null>(null);

  // Server-persisted library — survives refresh. Video binaries load on
  // demand from /api/teardown/:id/video; metadata comes from the tRPC list.
  const savedRecordings = trpc.teardown.list.useQuery({});
  const utils = trpc.useContext();

  const invalidateList = () => {
    void utils.teardown.list.invalidate();
  };

  const summarizeMutation = trpc.teardown.summarizeTeardown.useMutation({
    onSuccess: (result: any) => {
      setAiBrief(result.brief);
      setAiBriefModel(result.model ?? null);
      toast.success("AI Teardown Brief synthesized! ⚡");
      // If a persisted session is loaded, keep its brief in the DB too.
      if (loadedSessionId) {
        updateBriefMutation.mutate({
          sessionId: loadedSessionId,
          brief: result.brief,
          model: result.model ?? null,
        });
      }
    },
    onError: (err: any) =>
      toast.error(`AI brief unavailable: ${err?.message ?? "unknown error"}`),
  });

  const updateBriefMutation = trpc.teardown.updateBrief.useMutation({
    onSuccess: () => invalidateList(),
  });

  const saveSessionMutation = trpc.teardown.save.useMutation({
    onSuccess: async (result: any) => {
      const sessionId = result.id as string;
      // Upload the video binary through the REST endpoint.
      if (recordedBlob) {
        try {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = String(reader.result || "");
              resolve(result.slice(result.indexOf(",") + 1));
            };
            reader.onerror = () => reject(new Error("Failed to read recording"));
            reader.readAsDataURL(recordedBlob);
          });

          const res = await fetch(`/api/teardown/${sessionId}/video`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify({ videoData: base64 }),
          });
          if (!res.ok) {
            const errBody = await res.json().catch(() => ({}));
            throw new Error(errBody.error || `Upload failed (${res.status})`);
          }
          toast.success("Teardown saved to the server — it survives refresh. 📦");
        } catch (err: any) {
          toast.error(
            `Session saved but the video could not be stored: ${err?.message ?? "unknown error"}`
          );
        }
      } else {
        toast.success("Teardown session saved to the server. 📦");
      }
      invalidateList();
      setRecordingTitle("");
      setRecordedBlob(null);
      setVideoBlobUrl(null);
      setLoadedSessionId(null);
    },
    onError: (err: any) =>
      toast.error(`Could not save session: ${err?.message ?? "unknown error"}`),
  });

  const deleteSessionMutation = trpc.teardown.delete.useMutation({
    onSuccess: () => {
      toast.success("Session deleted.");
      if (loadedSessionId === deleteSessionMutation.variables?.sessionId) {
        setLoadedSessionId(null);
        setVideoBlobUrl(null);
      }
      invalidateList();
    },
    onError: (err: any) =>
      toast.error(`Delete failed: ${err?.message ?? "unknown error"}`),
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

        toast.success("Recording captured! Save it to the vault or generate an AI brief. 🎬");
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
      setRecordedBlob(null);
      setAiBrief(null);
      setAiBriefModel(null);
      setLoadedSessionId(null);
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

  const handleSynthesizeAiBrief = () => {
    if (!teardownNotes.trim()) {
      toast.error(
        "Describe what happens in the recording first — the AI brief is written from your notes (the video never leaves your browser)."
      );
      return;
    }
    summarizeMutation.mutate({
      title: recordingTitle.trim() || "Client Teardown",
      durationSeconds: recordDuration,
      notes: teardownNotes.trim(),
    });
  };

  const handleSaveToVault = () => {
    if (!videoBlobUrl && !teardownNotes.trim()) {
      toast.error("Record something or write teardown notes before saving.");
      return;
    }
    saveSessionMutation.mutate({
      title: recordingTitle.trim() || `Client Teardown (${new Date().toLocaleDateString()})`,
      durationSeconds: recordDuration,
      sizeBytes: recordedBlob?.size ?? 0,
      notes: teardownNotes.trim() || null,
      aiBrief: aiBrief,
      aiBriefModel: aiBriefModel,
    });
  };

  const loadSessionVideo = async (rec: TeardownSessionRow) => {
    if (!rec.hasVideo) {
      toast.info("This session has no stored video (metadata/brief only).");
      return;
    }
    setIsLoadingVideo(true);
    try {
      const res = await fetch(`/api/teardown/${rec.id}/video`, {
        credentials: "include",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Load failed (${res.status})`);
      }
      const blob = await res.blob();
      setVideoBlobUrl(URL.createObjectURL(blob));
      setRecordedBlob(blob);
      setRecordingTitle(rec.title);
      setTeardownNotes(rec.notes || "");
      setAiBrief(rec.aiBrief);
      setLoadedSessionId(rec.id);
      toast.success(`Loaded "${rec.title}" — playing stored recording.`);
    } catch (err: any) {
      toast.error(`Could not load recording: ${err?.message ?? "unknown error"}`);
    } finally {
      setIsLoadingVideo(false);
    }
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
                Record 2-minute async diagnostic video teardowns, client onboarding walkthroughs, and screen audits — recordings and AI briefs persist server-side.
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
              ) : isLoadingVideo ? (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
                  <span className="text-xs">Loading stored recording…</span>
                </div>
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
                    disabled={saveSessionMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {saveSessionMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    {saveSessionMutation.isPending ? "Saving…" : "Save to Vault"}
                  </button>
                </div>
              </div>
            )}

            {/* Persisted Teardown Library */}
            <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-rose-400" />
                  Teardown Library
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Saved to the server — recordings and briefs survive refresh
                </span>
              </div>

              <div className="space-y-2">
                {savedRecordings.isLoading && (
                  <div className="p-4 text-center text-[11px] text-muted-foreground">
                    Loading saved sessions…
                  </div>
                )}
                {savedRecordings.isError && (
                  <div className="p-4 text-center text-[11px] text-red-400">
                    Could not load saved sessions — check your connection and try again.
                  </div>
                )}
                {!savedRecordings.isLoading && !savedRecordings.isError && savedRecordings.data?.length === 0 && (
                  <div className="p-4 text-center text-[11px] text-muted-foreground">
                    No teardown sessions saved yet. Record something, then click
                    "Save to Vault" — sessions persist server-side, not just in this browser.
                  </div>
                )}
                {savedRecordings.data?.map((rec) => (
                  <div
                    key={rec.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border transition-colors gap-2 ${
                      loadedSessionId === rec.id
                        ? "border-rose-500/50 bg-rose-500/5"
                        : "border-border/80 bg-zinc-950/40 hover:bg-zinc-900/60"
                    }`}
                  >
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="text-xs font-semibold text-foreground flex items-center gap-2 flex-wrap">
                        <Film className="w-3.5 h-3.5 text-rose-400" />
                        {rec.title}
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                          {formatTime(rec.durationSeconds)}
                        </span>
                        {rec.hasBrief && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            AI brief
                          </span>
                        )}
                        {!rec.hasVideo && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                            notes only
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {rec.aiBrief || rec.notes || "No notes recorded."}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                      <span>{formatSize(rec.sizeBytes)}</span>
                      <span>•</span>
                      <span>{rec.createdAt.slice(0, 10)}</span>
                      {rec.hasVideo && (
                        <button
                          onClick={() => loadSessionVideo(rec)}
                          className="flex items-center gap-1 px-2 py-1 rounded-md border border-border bg-card hover:bg-muted text-[11px] text-foreground transition-colors"
                          title="Load and play this recording"
                        >
                          <Play className="w-3 h-3 text-emerald-400" />
                          Load
                        </button>
                      )}
                      <button
                        onClick={() => deleteSessionMutation.mutate({ sessionId: rec.id })}
                        className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                        title="Delete this session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
                  disabled={summarizeMutation.isPending}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-600 hover:to-amber-700 text-white text-[11px] font-medium shadow transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3" />
                  {summarizeMutation.isPending ? "Analyzing..." : "Synthesize AI Brief"}
                </button>
              </div>

              <textarea
                placeholder="Describe what happens in the recording — the AI brief is generated from these notes (e.g. 'Walked through their current booking flow; manual data entry between the form and the CRM; they asked about automating confirmations.')"
                value={teardownNotes}
                onChange={(e) => setTeardownNotes(e.target.value)}
                rows={4}
                className="w-full bg-zinc-950/80 border border-border/60 rounded-lg p-2.5 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-rose-500 resize-none"
              />

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
                      Write notes about your recording, then "Synthesize AI Brief"
                      generates a structured summary grounded in what you describe —
                      no invented timestamps or findings.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Recordings stored in your own database — no third-party video hosting</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
