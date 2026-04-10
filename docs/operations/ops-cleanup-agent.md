# Ops Cleanup Agent

## Purpose

The Ops Cleanup Agent is the internal agent for cleaning up and consolidating the business system.

It is not the public site chat.

Its job is to:

- read the operating architecture and cleanup docs
- sample the current business workspace
- sample the recovered folders
- recommend keep/archive/review actions
- identify likely source-of-truth files
- turn cleanup into concrete next actions

## Route

The internal page lives at:

- `/ops-agent`

It is intended for authenticated internal use.

## Backend

The backend router lives at:

- `server/ops-cleanup/router.ts`

It is registered as:

- `opsCleanup.analyze`

## Context It Uses

The agent loads:

- `AGENTS.md`
- `docs/operations/urc-agent-execution-checklist.md`
- `docs/operations/urc-v1-operating-architecture.md`
- `docs/operations/urc-90-day-implementation-plan.md`
- `Working Docs\\AI Native Agency Deepened\\Agent Handoff Prompt.md`
- `Working Docs\\AI Native Agency Deepened\\Agent Consolidation Blueprint.md`
- `Working Docs\\AI Native Agency Deepened\\Agent Task Queue.md`

It also samples:

- `D:\Business Docs Recovered`
- `D:\Misc Recovered`
- `D:\Recover`

## Environment Variables

Optional:

- `OPENAI_API_KEY`
- `OPENAI_OPS_AGENT_MODEL`
- `OPS_AGENT_BUSINESS_ROOT`
- `OPS_AGENT_RECOVERY_ROOTS`

If `OPENAI_API_KEY` is not set, the agent still works in fallback mode.

## Recommended Use

Good prompts:

- Review the current business system and give me the top 3 cleanup actions this week.
- Help me triage recovered files into keep, archive, and review.
- Identify the likely source-of-truth docs for URC, Bootstrapper Capital, and Tactix.
- Help me turn the cleanup work into a weekly operating rhythm.

## Safety

This v1 agent is recommendation-only.

It does not move, delete, or overwrite files automatically.
