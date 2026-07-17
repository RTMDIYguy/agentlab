# Independence Chapter Business-Systems Audit Capture Plan

Status: v0 capture design
Last updated: 2026-06-04

## Purpose

This plan clarifies how the Independence Chapter `Business-Systems-Audit`
Google Sheet should capture usable audit results.

The current sheet is useful as a scorecard, but it appears to be designed as a
single-user workbook/template. It calculates or displays what a user enters in
the visible tabs, but it does not by itself create a durable audit record for
each participant, respondent, or RoundTable attendee.

Source sheet:

`https://docs.google.com/spreadsheets/d/1lUGOyWjrMY8POF_lOGHf23Pk6snAkl5o`

Visible tabs from the live sheet:

- `Systems Audit`
- `Scoring Guide`
- `Action Plan Template`

## Cross-Talk Clarification

The Independence Chapter Business-Systems Audit and the local Consulting
Assessment Question Generator are related, but they are not the same tool.

| Tool | Current Job | Should It Store Audit Records? |
| --- | --- | --- |
| Business-Systems Audit Google Sheet | Participant-facing or chapter-facing scorecard for the five core systems | Yes, through a response/results log or connected form |
| Consulting Assessment Question Generator | Internal consultant helper for asking better questions and drafting findings | Not as the source of truth; it can later enrich reports from saved audit records |

The Google Sheet should remain the source capture lane for the Independence
Chapter audit. The assessment generator can later help turn completed audit
records into recommendations, proposals, and routing files.

## Recommended V1

Do not make a separate app yet. Split the current workbook into a clean
participant/facilitator audit workbook plus a separate results workbook.

The audit workbook should keep:

- `Systems Audit`
- `Scoring Guide`

The current `Action Plan Template` should move out of the audit workbook and
into the results workbook, alongside the submissions log.

### Option A: Separate Results Workbook

Create a separate Google Sheet for audit outputs, with protected tabs such as:

- `Audit Submissions Log`
- `Action Plan Template`
- `Generated Action Plans`
- `Export Queue` if needed later

Each completed audit should append one row:

| Field | Purpose |
| --- | --- |
| Audit ID | Durable record ID |
| Submitted at | Timestamp |
| Name | Participant identity |
| Email | Follow-up and dedupe |
| Business / organization | Context |
| Event / RoundTable | MKT-09 source event |
| Source | Book, LinkedIn, Reach, Apollo, referral, community, partner, manual |
| Lead generation score | System 1 score |
| Revenue generation score | System 2 score |
| Delivery score | System 3 score |
| Client retention score | System 4 score |
| Financial management score | System 5 score |
| Overall score | Total score |
| Lowest system | First priority system |
| Interpretation band | Optimized, Functional, Developing, Reactive, or Critical |
| Recommended next step | RoundTable, diagnostic, workshop, membership, consulting, nurture, no follow-up |
| Owner | Robert, Marcus, agent, or account manager |
| Follow-up date | Next action date |
| Notes | Human context |

### Option B: Use A Google Form

Use a Google Form as the data-entry front end and let the sheet receive
responses automatically.

This is cleaner if participants fill out the audit themselves. It also gives a
natural timestamped response record.

### Option C: Apps Script Submit Button

Keep the current workbook experience, but add a button or Apps Script function
that copies the current visible scores into the separate results workbook.

This is cleaner if Robert or a facilitator fills out the audit during a call or
RoundTable.

The same submission function should work whether:

- Robert or a facilitator fills the audit during a live conversation
- a respondent opens the audit from an email link and submits it independently
- a RoundTable participant completes it after the event

The submit action should create both:

- a submission log row
- an action-plan source record that can populate the moved `Action Plan
  Template`

## Recommended Path

Use this order:

1. Keep `Systems Audit` and `Scoring Guide` in the audit workbook.
2. Move `Action Plan Template` to a separate results workbook.
3. Add `Audit Submissions Log` to that separate results workbook.
4. Add or design the Apps Script submit button so either facilitator-led or
   respondent-led completion creates a durable record.
5. Export the log to CSV/XLSX when needed.
6. Later connect saved audit rows to the Consulting Assessment Question
   Generator for richer recommendations and proposal support.

## Report Outputs To Add Later

Each saved audit record should eventually support:

- internal recommendations report
- client-facing recommendations report
- proposal/contract prep notes
- routing file with dependencies and next steps
- CRM-lite / MKT-09 update row
- JSON, CSV, and XLSX export

## Security Boundary

Do not store sensitive client notes, secrets, or private account details in a
public repo. The Google Sheet can hold working participant data if access is
controlled. Repo docs should store schemas, templates, and operating rules,
not private respondent data.
