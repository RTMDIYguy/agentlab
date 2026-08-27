import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Play, Square, Settings, Activity } from "lucide-react";

export default function Agents() {
  const agents = [
    {
      id: "ops-1",
      name: "Ops Cleanup Agent",
      status: "running",
      uptime: "99.9%",
      tasksCompleted: 142,
      description: "Manages prompt staging, file triaging, and system cleanup.",
    },
    {
      id: "sdr-1",
      name: "SDR Intake Agent",
      status: "idle",
      uptime: "100%",
      tasksCompleted: 8,
      description: "Handles incoming leads from the LiveChat widget.",
    },
    {
      id: "blog-1",
      name: "Content Writer",
      status: "running",
      uptime: "98.5%",
      tasksCompleted: 24,
      description: "Drafts and schedules SEO optimized blog articles.",
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bot className="w-8 h-8 text-primary" />
              Active Agents
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor and manage your deployed AI agents.
            </p>
          </div>
          <Button className="bg-primary">Deploy New Agent</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Card key={agent.id} className="p-6 flex flex-col hover:border-primary transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${agent.status === 'running' ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'}`}>
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{agent.name}</h3>
                    <div className="flex items-center gap-1 text-xs font-medium">
                      <span className={`w-2 h-2 rounded-full ${agent.status === 'running' ? 'bg-green-500 animate-pulse' : 'bg-stone-400'}`}></span>
                      <span className="capitalize">{agent.status}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-6 flex-1">
                {agent.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6 p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Uptime</div>
                  <div className="font-semibold">{agent.uptime}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Tasks</div>
                  <div className="font-semibold">{agent.tasksCompleted}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-border">
                {agent.status === 'running' ? (
                  <Button variant="outline" size="sm" className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                    <Square className="w-4 h-4 mr-2" /> Stop
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="flex-1 border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700">
                    <Play className="w-4 h-4 mr-2" /> Start
                  </Button>
                )}
                <Button variant="outline" size="icon" className="shrink-0">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                </Button>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
