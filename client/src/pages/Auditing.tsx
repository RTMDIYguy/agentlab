import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { ShieldAlert, Activity, CheckCircle2, AlertTriangle, AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Auditing() {
  const auditLogs = [
    {
      id: "log-1",
      timestamp: "Just now",
      agent: "Ops Cleanup Agent",
      action: "System File Triage",
      status: "requires_approval",
      message: "Proposed archiving 4 legacy spreadsheets. Waiting for human review.",
    },
    {
      id: "log-2",
      timestamp: "10 mins ago",
      agent: "Content Writer",
      action: "Blog Post Published",
      status: "success",
      message: "Published 'Understanding Agentic Workflows' to production.",
    },
    {
      id: "log-3",
      timestamp: "1 hour ago",
      agent: "SDR Intake Agent",
      action: "Lead Captured",
      status: "success",
      message: "Captured and routed John Doe to Sales Pipeline.",
    },
    {
      id: "log-4",
      timestamp: "2 hours ago",
      agent: "System",
      action: "API Limit Reached",
      status: "error",
      message: "OpenAI API quota exceeded during background sync. Retrying in 1 hour.",
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "requires_approval": return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "error": return <AlertOctagon className="w-5 h-5 text-red-500" />;
      default: return <Activity className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ShieldAlert className="w-8 h-8 text-primary" />
              System Auditing
            </h1>
            <p className="text-muted-foreground mt-1">
              Review agent actions, system events, and security flags.
            </p>
          </div>
          <Button variant="outline">Export Logs</Button>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Total Events (24h)</h3>
            <p className="text-3xl font-bold text-foreground">1,248</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Pending Reviews</h3>
            <p className="text-3xl font-bold text-yellow-600">3</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Security Alerts</h3>
            <p className="text-3xl font-bold text-red-600">1</p>
          </Card>
        </div>

        {/* Audit Log Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Timestamp</th>
                  <th className="px-6 py-4 font-medium">Agent / Source</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                  <th className="px-6 py-4 font-medium">Details</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      {getStatusIcon(log.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {log.timestamp}
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {log.agent}
                    </td>
                    <td className="px-6 py-4">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {log.message}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {log.status === "requires_approval" ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">Approve</Button>
                          <Button size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">Reject</Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="ghost">View Details</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
