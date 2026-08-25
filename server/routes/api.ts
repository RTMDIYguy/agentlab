import { Router } from "express";
import { handleOrchestratorChat } from "../controllers/orchestrator";
import { getAgents } from "../controllers/agents";
import { getWorkflows, deployWorkflow } from "../controllers/workflows";
import {
  triggerRun,
  listRuns,
  getRunDetails,
  approveRun,
  rejectRun,
} from "../controllers/runs";
import { getPackages, subscribeToPackage } from "../controllers/marketplace";

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
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  let keyStatus = "Missing";
  let keyLength = 0;
  let keyPrefix = "";

  if (key) {
    if (key.startsWith('"') || key.endsWith('"')) {
      keyStatus = "Has Quotes";
    } else {
      keyStatus = "Present";
    }
    keyLength = key.length;
    keyPrefix = key.substring(0, 5);
  }

  let success = false;
  let errorMessage = "";

  try {
    const { createGoogleGenerativeAI } = await import("@ai-sdk/google");
    const { generateText } = await import("ai");
    const google = createGoogleGenerativeAI({ apiKey: key });
    await generateText({
      model: google("gemini-2.5-pro") as any,
      prompt: "Say the word test.",
    });
    success = true;
  } catch (e: any) {
    success = false;
    errorMessage = e.stack || e.message;
  }

  res.status(200).json({
    key_status: keyStatus,
    key_length: keyLength,
    key_prefix: keyPrefix,
    success,
    error_message: errorMessage,
  });
});

// Orchestrator Synthesis Engine
apiRouter.post("/orchestrator/chat", handleOrchestratorChat);

// Autonomous Swarm Agents
apiRouter.get("/agents", getAgents);

// Workflows & Autonomic DAG Deployments
apiRouter.get("/workflows", getWorkflows);
apiRouter.post("/workflows/deploy", deployWorkflow);
apiRouter.post("/workflows/:workflowId/run", triggerRun);

// Runs & Execution State
apiRouter.get("/runs", listRuns);
apiRouter.get("/runs/:runId", getRunDetails);
apiRouter.post("/runs/:runId/approve", approveRun);
apiRouter.post("/runs/:runId/reject", rejectRun);

// Marketplace Storefront
apiRouter.get("/marketplace/packages", getPackages);
apiRouter.post(
  "/marketplace/packages/:packageId/subscribe",
  subscribeToPackage
);
