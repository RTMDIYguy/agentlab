---
schema: kit/1.0
slug: mkt-08-social-media-management
title: "MKT-08 - Social Media Management"
summary: "Marketing workflow package for Social Media Management. Consolidates registry metadata, imported source references, setup guidance, validation notes, and automation blueprints into one operative kit file."
version: 0.1.0-draft
owner: uncle-robert-consulting
license: UNLICENSED
status: imported-draft
conformance: draft
certifiedAt: null
workflowId: MKT-08
department: "Marketing"
automationLevel: "80-85%"
primaryOwner: "Marcus + Robert"
trigger: "25th of prior month (calendar planning)"
cycleTime: "30-day calendar; daily posts"
sourceStatus: "Automation scaffold only"
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

# MKT-08 - Social Media Management

This is the consolidated `kit.md` for the workflow. It replaces the old imported-package surface as the operative file while keeping source, asset, tracker, and automation files as provenance until certification is complete.

## Goal

Run the Social Media Management workflow for Marketing with a repeatable trigger, owner, cycle time, outputs, and validation path. The current draft is strong enough for agent orientation and controlled internal use; certification still requires a live run or documented manual evidence.

## When to Use

Use this workflow when the trigger occurs: **25th of prior month (calendar planning)**.

Use it as part of the URC operating system first. Convert it into a client-safe variant only after URC-specific names, internal assumptions, and tool choices have been scrubbed or intentionally parameterized.

## Registry Metadata

| Field | Value |
| --- | --- |
| Workflow ID | MKT-08 |
| Department | Marketing |
| Automation level | 80-85% |
| Owner | Marcus + Robert |
| Trigger | 25th of prior month (calendar planning) |
| Cycle time | 30-day calendar; daily posts |
| Source status | Automation scaffold only |

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

1. Confirm the trigger: 25th of prior month (calendar planning).
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
| `automation/MKT08-Social-Media-Blueprint.json` | Retained provenance/input artifact now referenced by this consolidated kit. |

## Embedded Source and Asset Documents

### automation/MKT08-Social-Media-Blueprint.json

````json
{
  "name": "MKT08: Social Media Scheduling & Engagement Monitor (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "google-sheets:watchRows",
      "version": 1,
      "parameters": {
        "spreadsheetId": "YOUR_CONTENT_CALENDAR_ID",
        "sheetName": "Queue"
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
      "module": "openai:createCompletion",
      "version": 1,
      "parameters": {
        "model": "gpt-4"
      },
      "mapper": {
        "messages": [
          {
            "role": "system",
            "content": "You are a social media manager for a professional consulting brand. Given a content brief and target platform, write a post optimized for that platform. LinkedIn: professional, no hashtags, max 1300 characters. Twitter/X: punchy, max 280 characters. Include a call-to-action. Generate an idempotency key as a SHA-256 of the post text."
          },
          {
            "role": "user",
            "content": "Platform: {{1.platform}}\nBrief: {{1.contentBrief}}\nCTA: {{1.cta}}\nLink: {{1.link}}"
          }
        ]
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
      "module": "builtin:Router",
      "version": 1,
      "parameters": {},
      "mapper": {},
      "metadata": {
        "designer": {
          "x": 600,
          "y": 0
        }
      }
    },
    {
      "id": 4,
      "module": "linkedin:createPost",
      "version": 1,
      "parameters": {},
      "mapper": {
        "text": "{{2.choices[0].message.content}}",
        "visibility": "PUBLIC"
      },
      "metadata": {
        "designer": {
          "x": 900,
          "y": -150
        },
        "note": "Route: platform = LinkedIn"
      }
    },
    {
      "id": 5,
      "module": "twitter:createTweet",
      "version": 1,
      "parameters": {},
      "mapper": {
        "text": "{{2.choices[0].message.content}}"
      },
      "metadata": {
        "designer": {
          "x": 900,
          "y": 150
        },
        "note": "Route: platform = Twitter"
      }
    },
    {
      "id": 6,
      "module": "google-sheets:updateRow",
      "version": 1,
      "parameters": {
        "spreadsheetId": "YOUR_CONTENT_CALENDAR_ID"
      },
      "mapper": {
        "values": {
          "status": "Published",
          "publishedDate": "{{formatDate(now; 'YYYY-MM-DD HH:mm')}}"
        }
      },
      "metadata": {
        "designer": {
          "x": 1200,
          "y": 0
        }
      }
    }
  ],
  "metadata": {
    "version": 1
  }
}
````

## Binary Attachments

- None.

## Automation Blueprint

### MKT08-Social-Media-Blueprint.json

```json
{
  "name": "MKT08: Social Media Scheduling & Engagement Monitor (Make.com Blueprint)",
  "flow": [
    {
      "id": 1,
      "module": "google-sheets:watchRows",
      "version": 1,
      "parameters": {
        "spreadsheetId": "YOUR_CONTENT_CALENDAR_ID",
        "sheetName": "Queue"
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
      "module": "openai:createCompletion",
      "version": 1,
      "parameters": {
        "model": "gpt-4"
      },
      "mapper": {
        "messages": [
          {
            "role": "system",
            "content": "You are a social media manager for a professional consulting brand. Given a content brief and target platform, write a post optimized for that platform. LinkedIn: professional, no hashtags, max 1300 characters. Twitter/X: punchy, max 280 characters. Include a call-to-action. Generate an idempotency key as a SHA-256 of the post text."
          },
          {
            "role": "user",
            "content": "Platform: {{1.platform}}\nBrief: {{1.contentBrief}}\nCTA: {{1.cta}}\nLink: {{1.link}}"
          }
        ]
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
      "module": "builtin:Router",
      "version": 1,
      "parameters": {},
      "mapper": {},
      "metadata": {
        "designer": {
          "x": 600,
          "y": 0
        }
      }
    },
    {
      "id": 4,
      "module": "linkedin:createPost",
      "version": 1,
      "parameters": {},
      "mapper": {
        "text": "{{2.choices[0].message.content}}",
        "visibility": "PUBLIC"
      },
      "metadata": {
        "designer": {
          "x": 900,
          "y": -150
        },
        "note": "Route: platform = LinkedIn"
      }
    },
    {
      "id": 5,
      "module": "twitter:createTweet",
      "version": 1,
      "parameters": {},
      "mapper": {
        "text": "{{2.choices[0].message.content}}"
      },
      "metadata": {
        "designer": {
          "x": 900,
          "y": 150
        },
        "note": "Route: platform = Twitter"
      }
    },
    {
      "id": 6,
      "module": "google-sheets:updateRow",
      "version": 1,
      "parameters": {
        "spreadsheetId": "YOUR_CONTENT_CALENDAR_ID"
      },
      "mapper": {
        "values": {
          "status": "Published",
          "publishedDate": "{{formatDate(now; 'YYYY-MM-DD HH:mm')}}"
        }
      },
      "metadata": {
        "designer": {
          "x": 1200,
          "y": 0
        }
      }
    }
  ],
  "metadata": {
    "version": 1
  }
}
```

## Placeholder and Binding Notes

- `automation/MKT08-Social-Media-Blueprint.json`: YOUR_CONTENT_CALENDAR_ID

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
