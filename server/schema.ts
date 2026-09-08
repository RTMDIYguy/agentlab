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
    tasksCompleted: integer("tasks_completed").notNull().default(0),
    uptime: varchar("uptime", { length: 32 }).notNull().default("99.9%"),
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
    successRate: numeric("success_rate", { precision: 5, scale: 2 })
      .notNull()
      .default("100.00"),
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
    stepType: varchar("step_type", { length: 32 }).notNull().default("agent"), // 'trigger' | 'agent' | 'guardrail' | 'destination'
    title: varchar("title", { length: 128 }).notNull(),
    actionPrompt: text("action_prompt").notNull(),
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
