import { DashboardLayout } from "@/components/DashboardLayout";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  ShoppingBag,
  BookOpen,
  Sparkles,
  Layers,
  Zap,
  CheckCircle2,
  TrendingUp,
  Share2,
  Target,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Marketplace() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const apps = [
    {
      id: "app-market-marksman",
      category: "apps",
      name: "Market Marksman",
      provider: "URC Ecosystem Apps",
      type: "Predictive Opportunity App",
      status: "Live",
      statusVariant: "default" as const,
      price: "Included in OS",
      description: "Opportunity discovery and predictive deal signal briefs for identifying high-margin market wedges.",
      icon: Target,
      tags: ["Opportunities", "Deal Signals", "Sales Intelligence"],
    },
    {
      id: "app-pulse-social",
      category: "apps",
      name: "Pulse Social",
      provider: "URC Ecosystem Apps",
      type: "Content Syndication Engine",
      status: "Live",
      statusVariant: "default" as const,
      price: "Included in OS",
      description: "Automated social content generation, multi-channel syndication, and post scheduling engine.",
      icon: Share2,
      tags: ["Social Media", "LinkedIn", "Content Scheduling"],
    },
    {
      id: "app-leadpulse",
      category: "apps",
      name: "LeadPulse",
      provider: "URC Ecosystem Apps",
      type: "Lead Discovery & Enrichment",
      status: "Live",
      statusVariant: "default" as const,
      price: "Included in OS",
      description: "Automated B2B lead discovery, contact scraping, and enrichment engine for founder-led outreach.",
      icon: TrendingUp,
      tags: ["Lead Gen", "Enrichment", "B2B Prospecting"],
    },
    {
      id: "pkg-founder-signal",
      category: "apps",
      name: "Founder Signal System",
      provider: "Uncle Robert Consulting",
      type: "Starter Marketing Sprint",
      status: "Live (Beta)",
      statusVariant: "secondary" as const,
      price: "$1,000 one-time",
      description: "3–5 day turnkey starter marketing sprint: signal brief, message map, first content batch, and proof-capture loop.",
      icon: Zap,
      tags: ["Founder Marketing", "Starter Sprint", "Beta"],
    },
    {
      id: "app-consulting-gen",
      category: "apps",
      name: "Consulting Assessment Generator",
      provider: "URC Internal Tools",
      type: "Diagnostic Tool",
      status: "Offline / Staged",
      statusVariant: "outline" as const,
      price: "Advisory Tool",
      description: "Automated diagnostic questionnaire generator for client maturity assessment and gap analysis.",
      icon: FileText,
      tags: ["Consulting", "Diagnostic", "Internal"],
    },
    {
      id: "pkg-48hr-linkedin",
      category: "apps",
      name: "48-Hour LinkedIn Authority",
      provider: "URC Campaign Systems",
      type: "Campaign Package",
      status: "Offline / Legacy",
      statusVariant: "outline" as const,
      price: "Legacy Asset",
      description: "Rapid authority-building sprint playbook with email nurture and content frameworks.",
      icon: Sparkles,
      tags: ["LinkedIn", "Authority", "Campaign"],
    },
  ];

  const books = [
    {
      id: "book-bgw",
      category: "books",
      name: "Bootstrapper's Guide to the World",
      author: "Robert T. McCarthy",
      price: "$59.99",
      rating: 5.0,
      format: "Digital Compendium / PDF & Notion",
      description: "The complete playbook of 28 bootstrapped business models, unit economics, and operational blueprints.",
      icon: BookOpen,
      tags: ["Bootstrapping", "Business Models", "Funnel Core"],
    },
    {
      id: "book-soe",
      category: "books",
      name: "Startup Operational Excellence",
      author: "Robert T. McCarthy",
      price: "$19.99",
      rating: 5.0,
      format: "Digital Book & SOP Templates",
      description: "The definitive operating manual for eliminating informational drift, structuring teams, and scaling lean.",
      icon: BookOpen,
      tags: ["Operations", "Governance", "Lean Scale"],
      link: "https://gumroad.com",
    },
  ];

  const playbooks = [
    {
      id: "pb-mkt",
      category: "playbooks",
      name: "Marketing (MKT) Playbook",
      department: "MKT-01 to MKT-09",
      price: "$99/mo",
      description: "Unlock all automated DAG workflows for lead generation, content syndication, email nurture, and polls.",
      icon: Layers,
      tags: ["Lead Gen", "Content", "Nurture"],
    },
    {
      id: "pb-sal",
      category: "playbooks",
      name: "Sales (SAL) Playbook",
      department: "SAL-01 to SAL-06",
      price: "$149/mo",
      description: "Automated proposal generation, contract onboarding, deal discount controls, and negotiation playbooks.",
      icon: Layers,
      tags: ["Proposals", "Contracts", "Closing"],
    },
    {
      id: "pb-ops",
      category: "playbooks",
      name: "Operations (OPS) Playbook",
      department: "OPS-01 to OPS-08",
      price: "$199/mo",
      description: "Enterprise system governance, automated drift scanning, SOP version control, and infrastructure monitoring.",
      icon: Layers,
      tags: ["Governance", "Drift Control", "SOPs"],
    },
  ];

  const allItems = [...apps, ...books, ...playbooks];

  const filteredItems = allItems.filter((item) => {
    const matchesTab = activeTab === "all" || item.category === activeTab;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <ShoppingBag className="w-8 h-8 text-primary" />
              Ecosystem Marketplace
            </h1>
            <p className="text-muted-foreground mt-1">
              Deploy live applications, authority books, and automated workflow playbooks.
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search apps, books, playbooks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm shadow-sm"
            />
          </div>
        </div>

        {/* Tabs Filter */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid grid-cols-4 max-w-lg">
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="apps">Live Apps</TabsTrigger>
            <TabsTrigger value="books">Books</TabsTrigger>
            <TabsTrigger value="playbooks">Playbooks</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Grid of Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.id}
                className="flex flex-col border border-border/80 bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-200"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <Icon className="w-5 h-5" />
                    </div>
                    {"status" in item && (
                      <Badge variant={item.statusVariant}>{item.status}</Badge>
                    )}
                    {"price" in item && !("status" in item) && (
                      <Badge variant="outline" className="font-semibold text-primary">
                        {item.price}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl font-bold">{item.name}</CardTitle>
                  <CardDescription className="text-xs font-medium text-muted-foreground">
                    {"provider" in item ? item.provider : "author" in item ? `By ${item.author}` : item.department}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 pb-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-md font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">
                    {"price" in item ? item.price : "Included"}
                  </span>
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-xs font-medium"
                    onClick={() => {
                      if (item.category === "books") {
                        if (item.id === "book-bgw") {
                          setLocation("/book");
                        } else {
                          toast.success(`Opening ${item.name} Gumroad checkout ($19.99)...`);
                          window.open("https://gumroad.com", "_blank");
                        }
                      } else if (item.category === "apps") {
                        if (item.id === "pulse-social") {
                          window.open("https://pulse-social-agentlab-projects.vercel.app", "_blank");
                        } else {
                          toast.success(`${item.name} mounted into workspace.`);
                          setLocation("/command-center");
                        }
                      } else if (item.category === "playbooks") {
                        toast.success(`${item.name} activated! Workflows ready in Command Center.`);
                        setLocation("/command-center");
                      }
                    }}
                  >
                    {item.category === "books" ? "Get Book" : item.category === "apps" ? "Launch / Mount" : "Unlock Playbook"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Value Proposition Box */}
        <div className="p-6 rounded-xl border border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Ownable OS Continuity Guarantee
            </h3>
            <p className="text-sm text-muted-foreground max-w-2xl">
              All live applications and modular knowledge playbooks mount directly into your isolated client workspace (`workspace_id` tenancy).
            </p>
          </div>
          <Button variant="outline" className="shrink-0 border-primary/40 hover:bg-primary/10">
            View Workspace Entitlements
          </Button>
        </div>
      </div>
      <Footer />
    </DashboardLayout>
  );
}
