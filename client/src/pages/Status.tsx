import { PageLayout } from "@/components/PageLayout";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface ServiceHealth {
  name: string;
  endpoint: string;
  status: "checking" | "operational" | "degraded" | "down";
  latencyMs?: number;
  detail?: string;
}

const MONITORED_SERVICES: Array<{
  name: string;
  endpoint: string;
  critical?: boolean;
}> = [
  { name: "API Services", endpoint: "/api/health", critical: true },
  { name: "Web Application", endpoint: "/health", critical: true },
];

export default function Status() {
  const [services, setServices] = useState<ServiceHealth[]>(
    MONITORED_SERVICES.map(s => ({ ...s, status: "checking" }))
  );
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  async function probe(endpoint: string): Promise<{
    ok: boolean;
    latencyMs: number;
    detail?: string;
  }> {
    const started = performance.now();
    try {
      const res = await fetch(endpoint, { cache: "no-store" });
      const latencyMs = Math.round(performance.now() - started);
      if (!res.ok) {
        return { ok: false, latencyMs, detail: `HTTP ${res.status}` };
      }
      const body = await res.json().catch(() => null);
      const healthy =
        !body || body.status === "healthy" || body.status === "ok";
      return {
        ok: healthy,
        latencyMs,
        detail: healthy ? undefined : `status: ${body?.status ?? "unknown"}`,
      };
    } catch {
      return {
        ok: false,
        latencyMs: Math.round(performance.now() - started),
        detail: "unreachable",
      };
    }
  }

  async function runChecks() {
    setServices(prev =>
      prev.map(s => ({ ...s, status: "checking", detail: undefined }))
    );
    const results = await Promise.all(
      MONITORED_SERVICES.map(async s => {
        const probeResult = await probe(s.endpoint);
        return {
          ...s,
          status:
            probeResult.ok
              ? ("operational" as const)
              : s.critical
                ? ("down" as const)
                : ("degraded" as const),
          latencyMs: probeResult.latencyMs,
          detail: probeResult.detail,
        };
      })
    );
    setServices(results);
    setLastChecked(new Date());
  }

  useEffect(() => {
    runChecks();
    // Re-probe every 60 seconds.
    const interval = setInterval(runChecks, 60_000);
    return () => clearInterval(interval);
  }, []);

  const allOperational = services.every(s => s.status === "operational");
  const anyDown = services.some(s => s.status === "down");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "text-green-600";
      case "degraded":
        return "text-yellow-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  const getBadge = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-100 text-green-800";
      case "degraded":
        return "bg-yellow-100 text-yellow-800";
      case "down":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="py-12 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border">
          <div className="container max-w-6xl">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              System Status
            </h1>
            <p className="text-lg text-muted-foreground">
              Live health of AgentLab services, probed from your browser every
              60 seconds.
            </p>
          </div>
        </section>

        {/* Overall Status */}
        <section className="py-12 border-b border-border">
          <div className="container max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Current Status */}
              <Card className="p-8 border border-border">
                <div className="flex items-center gap-4 mb-4">
                  {anyDown ? (
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  ) : allOperational ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-yellow-600" />
                  )}
                  <h3 className="text-xl font-semibold text-foreground">
                    {anyDown
                      ? "Service Disruption"
                      : allOperational
                        ? "All Systems Operational"
                        : "Degraded Performance"}
                  </h3>
                </div>
                <p className="text-muted-foreground">
                  {lastChecked
                    ? `Last checked ${lastChecked.toLocaleTimeString()}`
                    : "Running first health probe..."}
                </p>
              </Card>

              {/* Probe Latency */}
              <Card className="p-8 border border-border">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  API Response Time
                </h3>
                {(() => {
                  const api = services.find(
                    s => s.endpoint === "/api/health"
                  );
                  if (api?.status === "checking") {
                    return (
                      <>
                        <p className="text-4xl font-bold text-foreground mb-2">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Probing...
                        </p>
                      </>
                    );
                  }
                  return (
                    <>
                      <p className="text-4xl font-bold text-foreground mb-2">
                        {api?.latencyMs != null ? `${api.latencyMs} ms` : "—"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Live from your browser
                      </p>
                    </>
                  );
                })()}
              </Card>

              {/* Incidents */}
              <Card className="p-8 border border-border">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Known Issues
                </h3>
                <p className="text-2xl font-bold text-foreground mb-2">
                  {anyDown
                    ? services.filter(s => s.status === "down").length
                    : "0"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Detected by the current probe cycle
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Service Components */}
        <section className="py-12 border-b border-border">
          <div className="container max-w-6xl">
            <h2 className="text-3xl font-bold text-foreground mb-8">
              Service Components
            </h2>
            <div className="space-y-4">
              {services.map(service => (
                <Card
                  key={service.name}
                  className="p-6 border border-border flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    {service.status === "checking" ? (
                      <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                    ) : service.status === "operational" ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : service.status === "degraded" ? (
                      <AlertTriangle className="w-6 h-6 text-yellow-600" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    )}
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {service.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {service.status === "checking"
                          ? "Probing endpoint..."
                          : service.detail
                            ? `${service.detail} · ${service.latencyMs} ms`
                            : `Endpoint ${service.endpoint} responded in ${service.latencyMs} ms`}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getBadge(service.status)}`}
                  >
                    <span className={getStatusColor(service.status)}>
                      {service.status === "checking"
                        ? "Checking"
                        : service.status === "operational"
                          ? "Operational"
                          : service.status === "degraded"
                            ? "Degraded"
                            : "Down"}
                    </span>
                  </span>
                </Card>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-6">
              Historical uptime and incident tracking are not yet instrumented —
              this page reflects live probes only, without fabricated history.
            </p>
          </div>
        </section>

        {/* Recent Incidents */}
        <section className="py-12 border-b border-border">
          <div className="container max-w-6xl">
            <h2 className="text-3xl font-bold text-foreground mb-8">
              Recent Incidents
            </h2>
            <div className="text-center py-12">
              <Clock className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground">
                No incident history is recorded yet. Incident logging will
                appear here once it is wired to the audit system.
              </p>
            </div>
        </div>
        </section>
      </div>
    </PageLayout>
  );
}
