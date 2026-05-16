# Scheduled Change Queue

Date started: 2026-05-07

## Purpose

This queue gives planned changes a place to wait without slowing down urgent
workflow testing, certification, packaging, and market release.

## Priority Rule

Every hand on deck stays focused on:

1. testing workflows
2. certifying workflows
3. packaging workflows
4. getting them to market

Changes that do not directly support that path should be scheduled, not fired
immediately.

## Lanes

| Lane | Use For | Rule |
| --- | --- | --- |
| Fast Lane | Fixes that unblock testing, certification, packaging, or release | Do the work, then log it before the session ends |
| Scheduled | Useful improvements that can wait | Add a row here before implementation |
| Parked | Interesting but distracting ideas | Capture only the minimum; revisit after release work |

## Queue

| Date Added | Change ID | Lane | Area | Proposed Change | Reason | Target Window | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-05-07 | CC-2026-05-07-002 | Fast Lane | Operations / Compliance | Add log distribution rule and scheduled-change queue. | Needed to stop scattered audit files and surprise edits from delaying workflow certification. | 2026-05-07 | codex | Active |
| 2026-05-07 | CC-2026-05-07-003 | Fast Lane | Kit / Auth / Packaging | Add flexible kit auth standard and MKT-06 connector matrix. | Required to support one-click and agentic installs without making buyers manually chase API keys. | 2026-05-07 | codex | Active |
| 2026-05-07 | CC-2026-05-07-004 | Fast Lane | Kit Standard | Patch canonical `Journey_Kit.md` with `kit-auth/1.0`. | Needed because `Journey_Kit.md` is the actual kit standard source of truth. | 2026-05-07 | codex | Active |
| 2026-05-09 | CC-2026-05-09-001 | Fast Lane | Operations / Automation | Document Node.js LTS change and n8n npm repair. | n8n is part of the active workflow testing environment; restoring it directly unblocked certification and packaging work. | 2026-05-09 | codex + operator | Active |
| 2026-05-09 | CC-2026-05-09-002 | Fast Lane | Kit / Testing | Take MKT-06 into a controlled testing environment and run the first canary viability test. | MKT-06 is the first workflow intended for market and must prove install/run/evidence viability before packaging claims expand. | Next MKT-06 work session | URC + codex | Active |
| 2026-05-10 | CC-2026-05-10-001 | Fast Lane | Operations / Automation | Reclaim E: for AI storage and move Ollama/OpenClaw toward a usable local setup. | Local AI tooling supports workflow testing and reduces pressure on C: while keeping low-cost model options available. | 2026-05-10, follow-up after reboot | codex + operator | Active |
| 2026-05-15 | CC-2026-05-15-001 | Fast Lane | Operations / Packaging / Agent | Package active workflow docs for GitHub resilience and give OpenClaw a constrained orientation prompt. | The power outage showed that local-only access is an operational risk; OpenClaw also needs exact file-based instructions before it can help safely. | 2026-05-15 | codex + operator | Active |
| 2026-05-15 | CC-2026-05-15-002 | Fast Lane | Workflow Packaging / Marketing | Import the 45-workflow registry and first Marketing workflow source batch into repo-native folders. | The repo needs online-readable workflow sources before agents can continue packaging without local-only archive access. | 2026-05-15 | codex + operator | Active |
| 2026-05-15 | CC-2026-05-15-003 | Fast Lane | Revenue Sprint / Marketing Package | Build the Founder Signal System as a thin vertical slice across MKT-01, MKT-03, MKT-06, MKT-05, MKT-02, and MKT-04. | MKT-06 is the visible market pain point, but it needs ICP, diagnostic, outreach, nurture, and proof-loop dependencies to become a sellable starter system. | 2026-05-15 | Claude + operator | Active |
| 2026-05-16 | CC-2026-05-16-001 | Fast Lane | Revenue Sprint / Marketing Package | Normalize Founder Signal System follow-up cadence to three total outreach/follow-up touches. | The draft package mixed "three-touch follow-up" language with a four-touch template; correction keeps the offer aligned with MKT-05 source rules before market use. | 2026-05-16 | codex | Active |

## Intake Checklist

Before implementing a non-urgent change:

- [ ] Does this directly unblock workflow testing, certification, packaging, or release?
- [ ] Does it reduce tool cost or manual drag?
- [ ] Does it preserve Microsoft 365 as the operating backbone?
- [ ] Does it avoid adding a paid tool unless the time savings are obvious?
- [ ] Is there a clear rollback or superseded path?
