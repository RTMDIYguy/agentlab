# MKT-06 Testing Environment Plan

Date started: 2026-05-09
Change ID: CC-2026-05-09-002
Owner: URC / Codex
Status: Testing prep

## Purpose

Move `MKT-06 - Content Creation & Dissemination` from packaged workflow into a controlled testing environment so URC can prove viability before offering it to clients.

This is a market-facing workflow test, not the internal MKT-01 lead-generation test.

## Test Goal

Prove that MKT-06 can take one approved content idea through planning, draft creation, review, SEO/adaptation, distribution proof, and performance-tracking setup with enough evidence to classify the workflow as:

- `Pass`
- `Pass with Manual Workarounds`
- `Fail`

## Recommended Environment

Use the lowest-risk available environment first:

1. Notion or Microsoft List test row for content planning
2. Jira test ticket or equivalent task record
3. OneDrive draft document
4. GitHub test artifact or documented manual artifact
5. Internal reviewer approval record
6. SEO/adaptation checklist
7. Klaviyo preview/test send or documented distribution fallback
8. Notion/Microsoft tracker row for Step 7 performance tracking

Avoid live public sends until preview/test-send behavior is proven.

## Test Asset

Create one clearly labeled internal asset:

`WF6 Canary Test - Internal Verification - YYYY-MM-DD`

Rules:

- mark the asset `Internal Test`
- use preview lists, test recipients, or draft states
- do not send to an external client audience during the first viability test
- keep screenshots, links, and IDs in one evidence folder

## Stub Policy

Because the source automation files are still spec stubs, the first test may use manual or deterministic stubs where needed.

Approved stubs:

- manual draft creation using the MKT-06 drafting-agent contract
- manual Jira state changes
- manual SEO/adaptation checklist completion
- Klaviyo preview instead of a live send
- manual performance tracker row with placeholder metrics

Not approved:

- calling the workflow `Active` without Jira proof, draft proof, distribution proof, and Step 7 tracking proof
- hiding skipped steps without fallback notes
- sending to a real audience before preview/test-send proof exists

## Evidence Requirements

The canary evidence chain must capture:

1. planning item URL or file path
2. Jira ticket URL or task record
3. source draft URL or file path
4. GitHub artifact, branch, commit, PR, or documented manual workaround
5. editorial approval evidence
6. SEO completion evidence
7. adaptation asset evidence
8. distribution preview or test-send evidence
9. performance tracker row
10. final decision

Use `MKT-06-Canary-Verification-Runbook.md` as the operating checklist.

## First Viability Run

Minimum first run:

1. choose the test environment
2. create the canary content planning record
3. create or link the task ticket
4. create the source draft in OneDrive
5. run editorial and SEO/adaptation manually if automation is not ready
6. create a Klaviyo preview or equivalent test distribution artifact
7. create the Step 7 tracker row
8. run or manually complete the evidence log
9. classify the result

## Promotion Rule

Keep MKT-06 in `Testing` until the canary has:

- Jira/task proof
- draft proof
- distribution proof
- Step 7 tracking proof
- a completed evidence log

Promote to `Active` only after `Pass` or `Pass with Manual Workarounds`.

## Current Known Gaps

- `src/automation/*.mjs` files are spec stubs.
- `src/canary/run-canary.mjs` records the evidence contract but does not yet call real service APIs.
- Klaviyo preview/test-send must be validated.
- HubSpot, GA4, GoHighLevel, Teams, Outlook, and YouTube analytics are not yet proven for this workflow.
- The first test should focus on viability and evidence, not full automation coverage.

## Next Session Checklist

- [ ] Confirm which testing environment will host the first MKT-06 canary.
- [ ] Create the canary planning item.
- [ ] Create the Jira/task record.
- [ ] Create the source draft.
- [ ] Capture approval, SEO, adaptation, and distribution evidence.
- [ ] Create the Step 7 tracker row.
- [ ] Complete the evidence log.
- [ ] Decide `Testing`, `Needs Update`, or `Active`.
