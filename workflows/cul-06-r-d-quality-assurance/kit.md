---
schema: kit/1.0
slug: cul-06-r-d-quality-assurance
title: "CUL-06 - R&D & Quality Assurance"
summary: "Culture workflow package for R&D & Quality Assurance. Consolidates registry metadata, imported source references, setup guidance, validation notes, and automation blueprints into one operative kit file."
version: 0.1.0-draft
owner: uncle-robert-consulting
license: UNLICENSED
status: imported-draft
conformance: draft
certifiedAt: null
workflowId: CUL-06
department: "Culture"
automationLevel: "65-75%"
primaryOwner: "Robert T. McCarthy"
trigger: "Monthly QA cycle; quarterly R&D sprint"
cycleTime: "Tool eval: 2-week trial; QA: every deliverable"
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
  - cul
  - culture
---

# CUL-06 - R&D & Quality Assurance

This is the consolidated `kit.md` for the workflow. It replaces the old imported-package surface as the operative file while keeping source, asset, tracker, and automation files as provenance until certification is complete.

## Goal

Run the R&D & Quality Assurance workflow for Culture with a repeatable trigger, owner, cycle time, outputs, and validation path. The current draft is strong enough for agent orientation and controlled internal use; certification still requires a live run or documented manual evidence.

## When to Use

Use this workflow when the trigger occurs: **Monthly QA cycle; quarterly R&D sprint**.

Use it as part of the URC operating system first. Convert it into a client-safe variant only after URC-specific names, internal assumptions, and tool choices have been scrubbed or intentionally parameterized.

## Registry Metadata

| Field | Value |
| --- | --- |
| Workflow ID | CUL-06 |
| Department | Culture |
| Automation level | 65-75% |
| Owner | Robert T. McCarthy |
| Trigger | Monthly QA cycle; quarterly R&D sprint |
| Cycle time | Tool eval: 2-week trial; QA: every deliverable |
| Source status | Imported source |

## Inputs

- Trigger event or planning cadence identified above.
- Current URC operating context for Culture.
- Any imported source, asset, tracker, or automation artifacts listed in the Source Map.
- Human approval from the owner before external sends, money movement, access changes, or client-visible commitments.

## Setup

1. Read this kit end to end.
2. Review the Source Digest and Source Map below.
3. Bind any placeholders listed in Placeholder and Binding Notes.
4. If an automation blueprint is embedded, import or rebuild it in the chosen runtime only after credentials and fallback paths are confirmed.
5. Run the Validation checklist before treating the workflow as complete.

## Quickstart

1. Confirm the trigger: Monthly QA cycle; quarterly R&D sprint.
2. Open the relevant source or asset file from the Source Map.
3. Collect the minimum inputs needed for this cycle.
4. Execute the workflow steps using the imported source as the detailed operating guide.
5. Capture output evidence, exceptions, and follow-up tasks.
6. Record meaningful package or behavior changes in `docs/operations/change-control-register.md`.

## Source Digest

- `URC-CUL-06_Weekly_Operating_Rhythm.md`: Source file imported and retained for detailed workflow extraction.

## Source Map

| Artifact | Purpose |
| --- | --- |
| `source/URC-CUL-06_Weekly_Operating_Rhythm.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `automation/CUL06-Blueprint.json` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `trackers/CUL-06_RD_QA_Tracker.xlsx` | Retained provenance/input artifact now referenced by this consolidated kit. |

## Embedded Source and Asset Documents

### source/URC-CUL-06_Weekly_Operating_Rhythm.md

````markdown
# CUL-06 - R&D & Quality Assurance Source

Source: `Culture\URC Culture files\updated files 03262026\URC-CUL-06_Weekly_Operating_Rhythm.docx`

This Markdown file is a text extraction of the source `.docx` for GitHub-readable access. Preserve the source path in citations until the workflow is fully converted into `kit.md` format.

UNCLE ROBERT CONSULTING LLC

URC-CUL-06 — Weekly Operating Rhythm

Updated March 26, 2026 — Solo Operator Edition

Robert T. McCarthy   |   v1.1   |   March 26, 2026

NOTE — March 26, 2026

Sheena Burns stepped back from the co-founder role in March 2026.

References to Sheena's weekly check-in have been updated.

Robert remains the sole operator. The rhythm has been adjusted accordingly.

1. Why This Document Exists

A solo founder building a platform while running a consulting practice needs one thing above all else: a simple, reliable weekly rhythm that keeps all of it moving without burning out. This document defines that rhythm — the minimum viable routine that keeps the most important things from falling apart.

2. Robert's Weekly Rhythm

Day

Morning (30 min)

Primary Work Block

End of Day (15 min)

Monday

Pipeline review (SAL-05): 20 min. Send any pending follow-ups. Check HubSpot.

Client work OR platform build — depending on week type

Log CRM updates. Check Mailchimp stats.

Tuesday

Referral network check (SAL-02): send one personal message to a warm contact

Client work OR workflow testing

Wednesday

Post one LinkedIn piece — lesson, insight, or AI tip (15 min)

Client work OR platform build

Thursday

Review open tasks in ClickUp. Any deliverables due this week on track?

Client work OR documentation

Friday

Personal check-in with Sheena — text or voice message, as a friend (5 min)

Wrap up week. Log what was built or completed.

Review north star metrics from CUL-01

Week types alternate: Client week (Holmes Media and any active clients) / Build week (platform documentation, workflow testing, agent preparation). Don't try to do both at full intensity in the same week.

The Friday check-in with Sheena stays in the rhythm.

Not as a business call. Not as a co-founder briefing.

Just as a friend keeping in touch.

Five minutes. A text or voice message. It matters.

3. Monthly Rhythm

Week

Focus

Key Action

Week 1

Pipeline and clients

HubSpot audit. Review north star metrics. Mailchimp stats.

Week 2

Client delivery

All client check-ins and any QBRs due this month.

Week 3

Platform build

## Workflow testing OR agent preparation OR At Zero Cost follow-up.

Week 4

Review and plan

Monthly metrics review. What was built? What revenue landed? What's next quarter? Send Sheena a personal update — not business, just life.

4. The Non-Negotiables

Everything else in this rhythm can slip when life intervenes. These three things cannot:

1. The Monday pipeline review happens every Monday.

Even if it takes 5 minutes. This is the heartbeat of the sales system.

2. Every closed deal is logged in HubSpot the same day it happens.

Revenue clarity is not optional.

3. The Friday Sheena message goes out every week.

Not a business update. Just human contact.

She stepped back from the agency. She didn't step out of Robert's life.

5. When Things Get Busy

There will be weeks when the At Zero Cost prototype, the YC application, and a client urgent need all arrive simultaneously. This is the triage order:

Active client commitments — always first. Revenue protects the build.

Monday pipeline review — 5 minutes minimum.

Friday Sheena message — even one line counts.

Platform build work — whatever time remains.

LinkedIn content — first to drop when capacity is short.

6. Review Cadence

This rhythm: reviewed monthly — is it working, or generating guilt about things not getting done?

If something is consistently not happening — change the structure or remove it

## Owner: Robert T. McCarthy

Version

Date

Author

Summary

v1.0

March 22, 2026

R. McCarthy & S. Burns

Initial document

v1.1

March 26, 2026

R. McCarthy

Updated: Sheena Burns stepped back from co-founder role March 2026
````

### automation/CUL06-Blueprint.json

````json
{
  "name": "CUL06: Weekly Operating Rhythm (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "clock:schedule",
      "version": 1,
      "parameters": {
        "schedule": "every_monday"
      }
    },
    {
      "id": 2,
      "module": "openai:createCompletion",
      "version": 1,
      "parameters": {
        "model": "gpt-4o"
      },
      "mapper": {
        "messages": [
          {
            "role": "system",
            "content": "Compile weekly KPI metrics and generate a team-wide memo."
          }
        ]
      }
    },
    {
      "id": 3,
      "module": "slack:createMessage",
      "version": 1,
      "parameters": {
        "channel": "general"
      }
    }
  ]
}
````

## Binary Attachments

- `trackers/CUL-06_RD_QA_Tracker.xlsx`: binary attachment retained outside the Markdown kit; convert to CSV/Markdown during certification if the sheet contents become authoritative.

## Automation Blueprint

### CUL06-Blueprint.json

```json
{
  "name": "CUL06: Weekly Operating Rhythm (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "clock:schedule",
      "version": 1,
      "parameters": {
        "schedule": "every_monday"
      }
    },
    {
      "id": 2,
      "module": "openai:createCompletion",
      "version": 1,
      "parameters": {
        "model": "gpt-4o"
      },
      "mapper": {
        "messages": [
          {
            "role": "system",
            "content": "Compile weekly KPI metrics and generate a team-wide memo."
          }
        ]
      }
    },
    {
      "id": 3,
      "module": "slack:createMessage",
      "version": 1,
      "parameters": {
        "channel": "general"
      }
    }
  ]
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
