import React, { useState } from "react";
import { Link } from "wouter";
import {
  Building2,
  Radar,
  TrendingUp,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  Shield,
  Zap,
  Download,
  MapPin,
  Sparkles,
  PhoneCall,
  Activity,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Navigation } from "@/components/Navigation";

export default function RealEstateCampaign() {
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    firm: "",
    territory: "Southern Nevada (Henderson / Apex / North Las Vegas)"
  });

  const [deliveredBrief, setDeliveredBrief] = useState<any>(null);

  const handleBriefRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/campaigns/outreach/cre", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      if (!res.ok) {
        throw new Error("Failed to dispatch brief");
      }

      const data = await res.json();
      setDeliveredBrief(data);
      toast.success("Intelligence Brief Dispatched!", {
        description: `Verified Nevada Expansion Signal generated (Checksum: ${data.checksum?.slice(0, 8)}...).`,
      });
    } catch {
      toast.error("Failed to dispatch brief. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 selection:bg-cyan-500 selection:text-black">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden border-b border-slate-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-cyan-950/30 via-transparent to-transparent pointer-events-none" />
        
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            
            {/* Left Column: Copy */}
            <div className="flex-1 space-y-6 text-center lg:text-left">
              <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-3 py-1 font-mono text-xs uppercase tracking-wider">
                <Radar className="w-3.5 h-3.5 mr-1.5 animate-spin text-cyan-400" />
                Market Marksman · Nevada CRE Edition
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Off-Market Tenant <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
                  Expansion Signals
                </span>
                <br />
                3–9 Months Early.
              </h1>

              <p className="text-lg text-slate-300 max-w-xl leading-relaxed">
                We track early patent filings, venture capital funding, and cleanroom technical hiring spikes to pinpoint 15k–50k RSF industrial and life-science expansions before they hit public brokerage lists.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <Button 
                  size="lg" 
                  onClick={() => setIsBriefModalOpen(true)}
                  className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-black font-semibold shadow-lg shadow-cyan-500/20 px-8"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Request Sample Expansion Brief
                </Button>
                <Link href="/command-center">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-200">
                    <Activity className="w-4 h-4 mr-2 text-cyan-400" />
                    View Live Radar Swarm
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-4 text-xs font-mono text-slate-400 justify-center lg:justify-start">
                <span className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Zero Public MLS Noise</span>
                <span className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Verified SEC & Patent Logs</span>
                <span className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Decision-Maker Direct</span>
              </div>
            </div>

            {/* Right Column: Visual Radar Preview */}
            <div className="flex-1 w-full max-w-lg">
              <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 bg-slate-900/80 shadow-2xl shadow-cyan-950/50 group">
                <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-transparent to-transparent z-10 opacity-60" />
                <img 
                  src="/campaigns/cre-intelligence-radar.jpg" 
                  alt="CRE Intelligence Radar" 
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-4 left-4 right-4 z-20 p-4 rounded-xl bg-slate-950/80 border border-slate-800 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-mono text-cyan-400">TRIGGER DETECTED: SOUTHERN NEVADA</p>
                      <p className="text-sm font-semibold text-white">Targeted Therapeutics · $42M Series A</p>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-xs">
                      15k–25k RSF
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3-Step Flow Architecture */}
      <section className="py-20 bg-slate-950/40 border-b border-slate-800/60">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-bold text-white tracking-tight">How Market Marksman Outreaches & Converts</h2>
            <p className="text-slate-400">A precision 2-stage autonomous sequence that positions your brokerage as the first call.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur hover:border-cyan-500/50 transition-colors">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono font-bold mb-2">
                  01
                </div>
                <CardTitle className="text-white text-lg">Alternative Signal Ingestion</CardTitle>
                <CardDescription className="text-slate-400 text-sm">
                  Continuous scraping of patent databases, VC funding announcements, and cleanroom hiring spikes.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs font-mono text-slate-400 space-y-2 border-t border-slate-800/60 pt-4">
                <div className="flex items-center text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Biotech & Cleanroom Triggers</div>
                <div className="flex items-center text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Industrial Manufacturing Expansion</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur hover:border-cyan-500/50 transition-colors">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-mono font-bold mb-2">
                  02
                </div>
                <CardTitle className="text-white text-lg">Un-Ignorable Value Hook</CardTitle>
                <CardDescription className="text-slate-400 text-sm">
                  Personalized cold email offering a complete 1-page PDF Brief with zero fluff or generic pitch.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs font-mono text-slate-400 space-y-2 border-t border-slate-800/60 pt-4">
                <div className="flex items-center text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Direct-response 'SEND' trigger</div>
                <div className="flex items-center text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5 mr-2" /> High-conversion 48% open benchmark</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur hover:border-cyan-500/50 transition-colors">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold mb-2">
                  03
                </div>
                <CardTitle className="text-white text-lg">Automated Delivery & Follow-Up</CardTitle>
                <CardDescription className="text-slate-400 text-sm">
                  Instant brief delivery + 3-day value-add follow-up loop routing interested brokers into your calendar.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs font-mono text-slate-400 space-y-2 border-t border-slate-800/60 pt-4">
                <div className="flex items-center text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Hubspot CRM synchronization</div>
                <div className="flex items-center text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Direct meeting booking handoff</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Brief Request Modal */}
      <Dialog open={isBriefModalOpen} onOpenChange={setIsBriefModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-cyan-400" />
              Get Sample Expansion Signal Brief
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-sm">
              Receive the verified 1-page PDF Brief for the latest Southern Nevada Biotech Expansion Signal.
            </DialogDescription>
          </DialogHeader>

          {deliveredBrief ? (
            <div className="space-y-4 py-2">
              <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">SAL-01 Dispatched</Badge>
                  <span className="text-[10px] text-slate-400 font-mono">SHA256: {deliveredBrief.checksum?.slice(0, 12)}...</span>
                </div>
                <h4 className="text-sm font-semibold text-white">{deliveredBrief.title}</h4>
                <p className="text-xs text-slate-300 font-mono whitespace-pre-line bg-black/40 p-2.5 rounded border border-slate-800">
                  {deliveredBrief.preview}
                </p>
              </div>
              <DialogFooter>
                <Button 
                  onClick={() => {
                    setIsBriefModalOpen(false);
                    setDeliveredBrief(null);
                  }}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleBriefRequest} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-medium text-slate-300">Your Full Name</Label>
                <Input 
                  id="name" 
                  required 
                  placeholder="e.g. David Miller" 
                  className="bg-slate-950 border-slate-800 focus:border-cyan-500 text-white"
                  value={formState.name}
                  onChange={e => setFormState({...formState, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-medium text-slate-300">Work Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  required 
                  placeholder="david@heritage-realty.com" 
                  className="bg-slate-950 border-slate-800 focus:border-cyan-500 text-white"
                  value={formState.email}
                  onChange={e => setFormState({...formState, email: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="firm" className="text-xs font-medium text-slate-300">Brokerage / Development Firm</Label>
                <Input 
                  id="firm" 
                  placeholder="e.g. Heritage Realty / CBRE" 
                  className="bg-slate-950 border-slate-800 focus:border-cyan-500 text-white"
                  value={formState.firm}
                  onChange={e => setFormState({...formState, firm: e.target.value})}
                />
              </div>

              <DialogFooter className="pt-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-black font-semibold"
                >
                  {isSubmitting ? "Dispatching Brief..." : "Send Free 1-Page PDF Brief"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
