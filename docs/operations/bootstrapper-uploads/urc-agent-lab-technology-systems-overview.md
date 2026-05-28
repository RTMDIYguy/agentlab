# URC / Agent Lab Technology And Systems Overview

Date prepared: 2026-05-24
Status: Presentable v1
Owner: Robert T. McCarthy
Applies to: Uncle Robert Consulting, Agent Lab, Tactix, Bootstrapper Capital, and Bootstrapper's Guide to the World

## Purpose

This overview explains the current technology and systems architecture used to run URC / Agent Lab, support lead generation, manage workflow packages, and move founder-facing offers toward market.

The system is intentionally lightweight. Each tool should have one clear job, and low-cost or free operating paths are preferred until revenue justifies deeper automation.

## System Principle

Use one system per job.

URC / Agent Lab avoids tool sprawl by assigning each major system a specific role. When a paid platform is unavailable or not yet worth the cost, the business uses local files, spreadsheets, Gmail, Reach, GitHub, or other low-cost bridges until the final operating layer is justified.

## Business And Brand Roles

Uncle Robert Consulting:

- main business entity
- consulting, advisory, implementation, retainers, client relationships, invoicing ownership, IP, playbooks, and delivery standards

Agent Lab:

- market-facing workflow and AI systems layer
- workflow packaging, beta products, automation assets, and site-facing offers

Tactix:

- fulfillment and Upwork-facing execution arm
- scoped delivery, talent bench coordination, and implementation support

Bootstrapper Capital:

- audience, founder community, events, roundtables, and conversion funnel

Bootstrapper's Guide to the World:

- authority and trust asset
- supports content, founder conversations, events, workshops, and advisory offers

## Current System Map

| System Area | Primary Tool Or Layer | Purpose | Current Note |
| --- | --- | --- | --- |
| Public website | B12-hosted Agent Lab site | Marketing pages, product pages, blog, beta requests, account surfaces | Active public site at `https://agent-lab.tech` |
| SaaS beta backend | Supabase | Authentication, database, Edge Functions, blog/admin functions, future beta app data | Active for blog submission/admin functions; publishing path has a known schema blocker |
| Payments | Stripe | Planned subscription and checkout layer for SaaS beta offers | Planned for Founder Signal System beta |
| Core files and documents | OneDrive / local Working Docs | Business source files, SOPs, workflow packages, evidence, operating docs | Active workspace root is `Working Docs` |
| Office backbone | Microsoft 365 | Preferred future operating backbone for email, calendar, Teams, Word, Excel, PowerPoint, Forms, Lists | Paid access is not assumed; use free/local bridges when needed |
| Finance | Frappe | Invoices, payment tracking, customer billing records, receivables visibility | Finance system of record |
| Dashboard layer | Notion | Lightweight dashboard and index only | Not the archive or main SOP repository |
| Automation | n8n | Local/prototype workflow automation and connector testing | Active for LinkedIn Authority proof lanes and workflow certification work |
| Lead research | Apollo, LinkedIn, referrals, website requests, events | Lead source discovery and qualification | Human review before outreach |
| Outreach | Gmail, Reach, LinkedIn, manual review | Prospect communication and follow-up | Manual approval required before external sends |
| CRM-lite | Microsoft List, Excel, Google Sheet, or repo-tracked tracker | Lead name, company, source, offer interest, stage, next action, owner, follow-up date | Keep lightweight until volume justifies CRM expansion |
| Workflow packages | GitHub repo and local workflow folders | Source of truth for workflow documentation, kits, assets, change logs, and packaging | Active in `agent-lab-site/workflows` |
| Evidence and audits | Compliance Audits folder | Cross-workflow proof, test results, readiness notes, compliance logs | Use unless evidence must stay beside a local artifact |
| Community and funnel | Bootstrapper.ai / Ownable OS, Bootstrapper Capital | Founder chapter, sprints, ProfitFlows, governance cadence, and workflow operating model | Active setup underway |

## Lead Generation Flow

The current lead-generation system supports this sequence:

1. Content creates awareness.
2. A call to action points to a founder conversation, roundtable, diagnostic, beta request, or book-related next step.
3. Leads are captured from Apollo, LinkedIn, referrals, website requests, events, book interest, or Bootstrapper Capital activity.
4. Leads are verified before outreach.
5. Personalized outreach is drafted and human-reviewed.
6. Replies and signals are logged.
7. Qualified leads move to a founder conversation, diagnostic, workshop, continuity offer, or consulting path.
8. Outcomes are recorded in CRM-lite.

## Website And SaaS Direction

The site is moving from a static marketing presence toward a workflow product front door.

Current product direction:

- Founder Signal System beta
- beta price target: $97/month
- front-end promise: simplify the tools founders already have
- back-end strategy: migrate the right businesses into Ownable OS and deeper URC / Agent Lab workflows

Near-term SaaS scope:

- request beta access
- account surface
- founder signal workflow positioning
- manual approval before publishing or outreach
- Stripe checkout later
- Supabase authentication, database, and Edge Functions as the app backend

Scope intentionally deferred:

- full automated LinkedIn posting
- full social analytics
- complex subscription tiers
- paid-tool-heavy workflow dependencies
- replacing CRM-lite before volume requires it

## Automation Posture

Automation is used to prepare, structure, test, and reduce manual drag. It does not replace human approval over trust-sensitive actions.

Automation may:

- intake structured data
- prepare drafts
- validate required fields
- update trackers
- prepare publishing records
- create review packets
- run proof and certification checks
- summarize next actions

Automation may not independently:

- send prospect outreach
- publish public content
- change prices
- move money
- change account access
- make client commitments
- alter authoritative records without approval

## Data And Record Ownership

System-of-record rules:

- Finance records live in Frappe.
- SOPs and operating docs live in local / OneDrive documents and the repo.
- Workflow package source lives in the repo under `workflows`.
- Public site content lives on the B12-hosted site and should be reflected in change-control when meaningful.
- Blog and beta app data live in Supabase where implemented.
- Lead status lives in CRM-lite until a heavier CRM becomes justified.
- Evidence logs live in Compliance Audits unless they must stay local to an artifact.

## Current Known Constraints

- Paid Microsoft 365 access should not be assumed available.
- Supabase publishing is partially implemented, but approved blog auto-publishing is blocked by a database schema mismatch around `approved_at`.
- LinkedIn auto-publishing should remain a later phase until credentials, API permissions, and manual fallback are confirmed.
- Notion should stay lightweight because it is not the main archive.
- New paid tools should be justified by clear revenue, time savings, or operational leverage.

## Review Cadence

Weekly:

- pipeline
- content
- leads
- fulfillment
- finance and KPIs

Monthly:

- revenue
- tool spend
- offer ladder
- conversion movement

Quarterly:

- SOP review
- workflow package readiness
- certification progress
- platform and tool fit

Annually:

- mission
- vision
- brand hierarchy
- operating architecture
- major system decisions

## Success Criteria

The technology and systems architecture is working when:

- each tool has one clear job
- leads can be captured, followed up, and reviewed
- finance status is visible
- workflow packages can be tested, certified, and taken to market
- public publishing has approval control
- data is preserved
- automation reduces drag without creating hidden risk
- the system can be explained to a new human or agent without relying on memory

## Source Documents

- `C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\WORKSPACE-STANDARD.md`
- `docs/operations/urc-v1-operating-architecture.md`
- `docs/operations/urc-agent-execution-checklist.md`
- `docs/operations/sop-manual-index.md`
- `docs/operations/change-control-register.md`
- `docs/operations/scheduled-change-queue.md`
