# URC Workflow Relationship Map

Date created: 2026-06-03
Status: v1 relationship map

## Purpose

This map shows how the 45 registered URC workflows relate within and across
departments. It is descriptive, not prescriptive: it documents the current
relationship logic from `docs/operations/workflow-registry.md`,
`docs/operations/agency-operating-manual.md`, and the imported workflow kits
without changing ownership, tools, or source-of-truth status.

Content queue health at creation: `healthy`.

## Executive Summary

The system has three relationship layers:

- Governance and operating support: `OPS-*` and `CUL-*` set direction,
  standards, security, training, tooling, planning, and quality expectations.
- Revenue spine: Marketing creates and qualifies demand, Sales converts it,
  Fulfillment delivers and measures outcomes, Finance controls invoice and
  accounting status, and AfterCare protects retention and expansion.
- Proof loop: Fulfillment and AfterCare outcomes return to Marketing through
  `MKT-04 Reviews & Referrals`, which feeds content, outreach, events, and
  future lead generation.

Main revenue path:

`MKT-06/MKT-05/MKT-01/MKT-02/MKT-03/MKT-09` -> `SAL-01/SAL-04/SAL-02` ->
`FUL-01/FUL-02/FUL-03/FUL-05` -> `FIN-03/FIN-04` ->
`AFC-01/AFC-02/AFC-03/AFC-04` -> `MKT-04`.

Review needed: several imported source kits still mention older or paid tool
stacks such as HubSpot, GoHighLevel, Stripe, ClickUp, Make, Zapier, or
QuickBooks. Those references are source context only until they are reconciled
against the current low-cost operating backbone: Reach, Gmail, Google Drive,
repo Markdown, the Independence Chapter CRM-lite bridge, owned finance
trackers/dashboards, and limited Notion dashboards.

## Full Cross-Department Map

```mermaid
graph LR
  OPS["OPS governance and operating standards"]
  CUL["CUL culture, training, security, QA"]
  MKT["Marketing demand and proof loops"]
  SAL["Sales proposals, closing, onboarding"]
  FUL["Fulfillment delivery and client success"]
  FIN["Finance pricing, AR/AP, close, reporting"]
  AFC["AfterCare retention, contracts, communities"]
  PROOF["Proof and referral loop"]

  OPS -->|"sets workflow standards, tool rules, planning cadence"| MKT
  OPS -->|"sets workflow standards, access, planning cadence"| SAL
  OPS -->|"sets delivery standards and QA expectations"| FUL
  OPS -->|"sets finance controls and review cadence"| FIN
  OPS -->|"sets retention operating standards"| AFC
  CUL -->|"sets values, training, AI policy, QA posture"| OPS
  CUL -->|"supports team behavior and documentation discipline"| MKT
  CUL -->|"supports account behavior and client trust"| SAL
  CUL -->|"supports delivery behavior and quality"| FUL
  CUL -->|"supports stewardship and review habits"| FIN
  CUL -->|"supports retention and community behavior"| AFC

  MKT -->|"MQL, diagnostic, roundtable, or beta interest"| SAL
  SAL -->|"signed proposal, onboarding packet, project kickoff"| FUL
  SAL -->|"contract terms, payment schedule, invoice need"| FIN
  FUL -->|"milestone complete, client health, support issue, outcome data"| FIN
  FUL -->|"delivery status, engagement, testimonials, case-study candidates"| AFC
  FIN -->|"invoice status, payment status, revenue reporting"| SAL
  FIN -->|"billing status, MRR, receivables, renewal visibility"| AFC
  AFC -->|"renewal, upgrade, contract, membership, community signal"| SAL
  AFC -->|"happy client, referral, testimonial, case-study signal"| PROOF
  FUL -->|"positive outcome, feedback, testimonial candidate"| PROOF
  PROOF -->|"reviews, referrals, case studies, content fuel"| MKT
```

## Department Maps

### Operations

`OPS-*` workflows govern the operating system. They are not a linear revenue
process; they create the rules that keep every department from drifting.

```mermaid
graph LR
  OPS01["OPS-01 Vision & Purpose"]
  OPS02["OPS-02 Mission & Governance"]
  OPS03["OPS-03 Documentation & SOP Standards"]
  OPS04["OPS-04 Organization & Security"]
  OPS05["OPS-05 Strategy & Planning"]
  OPS06["OPS-06 Tech & IT"]
  OPS07["OPS-07 Growth & Training"]
  OPS08["OPS-08 R&D & Quality Assurance"]

  OPS01 -->|"defines purpose for"| OPS02
  OPS02 -->|"sets governance for"| OPS05
  OPS05 -->|"creates priorities for"| OPS03
  OPS03 -->|"standardizes procedures for"| OPS06
  OPS04 -->|"controls roles, access, and tool adoption for"| OPS06
  OPS07 -->|"trains operators to follow"| OPS03
  OPS06 -->|"supports systems used by"| OPS08
  OPS08 -->|"feeds improvements back to"| OPS03
  OPS08 -->|"informs next planning cycle for"| OPS05
```

### Culture

`CUL-*` workflows mirror and reinforce the operating layer with values,
training, documentation behavior, security norms, and quality habits.

```mermaid
graph LR
  CUL01["CUL-01 Vision & Purpose"]
  CUL02["CUL-02 Mission & Governance"]
  CUL03["CUL-03 Documentation & SOP"]
  CUL04["CUL-04 Organization & Security"]
  CUL05["CUL-05 Growth & Training"]
  CUL06["CUL-06 R&D & Quality Assurance"]
  CUL07["CUL-07 Strategy & Planning"]
  CUL08["CUL-08 Tech and IT"]

  CUL01 -->|"anchors values for"| CUL02
  CUL02 -->|"sets behavior rules for"| CUL03
  CUL03 -->|"documents expectations for"| CUL05
  CUL04 -->|"protects access and role clarity for"| CUL08
  CUL05 -->|"builds operator capability for"| CUL06
  CUL06 -->|"surfaces quality lessons for"| CUL07
  CUL07 -->|"sets next culture priorities for"| CUL01
  CUL08 -->|"supports tools used by"| CUL03
```

### Marketing

Marketing creates demand, qualifies interest, nurtures prospects, creates
events, and captures proof from delivery and aftercare.

```mermaid
graph LR
  MKT06["MKT-06 Content Creation & Dissemination"]
  MKT08["MKT-08 Social Media Management"]
  MKT07["MKT-07 Paid Advertising & PPC"]
  MKT09["MKT-09 Event & Webinar Marketing"]
  MKT01["MKT-01 Lead Generation & Conversion"]
  MKT03["MKT-03 Polls & Assessments"]
  MKT05["MKT-05 Outreach & Engagement"]
  MKT02["MKT-02 Email/SMS Nurture"]
  MKT04["MKT-04 Reviews & Referrals"]

  MKT06 -->|"content calendar and authority signal"| MKT08
  MKT06 -->|"campaign themes and founder lessons"| MKT05
  MKT08 -->|"social response and audience signal"| MKT01
  MKT07 -->|"paid traffic when pipeline gap exists"| MKT01
  MKT09 -->|"event RSVPs and attendee interest"| MKT01
  MKT01 -->|"MQL or diagnostic interest"| MKT03
  MKT03 -->|"assessment score or workflow pain"| MKT02
  MKT05 -->|"reply, warm lead, or meeting interest"| MKT02
  MKT02 -->|"qualified warm lead"| MKT01
  MKT01 -->|"MQL handoff"| SAL01["SAL-01 Proposals & Contracts"]
  MKT04 -->|"testimonials, referrals, case studies"| MKT06
  MKT04 -->|"referral source"| MKT01
```

Review needed: `MKT-09` is still a folder shell, so event follow-up
relationships should be confirmed when the roundtable workflow is built.

### Sales

Sales converts qualified demand into proposals, signed work, onboarding,
expansion offers, and future funding or product revenue decisions.

```mermaid
graph LR
  SAL01["SAL-01 Proposals & Contracts"]
  SAL04["SAL-04 Negotiating & Closing"]
  SAL03["SAL-03 Deals & Discounts"]
  SAL02["SAL-02 OnBoarding"]
  SAL05["SAL-05 Passive & Active Income Streams"]
  SAL06["SAL-06 Fund Raising"]

  SAL01 -->|"proposal delivered"| SAL04
  SAL04 -->|"stall or discount request"| SAL03
  SAL03 -->|"approved terms or escalation decision"| SAL04
  SAL04 -->|"contract fully executed"| SAL02
  SAL05 -->|"product or recurring offer path"| SAL01
  SAL06 -->|"growth initiative funding path"| SAL05
  SAL02 -->|"active project setup"| FUL02["FUL-02 Client Success"]
  SAL02 -->|"payment schedule and contract facts"| FIN03["FIN-03 Accounts Receivable & Payable"]
```

Review needed: older Sales source files may mention client portal or CRM
automation assumptions that must be reconciled against the current
Independence Chapter CRM-lite bridge, Gmail, and Google Drive operating path.

### Fulfillment

Fulfillment turns signed work into deliverables, health monitoring, support,
feedback, measurement, and renewal signals.

```mermaid
graph LR
  FUL01["FUL-01 Display & Packaging"]
  FUL02["FUL-02 Client Success"]
  FUL03["FUL-03 Customer Service"]
  FUL04["FUL-04 Feedback & Testimonials"]
  FUL05["FUL-05 Analytics & Measurement"]

  FUL02 -->|"client health signal"| FUL03
  FUL03 -->|"issue trend or escalation"| FUL02
  FUL02 -->|"deliverable milestone or success story"| FUL01
  FUL01 -->|"packaged outcome or artifact"| FUL04
  FUL02 -->|"QBR, health score, delivery data"| FUL05
  FUL03 -->|"support volume and failure pattern"| FUL05
  FUL05 -->|"measurement insight"| FUL02
  FUL04 -->|"testimonial or referral candidate"| MKT04["MKT-04 Reviews & Referrals"]
  FUL05 -->|"outcome data and KPI evidence"| FIN04["FIN-04 Accounting & Auditing"]
```

### Finance

Finance controls price, expense, invoice, payment, accounting, tax, savings,
and financial review visibility.

```mermaid
graph LR
  FIN01["FIN-01 Pricing & Expenses"]
  FIN02["FIN-02 Taxes & Fees"]
  FIN03["FIN-03 Accounts Receivable & Payable"]
  FIN04["FIN-04 Accounting & Auditing"]
  FIN05["FIN-05 Investment & Savings"]

  FIN01 -->|"approved price, expense, or cost basis"| SAL01["SAL-01 Proposals & Contracts"]
  FIN01 -->|"expense submitted or receipt uploaded"| FIN03
  FIN03 -->|"invoice and payment status"| FIN04
  FIN04 -->|"month-end close and revenue view"| FIN02
  FIN04 -->|"cash and performance snapshot"| FIN05
  FIN05 -->|"drift or savings decision"| FIN01
  FIN03 -->|"receivables visibility"| SAL04["SAL-04 Negotiating & Closing"]
  FIN03 -->|"billing status"| AFC01["AFC-01 Subscriptions"]
  FIN04 -->|"MRR, contract, and revenue reporting"| AFC03["AFC-03 Long-Term Contracts"]
```

Review needed: imported finance sources may name Frappe, QuickBooks, or other
tools. URC does not currently have an active finance platform; owned finance
trackers and dashboards are the control layer until a replacement is chosen.

### AfterCare

AfterCare protects revenue after the sale through subscriptions, memberships,
long-term contracts, and communities.

```mermaid
graph LR
  AFC01["AFC-01 Subscriptions"]
  AFC02["AFC-02 Memberships"]
  AFC03["AFC-03 Long-Term Contracts"]
  AFC04["AFC-04 Communities"]

  AFC01 -->|"upgrade pathway"| AFC02
  AFC02 -->|"premium client or deeper engagement"| AFC03
  AFC03 -->|"contract client invited into community"| AFC04
  AFC04 -->|"community engagement and event signal"| AFC02
  AFC01 -->|"subscriber acquisition and proof signal"| MKT04["MKT-04 Reviews & Referrals"]
  AFC02 -->|"member testimonial or referral"| MKT04
  AFC03 -->|"case study, renewal, referral"| MKT04
  AFC04 -->|"community story, event signal, referral"| MKT04
  AFC03 -->|"renewal or expansion opportunity"| SAL01["SAL-01 Proposals & Contracts"]
```

Review needed: AfterCare source kits contain substantial older-platform
references. Treat the relationships as operational logic, not approved tool
selection.

## Cross-Department Handoff Table

| From | To | Trigger / Signal | Relationship Type | Owner Review Point | Source |
| --- | --- | --- | --- | --- | --- |
| `OPS-01` | `OPS-02`, `OPS-05` | Annual strategy session clarifies purpose | Governance dependency | Founder/CEO confirms purpose before governance or planning changes | Workflow registry |
| `OPS-03` | All workflow-owning departments | New workflow identified | SOP standard | Head of Operations reviews source of truth, trigger, owner, output, fallback | Workflow registry; agency manual |
| `OPS-04` | All workflow-owning departments | New hire, role change, or tool adoption | Access and role control | Founder/CEO confirms access, ownership, and security boundary | Workflow registry |
| `OPS-06` | All workflow-owning departments | Tool adoption or monthly review | Tool and system support | Head of Operations confirms tool fit and current low-cost backbone | Workflow registry; agency manual |
| `OPS-08` | All workflow-owning departments | Monthly QA cycle or R&D sprint | Quality and improvement loop | Head of Operations decides whether lesson becomes SOP or automation target | Workflow registry; agency manual |
| `CUL-03` | `OPS-03` | New workflow or quarterly audit | Documentation behavior support | Robert + SOP Owner confirm that culture guidance matches SOP standard | Workflow registry |
| `CUL-05` | `OPS-07` | New hire confirmed | Training support | Robert confirms operator can follow current workflow docs | Workflow registry |
| `CUL-06` | `OPS-08` | Monthly QA cycle or quarterly R&D sprint | Quality support | Robert confirms QA lesson is operationally useful before adoption | Workflow registry |
| `MKT-06` | `MKT-08`, `MKT-05`, `MKT-09` | Content calendar, trending topic, book or authority asset | Demand creation | Marcus + Robert confirm message lane and CTA | Workflow registry; agency manual |
| `MKT-08` | `MKT-01` | Social response or campaign signal | Lead capture | Marcus + Robert confirm whether signal becomes a lead | Workflow registry |
| `MKT-07` | `MKT-01` | Marketing calendar or pipeline gap | Paid lead capture | Marcus + Robert confirm budget, claim safety, and fit | Workflow registry |
| `MKT-09` | `MKT-01`, `MKT-02` | Event RSVP, attendee, or event follow-up window | Event lead capture and nurture | Robert + Marcus confirm roundtable path and follow-up | Workflow registry; agency manual; Review needed |
| `MKT-05` | `MKT-02` | Reply, warm lead, or outreach sequence result | Nurture enrollment | Marcus + Account Managers confirm stage and next step | Workflow registry; agency manual |
| `MKT-03` | `MKT-02`, `SAL-01` | Assessment score or workflow pain surfaced | Qualification support | Marcus + Robert confirm whether diagnostic result is sales-ready | Workflow registry |
| `MKT-02` | `MKT-01`, `SAL-01` | Lead becomes warm or ready for conversation | Qualification and handoff | Marcus + Robert confirm MQL status and stop conditions | Workflow registry; agency manual |
| `MKT-01` | `SAL-01` | MQL handoff from Marketing | Sales entry | Robert + Account Managers confirm fit, source, interest, and next action | Workflow registry |
| `SAL-01` | `SAL-04` | Proposal delivered | Close follow-up | Account Manager + Robert confirm proposal terms and follow-up stance | Workflow registry |
| `SAL-04` | `SAL-03` | Stall detected or discount requested | Pricing or concession review | Robert approves terms or escalation path | Workflow registry |
| `SAL-04` | `SAL-02` | Contract fully executed | Onboarding trigger | Account Manager assigned and kickoff path confirmed | Workflow registry |
| `SAL-02` | `FUL-02` | Client moved from signature to active project | Delivery activation | Account Manager confirms folder, packet, and first success checkpoint | Workflow registry; agency manual |
| `SAL-02` | `FIN-03` | Contract includes payment schedule or invoice need | Invoice setup | Robert + Finance confirm owned tracker invoice and receivables status | Workflow registry; agency manual |
| `SAL-05` | `MKT-06`, `MKT-01`, `SAL-01` | Passive or active income offer planning | Offer-to-market relationship | Robert confirms offer ladder, price, CTA, and source of truth | Workflow registry |
| `SAL-06` | `SAL-05`, `FIN-04` | Growth initiative or funding path | Growth funding support | Robert confirms whether fundraising supports current plan | Workflow registry |
| `FUL-01` | `FUL-04`, `MKT-04` | Deliverable milestone reached | Proof packaging | Account Manager + Marcus confirm outcome is shareable | Workflow registry |
| `FUL-02` | `FUL-03` | Client health issue or service need | Support trigger | Account Manager confirms issue owner and urgency | Workflow registry; agency manual |
| `FUL-02` | `FUL-05` | Daily health monitoring or QBR input | Measurement input | Account Manager confirms data is current and useful | Workflow registry |
| `FUL-03` | `FUL-05` | Inbound support volume or escalation pattern | Measurement and QA input | Account Manager + Robert confirm whether issue becomes SOP improvement | Workflow registry; agency manual |
| `FUL-04` | `MKT-04` | Feedback, testimonial, referral, or case study candidate | Proof loop | Marcus + Account Manager confirm permission and claim safety | Workflow registry |
| `FUL-05` | `FIN-04`, `MKT-04` | KPI evidence, delivered outcome, dashboard/report | Reporting and proof support | Robert + Operations Lead confirm metric is reliable | Workflow registry |
| `FIN-01` | `SAL-01`, `SAL-03` | Pricing, expense, cost, or discount concern | Pricing control | Robert confirms price and margin logic | Workflow registry |
| `FIN-03` | `SAL-04`, `AFC-01`, `AFC-03` | Invoice status, AP/AR status, payment schedule | Money-status visibility | Robert + Finance confirm owned tracker status before escalation | Workflow registry; agency manual |
| `FIN-04` | `FIN-02`, `FIN-05`, `AFC-03` | Month-end close and revenue reporting | Finance review and compliance | Robert confirms close, tax, savings, and contract reporting view | Workflow registry |
| `AFC-01` | `AFC-02` | Subscriber upgrade pathway or usage signal | Retention expansion | Account Manager + Robert confirm upgrade fit | Workflow registry |
| `AFC-02` | `AFC-03` | Premium member or deeper engagement need | Contract expansion | Jerome + Account Manager confirm contract path | Workflow registry |
| `AFC-03` | `SAL-01`, `FIN-03`, `FUL-02` | Signed proposal, renewal, or long-term contract event | Contract and renewal control | Jerome + Account Manager confirm terms, billing, and delivery obligations | Workflow registry; imported kits |
| `AFC-04` | `MKT-09`, `MKT-04`, `AFC-02` | New member joins platform or community activity | Community, event, proof, and membership loop | Marcus + Robert confirm event signal, member status, or shareable story | Workflow registry |
| `MKT-04` | `MKT-06`, `MKT-01`, `SAL-01` | Positive NPS, milestone, testimonial, referral | Proof and referral loop | Marcus + Robert confirm permission, claim safety, and next offer | Workflow registry; agency manual |

## Active Execution Queue Overlay

This overlay is the current implementation priority order from
`docs/operations/agency-operating-manual.md`. It does not replace the full
registry; it shows which relationships matter most while live outreach is
turning into revenue motion.

```mermaid
graph LR
  Q1["1 MKT-05 Outreach & Engagement"]
  Q2["2 MKT-02 Email/SMS Nurture"]
  Q3["3 MKT-01 Lead Generation & Conversion"]
  Q4["4 SAL-02 OnBoarding"]
  Q5["5 SAL-01 Proposals & Contracts"]
  Q6["6 FUL-02 Client Success"]
  Q7["7 FUL-03 Customer Service"]
  Q8["8 FIN-03 Accounts Receivable & Payable"]
  Q9["9 MKT-04 Reviews & Referrals"]
  Q10["10 MKT-09 Event & Webinar Marketing"]

  Q10 -->|"roundtable invite, RSVP, event follow-up"| Q3
  Q1 -->|"Reach reply and outreach signal"| Q2
  Q2 -->|"qualified lead ready for sales conversation"| Q3
  Q3 -->|"MQL handoff"| Q5
  Q5 -->|"signed work creates onboarding need"| Q4
  Q4 -->|"active project setup"| Q6
  Q6 -->|"client issue or support need"| Q7
  Q6 -->|"milestone complete or invoice trigger"| Q8
  Q7 -->|"support pattern or recovery outcome"| Q6
  Q6 -->|"positive outcome or testimonial candidate"| Q9
  Q9 -->|"proof, referral, and content fuel"| Q1
```

| Priority | Workflow | Relationship Focus | Current Mode | Next SOP / Automation Target |
| --- | --- | --- | --- | --- |
| 1 | `MKT-05 Outreach & Engagement` | Feeds replies and live lead signals into nurture and the Independence Chapter CRM-lite bridge | Manual / Reach-assisted | Outreach batch setup, tracking, and reply handling |
| 2 | `MKT-02 Email/SMS Nurture` | Keeps follow-up consistent after interest or replies arrive | Manual / scheduled campaigns | Nurture sequence rules, stop conditions, handoff rules |
| 3 | `MKT-01 Lead Generation & Conversion` | Qualifies and dedupes leads before Sales handoff | Manual CSV review | Lead qualification, dedupe, and bridge-tracker import |
| 4 | `SAL-02 OnBoarding` | Converts signed work into active client setup and delivery start | Zapier + manual gap | Google Drive packet copy, folder population, sharing |
| 5 | `SAL-01 Proposals & Contracts` | Turns revenue conversations into proposal and contract status | Manual / template-driven | Proposal prep, review, send, and status tracking |
| 6 | `FUL-02 Client Success` | Watches active client health and next actions | Manual | Client success tracker and check-in cadence |
| 7 | `FUL-03 Customer Service` | Triage layer for inbound questions and recovery work | Manual | Issue intake, tiering, and escalation |
| 8 | `FIN-03 Accounts Receivable & Payable` | Controls invoice and payment status visibility | Manual / owned finance tracker | Invoice creation, receivables review, payment status, SKU/account mapping |
| 9 | `MKT-04 Reviews & Referrals` | Converts outcomes into testimonials, referrals, and proof | Manual | Testimonial request, referral ask, proof capture |
| 10 | `MKT-09 Event & Webinar Marketing` | Builds the Bootstrapper Capital roundtable/event lane | Folder shell | Roundtable invite, RSVP, event follow-up |

## Coverage Check

All registered workflow IDs are represented in this map:

- Operations: `OPS-01`, `OPS-02`, `OPS-03`, `OPS-04`, `OPS-05`, `OPS-06`,
  `OPS-07`, `OPS-08`
- Culture: `CUL-01`, `CUL-02`, `CUL-03`, `CUL-04`, `CUL-05`, `CUL-06`,
  `CUL-07`, `CUL-08`
- Finance: `FIN-01`, `FIN-02`, `FIN-03`, `FIN-04`, `FIN-05`
- Sales: `SAL-01`, `SAL-02`, `SAL-03`, `SAL-04`, `SAL-05`, `SAL-06`
- Marketing: `MKT-01`, `MKT-02`, `MKT-03`, `MKT-04`, `MKT-05`, `MKT-06`,
  `MKT-07`, `MKT-08`, `MKT-09`
- Fulfillment: `FUL-01`, `FUL-02`, `FUL-03`, `FUL-04`, `FUL-05`
- AfterCare: `AFC-01`, `AFC-02`, `AFC-03`, `AFC-04`

## Maintenance Notes

- Update this map when the workflow registry changes, when an active queue
  workflow is certified, or when an SOP changes a cross-department handoff.
- Keep tool references conservative. If an imported kit names a paid or legacy
  platform, mark that relationship `Review needed` until the active operating
  backbone confirms the tool.
- Do not use this map as a substitute for the workflow kits. It is a navigation
  and dependency layer that points operators to the right workflow.
