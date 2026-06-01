# URC Agency Operating Manual

Date created: 2026-05-31
Status: v0 operating spine

## Purpose

This manual is the front door for running Uncle Robert Consulting, Tactix,
Bootstrapper Capital, Agent Lab, and the related book and workflow-package
funnels as one operating system.

It is not meant to replace SOPs. It tells a new human or agent where the
controls are, which tracks are live, what should be automated next, and which
manual steps still need founder judgment.

Use this manual when:

- a new agent needs to understand the agency before acting
- outreach, onboarding, fulfillment, finance, or workflow packaging starts to
  drift
- a lesson from live implementation needs to become an SOP
- a manual process is ready to become semi-automated or automated

## Operating Principle

The agency should be built so a capable operator can get in and drive it.

That means the system needs:

- one obvious starting point
- named business lanes
- visible source-of-truth locations
- clear workflow ownership
- a small number of live offers
- documented manual fallbacks
- SOPs written from real work, not theory
- automation that removes routine work while preserving review where judgment
  matters

The current rule is:

Manual work teaches the procedure. SOPs stabilize the procedure. Automation
removes the repeatable human burden. Exceptions stay visible for human review.

## Read First

Business-wide workspace root:

`C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs`

Primary repo:

`C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\agent-lab-site`

Start in this order:

1. `C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\WORKSPACE-STANDARD.md`
2. `docs/operations/agency-operating-manual.md`
3. `docs/operations/urc-agent-execution-checklist.md`
4. `docs/operations/urc-v1-operating-architecture.md`
5. `docs/operations/workflow-registry.md`
6. `docs/operations/sop-manual-index.md`
7. `docs/operations/change-control-register.md`

## Business Map

| Lane | Role | Current Use |
| --- | --- | --- |
| Uncle Robert Consulting | Main business brand | Client relationships, diagnostics, consulting, operating backbone |
| Agent Lab | Public proof and workflow-product brand | Tested-in-public workflow packages, site, LinkedIn, beta framing |
| Bootstrapper Capital | Audience and event funnel | Independence Chapter, founder roundtables, bootstrapper community |
| Tactix | Fulfillment and execution arm | Delivery, Upwork-style fulfillment, implementation support |
| Book / Authority Assets | Trust and funnel asset | Thought leadership, CTA source, founder education |

Do not collapse these lanes without explicit founder approval. They are related,
but each has a different job in the system.

## Current Live Tracks

### 1. Independence Chapter

Audience:

- bootstrapped founders and owner-operators
- local or regional businesses with practical operating pain
- founders who can benefit from a community, diagnostic, or roundtable before
  buying a larger system

Primary promise:

- simplify the tools and workflows the founder already has
- surface the bottleneck that is costing time, trust, or money
- connect the founder to a practical next step without forcing a full rebuild

Primary next steps:

- Bootstrapper Capital chapter invite
- founder roundtable
- diagnostic conversation
- workflow audit or starter implementation

### 2. MVP Beta

Audience:

- anyone in the outreach pool who may benefit from the Agent Lab / Founder
  Signal System beta
- founders, agencies, consultants, and operators with signal, follow-up, or
  workflow-package pain

Primary promise:

- test the smallest usable version of the system with real users
- keep the beta practical, reviewed, and grounded in live operating needs
- turn repeated beta lessons into SOPs, templates, and workflow packages

Primary next steps:

- beta invitation
- diagnostic intake
- manual or semi-manual setup support
- follow-up sequence and proof capture

### Track Relationship

Everyone can be offered the MVP beta when it fits.

The Independence Chapter is narrower: it specifically looks for bootstrapped
businesses and founder-led operators who match the Bootstrapper Capital
community and event lane.

The two tracks share infrastructure:

- lead lists
- Reach campaigns
- CRM-lite tracking
- founder diagnostic assets
- follow-up templates
- workflow implementation queue

They should not share identical messaging. Independence Chapter messaging leads
with founder/operator identity. MVP beta messaging leads with the workflow
problem and the chance to help shape the product.

## Funnel Spine

The active funnel runs:

1. Content or direct outreach
2. Founder signal, bootstrapper identity, or workflow pain
3. Diagnostic, roundtable, or beta invitation
4. Follow-up sequence
5. Workshop, continuity, consulting sprint, or implementation package
6. Migration path into Ownable OS or a deeper operating-system build

Current outreach operating facts:

- Reach is the active low-cost sending lane.
- Gmail is the active inbox and monitoring lane.
- Google Drive is the active client-folder lane.
- Notion may be used as a lightweight dashboard only.
- Repo Markdown remains the agent-readable version-control source.
- Paid all-in-one platforms are not the default backbone unless they prove
  enough value to justify the cost.

## Source Of Truth Map

| Artifact Type | Human-facing Source | Agent / Versioned Source | Notes |
| --- | --- | --- | --- |
| Agency manual | Google Drive copy when promoted | `docs/operations/agency-operating-manual.md` | This file is the current repo source |
| SOPs | Operations folder / Google Docs where needed | `docs/operations/sop-manual-index.md` and individual SOP files | Use SOP template for formal versions |
| Workflow registry | Repo Markdown | `docs/operations/workflow-registry.md` | Registry is the workflow map |
| Change control | Repo Markdown | `docs/operations/change-control-register.md` | Required for meaningful operational changes |
| Evidence / audits | Compliance Audits folder | Linked from repo when needed | Use approved evidence location unless local placement is required |
| Leads and outreach | Reach, Gmail, lead CSVs | Lead list source files and recap docs | Do not duplicate lead truth casually |
| Client folders | Google Drive Clients folder | Operating docs describe the automation | Folder contents are client-facing |

## Workflow Test And Implementation Queue

This is the priority order while live outreach is turning into revenue motion.

| Priority | Workflow | Why It Comes Now | Current Mode | Next SOP / Automation Target |
| --- | --- | --- | --- | --- |
| 1 | MKT-05 Outreach & Engagement | Live Reach testing is producing real data and must stay controlled | Manual / Reach-assisted | Outreach batch setup, tracking, and reply handling |
| 2 | MKT-02 Email/SMS Nurture | Follow-up must be consistent once replies and interest arrive | Manual / scheduled campaigns | Nurture sequence rules, stop conditions, handoff rules |
| 3 | MKT-01 Lead Generation & Conversion | Fresh lead sourcing must avoid duplicates and bad-fit drift | Manual CSV review | Lead qualification, dedupe, and CRM-lite import |
| 4 | SAL-02 OnBoarding | Signed proposals already trigger folder creation; the second half needs automation | Zapier + manual gap | Google Drive packet copy, folder population, sharing |
| 5 | SAL-01 Proposals & Contracts | Revenue conversations need a clean path into signed work | Manual / template-driven | Proposal prep, review, send, and status tracking |
| 6 | FUL-02 Client Success | New clients need visible health and next actions | Manual | Client success tracker and check-in cadence |
| 7 | FUL-03 Customer Service | Inbound questions need triage before they become hidden work | Manual | Issue intake, tiering, and escalation |
| 8 | FIN-03 Accounts Receivable & Payable | Money tasks need clear invoice and payment status | Manual / Frappe-oriented | Invoice creation, receivables review, payment status |
| 9 | MKT-04 Reviews & Referrals | Positive outcomes should become proof loops | Manual | Testimonial request, referral ask, proof capture |
| 10 | MKT-09 Event & Webinar Marketing | Independence Chapter needs a repeatable event lane | Folder shell | Roundtable invite, RSVP, event follow-up |

This queue is not permanent. It should change when live evidence changes.

## SOP Creation Rule

Create or update an SOP when one of these happens:

- the same task is repeated three times
- a mistake creates avoidable rework
- a new client or lead path depends on the task
- a tool boundary or account limit changes the workflow
- a manual process is ready for partial automation
- a process touches money, client trust, permissions, compliance, or source of
  truth

Each SOP should state:

- trigger
- owner
- inputs
- tools
- procedure
- output
- review point
- stop condition
- automation target
- failure path
- source of truth

## Automation Rule

Do not automate confusion.

Before automation, define:

- what starts the workflow
- what data is required
- where that data comes from
- who reviews exceptions
- where the output goes
- how failure is detected
- what manual fallback keeps the work moving

Current automation candidates:

| Candidate | Trigger | Desired Outcome | Current Constraint |
| --- | --- | --- | --- |
| New client packet population | Zapier creates client folder after signed proposal | Copy packet into folder and share with client | Free Zapier has only trigger + one action; Google-side script likely needed |
| Reach reply tracking | Reply or campaign event arrives | Update CRM-lite stage and next step | Need stable tracker source |
| Lead dedupe | New lead CSV prepared | Prevent uploading old Reach contacts | Needs simple comparison habit or script |
| Beta intake routing | Founder requests beta/diagnostic | Route into correct track and follow-up | Needs final intake fields and active form path |
| Roundtable follow-up | Event attendee or invite reply | Send appropriate follow-up and update stage | Event cadence still forming |

## Weekly Operating Rhythm

| Day | Focus | Operating Question |
| --- | --- | --- |
| Monday | Sales and pipeline | Who needs follow-up, and what money task moves today? |
| Tuesday | Marketing and book promotion | What public signal or authority asset feeds the funnel? |
| Wednesday | Bootstrapper Capital and events | What does the Independence Chapter need next? |
| Thursday | Fulfillment and aftercare | What client or beta user needs delivery, review, or recovery? |
| Friday | Finance and KPI review | What did we learn, earn, spend, ship, or defer? |

When the system is under stress, money tasks and client trust outrank tool
experiments.

## Current Operating Lessons

These lessons should drive SOPs and automation design:

- A working manual path is better than a fragile paid platform promise.
- Tool trials must not interrupt live revenue work without a clear payoff.
- Optional infrastructure experiments belong in scheduled-change lanes.
- Local tooling repairs need change-control notes when they affect operations.
- Outreach lists must be deduped before upload.
- Founder-facing messages need separate lanes for bootstrapper identity and
  product beta invitation.
- SOPs should be written after the work teaches us where the friction lives.

## Open Build Items

| Item | Owner | Status |
| --- | --- | --- |
| Promote this manual into the agency Operations folder / Google Drive source when Robert approves | Robert + agent | Pending |
| Decide final MVP beta intake path | Robert + agent | Pending |
| Draft SOP for Reach outreach batch setup and monitoring | Agent | Needed |
| Draft SOP for Google Drive client-folder packet population | Agent | Needed |
| Decide CRM-lite tracker location and required columns | Robert + agent | Needed |
| Reconcile Independence Chapter messaging against MVP beta messaging | Robert + agent | Needed |
| Park Docker / OpenClaw infrastructure repair until money tasks are stable | Robert + agent | Deferred |

## Handoff Summary

If a new operator reads only one page, tell them this:

URC is the main business. Agent Lab proves and packages the workflow products.
Bootstrapper Capital is the bootstrapper audience and event lane. Tactix is the
fulfillment arm. The current live push has two intertwined tracks: Independence
Chapter for bootstrapped founders, and MVP beta for broader workflow-fit leads.
Live outreach is moving through Reach, with Gmail and Google Drive as the
current low-cost operating backbone. SOPs should be created from real repeated
work, and automation should remove burden only after the manual path is clear.
