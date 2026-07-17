---
schema: kit/1.0
slug: ful-01-display-packaging
title: "FUL-01 - Display & Packaging"
summary: "Fulfillment workflow package for Display & Packaging. Consolidates registry metadata, imported source references, setup guidance, validation notes, and automation blueprints into one operative kit file."
version: 0.1.0-draft
owner: uncle-robert-consulting
license: UNLICENSED
status: imported-draft
conformance: draft
certifiedAt: null
workflowId: FUL-01
department: "Fulfillment"
automationLevel: "80-85%"
primaryOwner: "Account Manager + Marcus"
trigger: "Deliverable milestone reached"
cycleTime: "Simple: 1-2 hrs; complex: 4-8 hrs"
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

# FUL-01 - Display & Packaging

This is the consolidated `kit.md` for the workflow. It replaces the old imported-package surface as the operative file while keeping source, asset, tracker, and automation files as provenance until certification is complete.

## Goal

Run the Display & Packaging workflow for Fulfillment with a repeatable trigger, owner, cycle time, outputs, and validation path. The current draft is strong enough for agent orientation and controlled internal use; certification still requires a live run or documented manual evidence.

## When to Use

Use this workflow when the trigger occurs: **Deliverable milestone reached**.

Use it as part of the URC operating system first. Convert it into a client-safe variant only after URC-specific names, internal assumptions, and tool choices have been scrubbed or intentionally parameterized.

## Registry Metadata

| Field | Value |
| --- | --- |
| Workflow ID | FUL-01 |
| Department | Fulfillment |
| Automation level | 80-85% |
| Owner | Account Manager + Marcus |
| Trigger | Deliverable milestone reached |
| Cycle time | Simple: 1-2 hrs; complex: 4-8 hrs |
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

1. Confirm the trigger: Deliverable milestone reached.
2. Open the relevant source or asset file from the Source Map.
3. Collect the minimum inputs needed for this cycle.
4. Execute the workflow steps using the imported source as the detailed operating guide.
5. Capture output evidence, exceptions, and follow-up tasks.
6. Record meaningful package or behavior changes in `docs/operations/change-control-register.md`.

## Source Digest

- `URC-FUL-01_Display_Packaging.md`: Source file imported and retained for detailed workflow extraction.

## Source Map

| Artifact | Purpose |
| --- | --- |
| `source/URC-FUL-01_Display_Packaging.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `automation/FUL01-Deliverable-Tracking-Blueprint.json` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `trackers/FUL-01_Deliverable_Tracker.xlsx` | Retained provenance/input artifact now referenced by this consolidated kit. |

## Embedded Source and Asset Documents

### source/URC-FUL-01_Display_Packaging.md

````markdown
# FUL-01 - Display & Packaging Source

Source: `Fulfillment Department\URC Fulfillment\URC-FUL-01_Display_Packaging.docx`

This Markdown file is a text extraction of the source `.docx` for GitHub-readable access. Preserve the source path in citations until the workflow is fully converted into `kit.md` format.

UNCLE ROBERT CONSULTING LLC

URC-FUL-01 — Display & Packaging

How Every URC Deliverable Is Presented, Named, and Delivered

Robert T. McCarthy & Sheena Burns   |   v1.0   |   March 23, 2026

1. Why This Workflow Exists

Every deliverable URC produces — a workflow document, a proposal, a strategy report, a spreadsheet tracker, a Loom walkthrough — is a reflection of the agency. The quality of the packaging tells the client something about the quality of what's inside before they open a single page. This workflow ensures every deliverable looks professional, arrives correctly, and is easy for the client to use — with most of the packaging work automated.

2. Deliverable Standards — Today

TODAY

URC currently delivers: Word documents (.docx), Excel spreadsheets (.xlsx), PDF proposals,

Google Docs/Sheets links, and Loom video walkthroughs for complex deliverables.

Primary client: Holmes Media. All deliverables are delivered via Gmail with a personal cover note.

File storage: Google Drive, organized by client folder.

File Naming Convention

All URC deliverables follow this naming format:

[ClientName]_[DeliverableType]_[YYYY-MM]_v[Version]

Examples:

HolmesMedia_MarketingWorkflow_2026-03_v1.docx

HolmesMedia_KPI_Dashboard_2026-03_v1.xlsx

URC_Proposal_JasonMcCarthy_2026-03_v1.pdf

Never send a file named 'Document1' or 'Untitled'. Every file name tells the recipient what it is.

Google Drive Folder Structure

Top level: Clients / Operations / Finance / Marketing / Culture / Templates

Each client folder: Active Projects / Deliverables / Communications / Contracts / Archive

Naming for client folders: [ClientName] — e.g., Holmes Media, Five Aces, William Hopkins

Templates folder: master copies of all branded Word/Excel templates — never edit the master, always copy first

3. The Delivery Process — Step by Step

## Step

## Trigger

Action

Tool

SLA

1

Deliverable completed internally

Save final version with correct naming convention to client Google Drive folder

Google Drive

Immediately on completion

2

File saved

Export as PDF if the deliverable is a document or proposal — client receives PDF, not editable source

Google Docs / Word

Within 30 min of save

3

PDF ready

For complex deliverables (10+ pages or significant strategic content) — record a Loom walkthrough (5–10 min)

Loom

Within 2 hours of completion

4

All assets ready

Send delivery email from Gmail with personal cover note, file attached or Drive link shared, Loom link if applicable

Gmail

Same business day

5

Email sent

Log delivery in HubSpot — note: what was delivered, date, any client instructions

HubSpot

Within 1 hour of send

6

48 hours post-delivery

If no client acknowledgment — send a brief check-in: 'Just checking you received the [deliverable] — happy to answer any questions'

Gmail

48 hours

The Delivery Email Template

Subject: [Deliverable name] — [Client Name]

Hi [Name],

Here's your [deliverable type] — attached / linked below.

[One sentence about what's inside and what they should look at first.]

[If Loom: I've also recorded a quick walkthrough: [Loom link]]

Let me know if you have any questions or want to walk through anything together.

— Robert

4. Branded Templates

All URC deliverables use the standard navy/blue branding established across the department documents. The template library lives in Google Drive under Templates and contains:

Template

Format

When Used

URC Workflow Document

Word (.docx)

All department workflow documents — URC-specific and client template editions

URC Tracker / Dashboard

Excel (.xlsx)

All department trackers and KPI dashboards

URC Proposal

Word (.docx) → PDF

All client proposals — populate from SAL-04 format

URC Strategy Report

Word (.docx)

Quarterly business reviews, strategy documents for clients

URC Loom Thumbnail

Canva (PNG)

Consistent thumbnail for all Loom recordings

Before sending any new deliverable type to a client for the first time — check if a template exists. If it doesn't, create one and add it to the library. Never rebuild from scratch for a format you'll use again.

5. Quality Gate — Before Every Send

Every deliverable passes this five-point check before it leaves URC. No exceptions.

File name follows naming convention

Correct client name, date, and version number in the document header

All placeholder text removed — no [BRACKETED FIELDS] remaining in client-facing docs

Spell check run — no typos in headings or section titles

Loom walkthrough recorded if deliverable is 10+ pages or contains complex strategic content

6. Horizon 2 — Packaging at Scale

VISION

When the platform is live and URC is serving multiple clients simultaneously:

AI automatically generates the delivery email from CRM data and deliverable metadata.

File naming and folder organization happens automatically on save.

DocSend or equivalent tracks whether clients open deliverables and alerts the account manager.

Loom walkthrough scripts are drafted by AI from the document content — Robert records, AI writes.

The packaging workflow runs in the background for every client simultaneously.

7. Review Cadence

Template library: reviewed quarterly — any new deliverable types need a template?

Quality gate checklist: reviewed whenever a quality issue traces back to packaging

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

### automation/FUL01-Deliverable-Tracking-Blueprint.json

````json
{
  "name": "FUL01: Deliverable Sprint Tracker & Escalation (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "clickup:watchTaskStatusChange",
      "version": 1,
      "parameters": {
        "listId": "YOUR_SPRINT_LIST_ID",
        "statuses": ["in progress", "blocked", "complete"]
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
            "content": "You are a project manager monitoring a 90-day workflow installation sprint. Given a task status change, determine: (1) days remaining in the 90-day window, (2) whether the task is a client-dependency (requires client credentials or access), (3) whether escalation is needed. Escalate if: client-dependency task has been in 'blocked' for > 7 days, or remaining sprint days < 14 with > 30% tasks incomplete. Return JSON: {taskName, newStatus, daysRemaining, isClientDependency, escalate: boolean, escalationReason}."
          },
          {
            "role": "user",
            "content": "Task: {{1.taskName}}\nNew Status: {{1.status}}\nSprint Start: {{1.customFields.sprintStart}}\nTotal Tasks: {{1.customFields.totalTasks}}\nCompleted Tasks: {{1.customFields.completedTasks}}"
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
      "module": "microsoft-teams:createMessage",
      "version": 1,
      "parameters": {
        "channel": "fulfillment-alerts"
      },
      "mapper": {
        "text": "🚨 *Sprint Escalation*\n*Client:* {{1.taskName}}\n*Days Remaining:* {{2.choices[0].message.content.daysRemaining}}\n*Reason:* {{2.choices[0].message.content.escalationReason}}"
      },
      "metadata": {
        "designer": {
          "x": 900,
          "y": -150
        },
        "note": "Route: escalate == true"
      }
    },
    {
      "id": 5,
      "module": "google-sheets:appendRow",
      "version": 1,
      "parameters": {
        "spreadsheetId": "YOUR_FUL01_TRACKER_ID"
      },
      "mapper": {
        "values": ["{{formatDate(now; 'YYYY-MM-DD HH:mm')}}", "{{1.taskName}}", "{{1.status}}", "{{2.choices[0].message.content.daysRemaining}}"]
      },
      "metadata": {
        "designer": {
          "x": 900,
          "y": 150
        },
        "note": "Route: always (activity log)"
      }
    }
  ],
  "metadata": {
    "version": 1
  }
}
````

## Binary Attachments

- `trackers/FUL-01_Deliverable_Tracker.xlsx`: binary attachment retained outside the Markdown kit; convert to CSV/Markdown during certification if the sheet contents become authoritative.

## Automation Blueprint

### FUL01-Deliverable-Tracking-Blueprint.json

```json
{
  "name": "FUL01: Deliverable Sprint Tracker & Escalation (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "clickup:watchTaskStatusChange",
      "version": 1,
      "parameters": {
        "listId": "YOUR_SPRINT_LIST_ID",
        "statuses": ["in progress", "blocked", "complete"]
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
            "content": "You are a project manager monitoring a 90-day workflow installation sprint. Given a task status change, determine: (1) days remaining in the 90-day window, (2) whether the task is a client-dependency (requires client credentials or access), (3) whether escalation is needed. Escalate if: client-dependency task has been in 'blocked' for > 7 days, or remaining sprint days < 14 with > 30% tasks incomplete. Return JSON: {taskName, newStatus, daysRemaining, isClientDependency, escalate: boolean, escalationReason}."
          },
          {
            "role": "user",
            "content": "Task: {{1.taskName}}\nNew Status: {{1.status}}\nSprint Start: {{1.customFields.sprintStart}}\nTotal Tasks: {{1.customFields.totalTasks}}\nCompleted Tasks: {{1.customFields.completedTasks}}"
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
      "module": "microsoft-teams:createMessage",
      "version": 1,
      "parameters": {
        "channel": "fulfillment-alerts"
      },
      "mapper": {
        "text": "🚨 *Sprint Escalation*\n*Client:* {{1.taskName}}\n*Days Remaining:* {{2.choices[0].message.content.daysRemaining}}\n*Reason:* {{2.choices[0].message.content.escalationReason}}"
      },
      "metadata": {
        "designer": {
          "x": 900,
          "y": -150
        },
        "note": "Route: escalate == true"
      }
    },
    {
      "id": 5,
      "module": "google-sheets:appendRow",
      "version": 1,
      "parameters": {
        "spreadsheetId": "YOUR_FUL01_TRACKER_ID"
      },
      "mapper": {
        "values": ["{{formatDate(now; 'YYYY-MM-DD HH:mm')}}", "{{1.taskName}}", "{{1.status}}", "{{2.choices[0].message.content.daysRemaining}}"]
      },
      "metadata": {
        "designer": {
          "x": 900,
          "y": 150
        },
        "note": "Route: always (activity log)"
      }
    }
  ],
  "metadata": {
    "version": 1
  }
}
```

## Placeholder and Binding Notes

- `source/URC-FUL-01_Display_Packaging.md`: placeholder, [YYYY-MM], [BRACKETED FIELDS]
- `automation/FUL01-Deliverable-Tracking-Blueprint.json`: YOUR_SPRINT_LIST_ID, YOUR_FUL01_TRACKER_ID

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
