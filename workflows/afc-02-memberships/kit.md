---
schema: kit/1.0
slug: afc-02-memberships
title: "AFC-02 - Memberships"
summary: "AfterCare workflow package for Memberships. Consolidates registry metadata, imported source references, setup guidance, validation notes, and automation blueprints into one operative kit file."
version: 0.1.0-draft
owner: uncle-robert-consulting
license: UNLICENSED
status: imported-draft
conformance: draft
certifiedAt: null
workflowId: AFC-02
department: "AfterCare"
automationLevel: "80-85%"
primaryOwner: "Account Manager + Robert"
trigger: "Upgrade from subscription or direct enrollment"
cycleTime: "Onboarding: 7 days; renewal: 60-day cycle"
sourceStatus: "Imported source"
changeLog:
  - date: 2026-05-21
    changeId: CC-2026-05-21-013
    version: 0.1.0-draft
    type: consolidation
    summary: Converted imported workflow package into a single operative kit.md with source map, quickstart, setup, validation, certification gaps, and embedded automation blueprint when available.
    author: codex
tags:
  - workflow-package
  - afc
  - aftercare
---

# AFC-02 - Memberships

This is the consolidated `kit.md` for the workflow. It replaces the old imported-package surface as the operative file while keeping source, asset, tracker, and automation files as provenance until certification is complete.

## Goal

Run the Memberships workflow for AfterCare with a repeatable trigger, owner, cycle time, outputs, and validation path. The current draft is strong enough for agent orientation and controlled internal use; certification still requires a live run or documented manual evidence.

## When to Use

Use this workflow when the trigger occurs: **Upgrade from subscription or direct enrollment**.

Use it as part of the URC operating system first. Convert it into a client-safe variant only after URC-specific names, internal assumptions, and tool choices have been scrubbed or intentionally parameterized.

## Registry Metadata

| Field | Value |
| --- | --- |
| Workflow ID | AFC-02 |
| Department | AfterCare |
| Automation level | 80-85% |
| Owner | Account Manager + Robert |
| Trigger | Upgrade from subscription or direct enrollment |
| Cycle time | Onboarding: 7 days; renewal: 60-day cycle |
| Source status | Imported source |

## Inputs

- Trigger event or planning cadence identified above.
- Current URC operating context for AfterCare.
- Any imported source, asset, tracker, or automation artifacts listed in the Source Map.
- Human approval from the owner before external sends, money movement, access changes, or client-visible commitments.

## Setup

1. Read this kit end to end.
2. Review the Source Digest and Source Map below.
3. Bind any placeholders listed in Placeholder and Binding Notes.
4. If an automation blueprint is embedded, import or rebuild it in the chosen runtime only after credentials and fallback paths are confirmed.
5. Run the Validation checklist before treating the workflow as complete.

## Quickstart

1. Confirm the trigger: Upgrade from subscription or direct enrollment.
2. Open the relevant source or asset file from the Source Map.
3. Collect the minimum inputs needed for this cycle.
4. Execute the workflow steps using the imported source as the detailed operating guide.
5. Capture output evidence, exceptions, and follow-up tasks.
6. Record meaningful package or behavior changes in `docs/operations/change-control-register.md`.

## Source Digest

- `AfterCare-Department-Workflows.md`: Source file imported and retained for detailed workflow extraction.

## Source Map

| Artifact | Purpose |
| --- | --- |
| `source/AfterCare-Department-Workflows.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `automation/AFC02-Blueprint.json` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `trackers/AFC-02_Membership_Tracker.xlsx` | Retained provenance/input artifact now referenced by this consolidated kit. |

## Embedded Source and Asset Documents

### source/AfterCare-Department-Workflows.md

````markdown
# AFC-02 - Memberships Department Source

Source: `AfterCare Department\AfterCare-Department-Workflows.docx`

This Markdown file is a text extraction of the source `.docx` for GitHub-readable access. Preserve the source path in citations until the workflow is fully converted into `kit.md` format.

UNCLE ROBERT CONSULTING LLC

AI-Native Agency Workflow Templates

AFTERCARE DEPARTMENT

Complete Workflow Playbook

Dual-Format: URC Master Edition  +  Client Template Edition

Version 1.0  |  March 2026  |  Confidential

4 CORE WORKFLOWS INCLUDED

1 — Subscriptions

2 — Memberships

3 — Long-Term Contracts

4 — Communities

PART ONE  —  URC MASTER EDITION

Complete workflows filled with Uncle Robert Consulting's actual tools, team, KPIs, and processes.

## Workflow 1: Subscriptions

URC-AFC-01  |  Uncle Robert Consulting Master Version

Department Context

The AfterCare Department is the revenue protection engine of Uncle Robert Consulting. It exists to ensure that every client who walks through the door never wants to leave — and if they start to drift, the system catches them before they go. AfterCare operates across four retention pillars: Subscriptions, Memberships, Long-Term Contracts, and Communities.

Subscriptions represent the most scalable recurring revenue model in the URC portfolio. This workflow governs the complete lifecycle of subscription relationships — from initial enrollment through renewal, pause management, and win-back campaigns — using AI-driven churn prediction and automated retention flows to maintain 85%+ retention rates with minimal human intervention.

## Workflow Purpose & Objectives

## Purpose

Build and operate an AI-powered subscription management system that maximizes retention, predicts churn before it happens, automates renewals and dunning, and creates seamless subscriber experiences that keep clients engaged month after month.

Key Objectives

Achieve and maintain 85%+ monthly subscription retention rate across all URC subscription products

Automate 85-90% of subscription lifecycle management including renewals, payment recovery, and upgrade nudges

Reduce involuntary churn (failed payments) by 80%+ using smart dunning sequences and retry logic

Identify at-risk subscribers 14-21 days before cancellation using AI behavioral scoring

Build personalized save flows that convert 25-35% of cancellation attempts into saves or pauses

Create a subscription data dashboard giving Robert real-time visibility into MRR, churn, and cohort health

## Automation Level

85-90%  |  AI handles renewals, dunning, churn scoring, save flows, and reporting; humans approve win-back campaigns and handle escalated cancellations

Human Involvement

Campaign strategy, high-value subscriber personal outreach, pricing decisions, offer approvals

Cycle Time

Renewal processing: automated. At-risk detection: real-time. Win-back campaigns: 7-21 day sequences

Detailed Step-by-Step Process

## STEP 1

Subscriber Enrollment & Profile Setup

Trigger: New subscriber completes checkout via Stripe, GoHighLevel payment link, or website form

## Actions

Payment processor (Stripe) webhook fires to GoHighLevel and HubSpot CRM simultaneously

Subscriber profile created in CRM with: plan tier, billing cycle, start date, payment method, source channel

Welcome sequence launched automatically: confirmation email, onboarding video (Loom), quick-start guide, and calendar invite for check-in call

Subscriber added to appropriate nurture segment in email platform based on plan type

Baseline engagement score set at 100 in subscription health tracker

ClickUp task created for account manager (Keisha or Destiny) to confirm 3-day onboarding touchpoint

## Owner: Zapier automation + GoHighLevel workflow + Account Manager (3-day check-in)

## Tools: Stripe, GoHighLevel, HubSpot CRM, Zapier, ClickUp, Loom

SLA Target: Welcome sequence delivered within 5 minutes of successful payment

## STEP 2

Ongoing Engagement Monitoring & Health Scoring

## Trigger: Continuous — daily automated scan of all active subscriber activity signals

## Actions

AI engagement monitor tracks: login frequency, feature usage, email open rates, support ticket history, content consumption, and NPS responses

Subscriber health score updated daily on a 0-100 scale with color coding: Green (75-100), Yellow (50-74), Red (0-49)

Behavioral patterns fed into churn prediction model — subscribers showing 3+ risk signals flagged for intervention

Monthly 'Subscriber Value Report' auto-generated showing ROI of subscription to the client

Usage-based upsell triggers activated when subscriber hits 80%+ of plan capacity

## Owner: AI Monitoring Engine (automated) + Account Manager (Red subscribers)

## Tools: GoHighLevel, HubSpot CRM, Zapier, Make.com, Google Sheets (health dashboard)

SLA Target: Health scores updated within 24 hours. Red flags escalated to human within 2 hours

## STEP 3

Renewal Processing & Dunning Management

## Trigger: 14 days before renewal date OR payment failure detected

## Actions

Renewal reminder sequence launches at day -14: reminder email, value recap, and early renewal incentive if applicable

On renewal date, Stripe processes payment automatically; success triggers confirmation email and receipt

If payment fails: smart dunning sequence activates — retry logic at day 1, 3, 5, 7 with updated card request emails

Failed payment subscriber receives text via GoHighLevel at day 3 with one-click payment update link

At day 10 of failed payment: personal email from Robert (automated personalization) with offer to pause instead of cancel

Voluntary pause option presented as alternative to cancellation: 1-3 month pause with automatic resumption

## Owner: Stripe + GoHighLevel automation + Robert (day 10 personal email template)

## Tools: Stripe, GoHighLevel, Zapier, Make.com, SMS integration

SLA Target: First dunning email within 2 hours of failed payment. Final resolution within 14 days

## STEP 4

Churn Detection & Save Flow Activation

Trigger: Subscriber initiates cancellation OR AI churn score drops below 40 OR engagement drops 50%+ in 7 days

## Actions

Cancellation attempt intercepted by retention page: subscriber presented with pause option, downgrade option, and testimonial reinforcement before final cancel button

AI churn reason classifier captures exit survey data and categorizes: price, value, time, competition, achievement of goal

Save offer generated based on churn reason: price-sensitive gets 20% off, time-constrained gets pause, value doubters get strategy call

Hot-lead alert sent to account manager (Destiny) for any subscriber spending $500+/month attempting to cancel

If not saved: graceful offboarding sequence launched — data export, final check-in call offer, alumni discount code for future resubscription

## Owner: GoHighLevel save flow + Account Manager (high-value escalation)

## Tools: GoHighLevel, HubSpot CRM, Zapier, ClickUp, Google Workspace

SLA Target: Save flow triggers within 60 seconds of cancellation intent. Human escalation within 1 hour for high-value

## STEP 5

Win-Back Campaign for Cancelled Subscribers

## Trigger: Subscription cancelled AND 30 days have passed since cancellation

## Actions

Former subscriber enters win-back email sequence: 30-day, 60-day, and 90-day touchpoints with new value proof

AI personalizes win-back message based on cancellation reason captured in exit survey

Special resubscription offer generated at 60-day mark: discounted first 2 months or added bonus features

High-value former subscribers (spent $500+/month) receive personal video message from Robert via Loom

Win-back conversions tracked separately in HubSpot to measure campaign ROI

## Owner: GoHighLevel / HubSpot automation + Robert (Loom video for high-value)

## Tools: GoHighLevel, HubSpot CRM, Loom, Zapier, Canva Pro (offer graphics)

SLA Target: Win-back sequence auto-launches at day 30 post-cancellation

## STEP 6

Subscription Reporting & Optimization

Trigger: Weekly automated report (every Monday 8:00 AM) + monthly deep-dive on first business day of month

## Actions

Weekly report auto-generated: MRR, new subscribers, cancellations, save rate, dunning recovery rate, plan breakdown

Monthly cohort analysis shows retention by acquisition channel, plan tier, and signup month

Churn prediction model retrained with new cancellation data to improve accuracy each month

A/B test results from save flows and renewal emails reviewed; winning variants locked in, new tests launched

Robert receives executive summary in Google Docs with top 3 action items highlighted

## Owner: AI Reporting Engine (automated) + Robert (strategy review and approvals)

## Tools: Google Sheets, HubSpot CRM, Make.com, Google Workspace, Zapier

SLA Target: Weekly report in inbox by 9:00 AM Monday. Monthly report by 9:00 AM on first business day

Integration Points

Upstream — Feeds Into This Workflow

Downstream — This Workflow Feeds Into

Sales Department (new subscriber handoff)

AfterCare Memberships (tier upgrades)

Fulfillment Department (deliverable triggers engagement data)

Fulfillment Department (active subscriber service queue)

Onboarding workflow (subscription activation gate)

Finance (recurring revenue reporting, MRR tracking)

Marketing (subscriber acquisition campaigns)

Marketing (testimonials, case studies from happy subscribers)

GoHighLevel payment processing

AfterCare Communities (subscriber community access)

Key Tools & Technology Stack

Category

Tool Options

URC Current Tool

## Purpose

Payment Processing

Stripe, PayPal, Square, GoHighLevel Payments

Stripe + GoHighLevel

Subscription billing, dunning, payment recovery

CRM & Automation

HubSpot, GoHighLevel, ActiveCampaign, Keap

HubSpot + GoHighLevel

Subscriber lifecycle management, segmentation

Churn Prediction

ChurnZero, Pecan AI, Churnly, ProfitWell

GoHighLevel scoring + Make.com

Behavioral health scoring, churn prediction

Email/SMS Marketing

GoHighLevel, Mailchimp, Klaviyo, Postmark

GoHighLevel

Renewal sequences, dunning, win-back campaigns

Integration/Automation

Zapier, Make.com, native webhooks

Zapier + Make.com

Cross-platform data sync and trigger routing

Reporting

Google Sheets, HubSpot Reports, Databox

Google Sheets + HubSpot

MRR dashboard, cohort analysis, churn reporting

Project Management

ClickUp, Asana, Notion

ClickUp

Account manager tasks, escalation tracking

Video Personalization

Loom, Vidyard, BombBomb

Loom

Personal win-back messages, onboarding videos

KPIs & Success Metrics

KPI / Metric

Measurement

Target (URC)

Client Default

## Notes / How to Measure

Monthly Retention Rate

% subscribers retained month over month

85%+

80%+

Track in HubSpot or Google Sheets MRR dashboard

Monthly Recurring Revenue (MRR)

Total active subscription revenue

Grow 5%+ MoM

Positive growth

Stripe dashboard or HubSpot revenue reporting

Failed Payment Recovery Rate

% of failed payments recovered by dunning

75%+

60%+

Stripe dunning logs or GoHighLevel payment reports

Cancellation Save Rate

% of cancellation attempts converted to save/pause

25-35%

20%+

GoHighLevel save flow conversion tracking

Win-Back Conversion Rate

% of cancelled subscribers who resubscribe

10-15%

8%+

HubSpot win-back campaign reports

Subscriber Health Score Avg

Average health score across active subscribers

70+ avg

65+ avg

Weekly automated Google Sheets health dashboard

Churn Prediction Accuracy

Accuracy of AI churn flag (validated monthly)

80%+

75%+

Compare predictions vs actual cancellations monthly

Implementation Checklist

## PHASE 1 — Foundation (Week 1-2)

Set up Stripe subscription products with correct billing cycles and plan tiers

Connect Stripe to GoHighLevel and HubSpot via Zapier webhooks

Build subscriber CRM pipeline in HubSpot with enrollment, active, at-risk, cancelled stages

Create subscriber welcome email and SMS sequence in GoHighLevel (5-touch within first 7 days)

Build Google Sheets MRR dashboard with auto-import from Stripe data export

## PHASE 2 — Automation (Week 3-4)

Build 4-step dunning sequence in GoHighLevel for failed payments (email + SMS)

Create pause/downgrade offer landing page as alternative to cancellation

Build engagement health scoring formula in Make.com using HubSpot activity data

Set up churn alert automation: Red score triggers ClickUp task for account manager

Create A/B test framework for renewal subject lines in GoHighLevel

## PHASE 3 — Retention Flows (Week 5-6)

Build full cancellation save flow with reason capture, dynamic offers, and graceful offboarding

Create 3-touch win-back campaign in HubSpot with personalization tokens for churn reason

Record Loom video templates for high-value win-back personal outreach

Set up weekly Monday report automation: Zapier triggers Google Sheets summary email to Robert

Launch first cohort analysis to establish baseline retention benchmarks

## PHASE 4 — Optimization (Month 2+)

Review first month A/B test results; implement winning sequences permanently

Evaluate churn prediction model accuracy; refine scoring factors with real cancellation data

Add upsell trigger automation when subscribers hit 80% of plan usage limits

Document all processes in Notion/ClickUp SOP library for team training

Conduct quarterly pricing review using MRR and churn data to optimize plan structure

## Workflow 2: Memberships

URC-AFC-02  |  Uncle Robert Consulting Master Version

Department Context

Memberships represent Uncle Robert Consulting's premium relationship tier — a step above standard subscriptions, memberships create a sense of belonging, exclusivity, and co-investment between URC and its most engaged clients. Where subscriptions are transactional, memberships are transformational.

The URC membership program gives content creators and small business owners access to exclusive resources, direct advisory time with Robert, peer accountability groups, and priority service. This workflow governs the full membership lifecycle — recruitment, activation, engagement, renewal, and advancement through membership tiers — with AI handling the routine and humans delivering the irreplaceable personal touch.

## Workflow Purpose & Objectives

## Purpose

Design and operate a tiered membership program that converts URC's best clients into committed, long-term community members, driving premium recurring revenue, referral growth, and deep brand loyalty through AI-powered engagement automation.

Key Objectives

Build a 3-tier membership structure (Silver, Gold, Platinum) with clear benefits and upgrade pathways

Automate 80-85% of membership lifecycle management including onboarding, engagement nudges, and renewals

Achieve 90%+ annual membership renewal rate through proactive engagement and value delivery

Use gamification and milestone recognition to drive engagement scores above 70 for all active members

Convert 15-20% of standard subscribers to membership tier within 90 days of subscription start

Generate 30%+ of new member enrollments through existing member referrals

## Automation Level

80-85%  |  AI manages engagement tracking, milestone rewards, renewal sequences, and upsell flows; humans deliver advisory sessions, personal recognition, and community leadership

Human Involvement

Live advisory sessions, milestone celebrations, community facilitation, strategic membership tier design

Cycle Time

Member onboarding: 7 days. Annual renewal cycle begins 60 days before expiry. Tier upgrade review: monthly

Detailed Step-by-Step Process

## STEP 1

Membership Enrollment & Tier Assignment

Trigger: Client upgrades from subscription to membership via sales call, upgrade offer acceptance, or direct enrollment

## Actions

Membership contract generated via PandaDoc/DocuSign with tier-specific benefits and commitments clearly outlined

Payment processed via Stripe; membership CRM record created in HubSpot with tier, start date, benefits list, renewal date

Welcome package triggered automatically: welcome email from Robert, membership card (digital PDF), benefit activation guide, community access link

Member onboarded to exclusive Slack channel or Circle community based on tier (Silver: community access, Gold: + advisory calls, Platinum: + direct Robert access)

Onboarding call scheduled via Calendly for all Gold and Platinum members within 72 hours of enrollment

Account manager assigned and notified via ClickUp task: 'Complete 7-day membership activation checklist'

## Owner: GoHighLevel enrollment automation + Account Manager (onboarding call)

## Tools: PandaDoc/DocuSign, Stripe, HubSpot, GoHighLevel, Circle/Slack, Calendly, ClickUp

SLA Target: Welcome package delivered within 10 minutes. Onboarding call booked within 72 hours

## STEP 2

Member Engagement Tracking & Gamification

Trigger: Continuous — daily engagement scan of all active member activity across platforms

## Actions

Engagement engine monitors: community post activity, advisory call attendance, resource downloads, referrals made, event participation, and support interactions

Points system calculates member engagement score: community posts (+10 pts), referral made (+100 pts), advisory call attended (+50 pts), milestone completed (+75 pts)

Members reaching point milestones receive automated recognition: digital badge (Canva-generated), shoutout in community, surprise bonus resource

Monthly 'Member Activity Report' auto-generated for each member showing their engagement highlights and ROI proof

Disengaged members (no activity 14+ days) receive personalized re-engagement email with direct link to easiest next action

Owner: Make.com engagement automation + Account Manager (personal re-engagement for Gold/Platinum)

## Tools: Circle/Slack, Make.com, HubSpot, Canva Pro, GoHighLevel, Google Sheets

SLA Target: Engagement data updated daily. Re-engagement trigger fires within 24 hours of 14-day inactivity

## STEP 3

Benefits Delivery & Advisory Session Management

Trigger: Scheduled benefit calendar (monthly advisory calls, quarterly reviews) OR member request for benefit activation

## Actions

Monthly advisory call slots auto-published to Calendly 30 days in advance; Gold/Platinum members receive priority booking windows

Pre-call prep brief auto-generated 24 hours before each advisory session: member's recent activity, open questions, goals from last session

Post-call action items captured via Loom recording summary and logged in HubSpot member record

Exclusive content and resources auto-delivered to members based on tier: weekly templates (Silver), monthly strategy guides (Gold), custom playbooks (Platinum)

Quarterly 'Membership Value Review' email auto-sent showing total resources delivered, calls attended, and measurable results

## Owner: Calendly + Loom + GoHighLevel + Robert/account managers (sessions themselves)

## Tools: Calendly, Loom, GoHighLevel, HubSpot, Google Workspace, Canva Pro, Notion

SLA Target: Benefits delivered on schedule per tier. Session summaries in HubSpot within 2 hours of call end

## STEP 4

Tier Upgrade Identification & Promotion

Trigger: Member engagement score exceeds tier threshold for 30 consecutive days OR account manager manual nomination

## Actions

Upgrade qualification criteria checked monthly: engagement score, time at current tier, payment history, referrals made, satisfaction score

Qualified upgrade candidates receive personalized video from Robert (Loom) explaining their eligibility and next-tier benefits

Upgrade offer email sent with limited-time incentive (first month at new tier price discounted 20%)

If accepted: tier upgrade processes automatically via Stripe proration; new benefits activate within 24 hours

If declined: member remains at current tier; reason captured in HubSpot; follow-up in 60 days with refreshed offer

Owner: Make.com qualification automation + Robert (upgrade video) + GoHighLevel (offer email)

## Tools: HubSpot, Make.com, Loom, GoHighLevel, Stripe, Canva Pro

SLA Target: Monthly upgrade report generated by 1st of each month. Upgrade offer delivered within 48 hours of qualification

## STEP 5

Annual Renewal & Retention Management

## Trigger: 60 days before annual membership renewal date

## Actions

60-day renewal campaign launches: personal email from Robert recapping the year's wins, impact delivered, and upcoming benefits for next year

30-day reminder with exclusive early-renew bonus: locked-in pricing, bonus resource pack, or extended tier trial

14-day reminder with social proof: curated testimonials from members at same tier level

7-day final reminder with urgency: price increase effective on renewal for new members (existing protected)

If no renewal: cancellation trigger activates save flow (mirrors subscription save flow with membership-specific offers)

Post-renewal: account manager sends personal thank-you note and books annual goal-setting session

Owner: GoHighLevel renewal automation + Account Manager (personal thank-you for all tiers)

## Tools: GoHighLevel, HubSpot, Stripe, Canva Pro, Google Workspace

SLA Target: 60-day email sent exactly on schedule. Renewal confirmation delivered within 5 minutes of payment

## STEP 6

Membership Performance Reporting & Program Optimization

Trigger: Monthly automated report on 1st business day of each month + quarterly deep-dive on program health

## Actions

Monthly membership dashboard auto-generated: active members by tier, MRR, renewal rate, average engagement score, top members by activity

Referral tracking report shows which members drive the most new enrollments — top referrers recognized in community

Benefits utilization report identifies under-used benefits (candidates for enhancement or replacement)

NPS survey auto-sent quarterly to all active members; results aggregated and fed into program improvement roadmap

Robert reviews report and prioritizes 2-3 program improvements for next quarter

## Owner: Make.com + Google Sheets reporting + Robert (quarterly strategy review)

## Tools: Google Sheets, HubSpot, Make.com, Typeform/SurveyMonkey, Google Workspace

SLA Target: Monthly report in inbox by 9:00 AM on first business day. NPS results compiled within 7 days of survey close

Integration Points

Upstream — Feeds Into This Workflow

Downstream — This Workflow Feeds Into

AfterCare Subscriptions (upgrade pathway source)

AfterCare Communities (member community access)

Sales Department (direct enrollment referrals)

Marketing (member testimonials and case studies)

Fulfillment Department (premium member deliverables)

Culture Department (member recognition programs)

Finance (membership revenue and billing)

Sales (referral pipeline from member network)

Onboarding workflow (new member activation)

R&D (member feedback for product development)

Key Tools & Technology Stack

Category

Tool Options

URC Current Tool

## Purpose

Membership Platform

Circle, Mighty Networks, Kajabi, GoHighLevel

Circle + GoHighLevel

Community hosting, member management, content delivery

CRM

HubSpot, GoHighLevel, Salesforce

HubSpot + GoHighLevel

Member lifecycle tracking, benefit logging, renewals

Payment & Billing

Stripe, PayPal, GoHighLevel Payments

Stripe

Membership billing, tier upgrades, proration

Contract Management

PandaDoc, DocuSign, HelloSign

PandaDoc

Membership agreements, benefit acknowledgments

Advisory Scheduling

Calendly, Acuity, Cal.com

Calendly

Advisory session booking, priority access management

Engagement Gamification

Make.com logic, Circle badges, custom scoring

Make.com + Circle

Points tracking, milestone recognition, leaderboards

Video Personalization

Loom, Vidyard, BombBomb

Loom

Upgrade offers, post-call summaries, win-back messages

Reporting & Analytics

Google Sheets, HubSpot, Databox

Google Sheets + HubSpot

Membership dashboard, engagement scoring, NPS tracking

KPIs & Success Metrics

KPI / Metric

Measurement

Target (URC)

Client Default

## Notes / How to Measure

Annual Renewal Rate

% of memberships renewed at expiry

90%+

85%+

HubSpot membership pipeline renewal stage tracking

Member Engagement Score Avg

Average engagement score across active members

70+ avg

65+ avg

Monthly automated Google Sheets engagement dashboard

Tier Upgrade Rate

% of members who upgrade tier within 12 months

15-20%

10%+

HubSpot tier transition reports, monthly review

Benefits Utilization Rate

% of available benefits actively used per member

70%+

60%+

Make.com benefit activation tracking per member record

Referral Rate

% of new members sourced from existing member referrals

30%+

20%+

HubSpot source attribution on new member records

NPS Score (Members)

Net Promoter Score from quarterly member survey

50+

40+

Typeform / SurveyMonkey quarterly NPS campaign

Member Lifetime Value (LTV)

Average total revenue per member relationship

3x annual fee

2.5x annual fee

HubSpot revenue timeline per member record

Implementation Checklist

## PHASE 1 — Program Design (Week 1-2)

Define 3 membership tiers (Silver, Gold, Platinum): benefits, pricing, access levels, and upgrade criteria

Create membership agreement template in PandaDoc with tier-specific addenda

Set up Stripe subscription products for each membership tier with correct pricing and billing cycle

Build member CRM pipeline in HubSpot: Prospect, Enrolled, Active, Up for Renewal, Lapsed stages

Configure Circle or equivalent community platform with tier-specific access channels

## PHASE 2 — Onboarding & Engagement (Week 3-4)

Build 7-day member welcome sequence in GoHighLevel (email + SMS touchpoints)

Set up Calendly advisory session calendar with tier-based booking windows

Create engagement point scoring system in Make.com connected to Circle and HubSpot

Design digital membership card and milestone badge templates in Canva Pro

Build monthly member activity report automation in Google Sheets + Make.com

## PHASE 3 — Renewal & Upgrade Flows (Week 5-6)

Build 60-day annual renewal campaign sequence in GoHighLevel

Create tier upgrade qualification logic in Make.com (monthly automated check)

Record Loom video templates for upgrade offers at each tier transition

Set up quarterly NPS survey automation in Typeform with HubSpot sync

Build referral tracking system in HubSpot with member attribution reports

## PHASE 4 — Scale & Optimize (Month 2+)

Launch first cohort of founding members with special founding pricing (creates urgency and social proof)

Review first NPS results and prioritize top 2-3 benefit improvements

Add benefits utilization tracking to identify underperforming program elements

Document all membership processes in Notion/ClickUp SOP library

Evaluate program P&L: ensure member LTV exceeds 3x annual fee at each tier

## Workflow 3: Long-Term Contracts

URC-AFC-03  |  Uncle Robert Consulting Master Version

Department Context

Long-term contracts are the bedrock of Uncle Robert Consulting's revenue stability and client commitment infrastructure. A signed multi-month or multi-year contract is a mutual declaration of intent — the client is investing in transformation, and URC is committing to deliver it. Managing these contracts with AI-assisted precision protects both parties and eliminates the administrative chaos that plagues most consulting agencies.

This workflow governs the complete lifecycle of URC's long-term service agreements — from contract creation through execution, obligation tracking, renewal negotiation, and termination or extension. With 85-90% of routine contract management automated, account managers can focus on relationship quality rather than administrative overhead.

## Workflow Purpose & Objectives

## Purpose

Implement a fully automated contract lifecycle management (CLM) system that tracks every obligation, milestone, and renewal date across all active URC client contracts — ensuring zero missed deadlines, maximum compliance, and seamless renewal conversion.

Key Objectives

Eliminate missed contract milestones, deliverable deadlines, and renewal windows with 100% automated obligation tracking

Reduce contract creation and negotiation cycle time by 60% using AI-assisted drafting and clause libraries

Achieve 75%+ contract renewal rate through proactive renewal engagement starting 90 days before expiry

Build a searchable, AI-indexed contract repository for instant retrieval of any clause, obligation, or commitment

Automate compliance monitoring and alert system for all contractual obligations across active agreements

Create standardized contract performance dashboards that give Robert real-time visibility into all active agreements

## Automation Level

85-90%  |  AI handles drafting, obligation tracking, milestone reminders, compliance monitoring, and renewal alerts; humans conduct negotiations, approve terms, and handle disputes

Human Involvement

Contract negotiations, custom term approvals, dispute resolution, relationship management during renewal

Cycle Time

Contract creation: 1-2 hours. Execution/signing: 24-48 hours. Renewal engagement: 90-day cycle

Detailed Step-by-Step Process

## STEP 1

Contract Drafting & Template Selection

Trigger: Signed proposal accepted by client OR Sales Department sends contract-ready deal to AfterCare queue

## Actions

AI reviews deal record in HubSpot: service type, duration, payment terms, deliverables, and any custom deal notes

Contract template selected from URC clause library based on service category: consulting retainer, project-based, training, done-for-you service

AI drafts contract using approved template, populating all client-specific fields: name, entity, address, service scope, payment schedule, start date, term length

Custom clause recommendations generated based on deal specifics: IP ownership if content is created, confidentiality scope, subcontractor disclosure

Draft sent to Robert or Jerome for 15-minute review and approval before client delivery

## Owner: AI Drafting Engine (PandaDoc AI or template automation) + Robert/Jerome (review)

## Tools: PandaDoc, HubSpot CRM, Zapier, Google Workspace, DocuSign

SLA Target: Draft contract ready within 2 hours of deal hand-off from Sales. Human review completed within 4 business hours

## STEP 2

Contract Delivery, Negotiation & Execution

## Trigger: Contract draft approved by Robert/Jerome AND client ready to review

## Actions

Contract sent to client via PandaDoc with embedded e-signature and video explainer (Loom walkthrough of key terms)

Client assigned a 3-day review window; automated reminder sent at 48 hours if not yet signed

If client requests changes: redline version tracked in PandaDoc; AI flags non-standard changes for Robert's attention

Negotiation notes logged in HubSpot deal record to preserve institutional knowledge for future renewals

Upon execution: signed copy auto-stored in Google Drive contract repository AND HubSpot document record

All parties receive executed copy automatically; Zapier triggers workflow activation in ClickUp and financial system

## Owner: PandaDoc workflow + Robert (negotiation decisions) + Account Manager (follow-up)

## Tools: PandaDoc, Loom, HubSpot, Google Drive, DocuSign, Zapier, ClickUp

SLA Target: Contract sent within 24 hours of approval. Execution target: within 5 business days of sending

## STEP 3

Obligation Tracking & Milestone Management

Trigger: Contract executed (signed) — all obligations extracted and loaded into tracking system within 1 hour

## Actions

AI parses executed contract to extract: deliverable due dates, payment schedules, reporting requirements, review meetings, compliance obligations

Each obligation loaded into ClickUp as a separate task with correct due date, owner assignment, and contract reference

Payment milestones synced to QuickBooks and GoHighLevel for automated invoice generation at correct intervals

Review meeting obligations added to Google Calendar with Zoom links auto-generated

Weekly obligation digest emailed to account manager: items due this week, items due next week, overdue items (if any)

30-day early warning system flags any obligation approaching due date without confirmed completion

## Owner: AI Extraction Engine + Zapier + ClickUp + Account Manager (obligation execution)

Tools: ClickUp, HubSpot, QuickBooks, GoHighLevel, Zapier, Google Calendar, Google Workspace

SLA Target: All obligations loaded into tracking system within 1 hour of execution. Zero missed deadlines policy

## STEP 4

Contract Performance Monitoring & Health Scoring

## Trigger: Continuous — weekly automated health assessment of all active contracts

## Actions

Contract health score calculated weekly for each active agreement: on-time deliverable rate, payment compliance, client satisfaction (NPS), milestone completion rate

Health score thresholds: Green (80-100), Yellow (60-79), Red (0-59) — Red contracts escalated to Robert immediately

Client sentiment tracked via: email response times, support ticket volume, NPS scores, and advisor call notes

AI flags potential contract performance risks: late deliverables, payment disputes, scope creep requests, decreased responsiveness

Monthly contract performance summary delivered to Robert: all active contracts, health scores, upcoming renewals, and risk alerts

Owner: Make.com health scoring + Account Manager (Yellow/Red intervention) + Robert (Red escalation)

## Tools: ClickUp, HubSpot, Make.com, Google Sheets, GoHighLevel, QuickBooks

SLA Target: Weekly health scores published by Monday 9:00 AM. Red alerts delivered to Robert within 2 hours

## STEP 5

Renewal Engagement & Negotiation

## Trigger: 90 days before contract expiry date

## Actions

90-day renewal alert activates: account manager briefed with contract performance summary, client satisfaction history, and recommended renewal approach

60-day: personalized renewal proposal sent to client recapping results delivered, ROI achieved, and next-year vision

45-day: discovery call booked to discuss renewed scope, pricing, and any new service additions

30-day: renewal contract drafted based on discovery call outcomes; sent for client review

If renewal at risk: Robert personally reaches out with video message (Loom) and custom retention offer

Renewal executed via same process as original contract (Step 2); all obligations reloaded into tracking system

Owner: Automation (90-day trigger) + Account Manager (60-45 day outreach) + Robert (at-risk renewals)

## Tools: GoHighLevel, HubSpot, PandaDoc, Calendly, Loom, Google Workspace

SLA Target: Renewal process begins exactly at day -90. Target: renewal decision by day -15

## STEP 6

Contract Closure, Repository Management & Lessons Learned

Trigger: Contract reaches end date without renewal OR early termination clause invoked by either party

## Actions

Contract closure checklist activated: all deliverables confirmed complete, all payments confirmed received or settled, client data and access rights decommissioned

Final client satisfaction survey sent with 5 targeted questions; results archived in HubSpot

Contract performance 'post-mortem' generated by AI: on-time delivery rate, profitability vs forecast, relationship quality score, lessons learned

Closed contract archived in Google Drive with indexed metadata (client name, service type, term, value, outcome) for future reference

Client moved to win-back nurture sequence if contract expired naturally (not terminated for cause)

Post-mortem findings fed into contract template improvements and pricing model updates quarterly

Owner: Account Manager (closure checklist) + AI (post-mortem generation) + Robert (lesson review)

## Tools: ClickUp, HubSpot, Google Drive, GoHighLevel, Google Workspace, Typeform

SLA Target: Closure checklist completed within 5 business days of contract end date

Integration Points

Upstream — Feeds Into This Workflow

Downstream — This Workflow Feeds Into

Sales Department (signed proposals, deal handoff)

Finance (payment schedules, invoice automation)

AfterCare Subscriptions (upgrade to contract)

AfterCare Memberships (premium clients invited to membership)

Fulfillment Department (deliverable schedules)

Marketing (case studies from completed contracts)

Legal / Compliance (approved clause library)

Culture Dept — Documentation (contract templates, SOPs)

Onboarding workflow (contract activation kickoff)

Sales (renewal pipeline, referral opportunities)

Key Tools & Technology Stack

Category

Tool Options

URC Current Tool

## Purpose

Contract Management (CLM)

PandaDoc, DocuSign CLM, Ironclad, ContractBook

PandaDoc

Drafting, e-signature, redlining, clause library

CRM

HubSpot, Salesforce, GoHighLevel

HubSpot

Contract records, deal history, renewal pipeline

Project Management

ClickUp, Asana, Monday.com

ClickUp

Obligation tracking, milestone management, task assignments

Document Repository

Google Drive, SharePoint, Dropbox

Google Drive

Executed contract storage, metadata indexing

Financial Integration

QuickBooks, Stripe, GoHighLevel

QuickBooks + GoHighLevel

Invoice automation, payment milestone tracking

Scheduling

Calendly, Google Calendar

Calendly + Google Calendar

Review meetings, renewal calls, milestone check-ins

Video Communication

Loom, Zoom, Google Meet

Loom + Zoom

Contract walkthrough, renewal personal messages

## Automation

Zapier, Make.com

Zapier + Make.com

Obligation extraction, cross-platform data sync

KPIs & Success Metrics

KPI / Metric

Measurement

Target (URC)

Client Default

## Notes / How to Measure

Contract Renewal Rate

% of contracts renewed at expiration

75%+

65%+

HubSpot renewal pipeline stage conversion tracking

On-Time Deliverable Rate

% of contract milestones met on time

95%+

90%+

ClickUp obligation tracker, weekly report

Payment Compliance Rate

% of invoices paid on or before due date

95%+

90%+

QuickBooks invoice aging report, monthly review

Contract Health Score Avg

Average health score across active contracts

80+ avg

75+ avg

Weekly Make.com + Google Sheets health dashboard

Contract Creation Time

Hours from deal hand-off to sent contract

Under 2 hours

Under 4 hours

HubSpot deal timestamps, time in stage

Renewal Engagement Start

% of renewals with process started 90 days out

100%

100%

HubSpot renewal alert automation confirmation log

Contract Portfolio Value

Total ARR under active long-term contracts

Track and grow

Track and grow

HubSpot deal value + QuickBooks revenue summary

Implementation Checklist

## PHASE 1 — Foundation (Week 1-2)

Build URC master contract template library in PandaDoc (minimum 3 templates: retainer, project-based, training)

Create AI-assisted field population rules in PandaDoc for client-specific auto-fill

Set up Google Drive contract repository with folder structure and naming convention (Year/Client/ContractType)

Build HubSpot contract pipeline: Draft, Sent, Negotiation, Executed, Active, Up for Renewal, Closed

Connect QuickBooks to HubSpot via Zapier for automatic invoice generation on contract execution

## PHASE 2 — Obligation Tracking (Week 3-4)

Create ClickUp obligation tracking template: auto-populated from contract milestone extract

Build Make.com automation to parse contract deliverable dates and push tasks to ClickUp

Set up weekly obligation digest email automation (Make.com -> GoHighLevel -> account manager inbox)

Create contract health scoring formula in Google Sheets with automatic weekly refresh

Build Red alert escalation flow: health score below 60 triggers immediate Slack/email to Robert

## PHASE 3 — Renewal Engine (Week 5-6)

Program 90-day renewal alert in HubSpot deal properties (auto-calculate from contract end date)

Build 90-60-45-30-day renewal email sequence in GoHighLevel with dynamic content blocks

Create renewal proposal template in Google Slides/PandaDoc (pre-populated with performance data)

Set up at-risk renewal escalation: trigger Robert Loom video request when renewal probability below 50%

Document negotiation note-capturing process: post-call summary format in HubSpot

## PHASE 4 — Repository & Analytics (Month 2+)

Migrate all existing contracts into new Google Drive repository with correct metadata tags

Build contract analytics dashboard in Google Sheets: portfolio value, renewal pipeline, health distribution

Run first post-mortem on a closed contract; capture lessons learned template

Review PandaDoc clause library against actual negotiated changes — update templates with commonly accepted modifications

Train all account managers on obligation tracking system and weekly digest review process

## Workflow 4: Communities

URC-AFC-04  |  Uncle Robert Consulting Master Version

Department Context

Communities are the multiplier in Uncle Robert Consulting's AfterCare strategy. While subscriptions, memberships, and contracts create individual client relationships, communities create collective belonging. A thriving URC community transforms transactional clients into invested advocates — people who stay, refer, and co-create value long after their initial engagement ends.

This workflow governs the complete lifecycle of URC's client-facing communities: from platform selection and community architecture through daily moderation, engagement programming, UGC amplification, and community health management. At 75-80% automation, the community runs itself except for the highest-value interactions that only Robert and his team can deliver.

## Workflow Purpose & Objectives

## Purpose

Build and operate a vibrant, self-sustaining client community that extends URC's value beyond individual service delivery, drives peer-to-peer learning, generates organic referrals, and creates deep brand loyalty through AI-powered community management and human-led culture.

Key Objectives

Establish a primary URC community platform housing all active clients, members, and alumni with 70%+ monthly engagement rate

Automate 75-80% of community management: moderation, welcome sequences, digest emails, event reminders, and content curation

Generate 25%+ of new client referrals through community-originated word-of-mouth by Month 6

Achieve 40%+ of community members posting or engaging at least once per week

Create a UGC (user-generated content) amplification pipeline that produces 5+ sharable client success stories per month

Build community-exclusive events and programming that community members cannot get elsewhere — increasing stickiness

## Automation Level

75-80%  |  AI handles welcome sequences, content curation, moderation alerts, event reminders, and engagement scoring; humans run live events, moderate culture, and build personal relationships

Human Involvement

Live events, culture-setting, conflict resolution, featured member recognition, community growth strategy

Cycle Time

Member onboarding: 24 hours. Content calendar: 30-day planning cycles. Events: weekly touchpoints

Detailed Step-by-Step Process

## STEP 1

Community Platform Setup & Architecture

## Trigger: New community launched OR community platform migrated to new solution

## Actions

Community platform selected and configured (Circle recommended for URC): spaces/channels created for each audience segment — General, Content Creators, Small Business Owners, Member Lounge (Gold+), Alumni Network

Membership access rules configured: Circle spaces linked to HubSpot membership tier data via API — Platinum members auto-access all spaces, Silver members access public spaces only

Community brand kit applied: URC colors, logo, cover images, welcome banner (all created in Canva Pro)

Community guidelines documented and pinned: communication standards, value exchange expectations, content rules, and escalation paths

Zapier integration connects Circle to HubSpot: new community join triggers CRM tag, member activity syncs to engagement score

## Owner: Robert (architecture decisions) + Account Manager (build execution)

## Tools: Circle, HubSpot, Zapier, Canva Pro, Google Workspace

SLA Target: Community platform fully operational before first member invitation sent

## STEP 2

New Member Onboarding & Community Activation

Trigger: New member joins community — triggered from membership enrollment, subscription upgrade, or direct invite

## Actions

Automated welcome sequence launches the moment member joins: welcome DM from the community bot (via Circle or Zapier), welcome post published in General space tagging new member

24-hour onboarding checklist sent via email: complete your profile, introduce yourself in the introduction channel, join your first live event, connect with 3 community members

AI assigns new member to appropriate sub-communities based on profile data: content creator path vs small business path

7-day activation challenge auto-posted to new member: 7 simple tasks to get maximum value from the community in first week

Account manager notified to send personal welcome message for any Gold or Platinum member joining

Owner: Circle automation + GoHighLevel email + Account Manager (Gold/Platinum personal welcome)

## Tools: Circle, GoHighLevel, HubSpot, Zapier, Make.com, Canva Pro

SLA Target: Welcome DM within 5 minutes of join. Onboarding checklist email within 30 minutes

## STEP 3

Content Programming & Engagement Automation

Trigger: Ongoing — monthly content calendar planned 30 days in advance; daily automated posts execute on schedule

## Actions

Monthly content calendar planned by account manager (Marcus) with Robert's input: weekly themes, featured members, discussion prompts, live event topics

Daily engagement posts scheduled in Circle: Monday motivation, Wednesday wins (member success story), Friday community challenge, Sunday resource drop

AI curates relevant external content weekly (industry news, trends, tools) and posts with URC commentary to keep community current

Discussion prompts auto-posted 3x/week to spaces based on member activity patterns — posted at peak engagement times

Weekly 'Community Digest' email auto-generated and sent every Friday: top posts, upcoming events, member spotlight, resource of the week

## Owner: Marcus (content calendar) + Make.com (scheduling automation) + AI (curation)

## Tools: Circle, Make.com, GoHighLevel, Canva Pro, Buffer/Hootsuite, Google Workspace

SLA Target: Monthly content calendar approved by 25th of prior month. Daily posts published without gaps

## STEP 4

Community Moderation & Health Management

Trigger: Continuous — AI moderation monitors all posts in real-time; human review queue updated hourly

## Actions

AI moderation tool scans all new posts and comments for: spam, off-topic content, negative sentiment, policy violations, and competitor promotion

Low-risk violations (spam, off-topic) auto-removed with friendly redirect message; member notified and guided to correct space

High-risk violations (harassment, hate speech, serious conflict) flagged immediately in moderation queue for human review within 1 hour

Community health metrics tracked weekly: new posts, comments, reactions, new members, member churn, engagement score distribution

Monthly community health report reviewed by Robert: identify top contributors, disengaged members, and cultural trends requiring attention

Quarterly 'community town hall' hosted live by Robert: open forum, Q&A, community wins celebration, roadmap sharing

Owner: Circle AI moderation + Account Manager (moderation queue review) + Robert (quarterly town hall)

## Tools: Circle, Make.com, HubSpot, GoHighLevel, Google Sheets, Zoom

SLA Target: Auto-moderation within seconds. Human review of flagged items within 1 hour. Town hall quarterly

## STEP 5

UGC Amplification & Member Success Storytelling

Trigger: Member posts a win, milestone, or testimonial in community OR account manager identifies a success story worth amplifying

## Actions

AI monitors community posts for success signals: mentions of revenue milestones, course completions, new clients, launches, or 'thank you' messages

Flagged success posts reviewed by Marcus; member contacted for permission to create a formal case study or social proof asset

With permission: story formatted by AI into multiple formats — community highlight post, email newsletter feature, social media graphic (Canva), testimonial quote card

Member featured on 'Wednesday Wins' community spotlight; content shared to URC social media with member's social tag

Best stories funneled to Marketing Department for full case study development

Member achievement logged in HubSpot: story type, permission level, formats created, distribution channels

## Owner: AI monitor + Marcus (curation and production) + Marketing Dept (full case studies)

## Tools: Circle, Make.com, Canva Pro, GoHighLevel, HubSpot, Buffer, Google Workspace

SLA Target: Win identified within 24 hours. Permission request sent within 48 hours. Content created within 72 hours

## STEP 6

Community Events, Live Programming & Growth

Trigger: Monthly live event calendar + weekly accountability sessions + quarterly growth campaigns

## Actions

Monthly event calendar published in community 30 days in advance: live Q&A with Robert, hot seat coaching, guest expert session, accountability check-ins

Event registration automated via Calendly or Circle event system; reminder sequence fires at 48 hours and 1 hour before each event

Post-event recap published in community within 24 hours: key takeaways, action items, recording link (for eligible members)

Community referral campaign runs quarterly: 'Invite a friend' promotion with bonus reward for referrer and discount for new join

Annual community growth goal tracked monthly: target membership count, engagement rate, referral rate, and new join cost

New member pipeline reviewed monthly: identify which channels bring the most engaged community members to invest more there

Owner: Marcus (event coordination) + Robert (live facilitation) + GoHighLevel (reminders/recaps)

## Tools: Circle, Calendly, Zoom, Loom, GoHighLevel, HubSpot, Canva Pro, Make.com

SLA Target: Monthly event calendar live by 25th of prior month. Event recaps published within 24 hours

Integration Points

Upstream — Feeds Into This Workflow

Downstream — This Workflow Feeds Into

AfterCare Memberships (access level determines community tier)

Marketing (UGC, testimonials, case studies, social proof)

AfterCare Subscriptions (subscriber community access as benefit)

Sales (referral pipeline from community members)

Fulfillment Dept (client success triggers community spotlight)

Culture Dept (community events shape agency culture)

Onboarding workflow (community join step in activation)

R&D (community feedback shapes new product/service ideas)

Marketing (content strategy aligns with community themes)

Fulfillment (community Q&A surfaces client service needs)

Key Tools & Technology Stack

Category

Tool Options

URC Current Tool

## Purpose

Community Platform

Circle, Mighty Networks, Slack, Discord, Bettermode

Circle

Primary community home, spaces, events, DMs

CRM Integration

HubSpot, Zapier, Circle API

HubSpot + Zapier

Member sync, engagement scoring, CRM tagging

Content Scheduling

Buffer, Hootsuite, Make.com, Circle native

Make.com + Circle

Daily post automation, content calendar execution

Event Hosting

Zoom, Luma, Calendly, Circle Events

Zoom + Calendly

Live events, Q&A sessions, accountability calls

AI Moderation

Circle moderation, Perspective API, custom Make.com

Circle + Make.com

Content filtering, violation detection, queue management

Content Creation

Canva Pro, Adobe Express, Loom

Canva Pro + Loom

Spotlights, event graphics, recap videos

Email / Notifications

GoHighLevel, Mailchimp, Circle notifications

GoHighLevel + Circle

Weekly digest, event reminders, re-engagement

Analytics

Circle analytics, Google Sheets, HubSpot

Circle + Google Sheets

Engagement scoring, health reports, growth tracking

KPIs & Success Metrics

KPI / Metric

Measurement

Target (URC)

Client Default

## Notes / How to Measure

Monthly Engagement Rate

% of active members posting or reacting weekly

40%+

30%+

Circle analytics dashboard, weekly export

Community Referral Rate

% of new clients sourced from community referrals

25%+

15%+

HubSpot source attribution on new deal records

Member Churn Rate

% of members leaving the community per month

Under 5%

Under 8%

Circle membership change report, monthly

Event Attendance Rate

% of members attending monthly live events

20%+

15%+

Zoom/Circle event attendance reports

UGC Production Rate

# of success stories amplified per month

5+ per month

3+ per month

Manual tracking in Google Sheets content calendar

New Member Activation Rate

% completing 7-day activation challenge

60%+

50%+

Make.com automation completion tracking

Community NPS

Net Promoter Score from quarterly member pulse survey

45+

35+

Typeform survey, quarterly; HubSpot results log

Implementation Checklist

## PHASE 1 — Platform Build (Week 1-2)

Select and configure community platform (Circle recommended); set up spaces by audience segment

Design community brand kit in Canva Pro: cover images, welcome banner, space icons, event templates

Write and pin community guidelines in all primary spaces

Connect Circle to HubSpot via Zapier: member join triggers CRM tag, activity syncs to engagement record

Configure tier-based access rules: membership tier in HubSpot drives space access in Circle

## PHASE 2 — Onboarding & Content Engine (Week 3-4)

Build automated welcome sequence: Circle DM + GoHighLevel email + 7-day activation challenge

Create 30-day starter content calendar: themes, post templates, discussion prompts for each space

Set up Make.com automation for daily scheduled posts (Monday through Sunday content types)

Build weekly Community Digest email template in GoHighLevel with dynamic content blocks

Create AI moderation rules in Circle; connect high-risk flags to Make.com human review queue

## PHASE 3 — Events & Amplification (Week 5-6)

Plan and publish first 3 months of live event calendar (at least 1 event per month minimum)

Build event reminder automation: 48-hour and 1-hour reminders via GoHighLevel

Create UGC monitoring alert in Make.com: success signal keywords trigger account manager review queue

Design 5 Canva Pro templates for member spotlights, wins posts, and event graphics

Set up community referral program: referral link tracking in HubSpot, reward delivery via GoHighLevel

## PHASE 4 — Growth & Optimize (Month 2+)

Launch founding member campaign: first 50 members get founding member badge and locked-in access pricing

Review first community health report; identify top 10 most engaged members for ambassador program

Build community analytics dashboard in Google Sheets with weekly automated data import from Circle

Host first quarterly town hall with Robert; record and distribute replay to all members

Conduct NPS survey at 90-day mark; use results to prioritize community improvements for Month 4-6

PART TWO  —  CLIENT TEMPLATE EDITION

Blank workflow templates with [BRACKETED] fields — ready for any agency or business to customize and implement.

## Workflow 1: Subscriptions

TEMPLATE-AFC-01  |  Client Template Edition — Customize All [BRACKETED] Fields

HOW TO USE THIS TEMPLATE

This Client Template Edition is designed for agencies and businesses implementing the AfterCare Department for the first time. Every field shown in [BRACKETS] must be replaced with your specific information before using this workflow.

Instructions:

Replace ALL [BRACKETED FIELDS] with your company-specific information, team members, tools, and metrics

Review each SLA Target and adjust to match your team's realistic capacity

Replace KPI targets with your baseline goals for Year 1 — these can be tightened once you have operational data

The tool options column shows alternatives — select the one that matches your current tech stack

Keep the Implementation Checklist phases and sequence — they are in the correct order based on dependency logic

Department Context

[COMPANY NAME]'s AfterCare Department protects recurring revenue and client relationships through systematic retention management. The Subscriptions workflow governs all subscription-based products and services offered by [COMPANY NAME] to its clients.

This workflow is built for [DESCRIBE YOUR SUBSCRIPTION OFFERING — e.g., monthly coaching, SaaS tool access, content library, done-for-you service retainer]. Adapt each step to match the nature of your subscription product and your clients' expectations.

## Workflow Purpose & Objectives

## Purpose

Build an AI-powered subscription lifecycle management system for [COMPANY NAME] that maximizes retention, predicts churn, automates renewals, and delivers a seamless subscriber experience.

Key Objectives

Achieve [TARGET RETENTION RATE, e.g., 80%+] monthly subscription retention rate

Automate [TARGET AUTOMATION %, e.g., 80%+] of subscription lifecycle management

Reduce involuntary churn by [TARGET %, e.g., 70%+] using dunning automation

Identify at-risk subscribers [DAYS, e.g., 14-21 days] before cancellation

Convert [TARGET %, e.g., 20-30%] of cancellation attempts into saves or pauses

Provide [OWNER/LEADERSHIP NAME] with real-time visibility into MRR and churn

## Automation Level

[TARGET AUTOMATION LEVEL, e.g., 80-85%]  |  AI handles [LIST KEY AUTOMATED TASKS]; humans manage [LIST HUMAN TASKS]

Human Involvement

[DESCRIBE: Who handles exceptions? What requires personal judgment?]

Cycle Time

[DEFINE: How long does renewal take? How long is the win-back sequence?]

Detailed Step-by-Step Process

## STEP 1

Subscriber Enrollment & Profile Setup

Trigger: [DESCRIBE YOUR TRIGGER — e.g., new subscriber completes checkout via [YOUR PAYMENT PROCESSOR]]

## Actions

[PAYMENT PROCESSOR] webhook fires to [YOUR CRM] and [YOUR EMAIL PLATFORM]

Subscriber profile created in [CRM NAME] with: plan tier, billing cycle, start date, payment method, source channel

Welcome sequence launched: [DESCRIBE YOUR WELCOME TOUCHPOINTS AND TIMING]

Subscriber added to [SEGMENT NAME] in [EMAIL PLATFORM] based on plan type

Baseline engagement score set at 100 in subscription health tracker

Task created for [ACCOUNT MANAGER ROLE] to complete [X]-day onboarding touchpoint

## Owner: [AUTOMATION PLATFORM] + [ROLE NAME] (check-in)

## Tools: [LIST YOUR TOOLS: payment processor, CRM, email platform, project management]

SLA Target: Welcome sequence delivered within [TIME, e.g., 10 minutes] of successful payment

## STEP 2

Ongoing Engagement Monitoring & Health Scoring

Trigger: [DESCRIBE FREQUENCY — e.g., Daily automated scan of all active subscriber activity]

## Actions

[MONITORING TOOL] tracks: [LIST YOUR ENGAGEMENT SIGNALS — e.g., login frequency, email opens, support tickets]

Subscriber health score updated [FREQUENCY] on a 0-100 scale: Green ([RANGE]), Yellow ([RANGE]), Red ([RANGE])

Behavioral patterns fed into churn prediction — subscribers showing [NUMBER]+ risk signals flagged for intervention

Monthly 'Subscriber Value Report' auto-generated showing ROI of subscription to the client

Upsell triggers activated when subscriber hits [%] of plan capacity

## Owner: [MONITORING TOOL] (automated) + [ROLE NAME] (Red subscriber outreach)

## Tools: [LIST TOOLS]

SLA Target: Health scores updated [FREQUENCY]. Red flags escalated within [TIME]

## STEP 3

Renewal Processing & Dunning Management

## Trigger: [NUMBER] days before renewal date OR payment failure detected

## Actions

Renewal reminder sequence launches at day -[NUMBER]: [DESCRIBE YOUR REMINDER SEQUENCE]

On renewal date, [PAYMENT PROCESSOR] processes payment; success triggers confirmation email

If payment fails: smart dunning sequence activates — retry at day [1, 3, 5, 7] with updated card request

Failed payment subscriber receives [EMAIL/SMS] at day [NUMBER] with one-click payment update link

At day [NUMBER] of failed payment: personal message from [OWNER NAME] with offer to pause instead of cancel

Voluntary pause option presented as alternative: [X]-month pause with automatic resumption

Owner: [PAYMENT PROCESSOR] + [EMAIL/SMS PLATFORM] + [OWNER ROLE] (personal message template)

## Tools: [LIST TOOLS]

SLA Target: First dunning email within [TIME] of failed payment. Final resolution within [X] days

## STEP 4

Churn Detection & Save Flow Activation

Trigger: Subscriber initiates cancellation OR churn score drops below [THRESHOLD] OR engagement drops [%] in [DAYS] days

## Actions

Cancellation attempt intercepted: subscriber presented with [DESCRIBE YOUR SAVE OPTIONS — pause, downgrade, discount]

Exit survey captures cancellation reason: [LIST YOUR REASON CATEGORIES]

Save offer generated based on reason: [MAP EACH REASON TO A SAVE OFFER]

Alert sent to [ROLE NAME] for any subscriber spending $[AMOUNT]+/month attempting to cancel

If not saved: graceful offboarding — data export, final check-in, alumni discount for future resubscription

## Owner: [PLATFORM] save flow + [ROLE] (high-value escalation)

## Tools: [LIST TOOLS]

SLA Target: Save flow triggers within [TIME]. Human escalation within [TIME] for high-value subscribers

## STEP 5

Win-Back Campaign for Cancelled Subscribers

## Trigger: Subscription cancelled AND [NUMBER] days have passed

## Actions

Former subscriber enters win-back sequence: [DESCRIBE YOUR TOUCHPOINT SCHEDULE]

[PLATFORM] personalizes message based on cancellation reason from exit survey

Special offer generated at [NUMBER]-day mark: [DESCRIBE YOUR WIN-BACK OFFER]

High-value former subscribers receive personal [EMAIL/VIDEO] message from [OWNER NAME]

Win-back conversions tracked separately in [CRM] to measure campaign ROI

## Owner: [EMAIL PLATFORM] automation + [OWNER ROLE] (personal messages for high-value)

## Tools: [LIST TOOLS]

SLA Target: Win-back sequence auto-launches at day [NUMBER] post-cancellation

## STEP 6

Subscription Reporting & Optimization

Trigger: [FREQUENCY, e.g., Weekly automated report every Monday] + monthly deep-dive on [DAY]

## Actions

[REPORTING TOOL] generates weekly report: MRR, new subscribers, cancellations, save rate, dunning recovery rate

Monthly cohort analysis shows retention by [YOUR KEY DIMENSIONS]

Churn prediction model retrained monthly with new cancellation data

A/B test results reviewed; winning variants implemented, new tests launched

[OWNER NAME] receives executive summary with top 3 action items highlighted

## Owner: AI Reporting Engine (automated) + [OWNER ROLE] (strategy review)

## Tools: [LIST TOOLS]

SLA Target: Weekly report by [TIME] on [DAY]. Monthly report by [TIME] on [DATE]

Integration Points

Upstream — Feeds Into This Workflow

Downstream — This Workflow Feeds Into

[SALES/ACQUISITION DEPARTMENT] (new subscriber handoff)

AfterCare Memberships (tier upgrade pathway)

[SERVICE DELIVERY DEPT] (engagement data)

[SERVICE DELIVERY DEPT] (active subscriber service queue)

[ONBOARDING WORKFLOW] (activation gate)

[FINANCE SYSTEM] (MRR reporting)

[MARKETING] (acquisition campaigns)

[MARKETING] (testimonials, case studies)

[PAYMENT PROCESSOR] (billing events)

AfterCare Communities (subscriber community access)

Key Tools & Technology Stack

Category

Tool Options

Your Current Tool

## Purpose

Payment Processing

Stripe, PayPal, Square, GoHighLevel Payments

[YOUR PAYMENT TOOL]

Subscription billing, dunning, payment recovery

CRM & Automation

HubSpot, GoHighLevel, ActiveCampaign, Keap

[YOUR CRM]

Subscriber lifecycle management

Churn Prediction

ChurnZero, Pecan AI, Churnly, ProfitWell

[YOUR CHURN TOOL]

Health scoring, churn prediction

Email/SMS Marketing

GoHighLevel, Mailchimp, Klaviyo

[YOUR EMAIL TOOL]

Renewal sequences, dunning, win-back

Integration/Automation

Zapier, Make.com, native webhooks

[YOUR AUTOMATION TOOL]

Cross-platform data sync

Reporting

Google Sheets, HubSpot Reports, Databox

[YOUR REPORTING TOOL]

MRR dashboard, cohort analysis

Project Management

ClickUp, Asana, Notion

[YOUR PM TOOL]

Account manager tasks, escalations

Video Personalization

Loom, Vidyard, BombBomb

[YOUR VIDEO TOOL]

Personal win-back messages

KPIs & Success Metrics

KPI / Metric

Measurement

Target (URC)

Client Default

## Notes / How to Measure

Monthly Retention Rate

% subscribers retained MoM

[YOUR TARGET, e.g., 80%+]

[CLIENT DEFAULT, e.g., 75%+]

Track in CRM or subscription reporting tool

MRR Growth

Month-over-month MRR change

[YOUR TARGET]

Positive growth

Payment processor or CRM revenue dashboard

Failed Payment Recovery

% of failed payments recovered

[YOUR TARGET, e.g., 70%+]

[DEFAULT, e.g., 60%+]

Dunning platform analytics

Cancellation Save Rate

% of cancellation attempts saved

[YOUR TARGET, e.g., 20-30%]

[DEFAULT, e.g., 15%+]

Save flow conversion tracking in CRM

Win-Back Conversion Rate

% of cancelled subscribers returning

[YOUR TARGET, e.g., 8-12%]

[DEFAULT, e.g., 5%+]

CRM win-back campaign reports

Subscriber Health Score Avg

Average score across active subscribers

[YOUR TARGET, e.g., 65+]

[DEFAULT, e.g., 60+]

Weekly automated health dashboard

Churn Prediction Accuracy

% accuracy of churn risk flags

[YOUR TARGET, e.g., 75%+]

[DEFAULT, e.g., 70%+]

Monthly: compare predictions vs actual

Implementation Checklist

## PHASE 1 — Foundation (Week 1-2)

Set up [PAYMENT PROCESSOR] subscription products for each plan tier

Connect [PAYMENT PROCESSOR] to [CRM] via [AUTOMATION TOOL] webhooks

Build subscriber CRM pipeline with enrollment, active, at-risk, cancelled stages

Create subscriber welcome email and SMS sequence in [EMAIL PLATFORM]

Build [REPORTING TOOL] MRR dashboard with automated data import

## PHASE 2 — Automation (Week 3-4)

Build [NUMBER]-step dunning sequence in [EMAIL/SMS PLATFORM] for failed payments

Create pause/downgrade landing page as alternative to cancellation

Build engagement health scoring in [AUTOMATION TOOL] using [CRM] activity data

Set up Red-score alert: triggers [PM TOOL] task for account manager

Create A/B test framework for renewal email subject lines

## PHASE 3 — Retention Flows (Week 5-6)

Build cancellation save flow with reason capture, dynamic offers, and graceful offboarding

Create [NUMBER]-touch win-back campaign in [EMAIL PLATFORM] with churn-reason personalization

Record [VIDEO TOOL] templates for high-value subscriber personal win-back messages

Set up weekly report automation: [AUTOMATION TOOL] triggers summary email to [OWNER]

Launch first cohort analysis to establish baseline retention benchmarks

## PHASE 4 — Optimization (Month 2+)

Review first month A/B test results; implement winning sequences permanently

Evaluate churn prediction accuracy; refine scoring factors with real data

Add upsell trigger automation when subscribers hit [%] of plan usage

Document all processes in [DOCUMENTATION TOOL] SOP library for team training

Conduct quarterly pricing review using MRR and churn data

## Workflow 2: Memberships

TEMPLATE-AFC-02  |  Client Template Edition — Customize All [BRACKETED] Fields

HOW TO USE THIS TEMPLATE

This Client Template Edition is designed for agencies and businesses implementing the AfterCare Department for the first time. Every field shown in [BRACKETS] must be replaced with your specific information before using this workflow.

Instructions:

Replace ALL [BRACKETED FIELDS] with your company-specific information, team members, tools, and metrics

Review each SLA Target and adjust to match your team's realistic capacity

Replace KPI targets with your baseline goals for Year 1 — these can be tightened once you have operational data

The tool options column shows alternatives — select the one that matches your current tech stack

Keep the Implementation Checklist phases and sequence — they are in the correct order based on dependency logic

## Workflow Purpose & Objectives

## Purpose

Design and operate a tiered membership program for [COMPANY NAME] that converts best clients into committed long-term community members through AI-powered engagement automation.

Key Objectives

Build a [NUMBER]-tier membership structure ([TIER NAMES]) with clear benefits and upgrade pathways

Automate [TARGET %] of membership lifecycle management

Achieve [TARGET %] annual membership renewal rate

Drive engagement scores above [TARGET] for all active members using gamification

Convert [TARGET %] of standard subscribers to membership within [NUMBER] days

Generate [TARGET %] of new enrollments through existing member referrals

## Automation Level

[TARGET %]  |  AI manages [LIST]; humans deliver [LIST]

Human Involvement

[DESCRIBE HUMAN ROLES IN MEMBERSHIP PROGRAM]

Cycle Time

[DESCRIBE: Onboarding timeline, renewal cycle, upgrade review frequency]

Detailed Step-by-Step Process

## STEP 1

Membership Enrollment & Tier Assignment

## Trigger: [DESCRIBE HOW CLIENTS ENROLL — sales call, upgrade offer, direct application]

## Actions

Membership contract generated via [CONTRACT TOOL] with tier-specific benefits and commitments

Payment processed via [PAYMENT TOOL]; CRM record created with tier, start date, benefits, renewal date

Welcome package triggered: [DESCRIBE YOUR WELCOME SEQUENCE AND TIMING]

Member onboarded to [COMMUNITY PLATFORM]: [DESCRIBE ACCESS BY TIER]

Onboarding call scheduled for [TIERS] within [TIME WINDOW] of enrollment

[ROLE] assigned and notified: complete [NUMBER]-day membership activation checklist

## Owner: [ENROLLMENT AUTOMATION] + [ROLE] (onboarding call)

## Tools: [LIST YOUR TOOLS]

SLA Target: Welcome package within [TIME]. Onboarding call booked within [TIME]

## STEP 2

Member Engagement Tracking & Gamification

## Trigger: Continuous — [FREQUENCY] engagement scan of all active member activity

## Actions

Engagement engine monitors: [LIST YOUR ENGAGEMENT SIGNALS]

Points system: [DESCRIBE YOUR POINTS STRUCTURE — what earns points and how many]

Members reaching milestones receive: [DESCRIBE YOUR RECOGNITION SYSTEM]

Monthly 'Member Activity Report' auto-generated per member

Disengaged members ([NUMBER]+ days no activity) receive personalized re-engagement message

## Owner: [AUTOMATION TOOL] + [ROLE] (personal re-engagement for premium tiers)

## Tools: [LIST TOOLS]

SLA Target: Engagement data updated [FREQUENCY]. Re-engagement trigger fires within [TIME]

## STEP 3

Benefits Delivery & Advisory Session Management

## Trigger: [BENEFIT DELIVERY SCHEDULE — monthly, quarterly] OR member request

## Actions

[SCHEDULING TOOL] advisory slots published [ADVANCE NOTICE] in advance; [PREMIUM TIERS] get priority booking

Pre-[CALL/SESSION] prep brief auto-generated [TIME] before: member's recent activity, open questions, goals

Post-session action items captured and logged in [CRM] member record

Exclusive content delivered to members by tier: [MAP EACH TIER TO ITS CONTENT DELIVERY]

Quarterly 'Membership Value Review' email auto-sent with results delivered

## Owner: [SCHEDULING TOOL] + [OWNER ROLE] (sessions themselves)

## Tools: [LIST TOOLS]

SLA Target: Benefits delivered on schedule. Session summaries in [CRM] within [TIME]

## STEP 4

Tier Upgrade Identification & Promotion

Trigger: Member engagement score exceeds tier threshold for [NUMBER] consecutive days OR [ROLE] nomination

## Actions

Upgrade qualification checked [FREQUENCY]: [LIST YOUR UPGRADE CRITERIA]

Qualified candidates receive [PERSONAL MESSAGE FROM OWNER] explaining eligibility and next-tier benefits

Upgrade offer sent with [DESCRIBE INCENTIVE, e.g., first month discounted]

If accepted: tier upgrades automatically; new benefits activate within [TIME]

If declined: member stays at tier; reason captured; follow-up in [NUMBER] days

## Owner: [AUTOMATION TOOL] + [OWNER ROLE] (upgrade message)

## Tools: [LIST TOOLS]

SLA Target: Upgrade report by [DATE]. Offer delivered within [TIME] of qualification

## STEP 5

Annual Renewal & Retention Management

## Trigger: [NUMBER] days before annual membership renewal date

## Actions

[NUMBER]-day renewal campaign: [DESCRIBE YOUR EMAIL SEQUENCE — content, timing, incentives]

If no renewal: cancellation trigger activates save flow with membership-specific offers

Post-renewal: [ROLE] sends personal thank-you and books annual goal-setting session

## Owner: [EMAIL PLATFORM] renewal automation + [ROLE] (personal thank-you)

## Tools: [LIST TOOLS]

SLA Target: Campaign begins exactly [NUMBER] days before renewal. Confirmation within [TIME] of payment

## STEP 6

Membership Performance Reporting & Optimization

## Trigger: Monthly automated report on [DAY] + quarterly deep-dive

## Actions

Monthly membership dashboard: active members by tier, MRR, renewal rate, engagement score, top members

Referral tracking report: which members drive most new enrollments

Benefits utilization report: identify under-used benefits for enhancement

NPS survey auto-sent quarterly; results aggregated for program improvement roadmap

[OWNER] reviews report and prioritizes [NUMBER] program improvements

## Owner: [AUTOMATION TOOL] + [OWNER ROLE] (quarterly review)

## Tools: [LIST TOOLS]

SLA Target: Monthly report by [TIME] on [DATE]. NPS compiled within [NUMBER] days of survey close

Key Tools & Technology Stack

Category

Tool Options

Your Current Tool

## Purpose

Membership Platform

Circle, Mighty Networks, Kajabi, GoHighLevel

[YOUR PLATFORM]

Community, member management, content delivery

CRM

HubSpot, GoHighLevel, Salesforce

[YOUR CRM]

Member lifecycle, benefit logging, renewals

Payment & Billing

Stripe, PayPal, GoHighLevel Payments

[YOUR PAYMENT TOOL]

Membership billing, tier upgrades, proration

Contract Management

PandaDoc, DocuSign, HelloSign

[YOUR CONTRACT TOOL]

Membership agreements

Advisory Scheduling

Calendly, Acuity, Cal.com

[YOUR SCHEDULING TOOL]

Advisory session booking

Gamification

Make.com logic, Circle badges, custom scoring

[YOUR GAMIFICATION TOOL]

Points, milestone recognition

Video Personalization

Loom, Vidyard, BombBomb

[YOUR VIDEO TOOL]

Upgrade offers, session summaries

Reporting

Google Sheets, HubSpot, Databox

[YOUR REPORTING TOOL]

Dashboard, engagement, NPS

KPIs & Success Metrics

KPI / Metric

Measurement

Target (URC)

Client Default

## Notes / How to Measure

Annual Renewal Rate

% memberships renewed at expiry

[YOUR TARGET]

[CLIENT DEFAULT]

CRM membership pipeline renewal tracking

Engagement Score Avg

Average score across active members

[YOUR TARGET]

[CLIENT DEFAULT]

Monthly automated dashboard

Tier Upgrade Rate

% upgrading within 12 months

[YOUR TARGET]

[CLIENT DEFAULT]

CRM tier transition reports

Benefits Utilization

% of available benefits actively used

[YOUR TARGET]

[CLIENT DEFAULT]

Benefit activation tracking per member

Referral Rate

% of new members from referrals

[YOUR TARGET]

[CLIENT DEFAULT]

CRM source attribution

NPS Score

Net Promoter Score (quarterly survey)

[YOUR TARGET]

[CLIENT DEFAULT]

Survey tool, quarterly; CRM results log

Member LTV

Average total revenue per member

[YOUR TARGET]

[CLIENT DEFAULT]

CRM revenue timeline per member

Implementation Checklist

## PHASE 1 — Program Design (Week 1-2)

Define [NUMBER] membership tiers with benefits, pricing, access levels, and upgrade criteria

Create membership agreement template in [CONTRACT TOOL] with tier addenda

Set up [PAYMENT TOOL] products for each tier with correct billing cycle

Build member CRM pipeline in [CRM]: Prospect, Enrolled, Active, Up for Renewal, Lapsed

Configure [COMMUNITY PLATFORM] with tier-specific access channels

## PHASE 2 — Onboarding & Engagement (Week 3-4)

Build [NUMBER]-day member welcome sequence in [EMAIL PLATFORM]

Set up [SCHEDULING TOOL] advisory calendar with tier-based booking windows

Create engagement point scoring in [AUTOMATION TOOL] connected to [CRM]

Design digital membership card and milestone badge templates

Build monthly member activity report in [REPORTING TOOL]

## PHASE 3 — Renewal & Upgrade Flows (Week 5-6)

Build [NUMBER]-day annual renewal campaign in [EMAIL PLATFORM]

Create tier upgrade qualification logic in [AUTOMATION TOOL]

Record video templates for upgrade offers at each tier transition

Set up quarterly NPS survey with [CRM] sync

Build referral tracking system with member attribution reports

## PHASE 4 — Scale & Optimize (Month 2+)

Launch founding member cohort with founding pricing to create urgency

Review NPS results; prioritize top [NUMBER] benefit improvements

Add benefits utilization tracking to identify underperforming elements

Document all membership processes in [DOCUMENTATION TOOL] SOP library

Evaluate P&L: ensure member LTV exceeds [MULTIPLIER]x annual fee at each tier

## Workflow 3: Long-Term Contracts

TEMPLATE-AFC-03  |  Client Template Edition — Customize All [BRACKETED] Fields

HOW TO USE THIS TEMPLATE

This Client Template Edition is designed for agencies and businesses implementing the AfterCare Department for the first time. Every field shown in [BRACKETS] must be replaced with your specific information before using this workflow.

Instructions:

Replace ALL [BRACKETED FIELDS] with your company-specific information, team members, tools, and metrics

Review each SLA Target and adjust to match your team's realistic capacity

Replace KPI targets with your baseline goals for Year 1 — these can be tightened once you have operational data

The tool options column shows alternatives — select the one that matches your current tech stack

Keep the Implementation Checklist phases and sequence — they are in the correct order based on dependency logic

## Workflow Purpose & Objectives

## Purpose

Implement a contract lifecycle management (CLM) system for [COMPANY NAME] that tracks every obligation, milestone, and renewal date with zero missed deadlines and maximum renewal conversion.

Key Objectives

Eliminate missed contract milestones and renewal windows with automated obligation tracking

Reduce contract creation cycle time by [TARGET %] using AI-assisted drafting

Achieve [TARGET %] contract renewal rate through proactive engagement

Build a searchable contract repository for instant retrieval of any clause

Automate compliance monitoring for all active contractual obligations

Give [OWNER/LEADERSHIP] real-time visibility into all active agreements

## Automation Level

[TARGET %]  |  AI handles [LIST]; humans conduct [LIST]

Human Involvement

[DESCRIBE: Negotiations, custom term approvals, dispute resolution]

Cycle Time

[DEFINE: Contract creation time, signing window, renewal engagement period]

Detailed Step-by-Step Process

## STEP 1

Contract Drafting & Template Selection

Trigger: [DESCRIBE YOUR TRIGGER — e.g., signed proposal accepted, deal reaches Contract stage in CRM]

## Actions

AI reviews deal record in [CRM]: service type, duration, payment terms, deliverables, and custom notes

Contract template selected from [COMPANY NAME] clause library based on: [LIST YOUR SERVICE CATEGORIES]

AI drafts contract populating: [LIST THE FIELDS AUTO-POPULATED FROM CRM DATA]

Custom clause recommendations generated based on deal specifics

Draft sent to [REVIEW ROLE] for [TIME WINDOW] review before client delivery

## Owner: AI Drafting Engine ([CONTRACT TOOL]) + [REVIEW ROLE]

## Tools: [LIST YOUR TOOLS]

SLA Target: Draft ready within [TIME]. Human review within [TIME]

## STEP 2

Contract Delivery, Negotiation & Execution

## Trigger: Contract draft approved AND client ready to review

## Actions

Contract sent via [CONTRACT TOOL] with [DESCRIBE: e-signature, video walkthrough, review instructions]

Client assigned [NUMBER]-day review window; reminder at [NUMBER] hours if not signed

If client requests changes: redline tracked in [CONTRACT TOOL]; non-standard changes flagged for [ROLE]

Negotiation notes logged in [CRM] to preserve institutional knowledge

Upon execution: signed copy stored in [REPOSITORY] and [CRM] document record

[AUTOMATION TOOL] triggers workflow activation in [PM TOOL] and [FINANCIAL SYSTEM]

## Owner: [CONTRACT TOOL] workflow + [NEGOTIATOR ROLE] + [ACCOUNT MANAGER ROLE]

## Tools: [LIST TOOLS]

SLA Target: Contract sent within [TIME]. Execution target: within [DAYS] business days

## STEP 3

Obligation Tracking & Milestone Management

Trigger: Contract executed — all obligations extracted and loaded into tracking system within [TIME]

## Actions

AI parses executed contract to extract: [LIST: deliverable dates, payment schedules, review meetings, compliance items]

Each obligation loaded into [PM TOOL] as task with due date, owner, and contract reference

Payment milestones synced to [FINANCIAL SYSTEM] for automated invoice generation

Review meeting obligations added to [CALENDAR TOOL] with [VIDEO TOOL] links

Weekly obligation digest emailed to [ROLE]: items due this week, next week, and any overdue

[NUMBER]-day early warning flags any obligation approaching due date without confirmed completion

## Owner: AI Extraction + [AUTOMATION TOOL] + [PM TOOL] + [ROLE] (execution)

## Tools: [LIST TOOLS]

SLA Target: All obligations loaded within [TIME] of execution. Zero missed deadlines policy

## STEP 4

Contract Performance Monitoring & Health Scoring

## Trigger: Continuous — [FREQUENCY] automated health assessment of all active contracts

## Actions

Contract health score calculated [FREQUENCY]: [LIST YOUR SCORING FACTORS]

Health score thresholds: Green ([RANGE]), Yellow ([RANGE]), Red ([RANGE])

Client sentiment tracked via: [LIST YOUR SENTIMENT SIGNALS]

AI flags risks: [LIST YOUR RISK SIGNALS — late deliverables, payment disputes, scope creep]

Monthly contract summary for [OWNER]: all active, health scores, upcoming renewals, risks

## Owner: [AUTOMATION TOOL] health scoring + [ROLE] (Yellow/Red) + [OWNER] (Red escalation)

## Tools: [LIST TOOLS]

SLA Target: Weekly scores by [DAY/TIME]. Red alerts to [OWNER] within [TIME]

## STEP 5

Renewal Engagement & Negotiation

## Trigger: [NUMBER] days before contract expiry date

## Actions

[NUMBER]-day renewal alert activates: [ROLE] briefed with performance summary and renewal approach

[NUMBER]-day: personalized renewal proposal sent recapping results and next-year vision

[NUMBER]-day: discovery call booked to discuss renewed scope and pricing

[NUMBER]-day: renewal contract drafted based on discovery call; sent for review

If renewal at risk: [OWNER] personally reaches out with custom retention offer

Renewal executed via same process as original; obligations reloaded into tracking system

Owner: Automation ([NUMBER]-day trigger) + [ROLE] ([NUMBER]-[NUMBER] day outreach) + [OWNER] (at-risk)

## Tools: [LIST TOOLS]

SLA Target: Process begins at day -[NUMBER]. Renewal decision by day -[NUMBER]

## STEP 6

Contract Closure, Repository & Lessons Learned

## Trigger: Contract reaches end date without renewal OR early termination invoked

## Actions

Closure checklist: all deliverables confirmed, payments received or settled, access rights decommissioned

Final client satisfaction survey sent with [NUMBER] targeted questions; results archived in [CRM]

Contract performance post-mortem generated: delivery rate, profitability, relationship quality, lessons

Closed contract archived in [REPOSITORY] with indexed metadata: [LIST YOUR METADATA FIELDS]

Client moved to win-back nurture sequence if expired naturally

Post-mortem findings fed into template improvements and pricing model quarterly

## Owner: [ROLE] (closure checklist) + AI (post-mortem) + [OWNER] (lesson review)

## Tools: [LIST TOOLS]

SLA Target: Closure checklist within [NUMBER] business days of contract end

Key Tools & Technology Stack

Category

Tool Options

Your Current Tool

## Purpose

Contract Management (CLM)

PandaDoc, DocuSign CLM, Ironclad, ContractBook

[YOUR CLM TOOL]

Drafting, e-signature, redlining, clause library

CRM

HubSpot, Salesforce, GoHighLevel

[YOUR CRM]

Contract records, deal history, renewal pipeline

Project Management

ClickUp, Asana, Monday.com

[YOUR PM TOOL]

Obligation tracking, milestone management

Document Repository

Google Drive, SharePoint, Dropbox

[YOUR REPOSITORY]

Executed contract storage, metadata indexing

Financial Integration

QuickBooks, Stripe, GoHighLevel

[YOUR FINANCE TOOL]

Invoice automation, payment tracking

Scheduling

Calendly, Google Calendar

[YOUR SCHEDULING TOOL]

Review meetings, renewal calls

Video Communication

Loom, Zoom, Google Meet

[YOUR VIDEO TOOL]

Contract walkthrough, renewal messages

## Automation

Zapier, Make.com

[YOUR AUTOMATION TOOL]

Obligation extraction, data sync

KPIs & Success Metrics

KPI / Metric

Measurement

Target (URC)

Client Default

## Notes / How to Measure

Contract Renewal Rate

% of contracts renewed at expiration

[YOUR TARGET]

[CLIENT DEFAULT]

CRM renewal pipeline conversion tracking

On-Time Deliverable Rate

% of milestones met on time

[YOUR TARGET]

[CLIENT DEFAULT]

PM tool obligation tracker, weekly report

Payment Compliance Rate

% of invoices paid on time

[YOUR TARGET]

[CLIENT DEFAULT]

Financial system invoice aging report

Contract Health Score Avg

Average score across active contracts

[YOUR TARGET]

[CLIENT DEFAULT]

Weekly automated health dashboard

Contract Creation Time

Hours from handoff to sent contract

[YOUR TARGET]

[CLIENT DEFAULT]

CRM deal timestamps, time in stage

Renewal Engagement Start

% with process started [NUMBER] days out

100%

100%

Renewal alert automation confirmation log

Contract Portfolio Value

Total ARR under active contracts

Track and grow

Track and grow

CRM + financial system revenue summary

Implementation Checklist

## PHASE 1 — Foundation (Week 1-2)

Build [COMPANY NAME] master contract template library in [CONTRACT TOOL] ([NUMBER]+ templates minimum)

Create AI-assisted field population rules in [CONTRACT TOOL] for client-specific auto-fill

Set up [REPOSITORY] contract folder structure with naming convention ([YOUR STRUCTURE])

Build [CRM] contract pipeline: Draft, Sent, Negotiation, Executed, Active, Up for Renewal, Closed

Connect [FINANCIAL SYSTEM] to [CRM] via [AUTOMATION TOOL] for automatic invoice generation

## PHASE 2 — Obligation Tracking (Week 3-4)

Create [PM TOOL] obligation tracking template populated from contract milestone extract

Build [AUTOMATION TOOL] flow to parse deliverable dates and push tasks to [PM TOOL]

Set up weekly obligation digest email to [ROLE] inbox

Create contract health scoring formula in [REPORTING TOOL]

Build Red alert flow: health below [THRESHOLD] triggers notification to [OWNER]

## PHASE 3 — Renewal Engine (Week 5-6)

Program [NUMBER]-day renewal alert in [CRM] deal properties

Build [NUMBER]-[NUMBER]-[NUMBER]-[NUMBER]-day renewal email sequence in [EMAIL PLATFORM]

Create renewal proposal template pre-populated with performance data

Set up at-risk renewal escalation trigger when probability below [%]

Document negotiation note-capturing process in [CRM] post-call summary format

## PHASE 4 — Repository & Analytics (Month 2+)

Migrate all existing contracts into new [REPOSITORY] with correct metadata tags

Build contract analytics dashboard: portfolio value, renewal pipeline, health distribution

Run first post-mortem on a closed contract; capture lessons learned template

Review [CONTRACT TOOL] clause library against actual negotiations — update with accepted modifications

Train all [ROLE] on obligation tracking system and weekly digest review

## Workflow 4: Communities

TEMPLATE-AFC-04  |  Client Template Edition — Customize All [BRACKETED] Fields

HOW TO USE THIS TEMPLATE

This Client Template Edition is designed for agencies and businesses implementing the AfterCare Department for the first time. Every field shown in [BRACKETS] must be replaced with your specific information before using this workflow.

Instructions:

Replace ALL [BRACKETED FIELDS] with your company-specific information, team members, tools, and metrics

Review each SLA Target and adjust to match your team's realistic capacity

Replace KPI targets with your baseline goals for Year 1 — these can be tightened once you have operational data

The tool options column shows alternatives — select the one that matches your current tech stack

Keep the Implementation Checklist phases and sequence — they are in the correct order based on dependency logic

## Workflow Purpose & Objectives

## Purpose

Build and operate a vibrant client community for [COMPANY NAME] that extends value beyond individual service delivery, drives peer learning, generates referrals, and creates deep brand loyalty.

Key Objectives

Establish a primary [COMPANY NAME] community with [TARGET %] monthly engagement rate

Automate [TARGET %] of community management (moderation, welcome, digests, events, curation)

Generate [TARGET %] of new client referrals through community word-of-mouth by Month [NUMBER]

Achieve [TARGET %] of members posting or engaging at least once per week

Create [NUMBER]+ sharable client success stories per month via UGC amplification

Build [NUMBER]+ exclusive community events per month that members cannot get elsewhere

## Automation Level

[TARGET %]  |  AI handles [LIST]; humans run [LIST]

Human Involvement

[DESCRIBE: Live events, culture-setting, conflict resolution, member recognition]

Cycle Time

[DESCRIBE: Onboarding timeline, content calendar cycle, event frequency]

Detailed Step-by-Step Process

## STEP 1

Community Platform Setup & Architecture

## Trigger: [DESCRIBE YOUR TRIGGER — new community launch or platform migration]

## Actions

Community platform selected and configured: [LIST YOUR SPACES/CHANNELS — e.g., General, [AUDIENCE 1], [AUDIENCE 2], Premium Lounge, Alumni]

Membership access rules configured: [DESCRIBE HOW YOUR CRM DATA DRIVES COMMUNITY ACCESS]

Community brand kit applied: [DESCRIBE YOUR BRAND ELEMENTS — colors, logo, cover images, banner]

Community guidelines documented and pinned: [DESCRIBE YOUR KEY RULES AND VALUES]

[AUTOMATION TOOL] connects [COMMUNITY PLATFORM] to [CRM]: joins trigger tags, activity syncs to scores

## Owner: [DECISION MAKER] (architecture) + [BUILD ROLE] (execution)

## Tools: [LIST YOUR TOOLS]

SLA Target: Platform fully operational before first member invitation sent

## STEP 2

New Member Onboarding & Community Activation

Trigger: New member joins — triggered from [DESCRIBE YOUR TRIGGERS: membership enrollment, subscription upgrade, direct invite]

## Actions

Automated welcome fires immediately: [DESCRIBE: DM from community bot, welcome post tagging new member]

[NUMBER]-hour onboarding checklist sent via email: [LIST YOUR 3-5 ACTIVATION TASKS]

AI assigns new member to appropriate sub-communities based on [DESCRIBE YOUR SEGMENTATION LOGIC]

[NUMBER]-day activation challenge auto-posted: [DESCRIBE YOUR CHALLENGE STRUCTURE]

[ROLE] sends personal welcome message for [PREMIUM TIER] members

## Owner: [COMMUNITY PLATFORM] automation + [EMAIL PLATFORM] + [ROLE] (premium welcome)

## Tools: [LIST TOOLS]

SLA Target: Welcome DM within [TIME]. Onboarding checklist within [TIME]

## STEP 3

Content Programming & Engagement Automation

Trigger: Ongoing — monthly content calendar planned [NUMBER] days in advance; daily posts execute on schedule

## Actions

Monthly content calendar planned by [ROLE]: [DESCRIBE YOUR WEEKLY CONTENT THEMES]

Daily engagement posts scheduled: [DESCRIBE YOUR POSTING SCHEDULE — days and content types]

AI curates relevant external content [FREQUENCY] with [COMPANY NAME] commentary

Discussion prompts auto-posted [NUMBER]x/week at peak engagement times

Weekly '[COMMUNITY NAME] Digest' email auto-generated every [DAY]: [LIST DIGEST CONTENTS]

## Owner: [CONTENT ROLE] (calendar) + [AUTOMATION TOOL] (scheduling) + AI (curation)

## Tools: [LIST TOOLS]

SLA Target: Monthly calendar approved by [DATE]. Daily posts published without gaps

## STEP 4

Community Moderation & Health Management

Trigger: Continuous — AI moderation monitors all posts in real-time; human review updated [FREQUENCY]

## Actions

AI moderation scans for: [LIST YOUR MODERATION TRIGGERS — spam, off-topic, violations]

Low-risk violations: auto-removed with friendly redirect; member notified

High-risk violations: flagged in moderation queue for human review within [TIME]

Community health tracked [FREQUENCY]: [LIST YOUR HEALTH METRICS]

Monthly health report for [OWNER]: top contributors, disengaged members, cultural trends

Quarterly [COMMUNITY OWNER] town hall: open forum, Q&A, wins, roadmap sharing

## Owner: [COMMUNITY PLATFORM] AI moderation + [ROLE] (queue review) + [OWNER] (town hall)

## Tools: [LIST TOOLS]

SLA Target: Auto-moderation real-time. Human review within [TIME]. Town hall quarterly

## STEP 5

UGC Amplification & Member Success Storytelling

Trigger: Member posts a win or testimonial OR [ROLE] identifies a success story worth amplifying

## Actions

AI monitors community posts for success signals: [LIST YOUR SUCCESS KEYWORDS/TRIGGERS]

Flagged posts reviewed by [ROLE]; member contacted for permission to create story asset

With permission: story formatted into: [LIST YOUR OUTPUT FORMATS — community post, email, social graphic, quote card]

Member featured on [YOUR RECURRING RECOGNITION FEATURE]; content shared to [CHANNELS] with member tag

Best stories funneled to [MARKETING ROLE] for full case study development

Achievement logged in [CRM]: story type, permission, formats created, distribution channels

## Owner: AI monitor + [CURATION ROLE] + [MARKETING ROLE] (full case studies)

## Tools: [LIST TOOLS]

SLA Target: Win identified within [TIME]. Permission request within [TIME]. Content within [TIME]

## STEP 6

Community Events, Live Programming & Growth

Trigger: Monthly live event calendar + [YOUR RECURRING TOUCHPOINTS] + [FREQUENCY] growth campaigns

## Actions

Monthly event calendar published [NUMBER] days in advance: [LIST YOUR EVENT TYPES]

Registration automated via [EVENT/SCHEDULING TOOL]; reminder sequence at [TIMING]

Post-event recap published within [TIME]: key takeaways, action items, recording link

Community referral campaign runs [FREQUENCY]: [DESCRIBE YOUR REFERRAL INCENTIVE STRUCTURE]

Annual growth goal tracked monthly: [LIST YOUR GROWTH METRICS AND TARGETS]

New member pipeline reviewed monthly to identify highest-engagement acquisition channels

Owner: [EVENT ROLE] (coordination) + [COMMUNITY LEADER] (facilitation) + [EMAIL PLATFORM] (follow-up)

## Tools: [LIST TOOLS]

SLA Target: Monthly calendar live by [DATE]. Event recaps within [TIME]

Key Tools & Technology Stack

Category

Tool Options

Your Current Tool

## Purpose

Community Platform

Circle, Mighty Networks, Slack, Discord, Bettermode

[YOUR PLATFORM]

Primary community, spaces, events, DMs

CRM Integration

HubSpot, Zapier, API

[YOUR CRM + INTEGRATION]

Member sync, engagement scoring, tagging

Content Scheduling

Buffer, Hootsuite, Make.com, native scheduler

[YOUR SCHEDULER]

Daily posts, content calendar execution

Event Hosting

Zoom, Luma, Calendly, platform events

[YOUR EVENT TOOL]

Live events, Q&A, accountability calls

AI Moderation

Platform moderation, Perspective API, Make.com

[YOUR MODERATION TOOL]

Content filtering, violation detection

Content Creation

Canva Pro, Adobe Express, Loom

[YOUR CONTENT TOOL]

Spotlights, event graphics, recap videos

Email / Notifications

GoHighLevel, Mailchimp, platform notifications

[YOUR EMAIL TOOL]

Weekly digest, reminders, re-engagement

Analytics

Platform analytics, Google Sheets, HubSpot

[YOUR ANALYTICS TOOL]

Engagement scoring, health reports, growth

KPIs & Success Metrics

KPI / Metric

Measurement

Target (URC)

Client Default

## Notes / How to Measure

Monthly Engagement Rate

% of members posting or reacting weekly

[YOUR TARGET]

[CLIENT DEFAULT]

Platform analytics dashboard, weekly export

Community Referral Rate

% of new clients from community referrals

[YOUR TARGET]

[CLIENT DEFAULT]

CRM source attribution on new deal records

Member Churn Rate

% of members leaving per month

[YOUR TARGET]

[CLIENT DEFAULT]

Platform membership change report, monthly

Event Attendance Rate

% of members at monthly live events

[YOUR TARGET]

[CLIENT DEFAULT]

Event platform attendance reports

UGC Production Rate

# of success stories amplified per month

[YOUR TARGET]

[CLIENT DEFAULT]

Manual tracking in content calendar

New Member Activation Rate

% completing activation challenge

[YOUR TARGET]

[CLIENT DEFAULT]

## Automation completion tracking

Community NPS

Net Promoter Score from quarterly survey

[YOUR TARGET]

[CLIENT DEFAULT]

Survey tool, quarterly; CRM results log

Implementation Checklist

## PHASE 1 — Platform Build (Week 1-2)

Select and configure [COMMUNITY PLATFORM]; set up spaces by audience segment

Design community brand kit: cover images, welcome banner, space icons, event templates

Write and pin community guidelines in all primary spaces

Connect [COMMUNITY PLATFORM] to [CRM] via [AUTOMATION TOOL]

Configure tier-based access rules: [CRM] membership tier drives space access in [COMMUNITY PLATFORM]

## PHASE 2 — Onboarding & Content Engine (Week 3-4)

Build automated welcome sequence: platform DM + [EMAIL PLATFORM] + [NUMBER]-day activation challenge

Create 30-day starter content calendar with themes, post templates, discussion prompts

Set up [AUTOMATION TOOL] for daily scheduled posts across all content types

Build weekly [COMPANY NAME] Digest email template with dynamic content blocks

Create AI moderation rules; connect high-risk flags to human review queue

## PHASE 3 — Events & Amplification (Week 5-6)

Plan and publish first [NUMBER] months of live event calendar

Build event reminder automation: [TIME] and [TIME] reminders via [EMAIL PLATFORM]

Create UGC monitoring alert in [AUTOMATION TOOL] for success signal keywords

Design [NUMBER] content templates for member spotlights, wins, and event graphics

Set up community referral program with tracking and reward delivery

## PHASE 4 — Growth & Optimize (Month 2+)

Launch founding member campaign: first [NUMBER] members get founding badge and locked-in pricing

Review first community health report; identify top engaged members for ambassador program

Build community analytics dashboard with [FREQUENCY] automated data import

Host first quarterly town hall; record and distribute replay to all members

Conduct NPS survey at [NUMBER]-day mark; use results to prioritize community improvements
````

### automation/AFC02-Blueprint.json

````json
{
  "name": "AFC02: Memberships (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "hubspot:watchContacts",
      "version": 1,
      "parameters": {
        "property": "membership_tier"
      }
    },
    {
      "id": 2,
      "module": "openai:createCompletion",
      "version": 1,
      "parameters": {
        "model": "gpt-4o"
      },
      "mapper": {
        "messages": [
          {
            "role": "system",
            "content": "Generate a customized onboarding packet for the new membership tier."
          }
        ]
      }
    },
    {
      "id": 3,
      "module": "slack:createMessage",
      "version": 1,
      "parameters": {
        "channel": "vip-members"
      }
    }
  ]
}
````

## Binary Attachments

- `trackers/AFC-02_Membership_Tracker.xlsx`: binary attachment retained outside the Markdown kit; convert to CSV/Markdown during certification if the sheet contents become authoritative.

## Automation Blueprint

### AFC02-Blueprint.json

```json
{
  "name": "AFC02: Memberships (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "hubspot:watchContacts",
      "version": 1,
      "parameters": {
        "property": "membership_tier"
      }
    },
    {
      "id": 2,
      "module": "openai:createCompletion",
      "version": 1,
      "parameters": {
        "model": "gpt-4o"
      },
      "mapper": {
        "messages": [
          {
            "role": "system",
            "content": "Generate a customized onboarding packet for the new membership tier."
          }
        ]
      }
    },
    {
      "id": 3,
      "module": "slack:createMessage",
      "version": 1,
      "parameters": {
        "channel": "vip-members"
      }
    }
  ]
}
```

## Placeholder and Binding Notes

- `source/AfterCare-Department-Workflows.md`: [BRACKETED], [BRACKETS], [BRACKETED FIELDS], [COMPANY NAME]

Treat bracketed fields such as `[COMPANY NAME]`, `[AGENCY NAME]`, or `YOUR_TEMPLATE_ID` as intentional configuration points unless the source file clearly says they are unfinished draft copy. Before live use, replace tool IDs, account IDs, webhook URLs, notification channels, and client-facing business fields with the correct URC or client-safe values.

## Outputs

- Completed workflow artifact, decision, update, or handoff matching the source package.
- Evidence log or tracker entry showing what ran, who approved it, and what changed.
- Exception list for anything blocked by missing credentials, paid-tool limits, unavailable source files, or human review.

## Constraints

- Preserve the URC/internal and client-facing tracks. Do not blend them during certification.
- Keep the default route low-cost and tool-light unless the workflow truly requires a paid connector.
- Do not store secrets, API keys, private client data, or credential exports in the repo.
- Use Microsoft 365 as the default operating backbone when a general-purpose document, tracker, or email surface is needed.

## Safety Notes

- Require owner approval before sending external communications, changing access, moving money, publishing client-facing content, or modifying authoritative records.
- If the automation blueprint contains placeholder credentials or runtime-specific module IDs, rebuild and test with non-production data before enabling it.
- If the source file is missing, treat the registry metadata as orientation only and do not certify the workflow until the detailed source is recovered or rebuilt.

## Validation

- [ ] The trigger, owner, and cycle time match the current operating reality.
- [ ] Source artifacts are present or the source gap is explicitly accepted.
- [ ] Placeholder bindings have been replaced or documented as intentional template variables.
- [ ] Automation, if present, has been imported or rebuilt in the selected runtime and tested with safe data.
- [ ] Manual fallback exists for any paid-tool, credential, or platform limit.
- [ ] Evidence from at least one run is captured before certification.

## Certification Status

Status: **Draft / imported package consolidated**.

This kit is now an operative draft, but it is not certified. Certification requires at least one live or controlled manual run, proof of outputs, confirmation of placeholder bindings, and a clear URC/internal versus client-safe variant decision.

## Change Log

| Date | Change ID | Version | Type | Summary | Author |
| --- | --- | --- | --- | --- | --- |
| 2026-05-21 | CC-2026-05-21-013 | 0.1.0-draft | consolidation | Created consolidated kit.md from registry metadata, imported artifacts, placeholder scan, and automation blueprint. | codex |
