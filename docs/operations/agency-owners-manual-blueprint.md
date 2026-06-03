# Agency Owner's Manual Blueprint

Date created: 2026-06-03
Status: v0 blueprint

## Purpose

This blueprint defines the human-facing Owner's Manual for Uncle Robert
Consulting, Agent Lab, Tactix, Bootstrapper Capital, Ownable OS, and the book
ecosystem.

The Owner's Manual should be the place a capable person goes when they need to
understand what exists, where it lives, how the parts relate, and what to do
next. It does not replace SOPs, the workflow registry, change control, or
trackers. It points to them in a clear order.

## Audiences

| Audience | Need |
| --- | --- |
| Robert | Fast navigation when files, tools, projects, or account relationships have moved |
| Returning collaborator | Orientation without needing the whole history repeated verbally |
| Auditor or certifier | Evidence, controls, ownership boundaries, SOPs, and change records |
| Future operator or buyer | Instructions for using a workflow, playbook, department system, or company operating system |
| Agent | Source-of-truth links, current priorities, stop conditions, and handoff points |
| Public observer | A sanitized tour-guide layer showing how the agency is being built in real time |

## Manual Shape

The first version should be a single Markdown source with links, promoted to a
human-friendly Microsoft 365 or Google Drive copy when Robert approves.

Recommended repo source:

- `docs/operations/agency-owners-manual.md`

Recommended human-facing copy:

- Operations folder in the business workspace
- Microsoft 365 / Word when paid access is available
- Google Drive copy when it is the active free bridge

## Core Sections

| Section | Purpose | Primary Sources |
| --- | --- | --- |
| Start Here | Orient the reader and explain what the manual is for | `docs/operations/agency-operating-manual.md`; `WORKSPACE-STANDARD.md` |
| Business Map | Explain URC, Agent Lab, Tactix, Bootstrapper Capital, Ownable OS, and the book line | `docs/operations/urc-v1-operating-architecture.md` |
| Current Priorities | Show what is live this week or quarter | `docs/operations/agency-operating-manual.md`; `docs/operations/urc-90-day-implementation-plan.md` |
| Workflow Map | Show the 45-workflow registry and cross-department handoffs | `docs/operations/workflow-registry.md`; `docs/operations/workflow-relationship-map.md` |
| SOP Library | Point to active SOPs and SOP candidates | `docs/operations/sop-manual-index.md` |
| Tools, Accounts, And Relationships | Point to the registry app/data and explain what belongs there | Tool/Account/Relationship registry app and data files |
| Finance Control Layer | Explain trackers, dashboard links, SKU/account mapping, and export rules | Owned finance trackers; `docs/operations/SOP-OPS-005-naming-conventions-and-identifier-control.md` |
| Secret And Credential Handling | Explain where metadata is recorded and where values must not go | `docs/operations/secret-handling-standard.md`; Compliance Audits secret log |
| Publishing And Products | Explain BGW, blueprint books, courses, workflow products, and compendiums | Book tracker; SOE book control; workflow package docs |
| Infrastructure And Sandboxes | Explain VPS, KNIME, cloud accounts, GitHub, Stripe, and marketplace candidates | `docs/operations/urc-v1-operating-architecture.md`; reference shelves |
| Evidence, Audits, And Change Control | Show how decisions, tests, and compliance evidence are captured | `docs/operations/change-control-register.md`; Compliance Audits folder |
| Public Tour Guide Layer | Define what can be shown publicly and what must stay private | Public values guide; secret standard; future public-tour policy |

## Link And Search Standard

Every manual section should include:

- plain-English description of what the area does
- source-of-truth link
- owner or reviewing department
- related workflow IDs where available
- last reviewed date
- status: active, draft, candidate, deprecated, or review needed
- private/public classification

Do not paste secret values, client-sensitive data, or raw backup codes into the
manual. Link only to approved metadata, vault instructions, or sanitized
evidence.

## Public Tour Guide Rule

The public tour guide, if created, must be a separate sanitized derivative. It
can show:

- the build philosophy
- public values
- workflow-product progress
- non-sensitive change history
- public-facing diagrams
- lessons learned from building in public

It must not show:

- secrets, keys, backup codes, OAuth files, or service-account JSON
- client files or private prospect data
- unredacted finance records
- private partner, vendor, or affiliate terms
- personal accounts
- internal recovery paths

## Maintenance Trigger

Update the Owner's Manual when:

- a new workflow becomes active
- a tracker or dashboard becomes a source of truth
- a tool, account, vendor, affiliate, or relationship becomes operationally
  important
- an SOP is promoted to active status
- a platform candidate moves from research to trial or production
- a finance, secret, client, compliance, or public-facing control changes
- Robert reports that he cannot find a thing that should be findable

## First Build Order

1. Create `docs/operations/agency-owners-manual.md`.
2. Add Start Here, Business Map, Current Priorities, Workflow Map, SOP Library,
   and Source-of-Truth Map.
3. Add placeholders for Tools/Accounts/Relationships, Finance Control Layer,
   Infrastructure/Sandboxes, and Public Tour Guide.
4. Link the manual from `docs/operations/agency-operating-manual.md` and
   `docs/operations/sop-manual-index.md`.
5. Promote a human-facing copy only after the repo version is reviewed.

## Open Decisions

| Decision | Current Default | Review Point |
| --- | --- | --- |
| Human-facing host | Microsoft 365 when available; Google Drive as bridge | When paid Microsoft 365 access is stable |
| Public tour guide | Candidate only | After private manual has stable private/public classification |
| Search layer | Links and headings first | Add richer search only after the manual structure stabilizes |
| Registry app link | Pending | After Tool/Account/Relationship registry V1 exists |
