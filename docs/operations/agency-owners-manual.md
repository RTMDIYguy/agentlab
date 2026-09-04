---
document_id: DOC-AGENCY-OWNERS-MANUAL
title: "Agency Owner's Manual"
document_type: operating_manual
authority_level: operational
status: active
owner: "Robert T. McCarthy / OPS"
canonical_sources:
  - governance/registry/
last_reviewed: 2026-09-03
next_review: 2026-10-03
version: "v1.0"
---

# Agency Owner's Manual

**Owner:** Robert T. McCarthy / Uncle Robert Consulting LLC
**Date Created:** 2026-06-09
**Last Structural Update:** 2026-09-03
**Version:** v1.0 — Canonical repo-native Owner's Manual featuring fullstack SaaS architecture, autonomous swarm agents, Colab sessions Python SDK, Bootstrapper.ai & Ownable OS daily routine, and registered collaborator access control
**Purpose:** Operational reference for running the URC family of businesses. Covers business orientation, workflows, tools, SOPs, finance controls, secret handling, products, infrastructure, and change control in one navigable document.

> **SECURITY CONSTRAINT (permanent):** This document must never contain secret values,
> credential strings, backup codes, OAuth tokens, service-account JSON, client PII, or
> unredacted finance records. Link only to approved metadata, vault instructions, or
> sanitized evidence. See [Section 8](#8-secret-and-credential-handling) for the full rule.

---

## How To Use This Document

This is the owner's manual — not the architecture deck, not the SOP library, not the
strategy doc. Read it when you want to know where the controls are, why a decision was
made, or how to orient a new agent, collaborator, or operator.

- **New to the business?** Start at [Section 1](#1-start-here), then read [Section 2](#2-business-map).
- **Running a workflow?** Go to [Section 4](#4-workflow-map), then [Section 5](#5-sop-library).
- **Handling money or accounts?** [Section 7](#7-finance-control-layer).
- **Handling a credential or secret?** [Section 8](#8-secret-and-credential-handling) — mandatory before acting.
- **Something changed?** Log it in [Section 11](#11-evidence-audits-and-change-control).
- **Showing something publicly?** Check [Section 12](#12-public-tour-guide-layer) first.

---

## 1. Start Here

**Description:** Orientation layer. Answers "where is everything?" for a new human, agent, or returning collaborator. Keeps the most important operating rules visible without requiring a deep dive.

**Source of truth:** `docs/operations/agency-operating-manual.md`

**Supporting docs:**

- `docs/operations/urc-agent-execution-checklist.md` — rules every agent must follow before acting
- `docs/operations/urc-v1-operating-architecture.md` — business structure and platform decisions
- `docs/operations/urc-90-day-implementation-plan.md` — current execution horizon
- `docs/operations/bootstrapper-ai-operating-field-guide.md` — daily & weekly operating rhythm

**Owner:** Robert T. McCarthy / OPS
**Last reviewed:** 2026-09-03
**Status:** Active
**Classification:** Public-facing (no sensitive content in this section)

### Operating Principle

The agency should be built so a capable operator can get in and drive it. That means one obvious starting point, named business lanes, visible source-of-truth locations, clear workflow ownership, a small number of live offers, documented manual fallbacks, and SOPs written from real work, not theory.

### Authorized Repository Collaborators

In accordance with repository governance, only registered and authorized collaborators may clone, download, or execute this codebase:

| Name | Organization & Role | Email / Access Identity | Role / Permissions | Status |
|---|---|---|---|---|
| **Robert T. McCarthy** | Uncle Robert Consulting LLC / Principal | `robert@unclerobertconsulting.com` | Owner & Admin | Active |
| **Sheena Burns** | Uncle Robert Consulting LLC / Co-Founder | `burnssheena335@gmail.com` | Co-Founder & Admin | Active |
| **Lorenzo** | NWN Advisory / Strategic Partner | `lorenzo@nwnadvisory.com` | Registered Collaborator | Active |
| **Chris** | Bootstrapper Capital / Community Director | `chris@bootstrappercapital.com` | Registered Collaborator | Active |
| **Mahmudul Haison** | AgentLab & Tactix / Remote Tech Specialist | `mahmudhaisan@gmail.com` | Technical Collaborator | Active |
| **Eileen Prudhont** | Strategic Collaborator & Partner | `eileenprudhont@gmail.com` | Registered Collaborator | Active |

### AI Session Lessons

#### The 90% Context Rule

**Date logged:** 2026-06-09

Do not close an AI session at 90% of context capacity assuming you can pick back up cleanly. AI sessions are stateless across context boundaries. The next session opens cold with no memory of what was done unless you explicitly pass a handoff prompt.

**What to do instead:**

1. Before the session runs out, write a handoff prompt describing what was accomplished, what is in progress, which files were created or changed, and what the next action is.
2. Save that handoff prompt in `docs/operations/session-handoff-YYYY-MM-DD.md` or git commit logs.
3. Use the remaining session to reach a clean stopping point.
4. Open the next session with the handoff prompt as the first message.

**The rule:** Use the whole session. Just make sure the handoff prompt is written before it runs out — not after.

---

## 2. Business Map

**Description:** Defines the legal and operational entities, their roles, how they relate
to each other, and what each one owns. The source of truth for "which entity does what."

**Source of truth:** `docs/operations/urc-v1-operating-architecture.md`

**Owner:** Robert T. McCarthy / OPS
**Last reviewed:** 2026-09-03
**Status:** Active — v1.0 canonical architecture registered in `governance/registry/`
**Classification:** Public-safe summary; full architecture doc is internal

### Entities

| Entity | Role | Notes |
|---|---|---|
| **Uncle Robert Consulting LLC (URC)** | Main operating entity. Consulting, advisory, IP ownership, client invoicing. | All client contracts run through URC. |
| **Tactix** | Execution pod. Upwork-facing delivery arm. | Handles billable project work; keeps client-facing delivery separate from URC brand. |
| **Bootstrapper Capital** | Audience, community, and funnel. Roundtables, bootcamps, continuity programs. | Independence Chapter on Bootstrapper.ai. Feeds URC pipeline. |
| **Agent Lab** | Core SaaS platform & DAG orchestrator. Powers multi-agent execution & client workspaces. | Live at https://agent-lab.tech. Canonical specifications in `governance/registry/`. |
| **Bootstrapper's Guide to the World (book)** | Authority and conversion asset. 28 bootstrapped business models, $59.99. | Listed in Agent Lab & Gumroad. Feeds Bootstrapper Capital funnel. |
| **Startup Operational Excellence (book)** | Authority and conversion asset. Practical operational doctrine, $19.99. | Digital book perk included in beta and pro tiers. Listed on Gumroad. |
| **Pulse Social** | Multi-platform social media scheduling and real-time engagement analytics web app. | Live at https://pulse-social-agentlab-projects.vercel.app. |
| **Market Marksman** | Opportunity radar (Standard Edition + Nevada Filings Edition). | Live at https://marketmarksman.ai.studio. |
| **LeadPulse** | Lead accuracy and data enrichment engine. | Live at https://leadpulse-ai-lead-accuracy-enrichment-engine.ai.studio. |

### Canonical Offer Ladder (v1.0 LOCKED)

1. **Authority Assets:** *Startup Operational Excellence* ($19.99) & *Bootstrapper's Guide to the World* ($59.99)
2. **Community & Events:** Founder Roundtables & Independence Chapter Meetups (Free / Invite)
3. **Front-End Diagnostic Sprint:** Founder Signal System ($1,000 one-time 5-day sprint)
4. **Core Operating Continuity:** Ownable OS Advisory / Pro Membership ($500/month)
5. **Self-Serve Knowledge Playbooks:** 7-Department Workflow Kits ($149/month)

### Canonical Platform Decisions (as of 2026-09-03)

- **Office backbone:** Microsoft 365 (preferred when available; local/repo files as bootstrap bridge)
- **Project/dashboard layer:** Notion (lightweight dashboard only; canonical truth in `governance/registry/`)
- **Core SaaS Backend & Orchestrator:** Google Cloud Run containerized Node/Express API (PLAT-GCP, SVC-SERVER-API)
- **Production Database:** PostgreSQL with Drizzle ORM (PLAT-POSTGRES; Neon Serverless Postgres)
- **Frontend & Edge Hosting:** Vercel (React 19 / Vite SPA) & Cloud Run
- **Payments & Subscriptions:** Stripe (PLAT-STRIPE) + Gumroad
- **Email Delivery:** Resend SMTP (`unclerobertconsulting.com` verified domain)
- **Automation:** Native Agent Lab DAG Engine + self-hosted n8n workflows
- **CRM:** Bootstrapper.ai CRM & HubSpot Free Sales CRM (live 2-way sync with CRM-Lite via Google Sheets ADC & n8n)
- **Testing Engine:** Autonoma (`@autonoma-ai/sdk` for automated E2E synthetic testing)
- **Application Security:** Aikido Security (continuous code, CVE, and secret scanning)
- **Documentation Surface:** Mintlify (`docs/`) generated/derived from canonical registry
- **Mobile & Roaming Bridge:** AI Studio ingestion bridge (`/api/aistudio`)
- **Python Developer SDK:** Official `agentlab-sdk` (`sdk/python/`)

---

## 3. Current Priorities

**Description:** Live execution horizon. What is being worked on this week and this quarter.
Updated when priorities shift, not on a fixed schedule.

**Source of truth:** `docs/operations/urc-90-day-implementation-plan.md`
**Supporting doc:** `docs/operations/agency-operating-manual.md` (operating tracks section)

**Owner:** Robert T. McCarthy / OPS
**Workflow IDs:** OPS-01, OPS-02 (planning and execution tracks)
**Last reviewed:** 2026-08-20
**Status:** Active — review weekly
**Classification:** Internal

### Active Tracks (2026-08-20)

**Track 1 — Agent Lab & UI Modernization (technical)**

- AgentLab UI Phase 1 & 2 redesign: Startup Operational Excellence (SOE) design tokens in `index.css`, UI primitive component refactoring (`button.tsx`, `card.tsx`, `input.tsx`), and standalone prototype in `output/agentlab-ui/`.
- Autonoma automated end-to-end UI testing integration and webhook stability.
- Postman API workspace sync: local collection exports (`postman/collections/`) and environment synchronization with `.postman/resources.yaml`.

**Track 2 — Sales Automation & Partnerships (business & automation)**

- n8n SDR CRM-Lite to HubSpot pipeline: active 2-way deal/contact sync.
- CRM Ecosystem Architecture: Implemented a master `Lead / Campaign Source` custom property on Deals. Enables single-pipeline tagging for AgentLab roundtables, app betas, signal systems, URC, and Hamarashops partnership leads, bypassing the HubSpot free tier 1-pipeline limit.
- MKT-02 Automated Nurture Engine: daily CRON query to HubSpot, Resend SMTP 3-touch sending loop with strict stop-conditions.
- Virtusa / Dheerendar Partnership: Walkthrough successful. Executing revenue-share cross-promotion (MedLM for doctors, Founder Signal System for India B2B). Outreach strategy mapped.

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

| Code | Department             |
| ---- | ---------------------- |
| OPS  | Operations             |
| CUL  | Culture / People       |
| FIN  | Finance                |
| SAL  | Sales                  |
| MKT  | Marketing              |
| HR   | Human Resources        |
| DEL  | Delivery / Client Work |

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

| SOP ID      | Title                                     | Classification |
| ----------- | ----------------------------------------- | -------------- |
| SOP-OPS-005 | Naming Conventions and Identifier Control | Internal       |
| SOP-OPS-006 | GDrive Sync on Update                     | Internal       |
| SOP-CUL-001 | Servant Leadership and Agency Values      | Internal       |

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

| Platform        | Purpose                                            | Track    | Account owner | Status        |
| --------------- | -------------------------------------------------- | -------- | ------------- | ------------- |
| GitHub          | Source control — Agent Lab & Pulse Social          | Internal | Robert        | Active        |
| Vercel          | Deployment — Agent Lab & Pulse Social frontends    | Internal | Robert        | Active        |
| Google Cloud    | Cloud Run — Pulse Social FastAPI backend           | Internal | Robert        | Active        |
| MongoDB Atlas   | Cloud database — Pulse Social data storage         | Internal | Robert        | Active        |
| Stripe          | Payments — book + future offers                    | Both     | Robert        | Active        |
| Gumroad         | Product landing pages & sales — SOE & BGW          | Both     | Robert        | Active        |
| Resend          | Transactional & automated email delivery (SMTP)    | Both     | Robert        | Active        |
| HubSpot         | CRM — contacts & deals pipeline via SDR sync       | Both     | Robert        | Active        |
| n8n             | Automation credentials vault, MCP server & flows   | Internal | Robert        | Active        |
| Autonoma        | Automated end-to-end UI testing suite              | Internal | Robert        | Active        |
| Postman Desktop | API collection exports, environment sync & testing | Internal | Robert        | Active        |
| Bootstrapper.ai | Independence Chapter community                     | MKT/CUL  | Robert        | Active        |
| Microsoft 365   | Office backbone (preferred)                        | Internal | Robert        | Active        |
| Zapier          | Automation (free tier — at limit)                  | Internal | Robert        | Review needed |
| Make            | Automation (free tier — at limit)                  | Internal | Robert        | Review needed |
| Apollo          | Lead generation (free tier — at limit)             | SAL      | Robert        | Review needed |

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

| SKU              | Offer                             | Price   | Platform          | Status    |
| ---------------- | --------------------------------- | ------- | ----------------- | --------- |
| BGW-BOOK-001     | Bootstrapper's Guide to the World | $59.99  | Stripe (one-time) | Active    |
| URC-BOOTCAMP-001 | $1 Bootcamp                       | $1.00   | TBD               | Candidate |
| URC-OS-001       | Ownable OS (monthly continuity)   | $500/mo | TBD               | Candidate |

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

| Vault                          | Used for                                                |
| ------------------------------ | ------------------------------------------------------- |
| Postman Vault                  | API keys used in Postman collections                    |
| n8n credentials store          | Credentials used inside n8n automation workflows        |
| Password manager               | Account passwords, recovery codes, backup codes         |
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

| Product                           | Type                          | Status    | Price    | Channel                            |
| --------------------------------- | ----------------------------- | --------- | -------- | ---------------------------------- |
| Bootstrapper's Guide to the World | Book (digital)                | Live      | $59.99   | Agent Lab / Stripe / Gumroad       |
| Startup Operational Excellence    | Book / Custom Landing Page    | Live      | TBD      | Gumroad (`landing_soe.html`)       |
| Pulse Social                      | Social media scheduler webapp | Live      | SaaS     | Vercel / Cloud Run / MongoDB       |
| Hamarashops.ai Partnership        | Healthcare MedLM Outreach     | Active    | RevShare | Targeted Medical Lead Generation   |
| Virtusa / Dheerendar Walkthrough  | Demo & Evaluation Package     | Active    | B2B      | Mutual NDA / Live Tech Walkthrough |
| Ownable OS                        | Workflow package / continuity | Candidate | $500/mo  | TBD                                |
| $1 Bootcamp                       | Entry-level program           | Candidate | $1       | TBD                                |
| Workflow blueprints / compendiums | Document products             | Candidate | TBD      | TBD                                |

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
**Last reviewed:** 2026-08-28
**Status:** Active — production infrastructure; canonical platforms registered in `governance/registry/platforms.yaml`
**Classification:** Infrastructure names and purposes are internal; no credentials here

### Current Infrastructure Map

| Layer                  | Tool / Platform                | Purpose                                                 | Status     | Canonical Reference        |
| ---------------------- | ------------------------------ | ------------------------------------------------------- | ---------- | -------------------------- |
| Source control         | GitHub                         | Agent Lab codebase; ops docs                            | Active     | PLAT-GITHUB                |
| Frontend Edge          | Vercel                         | React 19 / Vite frontend delivery                       | Active     | PLAT-VERCEL                |
| Cloud Compute Backend  | Google Cloud Run               | Node/Express API & DAG Orchestrator (`https://agentlab-718497644379.us-central1.run.app/dashboard`) | Active     | PLAT-GCP                   |
| Production Database    | PostgreSQL (Drizzle ORM)       | Multi-tenant workspaces, RLS, audit logs                | Active     | PLAT-POSTGRES              |
| Email Sending          | Resend SMTP                    | Automated MKT-02 nurture sends                          | Active     | PLAT-RESEND                |
| Payments & Metering    | Stripe & Gumroad               | Subscriptions, marketplace packages, landing checkouts  | Active     | PLAT-STRIPE                |
| Automation Engine      | Native DAG + n8n               | Multi-agent workflow execution; external integrations   | Active     | SVC-ORCHESTRATOR           |
| Testing Suite          | Autonoma                       | Automated UI test runner & synthetic factory seeding    | Active     | PLAT-AUTONOMA              |
| Application Security   | Aikido Security                | Continuous CVE, dependency, and secret scanning         | Active     | PLAT-AIKIDO                |
| CRM                    | HubSpot Free                   | Contact capture and 2-way deal pipeline                 | Active     | PLAT-HUBSPOT               |
| Office suite           | Microsoft 365                  | Preferred document backbone                             | Active     | PLAT-M365                  |
| Documentation Surface  | Mintlify                       | Public developer & client documentation portal          | Active     | PLAT-MINTLIFY              |
| Domain Registrar & DNS | Ionos                          | DNS for `agent-lab.tech` (marketing) & `agent-lab.me` (podcast studio) | Active | PLAT-IONOS         |
| Marketing Website CMS  | B12                            | Marketing website design and content engine (`agent-lab.tech`) | Active | PLAT-B12              |
| Analytics sandbox      | KNIME                          | Data exploration — isolated; no production dependency   | Evaluation | PLAT-KNIME                 |

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

| Trigger                                       | Section(s) to update                                        |
| --------------------------------------------- | ----------------------------------------------------------- |
| New workflow goes active                      | Section 4 + `workflow-registry.md` + change log             |
| Tracker or dashboard becomes source of truth  | Section 7 + change log                                      |
| Tool or platform account becomes load-bearing | Section 6 + change log                                      |
| Tool removed or deprecated                    | Section 6 (update status) + change log                      |
| SOP promoted to active                        | Section 5 + `sop-manual-index.md` + change log              |
| Platform moves from evaluation to production  | Section 10 + change log                                     |
| Finance or secret handling rule changes       | Section 7 or 8 + `secret-handling-standard.md` + change log |
| New product goes live or changes price        | Section 9 + change log                                      |
| Public-facing content classification changes  | Section 12 + `public-values-placement-guide.md`             |
| Offer pricing changes                         | Section 3 (current priorities) + Section 9 + change log     |
| Robert cannot find something                  | Add a link or entry to the appropriate section              |

---

_End of Agency Owner's Manual v0.2_
