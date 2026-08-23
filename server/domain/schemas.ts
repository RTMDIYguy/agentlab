import { z } from 'zod';

export const workflowStepSchema = z.object({
  stepNumber: z.number().describe('Sequence index of this step in the execution DAG'),
  type: z.enum(['trigger', 'agent', 'guardrail', 'destination']).describe('Step node type in the workflow graph'),
  title: z.string().describe('Short descriptive title for the step'),
  detail: z.string().describe('Operational specification and instructions for this step'),
  agentId: z.string().optional().describe('Optional ID of the assigned specialized agent')
});

export const workflowProposalSchema = z.object({
  id: z.string().describe('Unique proposal identifier, e.g. WFP-MKT-06-1024'),
  name: z.string().describe('Clear name of the synthesized workflow'),
  description: z.string().describe('Summary of the workflow objective and business outcome'),
  departmentCode: z.string().describe('Department code (e.g. mkt, sal, ful, fin, ops, cul, afc, hr)'),
  estimatedCostPerRun: z.number().describe('Estimated cost in USD per execution run'),
  estimatedLatencySeconds: z.number().describe('Estimated latency in seconds for complete workflow run'),
  triggerType: z.string().describe('Trigger mechanism (e.g. Webhook, Schedule, Manual, Event)'),
  guardrails: z.array(z.string()).describe('List of governance and safety guardrails enforced on this workflow'),
  steps: z.array(workflowStepSchema).describe('Ordered DAG execution nodes'),
  reply: z.string().describe('Natural language explanation of the DAG proposal, domain alignment, and governance justification')
});

export type WorkflowStep = z.infer<typeof workflowStepSchema>;
export type WorkflowProposal = z.infer<typeof workflowProposalSchema>;
