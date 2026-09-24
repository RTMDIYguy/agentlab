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
  index,
  customType,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import {
  type InferSelectModel,
  type InferInsertModel,
  relations,
  sql,
} from "drizzle-orm";

// ==============================================================================
// 1. WORKSPACES (Tenants)
// ==============================================================================
export const workspaces = pgTable(
  "workspaces",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 128 }).notNull(),
    slug: varchar("slug", { length: 64 }).notNull().unique(),
    hardMonthlyBudget: numeric("hard_monthly_budget", {
      precision: 10,
      scale: 2,
    })
      .notNull()
      .default("500.00"),
    autoPauseThresholdEnabled: boolean("auto_pause_threshold_enabled")
      .notNull()
      .default(true),
    piiRedactionEnabled: boolean("pii_redaction_enabled")
      .notNull()
      .default(true),
    saifEnforcementEnabled: boolean("saif_enforcement_enabled")
      .notNull()
      .default(true),
    auditRetentionDays: integer("audit_retention_days").notNull().default(90),
    stripeCustomerId: varchar("stripe_customer_id", { length: 128 }),
    orchestratorName: varchar("orchestrator_name", { length: 128 })
      .notNull()
      .default("Orchestrator"),
    orchestratorSystemPrompt: text("orchestrator_system_prompt")
      .notNull()
      .default("You are the central Ops Agent."),
    defaultModel: varchar("default_model", { length: 64 })
      .notNull()
      .default("gemini-1.5-pro"),
    trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }).default(
      sql`now() + interval '30 days'`
    ),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  table => [index("idx_workspaces_slug").on(table.slug)]
);

// ==============================================================================
// 2. USERS
// ==============================================================================
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    openId: varchar("open_id", { length: 64 }).notNull().unique(),
    workspaceId: uuid("workspace_id").references(() => workspaces.id, {
      onDelete: "cascade",
    }),
    email: varchar("email", { length: 255 }).notNull(),
    name: varchar("name", { length: 128 }).notNull(),
    loginMethod: varchar("login_method", { length: 64 }),
    role: varchar("role", { length: 32 }).notNull().default("operator"), // 'owner' | 'admin' | 'operator' | 'auditor' | 'beta_partner'
    tier: varchar("tier", { length: 64 }).notNull().default("standard"), // 'standard' | 'pro' | 'enterprise' | 'beta_partner'
    restrictedPackages: jsonb("restricted_packages").notNull().default([]), // List of explicitly restricted packages/departments (e.g. ['financial-package'])
    lastSignedIn: timestamp("last_signed_in", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  table => [
    uniqueIndex("uq_workspace_user_email").on(table.workspaceId, table.email),
    index("idx_users_workspace").on(table.workspaceId),
    index("idx_users_email").on(table.email),
    uniqueIndex("idx_users_openid").on(table.openId),
  ]
);

// ==============================================================================
// WORKFLOW SHARE TOKENS — client-facing read-only run consoles (Tier 1 item 3)
// Tokens are stored hashed (sha256); the raw value is shown exactly once at
// creation and never again. Revocation is a timestamp, not a delete, so the
// audit trail survives.
// ==============================================================================
export const workflowShareTokens = pgTable(
  "workflow_share_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    label: varchar("label", { length: 128 }),
    // 'all' = every run in the workspace; 'single' = only runId
    scope: varchar("scope", { length: 16 }).notNull().default("all"),
    runId: uuid("run_id"),
    createdByEmail: varchar("created_by_email", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastAccessedAt: timestamp("last_accessed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  table => [
    uniqueIndex("uq_share_token_hash").on(table.tokenHash),
    index("idx_share_tokens_workspace").on(table.workspaceId),
  ]
);

// ==============================================================================
// 3. AGENTS (Autonomous Runtime Nodes)
// ==============================================================================
export const agents = pgTable(
  "agents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 128 }).notNull(),
    role: varchar("role", { length: 128 }).notNull(),
    baseModel: varchar("base_model", { length: 64 })
      .notNull()
      .default("gemini-1.5-pro"),
    systemPrompt: text("system_prompt").notNull(),
    status: varchar("status", { length: 32 }).notNull().default("idle"), // 'active' | 'idle' | 'error' | 'paused'
    // Fabricated at seed time in the pre-honesty-audit controller; retained
    // for backward compatibility but no longer trusted or displayed. Real
    // per-agent task/success stats are computed from run history instead.
    tasksCompleted: integer("tasks_completed").notNull().default(0),
    uptime: varchar("uptime", { length: 32 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  table => [
    uniqueIndex("uq_workspace_agent_name").on(table.workspaceId, table.name),
    index("idx_agents_workspace").on(table.workspaceId),
    index("idx_agents_status").on(table.workspaceId, table.status),
  ]
);

// ==============================================================================
// 4. WORKFLOWS (Autonomic DAG Orchestrations)
// ==============================================================================
export const workflows = pgTable(
  "workflows",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 128 }).notNull(),
    description: text("description"),
    triggerType: varchar("trigger_type", { length: 64 })
      .notNull()
      .default("manual"), // 'manual' | 'webhook' | 'schedule' | 'event'
    cronExpression: varchar("cron_expression", { length: 64 }),
    nextRunAt: timestamp("next_run_at", { withTimezone: true }),
    status: varchar("status", { length: 32 }).notNull().default("draft"), // 'active' | 'paused' | 'draft' | 'archived'
    // Honesty doctrine (CC-2026-09-23-016): a never-run workflow has no success
    // rate. This column is not written by any controller; per-workflow rates are
    // computed from real workflow_runs history (see listWorkflows). The old NOT
    // NULL default of 100.00 presented every never-run workflow as perfect.
    successRate: numeric("success_rate", { precision: 5, scale: 2 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  table => [
    uniqueIndex("uq_workspace_workflow_name").on(table.workspaceId, table.name),
    index("idx_workflows_workspace").on(table.workspaceId),
    index("idx_workflows_status").on(table.workspaceId, table.status),
  ]
);

// ==============================================================================
// 5. WORKFLOW STEPS (DAG Execution Nodes)
// ==============================================================================
export const workflowSteps = pgTable(
  "workflow_steps",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    workflowId: uuid("workflow_id")
      .notNull()
      .references(() => workflows.id, { onDelete: "cascade" }),
    agentId: uuid("agent_id").references(() => agents.id, {
      onDelete: "set null",
    }),
    orderIndex: integer("order_index").notNull(),
    stepType: varchar("step_type", { length: 32 }).notNull().default("agent"), // 'trigger' | 'agent' | 'guardrail' | 'action' | 'destination'
    title: varchar("title", { length: 128 }).notNull(),
    actionPrompt: text("action_prompt").notNull(),
    // Per-step execution policy (Tier 1 runner hardening). null = use the
    // runner defaults; explicit values are clamped to safe bounds by
    // server/execution/step-policy.ts.
    timeoutSeconds: integer("timeout_seconds"),
    maxRetries: integer("max_retries"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  table => [
    uniqueIndex("uq_workflow_order").on(table.workflowId, table.orderIndex),
    index("idx_workflow_steps_workspace").on(table.workspaceId),
    index("idx_workflow_steps_workflow").on(table.workflowId),
  ]
);

// ==============================================================================
// 6. AUDIT LOGS (Model Trace Telemetry & Governance)
// ==============================================================================
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    workflowId: uuid("workflow_id").references(() => workflows.id, {
      onDelete: "set null",
    }),
    agentId: uuid("agent_id").references(() => agents.id, {
      onDelete: "set null",
    }),
    actionType: varchar("action_type", { length: 64 }).notNull(),
    model: varchar("model", { length: 64 }).notNull().default("gemini-1.5-pro"),
    payloadIn: jsonb("payload_in").notNull(),
    payloadOut: jsonb("payload_out"),
    tokensPrompt: integer("tokens_prompt").notNull().default(0),
    tokensCompletion: integer("tokens_completion").notNull().default(0),
    tokensTotal: integer("tokens_total").notNull().default(0),
    cost: numeric("cost", { precision: 10, scale: 6 })
      .notNull()
      .default("0.000000"),
    latencyMs: integer("latency_ms").notNull().default(0),
    status: varchar("status", { length: 32 }).notNull().default("success"), // 'success' | 'warning' | 'error'
    errorMessage: text("error_message"),
    cancelRequested: boolean("cancel_requested").notNull().default(false),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    billed: boolean("billed").notNull().default(false),
    policyChecks: jsonb("policy_checks").notNull().default({
      saifPassed: true,
      piiDetected: 0,
      budgetThresholdPassed: true,
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  table => [
    index("idx_audit_logs_workspace_created").on(
      table.workspaceId,
      table.createdAt
    ),
    index("idx_audit_logs_agent").on(table.workspaceId, table.agentId),
    index("idx_audit_logs_workflow").on(table.workspaceId, table.workflowId),
    index("idx_audit_logs_status").on(table.workspaceId, table.status),
  ]
);

// ==============================================================================
// 7. WORKFLOW RUNS (Execution state of a whole DAG)
// ==============================================================================
export const workflowRuns = pgTable(
  "workflow_runs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    workflowId: uuid("workflow_id")
      .notNull()
      .references(() => workflows.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 32 }).notNull().default("pending"), // 'pending' | 'running' | 'completed' | 'failed' | 'paused_for_approval'
    triggerSource: varchar("trigger_source", { length: 64 })
      .notNull()
      .default("manual"), // 'manual', 'webhook', 'schedule'
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    errorMessage: text("error_message"),
    cancelRequested: boolean("cancel_requested").notNull().default(false),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    initialContext: jsonb("initial_context").default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  table => [
    index("idx_workflow_runs_workspace").on(table.workspaceId),
    index("idx_workflow_runs_workflow").on(table.workflowId),
    index("idx_workflow_runs_status").on(table.workspaceId, table.status),
  ]
);

// ==============================================================================
// 8. WORKFLOW RUN STEPS (Execution state of a single step in a run)
// ==============================================================================
// ==============================================================================
// 26b. ACTION DISPATCHES (human-gated outbound actions — conversion plan Tier 2)
// Lifecycle: an 'action' step drafts via the agent runner, then parks a row in
// `awaiting_approval` and pauses the run. A human approves/rejects via the
// actions router; approval runs the SAIF check, dispatches through the named
// connector, and records the REAL result. Nothing is ever marked dispatched
// unless the external system actually accepted it.

export const actionDispatches = pgTable(
  "action_dispatches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    workflowRunId: uuid("workflow_run_id").references(() => workflowRuns.id, {
      onDelete: "set null",
    }),
    workflowRunStepId: uuid("workflow_run_step_id").references(
      () => workflowRunSteps.id,
      { onDelete: "set null" }
    ),
    workflowStepId: uuid("workflow_step_id").references(() => workflowSteps.id, {
      onDelete: "set null",
    }),
    /** e.g. 'hubspot_contact_upsert' — see server/execution/connectors.ts */
    connector: varchar("connector", { length: 64 }).notNull(),
    /** 'awaiting_approval' | 'approved' | 'rejected' | 'dispatched' | 'dispatch_failed' | 'cancelled' */
    status: varchar("status", { length: 32 }).notNull().default("awaiting_approval"),
    /** Human-readable summary of what would be sent (shown in approval UI). */
    title: varchar("title", { length: 255 }).notNull(),
    /** Full structured payload (already connector-shaped). */
    payload: jsonb("payload").notNull(),
    /** SAIF gate result recorded at approval time. */
    saifPassed: boolean("saif_passed"),
    saifReason: text("saif_reason"),
    /** The human who approved or rejected. */
    approvedBy: uuid("approved_by").references(() => users.id, { onDelete: "set null" }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    rejectedReason: text("rejected_reason"),
    /** Real dispatch result from the external system. */
    dispatchedAt: timestamp("dispatched_at", { withTimezone: true }),
    externalId: varchar("external_id", { length: 128 }),
    externalUrl: varchar("external_url", { length: 512 }),
    dispatchError: text("dispatch_error"),
    /** For the UI list: the run's real end state, written on approve/reject. */
    runOutcome: varchar("run_outcome", { length: 32 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  table => [
    index("idx_action_dispatches_workspace").on(table.workspaceId),
    index("idx_action_dispatches_status").on(table.status),
    index("idx_action_dispatches_run").on(table.workflowRunId),
  ]
);

export const workflowRunSteps = pgTable(
  "workflow_run_steps",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    workflowRunId: uuid("workflow_run_id")
      .notNull()
      .references(() => workflowRuns.id, { onDelete: "cascade" }),
    workflowStepId: uuid("workflow_step_id")
      .notNull()
      .references(() => workflowSteps.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 32 }).notNull().default("pending"), // 'pending' | 'running' | 'completed' | 'failed'
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    inputContext: jsonb("input_context").default({}),
    outputPayload: jsonb("output_payload"),
    errorMessage: text("error_message"),
    cost: numeric("cost", { precision: 10, scale: 6 }).default("0.000000"),
    latencyMs: integer("latency_ms").default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  table => [
    index("idx_workflow_run_steps_workspace").on(table.workspaceId),
    index("idx_workflow_run_steps_run").on(table.workflowRunId),
    index("idx_workflow_run_steps_status").on(table.workspaceId, table.status),
  ]
);

// ==============================================================================
// 9. KNOWLEDGE PACKAGES (The "App Store" Inventory)
// ==============================================================================
export const knowledgePackages = pgTable("knowledge_packages", {
  id: varchar("id", { length: 64 }).primaryKey(), // e.g., 'mkt-playbook'
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description").notNull(),
  departmentCode: varchar("department_code", { length: 32 }).notNull(),
  monthlyPrice: numeric("monthly_price", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00"),
  stripeProductId: varchar("stripe_product_id", { length: 128 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ==============================================================================
// 10. WORKSPACE PACKAGES (Active Subscriptions)
// ==============================================================================
export const workspacePackages = pgTable(
  "workspace_packages",
  {
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    packageId: varchar("package_id", { length: 64 })
      .notNull()
      .references(() => knowledgePackages.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 32 }).notNull().default("active"), // 'active', 'canceled', 'past_due', 'pay_as_you_go'
    stripeSubscriptionId: varchar("stripe_subscription_id", { length: 128 }),
    dailyRunLimit: integer("daily_run_limit"),
    unlockedAt: timestamp("unlocked_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  table => [
    uniqueIndex("uq_workspace_package").on(table.workspaceId, table.packageId),
  ]
);

// ==============================================================================
// 11. PLAYBOOKS (Governed cross-workflow operating journeys)
// ==============================================================================
export const playbooks = pgTable(
  "playbooks",
  {
    id: varchar("id", { length: 96 }).primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    description: text("description").notNull(),
    status: varchar("status", { length: 32 }).notNull().default("draft"), // 'draft' | 'active' | 'review'
    ownerDepartmentCode: varchar("owner_department_code", {
      length: 32,
    }).notNull(),
    sourceDocument: varchar("source_document", { length: 255 }),
    primaryOwner: varchar("primary_owner", { length: 128 }).notNull(),
    approvalOwner: varchar("approval_owner", { length: 128 }).notNull(),
    trigger: text("trigger").notNull(),
    completionCriteria: text("completion_criteria").notNull(),
    stopConditions: jsonb("stop_conditions").notNull().default([]),
    requiredInputs: jsonb("required_inputs").notNull().default([]),
    expectedOutputs: jsonb("expected_outputs").notNull().default([]),
    evidenceRequirements: jsonb("evidence_requirements").notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  table => [
    index("idx_playbooks_owner_department").on(table.ownerDepartmentCode),
    index("idx_playbooks_status").on(table.status),
  ]
);

// ==============================================================================
// 12. PLAYBOOK HANDOFFS (Explicit contracts between workflow owners)
// ==============================================================================
export const playbookHandoffs = pgTable(
  "playbook_handoffs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    playbookId: varchar("playbook_id", { length: 96 })
      .notNull()
      .references(() => playbooks.id, { onDelete: "cascade" }),
    sequence: integer("sequence").notNull(),
    fromWorkflowCode: varchar("from_workflow_code", { length: 64 }).notNull(),
    toWorkflowCode: varchar("to_workflow_code", { length: 64 }).notNull(),
    fromDepartmentCode: varchar("from_department_code", {
      length: 32,
    }).notNull(),
    toDepartmentCode: varchar("to_department_code", { length: 32 }).notNull(),
    triggerSignal: text("trigger_signal").notNull(),
    requiredPayload: jsonb("required_payload").notNull().default([]),
    receivingOwner: varchar("receiving_owner", { length: 128 }).notNull(),
    approvalRequired: boolean("approval_required").notNull().default(false),
    fallbackProtocol: text("fallback_protocol").notNull(),
    stopCondition: text("stop_condition").notNull(),
    evidenceRequired: jsonb("evidence_required").notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  table => [
    uniqueIndex("uq_playbook_handoff_sequence").on(
      table.playbookId,
      table.sequence
    ),
    index("idx_playbook_handoffs_playbook").on(table.playbookId),
    index("idx_playbook_handoffs_from").on(table.fromWorkflowCode),
    index("idx_playbook_handoffs_to").on(table.toWorkflowCode),
  ]
);

// ==============================================================================
// 13. WORKSPACE SECRETS (Metadata for GSM Vault)
// ==============================================================================
export const workspaceSecrets = pgTable(
  "workspace_secrets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 64 }).notNull(), // 'openai', 'anthropic', 'hubspot'
    gsmSecretId: varchar("gsm_secret_id", { length: 255 }).notNull(),
    version: varchar("version", { length: 64 }).notNull().default("1"),
    maskedPreview: varchar("masked_preview", { length: 64 }), // e.g. sk-proj-...1234
    status: varchar("status", { length: 32 }).notNull().default("connected"), // 'connected', 'rotated', 'error'
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  table => [
    uniqueIndex("uq_workspace_secret_provider").on(
      table.workspaceId,
      table.provider
    ),
    index("idx_workspace_secrets_workspace").on(table.workspaceId),
  ]
);

// ==============================================================================
// 14. WORKSPACE INTEGRATIONS (Third-party & MCP connections)
// ==============================================================================
export const workspaceIntegrations = pgTable(
  "workspace_integrations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 64 }).notNull(), // 'mcp', 'webhook', 'oauth'
    name: varchar("name", { length: 128 }).notNull(),
    config: jsonb("config").notNull().default({}), // Tool-specific config
    status: varchar("status", { length: 32 }).notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  table => [index("idx_workspace_integrations_workspace").on(table.workspaceId)]
);

// ==============================================================================
// 15. WORKFLOW ARTIFACTS (Tangible Outputs, Content Assets, Scheduled Posts)
// ==============================================================================
export const workflowArtifacts = pgTable(
  "workflow_artifacts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    workflowRunId: uuid("workflow_run_id")
      .notNull()
      .references(() => workflowRuns.id, { onDelete: "cascade" }),
    workflowRunStepId: uuid("workflow_run_step_id").references(
      () => workflowRunSteps.id,
      { onDelete: "set null" }
    ),
    workflowId: uuid("workflow_id").references(() => workflows.id, {
      onDelete: "set null",
    }),
    artifactType: varchar("artifact_type", { length: 64 })
      .notNull()
      .default("document"), // 'post' | 'calendar_entry' | 'document' | 'file' | 'crm_diff' | 'csv'
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    summary: text("summary"),
    status: varchar("status", { length: 32 }).notNull().default("draft"), // 'draft' | 'scheduled' | 'published' | 'archived'
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
    targetPlatform: varchar("target_platform", { length: 64 }).default(
      "linkedin"
    ), // 'linkedin' | 'blog' | 'newsletter' | 'hubspot' | 'internal'
    qualityScore: integer("quality_score").default(90),
    qualityGrade: varchar("quality_grade", { length: 10 }).default("A"),
    verificationNotes: jsonb("verification_notes").default({
      feedback: ["Initial generation verified."],
      suggestions: [],
      passed: true,
      rubric: {
        brandAlignment: 95,
        actionableCta: 90,
        factualIntegrity: 95,
        formatting: 90,
      },
    }),
    revisionVersion: integer("revision_version").notNull().default(1),
    parentArtifactId: uuid("parent_artifact_id"),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  table => [
    index("idx_workflow_artifacts_workspace").on(table.workspaceId),
    index("idx_workflow_artifacts_run").on(table.workflowRunId),
    index("idx_workflow_artifacts_type").on(
      table.workspaceId,
      table.artifactType
    ),
    index("idx_workflow_artifacts_status").on(table.workspaceId, table.status),
    index("idx_workflow_artifacts_scheduled").on(
      table.workspaceId,
      table.scheduledFor
    ),
  ]
);

// ==============================================================================
// 16. ASSESSMENT QUESTIONS (Consulting Assessment Question Pool)
// ==============================================================================
export const assessmentQuestions = pgTable(
  "assessment_questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id").references(() => workspaces.id, {
      onDelete: "cascade",
    }),
    domain: varchar("domain", { length: 64 }).notNull(), // 'Operations' | 'Sales' | 'Marketing' | 'Finance' | 'Technology' | 'Leadership'
    depth: varchar("depth", { length: 32 }).notNull().default("exploratory"), // 'exploratory' | 'diagnostic' | 'executive'
    text: text("text").notNull(),
    skill: varchar("skill", { length: 128 }).notNull(),
    evaluation: text("evaluation").notNull(),
    signals: jsonb("signals").notNull().default([]), // Array of trigger words/signals
    isCustom: boolean("is_custom").notNull().default(false),
    source: varchar("source", { length: 64 }).notNull().default("system"), // 'system' | 'manual' | 'ai_synthesized'
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  table => [
    index("idx_assessment_questions_domain").on(table.domain),
    index("idx_assessment_questions_depth").on(table.depth),
    index("idx_assessment_questions_workspace").on(table.workspaceId),
  ]
);

// ==============================================================================
// 17. ASSESSMENT SESSIONS (Recorded Discovery & Diagnostic Runs)
// ==============================================================================
export const assessmentSessions = pgTable(
  "assessment_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id").references(() => workspaces.id, {
      onDelete: "cascade",
    }),
    clientName: varchar("client_name", { length: 128 }).notNull().default("Client"),
    domain: varchar("domain", { length: 64 }).notNull().default("All"),
    callNotes: text("call_notes").notNull(),
    detectedSignals: jsonb("detected_signals").notNull().default([]),
    findings: jsonb("findings").notNull().default([]),
    selectedQuestionIds: jsonb("selected_question_ids").notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  table => [
    index("idx_assessment_sessions_workspace").on(table.workspaceId),
  ]
);

// ==============================================================================
// 18. ICP PROFILES (Ideal Customer Profile Library & Generator)
// ==============================================================================
export const icpProfiles = pgTable(
  "icp_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id").references(() => workspaces.id, {
      onDelete: "cascade",
    }),
    name: varchar("name", { length: 128 }).notNull(),
    industry: varchar("industry", { length: 128 }).notNull(),
    targetRole: varchar("target_role", { length: 128 }).notNull(),
    companySize: varchar("company_size", { length: 64 }).notNull(),
    revenueRange: varchar("revenue_range", { length: 64 }).notNull(),
    acutePainTriggers: jsonb("acute_pain_triggers").notNull().default([]),
    buyingSignals: jsonb("buying_signals").notNull().default([]),
    disqualifiers: jsonb("disqualifiers").notNull().default([]),
    valueProposition: text("value_proposition").notNull(),
    outreachAngles: jsonb("outreach_angles").notNull().default([]),
    source: varchar("source", { length: 64 }).notNull().default("ai_synthesized"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  table => [
    index("idx_icp_profiles_workspace").on(table.workspaceId),
    index("idx_icp_profiles_industry").on(table.industry),
  ]
);

// ==============================================================================
// 21. NEWSLETTER SUBSCRIBERS (Double opt-in audience list)
// ==============================================================================
export const newsletterSubscribers = pgTable(
  "newsletter_subscribers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    name: varchar("name", { length: 128 }),
    status: varchar("status", { length: 32 }).notNull().default("pending"), // 'pending' | 'active' | 'unsubscribed' | 'bounced'
    source: varchar("source", { length: 64 }).notNull().default("website"),
    verifyToken: varchar("verify_token", { length: 128 }),
    unsubscribeToken: varchar("unsubscribe_token", { length: 128 }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  table => [
    uniqueIndex("uq_newsletter_subscribers_email").on(table.email),
    index("idx_newsletter_subscribers_status").on(table.status),
  ]
);

// ==============================================================================
// 22. NEWSLETTER CAMPAIGNS (Admin-authored email sends)
// ==============================================================================
export const newsletterCampaigns = pgTable("newsletter_campaigns", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  content: text("content").notNull(),
  status: varchar("status", { length: 32 }).notNull().default("draft"), // 'draft' | 'sent' | 'archived'
  recipientCount: integer("recipient_count").notNull().default(0),
  sentCount: integer("sent_count").notNull().default(0),
  openCount: integer("open_count").notNull().default(0),
  clickCount: integer("click_count").notNull().default(0),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  hubspotEmailId: varchar("hubspot_email_id", { length: 64 }),
  hubspotTemplatePath: varchar("hubspot_template_path", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ==============================================================================
// 23. CONTACT SUBMISSIONS (Every lead captured on the site in one place)
// ==============================================================================
export const contactSubmissions = pgTable(
  "contact_submissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 128 }),
    email: varchar("email", { length: 255 }).notNull(),
    company: varchar("company", { length: 128 }),
    painPoint: text("pain_point"),
    interest: varchar("interest", { length: 128 }),
    subject: varchar("subject", { length: 255 }),
    message: text("message"),
    source: varchar("source", { length: 128 }).notNull().default("website"),
    status: varchar("status", { length: 32 }).notNull().default("new"), // 'new' | 'synced' | 'archived'
    crmSyncedAt: timestamp("crm_synced_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  table => [
    index("idx_contact_submissions_email").on(table.email),
    index("idx_contact_submissions_created").on(table.createdAt),
  ]
);

// ==============================================================================
// 23b. HUBSPOT SYNC LOG (honest outcome ledger for every lead-handoff attempt)
// Blueprint: "Agent Lab OS to HubSpot Lead Handoff Blueprint" (2026-09-23).
// Every sync attempt — success, skip, or failure — is recorded with the real
// HTTP outcome and the exact payload, so nothing silently pretends to have
// synced and failures are diagnosable (missing portal properties, etc.).

export const hubspotSyncLog = pgTable(
  "hubspot_sync_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    submissionId: uuid("submission_id").references(() => contactSubmissions.id, {
      onDelete: "set null",
    }),
    email: varchar("email", { length: 255 }).notNull(),
    outcome: varchar("outcome", { length: 32 }).notNull(), // 'synced' | 'skipped_no_token' | 'error'
    hubspotContactId: varchar("hubspot_contact_id", { length: 64 }),
    httpStatus: integer("http_status"),
    errorMessage: text("error_message"),
    /** Exact property payload sent (or would have been sent) to HubSpot. */
    propertiesPayload: text("properties_payload"),
    /** True when the row was written by a manual retry, not the capture path. */
    retryOf: uuid("retry_of"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  table => [
    index("idx_hubspot_sync_log_email").on(table.email),
    index("idx_hubspot_sync_log_submission").on(table.submissionId),
    index("idx_hubspot_sync_log_created").on(table.createdAt),
  ]
);

// ==============================================================================
// 24. BLOG COMMENTS (Threaded comments on published articles)
// ==============================================================================
export const blogComments = pgTable(
  "blog_comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    articleId: integer("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    parentCommentId: uuid("parent_comment_id").references(
      (): AnyPgColumn => blogComments.id,
      { onDelete: "cascade" }
    ),
    content: text("content").notNull(),
    status: varchar("status", { length: 32 }).notNull().default("visible"), // 'visible' | 'deleted'
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  table => [
    index("idx_blog_comments_article").on(table.articleId),
    index("idx_blog_comments_parent").on(table.parentCommentId),
  ]
);

// ==============================================================================
// 25. MESSENGER THREADS & MESSAGES (ClientMessenger / office channels)
// ==============================================================================
export const messengerThreads = pgTable(
  "messenger_threads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: varchar("type", { length: 16 }).notNull().default("channel"), // 'channel' | 'dm'
    slug: varchar("slug", { length: 96 }), // stable client key, e.g. 'chan-general' or 'dm-lorenzo'
    name: varchar("name", { length: 128 }).notNull(),
    tagline: varchar("tagline", { length: 255 }),
    role: varchar("role", { length: 96 }),
    company: varchar("company", { length: 128 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  table => [
    uniqueIndex("uq_messenger_threads_slug").on(table.slug),
    index("idx_messenger_threads_type").on(table.type),
  ]
);

export const messengerMessages = pgTable(
  "messenger_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    threadId: uuid("thread_id")
      .notNull()
      .references(() => messengerThreads.id, { onDelete: "cascade" }),
    sender: varchar("sender", { length: 16 }).notNull().default("founder"), // 'founder' | 'client' | 'bot'
    senderName: varchar("sender_name", { length: 128 }).notNull(),
    content: text("content").notNull(),
    isMeetingLink: boolean("is_meeting_link").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  table => [
    index("idx_messenger_messages_thread").on(table.threadId, table.createdAt),
  ]
);

// ==============================================================================
// RELATIONS
// ==============================================================================
export const workspacesRelations = relations(workspaces, ({ many }) => ({
  users: many(users),
  agents: many(agents),
  workflows: many(workflows),
  auditLogs: many(auditLogs),
  workflowRuns: many(workflowRuns),
  workflowRunSteps: many(workflowRunSteps),
  artifacts: many(workflowArtifacts),
  packages: many(workspacePackages),
  playbooks: many(playbooks),
  playbookHandoffs: many(playbookHandoffs),
  secrets: many(workspaceSecrets),
  integrations: many(workspaceIntegrations),
  assessmentQuestions: many(assessmentQuestions),
  assessmentSessions: many(assessmentSessions),
  icpProfiles: many(icpProfiles),
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
  runs: many(workflowRuns),
}));

export const workflowStepsRelations = relations(
  workflowSteps,
  ({ one, many }) => ({
    workflow: one(workflows, {
      fields: [workflowSteps.workflowId],
      references: [workflows.id],
    }),
    agent: one(agents, {
      fields: [workflowSteps.agentId],
      references: [agents.id],
    }),
    runSteps: many(workflowRunSteps),
  })
);

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

export const workflowRunsRelations = relations(
  workflowRuns,
  ({ one, many }) => ({
    workspace: one(workspaces, {
      fields: [workflowRuns.workspaceId],
      references: [workspaces.id],
    }),
    workflow: one(workflows, {
      fields: [workflowRuns.workflowId],
      references: [workflows.id],
    }),
    steps: many(workflowRunSteps),
    artifacts: many(workflowArtifacts),
  })
);

export const workflowRunStepsRelations = relations(
  workflowRunSteps,
  ({ one, many }) => ({
    workspace: one(workspaces, {
      fields: [workflowRunSteps.workspaceId],
      references: [workspaces.id],
    }),
    run: one(workflowRuns, {
      fields: [workflowRunSteps.workflowRunId],
      references: [workflowRuns.id],
    }),
    step: one(workflowSteps, {
      fields: [workflowRunSteps.workflowStepId],
      references: [workflowSteps.id],
    }),
    artifacts: many(workflowArtifacts),
  })
);

export const workflowArtifactsRelations = relations(
  workflowArtifacts,
  ({ one }) => ({
    workspace: one(workspaces, {
      fields: [workflowArtifacts.workspaceId],
      references: [workspaces.id],
    }),
    run: one(workflowRuns, {
      fields: [workflowArtifacts.workflowRunId],
      references: [workflowRuns.id],
    }),
    runStep: one(workflowRunSteps, {
      fields: [workflowArtifacts.workflowRunStepId],
      references: [workflowRunSteps.id],
    }),
    workflow: one(workflows, {
      fields: [workflowArtifacts.workflowId],
      references: [workflows.id],
    }),
  })
);

export const knowledgePackagesRelations = relations(
  knowledgePackages,
  ({ many }) => ({
    workspacePackages: many(workspacePackages),
  })
);

export const workspacePackagesRelations = relations(
  workspacePackages,
  ({ one }) => ({
    workspace: one(workspaces, {
      fields: [workspacePackages.workspaceId],
      references: [workspaces.id],
    }),
    package: one(knowledgePackages, {
      fields: [workspacePackages.packageId],
      references: [knowledgePackages.id],
    }),
  })
);

export const playbooksRelations = relations(playbooks, ({ many }) => ({
  handoffs: many(playbookHandoffs),
}));

export const playbookHandoffsRelations = relations(
  playbookHandoffs,
  ({ one }) => ({
    playbook: one(playbooks, {
      fields: [playbookHandoffs.playbookId],
      references: [playbooks.id],
    }),
  })
);

export const workspaceSecretsRelations = relations(
  workspaceSecrets,
  ({ one }) => ({
    workspace: one(workspaces, {
      fields: [workspaceSecrets.workspaceId],
      references: [workspaces.id],
    }),
  })
);

export const workspaceIntegrationsRelations = relations(
  workspaceIntegrations,
  ({ one }) => ({
    workspace: one(workspaces, {
      fields: [workspaceIntegrations.workspaceId],
      references: [workspaces.id],
    }),
  })
);

export const assessmentQuestionsRelations = relations(
  assessmentQuestions,
  ({ one }) => ({
    workspace: one(workspaces, {
      fields: [assessmentQuestions.workspaceId],
      references: [workspaces.id],
    }),
  })
);

export const assessmentSessionsRelations = relations(
  assessmentSessions,
  ({ one }) => ({
    workspace: one(workspaces, {
      fields: [assessmentSessions.workspaceId],
      references: [workspaces.id],
    }),
  })
);

export const icpProfilesRelations = relations(
  icpProfiles,
  ({ one }) => ({
    workspace: one(workspaces, {
      fields: [icpProfiles.workspaceId],
      references: [workspaces.id],
    }),
  })
);

// ==============================================================================
// 19. DISCOUNT CODES & PROMOTIONS
// ==============================================================================
export const discountCodes = pgTable(
  "discount_codes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: varchar("code", { length: 64 }).notNull().unique(),
    campaignName: varchar("campaign_name", { length: 128 }).notNull(),
    discountType: varchar("discount_type", { length: 32 }).notNull().default("percent_off"), // 'percent_off' | 'amount_off' | 'vip_bypass' | 'extended_trial'
    discountValue: numeric("discount_value", { precision: 10, scale: 2 }).notNull().default("0.00"),
    targetApp: varchar("target_app", { length: 64 }).notNull().default("all"), // 'all' | 'agentlab_os' | 'market_marksman' | 'pulse_social'
    stripePromoId: varchar("stripe_promo_id", { length: 128 }),
    maxRedemptions: integer("max_redemptions"),
    timesRedeemed: integer("times_redeemed").notNull().default(0),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  table => [
    uniqueIndex("idx_discount_codes_code").on(table.code),
    index("idx_discount_codes_app").on(table.targetApp),
  ]
);

export const discountRedemptions = pgTable(
  "discount_redemptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    discountCodeId: uuid("discount_code_id")
      .notNull()
      .references(() => discountCodes.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    userEmail: varchar("user_email", { length: 255 }).notNull(),
    targetApp: varchar("target_app", { length: 64 }).notNull(),
    metadata: jsonb("metadata").notNull().default({}),
    redeemedAt: timestamp("redeemed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  table => [
    index("idx_redemptions_code_id").on(table.discountCodeId),
    index("idx_redemptions_email").on(table.userEmail),
  ]
);

export const discountCodesRelations = relations(
  discountCodes,
  ({ many }) => ({
    redemptions: many(discountRedemptions),
  })
);

export const discountRedemptionsRelations = relations(
  discountRedemptions,
  ({ one }) => ({
    discountCode: one(discountCodes, {
      fields: [discountRedemptions.discountCodeId],
      references: [discountCodes.id],
    }),
    user: one(users, {
      fields: [discountRedemptions.userId],
      references: [users.id],
    }),
  })
);

// ==============================================================================
// 20. ARTICLES (Blog posts, drafts, scheduled & published)
// ==============================================================================
export const articles = pgTable(
  "articles",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    ownerOpenId: varchar("owner_open_id", { length: 64 })
      .notNull()
      .references(() => users.openId, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    excerpt: text("excerpt"),
    content: text("content").notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    category: varchar("category", { length: 64 }).notNull().default("General"),
    status: varchar("status", { length: 32 })
      .notNull()
      .default("draft"), // 'draft' | 'scheduled' | 'published'
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
    featuredImage: text("featured_image"),
    views: integer("views").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  table => [
    uniqueIndex("uq_owner_slug").on(table.ownerOpenId, table.slug),
    index("idx_articles_owner").on(table.ownerOpenId),
    index("idx_articles_status").on(table.ownerOpenId, table.status),
  ]
);

export const articlesRelations = relations(articles, ({ one }) => ({
  owner: one(users, {
    fields: [articles.ownerOpenId],
    references: [users.openId],
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

export type WorkflowRun = InferSelectModel<typeof workflowRuns>;
export type NewWorkflowRun = InferInsertModel<typeof workflowRuns>;

export type WorkflowRunStep = InferSelectModel<typeof workflowRunSteps>;
export type NewWorkflowRunStep = InferInsertModel<typeof workflowRunSteps>;

export type WorkflowArtifact = InferSelectModel<typeof workflowArtifacts>;
export type NewWorkflowArtifact = InferInsertModel<typeof workflowArtifacts>;

export type KnowledgePackage = InferSelectModel<typeof knowledgePackages>;
export type NewKnowledgePackage = InferInsertModel<typeof knowledgePackages>;

export type WorkspacePackage = InferSelectModel<typeof workspacePackages>;
export type NewWorkspacePackage = InferInsertModel<typeof workspacePackages>;

export type Playbook = InferSelectModel<typeof playbooks>;
export type NewPlaybook = InferInsertModel<typeof playbooks>;

export type PlaybookHandoff = InferSelectModel<typeof playbookHandoffs>;
export type NewPlaybookHandoff = InferInsertModel<typeof playbookHandoffs>;

export type WorkspaceSecret = InferSelectModel<typeof workspaceSecrets>;
export type NewWorkspaceSecret = InferInsertModel<typeof workspaceSecrets>;

export type WorkspaceIntegration = InferSelectModel<
  typeof workspaceIntegrations
>;
export type NewWorkspaceIntegration = InferInsertModel<
  typeof workspaceIntegrations
>;

export type AssessmentQuestion = InferSelectModel<typeof assessmentQuestions>;
export type NewAssessmentQuestion = InferInsertModel<typeof assessmentQuestions>;

export type AssessmentSession = InferSelectModel<typeof assessmentSessions>;
export type NewAssessmentSession = InferInsertModel<typeof assessmentSessions>;

export type IcpProfile = InferSelectModel<typeof icpProfiles>;
export type NewIcpProfile = InferInsertModel<typeof icpProfiles>;

export type DiscountCode = InferSelectModel<typeof discountCodes>;
export type NewDiscountCode = InferInsertModel<typeof discountCodes>;

export type DiscountRedemption = InferSelectModel<typeof discountRedemptions>;
export type NewDiscountRedemption = InferInsertModel<typeof discountRedemptions>;

export type NewsletterSubscriber = InferSelectModel<typeof newsletterSubscribers>;
export type NewNewsletterSubscriber = InferInsertModel<typeof newsletterSubscribers>;

export type NewsletterCampaign = InferSelectModel<typeof newsletterCampaigns>;
export type NewNewsletterCampaign = InferInsertModel<typeof newsletterCampaigns>;

export type ContactSubmission = InferSelectModel<typeof contactSubmissions>;
export type NewContactSubmission = InferInsertModel<typeof contactSubmissions>;

export type BlogComment = InferSelectModel<typeof blogComments>;
export type NewBlogComment = InferInsertModel<typeof blogComments>;

// ==============================================================================
// 26. SCREEN TEARDOWN SESSIONS (Async Screen & Video Teardown Studio)
// ==============================================================================

// Postgres bytea — the studio's .webm recordings persist server-side so
// sessions survive a browser refresh. Videos are minutes long, not hours,
// so a modest max keeps rows sane.
const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

export const teardownSessions = pgTable(
  "teardown_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 128 }).notNull(),
    durationSeconds: integer("duration_seconds").notNull().default(0),
    sizeBytes: integer("size_bytes").notNull().default(0),
    notes: text("notes"),
    aiBrief: text("ai_brief"),
    aiBriefModel: varchar("ai_brief_model", { length: 64 }),
    videoData: bytea("video_data"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  table => [
    index("idx_teardown_sessions_workspace").on(table.workspaceId),
    index("idx_teardown_sessions_created").on(table.workspaceId, table.createdAt),
  ]
);

export type TeardownSession = InferSelectModel<typeof teardownSessions>;
export type NewTeardownSession = InferInsertModel<typeof teardownSessions>;
