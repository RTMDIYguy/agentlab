---
schema: kit/1.0
slug: sal-04-negotiating-closing
title: "SAL-04 - Negotiating & Closing"
summary: "Sales workflow package for Negotiating & Closing. Consolidates registry metadata, imported source references, setup guidance, validation notes, and automation blueprints into one operative kit file."
version: 0.1.0-draft
owner: uncle-robert-consulting
license: UNLICENSED
status: imported-draft
conformance: draft
certifiedAt: null
workflowId: SAL-04
department: "Sales"
automationLevel: "80-85%"
primaryOwner: "Account Manager + Robert"
trigger: "Proposal delivered, 48 hrs no response"
cycleTime: "Follow-up: daily until response; close: 3-21 days"
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
  - sal
  - sales
---

# SAL-04 - Negotiating & Closing

This is the consolidated `kit.md` for the workflow. It replaces the old imported-package surface as the operative file while keeping source, asset, tracker, and automation files as provenance until certification is complete.

## Goal

Run the Negotiating & Closing workflow for Sales with a repeatable trigger, owner, cycle time, outputs, and validation path. The current draft is strong enough for agent orientation and controlled internal use; certification still requires a live run or documented manual evidence.

## When to Use

Use this workflow when the trigger occurs: **Proposal delivered, 48 hrs no response**.

Use it as part of the URC operating system first. Convert it into a client-safe variant only after URC-specific names, internal assumptions, and tool choices have been scrubbed or intentionally parameterized.

## Registry Metadata

| Field | Value |
| --- | --- |
| Workflow ID | SAL-04 |
| Department | Sales |
| Automation level | 80-85% |
| Owner | Account Manager + Robert |
| Trigger | Proposal delivered, 48 hrs no response |
| Cycle time | Follow-up: daily until response; close: 3-21 days |
| Source status | Imported source |

## Inputs

- Trigger event or planning cadence identified above.
- Current URC operating context for Sales.
- Any imported source, asset, tracker, or automation artifacts listed in the Source Map.
- Human approval from the owner before external sends, money movement, access changes, or client-visible commitments.

## Setup

1. Read this kit end to end.
2. Review the Source Digest and Source Map below.
3. Bind any placeholders listed in Placeholder and Binding Notes.
4. If an automation blueprint is embedded, import or rebuild it in the chosen runtime only after credentials and fallback paths are confirmed.
5. Run the Validation checklist before treating the workflow as complete.

## Quickstart

1. Confirm the trigger: Proposal delivered, 48 hrs no response.
2. Open the relevant source or asset file from the Source Map.
3. Collect the minimum inputs needed for this cycle.
4. Execute the workflow steps using the imported source as the detailed operating guide.
5. Capture output evidence, exceptions, and follow-up tasks.
6. Record meaningful package or behavior changes in `docs/operations/change-control-register.md`.

## Source Digest

- `URC-SAL-04_Proposal_Close.md`: Source file imported and retained for detailed workflow extraction.

## Source Map

| Artifact | Purpose |
| --- | --- |
| `source/URC-SAL-04_Proposal_Close.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `assets/SALES04-Assets.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `automation/SALES04-Blueprint.json` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `trackers/04_Funding_Opportunity_Pipeline_2.xlsx` | Retained provenance/input artifact now referenced by this consolidated kit. |

## Embedded Source and Asset Documents

### source/URC-SAL-04_Proposal_Close.md

````markdown
# SAL-04 - Negotiating & Closing Source

Source: `Sales Department\urc sales docs\URC-SAL-04_Proposal_Close.docx`

This Markdown file is a text extraction of the source `.docx` for GitHub-readable access. Preserve the source path in citations until the workflow is fully converted into `kit.md` format.

UNCLE ROBERT CONSULTING LLC

URC-SAL-04 — Proposal & Close

## Owner: Robert T. McCarthy & Sheena Burns   |   v1.0   |   March 21, 2026

1. Why This Document Exists

A proposal is not a document that sells. A proposal is a document that confirms what you've already discussed and makes it easy for someone who wants to say yes to actually say yes. If the discovery call was done well, the proposal is almost a formality. This document defines how to write proposals quickly, clearly, and confidently — using only Google Docs and Gmail, which is what URC actually has.

2. Proposal Principles

A proposal should take no more than 30 minutes to write.

If it's taking longer, you're overcomplicating it.

The best proposals are one page. They are specific, not generic.

They confirm what the client already said they wanted.

3. The One-Page Proposal Format

All URC proposals are written in Google Docs and sent as a PDF attachment or shared link via Gmail. No proposal software required.

UNCLE ROBERT CONSULTING LLC — PROPOSAL

Prepared for: [Client Name]

Date: [Date]

Prepared by: Robert T. McCarthy (and Sheena Burns if co-led)

WHAT WE HEARD

A 2-3 sentence summary of what the client shared in the discovery call.

This shows you listened. It immediately builds trust.

WHAT WE RECOMMEND

The specific tier, what will be built, and what the client will walk away with.

Use bullet points. Be specific. Reference their situation, not a generic description.

INVESTMENT

[Tier name]: $[Price]

Optional add-on: [If applicable]

Payment: 50% to start, 50% on completion. [Or full upfront for Jumpstart.]

HOW TO GET STARTED

Reply to this email with 'I'm ready' — or call/text Robert at [number].

We'll get your first session scheduled within 48 hours.

QUESTIONS?

Reply to this email or text Robert directly at [number]. Happy to talk.

That is the entire proposal. One page. No filler. No corporate language. No 12-page scope documents that nobody reads.

4. Sending the Proposal

Write the proposal in Google Docs using the format above — fill in the client's specific details

Download as PDF (File → Download → PDF Document)

Email the PDF from your Gmail account with a short personal cover note (see template below)

Log the send in HubSpot — update the deal stage to "Proposal Sent" and set a follow-up task for 48 hours later

The Proposal Email Cover Note

Subject: Your proposal from Uncle Robert Consulting

Hi [Name],

It was really good talking with you [today / this week]. I've put together a simple one-page

proposal based on what we discussed — you'll find it attached.

It covers exactly what we'd build, what it costs, and how to get started.

No pressure and no deadline — just let me know if you have questions or when you're ready to move.

Rooting for you either way,

Robert

[Phone number]

[Microsoft Bookings link if they want to schedule a follow-up call]

5. The Follow-Up Sequence

Most people don't say yes immediately. That doesn't mean no. The follow-up sequence is what separates a professional sales process from a conversation that just disappears.

Timing

Action

What to Say

48 hours after sending

Personal email follow-up

"Just checking in — did you have a chance to look at the proposal? Happy to answer any questions or jump on a quick call if that's easier."

5 days after sending

Brief check-in

"Following up one more time — no pressure at all. Just want to make sure you have what you need to make the call that's right for you."

10 days after sending

Final gentle close

"I'll stop following up after this so I'm not cluttering your inbox — but I did want you to know the offer stands whenever you're ready. Just reply or give me a call."

After 10 days with no response

Move to "Nurture" in HubSpot — not lost

Enroll in Mailchimp nurture sequence. Stay warm. People often come back 30-60 days later.

6. When They Say Yes — The First 24 Hours

Reply personally and warmly — "This is great news. I'm excited to get started with you."

Send the payment request — use Stripe or a simple PayPal/Venmo link for the first 50% deposit. Keep it frictionless.

Update HubSpot — move the deal to "Closed Won", enter the deal value, log the win

Schedule the first working session via Microsoft Bookings — within 5 business days of payment

Send a brief onboarding note — confirm what they'll need to prepare before the first session (logins, access, any assets)

Text Sheena — "We have a new client. [Name]. Let's talk." She should know every win. Every win is a reason to believe.

7. Payment Setup

URC currently accepts payment via Stripe. For clients who are not comfortable with Stripe, PayPal or Zelle are acceptable alternatives. Payment terms are:

Tier 1 (Jumpstart, $500): Full payment upfront before the first session

Tier 2 (AI Growth Pod, $1,500+): 50% ($750) to start; 50% ($750) on delivery of the completed system

Tier 3 (Retainer, $1,000-$2,000/month): First month upfront; then monthly on the same date

IMPORTANT: Do not begin any work before the deposit is received.

This is not about distrust. It is a professional standard that protects both parties.

A client who won't pay a deposit is telling you something important about the engagement ahead.

8. Review Cadence

Proposal template: reviewed every quarter — does it still reflect our offers and pricing accurately?

Follow-up sequence: adjusted based on what's working — if 48-hour follow-ups are getting responses, note it

## Owner: Robert T. McCarthy

Version

Date

Author

Summary of Changes

v1.0

March 21, 2026

R. McCarthy & S. Burns

Initial URC-specific document — built from actual client history
````

### assets/SALES04-Assets.md

````markdown
# SALES04: Negotiating & Closing Assets

## 1. Objection Handling Playbook (Core Scenarios)

### Scenario A: "It's too expensive / We don't have the budget."
**The AI-Coached Response Framework:**
*Acknowledge → Isolate → Explore value vs. cost.*
"I completely understand, [Name]. It is a significant investment. Just to clarify, when you say it's too expensive, do you mean it's more than you budgeted for, or you're not sure you'll see a return on that amount?"
*(If budget issue)*: "If we could adjust the scope to fit within your budget by removing [Service B] for now, would you want to move forward with [Service A]?"
*(If ROI issue)*: "Let's look at the numbers again. If we hit the conservative target of [Metric], this pays for itself in [X months]. If we don't think we can hit that, we shouldn't do this."

### Scenario B: "We want to wait until next quarter."
**The AI-Coached Response Framework:**
*Acknowledge → Uncover the real reason → Highlight cost of inaction.*
"Makes total sense. A lot of our clients prefer to align these projects with quarterly goals. Just so I understand, what specifically is changing between now and next quarter that makes the timing better?"
*(After they answer)*: "Got it. One thing to keep in mind: if we wait until [Month] to start, because of the [X-week] ramp-up period, you actually won't see the results of this until [Much later date]. Is the team comfortable delaying [Core Goal] until then?"

### Scenario C: "We need to run this by [Other Stakeholder] first."
**The AI-Coached Response Framework:**
*Support → Equip → Attempt to join.*
"Absolutely, [Stakeholder] definitely needs to sign off on this. How do these conversations usually go when you bring them new initiatives?"
*(After they answer)*: "Since they haven't been on these calls, they're probably going to have questions about [Specific technical or ROI detail]. Rather than making you play telephone, would it be helpful if I jumped on a quick 10-minute call with both of you just to answer their specific questions?"

---

## 2. The "Summary & Next Steps" Closing Email
*Sent immediately after a verbal agreement on the closing call.*

**Subject:** Great chatting! Here are the next steps for [Company Name]

Hi [First Name],

Great speaking with you today. I'm really excited that we're moving forward!

Just to summarize what we agreed on:
1. We are proceeding with the **[Tier Name]** package.
2. We've adjusted the scope to include [Custom Item] and removed [Removed Item].
3. The total investment is **[Final Price]**, billed [Payment Terms].

**Next Steps:**
I am having our team generate the formal agreement right now. You will receive an email from [e-Signature Platform] within the next hour.

Once you sign that, it will automatically trigger our onboarding sequence, and you'll receive your client portal login.

If anything in the agreement looks different than what we discussed, just let me know.

Looking forward to getting started!
[Your Name]

---

## 3. The "Urgency/Scarcity" Contract Reminder
*Sent 48 hours after the contract is sent if it remains unsigned.*

**Subject:** Action Required: [Company Name] Agreement

Hi [First Name],

Just checking in on the agreement I sent over on [Day].

I know we discussed kicking things off by [Target Date]. To make sure we can hit that timeline and allocate the right team members to your account, we really need to get the paperwork wrapped up by [Deadline, e.g., tomorrow at 5 PM].

If you have any questions about the legal language or the terms, let me know and I can get them answered right away.

Otherwise, you can access and sign the agreement here: [Link]
````

### automation/SALES04-Blueprint.json

````json
{
  "name": "SALES04: Contract Trigger & Follow-Up (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "hubspot:watchDeals",
      "version": 1,
      "parameters": {
        "pipeline": "default",
        "stage": "verbal_commitment"
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
      "module": "pandadoc:createDocument",
      "version": 1,
      "parameters": {
        "template_uuid": "YOUR_CONTRACT_TEMPLATE_ID"
      },
      "mapper": {
        "name": "Master Services Agreement - {{1.properties.company}}",
        "recipients": [
          {
            "email": "{{1.properties.contact_email}}",
            "first_name": "{{1.properties.contact_name}}"
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
      "module": "gmail:sendEmail",
      "version": 1,
      "parameters": {},
      "mapper": {
        "to": "{{1.properties.contact_email}}",
        "subject": "Great chatting! Here are the next steps for {{1.properties.company}}",
        "content": "Hi {{1.properties.contact_name}},<br><br>Great speaking with you today. I'm really excited that we're moving forward!..."
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
      "module": "builtin:BasicSleep",
      "version": 1,
      "parameters": {
        "delay": 172800
      },
      "mapper": {},
      "metadata": {
        "designer": {
          "x": 900,
          "y": 0
        }
      }
    },
    {
      "id": 5,
      "module": "pandadoc:getDocumentStatus",
      "version": 1,
      "parameters": {
        "document_id": "{{2.id}}"
      },
      "mapper": {},
      "metadata": {
        "designer": {
          "x": 1200,
          "y": 0
        }
      }
    },
    {
      "id": 6,
      "module": "builtin:Router",
      "version": 1,
      "parameters": {},
      "mapper": {},
      "metadata": {
        "designer": {
          "x": 1500,
          "y": 0
        }
      }
    },
    {
      "id": 7,
      "module": "gmail:sendEmail",
      "version": 1,
      "parameters": {},
      "mapper": {
        "to": "{{1.properties.contact_email}}",
        "subject": "Action Required: {{1.properties.company}} Agreement",
        "content": "Hi {{1.properties.contact_name}},<br><br>Just checking in on the agreement I sent over..."
      },
      "metadata": {
        "designer": {
          "x": 1800,
          "y": -150
        }
      }
    }
  ],
  "metadata": {
    "version": 1
  }
}
````

## Binary Attachments

- `trackers/04_Funding_Opportunity_Pipeline_2.xlsx`: binary attachment retained outside the Markdown kit; convert to CSV/Markdown during certification if the sheet contents become authoritative.

## Automation Blueprint

### SALES04-Blueprint.json

```json
{
  "name": "SALES04: Contract Trigger & Follow-Up (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "hubspot:watchDeals",
      "version": 1,
      "parameters": {
        "pipeline": "default",
        "stage": "verbal_commitment"
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
      "module": "pandadoc:createDocument",
      "version": 1,
      "parameters": {
        "template_uuid": "YOUR_CONTRACT_TEMPLATE_ID"
      },
      "mapper": {
        "name": "Master Services Agreement - {{1.properties.company}}",
        "recipients": [
          {
            "email": "{{1.properties.contact_email}}",
            "first_name": "{{1.properties.contact_name}}"
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
      "module": "gmail:sendEmail",
      "version": 1,
      "parameters": {},
      "mapper": {
        "to": "{{1.properties.contact_email}}",
        "subject": "Great chatting! Here are the next steps for {{1.properties.company}}",
        "content": "Hi {{1.properties.contact_name}},<br><br>Great speaking with you today. I'm really excited that we're moving forward!..."
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
      "module": "builtin:BasicSleep",
      "version": 1,
      "parameters": {
        "delay": 172800
      },
      "mapper": {},
      "metadata": {
        "designer": {
          "x": 900,
          "y": 0
        }
      }
    },
    {
      "id": 5,
      "module": "pandadoc:getDocumentStatus",
      "version": 1,
      "parameters": {
        "document_id": "{{2.id}}"
      },
      "mapper": {},
      "metadata": {
        "designer": {
          "x": 1200,
          "y": 0
        }
      }
    },
    {
      "id": 6,
      "module": "builtin:Router",
      "version": 1,
      "parameters": {},
      "mapper": {},
      "metadata": {
        "designer": {
          "x": 1500,
          "y": 0
        }
      }
    },
    {
      "id": 7,
      "module": "gmail:sendEmail",
      "version": 1,
      "parameters": {},
      "mapper": {
        "to": "{{1.properties.contact_email}}",
        "subject": "Action Required: {{1.properties.company}} Agreement",
        "content": "Hi {{1.properties.contact_name}},<br><br>Just checking in on the agreement I sent over..."
      },
      "metadata": {
        "designer": {
          "x": 1800,
          "y": -150
        }
      }
    }
  ],
  "metadata": {
    "version": 1
  }
}
```

## Placeholder and Binding Notes

- `automation/SALES04-Blueprint.json`: YOUR_CONTRACT_TEMPLATE_ID

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
