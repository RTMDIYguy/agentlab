import { PageLayout } from "@/components/PageLayout";
import { Shield, Lock, FileKey2, CheckCircle2 } from "lucide-react";

export default function Security() {
  return (
    <PageLayout className="min-h-screen bg-background flex flex-col">
      <main className="flex-grow pt-24 pb-16">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Enterprise-Grade Security
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              At AgentLab, we believe security is a prerequisite for automation. We implement industry-leading standards to keep your workflows and data safe.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
              <Shield className="w-12 h-12 text-primary mb-6" />
              <h3 className="text-2xl font-semibold mb-3">Data Protection</h3>
              <p className="text-muted-foreground">
                All data is encrypted in transit and at rest using AES-256 and TLS 1.3. Your automation payloads and environment variables are heavily guarded.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
              <Lock className="w-12 h-12 text-primary mb-6" />
              <h3 className="text-2xl font-semibold mb-3">Access Control</h3>
              <p className="text-muted-foreground">
                Granular RBAC ensures that only authorized personnel can create, edit, or execute workflows. 
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
              <FileKey2 className="w-12 h-12 text-primary mb-6" />
              <h3 className="text-2xl font-semibold mb-3">Secret Management</h3>
              <p className="text-muted-foreground">
                Integrations and API keys are stored securely using industry-standard KMS vaults. Agents only get temporary, scoped access during runtime.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
              <CheckCircle2 className="w-12 h-12 text-primary mb-6" />
              <h3 className="text-2xl font-semibold mb-3">Compliance & Audits</h3>
              <p className="text-muted-foreground">
                Agent actions are meticulously logged in our unified Audit Logs to ensure total visibility.
              </p>
            </div>
          </div>

          <div className="bg-primary/5 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Have specific security requirements?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              We work with compliance and infosec teams to ensure AgentLab meets your internal policies. 
            </p>
            <a 
              href="/help#contact"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-8 py-2"
            >
              Contact Security Team
            </a>
          </div>
        </div>
      </main>
    </PageLayout>
  );
}
