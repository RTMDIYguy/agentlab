# Source Map — Founder Signal System

Every step in the Founder Signal System maps back to a specific URC source
workflow. This file is the citation trail. If a step or template here ever
contradicts the source, the source wins until the source itself is
deliberately updated.

The package only pulls the minimum needed for the thin slice. It does not
inherit the full URC workflow.

## Source Locations

| ID | Repo Folder | Source File |
| --- | --- | --- |
| MKT-01 | `workflows/mkt-01-lead-generation-conversion/` | `source/URC-MKT-01_Lead_Generation_Conversion.md` |
| MKT-02 | `workflows/mkt-02-email-sms-nurture/` | `source/URC-MKT-02_Email_SMS_Nurture.md` |
| MKT-03 | `workflows/mkt-03-polls-assessments/` | `source/URC-MKT-03_Polls_Assessments.md` |
| MKT-04 | `workflows/mkt-04-reviews-referrals/` | `source/URC-MKT-04_Reviews_Referrals.md` |
| MKT-05 | `workflows/mkt-05-outreach-engagement/` | `source/URC-MKT-05_Outreach_Engagement.md` |
| MKT-06 | `workflows/mkt-06-content-creation-dissemination/` | `source/URC-MKT-06_Content_Creation_Dissemination.md` |

The reference kit-format implementation pattern lives at
`mkt-06-content-creation-dissemination/` (top-level, not under `workflows/`).
That folder is the kit/1.0 conformance reference. This package is the
draft-stage starter package and reuses the manifest shape.

## Step-By-Step Mapping

### Step 1 — ICP and Fit Focus

| Package Element | Source Workflow | Source Section |
| --- | --- | --- |
| Definition of ICP | MKT-01 | Section 3 — Ideal Customer Profile |
| Painful problem language | MKT-01 | Section 3 — pain points dimension |
| What counts as a qualified conversation | MKT-01 | Section 6 — Lead Qualification & Handoff |
| Exclusion criteria pattern | MKT-01 | Section 3 — ICP dimensions, especially budget and stage |
| Channels to find the ICP | MKT-01 | Section 4 — Lead Generation Channels |

Asset using this: `assets/intake-questions.md` (ICP and audience sections),
README "Who This Is For".

### Step 2 — Diagnostic and Segmentation

| Package Element | Source Workflow | Source Section |
| --- | --- | --- |
| Short intake / founder interview format | MKT-03 | Section 3 — URC Assessment Strategy |
| Segmentation logic (interested / not now / referral / no response) | MKT-03 | Section 4 — Active Assessments, outcome segments |
| Lightweight vs heavy survey decision | MKT-03 | Section 4.1 — AI Readiness Quiz, scoring approach |
| Real-time scoring discipline | MKT-03 | Workflow Overview — typical cycle time |

Asset using this: `assets/intake-questions.md` (full file), plus the
"interested / not now / referral / no response" buckets in
`assets/follow-up-sequence-template.md` and `assets/proof-capture-template.md`.

### Step 3 — Content Engine

| Package Element | Source Workflow | Source Section |
| --- | --- | --- |
| Content brief composition | MKT-06 | Section 5 — Content Creation Process |
| Content pillars pattern | MKT-06 | Section 4 — Content Pillars |
| Idea-to-publish cycle time | MKT-06 | Section 2 — Workflow Overview |
| Founder POV vs brand voice | MKT-06 | Section 4 — Robert's Perspective pillar |
| Distribution / repurposing approach | MKT-06 | Section 5 onward — Creation Process and downstream channels |

Asset using this: `assets/content-brief-template.md`. The kit/1.0 reference
manifest shape is borrowed from `mkt-06-content-creation-dissemination/kit.md`.

### Step 4 — Outreach Lane

| Package Element | Source Workflow | Source Section |
| --- | --- | --- |
| Outreach philosophy (only reach out with something relevant) | MKT-05 | Section 3 — Outreach Philosophy |
| LinkedIn outreach style | MKT-05 | Section 4.1 — LinkedIn (Primary Outreach Channel) |
| Email outreach for warm leads | MKT-05 | Section 4.2 — Email Outreach |
| 3-touch maximum cadence | MKT-05 | Section 4.2 — Maximum 3-touch sequence |
| No bulk automation | MKT-05 | Section 4.1 — No automated bulk messaging |

Asset using this: outreach lane in `implementation-checklist.md` (Day 4),
plus the message style and consent rules referenced in
`assets/follow-up-sequence-template.md`.

### Step 5 — Follow-Up Lane

| Package Element | Source Workflow | Source Section |
| --- | --- | --- |
| Three-touch follow-up sequence | MKT-02 | Section 4 — Nurture Tracks |
| Value-first nurture philosophy | MKT-02 | Section 3 — Nurture Philosophy |
| Response segmentation buckets | MKT-02 | Section 4 — Nurture Tracks by audience |
| Cadence (helpful → specific → close-the-loop) | MKT-02 | Section 4 / 5 — sequence design |

Asset using this: `assets/follow-up-sequence-template.md`.

### Step 6 — Proof Loop

| Package Element | Source Workflow | Source Section |
| --- | --- | --- |
| When to ask for testimonial or review | MKT-04 | Section 3.1 — When to Ask |
| Review platforms and prioritization | MKT-04 | Section 3.2 — Review Platforms |
| Case study capture pattern | MKT-04 | Section 3 onward — Reviews and Testimonials |
| Feedback loop into next content cycle | MKT-04 | Section 3 — overall workflow goal |

Asset using this: `assets/proof-capture-template.md` and the cycle-review
step in `implementation-checklist.md` (Day 5).

## Reference Implementation (Not A Source, But A Pattern)

| Reference | Repo Location | Purpose |
| --- | --- | --- |
| Active kit/1.0 reference | `mkt-06-content-creation-dissemination/kit.md` | Manifest shape, frontmatter, change log discipline |
| Active kit README pattern | `mkt-06-content-creation-dissemination/README.md` | Structure for the package README |
| Kit standard | `docs/operations/kit-auth-standard.md` | Auth contract (not required for this draft because the thin slice has no connectors) |
| Canonical kit standard | `C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\Journey_Kit.md` | Source-of-truth for kit/1.0 fields |

## What Is Deliberately Not Inherited

To keep the thin slice usable for a generic founder rather than URC
specifically, the following URC-internal elements are intentionally not
inherited:

- URC-specific tooling assumptions (Make.com, Notion content calendar,
  HubSpot CRM, Klaviyo lists, Jira, Atlassian)
- URC-specific case study references (Marcus & Rivera) — those stay in
  source material only
- URC's geographic focus (Kansas City metro, Independence MO)
- URC's flagship AI Readiness Quiz brand — the diagnostic in this package
  is a generic intake, not the URC quiz
- URC's MKT-06 n8n workflow template — the thin slice does not require
  any automation to run

If a buyer wants any of those layers, they should be quoted as a follow-on
engagement, not inherited silently into this package.

## Change Tracking

When a source workflow updates, this file is the diff point. Update the
matching row, log the change in
`docs/operations/change-control-register.md`, and reflect it in
`kit.md` change log.
