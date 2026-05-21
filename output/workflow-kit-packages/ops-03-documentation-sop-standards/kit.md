---
schema: kit/1.0
slug: ops-03-documentation-sop-standards
title: "OPS-03 - Documentation & SOP Standards"
summary: "Operations workflow package for Documentation & SOP Standards. Consolidates registry metadata, imported source references, setup guidance, validation notes, and automation blueprints into one operative kit file."
version: 0.1.0-draft
owner: uncle-robert-consulting
license: UNLICENSED
status: imported-draft
conformance: draft
certifiedAt: null
workflowId: OPS-03
department: "Operations"
automationLevel: "N/A - Framework"
primaryOwner: "Head of Operations"
trigger: "New workflow identified"
cycleTime: "Creation: as needed; review: quarterly"
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

# OPS-03 - Documentation & SOP Standards

This is the consolidated `kit.md` for the workflow. It replaces the old imported-package surface as the operative file while keeping source, asset, tracker, and automation files as provenance until certification is complete.

## Goal

Run the Documentation & SOP Standards workflow for Operations with a repeatable trigger, owner, cycle time, outputs, and validation path. The current draft is strong enough for agent orientation and controlled internal use; certification still requires a live run or documented manual evidence.

## When to Use

Use this workflow when the trigger occurs: **New workflow identified**.

Use it as part of the URC operating system first. Convert it into a client-safe variant only after URC-specific names, internal assumptions, and tool choices have been scrubbed or intentionally parameterized.

## Registry Metadata

| Field | Value |
| --- | --- |
| Workflow ID | OPS-03 |
| Department | Operations |
| Automation level | N/A - Framework |
| Owner | Head of Operations |
| Trigger | New workflow identified |
| Cycle time | Creation: as needed; review: quarterly |
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

1. Confirm the trigger: New workflow identified.
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
| `assets/OPS03-Assets.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `automation/OPS03-Blueprint.json` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `trackers/OPS03_Strategy_OKR_Tracker.xlsx` | Retained provenance/input artifact now referenced by this consolidated kit. |

## Embedded Source and Asset Documents

### assets/OPS03-Assets.md

````markdown
# OPS03: Documentation & SOP Standards Assets

## 1. SOP Master Template (Markdown)
*Copy and paste this into Notion, Google Docs, or your preferred documentation tool when creating a new SOP.*

```markdown
# [DEPARTMENT]-[Number] – [Process Name]

**Owner:** [Name or Role]
**Last Updated:** [Date]
**Version:** [v1.0]

## 1. Purpose
[One short paragraph explaining why this SOP exists and what outcome it ensures. e.g., "This SOP ensures all new leads are properly tagged and routed in the CRM so sales can follow up within 5 minutes."]

## 2. Scope
* **Applies to:** [e.g., Inbound leads from the website]
* **Does not apply to:** [e.g., Cold outreach leads]

## 3. Tools & Inputs Required
* **Tools:** [e.g., HubSpot CRM, Zapier]
* **Inputs:** [e.g., A completed lead form]

## 4. Procedure (Step-by-Step)
1. **[Step 1 Title]:** [Detailed instruction].
   * *Note/Checklist item if needed.*
2. **[Step 2 Title]:** [Detailed instruction].
   * *If X happens, do Y.*
3. **[Step 3 Title]:** [Detailed instruction].

## 5. Outputs & Success Criteria
[What should be true when this is done? e.g., "Lead is assigned to a rep, tagged as MQL, and welcome email is triggered."]

## 6. Version History
| Version | Date | Author | Summary of Changes |
| :--- | :--- | :--- | :--- |
| v1.0 | [Date] | [Name] | Initial creation |
```

---

## 2. SOP Creation & Update Request Form
*A simple form (e.g., Google Forms/Typeform) for team members to request a new SOP or an update to an existing one.*

**Fields:**
1. **Request Type:** [New SOP / Update to Existing SOP]
2. **If Update, which SOP ID?:** [e.g., MKT-01]
3. **Process Name / Topic:** [What is the process?]
4. **Why is this needed?** [e.g., Tools changed, quality issue, currently undocumented]
5. **Who is the subject matter expert for this?** [Who knows how to do it currently?]
6. **Urgency:** [High / Medium / Low]

---

## 3. SOP Review Checklist (For Managers)
*Used by the Owner or Manager before approving and publishing a new SOP.*

- [ ] Does it follow the standard formatting template?
- [ ] Is the Purpose and Scope clearly defined?
- [ ] Are the step-by-step instructions clear enough that a new hire could follow them?
- [ ] Has it been "stress-tested" by someone who didn't write it?
- [ ] Are all necessary links to tools, assets, or other SOPs included and working?
- [ ] Is it saved in the correct Department folder in the repository?
````

### automation/OPS03-Blueprint.json

````json
{
  "name": "OPS03: Vendor & Platform Management (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "clock:schedule",
      "version": 1,
      "parameters": {
        "schedule": "first_of_month"
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
            "content": "Review SaaS invoices and map against budget."
          }
        ]
      }
    },
    {
      "id": 3,
      "module": "airtable:createRecord",
      "version": 1,
      "parameters": {
        "table": "Vendor Spends"
      }
    }
  ]
}
````

## Binary Attachments

- `trackers/OPS03_Strategy_OKR_Tracker.xlsx`: binary attachment retained outside the Markdown kit; convert to CSV/Markdown during certification if the sheet contents become authoritative.

## Automation Blueprint

### OPS03-Blueprint.json

```json
{
  "name": "OPS03: Vendor & Platform Management (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "clock:schedule",
      "version": 1,
      "parameters": {
        "schedule": "first_of_month"
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
            "content": "Review SaaS invoices and map against budget."
          }
        ]
      }
    },
    {
      "id": 3,
      "module": "airtable:createRecord",
      "version": 1,
      "parameters": {
        "table": "Vendor Spends"
      }
    }
  ]
}
```

## Placeholder and Binding Notes

- `assets/OPS03-Assets.md`: [DEPARTMENT]

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
