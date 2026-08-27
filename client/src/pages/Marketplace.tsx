import { DashboardLayout } from "@/components/DashboardLayout";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, ShoppingBag, Star, Download, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");

  const featuredAgents = [
    {
      id: 1,
      name: "SDR Intake Agent",
      provider: "AgentLab Templates",
      rating: 4.8,
      downloads: "12k+",
      description: "Automatically handles incoming lead qualification and schedules calls.",
      tags: ["Sales", "HubSpot", "Calendly"]
    },
    {
      id: 2,
      name: "Blog Content Writer",
      provider: "AgentLab Templates",
      rating: 4.9,
      downloads: "8k+",
      description: "Generates long-form SEO optimized content from a brief.",
      tags: ["Marketing", "SEO", "Content"]
    },
    {
      id: 3,
      name: "Customer Support Tier 1",
      provider: "AgentLab Templates",
      rating: 4.7,
      downloads: "15k+",
      description: "Answers common FAQs and routes complex issues to human agents.",
      tags: ["Support", "Zendesk", "Slack"]
    },
    {
      id: 4,
      name: "Culture Playbook",
      provider: "AgentLab Playbooks",
      rating: 4.9,
      downloads: "5k+",
      description: "Define, instill, and scale your company culture automatically through onboarding workflows.",
      tags: ["HR", "Culture", "Playbook"]
    },
    {
      id: 5,
      name: "Aftercare Playbook",
      provider: "AgentLab Playbooks",
      rating: 4.8,
      downloads: "4k+",
      description: "Automate post-purchase follow-ups, community building, and long-term contract renewals.",
      tags: ["Customer Success", "Retention", "Playbook"]
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <ShoppingBag className="w-8 h-8 text-primary" />
              Agent Marketplace
            </h1>
            <p className="text-muted-foreground mt-1">
              Discover and deploy pre-built workflows and AI agents.
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search marketplace..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
        </div>

        {/* Featured Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Featured Templates</h2>
            <Button variant="ghost" className="text-primary hover:text-primary/90 text-sm">
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredAgents.map((agent) => (
              <Card key={agent.id} className="flex flex-col p-6 hover:shadow-md transition-shadow border-border">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{agent.name}</h3>
                    <p className="text-sm text-muted-foreground">{agent.provider}</p>
                  </div>
                  <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    {agent.rating}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4 flex-1">
                  {agent.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {agent.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Download className="w-4 h-4" />
                    {agent.downloads}
                  </div>
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    Install
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Categories Section */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Sales & CRM", "Marketing", "Customer Support", "Data Analysis", "HR & Recruiting", "Operations", "Finance", "Developer Tools"].map(category => (
              <Card key={category} className="p-4 flex items-center justify-center text-center hover:border-primary cursor-pointer transition-colors border-border">
                <span className="font-medium text-foreground">{category}</span>
              </Card>
            ))}
          </div>
        </div>

      </div>
      <Footer />
    </DashboardLayout>
  );
}
