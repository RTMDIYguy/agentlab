# Change Control Register

Date started: 2026-05-07

## Purpose

This register stops fast operational changes from leaking past the audit trail.
It is intentionally file-based so it stays free, local, and agent-readable.

Use this when changing:

- kit manifests
- workflow source files
- agent prompts
- tracker schemas
- operating architecture docs
- CRM-lite, finance, or funnel control files

## Rule

Every meaningful change needs one visible entry before the work is considered done.

Small typo fixes can be grouped. Anything that changes behavior, ownership,
workflow steps, automations, source-of-truth status, or required tools needs its
own entry.

## Log Distribution Rule

Station a log beside the workflow, kit, tracker, or automation it verifies when
that local placement helps someone run or debug the work.

If the log is a compliance, audit, certification, readiness, or cross-workflow
evidence record and does not need to live beside a specific artifact, place it
in:

`C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\Compliance Audits`

That folder is the temporary compliance-audit home until it is promoted into
the Operations SOP structure.

## Change Scheduling

Use scheduled changes whenever possible. This is not meant to slow the work
down; it prevents five good ideas from firing at once and hiding the one that
breaks the system.

Scheduled changes live in `docs/operations/scheduled-change-queue.md`.

Use the fast lane only when a change is needed to unblock testing,
certification, packaging, or market release. Fast-lane changes still need a
change-control entry before the session ends.

## Required Entry Fields

| Field | Meaning |
| --- | --- |
| Date | YYYY-MM-DD |
| Change ID | Stable ID such as `CC-2026-05-07-001` |
| Area | Kit, Finance, CRM-lite, Book Funnel, Event, Agent, Automation, Site |
| Files | Main files changed |
| Summary | What changed in plain English |
| Reason | Why the change was needed |
| Source of Truth Impact | New, updated, deprecated, or none |
| Automation Impact | n8n, script, manual, none |
| Reviewer | Person or agent that checked it |
| Status | Proposed, Active, Superseded, Reverted |

## Current Entries

| Date | Change ID | Area | Files | Summary | Reason | Source of Truth Impact | Automation Impact | Reviewer | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-05-07 | CC-2026-05-07-001 | Kit / Agent | `mkt-06-content-creation-dissemination/kit.md`; `mkt-06-content-creation-dissemination/assets/agent-versions.md`; `scripts/verify-change-control.mjs`; `package.json` | Added file-based change-control register, kit changelog standard, agent version ledger, and validation script. | The audit found MKT-06 could change while still appearing to be version `1.0.0`; this creates a free guardrail against quiet edits. | Updated: MKT-06 kit and change-control register now carry the visible audit trail. | Script: `pnpm change-control:check` | codex | Active |
| 2026-05-07 | CC-2026-05-07-002 | Operations / Compliance | `docs/operations/change-control-register.md`; `docs/operations/scheduled-change-queue.md`; `AGENTS.md`; `scripts/verify-change-control.mjs` | Added log distribution rule, scheduled-change queue, and mission priority reminder. | The workflow packaging push is being delayed by scattered logs, surprise changes, and tool friction; the system needs a lightweight control lane that preserves speed. | Updated: compliance audit logs now route to `AI Native Agency Deepened\Compliance Audits` unless they must stay with their artifact. | Script: `pnpm change-control:check` | codex | Active |
| 2026-05-07 | CC-2026-05-07-003 | Kit / Auth / Packaging | `docs/operations/kit-auth-standard.md`; `docs/operations/kit-auth-standard-audit-2026-05-07.md`; `docs/operations/notion-tracker-update-2026-05-07-kit-auth-standard.md`; `mkt-06-content-creation-dissemination/kit.md`; `mkt-06-content-creation-dissemination/README.md`; `scripts/verify-change-control.mjs` | Added `kit-auth/1.0` standard and embedded MKT-06 auth policy/connector matrix. | One-click and agentic installs need a flexible but certifiable auth contract across 15-20 connector variations. | Updated: Kit standard now requires auth method, setup mode, validation, fallback, revocation, and missing-impact fields. | Script: `pnpm change-control:check`; Notion tracker update prepared | codex | Active |
| 2026-05-07 | CC-2026-05-07-004 | Kit Standard | `C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\Journey_Kit.md`; `docs/operations/change-control-register.md`; `docs/operations/scheduled-change-queue.md`; `docs/operations/kit-auth-standard-audit-2026-05-07.md`; `scripts/verify-change-control.mjs` | Added `kit-auth/1.0` fields and connector contract to the canonical `Journey_Kit.md` standard. | The canonical kit standard lives one folder up in `AI Native Agency Deepened`; the repo-local auth doc needed to be reflected there. | Updated: `Journey_Kit.md` now carries the auth contract for future kits. | Script: `pnpm change-control:check`; Compliance Audits copy updated | codex | Active |
| 2026-05-09 | CC-2026-05-09-001 | Operations / Automation | `C:\Users\thebo\MACHINE.md`; `C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\Compliance Audits\n8n-node-lts-repair-2026-05-09.md`; `docs/operations/change-control-register.md`; `docs/operations/scheduled-change-queue.md` | Documented the Node.js LTS change that restored npm-installed n8n. | n8n failed to render because the npm package install was incomplete under Node 25.9.0; moving to Node 24.15.0 LTS unblocked local workflow automation. | Updated: `MACHINE.md` now records Node 24.15.0 LTS as the n8n-safe runtime and warns about Node 25.x. | n8n; npm; manual stack repair | codex + operator | Active |
| 2026-05-09 | CC-2026-05-09-002 | Kit / Testing | `docs/operations/mkt-06-testing-environment-plan.md`; `docs/operations/change-control-register.md`; `docs/operations/scheduled-change-queue.md` | Added MKT-06 testing environment plan and first canary viability checklist. | MKT-06 is the first market-facing workflow candidate and needs a controlled test path before it can be sold as viable. | New: MKT-06 now has a testing-prep control document separate from MKT-01 internal lead-generation work. | Manual canary; evidence log; future service adapters | codex | Active |
| 2026-05-10 | CC-2026-05-10-001 | Operations / Automation | `docs/operations/openclaw-e-drive-ai-storage-setup-2026-05-10.md`; `docs/operations/change-control-register.md`; `docs/operations/scheduled-change-queue.md`; `C:\Users\thebo\.openclaw\openclaw.json`; `E:\AI\Ollama\Models` | Reclaimed E: as healthy AI storage, staged Ollama models there, and reconfigured OpenClaw toward a smaller local Ollama model. | OpenClaw was installed but unusable because its default local model was too large for available memory and C: was carrying the model store. | Updated: E: is now the intended AI model storage location; OpenClaw communication path is identified but agent turns still need runtime/model tuning. | Ollama; OpenClaw gateway; manual storage setup | codex + operator | Active |
| 2026-05-12 | CC-2026-05-12-001 | Kit / Automation | `mkt-06-content-creation-dissemination/n8n/mkt-06-content-creation-dissemination.workflow.json`; `mkt-06-content-creation-dissemination/kit.md`; `mkt-06-content-creation-dissemination/README.md`; `docs/operations/change-control-register.md` | Added an importable n8n v1 workflow template for MKT-06 with manual/form intake, safe canary defaults, and ten placeholder checkpoint handoffs. | MKT-06 needed a concrete n8n artifact before live Notion, Jira, Klaviyo, GitHub, and analytics nodes can be wired and certified. | New: MKT-06 now has a repo-local n8n template artifact tied to the kit manifest. | n8n template import; manual canary | codex | Active |
| 2026-05-13 | CC-2026-05-13-001 | Kit / Automation / CRM | `mkt-06-content-creation-dissemination/n8n/mkt-06-content-creation-dissemination.workflow.json`; `mkt-06-content-creation-dissemination/kit.md`; `mkt-06-content-creation-dissemination/README.md`; `docs/operations/change-control-register.md`; `C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\Compliance Audits\mkt-06-hubspot-n8n-live-node-test-2026-05-13.md` | Wired the first read-only HubSpot attribution check node into the MKT-06 n8n template and validated it against the local self-hosted n8n instance. | MKT-06 live-service certification is moving one node at a time; HubSpot is the first available credentialed service in the local Keys folder. | Updated: the MKT-06 n8n template now carries a real HubSpot service node after Step 7 while write operations remain gated. | n8n activation; HubSpot webhook harness execution `11` success with zero returned contact items | codex | Active |
| 2026-05-15 | CC-2026-05-15-001 | Operations / Packaging / Agent | `docs/operations/github-packaging-triage-2026-05-15.md`; `docs/operations/openclaw-agent-orientation-2026-05-15.md`; `docs/operations/openclaw-e-drive-ai-storage-setup-2026-05-10.md`; `docs/operations/change-control-register.md`; `docs/operations/scheduled-change-queue.md` | Added a GitHub packaging triage plan and a constrained OpenClaw orientation prompt after the power outage exposed the risk of local-only project access. | The active workflow package needs to be available online, but staging must avoid secrets, temporary extraction folders, and misunderstood local-agent instructions. | New: packaging triage and OpenClaw orientation docs become the near-term source of truth for resilience packaging. | GitHub packaging; OpenClaw orientation; manual review | codex | Active |

## Completion Checklist

Before ending a change session:

- [ ] Add or update the relevant changelog entry.
- [ ] If an agent prompt changed, update `assets/agent-versions.md`.
- [ ] If a kit changed, update `changeLog` frontmatter and `## Change Log`.
- [ ] Put compliance/audit/certification logs in the Compliance Audits folder unless they must stay local to the artifact.
- [ ] Move non-urgent work into `docs/operations/scheduled-change-queue.md`.
- [ ] Run `pnpm change-control:check`.
- [ ] Report changed files and any failed checks.
