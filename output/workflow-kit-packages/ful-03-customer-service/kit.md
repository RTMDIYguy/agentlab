---
schema: kit/1.0
slug: ful-03-customer-service
title: "FUL-03 - Customer Service"
summary: "Fulfillment workflow package for Customer Service. Consolidates registry metadata, imported source references, setup guidance, validation notes, and automation blueprints into one operative kit file."
version: 0.1.0-draft
owner: uncle-robert-consulting
license: UNLICENSED
status: imported-draft
conformance: draft
certifiedAt: null
workflowId: FUL-03
department: "Fulfillment"
automationLevel: "70-80%"
primaryOwner: "Account Manager + Robert (Tier 3)"
trigger: "Inbound request any channel"
cycleTime: "Tier 1: < 5 min; Tier 2: < 4 hrs; Tier 3: < 24 hrs"
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

# FUL-03 - Customer Service

This is the consolidated `kit.md` for the workflow. It replaces the old imported-package surface as the operative file while keeping source, asset, tracker, and automation files as provenance until certification is complete.

## Goal

Run the Customer Service workflow for Fulfillment with a repeatable trigger, owner, cycle time, outputs, and validation path. The current draft is strong enough for agent orientation and controlled internal use; certification still requires a live run or documented manual evidence.

## When to Use

Use this workflow when the trigger occurs: **Inbound request any channel**.

Use it as part of the URC operating system first. Convert it into a client-safe variant only after URC-specific names, internal assumptions, and tool choices have been scrubbed or intentionally parameterized.

## Registry Metadata

| Field | Value |
| --- | --- |
| Workflow ID | FUL-03 |
| Department | Fulfillment |
| Automation level | 70-80% |
| Owner | Account Manager + Robert (Tier 3) |
| Trigger | Inbound request any channel |
| Cycle time | Tier 1: < 5 min; Tier 2: < 4 hrs; Tier 3: < 24 hrs |
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

1. Confirm the trigger: Inbound request any channel.
2. Open the relevant source or asset file from the Source Map.
3. Collect the minimum inputs needed for this cycle.
4. Execute the workflow steps using the imported source as the detailed operating guide.
5. Capture output evidence, exceptions, and follow-up tasks.
6. Record meaningful package or behavior changes in `docs/operations/change-control-register.md`.

## Source Digest

- `URC-FUL-03_Customer_Service.md`: Source file imported and retained for detailed workflow extraction.

## Source Map

| Artifact | Purpose |
| --- | --- |
| `source/URC-FUL-03_Customer_Service.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `automation/FUL03-Customer-Service-Blueprint.json` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `trackers/FUL-03_CS_Ticket_Tracker.xlsx` | Retained provenance/input artifact now referenced by this consolidated kit. |

## Embedded Source and Asset Documents

### source/URC-FUL-03_Customer_Service.md

````markdown
# FUL-03 - Customer Service Source

Source: `Fulfillment Department\URC Fulfillment\URC-FUL-03_Customer_Service.docx`

This Markdown file is a text extraction of the source `.docx` for GitHub-readable access. Preserve the source path in citations until the workflow is fully converted into `kit.md` format.

UNCLE ROBERT CONSULTING LLC

URC-FUL-03 — Customer Service

Tiered Issue Resolution — Fast, Consistent, and Human Where It Counts

Robert T. McCarthy & Sheena Burns   |   v1.0   |   March 23, 2026

1. Why This Workflow Exists

Customer service is reactive by nature — something goes wrong, a client has a question, and they need a response. The difference between good and bad customer service at a small agency is almost entirely about speed and tone. This workflow defines how URC responds to every inbound client request — what gets handled immediately, what gets escalated, and how to turn a service interaction into a trust-building moment.

2. Inbound Channels and Response Times

Channel

How URC Receives It

Target First Response

Who Responds

Gmail (robert@unclerobertconsulting.com)

Primary — all client emails come here

Within 4 business hours

Robert

Gmail (alternate .com address)

Secondary — forward to primary

Within 4 business hours

Robert

LinkedIn message

Direct messages from clients or prospects

Within 24 hours

Robert

Microsoft Bookings

Booking requests and reschedules

Confirmation automatic; Robert reviews daily

Automatic + Robert

Mailchimp reply

Subscriber replies to email campaigns

Within 48 hours

Robert

Referral / word of mouth

Someone reaches out via a warm introduction

Within 24 hours — treat as high priority

Robert

The most important customer service rule at URC's current stage:

Respond personally. Not a template. Not an auto-reply.

A small agency's greatest competitive advantage is that a real person answers.

Use that.

3. Issue Triage — Three Tiers

Tier 1 — Self-Serve or Quick Resolve (Under 30 Minutes)

These are the most common inbound requests. Handle them immediately.

Common Request

How to Handle

File re-delivery request

Retrieve from Google Drive, share link or attach. Reply within 1 hour.

Rescheduling a call

Update Microsoft Bookings or send a new calendar invite. Reply confirming.

Question about a deliverable already sent

Answer directly in the reply. If complex, offer a 15-min call.

Invoice or payment question

Check QuickBooks, reply with status. If dispute, escalate to Tier 3.

General AI or tool question

Answer from knowledge if confident. If not — research first, then reply.

Tier 2 — Assisted Resolution (Same Business Day)

These require more than a quick reply but can be resolved without escalation.

Scope clarification — client is unsure what's included in their engagement

Technical troubleshooting — automation or integration isn't working as expected

Minor timeline adjustment — client needs a deliverable shifted by a few days

Access issue — client can't access a Google Drive link or Loom recording

For Tier 2: acknowledge within 2 hours, resolve within same business day. If resolution requires more time, set a clear expectation: 'I'll have this sorted by [day/time].'

Tier 3 — Escalation (Robert Handles Personally, Same Day)

These require Robert's full attention and should never be delegated or delayed.

Formal complaint about quality of work delivered

Request for a refund or credit

Scope dispute — client believes they were promised something not delivered

Invoice more than 21 days unpaid with no communication

Any interaction that feels like the relationship is at risk

For Tier 3: Call first, email second. A phone call resolves in 20 minutes what

an email chain makes worse over three days.

Open with: 'I want to make sure I understand what happened from your perspective.'

Never get defensive. Never minimize. Just listen, then fix.

4. The Acknowledgment Rule

Every inbound client message — regardless of tier — receives an acknowledgment within 2 business hours. Even if the answer isn't ready yet.

Example acknowledgment for a Tier 2 issue:

'Hi [Name] — got your message. I'm looking into [the issue] now and will

have an answer for you by [specific time today]. Thanks for flagging this.'

That's it. Short, specific, human. It tells them they're not being ignored.

5. Service Recovery

When URC makes a mistake — and it will happen — the recovery is what the client remembers, not the mistake. These are the service recovery principles:

Acknowledge the mistake directly — no deflection, no excuses

Apologize once, genuinely — then move immediately to resolution

Offer a specific remedy with a specific timeline

Deliver the remedy ahead of schedule if at all possible

Follow up after the remedy to confirm the client is satisfied

On significant errors — a deliverable that required a complete redo, a missed deadline that affected the client's business — consider a service recovery gesture: a free session, a credit toward the next invoice, or a bonus deliverable. Not as a policy, but as a genuine acknowledgment that the client's time and trust were affected.

6. Building the Knowledge Base

Every Tier 1 question that Robert answers more than twice should become a knowledge base entry — a documented answer that can be shared or referenced immediately next time. For now, this lives in a Google Doc titled 'URC FAQ — Internal.' Over time it becomes the foundation for the AI customer service agent.

FAQ Topics to Document First

What's included in each service tier — the exact scope in plain language

How to access deliverables in Google Drive

How to reschedule a call

What happens if an automation stops working after delivery

What the timeline looks like for a typical Tier 2 engagement

How invoicing and payment work

7. Horizon 2 — Customer Service at Scale

VISION

AI customer service agent handles all Tier 1 requests automatically — 24/7, instant responses.

Tier 2 requests get AI-drafted responses that Robert reviews and sends with one click.

Tier 3 escalations flagged immediately to Robert with full interaction history and recommended approach.

Knowledge base grows automatically from resolved tickets — AI suggests new FAQ entries weekly.

Client portal gives clients self-serve access to their deliverables, invoices, and call recordings.

8. Review Cadence

Response time performance: checked monthly — are we hitting our targets?

FAQ / knowledge base: updated whenever a new question is answered more than twice

Service recovery log: every Tier 3 incident documented — what happened, how it was resolved, what to prevent next time

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

### automation/FUL03-Customer-Service-Blueprint.json

````json
{
  "name": "FUL03: Support Ticket Intake & Triage (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "email:watchEmails",
      "version": 1,
      "parameters": {
        "folder": "INBOX",
        "query": "to:support@unclerobertconsulting.com"
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
      "module": "openai:createCompletion",
      "version": 1,
      "parameters": {
        "model": "gpt-4"
      },
      "mapper": {
        "messages": [
          {
            "role": "system",
            "content": "You are a support triage specialist. Given a client email, classify: (1) severity as LOW, MEDIUM, or HIGH based on impact description, (2) category as TECHNICAL, BILLING, ACCESS, or GENERAL, (3) generate a ticket ID as CS-YYYYMMDD-NNN. Check for duplicate indicators: same sender + similar keywords within 4 hours = potential duplicate. Return JSON: {ticketId, severity, category, clientEmail, clientName, summary, potentialDuplicate: boolean, suggestedResponse}."
          },
          {
            "role": "user",
            "content": "From: {{1.from}}\nSubject: {{1.subject}}\nBody: {{1.text}}\nReceived: {{1.date}}"
          }
        ]
      },
      "metadata": {
        "designer": {
          "x": 300,
          "y": 0
        }
      }
    },
    {
      "id": 3,
      "module": "builtin:Router",
      "version": 1,
      "parameters": {},
      "mapper": {},
      "metadata": {
        "designer": {
          "x": 600,
          "y": 0
        }
      }
    },
    {
      "id": 4,
      "module": "clickup:createTask",
      "version": 1,
      "parameters": {
        "listId": "YOUR_SUPPORT_LIST_ID"
      },
      "mapper": {
        "name": "[{{2.choices[0].message.content.severity}}] {{2.choices[0].message.content.summary}}",
        "priority": "{{2.choices[0].message.content.severity == 'HIGH' ? 1 : 2}}",
        "description": "Client: {{1.from}}\nCategory: {{2.choices[0].message.content.category}}\n\n{{1.text}}"
      },
      "metadata": {
        "designer": {
          "x": 900,
          "y": -150
        },
        "note": "Route: potentialDuplicate == false"
      }
    },
    {
      "id": 5,
      "module": "email:sendEmail",
      "version": 1,
      "parameters": {},
      "mapper": {
        "to": "{{1.from}}",
        "subject": "Re: {{1.subject}} — Ticket {{2.choices[0].message.content.ticketId}}",
        "body": "Thank you for reaching out. Your request has been logged as ticket {{2.choices[0].message.content.ticketId}}. We will respond within 48 hours.\n\nBest,\nUncle Robert Consulting Support"
      },
      "metadata": {
        "designer": {
          "x": 900,
          "y": 150
        },
        "note": "Route: always (auto-acknowledgment)"
      }
    }
  ],
  "metadata": {
    "version": 1
  }
}
````

## Binary Attachments

- `trackers/FUL-03_CS_Ticket_Tracker.xlsx`: binary attachment retained outside the Markdown kit; convert to CSV/Markdown during certification if the sheet contents become authoritative.

## Automation Blueprint

### FUL03-Customer-Service-Blueprint.json

```json
{
  "name": "FUL03: Support Ticket Intake & Triage (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "email:watchEmails",
      "version": 1,
      "parameters": {
        "folder": "INBOX",
        "query": "to:support@unclerobertconsulting.com"
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
      "module": "openai:createCompletion",
      "version": 1,
      "parameters": {
        "model": "gpt-4"
      },
      "mapper": {
        "messages": [
          {
            "role": "system",
            "content": "You are a support triage specialist. Given a client email, classify: (1) severity as LOW, MEDIUM, or HIGH based on impact description, (2) category as TECHNICAL, BILLING, ACCESS, or GENERAL, (3) generate a ticket ID as CS-YYYYMMDD-NNN. Check for duplicate indicators: same sender + similar keywords within 4 hours = potential duplicate. Return JSON: {ticketId, severity, category, clientEmail, clientName, summary, potentialDuplicate: boolean, suggestedResponse}."
          },
          {
            "role": "user",
            "content": "From: {{1.from}}\nSubject: {{1.subject}}\nBody: {{1.text}}\nReceived: {{1.date}}"
          }
        ]
      },
      "metadata": {
        "designer": {
          "x": 300,
          "y": 0
        }
      }
    },
    {
      "id": 3,
      "module": "builtin:Router",
      "version": 1,
      "parameters": {},
      "mapper": {},
      "metadata": {
        "designer": {
          "x": 600,
          "y": 0
        }
      }
    },
    {
      "id": 4,
      "module": "clickup:createTask",
      "version": 1,
      "parameters": {
        "listId": "YOUR_SUPPORT_LIST_ID"
      },
      "mapper": {
        "name": "[{{2.choices[0].message.content.severity}}] {{2.choices[0].message.content.summary}}",
        "priority": "{{2.choices[0].message.content.severity == 'HIGH' ? 1 : 2}}",
        "description": "Client: {{1.from}}\nCategory: {{2.choices[0].message.content.category}}\n\n{{1.text}}"
      },
      "metadata": {
        "designer": {
          "x": 900,
          "y": -150
        },
        "note": "Route: potentialDuplicate == false"
      }
    },
    {
      "id": 5,
      "module": "email:sendEmail",
      "version": 1,
      "parameters": {},
      "mapper": {
        "to": "{{1.from}}",
        "subject": "Re: {{1.subject}} — Ticket {{2.choices[0].message.content.ticketId}}",
        "body": "Thank you for reaching out. Your request has been logged as ticket {{2.choices[0].message.content.ticketId}}. We will respond within 48 hours.\n\nBest,\nUncle Robert Consulting Support"
      },
      "metadata": {
        "designer": {
          "x": 900,
          "y": 150
        },
        "note": "Route: always (auto-acknowledgment)"
      }
    }
  ],
  "metadata": {
    "version": 1
  }
}
```

## Placeholder and Binding Notes

- `automation/FUL03-Customer-Service-Blueprint.json`: YOUR_SUPPORT_LIST_ID

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
