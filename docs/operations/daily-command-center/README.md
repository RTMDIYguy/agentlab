# Daily Command Center

Status: v0 local pilot

## Purpose

The Daily Command Center produces one daily operating brief for Robert from
the approved agency operating docs.

It exists to surface what should be done today: money, client trust, sales
follow-up, marketing actions, workflow audit prompts, and source-of-truth
maintenance.

## Run

```bash
pnpm daily-command:center
```

The script writes a dated brief:

```text
docs/operations/daily-command-center/YYYY-MM-DD-command-brief.md
```

## Sources

- `docs/operations/agency-operating-manual.md`
- `docs/operations/urc-agent-execution-checklist.md`
- `docs/operations/weekly-workflow-audit-bank.md`
- `docs/operations/workflow-relationship-map.md`
- `docs/operations/change-control-register.md`
- `docs/operations/agency-owners-manual-blueprint.md`

## Security Boundary

Do not add secret values, backup codes, OAuth secrets, service-account private
keys, or raw client-sensitive data to generated briefs.

ClickUp remains a retool candidate until its current state is exported,
inspected, and reconciled against the repo and `AI Native Agency Deepened`.
