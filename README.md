# Agent Lab Site

Agent Lab is the working web and operations repository for Uncle Robert
Consulting's AI-native agency system.

The repo started as a site build, but it now serves two jobs:

- the public-facing Agent Lab / URC web application
- the repo-native home for workflow packages, operating docs, and agent handoff
  materials used to move the business from planning into execution

## What This Project Supports

This repository supports the operating architecture for:

- Uncle Robert Consulting (`URC`) as the main business and owner of client
  relationships, delivery standards, IP, and invoicing
- `Tactix` as the fulfillment and Upwork-facing execution arm
- `Bootstrapper Capital` as the founder audience, event, and funnel layer
- `Bootstrapper's Guide to the World` as an authority asset that feeds the
  founder funnel

The current execution focus is practical: clarify the offer ladder, package
sellable starter workflows, support book-to-client CTAs, build lightweight
CRM/follow-up rhythms, and turn the 90-day plan into weekly actions.

## Repository Map

| Path | Purpose |
| --- | --- |
| `src/` | React client application. |
| `server/` | Express/tRPC server and backend modules. |
| `docs/operations/` | Operating architecture, execution plans, change control, workflow registry, and handoff docs. |
| `workflows/` | Imported workflow sources and client-facing workflow packages. |
| `scripts/` | Repo utilities, including change-control verification. |
| `content/` | CMS-managed site content. |

## Current Workflow Direction

The workflow library is being moved into GitHub-readable Markdown without
dumping raw archives, credentials, or temporary files into the repo.

Key operating docs:

- `docs/operations/urc-agent-execution-checklist.md`
- `docs/operations/urc-v1-operating-architecture.md`
- `docs/operations/urc-90-day-implementation-plan.md`
- `docs/operations/workflow-registry.md`
- `docs/operations/change-control-register.md`

The current client-facing starter package is:

- `workflows/marketing-founder-signal-system/`

That package is a thin, sellable vertical slice across founder intake, signal
capture, content brief creation, outreach, follow-up, and proof capture. It is
priced as a starter setup and remains draft until tested with real founder
cycles.

## Development

This project uses `pnpm`.

```bash
pnpm install
pnpm dev
```

Useful commands:

```bash
pnpm check
pnpm test
pnpm build
pnpm change-control:check
```

## Change Control

Meaningful changes to workflow packages, operating docs, agent prompts,
tracker schemas, funnel control files, or kit manifests should be recorded in:

- `docs/operations/change-control-register.md`
- `docs/operations/scheduled-change-queue.md` when the change should be held
  for later

Before calling workflow-package changes complete, run:

```bash
pnpm change-control:check
```

## Agent Guidance

Agents should read `AGENTS.md` before changing business architecture,
workflow packages, or funnel materials.

Default posture:

- implement the existing operating plan instead of redesigning the business
- preserve current business data and source files
- keep Microsoft 365 as the default operating backbone
- use Notion only as a lightweight dashboard layer
- keep URC as the main brand, Bootstrapper Capital as the audience/funnel
  layer, and Tactix as the fulfillment arm
- prefer low-cost, testable, practical execution over tool sprawl

## What Success Looks Like

This repo is working when it helps the business ship:

- a clear offer ladder
- a defined book CTA and founder funnel
- practical CRM-lite tracking and follow-up
- Bootstrapper Capital roundtables or founder events
- client-facing workflow packages that can be tested, certified, sold, and
  improved without losing the audit trail
