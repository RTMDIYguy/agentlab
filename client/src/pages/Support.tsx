import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export default function Support() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName: formData.name,
          email: formData.email,
          source: "AgentLab Website - Support",
          serviceLine: "Support",
          notes: `Message: ${formData.message}`
        })
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Message sent! We'll be in touch soon.");
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout className="bg-background text-foreground">
      <div className="container max-w-2xl py-20">
        <h1 className="text-4xl font-bold mb-6">Contact Support</h1>
        <p className="text-muted-foreground mb-8">
          Need help with your AgentLab workspace or have questions about a playbook? 
          Reach out to our support team and we'll get back to you as soon as possible.
        </p>

        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea 
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 h-32 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Or email us directly at <a href="mailto:urcsupport@agentmail.to" className="text-primary hover:underline">urcsupport@agentmail.to</a></p>
        </div>
      </div>
    </PageLayout>
  );
}
