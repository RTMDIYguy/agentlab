import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import { ShieldCheck, Lock, Server, FileCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Security() {
  const policies = [
    {
      icon: <Lock className="w-6 h-6 text-primary" />,
      title: "Data Encryption",
      description: "All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. We utilize Google Cloud Key Management Service (KMS) for secure key rotation."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-primary" />,
      title: "Access Control",
      description: "Strict role-based access control (RBAC) ensures that team members and agents only have access to the data required to perform their designated tasks."
    },
    {
      icon: <Server className="w-6 h-6 text-primary" />,
      title: "Infrastructure Security",
      description: "Our infrastructure is hosted on Google Cloud Platform (GCP) and operates within isolated Virtual Private Clouds (VPCs) with strict firewall rules."
    },
    {
      icon: <FileCheck className="w-6 h-6 text-primary" />,
      title: "Audit & Compliance",
      description: "Comprehensive logging via the Auditing dashboard tracks all user and agent actions. We perform regular vulnerability scans and third-party penetration testing."
    }
  ];

  return (
    <PageLayout>
      <div className="bg-background min-h-screen pb-20">
        {/* Header */}
        <section className="py-20 bg-stone-950 text-stone-50 text-center">
          <div className="container max-w-4xl">
            <ShieldCheck className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Security & Trust Center
            </h1>
            <p className="text-xl text-stone-300 leading-relaxed max-w-3xl mx-auto">
              At AgentLab, we believe that autonomous agents must operate within secure, observable, and strictly controlled boundaries. Your trust is our highest priority.
            </p>
          </div>
        </section>

        {/* Policies Grid */}
        <section className="container max-w-5xl mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">How We Protect Your Data</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              We employ defense-in-depth strategies to secure both the underlying infrastructure and the AI agents operating on top of it.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {policies.map((policy, idx) => (
              <Card key={idx} className="p-8 border-border hover:shadow-md transition-shadow">
                <div className="bg-muted w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  {policy.icon}
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">{policy.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {policy.description}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Security Team */}
        <section className="container max-w-3xl mt-24">
          <Card className="p-10 text-center bg-muted/30 border-border">
            <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-foreground mb-4">Vulnerability Reporting</h3>
            <p className="text-muted-foreground mb-8">
              If you believe you have found a security vulnerability in any of our systems or AI agent deployments, please report it to our security team immediately. We take all reports seriously and will investigate promptly.
            </p>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90"
              onClick={() => window.location.href = 'mailto:robert@agent-lab.tech?subject=Security%20Vulnerability%20Report'}
            >
              Contact Security Team
            </Button>
          </Card>
        </section>
      </div>
    </PageLayout>
  );
}
