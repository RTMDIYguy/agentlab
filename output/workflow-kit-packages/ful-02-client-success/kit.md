---
schema: kit/1.0
slug: ful-02-client-success
title: "FUL-02 - Client Success"
summary: "Fulfillment workflow package for Client Success. Consolidates registry metadata, imported source references, setup guidance, validation notes, and automation blueprints into one operative kit file."
version: 0.1.0-draft
owner: uncle-robert-consulting
license: UNLICENSED
status: imported-draft
conformance: draft
certifiedAt: null
workflowId: FUL-02
department: "Fulfillment"
automationLevel: "80-85%"
primaryOwner: "Account Manager"
trigger: "Continuous - daily health monitoring"
cycleTime: "Scoring: daily; QBR: quarterly"
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

# FUL-02 - Client Success

This is the consolidated `kit.md` for the workflow. It replaces the old imported-package surface as the operative file while keeping source, asset, tracker, and automation files as provenance until certification is complete.

## Goal

Run the Client Success workflow for Fulfillment with a repeatable trigger, owner, cycle time, outputs, and validation path. The current draft is strong enough for agent orientation and controlled internal use; certification still requires a live run or documented manual evidence.

## When to Use

Use this workflow when the trigger occurs: **Continuous - daily health monitoring**.

Use it as part of the URC operating system first. Convert it into a client-safe variant only after URC-specific names, internal assumptions, and tool choices have been scrubbed or intentionally parameterized.

## Registry Metadata

| Field | Value |
| --- | --- |
| Workflow ID | FUL-02 |
| Department | Fulfillment |
| Automation level | 80-85% |
| Owner | Account Manager |
| Trigger | Continuous - daily health monitoring |
| Cycle time | Scoring: daily; QBR: quarterly |
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

1. Confirm the trigger: Continuous - daily health monitoring.
2. Open the relevant source or asset file from the Source Map.
3. Collect the minimum inputs needed for this cycle.
4. Execute the workflow steps using the imported source as the detailed operating guide.
5. Capture output evidence, exceptions, and follow-up tasks.
6. Record meaningful package or behavior changes in `docs/operations/change-control-register.md`.

## Source Digest

- `URC-FUL-02_Client_Success.md`: Source file imported and retained for detailed workflow extraction.

## Source Map

| Artifact | Purpose |
| --- | --- |
| `source/URC-FUL-02_Client_Success.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `automation/FUL02-Client-Success-Blueprint.json` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `trackers/FUL-02_Client_Health_Dashboard.xlsx` | Retained provenance/input artifact now referenced by this consolidated kit. |

## Embedded Source and Asset Documents

### source/URC-FUL-02_Client_Success.md

````markdown
# FUL-02 - Client Success Source

Source: `Fulfillment Department\URC Fulfillment\URC-FUL-02_Client_Success.docx`

This Markdown file is a text extraction of the source `.docx` for GitHub-readable access. Preserve the source path in citations until the workflow is fully converted into `kit.md` format.

UNCLE ROBERT CONSULTING LLC

URC-FUL-02 — Client Success

Proactive Health Monitoring, Check-Ins, and Outcome Delivery

Robert T. McCarthy & Sheena Burns   |   v1.0   |   March 23, 2026

1. Why This Workflow Exists

Client success is the proactive discipline that keeps clients from ever reaching the point of wanting to leave. It is not customer service — that is reactive. Client success is anticipating what clients need before they ask, monitoring whether they're getting value, and intervening early when something isn't working. At URC's current stage this is done personally by Robert. As the platform scales, it becomes the job of the Client Success AI agent.

2. The Client Health Score

Every active client has a health score — a single number that tells Robert at a glance how the engagement is going. On the free HubSpot tier this is tracked manually in a note and updated after each interaction.

Component

Weight

Green (Healthy)

Yellow (Watch)

Red (At Risk)

Deliverable timeliness

25%

All milestones met on time

1 milestone late

2+ milestones late or missed

Client responsiveness

20%

Replies within 48 hours consistently

Replies within 1 week

Radio silence 2+ weeks

Satisfaction signals

25%

Positive feedback, referrals made, expanding scope

Neutral, no feedback

Complaints, scope disputes, or cancellation signals

## Goal progress

20%

Measurable progress toward contracted outcomes

Partial progress

No visible progress toward goals

Payment timeliness

10%

All invoices paid on or before due date

1 invoice late

2+ invoices late or disputed

Green (80–100): Healthy engagement. Maintain current rhythm.

Yellow (60–79): Watch closely. Increase check-in frequency. Ask what's getting in the way.

Red (0–59): Immediate personal outreach required. Do not wait for the next scheduled call.

3. Client Check-In Cadence

Client Tier

Check-In Frequency

Format

Who Leads

Tier 1 — Jumpstart ($500)

Once at 30 days post-delivery

Personal email — how is the system working?

Robert

Tier 2 — AI Growth Pod ($1,500)

Weekly during build phase; monthly post-launch

Call or email during build; email monthly after

Robert

Tier 3 — Retainer ($1,000–$2,000/mo)

Monthly call (60 min) + weekly email check-in

Monthly strategy call via Zoom; weekly async email

Robert (Sheena joins monthly call when available)

Holmes Media (Active)

Monthly strategy call + as-needed during projects

Zoom call; Gmail for day-to-day

Robert

4. The Check-In Email Template

Subject: Quick check-in — [Client Name]

Hi [Name],

Just checking in on how things are going with [specific system or project].

A couple of quick questions:

1. Is [the lead capture / the automation / the system we built] working the way you expected?

2. Anything that's felt clunky or isn't quite right?

3. Anything new coming up that might need attention?

No need to write an essay — even a quick reply helps me make sure we're on track.

— Robert

5. The Quarterly Business Review (QBR)

Every Tier 3 retainer client receives a Quarterly Business Review — a structured 60-minute call where Robert reviews what was accomplished, measures results against goals, and sets priorities for the next quarter. This is the most important retention tool URC has.

QBR Preparation (1 week before the call)

Pull all deliverables completed this quarter — list them with completion dates

Review original goals set at engagement start — what were we trying to achieve?

Gather any measurable outcomes — leads captured, time saved, revenue impact if trackable

Review satisfaction signals from the quarter — any complaints, any praise, any referrals?

Prepare 3 recommendations for next quarter based on what you've learned

Build a simple one-page summary doc using the URC Strategy Report template

QBR Agenda

Opening (5 min) — how are you doing? What's changed in the business since we last spoke?

Wins review (15 min) — walk through what was accomplished and the measurable results

Honest assessment (10 min) — what worked well, what didn't, what we'd do differently

Next quarter priorities (20 min) — based on where the business is now, what matters most?

Action items and close (10 min) — specific next steps with owners and dates

Post-QBR (within 24 hours)

Email summary of action items to the client

Update HubSpot contact record with QBR notes and next quarter priorities

If upsell opportunity identified — log it in HubSpot and follow the SAL-04 proposal process

6. At-Risk Client Intervention

When a client's health score drops to Red or Robert notices any of these warning signs — act within 24 hours, not at the next scheduled check-in.

Warning Signs

No reply to two consecutive check-in emails

A complaint or frustrated message — any tone that feels like disappointment

Invoice unpaid 14+ days past due date

Client mentions a competitor or alternative

Scope creep requests that signal dissatisfaction with what was delivered

The Intervention

Personal call or voice message — not email. Pick up the phone.

Open with acknowledgment: 'I want to make sure we're on the same page about how things are going.'

Ask, don't assume: 'What's feeling off right now?' — let them tell you.

Commit to a specific remedy with a specific date — not 'I'll look into it.'

Follow up 48 hours later to confirm the remedy landed.

7. Upsell Identification

The best time to identify an upsell is during a check-in or QBR when a client mentions a problem that URC can solve. Never pitch an upsell at the beginning of a relationship. Earn it.

Signal

What They Say

What It Means

Recommended Next Step

Capacity signal

'I'm still spending so much time on [task]'

The system we built didn't go far enough

Propose an expansion to Tier 2 or retainer

Growth signal

'We're getting more leads but I can't keep up'

They need more automation, not less

Propose additional automation layer

Referral signal

'My friend [name] has the same problem'

Warm referral opportunity

Ask for the introduction — see SAL-02

Satisfaction signal

'This has been so helpful, what else can you do?'

Open door to expand scope

Schedule a discovery conversation for next phase

8. Horizon 2 — Client Success at Scale

VISION

The Client Success AI agent monitors health scores daily across all active clients.

Automated check-in emails sent on schedule — personalized from CRM data.

Health score drops below 60: agent flags to Robert immediately with full context.

QBR decks auto-generated from deliverable history, goal tracking, and satisfaction data.

Upsell signals detected automatically and surfaced to Robert with recommended approach.

Robert focuses on the calls that matter — the AI handles the monitoring.

9. Review Cadence

Client health scores: updated after every meaningful client interaction

QBR process: reviewed after each QBR — what worked, what to sharpen?

## Owner: Robert T. McCarthy (Sheena joins QBR calls for Tier 3 clients when available)

Version

Date

Author

Summary

v1.0

March 23, 2026

R. McCarthy & S. Burns

Initial URC Fulfillment document — built from actual operations
````

### automation/FUL02-Client-Success-Blueprint.json

````json
{
  "name": "FUL02: Client Health Assessment & Intervention (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "schedule:trigger",
      "version": 1,
      "parameters": {
        "interval": "1w",
        "day": "Thursday",
        "time": "09:00"
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
      "module": "google-sheets:getRows",
      "version": 1,
      "parameters": {
        "spreadsheetId": "YOUR_FUL02_DASHBOARD_ID",
        "sheetName": "ActiveClients"
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
      "module": "openai:createCompletion",
      "version": 1,
      "parameters": {
        "model": "gpt-4"
      },
      "mapper": {
        "messages": [
          {
            "role": "system",
            "content": "You are a client success manager. Given a list of active clients with their last contact date, payment status, and open tickets, assign a health flag: GREEN (contact < 7 days, payment current, 0 open tickets), YELLOW (contact 7-14 days OR 1 open ticket), RED (contact > 14 days OR payment overdue OR > 1 open ticket). For YELLOW/RED clients, draft a proactive check-in message. Return JSON array: [{client, healthFlag, lastContact, daysSinceContact, openTickets, paymentStatus, checkInDraft}]."
          },
          {
            "role": "user",
            "content": "Clients: {{2.rows}}\nToday: {{formatDate(now; 'YYYY-MM-DD')}}"
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
      "module": "clickup:createTask",
      "version": 1,
      "parameters": {
        "listId": "YOUR_INTERVENTIONS_LIST_ID"
      },
      "mapper": {
        "name": "🔴 RED Client Intervention: {{3.choices[0].message.content[].client}}",
        "priority": 1,
        "dueDate": "{{addDays(now; 1)}}"
      },
      "metadata": {
        "designer": {
          "x": 1200,
          "y": -200
        },
        "note": "Route: healthFlag == RED"
      }
    },
    {
      "id": 6,
      "module": "email:sendEmail",
      "version": 1,
      "parameters": {},
      "mapper": {
        "to": "{{3.choices[0].message.content[].client.email}}",
        "subject": "Quick check-in from Uncle Robert Consulting",
        "body": "{{3.choices[0].message.content[].checkInDraft}}"
      },
      "metadata": {
        "designer": {
          "x": 1200,
          "y": 0
        },
        "note": "Route: healthFlag == YELLOW or RED"
      }
    },
    {
      "id": 7,
      "module": "google-sheets:updateRow",
      "version": 1,
      "parameters": {
        "spreadsheetId": "YOUR_FUL02_DASHBOARD_ID"
      },
      "mapper": {
        "values": {
          "healthFlag": "{{3.choices[0].message.content[].healthFlag}}",
          "lastAssessment": "{{formatDate(now; 'YYYY-MM-DD')}}"
        }
      },
      "metadata": {
        "designer": {
          "x": 1200,
          "y": 200
        },
        "note": "Route: always (update dashboard)"
      }
    }
  ],
  "metadata": {
    "version": 1
  }
}
````

## Binary Attachments

- `trackers/FUL-02_Client_Health_Dashboard.xlsx`: binary attachment retained outside the Markdown kit; convert to CSV/Markdown during certification if the sheet contents become authoritative.

## Automation Blueprint

### FUL02-Client-Success-Blueprint.json

```json
{
  "name": "FUL02: Client Health Assessment & Intervention (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "schedule:trigger",
      "version": 1,
      "parameters": {
        "interval": "1w",
        "day": "Thursday",
        "time": "09:00"
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
      "module": "google-sheets:getRows",
      "version": 1,
      "parameters": {
        "spreadsheetId": "YOUR_FUL02_DASHBOARD_ID",
        "sheetName": "ActiveClients"
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
      "module": "openai:createCompletion",
      "version": 1,
      "parameters": {
        "model": "gpt-4"
      },
      "mapper": {
        "messages": [
          {
            "role": "system",
            "content": "You are a client success manager. Given a list of active clients with their last contact date, payment status, and open tickets, assign a health flag: GREEN (contact < 7 days, payment current, 0 open tickets), YELLOW (contact 7-14 days OR 1 open ticket), RED (contact > 14 days OR payment overdue OR > 1 open ticket). For YELLOW/RED clients, draft a proactive check-in message. Return JSON array: [{client, healthFlag, lastContact, daysSinceContact, openTickets, paymentStatus, checkInDraft}]."
          },
          {
            "role": "user",
            "content": "Clients: {{2.rows}}\nToday: {{formatDate(now; 'YYYY-MM-DD')}}"
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
      "module": "clickup:createTask",
      "version": 1,
      "parameters": {
        "listId": "YOUR_INTERVENTIONS_LIST_ID"
      },
      "mapper": {
        "name": "🔴 RED Client Intervention: {{3.choices[0].message.content[].client}}",
        "priority": 1,
        "dueDate": "{{addDays(now; 1)}}"
      },
      "metadata": {
        "designer": {
          "x": 1200,
          "y": -200
        },
        "note": "Route: healthFlag == RED"
      }
    },
    {
      "id": 6,
      "module": "email:sendEmail",
      "version": 1,
      "parameters": {},
      "mapper": {
        "to": "{{3.choices[0].message.content[].client.email}}",
        "subject": "Quick check-in from Uncle Robert Consulting",
        "body": "{{3.choices[0].message.content[].checkInDraft}}"
      },
      "metadata": {
        "designer": {
          "x": 1200,
          "y": 0
        },
        "note": "Route: healthFlag == YELLOW or RED"
      }
    },
    {
      "id": 7,
      "module": "google-sheets:updateRow",
      "version": 1,
      "parameters": {
        "spreadsheetId": "YOUR_FUL02_DASHBOARD_ID"
      },
      "mapper": {
        "values": {
          "healthFlag": "{{3.choices[0].message.content[].healthFlag}}",
          "lastAssessment": "{{formatDate(now; 'YYYY-MM-DD')}}"
        }
      },
      "metadata": {
        "designer": {
          "x": 1200,
          "y": 200
        },
        "note": "Route: always (update dashboard)"
      }
    }
  ],
  "metadata": {
    "version": 1
  }
}
```

## Placeholder and Binding Notes

- `automation/FUL02-Client-Success-Blueprint.json`: YOUR_FUL02_DASHBOARD_ID, YOUR_INTERVENTIONS_LIST_ID

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
