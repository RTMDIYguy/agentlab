import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AlertCircle, Cpu, Plus, Clock, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Agents() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });

  const mockAgents = [
    {
      id: "agt-core-ops-01",
      name: "Ops Cleanup Agent",
      status: "active",
      task: "Monitoring unused trial instances",
      uptime: "48h 12m",
    },
    {
      id: "agt-fin-audit-03",
      name: "Financial Auditor",
      status: "idle",
      task: "Waiting for next cron trigger",
      uptime: "12h 00m",
    }
  ];

  return (
    <DashboardLayout>
      <div className="border-b border-border bg-background">
        <div className="px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Agents</h1>
            <p className="text-sm text-muted-foreground">
              Monitor and manage autonomous agents
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Spin Up Agent
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">For Advanced Users</h4>
            <p className="text-sm opacity-90 mt-1">
              Direct agent manipulation can cause unexpected system behaviors. Unless you know what you are doing, it is best to leave this to the Orchestrator LLM.
            </p>
          </div>
        </div>

        <Card className="border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Task</TableHead>
                <TableHead>Uptime</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAgents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell className="font-mono text-xs">{agent.id}</TableCell>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-muted-foreground" />
                    {agent.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant={agent.status === "active" ? "default" : "secondary"}>
                      {agent.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{agent.task}</TableCell>
                  <TableCell className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-3 h-3" /> {agent.uptime}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Terminal className="w-4 h-4 mr-2" /> Logs
                    </Button>
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
