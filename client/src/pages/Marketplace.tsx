import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Footer } from "@/components/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  ShoppingBag,
  BookOpen,
  Sparkles,
  Layers,
  Zap,
  CheckCircle2,
  TrendingUp,
  Share2,
  Target,
  FileText,
  ExternalLink,
  ShieldCheck,
  Check,
  RefreshCw,
  Cpu,
  Clock,
  ArrowRight,
  Sliders,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

interface MarketplaceItem {
  id: string;
  category: "apps" | "books" | "playbooks";
  name: string;
  description: string;
  price: string;
  monthlyPrice?: string;
  provider?: string;
  author?: string;
  department?: string;
  departmentCode?: string;
  type?: string;
  status?: string;
  statusVariant?: "default" | "secondary" | "outline" | "destructive";
  isMounted?: boolean;
  workflowsCount?: number;
  automationRate?: string;
  cycleTimeReduction?: string;
  rating?: number;
  format?: string;
  iconName?: string;
  tags: string[];
  launchUrl?: string;
  actionUrl?: string;
  actionLabel?: string;
  isExternal?: boolean;
}

export default function Marketplace() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPlaybook, setSelectedPlaybook] = useState<MarketplaceItem | null>(null);
  const [showEntitlementsModal, setShowEntitlementsModal] = useState(false);

  // 1. Fetch live marketplace items
  const { data: marketplaceData, isLoading, refetch, isRefetching } = useQuery<{
    workspaceId: string;
    playbooks: MarketplaceItem[];
    apps: MarketplaceItem[];
    books: MarketplaceItem[];
    totalCount: number;
    mountedCount: number;
  }>({
    queryKey: ["marketplace-items"],
    queryFn: async () => {
      const res = await fetch("/api/marketplace/items");
      if (!res.ok) throw new Error("Failed to fetch marketplace items");
      return res.json();
    },
    refetchInterval: 15000,
  });

  // 2. Mount Playbook Mutation
  const mountMutation = useMutation({
    mutationFn: async (playbookId: string) => {
      const res = await fetch(`/api/marketplace/mount/${playbookId}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to mount playbook");
      return res.json();
    },
    onSuccess: (_, playbookId) => {
      toast.success("Playbook Mounted Successfully", {
        description: `DAG workflows for ${playbookId} are now unlocked and active in Command Center.`,
      });
      queryClient.invalidateQueries({ queryKey: ["marketplace-items"] });
    },
    onError: (err: any) => {
      toast.error("Failed to mount playbook", {
        description: err.message,
      });
    },
  });

  // 3. Unmount Playbook Mutation
  const unmountMutation = useMutation({
    mutationFn: async (playbookId: string) => {
      const res = await fetch(`/api/marketplace/unmount/${playbookId}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to unmount playbook");
      return res.json();
    },
    onSuccess: (_, playbookId) => {
      toast.warning("Playbook Unmounted", {
        description: `Playbook ${playbookId} removed from active workspace entitlements.`,
      });
      queryClient.invalidateQueries({ queryKey: ["marketplace-items"] });
    },
    onError: (err: any) => {
      toast.error("Failed to unmount playbook", {
        description: err.message,
      });
    },
  });

  const playbooks = marketplaceData?.playbooks || [];
  const apps = marketplaceData?.apps || [];
  const books = marketplaceData?.books || [];

  const allItems: MarketplaceItem[] = [...playbooks, ...apps, ...books];

  const filteredItems = allItems.filter((item) => {
    const matchesTab = activeTab === "all" || item.category === activeTab;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tags && item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesTab && matchesSearch;
  });

  const getCategoryIcon = (category: string, iconName?: string) => {
    if (iconName === "Target") return <Target className="w-5 h-5" />;
    if (iconName === "Share2") return <Share2 className="w-5 h-5" />;
    if (iconName === "TrendingUp") return <TrendingUp className="w-5 h-5" />;
    if (iconName === "Zap") return <Zap className="w-5 h-5" />;
    if (iconName === "FileText") return <FileText className="w-5 h-5" />;
    if (iconName === "Sparkles") return <Sparkles className="w-5 h-5" />;
    if (category === "books") return <BookOpen className="w-5 h-5" />;
    if (category === "playbooks") return <Layers className="w-5 h-5" />;
    return <ShoppingBag className="w-5 h-5" />;
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                  Ecosystem Marketplace
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Deploy live applications, authority books, and 7-department autonomous workflow playbooks.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="gap-2 border-border/60 hover:bg-muted/60"
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin text-primary" : ""}`} />
              Refresh
            </Button>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search apps, books, playbooks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-card/40 border-border/60 text-xs h-9 focus-visible:ring-primary/40"
              />
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 max-w-md bg-muted/40 border border-border/40 p-1">
            <TabsTrigger value="all" className="text-xs">All Items ({allItems.length})</TabsTrigger>
            <TabsTrigger value="playbooks" className="text-xs">Playbooks ({playbooks.length})</TabsTrigger>
            <TabsTrigger value="apps" className="text-xs">Live Apps ({apps.length})</TabsTrigger>
            <TabsTrigger value="books" className="text-xs">Books ({books.length})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Grid of Items */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading ecosystem catalog & workspace entitlements...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-border/60 rounded-2xl bg-card/20">
            <ShoppingBag className="w-10 h-10 mx-auto text-muted-foreground/60 mb-2" />
            <h3 className="text-base font-semibold text-foreground">No items match your search</h3>
            <p className="text-xs text-muted-foreground mt-1">Try clearing your filters or search keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              return (
                <Card
                  key={item.id}
                  className={`flex flex-col bg-card/40 backdrop-blur-md border transition-all duration-200 hover:shadow-lg ${
                    item.isMounted
                      ? "border-primary/50 shadow-sm shadow-primary/5 ring-1 ring-primary/20"
                      : "border-border/70 hover:border-primary/40"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                        item.isMounted
                          ? "bg-primary/20 border-primary/40 text-primary"
                          : "bg-muted/60 border-border/60 text-muted-foreground"
                      }`}>
                        {getCategoryIcon(item.category, item.iconName)}
                      </div>

                      {item.category === "playbooks" ? (
                        item.isMounted ? (
                          <Badge className="bg-primary/20 text-primary border-primary/30 text-xs font-semibold gap-1">
                            <Check className="w-3 h-3" />
                            Mounted
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-muted-foreground border-border/70">
                            Available
                          </Badge>
                        )
                      ) : "status" in item && item.status ? (
                        <Badge variant={item.statusVariant || "secondary"} className="text-xs">
                          {item.status}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="font-semibold text-primary text-xs">
                          {item.price}
                        </Badge>
                      )}
                    </div>

                    <CardTitle className="text-lg font-bold text-foreground line-clamp-1">{item.name}</CardTitle>
                    <CardDescription className="text-xs font-medium text-muted-foreground">
                      {"provider" in item && item.provider
                        ? item.provider
                        : "author" in item && item.author
                        ? `By ${item.author}`
                        : item.department}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 pb-4 space-y-3">
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>

                    {item.category === "playbooks" && (
                      <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-muted/40 border border-border/40 text-[11px] font-mono">
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Automation</span>
                          <span className="font-semibold text-emerald-400">{item.automationRate || "90%"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Time Saved</span>
                          <span className="font-semibold text-foreground">{item.cycleTimeReduction || "5.0 hrs/wk"}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.tags && item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-muted/60 text-muted-foreground text-[10px] rounded-md font-medium border border-border/40"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-foreground block">
                        {item.price || "Included in OS"}
                      </span>
                      {item.category === "playbooks" && (
                        <span className="text-[10px] text-muted-foreground">Monthly entitlement</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.category === "playbooks" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs text-muted-foreground hover:text-foreground px-2"
                          onClick={() => setSelectedPlaybook(item)}
                        >
                          Blueprint
                        </Button>
                      )}

                      <Button
                        size="sm"
                        disabled={mountMutation.isPending || unmountMutation.isPending}
                        className={`h-8 text-xs font-medium gap-1.5 shadow-sm ${
                          item.isMounted
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-primary hover:bg-primary/90 text-primary-foreground"
                        }`}
                        onClick={() => {
                          if (item.category === "books") {
                            if (item.id === "book-bgw") {
                              setLocation("/book");
                            } else {
                              toast.success(`Opening ${item.name} Gumroad checkout ($19.99)...`);
                              window.open("https://gumroad.com", "_blank");
                            }
                          } else if (item.category === "apps") {
                            if (item.launchUrl?.startsWith("http")) {
                              window.open(item.launchUrl, "_blank");
                            } else if (item.launchUrl) {
                              setLocation(item.launchUrl);
                            } else {
                              setLocation("/command-center");
                            }
                          } else if (item.category === "playbooks") {
                            if (item.isMounted) {
                              toast.info(`${item.name} is active`, {
                                description: "Navigating to Command Center to dispatch workflows...",
                              });
                              setLocation("/command-center");
                            } else {
                              mountMutation.mutate(item.id);
                            }
                          }
                        }}
                      >
                        {item.category === "books" ? (
                          <>
                            <BookOpen className="w-3.5 h-3.5" />
                            {item.actionLabel || "Get Book"}
                          </>
                        ) : item.category === "apps" ? (
                          <>
                            {item.isExternal ? <ExternalLink className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                            Launch App
                          </>
                        ) : item.isMounted ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Active in OS
                          </>
                        ) : (
                          <>
                            <Layers className="w-3.5 h-3.5" />
                            Mount to Workspace
                          </>
                        )}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* Value Proposition Box */}
        <div className="p-6 md:p-8 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md shadow-sm">
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Ownable OS Continuity & Workspace Tenancy
            </h3>
            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
              All live applications and modular knowledge playbooks mount directly into your isolated client workspace (`workspace_id` tenancy).
              Mounted DAG workflows immediately surface in the Command Center for automated dispatch and swarm execution.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <span className="text-xs text-muted-foreground block">Active Entitlements</span>
              <span className="text-sm font-bold text-primary">
                {marketplaceData?.mountedCount || 2} of {playbooks.length} Playbooks
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEntitlementsModal(true)}
              className="border-primary/40 hover:bg-primary/10 text-xs gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5 text-primary" />
              View Workspace Entitlements
            </Button>
          </div>
        </div>

        {/* Blueprint Details Modal */}
        <Dialog open={Boolean(selectedPlaybook)} onOpenChange={(open) => !open && setSelectedPlaybook(null)}>
          <DialogContent className="max-w-xl bg-card border-border/80">
            <DialogHeader>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold">
                    {selectedPlaybook?.name}
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    {selectedPlaybook?.department} • Price: {selectedPlaybook?.price}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {selectedPlaybook && (
              <div className="space-y-4 text-xs pt-2">
                <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
                  <span className="font-semibold text-foreground">Playbook Scope: </span>
                  <span className="text-muted-foreground">{selectedPlaybook.description}</span>
                </div>

                <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-card/60 border border-border/60 font-mono text-[11px]">
                  <div>
                    <span className="text-muted-foreground block">DAG Workflows</span>
                    <span className="font-bold text-foreground">{selectedPlaybook.workflowsCount || 8} Workflows</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Automation</span>
                    <span className="font-bold text-emerald-400">{selectedPlaybook.automationRate || "90%"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Time Saved</span>
                    <span className="font-bold text-foreground">{selectedPlaybook.cycleTimeReduction || "5.0 hrs/wk"}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-primary">
                    <ShieldCheck className="w-4 h-4" />
                    Command Center Integration
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Mounting this playbook provisions all associated DAG steps, human-in-the-loop review triggers, and model prompts directly into your workspace.
                  </p>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              {selectedPlaybook?.isMounted ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedPlaybook) unmountMutation.mutate(selectedPlaybook.id);
                    setSelectedPlaybook(null);
                  }}
                  className="text-xs border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                >
                  Unmount Playbook
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    if (selectedPlaybook) mountMutation.mutate(selectedPlaybook.id);
                    setSelectedPlaybook(null);
                  }}
                  className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  Mount to Workspace
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setSelectedPlaybook(null)} className="text-xs">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Workspace Entitlements Modal */}
        <Dialog open={showEntitlementsModal} onOpenChange={setShowEntitlementsModal}>
          <DialogContent className="max-w-lg bg-card border-border/80">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-primary" />
                <DialogTitle className="text-lg font-bold">
                  Active Workspace Entitlements
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs">
                Workspace ID: <span className="font-mono text-primary">{marketplaceData?.workspaceId}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-xs pt-2">
              <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
                <span className="font-semibold text-foreground">Current Status: </span>
                <span className="text-emerald-400 font-medium">
                  {marketplaceData?.mountedCount} of {playbooks.length} Knowledge Playbooks Mounted
                </span>
              </div>

              <div className="divide-y divide-border/40 border border-border/60 rounded-lg overflow-hidden">
                {playbooks.map((p) => (
                  <div key={p.id} className="p-3 flex items-center justify-between bg-card/40">
                    <div>
                      <div className="font-semibold text-foreground text-xs">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground">{p.department}</div>
                    </div>
                    {p.isMounted ? (
                      <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] gap-1">
                        <Check className="w-3 h-3" />
                        Active
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => mountMutation.mutate(p.id)}
                        className="h-6 text-[10px] px-2 border-primary/40 text-primary hover:bg-primary/10"
                      >
                        Mount
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button size="sm" onClick={() => setShowEntitlementsModal(false)} className="text-xs">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </DashboardLayout>
  );
}
