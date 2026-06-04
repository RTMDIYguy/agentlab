# URC Workflow Registry

Date created: 2026-05-15
Source: `Master Workflow Index.updated-4.docx`

This registry brings the 45-workflow URC AI-native agency playbook into repo-native Markdown. Status values are packaging statuses, not business importance.

## Two-Track Source Model

Each department has two related but different source tracks:

- URC/internal set: Robert and URC-specific operating workflows, trackers, and implementation artifacts. These are used to run URC, Tactix, Bootstrapper Capital, and the book funnel.
- Client-facing set: reusable templates housed in each department's `/Workflows` and `/Automations` folders. These should be converted into client-safe package variants with URC-specific IDs, names, targets, and internal assumptions removed.

This import pass prioritizes getting the URC/internal set and available automation scaffolds online. Client-facing `/Workflows` sources are the next import lane and should be tracked separately rather than mixed into URC source files.

| ID | Workflow | Department | Automation Level | Owner | Trigger | Cycle Time | Repo Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| OPS-01 | Vision & Purpose | Operations | N/A - Framework | Founder/CEO | Annual strategy session | Annual review; OKRs quarterly | Imported source |
| OPS-02 | Mission & Governance | Operations | N/A - Framework | Founder/CEO | Annual or major pivot | Annual mission; governance monthly | Imported source |
| OPS-03 | Documentation & SOP Standards | Operations | N/A - Framework | Head of Operations | New workflow identified | Creation: as needed; review: quarterly | Imported source |
| OPS-04 | Organization & Security | Operations | N/A - Framework | Founder/CEO | New hire, role change, or tool adoption | Org chart: quarterly; access: semi-annual | Imported source |
| OPS-05 | Strategy & Planning | Operations | N/A - Framework | Founder/CEO | Annual and quarterly | Annual plan; quarterly sprint | Imported source |
| OPS-06 | Tech & IT | Operations | N/A - Framework | Head of Operations | Tool adoption or monthly review | Registry: monthly; audit: annual | Imported source |
| OPS-07 | Growth & Training | Operations | N/A - Framework | Founder/CEO | New hire or quarterly skills review | Onboarding: 5-day sprint; training: ongoing | Imported source |
| OPS-08 | R&D & Quality Assurance | Operations | N/A - Framework | Head of Operations | Monthly QA cycle or R&D sprint | QA: before every deliverable; R&D: quarterly | Imported source |
| CUL-01 | Vision & Purpose | Culture | 60-70% | Robert T. McCarthy | Annual strategy session | Vision: annual; OKRs: quarterly | Imported source |
| CUL-02 | Mission & Governance | Culture | 50-60% | Robert T. McCarthy | Annual or business model update | Mission: annual; AI policy: semi-annual | Imported source |
| CUL-03 | Documentation & SOP | Culture | 75-85% | Robert + SOP Owner | New workflow or quarterly audit | Creation: 1-3 hours; review: quarterly | Imported source |
| CUL-04 | Organization & Security | Culture | 60-70% | Robert T. McCarthy | New hire, role change, breach | Org chart: quarterly; access: semi-annual | Imported source |
| CUL-05 | Growth & Training | Culture | 70-80% | Robert T. McCarthy | New hire confirmed | Onboarding: 5-day sprint; training: 2 hrs/week | Imported source |
| CUL-06 | R&D & Quality Assurance | Culture | 65-75% | Robert T. McCarthy | Monthly QA cycle; quarterly R&D sprint | Tool eval: 2-week trial; QA: every deliverable | Imported source |
| CUL-07 | Strategy & Planning | Culture | 55-65% | Robert T. McCarthy | December annually; end of each quarter | Annual plan: December; monthly check: 30 min | Imported source |
| CUL-08 | Tech and IT | Culture | 70-80% | Robert + Tech Lead | Immediate agency setup; monthly thereafter | Registry: monthly; audit: December | Imported source |
| FIN-01 | Pricing & Expenses | Finance | 80% | Robert T. McCarthy | Expense submitted or receipt uploaded | Processing: same day to 48 hrs; review: quarterly | Imported source |
| FIN-02 | Taxes & Fees | Finance | 70% | Robert + CPA | 30/15/7 days before deadline | Quarterly estimated payments; annual filing | Imported source |
| FIN-03 | Accounts Receivable & Payable | Finance | 85% | Robert + Finance | Milestone complete (AR) or invoice received (AP) | Invoice: same day; AP runs: weekly | Imported source |
| FIN-04 | Accounting & Auditing | Finance | 75% | Robert T. McCarthy | Last business day of month | Month-end close: within 5 business days | Imported source |
| FIN-05 | Investment & Savings | Finance | 65% | Robert T. McCarthy | 1st business day of month; drift detected | Transfers: monthly; monitoring: daily | Imported source |
| SAL-01 | Proposals & Contracts | Sales | 85-90% | Robert + Account Managers | MQL handoff from Marketing | Draft: 24-72 hrs; signed: within 7 days | Imported source |
| SAL-02 | OnBoarding | Sales | 80-85% | Account Manager assigned | Contract fully executed | 3-7 days from signature to active project | Imported source |
| SAL-03 | Deals & Discounts | Sales | 85-90% | Robert (approvals) | Stall detected or discount requested | Auto-approval: < 5 min; escalation: < 4 hrs | Imported source |
| SAL-04 | Negotiating & Closing | Sales | 80-85% | Account Manager + Robert | Proposal delivered, 48 hrs no response | Follow-up: daily until response; close: 3-21 days | Imported source |
| SAL-05 | Passive & Active Income Streams | Sales | 85-90% (passive) | Robert T. McCarthy | Quarterly planning cycle | Passive product launch: 2-4 weeks; ongoing optimization | Imported source |
| SAL-06 | Fund Raising | Sales | 80-85% | Robert T. McCarthy | Quarterly planning; growth initiative | Application: 2-8 weeks; investor: 3-12 months | Imported source |
| MKT-01 | Lead Generation & Conversion | Marketing | 90-95% | Marcus + Robert | Campaign scheduled or budget allocated | 24-72 hrs: lead capture to MQL | Imported source |
| MKT-02 | Email/SMS Nurture | Marketing | 85-90% | Marcus + Robert | Lead qualified as Warm/Cold | 30-90 day sequences; continuous | Imported source |
| MKT-03 | Polls & Assessments | Marketing | 90-95% | Marcus + Robert | Campaign planning cycle | Real-time + immediate follow-up | Imported source |
| MKT-04 | Reviews & Referrals | Marketing | 85-90% | Marcus + Robert | Positive NPS (>=8) or milestone reached | Trigger-based; continuous | Imported source |
| MKT-05 | Outreach & Engagement | Marketing | 80-85% | Marcus + Account Managers | Sales territory defined or campaign planned | 7-14 day sequences; continuous | Imported source |
| MKT-06 | Content Creation & Dissemination | Marketing | 75-80% | Marcus + Robert | Content calendar; trending topic detected | Draft: 4-8 hrs; distribution: ongoing | Active package; live/manual Independence Chapter canary passed with manual workarounds on 2026-05-21 |
| MKT-07 | Paid Advertising & PPC | Marketing | 85-90% | Marcus + Robert | Marketing calendar or pipeline gap | Launch: 48-72 hrs; optimization: daily | Imported source + automation |
| MKT-08 | Social Media Management | Marketing | 80-85% | Marcus + Robert | 25th of prior month (calendar planning) | 30-day calendar; daily posts | Automation scaffold only |
| MKT-09 | Event & Webinar Marketing | Marketing | 80-85% | Robert (live) + Marcus (logistics) | Monthly planning session | Planned 30 days out; follow-up 14 days after | v0 runnable slice: `docs/operations/mkt-09-roundtable-operating-slice.md`; source folder shell remains incomplete |
| FUL-01 | Display & Packaging | Fulfillment | 80-85% | Account Manager + Marcus | Deliverable milestone reached | Simple: 1-2 hrs; complex: 4-8 hrs | Imported source |
| FUL-02 | Client Success | Fulfillment | 80-85% | Account Manager | Continuous - daily health monitoring | Scoring: daily; QBR: quarterly | Imported source |
| FUL-03 | Customer Service | Fulfillment | 70-80% | Account Manager + Robert (Tier 3) | Inbound request any channel | Tier 1: < 5 min; Tier 2: < 4 hrs; Tier 3: < 24 hrs | Imported source |
| FUL-04 | Feedback & Testimonials | Fulfillment | 85-90% | Marcus + Account Manager | Automated multi-touch lifecycle triggers | Collection: continuous; case study: 1-2 weeks | Imported source |
| FUL-05 | Analytics & Measurement | Fulfillment | 85-90% | Robert + Operations Lead | Real-time/daily automated refresh | Dashboard: real-time; reports: weekly/monthly | Imported source |
| AFC-01 | Subscriptions | AfterCare | 85-90% | Destiny/Keisha + Robert | New subscriber checkout via Stripe | Renewals: automated; at-risk: 14-21 days ahead | Imported source |
| AFC-02 | Memberships | AfterCare | 80-85% | Account Manager + Robert | Upgrade from subscription or direct enrollment | Onboarding: 7 days; renewal: 60-day cycle | Imported source |
| AFC-03 | Long-Term Contracts | AfterCare | 85-90% | Jerome + Account Manager | Signed proposal from Sales | Creation: 1-2 hrs; execution: 24-48 hrs; renewal: 90-day cycle | Imported source |
| AFC-04 | Communities | AfterCare | 75-80% | Marcus (content) + Robert (live) | New member joins platform | Onboarding: 24 hrs; events: monthly; content: daily | Imported source |
