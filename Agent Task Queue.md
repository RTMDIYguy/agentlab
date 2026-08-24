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

### Next Steps to Support This (Phase 10 & 11)

To make this vision a reality, the next builds need to be:

- **Phase 10 (Execution):** The Worker Engine that actually runs the workflows.
- **Phase 11 (The Storefront):** A marketplace UI in the Command Center where clients can click "Unlock Finance Department - $499/mo" which updates their Stripe subscription and injects those specific folders into their LLM's context window.
