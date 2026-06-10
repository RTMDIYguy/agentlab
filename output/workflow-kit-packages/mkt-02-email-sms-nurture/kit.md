---
schema: kit/1.0
slug: mkt-02-email-sms-nurture
title: "MKT-02 - Email/SMS Nurture"
summary: "Marketing workflow package for Email/SMS Nurture. Consolidates registry metadata, imported source references, setup guidance, validation notes, and automation blueprints into one operative kit file."
version: 0.1.0-draft
owner: uncle-robert-consulting
license: UNLICENSED
status: imported-draft
conformance: draft
certifiedAt: null
workflowId: MKT-02
department: "Marketing"
automationLevel: "85-90%"
primaryOwner: "Marcus + Robert"
trigger: "Lead qualified as Warm/Cold"
cycleTime: "30-90 day sequences; continuous"
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
  - mkt
  - marketing
---

# MKT-02 - Email/SMS Nurture

This is the consolidated `kit.md` for the workflow. It replaces the old imported-package surface as the operative file while keeping source, asset, tracker, and automation files as provenance until certification is complete.

## Goal

Run the Email/SMS Nurture workflow for Marketing with a repeatable trigger, owner, cycle time, outputs, and validation path. The current draft is strong enough for agent orientation and controlled internal use; certification still requires a live run or documented manual evidence.

## When to Use

Use this workflow when the trigger occurs: **Lead qualified as Warm/Cold**.

Use it as part of the URC operating system first. Convert it into a client-safe variant only after URC-specific names, internal assumptions, and tool choices have been scrubbed or intentionally parameterized.

## Registry Metadata

| Field | Value |
| --- | --- |
| Workflow ID | MKT-02 |
| Department | Marketing |
| Automation level | 85-90% |
| Owner | Marcus + Robert |
| Trigger | Lead qualified as Warm/Cold |
| Cycle time | 30-90 day sequences; continuous |
| Source status | Imported source |

## Inputs

- Trigger event or planning cadence identified above.
- Current URC operating context for Marketing.
- Any imported source, asset, tracker, or automation artifacts listed in the Source Map.
- Human approval from the owner before external sends, money movement, access changes, or client-visible commitments.

## Setup

1. Read this kit end to end.
2. Review the Source Digest and Source Map below.
3. Bind any placeholders listed in Placeholder and Binding Notes.
4. If an automation blueprint is embedded, import or rebuild it in the chosen runtime only after credentials and fallback paths are confirmed.
5. Run the Validation checklist before treating the workflow as complete.

## Quickstart

1. Confirm the trigger: Lead qualified as Warm/Cold.
2. Open the relevant source or asset file from the Source Map.
3. Collect the minimum inputs needed for this cycle.
4. Execute the workflow steps using the imported source as the detailed operating guide.
5. Capture output evidence, exceptions, and follow-up tasks.
6. Record meaningful package or behavior changes in `docs/operations/change-control-register.md`.

## Source Digest

- `URC-MKT-02_Email_SMS_Nurture.md`: This document defines how Uncle Robert Consulting nurtures leads from first contact through readiness for a sales conversation. Most of our ideal clients are not ready to buy the moment they discover us — they need to understand what AI-native consulting means for their business, see proof that it works, and develop enough trust to invest. Our nurture system does that work consistently, even when Robert is focused on client delivery. Automation Level Human Involvement Typical Cycle Time 75-80% Robert: sequence design, content strategy, personal outreach for hot signals, sequence optimization 30-60 day nurture sequence from first contact to sales-ready status 3. Nurture Philosophy We nurture like Uncle Robert consults — by giving real value before asking for anything. Every email in our sequences should be worth reading even if the recipient never becomes a client.

## Source Map

| Artifact | Purpose |
| --- | --- |
| `source/URC-MKT-02_Email_SMS_Nurture.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `assets/Marketing_Workflow_2_Email_SMS_Nurture.csv` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `assets/MKT02-Assets.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `automation/MKT02-Nurture-Enrollment-Blueprint.json` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `trackers/MKT02_Email_SMS_Nurture_Tracker.xlsx` | Retained provenance/input artifact now referenced by this consolidated kit. |

## Embedded Source and Asset Documents

### source/URC-MKT-02_Email_SMS_Nurture.md

````markdown
# MKT-02 - Email/SMS Nurture Source

Source: `Marketing Department\urc marketing\URC-MKT-02_Email_SMS_Nurture.docx`

This Markdown file is a text extraction of the source `.docx` for GitHub-readable access. Preserve the source path in citations until the workflow is fully converted into `kit.md` format.

## UNCLE ROBERT CONSULTING LLC

URC-MKT-02 — Email & SMS Nurture

Owner: Robert T. McCarthy, Founder & CEO   |   Version: v1.0   |   Updated: March 21, 2026

1. Document Purpose

This document defines how Uncle Robert Consulting nurtures leads from first contact through readiness for a sales conversation. Most of our ideal clients are not ready to buy the moment they discover us — they need to understand what AI-native consulting means for their business, see proof that it works, and develop enough trust to invest. Our nurture system does that work consistently, even when Robert is focused on client delivery.

2. Workflow Overview

Automation Level

Human Involvement

Typical Cycle Time

75-80%

Robert: sequence design, content strategy, personal outreach for hot signals, sequence optimization

30-60 day nurture sequence from first contact to sales-ready status

3. Nurture Philosophy

We nurture like Uncle Robert consults — by giving real value before asking for anything.

Every email in our sequences should be worth reading even if the recipient never becomes a client.

We are building a relationship, not running a drip campaign.

4. Nurture Tracks

Track Name

## Trigger

Audience

Length

Primary Goal

New Subscriber Welcome

Email list signup or lead magnet download

Cold or warm lead, first contact

7 emails / 14 days

Establish trust, deliver immediate value, introduce URC's approach

Content Creator Track

ICP identified as content creator

Creators, YouTubers, podcasters, writers

5 emails / 21 days

Address creator-specific pain points; show AI Pod relevance to their world

Small Business Owner Track

ICP identified as local/service business

Real estate, contractors, service pros

5 emails / 21 days

Address operations, lead follow-up, and after-hours response pain points

Re-Engagement Track

No email open in 21+ days

Cold subscribers

3 emails / 10 days

Win back attention or clean the list

Post-Strategy Session

Strategy call completed, no close yet

Hot lead, not yet a client

4 emails / 14 days

Address objections, reinforce ROI, maintain relationship

5. Welcome Sequence (7-Email Template)

Email #

Timing

Subject Theme

Content Focus

## CTA

1

Immediate

Welcome + What to Expect

Robert's story, why URC exists, what's coming

No CTA — just connection

2

Day 2

The Problem Most Small Businesses Don't See

The hidden cost of manual follow-up and lost leads

Read the blog post

3

Day 4

What an AI Growth Pod Actually Is

Demystify AI — plain language explanation of what we build

Book a free strategy session

4

Day 7

The Marcus & Rivera Story

Full case study breakdown — real numbers, real results

Read the full case study

5

Day 10

3 Questions to Know If You're Ready for AI

Self-assessment — drives engagement and segmentation

Reply with your answers

6

Day 12

What Working With Uncle Robert Looks Like

Day-in-the-life of a URC client — sets expectations clearly

No CTA — relationship

7

Day 14

One Thing I Want You to Know

Personal message from Robert — genuine, not salesy

Book a call if you're ready

6. Email Standards & Voice

6.1 URC Email Voice

Warm and direct — like a text from a trusted friend who happens to know a lot about AI

Short paragraphs — 2-3 sentences max. White space is your friend.

Personal references — mention Robert's name, reference real clients (with permission), share real lessons

No corporate speak — never use phrases like "synergy", "leverage", "holistic approach"

Conversational subject lines — lower case, no exclamation marks, reads like a real email

6.2 Formatting Rules

Plain text preferred over heavy HTML — more personal, better deliverability

Maximum one CTA per email — never two

PS line: always include one — it's the most-read part of any email

Mobile-first — all emails tested on mobile before sending

7. Tools & Systems

Tool

Role in Nurture

Mailchimp

Primary email platform — sequence automation, list management, broadcast sends

HubSpot CRM

Contact source of truth — engagement history, tags, sequence status sync

Make.com

Webhook triggers: new HubSpot contacts → Mailchimp enrollment based on persona

Claude / ChatGPT

Draft email copy for sequences; Robert reviews and personalizes before activating

Google Analytics

UTM tracking on all email links — measures which emails drive website behavior

Loom

Occasional personal video emails for high-value contacts — embedded in email body

8. Segmentation & Personalization

URC's nurture is segmented by persona type — not just by behavior. Every new contact is tagged in HubSpot within 24 hours based on how they found us and what they told us about themselves. Make.com reads that tag and enrolls them in the correct Mailchimp track automatically.

HubSpot Tag

Assigned When

Mailchimp Track

persona:creator

Lead identifies as creator, mentions YouTube/podcast/blog

Content Creator Track

persona:local-biz

Lead mentions physical location, service business, or local operation

Small Business Owner Track

persona:solopreneur

Lead is solo operator, no employees, primarily digital

Welcome → then routed to closest match

status:cold

No email open in 21 days

Re-Engagement Track (auto-triggered)

status:post-call

Strategy call completed

Post-Strategy Session Track

9. KPIs & Targets

Metric

Target

How Measured

Email open rate

> 27%

Mailchimp campaign reports

Click-through rate

> 4%

Mailchimp click tracking + Google Analytics UTM

Unsubscribe rate

< 0.5% per send

Mailchimp list health reports

Nurture-to-strategy call rate

> 12%

HubSpot: leads enrolled vs. calls booked

List growth / month

+ 50+ subscribers

Mailchimp subscriber growth report

Re-engagement success rate

> 20% of cold list

Mailchimp re-engagement campaign stats

10. Implementation Checklist

## Phase 1 — Complete

7-email Welcome Sequence live in Mailchimp

Make.com: HubSpot new contact → Mailchimp enrollment automation active

Marcus & Rivera case study email written and scheduled

## Phase 2 — In Progress

Content Creator Track written and loaded into Mailchimp

Small Business Owner Track written and loaded into Mailchimp

Re-Engagement Track written and automated (21-day trigger)

## Phase 3 — Planned

Post-Strategy Session Track written

A/B testing framework activated for subject lines

Monthly email performance review cadence established

Version

Date

Author

Summary of Changes

v1.0

March 21, 2026

R. McCarthy

Initial URC-specific document
````

### assets/Marketing_Workflow_2_Email_SMS_Nurture.csv

````csv
Step,Trigger/Action,Owner,Tool/System,Data_Fields,SLA_Target
1,TRIGGER: Contact enters nurture stage OR Behavior detected OR Time-based schedule OR Manual enrollment,System/Marketing,Marketing automation platform / Behavioral trigger / Scheduled workflow,"trigger_type, contact_id, enrollment_timestamp, nurture_track, entry_source",Per schedule or immediate
2,"Segment contacts by persona, stage, industry, engagement level, preferences",Automation (Segmentation),"CRM segmentation / CDP (Segment, mParticle) / List management","persona_type, buyer_stage, industry, company_size, engagement_tier, time_zone",< 15 minutes
3,"Select appropriate nurture track (awareness, consideration, decision, retention)",Marketing Automation,"Marketing automation (HubSpot, Marketo, ActiveCampaign, Klaviyo)","nurture_track_name, content_theme, expected_duration, goal_conversion_event",< 5 minutes
4,"Personalize content dynamically per contact (name, company, pain points, interests)",Automation (Personalization),Liquid/Handlebars templating / Dynamic content blocks / AI content engine,"personalization_tokens, dynamic_content_rules, relevant_pain_points, interests",< 30 minutes before send
5,AI-optimize send time and channel (email vs SMS) based on individual engagement history,AI (Send-Time Optimization),"Send-time optimization AI (Seventh Sense, Mailchimp) / Channel preference","optimal_send_time, preferred_channel, historical_engagement_pattern",Per AI calculation
6,Send first touchpoint in sequence with relevant educational or promotional content,Email/SMS Service,SendGrid / Twilio / Postmark / Klaviyo / Customer.io,"message_sent_id, content_type, subject_line, preview_text, send_timestamp",Per schedule
7,"Track delivery, opens, clicks, replies, SMS responses in real-time",Automation (Analytics),Email/SMS analytics / Engagement tracking / Link tracking,"delivered_status, open_count, click_count, reply_flag, sms_response, bounce_type",Real-time
8,"DECISION: Positive engagement detected (clicked, replied, visited key page)?",Automation,Click tracking / Webhook listener / Behavioral trigger detection,"engagement_type, link_clicked, page_visited, action_taken",Immediate on event
9,IF YES: Advance to next stage or trigger conversion workflow,Automation (Progression),Stage progression rules / Lead scoring update / Conversion handoff,"stage_progression, new_stage, progression_timestamp, conversion_flag",< 10 minutes
10,IF NO: Continue sequence OR try alternative content/channel,Automation (Workflow Logic),Workflow branching / Wait steps / If/then logic / Multi-path journeys,"next_message_scheduled, branch_path_taken, wait_duration",Per workflow timing
11,Monitor engagement patterns and identify contacts going cold (no opens for 14+ days),Automation (Engagement Monitor),Engagement decay scoring / Inactivity alerts / Cold lead detector,"days_since_last_engagement, cold_lead_flag, re_engagement_needed",Daily monitoring
12,Trigger re-engagement campaigns with new angles or special offers for cold contacts,Automation (Re-engagement),Win-back campaigns / New content alerts / Limited-time offer sequences,"re_engagement_campaign_triggered, campaign_type, offer_presented","Day 14, 21, 28 of inactivity"
13,Update contact profile with engagement preferences and content interests for future personalization,Automation (Profile Updater),Contact property updates / Preference center / Interest tagging,"updated_preferences, content_interests, engagement_profile, best_send_time",Real-time on interaction
14,"Generate nurture performance reports (open rates, CTR, progression rates, conversion attribution)",Marketing Team + System,Campaign analytics / Attribution reporting / Cohort analysis / A/B test results,"report_id, track_performance, conversion_rate, revenue_attributed, avg_time_to_convert",Weekly generation
````

### assets/MKT02-Assets.md

````markdown
# MKT02: Email/SMS Nurture Assets

## 1. 5-Part Email Nurture Sequence
*Target Audience: "Warm" Leads who downloaded gated content but are not yet ready to buy.*

### Email 1: The Delivery & Educational Value
**Send Time:** Immediate
**Subject:** Here's your [Content Name] + a quick tip
**Body:**
Hi [First Name],

As promised, here is your copy of [Content Name]: [Link to Download]

While you're diving into that, I wanted to share one quick insight that most people miss when trying to solve [Pain Point]:

**[Insert 1-2 sentence actionable tip related to the content]**

If you found that helpful, keep an eye out for my email on [Day of Week]. I'm going to share the exact framework we use to help companies like yours [Desired Outcome].

Best,
[Your Name]

### Email 2: The Value-Add Framework
**Send Time:** +3 Days
**Subject:** The [Framework Name] framework for [Desired Outcome]
**Body:**
Hi [First Name],

A few days ago I promised to share the exact framework we use to help our clients achieve [Desired Outcome].

It comes down to 3 simple steps:
1. **[Step 1]**: [Brief explanation]
2. **[Step 2]**: [Brief explanation]
3. **[Step 3]**: [Brief explanation]

When [Customer Name] implemented this, they saw a [Metric]% improvement in just [Timeframe].

I've put together a short 3-minute video breaking down exactly how you can apply this to your team today: [Link to Video]

Let me know what you think!

### Email 3: The Soft Pitch & Case Study
**Send Time:** +4 Days
**Subject:** How [Customer Name] stopped struggling with [Pain Point]
**Body:**
Hi [First Name],

By now, you've seen the framework. But I know what you might be thinking: *"This sounds great in theory, but how does it work in practice?"*

Before they started working with us, [Customer Name] was dealing with the exact same [Pain Point] you might be facing. They were losing [Metric/Money/Time] every single month.

Within [Timeframe] of implementing our system, they completely turned it around.
[Link to Full Case Study]

If you're curious about how this would look for your specific situation, I'd be happy to map it out for you on a quick 15-minute call. No pressure, just a brainstorming session.

[Link to Calendar]

### Email 4: The Hard Pitch (Urgency/Logic)
**Send Time:** +4 Days
**Subject:** The cost of waiting on [Problem Area]
**Body:**
Hi [First Name],

Every month that goes by without a solid solution for [Problem Area], you're likely losing out on [Opportunity Cost/Metric].

At [Company Name], we've built a system specifically designed to plug that leak and accelerate your [Desired Outcome].

I have a few openings on my calendar next week to do a custom audit of your current [Problem Area] setup. We'll identify exactly where the bottlenecks are, and I'll show you how our platform fixes them.

Grab a time that works for you here: [Link to Calendar]

### Email 5: The Breakup / Re-engagement
**Send Time:** +7 Days
**Subject:** Closing the loop / Should I stay or should I go?
**Body:**
Hi [First Name],

I haven't heard back, so I'm going to assume that solving [Pain Point] isn't a top priority for your team right now, and I'll stop reaching out about it.

If things change, or if you're ever ready to tackle [Problem Area], you can always reach me directly by replying to this email.

In the meantime, I'll just send you our monthly newsletter with industry insights and tips. (You can opt-out at any time at the bottom of this email).

Best of luck with the rest of Q[Current Quarter]!

---

## 2. SMS Follow-Up Templates
*To be used sparingly alongside emails for high-priority leads who provided mobile numbers.*

**SMS 1 (Sent 1 hour after Email 1):**
"Hi [First Name], just sent over the [Content Name] to your email! Let me know if you have any issues accessing it. - [Your Name] from [Company]"

**SMS 2 (Sent concurrently with Email 3):**
"Hey [First Name], I just sent you a quick case study on how we helped someone in your exact industry solve [Pain Point]. Thought you might find it relevant! - [Your Name]"
````

### automation/MKT02-Nurture-Enrollment-Blueprint.json

````json
{
  "name": "MKT02: Nurture Sequence Enrollment (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "hubspot:watchContacts",
      "version": 1,
      "parameters": {
        "property": "lifecyclestage",
        "value": "marketingqualifiedlead"
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
      "module": "hubspot:sendEmail",
      "version": 1,
      "parameters": {},
      "mapper": {
        "to": "{{1.properties.email}}",
        "subject": "Here's your requested resource",
        "content": "Hi {{1.properties.firstname}},\n\nWelcome to our nurture sequence. As promised..."
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
      "module": "builtin:BasicSleep",
      "version": 1,
      "parameters": {
        "delay": 259200
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
      "module": "hubspot:sendEmail",
      "version": 1,
      "parameters": {},
      "mapper": {
        "to": "{{1.properties.email}}",
        "subject": "The framework for success",
        "content": "Hi {{1.properties.firstname}},\n\nHere is the framework we discussed..."
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
      "module": "hubspot:updateContact",
      "version": 1,
      "parameters": {},
      "mapper": {
        "email": "{{1.properties.email}}",
        "properties": [
          {
            "property": "nurture_status",
            "value": "Active - Email 2 Sent"
          }
        ]
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

- `trackers/MKT02_Email_SMS_Nurture_Tracker.xlsx`: binary attachment retained outside the Markdown kit; convert to CSV/Markdown during certification if the sheet contents become authoritative.

## Automation Blueprint

### MKT02-Nurture-Enrollment-Blueprint.json

```json
{
  "name": "MKT02: Nurture Sequence Enrollment (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "hubspot:watchContacts",
      "version": 1,
      "parameters": {
        "property": "lifecyclestage",
        "value": "marketingqualifiedlead"
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
      "module": "hubspot:sendEmail",
      "version": 1,
      "parameters": {},
      "mapper": {
        "to": "{{1.properties.email}}",
        "subject": "Here's your requested resource",
        "content": "Hi {{1.properties.firstname}},\n\nWelcome to our nurture sequence. As promised..."
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
      "module": "builtin:BasicSleep",
      "version": 1,
      "parameters": {
        "delay": 259200
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
      "module": "hubspot:sendEmail",
      "version": 1,
      "parameters": {},
      "mapper": {
        "to": "{{1.properties.email}}",
        "subject": "The framework for success",
        "content": "Hi {{1.properties.firstname}},\n\nHere is the framework we discussed..."
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
      "module": "hubspot:updateContact",
      "version": 1,
      "parameters": {},
      "mapper": {
        "email": "{{1.properties.email}}",
        "properties": [
          {
            "property": "nurture_status",
            "value": "Active - Email 2 Sent"
          }
        ]
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
