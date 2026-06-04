# URC V1 Operating Architecture

## Purpose

This document defines the v1 operating architecture for:

- Uncle Robert Consulting (`URC`)
- Tactix
- Bootstrapper Capital
- `Bootstrapper's Guide to the World`

The goal is to reduce tool sprawl, clarify brand roles, and establish one practical system that can be run consistently.

## Core Principle

Use one system per job, and distinguish the current operating backbone from
future platform candidates.

- `Microsoft 365` is the preferred office, collaboration, and document backbone
  when paid access is
  available. During free-bootstrap periods, use free Microsoft accounts, local
  files, repo-tracked CSV/Markdown, Reach, Gmail, or other free/low-cost tools
  as manual bridges without pretending they are the final operating layer.
- Owned finance trackers and dashboards are the current finance control layer
  until a replacement finance platform is chosen.
- `Notion` is a lightweight dashboard and planning layer only.
- The book is an authority and conversion asset.
- `Bootstrapper Capital` is the community and funnel layer.
- `Tactix` is the execution and Upwork-facing fulfillment arm.
- Cloud, marketplace, and SaaS infrastructure options such as Azure, Google
  Cloud, AWS, GitHub, Stripe Connect, SaaSify, the VPS, and similar platforms
  are evaluation candidates until a formal platform decision is made.

## Brand Roles

### URC

`URC` is the main business entity and operating system owner.

It is responsible for:

- consulting
- advisory
- implementation
- retainers
- client relationships
- invoicing ownership
- IP, playbooks, and delivery standards

### Tactix

`Tactix` is the execution pod and Upwork-facing delivery arm.

It is responsible for:

- freelance and agency fulfillment
- delivery capacity
- scoped implementation work
- talent bench coordination

`Tactix` should not become the main brand. Internal systems should stay under URC control.

### Bootstrapper Capital

`Bootstrapper Capital` is the audience, community, and conversion engine today.
It may also become a larger strategic layer if the Ownable OS ecosystem,
bootstrapper community, compendium series, courses, or marketplace path prove
that the community is not merely feeding URC but helping carry the operating
system itself.

It is responsible for:

- founder and business-owner gathering
- events and roundtables
- workshops and bootcamps
- continuity offers
- feeding higher-ticket consulting into URC
- collecting bootstrapper stories, lessons, and demand signals that can shape
  future compendiums, courses, playbooks, and Ownable OS requirements

### Bootstrapper's Guide to the World

The book is an authority asset first and a direct-sale product second.

Its job is to:

- establish credibility
- create trust
- seed conversations
- feed founders into events, workshops, and advisory
- serve as the first compendium in a larger bootstrapper publishing line
- provide the source spine for blueprint books, lower-priced standalone books,
  and later course products

The extracted business blueprints should be treated as started authority
products, not scraps. Their path is:

1. Separate blueprint book
2. Lower-priced entry product
3. Course or guided implementation asset
4. Contribution source for future Bootstrapper's Guide compendiums
5. Community conversation starter for bootstrapper story collection

## Tool Architecture

### Microsoft 365

Use paid `Microsoft 365` for these jobs when access is available:

- Outlook
- Calendar
- Teams
- OneDrive
- Word
- Excel
- PowerPoint
- Forms
- Lists

This is the preferred collaboration and document home.

Current constraint, added 2026-05-21:

Paid Microsoft 365 access is not assumed available because the bill could not
be maintained. Until it is restored, use free Microsoft accounts and local /
repo-tracked files as the operating bridge. Do not design workflows that
require paid Microsoft 365 features unless the workflow also has a manual or
free fallback.

### Finance Trackers And Dashboards

Frappe is no longer available. Until a replacement finance platform is chosen,
use owned finance trackers and dashboards for:

- invoices
- payment tracking
- customer billing records
- receivables visibility
- finance status snapshots
- SKU, invoice line, revenue category, and chart-of-accounts mapping

These trackers are the current finance control layer. Design them so the data
can migrate cleanly into a future accounting or finance system without
renaming every offer, SKU, invoice line, or account category.

Tracker and dashboard design rules:

- Use stable identifiers across related trackers, including workflow ID, offer
  ID, SKU, invoice ID, account code, client or project ID, and owner.
- Keep CSV/XLSX export paths available even when the active tracker is
  Markdown, JSON, Excel, Lists, or another low-cost file format.
- Keep chart-of-accounts mapping synchronized with SKU and invoice-line
  creation from the start.
- Do not build a tracker that cannot later be imported into a mature accounting
  or finance platform without major cleanup.

### Notion

Use `Notion` sparingly because of the block limit.

Keep Notion limited to:

- executive dashboard
- finance dashboard linking to the owned finance tracker/dashboard layer
- offers page
- content calendar
- operating cadence page
- Bootstrapper Capital funnel page
- book marketing page

Do not use Notion as the archive or main SOP repository.

### Platform Evaluation Layer

The agency is evaluating platform options for a later SaaS, marketplace, or
Ownable OS layer. Current candidates and inputs include:

| Candidate | Current Posture | Evaluate For | Guardrail |
| --- | --- | --- | --- |
| Azure | Cloud learning and possible guarded sandbox | App hosting, identity, automation, AI services, compliance support | Cost caps and shutdown rules before production use |
| Google Cloud | Existing project and CLI references | Service platform fit, APIs, data workflows, potential infrastructure | Billing and permission limits must be understood first |
| AWS | Reference and marketplace candidate | Marketplace/channel options, infrastructure breadth | Avoid complexity until there is a clear use case |
| GitHub | Repo, versioning, automation, and future deployment surface | Source control, CI/CD, package evidence, agent collaboration | Do not store secrets in Git |
| Stripe Connect / Stripe SaaS | Existing transaction connector and SaaS-platform research candidate | Connected accounts, subscriptions, application fees, payouts, merchant-of-record implications | Candidate only; no route chosen |
| SaaSify / marketplaces | Research shelf | AWS, Azure, or GCP marketplace distribution | Candidate only |
| DatabaseMart VPS | Existing low-cost sandbox | Linux hosting, prototypes, learning, lightweight internal services | Keep separate from critical production until hardened |
| KNIME | Analytics and workflow-learning platform | Data exploration, workflow analytics, repeatable reporting, evidence discovery | Use for learning and analysis without making it a hidden source of truth |

No candidate becomes the operating backbone without a decision record that
covers cost, ownership, compliance, data portability, security, maintenance,
workflow fit, and fallback path.

### Stripe Connect / SaaS Consideration

Stripe remains the agency's established payment connector between web
platforms and banks. Stripe's SaaS platform documentation adds a future
consideration: a platform can extend Stripe products to connected merchant
accounts, support subscriptions and application fees, and choose between
Stripe-owned pricing and buy-rate style models.

This is not an approved route. It is a decision input for the future day when
URC, Bootstrapper Capital, Ownable OS, or workflow-product distribution needs a
true SaaS or marketplace payment architecture.

### VPS

The `DatabaseMart` VPS is an available sandbox in v1, not a required production
dependency.

It can be used now for:

- landing pages
- lightweight hosting
- automation endpoints
- internal tools
- self-hosted systems if needed
- Linux and Apache learning
- small non-critical prototypes
- experiments that should not consume cloud credits

Do not leave it fallow, but do not make it central until it has a clear owner,
backup path, update routine, monitoring expectation, and secret-handling rule.

### KNIME

`KNIME` should be treated as an analytics and workflow-learning platform, not
only as a workflow test utility.

It can support:

- data exploration across trackers
- workflow audit analysis
- recurring report generation
- evidence review
- lead, finance, and fulfillment pattern discovery
- import/export testing before data moves into a future system

KNIME outputs should be documented and linked back to the source tracker or
report. Do not let KNIME become an undocumented shadow database.

## System Map

### Lead Capture

Leads should come from:

- Microsoft Forms
- booking links
- Upwork
- LinkedIn
- Instagram
- events
- referrals

### CRM-Lite

Use a simple Microsoft List or Excel tracker in OneDrive for:

- lead name
- company
- source
- offer of interest
- stage
- next action
- owner
- follow-up date

### Sales Tracking

Track qualified deals and commercial status using:

- Independence Chapter CRM-lite bridge or another future CRM-compatible tracker
- owned finance trackers and dashboards for invoice and payment status
- existing sales department trackers where appropriate

### Project Delivery

Use:

- OneDrive folders
- Teams channels
- task tracking
- existing fulfillment and aftercare files

### Knowledge Base And Owner's Manual

Use the agency Owner's Manual as the single human-facing guide to the whole
system.

The Owner's Manual should help:

- Robert find where things live when the system has moved faster than memory
- returning collaborators such as Sheena understand what exists and how to
  operate inside it
- auditors, standards reviewers, and outside reviewers locate evidence,
  controls, SOPs, and ownership boundaries
- future buyers or operators of workflows, playbooks, departments, or company
  systems understand how to use what they receive
- a possible public tour-guide layer show how the agency is being built in
  real time without exposing secrets, client material, or private strategy

Use:

- OneDrive and Word for SOPs and long-form docs
- Notion only as a control panel and index
- repo Markdown as the agent-readable and change-controlled source
- the Owner's Manual blueprint as the human navigation layer

## Revenue Engine

The v1 revenue engine has four layers.

### 1. Book

Use the book to create trust and open the relationship.

### 2. Entry Offers

Use:

- workshops
- audits
- roadmap sessions
- founder sessions
- chapter events

### 3. Continuity

Use a monthly support layer such as:

- office hours
- accountability pods
- monthly advisory
- implementation support

### 4. Higher-Ticket Consulting

Use URC for:

- advisory
- operations cleanup
- marketing and sales systems
- AI-enabled business systems
- implementation sprints

Use Tactix for delivery support where needed.

## Book Funnel

The book should feed this sequence:

1. Person sees content
2. Person becomes interested in the viewpoint
3. Person buys or explores the book
4. Person joins a list, form, event, or community entry point
5. Person attends a live session
6. Person enters a workshop, bootcamp, or advisory conversation
7. Person moves into continuity or consulting

### Book Rules

- every book mention should include one clear CTA
- the CTA should point to one next step
- book content should be reused for LinkedIn and Instagram
- videos and clips should point to an offer, not just awareness

## Weekly Operating Cadence

### Monday

- pipeline review
- active deals
- client status
- invoice follow-up

### Tuesday

- content creation
- book promotion
- marketing execution

### Wednesday

- Bootstrapper Capital outreach
- event planning
- partnerships

### Thursday

- delivery refinement
- fulfillment
- aftercare
- SOP improvement

### Friday

- finance review
- KPI review
- retrospective
- next-week setup

## Weekly Metrics

Track only the essentials:

- new leads
- booked calls
- proposals sent
- invoices outstanding
- event RSVPs
- book-driven inquiries
- recurring members
- delivered client outcomes

## Priority Hierarchy

Use this hierarchy to avoid brand confusion:

- `URC` = main business
- `Bootstrapper Capital` = audience and funnel
- `Tactix` = fulfillment arm
- `Book` = trust and conversion asset

## Success Criteria

V1 is working when:

- the brands no longer compete with each other
- the tools each have one clear job
- the book has a defined next step
- the weekly cadence is actually followed
- the system produces consistent lead, event, and client movement
