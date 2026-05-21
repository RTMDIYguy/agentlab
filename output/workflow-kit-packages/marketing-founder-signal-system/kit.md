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
version: 0.2.0-draft
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
  - date: 2026-05-17
    changeId: CC-2026-05-17-002
    version: 0.2.0-draft
    type: packaging
    summary: >
      Added the Standard-tier Make.com Magic Template Link lane with
      template.md, a draft Make.com blueprint, and a publisher checklist.
      The public link remains pending until the scenario is created,
      shared from Make.com, and tested from a second account or team.
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
  - name: Make.com
    purpose: Optional Standard-tier automation host for the Magic Template Link
  - name: OpenAI
    purpose: Optional Standard-tier drafting support for signal brief, content prompts, and follow-up language
  - name: Microsoft 365 or Google Workspace
    purpose: Optional operating backbone for content drafts, email follow-up, and proof tracker
  - name: HubSpot
    purpose: Optional CRM-lite contact update in the Standard-tier Make.com scenario
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
  connectors:
    - id: make
      name: Make.com
      required: true
      setupMode: public-sharing-link
      missingImpact: >
        Buyer cannot use the Magic Template Link and should run the manual
        Markdown package instead.
      fallback: assets/
    - id: openai
      name: OpenAI
      required: true
      setupMode: make-oauth-or-api-key
      missingImpact: >
        Scenario can capture intake, but cannot draft the setup packet.
      fallback: Manual founder-positioning and content brief templates.
    - id: hubspot
      name: HubSpot
      required: false
      setupMode: make-connection
      missingImpact: >
        CRM-lite contact update is skipped; buyer can use Microsoft 365,
        Google Workspace, or the proof capture Markdown template.
      fallback: assets/proof-capture-template.md
    - id: microsoft365
      name: Microsoft 365
      required: false
      setupMode: make-connection
      missingImpact: >
        Email summary and tracker-row outputs are skipped; buyer can copy
        the Make run output manually.
      fallback: assets/content-brief-template.md
  notes: >
    The manual thin slice still does not require any third-party connector.
    The Standard-tier Magic Template Link is optional and requires Make.com
    plus OpenAI, with HubSpot and Microsoft 365 modules treated as removable
    or configurable buyer-side conveniences.
verification: null
verificationNotes: >
  Verification is manual at the draft stage. The package is considered to
  have completed one cycle when: (a) intake-questions.md is filled out,
  (b) one content-brief-template.md instance is filled and published,
  (c) one outreach list of 10 or more names is contacted with at least
  one human touch, (d) one three-touch outreach and follow-up sequence has fired,
  and (e) proof-capture-template.md has at least one logged reply,
  objection, testimonial, referral, or traction note. The Standard-tier
  Magic Template Link is not considered live until template.md contains the
  real Make.com public sharing link and the install has been tested from a
  second account or team.
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

## Quickstart

1. Complete `assets/intake-questions.md` with the founder.
2. Fill one `assets/content-brief-template.md` cycle from the intake.
3. Draft 3 to 5 LinkedIn posts, one short email, and one anchor outline.
4. Build a 10 to 25 person outreach list and send the first human touch.
5. Schedule or manually send the second and third touches.
6. Capture every reply, objection, referral, testimonial, or traction signal in `assets/proof-capture-template.md`.
7. Review the proof log before starting the next content cycle.

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

## Source Map

| Source | Role |
| --- | --- |
| `workflows/mkt-01-lead-generation-conversion/` | ICP definition and qualified-conversation criteria |
| `workflows/mkt-03-polls-assessments/` | Founder intake and lightweight diagnostic |
| `workflows/mkt-06-content-creation-dissemination/` | Content engine and content brief |
| `workflows/mkt-05-outreach-engagement/` | Small human outreach list and message style |
| `workflows/mkt-02-email-sms-nurture/` | Three-touch follow-up sequence and response segmentation |
| `workflows/mkt-04-reviews-referrals/` | Proof capture, testimonial triggers, and referral signals |
| `source-map.md` | Detailed rationale tying the thin slice back to source workflows |

## Automation Blueprint

The operative runtime choice is n8n or manual execution. The Make.com blueprint is retained below in the Consolidated Install Surface as a build specification, not a direct Make import. Before any automated run, rebuild the workflow in the selected runtime, bind credentials, and test with a sample intake.

## Placeholder and Binding Notes

- `PENDING_MAKE_PUBLIC_SHARING_LINK` remains intentionally unbound until a public Make link is generated and tested from a second account or team.
- Make/OpenAI/Microsoft 365/HubSpot fields are optional Standard-tier bindings. The manual tier does not wait on them.
- Buyer-specific business name, offer, audience, and proof fields come from `assets/intake-questions.md` and must be reviewed before publishing or sending outreach.

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
the kit can be promoted from `0.2.0-draft` toward Standard conformance.
The Make.com link lane also requires a public sharing link and a successful install test from a second Make.com account or team. The current install surface and Make blueprint are embedded below so this kit remains the operative package file.

## Change Log

- **2026-05-15 — 0.1.0-draft — CC-2026-05-15-003 — initial draft**
  Packaged the README, kit manifest draft, source map back to
  MKT-01/02/03/04/05/06, 5-day implementation checklist, sales-facing
  one-pager with $1,000 one-time starter price, and the four asset
  templates. Status: draft, not certified.
- **2026-05-16 — 0.1.0-draft — CC-2026-05-16-001 — correction**
  Normalized follow-up language to three total outreach/follow-up touches
  so the template matches the MKT-05 maximum 3-touch source rule.
- **2026-05-17 — 0.2.0-draft — CC-2026-05-17-002 — packaging**
  Added the Standard-tier Make.com Magic Template Link lane with `template.md`,
  `automation/Founder-Signal-System-Make-Blueprint.json`, and
  `automation/make-public-template-publisher-checklist.md`. The link remains
  pending until Make.com public sharing is generated and tested.


## Consolidated Install Surface

This section folds the former split `template.md` and Make blueprint surface into the operative kit file. The old files are retained as legacy/provenance artifacts, but this section is the package authority.

### Runtime Decision

- Preferred v1 runtime: local n8n, because Make free-plan activation limits and OpenAI credit limits blocked the Standard-tier Make path.
- Manual tier: still active through the Markdown assets in `assets/`.
- Make.com public template: deferred until a paid or otherwise enabled Make/OpenAI path is justified by revenue.

### Buyer Setup Instructions

1. Run the manual assets first: `assets/intake-questions.md`, `assets/content-brief-template.md`, `assets/follow-up-sequence-template.md`, and `assets/proof-capture-template.md`.
2. If using n8n, rebuild from `automation/n8n-v1-runtime-handoff.md` and test with one sample intake before any external send.
3. If later using Make.com, follow the staged publisher checklist and replace `PENDING_MAKE_PUBLIC_SHARING_LINK` only after a second-account install test passes.

### Former Template Notes

# Magic Template Link — Founder Signal System

Status: Make scenario deferred; n8n selected as preferred v1 runtime
Tier: Standard
Template type: Make.com public scenario sharing link
Current link: `PENDING_MAKE_PUBLIC_SHARING_LINK`

## Current Publisher Status

Logged: 2026-05-17

- Make.com scenario has been manually rebuilt from the package spec.
- Tally intake trigger fired successfully.
- Gmail output node test fired successfully.
- OpenAI node is reachable and mapped, but full sequence test is blocked by
  OpenAI error `[429] You have consumed all credits in your OpenAI account,
  or exceeded your monthly OpenAI budget.`
- Scenario should remain off until OpenAI credits or monthly budget are
  restored and one full Tally to OpenAI to Gmail test succeeds.
- Public Magic Template Link has not been generated yet.
- 2026-05-17 update: Robert confirmed local n8n is running and has Workflow 06
  available/tested recently. Use n8n as the v1 runtime while Make remains
  blocked by free-plan activation limits and OpenAI credits.

## What This Link Does

The Magic Template Link is the fastest install path for buyers who want the
Founder Signal System preloaded in Make.com.

Once the Make.com scenario is published and this file is updated with the
public sharing link, the buyer can:

1. Open the link.
2. Preview the scenario in Make.com.
3. Click **Use this scenario**.
4. Log in or create a Make.com account.
5. Connect the required apps.
6. Clone the workflow into their own Make.com account.
7. Run a test intake before turning the workflow on.

## Required Connections

The Standard-tier template expects these services:

| Service | Required? | Used For |
| --- | --- | --- |
| Make.com | Yes | Scenario hosting and execution |
| OpenAI | Yes | Drafting the signal brief, content prompts, and follow-up language |
| HubSpot | Optional | Creating or updating the CRM-lite contact record |
| Microsoft 365 Outlook | Optional | Sending the internal setup summary |
| Microsoft 365 Excel or Lists | Optional | Logging proof-loop and follow-up records |

If a buyer does not use HubSpot or Microsoft 365, run the Manual tier instead
and use the Markdown templates in `assets/`.

## Buyer Setup Instructions

Use these instructions after `Current link` above has been replaced with the
real Make.com public sharing link.

1. Click the Magic Template Link.
2. In Make.com, click **Use this scenario**.
3. Connect the required account prompts shown by Make.com.
4. Review each module and confirm the default field mappings.
5. Add the buyer's business name, offer, primary audience, and preferred
   notification email in the scenario setup fields.
6. Run the built-in test with one sample founder intake.
7. Confirm the output creates:
   - one signal brief draft
   - one content cycle prompt
   - one three-touch follow-up draft
   - one proof-loop record or setup email
8. Turn the scenario on only after the test output is reviewed.

## Publisher Setup Instructions

Use `automation/make-public-template-publisher-checklist.md` to publish the
scenario and replace the placeholder link in this file.

If a direct JSON import shows "Module Not Found", discard the failed import and
use `automation/make-scenario-manual-build.md`. The JSON file is a build spec,
not a Make.com-generated export.

For the current v1 runtime path, use
`automation/n8n-v1-runtime-handoff.md`.

## Fallback

If the Make.com link is unavailable, the package still works manually:

- Run `assets/intake-questions.md`.
- Fill `assets/content-brief-template.md`.
- Use `assets/follow-up-sequence-template.md`.
- Log results in `assets/proof-capture-template.md`.

Do not delay buyer delivery just because the public sharing link is not ready.

### Embedded Make Blueprint

```json
{
  "name": "Founder Signal System: Intake to Signal Brief (Make.com Blueprint)",
  "description": "Standard-tier scenario build spec for the Founder Signal System. This file documents the intended modules and mappings, but it is not a Make.com-importable blueprint because Make requires platform-generated module identifiers.",
  "status": "draft",
  "importableInMake": false,
  "buildInstructions": "Use make-public-template-publisher-checklist.md to rebuild this manually in the Make.com scenario editor. Do not import this JSON directly.",
  "version": "0.1.0-draft",
  "flow": [
    {
      "id": 1,
      "module": "webhook:webhooks",
      "version": 1,
      "parameters": {
        "hook": "FOUNDER_INTAKE_WEBHOOK"
      },
      "mapper": {},
      "metadata": {
        "designer": {
          "x": 0,
          "y": 0
        },
        "notes": "Receives one founder intake submission. Expected fields: founder_name, email, company, offer, ideal_customer, painful_problem, desired_outcome, proof_points, exclusions, primary_channel, notification_email."
      }
    },
    {
      "id": 2,
      "module": "openai:createCompletion",
      "version": 1,
      "parameters": {
        "model": "gpt-4o-mini"
      },
      "mapper": {
        "messages": [
          {
            "role": "system",
            "content": "You are the Founder Signal System setup assistant for Uncle Robert Consulting. Create practical, buyer-ready setup outputs from the founder intake. Keep the founder's voice human. Do not invent proof. Do not recommend paid ads, large-list automation, or a website rebuild."
          },
          {
            "role": "user",
            "content": "Create a Founder Signal setup packet from this intake. Return sections titled Signal Brief, Content Cycle Prompt, Outreach Angle, Three-Touch Follow-Up Draft, Proof Loop Fields, and Next Cycle Question.\n\nFounder: {{1.founder_name}}\nEmail: {{1.email}}\nCompany: {{1.company}}\nOffer: {{1.offer}}\nIdeal customer: {{1.ideal_customer}}\nPainful problem: {{1.painful_problem}}\nDesired outcome: {{1.desired_outcome}}\nProof points: {{1.proof_points}}\nExclusions: {{1.exclusions}}\nPrimary channel: {{1.primary_channel}}"
          }
        ]
      },
      "metadata": {
        "designer": {
          "x": 300,
          "y": 0
        },
        "notes": "Generates the first signal brief and operating prompts. Buyer must review before publishing or sending outreach."
      }
    },
    {
      "id": 3,
      "module": "hubspot:createUpdateContact",
      "version": 1,
      "parameters": {},
      "mapper": {
        "email": "{{1.email}}",
        "properties": [
          {
            "property": "firstname",
            "value": "{{1.founder_name}}"
          },
          {
            "property": "company",
            "value": "{{1.company}}"
          },
          {
            "property": "lifecyclestage",
            "value": "lead"
          },
          {
            "property": "founder_signal_status",
            "value": "Setup packet drafted"
          },
          {
            "property": "founder_signal_primary_channel",
            "value": "{{1.primary_channel}}"
          }
        ]
      },
      "metadata": {
        "designer": {
          "x": 600,
          "y": -170
        },
        "notes": "Optional CRM-lite update. Remove or disable this module if the buyer does not use HubSpot."
      }
    },
    {
      "id": 4,
      "module": "microsoft365email:sendEmail",
      "version": 1,
      "parameters": {},
      "mapper": {
        "to": "{{ifempty(1.notification_email; 1.email)}}",
        "subject": "Founder Signal setup packet for {{1.company}}",
        "body": "Founder Signal setup packet\n\n{{2.choices[0].message.content}}\n\nReview before publishing content or sending outreach. Keep the first outreach batch to 10-25 named contacts and three total touches."
      },
      "metadata": {
        "designer": {
          "x": 600,
          "y": 170
        },
        "notes": "Optional Microsoft 365 notification. Replace with Gmail, Slack, Teams, or manual output if needed."
      }
    },
    {
      "id": 5,
      "module": "microsoft365excel:addRow",
      "version": 1,
      "parameters": {
        "workbook": "FOUNDER_SIGNAL_TRACKER",
        "worksheet": "Proof Loop"
      },
      "mapper": {
        "date": "{{now}}",
        "founder": "{{1.founder_name}}",
        "company": "{{1.company}}",
        "email": "{{1.email}}",
        "status": "Setup packet drafted",
        "primary_channel": "{{1.primary_channel}}",
        "next_action": "Review signal brief, publish first content asset, send first 5 outreach messages",
        "setup_packet": "{{2.choices[0].message.content}}"
      },
      "metadata": {
        "designer": {
          "x": 900,
          "y": 0
        },
        "notes": "Optional Microsoft 365 tracker row. This supports the proof loop without forcing a paid CRM."
      }
    }
  ],
  "metadata": {
    "version": 1,
    "scenario": {
      "roundtrips": 1,
      "maxErrors": 3,
      "autoCommit": true,
      "sequential": false,
      "confidential": false,
      "dataloss": false,
      "freshVariables": false
    },
    "notes": "Draft blueprint for building the Make.com public sharing scenario. Before market use, import or recreate in Make.com, validate module IDs and mappings, replace placeholder workbook/sheet values, publish a public sharing link, and update template.md."
  }
}
```


## Embedded Package Documents

This appendix makes the Founder Signal System kit self-contained for review. The original files remain in place as editable working copies, but the kit now carries their readable contents.

### README.md

````markdown
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
````

### source-map.md

````markdown
# Source Map — Founder Signal System

Every step in the Founder Signal System maps back to a specific URC source
workflow. This file is the citation trail. If a step or template here ever
contradicts the source, the source wins until the source itself is
deliberately updated.

The package only pulls the minimum needed for the thin slice. It does not
inherit the full URC workflow.

## Source Locations

| ID | Repo Folder | Source File |
| --- | --- | --- |
| MKT-01 | `workflows/mkt-01-lead-generation-conversion/` | `source/URC-MKT-01_Lead_Generation_Conversion.md` |
| MKT-02 | `workflows/mkt-02-email-sms-nurture/` | `source/URC-MKT-02_Email_SMS_Nurture.md` |
| MKT-03 | `workflows/mkt-03-polls-assessments/` | `source/URC-MKT-03_Polls_Assessments.md` |
| MKT-04 | `workflows/mkt-04-reviews-referrals/` | `source/URC-MKT-04_Reviews_Referrals.md` |
| MKT-05 | `workflows/mkt-05-outreach-engagement/` | `source/URC-MKT-05_Outreach_Engagement.md` |
| MKT-06 | `workflows/mkt-06-content-creation-dissemination/` | `source/URC-MKT-06_Content_Creation_Dissemination.md` |

The reference kit-format implementation pattern lives at
`mkt-06-content-creation-dissemination/` (top-level, not under `workflows/`).
That folder is the kit/1.0 conformance reference. This package is the
draft-stage starter package and reuses the manifest shape.

## Step-By-Step Mapping

### Step 1 — ICP and Fit Focus

| Package Element | Source Workflow | Source Section |
| --- | --- | --- |
| Definition of ICP | MKT-01 | Section 3 — Ideal Customer Profile |
| Painful problem language | MKT-01 | Section 3 — pain points dimension |
| What counts as a qualified conversation | MKT-01 | Section 6 — Lead Qualification & Handoff |
| Exclusion criteria pattern | MKT-01 | Section 3 — ICP dimensions, especially budget and stage |
| Channels to find the ICP | MKT-01 | Section 4 — Lead Generation Channels |

Asset using this: `assets/intake-questions.md` (ICP and audience sections),
README "Who This Is For".

### Step 2 — Diagnostic and Segmentation

| Package Element | Source Workflow | Source Section |
| --- | --- | --- |
| Short intake / founder interview format | MKT-03 | Section 3 — URC Assessment Strategy |
| Segmentation logic (interested / not now / referral / no response) | MKT-03 | Section 4 — Active Assessments, outcome segments |
| Lightweight vs heavy survey decision | MKT-03 | Section 4.1 — AI Readiness Quiz, scoring approach |
| Real-time scoring discipline | MKT-03 | Workflow Overview — typical cycle time |

Asset using this: `assets/intake-questions.md` (full file), plus the
"interested / not now / referral / no response" buckets in
`assets/follow-up-sequence-template.md` and `assets/proof-capture-template.md`.

### Step 3 — Content Engine

| Package Element | Source Workflow | Source Section |
| --- | --- | --- |
| Content brief composition | MKT-06 | Section 5 — Content Creation Process |
| Content pillars pattern | MKT-06 | Section 4 — Content Pillars |
| Idea-to-publish cycle time | MKT-06 | Section 2 — Workflow Overview |
| Founder POV vs brand voice | MKT-06 | Section 4 — Robert's Perspective pillar |
| Distribution / repurposing approach | MKT-06 | Section 5 onward — Creation Process and downstream channels |

Asset using this: `assets/content-brief-template.md`. The kit/1.0 reference
manifest shape is borrowed from `mkt-06-content-creation-dissemination/kit.md`.

### Step 4 — Outreach Lane

| Package Element | Source Workflow | Source Section |
| --- | --- | --- |
| Outreach philosophy (only reach out with something relevant) | MKT-05 | Section 3 — Outreach Philosophy |
| LinkedIn outreach style | MKT-05 | Section 4.1 — LinkedIn (Primary Outreach Channel) |
| Email outreach for warm leads | MKT-05 | Section 4.2 — Email Outreach |
| 3-touch maximum cadence | MKT-05 | Section 4.2 — Maximum 3-touch sequence |
| No bulk automation | MKT-05 | Section 4.1 — No automated bulk messaging |

Asset using this: outreach lane in `implementation-checklist.md` (Day 4),
plus the message style and consent rules referenced in
`assets/follow-up-sequence-template.md`.

### Step 5 — Follow-Up Lane

| Package Element | Source Workflow | Source Section |
| --- | --- | --- |
| Three-touch follow-up sequence | MKT-02 | Section 4 — Nurture Tracks |
| Value-first nurture philosophy | MKT-02 | Section 3 — Nurture Philosophy |
| Response segmentation buckets | MKT-02 | Section 4 — Nurture Tracks by audience |
| Cadence (helpful → specific → close-the-loop) | MKT-02 | Section 4 / 5 — sequence design |

Asset using this: `assets/follow-up-sequence-template.md`.

### Step 6 — Proof Loop

| Package Element | Source Workflow | Source Section |
| --- | --- | --- |
| When to ask for testimonial or review | MKT-04 | Section 3.1 — When to Ask |
| Review platforms and prioritization | MKT-04 | Section 3.2 — Review Platforms |
| Case study capture pattern | MKT-04 | Section 3 onward — Reviews and Testimonials |
| Feedback loop into next content cycle | MKT-04 | Section 3 — overall workflow goal |

Asset using this: `assets/proof-capture-template.md` and the cycle-review
step in `implementation-checklist.md` (Day 5).

## Reference Implementation (Not A Source, But A Pattern)

| Reference | Repo Location | Purpose |
| --- | --- | --- |
| Active kit/1.0 reference | `mkt-06-content-creation-dissemination/kit.md` | Manifest shape, frontmatter, change log discipline |
| Active kit README pattern | `mkt-06-content-creation-dissemination/README.md` | Structure for the package README |
| Kit standard | `docs/operations/kit-auth-standard.md` | Auth contract (not required for this draft because the thin slice has no connectors) |
| Canonical kit standard | `C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\Journey_Kit.md` | Source-of-truth for kit/1.0 fields |

## What Is Deliberately Not Inherited

To keep the thin slice usable for a generic founder rather than URC
specifically, the following URC-internal elements are intentionally not
inherited:

- URC-specific tooling assumptions (Make.com, Notion content calendar,
  HubSpot CRM, Klaviyo lists, Jira, Atlassian)
- URC-specific case study references (Marcus & Rivera) — those stay in
  source material only
- URC's geographic focus (Kansas City metro, Independence MO)
- URC's flagship AI Readiness Quiz brand — the diagnostic in this package
  is a generic intake, not the URC quiz
- URC's MKT-06 n8n workflow template — the thin slice does not require
  any automation to run

If a buyer wants any of those layers, they should be quoted as a follow-on
engagement, not inherited silently into this package.

## Change Tracking

When a source workflow updates, this file is the diff point. Update the
matching row, log the change in
`docs/operations/change-control-register.md`, and reflect it in
`kit.md` change log.
````

### implementation-checklist.md

````markdown
# Implementation Checklist — Founder Signal System

A 3-to-5 day setup sprint that takes one founder from unclear audience and
message to one running cycle of publishing, outreach, follow-up, and proof
capture.

## Working Assumptions

- One founder, working solo or with at most a part-time assistant.
- Roughly 60 to 90 minutes per day for 5 days, then 2 to 4 hours per cycle
  after setup.
- Microsoft 365 or Google Workspace already in use. No new paid tool is
  required to complete this checklist.
- LinkedIn account in good standing.
- A list of at least 25 names the founder could plausibly reach out to
  (past clients, warm intros, past inquiries, people who liked or
  commented on past posts).

If any of these are missing, fix them before starting the sprint. Running
this sprint without an audience is rearranging deck chairs.

## Outcomes By End Of Sprint

- One-page signal brief: ICP, painful problem, founder POV, exclusion
  criteria, qualified-conversation definition
- One content brief filled in and at least one piece of content shipped
- Outreach list of 10 to 25 named contacts with personal first-touch
  messages drafted or sent
- Three-touch follow-up sequence drafted and scheduled
- Proof capture template populated with at least one logged reply,
  objection, signal, or testimonial
- A decision about what changes for the next cycle

---

## Day 1 — ICP And Offer Focus

Goal: Make the audience and offer specific enough that a stranger could
explain it back to you.

- [ ] Block 60 to 90 minutes. Phone on silent.
- [ ] Open `assets/intake-questions.md` and fill it in completely. Do not
      skip the "current offer" and "exclusion criteria" sections.
- [ ] In one paragraph, write who this is for (and one sentence on who it is
      not for).
- [ ] In one paragraph, write the painful problem in the founder's words —
      not industry jargon. Borrow the words from past client interviews,
      inquiries, or support tickets.
- [ ] In one paragraph, write the desired outcome and the urgency. If
      nothing forces the buyer to act this month, name that fact.
- [ ] Define qualified-conversation criteria: budget signal, role, timing,
      and pain match.
- [ ] Output: a one-page signal brief saved next to this checklist. Tag it
      with today's date and the founder's name.

Stop here if any of the above is fuzzy. Going further on a fuzzy ICP wastes
the rest of the week.

## Day 2 — Diagnostic And Message Map

Goal: Lock the message into a small repeatable shape so content, outreach,
and follow-up all sound like the same person.

- [ ] Block 60 to 90 minutes.
- [ ] Convert the signal brief into a message map (one page):
  - One-sentence promise
  - Three proof points (numbers, named outcomes, or short stories — no
    adjectives)
  - One signature founder point of view (the thing the founder believes
    that most peers will not say out loud)
  - One disqualifier (who this is explicitly not for)
- [ ] Define the diagnostic step the founder will use with any new
      conversation: a short list of 3 to 5 questions that reveal pain and
      readiness without feeling like an interview.
- [ ] Decide where the diagnostic lives:
  - In LinkedIn DM after a real reply
  - In a short Calendly intro call
  - As an optional intake form for inbound leads
- [ ] Output: a message map file and the 3-to-5 question diagnostic.

## Day 3 — Content Brief And First Asset Batch

Goal: Ship at least one piece of content. The Founder Signal System is not
real until something is published.

- [ ] Block 90 to 120 minutes.
- [ ] Open `assets/content-brief-template.md` and fill in one cycle.
- [ ] Pick one of the three content pillars the founder will commit to for
      the next four weeks. Two pillars is fine; three is the maximum.
- [ ] Draft the content cycle batch:
  - 3 to 5 LinkedIn posts (or equivalent on the founder's primary channel)
  - 1 short email to the founder's existing list, even if it is small
  - 1 anchor asset outline (blog post, long LinkedIn article, or short
    PDF) — outline only, not the full draft
- [ ] AI-assist is fine for drafting. The founder personalizes and
      approves before publishing.
- [ ] Publish at least one piece today. Do not wait for the full batch.
- [ ] Output: filled-in content brief, drafts, and one piece live.

## Day 4 — Outreach And Follow-Up Setup

Goal: Make sure the content has a warm landing zone. Content without
outreach leaks.

- [ ] Block 90 to 120 minutes.
- [ ] Build the outreach list: 10 to 25 named contacts. For each, note a
      one-line reason they are on the list (past inquiry, past client,
      warm intro, recent LinkedIn engagement, referrable peer).
- [ ] Draft a personal first-touch message for each contact. Reference
      something specific. No bulk send.
- [ ] Send the first 5 today. Schedule the rest for the next 5 business
      days, no more than 5 per day, so replies stay manageable.
- [ ] Open `assets/follow-up-sequence-template.md`. Fill in the
      three-touch sequence:
  - Touch 1 — first outreach
  - Touch 2 — helpful follow-up after the first touch (4 to 7 days later)
  - Touch 3 — specific problem / close-the-loop note (7 to 10 days after
    Touch 2)
- [ ] Schedule Touch 2 and Touch 3 on a calendar or reminder system.
      Microsoft 365 tasks or a simple spreadsheet is fine.
- [ ] Output: outreach list with personal messages, follow-up template
      filled in, follow-up touches scheduled.

## Day 5 — Proof Loop And Next-Cycle Review

Goal: Make the system self-correcting. The proof log is the most important
output of the week.

- [ ] Block 60 to 90 minutes.
- [ ] Open `assets/proof-capture-template.md` and create the founder's
      first instance. Log every reply, objection, referral, testimonial,
      and traction signal from the week so far — even the ones that look
      small.
- [ ] Tag each entry with one of: interested, not now, referral, no
      response, content signal, objection.
- [ ] Review the content batch's engagement (likes, comments, reshares,
      replies). Note which post pulled the most. Capture the topic, not
      just the numbers.
- [ ] Ask one explicit question: based on this week's signals, what is
      different for the next cycle?
  - Same audience, sharper message?
  - Same message, different channel?
  - Same message, smaller outreach list, deeper personalization?
  - Different offer?
- [ ] Write a 3-bullet "next cycle plan" at the bottom of the proof log.
- [ ] Schedule the next cycle start date (7 days out for weekly cadence,
      14 for biweekly).
- [ ] Output: a filled-in proof log and a next-cycle plan.

## Cycle Cadence After Setup

| Day | Activity | Time |
| --- | --- | --- |
| Cycle Day 1 | Content brief + draft batch | 60 to 90 min |
| Cycle Day 2 | Publish first piece + send first 5 outreach messages | 45 to 60 min |
| Cycle Day 3 | Publish second piece + send remaining outreach + Touch 2 from prior cycle | 45 to 60 min |
| Cycle Day 4 | Light day — reply to inbound + queue Touch 3 where needed | 30 min |
| Cycle Day 5 | Update proof log + send/confirm Touch 3 + plan next cycle | 45 to 60 min |

After 3 cycles, run a longer review. After 6 cycles, decide whether to add
an adjacent workflow (MKT-08 social, MKT-07 paid, MKT-09 events, or a full
nurture library from MKT-02).

## Common Failure Modes And Fixes

| Failure | Symptom | Fix |
| --- | --- | --- |
| Skipped intake | Content "kind of" lands but no replies | Stop. Go back to Day 1. |
| Content but no outreach | Posts publish, inbox is empty | Set a hard rule: no second cycle until outreach list is contacted |
| Outreach but no follow-up | First touches sent, never followed up | Schedule Touch 1/2/3 on the calendar the same day the outreach goes out |
| No proof log | Founder cannot describe what worked last cycle | Make the proof log the literal last step of every cycle, not an "if I have time" task |
| Scope creep | Founder asks for paid ads or a website rebuild after week 2 | Refer back to README "What Is Intentionally Excluded". Quote the next layer as a separate engagement. |

## Verification

Per `kit.md` frontmatter `verificationNotes`, one cycle is considered
complete when:

- [ ] `assets/intake-questions.md` is filled in
- [ ] One `assets/content-brief-template.md` instance is filled and at
      least one piece published
- [ ] An outreach list of 10 or more contacts has been touched with at
      least one personal first message
- [ ] `assets/follow-up-sequence-template.md` is filled in and the three
      touches are scheduled or sent
- [ ] `assets/proof-capture-template.md` has at least one logged reply,
      objection, testimonial, referral, or traction note

If all five are true, this checklist has done its job.
````

### offer-one-pager.md

````markdown
# Founder Signal System — Offer One-Pager

A starter marketing system for founders who already have customers but
can't tell whether their message, content, or outreach is actually working.

## The Problem

Most solo founders and small service teams are stuck in the same loop:

- They publish content, but they aren't sure who they are for or what the
  painful problem actually is
- They run outreach in fits and starts, then drop it when client work gets
  busy
- They get replies and referrals, but never log them, so the next month
  starts from scratch
- They suspect something is working, but they cannot point at proof

The cost is not just lost leads. It is the founder spending evenings
writing content that does not land, then quietly stopping for three weeks,
then starting over with a new idea that has the same fate.

## The Promise

In 3 to 5 days of setup, the Founder Signal System gives the founder:

- A one-page signal brief that says clearly who this is for and what
  painful problem it solves
- A repeatable weekly or biweekly cycle of content, outreach, follow-up,
  and proof capture
- A first published batch of content and a first round of human outreach
  inside the same week
- A proof log so the next cycle is not guesswork

After six cycles, the founder has evidence — not vibes — about what
message and channel are pulling for their business.

## Who It Is For

- Solo founders or owner-operators of small service-based businesses
  (roughly 1 to 10 people)
- Founders with at least a handful of clients and some revenue who feel
  stuck on messaging
- Founders who want to run human outreach and human follow-up, not buy
  a full automation stack first
- Founders who can give 60 to 90 minutes a day for one week of setup,
  then 2 to 4 hours per cycle after

## Who It Is Not For

- Pre-revenue founders with no clients to learn from
- Marketing-mature teams with an existing content engine looking for
  paid acquisition or scale
- Companies that want a brand voice instead of a sharper founder voice
- Anyone looking for a full nine-workflow marketing department in one
  engagement — that is a different conversation

## What Is Included

- 90-minute founder diagnostic interview, plus an intake form to fill out
  before the call
- One-page signal brief: ICP, painful problem, founder POV, exclusion
  criteria, qualified-conversation definition
- A message map: one-sentence promise, three proof points, founder POV,
  one disqualifier
- One filled-in content brief and a first cycle batch:
  - 3 to 5 LinkedIn posts (or equivalent on primary channel)
  - 1 short email to the existing list
  - 1 long-form anchor asset outline
- Outreach list of 10 to 25 named contacts with personalized first-touch
  messages
- Three-touch outreach and follow-up sequence drafted and scheduled
- Proof capture template with the founder's first week's signals logged
- A 30-minute end-of-week review and "next cycle plan"
- A copy of the full Founder Signal System package (this folder) for the
  founder to keep and rerun

## What Is Not Included

- Paid advertising or PPC strategy
- Full social media management or content calendar
- Event or webinar marketing
- A full automation build (Make.com, n8n, Zapier, Klaviyo flows, HubSpot
  workflows)
- Website redesign, brand identity, or visual design
- Long-form copywriting beyond the first cycle batch
- Sales proposal, contract, or onboarding rebuild
- A multi-month nurture library

Any of these can be quoted as a follow-on engagement after the thin slice
has produced at least one cycle of proof. Trying to do them at the same
time is the most common reason founder marketing fails.

## Timeline

- Day 0: Intake form returned, diagnostic call scheduled
- Day 1: ICP and offer focus session, signal brief drafted
- Day 2: Diagnostic and message map session
- Day 3: Content brief and first asset batch (at least one piece live)
- Day 4: Outreach list and follow-up sequence set up
- Day 5: Proof loop, end-of-week review, next-cycle plan

Total: 3 to 5 working days from kickoff to a running cycle. Founder time
investment: roughly 6 to 10 hours over the week.

## Starter Price

**$1,000 — one-time setup**

What that covers:

- Thin-slice scope: 3 to 5 day setup sprint
- Founder time invested: ~6 to 10 hours over the week
- Deliverables: founder diagnostic, signal brief, one content cycle batch
  (3-5 LinkedIn posts, 1 short email, 1 anchor outline), outreach list of
  10 to 25 named contacts with personalized first-touch messages, drafted
  three-touch outreach and follow-up sequence, populated proof log, and a copy of the
  full Founder Signal System package for the founder to keep and rerun
- Adjacent engagements (paid, social calendar, full nurture build) priced
  separately

Optional ongoing review: a monthly 60-minute proof-loop review can be
offered as a separate light retainer once the thin slice is producing
cycles.

## What Happens After Setup

After the first cycle, the founder owns the package. They can keep running
it themselves. URC offers two optional follow-on paths, both quoted
separately:

1. **Monthly proof-loop review.** One 60-minute session per month to
   review the proof log, sharpen the message, and decide what changes for
   the next cycle.
2. **Adjacent workflow add-on.** When the thin slice is producing
   consistent signal, add the next layer — usually MKT-08 social, MKT-07
   paid, MKT-09 events, or a full MKT-02 nurture sequence library.

Neither follow-on is required. The starter package is designed to be
useful on its own.

## How To Get Started

Book a 30-minute founder diagnostic call. Bring:

- A rough description of your current ICP, even if it is fuzzy
- The last 4 to 8 weeks of content you have published (or honestly, the
  fact that you stopped — that is also useful)
- A sense of how much time per week you can give this for the next 6
  weeks

If the package is a fit, we book the setup sprint and start with Day 1.
If it is not a fit, we say so on the call and point you to a more
appropriate next step.

## Why This Exists

Most founders do not need a marketing department. They need to know who
they are for, what to say, where to say it, and whether anyone is
listening. The Founder Signal System is the smallest sellable version of
that answer.
````

### template.md

````markdown
# Magic Template Link — Founder Signal System

Status: Make scenario deferred; n8n selected as preferred v1 runtime
Tier: Standard
Template type: Make.com public scenario sharing link
Current link: `PENDING_MAKE_PUBLIC_SHARING_LINK`

## Current Publisher Status

Logged: 2026-05-17

- Make.com scenario has been manually rebuilt from the package spec.
- Tally intake trigger fired successfully.
- Gmail output node test fired successfully.
- OpenAI node is reachable and mapped, but full sequence test is blocked by
  OpenAI error `[429] You have consumed all credits in your OpenAI account,
  or exceeded your monthly OpenAI budget.`
- Scenario should remain off until OpenAI credits or monthly budget are
  restored and one full Tally to OpenAI to Gmail test succeeds.
- Public Magic Template Link has not been generated yet.
- 2026-05-17 update: Robert confirmed local n8n is running and has Workflow 06
  available/tested recently. Use n8n as the v1 runtime while Make remains
  blocked by free-plan activation limits and OpenAI credits.

## What This Link Does

The Magic Template Link is the fastest install path for buyers who want the
Founder Signal System preloaded in Make.com.

Once the Make.com scenario is published and this file is updated with the
public sharing link, the buyer can:

1. Open the link.
2. Preview the scenario in Make.com.
3. Click **Use this scenario**.
4. Log in or create a Make.com account.
5. Connect the required apps.
6. Clone the workflow into their own Make.com account.
7. Run a test intake before turning the workflow on.

## Required Connections

The Standard-tier template expects these services:

| Service | Required? | Used For |
| --- | --- | --- |
| Make.com | Yes | Scenario hosting and execution |
| OpenAI | Yes | Drafting the signal brief, content prompts, and follow-up language |
| HubSpot | Optional | Creating or updating the CRM-lite contact record |
| Microsoft 365 Outlook | Optional | Sending the internal setup summary |
| Microsoft 365 Excel or Lists | Optional | Logging proof-loop and follow-up records |

If a buyer does not use HubSpot or Microsoft 365, run the Manual tier instead
and use the Markdown templates in `assets/`.

## Buyer Setup Instructions

Use these instructions after `Current link` above has been replaced with the
real Make.com public sharing link.

1. Click the Magic Template Link.
2. In Make.com, click **Use this scenario**.
3. Connect the required account prompts shown by Make.com.
4. Review each module and confirm the default field mappings.
5. Add the buyer's business name, offer, primary audience, and preferred
   notification email in the scenario setup fields.
6. Run the built-in test with one sample founder intake.
7. Confirm the output creates:
   - one signal brief draft
   - one content cycle prompt
   - one three-touch follow-up draft
   - one proof-loop record or setup email
8. Turn the scenario on only after the test output is reviewed.

## Publisher Setup Instructions

Use `automation/make-public-template-publisher-checklist.md` to publish the
scenario and replace the placeholder link in this file.

If a direct JSON import shows "Module Not Found", discard the failed import and
use `automation/make-scenario-manual-build.md`. The JSON file is a build spec,
not a Make.com-generated export.

For the current v1 runtime path, use
`automation/n8n-v1-runtime-handoff.md`.

## Fallback

If the Make.com link is unavailable, the package still works manually:

- Run `assets/intake-questions.md`.
- Fill `assets/content-brief-template.md`.
- Use `assets/follow-up-sequence-template.md`.
- Log results in `assets/proof-capture-template.md`.

Do not delay buyer delivery just because the public sharing link is not ready.
````

### assets/content-brief-template.md

````markdown
# Content Brief Template

One filled-in instance per cycle. The brief is the single source of
truth for everything published, sent, or said in that cycle. If a draft
does not match the brief, the brief wins until it is intentionally
changed.

Save each instance with the cycle date: e.g.
`content-brief-2026-W19.md` or `content-brief-2026-05-15.md`.

---

## Cycle Header

- Cycle ID:
- Cycle dates: (start) to (end)
- Cycle length: weekly / biweekly
- Founder name:
- Operator (if not founder):
- Linked signal brief:
- Linked previous cycle's proof log (if any):

## 1. Target Persona

Pulled from the signal brief. Keep this short and specific.

- Who this cycle is talking to:
- Role / business type:
- Stage and size:
- Where they spend professional attention:
- One sentence on how they would describe themselves to someone else:

## 2. Pain Point

- The painful problem this cycle is talking about (in customer words,
  not industry jargon):
- What the problem costs them (hours, money, missed opportunity,
  stress, reputation):
- The moment that usually makes this problem land:
- Words and phrases they use about it:
- Words and phrases to avoid:

## 3. Desired Outcome

- What success looks like for them after solving this:
- How they will know it worked (concrete, observable):
- Why this matters this quarter, not someday:

## 4. Offer And CTA

- The offer this cycle points toward (single offer per cycle, not all
  of them):
- Price band or commitment level:
- The single CTA for this cycle (book a call, reply with a word, fill
  a form, request a sample, attend a session):
- What happens immediately after the CTA fires:

If the CTA is "book a call," what specifically gets covered on that
call?

## 5. Channel Targets

Mark the channels this cycle will use. Keep it small.

- [ ] LinkedIn (primary)
- [ ] Email to existing list
- [ ] Blog or long-form anchor (one outline, not a full piece, unless
      the founder has the bandwidth)
- [ ] Other: (specify)

For each channel selected, write a one-line role:

- LinkedIn:
- Email:
- Blog / anchor:
- Other:

## 6. Founder Point Of View

The thing the founder believes that most peers will not say out loud,
applied to this cycle's pain point.

- Founder POV (one sentence):
- The "popular advice" this cycle pushes back on:
- Why the founder is the right person to say this:

This is what makes the content not sound like everyone else's content.

## 7. Proof / Example

At least one concrete proof point per cycle. No proof, no cycle.

- Specific customer outcome to reference (named, with permission, or
  anonymized with permission):
- The number, before/after, or named result:
- Where the proof currently lives (testimonial, email, screenshot,
  case study, recording):
- If proof is anonymized, what details get changed and what stays:

If proof does not exist yet, the cycle should be honest about that and
focus on the founder's POV plus the painful problem, while building
proof collection into the proof log.

## 8. Content Cycle Batch

The thin-slice batch is: 3 to 5 LinkedIn posts, 1 short email, 1
anchor outline. Adjust only if the founder cannot sustain that.

### LinkedIn Posts

| # | Hook / Angle | Pillar | CTA | Status |
| --- | --- | --- | --- | --- |
| 1 |  |  |  | Draft / Scheduled / Live |
| 2 |  |  |  |  |
| 3 |  |  |  |  |
| 4 |  |  |  |  |
| 5 |  |  |  |  |

Style notes for this cycle:

- First-person, founder voice
- One idea per post
- Concrete examples beat adjectives
- One CTA per post, soft is fine
- Avoid hashtag stuffing — 3 to 5 max

### Short Email To Existing List

- Subject line (60 characters or fewer):
- Pre-header (90 characters or fewer):
- Opening sentence:
- Body anchor — the one idea this email carries:
- CTA:
- Sign-off:
- Send date:

### Anchor Asset Outline

The anchor is the long-form piece the LinkedIn posts and the email all
point back to. Outline only at this stage unless the founder has the
bandwidth to draft it this cycle.

- Working title:
- Format: blog post / long LinkedIn article / PDF guide / video script
- Estimated length:
- Section outline (3 to 7 sections):
  1.
  2.
  3.
  4.
  5.
- One-sentence promise to the reader:
- CTA at the end:
- Distribution plan once written:

## 9. Outreach Tie-In

Content alone leaks. The outreach lane for this cycle should land on
the same signal the content is carrying.

- Outreach list size for this cycle:
- One-line "why this signal matters to you" pitch for the cycle:
- Reference asset that outreach can point to (a post, the anchor
  outline, a past case study):
- Are there specific named contacts the founder wants this cycle's
  content to reach? List them.

## 10. Cycle Decisions

Captured at the start of the cycle. Decisions made now save arguments
later.

- What is in scope this cycle:
- What is explicitly out of scope (deferred to a future cycle):
- What we will measure to know this cycle worked:
- What "good enough" looks like for this cycle's first piece, so it
  ships:

## 11. Cycle Wrap (Filled In At End)

- What got published vs. planned:
- What got sent vs. planned:
- Best-performing piece and one guess at why:
- Surprise reply, objection, or signal:
- One change for the next cycle:

This section becomes input to `proof-capture-template.md` for the same
cycle.
````

### assets/follow-up-sequence-template.md

````markdown
# Follow-Up Sequence Template

A simple three-touch outreach and follow-up sequence for the outreach
lane. The sequence is human, not automated. AI can help draft. The
founder personalizes and approves before sending.

> Rule of thumb from MKT-05: only reach out if you have something
> genuinely relevant to say. A bad follow-up does more damage than no
> follow-up. Each touch in this sequence has to earn its send.

---

## Sequence Header

- Contact name:
- Company / context:
- Why they are on the list (one line):
- Touch 1 sent on: (date)
- Channel for the sequence: LinkedIn DM / Email / Mixed
- Reference asset (a post, case study, anchor outline) tied to this
  cycle's signal:
- Status: Active / Closed-Interested / Closed-Not-Now / Closed-Referral
  / Closed-No-Response

## Sequence Rules

- Maximum three touches per contact per cycle. If they have not
  replied by Touch 3, close the loop and move on.
- Stop the sequence the moment they reply. Reply moves them out of
  the sequence and into the proof log under their reply category.
- No automation that hides who is sending. Every message is written
  or approved by the founder.
- Personalization must be specific, not generic. "I saw your post on
  X" is fine. "I help founders like you" is not.
- Spacing: 4 to 10 days between touches. Default 7.

## Touch 1 — First Outreach (Day 0)

This is the original outreach message. It counts as the first touch in
the three-touch sequence.

- Date sent:
- Channel:
- Reference to something specific about them:
- The one-sentence "why I am reaching out" tied to this cycle's
  signal:
- The single ask (reply with a word, a question, or a soft yes/no):
- Length target: 3 to 5 sentences. Short.

If Touch 1 has not been sent yet, send it before scheduling Touch 2.

## Touch 2 — Helpful Follow-Up (Day 4 to 7 After Touch 1)

The job of Touch 2 is to give value with no ask. The founder is
reminding them, but the message must stand on its own as useful even
if the contact never replies.

- Date scheduled:
- Channel (usually same as Touch 1):
- Reference back to Touch 1 in one sentence ("circling back on my
  earlier note" is fine, with one sentence of context):
- One useful thing — a link to a relevant post, a short observation
  about their situation, a piece of the cycle's anchor asset:
- No new ask. Soft close like "no need to reply if not relevant" is
  often the right move.
- Length target: 4 to 6 sentences.

### Draft Block

> (Paste or write the Touch 2 message here when drafting.)

## Touch 3 — Specific Problem / Close The Loop (Day 7 to 10 After Touch 2)

The job of Touch 3 is to escalate specificity and close the loop.
Name the painful problem the cycle is built around. Tie it to
something concrete about their world. Make a single, low-friction ask
or close cleanly if a direct ask would feel forced.

- Date scheduled:
- Channel:
- The specific painful problem this cycle solves, in one sentence:
- One concrete observation about why this might be on their plate
  right now:
- Single low-friction ask or close-the-loop line. Examples:
  - "Worth a 20-minute conversation?"
  - "If this is on your radar, here is what a quick look at it
    would cover — interested?"
  - "Reply YES or NO to a 15-minute walk-through."
- "If timing is off, no need to reply. I will leave this here in case
  it becomes useful later."
- Length target: 4 to 7 sentences.

### Draft Block

> (Paste or write the Touch 3 message here when drafting.)

## Response Buckets

When a reply comes in, classify it. This is what feeds the proof log.

| Bucket | Definition | Next Action |
| --- | --- | --- |
| Interested | Real reply, real signal, willing to talk or learn more | Move to a 1:1 conversation. Stop the sequence. Log in proof log under "interested." |
| Not now | Reply confirms relevance but timing is wrong | Stop the sequence. Note the timing reason. Add to a "revisit in 60 / 90 / 180 days" list. Log under "not now." |
| Referral | Reply names someone else who is a better fit | Thank them. Ask permission to mention them when reaching out to the referral. Log under "referral." |
| No response | No reply after all touches | Close the loop with Touch 3. Log under "no response." |
| Objection | Reply pushes back, raises a real concern | Stop the sequence. Treat the objection as content. Log under "objection" with the exact wording. |

## Things That Disqualify A Touch

If any of these apply, do not send. Rewrite or drop.

- The message could be sent to anyone in their role. (Not specific
  enough.)
- It references "synergy," "leverage," "partner with you on your
  journey," or anything that sounds like a sales template.
- It pretends to know the contact better than the founder actually
  does.
- It hides the ask. Buried CTAs do not convert; they annoy.
- It opens with "Hope you're well!" and nothing else of substance.

## Quality Check Before Sending

- [ ] Could only this contact have received this message?
- [ ] Is the painful problem named in their words, not industry
      jargon?
- [ ] Is there exactly one ask? (Or, for Touch 2, no ask?)
- [ ] Is the message 7 sentences or fewer?
- [ ] Is the founder okay with this message appearing in a "worst
      cold outreach you got this week" screenshot?

If all five pass, send it.

## Logging

After every touch is sent, log the date and any reply against the
proof log at `assets/proof-capture-template.md`. The follow-up
sequence does not work without that loop.
````

### assets/intake-questions.md

````markdown
# Founder Intake Questions

The point of this intake is to reveal who the founder is for, the painful
problem they solve, what they already do for marketing, what proof they
have, and what audience they can actually reach. Fill it in before the
Day 1 ICP session.

If a question feels uncomfortable to answer, that is usually a sign it is
the right question. Write the honest answer, not the polished one.

> Time required: 30 to 45 minutes for the founder to complete on their
> own, plus a 60 to 90 minute follow-up conversation to sharpen the
> answers.

---

## 0. Founder And Business Snapshot

- Founder name
- Business name and brand(s) (if more than one)
- Founder role and how much of their week is marketing-related
- How long the business has been operating
- Approximate revenue stage (pre-revenue, sub-$100k, $100k-$500k, $500k+)
- Current team size and any roles that touch marketing today

## 1. Ideal Customer Profile (ICP)

The goal here is to get specific enough that a stranger could spot the
right buyer in the wild.

- Who is the ideal customer? Be specific: role, business type, business
  size, geography (if it matters), and stage.
- Who is explicitly not the ideal customer, even though they sometimes
  show up?
- What does a typical day look like for this customer?
- Where do they spend professional attention online? (LinkedIn, Facebook
  groups, YouTube, podcasts, industry forums, Slack communities)
- Where do they spend professional attention offline? (Local chamber,
  industry events, referrals, networking groups, faith or civic
  communities)
- If we had to pick one customer the founder has worked with who is the
  closest to "ideal," who is it and why?

## 2. The Painful Problem

- In one or two sentences, what is the painful problem the founder
  solves? Use plain language — no industry jargon, no buzzwords.
- What does this problem cost the customer? Money, hours, missed
  revenue, stress, reputation — whichever is most real.
- What does the customer usually try first before talking to the
  founder? What goes wrong with those attempts?
- What is the moment that makes the customer finally reach out? (A
  specific event, a quote, a deadline, an embarrassment)
- How urgent is this problem on a 1-to-5 scale today, and what would
  make it more urgent?

## 3. Current Offer

- What is the founder currently selling? List each offer with a one-line
  description.
- For each offer: price range, typical engagement length, who buys it
  most.
- Which offer does the founder most want more of right now?
- Which offer is the founder quietly tired of selling but has not
  retired yet?
- Is the offer the founder wants to sell the same offer the market is
  buying? If not, where is the gap?

## 4. Current Content And Outreach Pattern

Be honest. The point is to baseline reality, not to look good.

- Where does the founder currently publish? (LinkedIn, blog, newsletter,
  YouTube, podcast, X, IG, threads, TikTok, in-person)
- How often does the founder publish, in reality, across the last 8 to
  12 weeks? "I should be posting weekly" is not the answer; "I posted 4
  times in the last 12 weeks" is.
- What topics has the founder published on? Are they consistent or all
  over the map?
- Does the founder follow up with people who engage? How?
- How does the founder currently do outreach? (Manual messages, warm
  intros, referrals, cold lists, conference handshakes, none)
- What is the founder's last 30 days of outreach activity, honestly?
- What has stopped a previous attempt at consistent content or outreach?

## 5. Proof And Testimonials

- Who is the founder's best testimonial customer? Name them, even
  privately, and write down the result they got.
- What numbers are real? Time saved, revenue added, customers acquired,
  stress reduced, deadlines met.
- What case studies, before-and-after stories, or named results does
  the founder already have permission to talk about?
- Where does proof currently live? (LinkedIn recommendations, Google
  reviews, testimonials on a website, emails in inbox, screenshots in a
  folder, nowhere)
- Is there any high-value proof that exists but has never been shared
  publicly?

## 6. Tools Already In Use

The system should work with what the founder already pays for.

- Email and calendar platform (Microsoft 365, Google Workspace, other)
- CRM, if any (HubSpot, Notion, spreadsheet, none)
- Email marketing platform, if any (Mailchimp, Klaviyo, ConvertKit,
  Beehiiv, none)
- Social scheduling, if any (Buffer, Hootsuite, native, none)
- Calendar booking (Calendly, Cal.com, native, none)
- Content drafting tools (Claude, ChatGPT, Notion, Word, Google Docs)
- Any analytics setup (Google Analytics, LinkedIn analytics, native
  platform analytics)
- Any automation tools the founder already uses (Make.com, Zapier, n8n)
- Any tool the founder is paying for but does not use

The Founder Signal System does not require any of these. It just needs
to know what is already in the house so the cycle can use them.

## 7. Audience Sources

The thin slice only works if the founder has at least 25 people they can
plausibly reach in the first cycle.

- How big is the founder's email list, honestly? Engaged subset
  estimate?
- LinkedIn first-degree connections that match the ICP, roughly?
- Past clients who might be reactivatable?
- Past inquiries or "almost-closed" deals from the last 12 months?
- Past referral sources who have sent more than one customer?
- Communities the founder participates in actively?
- Anyone who has commented, liked, or replied to founder content in
  the last 90 days?

If the founder has fewer than 25 candidate names across all of those
buckets combined, name that fact early. The thin slice still helps, but
audience-building has to be added to the cycle.

## 8. Existing Constraints

- How many hours per week can the founder reliably spend on this for
  the next 6 weeks?
- Are there any topics, customers, industries, or stories the founder
  cannot publicly discuss? (NDAs, regulated industries, family-related
  reasons, competitive reasons)
- Are there any platforms the founder will not use? Why?
- Are there any tools the founder will not buy? Why?
- Is there a specific revenue or pipeline goal driving this push? When?

## 9. Founder Point Of View

This is the section most founders skip. It is the section that makes
the rest of the system stop sounding like everyone else.

- What is one thing the founder believes about their industry, market,
  or customer that most peers will not say out loud?
- What is a "popular advice" in the industry the founder thinks is
  wrong?
- What has the founder learned the hard way that they wish someone had
  told them earlier?
- What recurring frustration with the industry shows up in the
  founder's conversations with clients?
- What does the founder explicitly stand for? What do they refuse to
  do?

## 10. What Counts As A Qualified Conversation

This becomes the operational definition the system uses to decide which
replies matter.

- Job title or role match
- Business size or stage match
- Budget signal (explicit budget mentioned, prior spend, or implicit
  fit with the offer's price band)
- Timing signal (problem is urgent within 30 to 90 days)
- Pain match (the specific painful problem this offer solves shows up
  in their words)

Write the founder's qualification criteria in one paragraph. This will
be used to sort the proof log every cycle.

---

## Output

After this intake is filled in, summarize it into a one-page signal
brief covering:

1. Who this is for
2. Who this is not for
3. The painful problem (in customer words)
4. The desired outcome
5. Urgency driver
6. Current offer being sold and at what price band
7. Founder POV (one sentence)
8. What counts as a qualified conversation
9. Top 3 audience sources for the next cycle
10. Constraints to respect

The signal brief is the input to every cycle that follows.
````

### assets/proof-capture-template.md

````markdown
# Proof Capture Template

The single most important artifact in the Founder Signal System. The
cycle is not real if it does not produce a populated proof log. Every
signal — even small ones — gets captured here.

The proof log feeds three things:

1. The next cycle's content brief (what message and topic to push on)
2. The next cycle's outreach list (who replied, who referred, who to
   revisit)
3. The founder's own confidence that the work is actually moving the
   business

Run this template every cycle. Do not skip it because "nothing
happened." Capturing the fact that nothing happened is also signal.

---

## Cycle Header

- Cycle ID:
- Cycle dates: (start) to (end)
- Cycle length: weekly / biweekly
- Linked content brief:
- Linked outreach list:
- Operator filling out the log:

## 1. Reply Log

Capture every reply that came in during the cycle, regardless of
channel. One row per reply.

| Date | Contact | Channel | Touch # | Bucket | Reply Summary (1-2 lines) | Next Action |
| --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  | Interested / Not now / Referral / Objection / Other |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |

Buckets:

- **Interested** — real signal, wants to talk or learn more
- **Not now** — confirms relevance, wrong timing
- **Referral** — points to someone else
- **Objection** — pushes back, raises a real concern
- **Other** — anything that does not fit but is worth keeping

## 2. Objections Captured

Objections are content, not failures. Each unique objection gets
written down in the contact's own words.

| Date | Contact / Anonymized | Objection (exact wording) | Underlying belief or fear |
| --- | --- | --- | --- |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |

For each objection: is this a content piece for the next cycle? If
yes, mark it and pull it into the next content brief's "founder POV"
or "painful problem" sections.

## 3. Referrals Received

| Date | Sent By | Referral Name | Referral Context | Permission to Mention Sender? | Reach-Out Status |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  | Yes / No |  |
|  |  |  |  |  |  |

Thank-you sent to referrer within 24 hours? Track here:

- [ ] Yes
- [ ] No (and reason)

## 4. Testimonials And Reviews

From MKT-04 triggers: client NPS ≥ 9, first major deliverable approved,
30-day or 90-day milestone, engagement concluded.

| Date | Source / Customer | Trigger | Format Captured (quote, email screenshot, recorded call, review link) | Permission To Use Publicly? | Where Filed |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  | Yes / No / Pending |  |
|  |  |  |  |  |  |

Action items:

- [ ] Any new testimonial needs a "thank you" follow-up
- [ ] Any quote with permission needs to be filed in the proof
      library (founder's chosen folder, website testimonials page,
      LinkedIn recommendations, Google reviews)

## 5. Content Topics With Traction

For each piece published this cycle, capture what happened. Numbers
help, but plain observation matters more.

| Piece | Channel | Pillar | Engagement (likes / comments / replies / DMs) | Notable comment, DM, or quote | Worth a sequel? |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  | Yes / No / Maybe |
|  |  |  |  |  |  |
|  |  |  |  |  |  |

Pick **the one piece that pulled the most**:

- Title / topic:
- Why the founder thinks it landed (one sentence guess, not a
  thesis):
- Could this become the anchor for the next cycle?

## 6. Inbound Signals

Things that happened because of the work but were not direct replies
to outreach.

- New profile views, follows, or subscriptions:
- People who saved, shared, or quoted content:
- Random "saw your post" messages from non-list contacts:
- People asking unrelated questions because the founder showed up in
  their feed:
- Any unexpected channel that picked up the content (newsletter
  reshare, podcast mention, conference invite):

## 7. What Did Not Happen

Honest. Sometimes useful.

- Pieces that were drafted but never published:
- Outreach touches that were scheduled but skipped:
- Replies that were left unanswered for more than 48 hours:
- Anything the founder noticed they were avoiding:

## 8. Next Experiment

Translate the signals above into one explicit change for the next
cycle. Pick one variable, not three. The system gets better through
focused iteration, not redesign.

- The one thing changing next cycle:
  - [ ] Same audience, sharper message
  - [ ] Same message, different channel
  - [ ] Same message, smaller outreach list, deeper personalization
  - [ ] Different offer
  - [ ] Different content pillar emphasis
  - [ ] Something else (specify):
- Why:
- How we will know it worked:
- What we are explicitly not changing:

## 9. Founder Confidence Check

A one-line, one-question reading on how the founder feels about the
system this cycle. Use a 1-to-5 scale.

- This cycle, how confident is the founder that the marketing work is
  moving the business? (1 = no idea, 5 = clearly working)
- What is one thing that would move that number up by one point next
  cycle?

If the founder's confidence stays at 1 or 2 for three consecutive
cycles without a clear blocker (e.g., the founder did not run the
cycle at all), revisit the signal brief. Something upstream is wrong.

## 10. Tasks Carried Forward

Anything that did not get done this cycle but should not get lost.

| Item | Owner | Target Cycle | Notes |
| --- | --- | --- | --- |
|  |  |  |  |
|  |  |  |  |

---

## Storage And Cadence

- Save each cycle's proof log next to that cycle's content brief and
  outreach list. Suggested filename:
  `proof-log-2026-W19.md` or `proof-log-2026-05-15.md`.
- Roll up every 3 cycles into a brief "cycle review" note: top
  patterns across the period, message changes, and outreach
  conversion observations.
- Roll up every 6 cycles into a decision on the next adjacent
  workflow to add (MKT-08 social, MKT-07 paid, MKT-09 events, or a
  full MKT-02 nurture library).

The point of the proof log is not the log. The point is that the
founder stops guessing.
````

### automation/Founder-Signal-System-Make-Blueprint.json

````json
{
  "name": "Founder Signal System: Intake to Signal Brief (Make.com Blueprint)",
  "description": "Standard-tier scenario build spec for the Founder Signal System. This file documents the intended modules and mappings, but it is not a Make.com-importable blueprint because Make requires platform-generated module identifiers.",
  "status": "draft",
  "importableInMake": false,
  "buildInstructions": "Use make-public-template-publisher-checklist.md to rebuild this manually in the Make.com scenario editor. Do not import this JSON directly.",
  "version": "0.1.0-draft",
  "flow": [
    {
      "id": 1,
      "module": "webhook:webhooks",
      "version": 1,
      "parameters": {
        "hook": "FOUNDER_INTAKE_WEBHOOK"
      },
      "mapper": {},
      "metadata": {
        "designer": {
          "x": 0,
          "y": 0
        },
        "notes": "Receives one founder intake submission. Expected fields: founder_name, email, company, offer, ideal_customer, painful_problem, desired_outcome, proof_points, exclusions, primary_channel, notification_email."
      }
    },
    {
      "id": 2,
      "module": "openai:createCompletion",
      "version": 1,
      "parameters": {
        "model": "gpt-4o-mini"
      },
      "mapper": {
        "messages": [
          {
            "role": "system",
            "content": "You are the Founder Signal System setup assistant for Uncle Robert Consulting. Create practical, buyer-ready setup outputs from the founder intake. Keep the founder's voice human. Do not invent proof. Do not recommend paid ads, large-list automation, or a website rebuild."
          },
          {
            "role": "user",
            "content": "Create a Founder Signal setup packet from this intake. Return sections titled Signal Brief, Content Cycle Prompt, Outreach Angle, Three-Touch Follow-Up Draft, Proof Loop Fields, and Next Cycle Question.\n\nFounder: {{1.founder_name}}\nEmail: {{1.email}}\nCompany: {{1.company}}\nOffer: {{1.offer}}\nIdeal customer: {{1.ideal_customer}}\nPainful problem: {{1.painful_problem}}\nDesired outcome: {{1.desired_outcome}}\nProof points: {{1.proof_points}}\nExclusions: {{1.exclusions}}\nPrimary channel: {{1.primary_channel}}"
          }
        ]
      },
      "metadata": {
        "designer": {
          "x": 300,
          "y": 0
        },
        "notes": "Generates the first signal brief and operating prompts. Buyer must review before publishing or sending outreach."
      }
    },
    {
      "id": 3,
      "module": "hubspot:createUpdateContact",
      "version": 1,
      "parameters": {},
      "mapper": {
        "email": "{{1.email}}",
        "properties": [
          {
            "property": "firstname",
            "value": "{{1.founder_name}}"
          },
          {
            "property": "company",
            "value": "{{1.company}}"
          },
          {
            "property": "lifecyclestage",
            "value": "lead"
          },
          {
            "property": "founder_signal_status",
            "value": "Setup packet drafted"
          },
          {
            "property": "founder_signal_primary_channel",
            "value": "{{1.primary_channel}}"
          }
        ]
      },
      "metadata": {
        "designer": {
          "x": 600,
          "y": -170
        },
        "notes": "Optional CRM-lite update. Remove or disable this module if the buyer does not use HubSpot."
      }
    },
    {
      "id": 4,
      "module": "microsoft365email:sendEmail",
      "version": 1,
      "parameters": {},
      "mapper": {
        "to": "{{ifempty(1.notification_email; 1.email)}}",
        "subject": "Founder Signal setup packet for {{1.company}}",
        "body": "Founder Signal setup packet\n\n{{2.choices[0].message.content}}\n\nReview before publishing content or sending outreach. Keep the first outreach batch to 10-25 named contacts and three total touches."
      },
      "metadata": {
        "designer": {
          "x": 600,
          "y": 170
        },
        "notes": "Optional Microsoft 365 notification. Replace with Gmail, Slack, Teams, or manual output if needed."
      }
    },
    {
      "id": 5,
      "module": "microsoft365excel:addRow",
      "version": 1,
      "parameters": {
        "workbook": "FOUNDER_SIGNAL_TRACKER",
        "worksheet": "Proof Loop"
      },
      "mapper": {
        "date": "{{now}}",
        "founder": "{{1.founder_name}}",
        "company": "{{1.company}}",
        "email": "{{1.email}}",
        "status": "Setup packet drafted",
        "primary_channel": "{{1.primary_channel}}",
        "next_action": "Review signal brief, publish first content asset, send first 5 outreach messages",
        "setup_packet": "{{2.choices[0].message.content}}"
      },
      "metadata": {
        "designer": {
          "x": 900,
          "y": 0
        },
        "notes": "Optional Microsoft 365 tracker row. This supports the proof loop without forcing a paid CRM."
      }
    }
  ],
  "metadata": {
    "version": 1,
    "scenario": {
      "roundtrips": 1,
      "maxErrors": 3,
      "autoCommit": true,
      "sequential": false,
      "confidential": false,
      "dataloss": false,
      "freshVariables": false
    },
    "notes": "Draft blueprint for building the Make.com public sharing scenario. Before market use, import or recreate in Make.com, validate module IDs and mappings, replace placeholder workbook/sheet values, publish a public sharing link, and update template.md."
  }
}
````

### automation/make-public-template-publisher-checklist.md

````markdown
# Make.com Public Template Publisher Checklist

Use this checklist to convert the Founder Signal System Standard-tier draft
into the live Magic Template Link referenced in `../template.md`.

## Source Artifact

- Draft blueprint:
  `automation/Founder-Signal-System-Make-Blueprint.json`
- Buyer-facing link file:
  `template.md`

Important: `Founder-Signal-System-Make-Blueprint.json` is a build spec, not a
Make.com-importable export. Do not import it directly. Hand-authored module
slugs such as `openai:createCompletion` may show as "Module Not Found" in
Make. Build the scenario from a blank canvas using the steps below, then use
Make's own public sharing link as the buyer-facing Magic Template Link.

## Current Test Status

Logged: 2026-05-17

- Scenario manually rebuilt in Make.com after direct JSON import showed
  "Module Not Found."
- Tally trigger test: passed.
- Gmail output node test: passed.
- OpenAI node: reachable and mapped, but blocked by OpenAI account error
  `[429] You have consumed all credits in your OpenAI account, or exceeded
  your monthly OpenAI budget.`
- Scenario status: built, not enabled.
- Next action: restore OpenAI credits or raise monthly budget, rerun one full
  sequence test, then turn on the scenario and generate the public sharing
  link.

## Publish Steps

1. In Make.com, create a new scenario named:
   `Founder Signal System — Intake to Signal Brief`.
2. Rebuild the modules from
   `Founder-Signal-System-Make-Blueprint.json`. Do not import the JSON.
3. Confirm the trigger is a custom webhook or intake source the buyer can
   connect easily.
4. Add setup notes to every module so a buyer understands what to connect,
   what to customize, and which optional modules can be deleted.
5. Validate the OpenAI module with a test intake that contains no sensitive
   client data.
6. Validate optional HubSpot behavior:
   - creates or updates one contact
   - marks `founder_signal_status`
   - does not overwrite existing deal or customer records
7. Validate optional Microsoft 365 behavior:
   - sends the setup summary to the notification address
   - writes one row to the tracker if the buyer has configured it
8. Disable or clearly label optional modules before publishing if they require
   accounts not included in the Standard package.
9. Save the scenario.
10. Use Make.com's scenario sharing flow:
    - click **Share** in the scenario builder
    - enable **Public sharing link**
    - copy the generated link
11. Paste the link into `../template.md`, replacing
    `PENDING_MAKE_PUBLIC_SHARING_LINK`.
12. Run one install test from the link in a separate Make.com account or team.
13. Record the final test result in change control before calling the package
    ready for Standard-tier sale.

## Test Intake

Use this non-sensitive test data:

| Field | Value |
| --- | --- |
| founder_name | Jordan Lee |
| email | jordan@example.com |
| company | Bright Harbor Ops |
| offer | Operations cleanup sprint for small service businesses |
| ideal_customer | Founder-led service business with 3-15 employees |
| painful_problem | Work is spread across inboxes, spreadsheets, and memory |
| desired_outcome | One weekly operating rhythm and one clean lead follow-up tracker |
| proof_points | Reduced missed follow-ups; created one shared owner dashboard |
| exclusions | Not for venture-backed teams replacing their full CRM |
| primary_channel | LinkedIn |
| notification_email | jordan@example.com |

## Acceptance Criteria

- The public link opens a Make.com preview page.
- **Use this scenario** copies the scenario into another Make.com account.
- The scenario prompts for required app connections.
- A test run creates a useful setup packet without exposing secrets.
- Optional HubSpot and Microsoft 365 modules can be configured or removed
  without breaking the core intake-to-brief path.
- `template.md` contains the real link and no placeholder text.

## Do Not Claim

Do not claim the Magic Template Link is live, certified, or fully wired until
the link has been generated in Make.com and tested from a second account.
````

### automation/make-scenario-manual-build.md

````markdown
# Founder Signal System — Make.com Manual Build

Use this when Make.com shows "Module Not Found" after importing the draft JSON.
That error means the scenario should be rebuilt manually from a blank canvas.

## Recommended Free-Tier Scenario

Keep the first live version to three modules:

1. **Tally — Watch New Responses** or **Webhooks — Custom webhook**
2. **OpenAI — Generate a response** or **OpenAI — Create a Completion**
3. **Gmail / Outlook / Google Sheets — Send summary or add row**

Skip HubSpot and Microsoft 365 Excel for the first working version unless those
connections are already active in the Make account. The goal is to get one
working Magic Template Link before adding optional CRM outputs.

## Module 1 — Intake Trigger

Preferred if Tally is already connected:

- App: `Tally`
- Module: `Watch New Responses`
- Form: Founder Signal intake form

Fallback:

- App: `Webhooks`
- Module: `Custom webhook`
- Webhook name: `Founder Signal Intake`

Full-package expected fields:

- `founder_name`
- `email`
- `company`
- `offer`
- `ideal_customer`
- `painful_problem`
- `desired_outcome`
- `proof_points`
- `exclusions`
- `primary_channel`
- `notification_email`

Current Tally v1 fields:

- Event ID
- Response Submission ID
- Respondent ID
- Form ID
- Form Name
- Created At
- First name
- Last name
- Work email
- Company name
- Current monthly revenue
- #1 goal for the next 90 days

Use the current Tally v1 fields for the first working scenario. The missing
fields can be inferred lightly by the OpenAI module and then confirmed by a
human before outreach.

## Module 2 — OpenAI Setup Packet

- App: `OpenAI`
- Module: Prefer `Generate a response`
- Alternate module name: `Create a Completion`
- Model: `gpt-4o-mini`, or the lowest-cost reliable chat model available

Make.com's OpenAI module names vary by workspace and connector version. If
`Generate a response` exists, use it. If it does not, use `Create a Completion`.
Do not look for `Create a Chat Completion`; many current Make workspaces do not
show that exact label.

Instructions / system message:

```text
You are the Founder Signal System setup assistant for Uncle Robert Consulting. Create practical, buyer-ready setup outputs from the founder intake. Keep the founder's voice human. Do not invent proof. Do not recommend paid ads, large-list automation, or a website rebuild.
```

Prompt / user message:

```text
Create a Founder Signal setup packet from this intake. Return sections titled Signal Brief, Content Cycle Prompt, Outreach Angle, Three-Touch Follow-Up Draft, Proof Loop Fields, and Next Cycle Question.

Founder: {{First name}} {{Last name}}
Email: {{Work email}}
Company: {{Company name}}
Current monthly revenue: {{Current monthly revenue}}
Primary 90-day goal: {{#1 goal for the next 90 days}}
Form: {{Form name}}
Submitted at: {{Created at}}

Because this intake does not include offer, ideal customer, proof points, exclusions, or primary channel, infer only a tentative draft from the company name, revenue range, and 90-day goal. Clearly label any inferred section as "Needs founder confirmation." Default the primary channel to LinkedIn unless the goal implies otherwise.
```

Map each `{{field}}` from Module 1. If the module has a single prompt field
instead of separate system/user messages, paste the system message first, then
paste the user message below it in the same field.

## Module 3 — Output

Choose one output for the first version.

### Option A — Email Summary

- App: `Gmail` or `Microsoft 365 Email`
- Module: `Send an email`
- To: `notification_email`, falling back to `email`
- Subject: `Founder Signal setup packet for {{company}}`
- Body: OpenAI response text from Module 2

### Option B — Google Sheets Tracker

- App: `Google Sheets`
- Module: `Add a Row`
- Sheet: `Founder Signal Tracker`
- Columns:
  - Date
  - Founder
  - Company
  - Email
  - Primary Channel
  - Status
  - Setup Packet
  - Next Action

## Enablement Checklist

- [ ] Delete the failed imported scenario or remove all "Module Not Found" modules.
- [ ] Build the three-module version from a blank scenario.
- [ ] Submit one test Tally response or webhook payload.
- [ ] Confirm the OpenAI output includes all six required sections.
- [ ] Confirm the email or tracker row is created.
- [ ] Save the scenario.
- [ ] Turn the scenario on.
- [ ] Click **Share** and enable the public sharing link.
- [ ] Paste the link into `../template.md`.

## Common Test Errors

### OpenAI 429 — Credits Or Monthly Budget Exhausted

If Make returns:

```text
[429] You have consumed all credits in your OpenAI account, or exceeded your monthly OpenAI budget.
```

the scenario mapping is probably working. The OpenAI account connected to Make
cannot run the request until billing credits or the monthly budget are fixed.

Options:

- Add credits or raise the monthly budget in the OpenAI platform billing
  settings, then rerun the same Make test.
- Temporarily swap the OpenAI module for another connected AI provider already
  available in Make.
- Keep the scenario off and use the manual Markdown fallback until billing is
  restored.

Do not enable the public Magic Template Link until one OpenAI test run succeeds.

## Later Optional Modules

After the link works, add optional HubSpot or Microsoft 365 tracker modules.
Do not add them before the first public link test unless they are already
connected and easy to validate.
````

### automation/n8n-v1-runtime-handoff.md

````markdown
# n8n V1 Runtime Handoff — Founder Signal System

Date: 2026-05-17
Status: preferred v1 runtime
Related Make status: built but not enabled; Make free plan blocks activation

## Decision

Use local self-hosted n8n as the v1 runtime for the Founder Signal System.

Make.com remains useful as a future Standard-tier public-template path, but it
is not the right active runtime while the free account blocks activation and
OpenAI credits are exhausted.

## Why n8n

- Local n8n is already running.
- MKT-06 workflow exists in n8n and was tested recently.
- The repo already carries an importable MKT-06 n8n template:
  `mkt-06-content-creation-dissemination/n8n/mkt-06-content-creation-dissemination.workflow.json`
- n8n avoids Make.com's free active-scenario limit.
- n8n aligns with the current workflow certification path and evidence-log
  discipline.

## Existing Asset To Reuse

Use the existing n8n workflow as the starting pattern:

- n8n workflow name observed by Robert: Workflow 06 / MKT-06
- Repo template:
  `mkt-06-content-creation-dissemination/n8n/mkt-06-content-creation-dissemination.workflow.json`
- Known live-node status from MKT-06 README:
  HubSpot read-only attribution check has already been validated against local
  self-hosted n8n.

## Current n8n Workflow Inventory

Observed in local n8n on 2026-05-17:

| Workflow | Observed Role | Status / Notes |
| --- | --- | --- |
| `MKT-06 - Content Creation & Dissemination` | Main MKT-06 package template | Imported and nominally tested; still needs node-by-node certification before being treated as fully certified. Do not disturb while building Founder Signal. |
| `Automated AI Lead Enrichment: Hubspot to Explorium for Enhanced Prospect Data` | Lead enrichment reference workflow | Useful as a HubSpot/enrichment pattern, but not the v1 Founder Signal runtime. Keep separate. |
| `MKT-06 TEST - HubSpot Attribution Read Check` | Isolated HubSpot read test | Keep as a service credential/read-node validation harness. This supports certification evidence. |
| `My workflow` | n8n starter AI-agent example | Appears to be the only active/live workflow. Treat as a sandbox/tutorial workflow unless Robert confirms it is serving a real process. |

Working rule: create a new separate workflow named
`Founder Signal System - Intake to Setup Packet`. Do not modify the imported
MKT-06 workflow or the HubSpot test harness for this v1 intake automation.

## Founder Signal Workflow Creation Log

Logged: 2026-05-17

- New n8n workflow created:
  `Founder Signal System - Intake to Setup Packet`
- Local URL observed:
  `http://localhost:5678/workflow/JV3uEgRsFkTnGUJM`
- Initial state: blank canvas, not published.
- Next build target: Tally or webhook trigger, normalize fields, AI setup
  packet, Gmail/Outlook output.
- Tally n8n plugin installed.
- Tally trigger configured and test-triggered successfully.
- Next node: `Normalize Founder Intake`.
- Local networking prevents Tally cloud from reliably reaching localhost n8n
  without a public tunnel, so the v1 proof path was switched to a clickable
  manual trigger.
- Manual trigger skeleton tested successfully through two Edit Fields nodes:
  normalized intake placeholder and setup packet placeholder.
- Gmail output is deferred because self-hosted n8n requires a custom Google
  Cloud OAuth2 single-service credential with Client ID and Client Secret.
  For the immediate v1 proof, use a local/log/placeholder output before adding
  Gmail.
- Manual-trigger v1 skeleton execution passed successfully after adding the
  final local review output. Current proven path: clickable trigger to
  normalized intake placeholder to setup packet placeholder to final review
  output.

## Founder Signal V1 Shape

Build or clone a small workflow with this shape:

1. **Tally trigger or webhook intake**
   - Capture the current Tally v1 fields:
     - First name
     - Last name
     - Work email
     - Company name
     - Current monthly revenue
     - #1 goal for the next 90 days
     - Form name
     - Created at
2. **AI setup packet node**
   - Generate:
     - Signal Brief
     - Content Cycle Prompt
     - Outreach Angle
     - Three-Touch Follow-Up Draft
     - Proof Loop Fields
     - Next Cycle Question
   - Missing offer, ideal customer, proof points, exclusions, and primary
     channel should be labeled `Needs founder confirmation`.
3. **Gmail or Outlook summary**
   - Send the setup packet internally for review.
4. **Optional tracker row**
   - Add a row to Google Sheets, Microsoft Excel, or Microsoft Lists.

## AI Prompt

```text
Create a Founder Signal setup packet from this intake. Return sections titled Signal Brief, Content Cycle Prompt, Outreach Angle, Three-Touch Follow-Up Draft, Proof Loop Fields, and Next Cycle Question.

Founder: {{First name}} {{Last name}}
Email: {{Work email}}
Company: {{Company name}}
Current monthly revenue: {{Current monthly revenue}}
Primary 90-day goal: {{#1 goal for the next 90 days}}
Form: {{Form name}}
Submitted at: {{Created at}}

Because this intake does not include offer, ideal customer, proof points, exclusions, or primary channel, infer only a tentative draft from the company name, revenue range, and 90-day goal. Clearly label any inferred section as "Needs founder confirmation." Default the primary channel to LinkedIn unless the goal implies otherwise.
```

## Activation Rule

Keep the n8n workflow inactive until:

- Tally/webhook intake receives one test submission.
- AI node returns all six sections.
- Gmail/Outlook or tracker output succeeds.
- The test uses non-sensitive sample data.

Once all four pass, n8n can become the active v1 runtime for the package.

## Package Positioning

- Manual tier: Markdown templates in `assets/`
- V1 automation runtime: n8n self-hosted workflow
- Deferred Standard-tier template: Make.com public sharing link after paid
  activation and OpenAI billing are restored
````
