# Founder Signal System

A starter marketing system for solo founders and small service-based
businesses. Help one founder figure out who they are for, sharpen the message,
turn one idea into focused content and outreach, follow up with the people who
respond, and capture proof of what worked.

This is intentionally a thin vertical slice across six Marketing workflows, not
a full Marketing department rebuild.

## Status

Draft starter package. Not certified. The kit manifest in `kit.md` is a `kit/1.0`
draft and explicitly does not claim Active or Certified status. Treat this as
the first sellable cut while the underlying source workflows are still being
converted.

## Who This Is For

- Solo founders or owner-operators of small service-based businesses, roughly
  1 to 10 people
- Founders who already have a few clients and some revenue but are publishing,
  reaching out, and following up inconsistently
- Founders who lose conversations because they cannot answer cleanly who they
  serve, what painful problem they solve, and what to say next
- Founders who do not want to buy a 9-workflow Marketing department before
  they have proven the message

This is not the right package for a marketing-mature team with an existing
content engine, paid acquisition stack, or a dedicated marketing hire.

## What This Solves

The clearest, most repeated founder pain is the MKT-06 cluster: "what do I
say, where do I say it, how often, and is any of it working?"

That question does not stand alone. If a founder does not know who they are
for, sharpening the content is rearranging deck chairs. If the founder writes
great content but never follows up, the work leaks at the bottom. The Founder
Signal System packages just the minimum dependencies needed to make the
content question answerable and the resulting work compoundable.

## Thin-Slice Flow

```text
ICP & fit          Diagnostic            Content engine          Outreach lane
(MKT-01)    -->    (MKT-03)       -->    (MKT-06)         -->    (MKT-05)
                                                                      |
                                                                      v
                                       Proof loop          Follow-up lane
                                       (MKT-04)      <--   (MKT-02)
```

1. **ICP and fit focus** (from MKT-01). Define the target customer, the
   painful problem, the desired outcome, urgency, and exclusion criteria.
   Define what a qualified conversation actually looks like.
2. **Diagnostic and segmentation** (from MKT-03). Use a short founder
   interview or intake form to classify pain and readiness. Do not run a heavy
   survey at this stage.
3. **Content engine** (from MKT-06). Convert ICP plus pain plus a founder
   point of view into a content brief. Produce three to five LinkedIn posts,
   one short email, and one longer anchor asset outline per cycle.
4. **Outreach lane** (from MKT-05). Build a small, named list of prospects or
   warm reconnects. Write human outreach tied to the same signal the content
   carries. No bulk automation at this stage.
5. **Follow-up lane** (from MKT-02). Run a simple three-touch outreach and
   follow-up sequence and segment responses into interested, not now,
   referral, and no response.
6. **Proof loop** (from MKT-04). Capture replies, objections, testimonials,
   referrals, and content topics that pulled traction. Feed those learnings
   into the next content and outreach cycle.

The cycle length is intentionally short. Run it weekly or biweekly so the
proof loop has a chance to inform the next round.

## What Is Intentionally Excluded

This package deliberately does not include:

- Paid advertising or PPC strategy (deferred to MKT-07)
- A full social media management calendar (deferred to MKT-08)
- Event or webinar marketing (deferred to MKT-09)
- Heavy automation. The flow assumes the founder uses messy existing tools
  and prefers to ship rather than tune
- A full Microsoft 365, Notion, HubSpot, or Klaviyo build-out. Operating
  backbone stays Microsoft 365 by default, but no tool is required for the
  thin slice to run
- Brand identity, visual design, or website rebuilds
- Sales proposal, contract, or onboarding workflows (these live in the SAL
  workflow set)

If a buyer needs any of the above, this package should be sold as the
starting point and the next layer should be planned as a separate engagement.

## How This Relates To The Broader Marketing Department

The full URC Marketing department has nine workflows:

| ID | Workflow | Included In This Package? |
| --- | --- | --- |
| MKT-01 | Lead Generation & Conversion | Yes — ICP and qualified-conversation layer only |
| MKT-02 | Email/SMS Nurture | Yes — three-touch outreach and follow-up only |
| MKT-03 | Polls & Assessments | Yes — light intake/diagnostic only |
| MKT-04 | Reviews & Referrals | Yes — proof capture only |
| MKT-05 | Outreach & Engagement | Yes — small human outreach list only |
| MKT-06 | Content Creation & Dissemination | Yes — content engine, the visible wedge |
| MKT-07 | Paid Advertising / PPC | No |
| MKT-08 | Social Media Management | No |
| MKT-09 | Event & Webinar Marketing | No |

The visible wedge is MKT-06 because that is where founders feel the pain
first. The package only includes the minimum viable dependencies from the
other workflows so the wedge can actually move revenue.

## Package Contents

```text
workflows/marketing-founder-signal-system/
  README.md                                # This file
  kit.md                                   # kit/1.0 draft manifest
  template.md                              # Standard-tier Make.com link placeholder and buyer setup instructions
  source-map.md                            # Maps each step to source workflows
  implementation-checklist.md              # 5-day setup sprint
  offer-one-pager.md                       # Sales-facing one-pager
  automation/
    Founder-Signal-System-Make-Blueprint.json       # Draft Make.com scenario build spec, not direct import
    make-scenario-manual-build.md                   # Manual rebuild path for Make.com free tier
    make-public-template-publisher-checklist.md     # Steps to publish the public sharing link
    n8n-v1-runtime-handoff.md                       # n8n handoff for active v1 runtime
  assets/
    intake-questions.md                    # Founder diagnostic questions
    content-brief-template.md              # Per-cycle content brief
    follow-up-sequence-template.md         # 3-touch outreach and follow-up template
    proof-capture-template.md              # Reply, objection, and proof log
```

## How To Use This Package

1. Read this README to confirm fit.
2. Run the founder diagnostic in `assets/intake-questions.md`.
3. Use `implementation-checklist.md` to set up the system over a 3-to-5 day
   sprint.
4. Fill out the templates in `assets/` once per content cycle.
5. After the first proof cycle, decide which adjacent Marketing workflow to
   add next. Common next adds: MKT-08 social, MKT-07 paid, or graduating the
   nurture from MKT-02 into a full sequence library.

## Standard-Tier Make.com Template

The Standard-tier Magic Template Link is being staged in `template.md`.
The repo now includes a draft Make.com blueprint at
`automation/Founder-Signal-System-Make-Blueprint.json` plus a publisher
checklist at `automation/make-public-template-publisher-checklist.md`.

This link is not live yet. To activate it, publish the scenario from Make.com,
generate the public sharing link, test it from a second account or team, and
replace the placeholder in `template.md`.

The manual Markdown package remains the fallback and should be used whenever a
buyer does not want to connect Make.com, OpenAI, HubSpot, or Microsoft 365.

## n8n V1 Runtime

As of 2026-05-17, n8n is the preferred v1 runtime for this package. Robert
confirmed local n8n is running and Workflow 06 exists there with a recent test.
Use `automation/n8n-v1-runtime-handoff.md` to clone or adapt the tested MKT-06
pattern into the Founder Signal intake flow.

Make.com remains deferred as a future Standard-tier public sharing link because
the free plan blocked activation even after the scenario was manually built.

## Source Authority

Every step in this package maps back to a specific URC source workflow.
`source-map.md` gives the exact files. The package does not invent new
marketing theory — it picks the smallest viable cut from existing source.

## Change Control

Initial build logged as `CC-2026-05-15-003`. See
`docs/operations/change-control-register.md` and
`docs/operations/scheduled-change-queue.md` for status.
