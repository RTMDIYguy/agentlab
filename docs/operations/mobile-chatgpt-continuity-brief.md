# Mobile ChatGPT Continuity Brief

Last updated: 2026-05-16

## Purpose

Use this document to orient ChatGPT on Android when Robert is away from the main PC, working from a phone, small laptop, library Wi-Fi, or a thumb drive.

The goal is continuity, not full development from the phone.

## Who Robert Is Working For

The operating system supports:

- Uncle Robert Consulting (`URC`) as the main business
- Bootstrapper Capital as the founder/community/event funnel
- Tactix as the fulfillment and Upwork arm
- `Bootstrapper's Guide to the World` as an authority and funnel asset

Current priority: move from planning into execution, especially lead generation, founder events, CRM-lite tracking, and sellable workflow packages.

## Main Repo

Repo folder on the main PC:

`C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\agent-lab-site`

GitHub remote:

`https://github.com/RTMDIYguy/agentlab.git`

Default branch:

`main`

Current rule: do not touch untracked `.docx` files unless Robert explicitly asks.

## Read First If Context Is Missing

Inside the repo:

1. `docs/operations/urc-agent-execution-checklist.md`
2. `docs/operations/urc-v1-operating-architecture.md`
3. `docs/operations/urc-90-day-implementation-plan.md`
4. `docs/operations/change-control-register.md`

If working on Bootstrapper Capital leads:

`C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\Bootstrapper Capital\Lead Lists\Apollo\`

Current Missouri tech founder files:

- `2026-05-16_Apollo_Missouri-Tech-Founders-Owners_Bootstrapper-Capital-Chapter_Enriched-Raw.csv`
- `2026-05-16_Apollo_Missouri-Tech-Founders-Owners_Bootstrapper-Capital-Chapter_Reviewed.csv`
- `2026-05-16_Missouri-Tech-Founders-Chapter_Next-Week-Launch-Checklist.md`

The checklist was approved by Robert on 2026-05-16 for the May 18-22, 2026 launch cycle.

## How To Use ChatGPT On Android

ChatGPT on Android can help with:

- planning the next step
- drafting invite copy
- reviewing checklist text
- explaining Git and SourceTree steps
- turning notes into tasks
- preparing questions before using the main PC

ChatGPT on Android probably cannot directly see or edit the local repo unless files are uploaded or copied into the chat.

When asking Android ChatGPT for help, paste this instruction:

> Use the attached Mobile ChatGPT Continuity Brief as project orientation. Keep recommendations practical, low-cost, and aligned with URC as the main business, Bootstrapper Capital as the founder/community funnel, and Tactix as fulfillment. Prefer Microsoft 365 and OneDrive. Do not suggest redesigning the business from scratch.

## Offline / Library Sync Plan

Git works offline. GitHub does not.

If internet is unavailable on the main PC:

1. Work locally on the main PC.
2. Commit local changes in SourceTree before moving anything.
3. Use phone hotspot or Personal Area Network if available.
4. If needed, take the small laptop and phone to the library.
5. Use the library internet from the small laptop if phone internet is not enough.
6. Fetch before pushing.
7. Push only after confirming local `main` and `origin/main` are aligned or after resolving any differences.

Best rule:

`Commit before moving. Fetch before pushing.`

## Safe SourceTree Checklist

Before leaving the main PC:

- [ ] Open SourceTree.
- [ ] Confirm branch is `main` unless working on a feature branch.
- [ ] Review changed files.
- [ ] Do not stage unrelated untracked files.
- [ ] Commit only the intended files.
- [ ] Write a clear commit message.

At the library or on a temporary connection:

- [ ] Connect to internet.
- [ ] Open SourceTree.
- [ ] Fetch from `origin`.
- [ ] Confirm whether local is ahead, behind, or aligned.
- [ ] Pull only if needed.
- [ ] Push committed local changes.
- [ ] Confirm GitHub shows the latest commit.

## Change-Control Rule

Meaningful operational changes should be logged in:

`docs/operations/change-control-register.md`

Run this before calling workflow-package changes complete:

`pnpm change-control:check`

Changes that usually need logging:

- CRM-lite structure
- funnel control files
- workflow package files
- automation files
- operating architecture docs
- approval of execution checklists

Small typo fixes can usually be grouped.

## Current Bootstrapper Capital Chapter Step

The immediate next execution item is the Missouri Tech Founders chapter invite cycle.

For the week of May 18-22, 2026:

1. Monday: score the 13 Apollo leads as `A`, `B`, or `C`.
2. Tuesday: finalize the first invite.
3. Wednesday: send Touch 1 to A-priority contacts.
4. Thursday: log replies.
5. Friday: decide whether to invite B-priority contacts and prep Touch 2.

Do not add contacts to an Apollo sequence until the first invite and follow-up logic are reviewed.

## Safety Notes

- Do not use public library computers for GitHub login unless there is no other option.
- Prefer Robert's own laptop on library Wi-Fi.
- Do not save passwords on public machines.
- Do not copy secrets, keys, `.env` files, or private client data to public machines.
- Keep raw lead exports in OneDrive, not scattered across devices.
- Preserve existing business data.

## Quick Status Prompt

Use this when starting a phone session:

> I am Robert. I am working on the URC / Bootstrapper Capital / Tactix operating system. I may be away from my main PC and using Android ChatGPT for continuity. Help me decide the next practical step, but do not assume you can access my repo unless I upload files. Keep the system lightweight and execution-focused.
