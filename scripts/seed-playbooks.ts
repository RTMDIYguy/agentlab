import { eq } from "drizzle-orm";
import { getDb } from "../server/db";
import {
  workspaces,
  knowledgePackages,
  workspacePackages,
  workflows,
  workflowSteps,
  agents,
} from "../server/schema";
import crypto from "crypto";

async function run() {
  const db = await getDb();
  if (!db) {
    console.error("Failed to connect to database");
    process.exit(1);
  }

  // 1. Get the dummy workspace (assuming it exists from previous seeding)
  const dummyWorkspaceId = "00000000-0000-0000-0000-000000000001";
  const wCheck = await db.select().from(workspaces).where(eq(workspaces.id, dummyWorkspaceId)).limit(1);
  
  if (wCheck.length === 0) {
    console.error("Dummy workspace not found! Please run the previous seeder first.");
    process.exit(1);
  }

  console.log("0. Cleaning up old playbook data...");
  // Clear any existing dummy workflow/package data for this workspace to avoid duplicates
  // Because knowledgePackages is global, let's delete the global ones created by the script if any
  await db.delete(workspacePackages).where(eq(workspacePackages.workspaceId, dummyWorkspaceId));
  await db.delete(knowledgePackages).where(eq(knowledgePackages.id, "urc-core-playbook")).catch(() => {});
  
  await db.delete(workflows).where(eq(workflows.workspaceId, dummyWorkspaceId));
  await db.delete(agents).where(eq(agents.workspaceId, dummyWorkspaceId));

  console.log("1. Creating Agents...");
  const agent1Id = crypto.randomUUID();
  const agent2Id = crypto.randomUUID();

  await db.insert(agents).values([
    {
      id: agent1Id,
      workspaceId: dummyWorkspaceId,
      name: "Outreach Copilot",
      role: "copywriter",
      systemPrompt: "You are an expert copywriter. Draft highly converting cold outreach emails that avoid spam words and follow brand guidelines.",
    },
    {
      id: agent2Id,
      workspaceId: dummyWorkspaceId,
      name: "Onboarding Specialist",
      role: "assistant",
      systemPrompt: "You are a customer success specialist. Generate personalized onboarding welcome materials and checklists based on closed deal data.",
    },
  ]);

  console.log("2. Creating Knowledge Package (Global App Store)...");
  const packageId = "urc-core-playbook";
  await db.insert(knowledgePackages).values({
    id: packageId,
    name: "URC Full Proprietary Playbook",
    description: "Official marketing and sales workflows from Uncle Robert Consulting.",
    departmentCode: "MKT-SAL",
    monthlyPrice: "0.00",
  });

  console.log("2.1. Subscribing Workspace to Knowledge Package...");
  await db.insert(workspacePackages).values({
    workspaceId: dummyWorkspaceId,
    packageId: packageId,
    status: "active",
  });

  console.log("3. Creating Workflows...");
  const workflow1Id = crypto.randomUUID();
  const workflow2Id = crypto.randomUUID();

  await db.insert(workflows).values([
    {
      id: workflow1Id,
      workspaceId: dummyWorkspaceId,
      name: "MKT-05 Outreach & Engagement",
      description: "Cold outbound automation and community engagement. Overcomes rate limits and reply detection issues.",
      status: "active",
      triggerType: "webhook",
    },
    {
      id: workflow2Id,
      workspaceId: dummyWorkspaceId,
      name: "SAL-02 Client Onboarding",
      description: "Frictionless welcome sequences and data collection. Overcomes spam filters and calendar rendering failures.",
      status: "active",
      triggerType: "webhook",
    },
  ]);

  console.log("4. Creating Workflow Steps...");
  await db.insert(workflowSteps).values([
    // MKT-05 Steps
    {
      workspaceId: dummyWorkspaceId,
      workflowId: workflow1Id,
      orderIndex: 0,
      stepType: "trigger",
      title: "Webhook Trigger",
      actionPrompt: "Listen for new leads added to outreach CRM.",
    },
    {
      workspaceId: dummyWorkspaceId,
      workflowId: workflow1Id,
      agentId: agent1Id,
      orderIndex: 1,
      stepType: "agent",
      title: "Draft Outreach Email",
      actionPrompt: "Draft a personalized email for the incoming lead data.",
    },
    {
      workspaceId: dummyWorkspaceId,
      workflowId: workflow1Id,
      orderIndex: 2,
      stepType: "guardrail",
      title: "Spam & Brand Review",
      actionPrompt: "Review email for spam triggers and brand voice. Require human approval if flagged.",
    },
    {
      workspaceId: dummyWorkspaceId,
      workflowId: workflow1Id,
      orderIndex: 3,
      stepType: "destination",
      title: "Send via ESP",
      actionPrompt: "Send the approved email via preferred ESP API.",
    },

    // SAL-02 Steps
    {
      workspaceId: dummyWorkspaceId,
      workflowId: workflow2Id,
      orderIndex: 0,
      stepType: "trigger",
      title: "Deal Closed in CRM",
      actionPrompt: "Listen for Deal stage transition to Closed/Won.",
    },
    {
      workspaceId: dummyWorkspaceId,
      workflowId: workflow2Id,
      agentId: agent2Id,
      orderIndex: 1,
      stepType: "agent",
      title: "Generate Welcome Materials",
      actionPrompt: "Generate a personalized welcome email and specific onboarding checklist for the client.",
    },
    {
      workspaceId: dummyWorkspaceId,
      workflowId: workflow2Id,
      orderIndex: 2,
      stepType: "guardrail",
      title: "Human Approval",
      actionPrompt: "Pause execution and require manual approval before sending onboarding links.",
    },
    {
      workspaceId: dummyWorkspaceId,
      workflowId: workflow2Id,
      orderIndex: 3,
      stepType: "destination",
      title: "Send & Update CRM",
      actionPrompt: "Send welcome email with .ics attachment, and advance CRM stage.",
    },
  ]);

  console.log("Seeding complete! Real workflow data ingested successfully.");
  process.exit(0);
}

run().catch((err) => {
  console.error("Error running seeder:", err);
  process.exit(1);
});
