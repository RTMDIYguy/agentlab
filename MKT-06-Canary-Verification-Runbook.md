# MKT-06 Canary Verification Runbook

## Purpose
Use this runbook to prove that `MKT-06 — Content Creation & Dissemination` works end to end in a controlled test. A successful canary run produces the minimum evidence required to keep the workflow in `Testing` and then justify moving it to `Active`.

## Recommended Test Asset
Use a clearly labeled internal-only content item so nobody mistakes the canary for production content.

Suggested title:
`WF6 Canary Test - Internal Verification - YYYY-MM-DD`

Suggested rules:
- Mark all assets `Internal Test`
- Do not send to real external audiences unless you intentionally choose a limited real send
- Use preview lists, test recipients, or draft states wherever possible

## Success Standard
The canary passes only if every required handoff below is either:
- completed successfully with evidence, or
- intentionally skipped with a documented reason and an approved manual fallback

## Required Evidence Chain
You need proof for these checkpoints:

1. Notion planning item created or selected
2. Jira ticket exists and moves through the required statuses
3. Source draft exists in Google Docs or OneDrive
4. GitHub activity exists for the content asset or adaptation work
5. Editorial approval is captured
6. SEO completion is captured
7. At least one adaptation asset exists
8. Klaviyo preview or distribution proof exists
9. Distribution log or publish evidence exists
10. Step 7 performance tracker row exists in Notion

## Canary Procedure

### Step 1: Planning Proof
- Create or identify a Notion item for the canary asset
- Record the page URL or database row URL
- Confirm title, channel targets, owner, and publish date are filled in

Pass condition:
- The canary content item is visible in the planning system and clearly labeled as a test

### Step 2: Jira Proof
- Create the Jira ticket manually or via automation
- Record the Jira URL and ticket ID
- Move the ticket through the expected workflow states as the asset progresses

Minimum statuses to capture:
- `To Do`
- `In Progress`
- `In Review`
- `Approved`
- `SEO Complete`
- `Adaptation Complete`
- `Published` or equivalent test-complete state

Pass condition:
- The ticket exists and at least the main state transitions are visible in Jira history or screenshots

### Step 3: Draft Creation Proof
- Generate or write the canary draft in Google Docs or OneDrive
- Record the document URL or file path
- Confirm the content matches the Jira ticket and Notion item

Pass condition:
- A source draft exists and is linked to the canary record

### Step 4: Repository Proof
- Create the expected GitHub branch or commit for the canary asset
- If the workflow does not yet auto-commit, document the manual workaround
- Capture branch name, commit SHA, pull request URL, or screenshot

Pass condition:
- GitHub contains a visible canary-related artifact or a documented exception with reason

### Step 5: Editorial Proof
- Route the draft through review
- Capture reviewer name, timestamp, and approval outcome
- If the review happened in Teams or comments, capture the link or screenshot

Pass condition:
- There is clear evidence that editorial approval occurred

### Step 6: SEO Proof
- Confirm SEO optimization completed
- Record score, notes, or optimization artifact
- If this is manual for the canary, note exactly what was done

Pass condition:
- SEO completion is visible in the system of record

### Step 7: Adaptation Proof
- Produce at least one channel adaptation
- Preferred: email variant plus one social variant
- Record the asset location and format

Pass condition:
- At least one downstream adaptation exists and is linked back to the canary asset

### Step 8: Distribution Proof
- Use the safest available send path:
- Preferred order: preview send, internal test recipients, limited live send
- Capture Klaviyo preview or campaign evidence
- Capture any GoHighLevel or scheduling evidence if used

Pass condition:
- At least one distribution event is proven with a URL, screenshot, or campaign ID

### Step 9: Analytics Proof
- Wait for the first reporting signal
- Create or confirm the row in `Content Performance Tracker — WF6 Step 7`
- Record the Notion row URL and any observed metrics

Pass condition:
- The content appears in the Step 7 tracking system with at least one recorded review cycle or metric field

### Step 10: Final Decision
Classify the canary result:
- `Pass`
- `Pass with Manual Workarounds`
- `Fail`

Use this rule:
- Move `MKT-06` to `Active` only if the run is `Pass` or `Pass with Manual Workarounds` and all remaining gaps are explicitly documented

## Known Risk Areas From Audit
- Atlassian domain references appear fixed in Notion, but Jira and Confluence still need live write tests
- Klaviyo validation was blocked in-session
- HubSpot attribution was not validated in-session
- GA4, GoHighLevel, Teams, Outlook, and YouTube analytics were not fully verified in-session
- The current Notion content calendar appears template-based and should be checked against the custom URC workflow schema

## Recommended Execution Order
Run the canary in this order:

1. Notion item
2. Jira ticket
3. Draft document
4. GitHub artifact
5. Editorial approval
6. SEO completion
7. Adaptation asset
8. Klaviyo preview or controlled distribution
9. Step 7 tracking row
10. Final pass/fail review

## Go/No-Go Rule
Do not call the workflow fully `Active` if any of these are missing:
- Jira proof
- draft proof
- distribution proof
- Step 7 tracking proof

## Deliverables From This Canary
At the end of the run you should have:
- one completed evidence log
- one folder or page containing screenshots and links
- one final decision: `Testing`, `Needs Update`, or `Active`
