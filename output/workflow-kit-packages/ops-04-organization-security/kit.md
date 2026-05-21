---
schema: kit/1.0
slug: ops-04-organization-security
title: "OPS-04 - Organization & Security"
summary: "Operations workflow package for Organization & Security. Consolidates registry metadata, imported source references, setup guidance, validation notes, and automation blueprints into one operative kit file."
version: 0.1.0-draft
owner: uncle-robert-consulting
license: UNLICENSED
status: imported-draft
conformance: draft
certifiedAt: null
workflowId: OPS-04
department: "Operations"
automationLevel: "N/A - Framework"
primaryOwner: "Founder/CEO"
trigger: "New hire, role change, or tool adoption"
cycleTime: "Org chart: quarterly; access: semi-annual"
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
  - ops
  - operations
---

# OPS-04 - Organization & Security

This is the consolidated `kit.md` for the workflow. It replaces the old imported-package surface as the operative file while keeping source, asset, tracker, and automation files as provenance until certification is complete.

## Goal

Run the Organization & Security workflow for Operations with a repeatable trigger, owner, cycle time, outputs, and validation path. The current draft is strong enough for agent orientation and controlled internal use; certification still requires a live run or documented manual evidence.

## When to Use

Use this workflow when the trigger occurs: **New hire, role change, or tool adoption**.

Use it as part of the URC operating system first. Convert it into a client-safe variant only after URC-specific names, internal assumptions, and tool choices have been scrubbed or intentionally parameterized.

## Registry Metadata

| Field | Value |
| --- | --- |
| Workflow ID | OPS-04 |
| Department | Operations |
| Automation level | N/A - Framework |
| Owner | Founder/CEO |
| Trigger | New hire, role change, or tool adoption |
| Cycle time | Org chart: quarterly; access: semi-annual |
| Source status | Imported source |

## Inputs

- Trigger event or planning cadence identified above.
- Current URC operating context for Operations.
- Any imported source, asset, tracker, or automation artifacts listed in the Source Map.
- Human approval from the owner before external sends, money movement, access changes, or client-visible commitments.

## Setup

1. Read this kit end to end.
2. Review the Source Digest and Source Map below.
3. Bind any placeholders listed in Placeholder and Binding Notes.
4. If an automation blueprint is embedded, import or rebuild it in the chosen runtime only after credentials and fallback paths are confirmed.
5. Run the Validation checklist before treating the workflow as complete.

## Quickstart

1. Confirm the trigger: New hire, role change, or tool adoption.
2. Open the relevant source or asset file from the Source Map.
3. Collect the minimum inputs needed for this cycle.
4. Execute the workflow steps using the imported source as the detailed operating guide.
5. Capture output evidence, exceptions, and follow-up tasks.
6. Record meaningful package or behavior changes in `docs/operations/change-control-register.md`.

## Source Digest

- No detailed source file has been imported yet; use the registry metadata and automation scaffold as the current operating baseline.

## Source Map

| Artifact | Purpose |
| --- | --- |
| `assets/OPS04-Assets.md` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `automation/OPS04-Blueprint.json` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `trackers/OPS04_Tech_Stack_Automation_Registry.xlsx` | Retained provenance/input artifact now referenced by this consolidated kit. |

## Embedded Source and Asset Documents

### assets/OPS04-Assets.md

````markdown
# OPS04: Organization & Security Assets

## 1. Offboarding Security Checklist
*To be executed by Operations/IT immediately upon an employee or contractor's departure.*

**Employee/Contractor Name:** [Name]
**Last Day:** [Date]

**Immediate Action (Within 1 hour of departure):**
- [ ] Block access to primary email/Google Workspace account (Do not delete yet, just block/change password).
- [ ] Revoke access to password manager (e.g., 1Password, LastPass).
- [ ] Remove from internal communication tools (Slack, Discord, Teams).

**Secondary Action (Within 24 hours):**
- [ ] Remove access to CRM (HubSpot, Salesforce).
- [ ] Remove access to Project Management tools (ClickUp, Asana, Notion).
- [ ] Remove access to Financial systems/Expense platforms.
- [ ] Remove access to any client-specific shared folders or tools.
- [ ] Remove from Social Media management tools/native platforms.
- [ ] If applicable, remotely wipe and lock company-issued devices.

**Wrap-Up (Within 1 week):**
- [ ] Transfer ownership of critical Google Drive files to a manager.
- [ ] Set up email forwarding from their account to a manager.
- [ ] Reassign their tool licenses to save costs.

---

## 2. Basic Vendor Security Questionnaire
*Sent to new third-party software vendors or contractors who will handle confidential agency or client data.*

**Vendor Name:** [Vendor]
**Service Provided:** [Service]

1. **Data Storage:** Where is your data physically hosted? (e.g., AWS US-East)
2. **Encryption:** Is data encrypted at rest and in transit?
3. **Access:** Who at your company has access to our data, and how is that access audited?
4. **Compliance:** Are you compliant with GDPR, CCPA, SOC2, or other relevant regulations? (Please attach summary reports if applicable).
5. **Breach History:** Have you experienced a data breach in the last 24 months? If so, what remediation steps were taken?
6. **Sub-processors:** Do you share our data with any third-party sub-processors? (If yes, please list them).

---

## 3. Incident Response Log (Template)
*Maintained by the Operations Lead to track security incidents.*

| Incident ID | Date/Time | Incident Type | Description & Scope | Remediation Actions Taken | Status | Lessons Learned / SOP Updates |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| INC-001 | 2024-05-12 | Phishing | Employee clicked phishing link. No data exfiltrated. | Reset employee password, ran malware scan, enforced MFA. | Closed | Added mandatory quarterly phishing awareness training. |
| INC-002 | | | | | | |
````

### automation/OPS04-Blueprint.json

````json
{
  "name": "OPS04: Security & Access Control (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "google-workspace:watchAdminAudit",
      "version": 1,
      "parameters": {
        "applicationName": "login"
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
            "content": "Analyze login anomalies and flag unauthorized agent activities."
          }
        ]
      }
    },
    {
      "id": 3,
      "module": "slack:createMessage",
      "version": 1,
      "parameters": {
        "channel": "alerts-security"
      }
    }
  ]
}
````

## Binary Attachments

- `trackers/OPS04_Tech_Stack_Automation_Registry.xlsx`: binary attachment retained outside the Markdown kit; convert to CSV/Markdown during certification if the sheet contents become authoritative.

## Automation Blueprint

### OPS04-Blueprint.json

```json
{
  "name": "OPS04: Security & Access Control (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "google-workspace:watchAdminAudit",
      "version": 1,
      "parameters": {
        "applicationName": "login"
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
            "content": "Analyze login anomalies and flag unauthorized agent activities."
          }
        ]
      }
    },
    {
      "id": 3,
      "module": "slack:createMessage",
      "version": 1,
      "parameters": {
        "channel": "alerts-security"
      }
    }
  ]
}
```

## Placeholder and Binding Notes

- No obvious placeholder tokens were found in imported Markdown or JSON artifacts.

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
