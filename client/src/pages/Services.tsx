import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ArrowRight, Zap } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Services() {
  const [selectedDepartment] = useState("marketing");

  const marketingWorkflows = [
    {
      id: 1,
      name: "Lead Generation & Conversion",
      description: "AI-powered lead capture, enrichment, scoring, and qualification with 90-95% automation",
      features: [
        "Multi-channel campaign launch and optimization",
        "Automated lead enrichment with firmographic data",
        "BANT-based lead qualification",
        "Real-time lead scoring and routing",
        "Sales handoff with full context",
        "Feedback loop and continuous optimization",
      ],
      automation: "90-95%",
      cycletime: "24-72 hours",
      basicIncluded: true,
      midIncluded: true,
      premiumIncluded: true,
    },
    {
      id: 2,
      name: "Email/SMS Nurture Sequences",
      description: "Behavioral-triggered, personalized multi-channel nurture campaigns with dynamic optimization",
      features: [
        "Persona-based sequence enrollment",
        "AI content selection and personalization",
        "Send-time optimization",
        "Multi-channel message delivery",
        "Real-time engagement tracking",
        "Dynamic sequence adjustment",
        "Re-engagement campaigns",
        "Performance analysis and optimization",
      ],
      automation: "85-90%",
      cycletime: "30-90 days",
      basicIncluded: true,
      midIncluded: true,
      premiumIncluded: true,
    },
    {
      id: 3,
      name: "Polls & Assessments",
      description: "Interactive quizzes and assessments that qualify leads while gathering market intelligence",
      features: [
        "Assessment creation and configuration",
        "Multi-channel distribution",
        "Real-time scoring and analysis",
        "Personalized results delivery",
        "Lead qualification and routing",
        "Automated follow-up sequences",
        "Market insights analysis",
        "Viral sharing mechanics",
      ],
      automation: "90-95%",
      cycletime: "Real-time + weekly analysis",
      basicIncluded: false,
      midIncluded: true,
      premiumIncluded: true,
    },
    {
      id: 4,
      name: "Content Marketing & SEO",
      description: "AI-assisted content creation, optimization, and distribution across channels",
      features: [
        "AI-powered content ideation",
        "SEO optimization and keyword research",
        "Content calendar management",
        "Multi-format content generation",
        "Distribution scheduling",
        "Performance tracking and analytics",
        "Competitor analysis",
        "Content repurposing automation",
      ],
      automation: "80-85%",
      cycletime: "Ongoing",
      basicIncluded: false,
      midIncluded: true,
      premiumIncluded: true,
    },
    {
      id: 5,
      name: "Social Media Management",
      description: "Automated social media strategy, content creation, scheduling, and engagement",
      features: [
        "Social media strategy development",
        "Content calendar creation",
        "AI-powered post generation",
        "Optimal posting time scheduling",
        "Engagement monitoring and response",
        "Competitor social tracking",
        "Influencer identification",
        "Performance analytics and reporting",
      ],
      automation: "85-90%",
      cycletime: "Ongoing",
      basicIncluded: false,
      midIncluded: false,
      premiumIncluded: true,
    },
    {
      id: 6,
      name: "Paid Advertising Management",
      description: "AI-driven paid ad strategy, creation, optimization, and ROI tracking",
      features: [
        "Multi-platform ad strategy",
        "Ad copy and creative generation",
        "Audience targeting optimization",
        "Bid management and budget allocation",
        "A/B testing automation",
        "Real-time performance optimization",
        "Attribution and ROI tracking",
        "Predictive analytics for scaling",
      ],
      automation: "90-95%",
      cycletime: "Ongoing",
      basicIncluded: false,
      midIncluded: false,
      premiumIncluded: true,
    },
  ];

  const pricingTiers = [
    {
      name: "Basic",
      monthlyPrice: 499,
      yearlyPrice: 4990,
      description: "Essential marketing automation for growing teams",
      cta: "Get Started",
      highlighted: false,
      features: [
        "Lead Generation & Conversion workflow",
        "Email/SMS Nurture Sequences",
        "Basic analytics and reporting",
        "Email support",
        "Monthly strategy review",
      ],
      workflowCount: 2,
    },
    {
      name: "Professional",
      monthlyPrice: 1499,
      yearlyPrice: 14990,
      description: "Complete marketing automation with advanced features",
      cta: "Get Started",
      highlighted: true,
      features: [
        "All Basic features",
        "Polls & Assessments",
        "Content Marketing & SEO",
        "Advanced analytics dashboard",
        "Priority email support",
        "Bi-weekly strategy reviews",
        "Custom workflow configuration",
      ],
      workflowCount: 4,
    },
    {
      name: "Enterprise",
      monthlyPrice: 2999,
      yearlyPrice: 29990,
      description: "Full-suite marketing AI with dedicated support",
      cta: "Contact Sales",
      highlighted: false,
      features: [
        "All Professional features",
        "Social Media Management",
        "Paid Advertising Management",
        "Dedicated account manager",
        "24/7 phone + email support",
        "Weekly strategy sessions",
        "Custom integrations",
        "Advanced AI model training",
        "Unlimited workflows",
      ],
      workflowCount: 6,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AL</span>
            </div>
            <span className="font-bold text-lg text-foreground">AgentLab</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="/" className="text-foreground hover:text-primary transition-colors">Home</a>
            <a href="/services" className="text-primary font-semibold">Services</a>
            <a href="/about" className="text-foreground hover:text-primary transition-colors">About</a>
            <a href="/blog" className="text-foreground hover:text-primary transition-colors">Blog</a>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="hidden sm:inline-flex" onClick={() => window.location.href = getLoginUrl()}>Sign In</Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={() => window.location.href = getLoginUrl()}>Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">
              Marketing Department <span className="gradient-text">AI Agents</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Transform your marketing with AI-powered agents that handle lead generation, nurturing, content creation, and optimization—all with 85-95% automation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={() => window.location.href = getLoginUrl()}>
                <Zap className="w-5 h-5 mr-2" />
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" className="border-2">
                Schedule Demo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Workflows Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Marketing Workflows Included</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI agents handle every aspect of modern marketing, from lead generation through customer nurturing and content optimization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {marketingWorkflows.map((workflow) => (
              <Card key={workflow.id} className="p-6 border border-border hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{workflow.name}</h3>
                    <p className="text-sm text-muted-foreground">{workflow.description}</p>
                  </div>

                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{workflow.automation}</span>
                      <span className="text-muted-foreground">Automation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{workflow.cycletime}</span>
                      <span className="text-muted-foreground">Cycle Time</span>
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {workflow.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-4 border-t border-border">
                    <div className="flex gap-2">
                      {workflow.basicIncluded && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Basic</span>
                      )}
                      {workflow.midIncluded && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Pro</span>
                      )}
                      {workflow.premiumIncluded && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">Enterprise</span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-b from-white to-primary/5">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect plan for your marketing team. All plans include our core AI agents and analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.name}
                className={`relative p-8 border transition-all ${
                  tier.highlighted
                    ? "border-primary shadow-xl scale-105"
                    : "border-border hover:shadow-lg"
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">{tier.name}</h3>
                    <p className="text-sm text-muted-foreground">{tier.description}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-foreground">${tier.monthlyPrice}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      or ${Math.round(tier.yearlyPrice / 12)}/month billed annually
                    </p>
                  </div>

                  <div className="bg-primary/10 rounded-lg p-3">
                    <p className="text-sm font-semibold text-foreground">
                      {tier.workflowCount} Workflows Included
                    </p>
                  </div>

                  <Button
                    className={`w-full ${
                      tier.highlighted
                        ? "bg-primary hover:bg-primary/90"
                        : "bg-primary/10 text-primary hover:bg-primary/20"
                    }`}
                    onClick={() => window.location.href = getLoginUrl()}
                  >
                    {tier.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <ul className="space-y-3">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-16 bg-card rounded-lg border border-border p-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">All Plans Include</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-foreground">AI-powered workflow automation</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-foreground">Real-time analytics and reporting</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-foreground">CRM and marketing tool integrations</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-foreground">Dedicated support and training</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent">
        <div className="container text-center space-y-6">
          <h2 className="text-4xl font-bold text-white">Ready to Transform Your Marketing?</h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Start your free trial today and see how AI agents can automate your marketing workflows and drive growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90" onClick={() => window.location.href = getLoginUrl()}>
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
