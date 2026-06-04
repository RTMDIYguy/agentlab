# SOP-OPS-006: Google Drive Sync on Repo Update

Version: 1.0
Status: Active
Created: 2026-06-04
Owner: Robert + Agent
Change Control: CC-2026-06-04-001

---

## Purpose

Google Drive is the public-facing product and operations surface.
Customers, collaborators, and reviewers access live products from Google Drive.

Any document that is two or more updates behind in Google Drive is a product
defect. A customer or partner pointed to a stale file gets a worse version of
the product than exists. That is not acceptable.

This SOP locks in the rule: when a tracked document changes in the repo,
it must be updated in Google Drive in the same session or before the next
session ends.

---

## Trigger

This SOP fires when ANY of the following happen:

- A tracked document is updated in the repo with a change-control entry
- A new tracked document is created and added to the GDrive sync table below
- A product, SOP, workflow slice, or operating doc is substantially revised
- Robert points a customer, partner, or reviewer to a Google Drive file

Do not wait for a scheduled Friday sync if a customer-facing file changed today.

---

## GDrive-Tracked Documents

These files must stay current in Google Drive at all times.
The Google Drive target folder for each is listed alongside it.

| Repo File | GDrive Folder | Format | Priority |
| --- | --- | --- | --- |
| `docs/operations/agency-operating-manual.md` | Operations / Agency Manual | Google Doc | High |
| `docs/operations/agency-command-center.md` | Operations / Command Center | Google Doc | High |
| `docs/operations/workflow-registry.md` | Operations / Workflow Registry | Google Doc | High |
| `docs/operations/mkt-09-roundtable-operating-slice.md` | Operations / Workflow Slices | Google Doc | High |
| `docs/operations/sop-manual-index.md` | Operations / SOPs | Google Doc | High |
| `docs/operations/SOP-CUL-001-servant-leadership-and-agency-values.md` | Operations / SOPs | Google Doc | High |
| `docs/operations/SOP-OPS-005-naming-conventions-and-identifier-control.md` | Operations / SOPs | Google Doc | High |
| `docs/operations/SOP-OPS-006-gdrive-sync-on-update.md` | Operations / SOPs | Google Doc | High |
| `docs/operations/urc-v1-operating-architecture.md` | Operations / Architecture | Google Doc | High |
| `docs/operations/workflow-relationship-map.md` | Operations / Workflow Registry | Google Doc | Medium |
| `docs/operations/weekly-workflow-audit-bank.md` | Operations / Audit | Google Doc | Medium |
| `docs/operations/startup-operational-excellence-book-control.md` | Book / Control | Google Doc | Medium |
| `workflows/marketing-founder-signal-system/offer-one-pager.md` | Products / Founder Signal System | PDF + Google Doc | High |
| `workflows/marketing-founder-signal-system/README.md` | Products / Founder Signal System | Google Doc | High |
| `workflows/marketing-founder-signal-system/implementation-checklist.md` | Products / Founder Signal System | Google Doc + PDF | High |

Add new rows to this table any time a new customer-facing or operation-critical
document is created in the repo.

---

## Procedure

### Step 1 — Identify what changed

After any repo update with a change-control entry, check this SOP's
GDrive-tracked document table.

Ask: does this change touch any tracked file?

- Yes → proceed to Step 2
- No → no GDrive action required this session

### Step 2 — Stage the export

Create or confirm the local staging folder exists:

```
C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\agent-lab-site\gdrive-staging\
```

For each changed tracked file:

1. Copy the current Markdown content into a clean staging copy in that folder.
2. Name the staging file to match the target document title, not the repo filename.
   - Example: `agency-operating-manual.md` → `URC Agency Operating Manual.md`
3. If the output format is PDF, note it in the handoff log (Step 4).
   Robert converts to PDF manually using Google Docs → File → Download → PDF.

### Step 3 — Upload to Google Drive

Robert opens [drive.google.com](https://drive.google.com) and:

1. Navigates to the correct target folder (see GDrive-Tracked Documents table).
2. Uploads the staged file OR pastes the content into an existing Google Doc.
3. If the file already exists as a Google Doc, replaces or pastes updated content.
4. If the file is new, creates it and notes the shareable link.

Agent cannot upload directly. This step requires Robert.

**Time budget:** 5–10 minutes per session for tracked files that changed.

### Step 4 — Log the sync

Add a row to the GDrive Sync Log at the bottom of this SOP after each sync:

| Date | Repo File | GDrive Folder | Synced By | Notes |
| --- | --- | --- | --- | --- |
| 2026-06-04 | (initial promotion batch — see staging folder) | Multiple | Robert | First sync. All high-priority tracked files staged for upload. |

Record meaningful syncs in `docs/operations/change-control-register.md` using
area: `Operations / GDrive Sync`.

---

## Agent Rule

Any agent that updates a GDrive-tracked document in the repo must:

1. Note the update in the change-control register as usual.
2. Add a line to the session handoff or daily brief: `GDrive sync required for [filename]`.
3. Stage the export file in `gdrive-staging/` if the session allows.
4. If staging is not possible, flag it explicitly so Robert or the next agent does not miss it.

Do not mark a tracked document change as complete until the GDrive sync is
either done or explicitly queued in the handoff.

---

## Stop Condition

This SOP is complete for a given session when:

- All tracked files changed in this session have been staged, AND
- Robert has been given a clear list of what to upload

---

## Failure Path

If a GDrive sync falls behind:

1. Check the GDrive Sync Log below for the last sync date.
2. Check `change-control-register.md` for all entries since that date.
3. Cross-reference against the GDrive-Tracked Documents table.
4. Stage all out-of-date files in one batch.
5. Robert uploads the batch in one Google Drive session.

---

## GDrive Sync Log

| Date | Repo File | GDrive Folder | Synced By | Notes |
| --- | --- | --- | --- | --- |
| 2026-06-04 | Initial promotion batch | Multiple — see staging folder | Robert (pending) | First sync. Staging folder created with high-priority files. Awaiting Robert upload. |
