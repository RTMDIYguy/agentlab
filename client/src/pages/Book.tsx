import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  BookOpen,
  Star,
  ShoppingCart,
  Mail,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  ChevronRight,
  ChevronLeft,
  Search,
  ExternalLink,
  Printer,
  Sparkles,
  CheckSquare,
  Square,
  Layers,
  ArrowLeft,
  Clock,
  ShieldCheck,
  Bookmark,
  Sun,
  Moon,
  Coffee,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BOOKS_REGISTRY, BookEdition, Chapter } from "@/data/booksData";

const emailSchema = z.object({
  email: z.string().email("Valid email required"),
});
type EmailForm = z.infer<typeof emailSchema>;

const testimonials = [
  {
    name: "Marcus T.",
    role: "First-time founder",
    quote:
      "I picked 3 models from the book and had revenue in 6 weeks. No investors, no loans.",
  },
  {
    name: "Lena M.",
    role: "Corporate refugee",
    quote:
      "This is the most practical guide I've read. Every model has a real path to cash.",
  },
  {
    name: "Deon W.",
    role: "Side hustler → full-time",
    quote:
      "Stopped overthinking and started. That's what this book does for you.",
  },
];

export default function Book() {
  const [location, setLocation] = useLocation();

  // Parse URL query parameters
  const queryParams = useMemo(() => {
    const search = window.location.search;
    return new URLSearchParams(search);
  }, [location]);

  const initialBookId = (queryParams.get("book") || queryParams.get("id") || "soe") as "soe" | "bgw";
  const initialMode = queryParams.get("mode") === "sales" ? "sales" : "reader";

  const [activeTab, setActiveTab] = useState<"reader" | "sales">(initialMode);
  const [selectedBookId, setSelectedBookId] = useState<"soe" | "bgw">(
    BOOKS_REGISTRY[initialBookId] ? initialBookId : "soe"
  );
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("base");
  const [readerTheme, setReaderTheme] = useState<"dark" | "light" | "sepia">("dark");
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});

  // Audio Speech state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAudioPaused, setIsAudioPaused] = useState(false);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const currentBook: BookEdition = BOOKS_REGISTRY[selectedBookId] || BOOKS_REGISTRY.soe;
  const currentChapter: Chapter =
    currentBook.chapters[selectedChapterIndex] || currentBook.chapters[0];

  // Stop audio when changing chapters or unmounting
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setIsAudioPaused(false);
  }, [selectedBookId, selectedChapterIndex]);

  // Sync state if URL search params change
  useEffect(() => {
    const bookParam = queryParams.get("book") || queryParams.get("id");
    if (bookParam && (bookParam === "soe" || bookParam === "bgw")) {
      setSelectedBookId(bookParam);
    }
    const modeParam = queryParams.get("mode");
    if (modeParam === "sales" || modeParam === "reader") {
      setActiveTab(modeParam);
    }
    const chapterId = queryParams.get("chapter");
    if (chapterId && currentBook) {
      const idx = currentBook.chapters.findIndex(c => c.id === chapterId);
      if (idx !== -1) setSelectedChapterIndex(idx);
    }
  }, [queryParams]);

  const toggleActionItem = (id: string) => {
    setCompletedActions(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAudioPlay = () => {
    if (!("speechSynthesis" in window)) {
      toast.error("Text-to-Speech is not supported in this browser.");
      return;
    }

    if (isAudioPaused) {
      window.speechSynthesis.resume();
      setIsAudioPaused(false);
      setIsPlayingAudio(true);
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.pause();
      setIsAudioPaused(true);
      return;
    }

    window.speechSynthesis.cancel();

    // Combine chapter content text
    const fullText = [
      currentChapter.title,
      currentChapter.subtitle,
      currentChapter.summary,
      ...currentChapter.sections.map(
        s => `${s.heading}. ${s.content.join(" ")} ${s.callout ? s.callout.text : ""}`
      ),
      "Key Takeaways: " + currentChapter.keyTakeaways.join(". "),
    ].join(". ");

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsPlayingAudio(false);
      setIsAudioPaused(false);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setIsAudioPaused(false);
      toast.error("Audio playback error.");
    };

    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
    setIsAudioPaused(false);
    toast.info(`Reading aloud: ${currentChapter.title}`);
  };

  const handleAudioStop = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setIsAudioPaused(false);
  };

  // Free chapter & Stripe mutations for Sales tab
  const [chapterSent, setChapterSent] = useState(false);
  const [loadingFreeChapter, setLoadingFreeChapter] = useState(false);

  const createBookCheckout = trpc.stripe.createBookCheckout.useMutation({
    onSuccess: (data: { checkoutUrl: string }) => {
      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: () => {
      toast.error("Couldn't open checkout. Please try again.");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });

  const onFreeChapter = async (data: EmailForm) => {
    setLoadingFreeChapter(true);
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          source: "AgentLab Website - Book Free Chapter",
          serviceLine: "Book Free Chapter",
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setChapterSent(true);
      toast.success("Check your inbox — free chapter is on the way!");
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoadingFreeChapter(false);
    }
  };

  const filteredChapters = useMemo(() => {
    if (!searchQuery.trim()) return currentBook.chapters;
    return currentBook.chapters.filter(
      c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.summary.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentBook, searchQuery]);

  const fontSizeClass = {
    sm: "text-sm leading-relaxed",
    base: "text-base leading-relaxed",
    lg: "text-lg leading-loose",
    xl: "text-xl leading-loose",
  }[fontSize];

  const readerThemeStyles = {
    dark: "bg-slate-950 text-slate-100 border-slate-800",
    light: "bg-white text-slate-900 border-slate-200",
    sepia: "bg-[#fbf0d9] text-[#433422] border-[#e7d8be]",
  }[readerTheme];

  const readerPanelStyles = {
    dark: "bg-slate-900/60 border-slate-800/80 text-slate-300",
    light: "bg-slate-50 border-slate-200 text-slate-700",
    sepia: "bg-[#f4e6c9] border-[#e2cfab] text-[#54422e]",
  }[readerTheme];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header & Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/dashboard")}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              OS Dashboard
            </Button>
            <div className="h-4 w-[1px] bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm sm:text-base tracking-tight">
                AgentLab Reader
              </span>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2">
            <Tabs
              value={activeTab}
              onValueChange={v => setActiveTab(v as "reader" | "sales")}
              className="w-auto"
            >
              <TabsList className="h-9">
                <TabsTrigger value="reader" className="text-xs gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  Interactive Reader
                </TabsTrigger>
                <TabsTrigger value="sales" className="text-xs gap-1.5">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Book Store & Details
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {activeTab === "reader" ? (
        <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
          {/* Left Sidebar: Book Selector & Table of Contents */}
          <aside className="w-full md:w-80 shrink-0 space-y-4">
            {/* Book Selector Dropdown Card */}
            <Card className="border shadow-sm">
              <CardHeader className="p-4 pb-3">
                <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Select Edition
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2">
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => {
                      setSelectedBookId("soe");
                      setSelectedChapterIndex(0);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedBookId === "soe"
                        ? "border-amber-500 bg-amber-500/10 shadow-sm"
                        : "border-border hover:bg-accent/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground">
                        Startup Operational Excellence
                      </span>
                      <Badge className="text-[9px] bg-amber-500 text-black font-bold">
                        Included
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                      Zero-Drift Agency Operating Doctrine
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedBookId("bgw");
                      setSelectedChapterIndex(0);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedBookId === "bgw"
                        ? "border-cyan-500 bg-cyan-500/10 shadow-sm"
                        : "border-border hover:bg-accent/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground">
                        Bootstrapper's Guide to the World
                      </span>
                      <Badge variant="outline" className="text-[9px] text-cyan-400 border-cyan-500/30">
                        28 Models
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                      Zero-Capital Founder Compendium
                    </p>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Table of Contents */}
            <Card className="border shadow-sm">
              <CardHeader className="p-4 pb-3 space-y-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Table of Contents
                  </CardTitle>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {currentBook.chapters.length} Chapters
                  </span>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Filter chapters..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 text-xs bg-muted/40"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-2 max-h-[calc(100vh-360px)] overflow-y-auto space-y-1">
                {filteredChapters.map((chapter, idx) => {
                  const actualIndex = currentBook.chapters.findIndex(c => c.id === chapter.id);
                  const isSelected = actualIndex === selectedChapterIndex;
                  return (
                    <button
                      key={chapter.id}
                      onClick={() => setSelectedChapterIndex(actualIndex)}
                      className={`w-full p-2.5 rounded-lg text-left transition-colors flex items-start gap-2.5 ${
                        isSelected
                          ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono shrink-0 ${
                          isSelected
                            ? "bg-primary-foreground/20 text-primary-foreground font-bold"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {chapter.number === 0 ? "P" : chapter.number}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium truncate">{chapter.title}</div>
                        <div
                          className={`text-[10px] mt-0.5 truncate ${
                            isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                          }`}
                        >
                          {chapter.readTime}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Quick External Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs gap-1.5"
                onClick={() => window.open(currentBook.gumroadUrl, "_blank")}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Gumroad Storefront
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs gap-1.5"
                onClick={() => window.print()}
              >
                <Printer className="w-3.5 h-3.5" />
                Print / PDF
              </Button>
            </div>
          </aside>

          {/* Right Area: Interactive Reading Canvas */}
          <main className="flex-1 min-w-0 flex flex-col space-y-4">
            {/* Reading Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border bg-card/60 shadow-sm">
              {/* Audio Read-Aloud Controls */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={isPlayingAudio ? "default" : "outline"}
                  onClick={handleAudioPlay}
                  className="h-8 text-xs gap-1.5 font-medium"
                >
                  {isPlayingAudio ? (
                    <Pause className="w-3.5 h-3.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                  <span>{isPlayingAudio ? "Pause Audio" : isAudioPaused ? "Resume Audio" : "Listen (TTS)"}</span>
                </Button>
                {(isPlayingAudio || isAudioPaused) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleAudioStop}
                    className="h-8 text-xs px-2 text-muted-foreground hover:text-foreground"
                    title="Stop Audio"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>

              {/* Reader Preferences (Font & Theme) */}
              <div className="flex items-center gap-3">
                {/* Font Size Selector */}
                <div className="flex items-center border rounded-lg p-0.5 bg-muted/40">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => {
                      if (fontSize === "xl") setFontSize("lg");
                      else if (fontSize === "lg") setFontSize("base");
                      else if (fontSize === "base") setFontSize("sm");
                    }}
                    title="Decrease font size"
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </Button>
                  <span className="text-[11px] font-mono px-1.5 uppercase">{fontSize}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => {
                      if (fontSize === "sm") setFontSize("base");
                      else if (fontSize === "base") setFontSize("lg");
                      else if (fontSize === "lg") setFontSize("xl");
                    }}
                    title="Increase font size"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Theme Selector */}
                <div className="flex items-center border rounded-lg p-0.5 bg-muted/40">
                  <Button
                    variant={readerTheme === "dark" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setReaderTheme("dark")}
                    title="Dark Cockpit Mode"
                  >
                    <Moon className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant={readerTheme === "sepia" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-7 w-7 text-amber-700 dark:text-amber-500"
                    onClick={() => setReaderTheme("sepia")}
                    title="Warm Sepia Mode"
                  >
                    <Coffee className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant={readerTheme === "light" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setReaderTheme("light")}
                    title="Clean Light Mode"
                  >
                    <Sun className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Document Content View */}
            <article className={`flex-1 rounded-2xl border p-6 sm:p-10 shadow-sm transition-colors ${readerThemeStyles}`}>
              {/* Chapter Header */}
              <div className="border-b pb-6 mb-8 border-current/15">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-xs font-mono border-current/20">
                    {currentBook.title}
                  </Badge>
                  <span className="text-xs opacity-60">•</span>
                  <div className="flex items-center gap-1 text-xs opacity-75 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    {currentChapter.readTime}
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                  {currentChapter.title}
                </h1>
                <p className="text-base sm:text-lg opacity-80 font-medium leading-snug">
                  {currentChapter.subtitle}
                </p>
              </div>

              {/* Executive Summary Callout */}
              <div className={`p-4 sm:p-5 rounded-xl border mb-8 ${readerPanelStyles}`}>
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider mb-1.5 opacity-90">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Executive Summary
                </div>
                <p className="text-sm leading-relaxed opacity-95">
                  {currentChapter.summary}
                </p>
              </div>

              {/* Chapter Body Sections */}
              <div className={`space-y-8 ${fontSizeClass}`}>
                {currentChapter.sections.map((section, sIdx) => (
                  <section key={sIdx} className="space-y-4">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight border-b pb-2 border-current/10">
                      {section.heading}
                    </h2>
                    {section.content.map((paragraph, pIdx) => (
                      <p key={pIdx} className="opacity-90">
                        {paragraph}
                      </p>
                    ))}

                    {/* Section Callout Box if present */}
                    {section.callout && (
                      <div
                        className={`p-4 rounded-xl border-l-4 my-4 ${
                          section.callout.type === "warning"
                            ? "bg-rose-500/10 border-rose-500 text-rose-300 dark:text-rose-200"
                            : section.callout.type === "framework"
                            ? "bg-cyan-500/10 border-cyan-500 text-cyan-300 dark:text-cyan-200"
                            : section.callout.type === "quote"
                            ? "bg-purple-500/10 border-purple-500 text-purple-300 dark:text-purple-200 italic"
                            : "bg-amber-500/10 border-amber-500 text-amber-300 dark:text-amber-200"
                        }`}
                      >
                        <div className="font-bold text-xs uppercase tracking-wider mb-1">
                          {section.callout.title}
                        </div>
                        <p className="text-sm opacity-95">{section.callout.text}</p>
                      </div>
                    )}
                  </section>
                ))}
              </div>

              {/* Key Takeaways Card */}
              <div className={`mt-10 p-6 rounded-xl border ${readerPanelStyles}`}>
                <h3 className="text-base font-bold flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Core Operational Takeaways
                </h3>
                <ul className="space-y-2">
                  {currentChapter.keyTakeaways.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                      <span className="opacity-90">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Checklist */}
              <div className={`mt-6 p-6 rounded-xl border ${readerPanelStyles}`}>
                <h3 className="text-base font-bold flex items-center gap-2 mb-3">
                  <CheckSquare className="w-5 h-5 text-cyan-400" />
                  Implementation Action Checklist
                </h3>
                <div className="space-y-2.5">
                  {currentChapter.actionChecklist.map((action, idx) => {
                    const actionId = `${currentChapter.id}-act-${idx}`;
                    const isChecked = !!completedActions[actionId];
                    return (
                      <button
                        key={idx}
                        onClick={() => toggleActionItem(actionId)}
                        className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-current/5 text-left transition-colors"
                      >
                        {isChecked ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <Square className="w-4 h-4 opacity-50 shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm ${isChecked ? "line-through opacity-50" : "opacity-90"}`}>
                          {action}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Pagination Controls */}
              <div className="mt-10 pt-6 border-t border-current/15 flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={selectedChapterIndex === 0}
                  onClick={() => setSelectedChapterIndex(prev => Math.max(0, prev - 1))}
                  className="text-xs gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous Chapter
                </Button>

                <span className="text-xs font-mono opacity-60">
                  Chapter {selectedChapterIndex + 1} of {currentBook.chapters.length}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={selectedChapterIndex >= currentBook.chapters.length - 1}
                  onClick={() =>
                    setSelectedChapterIndex(prev => Math.min(currentBook.chapters.length - 1, prev + 1))
                  }
                  className="text-xs gap-1.5"
                >
                  Next Chapter
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </article>
          </main>
        </div>
      ) : (
        /* Sales / Overview Tab Mode */
        <div className="flex-1">
          {/* Hero */}
          <section className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white py-16 px-4">
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Badge className="mb-4 bg-white/10 text-white border-white/20 hover:bg-white/20">
                  28 Businesses. $0 Investment.
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                  Bootstrapper's Guide to the World
                </h1>
                <p className="text-lg text-neutral-300 mb-6">
                  Start 28 profitable businesses with zero upfront investment. Each
                  model is proven, practical, and designed for people with more
                  hustle than capital.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    className="bg-white text-neutral-900 hover:bg-neutral-100"
                    onClick={() => createBookCheckout.mutate()}
                    disabled={createBookCheckout.isPending}
                  >
                    {createBookCheckout.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ShoppingCart className="h-4 w-4 mr-2" />
                    )}
                    Buy Now — $59.99
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                    onClick={() => setActiveTab("reader")}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Open Digital Reader
                  </Button>
                </div>
                <div className="flex items-center gap-1 mt-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                  <span className="text-sm text-neutral-400 ml-2">
                    4.9 · 200+ readers
                  </span>
                </div>
              </motion.div>

              {/* Book cover visual */}
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <div className="w-60 h-80 rounded-2xl shadow-2xl bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-900 p-6 flex flex-col justify-between border border-white/20">
                  <div>
                    <Badge className="bg-white/20 text-white text-[10px]">
                      Robert T. McCarthy
                    </Badge>
                    <h3 className="text-white font-black text-xl mt-4 leading-tight">
                      Bootstrapper's Guide to the World
                    </h3>
                    <p className="text-white/80 text-xs mt-2">
                      28 Zero-Capital Business Engines
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/20">
                    <BookOpen className="h-6 w-6 text-white" />
                    <span className="text-white font-mono text-xs font-bold">$59.99</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Free chapter CTA */}
          <section className="py-16 px-4 bg-muted/40">
            <div className="max-w-md mx-auto text-center">
              <Mail className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Get a Free Chapter</h2>
              <p className="text-muted-foreground mb-6">
                Read the first chapter directly in the interactive reader or receive it via email.
              </p>

              {chapterSent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-3"
                >
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                  <p className="font-medium">Chapter sent! Check your inbox.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onFreeChapter)} className="space-y-3">
                  <div>
                    <Label htmlFor="email" className="sr-only">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loadingFreeChapter}
                  >
                    {loadingFreeChapter ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4 mr-2" />
                    )}
                    Send Me the Free Chapter
                  </Button>
                </form>
              )}
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-16 px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-10">
                What Readers Say
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {testimonials.map((t, i) => (
                  <motion.div
                    key={t.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="h-full">
                      <CardContent className="pt-6">
                        <div className="flex mb-3">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star
                              key={j}
                              className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 italic">
                          "{t.quote}"
                        </p>
                        <div>
                          <p className="font-semibold text-sm">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.role}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
