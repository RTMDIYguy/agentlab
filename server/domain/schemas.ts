import { z } from "zod";

export const workflowStepSchema = z.object({
  stepNumber: z
    .number()
    .describe("Sequence index of this step in the execution DAG"),
  type: z
    .enum(["trigger", "agent", "guardrail", "action", "destination"])
    .describe(
      "Step node type in the workflow graph. 'agent' runs an LLM step; 'guardrail' pauses the run for human approval; 'action' drafts a human-gated outbound payload; 'destination' delivers output."
    ),
  title: z.string().describe("Short descriptive title for the step"),
  detail: z
    .string()
    .describe("Operational specification and instructions for this step"),
  agentId: z
    .string()
    .uuid()
    .optional()
    .nullable()
    .describe(
      "Optional UUID of an existing agent row. Fake or invented ids are rejected here (CC-2026-09-25-007): non-UUID values used to reach workflow_steps.agent_id and crash the run on uuid binding. Omit when no specific agent applies."
    ),
});

export const workflowProposalSchema = z.object({
  id: z.string().describe("Unique proposal identifier, e.g. WFP-MKT-06-1024"),
  name: z.string().describe("Clear name of the synthesized workflow"),
  description: z
    .string()
    .describe("Summary of the workflow objective and business outcome"),
  departmentCode: z
    .string()
    .describe("Department code (e.g. mkt, sal, ful, fin, ops, cul, afc, hr)"),
  // CC-2026-09-25-011: optional-nullable. The model has no honest basis for
  // these numbers until runs exist; inventing "$0.02 / 12s" presented fiction
  // as fact. Omit rather than estimate; the client renders "not estimated".
  estimatedCostPerRun: z
    .number()
    .optional()
    .nullable()
    .describe(
      "Estimated cost in USD per execution run. OMIT unless the workflow reuses a connector with a known published price; never guess."
    ),
  estimatedLatencySeconds: z
    .number()
    .optional()
    .nullable()
    .describe(
      "Estimated latency in seconds for a complete workflow run. OMIT rather than guess."
    ),
  triggerType: z
    .string()
    .describe("Trigger mechanism (e.g. Webhook, Schedule, Manual, Event)"),
  guardrails: z
    .array(z.string())
    .describe(
      "List of governance and safety guardrails enforced on this workflow"
    ),
  steps: z.array(workflowStepSchema).describe("Ordered DAG execution nodes"),
  reply: z
    .string()
    .describe(
      "Natural language explanation of the DAG proposal, domain alignment, and governance justification"
    ),
});

export type WorkflowStep = z.infer<typeof workflowStepSchema>;
export type WorkflowProposal = z.infer<typeof workflowProposalSchema>;
