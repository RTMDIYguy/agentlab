---
schema: kit/1.0
slug: ful-04-feedback-testimonials
title: "FUL-04 - Feedback & Testimonials"
summary: "Fulfillment workflow package for Feedback & Testimonials. Consolidates registry metadata, imported source references, setup guidance, validation notes, and automation blueprints into one operative kit file."
version: 0.1.0-draft
owner: uncle-robert-consulting
license: UNLICENSED
status: imported-draft
conformance: draft
certifiedAt: null
workflowId: FUL-04
department: "Fulfillment"
automationLevel: "85-90%"
primaryOwner: "Marcus + Account Manager"
trigger: "Automated multi-touch lifecycle triggers"
cycleTime: "Collection: continuous; case study: 1-2 weeks"
sourceStatus: "Imported source"
changeLog:
  - date: 2026-05-21
    changeId: CC-2026-05-21-013
    version: 0.1.0-draft
    type: consolidation
    summary: Converted imported workflow package into a single operative kit.md with source map, quickstart, setup, validation, certification gaps, and embedded automation blueprint when available.
    author: codex
tags:
  - workflow-package
  - ful
  - fulfillment
---

# FUL-04 - Feedback & Testimonials

This is the consolidated `kit.md` for the workflow. It replaces the old imported-package surface as the operative file while keeping source, asset, tracker, and automation files as provenance until certification is complete.

## Goal

Run the Feedback & Testimonials workflow for Fulfillment with a repeatable trigger, owner, cycle time, outputs, and validation path. The current draft is strong enough for agent orientation and controlled internal use; certification still requires a live run or documented manual evidence.

## When to Use

Use this workflow when the trigger occurs: **Automated multi-touch lifecycle triggers**.

Use it as part of the URC operating system first. Convert it into a client-safe variant only after URC-specific names, internal assumptions, and tool choices have been scrubbed or intentionally parameterized.

## Registry Metadata

| Field | Value |
| --- | --- |
| Workflow ID | FUL-04 |
| Department | Fulfillment |
| Automation level | 85-90% |
| Owner | Marcus + Account Manager |
| Trigger | Automated multi-touch lifecycle triggers |
| Cycle time | Collection: continuous; case study: 1-2 weeks |
| Source status | Imported source |

## Inputs

- Trigger event or planning cadence identified above.
- Current URC operating context for Fulfillment.
- Any imported source, asset, tracker, or automation artifacts listed in the Source Map.
- Human approval from the owner before external sends, money movement, access changes, or client-visible commitments.

## Setup

1. Read this kit end to end.
2. Review the Source Digest and Source Map below.
3. Bind any placeholders listed in Placeholder and Binding Notes.
4. If an automation blueprint is embedded, import or rebuild it in the chosen runtime only after credentials and fallback paths are confirmed.
5. Run the Validation checklist before treating the workflow as complete.

## Quickstart

1. Confirm the trigger: Automated multi-touch lifecycle triggers.
2. Open the relevant source or asset file from the Source Map.
3. Collect the minimum inputs needed for this cycle.
4. Execute the workflow steps using the imported source as the detailed operating guide.
5. Capture output evidence, exceptions, and follow-up tasks.
6. Record meaningful package or behavior changes in `docs/operations/change-control-register.md`.

## Source Digest

- `URC-FUL-04_Feedback_Testimonials.md`: Source file imported and retained for detailed workflow extraction.

## Source Map

| Artifact | Purpose |
| --- | --- |
| `source/URC-FUL-04_Feedback_Testimonials.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `automation/FUL04-Feedback-Testimonials-Blueprint.json` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `trackers/FUL-04_Feedback_Testimonials_Tracker.xlsx` | Retained provenance/input artifact now referenced by this consolidated kit. |

## Embedded Source and Asset Documents

### source/URC-FUL-04_Feedback_Testimonials.md

````markdown
# FUL-04 - Feedback & Testimonials Source

Source: `Fulfillment Department\URC Fulfillment\URC-FUL-04_Feedback_Testimonials.docx`

This Markdown file is a text extraction of the source `.docx` for GitHub-readable access. Preserve the source path in citations until the workflow is fully converted into `kit.md` format.

UNCLE ROBERT CONSULTING LLC

URC-FUL-04 — Feedback & Testimonials

Systematic Collection, Honest Processing, and Strategic Deployment of Social Proof

Robert T. McCarthy & Sheena Burns   |   v1.0   |   March 23, 2026

1. Why This Workflow Exists

Social proof is one of the most powerful sales tools a small agency has. A genuine testimonial from Jeff Holmes about what URC built for Holmes Media is worth more than any marketing copy Robert could write himself. This workflow defines how URC asks for feedback systematically, captures testimonials respectfully, and deploys social proof in a way that builds trust with prospects.

At URC's current stage, every satisfied client is a potential case study. The discipline of asking — consistently, at the right time, in the right way — is what turns a satisfied client into a referral machine.

2. The Four Feedback Touchpoints

Touchpoint

When

Format

What You're Measuring

30-Day Pulse

30 days after engagement start

3-question personal email

Onboarding experience, first impression, clarity of communication

Post-Deliverable

Within 48 hours of major deliverable delivery

3 questions in follow-up email

Quality of the deliverable, usefulness, any gaps

Quarterly NPS

Every 90 days for active clients

Single NPS question + one open comment

Overall satisfaction and likelihood to refer

Offboarding / Renewal

At end of project or before renewal conversation

5-question Google Form + optional call

Full satisfaction review, outcomes achieved, what could have been better

The 30-Day Pulse Email

Subject: Quick check — how are we doing?

Hi [Name],

We're about a month in and I wanted to ask you three honest questions:

1. How has the onboarding experience felt so far — anything confusing or unclear?

2. Do you feel like you understand what we're building and why?

3. Is there anything you expected that you haven't seen yet?

You can reply right here — no form, no survey. Just tell me what's on your mind.

— Robert

3. The Testimonial Request

The right time to ask for a testimonial is the moment a client expresses genuine satisfaction — not at the end of a project as a formality, but in response to a real win. When a client says something like 'This is exactly what I needed' or 'I can't believe how much time this saves' — that is the moment to ask.

The Ask

'I'm really glad this has been working for you. Can I ask a favor?

I'm building my client portfolio and genuine testimonials from people I've worked with

make a real difference. Would you be willing to share a few sentences about

your experience working with me?

I can take it however is easiest for you —

a quick written note, a LinkedIn recommendation, or even a short Loom video

if you're up for it. Completely your call.'

Testimonial Eligibility — Ask When:

NPS score of 9 or 10 received in any survey

Client says something spontaneously positive in an email or call

Client refers someone — they have clearly demonstrated trust

Project is completed and outcomes were delivered

Follow-Up If No Response

5 days after asking: one gentle follow-up — 'No pressure at all — just wanted to make sure my message didn't get buried.'

10 days after asking with no response: let it go. Do not ask a third time.

4. Case Study Development

A testimonial is a quote. A case study is a story. Case studies are the most powerful sales tool URC has because they show a prospect exactly what the journey looked like — the problem, the process, and the outcome.

Case Study Candidate Criteria

Client achieved a measurable outcome — leads increased, time saved, revenue impact

Client is willing to be named and quoted (always ask permission explicitly)

The engagement represents a service tier or client type URC wants to attract more of

The Case Study Structure

Section

What It Contains

Length

Client Background

Who they are, what they do, how big the business is

2–3 sentences

The Challenge

What problem they were facing before URC — in their own words if possible

3–4 sentences

The Solution

What URC built specifically — not generic, but the actual deliverables

4–5 sentences

The Process

How the engagement worked — discovery, build, delivery, training

3–4 sentences

The Results

Measurable outcomes — leads captured, time saved, revenue impact, client quote

4–5 sentences + direct quote

Client Quote

A direct testimonial from the client — in bold, attributed with name and business

1–3 sentences

Holmes Media — First Case Study

Jeff and April Holmes are URC's anchor relationship and the most natural first case study. When the timing is right — after a measurable win has been achieved — Robert asks for permission to document their experience. This becomes the foundation of URC's social proof library.

5. Negative Feedback Protocol

Negative feedback is more valuable than positive feedback — it tells you exactly where the gap is. The protocol for handling it is simple:

Acknowledge within 2 hours — never let negative feedback sit

Thank them for telling you — most unhappy clients don't say anything, they just leave

Understand before fixing — ask one clarifying question before proposing a solution

Fix it and follow up — deliver the remedy, then check in 7 days later

Document the root cause — what systemic change prevents this from happening again?

IMPORTANT: Negative feedback is never published, shared, or used in any way.

It feeds directly into process improvement and nothing else.

A client who gives honest negative feedback and sees it acted on becomes

one of the most loyal clients you'll ever have.

6. Deploying Social Proof

Collecting testimonials means nothing if they don't appear where prospects can find them. This is the deployment map for URC's social proof:

Asset

Where It Goes

Format

Written testimonial

URC website, proposal documents, LinkedIn profile

Quote with name and business

LinkedIn recommendation

Robert's LinkedIn profile — request directly on LinkedIn

Native LinkedIn format

Case study

URC website, sent to warm prospects, YC application

One-page PDF using URC template

Video testimonial (if offered)

URC website, LinkedIn post

Loom or short video, 60–90 seconds

NPS scores (aggregate)

Referenced in proposals and investor conversations

'Average NPS of X across active clients'

7. Horizon 2 — Feedback at Scale

VISION

Feedback surveys automated — trigger fires on deliverable completion, 30-day mark, and quarterly.

AI scans all client communications for positive sentiment signals and flags testimonial opportunities.

Case study drafts auto-generated from engagement history — Robert reviews and approves.

Social proof library maintained automatically — new testimonials formatted and categorized on approval.

NPS trends surfaced in the weekly operations report — no manual aggregation required.

8. Review Cadence

Testimonial pipeline: reviewed monthly — any new wins worth capturing?

Case study library: updated whenever a new project closes with measurable outcomes

Feedback trends: reviewed quarterly — any recurring themes in what clients praise or flag?

## Owner: Robert T. McCarthy

Version

Date

Author

Summary

v1.0

March 23, 2026

R. McCarthy & S. Burns

Initial URC Fulfillment document — built from actual operations
````

### automation/FUL04-Feedback-Testimonials-Blueprint.json

````json
{
  "name": "FUL04: NPS Survey & Testimonial Capture (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "stripe:watchPayments",
      "version": 1,
      "parameters": {
        "event": "invoice.paid"
      },
      "mapper": {},
      "metadata": {
        "designer": {
          "x": 0,
          "y": 0
        }
      }
    },
    {
      "id": 2,
      "module": "builtin:Sleep",
      "version": 1,
      "parameters": {
        "duration": 604800,
        "note": "7-day delay after final payment before sending NPS survey"
      },
      "mapper": {},
      "metadata": {
        "designer": {
          "x": 300,
          "y": 0
        }
      }
    },
    {
      "id": 3,
      "module": "email:sendEmail",
      "version": 1,
      "parameters": {},
      "mapper": {
        "to": "{{1.customer.email}}",
        "subject": "How did we do? — {{1.metadata.projectName}}",
        "body": "Hi {{1.customer.name}},\n\nNow that your {{1.metadata.projectName}} workflow is live, we would love to hear how the experience went.\n\nIt takes 60 seconds: {{YOUR_NPS_FORM_URL}}\n\nThank you for trusting Uncle Robert Consulting.\n\n— Robert"
      },
      "metadata": {
        "designer": {
          "x": 600,
          "y": 0
        }
      }
    },
    {
      "id": 4,
      "module": "google-forms:watchResponses",
      "version": 1,
      "parameters": {
        "formId": "YOUR_NPS_FORM_ID"
      },
      "mapper": {},
      "metadata": {
        "designer": {
          "x": 0,
          "y": 300
        },
        "note": "Separate trigger branch for incoming NPS responses"
      }
    },
    {
      "id": 5,
      "module": "builtin:Router",
      "version": 1,
      "parameters": {},
      "mapper": {},
      "metadata": {
        "designer": {
          "x": 300,
          "y": 300
        }
      }
    },
    {
      "id": 6,
      "module": "email:sendEmail",
      "version": 1,
      "parameters": {},
      "mapper": {
        "to": "{{4.respondentEmail}}",
        "subject": "May we share your feedback?",
        "body": "Hi {{4.respondentName}},\n\nThank you for your kind words! We would love to feature your feedback on our website and LinkedIn.\n\nHere is exactly how it would appear:\n\n\"{{4.testimonialText}}\" — {{4.respondentName}}, {{4.company}}\n\nClick here to approve: {{YOUR_APPROVAL_LINK}}\n\nThank you!\n— Robert"
      },
      "metadata": {
        "designer": {
          "x": 600,
          "y": 200
        },
        "note": "Route: NPS score >= 9 (testimonial candidate)"
      }
    },
    {
      "id": 7,
      "module": "google-sheets:appendRow",
      "version": 1,
      "parameters": {
        "spreadsheetId": "YOUR_FUL04_TRACKER_ID"
      },
      "mapper": {
        "values": ["{{formatDate(now; 'YYYY-MM-DD')}}", "{{4.respondentName}}", "{{4.npsScore}}", "{{4.testimonialText}}", "Pending Approval"]
      },
      "metadata": {
        "designer": {
          "x": 600,
          "y": 400
        },
        "note": "Route: NPS score >= 8 (all strong scores logged)"
      }
    }
  ],
  "metadata": {
    "version": 1
  }
}
````

## Binary Attachments

- `trackers/FUL-04_Feedback_Testimonials_Tracker.xlsx`: binary attachment retained outside the Markdown kit; convert to CSV/Markdown during certification if the sheet contents become authoritative.

## Automation Blueprint

### FUL04-Feedback-Testimonials-Blueprint.json

```json
{
  "name": "FUL04: NPS Survey & Testimonial Capture (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "stripe:watchPayments",
      "version": 1,
      "parameters": {
        "event": "invoice.paid"
      },
      "mapper": {},
      "metadata": {
        "designer": {
          "x": 0,
          "y": 0
        }
      }
    },
    {
      "id": 2,
      "module": "builtin:Sleep",
      "version": 1,
      "parameters": {
        "duration": 604800,
        "note": "7-day delay after final payment before sending NPS survey"
      },
      "mapper": {},
      "metadata": {
        "designer": {
          "x": 300,
          "y": 0
        }
      }
    },
    {
      "id": 3,
      "module": "email:sendEmail",
      "version": 1,
      "parameters": {},
      "mapper": {
        "to": "{{1.customer.email}}",
        "subject": "How did we do? — {{1.metadata.projectName}}",
        "body": "Hi {{1.customer.name}},\n\nNow that your {{1.metadata.projectName}} workflow is live, we would love to hear how the experience went.\n\nIt takes 60 seconds: {{YOUR_NPS_FORM_URL}}\n\nThank you for trusting Uncle Robert Consulting.\n\n— Robert"
      },
      "metadata": {
        "designer": {
          "x": 600,
          "y": 0
        }
      }
    },
    {
      "id": 4,
      "module": "google-forms:watchResponses",
      "version": 1,
      "parameters": {
        "formId": "YOUR_NPS_FORM_ID"
      },
      "mapper": {},
      "metadata": {
        "designer": {
          "x": 0,
          "y": 300
        },
        "note": "Separate trigger branch for incoming NPS responses"
      }
    },
    {
      "id": 5,
      "module": "builtin:Router",
      "version": 1,
      "parameters": {},
      "mapper": {},
      "metadata": {
        "designer": {
          "x": 300,
          "y": 300
        }
      }
    },
    {
      "id": 6,
      "module": "email:sendEmail",
      "version": 1,
      "parameters": {},
      "mapper": {
        "to": "{{4.respondentEmail}}",
        "subject": "May we share your feedback?",
        "body": "Hi {{4.respondentName}},\n\nThank you for your kind words! We would love to feature your feedback on our website and LinkedIn.\n\nHere is exactly how it would appear:\n\n\"{{4.testimonialText}}\" — {{4.respondentName}}, {{4.company}}\n\nClick here to approve: {{YOUR_APPROVAL_LINK}}\n\nThank you!\n— Robert"
      },
      "metadata": {
        "designer": {
          "x": 600,
          "y": 200
        },
        "note": "Route: NPS score >= 9 (testimonial candidate)"
      }
    },
    {
      "id": 7,
      "module": "google-sheets:appendRow",
      "version": 1,
      "parameters": {
        "spreadsheetId": "YOUR_FUL04_TRACKER_ID"
      },
      "mapper": {
        "values": ["{{formatDate(now; 'YYYY-MM-DD')}}", "{{4.respondentName}}", "{{4.npsScore}}", "{{4.testimonialText}}", "Pending Approval"]
      },
      "metadata": {
        "designer": {
          "x": 600,
          "y": 400
        },
        "note": "Route: NPS score >= 8 (all strong scores logged)"
      }
    }
  ],
  "metadata": {
    "version": 1
  }
}
```

## Placeholder and Binding Notes

- `automation/FUL04-Feedback-Testimonials-Blueprint.json`: YOUR_NPS_FORM_URL, YOUR_NPS_FORM_ID, YOUR_APPROVAL_LINK, YOUR_FUL04_TRACKER_ID

Treat bracketed fields such as `[COMPANY NAME]`, `[AGENCY NAME]`, or `YOUR_TEMPLATE_ID` as intentional configuration points unless the source file clearly says they are unfinished draft copy. Before live use, replace tool IDs, account IDs, webhook URLs, notification channels, and client-facing business fields with the correct URC or client-safe values.

## Outputs

- Completed workflow artifact, decision, update, or handoff matching the source package.
- Evidence log or tracker entry showing what ran, who approved it, and what changed.
- Exception list for anything blocked by missing credentials, paid-tool limits, unavailable source files, or human review.

## Constraints

- Preserve the URC/internal and client-facing tracks. Do not blend them during certification.
- Keep the default route low-cost and tool-light unless the workflow truly requires a paid connector.
- Do not store secrets, API keys, private client data, or credential exports in the repo.
- Use Microsoft 365 as the default operating backbone when a general-purpose document, tracker, or email surface is needed.

## Safety Notes

- Require owner approval before sending external communications, changing access, moving money, publishing client-facing content, or modifying authoritative records.
- If the automation blueprint contains placeholder credentials or runtime-specific module IDs, rebuild and test with non-production data before enabling it.
- If the source file is missing, treat the registry metadata as orientation only and do not certify the workflow until the detailed source is recovered or rebuilt.

## Validation

- [ ] The trigger, owner, and cycle time match the current operating reality.
- [ ] Source artifacts are present or the source gap is explicitly accepted.
- [ ] Placeholder bindings have been replaced or documented as intentional template variables.
- [ ] Automation, if present, has been imported or rebuilt in the selected runtime and tested with safe data.
- [ ] Manual fallback exists for any paid-tool, credential, or platform limit.
- [ ] Evidence from at least one run is captured before certification.

## Certification Status

Status: **Draft / imported package consolidated**.

This kit is now an operative draft, but it is not certified. Certification requires at least one live or controlled manual run, proof of outputs, confirmation of placeholder bindings, and a clear URC/internal versus client-safe variant decision.

## Change Log

| Date | Change ID | Version | Type | Summary | Author |
| --- | --- | --- | --- | --- | --- |
| 2026-05-21 | CC-2026-05-21-013 | 0.1.0-draft | consolidation | Created consolidated kit.md from registry metadata, imported artifacts, placeholder scan, and automation blueprint. | codex |
