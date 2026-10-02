import React, { useState } from "react";
import { DocPageEntry, DocHotspot } from "@/data/docsRegistry";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Terminal,
  Activity,
  Layers,
  Database,
  Cpu,
  Mail,
  Zap,
  Info,
  Video,
  MessageSquare,
  Tv,
  Target,
  ClipboardList,
  Mic,
  Share2
} from "lucide-react";
import { Link } from "wouter";

interface DocVisualBlueprintProps {
  doc: DocPageEntry;
}

export function DocVisualBlueprint({ doc }: DocVisualBlueprintProps) {
  const [activeHotspotId, setActiveHotspotId] = useState<number | null>(1);
  const [isTourActive, setIsTourActive] = useState(false);

  const activeHotspot = doc.hotspots.find(h => h.id === activeHotspotId) || doc.hotspots[0];
  const activeIndex = doc.hotspots.findIndex(h => h.id === activeHotspotId);

  const startTour = () => {
    setIsTourActive(true);
    setActiveHotspotId(doc.hotspots[0]?.id || 1);
  };

  const nextHotspot = () => {
    if (activeIndex < doc.hotspots.length - 1) {
      setActiveHotspotId(doc.hotspots[activeIndex + 1].id);
    } else {
      setIsTourActive(false);
    }
  };

  const prevHotspot = () => {
    if (activeIndex > 0) {
      setActiveHotspotId(doc.hotspots[activeIndex - 1].id);
    }
  };

  const resetTour = () => {
    setIsTourActive(false);
    setActiveHotspotId(null);
  };

  return (
    <div className="space-y-4">
      {/* Blueprint Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-4 rounded-xl border border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              Interactive Visual Blueprint & Hotspots
              <Badge variant="outline" className="text-xs font-mono bg-background">
                {doc.hotspots.length} Key Zones
              </Badge>
            </h3>
            <p className="text-xs text-muted-foreground">
              Click any numbered hotspot on the preview to inspect its exact functions, controls, and outputs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isTourActive ? (
            <Button 
              size="sm" 
              onClick={startTour}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Start Guided Tour
            </Button>
          ) : (
            <div className="flex items-center gap-1 bg-background p-1 rounded-lg border border-border">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={prevHotspot} 
                disabled={activeIndex === 0}
                className="h-7 px-2 text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Prev
              </Button>
              <span className="text-xs font-mono font-medium px-2 text-muted-foreground">
                {activeIndex + 1} / {doc.hotspots.length}
              </span>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={nextHotspot}
                className="h-7 px-2 text-xs text-primary font-semibold"
              >
                {activeIndex === doc.hotspots.length - 1 ? "Finish" : "Next"}
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={resetTour}
                className="h-7 px-1.5 text-xs text-muted-foreground hover:text-foreground"
                title="Exit Tour"
              >
                <RotateCcw className="w-3 h-3" />
              </Button>
            </div>
          )}

          <Link href={doc.targetRoute}>
            <Button size="sm" variant="outline" className="flex items-center gap-1.5 hover:bg-primary/5 hover:text-primary hover:border-primary">
              <span>Launch Live Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* The Visual Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Mock Page Layout with Hotspot Badges */}
        <div className="lg:col-span-8 relative bg-card border-2 border-border rounded-2xl shadow-xl overflow-hidden min-h-[480px]">
          {/* Simulated Browser Bar */}
          <div className="bg-muted/80 px-4 py-2.5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              <span className="ml-3 text-xs font-mono text-muted-foreground bg-background px-3 py-0.5 rounded border border-border">
                https://agentlab-718497644379.us-central1.run.app{doc.targetRoute}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px] font-mono">
                UI BLUEPRINT — ILLUSTRATIVE
              </Badge>
            </div>
          </div>

          {/* Dynamic Mock Screen Rendering */}
          <div className="p-6 relative bg-background/50 select-none">
            {renderMockContent(doc.mockLayoutType)}

            {/* Hotspot Markers Overlay */}
            {doc.hotspots.map((hotspot) => {
              const isSelected = activeHotspotId === hotspot.id;
              return (
                <button
                  key={hotspot.id}
                  onClick={() => {
                    setActiveHotspotId(hotspot.id);
                    setIsTourActive(true);
                  }}
                  style={{
                    left: `${hotspot.x}%`,
                    top: `${hotspot.y}%`,
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 group transition-all duration-300 focus:outline-none`}
                  title={hotspot.title}
                >
                  <div className="relative flex items-center justify-center">
                    {/* Pulsing ring */}
                    <span 
                      className={`absolute inline-flex h-10 w-10 rounded-full transition-opacity duration-300 ${
                        isSelected 
                          ? 'bg-primary/40 animate-ping opacity-75' 
                          : 'bg-primary/20 opacity-0 group-hover:opacity-100 group-hover:animate-ping'
                      }`}
                    />
                    
                    {/* The Badge Number */}
                    <div 
                      className={`relative flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs shadow-lg transition-transform duration-200 ${
                        isSelected
                          ? 'bg-primary text-primary-foreground scale-125 ring-4 ring-primary/30'
                          : 'bg-card text-foreground border-2 border-primary hover:scale-110'
                      }`}
                    >
                      {hotspot.id}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Active Hotspot Detail Card */}
        <div className="lg:col-span-4 sticky top-20">
          {activeHotspot ? (
            <div className="bg-card border-2 border-primary/30 rounded-2xl p-5 shadow-lg space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shadow">
                    {activeHotspot.id}
                  </div>
                  <h4 className="font-bold text-sm text-foreground">
                    {activeHotspot.title}
                  </h4>
                </div>
                <Badge variant="secondary" className="capitalize text-[10px]">
                  {activeHotspot.badgeType}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {activeHotspot.description}
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-3 bg-muted/40 rounded-xl border border-border/80">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-1">
                    <Zap className="w-3.5 h-3.5" />
                    User Action & Instruction
                  </div>
                  <p className="text-xs text-foreground/90 leading-normal">
                    {activeHotspot.actionPrompt}
                  </p>
                </div>

                <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Output Telemetry & Meaning
                  </div>
                  <p className="text-xs text-foreground/90 leading-normal">
                    {activeHotspot.outputMeaning}
                  </p>
                </div>
              </div>

              {/* Stepper buttons inside card */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-[11px] text-muted-foreground font-mono">
                  Zone {activeHotspot.id} of {doc.hotspots.length}
                </span>
                <div className="flex items-center gap-1.5">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={prevHotspot} 
                    disabled={activeIndex === 0}
                    className="h-7 text-xs"
                  >
                    Prev
                  </Button>
                  <Button 
                    size="sm" 
                    variant="default" 
                    onClick={nextHotspot}
                    className="h-7 text-xs bg-primary text-primary-foreground"
                  >
                    {activeIndex === doc.hotspots.length - 1 ? "Start Over" : "Next Zone →"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-muted/30 border border-dashed border-border rounded-2xl p-8 text-center text-muted-foreground space-y-2">
              <Info className="w-8 h-8 mx-auto text-primary/50" />
              <p className="text-xs font-medium">Click any numbered badge on the screen to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper to render high-fidelity mock interfaces per page type
function renderMockContent(type: DocPageEntry["mockLayoutType"]) {
  switch (type) {
    case "command-center":
      return (
        <div className="space-y-4 opacity-90 pointer-events-none">
          {/* Header Row */}
          <div className="flex items-center justify-between bg-card p-3 rounded-xl border border-border">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-foreground">Cloud Run Fleet</span>
              <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded font-mono">Illustrative</span>
            </div>
            <div className="h-7 px-3 bg-primary/20 text-primary text-xs rounded-lg flex items-center gap-1 font-semibold">
              <RotateCcw className="w-3 h-3" /> Sync All
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card p-3 rounded-xl border border-border space-y-1">
              <div className="text-[10px] text-muted-foreground font-mono uppercase">Active Agents</div>
              <div className="text-lg font-bold text-foreground flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-primary" /> 3 Online
              </div>
              <div className="text-[10px] text-emerald-600 font-mono">0 Failed Steps</div>
            </div>
            <div className="bg-card p-3 rounded-xl border border-border space-y-1">
              <div className="text-[10px] text-muted-foreground font-mono uppercase">Lead Pipeline</div>
              <div className="text-lg font-bold text-foreground flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-blue-500" /> 36 Enrolled
              </div>
              <div className="text-[10px] text-blue-600 font-mono">Sending: 30/day</div>
            </div>
            <div className="bg-card p-3 rounded-xl border border-border space-y-1">
              <div className="text-[10px] text-muted-foreground font-mono uppercase">SOP Compliance</div>
              <div className="text-lg font-bold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 0 Drift
              </div>
              <div className="text-[10px] text-muted-foreground font-mono">81 SOPs Verified</div>
            </div>
          </div>

          {/* Logs Feed Mock */}
          <div className="bg-card p-3 rounded-xl border border-border space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground border-b border-border pb-1.5">
              <span>Real-time Execution Stream</span>
              <span className="font-mono text-[10px]">Filter: All (124 events)</span>
            </div>
            <div className="space-y-1.5 text-[11px] font-mono">
              <div className="flex items-center justify-between p-1.5 bg-muted/40 rounded">
                <span className="text-emerald-600">✓ POST /api/sync/all</span>
                <span className="text-muted-foreground">340ms • 200 OK</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-muted/40 rounded">
                <span className="text-blue-600">⚡ Instantly.ai Send Batch</span>
                <span className="text-muted-foreground">6 leads dispatched</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-muted/40 rounded">
                <span className="text-purple-600">⚙ auditFileInventory</span>
                <span className="text-muted-foreground">42 files indexed • 0 dupes</span>
              </div>
            </div>
          </div>
        </div>
      );

    case "agents":
      return (
        <div className="space-y-4 opacity-90 pointer-events-none">
          <div className="flex items-center justify-between bg-card p-3 rounded-xl border border-border">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Agent: Ops Cleanup Agent</span>
            </div>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-mono">Model: Gemini 2.5 Flash</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card p-3 rounded-xl border border-border space-y-2">
              <span className="text-xs font-bold text-foreground">Tool Permissions</span>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center text-emerald-600">
                  <span>• auditFileInventory</span>
                  <span className="font-bold">ENABLED</span>
                </div>
                <div className="flex justify-between items-center text-emerald-600">
                  <span>• inspectExecutionLogs</span>
                  <span className="font-bold">ENABLED</span>
                </div>
                <div className="flex justify-between items-center text-emerald-600">
                  <span>• verifyReportDelivery</span>
                  <span className="font-bold">ENABLED</span>
                </div>
              </div>
            </div>
            <div className="bg-card p-3 rounded-xl border border-border space-y-2">
              <span className="text-xs font-bold text-foreground">Parameters</span>
              <div className="space-y-1 text-xs text-muted-foreground font-mono">
                <div>Temperature: 0.20</div>
                <div>Max Tokens: 4,096</div>
                <div>Cache: Enabled</div>
              </div>
            </div>
          </div>

          <div className="bg-card p-3 rounded-xl border border-border space-y-1">
            <span className="text-xs font-bold text-foreground">System Prompt Guardrails</span>
            <div className="p-2 bg-muted/50 rounded text-[11px] font-mono text-muted-foreground line-clamp-3">
              You are the autonomous Ops Cleanup Agent for Uncle Robert Consulting. Verify SHA-256 hashes before moving any files...
            </div>
          </div>
        </div>
      );

    case "auditing":
      return (
        <div className="space-y-4 opacity-90 pointer-events-none">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-1">
              <span className="text-[10px] uppercase font-mono text-amber-600 font-bold">Human-in-the-Loop — lives in Command Center</span>
              <div className="text-sm font-bold text-foreground">1 Run Awaiting Approval</div>
              <div className="text-[10px] text-muted-foreground">Approve in Command Center → Approval Queue</div>
            </div>
            <div className="bg-card p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-1">
              <span className="text-[10px] uppercase font-mono text-emerald-600 font-bold">Change-Control Check — CLI</span>
              <div className="text-sm font-bold text-foreground">pnpm change-control:check</div>
              <div className="text-[10px] text-emerald-600">Findings reported in the repo</div>
            </div>
          </div>

          <div className="bg-card p-3 rounded-xl border border-border space-y-2">
            <div className="text-xs font-bold text-foreground">
              Artifact Verification <span className="text-amber-600">(full SHA-256 ledger — roadmap)</span>
            </div>
            <div className="space-y-1 text-[11px] font-mono">
              <div className="flex justify-between p-1.5 bg-muted/40 rounded">
                <span>campaign briefs / diagnostic dossiers</span>
                <span className="text-emerald-600">SHA-256 applied today</span>
              </div>
              <div className="flex justify-between p-1.5 bg-muted/40 rounded">
                <span>full artifact ledger</span>
                <span className="text-amber-600">Roadmap</span>
              </div>
            </div>
          </div>
        </div>
      );

    case "founder-signal-system":
      return (
        <div className="space-y-4 opacity-90 pointer-events-none">
          <div className="flex items-center justify-between bg-card p-3 rounded-xl border border-border">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-bold text-foreground">KC Founders - M365 Diagnostic (Batch 01)</span>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded font-mono font-bold">ACTIVE & SENDING</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card p-2.5 rounded-xl border border-border text-center">
              <div className="text-[10px] text-muted-foreground uppercase font-mono">Enrolled Leads</div>
              <div className="text-base font-bold text-foreground">36</div>
            </div>
            <div className="bg-card p-2.5 rounded-xl border border-border text-center">
              <div className="text-[10px] text-muted-foreground uppercase font-mono">Daily Limit</div>
              <div className="text-base font-bold text-foreground">30 / day</div>
            </div>
            <div className="bg-card p-2.5 rounded-xl border border-border text-center">
              <div className="text-[10px] text-muted-foreground uppercase font-mono">Window</div>
              <div className="text-base font-bold text-foreground">9am - 5pm CDT</div>
            </div>
          </div>

          <div className="bg-card p-3 rounded-xl border border-border space-y-2">
            <div className="text-xs font-bold text-foreground">Lead Queue Pipeline</div>
            <div className="space-y-1 text-[11px] font-mono">
              <div className="flex justify-between p-1.5 bg-muted/40 rounded">
                <span>founder@kctech.co (Founder & CEO)</span>
                <span className="text-blue-600">Email Dispatched</span>
              </div>
              <div className="flex justify-between p-1.5 bg-muted/40 rounded">
                <span>ops@heartlandmfg.com (Managing Partner)</span>
                <span className="text-amber-600">Queued for Tomorrow</span>
              </div>
            </div>
          </div>
        </div>
      );

    case "meeting-room":
      return (
        <div className="space-y-4 opacity-90 pointer-events-none">
          <div className="flex items-center justify-between bg-card p-3 rounded-xl border border-border">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-xs font-bold text-foreground">Room: Executive Client War Room (#live-consultation)</span>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded font-mono font-bold">1080P WebRTC LIVE</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 bg-muted/60 rounded-xl border border-border p-6 flex flex-col items-center justify-center text-center min-h-[160px] relative overflow-hidden">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-2">
                <Video className="w-6 h-6" />
              </div>
              <div className="text-xs font-semibold text-foreground">Client Screen Share & Video Grid</div>
              <div className="text-[10px] text-muted-foreground">Peer-to-Peer Encryption • Zero-Install WebRTC</div>
              <div className="absolute bottom-2 left-2 flex gap-1">
                <span className="p-1 bg-background/80 rounded text-[9px] font-mono">Mic: ON</span>
                <span className="p-1 bg-background/80 rounded text-[9px] font-mono">Cam: ON</span>
              </div>
            </div>
            <div className="bg-card p-3 rounded-xl border border-border space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-foreground block mb-1">Live Agenda Scratchpad</span>
                <div className="p-2 bg-muted/40 rounded text-[10px] font-mono text-muted-foreground space-y-1">
                  <div>• Review M365 consolidation</div>
                  <div>• Demo 10-node DAG swarm</div>
                  <div>• Discuss $1k Sprint proposal</div>
                </div>
              </div>
              <div className="p-2 bg-primary/10 text-primary text-[10px] font-semibold rounded text-center">
                AI Debrief Generator Ready
              </div>
            </div>
          </div>
        </div>
      );

    case "client-messenger":
      return (
        <div className="space-y-4 opacity-90 pointer-events-none">
          <div className="flex items-center justify-between bg-card p-3 rounded-xl border border-border">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold text-foreground">Channel: #sales-and-leads</span>
            </div>
            <span className="text-[10px] bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded font-mono font-bold">4 Active Members</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card p-2.5 rounded-xl border border-border space-y-1.5 text-[11px]">
              <div className="font-bold text-[10px] uppercase font-mono text-muted-foreground">Office Channels</div>
              <div className="p-1 bg-primary/10 text-primary font-semibold rounded">#sales-and-leads</div>
              <div className="p-1 text-muted-foreground">#general-office</div>
              <div className="p-1 text-muted-foreground">#fulfillment-briefs</div>
              <div className="p-1 text-muted-foreground">#client-portal</div>
            </div>
            <div className="col-span-2 bg-card p-3 rounded-xl border border-border space-y-2">
              <div className="space-y-1 text-[11px]">
                <div className="p-1.5 bg-muted/40 rounded flex justify-between">
                  <span className="font-semibold text-foreground">Lorenzo M.</span>
                  <span className="text-[9px] text-muted-foreground">10:14 AM</span>
                </div>
                <div className="text-[10px] text-muted-foreground pl-1">
                  "The diagnostic report looks great. Can we hop on a quick video call to review?"
                </div>
              </div>
              <div className="p-1.5 bg-primary/5 rounded border border-primary/20 text-[10px] text-primary flex items-center justify-between">
                <span>AI Suggested Reply: "Invite to War Room"</span>
                <span className="font-mono text-[9px] underline">1-Click Insert</span>
              </div>
            </div>
          </div>
        </div>
      );

    case "screen-recorder":
      return (
        <div className="space-y-4 opacity-90 pointer-events-none">
          <div className="flex items-center justify-between bg-card p-3 rounded-xl border border-border">
            <div className="flex items-center gap-2">
              <Tv className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-bold text-foreground">Async Screen Teardown Studio</span>
            </div>
            <span className="text-[10px] bg-purple-500/10 text-purple-600 px-2 py-0.5 rounded font-mono font-bold">1080P 60FPS RECORDING</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 bg-muted/50 rounded-xl border border-border p-4 flex flex-col items-center justify-center text-center">
              <div className="text-sm font-bold text-foreground mb-1">04:18 / 05:00</div>
              <div className="text-[10px] text-muted-foreground mb-3">Recording: Founder Signal System Walkthrough</div>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-red-500/20 text-red-500 text-[10px] font-bold rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> REC
                </span>
                <span className="px-2 py-1 bg-background text-[10px] font-mono rounded border">Mic: Active</span>
              </div>
            </div>
            <div className="bg-card p-3 rounded-xl border border-border space-y-2">
              <div className="text-xs font-bold text-foreground">AI Teardown Brief</div>
              <div className="text-[10px] text-muted-foreground space-y-1 font-mono">
                <div>• Problem: Manual lead triage</div>
                <div>• Opportunity: 85% DAG auto</div>
                <div>• Next Step: $1k Sprint booking</div>
              </div>
              <div className="text-[9px] bg-muted/40 p-1 rounded text-center text-muted-foreground">
                Auto-saved to Results Vault
              </div>
            </div>
          </div>
        </div>
      );

    case "icp-generator":
      return (
        <div className="space-y-4 opacity-90 pointer-events-none">
          <div className="flex items-center justify-between bg-card p-3 rounded-xl border border-border">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-foreground">ICP Dossier: Nevada Commercial Real Estate Brokerages</span>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded font-mono font-bold">HIGH-SIGNAL DOSSIER</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card p-3 rounded-xl border border-border space-y-2">
              <div className="text-xs font-bold text-foreground">Acute Operational Pain Triggers</div>
              <div className="space-y-1 text-[10px] text-muted-foreground">
                <div className="p-1 bg-muted/40 rounded">• 6-12 hr weekly drag updating CoStar/LoopNet listings</div>
                <div className="p-1 bg-muted/40 rounded">• Disjointed CRM leads falling through inbox cracks</div>
                <div className="p-1 bg-muted/40 rounded">• High commission loss from delayed buyer follow-up</div>
              </div>
            </div>
            <div className="bg-card p-3 rounded-xl border border-border space-y-2">
              <div className="text-xs font-bold text-foreground">High-Converting Message Hooks</div>
              <div className="space-y-1 text-[10px] font-mono">
                <div className="p-1 bg-primary/10 text-primary rounded">"How NV CRE brokers cut 15 hrs/wk manual listing admin"</div>
                <div className="p-1 bg-muted/40 text-muted-foreground rounded">CTA: Free 15-Minute Pipeline Automation Audit</div>
              </div>
            </div>
          </div>
        </div>
      );

    case "assessment-generator":
      return (
        <div className="space-y-4 opacity-90 pointer-events-none">
          <div className="flex items-center justify-between bg-card p-3 rounded-xl border border-border">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-cyan-500" />
              <span className="text-xs font-bold text-foreground">Consulting Diagnostic Question Bank</span>
            </div>
            <span className="text-[10px] bg-cyan-500/10 text-cyan-600 px-2 py-0.5 rounded font-mono font-bold">18 CURATED QUESTIONS</span>
          </div>

          <div className="bg-card p-3 rounded-xl border border-border space-y-2">
            <div className="flex gap-1.5">
              <span className="px-2 py-0.5 bg-primary text-primary-foreground text-[9px] font-bold rounded">Strategy (3)</span>
              <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[9px] rounded">Operations (3)</span>
              <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[9px] rounded">Sales & Pipeline (3)</span>
              <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[9px] rounded">Finance (3)</span>
            </div>
            <div className="space-y-1 text-[11px] font-mono">
              <div className="p-1.5 bg-muted/40 rounded flex justify-between items-center">
                <span>Q: "Which weekly operational task consumes the most non-billable leadership hours?"</span>
                <span className="text-[9px] text-cyan-600 font-bold">SAL-01</span>
              </div>
              <div className="p-1.5 bg-muted/40 rounded flex justify-between items-center">
                <span>Q: "How many disconnected SaaS applications are required to close one client deal?"</span>
                <span className="text-[9px] text-cyan-600 font-bold">MKT-03</span>
              </div>
            </div>
          </div>
        </div>
      );

    case "dashboard":
      return (
        <div className="space-y-4 opacity-90 pointer-events-none">
          <div className="flex items-center justify-between bg-card p-3 rounded-xl border border-border">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Operations Dashboard</span>
            </div>
            <span className="text-[10px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded font-mono font-bold">MANUAL MODE</span>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="bg-card p-2.5 rounded-xl border border-border text-center">
              <div className="text-[10px] text-muted-foreground uppercase font-mono">Swarm Nodes</div>
              <div className="text-base font-bold text-foreground">5</div>
            </div>
            <div className="bg-card p-2.5 rounded-xl border border-border text-center">
              <div className="text-[10px] text-muted-foreground uppercase font-mono">Active Tasks</div>
              <div className="text-base font-bold text-foreground">2</div>
            </div>
            <div className="bg-card p-2.5 rounded-xl border border-border text-center">
              <div className="text-[10px] text-muted-foreground uppercase font-mono">Total DAG Runs</div>
              <div className="text-base font-bold text-foreground">148</div>
            </div>
            <div className="bg-card p-2.5 rounded-xl border border-border text-center">
              <div className="text-[10px] text-muted-foreground uppercase font-mono">Compute Spend</div>
              <div className="text-base font-bold text-foreground">$12.40</div>
            </div>
          </div>

          <div className="bg-card p-3 rounded-xl border border-border space-y-1.5">
            <div className="flex justify-between border-b border-border pb-1.5">
              <span className="text-xs font-bold text-foreground">System Telemetry Console</span>
              <span className="text-[10px] text-emerald-600 font-bold font-mono">LLM PING OK</span>
            </div>
            <div className="flex justify-between p-1.5 bg-muted/40 rounded text-[11px] font-mono">
              <span>Google model chain</span>
              <span className="text-emerald-600">CONNECTED</span>
            </div>
            <div className="flex justify-between p-1.5 bg-muted/40 rounded text-[11px] font-mono">
              <span>Scheduler (armed workflows)</span>
              <span className="text-amber-600">0 armed</span>
            </div>
          </div>

          <div className="bg-card p-3 rounded-xl border border-border space-y-1.5">
            <div className="text-xs font-bold text-foreground">Recent Runs</div>
            <div className="flex justify-between p-1.5 bg-muted/40 rounded text-[11px] font-mono">
              <span>revenue-lead-to-sale</span>
              <span className="text-emerald-600">completed</span>
            </div>
            <div className="flex justify-between p-1.5 bg-muted/40 rounded text-[11px] font-mono">
              <span>delivery-to-retention</span>
              <span className="text-amber-600">paused_for_approval</span>
            </div>
          </div>
        </div>
      );

    case "ops-agent":
      return (
        <div className="space-y-4 opacity-90 pointer-events-none">
          <div className="bg-card p-3 rounded-xl border border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Ops & Architecture Agent</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">Ctrl+Enter to run</span>
          </div>

          <div className="bg-card p-3 rounded-xl border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono text-muted-foreground font-semibold">Situational Next-Step Prompts</span>
              <div className="flex gap-1.5">
                <span className="px-2 py-0.5 bg-primary text-primary-foreground text-[9px] font-bold rounded">Workspace Docs</span>
                <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[9px] rounded">Plans & Handoffs</span>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-background p-3 text-[11px] text-muted-foreground min-h-[48px]">
              Describe your operational requirement, SOP standardization task, or multi-agent workflow request…
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-muted-foreground">Model: gemini-flash-latest</span>
              <span className="text-[10px] font-mono text-amber-600 font-bold">DISPLAY-ONLY — server chain decides, modelUsed reported back</span>
            </div>
          </div>

          <div className="bg-card p-3 rounded-xl border border-border space-y-1.5">
            <div className="flex justify-between border-b border-border pb-1.5">
              <span className="text-xs font-bold text-foreground">Live Step Execution & Verification Tracker</span>
              <span className="text-[10px] text-muted-foreground font-mono">GET /api/runs/:id</span>
            </div>
            <div className="flex justify-between p-1.5 bg-muted/40 rounded text-[11px] font-mono">
              <span>1 · Load SOP context</span>
              <span className="text-emerald-600">completed</span>
            </div>
            <div className="flex justify-between p-1.5 bg-muted/40 rounded text-[11px] font-mono">
              <span>2 · Sample workspace files</span>
              <span className="text-blue-600">running</span>
            </div>
            <div className="flex justify-between p-1.5 bg-muted/40 rounded text-[11px] font-mono">
              <span>3 · Propose DAG</span>
              <span className="text-slate-500">pending</span>
            </div>
          </div>
        </div>
      );

    case "playbooks":
      return (
        <div className="space-y-4 opacity-90 pointer-events-none">
          <div className="bg-card p-3 rounded-xl border border-border flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold text-foreground">Operating Playbooks</span>
            <span className="ml-auto text-[10px] text-muted-foreground font-mono">GET /api/playbooks</span>
          </div>

          <div className="bg-card p-3 rounded-xl border border-border space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-foreground">Sale to Delivery</div>
                <div className="flex flex-wrap gap-2 pt-1.5 text-[10px] text-muted-foreground">
                  <span className="px-1.5 py-0.5 border border-border rounded">SAL</span>
                  <span>Owner: Sales Lead</span>
                  <span>Approval: Robert</span>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded font-mono font-bold">active</span>
            </div>
            <div className="rounded-lg bg-muted/40 p-2.5 text-[11px]">
              <strong>Trigger:</strong> contract signed
              <br />
              <strong>Complete when:</strong> kickoff delivered and accepted
            </div>
            <div className="rounded-lg border border-border p-2.5 space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium">
                <span className="px-1.5 py-0.5 border border-border rounded font-mono text-[9px]">SAL-01</span>
                <span className="text-muted-foreground">→</span>
                <span className="px-1.5 py-0.5 border border-border rounded font-mono text-[9px]">FUL-02</span>
                <span className="text-amber-500 text-[10px] font-bold">approval required</span>
              </div>
              <div className="text-[10px] text-muted-foreground">Trigger signal: signed agreement filed</div>
              <div className="text-[10px] text-muted-foreground">Receiver: Fulfillment. Fallback: retry after 24h, escalate to Robert.</div>
            </div>
          </div>
        </div>
      );

    case "vault":
      return (
        <div className="space-y-4 opacity-90 pointer-events-none">
          <div className="bg-card p-3 rounded-xl border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Artifact Vault</span>
              <span className="text-[10px] text-muted-foreground font-mono">GET /api/artifacts?limit=200</span>
            </div>
            <div className="rounded-md border border-border bg-background px-3 py-2 text-[11px] text-muted-foreground">
              Search titles and summaries…
            </div>
            <div className="flex gap-1.5">
              <span className="px-2 py-0.5 bg-primary text-primary-foreground text-[9px] font-bold rounded border">All</span>
              <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[9px] rounded border border-border">brief</span>
              <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[9px] rounded border border-border">dossier</span>
              <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[9px] rounded border border-border">runbook</span>
            </div>
          </div>

          <div className="bg-card p-3 rounded-xl border border-border space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Weekly Client Brief</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded border border-border text-muted-foreground font-mono">brief · final</span>
            </div>
            <div className="text-[10px] text-muted-foreground">via revenue-lead-to-sale · quality A</div>
            <p className="text-[11px] text-muted-foreground">Summary of the artifact as stored… content loads on demand (GET /api/artifacts/:id).</p>
            <div className="flex gap-2 pt-1 text-[9px] font-semibold">
              <span className="px-2 py-1 rounded bg-muted text-muted-foreground">View</span>
              <span className="px-2 py-1 rounded bg-muted text-muted-foreground">Edit</span>
              <span className="px-2 py-1 rounded bg-destructive/10 text-destructive">Delete</span>
            </div>
          </div>

          <div className="bg-card p-3 rounded-xl border border-border space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Q3 Diagnostic Dossier</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded border border-border text-muted-foreground font-mono">dossier · draft</span>
            </div>
            <div className="text-[10px] text-muted-foreground">via founder-intake · confirm-delete step required</div>
          </div>
        </div>
      );

    case "run-console":
      return (
        <div className="space-y-4 opacity-90 pointer-events-none">
          <div className="bg-card p-3 rounded-xl border border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Run Console</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">read-only client sharing</span>
          </div>

          <div className="bg-card p-3 rounded-xl border border-border space-y-2">
            <div className="text-xs font-bold text-foreground">Create a share link</div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-2 rounded-md border border-border bg-background text-[11px] text-muted-foreground">Label (e.g. Acme Co — weekly report)</span>
              <span className="px-3 py-2 rounded-md border border-border bg-background text-[11px]">All runs ▾</span>
              <span className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-[11px] font-semibold">Create link</span>
            </div>
          </div>

          <div className="bg-card p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-1.5">
            <div className="text-[10px] font-bold text-emerald-600 uppercase font-mono">Share link created — secret shown only once</div>
            <div className="block rounded bg-background p-2 text-[10px] font-mono text-foreground overflow-x-auto whitespace-nowrap">
              https://agentlab-718497644379.us-central1.run.app/shared/runs?token=••••••••
            </div>
            <div className="flex gap-2 text-[9px] font-semibold">
              <span className="px-2 py-1 rounded bg-primary text-primary-foreground">Copy link</span>
              <span className="px-2 py-1 rounded border border-border text-muted-foreground">Done</span>
            </div>
          </div>

          <div className="bg-card p-3 rounded-xl border border-border space-y-1.5">
            <div className="text-xs font-bold text-foreground">Active links</div>
            <div className="flex justify-between p-1.5 bg-muted/40 rounded text-[11px] font-mono">
              <span>Acme Co — weekly report <span className="text-[9px] border border-border rounded px-1">all runs</span></span>
              <span className="text-muted-foreground">last opened · Revoke</span>
            </div>
            <div className="flex justify-between p-1.5 bg-muted/40 rounded text-[11px] font-mono">
              <span>Untitled link <span className="text-[9px] border border-border rounded px-1">single run</span></span>
              <span className="text-muted-foreground">never opened · Revoke</span>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="space-y-4 opacity-90 pointer-events-none">
          <div className="bg-card p-4 rounded-xl border border-border space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-xs font-bold text-foreground">Operational Module Overview</span>
              <Badge variant="outline" className="text-[10px]">Active</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-muted/40 rounded-lg">
                <span className="text-muted-foreground block text-[10px]">Status</span>
                <span className="font-semibold text-emerald-600">Configured & Connected</span>
              </div>
              <div className="p-3 bg-muted/40 rounded-lg">
                <span className="text-muted-foreground block text-[10px]">SOP Compliance</span>
                <span className="font-semibold text-foreground">100% Certified</span>
              </div>
            </div>
          </div>
        </div>
      );
  }
}
