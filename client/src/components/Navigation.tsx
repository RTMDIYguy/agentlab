import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { getLoginUrl } from "@/const";

export function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const handleMouseEnter = (menu: string) => {
    setOpenMenu(menu);
  };

  const handleMouseLeave = () => {
    setOpenMenu(null);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AL</span>
          </div>
          <span className="font-bold text-lg text-foreground">AgentLab</span>
        </div>

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
            <div className="absolute left-0 mt-0 w-48 bg-white border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
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
          <a href="/features" className="px-3 py-2 text-foreground hover:text-primary transition-colors">
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
            <div className="absolute left-0 mt-0 w-48 bg-white border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
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
          <a href="/pricing" className="px-3 py-2 text-foreground hover:text-primary transition-colors">
            Pricing
          </a>

          {/* Support link */}
          <a href="#contact" className="px-3 py-2 text-foreground hover:text-primary transition-colors">
            Support
          </a>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">{user?.name}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="hidden sm:inline-flex"
                onClick={() => (window.location.href = getLoginUrl())}
              >
                Sign In
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={() => (window.location.href = getLoginUrl())}
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
