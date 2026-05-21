---
schema: kit/1.0
slug: ops-06-tech-it
title: "OPS-06 - Tech & IT"
summary: "Operations workflow package for Tech & IT. Consolidates registry metadata, imported source references, setup guidance, validation notes, and automation blueprints into one operative kit file."
version: 0.1.0-draft
owner: uncle-robert-consulting
license: UNLICENSED
status: imported-draft
conformance: draft
certifiedAt: null
workflowId: OPS-06
department: "Operations"
automationLevel: "N/A - Framework"
primaryOwner: "Head of Operations"
trigger: "Tool adoption or monthly review"
cycleTime: "Registry: monthly; audit: annual"
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

# OPS-06 - Tech & IT

This is the consolidated `kit.md` for the workflow. It replaces the old imported-package surface as the operative file while keeping source, asset, tracker, and automation files as provenance until certification is complete.

## Goal

Run the Tech & IT workflow for Operations with a repeatable trigger, owner, cycle time, outputs, and validation path. The current draft is strong enough for agent orientation and controlled internal use; certification still requires a live run or documented manual evidence.

## When to Use

Use this workflow when the trigger occurs: **Tool adoption or monthly review**.

Use it as part of the URC operating system first. Convert it into a client-safe variant only after URC-specific names, internal assumptions, and tool choices have been scrubbed or intentionally parameterized.

## Registry Metadata

| Field | Value |
| --- | --- |
| Workflow ID | OPS-06 |
| Department | Operations |
| Automation level | N/A - Framework |
| Owner | Head of Operations |
| Trigger | Tool adoption or monthly review |
| Cycle time | Registry: monthly; audit: annual |
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

1. Confirm the trigger: Tool adoption or monthly review.
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
| `assets/OPS06-Assets.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `automation/OPS06-Blueprint.json` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `trackers/OPS06_Skill_Matrix_Training_Tracker.xlsx` | Retained provenance/input artifact now referenced by this consolidated kit. |

## Embedded Source and Asset Documents

### assets/OPS06-Assets.md

````markdown
# OPS06: Tech & IT Assets

## 1. Tool Evaluation Matrix (Spreadsheet)
*Use this scoring matrix before purchasing new software.*

**Tool Name:** _____________________
**Cost ($/mo):** _____________________

| Criteria | Weight (1-3) | Score (1-5) | Weighted Score | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Must-Have Features** | 3 | | | |
| **Ease of Use** | 3 | | | |
| **Integration Capability** | 3 | | | |
| **Security & Privacy** | 3 | | | |
| **Nice-to-Have Features** | 1 | | | |
| **Support Quality** | 2 | | | |
| **Scalability** | 2 | | | |
| **TOTAL SCORE:** | | | | / 85 Max |

*Decision threshold: Must score > 65 to be considered for a paid plan.*

---

## 2. Agency Tech Stack Audit (Quarterly Checklist)
*Run this every 3 months to cull unused tools and optimize spend.*

**Date:** _______________ **Conducted By:** _______________

- [ ] Export a list of all recurring software charges from the company credit card/QuickBooks.
- [ ] Cross-reference charges with the official Tech Stack Inventory (OPS-06).
- [ ] Identify any "shadow IT" (tools people bought on their own). Add to inventory or cancel.
- [ ] Review seat counts on per-user tools (Slack, Google Workspace, CRM, Asana). Remove inactive users.
- [ ] Identify overlapping tools (e.g., paying for Zoom AND Google Meet, or Trello AND Asana). Decide which to cut.
- [ ] Review annual renewals coming up in the next 90 days. Negotiate or prep to switch.
- [ ] Review automation error logs (Zapier/Make). Fix or delete broken zaps.

**Savings Identified ($):** _______________

---

## 3. Internal IT Support Quick-Reference
*Post this in a pinned Slack message or internal wiki.*

**"My tool is broken! What do I do?"**

**Step 1:** Check your own setup.
- Clear browser cache.
- Try an Incognito window.
- Restart your computer.

**Step 2:** Check if it's a global outage.
- Google "[Tool Name] status" (e.g., "Slack status") to see if their servers are down.

**Step 3:** Internal Support.
- Post in the `#it-help` Slack channel. Include a screenshot of the error and what you were trying to do.
- Tag [@OpsLead]. Response SLA is 4 hours for non-critical, immediate for critical blockers.

**Step 4:** Vendor Support.
- If directed by Ops, open a support ticket directly with the vendor.
````

### automation/OPS06-Blueprint.json

````json
{
  "name": "OPS06: Capacity & Resource Planning (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "aws:watchCloudWatch",
      "version": 1,
      "parameters": {
        "metricName": "CPUUtilization"
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
            "content": "Evaluate server load to predict needed resource scaling."
          }
        ]
      }
    },
    {
      "id": 3,
      "module": "slack:createMessage",
      "version": 1,
      "parameters": {
        "channel": "alerts-capacity"
      }
    }
  ]
}
````

## Binary Attachments

- `trackers/OPS06_Skill_Matrix_Training_Tracker.xlsx`: binary attachment retained outside the Markdown kit; convert to CSV/Markdown during certification if the sheet contents become authoritative.

## Automation Blueprint

### OPS06-Blueprint.json

```json
{
  "name": "OPS06: Capacity & Resource Planning (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "aws:watchCloudWatch",
      "version": 1,
      "parameters": {
        "metricName": "CPUUtilization"
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
            "content": "Evaluate server load to predict needed resource scaling."
          }
        ]
      }
    },
    {
      "id": 3,
      "module": "slack:createMessage",
      "version": 1,
      "parameters": {
        "channel": "alerts-capacity"
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
