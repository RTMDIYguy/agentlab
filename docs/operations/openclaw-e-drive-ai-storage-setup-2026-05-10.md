# OpenClaw and E: AI Storage Setup

Date: 2026-05-10
Change ID: CC-2026-05-10-001
Owner: URC / Codex
Status: Active with follow-up needed

## Purpose

Reclaim the recovered E: drive for local AI storage and move OpenClaw/Ollama
toward a usable local assistant setup without consuming the C: drive.

## What Changed

- E: was wiped and reformatted outside Codex in Administrator PowerShell.
- E: is now `NTFS`, labeled `AI_STORAGE`, and reports healthy.
- Created AI storage folders:
  - `E:\AI\Ollama\Models`
  - `E:\AI\OpenClaw`
  - `E:\AI\Downloads`
- Copied the existing Ollama model store from:
  - `C:\Users\thebo\.ollama\models`
  to:
  - `E:\AI\Ollama\Models`
- Set the user environment variable:
  - `OLLAMA_MODELS=E:\AI\Ollama\Models`
- Pulled smaller local models into the E: model store:
  - `llama3.2:3b`
  - `llama3.2:1b`
- Updated OpenClaw default model from the too-large `ollama/qwen3.6` to:
  - `ollama/llama3.2:1b`
- Restarted the stale OpenClaw gateway process.

## Verification

Confirmed:

- E: reports as healthy after format.
- Ollama model storage exists on E:.
- `ollama list` sees models from the E: model store.
- Bare Ollama generation works with `llama3.2:3b`.
- OpenClaw config validates.
- OpenClaw gateway health returns OK on the local gateway.

## Current Limitation

OpenClaw agent turns are not yet completing reliably with the local Ollama
models. The direct Ollama model can respond, but OpenClaw's full agent runtime
loads a heavier prompt/tool bundle and either:

- exceeds practical memory/context limits, or
- runs too slowly to complete within the tested timeouts.

The communications path is identified:

```powershell
openclaw chat
openclaw dashboard
openclaw agent --session-id test --message "Say hello" --local
```

But the assistant response path still needs model/runtime tuning before it is
operational.

## 2026-05-15 Reboot Update

After the outage/reboot, the OpenClaw browser dashboard opened at:

`http://127.0.0.1:18789/overview`

The first orientation attempt using a paragraph that pointed to `MACHINE.md`
was misunderstood. Use the shorter, stricter orientation prompt in:

`docs/operations/openclaw-agent-orientation-2026-05-15.md`

The next OpenClaw test should ask only for an orientation proof or staging
recommendation. Do not ask OpenClaw to edit, stage, commit, push, or delete
files until it has proven it can read the machine and repo context correctly.

## Important Cleanup Note

Do not delete `C:\Users\thebo\.ollama\models` yet.

Keep the C: copy until after a sign-out/reboot confirms Ollama consistently uses
`E:\AI\Ollama\Models`. Once confirmed, the old C: model store can be removed to
reclaim roughly 24 GB.

## Follow-Up Checklist

- [ ] Reboot or sign out/in so user-level `OLLAMA_MODELS` is picked up normally.
- [ ] Confirm `ollama list` still reads from `E:\AI\Ollama\Models`.
- [ ] Confirm OpenClaw gateway health after reboot.
- [ ] Tune OpenClaw for a lightweight local model profile or attach a cloud/API model.
- [ ] Run a successful `openclaw agent` smoke test.
- [ ] Run the 2026-05-15 orientation prompt and confirm it identifies the
      machine context, repo context, staging candidates, and no-stage files.
- [ ] Remove the old C: Ollama model store only after E: usage is verified.
