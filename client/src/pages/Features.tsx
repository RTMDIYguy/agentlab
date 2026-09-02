import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/PageLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

type Department = {
  name: string;
  description: string;
  color: string;
  workflows: Array<{ id: string; name: string; automation: string; cycletime: string; desc: string }>;
};

const departments: Record<string, Department> = {
  marketing: {
    name: "Marketing",
    description: "Automate brand presence, lead scoring, content syndication, and outbound pipelines.",
    color: "from-blue-500 to-blue-600",
    workflows: [
      { id: "MKT-01", name: "Lead Generation & Conversion", automation: "90-95%", cycletime: "24h", desc: "Automated capture, enrichment, and BANT scoring." },
      { id: "MKT-02", name: "Email & Multi-Touch Nurture", automation: "85-90%", cycletime: "Real-time", desc: "Stateful behavioral nurture sequences via Resend SMTP." },
      { id: "MKT-03", name: "Polls & Assessments", automation: "95%", cycletime: "Instant", desc: "Interactive customer feedback and qualification tools." },
      { id: "MKT-06", name: "Social Content Creation & Dissemination", automation: "90%", cycletime: "Daily", desc: "Pulse Social scheduling and engagement analytics." },
      { id: "MKT-09", name: "Founder Roundtables & Funnels", automation: "80%", cycletime: "Weekly", desc: "Bootstrapper Capital founder intake and event orchestration." },
    ],
  },
  sales: {
    name: "Sales",
    description: "Intelligent outreach, CRM synchronization, automated proposals, and contract onboarding.",
    color: "from-green-500 to-green-600",
    workflows: [
      { id: "SAL-01", name: "Inbound Capture & Enrichment", automation: "95%", cycletime: "Instant", desc: "LeadPulse prospecting and real-time CRM updates." },
      { id: "SAL-02", name: "Opportunity Assessment", automation: "85%", cycletime: "1-2h", desc: "Market deal sizing and predictive opportunity analysis." },
      { id: "SAL-04", name: "Proposal Generation Engine", automation: "90%", cycletime: "30 min", desc: "Dynamic pricing calculator and proposal synthesis." },
      { id: "SAL-05", name: "Contract Delivery & Close", automation: "80%", cycletime: "24h", desc: "Stripe subscription initialization and workspace creation." },
      { id: "SAL-06", name: "Discount & Approval Control", automation: "100%", cycletime: "Real-time", desc: "Hard budget and discount threshold policy enforcement." },
    ],
  },
  operations: {
    name: "Operations",
    description: "System governance, automated drift scanning, SOP version control, and DAG orchestration.",
    color: "from-purple-500 to-purple-600",
    workflows: [
      { id: "OPS-01", name: "Vision & Strategic Priority Queue", automation: "Framework", cycletime: "Quarterly", desc: "Executive alignment and 90-day execution horizons." },
      { id: "OPS-04", name: "Agency Command Center Telemetry", automation: "100%", cycletime: "Real-time", desc: "Live swarm monitoring, run approvals, and dispatch." },
      { id: "OPS-05", name: "Naming & Identifier Control", automation: "Policy", cycletime: "Continuous", desc: "Canonical entity standardization across all brands." },
      { id: "OPS-06", name: "Google Drive Cloud Sync", automation: "100%", cycletime: "On Update", desc: "Automatic customer-facing document synchronization." },
      { id: "OPS-07", name: "Automated Documentation Drift Scanner", automation: "100%", cycletime: "Daily / CI", desc: "Zero-drift verification between code and documentation." },
    ],
  },
  finance: {
    name: "Finance",
    description: "Cash flow modeling, automated Stripe billing, LLM token budget caps, and AR/AP controls.",
    color: "from-amber-500 to-amber-600",
    workflows: [
      { id: "FIN-01", name: "Cash Flow & Runway Tracking", automation: "80%", cycletime: "Monthly", desc: "Lean financial control layer without expensive SaaS tools." },
      { id: "FIN-02", name: "Invoicing & Stripe Billing", automation: "95%", cycletime: "Instant", desc: "Automated module unlocking and subscription management." },
      { id: "FIN-04", name: "Hard Budget Auto-Pause Engine", automation: "100%", cycletime: "Real-time", desc: "Automatic agent shutdown if LLM budget exceeds cap." },
    ],
  },
  fulfillment: {
    name: "Fulfillment",
    description: "Client deliverable tracking, quality assurance telemetry, and milestone governance.",
    color: "from-red-500 to-red-600",
    workflows: [
      { id: "FUL-01", name: "Client Workspace Provisioning", automation: "100%", cycletime: "Instant", desc: "Automated database schema isolation and module mounting." },
      { id: "FUL-02", name: "Quality Assurance & SAIF Testing", automation: "90%", cycletime: "Continuous", desc: "Autonoma synthetic testing and safety checks." },
      { id: "FUL-03", name: "Deliverable Handoff & Training", automation: "75%", cycletime: "Milestone", desc: "Turnkey operational manual and video delivery." },
    ],
  },
  culture: {
    name: "Culture",
    description: "Servant leadership codification, role onboarding, and human judgment safeguards.",
    color: "from-teal-500 to-teal-600",
    workflows: [
      { id: "CUL-01", name: "Servant Leadership Operating Standard", automation: "Doctrine", cycletime: "Continuous", desc: "Agency values enforcement across human and AI agents." },
      { id: "CUL-02", name: "Agent Role Calibration", automation: "85%", cycletime: "Onboard", desc: "System prompt alignment and knowledge bounding." },
    ],
  },
  aftercare: {
    name: "Aftercare",
    description: "Client retention, post-delivery advisory, continuous optimization, and referral loops.",
    color: "from-indigo-500 to-indigo-600",
    workflows: [
      { id: "AFT-01", name: "Ownable OS Continuity Advisory", automation: "Hybrid", cycletime: "Monthly", desc: "Regular calibration and new workflow package rollout." },
      { id: "AFT-02", name: "Net Promoter & Proof Capture", automation: "90%", cycletime: "Quarterly", desc: "Automated case study synthesis and testimonial logging." },
    ],
  }
};

export default function Features() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedDept, setSelectedDept] = useState<string>("marketing");

  const dept = departments[selectedDept];

  return (
    <PageLayout className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/5 border-b border-border">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Intelligent Automation for Every Department
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Unlock modular DAG playbooks in the Marketplace and execute workflows through the Command Center. 
              Our 7 Core Departments map directly to your real business architecture.
            </p>
          </div>
        </div>
      </section>

      {/* Department Selector */}
      <section className="py-8 bg-background border-b border-border sticky top-16 z-40 backdrop-blur-md bg-background/90">
        <div className="container">
          <div className="flex flex-wrap gap-3 justify-center">
            {Object.keys(departments).map(dept_key => (
              <button
                key={dept_key}
                onClick={() => setSelectedDept(dept_key)}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  selectedDept === dept_key
                    ? `bg-gradient-to-r ${departments[dept_key].color} text-white shadow-md scale-105`
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {departments[dept_key].name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Department Overview & Workflows */}
      <section className="py-16 bg-background">
        <div className="container max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto mb-12 text-center">
            <h2 className="text-4xl font-bold text-foreground mb-3">
              {dept.name} Playbook
            </h2>
            <p className="text-lg text-muted-foreground">{dept.description}</p>
          </div>

          {/* Workflows Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {dept.workflows.map((wf) => (
              <Card key={wf.id} className="p-6 border-border hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-mono font-bold rounded-md">
                      {wf.id}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      Auto: {wf.automation}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{wf.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{wf.desc}</p>
                </div>
                <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Cycle: {wf.cycletime}</span>
                  <span className="text-primary font-medium flex items-center gap-1">
                    Ready <Check className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Card>
            ))}
          </div>

          <div className="max-w-xl mx-auto text-center">
            <Button
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 shadow-md text-base font-semibold py-6"
              onClick={() => setLocation(isAuthenticated ? "/marketplace" : "/login")}
            >
              {isAuthenticated ? `Mount ${dept.name} Playbook to Workspace` : "Log in to Unlock Playbook"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
