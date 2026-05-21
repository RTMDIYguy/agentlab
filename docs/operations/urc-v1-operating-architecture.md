# URC V1 Operating Architecture

## Purpose

This document defines the v1 operating architecture for:

- Uncle Robert Consulting (`URC`)
- Tactix
- Bootstrapper Capital
- `Bootstrapper's Guide to the World`

The goal is to reduce tool sprawl, clarify brand roles, and establish one practical system that can be run consistently.

## Core Principle

Use one system per job.

- `Microsoft 365` is the preferred operating backbone when paid access is
  available. During free-bootstrap periods, use free Microsoft accounts, local
  files, repo-tracked CSV/Markdown, Reach, Gmail, or other free/low-cost tools
  as manual bridges without pretending they are the final operating layer.
- `Frappe` is the financial system of record.
- `Notion` is a lightweight dashboard and planning layer only.
- The book is an authority and conversion asset.
- `Bootstrapper Capital` is the community and funnel layer.
- `Tactix` is the execution and Upwork-facing fulfillment arm.

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

`Bootstrapper Capital` is the audience, community, and conversion engine.

It is responsible for:

- founder and business-owner gathering
- events and roundtables
- workshops and bootcamps
- continuity offers
- feeding higher-ticket consulting into URC

### Bootstrapper's Guide to the World

The book is an authority asset first and a direct-sale product second.

Its job is to:

- establish credibility
- create trust
- seed conversations
- feed founders into events, workshops, and advisory

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

### Frappe

Use `Frappe` for:

- invoices
- payment tracking
- customer billing records
- receivables visibility
- finance status snapshots

This is the financial system of record.

### Notion

Use `Notion` sparingly because of the block limit.

Keep Notion limited to:

- executive dashboard
- finance dashboard linking to Frappe
- offers page
- content calendar
- operating cadence page
- Bootstrapper Capital funnel page
- book marketing page

Do not use Notion as the archive or main SOP repository.

### VPS

The `DatabaseMart` VPS is optional in v1.

It can be used later for:

- landing pages
- lightweight hosting
- automation endpoints
- internal tools
- self-hosted systems if needed

Do not make it central until the business rhythm is stable.

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

- CRM-lite in Microsoft
- `Frappe` for invoice and payment status
- existing sales department trackers where appropriate

### Project Delivery

Use:

- OneDrive folders
- Teams channels
- task tracking
- existing fulfillment and aftercare files

### Knowledge Base

Use:

- OneDrive and Word for SOPs and long-form docs
- Notion only as a control panel and index

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
