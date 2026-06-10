import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface NewsletterSignupProps {
  variant?: "inline" | "card" | "footer";
  title?: string;
  description?: string;
  showIcon?: boolean;
}

export function NewsletterSignup({
  variant = "inline",
  title = "Subscribe to Our Newsletter",
  description = "Get the latest updates and insights delivered to your inbox.",
  showIcon = true,
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const subscribeMutation = trpc.newsletter.subscribe.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      await subscribeMutation.mutateAsync({
        email,
        name: name || undefined,
        source: "website",
      });

      setIsSubmitted(true);
      setEmail("");
      setName("");

      toast.success("Successfully subscribed! Check your email to confirm.");

      // Reset after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to subscribe";
      toast.error(errorMessage);
    }
  };

  if (variant === "card") {
    return (
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20 p-8">
        <div className="max-w-md mx-auto">
          {showIcon && (
            <Mail className="w-8 h-8 text-primary mb-4" />
          )}
          <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-6">{description}</p>

          {isSubmitted ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">
                Check your email to confirm!
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white"
              />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white"
              />
              <Button
                type="submit"
                disabled={subscribeMutation.isPending}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {subscribeMutation.isPending ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <div className="space-y-3">
        <h4 className="font-semibold text-foreground text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>

        {isSubmitted ? (
          <div className="flex items-center gap-2 text-green-600 text-xs">
            <CheckCircle className="w-4 h-4" />
            <span>Check your email!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-3 py-2 border-2 border-slate-400 rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            />
            <Button
              type="submit"
              disabled={subscribeMutation.isPending}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              {subscribeMutation.isPending ? "..." : "Join"}
            </Button>
          </form>
        )}
      </div>
    );
  }

  // Default inline variant
  return (
    <div className="w-full max-w-md">
      <div className="space-y-3">
        {showIcon && <Mail className="w-6 h-6 text-primary" />}
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>

        {isSubmitted ? (
          <div className="flex items-center gap-2 text-green-600 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">
              Check your email to confirm your subscription!
            </span>
          </div>
        ) : subscribeMutation.isError ? (
          <div className="flex items-center gap-2 text-red-600 p-3 bg-red-50 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">
              {subscribeMutation.error?.message ||
                "Failed to subscribe. Please try again."}
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white"
            />
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white"
            />
            <Button
              type="submit"
              disabled={subscribeMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {subscribeMutation.isPending ? "Subscribing..." : "Subscribe Now"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
