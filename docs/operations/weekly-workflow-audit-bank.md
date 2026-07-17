# Weekly Workflow Audit Bank

Date created: 2026-06-03
Status: v0 operating audit

## Purpose

This audit bank keeps the 45 registered workflows from silently drifting as the
tool stack, offer ladder, client path, and finance controls change.

`MKT-09 Event & Webinar Marketing` is the current canary because it has only a
v0 runnable slice while Bootstrapper Capital events are becoming important to
the revenue path. The same checks should be run across all workflows so weak
spots are found before they become client, revenue, compliance, or operator
burden.

## Weekly Trigger

Run this audit weekly, preferably during Friday finance/KPI review or Thursday
workflow/SOP review.

Run it immediately when:

- a tool is lost, replaced, downgraded, or limited by a free account
- a workflow becomes active after sitting as a shell
- a new offer, SKU, event, assessment, or client path depends on the workflow
- a handoff fails or no one knows who owns the next action
- Robert reports that the system is hard to find, follow, or explain

## Audit Questions

| Audit Lane | Question | Pass Signal | Review Needed Signal |
| --- | --- | --- | --- |
| Process steps completeness | Are the trigger, inputs, steps, review point, outputs, fallback, and stop condition defined? | A new operator can run the workflow from the written source | The workflow is only a shell, imported source, or general description |
| Stack stabilization | Are the current tools named, compatible, affordable, and available? | Active tools match current operating rules and have fallback paths | Source mentions lost, paid, trial, or deprecated tools without current replacement |
| Workflow viability | Can this workflow actually run this week with current accounts, access, budget, and data? | A small live or manual run is possible | It depends on unavailable accounts, unclear credentials, or unbuilt assets |
| Dependencies and handoffs | Are upstream triggers and downstream handoffs named? | The next department knows what signal starts its work | Handoff language is implied, scattered, or owner-dependent |
| Action responsibilities | Are all responsible departments and humans/agents named? | Primary owner, support owner, and review owner are clear | Work crosses departments but responsibility is assigned to only one lane |
| Flow efficiency | Does the workflow avoid duplicate entry, unnecessary tools, and hidden rework? | Data moves once through named trackers or docs | Same data is retyped, stored in multiple places, or trapped in a tool |

## Weekly Review Table

Use one row per workflow reviewed.

| Date | Workflow ID | Audit Lane | Status | Finding | Action | Owner | Due |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-06-04 | MKT-09 | Process steps completeness | Review needed | v0 RoundTable slice exists, but Google response path, tracker location, and follow-up messages still need live confirmation | Confirm existing assessment response sheet and tracker location | Robert + Marcus + agent | TBD |

## Priority Order

Start with workflows that touch live revenue, client trust, money, or secrets:

1. Active execution queue from `docs/operations/agency-operating-manual.md`
2. Workflows marked `Folder shell`
3. Workflows with lost or unstable tool references
4. Workflows with cross-department handoffs
5. Workflows feeding finance, contracts, client onboarding, or aftercare
6. Workflows supporting public offers, books, courses, or events

## MKT-09 Minimum Viable Slice

Before `MKT-09` can be treated as operational, confirm the v0 slice in
`docs/operations/mkt-09-roundtable-operating-slice.md`:

- event type: RoundTable Chapter meeting already scheduled in Ownable OS
- audience and offer relationship
- event source: book, content, outreach, referral, community, or partner
- invite path
- RSVP or registration path
- reminder path
- attendance record
- follow-up sequence
- CRM-lite bridge update fields
- finance handoff if paid
- proof/referral handoff into `MKT-04`
- aftercare/community handoff into `AFC-04` when applicable

## Output Standard

Each weekly audit should produce:

- list of workflows reviewed
- pass/review-needed status by audit lane
- highest-risk workflow finding
- next three fixes
- change-control entry when the audit changes a source-of-truth document

Do not use the weekly audit to redesign the whole agency. Use it to find the
next weak workflow link and make it runnable.
