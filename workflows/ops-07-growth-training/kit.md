---
schema: kit/1.0
slug: ops-07-growth-training
title: "OPS-07 - Growth & Training"
summary: "Operations workflow package for Growth & Training. Consolidates registry metadata, imported source references, setup guidance, validation notes, and automation blueprints into one operative kit file."
version: 0.1.0-draft
owner: uncle-robert-consulting
license: UNLICENSED
status: imported-draft
conformance: draft
certifiedAt: null
workflowId: OPS-07
department: "Operations"
automationLevel: "N/A - Framework"
primaryOwner: "Founder/CEO"
trigger: "New hire or quarterly skills review"
cycleTime: "Onboarding: 5-day sprint; training: ongoing"
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
  - ops
  - operations
---

# OPS-07 - Growth & Training

This is the consolidated `kit.md` for the workflow. It replaces the old imported-package surface as the operative file while keeping source, asset, tracker, and automation files as provenance until certification is complete.

## Goal

Run the Growth & Training workflow for Operations with a repeatable trigger, owner, cycle time, outputs, and validation path. The current draft is strong enough for agent orientation and controlled internal use; certification still requires a live run or documented manual evidence.

## When to Use

Use this workflow when the trigger occurs: **New hire or quarterly skills review**.

Use it as part of the URC operating system first. Convert it into a client-safe variant only after URC-specific names, internal assumptions, and tool choices have been scrubbed or intentionally parameterized.

## Registry Metadata

| Field | Value |
| --- | --- |
| Workflow ID | OPS-07 |
| Department | Operations |
| Automation level | N/A - Framework |
| Owner | Founder/CEO |
| Trigger | New hire or quarterly skills review |
| Cycle time | Onboarding: 5-day sprint; training: ongoing |
| Source status | Imported source |

## Inputs

- Trigger event or planning cadence identified above.
- Current URC operating context for Operations.
- Any imported source, asset, tracker, or automation artifacts listed in the Source Map.
- Human approval from the owner before external sends, money movement, access changes, or client-visible commitments.

## Setup

1. Read this kit end to end.
2. Review the Source Digest and Source Map below.
3. Bind any placeholders listed in Placeholder and Binding Notes.
4. If an automation blueprint is embedded, import or rebuild it in the chosen runtime only after credentials and fallback paths are confirmed.
5. Run the Validation checklist before treating the workflow as complete.

## Quickstart

1. Confirm the trigger: New hire or quarterly skills review.
2. Open the relevant source or asset file from the Source Map.
3. Collect the minimum inputs needed for this cycle.
4. Execute the workflow steps using the imported source as the detailed operating guide.
5. Capture output evidence, exceptions, and follow-up tasks.
6. Record meaningful package or behavior changes in `docs/operations/change-control-register.md`.

## Source Digest

- No detailed source file has been imported yet; use the registry metadata and automation scaffold as the current operating baseline.

## Source Map

| Artifact | Purpose |
| --- | --- |
| `assets/OPS07-Assets.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `automation/OPS07-Blueprint.json` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `trackers/OPS07_Quality_Issue_Log.xlsx` | Retained provenance/input artifact now referenced by this consolidated kit. |

## Embedded Source and Asset Documents

### assets/OPS07-Assets.md

````markdown
# OPS07: Growth & Training Assets

## 1. 30/60/90 Day Onboarding Plan Template
*A checklist provided to a new hire on their first day.*

**Name:** _______________________ **Role:** _______________________

**First 30 Days: Integration & Foundation**
- [ ] Complete tech onboarding and tool setup.
- [ ] Review Vision, Mission, and Core Values.
- [ ] Shadow 3 client calls.
- [ ] Review all Level 1 SOPs for your role.
- [ ] Complete first small project: [Insert project name].

**First 60 Days: Competency**
- [ ] Handle [Task X] independently.
- [ ] Participate in 3 team meetings.
- [ ] Submit first process improvement idea.
- [ ] Identify 1 skill gap to focus on.

**First 90 Days: Proficiency**
- [ ] Fully own [Core Responsibility].
- [ ] Complete 90-day review with manager.
- [ ] Begin working on Level 2 training path goals.

---

## 2. Learning & Development Request Form
*Used by team members to request agency funds for training.*

**Fields:**
1. **What are you requesting?** [Course / Book / Conference / Software]
2. **Name of Resource:** _______________________
3. **Cost ($):** _______________________
4. **Link to Resource:** _______________________
5. **Why do you want to learn this?** [How does it align with your role or our agency goals?]
6. **How will you share this knowledge with the team?** [e.g., Update an SOP, 10-minute presentation at next team sync]

---

## 3. Team "Skill Matrix" Template (Spreadsheet)
*Used by management to map out team capabilities and find gaps.*

| Skill/Tool | [Team Member 1] | [Team Member 2] | [Team Member 3] | Coverage | Action Plan if Weak |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **HubSpot Admin** | ⭐⭐⭐ | ⭐ | - | Moderate | Train [Team Member 2] to ⭐⭐ |
| **Zapier/Make** | ⭐⭐⭐ | ⭐⭐ | ⭐ | Strong | None |
| **Copywriting** | ⭐ | ⭐ | - | Weak | Hire freelance copywriter |
| **Client Comms** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | Strong | None |

*(Legend: ⭐⭐⭐ Proficient/Trainer, ⭐⭐ Competent, ⭐ Beginner, - None)*
````

### automation/OPS07-Blueprint.json

````json
{
  "name": "OPS07: L&D Approval Workflow (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "typeform:watchResponses",
      "version": 1,
      "parameters": {
        "form_id": "LD_REQUEST_FORM"
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
      "module": "slack:createMessage",
      "version": 1,
      "parameters": {
        "channel": "management-approvals"
      },
      "mapper": {
        "text": "📚 **New L&D Request from {{1.answers.name}}**\n\n**Resource:** {{1.answers.resource_name}}\n**Cost:** ${{1.answers.cost}}\n**Reason:** {{1.answers.reason}}\n\nPlease review and approve in the tracker: [Link to Tracker]"
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
      "module": "google-sheets:addRow",
      "version": 1,
      "parameters": {
        "spreadsheet_id": "YOUR_HR_SPREADSHEET_ID",
        "sheet": "L&D Requests"
      },
      "mapper": {
        "Date": "{{now}}",
        "Name": "{{1.answers.name}}",
        "Resource": "{{1.answers.resource_name}}",
        "Cost": "{{1.answers.cost}}",
        "Status": "Pending Approval"
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

- `trackers/OPS07_Quality_Issue_Log.xlsx`: binary attachment retained outside the Markdown kit; convert to CSV/Markdown during certification if the sheet contents become authoritative.

## Automation Blueprint

### OPS07-Blueprint.json

```json
{
  "name": "OPS07: L&D Approval Workflow (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "typeform:watchResponses",
      "version": 1,
      "parameters": {
        "form_id": "LD_REQUEST_FORM"
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
      "module": "slack:createMessage",
      "version": 1,
      "parameters": {
        "channel": "management-approvals"
      },
      "mapper": {
        "text": "📚 **New L&D Request from {{1.answers.name}}**\n\n**Resource:** {{1.answers.resource_name}}\n**Cost:** ${{1.answers.cost}}\n**Reason:** {{1.answers.reason}}\n\nPlease review and approve in the tracker: [Link to Tracker]"
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
      "module": "google-sheets:addRow",
      "version": 1,
      "parameters": {
        "spreadsheet_id": "YOUR_HR_SPREADSHEET_ID",
        "sheet": "L&D Requests"
      },
      "mapper": {
        "Date": "{{now}}",
        "Name": "{{1.answers.name}}",
        "Resource": "{{1.answers.resource_name}}",
        "Cost": "{{1.answers.cost}}",
        "Status": "Pending Approval"
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

- `automation/OPS07-Blueprint.json`: YOUR_HR_SPREADSHEET_ID

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
