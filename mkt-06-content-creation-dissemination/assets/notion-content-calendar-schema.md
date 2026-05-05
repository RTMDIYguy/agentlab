# Asset — Notion Content Calendar Schema

Required Notion DB fields and formula references for MKT-06.

## Database: Content Calendar

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Title | Title | yes | Working title; final title set in Step 4 |
| Slug | Text | yes | URL-safe identifier matching the GitHub branch |
| Status | Select | yes | Options: Idea, Approved, In Progress, In Review, Approved, SEO Complete, Adaptation Complete, Published, Top Performer, Refresh, Retired |
| Content Format | Select | yes | Options: Blog, Email, Social, Video, Case Study |
| Primary Keyword | Text | yes | |
| Secondary Keywords | Multi-select | no | 2–4 entries |
| Target Persona | Relation | yes | Linked to HubSpot Personas DB |
| Channel Targets | Multi-select | yes | ≥ 4 channels for full repurpose |
| Owner | Person | yes | |
| Draft Due | Date | yes | |
| Review Due | Date | yes | |
| Publish Date | Date | yes | Synced to Google Calendar |
| Jira Ticket ID | Text | yes (post-Step 1) | Auto-populated by Make scenario `notion-to-jira` |
| Brief URL | URL | yes | Linked Notion page with full brief |
| GitHub Branch | Text | yes (post-Step 2) | Format: `content/{ticket}/{slug}` |
| Master Doc URL | URL | yes (post-Step 2) | Google Docs or OneDrive |
| Content Performance Tracker Row | Relation | yes (post-Step 6) | Linked to Performance Tracker DB |

## Database: Content Performance Tracker — WF6 Step 7

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Content Asset | Relation | yes | Linked to Content Calendar |
| Publish Date | Date (rollup) | yes | Rolls up from Content Calendar |
| Day-7 Triggered | Formula | yes | `dateBetween(now(), prop("Publish Date"), "days") >= 7` |
| Day-30 Triggered | Formula | yes | `dateBetween(now(), prop("Publish Date"), "days") >= 30` |
| Page Views (30-day) | Number | populated by Sub-step 7.1 | GA4 source |
| Engagement Rate | Number | populated by Sub-step 7.1 | GA4 source |
| Bounce Rate | Number | populated by Sub-step 7.1 | GA4 source |
| Email Open Rate | Number | populated by Sub-step 7.1 | Klaviyo SvYcB2 |
| Email Click Rate | Number | populated by Sub-step 7.1 | Klaviyo W6PXBY |
| Click-to-Open Rate | Formula | derived | Email Click / Email Open |
| Unsubscribe Rate | Number | populated by Sub-step 7.1 | Klaviyo XTfR8t |
| Spam Complaint Rate | Number | populated by Sub-step 7.1 | Klaviyo RSX9Yp |
| Social Engagements | Number | populated by Sub-step 7.1 | GHL RCArdw + Xuj3ha |
| Lead Conversions | Number | populated by Sub-step 7.1 | HubSpot |
| YouTube Watch Time | Number | when applicable | YouTube Analytics |
| Composite Status | Formula | derived | GREEN / YELLOW / RED based on scorecard rules |
| Optimization Action | Select | post Day-30 | Refresh / Repurpose / Promote / Retire |
| Notes | Text | optional | Strategist notes |

## Trigger formulas

```javascript
// Day-7 trigger
if(dateBetween(now(), prop("Publish Date"), "days") == 7, "FIRE_DAY7", "")

// Day-30 trigger
if(dateBetween(now(), prop("Publish Date"), "days") == 30, "FIRE_DAY30", "")

// Composite scorecard status (simplified — full implementation in src/automation/seven-point-scorer.mjs)
//   Count RED metrics; ≥ 2 → "RED" status, 1 → "YELLOW", 0 → "GREEN"
```

## Setup checklist

- [ ] Replace any existing template-based content calendar with this schema
- [ ] Create the Content Performance Tracker DB and link it from Content Calendar via the `Content Performance Tracker Row` relation field
- [ ] Verify formulas render correctly with at least one test row dated 7+ days in the past
- [ ] Wire `src/automation/seven-point-scorer.mjs` to write to the Performance Tracker daily at 6 AM CDT
