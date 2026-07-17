# Daily Command Center Design

Date: 2026-06-03
Status: Approved design captured for implementation planning

## Goal

Build a repo-native Personal Assistant / Daily Command Center that turns the
agency's scattered schedules, cadences, workflow queues, marketing priorities,
sales follow-ups, and audit prompts into one daily operating brief.

The brief should tell Robert what he should do today, not merely what he
remembers wanting to do.

## Problem

URC already has many operating documents, trackers, cadences, and agents in
different places. Robert is still relying on post-it notes for daily execution,
which helps capture intention but does not guarantee that live obligations,
revenue work, workflow audits, sales follow-up, marketing assets, affiliate
opportunities, or client-trust checks surface at the right time.

ClickUp may have a personal assistant agent and onboarding agent, but the
current ClickUp state is stale. Until it is reconciled against the repo and
`AI Native Agency Deepened`, it should not become the source of truth.

## Design Principles

- Start with one coordinating assistant before adding helper agents.
- Use repo and workspace files as the first source of truth.
- Do not require paid tools or cloud services for V1.
- Keep ClickUp as a retool candidate until it is exported, inspected, and
  reconciled.
- Produce a daily brief that is useful even if no automation runs.
- Preserve secrets and client data boundaries.
- Prefer marketing, sales, money, client trust, and workflow viability over
  infrastructure experiments.

## V1 Sources

The V1 command center reads from these source categories:

| Source | Use |
| --- | --- |
| `docs/operations/agency-operating-manual.md` | Active queue, cadence, open build items |
| `docs/operations/urc-agent-execution-checklist.md` | Required agent opening routine and execution prompts |
| `docs/operations/weekly-workflow-audit-bank.md` | Workflow audit lanes and `MKT-09` canary checks |
| `docs/operations/workflow-relationship-map.md` | Cross-department handoffs and active execution overlay |
| `docs/operations/change-control-register.md` | Recent operating changes and approved decisions |
| `docs/operations/agency-owners-manual-blueprint.md` | Navigation and source-of-truth build prompts |
| Marketing and Sales workspace folders | Revenue recovery, follow-up, affiliate, and campaign opportunities |
| Future ClickUp export or connector | Candidate cockpit data after reconciliation |

## V1 Output

Create a daily Markdown brief in:

- `docs/operations/daily-command-center/YYYY-MM-DD-command-brief.md`

Each brief includes:

- `Top 3 Actions`
- `Marketing And Sales Moves`
- `Follow-Ups And Handoffs`
- `Workflow Audit Prompt`
- `Money And Client-Trust Checks`
- `Parking Lot`
- `Ask Robert`
- `Source Notes`

## Daily Decision Logic

The daily brief should rank work in this order:

1. Client trust, live obligations, and money tasks
2. Sales follow-up, proposals, onboarding, and CRM-lite bridge updates
3. Marketing actions that can create near-term revenue, including affiliate
   link placement and offer CTA cleanup
4. Active workflow audit items, especially `MKT-09` until its event lane is
   runnable
5. Owner's Manual and source-of-truth cleanup that reduces operating confusion
6. Sandbox or platform learning only when it supports a current priority

## Agent Model

V1 has one coordinating agent:

- `Daily Command Agent`: reads source docs, creates the daily brief, and
  identifies what should be done next.

Future helper agents can be added after the coordinator produces useful briefs:

- `Marketing Revenue Recovery Agent`
- `Sales Follow-Up Agent`
- `Workflow Audit Agent`
- `Affiliate Inventory Agent`
- `ClickUp Reconciliation Agent`

The coordinator should not depend on those helpers in V1.

## Automation Model

V1 can run manually from a script or command. After the format proves useful,
it can become a weekday morning Codex automation.

The first automation should:

- run on weekdays
- read only approved repo/workspace docs
- avoid secrets
- write or summarize one daily brief
- keep ClickUp read-only or export-based until retooling is approved

## ClickUp Position

ClickUp should not be updated blindly.

Retooling path:

1. Export or inspect current ClickUp spaces, lists, tasks, docs, and agent
   configurations.
2. Compare them to the repo, `AI Native Agency Deepened`, active operating
   manual, workflow audit bank, and current marketing/sales priorities.
3. Mark stale snapshots, candidate reusable structures, active tasks, and
   missing tasks.
4. Decide whether ClickUp becomes the cockpit, stays reserve stack, or receives
   selected task mirrors only.

## Security And Privacy

The command center must not print, store, or request secret values.

It may reference:

- secret-handling procedures
- metadata-only secret logs
- public or internal non-secret source files
- tracker paths and next actions

It must not include:

- API keys
- service account private keys
- backup codes
- OAuth secrets
- client-sensitive details beyond approved internal summary level

## Success Criteria

V1 is successful when:

- Robert can open one daily brief and see what deserves attention today.
- Marketing and sales actions are visible without needing to search multiple
  folders.
- Workflow audit prompts surface weekly instead of staying buried.
- The brief distinguishes urgent work from parked ideas.
- The system can later be scheduled without changing the source-of-truth model.

## Non-Goals

- Do not rebuild ClickUp in V1.
- Do not create a paid SaaS dependency.
- Do not create multiple cloud agents before the coordinator is useful.
- Do not write client-sensitive or secret data into command briefs.
- Do not replace the workflow registry, audit bank, SOP index, or agency
  operating manual.
