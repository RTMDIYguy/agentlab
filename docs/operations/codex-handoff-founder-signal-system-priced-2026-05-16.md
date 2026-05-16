# Codex Handoff: Founder Signal System (Priced)

Date: 2026-05-16
From: Claude (Cowork)
To: Codex
Related changes: CC-2026-05-15-003

## What Was Done This Session

1. Built the Founder Signal System starter package per
   `docs/operations/claude-handoff-founder-signal-system-2026-05-15.md`.
2. Logged the build as `CC-2026-05-15-003` Active in both the change-control
   register and the scheduled-change queue.
3. Set the starter price on the sales-facing one-pager to **$1,000 one-time
   setup** (operator decision, mid-session). Swept all `[PRICE_TBD]`
   references in the package and in the change-control register Summary.

## Repo State

### New Files (Untracked)

```
workflows/marketing-founder-signal-system/
  README.md
  kit.md                                       # kit/1.0 draft, version 0.1.0-draft
  source-map.md
  implementation-checklist.md
  offer-one-pager.md                           # $1,000 one-time setup
  assets/
    intake-questions.md
    content-brief-template.md
    follow-up-sequence-template.md
    proof-capture-template.md
```

### Modified Files

```
docs/operations/change-control-register.md     # added CC-2026-05-15-003 Active row
docs/operations/scheduled-change-queue.md      # flipped CC-2026-05-15-003 Proposed -> Active
```

### Not Changed

- `workflows/mkt-01-...` through `workflows/mkt-06-...` source files are
  untouched. The new package only references them via `source-map.md`.
- `mkt-06-content-creation-dissemination/` (the top-level reference kit) is
  untouched.
- No automation, no n8n template, no `src/` directory was added to the new
  package. That is deliberate at draft stage.

## Verification Status

| Check | Result | Notes |
| --- | --- | --- |
| `git diff --check` on touched paths | Clean (exit 0) | |
| `node scripts/verify-change-control.mjs` (Cowork sandbox) | 1 failure | Failure is the canonical `../AI Native Agency Deepened/Journey_Kit.md` not being mounted in the sandbox. All other assertions against touched files passed. |
| Grep `PRICE_TBD` across package + `docs/operations/` | 0 hits | Placeholder fully swept. |
| `pnpm change-control:check` (local) | NOT RUN | Pnpm not on path in sandbox. Please run locally before committing. |

## Open Items For Codex

### Completion Update

- Local `pnpm change-control:check` passed on 2026-05-16.
- The Founder Signal System starter package was committed in
  `1c4309b281e239f38540f677e8c3f09380304006`.
- The `Repo State` section below reflects the state at handoff time, before
  the local Codex completion pass.

### Required

1. Run `pnpm change-control:check` on the URC machine where
   `..\AI Native Agency Deepened\Journey_Kit.md` is accessible. Confirm
   "Change-control verification passed." then commit.
2. Decide commit grouping. Suggested single commit:
   - Subject: `feat(workflows): add Founder Signal System starter package (CC-2026-05-15-003)`
   - Body: references the handoff doc and the change-control entry.

### Optional / Operator's Choice

3. **CC entry for the price decision.** The $1,000 price was set
   mid-session. I treated it as a sub-edit inside CC-2026-05-15-003 because
   the package was already an Active change and the price was always the
   open variable. If you'd prefer an explicit `CC-2026-05-16-001` row for
   "Founder Signal System starter price set to $1,000," add one and
   reference it in `kit.md` change log. Either is defensible; just pick.
4. **Kit promotion path.** The manifest is `0.1.0-draft` with
   `conformance: draft` and `certifiedAt: null`. To promote toward Standard:
   - Run the thin slice with at least one real founder
   - Populate `assets/proof-capture-template.md` with one real cycle's data
     (anonymize if needed) and add it as `examples/proof-log-example.md`
   - Bind a specific tool stack (Notion, Mailchimp, HubSpot, or M365-only)
     and populate `auth.connectors` accordingly under `kit-auth/1.0`
   - Bump version to `0.2.0-draft` and add a Standard-conformance checklist
     mirroring the one in `mkt-06-content-creation-dissemination/README.md`
5. **Adjacent layers (do not bundle).** Once the thin slice produces one
   real cycle of proof, the package can be sold with one adjacent add-on
   priced separately. Most likely first add-ons:
   - MKT-08 social media management calendar
   - MKT-07 paid acquisition
   - Full MKT-02 nurture sequence library (graduating beyond 3-touch)
   - MKT-09 events / webinar marketing
6. **Client-facing import lane.** The handoff at
   `docs/operations/claude-handoff-workflow-import-gaps-2026-05-15.md`
   still calls out the `/Workflows` folders that need a dedicated import
   pass. The Founder Signal System is the URC-driven client-facing build;
   the older `/Workflows` template imports are a separate lane.

## Items Worth Flagging To The Operator

1. **Edit hook noise.** Throughout this session, every `Write` and `Edit`
   triggered a Python hook that errors out because of a malformed path:
   `C:\\c\\Users\\thebo\\...check-sql-files.py` (note the double
   `C:\\c\\Users\\` prefix). The CockroachDB plugin's hook configuration
   appears to have a literal-prefix bug. The errors are non-blocking for
   the file writes themselves, but they spam the tool log. Probably worth
   either fixing the path or disabling that plugin's PostToolUse hook for
   non-SQL sessions.
2. **Sandbox limitation.** `node scripts/verify-change-control.mjs` cannot
   succeed inside a Cowork session that only mounts `agent-lab-site`
   because it expects `Journey_Kit.md` one directory up. Two paths:
   - Leave as-is and rely on the operator running it locally before commit
   - Patch the script to make the canonical-kit check optional via env
     var or skip if the file is missing in a non-CI context

## Files Of Interest For Codex

- Build prompt: `docs/operations/claude-handoff-founder-signal-system-2026-05-15.md`
- Reference kit pattern: `mkt-06-content-creation-dissemination/kit.md` and
  `mkt-06-content-creation-dissemination/README.md`
- Kit auth standard: `docs/operations/kit-auth-standard.md`
- Canonical kit standard: `..\AI Native Agency Deepened\Journey_Kit.md`
- Source workflows: `workflows/mkt-{01,02,03,04,05,06}/source/*.md`
- Verification script: `scripts/verify-change-control.mjs`

## Stop Conditions Honored

- Did not redesign the business.
- Did not implement all 9 Marketing workflows.
- Did not import credentials, Keys folders, archive dumps, or temp
  folders.
- Did not claim Active or Certified status on the new kit.
- Did not touch the URC source `.md` files under `workflows/mkt-XX/source/`.
- Kept Microsoft 365 as the default operating backbone in the package.
- Kept the package low-cost and tool-light. No paid tool is required to
  run the thin slice.

## One-Line Summary For The Register

> CC-2026-05-15-003 Active — Founder Signal System starter package
> built and priced at $1,000 one-time setup. Draft kit manifest;
> requires local `pnpm change-control:check` before commit.
