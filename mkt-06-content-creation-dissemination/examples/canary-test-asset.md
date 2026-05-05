# MKT-06 Canary Verification — Worked Example

A canary run is the only way to promote MKT-06 from Testing to Active in the Master Workflow Index. This file is the worked example. The runtime driver lives at `../src/canary/run-canary.mjs` and writes the evidence log to `MKT-06-Canary-Evidence-Log.csv`.

## Test asset convention

Use a clearly labeled internal-only content item so nobody mistakes the canary for production content.

- Title: `WF6 Canary Test — Internal Verification — YYYY-MM-DD`
- Mark all assets `Internal Test` in Notion, Jira, and GitHub branch names
- Do not send to real external audiences. Use Klaviyo Preview List `XbByas` and internal test recipients only

## Required evidence chain (10 checkpoints)

| # | Checkpoint | System of Record | Pass Condition |
|---|------------|------------------|----------------|
| 1 | Notion planning item | Notion Content Calendar | URL captured; title/channels/owner/publish date filled |
| 2 | Jira ticket through 7 statuses | Jira (atlassian.net) | Ticket URL + state transitions captured: To Do → In Progress → In Review → Approved → SEO Complete → Adaptation Complete → Published |
| 3 | Source draft | Google Docs / OneDrive | Doc URL captured; content matches Jira + Notion |
| 4 | Repository artifact | GitHub `RTMDIYguy/urc-content-assets` | Branch `content/{ticket}/{slug}` and commit SHA captured (or documented manual exception) |
| 5 | Editorial approval | Microsoft Teams / Notion comments | Reviewer name + timestamp + outcome captured |
| 6 | SEO completion | Confluence / Notion | On-page SEO score ≥ 85; report URL captured |
| 7 | At least one adaptation | Drive / OneDrive / GitHub `/adaptations/{ticket-id}/` | Email variant + ≥ 1 social variant linked back to master Notion page |
| 8 | Klaviyo preview | Klaviyo Preview List `XbByas` | Preview campaign ID or screenshot captured |
| 9 | Step 7 tracker row | Notion Content Performance Tracker | Row exists with at least one observed metric or review cycle |
| 10 | Final decision | Notion + Master Workflow Index | One of: Pass / Pass with Manual Workarounds / Fail |

## Worked run (template)

Replace placeholders before running. Each row maps to a column in `MKT-06-Canary-Evidence-Log.csv`.

```yaml
canary_id: WF6-CANARY-2026-05-02
test_asset_title: "WF6 Canary Test — Internal Verification — 2026-05-02"
checkpoints:
  - id: 1
    name: notion_planning_item
    url: https://www.notion.so/<placeholder>
    captured_at: 2026-05-02T09:00:00-05:00
    pass: true
  - id: 2
    name: jira_ticket
    url: https://unclerobertconsulting.atlassian.net/browse/MKT-<placeholder>
    states_captured:
      - {state: "To Do", at: 2026-05-02T09:01:00-05:00}
      - {state: "In Progress", at: 2026-05-02T09:15:00-05:00}
      - {state: "In Review", at: 2026-05-02T11:30:00-05:00}
      - {state: "Approved", at: 2026-05-02T14:00:00-05:00}
      - {state: "SEO Complete", at: 2026-05-02T15:30:00-05:00}
      - {state: "Adaptation Complete", at: 2026-05-02T18:00:00-05:00}
      - {state: "Published", at: 2026-05-03T09:00:00-05:00}
    pass: true
  - id: 3
    name: source_draft
    url: https://docs.google.com/document/d/<placeholder>
    pass: true
  - id: 4
    name: github_artifact
    branch: content/MKT-<placeholder>/wf6-canary-2026-05-02
    commit_sha: <placeholder>
    pull_request: https://github.com/RTMDIYguy/urc-content-assets/pull/<placeholder>
    pass: true
  - id: 5
    name: editorial_approval
    reviewer: <placeholder>
    approved_at: 2026-05-02T14:00:00-05:00
    evidence_url: https://teams.microsoft.com/<placeholder>
    pass: true
  - id: 6
    name: seo_complete
    onpage_score: 88
    report_url: https://www.notion.so/<placeholder>
    pass: true
  - id: 7
    name: adaptation
    variants:
      - {channel: email, path: adaptations/MKT-<placeholder>/email.html}
      - {channel: linkedin, path: adaptations/MKT-<placeholder>/linkedin.md}
    pass: true
  - id: 8
    name: klaviyo_preview
    list: XbByas
    campaign_id: <placeholder>
    pass: true
  - id: 9
    name: step7_tracker_row
    url: https://www.notion.so/<placeholder>
    observed_metrics:
      - {metric: page_views, source: GA4, value_at: 24h}
    pass: true
  - id: 10
    name: final_decision
    decision: Pass with Manual Workarounds
    notes: |
      Klaviyo and HubSpot live writes succeeded. Atlassian site URL still
      reads atlasian.net and was patched to atlassian.net for this run via
      a manual override. Promote MKT-06 to Active conditional on the
      domain fix being committed before the next cycle.
```

## Go / No-Go rule

Do not promote MKT-06 to Active if any of these are missing or skipped without a documented manual fallback:

- Jira proof
- Draft proof
- Distribution proof (Klaviyo preview at minimum)
- Step 7 tracking proof

## After the canary

1. Save the completed YAML above to `MKT-06-Canary-Evidence-Log.csv` (or its YAML equivalent in `examples/runs/<canary_id>.yaml`)
2. Attach screenshots to `examples/runs/<canary_id>/` for any checkpoint that depended on a system without an addressable URL
3. Update `Master Workflow Index.md` with the date moved to Active and a link to this evidence
4. File any open issues from the run as Jira tickets under the `MKT-06` epic
