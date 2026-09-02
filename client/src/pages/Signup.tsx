import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { isAuthenticated, refresh } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create account. Please try again.");
      }

      if (data.token) {
        localStorage.setItem("manus-runtime-token", data.token);
      }
      if (data.user) {
        localStorage.setItem("agentlab_user", JSON.stringify(data.user));
      }

      await refresh();
      setLocation("/dashboard");
    } catch (err: any) {
      console.error("[Auth] Signup error:", err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email || "robert@uncle-robert.com",
          name: name || "Robert T. McCarthy",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to sign up with Google.");
      }

      if (data.token) {
        localStorage.setItem("manus-runtime-token", data.token);
      }
      if (data.user) {
        localStorage.setItem("agentlab_user", JSON.stringify(data.user));
      }

      await refresh();
      setLocation("/dashboard");
    } catch (err: any) {
      console.error("[Auth] Google signup error:", err);
      setError(err.message || "Failed to sign up with Google.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-secondary/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/">
            <a className="inline-flex items-center gap-2 font-bold text-2xl tracking-tight text-foreground hover:opacity-90 transition-opacity">
              <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
                <Sparkles className="w-5 h-5" />
              </div>
              <span>Agent<span className="text-primary">Lab</span></span>
            </a>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your account to deploy autonomous agents & workflows
          </p>
        </div>

        <Card className="border border-border/80 bg-card/80 backdrop-blur-md shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold tracking-tight">Create an Account</CardTitle>
            <CardDescription>
              Start your 30-day trial with full workspace isolation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              className="w-full h-11 font-medium flex items-center justify-center gap-2 border-border hover:bg-muted"
              onClick={handleGoogleSignup}
              disabled={loading}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-medium">
                  Or register with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-11 bg-background"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9 h-11 bg-background"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Includes 30-day free trial with budget auto-pause guardrails.</span>
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-medium bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>
          </CardContent>
          <CardFooter className="pt-0 justify-center">
            <p className="text-xs text-muted-foreground text-center">
              Already have an account?{" "}
              <Link href="/login">
                <a className="font-semibold text-primary hover:underline">
                  Sign In
                </a>
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
