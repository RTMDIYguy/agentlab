import { 
  pgTable, 
  uuid, 
  varchar, 
  text, 
  integer, 
  numeric, 
  boolean, 
  timestamp, 
  jsonb,
  uniqueIndex,
  index
} from 'drizzle-orm/pg-core';
import { type InferSelectModel, type InferInsertModel, relations } from 'drizzle-orm';

// ==============================================================================
// 1. WORKSPACES (Tenants)
// ==============================================================================
export const workspaces = pgTable('workspaces', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 128 }).notNull(),
  slug: varchar('slug', { length: 64 }).notNull().unique(),
  hardMonthlyBudget: numeric('hard_monthly_budget', { precision: 10, scale: 2 }).notNull().default('500.00'),
  autoPauseThresholdEnabled: boolean('auto_pause_threshold_enabled').notNull().default(true),
  piiRedactionEnabled: boolean('pii_redaction_enabled').notNull().default(true),
  saifEnforcementEnabled: boolean('saif_enforcement_enabled').notNull().default(true),
  auditRetentionDays: integer('audit_retention_days').notNull().default(90),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_workspaces_slug').on(table.slug)
]);

// ==============================================================================
// 2. USERS
// ==============================================================================
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 128 }).notNull(),
  role: varchar('role', { length: 32 }).notNull().default('operator'), // 'owner' | 'admin' | 'operator' | 'auditor'
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('uq_workspace_user_email').on(table.workspaceId, table.email),
  index('idx_users_workspace').on(table.workspaceId),
  index('idx_users_email').on(table.email)
]);

// ==============================================================================
// 3. AGENTS (Autonomous Runtime Nodes)
// ==============================================================================
export const agents = pgTable('agents', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 128 }).notNull(),
  role: varchar('role', { length: 128 }).notNull(),
  baseModel: varchar('base_model', { length: 64 }).notNull().default('gemini-1.5-pro'),
  systemPrompt: text('system_prompt').notNull(),
  status: varchar('status', { length: 32 }).notNull().default('idle'), // 'active' | 'idle' | 'error' | 'paused'
  tasksCompleted: integer('tasks_completed').notNull().default(0),
  uptime: varchar('uptime', { length: 32 }).notNull().default('99.9%'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('uq_workspace_agent_name').on(table.workspaceId, table.name),
  index('idx_agents_workspace').on(table.workspaceId),
  index('idx_agents_status').on(table.workspaceId, table.status)
]);

// ==============================================================================
// 4. WORKFLOWS (Autonomic DAG Orchestrations)
// ==============================================================================
export const workflows = pgTable('workflows', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 128 }).notNull(),
  description: text('description'),
  triggerType: varchar('trigger_type', { length: 64 }).notNull().default('manual'), // 'manual' | 'webhook' | 'schedule' | 'event'
  status: varchar('status', { length: 32 }).notNull().default('draft'), // 'active' | 'paused' | 'draft' | 'archived'
  successRate: numeric('success_rate', { precision: 5, scale: 2 }).notNull().default('100.00'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('uq_workspace_workflow_name').on(table.workspaceId, table.name),
  index('idx_workflows_workspace').on(table.workspaceId),
  index('idx_workflows_status').on(table.workspaceId, table.status)
]);

// ==============================================================================
// 5. WORKFLOW STEPS (DAG Execution Nodes)
// ==============================================================================
export const workflowSteps = pgTable('workflow_steps', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  workflowId: uuid('workflow_id').notNull().references(() => workflows.id, { onDelete: 'cascade' }),
  agentId: uuid('agent_id').references(() => agents.id, { onDelete: 'set null' }),
  orderIndex: integer('order_index').notNull(),
  stepType: varchar('step_type', { length: 32 }).notNull().default('agent'), // 'trigger' | 'agent' | 'guardrail' | 'destination'
  title: varchar('title', { length: 128 }).notNull(),
  actionPrompt: text('action_prompt').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('uq_workflow_order').on(table.workflowId, table.orderIndex),
  index('idx_workflow_steps_workspace').on(table.workspaceId),
  index('idx_workflow_steps_workflow').on(table.workflowId)
]);

// ==============================================================================
// 6. AUDIT LOGS (Model Trace Telemetry & Governance)
// ==============================================================================
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  workflowId: uuid('workflow_id').references(() => workflows.id, { onDelete: 'set null' }),
  agentId: uuid('agent_id').references(() => agents.id, { onDelete: 'set null' }),
  actionType: varchar('action_type', { length: 64 }).notNull(),
  model: varchar('model', { length: 64 }).notNull().default('gemini-1.5-pro'),
  payloadIn: jsonb('payload_in').notNull(),
  payloadOut: jsonb('payload_out'),
  tokensPrompt: integer('tokens_prompt').notNull().default(0),
  tokensCompletion: integer('tokens_completion').notNull().default(0),
  tokensTotal: integer('tokens_total').notNull().default(0),
  cost: numeric('cost', { precision: 10, scale: 6 }).notNull().default('0.000000'),
  latencyMs: integer('latency_ms').notNull().default(0),
  status: varchar('status', { length: 32 }).notNull().default('success'), // 'success' | 'warning' | 'error'
  errorMessage: text('error_message'),
  policyChecks: jsonb('policy_checks').notNull().default({ saifPassed: true, piiDetected: 0, budgetThresholdPassed: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_audit_logs_workspace_created').on(table.workspaceId, table.createdAt),
  index('idx_audit_logs_agent').on(table.workspaceId, table.agentId),
  index('idx_audit_logs_workflow').on(table.workspaceId, table.workflowId),
  index('idx_audit_logs_status').on(table.workspaceId, table.status)
]);

// ==============================================================================
// RELATIONS
// ==============================================================================
export const workspacesRelations = relations(workspaces, ({ many }) => ({
  users: many(users),
  agents: many(agents),
  workflows: many(workflows),
  auditLogs: many(auditLogs),
}));

export const usersRelations = relations(users, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [users.workspaceId],
    references: [workspaces.id],
  }),
}));

export const agentsRelations = relations(agents, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [agents.workspaceId],
    references: [workspaces.id],
  }),
  workflowSteps: many(workflowSteps),
  auditLogs: many(auditLogs),
}));

export const workflowsRelations = relations(workflows, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [workflows.workspaceId],
    references: [workspaces.id],
  }),
  steps: many(workflowSteps),
  auditLogs: many(auditLogs),
}));

export const workflowStepsRelations = relations(workflowSteps, ({ one }) => ({
  workflow: one(workflows, {
    fields: [workflowSteps.workflowId],
    references: [workflows.id],
  }),
  agent: one(agents, {
    fields: [workflowSteps.agentId],
    references: [agents.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [auditLogs.workspaceId],
    references: [workspaces.id],
  }),
  workflow: one(workflows, {
    fields: [auditLogs.workflowId],
    references: [workflows.id],
  }),
  agent: one(agents, {
    fields: [auditLogs.agentId],
    references: [agents.id],
  }),
}));

// ==============================================================================
// INFERRED TYPES
// ==============================================================================
export type Workspace = InferSelectModel<typeof workspaces>;
export type NewWorkspace = InferInsertModel<typeof workspaces>;

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type Agent = InferSelectModel<typeof agents>;
export type NewAgent = InferInsertModel<typeof agents>;

export type Workflow = InferSelectModel<typeof workflows>;
export type NewWorkflow = InferInsertModel<typeof workflows>;

export type WorkflowStep = InferSelectModel<typeof workflowSteps>;
export type NewWorkflowStep = InferInsertModel<typeof workflowSteps>;

export type AuditLog = InferSelectModel<typeof auditLogs>;
export type NewAuditLog = InferInsertModel<typeof auditLogs>;
