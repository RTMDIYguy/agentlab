---
schema: kit/1.0
slug: ops-01-vision-purpose
title: "OPS-01 - Vision & Purpose"
summary: "Operations workflow package for Vision & Purpose. Consolidates registry metadata, imported source references, setup guidance, validation notes, and automation blueprints into one operative kit file."
version: 0.1.0-draft
owner: uncle-robert-consulting
license: UNLICENSED
status: imported-draft
conformance: draft
certifiedAt: null
workflowId: OPS-01
department: "Operations"
automationLevel: "N/A - Framework"
primaryOwner: "Founder/CEO"
trigger: "Annual strategy session"
cycleTime: "Annual review; OKRs quarterly"
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

# OPS-01 - Vision & Purpose

This is the consolidated `kit.md` for the workflow. It replaces the old imported-package surface as the operative file while keeping source, asset, tracker, and automation files as provenance until certification is complete.

## Goal

Run the Vision & Purpose workflow for Operations with a repeatable trigger, owner, cycle time, outputs, and validation path. The current draft is strong enough for agent orientation and controlled internal use; certification still requires a live run or documented manual evidence.

## When to Use

Use this workflow when the trigger occurs: **Annual strategy session**.

Use it as part of the URC operating system first. Convert it into a client-safe variant only after URC-specific names, internal assumptions, and tool choices have been scrubbed or intentionally parameterized.

## Registry Metadata

| Field | Value |
| --- | --- |
| Workflow ID | OPS-01 |
| Department | Operations |
| Automation level | N/A - Framework |
| Owner | Founder/CEO |
| Trigger | Annual strategy session |
| Cycle time | Annual review; OKRs quarterly |
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

1. Confirm the trigger: Annual strategy session.
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
| `assets/OPS01-Assets.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `automation/OPS01-Blueprint.json` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `trackers/OPS01_SOP_Registry_Version_Tracker.xlsx` | Retained provenance/input artifact now referenced by this consolidated kit. |

## Embedded Source and Asset Documents

### assets/OPS01-Assets.md

````markdown
# OPS01: Vision & Purpose Assets

## 1. Annual Vision Check-In Survey (Internal)
*Sent to the team annually to ensure alignment with the agency's Vision and Purpose.*

**Subject:** [AGENCY NAME] Annual Vision Check-In: Are we on track?

**Survey Questions (Typeform / Google Forms):**
1. On a scale of 1-10, how aligned do you feel the work we did this year was with our core purpose of [Agency Purpose]?
2. Looking at our 3-5 year Vision statement, do you feel we moved closer to it this year? Why or why not?
3. Which of our Core Values did you see demonstrated most often by the team this year? Can you give an example?
4. Which of our Core Values do you think we struggled to uphold? How can we improve?
5. What is one thing you think we should stop doing next year because it distracts from our Vision?

---

## 2. Core Values "Shout-out" Slack Template
*Used by team members to recognize colleagues living the core values.*

**Trigger:** Use the `/shoutout` command or post in the `#wins-and-shoutouts` channel.

**Template:**
🎉 **Value Shout-out!** 🎉
**Who:** [@teammate]
**Core Value Demonstrated:** [Insert Value, e.g., "Client-Obsessed"]
**What they did:** [Brief description of the action they took that exemplified the value]
**Impact:** [How it helped the team or the client]

*(Add relevant emojis!)*

---

## 3. Vision/Purpose Alignment Decision Filter
*A quick mental or written checklist to use during leadership meetings when making major strategic decisions.*

**The Proposal:** [Insert idea, e.g., "Launch a new lower-tier service offering"]

**The Filter:**
- [ ] Does this directly support our Long-Term Outcome of [Insert Outcome]?
- [ ] Does executing this force us to compromise on our Core Value of [Insert Value]?
- [ ] If we succeed wildly at this, will it bring us closer to our 10-year Vision?
- [ ] Are we doing this out of fear/scarcity, or does it genuinely advance our Purpose?

**Decision:** [Proceed / Kill / Rework]
````

### automation/OPS01-Blueprint.json

````json
{
  "name": "OPS01: Infrastructure Health (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "http:makeARequest",
      "version": 1,
      "parameters": {
        "url": "https://api.openai.com/v1/dashboard/billing/usage",
        "method": "GET",
        "headers": [
          {"name": "Authorization", "value": "Bearer {{OPENAI_API_KEY}}"}
        ]
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
            "content": "Analyze infrastructure health metrics and identify cost anomalies."
          }
        ]
      }
    },
    {
      "id": 3,
      "module": "slack:createMessage",
      "version": 1,
      "parameters": {
        "channel": "alerts-infrastructure"
      }
    }
  ]
}
````

## Binary Attachments

- `trackers/OPS01_SOP_Registry_Version_Tracker.xlsx`: binary attachment retained outside the Markdown kit; convert to CSV/Markdown during certification if the sheet contents become authoritative.

## Automation Blueprint

### OPS01-Blueprint.json

```json
{
  "name": "OPS01: Infrastructure Health (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "http:makeARequest",
      "version": 1,
      "parameters": {
        "url": "https://api.openai.com/v1/dashboard/billing/usage",
        "method": "GET",
        "headers": [
          {"name": "Authorization", "value": "Bearer {{OPENAI_API_KEY}}"}
        ]
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
            "content": "Analyze infrastructure health metrics and identify cost anomalies."
          }
        ]
      }
    },
    {
      "id": 3,
      "module": "slack:createMessage",
      "version": 1,
      "parameters": {
        "channel": "alerts-infrastructure"
      }
    }
  ]
}
```

## Placeholder and Binding Notes

- `assets/OPS01-Assets.md`: [AGENCY NAME]

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
