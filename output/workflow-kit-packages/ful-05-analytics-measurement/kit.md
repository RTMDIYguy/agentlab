---
schema: kit/1.0
slug: ful-05-analytics-measurement
title: "FUL-05 - Analytics & Measurement"
summary: "Fulfillment workflow package for Analytics & Measurement. Consolidates registry metadata, imported source references, setup guidance, validation notes, and automation blueprints into one operative kit file."
version: 0.1.0-draft
owner: uncle-robert-consulting
license: UNLICENSED
status: imported-draft
conformance: draft
certifiedAt: null
workflowId: FUL-05
department: "Fulfillment"
automationLevel: "85-90%"
primaryOwner: "Robert + Operations Lead"
trigger: "Real-time/daily automated refresh"
cycleTime: "Dashboard: real-time; reports: weekly/monthly"
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
  - ful
  - fulfillment
---

# FUL-05 - Analytics & Measurement

This is the consolidated `kit.md` for the workflow. It replaces the old imported-package surface as the operative file while keeping source, asset, tracker, and automation files as provenance until certification is complete.

## Goal

Run the Analytics & Measurement workflow for Fulfillment with a repeatable trigger, owner, cycle time, outputs, and validation path. The current draft is strong enough for agent orientation and controlled internal use; certification still requires a live run or documented manual evidence.

## When to Use

Use this workflow when the trigger occurs: **Real-time/daily automated refresh**.

Use it as part of the URC operating system first. Convert it into a client-safe variant only after URC-specific names, internal assumptions, and tool choices have been scrubbed or intentionally parameterized.

## Registry Metadata

| Field | Value |
| --- | --- |
| Workflow ID | FUL-05 |
| Department | Fulfillment |
| Automation level | 85-90% |
| Owner | Robert + Operations Lead |
| Trigger | Real-time/daily automated refresh |
| Cycle time | Dashboard: real-time; reports: weekly/monthly |
| Source status | Imported source |

## Inputs

- Trigger event or planning cadence identified above.
- Current URC operating context for Fulfillment.
- Any imported source, asset, tracker, or automation artifacts listed in the Source Map.
- Human approval from the owner before external sends, money movement, access changes, or client-visible commitments.

## Setup

1. Read this kit end to end.
2. Review the Source Digest and Source Map below.
3. Bind any placeholders listed in Placeholder and Binding Notes.
4. If an automation blueprint is embedded, import or rebuild it in the chosen runtime only after credentials and fallback paths are confirmed.
5. Run the Validation checklist before treating the workflow as complete.

## Quickstart

1. Confirm the trigger: Real-time/daily automated refresh.
2. Open the relevant source or asset file from the Source Map.
3. Collect the minimum inputs needed for this cycle.
4. Execute the workflow steps using the imported source as the detailed operating guide.
5. Capture output evidence, exceptions, and follow-up tasks.
6. Record meaningful package or behavior changes in `docs/operations/change-control-register.md`.

## Source Digest

- `URC-FUL-05_Analytics_Measurement.md`: Source file imported and retained for detailed workflow extraction.

## Source Map

| Artifact | Purpose |
| --- | --- |
| `source/URC-FUL-05_Analytics_Measurement.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `automation/FUL05-Analytics-Measurement-Blueprint.json` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `trackers/FUL-05_Analytics_KPI_Dashboard.xlsx` | Retained provenance/input artifact now referenced by this consolidated kit. |

## Embedded Source and Asset Documents

### source/URC-FUL-05_Analytics_Measurement.md

````markdown
# FUL-05 - Analytics & Measurement Source

Source: `Fulfillment Department\URC Fulfillment\URC-FUL-05_Analytics_Measurement.docx`

This Markdown file is a text extraction of the source `.docx` for GitHub-readable access. Preserve the source path in citations until the workflow is fully converted into `kit.md` format.

UNCLE ROBERT CONSULTING LLC

URC-FUL-05 — Analytics & Measurement

The Numbers That Tell the Truth About How URC Is Performing

Robert T. McCarthy & Sheena Burns   |   v1.0   |   March 23, 2026

1. Why This Workflow Exists

You cannot improve what you do not measure. For a two-person agency building toward a platform, the temptation is to stay in motion and avoid the mirror. But the numbers tell the truth about what's working and what isn't — faster and more reliably than gut feeling. This workflow defines the metrics that matter at URC's current stage, where they come from, and how often Robert reviews them.

The goal is not a complex analytics stack. The goal is a small set of honest numbers reviewed consistently.

2. The Three-Tier Metrics Framework

Tier 1 — Agency Health (Robert Reviews Weekly)

Metric

What It Measures

Where to Find It

Target

Monthly Recurring Revenue (MRR)

Total recurring income from active retainer clients

QuickBooks + Stripe

Growing month over month

Active clients

Number of clients with ongoing work or retainer

HubSpot contacts (Customer stage)

5+ by end of 2026

Pipeline value

Total value of deals in progress in HubSpot

HubSpot deals pipeline

3x monthly revenue target

Proposals sent this month

Volume of sales activity

HubSpot (Proposal Sent stage)

At least 2/month

Closed won this month

Revenue actually landing

HubSpot (Closed Won stage)

1+ per month minimum

Tier 2 — Client Outcomes (Robert Reviews Monthly)

Metric

What It Measures

Where to Find It

Target

Client health scores

How healthy each engagement is

HubSpot notes — manual update post-interaction

All clients Green or Yellow

Deliverables on time

% of client milestones met by agreed date

ClickUp task completion vs due dates

95%+

Check-ins completed

% of scheduled check-ins that happened

Gmail thread history

100%

NPS scores received

Client satisfaction average

Manual log — Google Sheet or HubSpot note

Average 8+ out of 10

Referrals generated

New leads sourced from existing clients

HubSpot source: Referral

1+ per quarter minimum

Tier 3 — Platform Build Progress (Robert Reviews Monthly)

Metric

What It Measures

Where to Find It

Target

Workflows tested

How many of the 34 templates have been run in live conditions

CUL-03 build tracker

All 34 tested by Q3 2026

Playbooks completed

Workflows converted to AI-executable playbook format

CUL-03 build tracker

First 7 (one per dept) by Q4 2026

At Zero Cost progress

Status of prototype development

Email thread + CUL-03 notes

Call completed; prototype scoped

YC engagement

Application and Startup School status

YC portal

Startup School attended April 2026

3. The Weekly Dashboard — 20 Minutes Every Monday

This is not a reporting exercise. It is a 20-minute Monday morning ritual that tells Robert what needs attention this week before anything else starts.

Check

Question to Answer

Source

Action If Off Track

MRR vs last month

Did revenue grow, stay flat, or drop?

QuickBooks

If dropped: investigate which client changed and why

Pipeline health

Are there active deals in progress?

HubSpot

If empty: referral outreach today — see SAL-02

Follow-ups due

Any proposals needing a 48-hour or 5-day follow-up today?

HubSpot tasks

Send the follow-up before anything else

Client health

Any client showing Yellow or Red signals?

HubSpot notes

Outreach to Yellow today; call for Red immediately

Deliverables due this week

Anything promised to a client this week?

ClickUp

Confirm it's on track or communicate early if it isn't

4. The Monthly Review — First Friday of Each Month

The monthly review is 45 minutes — longer than the weekly check but still focused. It covers all three metric tiers and produces one output: three action items for the coming month.

Pull MRR from QuickBooks — compare to prior month and to the north star target in CUL-01

Review all client health scores — update any that haven't been touched in 30+ days

Count deliverables completed on time this month — log the percentage

Review Mailchimp stats — open rate, subscriber growth, any replies worth following up

Review platform build progress — which phase are we in, what's the next milestone?

Write three action items for next month — specific, owned, dated

Send Sheena a 3-sentence update: where we are, what moved, what's next

5. The Metrics That Don't Matter Yet

These are metrics that will matter when URC reaches scale — but tracking them now would create noise without signal. Revisit when the platform has 5+ licensees.

Customer Acquisition Cost (CAC) — too few data points to be meaningful

Lifetime Value (LTV) — not enough client history yet

Net Revenue Retention — only meaningful with 10+ clients

Sales cycle length — too few deals to average

Content engagement metrics — LinkedIn analytics before the platform is built

Measuring everything before you have enough data to act on it

is a distraction from building and serving clients.

Track the minimum. Act on what you find. Expand the metrics as the business grows.

6. Reporting to Sheena and Investors

Sheena — Monthly (End of Month)

Three sentences via text or email: revenue this month, one client win, one thing building. This keeps Sheena connected to real progress without requiring a meeting.

At Zero Cost — As Needed

Progress on workflow testing and playbook development — framed as product specification advancement. Show the build tracker from CUL-03.

YC and Investors — When Relevant

The four metrics that matter most for the YC story: active clients, MRR, workflows tested, and platform build phase. These come from Tier 1 and Tier 3 above. Keep them current — you may need them at short notice.

7. Horizon 2 — Analytics at Scale

VISION

A live executive dashboard — MRR, client health portfolio, pipeline, and build progress in one view.

Automated weekly report generated every Monday morning and emailed to Robert before 8am.

Client-facing dashboards: each licensee sees their own metrics — workflows run, time saved, ROI.

Anomaly detection: any metric deviating more than 15% from trend triggers an automatic alert.

Perplexity Pro used weekly to contextualize URC metrics against market benchmarks.

Quarterly investor update auto-generated from live metrics with Robert's commentary added.

8. Review Cadence

Weekly dashboard: every Monday — 20 minutes, non-negotiable

Monthly review: first Friday of each month — 45 minutes

Metrics framework: reviewed quarterly — are we tracking the right things for our current stage?

## Owner: Robert T. McCarthy

Version

Date

Author

Summary

v1.0

March 23, 2026

R. McCarthy & S. Burns

Initial URC Fulfillment document — built from actual operations
````

### automation/FUL05-Analytics-Measurement-Blueprint.json

````json
{
  "name": "FUL05: ROI Dashboard Refresh & Client Report (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "schedule:trigger",
      "version": 1,
      "parameters": {
        "interval": "1d",
        "time": "06:00"
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
      "module": "http:makeRequest",
      "version": 1,
      "parameters": {
        "url": "YOUR_MAKE_EXECUTION_LOG_API",
        "method": "GET"
      },
      "mapper": {
        "query": {
          "period": "last30days",
          "status": "success"
        }
      },
      "metadata": {
        "designer": {
          "x": 300,
          "y": 0
        },
        "note": "Pull execution counts from Make.com API for workflow usage metrics"
      }
    },
    {
      "id": 3,
      "module": "openai:createCompletion",
      "version": 1,
      "parameters": {
        "model": "gpt-4"
      },
      "mapper": {
        "messages": [
          {
            "role": "system",
            "content": "You are an ROI analyst for a workflow automation consultancy. Given execution log data, calculate: (1) total executions this period, (2) estimated time saved (assume 15 min per manual equivalent), (3) estimated cost saved (time saved * $50/hr), (4) data freshness check — flag if any data source is > 24 hours stale. Write a plain-language summary suitable for a non-technical client. Include a glossary of terms used. Return JSON: {totalExecutions, timeSavedHours, costSaved, dataFreshness, clientSummary, glossary: {term: definition}}."
          },
          {
            "role": "user",
            "content": "Execution data: {{2.body}}\nBaseline date: {{YOUR_BASELINE_DATE}}"
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
      "module": "google-sheets:appendRow",
      "version": 1,
      "parameters": {
        "spreadsheetId": "YOUR_FUL05_TRACKER_ID"
      },
      "mapper": {
        "values": ["{{formatDate(now; 'YYYY-MM-DD')}}", "{{3.choices[0].message.content.totalExecutions}}", "{{3.choices[0].message.content.timeSavedHours}}", "{{3.choices[0].message.content.costSaved}}"]
      },
      "metadata": {
        "designer": {
          "x": 900,
          "y": -150
        }
      }
    },
    {
      "id": 5,
      "module": "builtin:Router",
      "version": 1,
      "parameters": {},
      "mapper": {},
      "metadata": {
        "designer": {
          "x": 900,
          "y": 150
        }
      }
    },
    {
      "id": 6,
      "module": "email:sendEmail",
      "version": 1,
      "parameters": {},
      "mapper": {
        "to": "{{YOUR_CLIENT_EMAIL}}",
        "subject": "Monthly ROI Summary — {{formatDate(now; 'MMMM YYYY')}}",
        "body": "{{3.choices[0].message.content.clientSummary}}\n\nGlossary:\n{{3.choices[0].message.content.glossary}}\n\nWant to walk through this together? Book 15 minutes: {{YOUR_BOOKING_URL}}"
      },
      "metadata": {
        "designer": {
          "x": 1200,
          "y": 150
        },
        "note": "Route: monthly (1st of month only)"
      }
    }
  ],
  "metadata": {
    "version": 1
  }
}
````

## Binary Attachments

- `trackers/FUL-05_Analytics_KPI_Dashboard.xlsx`: binary attachment retained outside the Markdown kit; convert to CSV/Markdown during certification if the sheet contents become authoritative.

## Automation Blueprint

### FUL05-Analytics-Measurement-Blueprint.json

```json
{
  "name": "FUL05: ROI Dashboard Refresh & Client Report (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "schedule:trigger",
      "version": 1,
      "parameters": {
        "interval": "1d",
        "time": "06:00"
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
      "module": "http:makeRequest",
      "version": 1,
      "parameters": {
        "url": "YOUR_MAKE_EXECUTION_LOG_API",
        "method": "GET"
      },
      "mapper": {
        "query": {
          "period": "last30days",
          "status": "success"
        }
      },
      "metadata": {
        "designer": {
          "x": 300,
          "y": 0
        },
        "note": "Pull execution counts from Make.com API for workflow usage metrics"
      }
    },
    {
      "id": 3,
      "module": "openai:createCompletion",
      "version": 1,
      "parameters": {
        "model": "gpt-4"
      },
      "mapper": {
        "messages": [
          {
            "role": "system",
            "content": "You are an ROI analyst for a workflow automation consultancy. Given execution log data, calculate: (1) total executions this period, (2) estimated time saved (assume 15 min per manual equivalent), (3) estimated cost saved (time saved * $50/hr), (4) data freshness check — flag if any data source is > 24 hours stale. Write a plain-language summary suitable for a non-technical client. Include a glossary of terms used. Return JSON: {totalExecutions, timeSavedHours, costSaved, dataFreshness, clientSummary, glossary: {term: definition}}."
          },
          {
            "role": "user",
            "content": "Execution data: {{2.body}}\nBaseline date: {{YOUR_BASELINE_DATE}}"
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
      "module": "google-sheets:appendRow",
      "version": 1,
      "parameters": {
        "spreadsheetId": "YOUR_FUL05_TRACKER_ID"
      },
      "mapper": {
        "values": ["{{formatDate(now; 'YYYY-MM-DD')}}", "{{3.choices[0].message.content.totalExecutions}}", "{{3.choices[0].message.content.timeSavedHours}}", "{{3.choices[0].message.content.costSaved}}"]
      },
      "metadata": {
        "designer": {
          "x": 900,
          "y": -150
        }
      }
    },
    {
      "id": 5,
      "module": "builtin:Router",
      "version": 1,
      "parameters": {},
      "mapper": {},
      "metadata": {
        "designer": {
          "x": 900,
          "y": 150
        }
      }
    },
    {
      "id": 6,
      "module": "email:sendEmail",
      "version": 1,
      "parameters": {},
      "mapper": {
        "to": "{{YOUR_CLIENT_EMAIL}}",
        "subject": "Monthly ROI Summary — {{formatDate(now; 'MMMM YYYY')}}",
        "body": "{{3.choices[0].message.content.clientSummary}}\n\nGlossary:\n{{3.choices[0].message.content.glossary}}\n\nWant to walk through this together? Book 15 minutes: {{YOUR_BOOKING_URL}}"
      },
      "metadata": {
        "designer": {
          "x": 1200,
          "y": 150
        },
        "note": "Route: monthly (1st of month only)"
      }
    }
  ],
  "metadata": {
    "version": 1
  }
}
```

## Placeholder and Binding Notes

- `automation/FUL05-Analytics-Measurement-Blueprint.json`: YOUR_MAKE_EXECUTION_LOG_API, YOUR_BASELINE_DATE, YOUR_FUL05_TRACKER_ID, YOUR_CLIENT_EMAIL, YOUR_BOOKING_URL

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
