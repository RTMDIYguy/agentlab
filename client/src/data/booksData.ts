export interface Chapter {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  readTime: string;
  summary: string;
  sections: {
    heading: string;
    content: string[];
    callout?: {
      type: "tip" | "warning" | "framework" | "quote";
      title: string;
      text: string;
    };
    diagram?: string;
  }[];
  keyTakeaways: string[];
  actionChecklist: string[];
}

export interface BookEdition {
  id: "soe" | "bgw";
  title: string;
  subtitle: string;
  author: string;
  edition: string;
  badge: string;
  description: string;
  price: string;
  gumroadUrl: string;
  coverGradient: string;
  chapters: Chapter[];
}

export const BOOKS_REGISTRY: Record<string, BookEdition> = {
  soe: {
    id: "soe",
    title: "Startup Operational Excellence",
    subtitle: "Eliminating Informational Drift, Standardizing Team Execution, and Building Resilient Agency Workflows",
    author: "Robert T. McCarthy",
    edition: "First Edition • Unlocked in OS",
    badge: "Included with Workspace ($19.99 Value)",
    description: "The complete operational doctrine for agency operators transitioning from manual hustle to scalable, transferable enterprise value.",
    price: "$19.99",
    gumroadUrl: "https://bossrob.gumroad.com/l/soe",
    coverGradient: "from-amber-600 via-orange-600 to-amber-900",
    chapters: [
      {
        id: "soe-preface",
        number: 0,
        title: "Preface: The Zero-Drift Mandate",
        subtitle: "Why Agencies Bleed Margin and How Single-Source Architecture Restores Leverage",
        readTime: "4 min read",
        summary: "Most agencies fail to scale not because they lack client demand, but because execution degrades as team headcount grows. This preface establishes the core operational mandate.",
        sections: [
          {
            heading: "The Silent Cost of Execution Entropy",
            content: [
              "Every agency starts with founder hustle. The founder understands the client context, writes the messaging, delivers the service, and collects payment. Quality is high because all operational knowledge exists within a single human brain.",
              "As soon as the agency hires its first employee or subcontractor, informational drift begins. What was once implicit founder instinct must now be transmitted across Slack messages, Notion pages, and Zoom calls.",
              "Within six months, the agency is paying for five different SaaS tools that do not talk to each other. Deliverables require endless revisions, clients churn quietly, and the founder finds themselves working 70 hours a week simply acting as a human router."
            ],
            callout: {
              type: "warning",
              title: "The Drift Principle",
              text: "Every handoff between unmonitored human workers or disconnected tools loses 15% to 30% of critical operational context, compounding into exponential deliverable defects."
            }
          },
          {
            heading: "The Transition to Autonomous Operating Systems",
            content: [
              "Operational Excellence is not about working harder or hiring expensive middle managers. It is about encoding business intelligence into repeatable, deterministic, executable workflows.",
              "When an agency operates on a unified architecture—where every lead, proposal, fulfillment task, and financial ledger entry is governed by strict contracts—the business transforms into an asset that can run without founder intervention."
            ]
          }
        ],
        keyTakeaways: [
          "Founder-led execution does not scale without explicit operational codification.",
          "Informational drift compounds across unlinked tools, degrading client retention.",
          "Building transferable equity requires decoupling daily fulfillment from founder presence."
        ],
        actionChecklist: [
          "Audit all active communication channels to identify where client requirements are lost.",
          "Map current software subscriptions to identify fragmented point solutions.",
          "Commit to a single source of operational truth for workspace knowledge."
        ]
      },
      {
        id: "soe-ch1",
        number: 1,
        title: "Chapter 1: The SaaS Shelfware Crisis",
        subtitle: "Moving from 12 Disconnected Subscriptions to an Orchestrated Backbone",
        readTime: "6 min read",
        summary: "An in-depth analysis of how agencies overspend on unused software subscriptions and how to consolidate onto an AI-native operating stack.",
        sections: [
          {
            heading: "The Tool Accumulation Trap",
            content: [
              "The modern agency tech stack is cluttered with point solutions: a CRM for lead capture, a project management tool for task assignments, an invoicing portal for billing, and countless AI wrappers for copywriting.",
              "Each tool charges $30 to $150 per seat per month. More dangerously, each tool creates a siloed data fortress. Customer data entered in the CRM never updates the fulfillment Kanban, forcing manual copy-paste routines.",
              "We call this 'SaaS Shelfware': software that was bought with high hopes of productivity but ultimately created more administrative overhead than it solved."
            ],
            callout: {
              type: "framework",
              title: "The Consolidated Stack Hierarchy",
              text: "Tier 1: Core Backbone (M365 / Database) -> Tier 2: Autonomous Swarms (AI Execution Engine) -> Tier 3: Client Portal (Real-Time Transparency)."
            }
          },
          {
            heading: "The Zero-Waste Architecture",
            content: [
              "By transitioning to a unified operational backbone (using Microsoft 365, SQLite/PostgreSQL, and autonomous event-driven webhooks), agencies can eliminate 70% of redundant software expenses.",
              "More importantly, all client interaction data flows directly into the execution engine, enabling instant dispatch of fulfillment tasks the moment a contract is signed."
            ]
          }
        ],
        keyTakeaways: [
          "Fragmented SaaS stacks create artificial friction and recurring monthly waste.",
          "Single-source operational databases prevent data silos and double-entry errors.",
          "Automation must be designed around data flow rather than individual app interfaces."
        ],
        actionChecklist: [
          "List all monthly recurring software expenses and calculate total cost per seat.",
          "Identify duplicate data entry points between sales and project management.",
          "Consolidate core storage and communication onto Microsoft 365 / secure relational backend."
        ]
      },
      {
        id: "soe-ch2",
        number: 2,
        title: "Chapter 2: The 7-Department Swarm Hierarchy",
        subtitle: "Autonomous Operations Across Marketing, Sales, Fulfillment, Finance, Operations, Tech, and Leadership",
        readTime: "8 min read",
        summary: "How to structure an agency into 7 distinct autonomous departments, each with explicit inputs, outputs, verification loops, and fallback protocols.",
        sections: [
          {
            heading: "The 7 Functional Engines",
            content: [
              "Regardless of whether your agency employs 3 people or 300, every scalable service enterprise must perform seven distinct functions:",
              "1. Marketing (MKT): Cold outbound, organic authority, multi-channel syndication, and inbound capture.",
              "2. Sales (SAL): Lead qualification, diagnostic intake, proposal generation, and contract signing.",
              "3. Fulfillment (FUL): Client onboarding, asset delivery, quality evaluation, and revision control.",
              "4. Finance (FIN): Invoicing, revenue tracking, smart downgrade enforcement, and margin accounting.",
              "5. Operations (OPS): Process auditing, SLA monitoring, watchdog diagnostics, and knowledge synchronization.",
              "6. Technology (TEC): Infrastructure stability, API integrations, security compliance (CSP/Auth), and database integrity.",
              "7. Leadership (LEA): Strategic positioning, offer ladder evolution, and enterprise equity governance."
            ],
            callout: {
              type: "tip",
              title: "Department Isolation Principle",
              text: "No department may directly mutate another department's state without a signed handoff contract and validation check."
            }
          },
          {
            heading: "Multi-Agent Swarm Orchestration",
            content: [
              "In AgentLab OS, each department is powered by autonomous AI agent nodes monitored by a 24/7 watchdog.",
              "If a sales lead is marked 'Closed Won', the Sales Swarm issues a cryptographic handoff signal to the Fulfillment Swarm, triggering client workspace provisioning, welcome email dispatch, and task assignment in under 3 seconds."
            ]
          }
        ],
        keyTakeaways: [
          "Clear departmental separation eliminates role ambiguity and bottlenecking.",
          "Handoff contracts ensure deliverables meet quality standards before advancing.",
          "Autonomous agent swarms handle repetitive coordination, freeing humans for high-judgment strategy."
        ],
        actionChecklist: [
          "Assign clear ownership for each of the 7 functional departments.",
          "Define exact required inputs and expected deliverables for every cross-department handoff.",
          "Deploy automated watchdog monitoring to catch stalled tasks before clients notice."
        ]
      },
      {
        id: "soe-ch3",
        number: 3,
        title: "Chapter 3: Playbooks vs Procedures",
        subtitle: "Governing High-Leverage Cross-Department Journeys with Contract Handoffs",
        readTime: "7 min read",
        summary: "Understanding the crucial distinction between individual departmental procedures (SOPs) and governed cross-department journeys (Playbooks).",
        sections: [
          {
            heading: "Procedures are Local; Playbooks are Global",
            content: [
              "A standard procedure (e.g., MKT-01: 'How to write a LinkedIn post') describes how a single person or agent performs an isolated task.",
              "A Playbook (e.g., 'Revenue Lead-to-Sale Journey') governs the entire lifecycle across Marketing, Sales, Finance, and Fulfillment.",
              "Without governed Playbooks, individual departments optimize for their own convenience rather than the overall customer outcome."
            ],
            callout: {
              type: "framework",
              title: "The 5 Canonical Playbooks",
              text: "1. Revenue Lead-to-Sale -> 2. Sale-to-Delivery -> 3. Delivery-to-Retention -> 4. Finance Control Loop -> 5. Proof & Referral Loop."
            }
          },
          {
            heading: "Stop Conditions and Fallback Protocols",
            content: [
              "Every resilient Playbook must define explicit stop conditions. If a client onboarding questionnaire is missing brand assets, the pipeline halts immediately rather than passing incomplete data into fulfillment.",
              "Automated alerts notify the account manager with exact corrective steps, preventing costly rework downstream."
            ]
          }
        ],
        keyTakeaways: [
          "Playbooks connect isolated SOPs into unified customer and financial journeys.",
          "Strict validation gates prevent errors from cascading across departments.",
          "Fallback protocols ensure operations recover gracefully when external systems fail."
        ],
        actionChecklist: [
          "Mount the 5 canonical Playbooks in your agency workspace.",
          "Define measurable completion criteria for each milestone in the client journey.",
          "Establish automated stop conditions for missing inputs or quality score failures."
        ]
      },
      {
        id: "soe-ch4",
        number: 4,
        title: "Chapter 4: Financial Control Loops & Zero-Loss Billing",
        subtitle: "Automating Cash Flow, Margin Protection, and Smart Trial Downgrades",
        readTime: "6 min read",
        summary: "How to eliminate revenue leakage, enforce automated trial expirations, and maintain real-time visibility over gross margins.",
        sections: [
          {
            heading: "The Agency Cash Flow Paradox",
            content: [
              "Agencies often believe they have a revenue problem when they actually have a billing control problem. Unbilled out-of-scope work, delayed invoice dispatch, and uncollected retainer renewals quietly destroy profitability.",
              "Automated financial loops monitor invoice aging and subscription statuses in real time. When a trial period expires or a payment fails, access permissions adjust automatically without awkward manual confrontations."
            ]
          }
        ],
        keyTakeaways: [
          "Automated billing engines protect agency margins from scope creep and delayed collections.",
          "Smart downgrade poller runs hourly to maintain entitlement integrity.",
          "Clear unit economics per client account allow confident reinvestment in growth."
        ],
        actionChecklist: [
          "Connect Stripe webhooks and automated billing poller to your client ledger.",
          "Implement automatic status downgrades for expired trials or overdue accounts.",
          "Review gross margin per deliverable weekly to optimize team allocation."
        ]
      }
    ]
  },
  bgw: {
    id: "bgw",
    title: "Bootstrapper's Guide to the World",
    subtitle: "28 Zero-Investment Business Models, Operational Architectures, and Cash Flow Playbooks",
    author: "Robert T. McCarthy",
    edition: "Founder Edition",
    badge: "Authority Asset ($59.99)",
    description: "The complete playbook for launching and scaling 28 proven business models with $0 outside capital, using leverage, sweat equity, and modern autonomous tooling.",
    price: "$59.99",
    gumroadUrl: "https://bossrob.gumroad.com/l/bootstrappersguide",
    coverGradient: "from-blue-600 via-cyan-600 to-slate-900",
    chapters: [
      {
        id: "bgw-intro",
        number: 0,
        title: "Introduction: The 4 Bootstrap Engines",
        subtitle: "How to Build Transferable Business Equity Without Debt or VC Dilution",
        readTime: "5 min read",
        summary: "An introduction to the zero-capital founder operating model: transforming hustle into productized services, workflow automation assets, and equity.",
        sections: [
          {
            heading: "The Myth of Required Venture Capital",
            content: [
              "For decades, founders were taught that building a significant technology or service business required pitching angel investors, selling 30% of their company before day one, and burning cash on unprofitable growth.",
              "The explosion of AI agents, open APIs, and productized delivery models has completely flipped this calculus. A single operator with disciplined operational systems can now command the output and revenue of a 20-person agency from a decade ago."
            ],
            callout: {
              type: "quote",
              title: "The Bootstrapper's Creed",
              text: "We do not buy software to feel productive; we build systems that generate cash on day one and compound into transferable equity."
            }
          },
          {
            heading: "The 4 Foundational Engines",
            content: [
              "1. The Lead Generation Engine: Consistent, organic authority outreach that fills the pipeline without paid ad spend.",
              "2. The Productized Fulfillment Engine: Fixed-scope, high-margin deliverables backed by deterministic SOPs.",
              "3. The Recurring Retainer Engine: Continuity contracts that provide baseline cash flow to fund growth.",
              "4. The Valuation Multiplier Engine: Standardized documentation that allows the business to be transferred or sold."
            ]
          }
        ],
        keyTakeaways: [
          "Modern AI and low-code tooling allow solo operators to generate enterprise-grade output.",
          "Productized services provide the fastest route to positive cash flow.",
          "Documented operational blueprints create durable business equity."
        ],
        actionChecklist: [
          "Select your primary bootstrap vehicle from the 28 business models.",
          "Package your offer into a fixed-scope, outcome-driven sprint.",
          "Set up zero-cost lead capture using LinkedIn authority outreach and automated intake."
        ]
      },
      {
        id: "bgw-ch1",
        number: 1,
        title: "Chapter 1: High-Ticket Specialized Advisory",
        subtitle: "Packaging Niche Expertise into $5K-$15K Diagnostic Sprints",
        readTime: "6 min read",
        summary: "How to escape hourly billing by packaging operational assessments and strategic diagnostics for mid-market business owners.",
        sections: [
          {
            heading: "The Diagnostic Offer Strategy",
            content: [
              "Never sell generic consulting by the hour. When you bill hourly, your incentive is to work slowly, and the client's incentive is to question every timesheet.",
              "Instead, offer a fixed-price 5-Day Diagnostic Sprint (e.g., 'Agency Operational Drift Audit'). You deliver a comprehensive visual blueprint, identify immediate cost savings, and position your full operating system implementation as the natural next step."
            ]
          }
        ],
        keyTakeaways: [
          "Fixed-scope diagnostics establish immediate authority and eliminate scope creep.",
          "Audit findings naturally convert into recurring operational management retainers.",
          "High-ticket advisory funds the development of autonomous software and playbooks."
        ],
        actionChecklist: [
          "Draft your 5-day assessment framework and deliverable template.",
          "Set price point at $2,500 to $7,500 for the initial audit.",
          "Define the follow-on implementation roadmap for qualified clients."
        ]
      },
      {
        id: "bgw-ch2",
        number: 2,
        title: "Chapter 2: The Founder Signal System",
        subtitle: "Generating Qualified B2B Demand via 5-Day Authority Sprints",
        readTime: "7 min read",
        summary: "Step-by-step methodology for turning founder insights into high-converting LinkedIn carousels, executive one-pagers, and calendar bookings.",
        sections: [
          {
            heading: "Content as an Operational Asset",
            content: [
              "Content creation should not be an unpredictable creative struggle. It is a structured operational pipeline (MKT-06).",
              "By extracting proven case studies, visual blueprints, and operational checklists, you produce assets that attract serious operators rather than casual scrollers."
            ]
          }
        ],
        keyTakeaways: [
          "Consistent authority publishing builds compounding inbound pipeline.",
          "Visual carousel decks and executive one-pagers outperform generic text posts.",
          "Automated intake forms filter out unqualified prospects before calls."
        ],
        actionChecklist: [
          "Queue 5 visual carousel decks for LinkedIn publication.",
          "Embed diagnostic booking links directly in authority posts.",
          "Track prospect conversion from view -> intake -> diagnostic sprint."
        ]
      },
      {
        id: "bgw-ch3",
        number: 3,
        title: "Chapter 3: Autonomous Multi-Agent Swarms",
        subtitle: "Deploying 7-Department AI Teams for Solo and Micro-Founders",
        readTime: "8 min read",
        summary: "How solo bootstrappers can leverage multi-agent architectures to perform marketing, SDR prospecting, customer onboarding, and quality evaluation 24/7.",
        sections: [
          {
            heading: "The 10x Operator Reality",
            content: [
              "With autonomous swarms, a single founder acts as Chief Executive and Lead Architect, while agent nodes handle cold email personalization, intake routing, document generation, and compliance checks.",
              "This maintains high profit margins (80%+) while delivering the speed and consistency of a full agency team."
            ]
          }
        ],
        keyTakeaways: [
          "Autonomous agent nodes handle operational heavy lifting without increasing payroll.",
          "Human oversight is reserved for strategic judgment, high-value sales, and relationship management.",
          "Deterministic verification ensures AI output meets strict quality standards."
        ],
        actionChecklist: [
          "Configure your SDR agent for lead research and email draft generation.",
          "Set up autonomous quality evaluator for client deliverables.",
          "Review watchdog health metrics daily in your Command Center."
        ]
      }
    ]
  }
};
