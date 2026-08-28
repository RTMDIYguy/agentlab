# Current-State Truth Reconciliation & Conflict Assessment
**Task:** AGENTLAB-GOVERNANCE-001  
**Date:** 2026-08-28  
**Evaluator:** Antigravity Desktop  
**Status:** Review Required / Canonical Baseline Established  

---

## Executive Summary

Following the due diligence assessment by Dewey, this document reconciles the **Runtime Truth (Level 0)** of the live codebase with the **Operating Truth (Level 2)** in the Owner's Manual and operational strategy documents.

The primary conflict identified is that the codebase has evolved into a production-grade **Multi-Tenant SaaS with PostgreSQL, Drizzle ORM, Google Cloud Run backend, React 19/Vite frontend, and Stripe-connected knowledge packages**, while earlier operational manuals described the stack as Vercel + SQLite with production architecture "TBD".

Below is the structured reconciliation for the 20 fundamental architecture and governance questions.

---

## 20 Fundamental Questions Reconciliation

### 1. What is the actual production frontend deployment?
- **Runtime Evidence:** `client/src/main.tsx`, `vite.config.ts`, `package.json` (React 19.2.1, Vite 7.3.5, TailwindCSS v4, Radix UI).
- **Document Conflict:** Owner's Manual notes Vercel hosting frontend + API.
- **Recommended Canonical Value:** `React 19 / Vite SPA deployed to Vercel (or Cloud Run web container).`
- **Owner Review:** Confirmed.

### 2. What is the actual production backend runtime?
- **Runtime Evidence:** `server/_core/index.ts`, `Dockerfile` exposing port 8080, Express 4.21.2.
- **Document Conflict:** Owner's Manual lists backend as "TBD" / platform pending.
- **Recommended Canonical Value:** `Node.js / Express backend deployed on Google Cloud Run.`
- **Owner Review:** Confirmed.

### 3. What is the actual production database?
- **Runtime Evidence:** `drizzle.config.ts` (`dialect: "postgresql"`), `package.json` (`postgres`, `drizzle-orm`), `server/schema.ts` (pgTable definitions with UUIDs, JSONB, and timestamps).
- **Document Conflict:** Owner's Manual Section 10 says "Database = SQLite for development, production database TBD".
- **Recommended Canonical Value:** `PostgreSQL with Drizzle ORM.` (SQLite is historical / local prototype only).
- **Owner Review:** Confirmed.

### 4. Where does PostgreSQL live?
- **Runtime Evidence:** Connected via `DATABASE_URL` environment variable to managed PostgreSQL (Cloud SQL or Supabase/Neon instance).
- **Document Conflict:** Undocumented host in operating manual.
- **Recommended Canonical Value:** `Managed PostgreSQL (Cloud SQL / Target Database Provider).`

### 5. What is Vercel responsible for?
- **Runtime Evidence:** Frontend hosting and preview build pipelines.
- **Document Conflict:** Described historically as running backend tRPC APIs.
- **Recommended Canonical Value:** `Frontend Static Asset Delivery and Edge Routing only.`

### 6. What is Google Cloud responsible for?
- **Runtime Evidence:** Cloud Run container execution, Vertex AI / Gemini API endpoints, Google Secret Manager (GSM).
- **Document Conflict:** Described as "Evaluation candidate".
- **Recommended Canonical Value:** `Core Application Backend, Orchestrator Runtime, and Enterprise AI Layer.`

### 7. What is Autonoma responsible for?
- **Runtime Evidence:** `server/_core/autonomaSdk.ts`, `@autonoma-ai/sdk`, `package.json`.
- **Document Conflict:** Missing from older tool registry in Owner's Manual.
- **Recommended Canonical Value:** `Automated end-to-end testing with synthetic data factory seeding.`

### 8. What is Mintlify responsible for?
- **Runtime Evidence:** `docs/` MDX configuration.
- **Document Conflict:** Not previously integrated into canonical registry.
- **Recommended Canonical Value:** `Public-facing developer and user documentation portal (Derived View).`

### 9. What is Aikido responsible for?
- **Runtime Evidence:** CI security scanning configuration.
- **Document Conflict:** Not previously recorded in tool registry.
- **Recommended Canonical Value:** `Static code analysis, dependency CVE scanning, and secret detection.`

### 10. What is the canonical AI/orchestration layer?
- **Runtime Evidence:** `server/execution/queue-processor.ts`, `@ai-sdk/google`, `server/domain/urc-model.ts`.
- **Document Conflict:** Multiple competing descriptions of custom scripts vs n8n.
- **Recommended Canonical Value:** `Agent Lab Native DAG Orchestrator with Google GenAI / Vertex AI models.`

### 11. What constitutes an Agent?
- **Canonical Definition:** A configured autonomous execution entity with defined role, system prompt, knowledge package access, toolset, and explicit human approval gates (`server/schema.ts: agents`).

### 12. What constitutes a Workflow?
- **Canonical Definition:** A multi-step DAG orchestration with defined trigger, inputs, step nodes, outputs, and execution telemetry (`server/schema.ts: workflows`, `workflow_steps`).

### 13. What constitutes a Knowledge Package?
- **Canonical Definition:** A modular domain knowledge asset (`PKG-MKT-*`, `PKG-SAL-*`, `PKG-OPS-*`) that can be unlocked and mounted into client workspaces (`server/schema.ts: knowledge_packages`).

### 14. What constitutes a Product?
- **Canonical Definition:** A commercial offering that customers can purchase, subscribe to, or receive (`PROD-BOOK-BGW`, `PROD-FOUNDER-SIGNAL-SYSTEM`, `PROD-OWNABLE-OS`, `PROD-AGENTLAB-SAAS`).

### 15. What exactly is Ownable OS relative to Agent Lab?
- **Canonical Definition:** **Agent Lab** is the software engine and multi-tenant SaaS platform. **Ownable OS** is the packaged commercial offering (turnkey operating system + workflows + advisory) delivered to clients.

### 16. What is the current customer/workspace model?
- **Runtime Evidence:** Multi-tenant workspace isolation using `workspace_id` foreign keys, RLS policies, per-workspace budget limits, and audit retention settings (`server/schema.ts: workspaces`).

### 17. What is actually live versus merely implemented/tested?
- **Live / Active:** Agent Lab Web App, PostgreSQL Schema, Founder Signal System one-pager, Book offerings.
- **Implemented / In Progress:** Marketplace package auto-provisioning, Stripe meter sync.

### 18. Which current public claims are approved?
- **Approved:** Pricing for Founder Signal System ($1,000), Ownable OS ($500/mo), Books ($59.99 / $49.99), Agent Lab workspace isolation.
- **Pending Review:** Exact automated white-label sub-tenancy claims.

### 19. Which existing documents are historical?
- `docs/operations/agency-operating-manual.md` (superseded by `agency-owners-manual.md` v0.3).
- Early SQLite / tRPC standalone deployment notes.

### 20. Which document or system is ultimately authoritative?
- **Runtime Evidence (Level 0):** Source code, database schema, deployment configs.
- **System of Record (Level 1):** `governance/registry/*.yaml` files.
- **Operational Map (Level 2):** `docs/operations/agency-owners-manual.md` (as a human guide, referencing canonical sources).
