export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-semibold text-foreground mb-4">Product & Tools</h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>
                <a
                  href="/icp-generator"
                  className="hover:text-primary transition-colors text-primary/90 font-medium"
                >
                  🎯 ICP Generator
                </a>
              </li>
              <li>
                <a
                  href="/assessment-generator"
                  className="hover:text-primary transition-colors text-emerald-400/90 font-medium"
                >
                  📋 Assessment Generator
                </a>
              </li>
              <li>
                <a
                  href="/features"
                  className="hover:text-primary transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="/pricing"
                  className="hover:text-primary transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a href="/security" className="hover:text-primary transition-colors">
                  Security
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>
                <a
                  href="/about"
                  className="hover:text-primary transition-colors"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="/blog"
                  className="hover:text-primary transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <a href="/careers" className="hover:text-primary transition-colors">
                  Careers
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>
                <a
                  href="/privacy"
                  className="hover:text-primary transition-colors"
                >
                  Privacy
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="hover:text-primary transition-colors"
                >
                  Terms
                </a>
              </li>
              <li>
                <a
                  href="/cookies"
                  className="hover:text-primary transition-colors"
                >
                  Cookies
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>
                <a
                  href="/help"
                  className="hover:text-primary transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="/help#contact"
                  className="hover:text-primary transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="/status"
                  className="hover:text-primary transition-colors"
                >
                  Status
                </a>
              </li>
              <li>
                <a
                  href="/docs"
                  className="hover:text-primary transition-colors"
                >
                  Documentation
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Official Ecosystem & Infrastructure Partners */}
        <div className="border-t border-border pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Official Infrastructure Partner:
            </span>
            <a 
              href="https://partnernetwork.ionos.com/partner/agent.lab?origin=PartnerBadge" 
              target="_blank" 
              rel="nofollow noopener noreferrer"
              className="inline-block transition-transform hover:scale-105"
            >
              <img 
                src="https://images-1.partnerportal.ionos.com/items/6484dc88-fd70-4523-b919-2b70b2ecc722/profiles/a41b3bdd-0f5c-4f01-8de7-b38bdaa13974/badges/normal_blue_eco" 
                alt="IONOS - Official Partner" 
                className="h-10 w-auto rounded"
              />
            </a>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Hosted & Secured via IONOS Cloud &bull; agent-lab.tech</span>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left">
            <p className="text-muted-foreground text-sm">
              © 2026 AgentLab, an Uncle Robert Consulting LLC project. All rights reserved.
            </p>
            <p className="text-muted-foreground text-xs mt-2 max-w-2xl">
              Servant leadership, honest build logs, human judgment, responsible
              automation, and practical stewardship.
            </p>
          </div>
          <p className="text-muted-foreground text-sm mt-4 md:mt-0">
            Built with <span className="text-primary">❤</span> using Gemini & Deepmind
          </p>
        </div>
      </div>
    </footer>
  );
}
