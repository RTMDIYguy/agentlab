import { MainNav } from "@/components/MainNav";
import { Footer } from "@/components/Footer";
import { BookOpen, Code, Terminal, Zap, Shield, HelpCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function Documentation() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MainNav />
      <main className="flex-grow pt-24 pb-16">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              AgentLab Owner's Manual
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know to build, manage, and scale AI-native workflows on AgentLab.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {/* Core Concepts */}
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <BookOpen className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Core Concepts</CardTitle>
                <CardDescription>Understand the architecture</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-primary transition-colors">What is an Agent?</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Workflows vs Playbooks</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">The Execution Queue</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">State Management</a></li>
                </ul>
              </CardContent>
            </Card>

            {/* Quickstart */}
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <Zap className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Quickstart Guide</CardTitle>
                <CardDescription>Get up and running</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-primary transition-colors">Creating your first Workflow</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Using the Command Center</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Scheduling CRON jobs</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Reviewing logs</a></li>
                </ul>
              </CardContent>
            </Card>

            {/* Advanced Building */}
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <Code className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Custom Prompts</CardTitle>
                <CardDescription>Write better agent instructions</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-primary transition-colors">Prompt Engineering Basics</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Giving Agents context</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Handling edge cases</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Dynamic variables</a></li>
                </ul>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <Shield className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Security & Access</CardTitle>
                <CardDescription>Keep your data safe</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-primary transition-colors">Managing Secrets</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Environment Variables</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Audit Logging</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Role-based Access Control</a></li>
                </ul>
              </CardContent>
            </Card>

            {/* Integration */}
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <Terminal className="w-8 h-8 text-primary mb-2" />
                <CardTitle>API & Integrations</CardTitle>
                <CardDescription>Connect external services</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-primary transition-colors">REST API Reference</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Webhooks</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Connecting Gmail/Slack</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Marketplace Packages</a></li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Troubleshooting */}
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <HelpCircle className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Troubleshooting</CardTitle>
                <CardDescription>Fixing common issues</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-primary transition-colors">Why did my agent fail?</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Understanding error codes</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Billing and limits</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Contact Support</a></li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-muted/50 rounded-2xl p-8 border border-border">
            <h3 className="text-xl font-semibold mb-4">Can't find what you're looking for?</h3>
            <p className="text-muted-foreground mb-4">
              Our documentation is constantly evolving. If you need help with a specific use case or have a question that isn't covered here, our community and support team are ready to help.
            </p>
            <div className="flex gap-4">
              <a href="/support" className="text-sm font-medium text-primary hover:underline">Contact Support &rarr;</a>
              <a href="/community" className="text-sm font-medium text-primary hover:underline">Join Community &rarr;</a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
