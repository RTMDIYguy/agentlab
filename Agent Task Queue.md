# Agent Task Queue

## Purpose

This file is the execution companion to `Agent Consolidation Blueprint.md`.

The blueprint explains the operating rules. This file gives the agent the first sequence of work to perform on the system without redesigning the business or creating unnecessary duplication.

## Execution Rules

- Work in order unless blocked.
- Preserve business data.
- Prefer read, assess, sort, and report before making structural changes.
- Do not overwrite active files silently.
- Do not delete recovered files during intake.
- Treat `D:\Recover` as archive source material, not the live working set.

## Task 1: Read Core Strategy Anchors

Review these files first:

- `Agentic Systems Playbook.docx`
- `System Audit and plan suggestions.docx`
- `Where we are.docx`
- `workflows n playbooks for back end.docx`
- `Bootstrapper.docx`

Output:

- a short summary of current business intent
- a list of stated priorities
- any contradictions between documents

## Task 2: Confirm Department Source-of-Truth Files

Validate the active file set for:

- Sales
- Operations
- Marketing
- Finance
- Fulfillment
- AfterCare
- Culture

Output:

- one list of active files
- one list of probable duplicates
- one list of archive/reference files

## Task 3: Build a Consolidation Inventory

Create a simple inventory of the live layer:

- strategy files
- department dashboards
- trackers
- workflow narratives
- book assets

Output:

- a consolidated inventory document or table

## Task 4: Inventory Recovered Business Material

Inspect:

- `D:\Business Docs Recovered`
- `D:\Misc Recovered`
- `D:\Recover`

Priority order:

1. `D:\Business Docs Recovered`
2. `D:\Misc Recovered`
3. `D:\Recover`

Output:

- list of business-relevant recovered files
- list of personal files that should stay out of the business system
- list of uncertain files needing review

## Task 5: Categorize Recovered Files

Sort each business-relevant recovered file into one of these buckets:

- `URC`
- `Tactix`
- `Bootstrapper Capital`
- `Book`
- `Sales`
- `Marketing`
- `Finance`
- `Operations`
- `Fulfillment`
- `AfterCare`
- `Culture`
- `Client Delivery`
- `Archive`
- `Review`

Output:

- categorized intake list

## Task 6: Compare Recovered Files Against Existing Active Files

For each recovered business file:

- check whether a matching or overlapping active file already exists
- identify whether the recovered file is newer, more complete, or redundant

Decision states:

- `keep active`
- `archive`
- `review for merge`

Output:

- conflict and merge candidate list

## Task 7: Propose Active vs Archive Structure

Create a recommended structure that separates:

- active files
- archive files
- review files
- recovered intake files

Do not destroy the current workspace. Propose a rationalized structure first.

Output:

- folder and file organization proposal

## Task 8: Build the Executive Command Layer

Create or update one lightweight command file that surfaces:

- current offers
- pipeline status
- marketing activity
- finance status
- delivery and client health
- Bootstrapper Capital activity
- book-related funnel activity

Preferred output:

- one simple command-center document or workbook

## Task 9: Connect the Book to the Funnel

Map how `Bootstrapper's Guide to the World` should feed:

- content
- events
- founder conversations
- workshops or bootcamps
- continuity offer
- URC consulting

Output:

- one clear book-to-client funnel map

## Task 10: Define Weekly Operating Rhythm

Translate the existing system into a repeatable weekly rhythm:

- Monday: sales and pipeline
- Tuesday: marketing and book promotion
- Wednesday: Bootstrapper Capital and events
- Thursday: fulfillment and aftercare
- Friday: finance and KPI review

Output:

- a weekly operating checklist

## Task 11: Identify Gaps That Actually Matter

Only after reviewing the current system, identify what is still materially missing.

Examples:

- one executive dashboard
- missing book funnel step
- unclear ownership between URC and Tactix
- incomplete tracker fields
- recovered files that supersede current assets

Output:

- short list of real gaps, not hypothetical improvements

## Task 12: Recommend the Next 3 Actions

At the end of the first pass, recommend only three next actions.

These should be:

- high-value
- low-confusion
- implementation-oriented

Output:

- top 3 next actions with rationale

## Expected Deliverables From the Agent

By the end of the first pass, the agent should provide:

- strategy summary
- source-of-truth file list
- duplicate/archive candidate list
- recovered-files intake inventory
- categorized recovered-files list
- conflict and merge list
- executive command layer proposal or draft
- book-to-client funnel map
- weekly operating checklist
- top 3 next actions

## Stop Conditions

The agent should stop and ask for direction if:

- a recovered file appears to conflict with an active source-of-truth file in a way that risks losing data
- the file appears personal or legally sensitive
- there are multiple versions and no basis to choose among them
- moving files would cause destructive overwrite

## Default Outcome

The default outcome of this queue is not a new operating system.

The default outcome is:

- a cleaner live layer
- less duplication
- clearer weekly execution
- a real intake path for recovered files
- better alignment between the book, Bootstrapper Capital, URC, and Tactix
