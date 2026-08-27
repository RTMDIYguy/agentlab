import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { 
  Map, 
  TerminalSquare, 
  Cpu, 
  ShieldAlert, 
  CreditCard, 
  Settings,
  ShoppingBag,
  LifeBuoy,
  BookOpen
} from "lucide-react";
import { Link } from "wouter";

export default function Documentation() {
  const directorySections = [
    {
      title: "Command Center",
      icon: TerminalSquare,
      path: "/command-center",
      description: "Mission control for all active agents and workflows. Monitor live events.",
      isHere: false,
    },
    {
      title: "Agents",
      icon: Cpu,
      path: "/agents",
      description: "Manage, configure, and monitor individual AI agents and their assignments.",
      isHere: false,
    },
    {
      title: "Auditing",
      icon: ShieldAlert,
      path: "/auditing",
      description: "Review agent logs, decisions, and security alerts. Enforce human-in-the-loop.",
      isHere: false,
    },
    {
      title: "Billing",
      icon: CreditCard,
      path: "/billing",
      description: "View usage, manage subscriptions, and analyze cloud spending.",
      isHere: false,
    },
    {
      title: "Settings",
      icon: Settings,
      path: "/dashboard/settings",
      description: "Configure workspace settings, secrets (Vertex/OpenAI), and integrations.",
      isHere: false,
    },
    {
      title: "Marketplace",
      icon: ShoppingBag,
      path: "/marketplace",
      description: "Install pre-built workflows and templates to extend your agency's capabilities.",
      isHere: false,
    },
    {
      title: "Blog Manager",
      icon: BookOpen,
      path: "/blog-manager",
      description: "Manage autonomous content generation and publication pipelines.",
      isHere: false,
    },
    {
      title: "Support & Knowledge Base",
      icon: LifeBuoy,
      path: "/help",
      description: "Access tutorials, contact support, and read FAQs.",
      isHere: false,
    },
    {
      title: "Owner's Manual",
      icon: Map,
      path: "/docs",
      description: "The live directory of the entire business operating system.",
      isHere: true,
    },
    {
      title: "Careers",
      icon: Cpu,
      path: "/careers",
      description: "Apply for roles and join the agentic future.",
      isHere: false,
    },
    {
      title: "About URC",
      icon: BookOpen,
      path: "/about",
      description: "Agency values and operating promise for Uncle Robert Consulting.",
      isHere: false,
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              <Map className="w-10 h-10 text-primary" />
              Owner's Manual & Directory
            </h1>
            <p className="text-xl text-muted-foreground mt-3">
              Your business operating system, mapped in real-time. Navigate to any component below.
            </p>
          </div>
        </div>

        {/* The Mall Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          {directorySections.map((section) => {
            const Icon = section.icon;
            return (
              <Link key={section.path} href={section.path}>
                <a className="block h-full relative group">
                  <Card 
                    className={`h-full p-6 transition-all border-2 flex flex-col 
                      ${section.isHere 
                        ? 'border-red-500 bg-red-500/5 shadow-md scale-[1.02] z-10' 
                        : 'border-border hover:border-primary hover:shadow-sm'
                      }`}
                  >
                    {section.isHere && (
                      <div className="absolute -top-4 -right-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 animate-bounce">
                        <Map className="w-3 h-3" />
                        YOU ARE HERE
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-lg ${section.isHere ? 'bg-red-500/10 text-red-600' : 'bg-primary/10 text-primary'}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className={`text-xl font-bold ${section.isHere ? 'text-red-700' : 'text-foreground'}`}>
                        {section.title}
                      </h3>
                    </div>
                    
                    <p className="text-muted-foreground text-sm flex-1 leading-relaxed">
                      {section.description}
                    </p>

                    <div className={`mt-4 text-sm font-medium ${section.isHere ? 'text-red-600' : 'text-primary opacity-0 group-hover:opacity-100 transition-opacity'}`}>
                      {section.isHere ? 'Current Location' : 'Access Node →'}
                    </div>
                  </Card>
                </a>
              </Link>
            );
          })}
        </div>
        
        {/* Real-time Status Board Footer */}
        <div className="mt-12 p-6 bg-muted/30 border border-border rounded-xl">
          <h3 className="text-lg font-semibold text-foreground mb-4">Live System Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Active Agents</span>
              <span className="text-2xl font-bold text-foreground">3</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Uptime</span>
              <span className="text-2xl font-bold text-green-600">99.9%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Pending Audits</span>
              <span className="text-2xl font-bold text-yellow-600">2</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Version</span>
              <span className="text-2xl font-bold text-foreground">v1.2.0</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
