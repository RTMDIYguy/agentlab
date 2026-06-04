# Agency Command Center

Status: V1 human navigation layer
Last updated: 2026-06-04

## Purpose

This is the front door for deciding what to work on next.

Use this page when Robert or an agent needs to:

- get oriented without hunting through folders
- check today's operating priorities
- see the active workflow queue
- find the current canary workflow
- protect money and client-trust work before tool experiments
- route new questions into the right source document

This page does not replace the agency operating manual, workflow registry,
Daily Command Center briefs, SOPs, or change-control register. It points to the
right place fast.

## Start Here Today

| Question | Go Here | What To Do |
| --- | --- | --- |
| What matters today? | Latest dated file in `docs/operations/daily-command-center/` | Read the top actions, handoffs, money checks, and parking lot. |
| What did the first running test prove? | `docs/operations/daily-command-center/2026-06-04-running-test.md` | Use the test verdict and MKT-09 audit snapshot to decide next artifact work. |
| What workflow is the current canary? | `docs/operations/mkt-09-roundtable-operating-slice.md` | Confirm the next RoundTable, Google response path, tracker location, and follow-up messages. |
| What is the whole operating spine? | `docs/operations/agency-operating-manual.md` | Use this when the business lanes, source map, or automation rules are unclear. |
| What changed recently? | `docs/operations/change-control-register.md` | Read the newest entries before changing source-of-truth docs. |

## Today's Top Actions

Source: latest dated command brief in `docs/operations/daily-command-center/`

1. Morning restart: money and client-trust check before optional tool experiments.
2. Morning restart: refill the Agent Lab LinkedIn content queue.
3. Morning restart: advance the `MKT-09` RoundTable response tracker and follow-up copy.

Resume `MKT-05 Outreach & Engagement` and `MKT-02 Email/SMS Nurture` after the
morning restart block is handled or deliberately deferred.

## Today's Human Judgment Block

Recommended first decision block:

`MKT-09 Event & Webinar Marketing`

Current next decisions:

- confirm the next RoundTable Chapter meeting in Ownable OS
- confirm where the Google assessment responses land
- decide whether the first tracker is the existing CRM-lite bridge, a Google
  Sheet, or a repo-tracked CSV until the registry app exists
- define follow-up messages for attended, no-show, registered-but-canceled, and
  assessment-only contacts

## Money And Client-Trust Checks

Before optional platform experiments, check:

| Area | Check |
| --- | --- |
| Proposals | Is any proposal waiting for review, send, revision, or follow-up? |
| Onboarding | Did any signed work create a folder, packet, access, or kickoff need? |
| Receivables | Is any invoice, payment status, or unpaid amount unclear? |
| Client issues | Is any client, beta user, or respondent waiting on a promised next step? |
| Paid tools | Does any paid-tool, cloud, VPS, KNIME, or Stripe Connect work have a current revenue, client-trust, or learning reason? |

If the answer is yes, handle that before sandbox work.

## Active Workflow Queue

Source: `docs/operations/agency-operating-manual.md`

| Priority | Workflow | Mode | Next Target |
| --- | --- | --- | --- |
| 1 | `MKT-05 Outreach & Engagement` | Manual / Reach-assisted | Outreach batch setup, tracking, reply handling |
| 2 | `MKT-02 Email/SMS Nurture` | Manual / scheduled campaigns | Nurture rules, stop conditions, handoff rules |
| 3 | `MKT-01 Lead Generation & Conversion` | Manual CSV review | Qualification, dedupe, bridge-tracker import |
| 4 | `SAL-02 OnBoarding` | Zapier + manual gap | Google Drive packet copy, folder population, sharing |
| 5 | `SAL-01 Proposals & Contracts` | Manual / template-driven | Proposal prep, review, send, status tracking |
| 6 | `FUL-02 Client Success` | Manual | Client success tracker and check-in cadence |
| 7 | `FUL-03 Customer Service` | Manual | Issue intake, tiering, escalation |
| 8 | `FIN-03 Accounts Receivable & Payable` | Manual / owned finance tracker | Invoice, receivables, payment status, SKU/account mapping |
| 9 | `MKT-04 Reviews & Referrals` | Manual | Testimonial request, referral ask, proof capture |
| 10 | `MKT-09 Event & Webinar Marketing` | v0 runnable slice | RoundTable invite, RSVP/assessment response tracking, event follow-up |

## Current Canary: MKT-09

`MKT-09` is no longer a pure folder shell, but it is not certified yet.

Current source:

- `docs/operations/mkt-09-roundtable-operating-slice.md`

Known decisions:

- event format: RoundTable Chapter meeting
- schedule source: Ownable OS
- attendance price: free
- downstream paid path: membership, diagnostic, workshop, consulting, or other
  fit-based offer later
- current response assumption: existing Google assessment / response path
- Apollo status: source path only; current credit limits do not block events
- Affiliate CMO status: ad-copy drafting/reference source only; not system of
  record

Open checks:

- live Google assessment response sheet
- tracker location
- Apollo link/download signal availability
- post-event follow-up copy

## Parking Lot

These are active, but not all are today's first work:

| Item | Owner | Status |
| --- | --- | --- |
| Draft SOP for Reach outreach batch setup and monitoring | Agent | Needed |
| Refill Agent Lab LinkedIn content queue | Agent | Needed |
| Build MKT-09 RoundTable response tracker and first follow-up copy | Robert + agent | Needed |
| Draft SOP for Google Drive client-folder packet population | Agent | Needed |
| Decide Independence Chapter CRM-lite bridge location and required CRM-compatible columns | Robert + agent | Needed |
| Reconcile Independence Chapter messaging against MVP beta messaging | Robert + agent | Needed |
| Build first repo-native Owner's Manual from the blueprint | Robert + agent | Needed |
| Run weekly workflow audit bank across the active queue | Robert + agent | Needed |
| Promote the operating manual into the agency Operations folder / Google Drive source | Robert + agent | Pending |

## Navigation Map

| Need | Source |
| --- | --- |
| Whole-agency orientation | `docs/operations/agency-operating-manual.md` |
| Daily generated brief | `docs/operations/daily-command-center/` |
| Workflow list | `docs/operations/workflow-registry.md` |
| Workflow relationships | `docs/operations/workflow-relationship-map.md` |
| Weekly workflow audit | `docs/operations/weekly-workflow-audit-bank.md` |
| SOP list | `docs/operations/sop-manual-index.md` |
| Owner's Manual plan | `docs/operations/agency-owners-manual-blueprint.md` |
| Security and secrets | `docs/operations/secret-handling-standard.md` |
| Naming, SKUs, identifiers | `docs/operations/SOP-OPS-005-naming-conventions-and-identifier-control.md` |
| Change history | `docs/operations/change-control-register.md` |

## Update Rule

Update this page when:

- the Daily Command Center format changes
- the active workflow queue changes
- a canary workflow moves from review-needed to runnable or certified
- a new source-of-truth document becomes the better starting point
- Robert says he cannot find where to go next

Record meaningful updates in `docs/operations/change-control-register.md`.
