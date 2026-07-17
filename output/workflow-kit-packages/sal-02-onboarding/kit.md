---
schema: kit/1.0
slug: sal-02-onboarding
title: "SAL-02 - OnBoarding"
summary: "Sales workflow package for OnBoarding. Consolidates registry metadata, imported source references, setup guidance, validation notes, and automation blueprints into one operative kit file."
version: 0.1.0-draft
owner: uncle-robert-consulting
license: UNLICENSED
status: imported-draft
conformance: draft
certifiedAt: null
workflowId: SAL-02
department: "Sales"
automationLevel: "80-85%"
primaryOwner: "Account Manager assigned"
trigger: "Contract fully executed"
cycleTime: "3-7 days from signature to active project"
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

# SAL-02 - OnBoarding

This is the consolidated `kit.md` for the workflow. It replaces the old imported-package surface as the operative file while keeping source, asset, tracker, and automation files as provenance until certification is complete.

## Goal

Run the OnBoarding workflow for Sales with a repeatable trigger, owner, cycle time, outputs, and validation path. The current draft is strong enough for agent orientation and controlled internal use; certification still requires a live run or documented manual evidence.

## When to Use

Use this workflow when the trigger occurs: **Contract fully executed**.

Use it as part of the URC operating system first. Convert it into a client-safe variant only after URC-specific names, internal assumptions, and tool choices have been scrubbed or intentionally parameterized.

## Registry Metadata

| Field | Value |
| --- | --- |
| Workflow ID | SAL-02 |
| Department | Sales |
| Automation level | 80-85% |
| Owner | Account Manager assigned |
| Trigger | Contract fully executed |
| Cycle time | 3-7 days from signature to active project |
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

1. Confirm the trigger: Contract fully executed.
2. Open the relevant source or asset file from the Source Map.
3. Collect the minimum inputs needed for this cycle.
4. Execute the workflow steps using the imported source as the detailed operating guide.
5. Capture output evidence, exceptions, and follow-up tasks.
6. Record meaningful package or behavior changes in `docs/operations/change-control-register.md`.

## Source Digest

- `URC-SAL-02_Referral_Activation_System.md`: Source file imported and retained for detailed workflow extraction.

## Source Map

| Artifact | Purpose |
| --- | --- |
| `source/URC-SAL-02_Referral_Activation_System.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `assets/SALES02-Assets.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `automation/SALES02-Blueprint.json` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `trackers/02_Sales_Pipeline_Tracker_2.xlsx` | Retained provenance/input artifact now referenced by this consolidated kit. |

## Embedded Source and Asset Documents

### source/URC-SAL-02_Referral_Activation_System.md

````markdown
# SAL-02 - OnBoarding Source

Source: `Sales Department\urc sales docs\URC-SAL-02_Referral_Activation_System.docx`

This Markdown file is a text extraction of the source `.docx` for GitHub-readable access. Preserve the source path in citations until the workflow is fully converted into `kit.md` format.

UNCLE ROBERT CONSULTING LLC

URC-SAL-02 — Referral Activation System

## Owner: Robert T. McCarthy & Sheena Burns   |   v1.0   |   March 21, 2026

1. Why This Document Exists

Every single client who has said yes to Uncle Robert Consulting has come through a real human relationship. Not LinkedIn outreach. Not cold email. Not paid ads. A person who knew Robert, trusted him, and either became a client themselves or connected him to someone else who did. That is URC's proven sales channel. This document builds a system around it.

The referral system is not about asking people for business.

It is about staying genuinely connected to people who care about you —

so that when they encounter someone who needs what you do,

your name is the first one that comes to mind.

2. The Referral Network — People Who Know and Trust URC

This is the starting list. These are real relationships with real warmth — not a cold contact list.

Name / Relationship

Current Status

Best Way to Stay Connected

Referral Ask Appropriate?

Jeff & April Holmes — Holmes Media (Active Clients)

Active — currently engaged

Monthly check-in call; celebrate their wins publicly

Yes — they know our work firsthand

Jason McCarthy — Five Aces (Helped through difficult time)

Warm — we helped him connect to Holmes Media

Personal check-in every 4-6 weeks; ask how things are going

Not yet — let the relationship breathe first; revisit in 60 days

William Hopkins — Apart USA (Friend, paused)

Warm — friendship intact, life in transition

Personal check-in every 6-8 weeks; no sales pressure ever

No — William is a friend. That comes first, always.

Sheena Burns — Co-Founder (Trimble, MO)

Distant but not gone — working Casey's, losing confidence

Weekly personal message — not business, just human connection

Sheena IS the referral engine when re-engaged — see SAL-06

Local network — Independence MO / KC area

Warm — networking events attended

Show up consistently; be known as the AI person in the room

Yes — after 2-3 genuine interactions, the ask is natural

3. The Referral Ask — How to Do It Without It Feeling Weird

Most people never ask for referrals because they're afraid it will feel transactional or pushy. It won't — if you do it this way.

The Right Time to Ask

Right after a client expresses satisfaction — "This is exactly what I needed" or "I can't believe how much time this saves me"

At a natural milestone — 30 days after launch, at the end of a project, or at a check-in where they report a win

Never at the beginning of a relationship — earn it first

The Exact Words to Use

"I'm really glad this has been working for you. Can I ask a favor?

I'm a small operation and most of my best clients have come through people who already know my work.

If you know anyone — a friend, a colleague, someone in your network — who's struggling with

the same kind of thing you were before we started, I'd love an introduction.

Even just a 'you should talk to Robert' goes a long way."

That's it. No pressure. No scripts. No follow-up ask if they don't respond immediately. Plant the seed and let it grow.

The Referral Ask for Holmes Media Specifically

Jeff and April are active clients who know exactly what URC does. The ask with them is more specific:

"Jeff, April — working with you has been one of the best parts of this year for me.

You two are connected to a lot of small business owners in this area.

If any of them ever mention struggling with leads, follow-up, or just feeling like their

business runs them instead of the other way around — I'd love it if you'd think of me.

A text introduction is all it takes."

4. Staying Connected — The Weekly Warm Network Rhythm

Referrals don't come from one ask. They come from being consistently present in people's lives. This rhythm takes less than 30 minutes a week and keeps every important relationship warm without feeling like a CRM task.

Day

Action

Time Required

Monday

Review the referral network list. Who haven't you heard from in 3+ weeks? Send one personal message — not about business. Ask how they're doing.

10 min

Wednesday

Post something on LinkedIn that demonstrates URC's value — a lesson learned, a client win (anonymized), or a practical AI tip. This keeps you visible to your whole network.

15 min

Friday

Reply to any responses from Monday's messages. If someone shared a win this week — celebrate it publicly on LinkedIn or with a personal note.

10 min

5. When a Referral Comes In — What to Do in the First 24 Hours

Send a personal thank-you to the person who made the referral — do this before you even talk to the new prospect. They need to know their trust was honored.

Reach out to the referred contact within 24 hours — ideally a short personal email or LinkedIn message, not a booking link right away. Acknowledge the connection: "Jeff told me about you and thought we should talk."

Book a discovery call using your Microsoft Bookings link — share it after the initial message, not in the first message. Let them reply first.

Log the contact in HubSpot immediately — source: referral, referring contact: [name]. This is how you track which relationships are generating business.

After the call, regardless of outcome, circle back to the referrer with a brief update: "Had a great conversation with [name] — thank you for the introduction."

6. Tracking Referrals in HubSpot

The referral system only improves if it's tracked. This is the minimum logging required in HubSpot for every referral contact:

Contact created with full name, email, and company

Lead source property set to: Referral

A note added: "Referred by [name] on [date]. Context: [one sentence about why they were referred]"

Lifecycle stage: Lead (until discovery call completed, then update to Opportunity)

This takes 3 minutes. It means that six months from now, Robert and Sheena can look at HubSpot and know exactly which relationships are generating the most introductions — and invest in those accordingly.

7. The Long Game — Building a Referral Culture

The goal is not to extract referrals from a fixed list of people. The goal is to build a reputation in the Independence / KC small business community — and in online communities of creators and solopreneurs — where URC is known as the agency that genuinely helps people and doesn't disappear after the invoice.

Show up at local events regularly enough that people associate your face with AI for small business

When someone isn't ready to buy — help them anyway. Jason McCarthy is now connected to Holmes Media because Robert made an introduction that served Jason, not URC. That kind of generosity is remembered.

When someone needs something URC doesn't offer — refer them to someone who can help. Generosity is circular.

Every person Sheena meets at Casey's in Trimble who mentions their small business is a seed worth planting gently

8. Review Cadence

Referral network list: reviewed monthly — who's been added, who needs reconnecting, who has referred someone

HubSpot referral tracking: audited quarterly to identify top referral sources

This document: reviewed semi-annually or whenever a new significant relationship is established

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

### assets/SALES02-Assets.md

````markdown
# SALES02: OnBoarding Assets

## 1. Automated Welcome Email
**Subject:** Welcome to [Agency Name]! Let's get started. 🚀

Hi [First Name],

It's official! We're thrilled to partner with [Company Name] and get to work on [Primary Goal from Contract].

Before our kickoff call, there are a few quick things we need from you so we can hit the ground running.

**Your First Step: The Intake Questionnaire**
Please take 5-10 minutes to complete this intake form: [Link to Form]

*In this form, you'll be able to:*
- Upload your brand assets and logo files
- Share access to your ad accounts/analytics
- Confirm your target audience profiles

**What Happens Next?**
Once you submit that form, our team will review the details and start building your custom project dashboard. I'll also be sending over a calendar invite for our official Kickoff Call next week.

I've attached a quick video below introducing myself and the team who will be working on your account.

[Loom Video Link]

Let me know if you have any trouble accessing the form!

Welcome aboard,
[Your Name]
Account Manager, [Agency Name]

---

## 2. Kickoff Call Agenda Template
*To be used by the Account Manager during the live kickoff call.*

**1. Welcome & Introductions (5 mins)**
- Introduce agency team members and their roles.
- Client introduces their team members.

**2. Goal Alignment & Scope Review (10 mins)**
- Review the core objectives outlined in the contract.
- Confirm the specific KPIs that will determine "success" for this project.
- *Ask:* "Just to make sure we're completely aligned, if we look back 6 months from now, what specifically needs to happen for you to consider this a massive win?"

**3. The Plan & First Milestone (10 mins)**
- Review the initial 30-day timeline.
- Detail the exact deliverables for the first milestone.
- Set the deadline for the first review round.

**4. Communication & Workflow (10 mins)**
- Explain the Client Portal (how to leave feedback, track progress).
- Establish the communication cadence (e.g., Weekly Slack updates, Monthly reporting calls).
- Define the approval workflow (Who has final say on deliverables?).

**5. Immediate Next Steps & Q&A (5 mins)**
- Summarize action items for both the agency and the client.
- Answer any remaining questions.

---

## 3. 30-Day Check-in Survey
*Triggered automatically 30 days after the contract start date.*

**Subject:** How are we doing so far? (1-minute survey)

Hi [First Name],

Can you believe it's already been a month since we started working together?

Our goal is to be the best partner you've ever worked with. To make sure we're on the right track, I'd love to get your completely honest feedback on your experience so far.

**Could you take 60 seconds to answer these 3 quick questions?**
[Link to Survey]

1. On a scale of 1-10, how satisfied are you with the communication and pace of the project so far?
2. Has our team delivered on what was promised during the sales process?
3. Is there anything we could be doing differently right now to make your life easier?

Your feedback goes straight to me and our leadership team, and we take it very seriously.

Thanks!
[Your Name]
````

### automation/SALES02-Blueprint.json

````json
{
  "name": "SALES02: Onboarding Trigger & Setup (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "hubspot:watchDeals",
      "version": 1,
      "parameters": {
        "pipeline": "default",
        "stage": "closed_won"
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
      "module": "clickup:createFolder",
      "version": 1,
      "parameters": {
        "space_id": "YOUR_CLIENT_SPACE_ID"
      },
      "mapper": {
        "name": "{{1.properties.company}} - Client Portal"
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
      "module": "clickup:createTaskFromTemplate",
      "version": 1,
      "parameters": {
        "list_id": "{{2.id}}",
        "template_id": "YOUR_ONBOARDING_TEMPLATE_ID"
      },
      "mapper": {
        "name": "Phase 1: Onboarding for {{1.properties.company}}"
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
      "module": "gmail:sendEmail",
      "version": 1,
      "parameters": {},
      "mapper": {
        "to": "{{1.properties.contact_email}}",
        "subject": "Welcome to [Agency Name]! Let's get started. 🚀",
        "content": "Hi {{1.properties.contact_name}},<br><br>It's official! We're thrilled to partner with {{1.properties.company}}... [Insert Full Asset 1 Copy Here]"
      },
      "metadata": {
        "designer": {
          "x": 900,
          "y": 0
        }
      }
    },
    {
      "id": 5,
      "module": "slack:createMessage",
      "version": 1,
      "parameters": {
        "channel": "operations-team"
      },
      "mapper": {
        "text": "🎉 *New Client Alert!* {{1.properties.company}} just closed!\nWelcome email sent and ClickUp portal generated. Please prepare for the kickoff call."
      },
      "metadata": {
        "designer": {
          "x": 1200,
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

- `trackers/02_Sales_Pipeline_Tracker_2.xlsx`: binary attachment retained outside the Markdown kit; convert to CSV/Markdown during certification if the sheet contents become authoritative.

## Automation Blueprint

### SALES02-Blueprint.json

```json
{
  "name": "SALES02: Onboarding Trigger & Setup (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "hubspot:watchDeals",
      "version": 1,
      "parameters": {
        "pipeline": "default",
        "stage": "closed_won"
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
      "module": "clickup:createFolder",
      "version": 1,
      "parameters": {
        "space_id": "YOUR_CLIENT_SPACE_ID"
      },
      "mapper": {
        "name": "{{1.properties.company}} - Client Portal"
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
      "module": "clickup:createTaskFromTemplate",
      "version": 1,
      "parameters": {
        "list_id": "{{2.id}}",
        "template_id": "YOUR_ONBOARDING_TEMPLATE_ID"
      },
      "mapper": {
        "name": "Phase 1: Onboarding for {{1.properties.company}}"
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
      "module": "gmail:sendEmail",
      "version": 1,
      "parameters": {},
      "mapper": {
        "to": "{{1.properties.contact_email}}",
        "subject": "Welcome to [Agency Name]! Let's get started. 🚀",
        "content": "Hi {{1.properties.contact_name}},<br><br>It's official! We're thrilled to partner with {{1.properties.company}}... [Insert Full Asset 1 Copy Here]"
      },
      "metadata": {
        "designer": {
          "x": 900,
          "y": 0
        }
      }
    },
    {
      "id": 5,
      "module": "slack:createMessage",
      "version": 1,
      "parameters": {
        "channel": "operations-team"
      },
      "mapper": {
        "text": "🎉 *New Client Alert!* {{1.properties.company}} just closed!\nWelcome email sent and ClickUp portal generated. Please prepare for the kickoff call."
      },
      "metadata": {
        "designer": {
          "x": 1200,
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

- `automation/SALES02-Blueprint.json`: YOUR_CLIENT_SPACE_ID, YOUR_ONBOARDING_TEMPLATE_ID

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
