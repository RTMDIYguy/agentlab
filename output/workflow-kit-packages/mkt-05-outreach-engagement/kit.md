---
schema: kit/1.0
slug: mkt-05-outreach-engagement
title: "MKT-05 - Outreach & Engagement"
summary: "Marketing workflow package for Outreach & Engagement. Consolidates registry metadata, imported source references, setup guidance, validation notes, and automation blueprints into one operative kit file."
version: 0.1.0-draft
owner: uncle-robert-consulting
license: UNLICENSED
status: imported-draft
conformance: draft
certifiedAt: null
workflowId: MKT-05
department: "Marketing"
automationLevel: "80-85%"
primaryOwner: "Marcus + Account Managers"
trigger: "Sales territory defined or campaign planned"
cycleTime: "7-14 day sequences; continuous"
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

# MKT-05 - Outreach & Engagement

This is the consolidated `kit.md` for the workflow. It replaces the old imported-package surface as the operative file while keeping source, asset, tracker, and automation files as provenance until certification is complete.

## Goal

Run the Outreach & Engagement workflow for Marketing with a repeatable trigger, owner, cycle time, outputs, and validation path. The current draft is strong enough for agent orientation and controlled internal use; certification still requires a live run or documented manual evidence.

## When to Use

Use this workflow when the trigger occurs: **Sales territory defined or campaign planned**.

Use it as part of the URC operating system first. Convert it into a client-safe variant only after URC-specific names, internal assumptions, and tool choices have been scrubbed or intentionally parameterized.

## Registry Metadata

| Field | Value |
| --- | --- |
| Workflow ID | MKT-05 |
| Department | Marketing |
| Automation level | 80-85% |
| Owner | Marcus + Account Managers |
| Trigger | Sales territory defined or campaign planned |
| Cycle time | 7-14 day sequences; continuous |
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

1. Confirm the trigger: Sales territory defined or campaign planned.
2. Open the relevant source or asset file from the Source Map.
3. Collect the minimum inputs needed for this cycle.
4. Execute the workflow steps using the imported source as the detailed operating guide.
5. Capture output evidence, exceptions, and follow-up tasks.
6. Record meaningful package or behavior changes in `docs/operations/change-control-register.md`.

## Source Digest

- `URC-MKT-05_Outreach_Engagement.md`: This document defines how Uncle Robert Consulting proactively reaches out to potential clients and engages the existing audience. At this stage of the business, Robert is both the founder and the primary outreach person — this means outreach must be warm, human, and efficient. We do not do cold spam. Every outreach touch is rooted in genuine relevance to the recipient. Automation Level Human Involvement Typical Cycle Time 60-70% Robert: all personalization, all relationship calls, all community participation, strategic decisions 7-14 day outreach cadence; community engagement ongoing daily 3. Outreach Philosophy Robert's rule: Only reach out if you have something genuinely relevant to say. A bad outreach message does more damage to the URC brand than no outreach at all.

## Source Map

| Artifact | Purpose |
| --- | --- |
| `source/URC-MKT-05_Outreach_Engagement.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `assets/Marketing_Workflow_5_Outreach_Engagement.csv` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `assets/MKT05-Assets.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `automation/MKT05-Outreach-Response-Blueprint.json` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `trackers/MKT05_Outreach_Engagement_Tracker.xlsx` | Retained provenance/input artifact now referenced by this consolidated kit. |

## Embedded Source and Asset Documents

### source/URC-MKT-05_Outreach_Engagement.md

````markdown
# MKT-05 - Outreach & Engagement Source

Source: `Marketing Department\urc marketing\URC-MKT-05_Outreach_Engagement.docx`

This Markdown file is a text extraction of the source `.docx` for GitHub-readable access. Preserve the source path in citations until the workflow is fully converted into `kit.md` format.

## UNCLE ROBERT CONSULTING LLC

URC-MKT-05 — Outreach & Engagement

Owner: Robert T. McCarthy, Founder & CEO   |   Version: v1.0   |   Updated: March 21, 2026

1. Document Purpose

This document defines how Uncle Robert Consulting proactively reaches out to potential clients and engages the existing audience. At this stage of the business, Robert is both the founder and the primary outreach person — this means outreach must be warm, human, and efficient. We do not do cold spam. Every outreach touch is rooted in genuine relevance to the recipient.

2. Workflow Overview

Automation Level

Human Involvement

Typical Cycle Time

60-70%

Robert: all personalization, all relationship calls, all community participation, strategic decisions

7-14 day outreach cadence; community engagement ongoing daily

3. Outreach Philosophy

Robert's rule: Only reach out if you have something genuinely relevant to say.

A bad outreach message does more damage to the URC brand than no outreach at all.

Every message should make the recipient think: 'This person actually knows my situation.'

4. Outreach Channels & Approach

4.1 LinkedIn (Primary Outreach Channel)

Connection requests: Personalized 1-2 sentence note referencing something specific about their work or business

Follow-up message (24-48 hours after acceptance): Value-first — share a relevant blog post, the Marcus & Rivera case study, or a specific observation

Target: 10-15 new connections per week, all within ICP (small business owners, content creators, local entrepreneurs)

No automated bulk messaging — every connection is sent manually by Robert

4.2 Email Outreach (Warm Leads)

Only to contacts who have previously engaged — downloaded content, attended a webinar, or been referred

Maximum 3-touch sequence: introduction value email → follow-up with case study → final check-in

All outreach emails drafted with Claude or ChatGPT assistance — Robert personalizes and sends manually from Gmail

Gmail templates saved for common scenarios: referral introduction, case study share, strategy session invite

4.3 Local & Community Engagement

Independence MO Chamber of Commerce — Robert attends quarterly events

Kansas City small business Facebook groups — participates in discussions, answers questions, never hard-sells

WordPress user communities — participates in forums related to AI and small business WordPress use cases

LinkedIn posts: Robert publishes 3-5 times per week — educational, personal, and behind-the-scenes content

4.4 Existing Client Engagement

Weekly Captain's Log email to full Mailchimp list — keeps warm leads engaged between active nurture touches

Monthly community spotlight: shout out a client win in the email broadcast and on LinkedIn

Regular Loom check-ins to active clients — maintains relationship depth without always requiring a call

5. Outreach Sequence — New LinkedIn Connection

## Step

Timing

Action

Template

1

Day 0

Send personalized connection request

"Hi [Name], I came across your [specific work/post/company] and thought it would be great to connect — I work with [ICP] to build AI-powered growth systems. Would love to be in your network."

2

Day 1-2 after accept

Send value message

Share the Marcus & Rivera case study or most relevant blog post. No ask.

3

Day 5-7

Light follow-up if engaged with message

Ask one specific question relevant to their business situation. Keep it short.

4

Day 10-14

Strategy session invite if relationship is warm

"I'd love to offer you a complimentary 45-minute AI readiness session — no obligation, just a chance to map what AI could do for your specific business."

5

If no response after step 4

Disconnect gracefully

Move contact to cold list in HubSpot. No hard feelings.

6. Real Estate Agent Outreach Program

The Marcus & Rivera success has made real estate agents one of URC's strongest near-term verticals. This specific outreach track is active as of Q1 2026.

Element

Detail

Target

Independent real estate agents in Independence, Lee's Summit, and Kansas City East corridor

Source

124-contact list from prior research; Zillow agent directory; local Facebook groups

Opening hook

"I just helped a 2-agent team in Independence go from 6-hour response times to 4 minutes — and they added 34 qualified leads per month. I'd love to show you how."

Evidence

Marcus & Rivera case study PDF — sent in message 2

Offer

Free 45-minute AI Readiness Session — no pitch, just an audit of what's costing them leads

Tracking

HubSpot source tag: outreach:real-estate-agent

7. Tools & Systems

Tool

Role in Outreach

LinkedIn (free)

Primary outreach platform — connection requests and direct messages

Gmail

Personal email outreach — warm leads and referral introductions

HubSpot CRM

Tracks all outreach contacts, source tags, sequence status, and conversation history

Claude / ChatGPT

Drafts personalized outreach messages — Robert edits and sends manually

Buffer

Schedules Robert's LinkedIn posts (content that warms the audience before outreach)

Loom

Personalized video messages for high-value outreach — adds a human face to digital contact

Calendly

Booking link included in all outreach CTAs — frictionless path to discovery call

8. KPIs & Targets

Metric

Target

How Measured

New LinkedIn connections / week

10-15

LinkedIn analytics

Connection-to-conversation rate

> 20%

HubSpot: connections vs. responses logged

Outreach-to-strategy call rate

> 8%

HubSpot: outreach contacts vs. calls booked

LinkedIn post engagement rate

> 3% avg

LinkedIn analytics per post

Local events attended / quarter

2+

Robert's calendar — manual log

Email outreach reply rate

> 15%

Gmail / HubSpot email tracking

9. Implementation Checklist

## Phase 1 — Active

LinkedIn outreach sequence written for primary ICP (small biz + creator)

Real estate agent outreach track active with 124-contact list

Weekly LinkedIn posting cadence established (3-5 posts/week)

HubSpot outreach source tagging standardized

## Phase 2 — In Progress

Gmail template library built for 5 common outreach scenarios

Claude prompt library for outreach personalization saved in Drive

Local community engagement calendar set (Chamber events, Facebook groups)

## Phase 3 — Planned

Second target vertical identified beyond real estate (Q2 2026)

LinkedIn content strategy formalized (topic pillars, posting schedule)

Referral outreach track built for existing client network

Version

Date

Author

Summary of Changes

v1.0

March 21, 2026

R. McCarthy

Initial URC-specific document
````

### assets/Marketing_Workflow_5_Outreach_Engagement.csv

````csv
Step,Trigger/Action,Owner,Tool/System,Data_Fields,SLA_Target
1,TRIGGER: New prospect identified OR Engagement drop detected OR Event attendance OR Content consumption,System/Sales Dev,CRM / Lead database / Intent data provider / Event platform,"trigger_type, prospect_id, trigger_source, timestamp, priority_score",Immediate
2,"Build target prospect list from ICP criteria, intent signals, technographics, firmographics",SDR Team + Automation,ICP filters / ZoomInfo / Clearbit / 6sense / Bombora / LinkedIn Sales Navigator,"company_name, industry, company_size, revenue, technologies, employee_count",< 4 hours for list build
3,"Enrich prospect data (email, phone, social profiles, company info, buying signals)",Automation (Enrichment),"Data enrichment APIs (Clearbit, ZoomInfo, Apollo, Lusha)","email, phone, linkedin_url, job_title, decision_maker_level, reporting_structure",< 30 minutes
4,"Create personalized outreach sequence across multiple channels (email, LinkedIn, phone, direct mail)",SDR Team + Automation,"Sales engagement platform (Outreach, Salesloft, Apollo, Reply.io)","sequence_name, channel_mix, personalization_level, total_touchpoints",< 2 hours for setup
5,Launch multi-touch cadence (typically 8-12 touchpoints over 2-3 weeks),Automation (Cadence Engine),Multi-channel sequencer / Cadence templates / Automation engine,"cadence_started, current_step, next_touchpoint_date, completion_status",Per cadence schedule
6,"Track engagement across all channels (email opens, LinkedIn profile views, call connects, replies)",Automation (Engagement Tracker),Email tracking / LinkedIn engagement / Call logging / Multi-touch attribution,"opens_count, clicks_count, linkedin_views, call_attempts, call_connects, replies",Real-time
7,Use AI to personalize messaging based on prospect behavior and company research,AI + Sales Development,"AI writing assistant (Lavender, Jasper) / Personalization at scale / GPT-4","ai_personalization_applied, research_notes, custom_messaging, icebreaker",Per message send
8,"DECISION: Positive response received (reply, meeting booked, content download)?",Automation,"Reply detection / Meeting scheduling (Calendly, Chili Piper)",response_type,Immediate
9,IF YES: Move to sales conversation workflow + notify sales rep + log opportunity,SDR + Sales Team + System,CRM opportunity creation / Sales alert / Pipeline tracking,"meeting_booked_date, sales_rep_assigned, opportunity_created, deal_value",< 15 minutes
10,IF NO: Continue sequence OR try different angle/channel,Automation (Sequence Logic),Sequence branching logic / A/B testing / Channel rotation,"sequence_status, next_action, branch_taken",Per sequence timing
11,"Monitor for buying signals (job changes, funding, tech stack changes, hiring, intent keywords)",Automation (Signal Detection),Intent data monitoring / Job change alerts / Funding alerts / Tech install signals,"intent_signals_detected, job_change_alert, funding_event, tech_adoption",Real-time monitoring
12,"Auto-pause outreach if prospect shows negative engagement (unsubscribe, ""not interested"" reply)",Automation (Suppression),Unsubscribe processing / Negative reply detection / Do-not-contact list,"suppression_reason, suppression_date, do_not_contact_flag",Immediate
13,Re-engage cold prospects with new campaigns when timing/circumstances change,SDR Team + Automation,Re-engagement campaigns / Timing triggers / New angle testing,"re_engagement_triggered, new_campaign_name, wait_period_days",Based on timing rules
14,"Measure outreach effectiveness (response rate, meeting rate, pipeline generated, ROI by channel)",Sales Leadership + Analytics,Sales analytics platform / Pipeline attribution / Channel performance dashboard,"report_id, response_rate, meeting_rate, pipeline_value, cost_per_meeting",Weekly reporting
````

### assets/MKT05-Assets.md

````markdown
# MKT05: Outreach & Engagement Assets

## 1. 7-Touch Outbound Sequence (The "Value-First" Approach)
*Sequence duration: 14 Days. Designed for Apollo, Outreach, or SalesLoft.*

### Day 1: Email 1 (The Observation)
**Subject:** Saw your post on [Topic] / Question about [Company]
**Body:**
Hi [First Name],

I was doing some research on [Company Name] and noticed you recently [Trigger Event: e.g., expanded your sales team / launched X product].

Usually, when teams at your stage do that, [Pain Point: e.g., their lead routing gets messy and response times drop]. Is that something you're dealing with right now?

We built a framework that solves this (it's how [Customer Name] kept response times under 5 mins while doubling headcount).

Worth a chat?
[Your Name]

### Day 2: LinkedIn Touch (Connection Request)
**Note:** "Hey [First Name], noticed you were leading the [Department] team at [Company]. I work with a lot of [Job Title]s in [Industry] and love following your updates. Thought I'd connect!"

### Day 4: Email 2 (The Value Drop)
**Subject:** Re: Saw your post on [Topic] / Question about [Company]
**Body:**
Hi [First Name] - Not sure if you saw my last note, but I put together a quick 2-minute Loom video specifically showing how [Company Name] could automate [Specific Process] using your current tech stack.

[Link to Loom Video - Custom Thumbnail with Prospect's Name on Whiteboard]

Let me know if this looks like something that would save your team time this quarter.

### Day 5: Call Script 1 (The Permission Based Opener)
**SDR:** "Hi [First Name], this is [Name] from [Company]. I know I caught you in the middle of something—do you have 30 seconds for me to tell you why I'm calling, and then you can tell me to hang up if it's not relevant?"
**Prospect:** "Sure, go ahead."
**SDR:** "I noticed [Company] is scaling up right now. We typically see [Role]s struggling to keep [Pain Point] under control during growth. I sent you an email with a short video on this yesterday. Is [Pain Point] an active priority for you right now, or do you already have it handled?"

### Day 7: LinkedIn Voice Note / Message
"Hey [First Name], just left a quick voicemail. Sent over a video on Tuesday showing how we could help [Company] streamline [Process]. No pressure to reply right away, but let me know if you want me to send over more details."

### Day 10: Call Script 2 (The Follow-up)
**SDR:** "Hi [First Name], [Name] from [Company] calling back. I know timing is everything with [Problem Area]. Just wanted to see if the video I sent over resonated, or if I'm completely off base?"

### Day 14: Email 3 (The Breakup)
**Subject:** Closing the file
**Body:**
Hi [First Name],

I haven't heard back, so I'll assume [Pain Point] isn't a priority for you and the team right now.

I'll stop reaching out, but if things change down the road, feel free to reply to this email or find me on LinkedIn.

Best of luck with the rest of the year!

---

## 2. Objection Handling Scripts

### Objection: "We already have a solution for this."
**Response:** "That's great. Most of the teams we speak with do. Who are you currently using? [...] Oh, [Competitor]? They're solid for [Feature A]. We actually have a lot of clients who switched from them because they were struggling with [Feature B]. How are you handling [Feature B] right now?"

### Objection: "We don't have budget right now."
**Response:** "I completely understand. In fact, most of our best clients didn't have budget when we first spoke. The reason they ended up finding budget is because we showed them how they were currently losing $X a month due to [Pain Point]. Since we're not asking for money today, would you be open to a 10-minute discovery call just to see if the ROI makes sense for next quarter?"

### Objection: "Call me back in 6 months."
**Response:** "Happy to do that. Just so I make sure I don't waste your time when I call back in 6 months—what usually changes between now and then? Is there a specific initiative you're waiting to wrap up?"
````

### automation/MKT05-Outreach-Response-Blueprint.json

````json
{
  "name": "MKT05: Outreach Response Routing (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "gmail:watchEmails",
      "version": 1,
      "parameters": {
        "folder": "INBOX",
        "query": "is:reply"
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
            "content": "You are a sales assistant. Analyze this email reply and classify its sentiment as either: POSITIVE, OBJECTION, or UNSUBSCRIBE."
          },
          {
            "role": "user",
            "content": "{{1.text}}"
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
      "module": "slack:createMessage",
      "version": 1,
      "parameters": {
        "channel": "sales-hot-leads"
      },
      "mapper": {
        "text": "🔥 *Positive Reply Received!*\n*From:* {{1.senderName}} ({{1.senderEmail}})\n*Message:* {{1.text}}\n*Action:* Respond immediately!"
      },
      "metadata": {
        "designer": {
          "x": 900,
          "y": -200
        }
      }
    },
    {
      "id": 5,
      "module": "hubspot:updateContact",
      "version": 1,
      "parameters": {},
      "mapper": {
        "email": "{{1.senderEmail}}",
        "properties": [
          {
            "property": "leadstatus",
            "value": "UNQUALIFIED"
          }
        ]
      },
      "metadata": {
        "designer": {
          "x": 900,
          "y": 200
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

- `trackers/MKT05_Outreach_Engagement_Tracker.xlsx`: binary attachment retained outside the Markdown kit; convert to CSV/Markdown during certification if the sheet contents become authoritative.

## Automation Blueprint

### MKT05-Outreach-Response-Blueprint.json

```json
{
  "name": "MKT05: Outreach Response Routing (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "gmail:watchEmails",
      "version": 1,
      "parameters": {
        "folder": "INBOX",
        "query": "is:reply"
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
            "content": "You are a sales assistant. Analyze this email reply and classify its sentiment as either: POSITIVE, OBJECTION, or UNSUBSCRIBE."
          },
          {
            "role": "user",
            "content": "{{1.text}}"
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
      "module": "slack:createMessage",
      "version": 1,
      "parameters": {
        "channel": "sales-hot-leads"
      },
      "mapper": {
        "text": "🔥 *Positive Reply Received!*\n*From:* {{1.senderName}} ({{1.senderEmail}})\n*Message:* {{1.text}}\n*Action:* Respond immediately!"
      },
      "metadata": {
        "designer": {
          "x": 900,
          "y": -200
        }
      }
    },
    {
      "id": 5,
      "module": "hubspot:updateContact",
      "version": 1,
      "parameters": {},
      "mapper": {
        "email": "{{1.senderEmail}}",
        "properties": [
          {
            "property": "leadstatus",
            "value": "UNQUALIFIED"
          }
        ]
      },
      "metadata": {
        "designer": {
          "x": 900,
          "y": 200
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

- `source/URC-MKT-05_Outreach_Engagement.md`: [ICP]

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
