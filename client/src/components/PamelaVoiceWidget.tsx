import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Mic,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Calendar,
  MessageSquare,
  Play,
  Pause,
  ArrowRight,
  Headphones
} from "lucide-react";
import { toast } from "sonner";

interface PamelaPrompt {
  id: string;
  label: string;
  response: string;
}

const CANONICAL_PAMELA_PROMPTS: PamelaPrompt[] = [
  {
    id: "diagnostic",
    label: "What is the 15-Minute Diagnostic?",
    response:
      "The 15-Minute Operational Diagnostic is a free, high-density architecture session where Robert audits your existing tool stack, identifies where SaaS sprawl is draining profit, and maps out a clean Microsoft 365 or Agentic OS operating path.",
  },
  {
    id: "m365",
    label: "How does URC replace SaaS sprawl?",
    response:
      "Most businesses pay thousands per month across Zapier, Airtable, and multiple CRMs for features they already own inside Microsoft 365. We migrate your workflows into a unified, secure M365 architecture powered by autonomous agent swarms.",
  },
  {
    id: "book",
    label: "How do I schedule a session with Robert?",
    response:
      "You can book directly into Robert's calendar anytime through our diagnostic portal. I will open the schedule for you now so you can pick a time that works best!",
  },
];

export function PamelaVoiceWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSpeechText, setActiveSpeechText] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<PamelaPrompt | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleSpeak = async (text: string) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      setIsLoadingAudio(true);
      setActiveSpeechText(text);

      const res = await fetch("/api/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error("Failed to synthesize voice with Pamela.");
      }

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        setActiveSpeechText(null);
      };
      audio.onerror = () => {
        setIsPlaying(false);
        setActiveSpeechText(null);
        toast.error("Audio playback encountered an error.");
      };

      await audio.play();
    } catch (err: any) {
      toast.error(err.message || "Failed to play voice response.");
      setIsPlaying(false);
      setActiveSpeechText(null);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handleStopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setActiveSpeechText(null);
  };

  const handlePromptSelect = (prompt: PamelaPrompt) => {
    setSelectedPrompt(prompt);
    handleSpeak(prompt.response);
  };

  return (
    <>
      {/* Floating Action Button - Positioned alongside Ops Agent */}
      <div className="fixed bottom-6 right-24 z-40">
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            className="h-13 px-4 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-2xl border border-purple-400/40 flex items-center gap-2.5 transition-transform hover:scale-105 active:scale-95 group"
          >
            <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-white/20">
              <Sparkles className="w-3.5 h-3.5 text-purple-200 animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold leading-tight">Pamela</div>
              <div className="text-[9px] text-purple-200/80 font-mono">Voice Concierge</div>
            </div>
          </Button>
        )}
      </div>

      {/* Expanded Interactive Voice Modal */}
      {isOpen && (
        <div className="fixed bottom-22 right-6 z-50 w-[92vw] max-w-sm sm:max-w-md animate-in fade-in slide-in-from-bottom-5">
          <Card className="border border-purple-500/30 bg-card/95 backdrop-blur-xl shadow-2xl p-5 sm:p-6 space-y-4 rounded-2xl">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-border/80 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-foreground">Pamela</h3>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px]">
                      ElevenLabs Voice AI
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Robert's Operations & Strategy Concierge
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  handleStopAudio();
                  setIsOpen(false);
                }}
                className="h-8 w-8 p-0 rounded-full hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Visualizer / Status Area */}
            <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-950/20 flex flex-col items-center justify-center space-y-2 text-center">
              <div className="flex items-center gap-1.5 h-6">
                {isPlaying ? (
                  <>
                    <span className="w-1 h-3 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1 h-6 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1 h-4 bg-blue-400 rounded-full animate-bounce"></span>
                    <span className="w-1 h-7 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.25s]"></span>
                    <span className="w-1 h-3 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.1s]"></span>
                  </>
                ) : (
                  <span className="text-xs font-mono text-muted-foreground">
                    {isLoadingAudio ? "Synthesizing Pamela's Voice..." : "Ready to speak • Choose a question below"}
                  </span>
                )}
              </div>

              {activeSpeechText && (
                <p className="text-xs text-foreground/90 italic line-clamp-3 px-2">
                  "{activeSpeechText}"
                </p>
              )}

              {isPlaying && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleStopAudio}
                  className="h-7 text-[10px] font-bold border-red-500/30 text-red-400 hover:bg-red-500/10 gap-1.5 mt-1"
                >
                  <VolumeX className="w-3.5 h-3.5" /> Stop Speaking
                </Button>
              )}
            </div>

            {/* Quick Interactive Prompt Options */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-muted-foreground block">
                Tap to hear Pamela explain:
              </span>
              <div className="space-y-1.5">
                {CANONICAL_PAMELA_PROMPTS.map((p) => (
                  <button
                    key={p.id}
                    disabled={isLoadingAudio}
                    onClick={() => handlePromptSelect(p)}
                    className="w-full text-left p-2.5 rounded-lg border border-border/70 hover:border-purple-500/40 bg-background/50 hover:bg-purple-500/5 transition-colors flex items-center justify-between group text-xs"
                  >
                    <span className="font-medium text-foreground group-hover:text-purple-300">
                      {p.label}
                    </span>
                    <Volume2 className="w-3.5 h-3.5 text-muted-foreground group-hover:text-purple-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Calendar CTA */}
            <div className="pt-2 border-t border-border/80 flex items-center justify-between">
              <a
                href="https://calendar.app.google/your-booking-link"
                target="_blank"
                rel="noreferrer"
                className="w-full"
              >
                <Button
                  size="sm"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-2 shadow"
                >
                  <Calendar className="w-3.5 h-3.5" /> Book 15-Min Strategy Session
                  <ArrowRight className="w-3 h-3 ml-auto" />
                </Button>
              </a>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
