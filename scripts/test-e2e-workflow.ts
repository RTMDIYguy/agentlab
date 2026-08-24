import { eq } from "drizzle-orm";
import { db } from "../server/db";
import { auditLogs, workspaces, workspacePackages, workflows } from "../server/schema";

const API_URL = "http://127.0.0.1:3000/api";
const HEADERS = {
  "Content-Type": "application/json",
  "x-workspace-id": "00000000-0000-0000-0000-000000000001",
};

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  try {
    console.log("0. Seeding Dummy Workspace and clearing old data...");
    await db.insert(workspaces).values({
      id: "00000000-0000-0000-0000-000000000001",
      name: "E2E Test Workspace",
      slug: "e2e-test-workspace",
    }).onConflictDoNothing();
    await db.delete(workspacePackages).where(eq(workspacePackages.workspaceId, "00000000-0000-0000-0000-000000000001"));
    const TEST_WORKFLOW_ID = "11111111-1111-1111-1111-111111111111";
    await db.delete(workflows).where(eq(workflows.id, TEST_WORKFLOW_ID));
    await db.insert(workflows).values({
      id: TEST_WORKFLOW_ID,
      workspaceId: "00000000-0000-0000-0000-000000000001",
      name: "E2E Test Workflow",
      triggerType: "manual"
    }).onConflictDoNothing();

    console.log("1. Fetching Marketplace Packages...");
    let res = await fetch(`${API_URL}/marketplace/packages`, { headers: HEADERS });
    if (!res.ok) throw new Error(`Failed to fetch packages: ${await res.text()}`);
    let { packages } = await res.json();
    console.log(`Found ${packages.length} packages.`);
    if (packages.length === 0) {
        console.log("No packages found, cannot continue.");
        return;
    }
    const pkgId = packages[0].id;

    console.log(`\n2. Subscribing to Package: ${pkgId}...`);
    res = await fetch(`${API_URL}/marketplace/packages/${pkgId}/subscribe`, {
      method: "POST",
      headers: HEADERS,
    });
    if (!res.ok) throw new Error(`Failed to subscribe: ${await res.text()}`);
    console.log("Subscribed successfully.");

    console.log("\n3. Fetching Workflows...");
    res = await fetch(`${API_URL}/workflows`, { headers: HEADERS });
    if (!res.ok) throw new Error(`Failed to fetch workflows: ${await res.text()}`);
    let { workflows: fetchedWorkflows } = await res.json();
    console.log(`Found ${fetchedWorkflows.length} workflows.`);
    if (fetchedWorkflows.length === 0) {
        console.log("No workflows found after subscription.");
        return;
    }
    const workflowId = fetchedWorkflows[0].id;

    console.log(`\n4. Running Workflow: ${workflowId}...`);
    res = await fetch(`${API_URL}/workflows/${workflowId}/run`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ initialContext: { test: true } }),
    });
    if (!res.ok) throw new Error(`Failed to run workflow: ${await res.text()}`);
    const runResult = await res.json();
    const runId = runResult.runId;
    console.log(`Run started with ID: ${runId}`);

    console.log("\n5. Polling for 'paused_for_approval' status...");
    let status = "";
    while (status !== "paused_for_approval" && status !== "completed" && status !== "failed") {
      res = await fetch(`${API_URL}/runs/${runId}`, { headers: HEADERS });
      if (!res.ok) throw new Error(`Failed to fetch run status: ${await res.text()}`);
      const runData = await res.json();
      status = runData.run.status;
      console.log(`Current status: ${status}`);
      if (status === "paused_for_approval") break;
      await delay(2000);
    }

    if (status === "paused_for_approval") {
      console.log("\n6. Approving Run...");
      res = await fetch(`${API_URL}/runs/${runId}/approve`, {
        method: "POST",
        headers: HEADERS,
      });
      if (!res.ok) throw new Error(`Failed to approve run: ${await res.text()}`);
      console.log("Run approved.");

      console.log("\n7. Polling for 'completed' status...");
      status = "";
      while (status !== "completed" && status !== "failed") {
        res = await fetch(`${API_URL}/runs/${runId}`, { headers: HEADERS });
        if (!res.ok) throw new Error(`Failed to fetch run status: ${await res.text()}`);
        const runData = await res.json();
        status = runData.run.status;
        console.log(`Current status: ${status}`);
        if (status === "completed" || status === "failed") break;
        await delay(2000);
      }
    } else {
      console.log("Run did not pause for approval. Proceeding to audit logs.");
    }

    console.log("\n8. Verifying Audit Logs...");
    const logs = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.workspaceId, "00000000-0000-0000-0000-000000000001"));
    
    console.log(`Found ${logs.length} audit log entries for the workspace.`);
    let totalTokens = 0;
    let totalLatency = 0;
    let totalCost = 0;
    for (const log of logs) {
      totalTokens += log.tokensTotal || 0;
      totalLatency += log.latencyMs || 0;
      totalCost += parseFloat(log.cost as string) || 0;
    }
    console.log("--- Audit Summary ---");
    console.log(`Total Tokens:  ${totalTokens}`);
    console.log(`Total Latency: ${totalLatency} ms`);
    console.log(`Total Cost:    $${totalCost}`);
    console.log("---------------------");

    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
}

run();
