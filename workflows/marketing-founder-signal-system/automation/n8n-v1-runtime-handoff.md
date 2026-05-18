# n8n V1 Runtime Handoff — Founder Signal System

Date: 2026-05-17
Status: preferred v1 runtime
Related Make status: built but not enabled; Make free plan blocks activation

## Decision

Use local self-hosted n8n as the v1 runtime for the Founder Signal System.

Make.com remains useful as a future Standard-tier public-template path, but it
is not the right active runtime while the free account blocks activation and
OpenAI credits are exhausted.

## Why n8n

- Local n8n is already running.
- MKT-06 workflow exists in n8n and was tested recently.
- The repo already carries an importable MKT-06 n8n template:
  `mkt-06-content-creation-dissemination/n8n/mkt-06-content-creation-dissemination.workflow.json`
- n8n avoids Make.com's free active-scenario limit.
- n8n aligns with the current workflow certification path and evidence-log
  discipline.

## Existing Asset To Reuse

Use the existing n8n workflow as the starting pattern:

- n8n workflow name observed by Robert: Workflow 06 / MKT-06
- Repo template:
  `mkt-06-content-creation-dissemination/n8n/mkt-06-content-creation-dissemination.workflow.json`
- Known live-node status from MKT-06 README:
  HubSpot read-only attribution check has already been validated against local
  self-hosted n8n.

## Current n8n Workflow Inventory

Observed in local n8n on 2026-05-17:

| Workflow | Observed Role | Status / Notes |
| --- | --- | --- |
| `MKT-06 - Content Creation & Dissemination` | Main MKT-06 package template | Imported and nominally tested; still needs node-by-node certification before being treated as fully certified. Do not disturb while building Founder Signal. |
| `Automated AI Lead Enrichment: Hubspot to Explorium for Enhanced Prospect Data` | Lead enrichment reference workflow | Useful as a HubSpot/enrichment pattern, but not the v1 Founder Signal runtime. Keep separate. |
| `MKT-06 TEST - HubSpot Attribution Read Check` | Isolated HubSpot read test | Keep as a service credential/read-node validation harness. This supports certification evidence. |
| `My workflow` | n8n starter AI-agent example | Appears to be the only active/live workflow. Treat as a sandbox/tutorial workflow unless Robert confirms it is serving a real process. |

Working rule: create a new separate workflow named
`Founder Signal System - Intake to Setup Packet`. Do not modify the imported
MKT-06 workflow or the HubSpot test harness for this v1 intake automation.

## Founder Signal Workflow Creation Log

Logged: 2026-05-17

- New n8n workflow created:
  `Founder Signal System - Intake to Setup Packet`
- Local URL observed:
  `http://localhost:5678/workflow/JV3uEgRsFkTnGUJM`
- Initial state: blank canvas, not published.
- Next build target: Tally or webhook trigger, normalize fields, AI setup
  packet, Gmail/Outlook output.
- Tally n8n plugin installed.
- Tally trigger configured and test-triggered successfully.
- Next node: `Normalize Founder Intake`.
- Local networking prevents Tally cloud from reliably reaching localhost n8n
  without a public tunnel, so the v1 proof path was switched to a clickable
  manual trigger.
- Manual trigger skeleton tested successfully through two Edit Fields nodes:
  normalized intake placeholder and setup packet placeholder.
- Gmail output is deferred because self-hosted n8n requires a custom Google
  Cloud OAuth2 single-service credential with Client ID and Client Secret.
  For the immediate v1 proof, use a local/log/placeholder output before adding
  Gmail.
- Manual-trigger v1 skeleton execution passed successfully after adding the
  final local review output. Current proven path: clickable trigger to
  normalized intake placeholder to setup packet placeholder to final review
  output.

## Founder Signal V1 Shape

Build or clone a small workflow with this shape:

1. **Tally trigger or webhook intake**
   - Capture the current Tally v1 fields:
     - First name
     - Last name
     - Work email
     - Company name
     - Current monthly revenue
     - #1 goal for the next 90 days
     - Form name
     - Created at
2. **AI setup packet node**
   - Generate:
     - Signal Brief
     - Content Cycle Prompt
     - Outreach Angle
     - Three-Touch Follow-Up Draft
     - Proof Loop Fields
     - Next Cycle Question
   - Missing offer, ideal customer, proof points, exclusions, and primary
     channel should be labeled `Needs founder confirmation`.
3. **Gmail or Outlook summary**
   - Send the setup packet internally for review.
4. **Optional tracker row**
   - Add a row to Google Sheets, Microsoft Excel, or Microsoft Lists.

## AI Prompt

```text
Create a Founder Signal setup packet from this intake. Return sections titled Signal Brief, Content Cycle Prompt, Outreach Angle, Three-Touch Follow-Up Draft, Proof Loop Fields, and Next Cycle Question.

Founder: {{First name}} {{Last name}}
Email: {{Work email}}
Company: {{Company name}}
Current monthly revenue: {{Current monthly revenue}}
Primary 90-day goal: {{#1 goal for the next 90 days}}
Form: {{Form name}}
Submitted at: {{Created at}}

Because this intake does not include offer, ideal customer, proof points, exclusions, or primary channel, infer only a tentative draft from the company name, revenue range, and 90-day goal. Clearly label any inferred section as "Needs founder confirmation." Default the primary channel to LinkedIn unless the goal implies otherwise.
```

## Activation Rule

Keep the n8n workflow inactive until:

- Tally/webhook intake receives one test submission.
- AI node returns all six sections.
- Gmail/Outlook or tracker output succeeds.
- The test uses non-sensitive sample data.

Once all four pass, n8n can become the active v1 runtime for the package.

## Package Positioning

- Manual tier: Markdown templates in `assets/`
- V1 automation runtime: n8n self-hosted workflow
- Deferred Standard-tier template: Make.com public sharing link after paid
  activation and OpenAI billing are restored
