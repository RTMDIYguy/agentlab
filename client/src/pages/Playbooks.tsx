import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpenCheck, ShieldCheck } from "lucide-react";

interface Handoff {
  sequence: number;
  fromWorkflowCode: string;
  toWorkflowCode: string;
  fromDepartmentCode: string;
  toDepartmentCode: string;
  triggerSignal: string;
  receivingOwner: string;
  approvalRequired: boolean;
  fallbackProtocol: string;
}

interface Playbook {
  id: string;
  name: string;
  description: string;
  status: string;
  ownerDepartmentCode: string;
  primaryOwner: string;
  approvalOwner: string;
  trigger: string;
  completionCriteria: string;
  stopConditions: string[];
  handoffs: Handoff[];
}

export default function Playbooks() {
  const { data, isLoading, error } = useQuery<{ playbooks: Playbook[] }>({
    queryKey: ["playbooks"],
    queryFn: async () => {
      const response = await fetch("/api/playbooks");
      if (!response.ok) throw new Error("Failed to load playbooks");
      return response.json();
    },
  });

  return (
    <DashboardLayout>
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
        <header className="flex items-start gap-4">
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <BookOpenCheck className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Operating Playbooks
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Governed journeys that connect departmental workflows, owners,
              approvals, and fallback protocols.
            </p>
          </div>
        </header>

        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading playbooks...</p>
        )}
        {error && (
          <p className="text-sm text-destructive">
            Unable to load the playbook layer.
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {(data?.playbooks || []).map(playbook => (
            <Card key={playbook.id} className="border-border/60">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle>{playbook.name}</CardTitle>
                    <CardDescription className="mt-2">
                      {playbook.description}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      playbook.status === "active" ? "default" : "outline"
                    }
                  >
                    {playbook.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 pt-2 text-xs text-muted-foreground">
                  <Badge variant="outline">
                    {playbook.ownerDepartmentCode.toUpperCase()}
                  </Badge>
                  <span>Owner: {playbook.primaryOwner}</span>
                  <span>Approval: {playbook.approvalOwner}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted/40 p-3 text-sm">
                  <strong>Trigger:</strong> {playbook.trigger}
                  <br />
                  <strong>Complete when:</strong> {playbook.completionCriteria}
                </div>
                <div className="space-y-3">
                  {playbook.handoffs.map(handoff => (
                    <div
                      key={`${playbook.id}-${handoff.sequence}`}
                      className="rounded-lg border border-border/60 p-3"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                        <Badge variant="outline">
                          {handoff.fromWorkflowCode}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="outline">
                          {handoff.toWorkflowCode}
                        </Badge>
                        {handoff.approvalRequired && (
                          <ShieldCheck className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {handoff.triggerSignal}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Receiver: {handoff.receivingOwner}. Fallback:{" "}
                        {handoff.fallbackProtocol}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
