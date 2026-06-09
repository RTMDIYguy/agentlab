import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Zap, ArrowRight, ArrowLeft, CheckCircle2, Loader2, Sparkles, Lock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ─── Quiz config ───────────────────────────────────────────────────────────────

const STEPS = [
  {
    id: "goal",
    question: "What's your primary goal right now?",
    options: [
      { value: "revenue", label: "💰 Make my first $1k online" },
      { value: "scale", label: "📈 Scale an existing side hustle" },
      { value: "quit", label: "🚪 Replace my 9-to-5" },
      { value: "idea", label: "💡 Validate a business idea" },
    ],
  },
  {
    id: "time",
    question: "How many hours per week can you invest?",
    options: [
      { value: "1-5", label: "1–5 hrs (evenings only)" },
      { value: "5-15", label: "5–15 hrs (serious side hustle)" },
      { value: "15-30", label: "15–30 hrs (nearly full-time)" },
      { value: "30+", label: "30+ hrs (all in)" },
    ],
  },
  {
    id: "skill",
    question: "What's your biggest strength?",
    options: [
      { value: "writing", label: "✍️ Writing & Communication" },
      { value: "tech", label: "💻 Tech & Automation" },
      { value: "sales", label: "🤝 Sales & Relationship Building" },
      { value: "ops", label: "⚙️ Operations & Systems" },
    ],
  },
  {
    id: "obstacle",
    question: "What's holding you back most?",
    options: [
      { value: "clarity", label: "🌀 No clear direction" },
      { value: "time", label: "⏰ Not enough time" },
      { value: "money", label: "💸 Limited budget" },
      { value: "confidence", label: "😬 Fear of failure / self-doubt" },
    ],
  },
];

// Simple recommendation engine
function recommend(answers: Record<string, string>): {
  title: string;
  description: string;
  topics: string[];
  cta: string;
} {
  const { goal, skill, obstacle } = answers;

  if (goal === "revenue" && skill === "writing") {
    return {
      title: "Freelance Writing Fast-Track",
      description:
        "You have the skill and the urgency. This track gets you to your first paid client in 14 days using outreach templates, a 1-page portfolio, and simple pricing.",
      topics: ["Positioning your writing services", "Cold outreach that actually works", "Pricing without undercharging", "Landing your first 3 clients"],
      cta: "Start Writing Fast-Track",
    };
  }
  if (skill === "tech" || goal === "scale") {
    return {
      title: "Automation & Digital Products",
      description:
        "Leverage your technical edge to build once, sell repeatedly. This track covers no-code/low-code tools, digital product creation, and passive revenue systems.",
      topics: ["No-code tool stack", "Building your first digital product", "Automated delivery & fulfillment", "Scaling with systems"],
      cta: "Start Automation Track",
    };
  }
  if (skill === "sales" || goal === "quit") {
    return {
      title: "High-Ticket Consulting Launch",
      description:
        "Your people skills are your asset. This track helps you package your expertise into a consulting offer, land discovery calls, and close your first $2k+ engagement.",
      topics: ["Defining your niche & offer", "Building social proof fast", "Discovery call framework", "Pricing premium services"],
      cta: "Start Consulting Track",
    };
  }
  if (obstacle === "clarity" || goal === "idea") {
    return {
      title: "Idea Validation Sprint",
      description:
        "Don't build what nobody wants. This track walks you through rapid validation: customer interviews, landing page tests, and pre-selling before you build anything.",
      topics: ["Finding a profitable niche", "Customer interview scripts", "MVP landing page", "Pre-selling your idea"],
      cta: "Start Validation Sprint",
    };
  }
  // Default
  return {
    title: "Bootstrapper's Foundation",
    description:
      "A solid foundation for anyone serious about building a sustainable business with limited resources. Covers the mindset, tools, and first actions that move the needle.",
    topics: ["Bootstrapper mindset & habits", "Revenue-first business models", "Minimal viable offer", "First 30-day action plan"],
    cta: "Start Foundation Track",
  };
}

// ─── Email capture schema ───────────────────────────────────────────────────
const emailSchema = z.object({
  email: z.string().email("Valid email required"),
  firstname: z.string().min(1, "First name required"),
});
type EmailForm = z.infer<typeof emailSchema>;

// ─── Component ─────────────────────────────────────────────────────────────────
export default function Bootcamp() {
  const [step, setStep] = useState(0); // 0 = intro, 1..N = quiz, N+1 = email, N+2 = result
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ReturnType<typeof recommend> | null>(null);
  const [captured, setCaptured] = useState(false);

  const totalQuizSteps = STEPS.length;

  const createContact = trpc.hubspot.createContact.useMutation({
    onSuccess: () => {
      setCaptured(true);
      setStep(totalQuizSteps + 2); // show result
    },
    onError: (err) => {
      toast.error(err.message ?? "Something went wrong. Please try again.");
    },
  });

  const createCheckout = trpc.stripe.createCheckout.useMutation({
    onSuccess: (data: { url?: string }) => {
      if (data?.url) window.location.href = data.url;
    },
    onError: () => toast.error("Couldn't open checkout. Try again."),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
  });

  const selectOption = (stepId: string, value: string) => {
    const newAnswers = { ...answers, [stepId]: value };
    setAnswers(newAnswers);
    if (step < totalQuizSteps) {
      setStep((s) => s + 1);
    } else {
      // Last quiz step → show email capture
      const rec = recommend(newAnswers);
      setResult(rec);
      setStep(totalQuizSteps + 1);
    }
  };

  const onEmailSubmit = (data: EmailForm) => {
    createContact.mutate({
      email: data.email,
      firstname: data.firstname,
      source: "bootcamp",
    });
  };

  const currentQuizStep = step >= 1 && step <= totalQuizSteps ? STEPS[step - 1] : null;
  const progress = step === 0 ? 0 : Math.min((step / totalQuizSteps) * 100, 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-br from-violet-900 to-indigo-900 text-white py-16 px-4">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-center mb-4">
            <div className="bg-white/10 rounded-full p-3">
              <Zap className="h-8 w-8 text-yellow-300" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Agent Lab Bootcamp</h1>
          <p className="text-lg text-indigo-200">
            Find the exact business track built for where you are right now — in 2 minutes.
          </p>
        </motion.div>
      </section>

      {/* Quiz container */}
      <section className="py-12 px-4">
        <div className="max-w-xl mx-auto">
          {/* Progress bar */}
          {step > 0 && step <= totalQuizSteps && (
            <div className="mb-6">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Question {step} of {totalQuizSteps}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full bg-violet-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* ── Intro ── */}
            {step === 0 && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-violet-500" />
                <h2 className="text-2xl font-bold mb-3">Find Your Business Track</h2>
                <p className="text-muted-foreground mb-8">
                  Answer 4 quick questions and we'll match you with the bootcamp curriculum built for your situation, skills, and goals.
                </p>
                <Button size="lg" onClick={() => setStep(1)}>
                  Start the Quiz
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            )}

            {/* ── Quiz steps ── */}
            {currentQuizStep && (
              <motion.div
                key={`quiz-${step}`}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="text-xl font-bold mb-6">{currentQuizStep.question}</h2>
                <div className="space-y-3">
                  {currentQuizStep.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => selectOption(currentQuizStep.id, opt.value)}
                      className="w-full text-left p-4 rounded-xl border-2 border-muted hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-900/20 transition-all font-medium"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {step > 1 && (
                  <button
                    onClick={() => setStep((s) => s - 1)}
                    className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </button>
                )}
              </motion.div>
            )}

            {/* ── Email capture ── */}
            {step === totalQuizSteps + 1 && (
              <motion.div
                key="email"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card>
                  <CardHeader className="text-center">
                    <Sparkles className="h-8 w-8 mx-auto mb-2 text-violet-500" />
                    <CardTitle>Your recommendation is ready!</CardTitle>
                    <CardDescription>
                      Enter your email to unlock your personalized curriculum — free.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="firstname">First Name</Label>
                        <Input id="firstname" {...register("firstname")} />
                        {errors.firstname && <p className="text-xs text-destructive">{errors.firstname.message}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" {...register("email")} />
                        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                      </div>
                      <Button type="submit" className="w-full" disabled={createContact.isPending}>
                        {createContact.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Zap className="h-4 w-4 mr-2" />
                        )}
                        Show My Recommendation
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        No spam. Unsubscribe any time.
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ── Result ── */}
            {step === totalQuizSteps + 2 && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
                  <h2 className="text-2xl font-bold mb-1">Your Track: {result.title}</h2>
                  <p className="text-muted-foreground">{result.description}</p>
                </div>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-3">What you'll cover:</h3>
                    <ul className="space-y-2">
                      {result.topics.map((topic) => (
                        <li key={topic} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Beta subscription upsell */}
                <Card className="border-violet-300 bg-violet-50/50 dark:bg-violet-900/10">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Lock className="h-4 w-4 text-violet-600" />
                      <span className="font-semibold text-sm">Unlock Full Access — Beta Pricing</span>
                      <Badge className="bg-violet-100 text-violet-800 border-violet-200">Limited</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get all curriculum tracks, live office hours with Robert, accountability tools, and early access to new modules.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        className="flex-1 bg-violet-600 hover:bg-violet-700"
                        onClick={() => createCheckout.mutate({ priceId: "monthly8usd" })}
                        disabled={createCheckout.isPending}
                      >
                        {createCheckout.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                        $8/month
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-violet-300"
                        onClick={() => createCheckout.mutate({ priceId: "yearly80usd" })}
                        disabled={createCheckout.isPending}
                      >
                        $80/year — Save 17%
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Calendly CTA */}
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="font-medium mb-1">Want to talk through your plan?</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Book a free 20-minute consulting intake call with Robert.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => window.open("https://calendly.com/thebossrob", "_blank")}
                    >
                      Schedule a Call
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>

                <button
                  className="text-sm text-muted-foreground hover:text-foreground mx-auto block"
                  onClick={() => { setStep(0); setAnswers({}); setResult(null); setCaptured(false); }}
                >
                  ↺ Retake the quiz
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
