---
schema: kit/1.0
slug: ops-08-r-d-quality-assurance
title: "OPS-08 - R&D & Quality Assurance"
summary: "Operations workflow package for R&D & Quality Assurance. Consolidates registry metadata, imported source references, setup guidance, validation notes, and automation blueprints into one operative kit file."
version: 0.1.0-draft
owner: uncle-robert-consulting
license: UNLICENSED
status: imported-draft
conformance: draft
certifiedAt: null
workflowId: OPS-08
department: "Operations"
automationLevel: "N/A - Framework"
primaryOwner: "Head of Operations"
trigger: "Monthly QA cycle or R&D sprint"
cycleTime: "QA: before every deliverable; R&D: quarterly"
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

# OPS-08 - R&D & Quality Assurance

This is the consolidated `kit.md` for the workflow. It replaces the old imported-package surface as the operative file while keeping source, asset, tracker, and automation files as provenance until certification is complete.

## Goal

Run the R&D & Quality Assurance workflow for Operations with a repeatable trigger, owner, cycle time, outputs, and validation path. The current draft is strong enough for agent orientation and controlled internal use; certification still requires a live run or documented manual evidence.

## When to Use

Use this workflow when the trigger occurs: **Monthly QA cycle or R&D sprint**.

Use it as part of the URC operating system first. Convert it into a client-safe variant only after URC-specific names, internal assumptions, and tool choices have been scrubbed or intentionally parameterized.

## Registry Metadata

| Field | Value |
| --- | --- |
| Workflow ID | OPS-08 |
| Department | Operations |
| Automation level | N/A - Framework |
| Owner | Head of Operations |
| Trigger | Monthly QA cycle or R&D sprint |
| Cycle time | QA: before every deliverable; R&D: quarterly |
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

1. Confirm the trigger: Monthly QA cycle or R&D sprint.
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
| `assets/OPS08-Assets.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `automation/OPS08-Blueprint.json` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `trackers/OPS08_RD_Experiment_Pipeline.xlsx` | Retained provenance/input artifact now referenced by this consolidated kit. |

## Embedded Source and Asset Documents

### assets/OPS08-Assets.md

````markdown
# OPS08: R&D & Quality Assurance Assets

## 1. R&D "Learning Doc" Template
*To be filled out after any R&D experiment is completed.*

**Experiment Name:** [e.g., Using AI to generate initial client reports]
**Owner:** [Name]
**Date Completed:** [Date]

**1. The Hypothesis:** [What did we think would happen? e.g., "AI can write the first draft of the monthly report, saving us 2 hours per client."]
**2. What We Actually Did:** [Brief description of the test.]
**3. The Results:** [Did it work? Metrics? e.g., "It saved 1 hour, but required 30 mins of heavy editing. Net save: 30 mins."]
**4. Decision:** [Adopt / Iterate / Kill / Shelve]
**5. Next Steps:** [If Adopt, who is updating the SOP? If Iterate, what is the next test?]

---

## 2. Post-Project Client Feedback Survey (NPS/CSAT)
*Sent automatically when a project is marked "Complete" in the CRM.*

**Subject:** How did we do, [Client Name]?

**Body:**
Hi [Client Name],
Thank you for trusting us with [Project Name]. We are constantly trying to improve our service, and your honest feedback is the best way for us to do that.
Could you take 60 seconds to answer 3 quick questions?

[Link to Survey]

**Survey Questions:**
1. **CSAT:** On a scale of 1-5, how satisfied are you with the final deliverable?
2. **NPS:** On a scale of 0-10, how likely are you to recommend us to a colleague or friend?
3. What is one thing we could have done better?

---

## 3. Agency Issue Log (Tracker Template)
*A spreadsheet or database to track quality failures so they can be fixed at the root.*

| Date Logged | Issue Description | Category (Critical/High/Med/Low) | Client Impacted? | Root Cause (The "Why") | Action Taken (SOP Update) | Owner | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 2024-06-01 | Wrong logo used on final client presentation | Med | Yes (Client A) | Designer pulled from old folder | Added "Verify brand assets" step to Pre-Delivery QA Checklist | Designer | Closed |
| 2024-06-15 | Monthly reports sent 2 days late | High | Yes (All) | Data source API broke | Switched data sources | Ops Lead | Open |
````

### automation/OPS08-Blueprint.json

````json
{
  "name": "OPS08: Automated NPS Collection (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "clickup:watchTasks",
      "version": 1,
      "parameters": {
        "list_id": "YOUR_PROJECTS_LIST_ID"
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
      "module": "builtin:Filter",
      "version": 1,
      "parameters": {
        "condition": "{{1.status.status}} = 'Completed'"
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
      "module": "gmail:sendEmail",
      "version": 1,
      "parameters": {},
      "mapper": {
        "to": "{{1.custom_fields.Client_Email}}",
        "subject": "How did we do on {{1.name}}?",
        "content": "Hi {{1.custom_fields.Client_Name}},<br><br>Your project is complete! Could you take 60 seconds to let us know how we did? <br><br><a href='YOUR_SURVEY_LINK'>Click here for a 3-question survey.</a><br><br>Thank you!"
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
      "module": "typeform:watchResponses",
      "version": 1,
      "parameters": {
        "form_id": "NPS_SURVEY_FORM"
      },
      "mapper": {},
      "metadata": {
        "designer": {
          "x": 0,
          "y": 300
        }
      }
    },
    {
      "id": 5,
      "module": "slack:createMessage",
      "version": 1,
      "parameters": {
        "channel": "client-wins-and-feedback"
      },
      "mapper": {
        "text": "📊 **New Client Feedback!**\n\n**Client:** {{4.answers.client_name}}\n**Score:** {{4.answers.score}}/10\n**Feedback:** \"{{4.answers.feedback}}\""
      },
      "metadata": {
        "designer": {
          "x": 300,
          "y": 300
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

- `trackers/OPS08_RD_Experiment_Pipeline.xlsx`: binary attachment retained outside the Markdown kit; convert to CSV/Markdown during certification if the sheet contents become authoritative.

## Automation Blueprint

### OPS08-Blueprint.json

```json
{
  "name": "OPS08: Automated NPS Collection (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "clickup:watchTasks",
      "version": 1,
      "parameters": {
        "list_id": "YOUR_PROJECTS_LIST_ID"
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
      "module": "builtin:Filter",
      "version": 1,
      "parameters": {
        "condition": "{{1.status.status}} = 'Completed'"
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
      "module": "gmail:sendEmail",
      "version": 1,
      "parameters": {},
      "mapper": {
        "to": "{{1.custom_fields.Client_Email}}",
        "subject": "How did we do on {{1.name}}?",
        "content": "Hi {{1.custom_fields.Client_Name}},<br><br>Your project is complete! Could you take 60 seconds to let us know how we did? <br><br><a href='YOUR_SURVEY_LINK'>Click here for a 3-question survey.</a><br><br>Thank you!"
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
      "module": "typeform:watchResponses",
      "version": 1,
      "parameters": {
        "form_id": "NPS_SURVEY_FORM"
      },
      "mapper": {},
      "metadata": {
        "designer": {
          "x": 0,
          "y": 300
        }
      }
    },
    {
      "id": 5,
      "module": "slack:createMessage",
      "version": 1,
      "parameters": {
        "channel": "client-wins-and-feedback"
      },
      "mapper": {
        "text": "📊 **New Client Feedback!**\n\n**Client:** {{4.answers.client_name}}\n**Score:** {{4.answers.score}}/10\n**Feedback:** \"{{4.answers.feedback}}\""
      },
      "metadata": {
        "designer": {
          "x": 300,
          "y": 300
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

- `automation/OPS08-Blueprint.json`: YOUR_PROJECTS_LIST_ID, YOUR_SURVEY_LINK

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
