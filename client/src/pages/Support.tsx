import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";

export default function Support() {
  return (
    <PageLayout className="bg-background text-foreground">
      <div className="container max-w-2xl py-20">
        <h1 className="text-4xl font-bold mb-6">Contact Support</h1>
        <p className="text-muted-foreground mb-8">
          Need help with your AgentLab workspace or have questions about a playbook? 
          Reach out to our support team and we'll get back to you as soon as possible.
        </p>

        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Message sent!"); }}>
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input 
                type="text" 
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input 
                type="email" 
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea 
                className="w-full bg-background border border-border rounded-lg px-4 py-2 h-32 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <Button type="submit" className="w-full">Send Message</Button>
          </form>
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Or email us directly at <a href="mailto:urcsupport@agentmail.to" className="text-primary hover:underline">urcsupport@agentmail.to</a></p>
        </div>
      </div>
    </PageLayout>
  );
}
