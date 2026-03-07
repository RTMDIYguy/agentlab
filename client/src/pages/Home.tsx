import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Zap, Brain, Network, Clock, Shield, Cpu } from "lucide-react";
import { useState } from "react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const capabilities = [
    {
      icon: Zap,
      title: "Intelligent Automation",
      description: "Automate complex business processes with intelligent decision-making capabilities, reducing manual work and increasing operational efficiency.",
    },
    {
      icon: Brain,
      title: "Machine Learning",
      description: "Advanced algorithms enable agents to continuously learn from data patterns, adapt to changing conditions, and improve performance over time.",
    },
    {
      icon: Network,
      title: "Multi-Agent Systems",
      description: "Deploy coordinated teams of AI agents that work together seamlessly, sharing information and collaborating to solve complex challenges.",
    },
    {
      icon: Clock,
      title: "Real-time Processing",
      description: "Process and analyze data in real-time with lightning-fast response times, enabling immediate decision-making and adaptation.",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Built with enterprise-grade security features including end-to-end encryption, secure authentication, and compliance with industry standards.",
    },
    {
      icon: Cpu,
      title: "Scalable Infrastructure",
      description: "Cloud-native architecture that scales automatically with your business needs, from startup to enterprise level.",
    },
  ];

  const features = [
    { title: "Autonomous AI Systems", description: "Self-managing systems that operate 24/7" },
    { title: "Real-time Learning", description: "Continuous improvement from live data" },
    { title: "Enterprise-grade Security", description: "SOC 2 and GDPR compliant" },
    { title: "Scalable Architecture", description: "Grows with your business" },
    { title: "24/7 Operation", description: "Always-on intelligent automation" },
    { title: "Industry Expertise", description: "Built for enterprise needs" },
  ];

  const testimonials = [
    {
      quote: "AgentLab transformed how we manage our operations. The AI agents handle complex workflows with remarkable accuracy and speed.",
      author: "Sarah Chen",
      role: "CTO at TechCorp",
      company: "@TechCorp",
    },
    {
      quote: "The level of automation we achieved with AgentLab exceeded our expectations. It's intuitive, powerful, and production-ready.",
      author: "Michael Rodriguez",
      role: "Operations Director at GlobalSys",
      company: "@GlobalSys",
    },
    {
      quote: "Implementing AgentLab reduced our operational costs by 40% while improving service quality. Highly recommended for any enterprise.",
      author: "Emma Thompson",
      role: "VP of Innovation at FutureTech",
      company: "@FutureTech",
    },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      monthlyPrice: 40,
      yearlyPrice: 400,
      description: "Perfect for small teams and startups",
      features: [
        "Up to 5 AI agents",
        "Basic automation workflows",
        "Email support",
        "Community access",
        "Monthly updates",
      ],
      highlighted: false,
      stripeId: "starter",
    },
    {
      name: "Professional",
      monthlyPrice: 199,
      yearlyPrice: 1990,
      description: "For growing businesses and teams",
      features: [
        "Unlimited AI agents",
        "Advanced automation workflows",
        "Priority email & chat support",
        "Custom integrations",
        "Weekly updates",
        "Analytics dashboard",
      ],
      highlighted: true,
      stripeId: "professional",
    },
    {
      name: "Enterprise",
      monthlyPrice: 599,
      yearlyPrice: 5990,
      description: "For large organizations",
      features: [
        "Unlimited everything",
        "Custom AI agent development",
        "24/7 dedicated support",
        "White-label options",
        "Real-time updates",
        "Advanced security features",
        "SLA guarantee",
      ],
      highlighted: false,
      stripeId: "enterprise",
    },
  ];

  const blogPosts = [
    {
      category: "Technology",
      title: "The Future of Autonomous AI Systems",
      excerpt: "Explore how AI agents are revolutionizing business automation and decision-making processes.",
      author: "Alex Johnson",
      role: "AI Research Lead",
      date: "Mar 2025",
    },
    {
      category: "Business",
      title: "Reducing Operational Costs with AI Automation",
      excerpt: "Learn how enterprises are cutting costs by 40% through intelligent automation with AgentLab.",
      author: "Lisa Wang",
      role: "Business Strategist",
      date: "Feb 2025",
    },
    {
      category: "Case Study",
      title: "How Fortune 500 Companies Deploy AI Agents",
      excerpt: "Real-world examples of successful AI agent implementations in enterprise environments.",
      author: "David Park",
      role: "Solutions Architect",
      date: "Jan 2025",
    },
  ];

  const createCheckoutMutation = trpc.stripe.createCheckoutSession.useMutation();

  const handlePricingClick = (planId: string) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    toast.loading("Redirecting to checkout...");
    createCheckoutMutation.mutate(
      {
        plan: planId as "starter" | "professional" | "enterprise",
        billingCycle,
      },
      {
        onSuccess: (data) => {
          toast.dismiss();
          window.open(data.checkoutUrl, "_blank");
        },
        onError: (error) => {
          toast.dismiss();
          toast.error("Failed to create checkout session. Please try again.");
          console.error("Checkout error:", error);
        },
      }
    );
  };

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
            <a href="/about" className="text-foreground hover:text-primary transition-colors">About</a>
            <a href="#blog" className="text-foreground hover:text-primary transition-colors">Blog</a>
            <a href="#contact" className="text-foreground hover:text-primary transition-colors">Support</a>
            {isAuthenticated && <a href="/dashboard" className="text-foreground hover:text-primary transition-colors">Dashboard</a>}
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">{user?.name}</span>
                <Button variant="outline" size="sm" onClick={logout}>Sign Out</Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="hidden sm:inline-flex" onClick={() => window.location.href = getLoginUrl()}>Sign In</Button>
                <Button className="bg-primary hover:bg-primary/90" onClick={() => window.location.href = getLoginUrl()}>Get Started</Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 z-0">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663132466342/g5zLrreBZqqfDrbKLrwsy5/hero-background-hXP2HEXwNGeiUCVUjiEqze.webp"
            alt="Hero background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent"></div>
        </div>
        
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                Pioneering the Future of <span className="gradient-text">AI Agents</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                AgentLab is at the forefront of AI agent technology, developing intelligent autonomous systems that transform how businesses operate. Our cutting-edge AI agents deliver unprecedented efficiency and innovation across industries.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white" onClick={() => window.location.href = getLoginUrl()}>
                  <Zap className="w-5 h-5 mr-2" />
                  Get Started
                </Button>
                <Button size="lg" variant="outline" className="border-2">
                  Learn More
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="capabilities" className="py-20 bg-card">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="section-title">AI Agent Capabilities</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              Our advanced AI agents are equipped with cutting-edge capabilities that transform how businesses operate, making intelligent decisions and automating complex workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {capabilities.map((capability, index) => {
              const Icon = capability.icon;
              return (
                <Card key={index} className="p-8 border border-border hover:border-primary/50 transition-colors card-hover">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{capability.title}</h3>
                  <p className="text-muted-foreground">{capability.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="section-title">Revolutionizing Business with AI Agents</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              AgentLab specializes in developing cutting-edge AI agents that automate complex business processes, enhance decision-making, and drive innovation across industries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-white font-bold">{index + 1}</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
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
              Discover how leading organizations are transforming their operations with AgentLab's intelligent AI agents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-8 border border-border">
                <div className="mb-6">
                  <p className="text-foreground text-lg leading-relaxed italic">"{testimonial.quote}"</p>
                </div>
                <div className="border-t border-border pt-6">
                  <p className="font-semibold text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  <p className="text-sm text-primary font-medium">{testimonial.company}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="section-title">Simple and Affordable Pricing</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              Choose the perfect plan for your business needs. All plans include core features with flexible scaling.
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
              <span className="ml-2 text-xs bg-accent text-accent-foreground px-2 py-1 rounded">Save 20%</span>
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
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">
                    ${billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice}
                  </span>
                  <span className="text-muted-foreground ml-2">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
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
              Stay updated with the latest insights on AI agents, automation, and business transformation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <Card key={index} className="p-6 border border-border hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer">
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                    {post.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{post.title}</h3>
                <p className="text-muted-foreground mb-6">{post.excerpt}</p>
                <div className="border-t border-border pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{post.author}</p>
                    <p className="text-xs text-muted-foreground">{post.role}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{post.date}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="container max-w-2xl">
          <div className="text-center mb-12">
            <h2 className="section-title">Need Help? Open a Ticket</h2>
            <p className="section-subtitle">Our support team will get back to you ASAP via email.</p>
          </div>

          <Card className="p-8 border border-border">
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Your Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Your Email</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Your Message</label>
                <textarea
                  placeholder="Tell us how we can help..."
                  rows={5}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90">Submit Ticket</Button>
            </form>
          </Card>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-accent/10 border-t border-border">
        <div className="container max-w-2xl text-center">
          <h3 className="text-2xl font-bold text-foreground mb-3">Subscribe to receive future updates</h3>
          <p className="text-muted-foreground mb-6">
            No spam guaranteed, So please don't send any spam mail.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button className="bg-primary hover:bg-primary/90">Subscribe</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Cookies</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Status</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-muted-foreground text-sm">
              © 2025 AgentLab. All rights reserved.
            </p>
            <p className="text-muted-foreground text-sm">
              Built with <span className="text-primary">❤</span> using Manus
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
