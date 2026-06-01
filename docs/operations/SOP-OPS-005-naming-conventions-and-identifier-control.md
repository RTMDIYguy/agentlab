# SOP-OPS-005: Naming Conventions And Identifier Control

Owner: Operations
Last updated: 2026-05-30
Version: v0.1
Status: Draft
Scope: Internal

## Purpose

Create one practical naming standard for folders, files, offers, SKUs, invoice
line items, accounting references, API key inventory, and agent-facing paths.

The goal is not to rename everything at once. The goal is to stop future drift,
make legacy locations easier to find, and create names that can connect later
across sales, fulfillment, finance, and audit records.

## Core Rule

Use stable names that answer four questions:

- What business or product area does this belong to?
- What kind of artifact is it?
- What date, version, or sequence makes it unique?
- What system record should it connect to later?

## Protected Legacy Names

Do not rename inherited root folders just because they are awkward.

Instead, document them with a friendly alias:

| Legacy path or name | Standard alias | Rule |
| --- | --- | --- |
| `C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC` | OneDrive account root | Use when referring to the synced account container, not the business workspace. |
| `Robert - Uncle Robert Consulting` | OneDrive account / external display name | Treat as a provider-created display label, not a workspace standard. |
| `C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs` | Working Docs root | Default business-wide workspace root. |
| `Attachments\Licensing\Licensing\Secrets` | Legacy secrets source | Inventory only; do not publish secret values into docs. |
| `AI Native Agency Deepened\Keys` | Legacy keys source | Inventory only; use the API key inventory and Postman vault as the consolidation lane. |

## Folder Names

Use readable folder names for human operating areas and stable slugs for repo
or workflow-package folders.

Preferred patterns:

- Human operating folders: `Title Case With Spaces`
- Repo folders and workflow packages: `lower-kebab-case`
- Date-specific folders: `YYYY-MM-DD Short Description`
- Grouping folders that are not operating anchors: `_Grouping Name`
- Evidence or audit folders: `YYYY-MM-DD evidence-topic`

Avoid:

- duplicate nesting such as `Licensing\Licensing`
- vague containers such as `Stuff`, `New Folder`, `Misc`, or `Final`
- names that expose secrets, passwords, tokens, or customer private data
- tool-specific names when the business function is more stable than the tool

## File Names

Use names that sort and survive search.

Preferred patterns:

- Operating docs: `topic-name.md`
- Date-stamped reports: `YYYY-MM-DD-topic-name.md`
- Upload-ready documents: `URC-Agent-Lab-Document-Title.docx`
- Workbooks: `YYYY-MM-DD-tracker-or-report-name.xlsx`
- Evidence files: `YYYY-MM-DD-system-action-result.ext`

Use status words only when they change behavior:

- `draft`
- `review`
- `approved`
- `published`
- `superseded`
- `archive`

Avoid `final`, `final-final`, or names that require memory to interpret.

## Business Codes

Use short codes when an item must connect across systems.

| Code | Meaning |
| --- | --- |
| `URC` | Uncle Robert Consulting |
| `AGL` | Agent Lab |
| `TAC` | Tactix |
| `BCAP` | Bootstrapper Capital |
| `BGW` | Bootstrapper's Guide to the World |

Department or workflow codes:

| Code | Meaning |
| --- | --- |
| `OPS` | Operations |
| `MKT` | Marketing |
| `SAL` | Sales / CRM-lite |
| `FUL` | Fulfillment / delivery |
| `FIN` | Finance |
| `PKG` | Workflow packaging |
| `CUL` | Culture / governance |
| `SEC` | Security, credentials, and access |

## SKU Standard

SKUs should connect offers, invoices, fulfillment, and accounting.

Pattern:

`BUSINESS-OFFER-TIER-BILLING`

Examples:

| SKU | Meaning |
| --- | --- |
| `AGL-FSS-BETA-MONTHLY` | Agent Lab Founder Signal System beta monthly plan |
| `URC-DIAG-FOUNDER-ONEOFF` | URC founder diagnostic one-time service |
| `BCAP-ROUNDTABLE-SPONSOR-ONEOFF` | Bootstrapper Capital roundtable sponsorship |
| `TAC-IMPL-SPRINT-ONEOFF` | Tactix implementation sprint |

SKU rules:

- One SKU maps to one normal invoice line item.
- Do not encode price in the SKU.
- Do not reuse a SKU for a materially different deliverable.
- If the offer changes materially, create a new SKU and mark the old one
  superseded.

## Invoice Line Item Standard

Every reusable invoice line item should have:

| Field | Rule |
| --- | --- |
| SKU | Use the SKU standard above. |
| Public description | Plain customer-facing description. |
| Internal offer | Link to offer, workflow, or SOP. |
| Revenue category | Consulting, subscription, workshop, sponsorship, setup, fulfillment, or resale. |
| Default price | Optional; price may vary by proposal. |
| Tax treatment | Pending review until finance/tax rules are confirmed. |
| Fulfillment owner | URC, Agent Lab, Tactix, or Bootstrapper Capital. |
| Accounting account | Chart-of-accounts reference when available. |

## Chart Of Accounts Naming

The chart of accounts should stay simple while revenue is small, but names must
be stable enough to connect to SKUs later.

Recommended planning ranges:

| Range | Category |
| --- | --- |
| `4000-4999` | Revenue |
| `5000-5999` | Cost of goods sold / fulfillment costs |
| `6000-6999` | Operating expenses |
| `7000-7999` | Other income and expense |
| `1000-1999` | Assets |
| `2000-2999` | Liabilities |
| `3000-3999` | Equity |

Account names should be business-readable:

- `4000 Consulting Revenue`
- `4010 Subscription Revenue`
- `4020 Workshop Revenue`
- `4030 Sponsorship Revenue`
- `5000 Contractor Fulfillment`
- `6100 Software And Tools`
- `6200 Marketing And Promotion`

Do not treat these as the final accounting system of record until reviewed
inside the active finance tool.

## API Key And Secret Naming

Secrets should be inventoried without exposing values in docs.

Use the API key inventory workbook for consolidation:

`C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\API-Key-Inventory.xlsx`

For Postman variables, use:

`ENV_SERVICE_PURPOSE_TYPE`

Examples:

- `PROD_SUPABASE_SERVICE_ROLE_KEY`
- `DEV_OPENAI_API_KEY`
- `LOCAL_N8N_WEBHOOK_SECRET`
- `PROD_STRIPE_SECRET_KEY`

Rules:

- Never put secret values in Markdown docs, Git commits, screenshots, or chat.
- Record source path, service, environment, owner, status, and rotation need.
- Use `local`, `dev`, `staging`, or `prod` environment labels.
- Mark unknown or stale keys as `review-needed`.
- Prefer Postman vault or environment variables for values, not loose files.

## Procedure

1. Before creating a folder, file, SKU, invoice line item, or account name,
   choose the business code and functional category.
2. Use ISO dates where dates matter: `YYYY-MM-DD`.
3. Use title case for human folder names and kebab case for repo artifacts.
4. If an old location has a confusing name, add it to the legacy alias map
   instead of renaming it immediately.
5. For offers, create the SKU before the invoice line item.
6. For invoice line items, connect the SKU to revenue category and accounting
   account as soon as those fields exist.
7. For secrets, inventory metadata first, then move usable values into Postman
   Desktop or the approved vault surface.
8. Record material naming-standard changes in change control.

## Success Criteria

- Agents can find the active workspace root without confusing it with the
  OneDrive account container.
- Legacy folders can be referenced safely by alias.
- New files and folders sort predictably.
- Offers, SKUs, invoice lines, and accounting categories can be connected later.
- Secret locations are inventoried without exposing secret values.

## Version History

| Date | Version | Change |
| --- | --- | --- |
| 2026-05-30 | v0.1 | Initial SOP created from API key inventory and folder navigation discussion. |
