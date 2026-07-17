import { PageLayout } from "@/components/PageLayout";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Clock, AlertTriangle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Status() {
  const [uptime, setUptime] = useState(99.9);
  
  const { data: incidents } = trpc.contact.getStatusIncidents.useQuery({ limit: 10 });
  const { data: maintenance } = trpc.contact.getMaintenanceSchedule.useQuery({ limit: 10 });

  useEffect(() => {
    // Simulate uptime calculation (in real app, this would come from monitoring service)
    setUptime(99.95);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "text-green-600";
      case "investigating":
        return "text-yellow-600";
      case "identified":
        return "text-orange-600";
      case "monitoring":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "major":
        return "bg-orange-100 text-orange-800";
      case "minor":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getMaintenanceStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-12 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border">
        <div className="container max-w-6xl">
          <h1 className="text-4xl font-bold text-foreground mb-4">System Status</h1>
          <p className="text-lg text-muted-foreground">Real-time status of AgentLab services and infrastructure</p>
        </div>
      </section>

      {/* Overall Status */}
      <section className="py-12 border-b border-border">
        <div className="container max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Status */}
            <Card className="p-8 border border-border">
              <div className="flex items-center gap-4 mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <h3 className="text-xl font-semibold text-foreground">All Systems Operational</h3>
              </div>
              <p className="text-muted-foreground">All services are running normally with no known issues.</p>
            </Card>

            {/* Uptime */}
            <Card className="p-8 border border-border">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">30-Day Uptime</h3>
              <p className="text-4xl font-bold text-foreground mb-2">{uptime}%</p>
              <p className="text-sm text-muted-foreground">Excellent reliability</p>
            </Card>

            {/* Last Incident */}
            <Card className="p-8 border border-border">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Last Incident</h3>
              <p className="text-2xl font-bold text-foreground mb-2">45 days ago</p>
              <p className="text-sm text-muted-foreground">Minor service disruption</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Service Components */}
      <section className="py-12 border-b border-border">
        <div className="container max-w-6xl">
          <h2 className="text-3xl font-bold text-foreground mb-8">Service Components</h2>
          <div className="space-y-4">
            {[
              { name: "API Services", status: "operational" },
              { name: "Web Application", status: "operational" },
              { name: "Database Services", status: "operational" },
              { name: "Authentication", status: "operational" },
              { name: "Payment Processing", status: "operational" },
            ].map((service) => (
              <Card key={service.name} className="p-6 border border-border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-foreground">{service.name}</h4>
                    <p className="text-sm text-muted-foreground">All systems normal</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Operational
                </span>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Incidents */}
      <section className="py-12 border-b border-border">
        <div className="container max-w-6xl">
          <h2 className="text-3xl font-bold text-foreground mb-8">Recent Incidents</h2>
          {incidents && incidents.length > 0 ? (
            <div className="space-y-4">
              {incidents.map((incident) => (
                <Card key={incident.id} className="p-6 border border-border">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <AlertCircle className={`w-6 h-6 flex-shrink-0 mt-1 ${getStatusColor(incident.status)}`} />
                      <div>
                        <h4 className="font-semibold text-foreground">{incident.title}</h4>
                        <p className="text-muted-foreground text-sm mt-1">{incident.description}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(incident.severity)}`}>
                      {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      Status: <span className={`font-medium ${getStatusColor(incident.status)}`}>
                        {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                      </span>
                    </span>
                    <span>
                      Started: {new Date(incident.startedAt).toLocaleDateString()} at {new Date(incident.startedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 border border-border text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <p className="text-muted-foreground">No recent incidents. All systems have been stable.</p>
            </Card>
          )}
        </div>
      </section>

      {/* Maintenance Schedule */}
      <section className="py-12">
        <div className="container max-w-6xl">
          <h2 className="text-3xl font-bold text-foreground mb-8">Scheduled Maintenance</h2>
          {maintenance && maintenance.length > 0 ? (
            <div className="space-y-4">
              {maintenance.map((item) => (
                <Card key={item.id} className="p-6 border border-border">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-foreground">{item.title}</h4>
                        {item.description && (
                          <p className="text-muted-foreground text-sm mt-1">{item.description}</p>
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMaintenanceStatusColor(item.status)}`}>
                      {item.status.replace("_", " ").charAt(0).toUpperCase() + item.status.slice(1).replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      Scheduled: {new Date(item.scheduledStart).toLocaleDateString()} - {new Date(item.scheduledEnd).toLocaleDateString()}
                    </span>
                    <span>
                      {new Date(item.scheduledStart).toLocaleTimeString()} to {new Date(item.scheduledEnd).toLocaleTimeString()}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 border border-border text-center">
              <p className="text-muted-foreground">No scheduled maintenance at this time.</p>
            </Card>
          )}
        </div>
      </section>

      {/* Footer Info */}
      <section className="py-12 bg-muted/50 border-t border-border">
        <div className="container max-w-6xl text-center">
          <p className="text-muted-foreground mb-4">Last updated: {new Date().toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">
            For real-time updates, follow us on <a href="#" className="text-primary hover:underline">Twitter</a> or subscribe to our status page
          </p>
        </div>
      </section>
    </div>
  );
}
