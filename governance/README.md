# Agent Lab Governance & Single Source of Truth

**Version:** 1.0.0  
**Status:** ACTIVE  
**Authority Level:** CANONICAL (Level 1)  
**Maintained by:** Antigravity Desktop / Operations  

---

## Purpose

The `governance/` directory establishes the **single operational source of truth** for Agent Lab, URC, and Bootstrapper Capital. It eliminates informational drift by decoupling canonical records from human-facing manuals, marketing pages, and agent system prompts.

---

## Core Governing Rules

1. **One Canonical System of Record $\rightarrow$ Many Purpose-Built Views**  
   No document is authoritative merely because it is detailed. Every public claim, technical specification, and product definition must originate from or validate against the canonical registry.
2. **Authority Hierarchy**  
   - **Level 0 — Runtime Truth:** Codebase, Drizzle schema, Dockerfile, live configurations.
   - **Level 1 — Canonical Registry:** Machine-readable YAML files in `governance/registry/`.
   - **Level 2 — Approved Operating Documents:** `docs/operations/agency-owners-manual.md`, active SOPs.
   - **Level 3 — Derived / Generated Documentation:** Public website, Mintlify docs, sales one-pagers.
   - **Level 4 — Historical / Reference:** Deprecated or archived strategy docs with explicit lineage tags.
3. **No Silent Supersession**  
   When a tool, platform, or strategy changes, older records are explicitly marked `HISTORICAL` or `DEPRECATED`, never silently overwritten or forgotten.
4. **Manual Before Magical**  
   The governance layer tracks and flags contradictions first. Automation must not unilaterally rewrite critical business, pricing, or security facts without human review.

---

## Directory Layout

```
governance/
├── README.md                           # This overview and governance rules
├── registry-schema.yaml                # JSON Schema for all canonical registry entities
├── terminology.yaml                    # Canonical terms and forbidden synonyms
├── document-inventory.yaml             # Catalog of all registered system documentation
├── current-state-reconciliation.md     # Full current-state analysis answering 20 core questions
├── registry/                           # Canonical Entity Registry (YAML)
│   ├── organizations.yaml              # Legal & operating entities (URC, Tactix, Bootstrapper Capital)
│   ├── products.yaml                   # Commercial offerings & offer ladder
│   ├── platforms.yaml                  # Infrastructure & platforms (GCP, PostgreSQL, Vercel, Stripe)
│   ├── services.yaml                   # Deployed runtime services & APIs
│   ├── environments.yaml               # Runtime environments (local, dev, staging, prod)
│   ├── workspaces.yaml                 # Multi-tenant workspace architecture
│   ├── agents.yaml                     # Autonomous execution roles & permissions
│   ├── workflows.yaml                  # Standardized operational DAG workflows
│   ├── knowledge-packages.yaml         # Modular SOP & domain knowledge packages
│   ├── documents.yaml                  # Registered documents & authority levels
│   ├── claims.yaml                     # Verifiable claims (architecture, pricing, tenancy)
│   └── policies.yaml                   # Security, PII, and compliance policies
└── drift/                              # Documentation Drift Detection
    └── initial-drift-report.md         # Baseline drift report & remediation queue
```

---

## Running Verification

To ensure that changes to workflows and documentation remain compliant with the change-control standard:

```bash
pnpm change-control:check
```
