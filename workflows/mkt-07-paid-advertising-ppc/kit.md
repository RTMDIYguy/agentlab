---
schema: kit/1.0
slug: mkt-07-paid-advertising-ppc
title: "MKT-07 - Paid Advertising & PPC"
summary: "Marketing workflow package for Paid Advertising & PPC. Consolidates registry metadata, imported source references, setup guidance, validation notes, and automation blueprints into one operative kit file."
version: 0.1.0-draft
owner: uncle-robert-consulting
license: UNLICENSED
status: imported-draft
conformance: draft
certifiedAt: null
workflowId: MKT-07
department: "Marketing"
automationLevel: "85-90%"
primaryOwner: "Marcus + Robert"
trigger: "Marketing calendar or pipeline gap"
cycleTime: "Launch: 48-72 hrs; optimization: daily"
sourceStatus: "Imported source + automation"
changeLog:
  - date: 2026-05-21
    changeId: CC-2026-05-21-013
    version: 0.1.0-draft
    type: consolidation
    summary: Converted imported workflow package into a single operative kit.md with source map, quickstart, setup, validation, certification gaps, and embedded automation blueprint when available.
    author: codex
tags:
  - workflow-package
  - mkt
  - marketing
---

# MKT-07 - Paid Advertising & PPC

This is the consolidated `kit.md` for the workflow. It replaces the old imported-package surface as the operative file while keeping source, asset, tracker, and automation files as provenance until certification is complete.

## Goal

Run the Paid Advertising & PPC workflow for Marketing with a repeatable trigger, owner, cycle time, outputs, and validation path. The current draft is strong enough for agent orientation and controlled internal use; certification still requires a live run or documented manual evidence.

## When to Use

Use this workflow when the trigger occurs: **Marketing calendar or pipeline gap**.

Use it as part of the URC operating system first. Convert it into a client-safe variant only after URC-specific names, internal assumptions, and tool choices have been scrubbed or intentionally parameterized.

## Registry Metadata

| Field | Value |
| --- | --- |
| Workflow ID | MKT-07 |
| Department | Marketing |
| Automation level | 85-90% |
| Owner | Marcus + Robert |
| Trigger | Marketing calendar or pipeline gap |
| Cycle time | Launch: 48-72 hrs; optimization: daily |
| Source status | Imported source + automation |

## Inputs

- Trigger event or planning cadence identified above.
- Current URC operating context for Marketing.
- Any imported source, asset, tracker, or automation artifacts listed in the Source Map.
- Human approval from the owner before external sends, money movement, access changes, or client-visible commitments.

## Setup

1. Read this kit end to end.
2. Review the Source Digest and Source Map below.
3. Bind any placeholders listed in Placeholder and Binding Notes.
4. If an automation blueprint is embedded, import or rebuild it in the chosen runtime only after credentials and fallback paths are confirmed.
5. Run the Validation checklist before treating the workflow as complete.

## Quickstart

1. Confirm the trigger: Marketing calendar or pipeline gap.
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
| `automation/MKT07-Paid-Advertising-Blueprint.json` | Retained provenance/input artifact now referenced by this consolidated kit. |
| `trackers/MKT07_Marketing_KPI_Dashboard.xlsx` | Retained provenance/input artifact now referenced by this consolidated kit. |

## Embedded Source and Asset Documents

### automation/MKT07-Paid-Advertising-Blueprint.json

````json
{
  "name": "MKT07: Paid Advertising Budget & Performance Monitor (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "schedule:trigger",
      "version": 1,
      "parameters": {
        "interval": "4h"
      },
      "mapper": {},
      "metadata": {
        "designer": {
          "x": 0,
          "y": 0
        }
      }
    },
    {
      "id": 2,
      "module": "google-ads:getCampaignPerformance",
      "version": 1,
      "parameters": {},
      "mapper": {
        "dateRange": "TODAY",
        "metrics": ["cost", "conversions", "impressions", "clicks"]
      },
      "metadata": {
        "designer": {
          "x": 300,
          "y": 0
        }
      }
    },
    {
      "id": 3,
      "module": "openai:createCompletion",
      "version": 1,
      "parameters": {
        "model": "gpt-4"
      },
      "mapper": {
        "messages": [
          {
            "role": "system",
            "content": "You are an ad ops analyst. Given daily spend data, calculate budget pacing against the monthly cap. If spend exceeds 80% of the monthly budget before the 20th of the month, flag as OVERPACING. If any campaign has zero conversions with spend above $50, flag as UNDERPERFORMING. Return a JSON object with fields: status (OK|OVERPACING|UNDERPERFORMING), spendToDate, monthlyBudget, pacingPercent, flaggedCampaigns[]."
          },
          {
            "role": "user",
            "content": "Campaign data: {{2.campaigns}}"
          }
        ]
      },
      "metadata": {
        "designer": {
          "x": 600,
          "y": 0
        }
      }
    },
    {
      "id": 4,
      "module": "builtin:Router",
      "version": 1,
      "parameters": {},
      "mapper": {},
      "metadata": {
        "designer": {
          "x": 900,
          "y": 0
        }
      }
    },
    {
      "id": 5,
      "module": "microsoft-teams:createMessage",
      "version": 1,
      "parameters": {
        "channel": "marketing-alerts"
      },
      "mapper": {
        "text": "🚨 *Ad Budget Alert*\n*Status:* {{3.choices[0].message.content}}\n*Action:* Review campaign pacing immediately."
      },
      "metadata": {
        "designer": {
          "x": 1200,
          "y": -150
        },
        "note": "Route: status != OK"
      }
    },
    {
      "id": 6,
      "module": "google-sheets:appendRow",
      "version": 1,
      "parameters": {
        "spreadsheetId": "YOUR_MKT07_TRACKER_ID"
      },
      "mapper": {
        "values": ["{{formatDate(now; 'YYYY-MM-DD')}}", "{{3.choices[0].message.content}}"]
      },
      "metadata": {
        "designer": {
          "x": 1200,
          "y": 150
        },
        "note": "Route: always (log all checks)"
      }
    }
  ],
  "metadata": {
    "version": 1
  }
}
````

## Binary Attachments

- `trackers/MKT07_Marketing_KPI_Dashboard.xlsx`: binary attachment retained outside the Markdown kit; convert to CSV/Markdown during certification if the sheet contents become authoritative.

## Automation Blueprint

### MKT07-Paid-Advertising-Blueprint.json

```json
{
  "name": "MKT07: Paid Advertising Budget & Performance Monitor (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "schedule:trigger",
      "version": 1,
      "parameters": {
        "interval": "4h"
      },
      "mapper": {},
      "metadata": {
        "designer": {
          "x": 0,
          "y": 0
        }
      }
    },
    {
      "id": 2,
      "module": "google-ads:getCampaignPerformance",
      "version": 1,
      "parameters": {},
      "mapper": {
        "dateRange": "TODAY",
        "metrics": ["cost", "conversions", "impressions", "clicks"]
      },
      "metadata": {
        "designer": {
          "x": 300,
          "y": 0
        }
      }
    },
    {
      "id": 3,
      "module": "openai:createCompletion",
      "version": 1,
      "parameters": {
        "model": "gpt-4"
      },
      "mapper": {
        "messages": [
          {
            "role": "system",
            "content": "You are an ad ops analyst. Given daily spend data, calculate budget pacing against the monthly cap. If spend exceeds 80% of the monthly budget before the 20th of the month, flag as OVERPACING. If any campaign has zero conversions with spend above $50, flag as UNDERPERFORMING. Return a JSON object with fields: status (OK|OVERPACING|UNDERPERFORMING), spendToDate, monthlyBudget, pacingPercent, flaggedCampaigns[]."
          },
          {
            "role": "user",
            "content": "Campaign data: {{2.campaigns}}"
          }
        ]
      },
      "metadata": {
        "designer": {
          "x": 600,
          "y": 0
        }
      }
    },
    {
      "id": 4,
      "module": "builtin:Router",
      "version": 1,
      "parameters": {},
      "mapper": {},
      "metadata": {
        "designer": {
          "x": 900,
          "y": 0
        }
      }
    },
    {
      "id": 5,
      "module": "microsoft-teams:createMessage",
      "version": 1,
      "parameters": {
        "channel": "marketing-alerts"
      },
      "mapper": {
        "text": "🚨 *Ad Budget Alert*\n*Status:* {{3.choices[0].message.content}}\n*Action:* Review campaign pacing immediately."
      },
      "metadata": {
        "designer": {
          "x": 1200,
          "y": -150
        },
        "note": "Route: status != OK"
      }
    },
    {
      "id": 6,
      "module": "google-sheets:appendRow",
      "version": 1,
      "parameters": {
        "spreadsheetId": "YOUR_MKT07_TRACKER_ID"
      },
      "mapper": {
        "values": ["{{formatDate(now; 'YYYY-MM-DD')}}", "{{3.choices[0].message.content}}"]
      },
      "metadata": {
        "designer": {
          "x": 1200,
          "y": 150
        },
        "note": "Route: always (log all checks)"
      }
    }
  ],
  "metadata": {
    "version": 1
  }
}
```

## Placeholder and Binding Notes

- `automation/MKT07-Paid-Advertising-Blueprint.json`: YOUR_MKT07_TRACKER_ID

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
