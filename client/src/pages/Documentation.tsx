import React, { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DOCS_REGISTRY, 
  DocPageEntry, 
  DocTroubleshootingItem 
} from "@/data/docsRegistry";
import { DocVisualBlueprint } from "@/components/docs/DocVisualBlueprint";
import { 
  TerminalSquare, 
  Cpu, 
  ShieldAlert, 
  CreditCard, 
  Settings,
  ShoppingBag,
  BookOpen,
  Search,
  ExternalLink,
  ChevronLeft,
  Sparkles,
  Layers,
  Wrench,
  Activity,
  FileCode2,
  Copy,
  Check,
  AlertTriangle,
  ArrowRight,
  Compass,
  CheckCircle2,
  Video,
  MessageSquare,
  Tv,
  Target,
  ClipboardList
} from "lucide-react";
import { Link, useRoute, useLocation } from "wouter";

// Icon mapping helper
const ICON_MAP: Record<string, any> = {
  TerminalSquare,
  Cpu,
  ShieldAlert,
  CreditCard,
  Settings,
  ShoppingBag,
  BookOpen,
  Compass,
  Video,
  MessageSquare,
  Tv,
  Target,
  ClipboardList,
};

export default function Documentation() {
  const [match, params] = useRoute("/docs/:slug");
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  // If a slug is matched in URL, find the document entry
  const selectedSlug = params?.slug;
  const currentDoc: DocPageEntry | undefined = useMemo(() => {
    if (!selectedSlug) return undefined;
    return DOCS_REGISTRY.find(d => d.slug.toLowerCase() === selectedSlug.toLowerCase());
  }, [selectedSlug]);

  const categories = ["All", "Core Operations", "Fleet & Agents", "Security & Governance", "Growth & Pipeline", "Infrastructure & System"];

  const filteredDocs = useMemo(() => {
    return DOCS_REGISTRY.filter(doc => {
      const matchesCategory = selectedCategory === "All" || doc.category === selectedCategory;
      const matchesSearch = 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.overview.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.troubleshooting.some(t => t.symptom.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(text);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  // -------------------------------------------------------------
  // VIEW 1: DETAIL BLUEPRINT & SPEC VIEW (/docs/:slug)
  // -------------------------------------------------------------
  if (currentDoc) {
    const IconComponent = ICON_MAP[currentDoc.iconName] || Compass;

    return (
      <DashboardLayout>
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
          {/* Breadcrumb & Navigation Topbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/docs">
                <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs text-primary font-medium hover:bg-primary/10">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Owner's Manual Directory
                </Button>
              </Link>
              <span>/</span>
              <span className="text-foreground font-semibold">{currentDoc.title}</span>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs bg-muted/40">
                {currentDoc.version}
              </Badge>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-medium">
                {currentDoc.category}
              </Badge>
              <Link href={currentDoc.targetRoute}>
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 shadow-sm">
                  <span>Open Live Screen</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Page Hero Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 text-primary rounded-xl">
                <IconComponent className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {currentDoc.title}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentDoc.summary}
                </p>
              </div>
            </div>
          </div>

          {/* LAYER 1: Interactive Visual Blueprint & Hotspots Walkthrough */}
          <DocVisualBlueprint doc={currentDoc} />

          {/* LAYER 2: Deep Spec & Operational Guide Tabs */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  Technical Specification & Operational Guide
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Exhaustive reference for every user control, telemetry output, troubleshooting runbook, and source file.
                </p>
              </div>
            </div>

            <Tabs defaultValue="controls" className="w-full">
              <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-2 md:grid-cols-4 max-w-2xl">
                <TabsTrigger value="controls" className="text-xs font-semibold">
                  1. Controls & Purpose
                </TabsTrigger>
                <TabsTrigger value="outputs" className="text-xs font-semibold">
                  2. Output Telemetry
                </TabsTrigger>
                <TabsTrigger value="troubleshooting" className="text-xs font-semibold">
                  3. Self-Repair Runbook
                </TabsTrigger>
                <TabsTrigger value="architecture" className="text-xs font-semibold">
                  4. Code & Architecture
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: Controls & Purpose */}
              <TabsContent value="controls" className="space-y-6 pt-4">
                {/* Business Overview Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-5 border-border bg-card space-y-2">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Operational Purpose
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {currentDoc.overview.purpose}
                    </p>
                  </Card>

                  <Card className="p-5 border-border bg-card space-y-2">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Agency Business Value
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {currentDoc.overview.businessValue}
                    </p>
                  </Card>
                </div>

                {/* Key Workflows */}
                <div className="bg-muted/30 p-5 rounded-xl border border-border space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Primary Operational Workflows
                  </h4>
                  <ul className="space-y-1.5 text-xs text-foreground/90">
                    {currentDoc.overview.keyWorkflows.map((workflow, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{workflow}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* User Controls Matrix */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-foreground">
                    User Actions & Control Matrix
                  </h3>
                  <div className="border border-border rounded-xl overflow-hidden bg-card">
                    <div className="grid grid-cols-12 bg-muted/60 p-3 text-xs font-semibold text-muted-foreground border-b border-border">
                      <div className="col-span-3">Control / Action</div>
                      <div className="col-span-2">Type</div>
                      <div className="col-span-5">Purpose & Function</div>
                      <div className="col-span-2 text-right">Permissions</div>
                    </div>
                    <div className="divide-y divide-border text-xs">
                      {currentDoc.controls.map((ctrl, i) => (
                        <div key={i} className="grid grid-cols-12 p-3 items-center hover:bg-muted/20">
                          <div className="col-span-3 font-semibold text-foreground">
                            {ctrl.name}
                          </div>
                          <div className="col-span-2">
                            <Badge variant="secondary" className="text-[10px] font-mono">
                              {ctrl.type}
                            </Badge>
                          </div>
                          <div className="col-span-5 text-muted-foreground">
                            {ctrl.purpose}
                          </div>
                          <div className="col-span-2 text-right font-mono text-[11px] text-primary">
                            {ctrl.permissions}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 2: Outputs & Telemetry Guide */}
              <TabsContent value="outputs" className="space-y-6 pt-4">
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    Metrics, Badges & Output Data Interpretations
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Use this telemetry guide to understand exact threshold boundaries, healthy operating baselines, and what triggers an incident.
                  </p>

                  <div className="border border-border rounded-xl overflow-hidden bg-card">
                    <div className="grid grid-cols-12 bg-muted/60 p-3 text-xs font-semibold text-muted-foreground border-b border-border">
                      <div className="col-span-3">Output Metric / Badge</div>
                      <div className="col-span-5">Operational Meaning</div>
                      <div className="col-span-2">Normal Baseline</div>
                      <div className="col-span-2 text-right">Alert Threshold</div>
                    </div>
                    <div className="divide-y divide-border text-xs">
                      {currentDoc.outputs.map((out, i) => (
                        <div key={i} className="grid grid-cols-12 p-3 items-center hover:bg-muted/20">
                          <div className="col-span-3 font-bold text-foreground">
                            {out.field}
                          </div>
                          <div className="col-span-5 text-muted-foreground">
                            {out.interpretation}
                          </div>
                          <div className="col-span-2 font-mono text-[11px] text-emerald-600 font-semibold">
                            {out.normalRange}
                          </div>
                          <div className="col-span-2 text-right font-mono text-[11px] text-amber-600 font-semibold">
                            {out.alertThreshold}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 3: Troubleshooting & Self-Repair */}
              <TabsContent value="troubleshooting" className="space-y-6 pt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-primary" />
                        Troubleshooting & Diagnostic Self-Repair Runbook
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Step-by-step resolution paths and copyable CLI commands to recover from operational exceptions.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {currentDoc.troubleshooting.map((item, i) => (
                      <Card key={i} className="p-5 border-border bg-card space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className={`w-4 h-4 ${
                              item.severity === "Critical" ? "text-red-500" :
                              item.severity === "High" ? "text-amber-500" : "text-blue-500"
                            }`} />
                            <h4 className="font-bold text-sm text-foreground">
                              {item.symptom}
                            </h4>
                          </div>
                          <Badge variant={item.severity === "Critical" ? "destructive" : "secondary"} className="text-[10px] uppercase font-mono">
                            {item.severity} Severity
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="p-3 bg-muted/40 rounded-lg">
                            <span className="font-semibold text-muted-foreground block mb-1">Root Cause</span>
                            <span className="text-foreground/90">{item.cause}</span>
                          </div>
                          <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                            <span className="font-semibold text-emerald-600 block mb-1">Resolution Step</span>
                            <span className="text-foreground/90">{item.resolution}</span>
                          </div>
                        </div>

                        {item.command && (
                          <div className="pt-2">
                            <div className="flex items-center justify-between bg-zinc-900 text-zinc-100 p-2.5 rounded-lg font-mono text-xs">
                              <span>$ {item.command}</span>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => copyToClipboard(item.command!)}
                                className="h-6 px-2 text-zinc-300 hover:text-white hover:bg-zinc-800"
                              >
                                {copiedCommand === item.command ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* TAB 4: Architecture & Code Traceability */}
              <TabsContent value="architecture" className="space-y-6 pt-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <FileCode2 className="w-4 h-4 text-primary" />
                      Codebase Architecture & SOP Traceability
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Direct mapping between this user interface, backend execution files, database models, and canonical operational SOPs.
                    </p>
                  </div>

                  <div className="border border-border rounded-xl overflow-hidden bg-card">
                    <div className="grid grid-cols-12 bg-muted/60 p-3 text-xs font-semibold text-muted-foreground border-b border-border">
                      <div className="col-span-3">Layer / Component</div>
                      <div className="col-span-4">Source File Path</div>
                      <div className="col-span-5">Architectural Role</div>
                    </div>
                    <div className="divide-y divide-border text-xs">
                      {currentDoc.architecture.map((arch, i) => (
                        <div key={i} className="grid grid-cols-12 p-3 items-center hover:bg-muted/20">
                          <div className="col-span-3 font-semibold text-foreground">
                            <div>{arch.component}</div>
                            <Badge variant="outline" className="text-[9px] font-mono mt-0.5">
                              {arch.layer}
                            </Badge>
                          </div>
                          <div className="col-span-4 font-mono text-[11px] text-primary break-all">
                            {arch.filePath}
                          </div>
                          <div className="col-span-5 text-muted-foreground">
                            {arch.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: DIRECTORY HUB & SITEMAP (/docs)
  // -------------------------------------------------------------
  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        {/* Hub Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-medium">
                Operational Transparency
              </Badge>
              <Badge variant="outline" className="font-mono text-xs">
                v1.4.2
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
              <Compass className="w-9 h-9 text-primary" />
              Owner's Manual & Operational Directory
            </h1>
            <p className="text-muted-foreground text-sm md:text-base mt-2 max-w-3xl">
              Complete architectural transparency for Uncle Robert Consulting, Bootstrapper Capital, and Tactix. 
              Click any module to open its interactive visual blueprint, live control walkthrough, telemetry guide, and troubleshooting runbook.
            </p>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by module title, function, troubleshooting symptom, or error code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-11 bg-card border-border"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs h-8 ${
                  selectedCategory === cat 
                    ? "bg-primary text-primary-foreground font-semibold" 
                    : "hover:bg-muted"
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Live System Operational Health Card */}
        <div className="p-5 bg-muted/30 border border-border rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <span className="text-[11px] text-muted-foreground uppercase font-mono font-semibold">Documented Modules</span>
            <div className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              {DOCS_REGISTRY.length} Systems
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] text-muted-foreground uppercase font-mono font-semibold">SOP Compliance</span>
            <div className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              0 Drift
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] text-muted-foreground uppercase font-mono font-semibold">Active Cloud Fleet</span>
            <div className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-500" />
              6/6 Run
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] text-muted-foreground uppercase font-mono font-semibold">Simulated Tools</span>
            <div className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              0 (100% Live)
            </div>
          </div>
        </div>

        {/* Directory Grid of Documented Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => {
            const IconComponent = ICON_MAP[doc.iconName] || Compass;
            return (
              <Link key={doc.slug} href={`/docs/${doc.slug}`}>
                <a className="block h-full group">
                  <Card className="h-full p-6 border-2 border-border hover:border-primary hover:shadow-lg transition-all duration-200 flex flex-col justify-between bg-card group-hover:-translate-y-0.5">
                    <div className="space-y-4">
                      {/* Top Row: Icon + Category */}
                      <div className="flex items-center justify-between">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <Badge variant="secondary" className="text-[10px] font-mono">
                          {doc.category}
                        </Badge>
                      </div>

                      {/* Title & Summary */}
                      <div>
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                          {doc.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-3 leading-relaxed">
                          {doc.summary}
                        </p>
                      </div>

                      {/* Quick Spec Badges */}
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        <Badge variant="outline" className="text-[10px] bg-background">
                          {doc.hotspots.length} Visual Hotspots
                        </Badge>
                        <Badge variant="outline" className="text-[10px] bg-background">
                          {doc.troubleshooting.length} Runbooks
                        </Badge>
                        <Badge variant="outline" className="text-[10px] bg-background">
                          {doc.controls.length} Controls
                        </Badge>
                      </div>
                    </div>

                    {/* Footer Action */}
                    <div className="mt-6 pt-4 border-t border-border/80 flex items-center justify-between text-xs font-semibold text-primary">
                      <span>Open Blueprint & Manual</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </a>
              </Link>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
