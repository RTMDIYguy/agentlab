import { Router } from "express";
import { handleOrchestratorChat } from "../controllers/orchestrator";
import { executeOrchestratorWorkflow } from "../controllers/orchestrator-execute";
import { getCredentialHealth, getRecentFailedRuns } from "../controllers/ops-watchdog";
import {
  getAgents,
  deployAgent,
  toggleAgentStatus,
} from "../controllers/agents";
import {
  getWorkflows,
  deployWorkflow,
  createCustomWorkflow,
  updateWorkflowSchedule,
  updateWorkflow,
  updateWorkflowSteps,
  archiveWorkflow,
  restoreWorkflow,
  deleteWorkflow,
} from "../controllers/workflows";
import {
  triggerRun,
  listRuns,
  getRunDetails,
  approveRun,
  rejectRun,
  cancelRun,
} from "../controllers/runs";
import {
  exportRunArtifact,
  exportRunBundle,
} from "../controllers/export";
import {
  listShareTokens,
  createShareToken,
  revokeShareToken,
  getSharedRuns,
  getSharedRunDetail,
} from "../controllers/share";
import {
  getMarketplaceItems,
  getPackages,
  subscribeToPackage,
  mountPlaybook,
  unmountPlaybook,
  getBetaStatus,
  enrollBeta,
  getTrialStatus,
  extendTrial,
} from "../controllers/marketplace.js";
import { getPlaybook, getPlaybooks } from "../controllers/playbooks";
import {
  getSyncState,
  ingestRoamingData,
  executeRemoteAction,
  registerMobileWebhook,
  handleManualSync,
} from "../controllers/aiStudioSync";
import {
  getAuditLogs,
  getAuditStats,
  exportAuditLogs,
  approveAuditAction,
  rejectAuditAction,
} from "../controllers/audit";
import {
  listArtifacts,
  getContentCalendar,
  getRunArtifacts,
  updateArtifactStatus,
  downloadArtifact,
  evaluateArtifact,
  refineArtifact,
  createArtifact,
  listBlogArticles,
  getArtifact,
  deleteArtifact,
} from "../controllers/artifacts";
import { handleGenerateImage } from "../controllers/image-generation";
import {
  dispatchCreBrief,
  dispatchMedSpaDiagnostic,
  bookFounderSprint,
} from "../controllers/campaigns";
import {
  handleTextToSpeech,
  getAvailableVoiceSlots,
  bookVoiceAppointment,
  handleVoiceCallWebhook,
  dispatchOutboundVoiceCall,
} from "../controllers/voice";
import { ingestCustomerPurchase } from "../controllers/fulfillment";
import {
  handleInstantlyVerify,
  handleInstantlyListCampaigns,
  handleInstantlyEnrollLead,
  handleInstantlyWebhook,
} from "../controllers/instantly";

export const apiRouter = Router();

// Health Check
apiRouter.get("/health", (_req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "AgentLab Node.js API & Orchestration Runtime",
    environment: process.env.NODE_ENV || "development",
  });
});

apiRouter.get("/debug/llm", async (req, res) => {
  // Auth-mode honesty (2026-09-24): reports WHICH credential path is active.
  // Never returns secret material — statuses and masked identifiers only.
  const { resolveServiceAccount, createGoogleProvider, isGoogleAiConfigured } = await import("../_core/google-ai");
  const sa = resolveServiceAccount();
  const legacyKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  const authMode = sa.key ? "service_account" : legacyKey ? "api_key" : "none";

  let credentialStatus = "Missing";
  if (sa.key) {
    credentialStatus = `Present (${sa.source})`;
  } else if (legacyKey) {
    credentialStatus = legacyKey.startsWith('"') ? "Has Quotes" : "Present";
  }

  let success = false;
  let errorMessage = "";

  if (isGoogleAiConfigured()) {
    try {
      const { generateText } = await import("ai");
      const google = createGoogleProvider();
      await generateText({
        model: google("gemini-2.5-flash") as any,
        prompt: "Say the word test.",
      });
      success = true;
    } catch (e: any) {
      success = false;
      errorMessage = e.stack || e.message;
    }
  } else {
    errorMessage = "No credential configured (service-account key file or API key).";
  }

  res.status(200).json({
    auth_mode: authMode,
    credential_status: credentialStatus,
    service_account_email: sa.key ? sa.key.client_email : null,
    success,
    error_message: errorMessage,
  });
});

// Orchestrator Synthesis Engine
apiRouter.post("/orchestrator/chat", handleOrchestratorChat);
apiRouter.post("/orchestrator/execute", executeOrchestratorWorkflow);

// Ops-Agent Watchdog: proactive failed-run detection (2026-09-24)
apiRouter.get("/ops-watchdog/failed-runs", getRecentFailedRuns);
// Credential-health probe: auth rot surfaces before runs fail (2026-09-25)
apiRouter.get("/ops-watchdog/credential-health", getCredentialHealth);

// Autonomous Swarm Agents
apiRouter.get("/agents", getAgents);
apiRouter.post("/agents/deploy", deployAgent);
apiRouter.post("/agents/:id/toggle", toggleAgentStatus);

// Workflows & Autonomic DAG Deployments
apiRouter.get("/workflows", getWorkflows);
apiRouter.post("/workflows", createCustomWorkflow);
apiRouter.post("/workflows/deploy", deployWorkflow);
apiRouter.patch("/workflows/:workflowId", updateWorkflow);
apiRouter.put("/workflows/:workflowId/steps", updateWorkflowSteps);
apiRouter.post("/workflows/:workflowId/archive", archiveWorkflow);
apiRouter.post("/workflows/:workflowId/restore", restoreWorkflow);
apiRouter.delete("/workflows/:workflowId", deleteWorkflow);
apiRouter.post("/workflows/:workflowId/run", triggerRun);
apiRouter.patch("/workflows/:workflowId/schedule", updateWorkflowSchedule);

// Runs & Execution State
apiRouter.get("/runs", listRuns);
apiRouter.get("/runs/:runId", getRunDetails);
apiRouter.post("/runs/:runId/approve", approveRun);
apiRouter.post("/runs/:runId/reject", rejectRun);
apiRouter.post("/runs/:runId/cancel", cancelRun);
apiRouter.get("/runs/:runId/export", exportRunBundle);
apiRouter.get("/runs/:runId/artifacts/:artifactId/export", exportRunArtifact);

// Client-facing run consoles (Tier 1 item 3): share-token lifecycle (operator,
// tenant-scoped) and token-scoped public read-only views. Public reads resolve
// the workspace from the token hash — never from the tenant middleware.
apiRouter.get("/share/tokens", listShareTokens);
apiRouter.post("/share/tokens", createShareToken);
apiRouter.delete("/share/tokens/:tokenId", revokeShareToken);
apiRouter.get("/share/runs", getSharedRuns);
apiRouter.get("/share/runs/:runId", getSharedRunDetail);

// Marketplace Storefront & Workspace Mounting
apiRouter.get("/marketplace/items", getMarketplaceItems);
apiRouter.get("/marketplace/packages", getPackages);
apiRouter.post(
  "/marketplace/packages/:packageId/subscribe",
  subscribeToPackage
);
apiRouter.post("/marketplace/mount/:id", mountPlaybook);
apiRouter.post("/marketplace/unmount/:id", unmountPlaybook);

// Governed cross-department playbooks and their handoff contracts.
apiRouter.get("/playbooks", getPlaybooks);
apiRouter.get("/playbooks/:id", getPlaybook);

// Gamified Beta Program & Trial Management
apiRouter.get("/beta/status", getBetaStatus);
apiRouter.post("/beta/enroll/:appId", enrollBeta);
apiRouter.get("/trials/status", getTrialStatus);
apiRouter.post("/trials/extend", extendTrial);

// ==============================================================================
// AI Studio Mobile Dashboard & Roaming Data Bridge (Bidirectional)
// ==============================================================================
// 1. Live OS State Export -> AI Studio Mobile Dashboard
apiRouter.get("/aistudio/state", getSyncState);
apiRouter.get("/sync/state", getSyncState);

// 2. Roaming & Field Data Ingestion -> AgentLab OS
apiRouter.post("/aistudio/ingest", ingestRoamingData);
apiRouter.post("/sync/ingest", ingestRoamingData);

// 3. Mobile Remote Actions (Trigger/Approve/Reject) -> AgentLab OS
apiRouter.post("/aistudio/action", executeRemoteAction);
apiRouter.post("/sync/action", executeRemoteAction);

// 4. Register Mobile Push Webhooks -> AI Studio
apiRouter.post("/aistudio/webhook/register", registerMobileWebhook);

// 5. 1-Click Ecosystem Sync (Desktop HTML + Repo Markdown + OS State)
apiRouter.post("/aistudio/sync-all", handleManualSync);
apiRouter.post("/sync/all", handleManualSync);

// ==============================================================================
// System Auditing, Compliance & Governance Telemetry
// ==============================================================================
apiRouter.get("/audit-logs", getAuditLogs);
apiRouter.get("/audit-logs/stats", getAuditStats);
apiRouter.get("/audit-logs/export", exportAuditLogs);
apiRouter.post("/audit-logs/:id/approve", approveAuditAction);
apiRouter.post("/audit-logs/:id/reject", rejectAuditAction);

// ==============================================================================
// Workflow Artifacts, Output Assets & Content Calendar
// ==============================================================================
apiRouter.get("/artifacts", listArtifacts);
apiRouter.get("/artifacts/blog", listBlogArticles);
apiRouter.get("/artifacts/content-calendar", getContentCalendar);
apiRouter.get("/artifacts/:id/download", downloadArtifact);
apiRouter.get("/artifacts/:id", getArtifact);
apiRouter.post("/artifacts", createArtifact);
apiRouter.post("/artifacts/:id/evaluate", evaluateArtifact);
apiRouter.post("/artifacts/:id/refine", refineArtifact);
apiRouter.get("/runs/:runId/artifacts", getRunArtifacts);
apiRouter.patch("/artifacts/:id", updateArtifactStatus);
apiRouter.delete("/artifacts/:id", deleteArtifact);

// AI Graphic & Visual Asset Generation (Imagen 3 & Multi-Engine)
apiRouter.post("/generate-image", handleGenerateImage);
apiRouter.post("/artifacts/generate-image", handleGenerateImage);

// ==============================================================================
// Campaign Outreach Sequences & Landing Page Handlers (SAL-01)
// ==============================================================================
apiRouter.post("/campaigns/outreach/cre", dispatchCreBrief);
apiRouter.post("/campaigns/outreach/medspa", dispatchMedSpaDiagnostic);
apiRouter.post("/campaigns/founder-sprint/book", bookFounderSprint);

// ==============================================================================
// Conversational Voice Agents (Pamela & ElevenLabs)
// ==============================================================================
apiRouter.post("/voice/tts", handleTextToSpeech);
apiRouter.get("/voice/slots", getAvailableVoiceSlots);
apiRouter.post("/voice/book", bookVoiceAppointment);
apiRouter.post("/voice/webhook", handleVoiceCallWebhook);
apiRouter.post("/voice/dispatch", dispatchOutboundVoiceCall);

// ==============================================================================
// Autonomous Customer Onboarding & Retention Swarm (FUL-01 / SAL-03)
// ==============================================================================
apiRouter.post("/fulfillment/onboarding/ingest", ingestCustomerPurchase);

// ==============================================================================
// Instantly.ai Outbound Engine & Webhook Receiver (SAL-01)
// ==============================================================================
apiRouter.get("/outbound/instantly/verify", handleInstantlyVerify);
apiRouter.get("/outbound/instantly/campaigns", handleInstantlyListCampaigns);
apiRouter.post("/webhooks/instantly", handleInstantlyWebhook);

// ==============================================================================
// Workspace Snapshots, Multi-Office & Franchise Replication (OPS-01)
// ==============================================================================
import {
  listSnapshots,
  saveSnapshot,
  cloneSnapshot,
  restoreSnapshot,
  deleteSnapshot,
} from "../controllers/snapshots";

apiRouter.get("/snapshots", listSnapshots);
apiRouter.post("/snapshots/save", saveSnapshot);
apiRouter.post("/snapshots/:id/clone", cloneSnapshot);
apiRouter.post("/snapshots/:id/restore", restoreSnapshot);
apiRouter.delete("/snapshots/:id", deleteSnapshot);

// ==============================================================================
// Consulting Assessment Question Generator & Diagnostic Sessions (MKT-03 / OPS)
// ==============================================================================
import {
  listAssessmentQuestions,
  createAssessmentQuestion,
  deleteAssessmentQuestion,
  generateAIAssessmentQuestions,
  saveAssessmentSession,
} from "../controllers/assessment-questions";

apiRouter.get("/assessment-questions", listAssessmentQuestions);
apiRouter.post("/assessment-questions", createAssessmentQuestion);
apiRouter.delete("/assessment-questions/:id", deleteAssessmentQuestion);
apiRouter.post("/assessment-questions/generate-ai", generateAIAssessmentQuestions);
apiRouter.post("/assessment-sessions", saveAssessmentSession);

// ==============================================================================
// Ideal Customer Profile (ICP) Generator & Intelligence Vault (MKT-01 / SAL-01)
// ==============================================================================
import {
  listIcpProfiles,
  generateIcpProfile,
  createIcpProfile,
  deleteIcpProfile,
} from "../controllers/icp";

apiRouter.get("/icp/profiles", listIcpProfiles);
apiRouter.post("/icp/generate", generateIcpProfile);
apiRouter.post("/icp/profiles", createIcpProfile);
apiRouter.delete("/icp/profiles/:id", deleteIcpProfile);

// ==============================================================================
// Discount Codes & Campaign Promotion Engine (SAL-01 / MKT-01 / Standalone Apps)
// ==============================================================================
import { validateDiscountCode, redeemDiscountCode } from "../controllers/discounts";

apiRouter.post("/discounts/validate", validateDiscountCode);
apiRouter.post("/discounts/redeem", redeemDiscountCode);

// ==============================================================================
// Screen Teardown Studio — video blob endpoints (metadata via tRPC teardown)
// ==============================================================================
import {
  uploadTeardownVideo,
  downloadTeardownVideo,
  deleteTeardownVideo,
} from "../controllers/teardown-video";

apiRouter.post("/teardown/:id/video", uploadTeardownVideo);
apiRouter.get("/teardown/:id/video", downloadTeardownVideo);
apiRouter.delete("/teardown/:id/video", deleteTeardownVideo);

// ==============================================================================
// Dashboard telemetry — real state for the System Telemetry Console
// ==============================================================================
import {
  getDashboardTelemetry,
  pingLlm,
} from "../controllers/dashboard-telemetry";

apiRouter.get("/dashboard/telemetry", getDashboardTelemetry);
apiRouter.get("/dashboard/llm-ping", pingLlm);

