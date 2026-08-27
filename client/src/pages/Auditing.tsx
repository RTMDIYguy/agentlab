import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AlertCircle, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "date-fns";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Auditing() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });

  const { data: realLogs, isLoading, refetch } = trpc.auditing.getAuditLogs.useQuery();
  const resolveMutation = trpc.auditing.resolveLog.useMutation();

  const handleResolve = async (id: string) => {
    try {
      await resolveMutation.mutateAsync({ logId: id });
      toast.success("Anomaly marked as resolved.");
      refetch();
    } catch (e) {
      toast.error("Failed to resolve anomaly.");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error": return "destructive";
      case "warning": return "secondary";
      case "info": return "default";
      default: return "outline";
    }
  };

  return (
    <DashboardLayout>
      <div className="border-b border-border bg-background">
        <div className="px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Auditing & Security</h1>
            <p className="text-sm text-muted-foreground">
              Troubleshooting, repair, auditing and reporting
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <FileText className="w-4 h-4" /> Download Report
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">For Advanced Users</h4>
            <p className="text-sm opacity-90 mt-1">
              Direct log manipulation or system repair actions can impact data integrity. Unless you know what you are doing, it is best to leave this to the Orchestrator LLM.
            </p>
          </div>
        </div>

        <Card className="border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event ID</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Running diagnostics scan...
                  </TableCell>
                </TableRow>
              ) : realLogs?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    System nominal. No anomalies detected.
                  </TableCell>
                </TableRow>
              ) : realLogs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{log.id.substring(0,8)}</TableCell>
                  <TableCell className="text-sm">{log.createdAt ? formatDate(new Date(log.createdAt), "MMM d, HH:mm:ss") : "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={getSeverityColor(log.status)} className="capitalize">
                      {log.status === "warning" || log.status === "error" ? log.status : "info"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {log.errorMessage || (log.payloadIn as any)?.event || log.actionType}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      {log.status === "success" || log.status === "resolved" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : log.status === "investigating" ? (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-blue-500" />
                      )}
                      <span className="capitalize">{log.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {log.status !== "success" && (
                      <Button variant="ghost" size="sm" onClick={() => handleResolve(log.id)} disabled={resolveMutation.isPending}>
                        Resolve
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </DashboardLayout>
  );
}
