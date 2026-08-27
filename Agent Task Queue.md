# AgentLab Task Queue

## Current Architecture Context

- **Front-End Stack:** React + Vite (`output/agentlab-ui/src/`).
- **Backend Stack:** Node.js (Express), PostgreSQL + Drizzle ORM (`server/`).
- **Target Backend Deployment:** Google Cloud Run.

## Completed Tasks

- [x] Phase 7 - API Integration & State Management
- [x] Phase 8 - Domain Knowledge & Agency Structure Integration
- [x] Phase 9 - Vertex AI Orchestrator Integration

---

## Architecture Review: Monetization & Tenancy

_Robert's Question:_ We have built Agent Lab (the platform) and URC (the agency). What about blank models for clients? What happens to the 40+ modular workflows designed to be sold as individual pieces, playbooks, or whole companies?

### The "Tenant vs. Template" Model

The architecture we just built using PostgreSQL Row-Level Security (RLS) and the `workspace_id` is exactly what makes selling "blank" or "pre-loaded" models possible.

**1. How "Blank Models" Work (Client Workspaces)**
When a client buys AgentLab, they are provisioned a new `workspace_id` in our database.

- By default, this workspace is a "blank model." It has no agents, no workflows, and a blank command center.
- The Orchestrator LLM in a blank workspace does _not_ have access to URC's proprietary SOPs—unless the client specifically buys them.

**2. How Modular Sales Work (The "App Store" Model)**
Those 40+ workflows (`mkt-*`, `sal-*`, `ops-*`) are essentially your "App Store" inventory.

- Because we built the `ingest-workflows.ts` script, we can treat each folder as a discrete JSON "Knowledge Package."
- If a client rents the "Marketing Playbook," we flip a flag in their database profile. The Orchestrator for _their_ `workspace_id` is now injected with the `mkt-*` JSON packages.
- Now, when the client asks their Orchestrator to "Build an outreach sequence," it uses your proprietary `MKT-05` SOP. If they ask for a finance workflow (which they didn't buy), the Orchestrator replies, _"You do not have the Finance Playbook installed."_

**3. The URC Workspace**
Uncle Robert Consulting LLC is simply `workspace_id: "0000-URC"`. Your workspace has every single playbook unlocked and loaded.

### Phase 10: Execution (The Worker Engine)
- [x] **The Worker Engine:** Build the backend engine that actually executes the modular workflows (`mkt-*`, `sal-*`, `ops-*`) against the user's active context.

### Phase 11: Monetization & The Storefront
- [x] **Marketplace UI:** A storefront in the Command Center where clients can unlock modules (e.g., "Unlock Finance Department - $499/mo"), updating Stripe and injecting the JSON knowledge packages into the LLM context.
- [x] **30-Day Trial Retooling:** Update the trial model to span exactly 30 days.
- [x] **Smart Downgrade & Pay-As-You-Go:** 
  - [x] Use the LLM at the end of the trial to analyze actual feature usage and operational needs.
  - [x] Automatically downgrade workspaces to the bare minimum required for business function.
  - [x] Implement a dynamic pay-as-you-go model where clients only pay for the features they use and how often they use them.
- [x] **Resource Optimization:** Ensure environments/services spin down between uses to keep platform hosting costs minimal.

### Phase 12: Operational Command Center (Dashboard & UI Restoration)
- [x] **Operational Dashboard Overhaul:** Transition the main dashboard from a simple subscription overview to a true operational command center surfacing real-time telemetry (active workflows, running agents, task statuses, budget spend).
- [x] **Advanced User Controls (Agents & Auditing Tabs):** Reintroduce dedicated UI tabs for granular system control, complete with an "Advanced Users Only" warning.
  - [x] **Agents Tab:** Monitor active agents, view tasks, and manually spin up specific agents on demand.
  - [x] **Auditing Tab:** Deep-dive tools for troubleshooting, system repair, auditing, and detailed reporting.
- [x] **Right Sidebar Functionality:** 
  - [x] **User Profile:** Wire up the profile section so users can actively update their information.
  - [x] **Dynamic Quick Links:** Wire up the quick links section to be dynamic, allowing users to add custom links manually or via a system-wide bookmarking feature.

### Phase 13: Settings & Integrations
- [x] **LLM Controls (The Orchestrator):** Configure preferences, model selection, and prompt settings. Enable renaming the central Ops Agent/Orchestrator and injecting custom context to build its personality.
- [x] **Security & Credentials:** Manage API/Auth keys and a secure secrets vault.
- [x] **Integrations & Extensibility:** Manage third-party integrations and Model Context Protocol (MCP) connections to expand the system's capabilities.

### Phase 14: The "Immersive" Front Page
- **Front Page Redesign (The "Immersive Concert" Experience):** Overhaul the main landing page to act as a high-converting, immersive (visual and audial) experience.
  - **Dynamic Personalization:** Greet visitors with an AI that instantly understands their intent. This initial interaction acts as the trigger to begin building the personality and context of the user's central Orchestrator LLM.
  - **The "Rock Band" Approach:** The front page should dynamically adapt to deliver a uniquely tailored experience every time, pushing the boundaries of SaaS immersion.

### Phase 15: System Watchdog & Diagnostics
- [x] **Startup Diagnostics:** Run initial health checks (DB connection, schema validation, API keys check) on server boot.
- [x] **Watchdog Poller:** Periodically scan `workflowRuns` for orphaned/stuck jobs (running > 1 hour) and log them.
- [x] **Auditing UI Integration:** Hook the `Auditing.tsx` dashboard to the live TRPC telemtry feed, pulling real anomalies and allowing users to manually resolve them.
