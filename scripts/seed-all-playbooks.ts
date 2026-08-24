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
    console.log("Creating dummy workspace...");
    await db.insert(workspaces).values({ 
      id: dummyWorkspaceId, 
      name: "System Playbook Workspace", 
      slug: "system-playbooks" 
    });
  }

  console.log("0. Cleaning up old playbook data...");
  // Clear any existing dummy workflow/package data for this workspace to avoid duplicates
  const packagesToDelete = ["ops-playbook", "fin-playbook", "ful-playbook"];
  for (const pkgId of packagesToDelete) {
    await db.delete(knowledgePackages).where(eq(knowledgePackages.id, pkgId)).catch(() => {});
  }
  
  // We'll leave existing workflows from seed-playbooks.ts intact.

  console.log("1. Creating Agents...");
  const agentOpsId = crypto.randomUUID();
  const agentFinId = crypto.randomUUID();
  const agentFulId = crypto.randomUUID();

  await db.insert(agents).values([
    {
      id: agentOpsId,
      workspaceId: dummyWorkspaceId,
      name: "Operations Analyst",
      role: "operations",
      systemPrompt: "You are an operations analyst. Monitor SOP adherence and OKR progress. Flag deviations and update strategy trackers automatically.",
    },
    {
      id: agentFinId,
      workspaceId: dummyWorkspaceId,
      name: "Financial Controller",
      role: "finance",
      systemPrompt: "You are a financial controller. Track AR/AP, manage pricing margins, and ensure Frappe is aligned with current invoicing.",
    },
    {
      id: agentFulId,
      workspaceId: dummyWorkspaceId,
      name: "Client Health Monitor",
      role: "fulfillment",
      systemPrompt: "You are a client health and delivery monitor. Identify at-risk clients, trigger aftercare workflows, and ask for testimonials at milestones.",
    },
  ]);

  console.log("2. Creating Knowledge Packages...");
  const opsPackageId = "ops-playbook";
  const finPackageId = "fin-playbook";
  const fulPackageId = "ful-playbook";

  await db.insert(knowledgePackages).values([
    {
      id: opsPackageId,
      name: "Operations Playbook",
      description: "Automate your SOP Registry and OKR Strategy Tracking. Built on the Uncle Robert Consulting operational architecture.",
      departmentCode: "OPS",
      monthlyPrice: "199.00",
    },
    {
      id: finPackageId,
      name: "Finance Playbook",
      description: "Pricing, Expenses, and AR/AP trackers. Essential for maintaining Frappe integration and financial control.",
      departmentCode: "FIN",
      monthlyPrice: "299.00",
    },
    {
      id: fulPackageId,
      name: "Fulfillment Playbook",
      description: "Client health dashboards and aftercare continuity. Reduce churn and increase referrals with automated touchpoints.",
      departmentCode: "FUL",
      monthlyPrice: "199.00",
    }
  ]);

  console.log("2.1. Subscribing Workspace to Knowledge Packages...");
  await db.insert(workspacePackages).values([
    { workspaceId: dummyWorkspaceId, packageId: opsPackageId, status: "active" },
    { workspaceId: dummyWorkspaceId, packageId: finPackageId, status: "active" },
    { workspaceId: dummyWorkspaceId, packageId: fulPackageId, status: "active" },
  ]);

  console.log("3. Creating Workflows...");
  const wfOps1 = crypto.randomUUID();
  const wfOps2 = crypto.randomUUID();
  const wfFin1 = crypto.randomUUID();
  const wfFin2 = crypto.randomUUID();
  const wfFul1 = crypto.randomUUID();
  const wfFul2 = crypto.randomUUID();

  await db.insert(workflows).values([
    {
      id: wfOps1,
      workspaceId: dummyWorkspaceId,
      name: "OPS-01 SOP Registry Version Tracker",
      description: "Automatically tracks changes to standard operating procedures and prompts teams to review outdated SOPs.",
      status: "active",
      triggerType: "schedule",
    },
    {
      id: wfOps2,
      workspaceId: dummyWorkspaceId,
      name: "OPS-03 Strategy OKR Tracker",
      description: "Weekly sync to gather OKR progress from departmental heads and update the executive command layer.",
      status: "active",
      triggerType: "schedule",
    },
    {
      id: wfFin1,
      workspaceId: dummyWorkspaceId,
      name: "FIN-01 Pricing & Expenses Tracker",
      description: "Monitors vendor costs and triggers alerts when project margins drop below thresholds.",
      status: "active",
      triggerType: "webhook",
    },
    {
      id: wfFin2,
      workspaceId: dummyWorkspaceId,
      name: "FIN-03 AR & AP Tracker",
      description: "Identifies overdue invoices in Frappe and initiates courteous follow-up sequences.",
      status: "active",
      triggerType: "schedule",
    },
    {
      id: wfFul1,
      workspaceId: dummyWorkspaceId,
      name: "FUL-02 Client Health Dashboard",
      description: "Aggregates communication frequency and ticket resolution times to generate a client health score.",
      status: "active",
      triggerType: "event",
    },
    {
      id: wfFul2,
      workspaceId: dummyWorkspaceId,
      name: "FUL-05 Analytics KPI Dashboard",
      description: "End of month reporting compiler that sends performance summaries directly to active clients.",
      status: "active",
      triggerType: "schedule",
    },
  ]);

  console.log("4. Creating Workflow Steps...");
  await db.insert(workflowSteps).values([
    // OPS-01
    {
      workspaceId: dummyWorkspaceId, workflowId: wfOps1, orderIndex: 0, stepType: "trigger", title: "Weekly Schedule",
      actionPrompt: "Trigger every Monday at 9AM to scan for SOPs older than 90 days."
    },
    {
      workspaceId: dummyWorkspaceId, workflowId: wfOps1, agentId: agentOpsId, orderIndex: 1, stepType: "agent", title: "Identify Stale SOPs",
      actionPrompt: "Read the OPS01_SOP_Registry_Version_Tracker.xlsx. Identify any SOP without a review date in the last quarter."
    },
    {
      workspaceId: dummyWorkspaceId, workflowId: wfOps1, orderIndex: 2, stepType: "guardrail", title: "Verify Owner Exists",
      actionPrompt: "Ensure the assigned department head is still active before sending notifications."
    },
    {
      workspaceId: dummyWorkspaceId, workflowId: wfOps1, orderIndex: 3, stepType: "destination", title: "Notify via AgentMail",
      actionPrompt: "Send a summary email via urcagentcomms@agentmail.to requesting SOP review."
    },

    // OPS-03
    {
      workspaceId: dummyWorkspaceId, workflowId: wfOps2, orderIndex: 0, stepType: "trigger", title: "Weekly Sync",
      actionPrompt: "Trigger every Friday at 1PM for end-of-week OKR gathering."
    },
    {
      workspaceId: dummyWorkspaceId, workflowId: wfOps2, agentId: agentOpsId, orderIndex: 1, stepType: "agent", title: "Compile OKR Updates",
      actionPrompt: "Analyze the week's completed tasks across departments and map them to the OPS03_Strategy_OKR_Tracker.xlsx."
    },
    {
      workspaceId: dummyWorkspaceId, workflowId: wfOps2, orderIndex: 2, stepType: "destination", title: "Update Executive Dashboard",
      actionPrompt: "Push the aggregated OKR completion percentages to the Executive Command Center."
    },

    // FIN-01
    {
      workspaceId: dummyWorkspaceId, workflowId: wfFin1, orderIndex: 0, stepType: "trigger", title: "Expense Added",
      actionPrompt: "Listen for new entries in the FIN01_Pricing_Expenses_Tracker.xlsx."
    },
    {
      workspaceId: dummyWorkspaceId, workflowId: wfFin1, agentId: agentFinId, orderIndex: 1, stepType: "agent", title: "Calculate Margins",
      actionPrompt: "Recalculate project margins. If the margin drops below 40%, prepare an alert."
    },
    {
      workspaceId: dummyWorkspaceId, workflowId: wfFin1, orderIndex: 2, stepType: "guardrail", title: "Threshold Check",
      actionPrompt: "Only proceed if the margin flag is raised. Otherwise, halt workflow."
    },
    {
      workspaceId: dummyWorkspaceId, workflowId: wfFin1, orderIndex: 3, stepType: "destination", title: "Alert Robert",
      actionPrompt: "Send margin warning directly to robert-4826@agentmail.to."
    },

    // FIN-03
    {
      workspaceId: dummyWorkspaceId, workflowId: wfFin2, orderIndex: 0, stepType: "trigger", title: "AR Scanner",
      actionPrompt: "Run daily at 8AM to check FIN03_AR_AP_Tracker.xlsx for overdue accounts."
    },
    {
      workspaceId: dummyWorkspaceId, workflowId: wfFin2, agentId: agentFinId, orderIndex: 1, stepType: "agent", title: "Draft Follow-Up",
      actionPrompt: "Draft a polite, firm payment reminder email referencing the exact invoice number and overdue amount."
    },
    {
      workspaceId: dummyWorkspaceId, workflowId: wfFin2, orderIndex: 2, stepType: "guardrail", title: "Human Review",
      actionPrompt: "Pause and require manual approval before sending AR emails for enterprise clients."
    },
    {
      workspaceId: dummyWorkspaceId, workflowId: wfFin2, orderIndex: 3, stepType: "destination", title: "Send Collection Email",
      actionPrompt: "Dispatch the email from urcsupport@agentmail.to."
    },

    // FUL-02
    {
      workspaceId: dummyWorkspaceId, workflowId: wfFul1, orderIndex: 0, stepType: "trigger", title: "Support Ticket Closed",
      actionPrompt: "Trigger when a client ticket is resolved in the Fulfillment system."
    },
    {
      workspaceId: dummyWorkspaceId, workflowId: wfFul1, agentId: agentFulId, orderIndex: 1, stepType: "agent", title: "Assess Client Health",
      actionPrompt: "Review recent interactions. Update the FUL-02_Client_Health_Dashboard.xlsx score based on resolution speed."
    },
    {
      workspaceId: dummyWorkspaceId, workflowId: wfFul1, orderIndex: 2, stepType: "destination", title: "Update CRM",
      actionPrompt: "Sync the new health score back to the client's record in Hubspot/Frappe."
    },

    // FUL-05
    {
      workspaceId: dummyWorkspaceId, workflowId: wfFul2, orderIndex: 0, stepType: "trigger", title: "End of Month",
      actionPrompt: "Trigger on the 28th of every month."
    },
    {
      workspaceId: dummyWorkspaceId, workflowId: wfFul2, agentId: agentFulId, orderIndex: 1, stepType: "agent", title: "Generate Report",
      actionPrompt: "Compile all monthly wins and metrics into the FUL-05_Analytics_KPI_Dashboard format for each active client."
    },
    {
      workspaceId: dummyWorkspaceId, workflowId: wfFul2, orderIndex: 2, stepType: "guardrail", title: "Data Verification",
      actionPrompt: "Check that no empty metric fields exist in the report before sending."
    },
    {
      workspaceId: dummyWorkspaceId, workflowId: wfFul2, orderIndex: 3, stepType: "destination", title: "Deliver Report",
      actionPrompt: "Send the tailored analytics report to the client via urcsupport@agentmail.to."
    },
  ]);

  console.log("Seeding complete! All URC playbooks and workflows added.");
  process.exit(0);
}

run().catch((err) => {
  console.error("Error running seeder:", err);
  process.exit(1);
});

