---
schema: kit/1.0
slug: cul-05-growth-training
title: "CUL-05 - Growth & Training"
summary: "Culture workflow package for Growth & Training. Consolidates registry metadata, imported source references, setup guidance, validation notes, and automation blueprints into one operative kit file."
version: 0.1.0-draft
owner: uncle-robert-consulting
license: UNLICENSED
status: imported-draft
conformance: draft
certifiedAt: null
workflowId: CUL-05
department: "Culture"
automationLevel: "70-80%"
primaryOwner: "Robert T. McCarthy"
trigger: "New hire confirmed"
cycleTime: "Onboarding: 5-day sprint; training: 2 hrs/week"
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

# CUL-05 - Growth & Training

This is the consolidated `kit.md` for the workflow. It replaces the old imported-package surface as the operative file while keeping source, asset, tracker, and automation files as provenance until certification is complete.

## Goal

Run the Growth & Training workflow for Culture with a repeatable trigger, owner, cycle time, outputs, and validation path. The current draft is strong enough for agent orientation and controlled internal use; certification still requires a live run or documented manual evidence.

## When to Use

Use this workflow when the trigger occurs: **New hire confirmed**.

Use it as part of the URC operating system first. Convert it into a client-safe variant only after URC-specific names, internal assumptions, and tool choices have been scrubbed or intentionally parameterized.

## Registry Metadata

| Field | Value |
| --- | --- |
| Workflow ID | CUL-05 |
| Department | Culture |
| Automation level | 70-80% |
| Owner | Robert T. McCarthy |
| Trigger | New hire confirmed |
| Cycle time | Onboarding: 5-day sprint; training: 2 hrs/week |
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

1. Confirm the trigger: New hire confirmed.
2. Open the relevant source or asset file from the Source Map.
3. Collect the minimum inputs needed for this cycle.
4. Execute the workflow steps using the imported source as the detailed operating guide.
5. Capture output evidence, exceptions, and follow-up tasks.
6. Record meaningful package or behavior changes in `docs/operations/change-control-register.md`.

## Source Digest

- `URC-CUL-05_YC_Investor_Story.md`: Source file imported and retained for detailed workflow extraction.

## Source Map

| Artifact | Purpose |
| --- | --- |
| `source/URC-CUL-05_YC_Investor_Story.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `automation/CUL05-Blueprint.json` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `trackers/CUL-05_Training_Tracker.xlsx` | Retained provenance/input artifact now referenced by this consolidated kit. |

## Embedded Source and Asset Documents

### source/URC-CUL-05_YC_Investor_Story.md

````markdown
# CUL-05 - Growth & Training Source

Source: `Culture\URC Culture files\updated files 03262026\URC-CUL-05_YC_Investor_Story.docx`

This Markdown file is a text extraction of the source `.docx` for GitHub-readable access. Preserve the source path in citations until the workflow is fully converted into `kit.md` format.

UNCLE ROBERT CONSULTING LLC

URC-CUL-05 — The YC & Investor Story

Updated March 26, 2026 — Solo Founder Edition

Robert T. McCarthy   |   v1.1   |   March 26, 2026

1. Why This Document Exists

YC interviews are 10 minutes. Investor conversations are often shorter. Robert needs to be able to tell URC's story in a way that is honest about where the company is today, specific about what it's building, and compelling enough that the listener immediately understands why it matters and why now.

This document has been updated to reflect that Robert is building URC as a solo founder. That is not a weakness in the story — it is the story. One person. Forty documents. A live system. A real client. A call scheduled with At Zero Cost. YC Startup School in April. That is forward motion.

2. The One-Sentence Description

Uncle Robert Consulting is building an AI-native agency operating system — seven departments, fully mapped workflows, trained AI agents, and a central LLM that coordinates them based on human goals — so any agency or business can run its operations at the AI level, not the human task level.

If the listener asks what that means in plain English:

Imagine telling a computer 'I want to get 10 new clients this quarter within a $2,000 budget' — and having it coordinate your marketing, sales follow-up, client onboarding, and reporting automatically, flagging you only when a human decision is actually needed. That's what we're building.

3. The YC Question Framework

'What are you making?'

An AI-native agency operating system. Seven departments — Sales, Marketing, Fulfillment, AfterCare, Finance, Culture, and Operations — each with fully mapped workflows, tested templates, and AI agents trained to execute them. A central LLM coordinates all agents based on human input of goals, milestones, and permissions.

'Who needs this and what are they doing now?'

Small agencies and service businesses drowning in operational tasks they do manually every day — follow-up, reporting, client check-ins, lead capture. Right now they either hire people to do these tasks or don't do them at all. Neither is sustainable.

'How far along are you?'

40 workflow documents across all 7 departments, 27 tracker and dashboard spreadsheets, a live CRM, email automation, and a Zapier integration stack. The foundation layer is complete. We're in Phase 1 — testing workflows with live clients. Active client: Holmes Media. At Zero Cost call scheduled for prototype development. YC Startup School April 2026.

'Why are you doing this alone?'

I started with a co-founder who stepped back for personal reasons in March 2026.

That's a real thing that happens, and I'm not going to pretend otherwise.

What I can tell you is that the 40 documents sitting in my project folder were built

by me — and the methodology works whether there's one person or ten behind it.

I'm looking for the right technical co-founder, not the nearest available one.

'Why isn't someone already doing this?'

The big consulting firms are too expensive and too slow for small agencies. The AI tool vendors automate individual tasks but not the coordination between them. Nobody has built the layer that sits above the tools — that takes a human's goal and coordinates workflows across every department to achieve it. That's the gap.

'Why will you succeed?'

Two reasons. First, we're not pitching a concept — we have 40 tested workflow templates that represent the functional specification for the platform. That's a year of work most funded startups skip. Second, I am the product's first user. I run my consulting practice on this methodology every day. I know where it breaks, what clients actually need, and how to sell it.

'What's the business model?'

Three tiers: consulting today funds the build ($500–$2,000 per engagement), platform subscriptions when the MVP is live ($500–$2,500/month per licensee), and managed services for agencies that want URC to run the platform for them ($1,000–$5,000/month). The consulting practice is profitable. The platform is what scales.

4. The Honest Risks — Know Them Before They Ask

Risk

Honest Acknowledgment

Mitigation

Solo founder

Co-founder stepped back in March 2026. Building alone right now.

Looking for technical co-founder. AI tools provide significant leverage. 40 documents prove I can ship without a team.

No platform yet

The platform doesn't exist yet. What exists is the complete functional specification and a consulting practice proving the methodology.

At Zero Cost prototype + YC feedback will determine the build path.

Early stage revenue

One active client. Revenue is consulting-scale, not platform-scale.

Consulting funds the build. The business model doesn't require venture scale to be viable.

No outside funding

Bootstrapping while building.

The spec is complete before raising. Not raising to figure it out — raising to build what's already designed.

5. What URC Needs From YC

Validation of the workflow-to-playbook-to-agent methodology from founders who have scaled service businesses with AI

Access to the YC network for early licensee conversations — agencies and service businesses who would pilot the platform

Feedback on whether to lead with the consulting practice or the platform in go-to-market

Community of builders who understand what it's like to ship alone and keep going

If funded: $500K–$1M to bring on a technical co-founder and build the MVP orchestration layer

6. Review Cadence

Before every investor or YC conversation — read this document and update anything that has changed

After every investor conversation — log what was asked and how to sharpen the answers

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

### automation/CUL05-Blueprint.json

````json
{
  "name": "CUL05: Investor Story (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "hubspot:watchDeals",
      "version": 1,
      "parameters": {
        "pipeline": "fundraising"
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
            "content": "Generate personalized investor update emails based on traction data."
          }
        ]
      }
    },
    {
      "id": 3,
      "module": "mailchimp:sendCampaign",
      "version": 1,
      "parameters": {
        "list": "investors"
      }
    }
  ]
}
````

## Binary Attachments

- `trackers/CUL-05_Training_Tracker.xlsx`: binary attachment retained outside the Markdown kit; convert to CSV/Markdown during certification if the sheet contents become authoritative.

## Automation Blueprint

### CUL05-Blueprint.json

```json
{
  "name": "CUL05: Investor Story (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "hubspot:watchDeals",
      "version": 1,
      "parameters": {
        "pipeline": "fundraising"
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
            "content": "Generate personalized investor update emails based on traction data."
          }
        ]
      }
    },
    {
      "id": 3,
      "module": "mailchimp:sendCampaign",
      "version": 1,
      "parameters": {
        "list": "investors"
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
