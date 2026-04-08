import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { PageLayout } from "@/components/PageLayout";

export default function NewsletterVerify() {
  const [, params] = useRoute("/newsletter/verify?token=:token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  const verifyMutation = trpc.newsletter.verify.useMutation();

  useEffect(() => {
    if (!params?.token) {
      setStatus("error");
      setMessage("No verification token provided. Please check your email link.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const result = await verifyMutation.mutateAsync({
          token: params.token,
        });
        console.log("Verification result:", result);
        setStatus("success");
        setMessage(
          "Your email has been verified! You're now subscribed to our newsletter."
        );
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Failed to verify your email. The link may have expired."
        );
      }
    };

    verifyEmail();
  }, [params?.token]);

  return (
    <PageLayout>
    <div className="min-h-screen bg-gradient-to-br from-background to-card flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <div className="text-center">
          {status === "loading" && (
            <>
              <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Verifying Email
              </h1>
              <p className="text-muted-foreground">
                Please wait while we confirm your subscription...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Subscription Confirmed!
              </h1>
              <p className="text-muted-foreground mb-6">{message}</p>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Thank you for subscribing to AgentLab's newsletter. You'll
                  receive updates about new features, insights, and exclusive
                  content.
                </p>
                <Link href="/">
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Return to Home
                  </Button>
                </Link>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Verification Failed
              </h1>
              <p className="text-muted-foreground mb-6">{message}</p>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  If you believe this is an error, please try subscribing again
                  or contact our support team.
                </p>
                <Link href="/">
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Return to Home
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
    </PageLayout>
  );
}
