import React, { useState } from "react";
import { Link } from "wouter";
import {
  Sparkles,
  CalendarCheck2,
  Clock,
  UserCheck,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  HeartHandshake,
  Bot,
  MessageCircle,
  Activity,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Navigation } from "@/components/Navigation";

export default function MedSpaCampaign() {
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    practiceName: "",
    monthlyInquiries: "50–150 leads/mo"
  });

  const [deliveredDiagnostic, setDeliveredDiagnostic] = useState<any>(null);

  const handleDiagnosticSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/campaigns/outreach/medspa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      if (!res.ok) {
        throw new Error("Failed to generate diagnostic");
      }

      const data = await res.json();
      setDeliveredDiagnostic(data);
      toast.success("Practice Diagnostic Generated!", {
        description: `Patient Flow Audit created for ${formState.practiceName || "your practice"} (Est. Recovery: ${data.recoveredRevenueEst}).`,
      });
    } catch {
      toast.error("Failed to request diagnostic. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09080E] text-slate-100 selection:bg-rose-500 selection:text-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden border-b border-rose-950/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-rose-950/25 via-transparent to-transparent pointer-events-none" />
        
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            
            {/* Left Column: Copy */}
            <div className="flex-1 space-y-6 text-center lg:text-left">
              <Badge className="bg-rose-500/10 text-rose-300 border border-rose-500/30 px-3 py-1 font-mono text-xs uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-rose-400" />
                MedSpa Growth Engine · Autonomous Patient Acquisition
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Turn Inquiries Into <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-pink-300 to-amber-200">
                  Pre-Paid VIP Bookings
                </span>
                <br />
                In Under 60 Seconds.
              </h1>

              <p className="text-lg text-slate-300 max-w-xl leading-relaxed">
                Never lose another high-ticket aesthetic consultation to slow follow-up. Our 24/7 AI Reception agent responds instantly, qualifies treatment intent, and books consultations directly onto your injectors' calendars.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <Button 
                  size="lg" 
                  onClick={() => setIsDiagnosticOpen(true)}
                  className="w-full sm:w-auto bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-semibold shadow-lg shadow-rose-500/20 px-8"
                >
                  <CalendarCheck2 className="w-4 h-4 mr-2" />
                  Request Practice Flow Audit
                </Button>
                <Link href="/command-center">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-200">
                    <Activity className="w-4 h-4 mr-2 text-rose-400" />
                    View Live Intake Swarm
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-4 text-xs font-mono text-slate-400 justify-center lg:justify-start">
                <span className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-rose-400" /> &lt;60s Speed to Lead</span>
                <span className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-rose-400" /> Automated Deposit Collection</span>
                <span className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-rose-400" /> Zero Extra Front-Desk Burden</span>
              </div>
            </div>

            {/* Right Column: Aesthetic Flow Mockup */}
            <div className="flex-1 w-full max-w-lg">
              <div className="relative rounded-2xl p-6 border border-rose-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-[#120D17] shadow-2xl shadow-rose-950/40">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-xs font-mono text-rose-300">LIVE PATIENT INTAKE STREAM</span>
                  </div>
                  <Badge className="bg-rose-500/20 text-rose-300 text-xs">99.4% Booking Rate</Badge>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                    <p className="text-slate-400">11:42 AM · New Web Inquiry</p>
                    <p className="text-white font-semibold">"Looking for Morpheus8 full-face package pricing & availability."</p>
                  </div>

                  <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-200">
                    <p className="text-rose-400 flex items-center"><Bot className="w-3.5 h-3.5 mr-1" /> AI Response (14s latency)</p>
                    <p className="text-slate-200 mt-1">"Hi Sarah! Our Master Esthetician has 2 consult openings this Thursday at 2:00 PM and 4:30 PM. Would you like me to lock in the 2:00 PM slot for you?"</p>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 flex items-center justify-between">
                    <span>STATUS: CONSULTATION CONFIRMED</span>
                    <span className="font-bold text-white">$150 Deposit Secured</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3 Pillars */}
      <section className="py-20 bg-slate-950/50 border-b border-slate-800/60">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-bold text-white tracking-tight">The 3-Engine MedSpa Revenue Protocol</h2>
            <p className="text-slate-400">Automate your patient acquisition pipeline while maintaining white-glove luxury care.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur hover:border-rose-500/50 transition-colors">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 font-mono font-bold mb-2">
                  01
                </div>
                <CardTitle className="text-white text-lg">Instant VIP Speed-to-Lead</CardTitle>
                <CardDescription className="text-slate-400 text-sm">
                  Engage every ad click, Instagram DM, and website visitor within 60 seconds with intelligent conversational booking.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur hover:border-rose-500/50 transition-colors">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 font-mono font-bold mb-2">
                  02
                </div>
                <CardTitle className="text-white text-lg">No-Show & Cancellation Shield</CardTitle>
                <CardDescription className="text-slate-400 text-sm">
                  Automated deposit collection, VIP reminder sequences, and 1-click waitlist autofill when cancellations occur.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur hover:border-rose-500/50 transition-colors">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono font-bold mb-2">
                  03
                </div>
                <CardTitle className="text-white text-lg">VIP Re-Activation Engine</CardTitle>
                <CardDescription className="text-slate-400 text-sm">
                  Re-engage past Botox/filler patients at optimal 90-day intervals with tailored touchpoints that drive recurring revenue.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Diagnostic Modal */}
      <Dialog open={isDiagnosticOpen} onOpenChange={setIsDiagnosticOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-400" />
              Request MedSpa Patient Flow Audit
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-sm">
              Discover how many monthly high-ticket consultations your practice is losing to slow inquiry response times.
            </DialogDescription>
          </DialogHeader>

          {deliveredDiagnostic ? (
            <div className="space-y-4 py-2">
              <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-rose-500/20 text-rose-300 font-mono text-[10px]">SAL-01 Generated</Badge>
                  <span className="text-[10px] text-slate-400 font-mono">Recovery Est: {deliveredDiagnostic.recoveredRevenueEst}</span>
                </div>
                <h4 className="text-sm font-semibold text-white">{deliveredDiagnostic.title}</h4>
                <p className="text-xs text-slate-300 font-mono whitespace-pre-line bg-black/40 p-2.5 rounded border border-slate-800">
                  {deliveredDiagnostic.preview}
                </p>
              </div>
              <DialogFooter>
                <Button 
                  onClick={() => {
                    setIsDiagnosticOpen(false);
                    setDeliveredDiagnostic(null);
                  }}
                  className="w-full bg-rose-500 hover:bg-rose-400 text-white font-semibold"
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleDiagnosticSubmit} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="medspa-name" className="text-xs font-medium text-slate-300">Your Full Name</Label>
                <Input 
                  id="medspa-name" 
                  required 
                  placeholder="e.g. Dr. Shannon Pearson" 
                  className="bg-slate-950 border-slate-800 focus:border-rose-500 text-white"
                  value={formState.name}
                  onChange={e => setFormState({...formState, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medspa-email" className="text-xs font-medium text-slate-300">Work Email Address</Label>
                <Input 
                  id="medspa-email" 
                  type="email" 
                  required 
                  placeholder="shannon@pearsonmedspa.com" 
                  className="bg-slate-950 border-slate-800 focus:border-rose-500 text-white"
                  value={formState.email}
                  onChange={e => setFormState({...formState, email: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="practice" className="text-xs font-medium text-slate-300">Practice / Clinic Name</Label>
                <Input 
                  id="practice" 
                  placeholder="e.g. Pearson Aesthetics & MedSpa" 
                  className="bg-slate-950 border-slate-800 focus:border-rose-500 text-white"
                  value={formState.practiceName}
                  onChange={e => setFormState({...formState, practiceName: e.target.value})}
                />
              </div>

              <DialogFooter className="pt-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-semibold"
                >
                  {isSubmitting ? "Generating Blueprint..." : "Get Free Patient Flow Audit"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
