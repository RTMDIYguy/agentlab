import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import {
  Users,
  Target,
  Lightbulb,
  Award,
  TrendingUp,
  Globe,
  ArrowRight,
  Github,
  Linkedin,
  Twitter,
} from "lucide-react";

export default function About() {
  const [, navigate] = useLocation();

  const teamMembers = [
    {
      name: "Sarah Chen",
      role: "Founder & CEO",
      bio: "AI researcher with 10+ years in machine learning and autonomous systems. Previously led AI initiatives at TechCorp.",
      image: "👩‍💼",
      social: { github: "#", linkedin: "#", twitter: "#" },
    },
    {
      name: "Michael Rodriguez",
      role: "CTO & Co-founder",
      bio: "Full-stack engineer specializing in distributed systems. Built scalable infrastructure for Fortune 500 companies.",
      image: "👨‍💻",
      social: { github: "#", linkedin: "#", twitter: "#" },
    },
    {
      name: "Emma Thompson",
      role: "VP of Product",
      bio: "Product strategist focused on AI-driven solutions. Passionate about making complex technology accessible.",
      image: "👩‍🔬",
      social: { github: "#", linkedin: "#", twitter: "#" },
    },
    {
      name: "David Park",
      role: "Head of Engineering",
      bio: "Engineering leader with expertise in cloud architecture and DevOps. Committed to building reliable systems.",
      image: "👨‍🏫",
      social: { github: "#", linkedin: "#", twitter: "#" },
    },
  ];

  const values = [
    {
      icon: Lightbulb,
      title: "Innovation",
      description:
        "We push the boundaries of AI technology to create solutions that were previously impossible.",
    },
    {
      icon: Users,
      title: "Collaboration",
      description:
        "We believe in the power of teamwork and work closely with our customers to understand their needs.",
    },
    {
      icon: Target,
      title: "Excellence",
      description:
        "We maintain the highest standards in everything we do, from code quality to customer service.",
    },
    {
      icon: Globe,
      title: "Accessibility",
      description:
        "We make cutting-edge AI technology accessible to businesses of all sizes.",
    },
  ];

  const achievements = [
    {
      number: "500+",
      label: "Active Customers",
      description: "Trusted by businesses worldwide",
    },
    {
      number: "99.9%",
      label: "Uptime",
      description: "Reliable infrastructure",
    },
    {
      number: "10M+",
      label: "Tasks Automated",
      description: "Billions in value created",
    },
    {
      number: "24/7",
      label: "Support",
      description: "Always here for you",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between py-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AL</span>
            </div>
            <span className="font-bold text-lg text-foreground">AgentLab</span>
          </button>
          <div className="hidden md:flex items-center gap-8">
            <a href="#mission" className="text-foreground hover:text-primary transition-colors">
              Mission
            </a>
            <a href="#team" className="text-foreground hover:text-primary transition-colors">
              Team
            </a>
            <a href="#values" className="text-foreground hover:text-primary transition-colors">
              Values
            </a>
            <a href="#achievements" className="text-foreground hover:text-primary transition-colors">
              Achievements
            </a>
          </div>
          <Button
            onClick={() => navigate("/")}
            className="bg-primary hover:bg-primary/90"
          >
            Back to Home
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10 border-b border-border">
        <div className="container max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            About AgentLab
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            We're on a mission to revolutionize how businesses operate by making advanced AI
            agents accessible to everyone. Founded in 2023, AgentLab combines cutting-edge
            research with practical engineering to deliver intelligent automation solutions.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="py-20 bg-white">
        <div className="container max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                At AgentLab, we believe that artificial intelligence should empower businesses,
                not replace them. Our mission is to democratize access to advanced AI agents,
                enabling companies of all sizes to automate complex workflows, make better
                decisions, and focus on what matters most.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                We're committed to building technology that is not only powerful but also
                responsible, transparent, and aligned with human values.
              </p>
              <Button
                onClick={() => navigate("/")}
                className="bg-primary hover:bg-primary/90"
              >
                Explore Our Solutions
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg p-12 flex items-center justify-center">
              <Target className="w-32 h-32 text-primary opacity-50" />
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 bg-card border-b border-border">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Meet Our Team</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Talented individuals from diverse backgrounds united by a passion for AI and
              innovation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="p-6 border border-border hover:border-primary/50 transition-colors">
                <div className="text-6xl mb-4 text-center">{member.image}</div>
                <h3 className="text-xl font-bold text-foreground mb-1">{member.name}</h3>
                <p className="text-sm text-primary font-semibold mb-3">{member.role}</p>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  {member.bio}
                </p>
                <div className="flex gap-3 justify-center">
                  <a
                    href={member.social.github}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                  <a
                    href={member.social.linkedin}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a
                    href={member.social.twitter}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section id="values" className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Our Core Values</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              These principles guide every decision we make and every product we build.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="p-8 border border-border hover:border-primary/50 transition-colors">
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

      {/* Achievements Section */}
      <section id="achievements" className="py-20 bg-card border-b border-border">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Our Achievements</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Milestones that showcase our impact and growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <Card key={index} className="p-8 border border-border text-center">
                <div className="mb-4">
                  <TrendingUp className="w-8 h-8 text-primary mx-auto" />
                </div>
                <p className="text-4xl font-bold text-foreground mb-2">{achievement.number}</p>
                <p className="text-lg font-semibold text-foreground mb-2">{achievement.label}</p>
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
        <div className="container max-w-2xl text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">Ready to Join Us?</h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Whether you're looking to use AgentLab or join our team, we'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/")}
              className="bg-primary hover:bg-primary/90"
            >
              Get Started
            </Button>
            <Button variant="outline" className="border-2">
              Contact Us
            </Button>
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
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Social</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    GitHub
                  </a>
                </li>
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
