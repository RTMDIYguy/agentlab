/**
 * Agent Lab OS → HubSpot contact property contract.
 *
 * Sources of truth, reconciled:
 *  1. "Agent Lab OS to HubSpot Lead Handoff Blueprint" (Breeze artifact, 2026-09-23,
 *     archived at Prospect Docs/) — the full property map, MVP field list, and
 *     phased handoff architecture.
 *  2. agentlabhs/agentlab-signup-to-hubspot.code.json — the committed n8n intake
 *     contract whose custom property names (signup_source, product_of_interest,
 *     offer_of_interest, activation_status, first_*, follow_up_*) stay canonical
 *     for continuity with anything already synced under them.
 *
 * Blueprint phases (we implement Phase 1 now; the contract below covers Phases 1-2):
 *   Phase 1: lead record handoff — identity + source
 *   Phase 2: qualification & routing — intent, booking status, handoff path
 *   Phase 3: summarized communication context (later)
 *   Phase 4: task/deal automation (later)
 *
 * Mapping doctrine: fields the OS collects flow through as-is. Fields the OS
 * does not collect yet are omitted — never defaulted to invented values — so
 * HubSpot never receives fabricated signal.
 */

export interface HubSpotPropertyDef {
  name: string;
  label: string;
  type: "string" | "bool" | "number" | "date" | "datetime" | "enumeration";
  fieldType: "text" | "textarea" | "booleancheckbox" | "date" | "select" | "number";
  /** Dropdown options for enumeration fields. */
  options?: string[];
  custom: boolean;
  group: "agentlab_os" | "agentlab_signup";
  /** Part of the blueprint's minimum viable first version. */
  mvp: boolean;
}

const GROUP_OS = "agentlab_os" as const;
const GROUP_SIGNUP = "agentlab_signup" as const;

export const HUBSPOT_PROPERTY_GROUP_DEFS = [
  { name: GROUP_OS, label: "Agent Lab OS" },
  { name: GROUP_SIGNUP, label: "Agent Lab Signup" },
] as const;

export const HUBSPOT_CONTACT_PROPERTIES: HubSpotPropertyDef[] = [
  // ---- Standard HubSpot identity fields (blueprint: "use standard where possible")
  { name: "email", label: "Email", type: "string", fieldType: "text", custom: false, group: GROUP_OS, mvp: true },
  { name: "firstname", label: "First Name", type: "string", fieldType: "text", custom: false, group: GROUP_OS, mvp: true },
  { name: "lastname", label: "Last Name", type: "string", fieldType: "text", custom: false, group: GROUP_OS, mvp: true },
  { name: "company", label: "Company", type: "string", fieldType: "text", custom: false, group: GROUP_OS, mvp: true },
  { name: "phone", label: "Phone Number", type: "string", fieldType: "text", custom: false, group: GROUP_OS, mvp: true },
  { name: "website", label: "Website URL", type: "string", fieldType: "text", custom: false, group: GROUP_OS, mvp: false },
  { name: "jobtitle", label: "Job Title", type: "string", fieldType: "text", custom: false, group: GROUP_OS, mvp: false },
  { name: "industry", label: "Industry", type: "string", fieldType: "text", custom: false, group: GROUP_OS, mvp: false },
  { name: "lifecyclestage", label: "Lifecycle Stage", type: "enumeration", fieldType: "select", custom: false, group: GROUP_OS, mvp: true },
  { name: "hs_lead_status", label: "Lead Status", type: "enumeration", fieldType: "select", custom: false, group: GROUP_OS, mvp: false },

  // ---- Source & attribution (blueprint Part 1; signup_* names kept from the n8n contract)
  { name: "lead_source_system", label: "Lead Source System", type: "enumeration", fieldType: "select", options: ["Agent Lab OS"], custom: true, group: GROUP_OS, mvp: true },
  { name: "signup_source", label: "Signup Source", type: "string", fieldType: "text", custom: true, group: GROUP_SIGNUP, mvp: true },
  { name: "agentlab_source_channel", label: "Agent Lab Source Channel", type: "enumeration", fieldType: "select", options: ["website form", "chat", "sms", "video consult", "intake form", "newsletter", "direct"], custom: true, group: GROUP_OS, mvp: true },
  { name: "agentlab_entry_point", label: "Agent Lab Entry Point", type: "string", fieldType: "text", custom: true, group: GROUP_OS, mvp: false },
  { name: "agentlab_campaign", label: "Agent Lab Campaign/Source", type: "string", fieldType: "text", custom: true, group: GROUP_OS, mvp: false },

  // ---- Offer & product interest
  { name: "product_of_interest", label: "Product of Interest", type: "string", fieldType: "text", custom: true, group: GROUP_SIGNUP, mvp: true },
  { name: "offer_of_interest", label: "Offer of Interest", type: "string", fieldType: "text", custom: true, group: GROUP_SIGNUP, mvp: true },

  // ---- Qualification & intent (blueprint Phase 2 fields; populated as the OS collects them)
  { name: "agentlab_intent_level", label: "Agent Lab Intent Level", type: "enumeration", fieldType: "select", options: ["Low", "Medium", "High"], custom: true, group: GROUP_OS, mvp: true },
  { name: "agentlab_priority_score", label: "Agent Lab Priority Score", type: "number", fieldType: "number", custom: true, group: GROUP_OS, mvp: false },
  { name: "agentlab_qualification_reason", label: "Qualification Reason", type: "string", fieldType: "textarea", custom: true, group: GROUP_OS, mvp: false },
  { name: "agentlab_sales_ready", label: "Sales Ready", type: "bool", fieldType: "booleancheckbox", custom: true, group: GROUP_OS, mvp: false },

  // ---- Communication & booking
  { name: "preferred_contact_method", label: "Preferred Contact Method", type: "enumeration", fieldType: "select", options: ["email", "call", "sms", "video"], custom: true, group: GROUP_OS, mvp: true },
  { name: "sms_consent_status", label: "SMS Consent Status", type: "enumeration", fieldType: "select", options: ["consented", "not_consented", "unknown"], custom: true, group: GROUP_OS, mvp: true },
  { name: "agentlab_meeting_requested", label: "Meeting Requested", type: "bool", fieldType: "booleancheckbox", custom: true, group: GROUP_OS, mvp: true },
  { name: "agentlab_meeting_type", label: "Meeting Type Requested", type: "enumeration", fieldType: "select", options: ["15-minute consult", "demo request", "workflow discovery call", "VIP consult"], custom: true, group: GROUP_OS, mvp: false },
  { name: "agentlab_booking_status", label: "Booking Status", type: "enumeration", fieldType: "select", options: ["requested", "link_sent", "booked", "no_show"], custom: true, group: GROUP_OS, mvp: true },
  { name: "agentlab_last_comm_channel", label: "Last Communication Channel", type: "enumeration", fieldType: "select", options: ["email", "sms", "chat", "video", "call"], custom: true, group: GROUP_OS, mvp: false },
  { name: "agentlab_last_comm_at", label: "Last Communication Timestamp", type: "datetime", fieldType: "date", custom: true, group: GROUP_OS, mvp: false },

  // ---- Product & use case
  { name: "agentlab_primary_use_case", label: "Primary Use Case", type: "enumeration", fieldType: "select", options: ["lead generation", "workflow automation", "client intake", "operations automation", "other"], custom: true, group: GROUP_OS, mvp: true },
  { name: "agentlab_stated_challenge", label: "Stated Challenge", type: "string", fieldType: "textarea", custom: true, group: GROUP_OS, mvp: false },
  { name: "agentlab_decision_timeline", label: "Decision Timeline", type: "enumeration", fieldType: "select", options: ["immediate", "30 days", "90 days", "exploring"], custom: true, group: GROUP_OS, mvp: false },

  // ---- Operational handoff (keeps leads from getting stuck between systems)
  { name: "agentlab_lead_id", label: "Agent Lab Lead ID", type: "string", fieldType: "text", custom: true, group: GROUP_OS, mvp: true },
  { name: "agentlab_sync_status", label: "Agent Lab Sync Status", type: "enumeration", fieldType: "select", options: ["new", "updated", "failed"], custom: true, group: GROUP_OS, mvp: true },
  { name: "agentlab_last_sync_at", label: "Last Sync Timestamp", type: "datetime", fieldType: "date", custom: true, group: GROUP_OS, mvp: true },
  { name: "agentlab_handoff_path", label: "Handoff Path", type: "enumeration", fieldType: "select", options: ["nurture", "direct sales", "book meeting", "manual review"], custom: true, group: GROUP_OS, mvp: false },
  { name: "agentlab_intake_summary", label: "Agent Lab Intake Summary", type: "string", fieldType: "textarea", custom: true, group: GROUP_OS, mvp: true },

  // ---- Signup lifecycle (from the committed n8n intake contract)
  { name: "agentlab_account_created", label: "AgentLab Account Created", type: "bool", fieldType: "booleancheckbox", custom: true, group: GROUP_SIGNUP, mvp: false },
  { name: "agentlab_signup_date", label: "AgentLab Signup Date", type: "date", fieldType: "date", custom: true, group: GROUP_SIGNUP, mvp: false },
  { name: "signup_counted", label: "Signup Counted", type: "bool", fieldType: "booleancheckbox", custom: true, group: GROUP_SIGNUP, mvp: false },
  { name: "signup_page_or_funnel", label: "Signup Page or Funnel", type: "string", fieldType: "text", custom: true, group: GROUP_SIGNUP, mvp: false },
  { name: "audience_bucket", label: "Audience Bucket", type: "string", fieldType: "text", custom: true, group: GROUP_SIGNUP, mvp: false },
  { name: "activation_status", label: "Activation Status", type: "enumeration", fieldType: "select", options: ["not_activated", "activating", "activated"], custom: true, group: GROUP_SIGNUP, mvp: false },
  { name: "first_intended_use_case", label: "First Intended Use Case", type: "string", fieldType: "text", custom: true, group: GROUP_SIGNUP, mvp: false },
  { name: "first_key_action_completed", label: "First Key Action Completed", type: "string", fieldType: "text", custom: true, group: GROUP_SIGNUP, mvp: false },
  { name: "feedback_requested", label: "Feedback Requested", type: "bool", fieldType: "booleancheckbox", custom: true, group: GROUP_SIGNUP, mvp: false },
  { name: "feedback_received", label: "Feedback Received", type: "bool", fieldType: "booleancheckbox", custom: true, group: GROUP_SIGNUP, mvp: false },
  { name: "first_blocker", label: "First Blocker", type: "string", fieldType: "text", custom: true, group: GROUP_SIGNUP, mvp: false },
  { name: "follow_up_status", label: "Follow-up Status", type: "string", fieldType: "text", custom: true, group: GROUP_SIGNUP, mvp: false },
  { name: "follow_up_date", label: "Follow-up Date", type: "date", fieldType: "date", custom: true, group: GROUP_SIGNUP, mvp: false },
];

export type ContactSubmissionLike = {
  id?: string;
  name?: string | null;
  email: string;
  company?: string | null;
  painPoint?: string | null;
  interest?: string | null;
  subject?: string | null;
  message?: string | null;
  source?: string | null;
  createdAt?: Date | string | null;
};

/** Splits a display name honestly: first token = first name, remainder = last name. */
export function splitName(name?: string | null): { firstname?: string; lastname?: string } {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return {};
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { firstname: parts[0] };
  return { firstname: parts[0], lastname: parts.slice(1).join(" ") };
}

/** Short intake summary built from the submission's own real content. */
function buildIntakeSummary(s: ContactSubmissionLike): string | undefined {
  const parts: string[] = [];
  if (s.subject) parts.push(`Re: ${s.subject}`);
  if (s.interest) parts.push(`Interested in ${s.interest}`);
  if (s.painPoint) parts.push(`Pain point: ${s.painPoint}`);
  if (s.message) parts.push(s.message.slice(0, 400));
  if (s.source) parts.push(`(source: ${s.source})`);
  if (parts.length === 0) return undefined;
  return parts.join(" — ").slice(0, 2000);
}

/**
 * Phase-1 mapping: a contact submission → HubSpot properties per the blueprint.
 * Omits (never invents) fields the OS does not collect. lifecyclestage `lead`
 * is a real classification per the blueprint's own definition ("identified
 * prospect with a known source and need").
 */
export function mapSubmissionToHubSpotProperties(
  submission: ContactSubmissionLike
): Record<string, string> {
  const properties: Record<string, string> = {
    email: submission.email,
    // Blueprint: every record is stamped with source system + lifecycle
    lead_source_system: "Agent Lab OS",
    lifecyclestage: "lead",
  };

  const name = splitName(submission.name);
  if (name.firstname) properties.firstname = name.firstname;
  if (name.lastname) properties.lastname = name.lastname;
  if (submission.company) properties.company = submission.company;

  // Source & attribution (real values only)
  if (submission.source) {
    properties.signup_source = submission.source;
    properties.agentlab_source_channel = normalizeChannel(submission.source);
  }

  // Offer / product interest
  if (submission.interest) properties.product_of_interest = submission.interest;
  if (submission.subject) properties.offer_of_interest = submission.subject;

  // Intent fields the OS actually collects today
  if (submission.painPoint) properties.agentlab_stated_challenge = submission.painPoint;

  // Operational handoff stamps
  if (submission.id) properties.agentlab_lead_id = submission.id;
  if (submission.createdAt) {
    properties.agentlab_signup_date = new Date(submission.createdAt)
      .toISOString()
      .slice(0, 10);
  }

  const summary = buildIntakeSummary(submission);
  if (summary) properties.agentlab_intake_summary = summary;

  return properties;
}

/** Maps a free-form OS source string into the blueprint's channel dropdown. */
export function normalizeChannel(source: string): string {
  const s = source.toLowerCase().trim();
  if (s.includes("chat") || s.includes("messenger")) return "chat";
  if (s.includes("sms") || s.includes("text")) return "sms";
  if (s.includes("video") || s.includes("consult")) return "video consult";
  if (s.includes("newsletter") || s.includes("email")) return "newsletter";
  if (s.includes("intake")) return "intake form";
  return "website form";
}

/** Detects HubSpot property-validation errors so logs name the missing property. */
export function extractHubSpotPropertyErrors(body: string): string[] {
  try {
    const parsed = JSON.parse(body) as {
      errors?: Array<{ message?: string; context?: { property?: string } }>;
      correlationId?: string;
    };
    const out: string[] = [];
    if (parsed?.correlationId) out.push(`correlationId=${parsed.correlationId}`);
    for (const err of parsed?.errors ?? []) {
      if (err?.context?.property) {
        out.push(`property "${err.context.property}": ${err.message ?? "invalid"}`);
      } else if (err?.message) {
        out.push(err.message);
      }
    }
    return out;
  } catch {
    return [];
  }
}
