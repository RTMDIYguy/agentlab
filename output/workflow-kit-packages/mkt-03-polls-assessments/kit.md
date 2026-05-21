---
schema: kit/1.0
slug: mkt-03-polls-assessments
title: "MKT-03 - Polls & Assessments"
summary: "Marketing workflow package for Polls & Assessments. Consolidates registry metadata, imported source references, setup guidance, validation notes, and automation blueprints into one operative kit file."
version: 0.1.0-draft
owner: uncle-robert-consulting
license: UNLICENSED
status: imported-draft
conformance: draft
certifiedAt: null
workflowId: MKT-03
department: "Marketing"
automationLevel: "90-95%"
primaryOwner: "Marcus + Robert"
trigger: "Campaign planning cycle"
cycleTime: "Real-time + immediate follow-up"
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

# MKT-03 - Polls & Assessments

This is the consolidated `kit.md` for the workflow. It replaces the old imported-package surface as the operative file while keeping source, asset, tracker, and automation files as provenance until certification is complete.

## Goal

Run the Polls & Assessments workflow for Marketing with a repeatable trigger, owner, cycle time, outputs, and validation path. The current draft is strong enough for agent orientation and controlled internal use; certification still requires a live run or documented manual evidence.

## When to Use

Use this workflow when the trigger occurs: **Campaign planning cycle**.

Use it as part of the URC operating system first. Convert it into a client-safe variant only after URC-specific names, internal assumptions, and tool choices have been scrubbed or intentionally parameterized.

## Registry Metadata

| Field | Value |
| --- | --- |
| Workflow ID | MKT-03 |
| Department | Marketing |
| Automation level | 90-95% |
| Owner | Marcus + Robert |
| Trigger | Campaign planning cycle |
| Cycle time | Real-time + immediate follow-up |
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

1. Confirm the trigger: Campaign planning cycle.
2. Open the relevant source or asset file from the Source Map.
3. Collect the minimum inputs needed for this cycle.
4. Execute the workflow steps using the imported source as the detailed operating guide.
5. Capture output evidence, exceptions, and follow-up tasks.
6. Record meaningful package or behavior changes in `docs/operations/change-control-register.md`.

## Source Digest

- `URC-MKT-03_Polls_Assessments.md`: This document defines how Uncle Robert Consulting uses polls, quizzes, and assessments as marketing tools. Assessments serve a dual purpose: they deliver genuine value to the respondent while simultaneously qualifying them as a lead, collecting zero-party data, and segmenting them into the right nurture track. Done well, an assessment feels like a gift — not a form. Automation Level Human Involvement Typical Cycle Time 80-85% Robert: assessment design, high-value response review, segment strategy, insight analysis Real-time scoring; follow-up within 30 minutes of completion 3. URC Assessment Strategy Our flagship assessment: the AI Readiness Quiz. Premise: Small business owners don't know what they don't know about AI. The quiz shows them

## Source Map

| Artifact | Purpose |
| --- | --- |
| `source/URC-MKT-03_Polls_Assessments.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `assets/Marketing_Workflow_3_Polls_Assessments.csv` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `assets/MKT03-Assets.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `automation/MKT03-Assessment-Scoring-Blueprint.json` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `trackers/MKT03_Polls_Assessments_Tracker.xlsx` | Retained provenance/input artifact now referenced by this consolidated kit. |

## Embedded Source and Asset Documents

### source/URC-MKT-03_Polls_Assessments.md

````markdown
# MKT-03 - Polls & Assessments Source

Source: `Marketing Department\urc marketing\URC-MKT-03_Polls_Assessments.docx`

This Markdown file is a text extraction of the source `.docx` for GitHub-readable access. Preserve the source path in citations until the workflow is fully converted into `kit.md` format.

## UNCLE ROBERT CONSULTING LLC

URC-MKT-03 — Polls & Assessments

Owner: Robert T. McCarthy, Founder & CEO   |   Version: v1.0   |   Updated: March 21, 2026

1. Document Purpose

This document defines how Uncle Robert Consulting uses polls, quizzes, and assessments as marketing tools. Assessments serve a dual purpose: they deliver genuine value to the respondent while simultaneously qualifying them as a lead, collecting zero-party data, and segmenting them into the right nurture track. Done well, an assessment feels like a gift — not a form.

2. Workflow Overview

Automation Level

Human Involvement

Typical Cycle Time

80-85%

Robert: assessment design, high-value response review, segment strategy, insight analysis

Real-time scoring; follow-up within 30 minutes of completion

3. URC Assessment Strategy

Our flagship assessment: the AI Readiness Quiz.

Premise: Small business owners don't know what they don't know about AI. The quiz shows them

exactly where they stand — and naturally opens the conversation about what URC can build for them.

4. Active Assessments

4.1 AI Readiness Quiz (Flagship — In Development)

Element

Detail

## Purpose

Qualify leads AND deliver a personalized AI readiness score with specific recommendations

Format

8-10 scored questions across 4 categories: Lead Capture, Follow-Up, Content, Operations

Platform

Typeform (free tier) or ScoreApp — embedded on website and shared via email/social

Outcome segments

Red (0-40): Not AI-ready — educational content + nurture; Yellow (41-70): Partial — strategy session offer; Green (71-100): AI-ready — direct Growth Pod offer

Delivery

Personalized results page + PDF report + automated email with Robert's commentary

## CTA

Book a free 45-minute AI Readiness Strategy Session (Calendly link)

Status

In development — target launch May 2026

4.2 Client Satisfaction Pulse (Ongoing)

Element

Detail

## Purpose

Monitor active client satisfaction and catch at-risk relationships early

Format

3 questions: Overall satisfaction (1-10), biggest current challenge, one thing we could do better

Platform

Typeform — triggered via Make.com at 30-day and 90-day client milestones

Follow-up

Score < 7 triggers immediate Robert notification; score 9-10 triggers testimonial request

Status

Active

4.3 Monthly Email List Polls

Element

Detail

## Purpose

Engagement, segmentation data, and content ideas — all in one

Format

1-question poll embedded in weekly broadcast email — answer in one click

Example questions

"What's your biggest challenge right now: lead follow-up, content creation, or operations?"

Platform

Mailchimp poll embed or linked Typeform

Follow-up

Results shared with list the following week — builds community and transparency

Status

Planned Q2 2026

5. Assessment Process Flow

Respondent discovers quiz via website, email link, or social post

Completes assessment — average completion time target: under 5 minutes

Receives instant personalized results page with score and 3 specific recommendations

Automated email delivers PDF report within 5 minutes (Mailchimp + Make.com)

Make.com tags the contact in HubSpot with their score tier (Red/Yellow/Green)

CRM automatically enrolls them in the matching nurture track (MKT-02)

Score ≥ 71 triggers a direct outreach from Robert within 24 hours — personal email or Loom

All responses aggregated monthly in Google Sheets for market insight analysis

6. Tools & Systems

Tool

Role

Typeform (or ScoreApp)

Assessment builder — branching logic, scoring, results delivery

Make.com

Assessment completion webhook → HubSpot tag → Mailchimp enrollment

HubSpot CRM

Contact scoring, segment tagging, opportunity creation for Green leads

Mailchimp

PDF report delivery email, segment-specific nurture enrollment

Google Sheets

Monthly aggregated response analysis — trends, pain points, market intelligence

Claude / ChatGPT

Generates personalized report commentary based on individual scores

Loom

Personal video follow-up for Green-tier (high-score) leads

7. KPIs & Targets

Metric

Target

How Measured

Assessment completion rate

> 65%

Typeform analytics (completions / starts)

Green-tier (high score) rate

> 20% of completions

HubSpot tag count: persona:green

Green-to-strategy call conversion

> 35%

HubSpot: green contacts vs. calls booked

Client satisfaction score (pulse)

≥ 8.5 avg

Typeform results → Google Sheets aggregation

Email poll engagement rate

> 15% click

Mailchimp click-through on poll link

8. Implementation Checklist

## Phase 1 — In Progress

AI Readiness Quiz questions written and scored (8-10 questions, 4 categories)

Typeform or ScoreApp account configured with branching logic

Three results segments defined with personalized copy for each

PDF report template designed in Canva

## Phase 2 — Planned (May 2026)

Make.com: quiz completion → HubSpot tag → Mailchimp enrollment automation built

Quiz embedded on website and linked in email signature

Launch email to existing list announcing the quiz

Monthly response analysis sheet created in Google Sheets

## Phase 3 — Ongoing

Client Satisfaction Pulse automated at 30-day and 90-day milestones

Monthly email list poll introduced in weekly broadcast

Quarterly quiz review — update questions as market and services evolve

Version

Date

Author

Summary of Changes

v1.0

March 21, 2026

R. McCarthy

Initial URC-specific document
````

### assets/Marketing_Workflow_3_Polls_Assessments.csv

````csv
Step,Trigger/Action,Owner,Tool/System,Data_Fields,SLA_Target
1,TRIGGER: Campaign launch OR Post-purchase timing OR Engagement milestone OR Scheduled feedback request,System/Marketing,Survey/poll software / Campaign scheduler / Milestone trigger,"trigger_type, poll_id, launch_timestamp, campaign_association, target_audience",Per schedule or immediate
2,"Design poll/assessment with branching logic based on business goals (lead gen, feedback, segmentation)",Marketing Team,Typeform / SurveyMonkey / Zigpoll / Google Forms / Jotform / Outgrow,"poll_title, question_count, branching_rules, scoring_methodology, goal_type",< 4 hours for design
3,"Embed poll/assessment in email, landing page, website popup, SMS, or social media",Marketing Automation,Email platform / Landing page builder / Website popup tool / SMS platform,"deployment_channels, embed_locations, distribution_method, audience_reached",Same day as design complete
4,Capture responses in real-time with partial completion tracking for abandoned surveys,System (Response Collector),Survey tool webhook / Partial response tracking / Auto-save functionality,"response_id, respondent_id, response_timestamp, completion_status, partial_data",Real-time
5,"Score responses automatically (quiz results, assessment scores, satisfaction ratings)",Automation (Scoring Engine),Survey logic / Scoring algorithm / AI response analysis,"total_score, category_scores, grade_level, benchmark_comparison",Immediate upon completion
6,"Segment respondents based on answers (persona, readiness, satisfaction level, needs)",Automation (Segmentation),CRM segmentation rules / Tagging automation / Persona assignment,"segment_assigned, persona_type, readiness_level, satisfaction_tier, need_category",Immediate after scoring
7,Trigger personalized follow-up based on specific responses and scores,Marketing Automation,Marketing automation workflows / Zapier/Make.com integration,"follow_up_workflow_triggered, personalization_applied, next_action",< 10 minutes
8,"DECISION: High-value response detected (qualified need, purchase intent, complaint)?",Automation,Response threshold detection / High-priority flag system,"priority_flag, alert_type",Immediate
9,IF YES: Alert sales/support team immediately + trigger priority follow-up workflow,System + Sales/Support,CRM task creation / Sales alert / Support ticket generation / Priority queue,"alert_sent_timestamp, assigned_to, urgency_level, response_data_summary",< 15 minutes for critical
10,IF NO: Send automated results/insights to respondent + nurture sequence enrollment,Automation (Results Delivery),Automated email with results / PDF report generator / Results dashboard,"results_delivered_timestamp, results_format, insights_provided",< 30 minutes
11,"Deliver personalized recommendations, content, or offers based on assessment results",Automation (Content Engine),Content recommendation engine / Dynamic offer system / Personalization API,"recommendations_given, content_suggested, offer_presented, call_to_action",< 1 hour
12,Sync response data to CRM with tags and segmentation for future personalization,Automation (CRM Sync),"CRM integration (HubSpot, Salesforce) / Custom field mapping / Tag application","crm_updated_timestamp, tags_applied, segment_updated, custom_fields_populated",< 15 minutes
13,"Analyze aggregate results for trends, common pain points, product-market fit insights",Marketing/Product Team,Survey analytics dashboard / Sentiment analysis / Trend detection,"response_count, avg_score, trend_analysis, pain_points_identified, nps_score",Weekly aggregation
14,Generate feedback reports and trigger internal workflows for product/marketing adjustments,Leadership + Product Team,Internal reporting / Stakeholder alerts / Product backlog integration / Strategy updates,"report_id, stakeholders_notified, action_items_created, follow_up_scheduled",Within 48 hours of threshold
````

### assets/MKT03-Assets.md

````markdown
# MKT03: Polls & Assessments Assets

## 1. Needs Analysis Assessment Framework
*Type: Lead Qualification Quiz. Best placed on website popups or high-intent landing pages.*

**Intro Screen**
**Headline:** Find out if your current [Problem Area] is costing you revenue.
**Description:** Take this 2-minute diagnostic to identify the hidden bottlenecks in your [Process] and get a personalized action plan.
**Button:** Start Assessment

**Question 1: Demographics (Zero-Party Data)**
"What best describes your role?"
A) Founder / CEO (Score: +10)
B) VP / Director of [Department] (Score: +10)
C) Manager / Individual Contributor (Score: +5)
D) Consultant / Agency (Score: 0)

**Question 2: Scale (Budget Indicator)**
"How large is your current team handling [Process]?"
A) Just me (Score: +0)
B) 2-5 people (Score: +5)
C) 6-20 people (Score: +10)
D) 20+ people (Score: +15)

**Question 3: Pain Point (Need Indicator)**
"What is the most frustrating part of [Process] right now?"
A) It takes too long (Segment: Efficiency)
B) It's too expensive (Segment: Cost Reduction)
C) The quality is inconsistent (Segment: Quality Control)
D) We lack visibility/reporting (Segment: Analytics)

**Question 4: Current Solution (Competitor Intel)**
"What tool are you primarily using to manage this?"
A) Spreadsheets/Manual (Score: +15)
B) [Competitor A] (Score: +5)
C) [Competitor B] (Score: +5)
D) Custom built internal tool (Score: +10)

**Question 5: Timeline (Urgency Indicator)**
"How soon are you looking to fix this?"
A) ASAP - We're actively looking (Score: +20, Tag: Hot Lead)
B) Within 3 months (Score: +10)
C) Within 6 months (Score: +5)
D) Just researching (Score: 0)

**Lead Capture Screen**
**Headline:** Your personalized [Process] Action Plan is ready!
**Description:** Enter your email below to unlock your score and get your customized step-by-step roadmap.
[Email Field] [Name Field]

---

## 2. Personalized Results Report Template (Email + PDF Copy)

**Subject:** Your [Process] diagnostic results are inside

**Body:**
Hi [First Name],

Thanks for taking the [Process] diagnostic. Based on your answers, your current setup scored a **[Score]/100**.

You're currently in the **[Outcome Category: e.g., "Manual Growth" or "Scaling Pains"]** phase.

Because you mentioned that your biggest frustration is **[Answer from Q3: e.g., "It takes too long"]**, I wanted to highlight one specific area of your report:

*To fix the time bottleneck, you need to implement a rule-based triage system before [Step 2 in process]. Teams your size (from your answer: 6-20 people) usually save 15 hours a week just by doing this.*

I attached your full customized PDF report with the other 3 action items.

Since you're looking to fix this **[Answer from Q5: e.g., "ASAP"]**, would it be helpful if we hopped on a 10-minute call to see if our platform can automate those action items for you?

[Link to Calendar]

Best,
[Your Name]
````

### automation/MKT03-Assessment-Scoring-Blueprint.json

````json
{
  "name": "MKT03: Assessment Scoring & PDF (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "typeform:watchResponses",
      "version": 1,
      "parameters": {
        "formId": "YOUR_FORM_ID"
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
      "module": "docraptor:createDocument",
      "version": 1,
      "parameters": {},
      "mapper": {
        "document_content": "<h1>Diagnostic Results for {{1.answers.firstName}}</h1><p>Your score is {{1.calculated.score}}.</p>",
        "document_type": "pdf",
        "test": true
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
        "to": "{{1.answers.email}}",
        "subject": "Your Diagnostic Results",
        "content": "Hi {{1.answers.firstName}},\n\nAttached is your personalized report.",
        "attachments": [
          {
            "fileName": "Results.pdf",
            "data": "{{2.data}}"
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
      "module": "hubspot:createUpdateContact",
      "version": 1,
      "parameters": {},
      "mapper": {
        "email": "{{1.answers.email}}",
        "properties": [
          {
            "property": "firstname",
            "value": "{{1.answers.firstName}}"
          },
          {
            "property": "assessment_score",
            "value": "{{1.calculated.score}}"
          }
        ]
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

- `trackers/MKT03_Polls_Assessments_Tracker.xlsx`: binary attachment retained outside the Markdown kit; convert to CSV/Markdown during certification if the sheet contents become authoritative.

## Automation Blueprint

### MKT03-Assessment-Scoring-Blueprint.json

```json
{
  "name": "MKT03: Assessment Scoring & PDF (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "typeform:watchResponses",
      "version": 1,
      "parameters": {
        "formId": "YOUR_FORM_ID"
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
      "module": "docraptor:createDocument",
      "version": 1,
      "parameters": {},
      "mapper": {
        "document_content": "<h1>Diagnostic Results for {{1.answers.firstName}}</h1><p>Your score is {{1.calculated.score}}.</p>",
        "document_type": "pdf",
        "test": true
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
        "to": "{{1.answers.email}}",
        "subject": "Your Diagnostic Results",
        "content": "Hi {{1.answers.firstName}},\n\nAttached is your personalized report.",
        "attachments": [
          {
            "fileName": "Results.pdf",
            "data": "{{2.data}}"
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
      "module": "hubspot:createUpdateContact",
      "version": 1,
      "parameters": {},
      "mapper": {
        "email": "{{1.answers.email}}",
        "properties": [
          {
            "property": "firstname",
            "value": "{{1.answers.firstName}}"
          },
          {
            "property": "assessment_score",
            "value": "{{1.calculated.score}}"
          }
        ]
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

- `automation/MKT03-Assessment-Scoring-Blueprint.json`: YOUR_FORM_ID

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
