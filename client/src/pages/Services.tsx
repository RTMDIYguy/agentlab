import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ArrowRight, Zap } from "lucide-react";
import { getLoginUrl } from "@/const";
import { PageLayout } from "@/components/PageLayout";

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
      name: "Email & SMS Nurture",
      description: "Intelligent multi-channel nurture campaigns with AI-driven personalization",
      features: [
        "Behavioral trigger-based campaigns",
        "Dynamic content personalization",
        "A/B testing and optimization",
        "Multi-channel orchestration",
        "Engagement scoring",
        "Automated follow-up sequences",
      ],
      automation: "85-90%",
      cycletime: "Real-time",
      basicIncluded: true,
      midIncluded: true,
      premiumIncluded: true,
    },
    {
      id: 3,
      name: "Polls & Assessments",
      description: "Interactive customer feedback and qualification tools",
      features: [
        "Custom poll builder",
        "Conditional branching logic",
        "Real-time analytics dashboard",
        "Lead qualification based on responses",
        "Integration with CRM",
        "Automated follow-up based on answers",
      ],
      automation: "80-85%",
      cycletime: "Immediate",
      basicIncluded: false,
      midIncluded: true,
      premiumIncluded: true,
    },
    {
      id: 4,
      name: "Content Marketing & SEO",
      description: "AI-powered content creation, optimization, and distribution",
      features: [
        "AI content generation",
        "SEO optimization recommendations",
        "Content calendar management",
        "Multi-platform publishing",
        "Performance analytics",
        "Competitor analysis",
      ],
      automation: "75-85%",
      cycletime: "1-2 days",
      basicIncluded: false,
      midIncluded: true,
      premiumIncluded: true,
    },
    {
      id: 5,
      name: "Social Media Management",
      description: "Automated social media posting, engagement, and analytics",
      features: [
        "Multi-platform scheduling",
        "AI-powered content suggestions",
        "Engagement automation",
        "Sentiment analysis",
        "Competitor monitoring",
        "Performance reporting",
      ],
      automation: "70-80%",
      cycletime: "Real-time",
      basicIncluded: false,
      midIncluded: false,
      premiumIncluded: true,
    },
    {
      id: 6,
      name: "Paid Advertising Management",
      description: "AI-optimized paid ad campaigns across all platforms",
      features: [
        "Campaign creation and optimization",
        "Bid management automation",
        "Audience targeting optimization",
        "Creative performance analysis",
        "Budget allocation optimization",
        "ROI tracking and reporting",
      ],
      automation: "80-90%",
      cycletime: "Real-time",
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
      description: "Essential marketing automation for startups",
      cta: "Get Started",
      highlighted: false,
      features: [
        "Lead Generation & Conversion",
        "Email & SMS Nurture",
        "Up to 1,000 leads/month",
        "Basic analytics",
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
    <PageLayout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">
              Marketing Department <span className="text-primary">AI Agents</span>
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

      <section className="py-8 bg-card border-y border-border">
        <div className="container">
          <p className="max-w-4xl mx-auto text-center text-muted-foreground leading-relaxed">
            We automate repeatable work while keeping human judgment at the checkpoints where
            quality, security, and privacy matter. Every workflow should make the client more
            capable, not more dependent on a heavier tool stack.
          </p>
        </div>
      </section>

      {/* Workflows Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Marketing Workflows Included</h2>
            <p className="text-lg text-muted-foreground">Each tier includes different combinations of our powerful marketing workflows</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {marketingWorkflows.map((workflow) => (
              <Card key={workflow.id} className="p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-foreground mb-2">{workflow.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{workflow.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Automation Level:</span>
                    <span className="font-semibold text-primary">{workflow.automation}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Cycle Time:</span>
                    <span className="font-semibold">{workflow.cycletime}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {workflow.features.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-slate-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground">Choose the plan that fits your marketing needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {pricingTiers.map((tier, idx) => (
              <Card
                key={idx}
                className={`p-8 transition-all ${
                  tier.highlighted
                    ? "ring-2 ring-primary shadow-xl scale-105"
                    : "hover:shadow-lg"
                }`}
              >
                {tier.highlighted && (
                  <div className="mb-4 inline-block px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-foreground mb-2">{tier.name}</h3>
                <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-primary">${tier.monthlyPrice}</span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>

                <div className="space-y-3 mb-8">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full ${
                    tier.highlighted
                      ? "bg-primary hover:bg-primary/90"
                      : "bg-slate-200 hover:bg-slate-300 text-foreground"
                  }`}
                >
                  {tier.cta}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="container text-center space-y-6">
          <h2 className="text-4xl font-bold">Ready to Transform Your Marketing?</h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Start with a free trial today and see how our AI agents can automate your marketing operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
