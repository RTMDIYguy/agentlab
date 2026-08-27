import { db } from "./server/db";
import { workflows, workflowSteps, agents, workspaces } from "./server/schema";
import { eq } from "drizzle-orm";

async function main() {
  const URC_WORKSPACE_ID = "00000000-0000-0000-0000-000000000000";

  console.log("--- Seeding Live URC Outreach Workflow ---");

  // 1. Get URC workspace
  const urc = await db.select().from(workspaces).where(eq(workspaces.id, URC_WORKSPACE_ID));
  if (urc.length === 0) {
    console.error("Failed to find URC workspace");
    process.exit(1);
  }

  // 2. Find or create the Ops Agent
  let agentId: string;
  const existingAgents = await db.select().from(agents).where(eq(agents.workspaceId, URC_WORKSPACE_ID));
  if (existingAgents.length > 0) {
    agentId = existingAgents[0].id;
  } else {
    const newAgent = await db.insert(agents).values({
      workspaceId: URC_WORKSPACE_ID,
      name: "Outreach Ops Agent",
      role: "content_creator",
      systemPrompt: "You are the primary content creator for Uncle Robert Consulting. Your goal is to draft engaging LinkedIn posts.",
      status: "idle",
    }).returning();
    agentId = newAgent[0].id;
  }

  // 3. Create the Workflow
  const newWorkflow = await db.insert(workflows).values({
    workspaceId: URC_WORKSPACE_ID,
    name: "MKT-01: Daily LinkedIn Outreach",
    description: "Automatically scrape industry news and draft a thought-leadership LinkedIn post for review.",
    triggerType: "schedule",
    cronExpression: "0 8 * * *", // 8 AM every day
    status: "active",
  }).returning();

  const workflowId = newWorkflow[0].id;

  // 4. Create the Workflow Step
  await db.insert(workflowSteps).values({
    workspaceId: URC_WORKSPACE_ID,
    workflowId,
    agentId,
    orderIndex: 0,
    stepType: "agent",
    title: "Draft Post",
    actionPrompt: "Draft a LinkedIn post addressing SaaS founders on how AI agentic systems reduce OpEx.",
  });

  console.log("Successfully seeded Live URC Outreach Workflow: " + newWorkflow[0].name);
  process.exit(0);
}

main().catch(console.error);
