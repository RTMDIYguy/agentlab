---
schema: kit/1.0
slug: cul-04-organization-security
title: "CUL-04 - Organization & Security"
summary: "Culture workflow package for Organization & Security. Consolidates registry metadata, imported source references, setup guidance, validation notes, and automation blueprints into one operative kit file."
version: 0.1.0-draft
owner: uncle-robert-consulting
license: UNLICENSED
status: imported-draft
conformance: draft
certifiedAt: null
workflowId: CUL-04
department: "Culture"
automationLevel: "60-70%"
primaryOwner: "Robert T. McCarthy"
trigger: "New hire, role change, breach"
cycleTime: "Org chart: quarterly; access: semi-annual"
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

# CUL-04 - Organization & Security

This is the consolidated `kit.md` for the workflow. It replaces the old imported-package surface as the operative file while keeping source, asset, tracker, and automation files as provenance until certification is complete.

## Goal

Run the Organization & Security workflow for Culture with a repeatable trigger, owner, cycle time, outputs, and validation path. The current draft is strong enough for agent orientation and controlled internal use; certification still requires a live run or documented manual evidence.

## When to Use

Use this workflow when the trigger occurs: **New hire, role change, breach**.

Use it as part of the URC operating system first. Convert it into a client-safe variant only after URC-specific names, internal assumptions, and tool choices have been scrubbed or intentionally parameterized.

## Registry Metadata

| Field | Value |
| --- | --- |
| Workflow ID | CUL-04 |
| Department | Culture |
| Automation level | 60-70% |
| Owner | Robert T. McCarthy |
| Trigger | New hire, role change, breach |
| Cycle time | Org chart: quarterly; access: semi-annual |
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

1. Confirm the trigger: New hire, role change, breach.
2. Open the relevant source or asset file from the Source Map.
3. Collect the minimum inputs needed for this cycle.
4. Execute the workflow steps using the imported source as the detailed operating guide.
5. Capture output evidence, exceptions, and follow-up tasks.
6. Record meaningful package or behavior changes in `docs/operations/change-control-register.md`.

## Source Digest

- `URC-CUL-04_Team_Roles_Culture.md`: Source file imported and retained for detailed workflow extraction.

## Source Map

| Artifact | Purpose |
| --- | --- |
| `source/URC-CUL-04_Team_Roles_Culture.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `automation/CUL04-Blueprint.json` | Retained provenance/input artifact now referenced by this consolidated kit. |

## Embedded Source and Asset Documents

### source/URC-CUL-04_Team_Roles_Culture.md

````markdown
# CUL-04 - Organization & Security Source

Source: `Culture\URC Culture files\updated files 03262026\URC-CUL-04_Team_Roles_Culture.docx`

This Markdown file is a text extraction of the source `.docx` for GitHub-readable access. Preserve the source path in citations until the workflow is fully converted into `kit.md` format.

UNCLE ROBERT CONSULTING LLC

URC-CUL-04 — Team, Roles & Culture

Updated March 26, 2026 — Solo Operator Edition

Robert T. McCarthy   |   v1.1   |   March 26, 2026

1. The Team Today

NOTE — March 26, 2026

Sheena Burns stepped back from the co-founder role in March 2026.

Robert T. McCarthy is the sole operator of Uncle Robert Consulting going forward.

Sheena's contact note in HubSpot has been updated to reflect this.

The relationship remains warm. The door for her return remains open.

Uncle Robert Consulting is currently a one-person operation. That is the honest reality in March 2026 — and it is not a weakness. A solo founder with 40 documented workflows, one active client, a live email and CRM system, and a scheduled At Zero Cost call is further along than most funded teams at the same stage.

Name

Role

Core Strength

Current Focus

Robert T. McCarthy

Founder & Lead Consultant

Strategy, systems building, AI implementation, client relationships, platform architecture

Client delivery, workflow testing, YC application, At Zero Cost prototype, business development

Sheena Burns

Co-Founder (stepped back March 2026)

Coaching, human connection, discovery conversations

Stepped back — personal decision. Check in every 6-8 weeks as a friend. Door open for return.

2. Operating as a Solo Founder

Running a consulting practice and building a platform simultaneously as a solo operator requires ruthless prioritization. These are the operating principles that keep everything moving without burning out:

Revenue before build: Client work always comes first. The consulting practice funds the platform. Never sacrifice a client commitment for platform work.

One thing at a time: Alternate between client weeks and build weeks. Trying to do both at full intensity in the same week produces mediocre results in both.

The rhythm is the system: The weekly operating rhythm from CUL-06 is the structure that keeps everything moving. Miss it once — get back on track. Miss it three times — it's gone.

Ask for help strategically: Robert is not alone. At Zero Cost is building the prototype. YC Startup School provides community and feedback. Claude and Perplexity Pro handle research, writing, and analysis. The team is small but the leverage is real.

Document as you go: Every workflow tested, every client conversation, every build decision gets logged. The documentation IS the product.

3. The Culture of a Solo Agency

Culture in a solo operation is not about team norms — it is about the standards Robert holds himself to and the experience clients receive. These are the real operating standards:

Clients are people, not accounts: William Hopkins is a friend. Jason McCarthy needed help and got it even when there was no revenue in it. Jeff Holmes is a partner. This is how URC treats everyone.

Build it before you sell it: URC does not promise clients capabilities that don't exist yet. The platform is being built. Until it exists, clients get the consulting.

Respond like a person, not a machine: Every client message gets a personal reply. No templates sent without personalization. No auto-responses that sound like auto-responses.

Rest is part of the system: A burned-out solo founder is a business that stops. Rest is not laziness — it is maintenance.

4. How the Team Grows — Horizon 2

The platform vision changes the team structure fundamentally. The goal is NOT to hire a team to replace what's being built manually. The goal is to build AI agents that do what a team would do — and hire humans only for what agents genuinely cannot do.

Stage

Human Roles Added

What Agents Replace

## Trigger

Now (2026)

Robert only

Research, drafting, scheduling, CRM updates, email

Current state

First contractor (Q3 2026)

Part-time developer or VA for platform build

More admin and implementation tasks

First 5 recurring clients OR At Zero Cost prototype underway

Platform launch (2027)

1 client success person

Routine check-ins, health monitoring, report generation

Platform has 3+ licensees

Scale (2027+)

Sales, partnerships, possibly a CTO

Most operational tasks across all 7 departments

Seed funding or strong organic revenue

URC will never hire people to do jobs that AI agents can do better and more consistently.

URC will always hire people to do jobs that require human judgment, relationship,

and the kind of presence that makes clients feel genuinely heard.

The obelisk model: fewer humans, more capable, higher leverage.

5. A Note on Co-Founders

Building something significant alone is harder than building it with a partner. Robert knows this. Sheena's stepping back is a real loss — not just operationally but personally. The right response is not to pretend it doesn't matter or to fill the gap with a replacement.

The right response is to build something so real and so visible that the people who matter — including Sheena — can see exactly what it is and decide whether they want to be part of it. That has always been the most honest way to attract the right people into a company.

If and when the right technical co-founder, advisor, or partner appears — they will find a business that is documented, operational, and building on a real methodology. That is a much stronger position than most founders are in when they start looking.

6. Review Cadence

Team structure: updated whenever a new person joins or a role changes

Operating principles: reviewed quarterly — are we actually living these or just writing them?

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

### automation/CUL04-Blueprint.json

````json
{
  "name": "CUL04: Team Roles & Culture (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "typeform:watchResponses",
      "version": 1,
      "parameters": {
        "form": "team-feedback"
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
            "content": "Analyze team feedback for culture alignment and role clarity."
          }
        ]
      }
    },
    {
      "id": 3,
      "module": "notion:createPage",
      "version": 1,
      "parameters": {
        "database_id": "CULTURE_INDEX"
      }
    }
  ]
}
````

## Binary Attachments

- None.

## Automation Blueprint

### CUL04-Blueprint.json

```json
{
  "name": "CUL04: Team Roles & Culture (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "typeform:watchResponses",
      "version": 1,
      "parameters": {
        "form": "team-feedback"
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
            "content": "Analyze team feedback for culture alignment and role clarity."
          }
        ]
      }
    },
    {
      "id": 3,
      "module": "notion:createPage",
      "version": 1,
      "parameters": {
        "database_id": "CULTURE_INDEX"
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
