import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Zap, 
  Target, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Calendar, 
  FileText, 
  Users, 
  TrendingUp, 
  Sparkles, 
  ShieldCheck,
  ChevronRight,
  BookOpen,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function FounderSignalSystem() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    company: "",
    icp: "",
    primaryGoal: "Validate core messaging and start first outreach sequence"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isGodmode = user?.role === "admin" || (user as any)?.name === "Thebossrob" || (user as any)?.username === "bossrob";

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsBookingOpen(false);
      toast.success("Diagnostic Call Requested!", {
        description: "Robert will review your signal profile and reach out within 24 hours."
      });
    }, 900);
  };

  const sprintDays = [
    {
      day: "Day 1",
      title: "Signal Brief",
      subtitle: "ICP & Core Pain Definition",
      desc: "Distill who you are truly for and what painful, urgent problem you solve. Eliminates fuzzy positioning.",
      icon: Target,
      badge: "Strategy"
    },
    {
      day: "Day 2",
      title: "Message Map",
      subtitle: "Value Proposition & Offer Wedges",
      desc: "Map your unique domain authority into punchy, jargon-free talking points that speak directly to founders.",
      icon: FileText,
      badge: "Messaging"
    },
    {
      day: "Day 3",
      title: "First Content Batch",
      subtitle: "3 High-Signal Authority Posts",
      desc: "Draft and polish your first batch of founder-led content ready for immediate syndication on LinkedIn.",
      icon: Sparkles,
      badge: "Creation"
    },
    {
      day: "Day 4",
      title: "Outreach Sequence",
      subtitle: "1-on-1 Human Outreach Matrix",
      desc: "Build a non-spammy, high-leverage peer-to-peer outreach sequence designed to start authentic conversations.",
      icon: Users,
      badge: "Distribution"
    },
    {
      day: "Day 5",
      title: "Proof-Capture Loop",
      subtitle: "Live Signal & Feedback Tracking",
      desc: "Deploy a lightweight response tracker (Google Sheets/n8n) so every reaction, reply, and referral builds momentum.",
      icon: TrendingUp,
      badge: "Measurement"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Breadcrumb Navigation */}
      <header className="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/marketplace" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              Marketplace
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">Founder Signal System</span>
          </div>
          <div className="flex items-center gap-2">
            {isGodmode && (
              <Badge variant="outline" className="text-amber-500 border-amber-500/30 text-[10px]">
                Godmode Active
              </Badge>
            )}
            <Button size="sm" onClick={() => setIsBookingOpen(true)} className="gap-1.5 shadow-sm">
              <Calendar className="w-4 h-4" />
              Book Diagnostic ($1k Sprint)
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 border-b border-border bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6 animate-pulse">
            <Zap className="w-3.5 h-3.5" />
            <span>Turnkey 3–5 Day Starter Marketing Sprint</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
            Know Exactly Who You're For, What to Say, and Where to Say It.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Stop guessing with your messaging. In one week, we extract your deep domain expertise, build your signal brief, draft your first content batch, and wire up your proof-capture loop.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" onClick={() => setIsBookingOpen(true)} className="gap-2 px-8 shadow-md">
              <Calendar className="w-4 h-4" />
              Book 30-Min Diagnostic
            </Button>

            <Link href="/marketplace">
              <Button size="lg" variant="outline" className="gap-2">
                Back to Marketplace
              </Button>
            </Link>

            {isGodmode && (
              <Button 
                size="lg" 
                variant="secondary" 
                className="gap-2 text-primary"
                onClick={() => {
                  toast.info("Opening internal Founder Signal System workflow template...");
                  setLocation("/command-center");
                }}
              >
                <BookOpen className="w-4 h-4" />
                Launch Internal Playbook
              </Button>
            )}
          </div>

          {/* Value Props Strip */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-border/60">
            <div className="p-3 text-left">
              <div className="text-2xl font-black text-foreground">$1,000</div>
              <div className="text-xs text-muted-foreground mt-0.5">One-time turnkey sprint</div>
            </div>
            <div className="p-3 text-left">
              <div className="text-2xl font-black text-foreground">3–5 Days</div>
              <div className="text-xs text-muted-foreground mt-0.5">Rapid end-to-end delivery</div>
            </div>
            <div className="p-3 text-left">
              <div className="text-2xl font-black text-foreground">100% You</div>
              <div className="text-xs text-muted-foreground mt-0.5">You own all assets & data</div>
            </div>
            <div className="p-3 text-left">
              <div className="text-2xl font-black text-foreground">Zero Fluff</div>
              <div className="text-xs text-muted-foreground mt-0.5">Evidence-driven proof loop</div>
            </div>
          </div>
        </div>
      </section>

      {/* The 5-Day Sprint Architecture */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-2 text-xs">The 5-Day Execution Plan</Badge>
          <h2 className="text-3xl font-extrabold text-foreground">What We Deliver Together</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
            You invest 60–90 minutes a day for one week. We build your entire marketing wedge so you never start from zero again.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sprintDays.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card key={idx} className="border border-border/80 hover:border-primary/50 transition-all bg-card/60 backdrop-blur flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                      {item.day}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      {item.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Icon className="w-5 h-5 text-primary" />
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-xs font-medium text-foreground/80">
                    {item.subtitle}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            );
          })}

          {/* Summary Card */}
          <Card className="border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-card to-card flex flex-col justify-between p-6">
            <div>
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-4 text-primary">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">What Happens After?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You own the complete package. Run it yourself, upgrade to monthly proof reviews, or plug in our automated LinkedIn & CRM engines.
              </p>
            </div>
            <Button size="sm" onClick={() => setIsBookingOpen(true)} className="mt-6 w-full gap-1.5 shadow">
              <Calendar className="w-3.5 h-3.5" />
              Schedule Intake Call
            </Button>
          </Card>
        </div>
      </section>

      {/* Booking Modal */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5 text-primary" />
              Book Founder Signal Diagnostic
            </DialogTitle>
            <DialogDescription className="text-xs">
              Fill out this quick 60-second diagnostic. Robert McCarthy will review your background before our 30-minute alignment call.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBookingSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs">Your Name</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  placeholder="Robert McCarthy" 
                  required 
                  className="h-8 text-xs" 
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs">Work Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({ ...formData, email: e.target.value })} 
                  placeholder="robert@agency.com" 
                  required 
                  className="h-8 text-xs" 
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="company" className="text-xs">Company / Agency Name</Label>
              <Input 
                id="company" 
                value={formData.company} 
                onChange={e => setFormData({ ...formData, company: e.target.value })} 
                placeholder="Tactix / Uncle Robert Consulting" 
                required 
                className="h-8 text-xs" 
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="icp" className="text-xs">Who is your current target client (ICP)?</Label>
              <Input 
                id="icp" 
                value={formData.icp} 
                onChange={e => setFormData({ ...formData, icp: e.target.value })} 
                placeholder="e.g. Solo SaaS founders, boutique agency operators (1-10 people)" 
                required 
                className="h-8 text-xs" 
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="goals" className="text-xs">What is your primary bottleneck right now?</Label>
              <Textarea 
                id="goals" 
                value={formData.primaryGoal} 
                onChange={e => setFormData({ ...formData, primaryGoal: e.target.value })} 
                rows={3} 
                className="text-xs resize-none" 
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsBookingOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="gap-1.5 shadow">
                {isSubmitting ? "Submitting..." : "Confirm Diagnostic Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
