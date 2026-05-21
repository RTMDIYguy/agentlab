# MKT-06 Testing Environment Plan

Date started: 2026-05-09
Change ID: CC-2026-05-09-002
Owner: URC / Codex
Status: Live/manual canary passed with workarounds

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
- `src/canary/run-canary.mjs` now supports a local manual evidence mode, but live service adapters still do not call real APIs.
- Klaviyo preview/test-send must be validated.
- HubSpot, GA4, GoHighLevel, Teams, Outlook, and YouTube analytics are not yet proven for this workflow.
- The 2026-05-21 local canary proved viability and evidence shape, not full automation coverage.

## Local Canary Baseline

Date: 2026-05-21

Run packet:

`mkt-06-content-creation-dissemination/examples/runs/WF6-CANARY-20260521/`

Evidence log:

`MKT-06-Canary-Evidence-Log-2026-05-21.csv`

Result:

`Pass with Manual Workarounds`

Interpretation:

MKT-06 is no longer an empty testing prep package. It has a runnable local
baseline with planning, task, draft, editorial, SEO, adaptation, distribution
preview workaround, Step 7 tracker shape, and final decision evidence. It
should remain in `Testing` until the next canary captures live-system proof.

## Live / Manual Canary

Date: 2026-05-21

Run packet:

`mkt-06-content-creation-dissemination/examples/runs/WF6-LIVE-CANARY-20260521/`

Evidence log:

`MKT-06-Canary-Evidence-Log-2026-05-21-live.csv`

Result:

`Pass with Manual Workarounds`

Interpretation:

The Independence Chapter outreach run proves MKT-06 can operate as a controlled
manual workflow using published content, targeted outreach, manual
distribution, follow-up preparation, and Step 7 performance capture. It is
usable for field execution. It is not yet fully automated or fully
live-service certified.

## Next Field Run

Prepared run:

`mkt-06-content-creation-dissemination/examples/runs/WF6-NEXT-BATCH-20260525/`

Reusable proof checklist:

`mkt-06-content-creation-dissemination/examples/manual-send-proof-checklist.md`

Reusable tracker row:

`mkt-06-content-creation-dissemination/examples/performance-tracker-row-template.md`

Purpose:

Use Independence Chapter Batch 2 Touch 1 to prove the workflow can repeat the
live/manual send process with less setup friction. Confirm whether the planned
2026-05-25 send should move because it falls on Memorial Day in the United
States.

## Next Session Checklist

- [x] Confirm first local testing environment.
- [x] Create the canary planning item.
- [x] Create the local task record.
- [x] Create the source draft.
- [x] Capture approval, SEO, adaptation, and distribution workaround evidence.
- [x] Create the local Step 7 tracker row.
- [x] Complete the dated evidence log.
- [x] Decide `Testing`, `Needs Update`, or `Active`: keep `Testing`; local baseline passed with manual workarounds.
- [ ] Create live Microsoft 365 or Jira/Planner task proof.
- [ ] Create live OneDrive/SharePoint source document proof.
- [ ] Create controlled distribution preview or test-send proof.
- [ ] Create live Step 7 tracker row.
- [x] Use a real outreach run as live/manual distribution proof.
- [x] Capture first real performance signal: Reach 60% open rate, zero replies.
- [ ] Capture platform-native Reach export/screenshot with per-contact status.
- [x] Prepare the next Batch 2 field-run packet.
- [x] Add reusable manual send proof checklist.
- [x] Add lightweight performance tracker row format.
- [ ] Complete Batch 2 send proof after the next manual send.
- [ ] Update Batch 2 tracker row after first open/reply/bounce signal.
