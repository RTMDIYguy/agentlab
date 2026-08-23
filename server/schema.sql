-- ==============================================================================
-- AgentLab Multi-Tenant SaaS Database Schema (PostgreSQL)
-- Target Platform: Google Cloud SQL (PostgreSQL 15+)
-- Architecture: Shared Database, Shared Schema with Row-Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. WORKSPACES (Tenants)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL,
    slug VARCHAR(64) NOT NULL UNIQUE,
    hard_monthly_budget DECIMAL(10, 2) NOT NULL DEFAULT 500.00,
    auto_pause_threshold_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    pii_redaction_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    saif_enforcement_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    audit_retention_days INT NOT NULL DEFAULT 90,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workspaces_slug ON workspaces(slug);

-- ==============================================================================
-- 2. USERS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(128) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'operator' CHECK (role IN ('owner', 'admin', 'operator', 'auditor')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_workspace_user_email UNIQUE (workspace_id, email)
);

CREATE INDEX IF NOT EXISTS idx_users_workspace ON users(workspace_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ==============================================================================
-- 3. AGENTS (Autonomous Runtime Nodes)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    role VARCHAR(128) NOT NULL,
    base_model VARCHAR(64) NOT NULL DEFAULT 'gemini-1.5-pro',
    system_prompt TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'idle' CHECK (status IN ('active', 'idle', 'error', 'paused')),
    tasks_completed INT NOT NULL DEFAULT 0,
    uptime VARCHAR(32) NOT NULL DEFAULT '99.9%',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_workspace_agent_name UNIQUE (workspace_id, name)
);

CREATE INDEX IF NOT EXISTS idx_agents_workspace ON agents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(workspace_id, status);

-- ==============================================================================
-- 4. WORKFLOWS (Autonomic DAG Orchestrations)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(64) NOT NULL DEFAULT 'manual' CHECK (trigger_type IN ('manual', 'webhook', 'schedule', 'event')),
    status VARCHAR(32) NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'paused', 'draft', 'archived')),
    success_rate DECIMAL(5, 2) NOT NULL DEFAULT 100.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_workspace_workflow_name UNIQUE (workspace_id, name)
);

CREATE INDEX IF NOT EXISTS idx_workflows_workspace ON workflows(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(workspace_id, status);

-- ==============================================================================
-- 5. WORKFLOW STEPS (DAG Execution Nodes)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    order_index INT NOT NULL,
    step_type VARCHAR(32) NOT NULL DEFAULT 'agent' CHECK (step_type IN ('trigger', 'agent', 'guardrail', 'destination')),
    title VARCHAR(128) NOT NULL,
    action_prompt TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_workflow_order UNIQUE (workflow_id, order_index)
);

CREATE INDEX IF NOT EXISTS idx_workflow_steps_workspace ON workflow_steps(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_workflow ON workflow_steps(workflow_id);

-- ==============================================================================
-- 6. AUDIT LOGS (Model Trace Telemetry & Governance)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    action_type VARCHAR(64) NOT NULL,
    model VARCHAR(64) NOT NULL DEFAULT 'gemini-1.5-pro',
    payload_in JSONB NOT NULL,
    payload_out JSONB,
    tokens_prompt INT NOT NULL DEFAULT 0,
    tokens_completion INT NOT NULL DEFAULT 0,
    tokens_total INT NOT NULL DEFAULT 0,
    cost DECIMAL(10, 6) NOT NULL DEFAULT 0.000000,
    latency_ms INT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'warning', 'error')),
    error_message TEXT,
    policy_checks JSONB NOT NULL DEFAULT '{"saifPassed": true, "piiDetected": 0, "budgetThresholdPassed": true}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_workspace_created ON audit_logs(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_agent ON audit_logs(workspace_id, agent_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_workflow ON audit_logs(workspace_id, workflow_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON audit_logs(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_payload_gin ON audit_logs USING gin (payload_in);

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) FOR MULTI-TENANT ISOLATION
-- ==============================================================================
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation Policies (enforced via session variable: app.current_workspace_id)
CREATE POLICY workspace_isolation_workspaces ON workspaces
    USING (id = NULLIF(current_setting('app.current_workspace_id', true), '')::uuid);

CREATE POLICY workspace_isolation_users ON users
    USING (workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::uuid);

CREATE POLICY workspace_isolation_agents ON agents
    USING (workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::uuid);

CREATE POLICY workspace_isolation_workflows ON workflows
    USING (workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::uuid);

CREATE POLICY workspace_isolation_workflow_steps ON workflow_steps
    USING (workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::uuid);

CREATE POLICY workspace_isolation_audit_logs ON audit_logs
    USING (workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::uuid);
