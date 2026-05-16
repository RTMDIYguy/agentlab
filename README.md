# Agent Lab

This repo is the operating workspace for URC workflow packaging and execution.
It now includes a repo-native workflow registry, imported source artifacts, and
the active MKT-06 package.

## Start here

1. `docs/operations/urc-agent-execution-checklist.md`
2. `docs/operations/urc-v1-operating-architecture.md`
3. `docs/operations/urc-90-day-implementation-plan.md`

## Workflow documentation map

- `docs/operations/workflow-registry.md`  
  45-workflow registry with packaging status by workflow.
- `docs/operations/workflow-source-inventory-2026-05-15.md`  
  Import inventory and source-track notes (`urc_internal`, `client_facing`,
  `automation_scaffold`).
- `workflows/`  
  Per-workflow import folders used as source staging for package conversion.
- `mkt-06-content-creation-dissemination/`  
  Current active package (kit/1.0 pattern and n8n template).

## Packaging status model

- Registry only
- Imported source
- Kit draft
- Active package

Use `workflows/_template/README.md` as the default packaging shape when
promoting imported workflow source into a `kit.md` package.
