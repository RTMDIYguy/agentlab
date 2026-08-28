# Agent Lab Documentation Drift Report
**Report Date:** 2026-08-28  
**Scan Status:** ATTENTION REQUIRED (Baseline Audit)  
**Evaluator:** Antigravity Desktop Governance Engine  

---

## Summary Metrics

| Severity Level | Findings Count | Remediation Action |
| :--- | :--- | :--- |
| 🔴 **CRITICAL** | 2 | Update operational documentation to reflect PostgreSQL & Cloud Run reality. |
| 🟠 **HIGH** | 3 | Clarify Ownable OS vs. Agent Lab product definitions; record Autonoma/Aikido roles. |
| 🟡 **MEDIUM** | 4 | Normalize workspace terminology across marketing and sales assets. |
| 🟢 **LOW** | 5 | Add document metadata headers (`document_id`, `authority_level`, `status`). |

---

## Top Critical & High Findings

### 1. [CRITICAL] Production Database Conflict
- **Canonical (Verified Runtime):** `PostgreSQL` via Drizzle ORM (`drizzle.config.ts`, `server/schema.ts`).
- **Observed in Documentation:** `agency-owners-manual.md` lists SQLite in dev and production database as "TBD".
- **Impact:** Misleads developers, AI agents, and partners about data persistence, migration requirements, and RLS capabilities.
- **Recommended Action:** Mark SQLite as historical/local-only in Owner's Manual and cite `governance/registry/platforms.yaml: PLAT-POSTGRES`.

### 2. [CRITICAL] Backend Runtime Platform Conflict
- **Canonical (Verified Runtime):** `Google Cloud Run` containerized Express server (`Dockerfile`, `package.json`).
- **Observed in Documentation:** `urc-v1-operating-architecture.md` and `agency-owners-manual.md` list Google Cloud as an "evaluation candidate with decisions pending".
- **Impact:** Inconsistent deployment guidance and conflicting agent context.
- **Recommended Action:** Update platform status in Owner's Manual from `candidate` to `active production runtime`.

### 3. [HIGH] Product Definition & Commercial Model Ambiguity
- **Canonical (Verified Registry):** **Agent Lab** = SaaS technology platform & multi-tenant orchestrator. **Ownable OS** = Commercial agency operating package sold to founders.
- **Observed in Documentation:** Historical documents use "Agent Lab" and "Ownable OS" interchangeably, or refer to Agent Lab purely as an R&D demo site.
- **Impact:** Commercial and positioning drift across customer conversations and web copy.
- **Recommended Action:** Enforce terminology definitions from `governance/terminology.yaml`.

### 4. [HIGH] Unregistered Active Platforms
- **Canonical (Verified Runtime):** `Autonoma` (E2E synthetic testing) and `Aikido Security` (vulnerability scanning) are actively integrated into repo workflows.
- **Observed in Documentation:** Missing from older tool registry in `agency-owners-manual.md`.
- **Impact:** Incomplete operational knowledge base for engineers and agents.
- **Recommended Action:** Add Autonoma and Aikido to Owner's Manual tools registry with explicit purpose statements.

---

## Next Steps
1. Review and approve `governance/current-state-reconciliation.md`.
2. Apply YAML metadata frontmatter to core operating documents.
3. Update `agency-owners-manual.md` references to point to `governance/registry/`.
