import { Button } from "./ui/button";
import { Zap, ArrowRight, Mic2, Activity } from "lucide-react";
import { GreetingAIChat } from "./GreetingAIChat";

export function ConcertHero({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#0A0D18] pt-20 pb-32">
      {/* Dynamic Concert Background Elements */}
      <div className="absolute inset-0 z-0">
        {/* Deep background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0A0D18] to-[#0A0D18]"></div>
        
        {/* Spotlights */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[70%] bg-primary/20 blur-[120px] rounded-full animate-spotlight mix-blend-screen pointer-events-none"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-accent/20 blur-[100px] rounded-full animate-spotlight mix-blend-screen pointer-events-none" style={{ animationDelay: "-2.5s" }}></div>
        
        {/* Floating Particles/Notes simulation */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-white rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: Math.random() * 0.5 + 0.2,
                boxShadow: "0 0 10px 2px rgba(255,255,255,0.4)"
              }}
            ></div>
          ))}
        </div>
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: The "Stage" Copy */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-medium text-sm backdrop-blur-sm animate-pulse-glow">
              <Activity className="w-4 h-4" />
              <span>Live: The Agentic OS Experience</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tight drop-shadow-2xl">
              Turn Up the Volume on <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-accent animate-pulse-glow inline-block">
                AI Automation
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 leading-relaxed max-w-2xl font-light">
              AgentLab is your backstage pass to the future of work. Deploy autonomous agents, orchestrate complex workflows, and build an agency that rocks.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 pt-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white button-glow text-lg h-14 px-8 rounded-xl"
                onClick={() => (window.location.href = isAuthenticated ? "/dashboard" : "/login")}
              >
                <Zap className="w-5 h-5 mr-2" />
                Take the Stage
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-slate-700 hover:border-slate-500 text-white bg-slate-900/50 hover:bg-slate-800 backdrop-blur-md text-lg h-14 px-8 rounded-xl transition-all"
                onClick={() => {
                  document.getElementById("capabilities")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <Mic2 className="w-5 h-5 mr-2 text-slate-400" />
                View Lineup
              </Button>
            </div>
          </div>

          {/* Right Column: The AI Greeter / "VIP Pass" */}
          <div className="lg:col-span-6 relative perspective-[1000px]">
            {/* 3D tilt effect container (optional subtle transform) */}
            <div className="relative transform hover:scale-[1.02] transition-transform duration-500 ease-out z-20">
              <GreetingAIChat />
            </div>
            
            {/* Behind-the-chat decorative glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[120%] bg-gradient-to-br from-primary/30 to-accent/30 blur-[80px] -z-10 rounded-full mix-blend-screen animate-pulse-glow"></div>
          </div>

        </div>
      </div>
      
      {/* Bottom fade transition to next section */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none"></div>
    </section>
  );
}
