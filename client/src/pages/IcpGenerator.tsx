import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Target,
  Sparkles,
  Database,
  Building2,
  Users,
  AlertTriangle,
  Radio,
  Copy,
  Download,
  Trash2,
  CheckCircle2,
  Loader2,
  Send,
} from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type IcpProfile = {
  id?: string;
  name: string;
  industry: string;
  targetRole: string;
  companySize: string;
  revenueRange: string;
  acutePainTriggers: string[];
  buyingSignals: string[];
  disqualifiers: string[];
  valueProposition: string;
  outreachAngles: string[];
  createdAt?: string;
};

export default function IcpGenerator() {
  const queryClient = useQueryClient();

  const [businessName, setBusinessName] = useState("Uncle Robert Consulting (URC)");
  const [offering, setOffering] = useState("Agentic OS / Operational Department Playbooks");
  const [industry, setIndustry] = useState("Professional Services");
  const [targetAudience, setTargetAudience] = useState("Founder / CEO / Managing Partner");
  const [primaryGoal, setPrimaryGoal] = useState("High-Ticket Advisory Retainers ($3k-$10k/mo)");

  const [activeProfile, setActiveProfile] = useState<IcpProfile | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch saved ICP Profiles from PostgreSQL
  const { data: icpData, isLoading: isLoadingProfiles } = useQuery({
    queryKey: ["icp-profiles"],
    queryFn: async () => {
      const res = await fetch("/api/icp/profiles");
      if (!res.ok) throw new Error("Failed to load ICP profiles");
      return res.json();
    },
  });

  const profiles: IcpProfile[] = icpData?.profiles || [];

  // Generate ICP Mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/icp/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          offering,
          industry,
          targetAudience,
          primaryGoal,
          saveToDb: true,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to synthesize ICP");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setActiveProfile(data.profile);
      queryClient.invalidateQueries({ queryKey: ["icp-profiles"] });
      toast.success("ICP Dossier Synthesized & Saved", {
        description: `Targeting dossier for ${data.profile.name} generated successfully.`,
      });
    },
    onError: (err: any) => {
      toast.error("Generation Failed", {
        description: err.message,
      });
    },
  });

  // Delete Profile Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/icp/profiles/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete profile");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["icp-profiles"] });
      toast.success("ICP Profile Removed");
    },
  });

  const currentDossier = activeProfile || profiles[0] || null;

  const handleCopyDossier = () => {
    if (!currentDossier) return;
    const formatted = [
      `==================================================`,
      `IDEAL CUSTOMER PROFILE: ${currentDossier.name.toUpperCase()}`,
      `==================================================`,
      `Target Industry : ${currentDossier.industry}`,
      `Target Role     : ${currentDossier.targetRole}`,
      `Company Size    : ${currentDossier.companySize}`,
      `Revenue Range   : ${currentDossier.revenueRange}`,
      "",
      `CORE VALUE PROPOSITION:`,
      currentDossier.valueProposition,
      "",
      `ACUTE PAIN TRIGGERS:`,
      ...currentDossier.acutePainTriggers.map(p => `• ${p}`),
      "",
      `BUYING SIGNALS & TRIGGER EVENTS:`,
      ...currentDossier.buyingSignals.map(s => `• ${s}`),
      "",
      `DISQUALIFIERS (RED FLAGS):`,
      ...currentDossier.disqualifiers.map(d => `• ${d}`),
      "",
      `OUTREACH ANGLES & HOOKS:`,
      ...currentDossier.outreachAngles.map(a => `• ${a}`),
    ].join("\n");

    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDossier = () => {
    if (!currentDossier) return;
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(currentDossier, null, 2)], {
      type: "application/json",
    });
    element.href = URL.createObjectURL(file);
    element.download = `${currentDossier.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-icp.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-border/50">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Database className="w-3.5 h-3.5" />
                Postgres ICP Vault Active
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                {profiles.length} Profiles Stored
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2.5">
              <Target className="w-8 h-8 text-primary" />
              Ideal Customer Profile (ICP) Generator
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Synthesize precision buyer personas, urgent pain triggers, buying signals, and message hooks wired directly into your operating database.
            </p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-card border border-border/60 rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Targeting Parameters
              </h2>

              <div>
                <Label className="text-xs font-medium">Business / Client Name</Label>
                <Input
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  placeholder="e.g. Acme Legal Consulting"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-medium">Core Offering</Label>
                <Input
                  value={offering}
                  onChange={e => setOffering(e.target.value)}
                  placeholder="e.g. Nevada CRE Intelligence / Fractional COO"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-medium">Target Industry</Label>
                <Input
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  placeholder="e.g. Commercial Real Estate, MedSpas, Logistics"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-medium">Economic Buyer Persona</Label>
                <Input
                  value={targetAudience}
                  onChange={e => setTargetAudience(e.target.value)}
                  placeholder="e.g. Managing Director / Clinic Owner / CFO"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-medium">Primary Revenue Objective</Label>
                <Input
                  value={primaryGoal}
                  onChange={e => setPrimaryGoal(e.target.value)}
                  placeholder="e.g. $5k/mo Retainers, Enterprise Pipeline"
                  className="mt-1"
                />
              </div>

              <Button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
                className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white gap-2"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Synthesizing ICP Dossier...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Synthesize & Save ICP
                  </>
                )}
              </Button>
            </div>

            {/* Saved Vault List */}
            <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-semibold flex items-center justify-between">
                <span>Stored ICP Profiles ({profiles.length})</span>
                <Database className="w-4 h-4 text-muted-foreground" />
              </h3>

              {isLoadingProfiles ? (
                <div className="py-4 text-center text-xs text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1 text-primary" />
                  Loading profiles...
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {profiles.map(p => (
                    <div
                      key={p.id || p.name}
                      onClick={() => setActiveProfile(p)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between group ${
                        currentDossier?.name === p.name
                          ? "bg-primary/10 border-primary/40 font-medium text-primary"
                          : "bg-background/60 border-border/40 hover:border-border text-foreground"
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="font-semibold truncate">{p.name}</div>
                        <div className="text-[10px] text-muted-foreground">{p.industry} • {p.targetRole}</div>
                      </div>

                      {p.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMutation.mutate(p.id!);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-1 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Dossier Display Column */}
          <div className="lg:col-span-8 space-y-6">
            {currentDossier ? (
              <div className="space-y-6">
                {/* Dossier Header Card */}
                <div className="bg-card border border-border/60 rounded-xl p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
                    <div>
                      <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary">
                        {currentDossier.industry}
                      </span>
                      <h2 className="text-2xl font-bold mt-1 text-foreground">
                        {currentDossier.name}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyDossier}
                        className="gap-1.5 text-xs"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copied ? "Copied!" : "Copy Dossier"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadDossier}
                        className="gap-1.5 text-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        JSON
                      </Button>
                    </div>
                  </div>

                  {/* Firmographic Metric Badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                    <div className="bg-background/80 p-3 rounded-lg border border-border/40 flex items-center gap-3">
                      <Users className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold">Target Persona</div>
                        <div className="text-xs font-semibold text-foreground">{currentDossier.targetRole}</div>
                      </div>
                    </div>

                    <div className="bg-background/80 p-3 rounded-lg border border-border/40 flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-emerald-400" />
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold">Company Size</div>
                        <div className="text-xs font-semibold text-foreground">{currentDossier.companySize}</div>
                      </div>
                    </div>

                    <div className="bg-background/80 p-3 rounded-lg border border-border/40 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-amber-400" />
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold">Revenue Range</div>
                        <div className="text-xs font-semibold text-foreground">{currentDossier.revenueRange}</div>
                      </div>
                    </div>
                  </div>

                  {/* Value Proposition */}
                  <div className="bg-muted/40 p-4 rounded-lg border border-border/40">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Core Value Proposition & Wedge Positioning
                    </h3>
                    <p className="text-sm font-medium text-foreground leading-relaxed">
                      "{currentDossier.valueProposition}"
                    </p>
                  </div>
                </div>

                {/* 2-Column Grid: Acute Pain vs Buying Signals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Acute Pain Triggers */}
                  <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-3">
                    <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Acute Pain Triggers (Urgent Bottlenecks)
                    </h3>
                    <ul className="space-y-2 text-xs">
                      {currentDossier.acutePainTriggers.map((pain, idx) => (
                        <li
                          key={idx}
                          className="p-2.5 rounded-lg bg-red-500/5 border border-red-500/15 text-foreground leading-relaxed flex items-start gap-2"
                        >
                          <span className="text-red-400 font-bold">•</span>
                          <span>{pain}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Buying Signals */}
                  <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-3">
                    <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                      <Radio className="w-4 h-4" />
                      Buying Signals & Observable Triggers
                    </h3>
                    <ul className="space-y-2 text-xs">
                      {currentDossier.buyingSignals.map((signal, idx) => (
                        <li
                          key={idx}
                          className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-foreground leading-relaxed flex items-start gap-2"
                        >
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{signal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Disqualifiers & Outreach Angles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Disqualifiers */}
                  <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-3">
                    <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Disqualifiers & Red Flags
                    </h3>
                    <ul className="space-y-2 text-xs">
                      {currentDossier.disqualifiers.map((disq, idx) => (
                        <li
                          key={idx}
                          className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/15 text-muted-foreground leading-relaxed flex items-start gap-2"
                        >
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{disq}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Outreach Angles */}
                  <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-3">
                    <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      High-Conversion Outreach Angles
                    </h3>
                    <ul className="space-y-2 text-xs">
                      {currentDossier.outreachAngles.map((angle, idx) => (
                        <li
                          key={idx}
                          className="p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/15 text-foreground leading-relaxed flex items-start gap-2"
                        >
                          <span className="text-blue-400 font-bold">•</span>
                          <span>{angle}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border/60 rounded-xl p-12 text-center text-muted-foreground">
                <Target className="w-12 h-12 text-primary mx-auto mb-3 opacity-60" />
                <h3 className="text-lg font-semibold text-foreground">No ICP Profile Selected</h3>
                <p className="text-xs mt-1 max-w-sm mx-auto">
                  Fill in the targeting parameters on the left to synthesize a new Ideal Customer Profile dossier.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
