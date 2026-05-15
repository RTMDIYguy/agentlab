# Claude Handoff: Workflow Import Gaps

Date: 2026-05-15
Owner: URC / Codex
Related change: CC-2026-05-15-002

## Context

Codex imported the available URC/internal workflow source set plus department
automation JSON scaffolds into `workflows/` for GitHub-accessible continuity.
The import intentionally did not collapse URC/internal workflows and
client-facing templates into one source.

## What Is Already Staged

- `docs/operations/workflow-registry.md`
- `docs/operations/workflow-source-inventory-2026-05-15.md`
- `workflows/_template/`
- workflow folders for OPS, CUL, FIN, SAL, MKT, FUL, and AFC
- 30 department `/Automations/*.json` blueprint files
- available asset Markdown, CSV exports, tracker `.xlsx` files, and docx text
  extractions

## Missing Or Incomplete

- MKT-08 Social Media Management: folder shell only; no clean matching source
  artifact found in first archive pass.
- MKT-09 Event & Webinar Marketing: folder shell only; no clean matching source
  artifact found in first archive pass.
- Finance Department: no `/Automations/*.json` files found in the scan.
- Fulfillment Department: no `/Automations/*.json` files found in the scan.
- Client-facing `/Workflows` folders still need a dedicated import pass.
- Some departments only had department-level source docs, so source text is
  repeated in multiple workflow folders until per-workflow kit conversion.

## Source Folders To Inspect Next

- `C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\AfterCare Department\Workflows`
- `C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\Culture\Workflows`
- `C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\Finance Department\Workflows`
- `C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\Fulfillment Department\Workflows`
- `C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\Marketing Department\Workflows`
- `C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\operations Department\Workflows`
- `C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\Sales Department\Workflows`

## Recommended Claude Task

1. Read `AGENTS.md`, `docs/operations/workflow-registry.md`, and
   `docs/operations/workflow-source-inventory-2026-05-15.md`.
2. Inspect the department `/Workflows` folders listed above.
3. Import client-facing sources into a separate variant path or clearly marked
   client-template files.
4. Do not import `Keys`, raw credential files, archive dumps, or temp extraction
   folders.
5. Preserve the two package variants:
   - URC/internal package
   - client-facing template package

## Verification Gate

Run:

```powershell
pnpm change-control:check
git diff --check
```
