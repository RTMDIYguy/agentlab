import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { BookOpen, Star, ShoppingCart, Mail, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const BOOK_PRICE_ID = "price_1TgRz4GmUFddSefto4jcH4Jv"; // $59.99 one-time

const emailSchema = z.object({
  email: z.string().email("Valid email required"),
});
type EmailForm = z.infer<typeof emailSchema>;

const chapters = [
  "Freelancing & Consulting",
  "Digital Products & Info Products",
  "Service Arbitrage & Agency Models",
  "eCommerce Without Inventory",
  "Content & Media Businesses",
  "Local Service Businesses",
  "SaaS & Micro-Software",
  "And 21 more models…",
];

const testimonials = [
  {
    name: "Marcus T.",
    role: "First-time founder",
    quote: "I picked 3 models from the book and had revenue in 6 weeks. No investors, no loans.",
  },
  {
    name: "Lena M.",
    role: "Corporate refugee",
    quote: "This is the most practical guide I've read. Every model has a real path to cash.",
  },
  {
    name: "Deon W.",
    role: "Side hustler → full-time",
    quote: "Stopped overthinking and started. That's what this book does for you.",
  },
];

export default function Book() {
  const [chapterSent, setChapterSent] = useState(false);

  const createContact = trpc.hubspot.createContact.useMutation({
    onSuccess: () => {
      setChapterSent(true);
      toast.success("Check your inbox — free chapter is on the way!");
    },
    onError: (err) => {
      toast.error(err.message ?? "Something went wrong. Try again.");
    },
  });

  const createCheckout = trpc.stripe.createCheckout.useMutation({
    onSuccess: (data: { url?: string }) => {
      if (data?.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast.error("Couldn't open checkout. Please try again.");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });

  const onFreeChapter = (data: EmailForm) => {
    createContact.mutate({ email: data.email, source: "book-free-chapter" });
  };

  const handleBuy = () => {
    createCheckout.mutate({ priceId: BOOK_PRICE_ID });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white py-20 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-4 bg-white/10 text-white border-white/20 hover:bg-white/20">
              28 Businesses. $0 Investment.
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Bootstrapper's Guide to the World
            </h1>
            <p className="text-lg text-neutral-300 mb-6">
              Start 28 profitable businesses with zero upfront investment. Each model is proven, practical, and designed for people with more hustle than capital.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="bg-white text-neutral-900 hover:bg-neutral-100"
                onClick={handleBuy}
                disabled={createCheckout.isPending}
              >
                {createCheckout.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ShoppingCart className="h-4 w-4 mr-2" />
                )}
                Buy Now — $59.99
              </Button>
            </div>
            <div className="flex items-center gap-1 mt-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-sm text-neutral-400 ml-2">4.9 · 200+ readers</span>
            </div>
          </motion.div>

          {/* Book cover placeholder */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="w-56 h-72 rounded-lg shadow-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <div className="text-center px-6">
                <BookOpen className="h-12 w-12 text-white mx-auto mb-3" />
                <p className="text-white font-bold text-sm leading-tight">
                  Bootstrapper's Guide to the World
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What's inside */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">28 Models. Real Results.</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {chapters.map((ch, i) => (
              <motion.div
                key={ch}
                className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {i + 1}
                </div>
                <span className="text-sm font-medium">{ch}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Free chapter CTA */}
      <section className="py-16 px-4 bg-muted/40">
        <div className="max-w-md mx-auto text-center">
          <Mail className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Get a Free Chapter</h2>
          <p className="text-muted-foreground mb-6">
            Not sure yet? Read the first chapter on us. No credit card, no strings.
          </p>

          {chapterSent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="font-medium">Chapter sent! Check your inbox.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onFreeChapter)} className="space-y-3">
              <div>
                <Label htmlFor="email" className="sr-only">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createContact.isPending}
              >
                {createContact.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                Send Me the Free Chapter
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">What Readers Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <div className="flex mb-3">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 italic">"{t.quote}"</p>
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 bg-neutral-900 text-white text-center">
        <motion.div
          className="max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-3">Stop waiting for the "right" idea.</h2>
          <p className="text-neutral-300 mb-8">
            28 proven business models. Zero investment required. Your next chapter starts today.
          </p>
          <Button
            size="lg"
            className="bg-white text-neutral-900 hover:bg-neutral-100"
            onClick={handleBuy}
            disabled={createCheckout.isPending}
          >
            {createCheckout.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4 mr-2" />
            )}
            Get the Book — $59.99
          </Button>
          <p className="text-xs text-neutral-500 mt-3">One-time purchase · Instant download</p>
        </motion.div>
      </section>
    </div>
  );
}
