# Agency Owner's Manual

**Owner:** Robert T. McCarthy / Uncle Robert Consulting LLC
**Date Created:** 2026-06-09
**Last Structural Update:** 2026-06-10
**Version:** v0.2 — expanded to full 12-section blueprint
**Purpose:** Operational reference for running the URC family of businesses. Covers business orientation, workflows, tools, SOPs, finance controls, secret handling, products, infrastructure, and change control in one navigable document.

> **SECURITY CONSTRAINT (permanent):** This document must never contain secret values,
> credential strings, backup codes, OAuth tokens, service-account JSON, client PII, or
> unredacted finance records. Link only to approved metadata, vault instructions, or
> sanitized evidence. See [Section 8](#8-secret-and-credential-handling) for the full rule.

---

## How To Use This Document

This is the owner's manual — not the architecture deck, not the SOP library, not the
strategy doc. Read it when you want to know where the controls are, why a decision was
made, or how to orient a new agent or operator.

- **New to the business?** Start at [Section 1](#1-start-here), then read [Section 2](#2-business-map).
- **Running a workflow?** Go to [Section 4](#4-workflow-map), then [Section 5](#5-sop-library).
- **Handling money or accounts?** [Section 7](#7-finance-control-layer).
- **Handling a credential or secret?** [Section 8](#8-secret-and-credential-handling) — mandatory before acting.
- **Something changed?** Log it in [Section 11](#11-evidence-audits-and-change-control).
- **Showing something publicly?** Check [Section 12](#12-public-tour-guide-layer) first.

---

## 1. Start Here

**Description:** Orientation layer. Answers "where is everything?" for a new human, agent,
or returning collaborator. Keeps the most important operating rules visible without
requiring a deep dive.

**Source of truth:** `docs/operations/agency-operating-manual.md`

**Supporting docs:**
- `docs/operations/urc-agent-execution-checklist.md` — rules every agent must follow before acting
- `docs/operations/urc-v1-operating-architecture.md` — business structure and platform decisions
- `docs/operations/urc-90-day-implementation-plan.md` — current execution horizon

**Owner:** Robert T. McCarthy / OPS
**Last reviewed:** 2026-06-10
**Status:** Active
**Classification:** Public-facing (no sensitive content in this section)

### Operating Principle

The agency should be built so a capable operator can get in and drive it. That means one
obvious starting point, named business lanes, visible source-of-truth locations, clear
workflow ownership, a small number of live offers, documented manual fallbacks, and SOPs
written from real work, not theory.

### AI Session Lessons

#### The 90% Context Rule

**Date logged:** 2026-06-09

Do not close a Claude session at 90% of context capacity assuming you can pick back up
cleanly. Claude sessions are stateless across context boundaries. The next session opens
cold with no memory of what was done unless you explicitly pass a handoff prompt.

**What to do instead:**
1. Before the session runs out, write a handoff prompt describing what was accomplished,
   what is in progress, which files were created or changed, and what the next action is.
2. Save that handoff prompt somewhere retrievable (notes file, draft message, anywhere).
3. Use the remaining session to reach a clean stopping point.
4. Open the next session with the handoff prompt as the first message.

**The rule:** Use the whole session. Just make sure the handoff prompt is written before it
runs out — not after.

---

## 2. Business Map

**Description:** Defines the legal and operational entities, their roles, how they relate
to each other, and what each one owns. The source of truth for "which entity does what."

**Source of truth:** `docs/operations/urc-v1-operating-architecture.md`

**Owner:** Robert T. McCarthy / OPS
**Last reviewed:** 2026-06-10
**Status:** Active — v0 architecture, decisions still in progress on platform selection
**Classification:** Public-safe summary; full architecture doc is internal

### Entities

| Entity | Role | Notes |
|---|---|---|
| **Uncle Robert Consulting LLC (URC)** | Main operating entity. Consulting, advisory, IP ownership, client invoicing. | All client contracts run through URC. |
| **Tactix** | Execution pod. Upwork-facing delivery arm. | Handles billable project work; keeps client-facing delivery separate from URC brand. |
| **Bootstrapper Capital** | Audience, community, and funnel. Roundtables, bootcamps, continuity programs. | Independence Chapter on Bootstrapper.ai. Feeds URC pipeline. |
| **Agent Lab** | R&D and public demonstration platform. Tests automation, agent workflows, and AI tooling. | Live at agentlab.manus.space. Source repo in this workspace. |
| **Bootstrapper's Guide to the World (book)** | Authority and conversion asset. 28 bootstrapped business models, $59.99. | Listed in Agent Lab. Feeds Bootstrapper Capital funnel. |

### Offer Ladder (Phase 1 LOCKED v1.0)

Book ($59.99) → Roundtable (free/invite) → $1 Bootcamp → $500/mo Ownable OS → URC Workflow engagement

### Platform Decisions (as of 2026-06-10)

- **Office backbone:** Microsoft 365 (preferred when available; Google Drive as bridge during bootstrap)
- **Project/dashboard layer:** Notion (lightweight only; not source of truth for operations)
- **Development/deployment:** GitHub + Vercel (Agent Lab)
- **Payments:** Stripe (active — book checkout live)
- **Automation:** n8n (credentials vault), Zapier, Make (both at free tier; in-house pivot under evaluation)
- **CRM:** HubSpot (contacts endpoint active in Agent Lab)

---

## 3. Current Priorities

**Description:** Live execution horizon. What is being worked on this week and this quarter.
Updated when priorities shift, not on a fixed schedule.

**Source of truth:** `docs/operations/urc-90-day-implementation-plan.md`
**Supporting doc:** `docs/operations/agency-operating-manual.md` (operating tracks section)

**Owner:** Robert T. McCarthy / OPS
**Workflow IDs:** OPS-01, OPS-02 (planning and execution tracks)
**Last reviewed:** 2026-06-10
**Status:** Active — review weekly
**Classification:** Internal

### Active Tracks (2026-06-10)

**Track 1 — Agent Lab (technical)**
- Codex P1/P2 security fixes: Stripe checkout, HubSpot PATCH vector, service worker caching (completed 2026-06-09/10)
- Founders Signal System MVP — proximity to beta tester readiness under assessment
- Lead gen in-house pivot evaluation (Zapier, Make, Apollo all at free tier max)

**Track 2 — URC / Bootstrapper Capital (business)**
- Founder's Roundtable B2B pipeline: 7 of 10 LeadLaps battle cards in hand; multichannel outreach sequence pending
- Independence Chapter operations on Bootstrapper.ai

**Maintenance trigger:** Update this section whenever a track completes, a new sprint starts, or priorities shift materially.

---

## 4. Workflow Map

**Description:** Registry of all active and planned workflows across the agency, organized
by department. The source of truth for "which workflow handles which function."

**Source of truth:** `docs/operations/workflow-registry.md`
**Cross-department handoffs:** `docs/operations/workflow-relationship-map.md`

**Owner:** OPS department
**Last reviewed:** 2026-06-10
**Status:** Active — v0; 45 workflows imported; statuses pending individual review
**Classification:** Internal

### Department Codes

| Code | Department |
|---|---|
| OPS | Operations |
| CUL | Culture / People |
| FIN | Finance |
| SAL | Sales |
| MKT | Marketing |
| HR | Human Resources |
| DEL | Delivery / Client Work |

### Registry Summary

The full registry is in `workflow-registry.md`. Current counts as of last import:

- **OPS:** OPS-01 through OPS-08 (8 workflows)
- **CUL:** CUL-01 through CUL-08 (8 workflows)
- **FIN:** FIN-01 through FIN-05 (5 workflows)
- **SAL:** SAL-01 and beyond
- **MKT, HR, DEL:** Imported — counts pending review

### Two-Track Model

All workflows belong to one of two tracks:
1. **URC / Internal** — agency operations, finance, culture, sales, marketing
2. **Client-facing** — delivery, onboarding, reporting, communication

Each workflow entry in the registry carries a track designation, owner, and status.

### Maintenance trigger

Add an entry to `workflow-registry.md` and log the addition in the change control register
whenever a new workflow goes active.

---

## 5. SOP Library

**Description:** Index of active standard operating procedures. SOPs are the step-by-step
source of truth for repeatable tasks. This section points to the index; the index points
to individual SOP files.

**Source of truth:** `docs/operations/sop-manual-index.md`

**Owner:** OPS
**Last reviewed:** 2026-06-10
**Status:** Active — v0 working index
**Classification:** Internal (individual SOPs may be marked internal / client-facing / both)

### SOP Format Standard (OPS-03)

Every SOP must include: Owner, Last updated, Version, Purpose, Scope, Tools and inputs,
Step-by-step procedure, Outputs and success criteria, Version history.

### Active SOPs (as of 2026-06-10)

| SOP ID | Title | Classification |
|---|---|---|
| SOP-OPS-005 | Naming Conventions and Identifier Control | Internal |
| SOP-OPS-006 | GDrive Sync on Update | Internal |
| SOP-CUL-001 | Servant Leadership and Agency Values | Internal |

See `sop-manual-index.md` for the full list including candidates and deprecated entries.

### SOP Principles

- Use existing systems first; write SOPs from real work, not theory
- Keep SOPs short; link, do not duplicate
- Mark each SOP as internal, client-facing, or both
- Record all changes in `change-control-register.md`
- Review quarterly

### Maintenance trigger

Promote a process to SOP status when it has been run successfully at least twice and the
steps are stable. Log the promotion in the change control register.

---

## 6. Tools, Accounts, And Relationships

**Description:** Operational registry of tools, platform accounts, vendors, and
relationships that are load-bearing for the agency. Captures what the tool is, why it is
kept or removed, and what it is used for. Not a credentials store — credentials live in
approved vaults only (see [Section 8](#8-secret-and-credential-handling)).

**Source of truth:** This section (pending migration to a dedicated registry app when V1
tooling decision is made)

**Owner:** OPS
**Last reviewed:** 2026-06-10
**Status:** Active — manual log; registry app selection pending
**Classification:** Internal (account names and purposes are safe; credentials are never logged here)

### Tool Decision Log

#### Markitdown

**Date:** 2026-06-09
**Status:** LOGGED AS ASSET — Keep

Markitdown (`markitdown[all]`) was accidentally installed during a Bootstrapper.ai session
(Zenii plugin prompted the install; Zenii itself was out of credits and did not connect).
The install was unintentional but the package is useful and costs nothing to run locally.

**What it does:** Microsoft open-source Python tool (143k GitHub stars as of 2026-06) that
converts documents to Markdown. The `[all]` variant supports:
PDF, Word (.docx), Excel (.xlsx), PowerPoint (.pptx), images (EXIF + OCR), audio
(wav/mp3 transcription), HTML, CSV, JSON, XML, YouTube URLs, ZIP archives.

**Usage:**
```
markitdown path-to-file.pdf > document.md
```
```python
from markitdown import MarkItDown
md = MarkItDown()
result = md.convert("file.pdf")
print(result.text_content)
```

**Why kept:** URC is document-heavy. Converting client PDFs, Word docs, and decks to clean
Markdown enables any Claude workflow to ingest them without preprocessing friction. No
credentials required for basic local use.

**Next use opportunity:** When a client sends a PDF, Word doc, or PowerPoint as part of
onboarding or project handoff, run it through `markitdown` first to get a Markdown version
that can be piped into any agent workflow.

---

### Platform Account Registry

Record accounts here when they become operationally load-bearing. Do not record credentials
— use the vaults defined in Section 8.

| Platform | Purpose | Track | Account owner | Status |
|---|---|---|---|---|
| GitHub | Source control — Agent Lab | Internal | Robert | Active |
| Vercel | Deployment — Agent Lab | Internal | Robert | Active |
| Stripe | Payments — book + future offers | Both | Robert | Active |
| HubSpot | CRM / contact capture | Both | Robert | Active |
| n8n | Automation credentials vault + workflows | Internal | Robert | Active |
| Zapier | Automation (free tier — at limit) | Internal | Robert | Review needed |
| Make | Automation (free tier — at limit) | Internal | Robert | Review needed |
| Apollo | Lead generation (free tier — at limit) | SAL | Robert | Review needed |
| Bootstrapper.ai | Independence Chapter community | MKT/CUL | Robert | Active |
| Postman | API testing + credential vault | Internal | Robert | Active |
| Microsoft 365 | Office backbone (preferred) | Internal | Robert | Active |
| KNIME | Data / analytics sandbox | Internal | Robert | Evaluation |

---

## 7. Finance Control Layer

**Description:** Controls for financial tracking, SKU definitions, account mapping, export
rules, and the bridge-period budget constraints. Does not contain account balances,
transaction data, or raw export files. Links only to tracker metadata and sanitized
documentation.

**Source of truth:** Owned financial trackers (location: approved internal storage per
`SOP-OPS-005` naming conventions)
**Supporting doc:** `docs/operations/SOP-OPS-005-naming-conventions-and-identifier-control.md`
**Bootstrap threshold:** `docs/operations/bootstrap-limit-threshold.md`

**Owner:** Robert T. McCarthy / FIN
**Workflow IDs:** FIN-01 through FIN-05
**Last reviewed:** 2026-06-10
**Status:** Active — bridge period rules in effect
**Classification:** Internal — no values, balances, or transaction records in this document

### Bridge Period Rules

URC is in a bootstrap phase. The following constraints are in effect until a formal finance
platform decision is made:

- All revenue and expenses tracked in owned spreadsheets per naming conventions in SOP-OPS-005
- Free-tier tools used where available; paid upgrades require a documented decision entry in this manual
- No financial data in Git commits, Markdown files, screenshots, or agent chat
- Finance exports stored only in approved internal storage, not in the repo
- Refer to `bootstrap-limit-threshold.md` for hard-stop thresholds on tool spend

### SKU Registry

| SKU | Offer | Price | Platform | Status |
|---|---|---|---|---|
| BGW-BOOK-001 | Bootstrapper's Guide to the World | $59.99 | Stripe (one-time) | Active |
| URC-BOOTCAMP-001 | $1 Bootcamp | $1.00 | TBD | Candidate |
| URC-OS-001 | Ownable OS (monthly continuity) | $500/mo | TBD | Candidate |

> Note: Stripe Price IDs are server-side only. They are not stored in this document.
> See [Section 8](#8-secret-and-credential-handling) for the credential handling rule.

### Maintenance trigger

Update the SKU registry when a new offer goes live or changes price. Log the change in
`change-control-register.md`.

---

## 8. Secret And Credential Handling

**Description:** The agency-wide rule for where secrets live, where they must never go,
and how agents are authorized to interact with credential-adjacent information. This
section is mandatory reading before any agent or operator touches a credential, token,
key, or backup code.

**Source of truth:** `docs/operations/secret-handling-standard.md`

**Owner:** Robert T. McCarthy / OPS
**Last reviewed:** 2026-06-10
**Status:** Active — v0 standard; non-negotiable
**Classification:** Internal — this section describes the rules; it contains no secret values

### Non-Negotiable Rules

1. **No values in Markdown, Git, commits, screenshots, chat, issue comments, or any public
   or private document.** This includes this Owner's Manual.
2. **No printing credential values to a terminal.**
3. **No raw `.env`, `.Keys`, or credential export files in the repo.**
4. **No secret values passed as inline arguments in agent prompts or task descriptions.**

### Approved Vaults

Store all credential values in exactly one of the following:

| Vault | Used for |
|---|---|
| Postman Vault | API keys used in Postman collections |
| n8n credentials store | Credentials used inside n8n automation workflows |
| Password manager | Account passwords, recovery codes, backup codes |
| Environment variables (`.env`) | Runtime secrets — `.env` is gitignored, never committed |

If a credential type does not fit one of these, document the vault selection decision here
before storing it anywhere.

### What Agents May Do

Agents operating under this standard are authorized to:
- List filenames and classify credential types using filenames, surrounding documentation,
  and redacted metadata
- Describe which vault a credential should live in
- Confirm whether a credential is present or absent by referencing metadata

Agents are **not** authorized to:
- Read, print, copy, or relay secret values
- Generate backup codes or recovery tokens
- Move credentials between vaults without an explicit logged decision

### Maintenance trigger

Update `secret-handling-standard.md` and log in `change-control-register.md` whenever a
new vault type is approved or a credential category changes handling rules.

---

## 9. Publishing And Products

**Description:** Registry of published and in-development products — books, blueprints,
courses, workflow packages, and compendiums. Tracks what exists, what is in progress, and
where the source files live.

**Source of truth:** `docs/operations/startup-operational-excellence-book-control.md`

**Owner:** Robert T. McCarthy / MKT
**Workflow IDs:** MKT-related (see workflow registry)
**Last reviewed:** 2026-06-10
**Status:** Active — book live; other products at candidate stage
**Classification:** Product titles and descriptions are public; internal pricing strategy and affiliate terms are not

### Product Registry

| Product | Type | Status | Price | Channel |
|---|---|---|---|---|
| Bootstrapper's Guide to the World | Book (digital) | Live | $59.99 | Agent Lab / Stripe |
| Ownable OS | Workflow package / continuity | Candidate | $500/mo | TBD |
| $1 Bootcamp | Entry-level program | Candidate | $1 | TBD |
| Workflow blueprints / compendiums | Document products | Candidate | TBD | TBD |

### Publishing Standards

- All product source files tracked in Git or approved internal storage
- Pricing changes require a logged decision in `change-control-register.md`
- Affiliate and partner terms are internal — not documented in this file
- Public product descriptions follow the Public Tour Guide rules in [Section 12](#12-public-tour-guide-layer)

### Maintenance trigger

Add a product entry here when it moves from idea to candidate. Update status when it
goes live, changes price, or is deprecated.

---

## 10. Infrastructure And Sandboxes

**Description:** Documents the technical infrastructure that runs or supports the agency —
hosting, sandboxes, data tools, dev environments, and platform candidates. Describes what
each piece does and its current status. Does not contain access credentials.

**Source of truth:** `docs/operations/urc-v1-operating-architecture.md`
**Bootstrap threshold:** `docs/operations/bootstrap-limit-threshold.md`

**Owner:** Robert T. McCarthy / OPS
**Last reviewed:** 2026-06-10
**Status:** Active — bootstrap infrastructure; formal platform decisions pending
**Classification:** Infrastructure names and purposes are internal; no credentials here

### Current Infrastructure Map

| Layer | Tool / Platform | Purpose | Status |
|---|---|---|---|
| Source control | GitHub | Agent Lab codebase; ops docs | Active |
| Deployment | Vercel | Agent Lab frontend + API | Active |
| Runtime | Node.js / TypeScript (tRPC) | Agent Lab server | Active |
| Database | SQLite (dev) | Local dev only; production DB TBD | Dev only |
| Payments | Stripe | Checkout sessions; webhooks | Active |
| Automation | n8n | Workflow automation; credential vault | Active |
| Analytics sandbox | KNIME | Data analysis — no production dependency | Evaluation |
| VPS / cloud | TBD | Server hosting evaluation candidate | Candidate |
| CRM | HubSpot | Contact capture and pipeline | Active |
| Office suite | Microsoft 365 | Preferred backbone | Active |

### Sandbox Rules

- Sandboxes are isolated from production data
- KNIME and any other analytical tooling run on local or isolated instances only
- No client data enters a sandbox without an explicit logged decision
- Sandbox evaluations are logged in `change-control-register.md` before a tool moves to production

### Maintenance trigger

Update this section when a platform moves from evaluation to trial, or from trial to
production. Log the transition in `change-control-register.md`.

---

## 11. Evidence, Audits, And Change Control

**Description:** How decisions, tests, compliance evidence, and operational changes are
captured. This is the audit layer — it keeps the agency accountable to its own standards
and makes change history reconstructible.

**Source of truth:** `docs/operations/change-control-register.md`
**Scheduled changes:** `docs/operations/scheduled-change-queue.md`

**Owner:** OPS
**Last reviewed:** 2026-06-10
**Status:** Active — register started 2026-05-07
**Classification:** Internal

### What Gets Logged

Log an entry in `change-control-register.md` when changing any of the following:

- Kit manifests
- Workflow source files
- Agent prompts
- Tracker schemas
- Operating architecture docs
- CRM-lite, finance, or funnel control files
- SOP promotions to active
- Platform transitions (evaluation → trial → production)
- Offer pricing changes
- Vault or credential handling rule changes

### Log Entry Standard

Each entry must include: date, what changed, why it changed, who made the change, and
any rollback steps if applicable.

### Security Audit Trail

For security-related changes (secrets, credentials, access controls, auth flows), an
entry in the change control register is mandatory — not optional. Security fixes are
logged with the change type flagged as `security`.

### Maintenance trigger

The register is always active. No action needed to activate it — just log entries as
changes happen.

---

## 12. Public Tour Guide Layer

**Description:** Defines what can be shown publicly and what must remain private. Every
piece of content, documentation, or demo that leaves the internal workspace must be
checked against this section. This applies to demos, screenshots, recordings, LinkedIn
posts, client proposals, and any public-facing agent or bot.

**Source of truth:** `docs/operations/public-values-placement-guide.md`
**Supporting constraint:** `docs/operations/secret-handling-standard.md`

**Owner:** Robert T. McCarthy / MKT + OPS
**Last reviewed:** 2026-06-10
**Status:** Candidate — public tour guide functionality is not yet live; rules are active
**Classification:** This section itself is internal; the rules it enforces protect public-facing content

### Hard Stop — Never Show Publicly

The following must never appear in any public-facing content, demo, screenshot, recording,
or agent output:

- Secret values, API keys, backup codes, OAuth tokens, service-account JSON
- Raw `.env` files or credential file contents
- Client files, client names (without explicit permission), or private prospect data
- Unredacted finance records, revenue figures, or transaction data
- Private partner, vendor, or affiliate terms and pricing
- Personal account details (personal email, home address, phone)
- Internal recovery paths, admin URLs, or internal routing logic

### Safe to Show Publicly

- Product names, offer descriptions, and public pricing (as listed in Section 9)
- Business entity names (URC, Tactix, Bootstrapper Capital, Agent Lab)
- The existence and purpose of workflows — not their internal logic or credentials
- Published content on bootstrapper.ai, Agent Lab, or the book
- Anonymized or aggregated operational metrics (not raw transaction data)
- Sanitized architecture diagrams that do not expose infrastructure credentials or access paths

### Content Classification Checklist

Before publishing any content, confirm:

1. No credential, key, token, or backup code is visible in any screenshot or recording
2. No client name or private prospect data is included unless explicitly approved
3. Finance figures are either public (list prices) or omitted
4. Any workflow diagram shows function and purpose only — not endpoint URLs, auth headers, or credential references
5. The public-values-placement-guide has been consulted for edge cases

### Maintenance trigger

Update this section and `public-values-placement-guide.md` whenever a new content type
is approved for public use, or whenever a previously public piece of content is reclassified
as internal.

---

## Appendix: Maintenance Trigger Index

Quick reference for what causes this document to need an update.

| Trigger | Section(s) to update |
|---|---|
| New workflow goes active | Section 4 + `workflow-registry.md` + change log |
| Tracker or dashboard becomes source of truth | Section 7 + change log |
| Tool or platform account becomes load-bearing | Section 6 + change log |
| Tool removed or deprecated | Section 6 (update status) + change log |
| SOP promoted to active | Section 5 + `sop-manual-index.md` + change log |
| Platform moves from evaluation to production | Section 10 + change log |
| Finance or secret handling rule changes | Section 7 or 8 + `secret-handling-standard.md` + change log |
| New product goes live or changes price | Section 9 + change log |
| Public-facing content classification changes | Section 12 + `public-values-placement-guide.md` |
| Offer pricing changes | Section 3 (current priorities) + Section 9 + change log |
| Robert cannot find something | Add a link or entry to the appropriate section |

---

*End of Agency Owner's Manual v0.2*
