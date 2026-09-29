/**
 * Validation run trigger (CC-2026-09-25-014 verification).
 * Inserts a pending run of the RoundTable Post-Event workflow with the REAL
 * URC-Phase1-CRM-Lite tracker rows Robert provided as ingest data. The dev
 * server's execution-engine poller (5s) picks it up exactly like a
 * triggerRun insert. No attendee fields are invented: only sheet facts.
 */
import postgres from "postgres";
import crypto from "node:crypto";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not present — run via infisical.");
  process.exit(1);
}
const sql = postgres(url, { prepare: false, max: 1 });

const WORKFLOW_ID = "c93d4c1c-891a-4894-8fe8-a23efadea0bb";
const WORKSPACE_ID = "00000000-0000-0000-0000-000000000001";

// Verbatim from the URC-Phase1-CRM-Lite sheet (Sales tab), 2026-09-27 export.
const attendees = [
  { event_id: "FR-001", contact_name: "Sandra Hill", company: "Apex Digital", email: "agentlab.tech@gmail.com", service_line: "AI Agency Build-Out", hubspot_sync: "Done", deal_stage: "Proposal Sent", deal_value_usd: 12500, source: "LinkedIn_Connect", notes: "Follow up Thurs" },
  { event_id: "FR-001", contact_name: "Terry Walsh", company: "Bloom & Co", email: null, service_line: "Workflow Automation", hubspot_sync: "no", deal_stage: "Negotiation", deal_value_usd: 8200, source: "LinkedIn_Followup", notes: "Counter at $7500" },
  { event_id: "FR-002", contact_name: "Priya Patel", company: "Nexus Media", email: null, service_line: "Content Strategy", hubspot_sync: null, deal_stage: "Discovery", deal_value_usd: 5000, source: "Book_Landing", notes: "Sending proposal Mon" },
  { event_id: "FR-002", contact_name: "Dale Thomas", company: "BlueSky Corp", email: null, service_line: "Lead Generation", hubspot_sync: null, deal_stage: "Contract Sent", deal_value_usd: 9800, source: "Email", notes: "Awaiting signature" },
  { event_id: "FR-002", contact_name: "Monica Burns", company: "RealEdge LLC", email: null, service_line: "Full Onboarding", hubspot_sync: null, deal_stage: "Closed-Won", deal_value_usd: 15000, source: "Phone_Voicemail", notes: "Won! Kickoff 3/15" },
  { event_id: "BC-001", contact_name: "David Kim", company: "TruePath Inc", email: null, service_line: "AI Agency Build-Out", hubspot_sync: null, deal_stage: "Lead", deal_value_usd: 0, source: "Referral", notes: "Initial contact only" },
  { event_id: "BC-001", contact_name: "Alicia Ford", company: "Spark Studios", email: null, service_line: "Workflow Automation", hubspot_sync: null, deal_stage: "Proposal Sent", deal_value_usd: 6500, source: "Referral", notes: "Deck in review" },
  { event_id: "FR-003", contact_name: "Ivan Lopez", company: "Greenfield Co", email: null, service_line: "Content Strategy", hubspot_sync: null, deal_stage: "Closed-Lost", deal_value_usd: 4500, source: "Indy_Chapter", notes: "Budget too low" },
  { event_id: "FR003", contact_name: "Tamara Webb", company: "Crest Capital", email: null, service_line: "Lead Generation", hubspot_sync: null, deal_stage: "Discovery", deal_value_usd: 11000, source: "Email", notes: "Needs CFO approval" },
  { event_id: "FR003", contact_name: "Eric James", company: "Nova Health", email: null, service_line: "Full Onboarding", hubspot_sync: null, deal_stage: "Negotiation", deal_value_usd: 18000, source: "Referral", notes: "Payment plan discuss" },
];

const initialContext = {
  task: "Founder RoundTable Post-Event Engagement & Nurture — validation run of the CC-2026-09-25-014 HubSpot draft fix.",
  event_data_source: "URC-Phase1-CRM-Lite Google Sheet (tracker rows provided by Robert, exported 2026-09-27). Event IDs: FR-*/FR00x = Founder RoundTable series, BC-* = Bootstrapper Capital series.",
  attendees,
  data_limitations: [
    "No chat logs, Q&A transcripts, or per-session engagement metrics were captured for these events.",
    "Engagement signals available: source channel, deal stage, and tracker notes only.",
    "Only ONE attendee has a recorded email (Sandra Hill / agentlab.tech@gmail.com).",
    "Do NOT invent email addresses, chat activity, or Q&A participation. Segment and score using tracker fields only; where data is absent, say so.",
  ],
  source: "manual_fix_validation",
};

const runId = crypto.randomUUID();

try {
  await sql`
    insert into workflow_runs (id, workspace_id, workflow_id, status, trigger_source, initial_context, created_at, updated_at)
    values (${runId}, ${WORKSPACE_ID}, ${WORKFLOW_ID}, ${"pending"}, ${"manual"}, ${sql.json(initialContext)}, ${new Date()}, ${new Date()})`;
  console.log(JSON.stringify({ triggered: true, runId, workflowId: WORKFLOW_ID, attendees: attendees.length }, null, 2));
} catch (err) {
  console.error("Trigger failed:", err?.message ?? err);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
