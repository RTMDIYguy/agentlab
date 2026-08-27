import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Navigation } from "./Navigation";
import { DashboardRightSidebar } from "./DashboardRightSidebar";
import { 
  LayoutDashboard, 
  TerminalSquare, 
  Cpu, 
  ShieldAlert, 
  CreditCard, 
  Settings,
  ShoppingBag
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();

  const sidebarLinks = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/command-center", label: "Command Center", icon: TerminalSquare },
    { href: "/agents", label: "Agents", icon: Cpu },
    { href: "/auditing", label: "Auditing", icon: ShieldAlert },
    { href: "/billing", label: "Billing", icon: CreditCard },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
    { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-65px)]">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col overflow-y-auto">
          <div className="p-4 py-6">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">Operations</h2>
            <nav className="space-y-1">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location === link.href;
                return (
                  <Link key={link.href} href={link.href}>
                    <a className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </a>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative">
          {children}
        </main>
        
        {/* Right Sidebar */}
        <DashboardRightSidebar />
      </div>
    </div>
  );
}
