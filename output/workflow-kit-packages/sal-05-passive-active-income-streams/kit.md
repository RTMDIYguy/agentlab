---
schema: kit/1.0
slug: sal-05-passive-active-income-streams
title: "SAL-05 - Passive & Active Income Streams"
summary: "Sales workflow package for Passive & Active Income Streams. Consolidates registry metadata, imported source references, setup guidance, validation notes, and automation blueprints into one operative kit file."
version: 0.1.0-draft
owner: uncle-robert-consulting
license: UNLICENSED
status: imported-draft
conformance: draft
certifiedAt: null
workflowId: SAL-05
department: "Sales"
automationLevel: "85-90% (passive)"
primaryOwner: "Robert T. McCarthy"
trigger: "Quarterly planning cycle"
cycleTime: "Passive product launch: 2-4 weeks; ongoing optimization"
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

# SAL-05 - Passive & Active Income Streams

This is the consolidated `kit.md` for the workflow. It replaces the old imported-package surface as the operative file while keeping source, asset, tracker, and automation files as provenance until certification is complete.

## Goal

Run the Passive & Active Income Streams workflow for Sales with a repeatable trigger, owner, cycle time, outputs, and validation path. The current draft is strong enough for agent orientation and controlled internal use; certification still requires a live run or documented manual evidence.

## When to Use

Use this workflow when the trigger occurs: **Quarterly planning cycle**.

Use it as part of the URC operating system first. Convert it into a client-safe variant only after URC-specific names, internal assumptions, and tool choices have been scrubbed or intentionally parameterized.

## Registry Metadata

| Field | Value |
| --- | --- |
| Workflow ID | SAL-05 |
| Department | Sales |
| Automation level | 85-90% (passive) |
| Owner | Robert T. McCarthy |
| Trigger | Quarterly planning cycle |
| Cycle time | Passive product launch: 2-4 weeks; ongoing optimization |
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

1. Confirm the trigger: Quarterly planning cycle.
2. Open the relevant source or asset file from the Source Map.
3. Collect the minimum inputs needed for this cycle.
4. Execute the workflow steps using the imported source as the detailed operating guide.
5. Capture output evidence, exceptions, and follow-up tasks.
6. Record meaningful package or behavior changes in `docs/operations/change-control-register.md`.

## Source Digest

- `URC-SAL-05_Pipeline_Management.md`: Source file imported and retained for detailed workflow extraction.

## Source Map

| Artifact | Purpose |
| --- | --- |
| `source/URC-SAL-05_Pipeline_Management.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `assets/SALES05-Assets.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `automation/SALES05-Blueprint.json` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `trackers/05_Onboarding_Checklist_Tracker_1.xlsx` | Retained provenance/input artifact now referenced by this consolidated kit. |

## Embedded Source and Asset Documents

### source/URC-SAL-05_Pipeline_Management.md

````markdown
# SAL-05 - Passive & Active Income Streams Source

Source: `Sales Department\urc sales docs\URC-SAL-05_Pipeline_Management.docx`

This Markdown file is a text extraction of the source `.docx` for GitHub-readable access. Preserve the source path in citations until the workflow is fully converted into `kit.md` format.

UNCLE ROBERT CONSULTING LLC

URC-SAL-05 — Pipeline Management

## Owner: Robert T. McCarthy & Sheena Burns   |   v1.0   |   March 21, 2026

1. Why This Document Exists

A pipeline is only useful if it reflects reality. Right now, URC's HubSpot account has 923 contacts — the vast majority of which are newsletters, vendor emails, and automated services that were never prospects. Two deals have been sitting untouched since October 2025. The real clients aren't recorded as customers. This document defines how to clean up the pipeline, how to use HubSpot as an actual sales tool, and how to maintain it with a simple weekly rhythm that takes less than 20 minutes.

2. The One-Time Pipeline Cleanup

This cleanup should be completed in one sitting — schedule 2 hours, do it once, and you'll have a CRM that actually tells you the truth about your business.

## Step 1 — Fix the Existing Deals (30 minutes)

Open the two Apart USA deals in HubSpot. Since this was William Hopkins' project and that engagement is paused, close both deals as "Lost" with a note: "William's partnership dissolved; engagement paused indefinitely. Relationship remains warm."

Create one new contact for William Hopkins properly — name, personal email, lifecycle stage: "Other" (not Lead, not Opportunity). Add a note: "Long-term friend. Check in every 6-8 weeks. Not a sales prospect right now."

## Step 2 — Record Your Real Clients (30 minutes)

Jeff Holmes (Holmes Media) — update his lifecycle stage from "Lead" to "Customer". Add company: Holmes Media. Add a note with what you're currently doing for them and the approximate monthly value.

April Holmes — create a contact if she doesn't have one. Associate with the same Holmes Media company record.

Sheena Burns — update her lifecycle stage from "Lead" to "Other" (she's Co-Founder, not a prospect). Merge the three duplicate Sheena records into one clean record.

Jason McCarthy (Five Aces) — add a note: "Got hurt; helped connect to Holmes Media. Check in every 4-6 weeks. Not a prospect right now but a warm relationship."

## Step 3 — Clean Up the Contact List (60 minutes)

You don't need to delete 900 contacts individually. Do this instead:

In HubSpot, filter contacts by lifecycle stage = "Lead" and no activity in 180+ days

Bulk-select those contacts and set their lifecycle stage to "Other" — this removes them from your active working view without deleting anything

Any contact that is clearly a vendor, newsletter, or automated email (Atlassian, Morning Brew, AWS alerts, etc.) — unsubscribe and mark as "Other"

Your working lead list should be no more than 20-30 real humans when you're done

3. The Pipeline Stages

URC's HubSpot pipeline should have these stages — and only these stages. Delete or rename anything that doesn't match.

Stage

What It Means

What Triggers Moving Here

New Lead

A real person who might benefit from URC — either referred, met in person, or genuinely engaged with content

A human being expressed interest or was introduced by someone who knows us

Discovery Scheduled

A discovery call has been booked via Microsoft Bookings

Booking confirmed in calendar

Discovery Complete

The call happened — we understand their situation

Call completed; notes logged in HubSpot

Proposal Sent

A written proposal has been emailed to them

PDF proposal sent via Gmail

Closed Won

They said yes and paid the deposit

Payment received; work begins

Closed Lost

They said no, or 10 days passed after proposal with no response

Final follow-up sent with no response, or explicit no

Nurture (Long-Term)

Not ready now but relationship worth maintaining — add to Mailchimp nurture

Closed Lost contacts with a warm relationship worth keeping warm

4. The Weekly Pipeline Rhythm

This takes 20 minutes every Monday morning. It is the most important sales habit in the business.

## Step

Action

Time

1

Open HubSpot pipeline view — look at every deal that's been in the same stage for 7+ days. Ask: what's the next action and when does it happen?

5 min

2

Check follow-up tasks — any proposals that need a 48-hour or 5-day follow-up today? Send them now.

5 min

3

Review the referral network (SAL-02) — who haven't you heard from in 3+ weeks? Send one personal message.

5 min

4

Update any stages that changed last week — move deals forward or to Closed Lost/Nurture as appropriate

5 min

5. What to Track and Why

For a small agency at URC's current stage, you don't need complex analytics. You need to know four things:

Metric

Why It Matters

Where to Find It

Deals created this month

Are we having enough real conversations?

HubSpot pipeline — filter by create date

Discovery calls completed this month

Is the referral system generating calls?

HubSpot stage: Discovery Complete — filter by date

Proposals sent this month

Are discovery calls converting to proposals?

HubSpot stage: Proposal Sent — filter by date

Closed Won this month (count and $)

Are proposals converting?

HubSpot stage: Closed Won — filter by date

Review these four numbers every Monday alongside the weekly rhythm above. When you see a gap — fewer calls than last month, proposals not converting — that's where to focus.

6. HubSpot Configuration Notes

URC is on HubSpot Starter. These are the only features currently needed:

Contacts — with custom note fields and lifecycle stages as described above

Deals pipeline — with the 7 stages defined in Section 3

Tasks — to set follow-up reminders after proposals are sent

Email logging — forward important client emails to your HubSpot BCC address so they're logged automatically

Do not activate or pay for features URC doesn't need yet. The free tier of HubSpot is sufficient for this entire sales system until URC reaches 10+ active clients.

7. Review Cadence

Weekly pipeline review: every Monday, 20 minutes — non-negotiable

Monthly pipeline audit: last Friday of the month — review all four metrics, identify what to adjust

This document: reviewed quarterly or whenever the pipeline stages need updating

## Owner: Robert T. McCarthy (Sheena to be briefed monthly on pipeline status)

Version

Date

Author

Summary of Changes

v1.0

March 21, 2026

R. McCarthy & S. Burns

Initial URC-specific document — built from actual client history
````

### assets/SALES05-Assets.md

````markdown
# SALES05: Passive and Active Income Streams Assets

## 1. Digital Product / Template Pack Sales Page Copy
*To be used on Gumroad, ThriveCart, or landing pages.*

**Headline:** The Exact [System/Framework Name] We Use to Help Our Clients Achieve [Specific Result]

**Sub-headline:** Stop wasting time trying to build your own [Process]. Steal the exact templates, scripts, and SOPs our agency uses to generate [Specific ROI] for clients every single day.

**The Problem:**
You know you need to [Action, e.g., run better discovery calls], but right now, your process looks like this:
- [Symptom 1: e.g., You're spending 3 hours prepping for every call]
- [Symptom 2: e.g., Prospects are leaving the call without clear next steps]
- [Symptom 3: e.g., You're losing deals to competitors who seem more organized]

**The Solution:**
Introducing **The [System/Framework Name] Toolkit**.

This isn't theory. This is the exact battle-tested system we use internally. For the first time, we're opening up our agency vault so you can copy and paste our success into your own business.

**What You Get Inside:**
- **[Asset 1 Name]**: (Value $X) - A 5-page PDF detailing exactly how to...
- **[Asset 2 Name]**: (Value $X) - Our proprietary Google Sheet tracker for...
- **[Asset 3 Name]**: (Value $X) - Word-for-word email templates for...

**Total Value:** $X
**Your Price Today:** $Y

*[Buy Now Button]*

**Who this is for:**
[Target Audience 1], [Target Audience 2], and [Target Audience 3] who are tired of guessing and want a proven system that works.

---

## 2. Affiliate Recommendation Email (For Clients)
*Sent to clients when they hit a specific milestone or ask for a software recommendation.*

**Subject:** The tool we use for [Specific Function]

Hi [First Name],

Great question on our call today regarding how to handle [Specific Function].

While there are a lot of tools out there, we internally use and strongly recommend **[Software Name]**. It's the best we've found specifically because it handles [Feature 1] and [Feature 2] really well without being overly complicated.

If you decide to sign up, you can use our partner link here: **[Your Affiliate Link]**

*(Full transparency: That is an affiliate link, but we only recommend tools we actively use ourselves and trust.)*

Let me know if you need any help getting it set up—I can send over a quick Loom video showing how we configured ours!

---

## 3. Passive Income Evergreen Email Sequence

### Email 1: The "Aha Moment" Value Add (Send immediately after lead magnet download)
**Subject:** Here's your [Lead Magnet Name] + a quick question

Hi [First Name],

Here is the link to download your [Lead Magnet Name]: [Link]

I created this because I noticed so many people struggling with [Pain Point]. When we finally figured out how to [Solve Pain Point] at our agency, it completely changed the game for us.

Quick question for you: Now that you have this resource, what is the #1 biggest challenge you're facing right now when it comes to [Topic]?

Hit reply and let me know.

### Email 2: The Transition & Offer (Send Day 2)
**Subject:** How to take [Topic] to the next level

Hi [First Name],

Yesterday I sent over the [Lead Magnet Name]. If you've had a chance to look through it, you know that the secret to [Topic] is actually [Core Concept].

But knowing the concept is only half the battle. Actually executing it is where most people get stuck.

That's exactly why we packaged up our internal agency tools into **The [Product Name]**. It includes the exact templates and SOPs you need to execute [Topic] without starting from scratch.

You can grab it here for just $[Price]: [Link to Sales Page]

### Email 3: Scarcity / Objection Handling (Send Day 4)
**Subject:** You're overthinking [Topic]

Hi [First Name],

I've seen so many people waste weeks trying to build their own [System] from scratch.

You don't need to reinvent the wheel. **The [Product Name]** is ready to use today.

Inside you'll find:
- [Benefit 1]
- [Benefit 2]

[Link to Sales Page]

Don't spend another weekend trying to figure this out on your own.
````

### automation/SALES05-Blueprint.json

````json
{
  "name": "SALES05: Passive Income Funnel (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "gumroad:watchSales",
      "version": 1,
      "parameters": {
        "product_id": "YOUR_PRODUCT_ID"
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
      "module": "hubspot:createUpdateContact",
      "version": 1,
      "parameters": {},
      "mapper": {
        "email": "{{1.email}}",
        "properties": [
          {
            "property": "firstname",
            "value": "{{1.first_name}}"
          },
          {
            "property": "lifecyclestage",
            "value": "customer"
          },
          {
            "property": "purchased_products",
            "value": "{{1.product_name}}"
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
      "module": "hubspot:addContactToList",
      "version": 1,
      "parameters": {
        "list_id": "BUYERS_LIST_ID"
      },
      "mapper": {
        "email": "{{1.email}}"
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
      "module": "slack:createMessage",
      "version": 1,
      "parameters": {
        "channel": "passive-income-wins"
      },
      "mapper": {
        "text": "💰 *Cha-Ching! New Digital Product Sale!*\n{{1.first_name}} just bought {{1.product_name}} for ${{1.price}}."
      },
      "metadata": {
        "designer": {
          "x": 900,
          "y": 0
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

- `trackers/05_Onboarding_Checklist_Tracker_1.xlsx`: binary attachment retained outside the Markdown kit; convert to CSV/Markdown during certification if the sheet contents become authoritative.

## Automation Blueprint

### SALES05-Blueprint.json

```json
{
  "name": "SALES05: Passive Income Funnel (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "gumroad:watchSales",
      "version": 1,
      "parameters": {
        "product_id": "YOUR_PRODUCT_ID"
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
      "module": "hubspot:createUpdateContact",
      "version": 1,
      "parameters": {},
      "mapper": {
        "email": "{{1.email}}",
        "properties": [
          {
            "property": "firstname",
            "value": "{{1.first_name}}"
          },
          {
            "property": "lifecyclestage",
            "value": "customer"
          },
          {
            "property": "purchased_products",
            "value": "{{1.product_name}}"
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
      "module": "hubspot:addContactToList",
      "version": 1,
      "parameters": {
        "list_id": "BUYERS_LIST_ID"
      },
      "mapper": {
        "email": "{{1.email}}"
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
      "module": "slack:createMessage",
      "version": 1,
      "parameters": {
        "channel": "passive-income-wins"
      },
      "mapper": {
        "text": "💰 *Cha-Ching! New Digital Product Sale!*\n{{1.first_name}} just bought {{1.product_name}} for ${{1.price}}."
      },
      "metadata": {
        "designer": {
          "x": 900,
          "y": 0
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

- `automation/SALES05-Blueprint.json`: YOUR_PRODUCT_ID

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
