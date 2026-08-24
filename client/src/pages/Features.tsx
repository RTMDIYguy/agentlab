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
};

const departments: Record<string, Department> = {
  marketing: {
    name: "Marketing",
    description: "Automate brand presence, lead scoring, and content distribution.",
    color: "from-blue-500 to-blue-600",
  },
  sales: {
    name: "Sales",
    description: "Intelligent outreach, CRM sync, and automated follow-ups.",
    color: "from-green-500 to-green-600",
  },
  operations: {
    name: "Operations",
    description: "SOP tracking, team alignment, and workflow governance.",
    color: "from-purple-500 to-purple-600",
  },
  finance: {
    name: "Finance",
    description: "Margin analysis, AR/AP tracking, and expense alerts.",
    color: "from-yellow-500 to-yellow-600",
  },
  fulfillment: {
    name: "Fulfillment",
    description: "Service delivery, KPI dashboards, and quality assurance.",
    color: "from-red-500 to-red-600",
  },
  culture: {
    name: "Culture",
    description: "Onboarding automation, 1:1 prep, and team health tracking.",
    color: "from-teal-500 to-teal-600",
  },
  aftercare: {
    name: "Aftercare",
    description: "Client retention, post-delivery support, and referral loops.",
    color: "from-indigo-500 to-indigo-600",
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
              Unlock Playbooks in the Marketplace and execute workflows via the Command Center. 
              Our 7 Core Departments map directly to your business architecture.
            </p>
          </div>
        </div>
      </section>

      {/* Department Selector */}
      <section className="py-12 bg-background border-b border-border">
        <div className="container">
          <div className="flex flex-wrap gap-4 justify-center">
            {Object.keys(departments).map(dept_key => (
              <button
                key={dept_key}
                onClick={() => setSelectedDept(dept_key)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  selectedDept === dept_key
                    ? `bg-gradient-to-r ${departments[dept_key].color} text-white shadow-lg`
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {departments[dept_key].name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Department Overview */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto mb-12 text-center">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              {dept.name} Playbook
            </h2>
            <p className="text-lg text-muted-foreground">{dept.description}</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="p-8 border-border hover:shadow-lg transition-all text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Available in the Marketplace
              </h3>
              <p className="text-muted-foreground mb-8">
                Install the {dept.name} Playbook to unlock specialized agents, structured DAG workflows, 
                and automated checkpoints designed by industry experts.
              </p>
              
              <Button
                size="lg"
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => setLocation(isAuthenticated ? "/marketplace" : "/login")}
              >
                {isAuthenticated ? "Browse Marketplace" : "Log in to Unlock"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Card>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
