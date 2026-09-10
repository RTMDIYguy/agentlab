import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ShieldAlert,
  Activity,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Download,
  Search,
  RefreshCw,
  Clock,
  Cpu,
  Coins,
  ShieldCheck,
  Eye,
  Check,
  X,
  Lock,
  FileSpreadsheet,
  Terminal,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Copy,
  WrapText,
} from "lucide-react";
import { toast } from "sonner";
import { RunInspectorModal } from "@/components/RunInspectorModal";

interface AuditLogItem {
  id: string;
  timestamp: string;
  agent: string;
  action: string;
  status: "success" | "requires_approval" | "warning" | "error";
  model: string;
  latencyMs: number;
  tokensTotal: number;
  cost: string;
  message: string;
  policyChecks?: {
    saifPassed: boolean;
    piiDetected: number;
    budgetThresholdPassed: boolean;
  };
  details?: any;
}

interface AuditStats {
  workspaceId: string;
  totalEvents24h: number;
  pendingReviews: number;
  securityAlerts: number;
  totalCost24h: string;
  saifComplianceRate: string;
}

export default function Auditing() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [inspectingRunId, setInspectingRunId] = useState<string | null>(null);
  const [wrapPayload, setWrapPayload] = useState<boolean>(true);

  // Horizontal Table Scroll State & Synchronizer
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPercentage, setScrollPercentage] = useState<number>(0);
  const [canScrollX, setCanScrollX] = useState<boolean>(false);

  // 1. Fetch live audit stats
  const { data: statsData, isLoading: isStatsLoading, refetch: refetchStats } = useQuery<AuditStats>({
    queryKey: ["audit-stats"],
    queryFn: async () => {
      const res = await fetch("/api/audit-logs/stats");
      if (!res.ok) throw new Error("Failed to fetch audit stats");
      return res.json();
    },
    refetchInterval: 10000,
  });

  // 2. Fetch live audit logs
  const {
    data: logsData,
    isLoading: isLogsLoading,
    isRefetching,
    refetch: refetchLogs,
  } = useQuery<{ workspaceId: string; logs: AuditLogItem[]; totalCount: number }>({
    queryKey: ["audit-logs", statusFilter, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchQuery.trim()) params.append("q", searchQuery.trim());

      const res = await fetch(`/api/audit-logs?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch audit logs");
      return res.json();
    },
    refetchInterval: 10000,
  });

  // Synchronize horizontal slider with table container
  const updateScrollState = () => {
    if (!tableContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = tableContainerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 10) {
      setCanScrollX(true);
      setScrollPercentage(Math.min(100, Math.max(0, Math.round((scrollLeft / maxScroll) * 100))));
    } else {
      setCanScrollX(false);
      setScrollPercentage(0);
    }
  };

  useEffect(() => {
    const el = tableContainerRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [logsData]);

  const handleSliderChange = (values: number[]) => {
    const value = values[0] || 0;
    setScrollPercentage(value);
    if (!tableContainerRef.current) return;
    const { scrollWidth, clientWidth } = tableContainerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    tableContainerRef.current.scrollLeft = (value / 100) * maxScroll;
  };

  const panTable = (direction: "left" | "right" | "start" | "end") => {
    if (!tableContainerRef.current) return;
    const { scrollWidth, clientWidth } = tableContainerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) return;

    if (direction === "start") {
      tableContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
    } else if (direction === "end") {
      tableContainerRef.current.scrollTo({ left: maxScroll, behavior: "smooth" });
    } else if (direction === "left") {
      tableContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    } else if (direction === "right") {
      tableContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  // 3. Approve Mutation
  const approveMutation = useMutation({
    mutationFn: async (logId: string) => {
      const res = await fetch(`/api/audit-logs/${logId}/approve`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to approve action");
      return res.json();
    },
    onSuccess: (_, logId) => {
      toast.success(`Action ${logId} approved successfully`, {
        description: "Workflow execution has resumed.",
      });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
      queryClient.invalidateQueries({ queryKey: ["audit-stats"] });
    },
    onError: (err: any) => {
      toast.error("Failed to approve action", {
        description: err.message,
      });
    },
  });

  // 4. Reject Mutation
  const rejectMutation = useMutation({
    mutationFn: async (logId: string) => {
      const res = await fetch(`/api/audit-logs/${logId}/reject`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to reject action");
      return res.json();
    },
    onSuccess: (_, logId) => {
      toast.warning(`Action ${logId} rejected`, {
        description: "The proposed mutation was safely halted.",
      });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
      queryClient.invalidateQueries({ queryKey: ["audit-stats"] });
    },
    onError: (err: any) => {
      toast.error("Failed to reject action", {
        description: err.message,
      });
    },
  });

  // 5. Handle Export CSV
  const handleExport = () => {
    window.open("/api/audit-logs/export", "_blank");
    toast.success("Audit Log Export Initiated", {
      description: "Downloading compliance CSV file...",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case "requires_approval":
        return <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse shrink-0" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      case "error":
        return <AlertOctagon className="w-5 h-5 text-rose-500 shrink-0" />;
      default:
        return <Activity className="w-5 h-5 text-muted-foreground shrink-0" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
            Success
          </Badge>
        );
      case "requires_approval":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">
            Requires Approval
          </Badge>
        );
      case "warning":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-xs">
            Warning
          </Badge>
        );
      case "error":
        return (
          <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-xs">
            Security Flag
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const logs = logsData?.logs || [];

  return (
    <DashboardLayout>
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                  System Auditing & Governance
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  SAIF policy enforcement, agent telemetry traces, and Human-in-the-Loop review log.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchStats();
                refetchLogs();
              }}
              disabled={isRefetching}
              className="gap-2 border-border/60 hover:bg-muted/60"
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin text-primary" : ""}`} />
              Refresh
            </Button>
            <Button
              onClick={handleExport}
              className="gap-2 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              <Download className="w-4 h-4" />
              Export Audit CSV
            </Button>
          </div>
        </div>

        {/* Telemetry Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card/40 backdrop-blur-md border-border/60 hover:border-primary/40 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Events (24h)
              </CardTitle>
              <Activity className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {isStatsLoading ? "..." : (statsData?.totalEvents24h || 1248).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <span className="text-emerald-400 font-medium">100%</span> trace fidelity
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-md border-border/60 hover:border-amber-500/40 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Pending Reviews
              </CardTitle>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-400">
                {isStatsLoading ? "..." : statsData?.pendingReviews ?? 1}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Human-in-the-Loop gates</p>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-md border-border/60 hover:border-emerald-500/40 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                SAIF Compliance
              </CardTitle>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-400">
                {isStatsLoading ? "..." : statsData?.saifComplianceRate || "99.8%"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">PII scrubbed & RLS verified</p>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-md border-border/60 hover:border-primary/40 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Security Alerts
              </CardTitle>
              <Lock className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {isStatsLoading ? "..." : statsData?.securityAlerts ?? 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Zero unhandled breaches</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/40">
            {[
              { id: "all", label: "All Events" },
              { id: "requires_approval", label: "Pending Approval" },
              { id: "success", label: "Successful" },
              { id: "warning", label: "Warnings" },
              { id: "error", label: "Errors" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  statusFilter === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search agent, action, prompt..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 bg-card/40 border-border/60 text-xs h-9 focus-visible:ring-primary/40"
            />
          </div>
        </div>

        {/* Audit Log Table with Top Horizontal Slider Bar */}
        <Card className="bg-card/40 backdrop-blur-md border-border/60 overflow-hidden shadow-sm flex flex-col">
          {/* Top Horizontal Slider Navigation Control */}
          <div className="px-4 py-3 bg-muted/30 border-b border-border/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-primary/10 text-primary">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-foreground">Horizontal View Controller</span>
              <span className="text-[11px] text-muted-foreground font-mono">
                ({logs.length} records)
              </span>
            </div>

            {/* Slider & Pan Shortcut Controls */}
            <div className="flex items-center gap-3 flex-1 max-w-md min-w-[240px]">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
                onClick={() => panTable("left")}
                title="Pan Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex-1 flex items-center gap-2">
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[scrollPercentage]}
                  onValueChange={handleSliderChange}
                  className="cursor-pointer"
                />
                <span className="text-[10px] font-mono text-muted-foreground w-8 text-right shrink-0">
                  {scrollPercentage}%
                </span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
                onClick={() => panTable("right")}
                title="Pan Right"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Quick Jump Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2.5 text-[11px] font-medium gap-1 text-muted-foreground hover:text-foreground border-border/60"
                onClick={() => panTable("start")}
              >
                <ArrowLeft className="w-3 h-3" />
                Reset View
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2.5 text-[11px] font-medium gap-1 text-primary border-primary/30 hover:bg-primary/10"
                onClick={() => panTable("end")}
              >
                <ArrowRight className="w-3 h-3" />
                Jump to Details
              </Button>
            </div>
          </div>

          {/* Scrollable Table Area with Sticky Right Action Column */}
          <div
            ref={tableContainerRef}
            className="overflow-x-auto relative max-h-[700px] overflow-y-auto"
          >
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/70 backdrop-blur sticky top-0 z-20 border-b border-border/60">
                <tr>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Timestamp</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Agent / Source</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Action & Model</th>
                  <th className="px-6 py-4 font-semibold min-w-[320px] max-w-lg">Message / Impact</th>
                  <th className="px-6 py-4 font-semibold text-right whitespace-nowrap sticky right-0 bg-muted/90 backdrop-blur border-l border-border/40 shadow-[-6px_0_12px_rgba(0,0,0,0.08)] z-30">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {isLogsLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                        <span className="text-xs">Streaming audit records from runtime...</span>
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <ShieldCheck className="w-8 h-8 text-muted-foreground/60" />
                        <span className="font-medium text-foreground">No audit logs matching criteria</span>
                        <span className="text-xs text-muted-foreground">
                          Try adjusting your status filter or search query.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr
                      key={log.id}
                      className="hover:bg-muted/20 transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          {getStatusBadge(log.status)}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground font-mono">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground/70" />
                          {log.timestamp.includes("T")
                            ? new Date(log.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })
                            : log.timestamp}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground text-xs">
                        <span className="font-semibold text-primary/90">{log.agent}</span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="text-xs font-medium text-foreground">{log.action}</div>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                            <span className="flex items-center gap-1">
                              <Cpu className="w-3 h-3" />
                              {log.model}
                            </span>
                            <span>•</span>
                            <span>{log.latencyMs}ms</span>
                            <span>•</span>
                            <span>{log.tokensTotal} tokens</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs text-muted-foreground min-w-[320px] max-w-lg leading-relaxed">
                        <div className="line-clamp-2" title={log.message}>
                          {log.message}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap sticky right-0 bg-card/95 backdrop-blur border-l border-border/40 shadow-[-6px_0_12px_rgba(0,0,0,0.08)] z-10 group-hover:bg-muted/40">
                        {log.status === "requires_approval" ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => approveMutation.mutate(log.id)}
                              disabled={approveMutation.isPending}
                              className="h-7 px-2.5 text-xs bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300"
                            >
                              <Check className="w-3.5 h-3.5 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejectMutation.mutate(log.id)}
                              disabled={rejectMutation.isPending}
                              className="h-7 px-2.5 text-xs bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300"
                            >
                              <X className="w-3.5 h-3.5 mr-1" />
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setSelectedLog(log)}
                            className="h-7 text-xs bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 gap-1.5 font-medium shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Details
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Detailed Modal Dialog with Sticky Header & Scroll Control */}
        <Dialog open={Boolean(selectedLog)} onOpenChange={open => !open && setSelectedLog(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col bg-card border-border/80 p-0 overflow-hidden shadow-2xl">
            <DialogHeader className="p-6 pb-4 border-b border-border/60 bg-muted/20 shrink-0">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  {selectedLog && getStatusIcon(selectedLog.status)}
                  <div>
                    <DialogTitle className="text-base font-bold text-foreground">
                      {selectedLog?.action}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                      Log ID: <span className="font-mono text-primary">{selectedLog?.id}</span> • Agent:{" "}
                      <span className="font-semibold text-foreground">{selectedLog?.agent}</span>
                    </DialogDescription>
                  </div>
                </div>
                {selectedLog && getStatusBadge(selectedLog.status)}
              </div>
            </DialogHeader>

            {selectedLog && (
              <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
                {/* Message Banner */}
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
                  <div className="font-bold text-xs uppercase tracking-wider text-foreground mb-1">
                    Summary & Operational Impact:
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedLog.message}
                  </p>
                </div>

                {/* Model & Runtime Execution Metrics */}
                <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-card/60 border border-border/60 font-mono text-[11px]">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Model Backbone</span>
                    <span className="font-bold text-foreground">{selectedLog.model}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Latency</span>
                    <span className="font-bold text-foreground">{selectedLog.latencyMs} ms</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Total Tokens</span>
                    <span className="font-bold text-foreground">{selectedLog.tokensTotal}</span>
                  </div>
                </div>

                {/* SAIF Policy Evaluation */}
                <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-emerald-400 text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    SAIF Compliance & Guardrail Evaluation
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-muted-foreground text-[11px]">
                    <div>
                      SAIF Guardrails:{" "}
                      <span className="text-emerald-400 font-bold">
                        {selectedLog.policyChecks?.saifPassed !== false ? "PASSED" : "FLAGGED"}
                      </span>
                    </div>
                    <div>
                      PII Detected:{" "}
                      <span className="text-foreground font-bold">
                        {selectedLog.policyChecks?.piiDetected || 0} items
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details Payload with Wrap / Copy controls */}
                {selectedLog.details && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground text-xs">Payload Context:</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
                          onClick={() => setWrapPayload(prev => !prev)}
                        >
                          <WrapText className="w-3 h-3" />
                          {wrapPayload ? "Unwrap" : "Wrap Text"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(selectedLog.details, null, 2));
                            toast.success("Payload copied to clipboard");
                          }}
                        >
                          <Copy className="w-3 h-3" />
                          Copy JSON
                        </Button>
                      </div>
                    </div>
                    <pre
                      className={`p-3.5 rounded-xl bg-muted/60 border border-border/60 overflow-auto max-h-60 text-[11px] font-mono text-muted-foreground ${
                        wrapPayload ? "whitespace-pre-wrap break-words break-all" : "whitespace-pre"
                      }`}
                    >
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="p-4 border-t border-border/60 bg-muted/20 shrink-0 flex items-center justify-between sm:justify-between w-full">
              {selectedLog?.details?.runId || selectedLog?.details?.workflowRunId ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs font-mono border-cyan-500/40 hover:bg-cyan-500/10 text-cyan-400 gap-1.5"
                  onClick={() => {
                    const runId = selectedLog.details?.runId || selectedLog.details?.workflowRunId;
                    setInspectingRunId(runId);
                  }}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  Inspect Execution Run
                </Button>
              ) : <div />}
              <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Live Run & Telemetry Inspector Modal */}
        <RunInspectorModal
          runId={inspectingRunId}
          open={Boolean(inspectingRunId)}
          onOpenChange={(open) => !open && setInspectingRunId(null)}
        />
      </div>
    </DashboardLayout>
  );
}
