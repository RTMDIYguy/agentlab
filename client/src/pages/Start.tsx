import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  MessageSquareText,
  Users,
  ScanSearch,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { FounderIntakeChat } from "@/components/LiveChat";

/**
 * /start — the public front door (CC-2026-09-25-013).
 *
 * The problem this page solves: the platform's URL was handed out directly,
 * so every curious visitor hit an auth wall; the intake agent hid in a corner
 * bubble that nobody opened, and anonymous (pre-email) visitors left no
 * trace at all. Now the first thing a visitor meets is the intake agent as
 * the page's primary interactive element — and every chat turn persists
 * (visitor-keyed before email, email-keyed after), so "did anyone use it?"
 * becomes "the platform captured them."
 *
 * Content follows the established funnel language: simplify the tools you
 * already have → Founder Roundtable or Business Systems Diagnostic →
 * Ownable OS. No new claims, no pricing, no invented traction numbers.
 */
export default function Start() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-950 text-white">
              <ScanSearch className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold">AgentLab OS</div>
              <div className="text-[11px] text-stone-500">
                by Uncle Robert Consulting
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-stone-600">
                <ArrowLeft className="mr-1 h-4 w-4" /> Back to site
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="bg-stone-950 hover:bg-stone-800">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero + intake chat */}
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <Badge className="border border-stone-300 bg-white text-stone-600 hover:bg-white">
              For founders drowning in tools
            </Badge>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-stone-950 sm:text-4xl">
              You don't need more tools. You need the ones you have to finally
              talk to each other.
            </h1>
            <p className="mt-4 text-base leading-7 text-stone-600">
              AgentLab OS is a business operating system built around the
              software you already pay for — M365, HubSpot, Drive, your CRM.
              Tell the intake agent what's slowing you down and it will point
              you at the right next step: a Founder Roundtable or a Business
              Systems Diagnostic.
            </p>

            <div className="mt-8 space-y-4">
              {[
                {
                  icon: MessageSquareText,
                  title: "1. Tell it your bottleneck",
                  body: "Two minutes with the intake agent. No email required to start — chat now, share details only if you want the follow-up.",
                },
                {
                  icon: Users,
                  title: "2. Get your next step",
                  body: "A Founder Roundtable invite or a Business Systems Diagnostic, depending on fit. Human-led, not a sales funnel you can't escape.",
                },
                {
                  icon: ShieldCheck,
                  title: "3. Then, if it fits, the OS",
                  body: "The platform itself — the agent workspace you're standing in the lobby of — comes after the fit conversation, never before.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white">
                    <item.icon className="h-4 w-4 text-stone-700" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-stone-900">
                      {item.title}
                    </div>
                    <div className="text-[13px] leading-5 text-stone-600">
                      {item.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/signup" className="inline-flex">
                <Button size="sm" className="bg-stone-950 hover:bg-stone-800">
                  Create your workspace <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <span className="text-xs text-stone-500">
                Already chatted? Sign up with the same browser and your intake
                history follows you in.
              </span>
            </div>
          </div>

          {/* The intake agent IS the front door */}
          <div className="lg:sticky lg:top-6">
            <FounderIntakeChat />
            <p className="mt-3 px-1 text-[11px] leading-4 text-stone-500">
              Your conversation stays attached to this browser (a random key in
              localStorage — not your identity). If you share an email, it
              attaches to that instead. Nothing is shared with third parties;
              you can ask for it to be deleted.
            </p>
            <p className="mt-1 px-1 text-[11px] leading-4 text-stone-500">
              <Link href="/privacy" className="underline hover:text-stone-700">
                Privacy & terms
              </Link>
            </p>
            <p className="mt-6 px-1 text-[11px] italic text-stone-500">
              Standing in the lobby? The rest of the building is behind sign-in.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
