import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { Activity, Cpu, GitMerge, DollarSign, PlayCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();

  // We can fetch existing data
  const { data: workflowsData, isLoading: isLoadingWorkflows } = useQuery<{ workflows: any[] }>({
    queryKey: ["workflows", user?.uid],
    queryFn: async () => {
      const token = await user?.getIdToken();
      const res = await fetch("/api/workflows", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!user,
  });

  const { data: runsData, isLoading: isLoadingRuns } = useQuery<{ runs: any[] }>({
    queryKey: ["runs", user?.uid],
    queryFn: async () => {
      const token = await user?.getIdToken();
      const res = await fetch("/api/runs", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!user,
  });

  const activeRuns = runsData?.runs?.filter((r: any) => r.status === "running" || r.status === "paused_for_approval")?.length || 0;
  const totalRuns = runsData?.runs?.length || 0;
  const totalWorkflows = workflowsData?.workflows?.length || 0;
  
  // Mock active agents
  const activeAgents = 2;

  return (
    <DashboardLayout>
      <div className="border-b border-border bg-background">
        <div className="px-6 py-6">
          <h1 className="text-2xl font-bold text-foreground">Operational Overview</h1>
          <p className="text-sm text-muted-foreground">
            System performance and utilization
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeAgents}</div>
              <p className="text-xs text-muted-foreground">Running continuously</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoadingRuns ? "-" : activeRuns}</div>
              <p className="text-xs text-muted-foreground">In progress or pending approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
              <PlayCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoadingRuns ? "-" : totalRuns}</div>
              <p className="text-xs text-muted-foreground">Historical execution count</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estimated Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12.50</div>
              <p className="text-xs text-muted-foreground">Spend this billing cycle</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>All primary Orchestrator systems are nominal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center justify-between border-b border-border pb-4">
                 <div>
                   <p className="text-sm font-medium">Orchestrator LLM (Gemini)</p>
                   <p className="text-xs text-muted-foreground">Latency: 450ms</p>
                 </div>
                 <div className="h-2 w-2 bg-green-500 rounded-full" />
               </div>
               <div className="flex items-center justify-between border-b border-border pb-4">
                 <div>
                   <p className="text-sm font-medium">Task Queue</p>
                   <p className="text-xs text-muted-foreground">Pending jobs: 0</p>
                 </div>
                 <div className="h-2 w-2 bg-green-500 rounded-full" />
               </div>
               <div className="flex items-center justify-between border-b border-border pb-4">
                 <div>
                   <p className="text-sm font-medium">Knowledge Access</p>
                   <p className="text-xs text-muted-foreground">Available packages: {isLoadingWorkflows ? "-" : totalWorkflows}</p>
                 </div>
                 <div className="h-2 w-2 bg-green-500 rounded-full" />
               </div>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate("/command-center")}>
                <PlayCircle className="mr-2 h-4 w-4" /> Run a Playbook
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate("/agents")}>
                <Cpu className="mr-2 h-4 w-4" /> View Active Agents
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate("/marketplace")}>
                <GitMerge className="mr-2 h-4 w-4" /> Explore Marketplace
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
