import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { PageLayout } from "@/components/PageLayout";

export default function NewsletterUnsubscribe() {
  const [, params] = useRoute("/newsletter/unsubscribe?token=:token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  const unsubscribeMutation = trpc.newsletter.unsubscribeWithToken.useMutation();

  useEffect(() => {
    if (!params?.token) {
      setStatus("error");
      setMessage("No unsubscribe token provided. Please check your email link.");
      return;
    }

    const unsubscribeEmail = async () => {
      try {
        const result = await unsubscribeMutation.mutateAsync({
          token: params.token,
        });
        setEmail(result.email || "");
        setStatus("success");
        setMessage("You have been successfully unsubscribed from our newsletter.");
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Failed to unsubscribe. The link may have expired."
        );
      }
    };

    unsubscribeEmail();
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
                Processing Unsubscribe
              </h1>
              <p className="text-muted-foreground">
                Please wait while we process your request...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Unsubscribed Successfully
              </h1>
              <p className="text-muted-foreground mb-6">{message}</p>
              <div className="space-y-3">
                {email && (
                  <p className="text-sm text-muted-foreground">
                    Email: <span className="font-medium">{email}</span>
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  We've removed you from our mailing list. You won't receive
                  any more emails from us.
                </p>
                <p className="text-xs text-muted-foreground">
                  If you change your mind, you can always subscribe again from
                  our website.
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
                Unsubscribe Failed
              </h1>
              <p className="text-muted-foreground mb-6">{message}</p>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  If you believe this is an error or need assistance, please
                  contact our support team.
                </p>
                <Link href="/help">
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Contact Support
                  </Button>
                </Link>
                <Link href="/">
                  <Button className="w-full" variant="outline">
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
