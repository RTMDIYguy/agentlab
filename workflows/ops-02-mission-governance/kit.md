---
schema: kit/1.0
slug: ops-02-mission-governance
title: "OPS-02 - Mission & Governance"
summary: "Operations workflow package for Mission & Governance. Consolidates registry metadata, imported source references, setup guidance, validation notes, and automation blueprints into one operative kit file."
version: 0.1.0-draft
owner: uncle-robert-consulting
license: UNLICENSED
status: imported-draft
conformance: draft
certifiedAt: null
workflowId: OPS-02
department: "Operations"
automationLevel: "N/A - Framework"
primaryOwner: "Founder/CEO"
trigger: "Annual or major pivot"
cycleTime: "Annual mission; governance monthly"
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

# OPS-02 - Mission & Governance

This is the consolidated `kit.md` for the workflow. It replaces the old imported-package surface as the operative file while keeping source, asset, tracker, and automation files as provenance until certification is complete.

## Goal

Run the Mission & Governance workflow for Operations with a repeatable trigger, owner, cycle time, outputs, and validation path. The current draft is strong enough for agent orientation and controlled internal use; certification still requires a live run or documented manual evidence.

## When to Use

Use this workflow when the trigger occurs: **Annual or major pivot**.

Use it as part of the URC operating system first. Convert it into a client-safe variant only after URC-specific names, internal assumptions, and tool choices have been scrubbed or intentionally parameterized.

## Registry Metadata

| Field | Value |
| --- | --- |
| Workflow ID | OPS-02 |
| Department | Operations |
| Automation level | N/A - Framework |
| Owner | Founder/CEO |
| Trigger | Annual or major pivot |
| Cycle time | Annual mission; governance monthly |
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

1. Confirm the trigger: Annual or major pivot.
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
| `assets/OPS02-Assets.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `automation/OPS02-Blueprint.json` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `trackers/OPS02_Team_Roles_Access_Control_Tracker.xlsx` | Retained provenance/input artifact now referenced by this consolidated kit. |

## Embedded Source and Asset Documents

### assets/OPS02-Assets.md

````markdown
# OPS02: Mission & Governance Assets

## 1. Governance Meeting Agenda Templates

### Weekly Operations Sync (30 Mins)
**Purpose:** Clear blockers and align on weekly capacity.
**Attendees:** Operations, Delivery leads.
**Agenda:**
1. **Metrics Snapshot (5 mins):** Red/Yellow/Green status on key delivery metrics.
2. **Hot Issues & Blockers (15 mins):** What is stuck? Who needs help? (Focus on resolution, not storytelling).
3. **Capacity Check (5 mins):** Are we over/under capacity for the week?
4. **Action Items (5 mins):** Who is doing what by when?

### Monthly Strategy Review (60-90 Mins)
**Purpose:** Zoom out and check progress against annual goals.
**Attendees:** Founder, Leadership team.
**Agenda:**
1. **Financial & Pipeline Update (15 mins):** Revenue vs. Target, Cash runway, Pipeline health.
2. **Strategic Initiative Updates (30 mins):** Progress on quarterly OKRs. (Are we on track? If not, why?)
3. **Major Decisions / Roadblocks (30 mins):** Discuss any Level 3 (Strategic) decisions that require founder input.
4. **Next Month Focus (15 mins):** Align on the top 3 priorities for the upcoming month.

---

## 2. Escalation Protocol Matrix
*Quick reference guide for team members on when and how to escalate issues.*

| Scenario | Risk Level | Who to Escalate To | Channel | Expected Response Time |
| :--- | :--- | :--- | :--- | :--- |
| **Client is unhappy but not leaving** | Level 1 (Low) | Head of Delivery | Slack (Standard) | 24 Hours |
| **Slight budget/timeline overrun** | Level 1 (Low) | Head of Operations | Project Mgmt Tool | 24 Hours |
| **Client threatens to churn/cancel** | Level 2 (Medium) | Founder / CEO | Slack (Urgent tag) | 4 Hours |
| **Data breach or severe security issue** | Level 3 (High) | Founder / CEO & IT | Phone Call | Immediate |
| **Legal threat or compliance breach** | Level 3 (High) | Founder & Legal Counsel | Phone Call | Immediate |

---

## 3. Decision Log Template
*Maintained in a central repository (e.g., Notion) to track major strategic decisions and their rationale.*

**Date of Decision:** [Date]
**Decision Maker(s):** [Names]
**The Decision:** [What was decided?]
**Background/Context:** [Why did we need to make this decision?]
**Rationale:** [Why did we choose this path over the alternatives?]
**Expected Outcome:** [What do we expect to happen because of this?]
**Review Date:** [When will we look back to see if this was the right call?]
````

### automation/OPS02-Blueprint.json

````json
{
  "name": "OPS02: Knowledge Base & SOPs (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "github:watchCommits",
      "version": 1,
      "parameters": {
        "repo": "agency-deepened"
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
            "content": "Generate a summary of the SOP updates and notify the team."
          }
        ]
      }
    },
    {
      "id": 3,
      "module": "notion:createPage",
      "version": 1,
      "parameters": {
        "database_id": "KNOWLEDGE_BASE"
      }
    }
  ]
}
````

## Binary Attachments

- `trackers/OPS02_Team_Roles_Access_Control_Tracker.xlsx`: binary attachment retained outside the Markdown kit; convert to CSV/Markdown during certification if the sheet contents become authoritative.

## Automation Blueprint

### OPS02-Blueprint.json

```json
{
  "name": "OPS02: Knowledge Base & SOPs (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "github:watchCommits",
      "version": 1,
      "parameters": {
        "repo": "agency-deepened"
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
            "content": "Generate a summary of the SOP updates and notify the team."
          }
        ]
      }
    },
    {
      "id": 3,
      "module": "notion:createPage",
      "version": 1,
      "parameters": {
        "database_id": "KNOWLEDGE_BASE"
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
