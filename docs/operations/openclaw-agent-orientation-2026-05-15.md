# OpenClaw Agent Orientation

Date: 2026-05-15
Change ID: CC-2026-05-15-001
Owner: URC / Codex
Status: Ready to paste into OpenClaw

## Purpose

OpenClaw opened in the browser after the reboot at
`http://127.0.0.1:18789/overview`, but a freeform paragraph pointing to
`MACHINE.md` was misunderstood. This file provides a smaller, stricter
orientation prompt that tells OpenClaw exactly what to read, what not to touch,
and what kind of response proves it understood the assignment.

## Paste This Into OpenClaw

```text
You are helping Uncle Robert continue the Agent Lab / URC workflow packaging project on this Windows machine.

Workspace rule:
- Your local AI/storage lane is E:\AI\OpenClaw, but the business workspace is not on E:.
- The business-wide workspace root is C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs.
- Look in Working Docs first for business context, project folders, certifications, Bootstrapper Capital, Tactix, Agent Lab, and workflow package materials.
- Do not assume C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\agent-lab-site or AI Native Agency Deepened is the whole business.

First, read these local files in this order:
1. C:\Users\thebo\MACHINE.md
2. C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\WORKSPACE-STANDARD.md
3. C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\agent-lab-site\AGENTS.md
4. C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\agent-lab-site\docs\operations\urc-agent-execution-checklist.md
5. C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\agent-lab-site\docs\operations\urc-v1-operating-architecture.md
6. C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\agent-lab-site\docs\operations\github-packaging-triage-2026-05-15.md

Do not redesign the business. Do not delete files. Do not touch secrets, .env files, node_modules, or temporary extraction folders. Use Microsoft 365 as the default operating backbone and GitHub as the online resilience layer.

Your first task is only to prove orientation. Reply with:
- the machine context path you found
- the business-wide workspace root you found
- the repo path you found
- the top three packaging priorities
- the files you would stage first
- the files you would not stage

If you cannot read a file, say exactly which file failed and stop.
```

## If OpenClaw Summarizes Tools Instead

If OpenClaw replies by describing functions such as `update_plan`,
`subagents`, `video_generate`, or `openclaw-control-ui`, it is probably reading
the control UI/tool wrapper instead of the requested local files. In that case,
stop the project-orientation attempt and run this smaller file-access test:

```text
Do not analyze the UI, tools, functions, classes, or code around this chat.

This is a local file access test.

Read exactly this file:
C:\Users\thebo\MACHINE.md

Reply only with:
1. The exact title line at the top of the file.
2. The value shown for "Permanent home".
3. The first bullet under "Current direction".

If you cannot read that file, reply only:
I cannot read C:\Users\thebo\MACHINE.md from this OpenClaw session.
```

## Good First OpenClaw Task After Orientation

```text
Using the orientation files, inspect the Agent Lab repo status and produce a staging recommendation only. Do not stage, commit, push, delete, or edit files. Separate the recommendation into: safe to stage, review first, and do not stage.
```

## Notes

- Keep prompts short and file-specific.
- Ask OpenClaw for an inventory or recommendation before asking it to act.
- For local model runs, prefer bounded tasks that do not require long context
  synthesis.
- Treat `C:\Users\thebo\MACHINE.md` as machine context and `AGENTS.md` as repo
  context.
- Treat `C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs`
  as the business-wide workspace root.
