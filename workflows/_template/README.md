# Workflow Package Template

Use this folder shape when importing a workflow into the repo.

## Contents

- `README.md` - workflow summary and packaging status
- `kit.md` - kit/1.0 manifest when the workflow is promoted beyond source import
- `source/` - extracted Markdown from original docs
- `assets/` - source assets and checklists
- `automation/` - n8n/Make/Zapier/blueprint JSON templates
- `trackers/` - clean tracker templates when safe to version

## Packaging Status

- Registry only: workflow is listed but no source imported yet
- Imported source: readable source artifacts are in the repo
- Kit draft: `kit.md` exists but is not certified
- Active package: workflow has validation evidence and change-control coverage

## Two Package Variants

Each workflow may eventually have two package variants:

- URC/internal package: runs the URC operating system and may preserve internal roles, tools, and targets.
- Client-facing package: reusable template version sourced from department `/Workflows` and `/Automations` folders, scrubbed of URC-specific details.

Keep these variants explicit during conversion so internal operating docs do not accidentally become client deliverables.
