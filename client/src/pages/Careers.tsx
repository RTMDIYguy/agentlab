import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Clock, X, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Careers() {
  const openPositions = [
    {
      id: "ai-engineer",
      title: "AI Systems Engineer",
      department: "Engineering",
      location: "Remote (US)",
      type: "Full-time",
      description: "Design and implement autonomous agentic workflows using cutting edge LLMs and workflow orchestrators. You will be building the core logic for the Ops Cleanup Agent and the SDR Intake Agent.",
    },
    {
      id: "growth-lead",
      title: "Growth & Automation Lead",
      department: "Marketing",
      location: "Remote (Global)",
      type: "Full-time",
      description: "Manage our Content Writer agents, oversee the automated newsletter pipelines, and continuously optimize the Founder Intake process.",
    }
  ];

  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApply = (positionTitle: string) => {
    setSelectedRole(positionTitle);
  };

  const handleSubmitApplication = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const linkedin = formData.get("linkedin") as string;
    const coverLetter = formData.get("coverLetter") as string;

    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName: name,
          email: email,
          source: "AgentLab Careers Page",
          serviceLine: `Application for: ${selectedRole}`,
          notes: `LinkedIn: ${linkedin}\n\nCover Letter: ${coverLetter}`,
        })
      });
      if (!res.ok) throw new Error("Failed to submit");
      toast.success("Application submitted successfully! We will be in touch.");
      setSelectedRole(null);
    } catch (err) {
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <div className="bg-background min-h-screen pb-20">
        {/* Header */}
        <section className="py-20 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border">
          <div className="container max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Join the Agentic Future
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We are building the ubiquitous operating system for autonomous business workflows. If you believe human judgment paired with responsible automation is the future of work, we want to hear from you.
            </p>
          </div>
        </section>

        {/* Open Positions */}
        <section className="container max-w-4xl mt-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Open Positions</h2>
          
          <div className="space-y-6">
            {openPositions.map((job) => (
              <Card key={job.id} className="p-8 hover:border-primary transition-colors border-border">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-foreground mb-2">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full">
                        <Briefcase className="w-4 h-4" />
                        {job.department}
                      </span>
                      <span className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full">
                        <Clock className="w-4 h-4" />
                        {job.type}
                      </span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {job.description}
                    </p>
                  </div>
                  
                  <div className="shrink-0 md:mt-2">
                    <Button 
                      size="lg" 
                      className="bg-primary hover:bg-primary/90 w-full md:w-auto"
                      onClick={() => handleApply(job.title)}
                    >
                      Apply Now
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center bg-muted/30 p-8 rounded-2xl border border-border">
            <h3 className="text-xl font-bold text-foreground mb-4">Don't see a fit?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              We're always looking for talented individuals who are passionate about AI, automation, and workflow design. Send us your resume anyway.
            </p>
            <Button variant="outline" onClick={() => handleApply("General Application")}>
              Submit General Application
            </Button>
          </div>
        </section>
      </div>

      {/* Application Modal */}
      {selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg p-6 relative border-border shadow-2xl animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedRole(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-foreground mb-2">Apply for {selectedRole}</h2>
            <p className="text-muted-foreground mb-6">Tell us why you're a great fit for AgentLab.</p>
            
            <form onSubmit={handleSubmitApplication} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  name="name"
                  placeholder="Jane Doe"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email Address</label>
                <input
                  required
                  type="email"
                  name="email"
                  placeholder="jane@example.com"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">LinkedIn Profile or Portfolio URL</label>
                <input
                  required
                  type="url"
                  name="linkedin"
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Cover Letter / Note</label>
                <textarea
                  required
                  name="coverLetter"
                  rows={4}
                  placeholder="What excites you about autonomous agentic workflows?"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setSelectedRole(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </PageLayout>
  );
}
