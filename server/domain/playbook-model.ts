export interface CanonicalPlaybookHandoff {
  sequence: number;
  fromWorkflowCode: string;
  toWorkflowCode: string;
  fromDepartmentCode: string;
  toDepartmentCode: string;
  triggerSignal: string;
  requiredPayload: string[];
  receivingOwner: string;
  approvalRequired: boolean;
  fallbackProtocol: string;
  stopCondition: string;
  evidenceRequired: string[];
}

export interface CanonicalPlaybook {
  id: string;
  name: string;
  description: string;
  ownerDepartmentCode: string;
  primaryOwner: string;
  approvalOwner: string;
  trigger: string;
  completionCriteria: string;
  stopConditions: string[];
  requiredInputs: string[];
  expectedOutputs: string[];
  evidenceRequirements: string[];
  handoffs: CanonicalPlaybookHandoff[];
}

/**
 * These journeys turn the existing relationship map into executable operating
 * contracts without changing the underlying workflow IDs or department model.
 */
export const CANONICAL_PLAYBOOKS: CanonicalPlaybook[] = [
  {
    id: "revenue-lead-to-sale",
    name: "Revenue Spine: Lead to Sale",
    description:
      "Moves qualified demand from content, outreach, events, and assessments into a governed sales opportunity.",
    ownerDepartmentCode: "mkt",
    primaryOwner: "Marketing owner",
    approvalOwner: "Robert / Sales owner",
    trigger:
      "A lead reaches MQL status through MKT-01, MKT-02, MKT-03, MKT-05, or MKT-09.",
    completionCriteria:
      "A sales-ready opportunity is accepted by SAL-01 with source, fit, offer, owner, and next action recorded.",
    stopConditions: [
      "Lead opts out",
      "No valid contact or consent",
      "No fit after review",
      "Required handoff data is missing",
    ],
    requiredInputs: [
      "Lead identity and consent",
      "Source campaign or event",
      "Offer or problem signal",
      "Qualification evidence",
    ],
    expectedOutputs: [
      "Sales-ready opportunity",
      "Next action and due date",
      "Rejected or nurture disposition when not sales-ready",
    ],
    evidenceRequirements: [
      "Qualification record",
      "Handoff timestamp",
      "Owner assignment",
      "Disposition reason",
    ],
    handoffs: [
      {
        sequence: 1,
        fromWorkflowCode: "MKT-06",
        toWorkflowCode: "MKT-01",
        fromDepartmentCode: "mkt",
        toDepartmentCode: "mkt",
        triggerSignal: "Content or authority signal produces a response.",
        requiredPayload: ["lead identity", "content source", "CTA"],
        receivingOwner: "Marketing owner",
        approvalRequired: false,
        fallbackProtocol:
          "Record the signal in the marketing tracker and assign manual follow-up within one business day.",
        stopCondition: "No consent or unusable contact data.",
        evidenceRequired: ["source record", "response timestamp"],
      },
      {
        sequence: 2,
        fromWorkflowCode: "MKT-01",
        toWorkflowCode: "MKT-03",
        fromDepartmentCode: "mkt",
        toDepartmentCode: "mkt",
        triggerSignal:
          "Lead expresses a problem, diagnostic, or assessment interest.",
        requiredPayload: ["lead identity", "problem statement", "source"],
        receivingOwner: "Marketing qualification owner",
        approvalRequired: false,
        fallbackProtocol:
          "Send the manual diagnostic link and log the pending response.",
        stopCondition:
          "Lead declines diagnostic or cannot be reached after defined follow-up.",
        evidenceRequired: ["qualification status", "diagnostic invite"],
      },
      {
        sequence: 3,
        fromWorkflowCode: "MKT-03",
        toWorkflowCode: "MKT-02",
        fromDepartmentCode: "mkt",
        toDepartmentCode: "mkt",
        triggerSignal: "Assessment result requires nurture before sales.",
        requiredPayload: ["assessment result", "recommended next step"],
        receivingOwner: "Nurture owner",
        approvalRequired: false,
        fallbackProtocol:
          "Place the lead in the approved manual follow-up queue.",
        stopCondition: "Opt-out or invalid contact.",
        evidenceRequired: ["assessment result", "sequence enrollment"],
      },
      {
        sequence: 4,
        fromWorkflowCode: "MKT-01",
        toWorkflowCode: "SAL-01",
        fromDepartmentCode: "mkt",
        toDepartmentCode: "sal",
        triggerSignal:
          "Lead is confirmed as MQL and ready for a commercial conversation.",
        requiredPayload: [
          "lead identity",
          "fit evidence",
          "offer interest",
          "next action",
        ],
        receivingOwner: "Sales owner",
        approvalRequired: true,
        fallbackProtocol:
          "Marketing sends a structured handoff message and creates a manual sales task.",
        stopCondition: "Sales rejects fit or handoff lacks required fields.",
        evidenceRequired: [
          "MQL decision",
          "sales acceptance",
          "assigned owner",
        ],
      },
    ],
  },
  {
    id: "sale-to-delivery",
    name: "Revenue Spine: Sale to Delivery",
    description:
      "Converts an executed agreement into an owned, funded, and ready-to-run delivery engagement.",
    ownerDepartmentCode: "sal",
    primaryOwner: "Account Manager",
    approvalOwner: "Robert / Finance owner",
    trigger: "SAL-04 confirms the contract is fully executed.",
    completionCriteria:
      "FUL-02 has accepted the onboarding packet, kickoff owner, first milestone, and delivery location.",
    stopConditions: [
      "Unsigned agreement",
      "Missing payment terms",
      "No delivery owner",
      "Security or access requirements unresolved",
    ],
    requiredInputs: [
      "Signed agreement",
      "Scope and milestones",
      "Payment schedule",
      "Client contacts",
      "Required access",
    ],
    expectedOutputs: [
      "Onboarding packet",
      "Delivery workspace",
      "Kickoff date",
      "Finance invoice record",
    ],
    evidenceRequirements: [
      "Signed agreement reference",
      "Onboarding checklist",
      "Workspace link",
      "Invoice or payment schedule",
    ],
    handoffs: [
      {
        sequence: 1,
        fromWorkflowCode: "SAL-04",
        toWorkflowCode: "SAL-02",
        fromDepartmentCode: "sal",
        toDepartmentCode: "sal",
        triggerSignal: "Contract is fully executed.",
        requiredPayload: [
          "contract reference",
          "scope",
          "contacts",
          "payment schedule",
        ],
        receivingOwner: "Account Manager",
        approvalRequired: true,
        fallbackProtocol:
          "Create the onboarding checklist manually and notify the account manager.",
        stopCondition: "Contract or scope is incomplete.",
        evidenceRequired: ["signed contract", "acceptance timestamp"],
      },
      {
        sequence: 2,
        fromWorkflowCode: "SAL-02",
        toWorkflowCode: "FUL-02",
        fromDepartmentCode: "sal",
        toDepartmentCode: "ful",
        triggerSignal:
          "Client onboarding packet and first success checkpoint are ready.",
        requiredPayload: [
          "client profile",
          "scope",
          "milestones",
          "folder link",
          "kickoff date",
        ],
        receivingOwner: "Fulfillment owner",
        approvalRequired: true,
        fallbackProtocol:
          "Use the manual onboarding checklist and schedule a handoff meeting.",
        stopCondition: "No delivery owner or missing access.",
        evidenceRequired: [
          "completed checklist",
          "handoff acceptance",
          "kickoff record",
        ],
      },
      {
        sequence: 3,
        fromWorkflowCode: "SAL-02",
        toWorkflowCode: "FIN-03",
        fromDepartmentCode: "sal",
        toDepartmentCode: "fin",
        triggerSignal:
          "Contract includes an invoice or recurring payment schedule.",
        requiredPayload: [
          "client ID",
          "invoice terms",
          "amount",
          "due dates",
          "SKU",
        ],
        receivingOwner: "Finance owner",
        approvalRequired: true,
        fallbackProtocol:
          "Create the invoice row in the owned finance tracker and flag it for review.",
        stopCondition: "Pricing, SKU, or payment terms are missing.",
        evidenceRequired: [
          "invoice record",
          "payment schedule",
          "finance acceptance",
        ],
      },
    ],
  },
  {
    id: "delivery-to-retention",
    name: "Revenue Spine: Delivery to Retention",
    description:
      "Turns delivery health, support outcomes, and measured value into aftercare and renewal signals.",
    ownerDepartmentCode: "ful",
    primaryOwner: "Fulfillment owner",
    approvalOwner: "Account Manager",
    trigger:
      "A delivery milestone, support resolution, or client health change is recorded.",
    completionCriteria:
      "The client has a current health status and any renewal, escalation, or advocacy action is assigned.",
    stopConditions: [
      "No current client health evidence",
      "Unresolved critical issue",
      "Client requests no contact",
    ],
    requiredInputs: [
      "Client health data",
      "Milestone or support outcome",
      "Engagement history",
      "Open issues",
    ],
    expectedOutputs: [
      "Updated health score",
      "Escalation or recovery task",
      "Renewal/expansion signal",
      "Advocacy candidate",
    ],
    evidenceRequirements: [
      "Health score change",
      "Issue or milestone record",
      "Owner assignment",
      "Client communication",
    ],
    handoffs: [
      {
        sequence: 1,
        fromWorkflowCode: "FUL-03",
        toWorkflowCode: "FUL-02",
        fromDepartmentCode: "ful",
        toDepartmentCode: "ful",
        triggerSignal:
          "Support issue reveals a health change or escalation risk.",
        requiredPayload: [
          "issue summary",
          "severity",
          "client",
          "resolution status",
        ],
        receivingOwner: "Client success owner",
        approvalRequired: false,
        fallbackProtocol:
          "Create a manual escalation task and notify the account manager.",
        stopCondition: "Critical issue remains unresolved.",
        evidenceRequired: ["ticket record", "severity", "resolution note"],
      },
      {
        sequence: 2,
        fromWorkflowCode: "FUL-02",
        toWorkflowCode: "FUL-05",
        fromDepartmentCode: "ful",
        toDepartmentCode: "ful",
        triggerSignal: "Milestone or health review is complete.",
        requiredPayload: [
          "health score",
          "milestone status",
          "outcomes",
          "open risks",
        ],
        receivingOwner: "Analytics owner",
        approvalRequired: false,
        fallbackProtocol: "Update the client health and KPI tracker manually.",
        stopCondition: "Required outcome metrics are unavailable.",
        evidenceRequired: ["health snapshot", "milestone evidence"],
      },
      {
        sequence: 3,
        fromWorkflowCode: "FUL-05",
        toWorkflowCode: "AFC-03",
        fromDepartmentCode: "ful",
        toDepartmentCode: "afc",
        triggerSignal: "Measured value supports renewal or expansion.",
        requiredPayload: [
          "outcome summary",
          "renewal date",
          "client health",
          "recommended offer",
        ],
        receivingOwner: "AfterCare owner",
        approvalRequired: true,
        fallbackProtocol:
          "Send a structured renewal alert to the account manager.",
        stopCondition: "Client is at risk or evidence is insufficient.",
        evidenceRequired: [
          "value report",
          "renewal signal",
          "approval decision",
        ],
      },
    ],
  },
  {
    id: "finance-control-loop",
    name: "Finance Control Loop",
    description:
      "Connects pricing, invoicing, payment status, accounting review, and commercial escalation.",
    ownerDepartmentCode: "fin",
    primaryOwner: "Finance owner",
    approvalOwner: "Robert",
    trigger:
      "A price, expense, invoice, payment, or month-end event changes financial state.",
    completionCriteria:
      "The owned finance tracker reflects the event and any required commercial action has an owner and due date.",
    stopConditions: [
      "Unknown transaction",
      "Missing SKU or account code",
      "Unapproved pricing change",
      "Unreconciled variance",
    ],
    requiredInputs: [
      "Transaction or expense record",
      "Client/project ID",
      "SKU/account code",
      "Amount and due date",
    ],
    expectedOutputs: [
      "Updated finance tracker",
      "Variance or overdue alert",
      "Approved escalation",
      "Month-end evidence",
    ],
    evidenceRequirements: [
      "Source transaction",
      "Tracker row",
      "Reconciliation note",
      "Approval record",
    ],
    handoffs: [
      {
        sequence: 1,
        fromWorkflowCode: "FIN-01",
        toWorkflowCode: "SAL-01",
        fromDepartmentCode: "fin",
        toDepartmentCode: "sal",
        triggerSignal:
          "Approved price or cost basis is ready for proposal use.",
        requiredPayload: ["offer", "SKU", "price", "margin floor"],
        receivingOwner: "Sales owner",
        approvalRequired: true,
        fallbackProtocol:
          "Send the approved pricing record manually and block proposal use until acknowledged.",
        stopCondition: "Margin or approval is missing.",
        evidenceRequired: ["pricing approval", "SKU mapping"],
      },
      {
        sequence: 2,
        fromWorkflowCode: "FIN-03",
        toWorkflowCode: "SAL-04",
        fromDepartmentCode: "fin",
        toDepartmentCode: "sal",
        triggerSignal: "Receivable is overdue or payment status changes.",
        requiredPayload: [
          "invoice ID",
          "client",
          "amount",
          "days overdue",
          "last contact",
        ],
        receivingOwner: "Sales owner",
        approvalRequired: false,
        fallbackProtocol:
          "Create a manual follow-up task and use the approved collections template.",
        stopCondition: "Payment dispute or legal hold is active.",
        evidenceRequired: ["invoice status", "follow-up task"],
      },
      {
        sequence: 3,
        fromWorkflowCode: "FIN-04",
        toWorkflowCode: "AFC-03",
        fromDepartmentCode: "fin",
        toDepartmentCode: "afc",
        triggerSignal:
          "Month-end reporting changes renewal, MRR, or contract visibility.",
        requiredPayload: ["revenue summary", "MRR", "renewals", "receivables"],
        receivingOwner: "AfterCare owner",
        approvalRequired: false,
        fallbackProtocol:
          "Publish the month-end summary to the shared operating brief.",
        stopCondition: "Close is incomplete or data remains unreconciled.",
        evidenceRequired: ["month-end report", "close status"],
      },
    ],
  },
  {
    id: "proof-and-referral-loop",
    name: "Proof and Referral Loop",
    description:
      "Returns validated delivery outcomes and aftercare signals to marketing for proof, referrals, and future demand.",
    ownerDepartmentCode: "ful",
    primaryOwner: "Fulfillment owner",
    approvalOwner: "Marketing owner / Robert",
    trigger:
      "A positive outcome, testimonial candidate, referral, or community story is identified.",
    completionCriteria:
      "Proof is captured with consent, stored with source evidence, and made available to the appropriate marketing workflow.",
    stopConditions: [
      "No consent",
      "Unverified claim",
      "Sensitive client information exposed",
      "Client requests removal",
    ],
    requiredInputs: [
      "Outcome evidence",
      "Client consent",
      "Source context",
      "Approved claim boundaries",
    ],
    expectedOutputs: [
      "Testimonial or case-study candidate",
      "Referral record",
      "Content input",
      "Consent status",
    ],
    evidenceRequirements: [
      "Consent record",
      "Source artifact",
      "Approval status",
      "Publication destination",
    ],
    handoffs: [
      {
        sequence: 1,
        fromWorkflowCode: "FUL-04",
        toWorkflowCode: "MKT-04",
        fromDepartmentCode: "ful",
        toDepartmentCode: "mkt",
        triggerSignal:
          "Client feedback or testimonial candidate is approved for review.",
        requiredPayload: [
          "client",
          "quote or result",
          "consent status",
          "source",
        ],
        receivingOwner: "Marketing owner",
        approvalRequired: true,
        fallbackProtocol:
          "Store the candidate in the proof tracker and request consent manually.",
        stopCondition: "Consent is absent or claim cannot be verified.",
        evidenceRequired: ["feedback source", "consent", "approval"],
      },
      {
        sequence: 2,
        fromWorkflowCode: "AFC-04",
        toWorkflowCode: "MKT-09",
        fromDepartmentCode: "afc",
        toDepartmentCode: "mkt",
        triggerSignal:
          "Community story or event signal is suitable for a future roundtable.",
        requiredPayload: [
          "story",
          "audience",
          "event relevance",
          "contact permission",
        ],
        receivingOwner: "Event marketing owner",
        approvalRequired: true,
        fallbackProtocol:
          "Add the signal to the event planning queue for manual triage.",
        stopCondition: "No permission or no relevant event lane.",
        evidenceRequired: ["community record", "permission", "event decision"],
      },
      {
        sequence: 3,
        fromWorkflowCode: "MKT-04",
        toWorkflowCode: "MKT-06",
        fromDepartmentCode: "mkt",
        toDepartmentCode: "mkt",
        triggerSignal: "Proof asset is approved for content use.",
        requiredPayload: [
          "approved proof",
          "claim limits",
          "CTA",
          "source link",
        ],
        receivingOwner: "Content owner",
        approvalRequired: true,
        fallbackProtocol:
          "Queue the proof for manual editorial review before publication.",
        stopCondition: "Proof is stale, withdrawn, or unsupported.",
        evidenceRequired: [
          "editorial approval",
          "source link",
          "publication record",
        ],
      },
    ],
  },
];
