# AgentLab Task Queue

## Current Architecture Context
*   **Front-End Stack:** React + Vite (`output/agentlab-ui/src/`).
*   **Backend Stack:** Node.js (Express), PostgreSQL + Drizzle ORM (`server/`).
*   **AI SDK:** Vercel AI SDK (`ai`).
*   **Target LLM Provider:** Google Cloud Vertex AI (Gemini models).
*   **Target Cloud Environment:** Google Cloud Run.

## Completed Tasks
*   [x] Phase 5 - SaaS Database Schema (PostgreSQL)
*   [x] Phase 6 - Node.js API & Orchestrator Controller
*   [x] Phase 7 - API Integration & State Management
*   [x] Phase 8 - Domain Knowledge & Agency Structure Integration
*   [x] Phase 9 - Vertex AI Orchestrator Integration

---

## Active Task: Ready for Next Phase / Standby

**Objective:** 
Replace the mock keyword-matching logic in the Orchestrator Controller with a real, dynamic LLM call. Utilize Google Cloud Vertex AI (via the Vercel AI SDK) to interpret the user's request against the URC Domain Knowledge and generate a structured DAG proposal.

### Deliverable 1: SDK Installation & Setup
*   Install required packages in the root or `server` directory: `npm install @ai-sdk/google zod`.
*   Ensure local Google Cloud Application Default Credentials (ADC) are active for development (e.g., via `gcloud auth application-default login`), as the Vertex AI SDK will rely on them.

### Deliverable 2: Zod Schema Definition (`server/domain/schemas.ts`)
*   Define a strict Zod schema (`workflowProposalSchema`) that matches the `ProposedWorkflow` interface expected by the front end.
*   This schema must enforce the exact structure: `id`, `name`, `description`, `estimatedCostPerRun`, `estimatedLatencySeconds`, `triggerType`, `guardrails` (array), and `steps` (array of objects with `stepNumber`, `type`, `title`, `detail`).

### Deliverable 3: Update Orchestrator Controller (`server/controllers/orchestrator.ts`)
*   Import `generateObject` from the `ai` package and the `vertex` provider from `@ai-sdk/google`.
*   Rewrite `generateWorkflowProposal(prompt: string)` to execute an LLM call:
    *   **System Prompt:** Inject the `URC_DEPARTMENTS`, `URC_TOOLS`, and the ingested `getAvailableWorkflows()` JSON string. Instruct the model that it is the "AgentLab Orchestrator" responsible for mapping user intent to URC SOPs.
    *   **Model:** Use a capable reasoning model (e.g., `vertex('gemini-1.5-pro')` or `gemini-1.5-flash`).
    *   **Schema:** Pass the `workflowProposalSchema` to guarantee the output structure.
*   Return the generated object to the client.

### Instructions for Antigravity:
1. Complete the SDK installations and update `orchestrator.ts`.
2. Since ADC is required for Vertex AI, ensure the Node.js environment variables (if any are explicitly needed by the `@ai-sdk/google` package for Vertex) are documented or stubbed.
3. Run `npx tsc --noEmit` to verify type safety and Zod schema alignment.
4. Update this `Agent Task Queue.md` file to mark Phase 9 as "COMPLETED".