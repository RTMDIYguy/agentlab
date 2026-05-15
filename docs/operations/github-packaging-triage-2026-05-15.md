# GitHub Packaging Triage

Date: 2026-05-15
Change ID: CC-2026-05-15-001
Owner: URC / Codex
Status: Active triage

## Purpose

The May 2026 power outage made local-only access too fragile. This triage plan
defines the next packaging pass so project workflows, operating docs, and
recovery notes can be made available through GitHub without accidentally
publishing secrets, temporary extraction folders, or stale working files.

## Packaging Goal

Get the active workflow package and its operating context into GitHub in a
state that another agent can read online and continue work from, even if this
machine is unavailable.

## Stage First

These files are already part of the active packaging lane and should be reviewed
for staging after a final diff check:

- `docs/operations/change-control-register.md`
- `docs/operations/openclaw-e-drive-ai-storage-setup-2026-05-10.md`
- `docs/operations/github-packaging-triage-2026-05-15.md`
- `docs/operations/openclaw-agent-orientation-2026-05-15.md`
- `mkt-06-content-creation-dissemination/README.md`
- `mkt-06-content-creation-dissemination/kit.md`
- `mkt-06-content-creation-dissemination/n8n/mkt-06-content-creation-dissemination.workflow.json`
- `MKT-06-Canary-Evidence-Log-2026-05-12.csv`

## Review Before Staging

These files may contain useful source material, but they should be opened and
checked before staging because they may include internal business context,
duplicated versions, or extracted working content:

- `Master Workflow Index.updated.docx`
- `Master Workflow Index.updated-2.docx`
- `Master Workflow Index.updated-3.docx`
- `Master Workflow Index.updated-4.docx`
- `Startup Operational Excellence-merged.docx`
- `tmp_action_extract.txt`
- `tmp_crm_lite_extracted.txt`
- `tmp_workflows_backend_extracted.txt`

## Do Not Stage

These should stay local unless deliberately transformed into clean source
documents:

- `.env.local`
- `node_modules/`
- `tmp-master-index-edit/`
- `tmp-master-index-edit-2/`
- `tmp-master-index-edit-3/`
- `tmp-master-index-edit-4/`
- any raw credential export or service key file
- any personal recovery folder outside this repo

## Online Access Rules

- Keep the GitHub repository private unless a separate public-safe package is
  prepared.
- Commit workflow packages, runbooks, and clean evidence logs.
- Keep secrets in local vaults or platform credential stores, not Git.
- Prefer Markdown source for agent-readable docs; keep `.docx` files only when
  they are the current source of truth or need to preserve formatting.
- Use GitHub as the resilience layer, not as the finance or CRM source of truth.

## Immediate Sequence

1. Run `git status --short` and inspect all untracked files.
2. Confirm `.env.local` remains ignored.
3. Review the n8n workflow JSON for embedded credentials before staging.
4. Stage only the active package/docs/evidence files.
5. Run `pnpm change-control:check`.
6. Commit with a message such as `Package MKT-06 workflow resilience docs`.
7. Push to `origin/main` or a short-lived `codex/workflow-packaging` branch.

## Open Decisions

- Whether the updated Master Workflow Index `.docx` belongs in this repo or
  should be converted to Markdown first.
- Whether the repo should remain a single combined Agent Lab site and workflow
  package, or whether workflow kits should later split into their own private
  repos.
- Which workflow follows MKT-06: current README suggests MKT-01, MKT-02,
  MKT-05, then SAL-05/06.
