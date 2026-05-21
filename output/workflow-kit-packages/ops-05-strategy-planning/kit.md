---
schema: kit/1.0
slug: ops-05-strategy-planning
title: "OPS-05 - Strategy & Planning"
summary: "Operations workflow package for Strategy & Planning. Consolidates registry metadata, imported source references, setup guidance, validation notes, and automation blueprints into one operative kit file."
version: 0.1.0-draft
owner: uncle-robert-consulting
license: UNLICENSED
status: imported-draft
conformance: draft
certifiedAt: null
workflowId: OPS-05
department: "Operations"
automationLevel: "N/A - Framework"
primaryOwner: "Founder/CEO"
trigger: "Annual and quarterly"
cycleTime: "Annual plan; quarterly sprint"
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

# OPS-05 - Strategy & Planning

This is the consolidated `kit.md` for the workflow. It replaces the old imported-package surface as the operative file while keeping source, asset, tracker, and automation files as provenance until certification is complete.

## Goal

Run the Strategy & Planning workflow for Operations with a repeatable trigger, owner, cycle time, outputs, and validation path. The current draft is strong enough for agent orientation and controlled internal use; certification still requires a live run or documented manual evidence.

## When to Use

Use this workflow when the trigger occurs: **Annual and quarterly**.

Use it as part of the URC operating system first. Convert it into a client-safe variant only after URC-specific names, internal assumptions, and tool choices have been scrubbed or intentionally parameterized.

## Registry Metadata

| Field | Value |
| --- | --- |
| Workflow ID | OPS-05 |
| Department | Operations |
| Automation level | N/A - Framework |
| Owner | Founder/CEO |
| Trigger | Annual and quarterly |
| Cycle time | Annual plan; quarterly sprint |
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

1. Confirm the trigger: Annual and quarterly.
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
| `assets/OPS05-Assets.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `automation/OPS05-Blueprint.json` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `trackers/OPS05_Vendor_Contract_Renewal_Tracker.xlsx` | Retained provenance/input artifact now referenced by this consolidated kit. |

## Embedded Source and Asset Documents

### assets/OPS05-Assets.md

````markdown
# OPS05: Strategy & Planning Assets

## 1. Annual Strategic Planning Agenda (Founder/Team)
*To be used during the half-day or full-day annual planning session.*

**Pre-work (To be completed 1 week prior):**
- Review previous year's financials.
- Read through client feedback/NPS scores from the past 12 months.
- Each team member fills out a personal SWOT analysis for the agency.

**Agenda:**
* **9:00 AM - Year in Review:** Celebrate wins, discuss misses. (No blame, just facts).
* **10:00 AM - SWOT Synthesis:** Combine individual SWOTs into one master agency SWOT.
* **11:00 AM - Vision/Values Check:** Are we still aligned with OPS-01? Do we need to pivot?
* **12:00 PM - Lunch Break**
* **1:00 PM - Set Annual Objectives:** Brainstorm and finalize the top 3-5 goals for the year.
* **2:30 PM - Define Key Results:** Attach measurable numbers (KRs) to each objective.
* **3:30 PM - Identify Q1 Priorities:** Break down the annual goals into the top 3 things to tackle in Q1.
* **4:30 PM - Wrap up & Assign Owners:** Ensure every priority has a single owner.

---

## 2. Weekly "One Thing" Planner (Printable/Digital)
*A simple template for team members to focus their week.*

**Name:** _______________________
**Week of:** _____________________

**My "ONE Thing":** *(If I only get this done, the week is a success)*
[ ] __________________________________________________________________

**Client Delivery Priorities:**
[ ] __________________________________________________________________
[ ] __________________________________________________________________
[ ] __________________________________________________________________

**Biz Dev / Internal Priorities:**
[ ] __________________________________________________________________
[ ] __________________________________________________________________

**Blockers (I need help with...):**
______________________________________________________________________

---

## 3. Simple OKR Tracker (Spreadsheet Template)
*Columns for a Google Sheet or Airtable base.*

| Annual Objective | Key Result | Owner | Starting Value | Target Value | Current Value | % to Goal | Status (🟢/🟡/🔴) | Notes / Blockers |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Grow MRR to $15k | MRR | Founder | $8,000 | $15,000 | $10,500 | 35% | 🟡 | Need more leads |
| Launch New Service | Beta Clients Signed | Head of Ops | 0 | 3 | 1 | 33% | 🟢 | Pitching to client X |
| Document Delivery | Standard SOPs Created | Head of Delivery | 0 | 5 | 0 | 0% | 🔴 | Swamped with client work |
````

### automation/OPS05-Blueprint.json

````json
{
  "name": "OPS05: Quality Assurance & R&D (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "github:watchIssues",
      "version": 1,
      "parameters": {
        "label": "R&D"
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
            "content": "Evaluate benchmark outputs of new prompt structures."
          }
        ]
      }
    },
    {
      "id": 3,
      "module": "jira:createIssue",
      "version": 1,
      "parameters": {
        "project": "QA-LOGS"
      }
    }
  ]
}
````

## Binary Attachments

- `trackers/OPS05_Vendor_Contract_Renewal_Tracker.xlsx`: binary attachment retained outside the Markdown kit; convert to CSV/Markdown during certification if the sheet contents become authoritative.

## Automation Blueprint

### OPS05-Blueprint.json

```json
{
  "name": "OPS05: Quality Assurance & R&D (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "github:watchIssues",
      "version": 1,
      "parameters": {
        "label": "R&D"
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
            "content": "Evaluate benchmark outputs of new prompt structures."
          }
        ]
      }
    },
    {
      "id": 3,
      "module": "jira:createIssue",
      "version": 1,
      "parameters": {
        "project": "QA-LOGS"
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
