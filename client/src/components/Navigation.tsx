import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ChevronDown, BookOpen } from "lucide-react";
import { Link, useLocation } from "wouter";

export function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const handleMouseEnter = (menu: string) => {
    setOpenMenu(menu);
  };

  const handleMouseLeave = () => {
    setOpenMenu(null);
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between py-3">
        <Link href="/">
          <a className="flex items-center gap-3 cursor-pointer group">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card/60 border border-border/80 shadow-sm backdrop-blur">
              <img
                src="/logos/urc-logo-old.webp"
                alt="Uncle Robert Consulting (Heritage)"
                title="Uncle Robert Consulting (Heritage Green)"
                className="h-7 w-7 object-contain rounded transition-transform group-hover:scale-105"
              />
              <img
                src="/logos/urc-logo-new.png"
                alt="Uncle Robert Consulting LLC"
                title="Uncle Robert Consulting LLC (Blue & Gold)"
                className="h-7 w-7 object-contain rounded transition-transform group-hover:scale-105"
              />
              <img
                src="/logos/fundable-consulting-logo.png"
                alt="Fundable Consulting"
                title="Fundable Consulting"
                className="h-7 w-7 object-contain rounded transition-transform group-hover:scale-105"
              />
              <img
                src="/logos/tactix-logo.jpg"
                alt="Tactix"
                title="Tactix Fulfillment & Delivery"
                className="h-7 w-7 object-contain rounded transition-transform group-hover:scale-105"
              />
              <img
                src="/logos/agentlab-avatar.png"
                alt="AgentLab"
                title="AgentLab Operating System"
                className="h-7 w-7 object-contain rounded-lg border border-primary/40 shadow-sm transition-transform group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-foreground leading-tight group-hover:text-primary transition-colors">
                AgentLab
              </span>
              <span className="text-[10px] text-muted-foreground font-mono leading-none">
                URC Operating Backbone
              </span>
            </div>
          </a>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {/* Home with nested menu */}
          <div
            className="relative group"
            onMouseEnter={() => handleMouseEnter("home")}
            onMouseLeave={handleMouseLeave}
          >
            <button className="px-3 py-2 text-foreground hover:text-primary transition-colors flex items-center gap-1">
              Home
              <ChevronDown className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <div className="absolute left-0 mt-0 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
              {isAuthenticated && (
                <>
                  <a
                    href="/dashboard"
                    className="block px-4 py-2 text-foreground hover:bg-accent/10 hover:text-primary transition-colors"
                  >
                    Dashboard
                  </a>
                  <a
                    href="/ops-agent"
                    className="block px-4 py-2 text-foreground hover:bg-accent/10 hover:text-primary transition-colors"
                  >
                    Ops Agent
                  </a>
                  <a
                    href="/marketplace"
                    className="marketplace-link block px-4 py-2 text-foreground hover:bg-accent/10 hover:text-primary transition-colors"
                  >
                    Marketplace
                  </a>
                  <a
                    href="/playbooks"
                    className="playbooks-link block px-4 py-2 text-foreground hover:bg-accent/10 hover:text-primary transition-colors"
                  >
                    Operating Playbooks
                  </a>
                  <a
                    href="/command-center"
                    className="command-center-link block px-4 py-2 text-foreground hover:bg-accent/10 hover:text-primary transition-colors"
                  >
                    Command Center
                  </a>
                  <div className="border-t border-border my-1"></div>
                </>
              )}
              <a
                href="/about"
                className="block px-4 py-2 text-foreground hover:bg-accent/10 hover:text-primary transition-colors"
              >
                About
              </a>
            </div>
          </div>

          {/* Features link */}
          <a
            href="/features"
            className="px-3 py-2 text-foreground hover:text-primary transition-colors"
          >
            Features
          </a>

          {/* Blog with nested menu */}
          <div
            className="relative group"
            onMouseEnter={() => handleMouseEnter("blog")}
            onMouseLeave={handleMouseLeave}
          >
            <button className="px-3 py-2 text-foreground hover:text-primary transition-colors flex items-center gap-1">
              Blog
              <ChevronDown className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <div className="absolute left-0 mt-0 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
              <a
                href="/blog"
                className="block px-4 py-2 text-foreground hover:bg-accent/10 hover:text-primary transition-colors"
              >
                Blog Posts
              </a>
              {isAuthenticated && (
                <>
                  <div className="border-t border-border my-1"></div>
                  <a
                    href="/blog-manager"
                    className="block px-4 py-2 text-foreground hover:bg-accent/10 hover:text-primary transition-colors"
                  >
                    Blog Manager
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Pricing link */}
          <a
            href="/pricing"
            className="px-3 py-2 text-foreground hover:text-primary transition-colors"
          >
            Pricing
          </a>

          {/* Owner's Manual / Docs link */}
          <a
            href="/docs"
            className="px-3 py-2 text-foreground hover:text-primary transition-colors flex items-center gap-1 font-medium text-primary/90"
          >
            <BookOpen className="w-4 h-4 text-primary" />
            Manual
          </a>

          {/* Support link */}
          <a
            href="/support"
            className="px-3 py-2 text-foreground hover:text-primary transition-colors"
          >
            Support
          </a>
        </div>

        <div className="flex items-center gap-3">
          {/* Always Present Owner's Manual Quick-Access Button */}
          <Link href="/docs">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 border-primary/30 text-foreground hover:text-primary hover:border-primary bg-primary/5 hover:bg-primary/10 transition-all font-medium"
            >
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline">Owner's</span> Manual
            </Button>
          </Link>

          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground hidden lg:inline">
                {user?.name}
              </span>
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:inline-flex"
                >
                  Dashboard
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:inline-flex"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
