---
schema: kit/1.0
slug: sal-03-deals-discounts
title: "SAL-03 - Deals & Discounts"
summary: "Sales workflow package for Deals & Discounts. Consolidates registry metadata, imported source references, setup guidance, validation notes, and automation blueprints into one operative kit file."
version: 0.1.0-draft
owner: uncle-robert-consulting
license: UNLICENSED
status: imported-draft
conformance: draft
certifiedAt: null
workflowId: SAL-03
department: "Sales"
automationLevel: "85-90%"
primaryOwner: "Robert (approvals)"
trigger: "Stall detected or discount requested"
cycleTime: "Auto-approval: < 5 min; escalation: < 4 hrs"
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

# SAL-03 - Deals & Discounts

This is the consolidated `kit.md` for the workflow. It replaces the old imported-package surface as the operative file while keeping source, asset, tracker, and automation files as provenance until certification is complete.

## Goal

Run the Deals & Discounts workflow for Sales with a repeatable trigger, owner, cycle time, outputs, and validation path. The current draft is strong enough for agent orientation and controlled internal use; certification still requires a live run or documented manual evidence.

## When to Use

Use this workflow when the trigger occurs: **Stall detected or discount requested**.

Use it as part of the URC operating system first. Convert it into a client-safe variant only after URC-specific names, internal assumptions, and tool choices have been scrubbed or intentionally parameterized.

## Registry Metadata

| Field | Value |
| --- | --- |
| Workflow ID | SAL-03 |
| Department | Sales |
| Automation level | 85-90% |
| Owner | Robert (approvals) |
| Trigger | Stall detected or discount requested |
| Cycle time | Auto-approval: < 5 min; escalation: < 4 hrs |
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

1. Confirm the trigger: Stall detected or discount requested.
2. Open the relevant source or asset file from the Source Map.
3. Collect the minimum inputs needed for this cycle.
4. Execute the workflow steps using the imported source as the detailed operating guide.
5. Capture output evidence, exceptions, and follow-up tasks.
6. Record meaningful package or behavior changes in `docs/operations/change-control-register.md`.

## Source Digest

- `URC-SAL-03_Discovery_Call_Process.md`: Source file imported and retained for detailed workflow extraction.

## Source Map

| Artifact | Purpose |
| --- | --- |
| `source/URC-SAL-03_Discovery_Call_Process.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `assets/SALES03-Assets.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `automation/SALES03-Blueprint.json` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `trackers/03_Funding_Opportunity_Pipeline_1.xlsx` | Retained provenance/input artifact now referenced by this consolidated kit. |

## Embedded Source and Asset Documents

### source/URC-SAL-03_Discovery_Call_Process.md

````markdown
# SAL-03 - Deals & Discounts Source

Source: `Sales Department\urc sales docs\URC-SAL-03_Discovery_Call_Process.docx`

This Markdown file is a text extraction of the source `.docx` for GitHub-readable access. Preserve the source path in citations until the workflow is fully converted into `kit.md` format.

UNCLE ROBERT CONSULTING LLC

URC-SAL-03 — Discovery Call Process

## Owner: Robert T. McCarthy & Sheena Burns   |   v1.0   |   March 21, 2026

1. Why This Document Exists

A discovery call is not a sales pitch. It is a conversation where Robert or Sheena tries to genuinely understand whether URC can help someone — and where that someone decides whether they trust URC enough to move forward. When both of those things happen in the same conversation, a yes comes naturally. This document defines how to run that conversation well every single time.

The goal of a discovery call is not to close a sale.

The goal is to understand the person's situation so clearly

that the right next step becomes obvious to both of you.

2. Before the Call — Preparation (15 Minutes)

Every discovery call deserves preparation. Showing up without it signals that the other person's time doesn't matter.

Look up the person on LinkedIn and their business website — know who they are before you ask

Check HubSpot — have they had any previous interactions with URC? Notes from a referrer? Prior emails?

Review the service menu (SAL-01) — have all three tiers and their prices fresh in your mind

Have your Microsoft Bookings calendar open and confirmed — make sure the time slot is still clear

Open a blank Google Doc or notepad — you will take notes during the call

If Sheena is leading the call: brief Robert beforehand via text on who the person is and what you know about them

3. The Discovery Call Framework — LEARN

LEARN is a simple five-part framework for running a discovery conversation. It is not a script. It is a sequence of genuine questions that moves naturally from understanding to recommendation.

L — Listen First (5 minutes)

Open the call by giving them the floor before you take it.

"Before I tell you anything about what I do, I'd love to hear about your business — where things are right now and what brought you to this conversation."

Then be quiet. Let them talk. Most people have never had a consultant ask this question before launching into a pitch. It immediately differentiates URC.

E — Explore the Problem (10 minutes)

Ask questions that help you understand the real situation beneath the surface one. Use these:

"How are you currently capturing leads — and what happens after someone reaches out?"

"What does a typical week look like for you in terms of time spent on admin, follow-up, or things that feel repetitive?"

"Have you ever lost a potential client just because you didn't respond fast enough or follow up consistently?"

"What have you already tried to fix this — and what happened?"

Listen for: how much time they're losing, how many leads they're missing, whether they've tried tools before and been burned. These answers tell you which tier to recommend.

A — Acknowledge and Reflect (3 minutes)

Before you recommend anything, show that you heard them. This is where Sheena's coaching instinct is most valuable.

"What I'm hearing is that you're spending a lot of time chasing follow-ups manually, and you've probably lost some good leads just because you couldn't respond quickly enough. Does that feel right?"

Wait for them to confirm or correct you. This moment builds more trust than any feature list ever will.

R — Recommend Specifically (5 minutes)

Now — and only now — describe what URC would actually build for them. Be specific. Reference their situation, not a generic pitch.

"Based on what you've told me, here's what I think makes sense for you right now.

[Specific tier] — it would address [specific problem they mentioned] by [specific thing URC builds].

The investment is [price]. Most clients see [specific outcome] within [timeframe]."

Do not list everything URC can do. Only describe what solves their specific problem.

N — Next Step (2 minutes)

Every discovery call ends with a clear next step. Never end with "I'll follow up" as the only action.

If they're ready to move forward: "Great — I'll send you a simple one-page proposal by [tomorrow]. It outlines exactly what we'll build, what it costs, and how we get started. Does that work?"

If they need to think: "That's completely fair. I'll send you a summary of what we talked about and what I'd recommend. Take a few days — and just reply when you're ready to move forward or if you have questions."

If it's not a fit: "Based on what you've shared, I honestly don't think we're the right match right now — but here's what I'd suggest instead." Be honest. Referrals come from honesty.

4. Handling Common Responses

What They Say

What It Usually Means

What to Say

"I need to think about it"

They're interested but not yet convinced of the value or timing

"Of course — what specifically would you want to think through? I'm happy to answer questions now or in a follow-up email."

"I can't afford that right now"

Budget is real OR the value hasn't landed yet

"I understand. The Jumpstart at $500 is designed exactly for that situation. Would that be a better starting point?"

"I need to talk to my partner / spouse"

A genuine decision-maker is not on the call

"Of course — would it be helpful if I sent a one-page summary you could share with them? That way they have the full picture."

"Can you do it cheaper?"

Testing whether the price is firm OR genuinely limited budget

"The price reflects what it takes to do this well. What I can do is start with a smaller scope — the Jumpstart gets you real value at $500."

"We already tried something like this"

They've been burned before — trust is the issue

"Tell me about that experience — what happened?" Listen carefully. Then: "Here's what we do differently."

5. After the Call — Within 24 Hours

Log the call in HubSpot immediately — update lifecycle stage, add a note with key details from the conversation, set a follow-up task

Send a personal follow-up email (not a template — reference something specific from the conversation)

Attach or link the one-page proposal if they're moving forward (see SAL-04)

If it wasn't a fit — send a brief note anyway: "It was great meeting you. If your situation changes or you have questions, my door is always open." Doors close permanently when people feel dismissed.

Text or email Sheena a brief update if she wasn't on the call — keeps her connected to what's happening in the pipeline

6. Sheena's Role in Discovery Calls

Sheena's natural coaching instinct makes her exceptionally suited for the Listen and Acknowledge phases of this framework — the two phases that most determine whether someone trusts URC enough to move forward.

Sheena leads discovery calls for Tier 1 (Jumpstart) clients — this is well within her capacity even at reduced availability

On calls Robert leads: Sheena can join as a listener and handle the Acknowledge phase — her presence alone changes the dynamic

Sheena does not need to know all the technical details to run a great discovery call. She needs to know the three tiers, the prices, and how to listen. That's it.

7. Review Cadence

This document: reviewed after every 5 discovery calls — what questions worked, what felt awkward, what to adjust

LEARN framework: a living tool, not a script. Robert and Sheena adapt it to their natural voices over time.

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

### assets/SALES03-Assets.md

````markdown
# SALES03: Deals & Discounts Assets

## 1. Pipeline Stall Re-Engagement Sequence
*Triggered when a deal sits in the "Proposal Sent" stage for >7 days with no movement.*

### Touch 1 (Day 8): The "Did I miss the mark?" Email
**Subject:** Timing off for [Company Name]?
**Body:**
Hi [First Name],

I noticed things went quiet after I sent over the proposal last week.

Usually, when this happens, it means either:
1. You've been slammed with other priorities (totally understandable).
2. Something in the proposal (like the scope or the investment) missed the mark.

If it's the second one, let me know! We can always pull a few levers to adjust the scope and make the numbers work better for where you're at right now.

Let me know what you think.

### Touch 2 (Day 12): The Value-Add Resource
**Subject:** A different way to look at [Pain Point]
**Body:**
Hi [First Name],

I was talking to our Head of Strategy today about [Company Name] and he shared this quick 2-page checklist with me that he built for another client in your industry.

It covers exactly how to solve [Pain Point] without having to overhaul your entire system.

[Link to Resource]

I thought you might find it useful while you're evaluating your options.

### Touch 3 (Day 15): The Time-Limited Offer
**Subject:** Quick idea for [Company Name]
**Body:**
Hi [First Name],

I was looking at our capacity for next month, and we actually have a spot opening up on [Date] that would be perfect for kicking off your project.

If we're able to get the paperwork wrapped up by [Deadline Date - e.g., Friday], I can actually waive the standard $X onboarding fee to help you guys get moving faster.

Does it make sense to jump on a quick 5-minute call tomorrow to see if this works for you?

---

## 2. Discount Exception Request Form (Internal)
*To be filled out by sales rep when requesting a discount above their approved authority tier.*

**Client/Prospect Name:**
**Deal Value (Before Discount):**
**Current Deal Stage:**

**Requested Discount:**
- [ ] Percentage: ____%
- [ ] Fixed Amount: $____
- [ ] Waived Fee (Specify): ____________

**Justification (Select all that apply):**
- [ ] Competitive pressure (Must specify competitor below)
- [ ] Strategic logo/High-profile client
- [ ] Multi-year contract commitment
- [ ] Volume/Bundle discount
- [ ] Budget constraint (Client explicitly stated budget limit)
- [ ] Other

**Context / Business Case:**
*(Provide a 2-3 sentence explanation of why we will lose this deal without the discount, and why this client is worth the margin hit.)*

**Alternative Options Explored:**
*(Did you try removing scope? Offering a payment plan? Phased start? Explain why those didn't work.)*

---

## 3. Loyalty/Renewal Offer Template
*Sent 60 days before contract renewal.*

**Subject:** Your upcoming renewal + a quick thank you

Hi [First Name],

It's hard to believe we're coming up on our 1-year anniversary of working together!

Looking back, I'm really proud of what we've accomplished, especially [Highlight 1 major win].

Because you've been such a fantastic partner, we wanted to do something special for your renewal. If we lock in your contract for Year 2 by [Date], we're going to grandfather you in at your current rate (we're raising prices by 15% next month) AND we're going to include [Bonus Service/Upgrade] completely free for the next 12 months.

I've already drafted up the new agreement with these terms applied. You can review it here: [Link to Proposal]

Let me know if you want to jump on a call to review the gameplan for Year 2!
````

### automation/SALES03-Blueprint.json

````json
{
  "name": "SALES03: Pipeline Stall & Alert (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "hubspot:searchDeals",
      "version": 1,
      "parameters": {
        "filterGroups": [
          {
            "filters": [
              {
                "propertyName": "dealstage",
                "operator": "EQ",
                "value": "proposal_sent"
              },
              {
                "propertyName": "days_in_stage",
                "operator": "GTE",
                "value": "7"
              }
            ]
          }
        ]
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
            "content": "You are a sales manager. Analyze this stalled deal and recommend the best intervention strategy (e.g., send value resource, offer discount, call)."
          },
          {
            "role": "user",
            "content": "Deal: {{1.properties.dealname}}\nValue: {{1.properties.amount}}\nNotes: {{1.properties.recent_notes}}"
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
      "module": "slack:createMessage",
      "version": 1,
      "parameters": {
        "channel": "@{{1.properties.deal_owner_slack_handle}}"
      },
      "mapper": {
        "text": "⚠️ *Stalled Deal Alert!* ⚠️\n{{1.properties.dealname}} has been stuck in 'Proposal Sent' for over 7 days.\n\n*AI Recommendation:*\n{{2.choices[0].message.content}}\n\n*Action Required:* Please follow up today."
      },
      "metadata": {
        "designer": {
          "x": 600,
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

- `trackers/03_Funding_Opportunity_Pipeline_1.xlsx`: binary attachment retained outside the Markdown kit; convert to CSV/Markdown during certification if the sheet contents become authoritative.

## Automation Blueprint

### SALES03-Blueprint.json

```json
{
  "name": "SALES03: Pipeline Stall & Alert (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "hubspot:searchDeals",
      "version": 1,
      "parameters": {
        "filterGroups": [
          {
            "filters": [
              {
                "propertyName": "dealstage",
                "operator": "EQ",
                "value": "proposal_sent"
              },
              {
                "propertyName": "days_in_stage",
                "operator": "GTE",
                "value": "7"
              }
            ]
          }
        ]
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
            "content": "You are a sales manager. Analyze this stalled deal and recommend the best intervention strategy (e.g., send value resource, offer discount, call)."
          },
          {
            "role": "user",
            "content": "Deal: {{1.properties.dealname}}\nValue: {{1.properties.amount}}\nNotes: {{1.properties.recent_notes}}"
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
      "module": "slack:createMessage",
      "version": 1,
      "parameters": {
        "channel": "@{{1.properties.deal_owner_slack_handle}}"
      },
      "mapper": {
        "text": "⚠️ *Stalled Deal Alert!* ⚠️\n{{1.properties.dealname}} has been stuck in 'Proposal Sent' for over 7 days.\n\n*AI Recommendation:*\n{{2.choices[0].message.content}}\n\n*Action Required:* Please follow up today."
      },
      "metadata": {
        "designer": {
          "x": 600,
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
