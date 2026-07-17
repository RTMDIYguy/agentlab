---
schema: kit/1.0
slug: mkt-04-reviews-referrals
title: "MKT-04 - Reviews & Referrals"
summary: "Marketing workflow package for Reviews & Referrals. Consolidates registry metadata, imported source references, setup guidance, validation notes, and automation blueprints into one operative kit file."
version: 0.1.0-draft
owner: uncle-robert-consulting
license: UNLICENSED
status: imported-draft
conformance: draft
certifiedAt: null
workflowId: MKT-04
department: "Marketing"
automationLevel: "85-90%"
primaryOwner: "Marcus + Robert"
trigger: "Positive NPS (>=8) or milestone reached"
cycleTime: "Trigger-based; continuous"
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

# MKT-04 - Reviews & Referrals

This is the consolidated `kit.md` for the workflow. It replaces the old imported-package surface as the operative file while keeping source, asset, tracker, and automation files as provenance until certification is complete.

## Goal

Run the Reviews & Referrals workflow for Marketing with a repeatable trigger, owner, cycle time, outputs, and validation path. The current draft is strong enough for agent orientation and controlled internal use; certification still requires a live run or documented manual evidence.

## When to Use

Use this workflow when the trigger occurs: **Positive NPS (>=8) or milestone reached**.

Use it as part of the URC operating system first. Convert it into a client-safe variant only after URC-specific names, internal assumptions, and tool choices have been scrubbed or intentionally parameterized.

## Registry Metadata

| Field | Value |
| --- | --- |
| Workflow ID | MKT-04 |
| Department | Marketing |
| Automation level | 85-90% |
| Owner | Marcus + Robert |
| Trigger | Positive NPS (>=8) or milestone reached |
| Cycle time | Trigger-based; continuous |
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

1. Confirm the trigger: Positive NPS (>=8) or milestone reached.
2. Open the relevant source or asset file from the Source Map.
3. Collect the minimum inputs needed for this cycle.
4. Execute the workflow steps using the imported source as the detailed operating guide.
5. Capture output evidence, exceptions, and follow-up tasks.
6. Record meaningful package or behavior changes in `docs/operations/change-control-register.md`.

## Source Digest

- `URC-MKT-04_Reviews_Referrals.md`: This document defines how Uncle Robert Consulting systematically collects reviews, captures testimonials, develops case studies, and activates a referral engine. Word-of-mouth and social proof are the most powerful and most cost-effective marketing tools available to a small consultancy. The Marcus & Rivera case study alone added 247 email subscribers in 90 days. This workflow ensures we never leave that kind of asset on the table. Automation Level Human Involvement Typical Cycle Time 70-75% Robert: personal outreach for testimonials, case study interviews, referral conversations Review request within 24 hours of milestone; case study within 2 weeks of client approval 3. Review & Testimonial Collection 3.1 When to Ask

## Source Map

| Artifact | Purpose |
| --- | --- |
| `source/URC-MKT-04_Reviews_Referrals.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `assets/Marketing_Workflow_4_Reviews_Referrals.csv` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `assets/MKT04-Assets.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `automation/MKT04-Review-Trigger-Blueprint.json` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `trackers/MKT04_Reviews_Referrals_Tracker.xlsx` | Retained provenance/input artifact now referenced by this consolidated kit. |

## Embedded Source and Asset Documents

### source/URC-MKT-04_Reviews_Referrals.md

````markdown
# MKT-04 - Reviews & Referrals Source

Source: `Marketing Department\urc marketing\URC-MKT-04_Reviews_Referrals.docx`

This Markdown file is a text extraction of the source `.docx` for GitHub-readable access. Preserve the source path in citations until the workflow is fully converted into `kit.md` format.

## UNCLE ROBERT CONSULTING LLC

URC-MKT-04 — Reviews & Referrals

Owner: Robert T. McCarthy, Founder & CEO   |   Version: v1.0   |   Updated: March 21, 2026

1. Document Purpose

This document defines how Uncle Robert Consulting systematically collects reviews, captures testimonials, develops case studies, and activates a referral engine. Word-of-mouth and social proof are the most powerful and most cost-effective marketing tools available to a small consultancy. The Marcus & Rivera case study alone added 247 email subscribers in 90 days. This workflow ensures we never leave that kind of asset on the table.

2. Workflow Overview

Automation Level

Human Involvement

Typical Cycle Time

70-75%

Robert: personal outreach for testimonials, case study interviews, referral conversations

Review request within 24 hours of milestone; case study within 2 weeks of client approval

3. Review & Testimonial Collection

3.1 When to Ask

## Trigger Event

Request Type

Timing

Client NPS score ≥ 9 (from MKT-03 pulse)

Written testimonial or Google review

Within 24 hours of score submission

First major deliverable approved

Short written quote for website

Within 48 hours of approval

30-day or 90-day milestone reached

Full testimonial or case study conversation

Milestone day

Client refers someone to URC

Thank-you + amplified referral recognition

Within 24 hours of referral

Engagement successfully concluded

Google review + LinkedIn recommendation request

Offboarding call

3.2 Review Platforms

Google Business Profile (Independence, MO) — primary review target for local SEO

LinkedIn recommendations — professional credibility for enterprise and YC audiences

URC website testimonials page — curated quotes with client name, business, and result

G2 or Clutch — planned Q3 2026 when client volume justifies category listing

3.3 The Ask — How Robert Asks for Reviews

"Hey [Name], I genuinely loved working on this with you and I'm proud of what we built together.

If you felt the same way, the single biggest thing you could do to help me grow is leave a quick

Google review — it takes about 2 minutes and it means the world for a small business like mine.

Here's the direct link: [Google review link]. And if you'd rather write a LinkedIn recommendation,

I'd be equally grateful. Either way, thank you for being such a great partner."

4. Case Study Development

4.1 Case Study Criteria

A full case study is developed when ALL of the following are true:

Client achieved a measurable, quantifiable outcome (revenue increase, time saved, leads generated)

Client grants explicit written permission to publish their name, business, and results

Robert has enough detail to write a credible before/after narrative

4.2 Case Study Structure

Section

Content

Client Snapshot

Business name, industry, location, team size, prior tech stack

The Problem

Specific pain points before URC — in the client's own words where possible

The Solution

What URC built — AI agents, workflows, integrations, training

Implementation

Timeline, key milestones, what the client did vs. what URC did

Results

Specific numbers: leads/month, response time, revenue attributed, time saved

Client Voice

2-3 direct quotes from the client

Call to Action

"Is your business missing leads after hours? Book a free strategy session."

4.3 Case Study Publication & Distribution

Published on WordPress blog as a full article (SEO-optimized for client industry + location)

Emailed to the entire Mailchimp list within 7 days of publication

Shared on LinkedIn and Facebook via Buffer — 3 posts per case study (launch, results highlight, client quote card)

Added to PandaDoc proposal library — referenced in all relevant proposals

PDF version created in Canva — sent to prospects during discovery conversation

5. Referral Program

5.1 How URC's Referral Program Works

URC does not use formal software-based referral tracking at this stage. Referrals are managed personally and tracked in HubSpot with a source tag of "referral" and the referring client's name in the contact notes.

5.2 Referral Recognition

Referral Outcome

Recognition

Referral books a strategy session

Personal thank-you email or Loom from Robert within 24 hours

Referral becomes a paying client

Referrer receives a meaningful gift (Amazon gift card, dinner credit, or service credit — Robert's choice based on relationship)

Referral becomes a client AND stays 90+ days

Referrer featured in a "Community Spotlight" social post (with permission)

5.3 Keeping Referrals Flowing

Robert mentions the referral program naturally at the end of every successful deliverable conversation

The weekly Captain's Log email periodically thanks referrers by name (with permission)

Every case study includes a final CTA that makes it easy to share with a peer

6. Social Proof Asset Library

All approved testimonials and case study assets are stored in: Google Drive → /Marketing/Social-Proof/

Asset Type

Tool Used

Where Published

Written testimonial quotes

Google Docs → Canva for design

Website, proposals, email signatures

Full case studies

WordPress blog + Canva PDF

Blog, email, LinkedIn, proposals

Client quote cards (graphic)

Canva template

LinkedIn, Facebook, Instagram

Loom client testimonial videos

Loom → YouTube (unlisted)

Website, email campaigns, proposals

Before/after metrics graphics

Canva

Social media, email headers

7. KPIs & Targets

Metric

Target

How Measured

Reviews collected / month

2+

Google Business Profile dashboard

Case studies published / quarter

1+

Google Drive content log

Referral-sourced leads / month

2+

HubSpot source tag: referral

Testimonials on website

10+ active

Manual count — quarterly audit

Email list growth from case study

50+ subscribers / case study

Mailchimp subscriber spike post-publish

8. Implementation Checklist

## Phase 1 — Complete

Marcus & Rivera Realty case study published and distributed

Google Business Profile set up and review link created

Social proof folder created in Google Drive

## Phase 2 — In Progress

Testimonial request email template written and saved in HubSpot

Case study template built in Canva (PDF version)

HubSpot contact tagging: source:referral standardized

## Phase 3 — Planned

Second case study published (target: next client milestone)

LinkedIn recommendation request template written

Referral recognition gift process documented and budgeted

G2 or Clutch profile created (when client count justifies)

Version

Date

Author

Summary of Changes

v1.0

March 21, 2026

R. McCarthy

Initial URC-specific document
````

### assets/Marketing_Workflow_4_Reviews_Referrals.csv

````csv
Step,Trigger/Action,Owner,Tool/System,Data_Fields,SLA_Target
1,TRIGGER: Purchase completed OR Milestone reached OR High NPS score OR Positive support interaction,System,Order management / CRM milestone tracking / NPS survey / Support ticket system,"trigger_type, customer_id, trigger_event, timestamp, customer_segment",Per business rules
2,Determine optimal timing for request based on customer journey stage and product type,Automation (Timing Engine),Customer journey analytics / Timing optimization algorithm,"optimal_request_time, days_since_purchase, customer_satisfaction_score",Calculated per customer
3,"Send personalized review request via preferred channel (email, SMS) with easy submission link",Automation (Outreach),"Email/SMS platform / Review request automation (Yotpo, Trustpilot, Birdeye)","request_sent_timestamp, channel_used, review_link, platform_requested",Within optimal window
4,For referrals: Provide unique referral link/code with clear incentive explanation,Automation (Referral System),"Referral software (GrowSurf, ReferralCandy, Viral Loops) / Unique link generator","referral_link, referral_code, incentive_offered, sharing_instructions",Immediate upon request
5,"Track review submissions across platforms (Google, Yelp, Facebook, G2, Capterra, Trustpilot)",Automation (Review Aggregator),"Review monitoring platform (ReviewTrackers, Podium) / Multi-platform aggregator","review_id, platform, rating, review_text, reviewer_name, review_date",< 15 minutes from posting
6,"Monitor referral link shares and track clicks, signups, conversions from referrals",Automation (Referral Tracker),Referral tracking software / Attribution system / Conversion pixel,"referral_clicks, referral_signups, referral_conversions, referrer_id, referee_id",Real-time tracking
7,DECISION: Positive review (4-5 stars) or successful referral conversion detected?,Automation,Review sentiment detection / Referral conversion webhook,"positive_review_flag, referral_success_flag",Immediate
8,IF YES: Send thank you message + deliver reward/incentive + request testimonial permission,Automation + Marketing,Automated thank you campaign / Reward delivery system / Testimonial request,"thank_you_sent, reward_type, reward_value, testimonial_permission",< 2 hours
9,DECISION: Negative review (1-2 stars) detected?,Automation,Negative sentiment alert / Review monitoring,negative_review_flag,Immediate
10,IF YES: Alert support team immediately + send empathetic response + offer resolution,Support Team + Automation,Support ticket creation / Response template automation / Escalation workflow,"support_alert_sent, response_sent_timestamp, resolution_offered, case_id",< 1 hour
11,Auto-publish approved positive reviews to website testimonials page and marketing materials,Automation (Content Publisher),Website CMS integration / Testimonial widget / Marketing automation,"testimonial_published, publication_locations, approval_status",< 24 hours after approval
12,"Credit referral rewards automatically when conversion criteria met (purchase, subscription)",Automation (Reward Fulfillment),"Reward fulfillment system (gift cards, discounts, credits) / Payment processor","reward_credited_date, reward_amount, reward_status, redemption_method",Within 48 hours of conversion
13,"Generate social proof content from reviews for ads, landing pages, and social media",Marketing Team + Automation,Social proof aggregator / Content automation / UGC management,"social_proof_content_created, usage_locations, performance_metrics",Weekly content generation
14,Create leaderboard for top referrers and send engagement campaigns to active advocates,Marketing Team + System,Gamification platform / Leaderboard widget / Advocate engagement campaigns,"leaderboard_position, total_referrals, engagement_campaign_sent",Monthly leaderboard update
````

### assets/MKT04-Assets.md

````markdown
# MKT04: Reviews & Referrals Assets

## 1. Review Solicitation Templates
*Triggered automatically via HubSpot when a deal is closed won or an NPS score >8 is submitted.*

### Email: The "Soft Ask" (NPS > 8)
**Subject:** Thanks for your feedback, [First Name]! One quick favor?
**Body:**
Hi [First Name],

I just saw your recent feedback and I'm thrilled to hear that you're having such a great experience with our team!

We rely heavily on word-of-mouth to grow. If you have 60 seconds to spare, would you be willing to share your experience on [Review Platform, e.g., G2 or Google]?

[Link to Leave a Review]

It would mean the world to our team (we actually share these in our Slack channel every Friday).

Thanks again for your partnership!
[Your Name]

---

## 2. Referral Program Assets
*Triggered automatically when a customer leaves a 5-star review.*

### Email: Program Invitation
**Subject:** A little something to say thank you 🎁
**Body:**
Hi [First Name],

I saw the amazing review you left for us on [Review Platform]—thank you so much!

Since you've been such a great advocate for what we do, I wanted to personally invite you to our VIP Referral Program.

It's simple: If you know any other [Target Audience, e.g., agency founders or marketing directors] who could benefit from our platform, you can use your unique link below.

For every person who signs up, we'll send you a **[$X Amazon Gift Card / X Months Free]**.

Here is your unique referral link: [Referral Link]

*(I also attached a quick swipe file below if you want to just copy/paste a message to a colleague).*

Best,
[Your Name]

### LinkedIn Swipe Copy (For Referrers to copy/paste)
"I've been working with the team at [Company Name] to handle our [Pain Point] and the results have been incredible so far. If anyone is looking for a solution to [Desired Outcome], I highly recommend them. You can check them out here: [Referral Link]"

---

## 3. Automated Review Response Templates

### Positive Review (4-5 Stars)
"Hi [Name], thank you so much for the kind words! We're thrilled to hear that [Product/Service] has helped you [Desired Outcome]. Our team loved working with you on this. Don't hesitate to reach out if you ever need anything else!"

### Neutral Review (3 Stars)
"Hi [Name], thanks for taking the time to leave feedback. We're glad you liked [Positive aspect mentioned], but I see we fell short regarding [Negative aspect]. We're actively working on improving this. I've sent you a direct message to see how we can make this right."

### Negative Review (1-2 Stars)
"Hi [Name], I'm genuinely sorry to hear about your experience. This is not the standard we strive for. I've personally looked into your account and escalated this to our Head of Customer Success. We will be reaching out to you directly via email in the next 30 minutes to get this resolved for you."
````

### automation/MKT04-Review-Trigger-Blueprint.json

````json
{
  "name": "MKT04: Review Request & Referral Trigger",
  "flow": [
    {
      "id": 1,
      "module": "hubspot:watchCrmObjects",
      "version": 1,
      "parameters": {
        "type": "deal",
        "property": "dealstage",
        "operator": "EQ",
        "value": "closedwon"
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
        "delay": 259200
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
      "module": "hubspot:searchCrmObjects",
      "version": 1,
      "parameters": {
        "type": "contact"
      },
      "mapper": {
        "filters": [
          {
            "propertyName": "associatedcompanyid",
            "operator": "EQ",
            "value": "{{1.properties.associatedcompanyid}}"
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
      "module": "hubspot:sendEmail",
      "version": 1,
      "parameters": {},
      "mapper": {
        "to": "{{3.properties.email}}",
        "subject": "How did we do?",
        "content": "Hi {{3.properties.firstname}},\n\nIt's been a few days since we closed our deal. Could you leave us a review?\n\n[Link]"
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

- `trackers/MKT04_Reviews_Referrals_Tracker.xlsx`: binary attachment retained outside the Markdown kit; convert to CSV/Markdown during certification if the sheet contents become authoritative.

## Automation Blueprint

### MKT04-Review-Trigger-Blueprint.json

```json
{
  "name": "MKT04: Review Request & Referral Trigger",
  "flow": [
    {
      "id": 1,
      "module": "hubspot:watchCrmObjects",
      "version": 1,
      "parameters": {
        "type": "deal",
        "property": "dealstage",
        "operator": "EQ",
        "value": "closedwon"
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
        "delay": 259200
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
      "module": "hubspot:searchCrmObjects",
      "version": 1,
      "parameters": {
        "type": "contact"
      },
      "mapper": {
        "filters": [
          {
            "propertyName": "associatedcompanyid",
            "operator": "EQ",
            "value": "{{1.properties.associatedcompanyid}}"
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
      "module": "hubspot:sendEmail",
      "version": 1,
      "parameters": {},
      "mapper": {
        "to": "{{3.properties.email}}",
        "subject": "How did we do?",
        "content": "Hi {{3.properties.firstname}},\n\nIt's been a few days since we closed our deal. Could you leave us a review?\n\n[Link]"
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
