import { Router } from "express";
import { handleOrchestratorChat } from "../controllers/orchestrator";
import { getAgents } from "../controllers/agents";
import { getWorkflows, deployWorkflow } from "../controllers/workflows";
import {
  triggerRun,
  listRuns,
  getRunDetails,
  approveRun,
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

// Marketplace Storefront
apiRouter.get("/marketplace/packages", getPackages);
apiRouter.post(
  "/marketplace/packages/:packageId/subscribe",
  subscribeToPackage
);
