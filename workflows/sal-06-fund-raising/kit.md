---
schema: kit/1.0
slug: sal-06-fund-raising
title: "SAL-06 - Fund Raising"
summary: "Sales workflow package for Fund Raising. Consolidates registry metadata, imported source references, setup guidance, validation notes, and automation blueprints into one operative kit file."
version: 0.1.0-draft
owner: uncle-robert-consulting
license: UNLICENSED
status: imported-draft
conformance: draft
certifiedAt: null
workflowId: SAL-06
department: "Sales"
automationLevel: "80-85%"
primaryOwner: "Robert T. McCarthy"
trigger: "Quarterly planning; growth initiative"
cycleTime: "Application: 2-8 weeks; investor: 3-12 months"
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

# SAL-06 - Fund Raising

This is the consolidated `kit.md` for the workflow. It replaces the old imported-package surface as the operative file while keeping source, asset, tracker, and automation files as provenance until certification is complete.

## Goal

Run the Fund Raising workflow for Sales with a repeatable trigger, owner, cycle time, outputs, and validation path. The current draft is strong enough for agent orientation and controlled internal use; certification still requires a live run or documented manual evidence.

## When to Use

Use this workflow when the trigger occurs: **Quarterly planning; growth initiative**.

Use it as part of the URC operating system first. Convert it into a client-safe variant only after URC-specific names, internal assumptions, and tool choices have been scrubbed or intentionally parameterized.

## Registry Metadata

| Field | Value |
| --- | --- |
| Workflow ID | SAL-06 |
| Department | Sales |
| Automation level | 80-85% |
| Owner | Robert T. McCarthy |
| Trigger | Quarterly planning; growth initiative |
| Cycle time | Application: 2-8 weeks; investor: 3-12 months |
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

1. Confirm the trigger: Quarterly planning; growth initiative.
2. Open the relevant source or asset file from the Source Map.
3. Collect the minimum inputs needed for this cycle.
4. Execute the workflow steps using the imported source as the detailed operating guide.
5. Capture output evidence, exceptions, and follow-up tasks.
6. Record meaningful package or behavior changes in `docs/operations/change-control-register.md`.

## Source Digest

- `URC-SAL-06_Sheena_Role_in_Sales.md`: Source file imported and retained for detailed workflow extraction.

## Source Map

| Artifact | Purpose |
| --- | --- |
| `source/URC-SAL-06_Sheena_Role_in_Sales.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `assets/SALES06-Assets.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `automation/SALES06-Blueprint.json` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `trackers/06_Onboarding_Checklist_Tracker_2.xlsx` | Retained provenance/input artifact now referenced by this consolidated kit. |

## Embedded Source and Asset Documents

### source/URC-SAL-06_Sheena_Role_in_Sales.md

````markdown
# SAL-06 - Fund Raising Source

Source: `Sales Department\urc sales docs\URC-SAL-06_Sheena_Role_in_Sales.docx`

This Markdown file is a text extraction of the source `.docx` for GitHub-readable access. Preserve the source path in citations until the workflow is fully converted into `kit.md` format.

UNCLE ROBERT CONSULTING LLC

URC-SAL-06 — Sheena's Role in Sales

## Owner: Robert T. McCarthy & Sheena Burns   |   v1.0   |   March 21, 2026

1. Why This Document Exists

Sheena Burns is a Co-Founder of Uncle Robert Consulting. She has a natural coaching presence that makes people feel genuinely heard — not performed coaching, just who she is. That is one of the most valuable things a sales conversation can offer. This document exists because Sheena's current distance from the agency is partly a confidence problem, not a capability problem — and the right role, clearly defined, gives her something specific to contribute even at reduced availability. Every win Sheena is part of is a reason for her to believe again.

This document is written for Sheena as much as it is about her.

If you're reading this, Sheena — this is what we see in you, and this is what we're asking you to do.

You don't need to be available full-time. You just need to show up for the things only you can do.

2. What Sheena Brings to Sales

Sheena's value in the sales process is not technical knowledge. It is human connection. Specifically:

People relax when Sheena talks to them — the natural coaching quality means they feel safe enough to tell the truth about their situation

Sheena asks questions that feel like care, not interrogation — this is the most important skill in a discovery call

Sheena's presence as Co-Founder signals that URC is a partnership, not a one-person operation — that matters to clients making trust decisions

Sheena has firsthand experience of what it feels like to be helped by Robert — that story, told in her own words, is more persuasive than any sales script

3. Sheena's Sales Role — Designed for Current Availability

This role is designed for someone working long hours at another job, living at a distance, and re-building confidence in the agency. It is not a full-time commitment. It is a series of specific moments where Sheena's presence makes a real difference.

Role 1 — Discovery Call Partner (As Available)

When a Tier 1 (Jumpstart) discovery call is booked and Sheena is available, she leads the call. Robert is available by phone if a technical question comes up she can't answer — but she handles the conversation.

What she does: Listen, acknowledge, ask the LEARN framework questions from SAL-03, recommend the Jumpstart tier if it fits

What she doesn't need to know: Technical build details, Make.com, HubSpot configuration, pricing history

What success looks like: The person on the other end of the call feels heard and has a clear understanding of what URC offers

Minimum availability needed: One 45-minute call, 24 hours notice preferred

Role 2 — Weekly Human Check-In With Robert (15 Minutes)

Once a week — same day, same time — Robert and Sheena have a 15-minute call or voice message exchange. This is not a business meeting. It is two co-founders staying connected.

What gets covered: One win from the past week (however small), one thing that felt hard, one thing coming up

Why it matters: The distance and the slow revenue growth can make the agency feel like it's Robert's project, not theirs. This call exists to counter that.

Who initiates: Robert initiates every week until momentum builds naturally

Role 3 — Social Proof Voice (When Ready)

Sheena became a client of URC before she became a Co-Founder. That story — her actual experience of being helped by Robert — is one of the most credible things URC can share publicly. When Sheena is ready:

A short written testimonial or a brief Loom video from Sheena about her experience as a client, on the URC website

A LinkedIn post, written in her own words, about why she believed in this enough to become a Co-Founder

This is not required. It is an invitation, available when she's ready. It is powerful precisely because it will be genuine.

Role 4 — Passive Referral (Ongoing, Low Effort)

Sheena meets people at Casey's in Trimble. Some of them own small businesses. Some of them are struggling with exactly the problems URC solves. Sheena doesn't need to pitch. She just needs one sentence:

"I actually co-own a consulting agency that helps small businesses set up AI tools — the kind that

capture leads and follow up automatically so you don't have to be on call 24/7.

If that ever sounds interesting, let me know and I can connect you with my partner."

That's it. No pitch. No close. No follow-up pressure. Just planting a seed in a real conversation with a real person who might know someone who needs us.

4. What Robert Commits to in Return

This section exists because a co-founder relationship requires reciprocity. Sheena showing up for sales requires Robert to show up for Sheena.

Robert initiates the weekly 15-minute check-in every week without exception — even if there's nothing to report

Every closed win is shared with Sheena personally before it's shared anywhere else — she hears good news first

Robert never presents URC publicly without acknowledging Sheena as Co-Founder — she is not a footnote

When URC generates its first consistent revenue, Sheena's contribution is recognized in how that revenue is shared — this is a partnership, not a sub-contractor relationship

Robert tells Sheena honestly when things are hard — the distance grew partly because Sheena was sensing struggles that weren't being named. Name them.

5. The Re-Engagement Path

The goal is not to return to where things were. The goal is to build something better from where you both actually are. Here is a realistic path:

## Phase

Timeframe

What Happens

Reconnect

Now — March 2026

Robert sends Sheena this document and asks for a 15-minute call. Not to discuss business. To acknowledge what's been hard and recommit to the partnership.

One Contribution

April 2026

Sheena leads one Tier 1 discovery call. Whatever the outcome — the act of doing it together matters more than the result.

Build Momentum

May–June 2026

If the first call goes well, Sheena takes on a regular rhythm of one call per week when available. Each win reinforces the next.

Re-integration

Q3 2026 onward

As URC revenue grows, Sheena's role expands to match her availability and interest. The partnership evolves from here.

6. A Note on Confidence

Sales confidence does not come from having the right script. It comes from genuinely believing that what you're offering helps people. Sheena has seen that firsthand — she was the one being helped before she was the one doing the helping. That lived experience is worth more than any training program.

When confidence feels low: go back to the beginning. Remember what it felt like when Robert helped you see a path forward. That is what URC offers every client. You don't need to perform confidence. You just need to remember what you already know is true.

7. Review Cadence

This document: reviewed by both Robert and Sheena every quarter — does Sheena's role still fit her actual availability and where she is?

The weekly check-in: permanent standing rhythm, not reviewed away

## Owner: Robert T. McCarthy and Sheena Burns — jointly

Version

Date

Author

Summary of Changes

v1.0

March 21, 2026

R. McCarthy & S. Burns

Initial URC-specific document — built from actual client history
````

### assets/SALES06-Assets.md

````markdown
# SALES06: Fund Raising Assets

## 1. Investor / Funder Pitch Deck Outline
*To be customized with agency-specific data using AI and design tools.*

**Slide 1: The Hook (Title Slide)**
- Company Name / Logo
- One-sentence value proposition (e.g., "The first AI-native agency scaling [Service] for [Industry].")

**Slide 2: The Problem**
- What is fundamentally broken in the market right now?
- Who is experiencing this pain? (Quantify the pain in dollars/hours lost).

**Slide 3: Our Solution (The "Aha" Moment)**
- How our agency solves this problem uniquely.
- Highlight the integration of AI to increase margins or speed of delivery.

**Slide 4: Market Opportunity**
- Total Addressable Market (TAM), Serviceable Available Market (SAM), Serviceable Obtainable Market (SOM).
- Why *now* is the exact right time for this solution.

**Slide 5: Traction & Validation**
- Key metrics: Current ARR/MRR, client count, growth rate.
- Logos of top clients.
- NPS or retention rate highlighting client satisfaction.

**Slide 6: Business Model & Economics**
- How we make money (Retainers, one-off projects, passive products).
- Unit economics (CAC, LTV, Gross Margin).

**Slide 7: The "Moat" (Competitive Advantage)**
- Why can't someone else just copy this? (Proprietary AI workflows, exclusive partnerships, unique data assets).

**Slide 8: The Team**
- Founder(s) background.
- Key leadership team members and why they are the exact right people to execute this vision.

**Slide 9: The Ask (Funding Requirements)**
- How much capital we are raising / applying for.
- What exactly the funds will be used for (e.g., 40% Sales & Marketing, 40% Product/Tech dev, 20% Key hires).
- What milestones this capital will get us to.

---

## 2. Warm Introduction Request Email
*To be sent to a mutual connection asking for an intro to an investor.*

**Subject:** Quick question regarding [Investor Name]

Hi [Mutual Connection Name],

Hope things are going well over at [Their Company]! I saw your recent post about [Topic]—really great stuff.

I'm reaching out because we are putting together our next round of funding for [Agency Name], and I saw that you are connected with [Investor Name] at [Fund Name].

We've grown to [Current Revenue/Metric] in the last 12 months by building AI-native workflows for [Industry], and [Investor Name]'s recent investments in the [Space] sector caught my eye.

If you feel comfortable, would you be open to forwarding a brief blurb about us to [Investor Name] to see if they'd be open to a quick chat?

I've included a forwardable email below to make it super easy. No pressure either way!

Best,
[Your Name]

---
**[Forwardable Blurb to include below]**
Hi [Investor Name],
I wanted to put [Your Name], founder of [Agency Name], on your radar. They are building an AI-native agency that helps [Target Audience] achieve [Result]. They've already hit [Impressive Metric, e.g., $X ARR] and are raising capital to scale their proprietary automation tech. I thought it might align well with your recent thesis on [Topic]. Let me know if you'd like me to connect you two!
---

## 3. Investor Update Email Template (Monthly/Quarterly)
*Used to keep potential and current investors engaged and updated on traction.*

**Subject:** [Agency Name] Update: [Month/Year] - [One Major Highlight]

Hi everyone,

Here is our latest update for [Month].

**The TL;DR:**
- **Revenue:** $[X] MRR (+X% MoM)
- **Cash in Bank:** $[X]
- **Burn Rate:** $[X]
- **Runway:** [X] months

**🌟 Highlights & Wins:**
- We successfully closed [Big Client Name], increasing our ACV by X%.
- We launched our new passive digital product, which generated $[X] in its first week.
- [Key Hire] joined our team as [Role], coming from [Impressive past company].

**🚧 Challenges & Learnings:**
- We saw slightly higher churn in the [Specific Segment] this month. We realized our onboarding process needed a tweak, which we have now fully automated.

**🤝 Asks/How You Can Help:**
- We are currently looking for introductions to [Specific Title, e.g., VPs of Marketing] at [Type of Company, e.g., Series B SaaS companies]. If you know anyone, please reply!

As always, thank you for your support.
Best,
[Your Name]
````

### automation/SALES06-Blueprint.json

````json
{
  "name": "SALES06: Funding Pipeline Alerts (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "hubspot:watchDeals",
      "version": 1,
      "parameters": {
        "pipeline": "funding_pipeline",
        "stage": "application_submitted"
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
      "module": "builtin:BasicSleep",
      "version": 1,
      "parameters": {
        "delay": 1209600
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
      "module": "hubspot:getDeal",
      "version": 1,
      "parameters": {
        "deal_id": "{{1.id}}"
      },
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
      "module": "builtin:Router",
      "version": 1,
      "parameters": {},
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
      "module": "slack:createMessage",
      "version": 1,
      "parameters": {
        "channel": "leadership-team"
      },
      "mapper": {
        "text": "⏰ *Funding Follow-Up Reminder!*\nIt's been 14 days since we submitted the application/pitch for {{1.properties.dealname}}.\n\n*Action:* Please send a check-in email to the contact to ensure they received all materials and ask if they need any due diligence docs."
      },
      "metadata": {
        "designer": {
          "x": 1200,
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

- `trackers/06_Onboarding_Checklist_Tracker_2.xlsx`: binary attachment retained outside the Markdown kit; convert to CSV/Markdown during certification if the sheet contents become authoritative.

## Automation Blueprint

### SALES06-Blueprint.json

```json
{
  "name": "SALES06: Funding Pipeline Alerts (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "hubspot:watchDeals",
      "version": 1,
      "parameters": {
        "pipeline": "funding_pipeline",
        "stage": "application_submitted"
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
      "module": "builtin:BasicSleep",
      "version": 1,
      "parameters": {
        "delay": 1209600
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
      "module": "hubspot:getDeal",
      "version": 1,
      "parameters": {
        "deal_id": "{{1.id}}"
      },
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
      "module": "builtin:Router",
      "version": 1,
      "parameters": {},
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
      "module": "slack:createMessage",
      "version": 1,
      "parameters": {
        "channel": "leadership-team"
      },
      "mapper": {
        "text": "⏰ *Funding Follow-Up Reminder!*\nIt's been 14 days since we submitted the application/pitch for {{1.properties.dealname}}.\n\n*Action:* Please send a check-in email to the contact to ensure they received all materials and ask if they need any due diligence docs."
      },
      "metadata": {
        "designer": {
          "x": 1200,
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

- No obvious placeholder tokens were found in imported Markdown or JSON artifacts.

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
