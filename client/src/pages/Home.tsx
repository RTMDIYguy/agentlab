import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Zap,
  Brain,
  Network,
  Clock,
  Shield,
  Cpu,
} from "lucide-react";
import { useState } from "react";

import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { PageLayout } from "@/components/PageLayout";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const capabilities = [
    {
      icon: Zap,
      title: "Instant Tenant Provisioning",
      description:
        "Create an account and immediately receive a secure, isolated workspace. No complex infrastructure setup required.",
    },
    {
      icon: Brain,
      title: "App Store Modular Workflows",
      description:
        "Browse the Marketplace and unlock highly-specialized workflows like 'Daily LinkedIn Outreach' tailored for your business.",
    },
    {
      icon: Network,
      title: "Multi-Agent Orchestration",
      description:
        "Watch as the Orchestrator LLM automatically delegates tasks to specialized AI agents within your secure boundaries.",
    },
    {
      icon: Clock,
      title: "Scheduled CRON Execution",
      description:
        "Put your business on autopilot. Agents run in the background on precise schedules without manual intervention.",
    },
    {
      icon: Shield,
      title: "Row Level Security (RLS)",
      description:
        "Your data is strictly isolated. Our Multi-Tenant Postgres architecture ensures your workflows and secrets never leak.",
    },
    {
      icon: Cpu,
      title: "Hard Budget Caps",
      description:
        "Never get surprised by LLM API bills. Set strict token budgets and our Billing Engine will auto-pause agents that exceed limits.",
    },
  ];

  const features = [
    {
      title: "Zero-Setup SaaS Delivery",
      description: "Log in and start running agents instantly.",
    },
    {
      title: "The 'Done-With-You' Tier",
      description: "Enterprise self-hosted repo access available.",
    },
    {
      title: "Stripe Billing Engine",
      description: "Secure, automated module unlocking.",
    },
    { title: "Vertex AI Integration", description: "Powered by Gemini 1.5 Pro." },
    {
      title: "Audit Telemetry",
      description: "Every token and action is logged.",
    },
    { title: "PII Redaction", description: "Sensitive data is scrubbed before LLM processing." },
  ];

  const testimonials = [
    {
      quote:
        "The Founder Signal System gave us messaging clarity and outreach automation in 48 hours. We closed 2 enterprise pilots in the first month.",
      author: "Marcus T.",
      role: "B2B SaaS Founder",
      company: "Bootstrapper Capital Member",
    },
    {
      quote:
        "Row Level Security and hard monthly token budget caps gave us total peace of mind to run multi-agent workflows autonomously in production.",
      author: "Lena M.",
      role: "Operations Lead",
      company: "Tactix Delivery Pod",
    },
    {
      quote:
        "Migrating onto Ownable OS cut our tool bloat by $1,800/mo. Having DAG workflows and live command telemetry in one place is unmatched.",
      author: "Deon W.",
      role: "Agency Principal",
      company: "URC Workflow Client",
    },
  ];

  const pricingPlans = [
    {
      name: "Modular Playbook",
      monthlyPrice: 149,
      yearlyPrice: 1490,
      description: "Department-specific automation pack (Marketing, Sales, or Ops)",
      features: [
        "1 Isolated Client Workspace",
        "Full DAG Automation for Chosen Department",
        "Pre-configured Specialized AI Agents",
        "SAIF Guardrails & PII Redaction",
        "Standard Email & Community Support",
      ],
      highlighted: false,
      stripeId: "playbook_tier",
    },
    {
      name: "Ownable OS Continuity",
      monthlyPrice: 500,
      yearlyPrice: 5000,
      description: "Flagship Turnkey AI Operating System & Advisory",
      features: [
        "All 7 Department Playbooks Unlocked",
        "Dedicated Multi-Tenant Workspace & RLS",
        "AI Studio Mobile Roving Ingestion Bridge",
        "Agency Command Center Cockpit",
        "Monthly Advisory & Custom Workflow Calibration",
        "Hard Token Budget Caps & SAIF Enforcer",
      ],
      highlighted: true,
      stripeId: "ownable_os",
    },
    {
      name: "Founder Signal System",
      monthlyPrice: 1000,
      yearlyPrice: 1000,
      description: "48-Hour Bespoke Starter Marketing & Outreach Sprint",
      features: [
        "Custom Signal Brief & Market Positioning",
        "First 30-Day Content Generation Batch",
        "3-Touch Multi-Channel Outreach Sequence",
        "Pulse Social & LeadPulse Pre-Configuration",
        "Direct Strategy Sprint with Robert",
      ],
      highlighted: false,
      stripeId: "founder_signal_system",
    },
  ];

  const blogPosts = [
    {
      category: "Technology",
      title: "The Future of Autonomous AI Systems",
      excerpt:
        "Explore how AI agents are revolutionizing business automation and decision-making processes.",
      author: "Alex Johnson",
      role: "AI Research Lead",
      date: "Mar 2025",
    },
    {
      category: "Business",
      title: "Reducing Operational Costs with AI Automation",
      excerpt:
        "Learn how enterprises are cutting costs by 40% through intelligent automation with AgentLab.",
      author: "Lisa Wang",
      role: "Business Strategist",
      date: "Feb 2025",
    },
    {
      category: "Case Study",
      title: "How Fortune 500 Companies Deploy AI Agents",
      excerpt:
        "Real-world examples of successful AI agent implementations in enterprise environments.",
      author: "David Park",
      role: "Solutions Architect",
      date: "Jan 2025",
    },
  ];

  const createCheckoutMutation =
    trpc.stripe.createCheckoutSession.useMutation();

  const handlePricingClick = (planId: string) => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    toast.loading("Redirecting to checkout...");
    createCheckoutMutation.mutate(
      {
        plan: planId as "starter" | "professional" | "enterprise",
        billingCycle,
      },
      {
        onSuccess: data => {
          toast.dismiss();
          window.open(data.checkoutUrl, "_blank");
        },
        onError: error => {
          toast.dismiss();
          toast.error("Failed to create checkout session. Please try again.");
          console.error("Checkout error:", error);
        },
      }
    );
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-background text-foreground">
        {/* Concert Hero Section */}
        {/* <ConcertHero isAuthenticated={isAuthenticated} /> */}
        <section className="py-20 text-center">
          <h1 className="text-4xl font-bold">Welcome to AgentLab</h1>
        </section>

        {/* Capabilities Section */}
        <section id="capabilities" className="py-20 bg-card">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="section-title">AI Agent Capabilities</h2>
              <p className="section-subtitle max-w-2xl mx-auto">
                Our advanced AI agents are equipped with cutting-edge
                capabilities that transform how businesses operate, making
                intelligent decisions and automating complex workflows.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {capabilities.map((capability, index) => {
                const Icon = capability.icon;
                return (
                  <Card
                    key={index}
                    className="p-8 border border-border hover:border-primary/50 transition-colors card-hover"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center mb-6">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {capability.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {capability.description}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-background">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="section-title">
                Revolutionizing Business with AI Agents
              </h2>
              <p className="section-subtitle max-w-2xl mx-auto">
                AgentLab specializes in developing cutting-edge AI agents that
                automate complex business processes, enhance decision-making,
                and drive innovation across industries.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-6 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-white font-bold">{index + 1}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-card">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="section-title">What Our Users Say</h2>
              <p className="section-subtitle max-w-2xl mx-auto">
                Discover how leading organizations are transforming their
                operations with AgentLab's intelligent AI agents.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="p-8 border border-border">
                  <div className="mb-6">
                    <p className="text-foreground text-lg leading-relaxed italic">
                      "{testimonial.quote}"
                    </p>
                  </div>
                  <div className="border-t border-border pt-6">
                    <p className="font-semibold text-foreground">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                    <p className="text-sm text-primary font-medium">
                      {testimonial.company}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 bg-background">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="section-title">Simple and Affordable Pricing</h2>
              <p className="section-subtitle max-w-2xl mx-auto">
                Choose the perfect plan for your business needs. All plans
                include core features with flexible scaling.
              </p>
            </div>

            <div className="flex justify-center gap-4 mb-12">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  billingCycle === "monthly"
                    ? "bg-primary text-white"
                    : "bg-card text-foreground border border-border hover:border-primary"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  billingCycle === "yearly"
                    ? "bg-primary text-white"
                    : "bg-card text-foreground border border-border hover:border-primary"
                }`}
              >
                Yearly
                <span className="ml-2 text-xs bg-accent text-accent-foreground px-2 py-1 rounded">
                  Save 20%
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, index) => (
                <Card
                  key={index}
                  className={`p-8 border transition-all ${
                    plan.highlighted
                      ? "border-primary bg-gradient-to-br from-primary/5 to-accent/5 ring-2 ring-primary/20 scale-105 md:scale-110"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {plan.description}
                  </p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-foreground">
                      $
                      {billingCycle === "monthly"
                        ? plan.monthlyPrice
                        : plan.yearlyPrice}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      /{billingCycle === "monthly" ? "mo" : "yr"}
                    </span>
                  </div>
                  <Button
                    className={`w-full mb-8 ${plan.highlighted ? "bg-primary hover:bg-primary/90" : ""}`}
                    onClick={() => handlePricingClick(plan.stripeId)}
                  >
                    Start Free Trial
                  </Button>
                  <ul className="space-y-4">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1">✓</span>
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section id="blog" className="py-20 bg-card">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="section-title">Our Latest Blogs</h2>
              <p className="section-subtitle max-w-2xl mx-auto">
                Stay updated with the latest insights on AI agents, automation,
                and business transformation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => (
                <Card
                  key={index}
                  className="p-6 border border-border hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer"
                >
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                      {post.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground mb-6">{post.excerpt}</p>
                  <div className="border-t border-border pt-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {post.author}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {post.role}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {post.date}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 bg-background">
          <div className="container max-w-2xl">
            <div className="text-center mb-12">
              <h2 className="section-title">Need Help? Open a Ticket</h2>
              <p className="section-subtitle">
                Our support team will get back to you ASAP via email.
              </p>
            </div>

            <Card className="p-8 border border-border">
              <form className="space-y-6" onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const contactName = formData.get("name") as string;
                const email = formData.get("email") as string;
                const notes = formData.get("message") as string;
                
                try {
                  const res = await fetch("/api/intake", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      contactName,
                      email,
                      notes,
                      source: "AgentLab Website - Home Page",
                      serviceLine: "General Inquiry"
                    })
                  });
                  if (!res.ok) throw new Error("Failed to send");
                  toast.success("Message sent successfully! We will be in touch.");
                  (e.target as HTMLFormElement).reset();
                } catch (err) {
                  toast.error("Failed to send message. Please try again later.");
                }
              }}>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Your Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Your Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="john@example.com"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Your Message
                  </label>
                  <textarea
                    name="message"
                    required
                    placeholder="Tell us how we can help..."
                    rows={5}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button type="submit" size="lg" className="w-full">
                  Send Message
                </Button>
              </form>
            </Card>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 bg-gradient-to-r from-primary/10 to-accent/10 border-t border-border">
          <div className="container max-w-2xl">
            <NewsletterSignup
              variant="card"
              title="Stay Updated with AgentLab"
              description="Get the latest insights on AI agents, automation trends, and exclusive updates delivered to your inbox."
              showIcon={true}
            />
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
