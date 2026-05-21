---
schema: kit/1.0
slug: sal-01-proposals-contracts
title: "SAL-01 - Proposals & Contracts"
summary: "Sales workflow package for Proposals & Contracts. Consolidates registry metadata, imported source references, setup guidance, validation notes, and automation blueprints into one operative kit file."
version: 0.1.0-draft
owner: uncle-robert-consulting
license: UNLICENSED
status: imported-draft
conformance: draft
certifiedAt: null
workflowId: SAL-01
department: "Sales"
automationLevel: "85-90%"
primaryOwner: "Robert + Account Managers"
trigger: "MQL handoff from Marketing"
cycleTime: "Draft: 24-72 hrs; signed: within 7 days"
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

# SAL-01 - Proposals & Contracts

This is the consolidated `kit.md` for the workflow. It replaces the old imported-package surface as the operative file while keeping source, asset, tracker, and automation files as provenance until certification is complete.

## Goal

Run the Proposals & Contracts workflow for Sales with a repeatable trigger, owner, cycle time, outputs, and validation path. The current draft is strong enough for agent orientation and controlled internal use; certification still requires a live run or documented manual evidence.

## When to Use

Use this workflow when the trigger occurs: **MQL handoff from Marketing**.

Use it as part of the URC operating system first. Convert it into a client-safe variant only after URC-specific names, internal assumptions, and tool choices have been scrubbed or intentionally parameterized.

## Registry Metadata

| Field | Value |
| --- | --- |
| Workflow ID | SAL-01 |
| Department | Sales |
| Automation level | 85-90% |
| Owner | Robert + Account Managers |
| Trigger | MQL handoff from Marketing |
| Cycle time | Draft: 24-72 hrs; signed: within 7 days |
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

1. Confirm the trigger: MQL handoff from Marketing.
2. Open the relevant source or asset file from the Source Map.
3. Collect the minimum inputs needed for this cycle.
4. Execute the workflow steps using the imported source as the detailed operating guide.
5. Capture output evidence, exceptions, and follow-up tasks.
6. Record meaningful package or behavior changes in `docs/operations/change-control-register.md`.

## Source Digest

- `URC-SAL-01_Offer_Clarity_Positioning.md`: Source file imported and retained for detailed workflow extraction.

## Source Map

| Artifact | Purpose |
| --- | --- |
| `source/URC-SAL-01_Offer_Clarity_Positioning.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `assets/SALES01-Assets.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `automation/SALES01-Blueprint.json` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `trackers/01_Sales_Pipeline_Tracker_1.xlsx` | Retained provenance/input artifact now referenced by this consolidated kit. |

## Embedded Source and Asset Documents

### source/URC-SAL-01_Offer_Clarity_Positioning.md

````markdown
# SAL-01 - Proposals & Contracts Source

Source: `Sales Department\urc sales docs\URC-SAL-01_Offer_Clarity_Positioning.docx`

This Markdown file is a text extraction of the source `.docx` for GitHub-readable access. Preserve the source path in citations until the workflow is fully converted into `kit.md` format.

UNCLE ROBERT CONSULTING LLC

URC-SAL-01 — Offer Clarity & Positioning

## Owner: Robert T. McCarthy & Sheena Burns   |   v1.0   |   March 21, 2026

1. Why This Document Exists

Every sales conversation at Uncle Robert Consulting starts with the same fundamental requirement: Robert and Sheena must be able to say clearly — out loud, without hesitation — what URC does, who it's for, what it costs, and what the client gets. Without that clarity, no sales system will work. This document defines the offer. Everything else in the Sales department flows from here.

2. The Core Offer

Uncle Robert Consulting builds AI-powered growth systems for small businesses and content creators —

so they can capture leads, follow up automatically, and grow their income without working more hours.

We don't just advise. We build it with you, we show you how it works, and we stay until it does.

When someone asks "what do you do" — this is the answer. Practice saying it. It should feel like breathing.

3. Who This Is For

Not every small business is a good fit. URC works best with clients who match this profile:

Dimension

URC's Ideal Client

Who they are

Small business owners, service providers, and content creators running a 1–5 person operation

Where they are

Currently operating — they have customers or an audience, but things feel chaotic or stalled

What they feel

Overwhelmed by manual tasks, losing leads after hours, unsure how to use AI without a technical background

What they want

A business that works more consistently, generates income more predictably, and doesn't require them to be on call 24/7

What they can invest

$500–$2,500 for a defined project, or $500–$1,500/month for ongoing support

What they're NOT

Startups with no customers yet, enterprise businesses, or anyone who wants a hands-off "just fix it" solution

4. The Service Menu

URC offers three clearly defined service tiers. Having named, priced options ends the confusion about "what do I quote them." Robert and Sheena should be able to recite these from memory.

Tier 1 — The AI Jumpstart ($500 one-time)

Best for: A client who needs to see what AI can do for their business before committing to anything larger.

One 90-minute discovery and strategy session (Robert or Sheena leads)

A written AI Opportunity Map — 3-5 specific places in their business where AI can save time or generate leads

One simple automation built and handed off — typically a lead capture or follow-up response

30-day email access for questions after delivery

What they walk away with: Clarity, one working tool, and a roadmap for what comes next.

Tier 2 — The AI Growth Pod ($1,500 one-time setup + optional $500/month support)

Best for: A client ready to build a real AI-powered growth system for their business.

Full discovery process — 2-3 sessions to understand their business, leads, and operations

Custom AI agent build — lead capture, 24/7 response, and automated follow-up on their existing website or platform

7-email welcome and nurture sequence — configured and connected

Booking and scheduling setup — Microsoft Bookings or equivalent connected and working

Training session — client and any relevant team members learn how to manage and update the system

30-day post-launch support included in setup fee

Optional: $500/month for ongoing optimization, content updates, and monthly check-in call

What they walk away with: A business that captures and follows up with leads automatically, even when they're asleep.

Tier 3 — The Consulting Retainer ($1,000–$2,000/month)

Best for: A client who wants Robert or Sheena as an ongoing strategic partner — not just a builder.

Monthly strategy call (60-90 minutes) — review what's working, what to build next, what to stop doing

Up to 5 hours of implementation support per month — builds, adjustments, new automations

Priority email access — responses within 24 hours

Quarterly business review — a structured look at progress, metrics, and next quarter's priorities

What they walk away with: A thinking partner who knows their business and builds alongside them every month.

5. Pricing Confidence Rules

RULE: Never quote a price apologetically. The price is the price.

RULE: Never discount before being asked. Discounting first signals that the price wasn't real.

RULE: If the price is genuinely too much for someone, offer a smaller tier — don't reduce the existing one.

RULE: If you're uncertain which tier fits, ask one question: 'What does success look like in 90 days for you?'

Their answer will tell you which tier to recommend.

6. How to Position in Conversation

The goal of every positioning conversation is not to sell — it is to help the other person understand whether URC is right for them. If it is, they'll say yes. If it isn't, Robert and Sheena should be willing to say so honestly.

Situation

What to Say

At a networking event or casual intro

"I build AI-powered systems for small businesses — things like 24/7 lead capture and automated follow-up. Most of my clients save 10+ hours a week once we get it set up."

When someone asks what it costs

"It depends on what you need. I have a $500 option that's a strategy session and one automation, and a $1,500 build for clients who are ready to put a full system in place."

When someone says 'I'm not sure AI is for me'

"That's fair — most people feel that way at first. The question I'd ask is: are you currently losing leads because you can't respond fast enough? If yes, AI probably has something for you."

When someone says 'I can't afford that right now'

"I understand — the Jumpstart at $500 is designed exactly for that situation. You get a real working tool and a clear roadmap without the bigger investment upfront."

When someone asks if it works

"Every client we've worked with has seen a measurable improvement in how their business captures and responds to leads. I can walk you through what we've built if that's helpful."

7. What Sheena's Role Is Here

Sheena's natural coaching presence is a positioning asset, not just a delivery asset. When Sheena is in a conversation — even casually — her ability to make people feel heard and understood is itself a sales tool. She doesn't need to pitch. She needs to listen, ask good questions, and let people arrive at their own interest.

Sheena leads Tier 1 (Jumpstart) discovery conversations whenever her schedule allows — her coaching instinct is perfectly suited to this format

Sheena is listed as a co-presenter on all URC positioning materials — this is a two-person agency with complementary strengths

When Sheena interacts with any warm contact — even at Casey's, even casually — the positioning sentence above is what she says if asked what she does outside work

8. Review Cadence

This document is reviewed quarterly and whenever pricing or service scope changes

Any change to pricing requires both Robert and Sheena to agree — this is a co-founder decision

## Owner: Robert T. McCarthy and Sheena Burns

Version

Date

Author

Summary of Changes

v1.0

March 21, 2026

R. McCarthy & S. Burns

Initial URC-specific document — built from actual client history
````

### assets/SALES01-Assets.md

````markdown
# SALES01: Proposals & Contracts Assets

## 1. Proposal Executive Summary Template
*To be generated by AI and reviewed by the sales rep.*

**[Company Name] + [Agency Name]: Strategic Partnership Proposal**

**The Current Situation**
Based on our conversations with [Key Stakeholder Name], we understand that [Company Name] is currently struggling with [Core Pain Point 1] and [Core Pain Point 2]. This is causing [Negative Business Impact, e.g., a 20% drop in lead velocity] and preventing you from reaching your goal of [Primary Goal] by [Target Date].

**Our Recommended Approach**
To solve this, [Agency Name] recommends a [Service Name/Tier] engagement. This approach specifically targets your bottlenecks by:
1. **[Key Solution Pillar 1]**: [Brief explanation of how it solves Pain Point 1]
2. **[Key Solution Pillar 2]**: [Brief explanation of how it solves Pain Point 2]
3. **[Key Solution Pillar 3]**: [Brief explanation of how it accelerates the Primary Goal]

**Expected Outcomes (ROI Projection)**
By implementing this framework, we project:
- **Phase 1 (Days 1-30)**: [Immediate quick win, e.g., Full system audit and infrastructure deployed]
- **Phase 2 (Days 31-90)**: [Mid-term goal, e.g., 15% increase in lead conversion]
- **Phase 3 (Days 90+)**: [Long-term goal, e.g., Stabilized CPL at target $X]

*Note: These projections are based on our work with similar companies in the [Industry] space, such as [Case Study Client 1] and [Case Study Client 2].*

---

## 2. Proposal Delivery Email
**Subject:** The [Agency Name] + [Company Name] Gameplan

Hi [First Name],

Great speaking with you and the team on [Day of week].

As promised, I've put together a comprehensive gameplan detailing exactly how we can help [Company Name] eliminate [Pain Point] and hit [Goal].

**You can view the interactive proposal here: [Link to Proposal Platform]**

*I also recorded a quick 3-minute video walkthrough of the proposal so you know exactly what you're looking at:*
[Loom Video Thumbnail Link]

I know you have a meeting with the board on Thursday, so this should give you everything you need.

Take a look, share it with the team, and let me know if you have any questions before our follow-up call on [Date].

Best,
[Your Name]

---

## 3. Proposal Follow-Up Sequence (If No Response)

### Touch 1 (Day 3)
**Subject:** Any questions on the gameplan, [First Name]?
**Body:**
Hi [First Name] - Just floating this to the top of your inbox. Did you and [Other Stakeholder Name] have a chance to review the proposal I sent over on [Day]? Happy to clarify any of the deliverables or timeline if needed.

### Touch 2 (Day 6)
**Subject:** Re: The [Agency Name] + [Company Name] Gameplan
**Body:**
Hi [First Name],

I know things get busy. Usually, when I don't hear back at this stage, it means one of two things:
1. You're swamped and haven't had a chance to review it yet.
2. Something in the proposal (like timeline or budget) was off the mark.

If it's the latter, let me know! We can always adjust the scope to better fit where you're at right now.

### Touch 3 (Day 10) - The Breakup
**Subject:** Closing the loop
**Body:**
Hi [First Name],

I haven't heard back regarding the proposal, so I'm going to assume that tackling [Pain Point] isn't a priority for this quarter.

I'll pause my outreach for now so I don't clutter your inbox, but I'll keep an eye on [Company Name]'s growth from afar! Reach out whenever the timing is right.
````

### automation/SALES01-Blueprint.json

````json
{
  "name": "SALES01: Proposal Generation (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "hubspot:watchDeals",
      "version": 1,
      "parameters": {
        "pipeline": "default",
        "stage": "proposal_requested"
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
            "content": "Generate a highly customized Executive Summary for a proposal based on the following CRM deal notes."
          },
          {
            "role": "user",
            "content": "Company: {{1.properties.company}}\nPain Points: {{1.properties.pain_points}}\nGoals: {{1.properties.goals}}"
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
      "module": "pandadoc:createDocument",
      "version": 1,
      "parameters": {
        "template_uuid": "YOUR_TEMPLATE_ID"
      },
      "mapper": {
        "name": "Proposal for {{1.properties.company}}",
        "tokens": [
          {
            "name": "Company_Name",
            "value": "{{1.properties.company}}"
          },
          {
            "name": "Executive_Summary",
            "value": "{{2.choices[0].message.content}}"
          },
          {
            "name": "Deal_Value",
            "value": "{{1.properties.amount}}"
          }
        ],
        "recipients": [
          {
            "email": "{{1.properties.contact_email}}",
            "first_name": "{{1.properties.contact_name}}"
          }
        ]
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
        "channel": "sales-proposals"
      },
      "mapper": {
        "text": "📄 Draft proposal generated for {{1.properties.company}}! It is ready for your review and video personalization in PandaDoc."
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

- `trackers/01_Sales_Pipeline_Tracker_1.xlsx`: binary attachment retained outside the Markdown kit; convert to CSV/Markdown during certification if the sheet contents become authoritative.

## Automation Blueprint

### SALES01-Blueprint.json

```json
{
  "name": "SALES01: Proposal Generation (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "hubspot:watchDeals",
      "version": 1,
      "parameters": {
        "pipeline": "default",
        "stage": "proposal_requested"
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
            "content": "Generate a highly customized Executive Summary for a proposal based on the following CRM deal notes."
          },
          {
            "role": "user",
            "content": "Company: {{1.properties.company}}\nPain Points: {{1.properties.pain_points}}\nGoals: {{1.properties.goals}}"
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
      "module": "pandadoc:createDocument",
      "version": 1,
      "parameters": {
        "template_uuid": "YOUR_TEMPLATE_ID"
      },
      "mapper": {
        "name": "Proposal for {{1.properties.company}}",
        "tokens": [
          {
            "name": "Company_Name",
            "value": "{{1.properties.company}}"
          },
          {
            "name": "Executive_Summary",
            "value": "{{2.choices[0].message.content}}"
          },
          {
            "name": "Deal_Value",
            "value": "{{1.properties.amount}}"
          }
        ],
        "recipients": [
          {
            "email": "{{1.properties.contact_email}}",
            "first_name": "{{1.properties.contact_name}}"
          }
        ]
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
        "channel": "sales-proposals"
      },
      "mapper": {
        "text": "📄 Draft proposal generated for {{1.properties.company}}! It is ready for your review and video personalization in PandaDoc."
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

- `automation/SALES01-Blueprint.json`: YOUR_TEMPLATE_ID

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
