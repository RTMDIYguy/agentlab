import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageLayout } from "@/components/PageLayout";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Handshake,
  HeartHandshake,
  Scale,
  ShieldCheck,
  Target,
} from "lucide-react";
import { useLocation } from "wouter";

export default function About() {
  const [, navigate] = useLocation();

  const values = [
    {
      icon: HeartHandshake,
      title: "Servant Leadership",
      description:
        "Leadership exists to serve and empower the people doing the work. We measure success by growth, health, autonomy, and practical capability.",
    },
    {
      icon: ShieldCheck,
      title: "Honesty & Integrity",
      description:
        "Wins and failures both belong in the record. We name what is tested, what is blocked, and what still needs human review.",
    },
    {
      icon: Handshake,
      title: "Walk Beside Our Client",
      description:
        "We do not stop at plans or software handoffs. We help clients implement, clarify next steps, and preserve trust after delivery.",
    },
    {
      icon: CheckCircle2,
      title: "Intentional Excellence",
      description:
        "We take ownership of commitments and outcomes, verify before calling work complete, and turn mistakes into better systems.",
    },
    {
      icon: Bot,
      title: "Human Judgment With Responsible Automation",
      description:
        "Automation should make work easier without sacrificing quality, security, or privacy. Human judgment stays at the checkpoints that matter.",
    },
    {
      icon: Scale,
      title: "Practical Stewardship",
      description:
        "We use the simplest useful system, keep costs visible, avoid tool sprawl, and spend attention where it creates real leverage.",
    },
  ];

  const operatingProof = [
    "Change-control records for meaningful operating changes",
    "Human review before public publishing or client-facing claims",
    "Low-cost tooling unless a paid system earns its place",
    "Workflow packages tested before they are treated as products",
  ];

  return (
    <PageLayout>
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10 border-b border-border">
        <div className="container max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-4">
            Uncle Robert Consulting / Agent Lab / Tactix
          </p>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Agency values for AI-native operations
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            We build practical operating systems for founders and small teams by
            combining responsible automation, human judgment, and implementation
            support. The values below are the standard for how the work gets
            built, tested, sold, and improved.
          </p>
        </div>
      </section>

      <section id="mission" className="py-20 bg-white">
        <div className="container max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-6">
                Our operating promise
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Agent Lab is the public working surface for Uncle Robert
                Consulting: a place to test, document, and package workflows
                before asking clients to trust them.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                We automate repeatable work, keep humans in the judgment loop,
                and walk beside clients through the parts of implementation that
                still require context, care, and responsibility.
              </p>
              <Button onClick={() => navigate("/services")} className="bg-primary hover:bg-primary/90">
                Explore Services
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="bg-card border border-border rounded-lg p-8">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Values become proof when they change the work.
              </h3>
              <ul className="space-y-3">
                {operatingProof.map((item) => (
                  <li key={item} className="flex gap-3 text-muted-foreground">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="values" className="py-20 bg-card border-y border-border">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Our Agency Values
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              These principles guide how we use tools, serve clients, publish
              lessons, and decide what deserves to become a repeatable workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.title} className="p-8 border border-border hover:border-primary/50 transition-colors">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container max-w-3xl text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Practical help, not heavier systems
          </h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            If your tools are multiplying faster than your results, the next
            move is not another dashboard. It is a clearer operating loop,
            responsible automation, and a human review point where it matters.
          </p>
          <Button onClick={() => navigate("/help#contact")} className="bg-primary hover:bg-primary/90">
            Start a Conversation
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>
    </PageLayout>
  );
}
