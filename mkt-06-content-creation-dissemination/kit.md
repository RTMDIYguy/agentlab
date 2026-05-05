---
schema: kit/1.0
slug: mkt-06-content-creation-dissemination
title: MKT-06 — Content Creation & Dissemination
summary: >
  Repeatable AI-enhanced content production and multi-channel
  distribution pipeline with closed-loop performance tracking.
version: 1.0.0
owner: uncle-robert-consulting
license: UNLICENSED
tags:
  - marketing
  - content
  - ai-native
  - automation
  - multi-channel
  - seo
  - email
  - social
  - performance-tracking
  - urc

model:
  provider: anthropic
  name: claude-sonnet-4-20250514
  hosting: "cloud API — requires ANTHROPIC_API_KEY"

models:
  - role: drafting
    provider: anthropic
    name: claude-sonnet-4-20250514
    hosting: "cloud API — requires ANTHROPIC_API_KEY"
  - role: editorial-prescreen
    provider: anthropic
    name: claude-sonnet-4-20250514
    hosting: "cloud API — requires ANTHROPIC_API_KEY"
  - role: seo-optimization
    provider: anthropic
    name: claude-sonnet-4-20250514
    hosting: "cloud API — requires ANTHROPIC_API_KEY"
  - role: analytics-summarization
    provider: anthropic
    name: claude-sonnet-4-20250514
    hosting: "cloud API — requires ANTHROPIC_API_KEY"

tools:
  - notion
  - jira
  - confluence
  - google-docs
  - google-drive
  - onedrive
  - dropbox
  - github
  - klaviyo
  - gohighlevel
  - hubspot
  - microsoft-teams
  - outlook
  - google-analytics
  - youtube-analytics
  - google-search-console
  - google-calendar
  - zapier
  - make

skills:
  - content-strategy
  - editorial-review
  - seo-optimization
  - multi-channel-adaptation
  - performance-analytics

tech:
  - markdown
  - yaml
  - http-webhooks
  - oauth2

testedHarnesses:
  - Claude Code
  - Make.com
  - Zapier
  - GoHighLevel

services:
  - name: Notion
    kind: api-service
    role: content calendar, performance tracker, automation hub (single source of truth)
    setup: "Requires NOTION_API_KEY and database IDs for Content Calendar and Performance Tracker"
  - name: Jira (Atlassian)
    kind: api-service
    role: ticket lifecycle (To Do → In Progress → In Review → Approved → SEO Complete → Adaptation Complete → Published)
    setup: "Requires ATLASSIAN_API_TOKEN and verified site URL on atlassian.net (the URC site URL was misconfigured as 'atlasian.net' and must be corrected before publish)"
  - name: Confluence (Atlassian)
    kind: api-service
    role: SOP storage and content type templates
    setup: "Same Atlassian credentials as Jira; requires correct atlassian.net site URL"
  - name: Klaviyo
    kind: api-service
    role: email and SMS distribution, A/B testing, performance metrics
    setup: "Requires KLAVIYO_API_KEY and the named lists/templates: Email List SrkWfC, SMS List T4mYSf, Preview List XbByas, Newsletter Template SuGCiU"
  - name: HubSpot
    kind: api-service
    role: CRM, content attribution, lead scoring, sales enablement surfacing
    setup: "Requires HUBSPOT_PRIVATE_APP_TOKEN with contacts.read, contacts.write, deals.read scopes"
  - name: GoHighLevel
    kind: api-service
    role: social scheduling and multi-platform syndication
    setup: "Requires GHL_API_KEY for the URC sub-account"
  - name: GitHub
    kind: api-service
    role: version-controlled content repo (RTMDIYguy/urc-content-assets) with branch-per-ticket workflow
    setup: "Requires GITHUB_TOKEN with repo scope on RTMDIYguy/urc-content-assets"
  - name: Google Analytics 4
    kind: api-service
    role: traffic, engagement, conversion, organic search measurement
    setup: "Requires GA4 service-account JSON and GA4_PROPERTY_ID"
  - name: YouTube Analytics
    kind: api-service
    role: video performance — views, watch time, retention, subscriber delta
    setup: "Requires Google OAuth scopes for YouTube Analytics on the URC channel"
  - name: Google Search Console
    kind: api-service
    role: keyword rankings and indexed page status
    setup: "Requires Search Console API access on the verified URC property"
  - name: Microsoft Teams
    kind: api-service
    role: internal notifications, editorial channels, performance alert routing
    setup: "Requires Teams webhook URLs for #content-planning, #content-review, #content-published, #marketing-analytics"
  - name: Outlook (Microsoft 365)
    kind: api-service
    role: client-facing email notifications and critical alert backup
    setup: "Requires MS Graph token with Mail.Send scope"
  - name: Make.com
    kind: api-service
    role: integration middleware for cross-tool automations not native to GoHighLevel
    setup: "Requires Make organization with scenarios for: Notion approval → Jira+GCal, Jira → Teams, Docs → GitHub, Klaviyo events → Notion"
  - name: Zapier
    kind: api-service
    role: simpler timer-based and CRUD-style automations
    setup: "Requires Zapier account with zaps for: 24h post-publish analytics pull, Jira due date → GCal sync"

parameters:
  - name: ideation_to_publish_sla_hours
    value: "72"
    description: Maximum cycle time from approved topic to first-channel publication
  - name: full_syndication_sla_hours
    value: "96"
    description: Maximum cycle time from approved topic to multi-channel syndication complete
  - name: monthly_throughput_target
    value: "12"
    description: Minimum content assets published per month
  - name: monthly_throughput_stretch
    value: "16"
    description: Stretch target for monthly content throughput
  - name: channel_adaptations_min
    value: "4"
    description: Minimum number of channel adaptations per content asset
  - name: automation_rate_target
    value: "0.78"
    description: Target proportion of workflow steps automated (Step 1-6 average 75-80%, Step 7 70-75%)
  - name: editorial_review_max_cycles
    value: "2"
    description: Max revision cycles before escalation
  - name: editorial_review_sla_hours
    value: "24"
    description: Editorial review must complete within this window
  - name: seo_optimization_sla_hours
    value: "4"
    description: SEO optimization must complete within this window after approval
  - name: adaptation_sla_hours
    value: "8"
    description: All channel adaptations complete within this window after SEO complete
  - name: distribution_sla_hours
    value: "1"
    description: Distribution must begin within this window of scheduled publish time
  - name: onpage_seo_score_target
    value: "85"
    description: Minimum on-page SEO score (0-100)
  - name: email_open_rate_target
    value: "0.35"
    description: Klaviyo email open rate target (35%)
  - name: email_ctr_target
    value: "0.045"
    description: Klaviyo email click-through rate target (4.5%)
  - name: email_unsub_red_threshold
    value: "0.003"
    description: Email unsubscribe rate above this triggers list-hygiene review (0.3%)
  - name: spam_complaint_red_threshold
    value: "0.0008"
    description: Spam complaint rate above this triggers immediate campaign pause (0.08%)
  - name: viral_traffic_spike_threshold
    value: "3.0"
    description: Page-view multiplier (3x baseline) that triggers viral content protocol
  - name: day7_pulse_check_offset_days
    value: "7"
    description: Days post-publish for the first performance pulse check
  - name: day30_full_review_offset_days
    value: "30"
    description: Days post-publish for the full optimize-or-retire decision

memory:
  scope: per-kit
  backing: hybrid
  writePolicy: merge-with-review
  retention: "rolling 12 months of content performance, indefinite for top-performer artifacts"
  reviewMode: thresholded
  entityTypes:
    - content_assets
    - performance_records
    - top_performer_index
    - retired_content
    - editorial_decisions
    - subject_line_ab_test_history

resolverHints:
  - match: "When planning a new content piece"
    load:
      - examples/canary-test-asset.md
      - assets/notion-content-calendar-schema.md
    purpose: Show the brief structure and required Notion fields before drafting
  - match: "When drafting the first version"
    load:
      - skills/content-strategy.md
      - assets/url-brand-voice-notes.md
    purpose: Apply URC brand voice and SEO-aware drafting heuristics
  - match: "When running editorial review"
    load:
      - skills/editorial-review.md
    purpose: Apply the AI pre-screening checklist plus the 2-cycle revision cap
  - match: "When optimizing post-publish"
    load:
      - skills/performance-analytics.md
      - assets/seven-point-scorecard.md
    purpose: Apply the GREEN/YELLOW/RED scorecard before any optimize-or-retire decision

inputs:
  - name: content_brief
    description: Notion content-brief page with topic, primary/secondary keywords, target persona, channel targets, content format, and competitive references
  - name: brand_voice_notes
    description: URC brand voice and tone guide used for AI drafting and pre-screening (delta from generic LLM output)
  - name: editorial_calendar_slot
    description: Approved publish window from the Notion Content Calendar tied to a Google Calendar event
  - name: distribution_audience_segments
    description: Target Klaviyo lists, GoHighLevel social audiences, and HubSpot contact segments for the distribution step

outputs:
  - name: published_content_asset
    description: A published blog/email/social/video/case-study asset with channel-specific adaptations indexed in Notion and GitHub
  - name: distribution_log
    description: Channel × timestamp × audience-size record stored in Notion and committed to GitHub distribution-logs/
  - name: performance_record
    description: 7-Point Scorecard results at Day-7 pulse, Day-30 full review, and monthly rollup, stored in Notion Performance Tracker
  - name: optimization_action
    description: One of {Refresh, Repurpose, Promote, Retire} with a Jira ticket, applied at Day-30 review
  - name: monthly_strategy_update
    description: Monthly insight digest fed back into Step 1 planning that updates topic/format/channel priority

useCases:
  - scenario: Solo founder operating an AI-native content engine with Robert's connected stack
    constraints:
      - Single creator + AI-assisted drafting
      - Atlassian site URL must be valid (atlassian.net not atlasian.net)
      - Klaviyo lists provisioned with the named IDs
    notFor:
      - Teams without the listed services connected
      - Workflows that publish faster than a 24-hour editorial review cycle
  - scenario: Client engagement using URC-managed content with the same automations under a sub-tenant
    constraints:
      - Client-template variant must scrub URC-specific IDs (Klaviyo lists, GitHub repo, Notion DB IDs)
      - Compliance rules per client jurisdiction may tighten CAN-SPAM/GDPR/TCPA defaults
    notFor:
      - Clients without their own CRM and email service provider

prerequisites:
  - name: Node.js 20+
    check: "node --version"
  - name: Atlassian site URL valid
    check: "curl -sf https://unclerobertconsulting.atlassian.net/rest/api/3/myself -H \"Authorization: Bearer $ATLASSIAN_API_TOKEN\""
  - name: Klaviyo API reachable with named lists/templates
    check: "curl -sf https://a.klaviyo.com/api/lists/SrkWfC/ -H \"Authorization: Klaviyo-API-Key $KLAVIYO_API_KEY\""
  - name: HubSpot Private App token valid
    check: "curl -sf https://api.hubapi.com/crm/v3/objects/contacts?limit=1 -H \"Authorization: Bearer $HUBSPOT_PRIVATE_APP_TOKEN\""
  - name: GitHub repo accessible
    check: "gh repo view RTMDIYguy/urc-content-assets"

dependencies:
  runtime:
    - node@20
  cli:
    - gh
    - curl
  secrets:
    - ANTHROPIC_API_KEY
    - NOTION_API_KEY
    - ATLASSIAN_API_TOKEN
    - KLAVIYO_API_KEY
    - HUBSPOT_PRIVATE_APP_TOKEN
    - GHL_API_KEY
    - GITHUB_TOKEN
    - GA4_SERVICE_ACCOUNT_JSON
    - YOUTUBE_OAUTH_REFRESH_TOKEN
  npm: []
  kits: []

verification:
  command: "node src/canary/run-canary.mjs --label internal-verification --date $(date +%F)"
  expected: "exit 0 with all 10 evidence checkpoints captured (Notion, Jira, draft, GitHub, editorial, SEO, adaptation, Klaviyo preview, Step 7 row, final decision)"

fileManifest:
  - path: kit.md
    role: spec-conformant manifest and workflow guide (this file)
    description: kit/1.0 frontmatter plus the URC Master narrative for WF6
  - path: README.md
    role: bundle overview and how to use
    description: Quickstart, install, and conformance status
  - path: examples/canary-test-asset.md
    role: example
    description: Worked example of the 10-step canary verification run, derived from MKT-06-Canary-Verification-Runbook.md
  - path: skills/content-strategy.md
    role: skill
    description: How to apply URC topic-selection heuristics and brief composition
  - path: skills/editorial-review.md
    role: skill
    description: AI pre-screening checklist and the 2-cycle revision cap
  - path: skills/seo-optimization.md
    role: skill
    description: Keyword validation, on-page SEO automation, schema-markup decisions
  - path: skills/multi-channel-adaptation.md
    role: skill
    description: Per-channel adaptation rules — blog/email/social/video/podcast
  - path: skills/performance-analytics.md
    role: skill
    description: 7-Point Scorecard and Optimize/Retire decision tree
  - path: assets/seven-point-scorecard.md
    role: asset
    description: GREEN/YELLOW/RED thresholds for all 12 metrics in the scorecard
  - path: assets/notion-content-calendar-schema.md
    role: asset
    description: Required Notion DB fields and formula references
  - path: assets/url-brand-voice-notes.md
    role: asset
    description: URC brand voice and tone notes used for drafting and pre-screening
  - path: src/canary/run-canary.mjs
    role: source
    description: Canary verification driver — pulls evidence across Notion/Jira/Klaviyo/GA4/HubSpot and writes MKT-06-Canary-Evidence-Log.csv
  - path: src/automation/notion-to-jira.mjs
    role: source
    description: Topic approval in Notion creates Jira ticket plus Google Calendar event (replaces a Make scenario)
  - path: src/automation/jira-status-router.mjs
    role: source
    description: Routes Jira status changes to Teams notifications, GitHub PR merges, and Klaviyo previews
  - path: src/automation/seven-point-scorer.mjs
    role: source
    description: Day-7 and Day-30 scoring against GA4/Klaviyo/YouTube/HubSpot, writes results to Notion Performance Tracker
  - path: src/agents/drafting-agent.md
    role: source
    description: Prompt and harness contract for the AI Drafting Agent (Claude Code-compatible)

selfContained: false

orgRequired: true

requiredResources:
  - resourceId: notion-content-database
    kind: api-service
    required: true
    purpose: Content Calendar and Performance Tracker live in the org's Notion workspace
    deliveryMethod: connection
  - resourceId: atlassian-site
    kind: api-service
    required: true
    purpose: Jira and Confluence under the org's Atlassian site (must be atlassian.net not atlasian.net)
    deliveryMethod: connection
  - resourceId: klaviyo-account
    kind: api-service
    required: true
    purpose: Email and SMS distribution under the org's Klaviyo account; lists and templates must be provisioned
    deliveryMethod: connection
  - resourceId: hubspot-portal
    kind: api-service
    required: true
    purpose: CRM and content attribution under the org's HubSpot portal
    deliveryMethod: connection
  - resourceId: github-content-repo
    kind: storage-location
    required: true
    purpose: Content repository for branch-per-ticket workflow and distribution logs
    deliveryMethod: connection
  - resourceId: ga4-property
    kind: api-service
    required: true
    purpose: Site analytics measurement
    deliveryMethod: connection
  - resourceId: youtube-channel
    kind: api-service
    required: false
    purpose: Video analytics — only required when video content is in the calendar
    deliveryMethod: connection
  - resourceId: gohighlevel-account
    kind: api-service
    required: true
    purpose: Social scheduling and multi-platform syndication
    deliveryMethod: connection

environment:
  runtime: node
  os:
    - linux
    - macos
    - windows
  platforms:
    - LinkedIn
    - Twitter/X
    - Instagram
    - Facebook
    - YouTube
    - Medium
  notes: "Robert's tested setup is Windows 11 with WSL2 for Node-side automation; Make.com and GoHighLevel run cloud-side."
  adaptationNotes: "On Windows without WSL, replace shell-based check commands in prerequisites with PowerShell equivalents. If the consumer's CRM is not HubSpot, swap the HubSpot service for the consumer's CRM and update content-attribution UTM mapping."

failures:
  - problem: Atlassian connector configured against 'unclerobertconsulting.atlasian.net' (typo) so Jira ticket creation and Confluence SOP updates silently fail
    resolution: Verify the site URL in admin.atlassian.com, correct the connector domain to atlassian.net, and add a startup check that hits /rest/api/3/myself before any Jira write
    scope: environment
  - problem: Klaviyo validation blocked in canary session because the named lists/template IDs were not yet provisioned
    resolution: Provision Email List SrkWfC, SMS List T4mYSf, Preview List XbByas, and Newsletter Template SuGCiU; add a prerequisite check that calls the Klaviyo /lists endpoint
    scope: environment
  - problem: HubSpot content attribution not validated end-to-end so content-influenced deals could not be confirmed
    resolution: Add UTM standards to every Klaviyo and GoHighLevel send, set up content-source contact properties in HubSpot, and verify with a single content-influenced contact before promoting MKT-06 to Active
    scope: general
  - problem: GA4, GoHighLevel, Teams, Outlook, and YouTube analytics not all verified in-session, so the Day-7 pulse check ran with partial data
    resolution: Wire the Sub-step 7.1 daily 6 AM CDT pull to all five sources and confirm each emits at least one row before declaring Step 7 operational
    scope: general
  - problem: Notion content calendar appeared template-based and not aligned to the URC workflow schema
    resolution: Replace the default template with the schema in assets/notion-content-calendar-schema.md and confirm Day-7/Day-30 trigger formulas resolve correctly
    scope: general
  - problem: Editorial review cycles can exceed the 2-revision cap when reviewer is unavailable
    resolution: Add an SLA escalation that auto-routes the ticket to the creative director after 24 hours in Revisions Requested, and a Teams nudge at the 12-hour mark
    scope: general

---

## Goal

Run a closed-loop content engine that turns approved topics into published, multi-channel assets within 72 hours, sustains 12–16 publishes per month at ≥ 4 channel adaptations each, hits the URC SEO and email engagement bars, and feeds Day-7 and Day-30 performance signals back into next-cycle planning so the system gets sharper every month.

## When to Use

Use this kit whenever URC or a URC-managed client needs to operate an AI-native content function with editorial integrity, multi-channel distribution, and post-publish optimization built in. Apply it for the URC marketing engine itself (the canonical use case) and adapt it for client engagements that already have the listed services connected. It is the production backbone for blog posts, email campaigns, social updates, video, and case studies. It is not the right kit for one-off newsletters without performance tracking, or for raw social posting without an editorial gate.

## Inputs

The narrative around inputs: every cycle starts with a Notion content brief tied to a Jira ticket and a Google Calendar slot, with brand voice notes loaded into the AI drafting agent and target Klaviyo / GoHighLevel / HubSpot segments declared up front. The structured input list is in the `inputs` frontmatter. Do not start a cycle without all four — most failures we have seen come from drafts where the persona or channel targets were assumed rather than declared.

## Setup

### Models

- Verified with Anthropic Claude Sonnet 4 (`claude-sonnet-4-20250514`) for drafting, editorial pre-screening, SEO recommendations, and analytics summarization. Other compatible models may work but have not been tested.
- Drafting prompts and harness contract live in `src/agents/drafting-agent.md` and assume the Claude Code-style tool harness. Adapt the harness contract if running on Make.com or another orchestrator.

### Services

- Notion is the single source of truth for the Content Calendar and the Performance Tracker. Every service in the `services` frontmatter must be reachable; provision the named Klaviyo lists and the Newsletter Template before the first cycle.
- The Atlassian site URL must be `atlassian.net` (correct the legacy `atlasian.net` misconfiguration before publish). Without this, Jira ticket creation in Step 1 and Confluence SOP updates in Step 7 fail silently.
- GitHub repo `RTMDIYguy/urc-content-assets` must exist with branch protection on `main` and PR templates configured.

### Parameters

- All numeric SLAs and KPI thresholds live in the `parameters` frontmatter — keep them there, not duplicated in body text. Override per-engagement by setting the parameter on the Notion brief.
- The Day-7 and Day-30 offsets are deliberately kept as parameters so they can be tightened during launch testing or relaxed for slower-cadence clients.

### Environment

- Tested on Node 20+ on Windows 11 with WSL2 for Node-side automation; Make.com and GoHighLevel run cloud-side.
- Adapt for non-Windows, non-HubSpot, or no-video setups using `environment.adaptationNotes`. Most workflow logic is platform-independent — only the integration adapters change.

## Steps

The workflow runs in seven steps end-to-end. Each one maps to specific tool actions; full detail with key data fields and SLA targets is duplicated in the URC Master Playbook for human readability.

1. **Plan and ideate.** Trigger on the monthly planning cycle, an inbound Jira brief, a Google Analytics trending-topic alert, or a HubSpot lead-scoring gap. The AI Research Agent ranks topics by potential impact; the content strategist approves in the Notion Content Calendar; approved topics auto-create Jira tickets plus Google Calendar events; AI generates content briefs in Notion. Plan finalized within 48 hours of trigger; tickets created within 4 hours of plan approval.
2. **AI-assisted creation.** Trigger on Jira ticket → In Progress, brief approved, or 48-hour draft-due warning. AI Drafting Agent generates the first draft into Google Docs (or OneDrive/Word for client-branded), version-controlled in GitHub on `content/{ticket-id}/{slug}`. Creator refines and pushes to Draft Complete. First draft within 24 hours; AI-generated initial draft within 30 minutes.
3. **Editorial review.** Trigger on Jira → In Review. AI pre-screening posts grammar/voice/plagiarism/factual checks as Notion comments; human editor uses Suggesting Mode in Google Docs. Maximum 2 revision cycles before escalation. Final approval merges the GitHub PR and locks the doc to view-only. Review completes within 24 hours.
4. **SEO optimization.** Trigger on Jira → Approved. AI SEO Agent validates keywords, applies on-page optimization to the Google Doc, generates schema markup and internal-linking recommendations, and stores the optimization report as a linked Notion DB entry. SEO completes within 4 hours; on-page score target ≥ 85/100.
5. **Multi-channel adaptation.** Trigger on Jira → SEO Complete. AI Adaptation Agent produces blog HTML, Klaviyo-compatible email, platform-specific social posts, video script, podcast outline. Each variant lives in a designated Drive/OneDrive/Dropbox/GitHub path and is linked back to the master Notion page. Adaptations complete within 8 hours; minimum 4 channel variants.
6. **Scheduled distribution.** Trigger on Jira → Adaptation Complete and the Google Calendar publish time. Klaviyo sends the email and SMS notifications, GoHighLevel schedules social, the CMS publishes the blog with a Google Search Console ping, Outlook notifies HubSpot-segmented client contacts, and Microsoft Teams broadcasts to internal channels. Distribution begins within 1 hour of scheduled time; full syndication within 4 hours.
7. **Performance tracking and optimization.** Three trigger cycles run continuously: Day-7 pulse check, Day-30 full review, and real-time threshold alerts. The 7-Point Scorecard scores GA4 + Klaviyo + YouTube + HubSpot data; the optimize-or-retire decision tree drives the next action. Top performers enter the amplification pipeline; underperformers enter the refresh queue; dead content is archived with insights extracted to the next planning cycle. Day-7 within 24 hours of the 7-day mark; weekly recommendations every Monday by 9:00 AM CDT; monthly report by the last Friday at 5:00 PM CDT.

## Failures Overcome

The structured failure list is in the `failures` frontmatter. The narrative across them is consistent: every failure traces to either a misconfigured external resource (Atlassian domain typo, missing Klaviyo IDs) or a partially-wired analytics layer where one of the five sources was not yet emitting data. The fix in every case is a startup check that hard-fails the cycle if the resource is not reachable, plus a prerequisite list (in the `prerequisites` frontmatter) that runs before the first cycle.

## Validation

Before promoting MKT-06 to Active in the Master Workflow Index, run the canary in `examples/canary-test-asset.md` end-to-end and capture the 10-checkpoint evidence chain (Notion item, Jira ticket through 7 statuses, draft, GitHub artifact, editorial approval, SEO completion, adaptation, Klaviyo preview, Step 7 tracker row, final pass/fail). The canary passes only if every checkpoint is either completed with evidence or intentionally skipped with a documented reason and an approved manual fallback. The post-install verification command is in the `verification` frontmatter and writes `MKT-06-Canary-Evidence-Log.csv` for audit.

## Outputs

The structured output list is in the `outputs` frontmatter. The narrative: every cycle produces a published asset bundle (blog + email + social + optional video/podcast), a distribution log committed to GitHub, a performance record in the Notion Performance Tracker, an optimization action chosen at Day-30, and a monthly strategy update that closes the loop back into Step 1. The strategy update is the artifact that compounds over time — track its quality more carefully than any single piece's metrics.

## Constraints

The Atlassian site URL must be the correct `atlassian.net` form before this kit can run end-to-end; the canary will fail at Step 2 (Jira proof) until that is fixed. Klaviyo lists `SrkWfC` (Email), `T4mYSf` (SMS), `XbByas` (Preview) and Newsletter Template `SuGCiU` must exist in the Klaviyo account by the named IDs or be aliased in the consumer's binding map. Editorial review is capped at 2 revision cycles per piece; longer cycles must escalate. CAN-SPAM, GDPR, and TCPA compliance are non-negotiable for the email/SMS legs.

## Safety Notes

- The AI Drafting Agent ingests Notion briefs and brand voice notes as untrusted input; never let it pull credentials, customer PII, or internal financials into the draft context. Strip any such content from briefs before drafting.
- Klaviyo SMS sends must obey TCPA: written opt-in is required for every contact on `T4mYSf`, opt-out language must appear in every message, and the 8 AM – 9 PM local-time window is enforced. Do not loosen this for "high-priority" campaigns.
- Spam complaint rate above 0.08% pauses the campaign immediately and triggers a list-hygiene review before the next send. Do not override the threshold to push a campaign through.
- Unsubscribe lists in Klaviyo are authoritative — when refreshing content in Sub-step 7.4, never re-add a previously suppressed contact under any condition.
- GitHub branches under `content/` and `refresh/` may contain unpublished client-branded content; keep the repo private and audit collaborator access quarterly.
- The URC Master variant of this kit (this file) contains internal IDs (Klaviyo lists, GitHub repo path, Notion DB references). Before deriving the Client Template variant, scrub all of: Klaviyo metric IDs (SvYcB2, W6PXBY, TFp3uS, RSX9Yp, XTfR8t, WDdKTd), Klaviyo list/template IDs (SrkWfC, T4mYSf, XbByas, SuGCiU), GitHub repo `RTMDIYguy/urc-content-assets`, GoHighLevel aggregate IDs (RCArdw, Xuj3ha), and any Notion DB names that reveal URC strategy.
