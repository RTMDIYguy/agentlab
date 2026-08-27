import { MainNav } from "@/components/MainNav";
import { Footer } from "@/components/Footer";
import { Briefcase, Users, Zap, Heart } from "lucide-react";

export default function Careers() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MainNav />
      <main className="flex-grow pt-24 pb-16">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Join the Agentic Future
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Help us build the operating system for the AI-native agency. We're a team of builders passionate about responsible automation and servant leadership.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-20">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Remote First</h3>
              <p className="text-sm text-muted-foreground">Work from anywhere in the world on a flexible schedule.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">High Impact</h3>
              <p className="text-sm text-muted-foreground">Small teams shipping features that reshape workflows.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Servant Leadership</h3>
              <p className="text-sm text-muted-foreground">We value honesty, transparency, and lifting each other up.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Great Benefits</h3>
              <p className="text-sm text-muted-foreground">Competitive salary, equity, and comprehensive health coverage.</p>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Open Positions</h2>
            
            <div className="space-y-4">
              {/* Job Card 1 */}
              <div className="bg-card border border-border hover:border-primary/50 transition-colors rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-1">Senior Full-Stack Engineer</h3>
                  <div className="flex gap-3 text-sm text-muted-foreground">
                    <span>Engineering</span>
                    <span>•</span>
                    <span>Remote</span>
                    <span>•</span>
                    <span>Full-time</span>
                  </div>
                </div>
                <button className="mt-4 md:mt-0 px-6 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md font-medium text-sm transition-colors">
                  Apply Now
                </button>
              </div>

              {/* Job Card 2 */}
              <div className="bg-card border border-border hover:border-primary/50 transition-colors rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-1">AI Automation Specialist</h3>
                  <div className="flex gap-3 text-sm text-muted-foreground">
                    <span>Product</span>
                    <span>•</span>
                    <span>Remote</span>
                    <span>•</span>
                    <span>Full-time</span>
                  </div>
                </div>
                <button className="mt-4 md:mt-0 px-6 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md font-medium text-sm transition-colors">
                  Apply Now
                </button>
              </div>

              {/* Job Card 3 */}
              <div className="bg-card border border-border hover:border-primary/50 transition-colors rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-1">Product Designer</h3>
                  <div className="flex gap-3 text-sm text-muted-foreground">
                    <span>Design</span>
                    <span>•</span>
                    <span>Remote</span>
                    <span>•</span>
                    <span>Full-time</span>
                  </div>
                </div>
                <button className="mt-4 md:mt-0 px-6 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md font-medium text-sm transition-colors">
                  Apply Now
                </button>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <p className="text-muted-foreground mb-4">Don't see a role that fits? We're always looking for talented people.</p>
              <a href="mailto:hello@unclerobertconsulting.com" className="text-primary hover:underline font-medium">Send us your resume</a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
