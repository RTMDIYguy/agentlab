---
schema: kit/1.0
slug: marketing-founder-signal-system
title: Founder Signal System
summary: >
  Thin-slice marketing starter package that helps a solo founder define ICP,
  sharpen message, publish focused content, run human outreach, follow up,
  and capture proof. Visible wedge is MKT-06 with the minimum viable
  dependencies from MKT-01, MKT-03, MKT-05, MKT-02, and MKT-04.
description: >
  The Founder Signal System is the smallest sellable vertical slice that can
  move a founder from unclear audience and message to a repeatable weekly or
  biweekly cycle of publishing, outreach, follow-up, and proof capture. It is
  intentionally not a full Marketing department. It is a draft starter
  package that points at six URC Marketing source workflows but only
  implements the minimum dependencies needed to make MKT-06 actually move
  revenue for a small founder-led business.
version: 0.1.0-draft
owner: uncle-robert-consulting
license: UNLICENSED
status: draft
conformance: draft
certifiedAt: null
notes: >
  This kit is intentionally a draft. It does not claim Standard or Full
  conformance under kit/1.0. The src directory is empty by design — the
  thin slice runs from the Markdown templates in assets/ without requiring
  any custom code or automation to be tested first.
changeLog:
  - date: 2026-05-15
    changeId: CC-2026-05-15-003
    version: 0.1.0-draft
    type: initial-draft
    summary: >
      Initial Founder Signal System draft. Packaged the README, kit manifest
      draft, source map back to MKT-01/02/03/04/05/06, 5-day implementation
      checklist, sales-facing one-pager with $1,000 one-time starter price,
      and the four asset templates (intake, content brief, follow-up,
      proof capture).
    author: claude
  - date: 2026-05-16
    changeId: CC-2026-05-16-001
    version: 0.1.0-draft
    type: correction
    summary: >
      Normalized follow-up language to three total outreach/follow-up
      touches so the template matches the MKT-05 maximum 3-touch source
      rule.
    author: codex
tags:
  - marketing
  - founder
  - thin-slice
  - icp
  - content
  - outreach
  - nurture
  - proof
  - starter-package
sourceWorkflows:
  - id: MKT-01
    repoPath: workflows/mkt-01-lead-generation-conversion/
    contribution: ICP definition, qualified-conversation criteria
  - id: MKT-03
    repoPath: workflows/mkt-03-polls-assessments/
    contribution: Founder intake and segmentation, lightweight diagnostic
  - id: MKT-06
    repoPath: workflows/mkt-06-content-creation-dissemination/
    contribution: Visible wedge — content engine and content brief
  - id: MKT-05
    repoPath: workflows/mkt-05-outreach-engagement/
    contribution: Small human outreach list and message style
  - id: MKT-02
    repoPath: workflows/mkt-02-email-sms-nurture/
    contribution: Three-touch follow-up sequence, response segmentation
  - id: MKT-04
    repoPath: workflows/mkt-04-reviews-referrals/
    contribution: Proof capture, testimonial trigger points, referral signals
relatedPackages:
  - id: mkt-06-content-creation-dissemination
    repoPath: mkt-06-content-creation-dissemination/
    relationship: Reference kit/1.0 implementation pattern. Founder Signal
      System reuses the manifest shape but stays a draft until the underlying
      thin slice has been run with at least one founder.
inputs:
  - id: founder-intake
    description: Filled-out intake-questions.md plus a 30-60 minute founder interview
  - id: existing-tooling-snapshot
    description: Short list of tools the founder already uses (CRM, email, scheduler, LinkedIn, etc.)
  - id: existing-content-history
    description: Optional — last 8 to 12 weeks of published content and outreach for baseline
outputs:
  - id: signal-brief
    description: One-page ICP plus painful-problem plus founder POV summary
  - id: content-cycle-batch
    description: Three to five LinkedIn posts, one short email, one anchor outline per cycle
  - id: outreach-list
    description: 10 to 25 named prospects or warm reconnects per cycle
  - id: follow-up-segments
    description: Responses split into interested, not-now, referral, no response
  - id: proof-log
    description: Captured replies, objections, testimonials, referrals, and traction notes
failures:
  - id: undefined-icp
    description: Founder cannot describe who this is and is not for in two sentences
    mitigation: Hold publishing until intake-questions.md is completed and a one-page signal brief is signed off
  - id: content-without-outreach
    description: Founder publishes but never runs the outreach lane, so the content has nothing warm to land on
    mitigation: Implementation checklist forces outreach setup on Day 4, in the same week as the first content batch
  - id: outreach-without-follow-up
    description: First outreach goes out, but the second or third touch never follows
    mitigation: The three-touch outreach and follow-up template is created on Day 4 alongside the outreach list
  - id: proof-not-captured
    description: Replies and testimonials arrive but never get logged, so the next cycle has no signal
    mitigation: Proof capture template runs every cycle and is the explicit Day 5 step
  - id: scope-creep
    description: Founder asks for paid ads, full social calendar, or a website rebuild before the thin slice has produced proof
    mitigation: Scope is documented in README "What Is Intentionally Excluded" and offer one-pager "Not Included"
tools:
  - name: Markdown editor
    purpose: Fill in the templates in assets/
  - name: Microsoft 365 or Google Workspace
    purpose: Optional operating backbone for content drafts, email follow-up, and proof tracker
  - name: LinkedIn
    purpose: Primary outreach and content channel for most founders
  - name: Email client
    purpose: Outreach sequence drafting and sending
skills:
  - name: founder-positioning
    purpose: Translate vague positioning into a one-page signal brief
  - name: content-brief-composition
    purpose: Turn a single insight into a content cycle batch
  - name: human-outreach
    purpose: Write outreach that earns a real reply
  - name: proof-capture-discipline
    purpose: Log every signal so the next cycle has direction
authStandard: kit-auth/1.0
authPolicy:
  noPlaintextSecrets: true
  preferOAuth: true
  requireValidationTest: false
  requireLeastPrivilegeScopes: true
  requireRevocationPath: true
  requireFallbackPath: true
auth:
  connectors: []
  notes: >
    The thin slice intentionally does not require any third-party connector.
    Founders run it from a Markdown editor plus their existing email and
    LinkedIn accounts. Connector matrix will be added when the package is
    upgraded out of draft and bound to a specific tool stack (for example
    Notion, Mailchimp, or HubSpot for the proof log).
verification: null
verificationNotes: >
  Verification is manual at the draft stage. The package is considered to
  have completed one cycle when: (a) intake-questions.md is filled out,
  (b) one content-brief-template.md instance is filled and published,
  (c) one outreach list of 10 or more names is contacted with at least
  one human touch, (d) one three-touch outreach and follow-up sequence has fired,
  and (e) proof-capture-template.md has at least one logged reply,
  objection, testimonial, referral, or traction note.
---

# Founder Signal System — Draft Kit Manifest

This is a draft `kit/1.0` manifest. It is not certified and does not claim
Standard or Full conformance. The point of the draft is to give the package
a stable shape while the thin slice is being run with real founders, then to
upgrade the manifest once there is evidence the slice works.

## Goal

Help a single founder move from unclear audience and message to a repeatable
content + outreach + follow-up + proof cycle within 3 to 5 days of setup.

## When To Use

Use this kit when all of the following are true:

- The founder runs a solo or 1-to-10-person service-based business
- The founder has some clients and some revenue but feels stuck on messaging
- The founder cannot answer "who is this for and what is the painful problem"
  cleanly in two sentences
- The founder is willing to do human outreach and human follow-up rather than
  buy a full automation stack first
- The founder is okay running a weekly or biweekly cycle for at least six
  weeks before evaluating

Do not use this kit when:

- The founder is pre-revenue and has no clients to learn from
- The team already has a working content engine and wants paid acquisition
- The founder is trying to replace their personal voice with a brand voice
  instead of sharpening it

## Setup

### Environment

- A Markdown editor (Obsidian, VS Code, or even Notepad)
- An email account the founder actually checks
- A LinkedIn account in good standing
- 30 to 45 minutes per day for 5 days, then 2 to 4 hours per cycle

### Services

- No required services. The thin slice works without any paid tool.
- Optional: Microsoft 365 or Google Workspace as the operating backbone for
  the proof log and the follow-up sequence
- Optional: an existing CRM (HubSpot, Notion, a spreadsheet) for the
  outreach list

### Parameters

| Parameter | Default | Notes |
| --- | --- | --- |
| Cycle length | 1 week | Move to biweekly only if the founder cannot sustain weekly |
| Content batch size | 3 to 5 LinkedIn posts, 1 short email, 1 anchor outline | Smaller than this is fine; bigger usually fails |
| Outreach batch size | 10 to 25 named prospects per cycle | Hard ceiling 25 so messages stay personal |
| Sequence touches | 3 total | First outreach, helpful follow-up, specific problem / close-the-loop |
| Proof log cadence | Every cycle | Skipping the log breaks the system |

### Models

Optional. The thin slice does not require an AI model. If the founder uses
one, prefer Claude or ChatGPT to draft content and outreach messages and have
the founder personalize and approve before sending.

## Steps

1. Run the founder diagnostic in `assets/intake-questions.md`.
2. Produce a one-page signal brief: ICP, painful problem, desired outcome,
   founder point of view, exclusion criteria, what counts as a qualified
   conversation.
3. Fill in `assets/content-brief-template.md` for the first cycle.
4. Draft and publish the content cycle batch.
5. Build a 10 to 25 person outreach list. Write personal outreach for each.
6. Set up the three-touch outreach and follow-up sequence using
   `assets/follow-up-sequence-template.md`.
7. As replies and signals come in, log them in
   `assets/proof-capture-template.md`.
8. At the end of the cycle, review the proof log and decide what changes for
   the next cycle (message, channel, audience, or offer).

## Inputs

See frontmatter `inputs` for the structured list. In plain language: a
filled intake, the founder's existing tools, and any recent content history
to baseline against.

## Outputs

See frontmatter `outputs`. In plain language: a signal brief, a content
batch, an outreach list, follow-up segments, and a proof log. After three to
six cycles, the founder should have evidence of what message and channel are
pulling.

## Failures Overcome

See frontmatter `failures`. The most common failure mode is publishing
content without ever running outreach and follow-up. The checklist
deliberately forces those lanes into the same week as the first content
batch.

## Constraints

- Keep the package low-cost and tool-light. Do not require a paid tool
  unless the founder already uses one.
- Keep Microsoft 365 as the default operating backbone when a default is
  needed.
- Preserve URC/internal vs client-facing variants — this package is the
  client-facing thin slice. The URC-internal versions of these workflows
  live in `workflows/mkt-XX/source/`.
- Do not pull in MKT-07, MKT-08, MKT-09, or Sales workflows. They are
  deliberately out of scope.
- Do not delete or rewrite the underlying source workflows. This package
  references them, it does not replace them.

## Safety Notes

- No outreach without consent or a real warm signal. The point of this
  package is human outreach, not cold automation.
- Do not impersonate or "AI-clone" the founder's voice. AI-assisted drafts
  must be reviewed and personalized before sending.
- Do not push paid ads, large lists, or scaling tactics until the thin
  slice has produced at least one cycle of proof.
- Buyer's existing customer data and contact lists are theirs. Do not
  export to third-party tools without explicit buyer instruction.

## Validation

This draft does not ship with an automated verification script. Validation
is manual per the criteria in frontmatter `verificationNotes`. Once a
founder runs the package end-to-end and produces a populated proof log,
the kit can be promoted from `0.1.0-draft` toward Standard conformance.

## Change Log

- **2026-05-15 — 0.1.0-draft — CC-2026-05-15-003 — initial draft**
  Packaged the README, kit manifest draft, source map back to
  MKT-01/02/03/04/05/06, 5-day implementation checklist, sales-facing
  one-pager with $1,000 one-time starter price, and the four asset
  templates. Status: draft, not certified.
- **2026-05-16 — 0.1.0-draft — CC-2026-05-16-001 — correction**
  Normalized follow-up language to three total outreach/follow-up touches
  so the template matches the MKT-05 maximum 3-touch source rule.
