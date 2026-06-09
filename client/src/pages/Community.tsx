import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Users, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const schema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().optional(),
  email: z.string().email("Valid email required"),
  company: z.string().optional(),
  what_are_you_building: z.string().min(10, "Tell us a bit more (10+ chars)"),
  referral_code: z.string().optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: "You must agree to continue" }),
  }),
});

type FormData = z.infer<typeof schema>;

export default function Community() {
  const [submitted, setSubmitted] = useState(false);

  const createContact = trpc.hubspot.createContact.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("You're in! Welcome to the Roundtable.");
    },
    onError: (err) => {
      toast.error(err.message ?? "Something went wrong. Please try again.");
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const consentValue = watch("consent");

  const onSubmit = (data: FormData) => {
    createContact.mutate({
      email: data.email,
      firstname: data.firstname,
      lastname: data.lastname,
      company: data.company,
      what_are_you_building: data.what_are_you_building,
      referral_code: data.referral_code,
      source: "community",
      consent: data.consent,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white py-20 px-4">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 rounded-full p-4">
              <Users className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            KC Bootstrapper Roundtable
          </h1>
          <p className="text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto">
            A peer group for Kansas City founders building sustainable, profitable businesses — without VC pressure. Honest conversations, real accountability.
          </p>
        </motion.div>
      </section>

      {/* Value props */}
      <section className="py-12 px-4 bg-muted/40">
        <div className="max-w-3xl mx-auto grid md:grid-cols-3 gap-6 text-center">
          {[
            { title: "Monthly Meetups", desc: "In-person & virtual sessions with real operators" },
            { title: "Deal Flow", desc: "Referrals, partnerships, and collab opportunities" },
            { title: "No BS Advice", desc: "Peers who've been there — not consultants selling you something" },
          ].map((item) => (
            <motion.div
              key={item.title}
              className="bg-background rounded-xl p-6 shadow-sm border"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="font-semibold text-base mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Form / Success */}
      <section className="py-16 px-4">
        <div className="max-w-xl mx-auto">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Request to Join</CardTitle>
                    <CardDescription>
                      Tell us a bit about what you're building. We review applications and reach out within a few days.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="firstname">First Name *</Label>
                          <Input id="firstname" {...register("firstname")} />
                          {errors.firstname && (
                            <p className="text-xs text-destructive">{errors.firstname.message}</p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="lastname">Last Name</Label>
                          <Input id="lastname" {...register("lastname")} />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="email">Email *</Label>
                        <Input id="email" type="email" {...register("email")} />
                        {errors.email && (
                          <p className="text-xs text-destructive">{errors.email.message}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="company">Company / Business Name</Label>
                        <Input id="company" {...register("company")} />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="what_are_you_building">What are you building? *</Label>
                        <Textarea
                          id="what_are_you_building"
                          rows={4}
                          placeholder="Tell us about your business, stage, and what challenges you're navigating..."
                          {...register("what_are_you_building")}
                        />
                        {errors.what_are_you_building && (
                          <p className="text-xs text-destructive">{errors.what_are_you_building.message}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="referral_code">Referral Code (optional)</Label>
                        <Input id="referral_code" {...register("referral_code")} placeholder="e.g. FRIEND-XYZ" />
                      </div>

                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="consent"
                          checked={!!consentValue}
                          onCheckedChange={(checked) =>
                            setValue("consent", checked === true ? true : (undefined as unknown as true))
                          }
                        />
                        <label htmlFor="consent" className="text-sm text-muted-foreground leading-snug cursor-pointer">
                          I agree to receive communications about the KC Bootstrapper Roundtable and related events. No spam, ever.
                        </label>
                      </div>
                      {errors.consent && (
                        <p className="text-xs text-destructive">{errors.consent.message}</p>
                      )}

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={isSubmitting || createContact.isPending}
                      >
                        {createContact.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Submitting…
                          </>
                        ) : (
                          <>
                            Request to Join
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <div className="flex justify-center mb-6">
                  <CheckCircle2 className="h-16 w-16 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">You're on the list!</h2>
                <p className="text-muted-foreground mb-8">
                  We'll review your application and reach out within a couple of days. In the meantime, grab time to chat.
                </p>

                {/* Calendly embed */}
                <div className="rounded-xl overflow-hidden border shadow-sm bg-background">
                  <div className="p-4 border-b">
                    <p className="font-medium text-sm">Schedule a quick intro call</p>
                  </div>
                  <iframe
                    src="https://calendly.com/thebossrob"
                    width="100%"
                    height="600"
                    frameBorder="0"
                    title="Schedule a call with Robert"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
