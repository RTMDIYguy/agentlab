import Stripe from "stripe";
import { getDb } from "../db";
import { auditLogs, workspaces } from "../schema";
import { eq, and, inArray } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_123", {
  apiVersion: "2024-04-10" as any,
});

export async function runMeteringJob() {
  console.log("[Metering] Starting Stripe metering job...");
  const db = await getDb();
  if (!db) {
    console.error("[Metering] Database connection failed");
    return;
  }

  try {
    // 1. Fetch unbilled successful audit logs
    const logs = await db.select()
      .from(auditLogs)
      .where(and(eq(auditLogs.status, "success"), eq(auditLogs.billed, false)));

    if (logs.length === 0) {
      console.log("[Metering] No unbilled logs to process.");
      return;
    }

    // 2. Group by workspaceId
    const workspaceTotals: Record<string, { totalCost: number, logIds: string[] }> = {};
    for (const log of logs) {
      if (!workspaceTotals[log.workspaceId]) {
        workspaceTotals[log.workspaceId] = { totalCost: 0, logIds: [] };
      }
      workspaceTotals[log.workspaceId].totalCost += parseFloat(log.cost || "0");
      workspaceTotals[log.workspaceId].logIds.push(log.id);
    }

    // 3. Process each workspace
    for (const [workspaceId, data] of Object.entries(workspaceTotals)) {
      if (data.totalCost <= 0) continue;

      // Fetch workspace to get stripeCustomerId
      const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
      
      if (!workspace) continue;
      
      // Calculate 10x margin (e.g. $0.02 cost -> $0.20 billed)
      const billedValue = data.totalCost * 10;
      
      // If no stripe customer id, we can't bill them in Stripe, but we might still mark as billed to avoid re-processing forever
      // Or we can leave them unbilled. We'll mark them to avoid infinitely accumulating if they never add a card.
      if (workspace.stripeCustomerId) {
        try {
          // Stripe requires the value to be a positive integer representing the smallest currency unit (e.g., cents), 
          // OR if using meter events with a specific configuration, a value. The meter events API takes `value` as a string.
          // Wait, the meterEvents v2 API takes value as a number. Let's pass it as a number or string based on Stripe SDK.
          // Wait, stripe.billing.meterEvents.create takes `event_name` and `payload`.
          await stripe.billing.meterEvents.create({
            event_name: 'workflow_run_cost',
            payload: {
              stripe_customer_id: workspace.stripeCustomerId,
              value: billedValue.toString() // We pass the string representation of the value
            }
          });
          console.log(`[Metering] Successfully billed workspace ${workspaceId} for ${billedValue}`);
        } catch (error) {
          console.error(`[Metering] Failed to meter workspace ${workspaceId}:`, error);
          continue; // skip marking as billed if stripe call fails
        }
      } else {
        console.log(`[Metering] Workspace ${workspaceId} has no Stripe customer ID. Skipping Stripe API call.`);
      }

      // 4. Mark logs as billed
      // Chunk logIds if there are too many to prevent statement too large errors
      const chunkSize = 1000;
      for (let i = 0; i < data.logIds.length; i += chunkSize) {
        const chunk = data.logIds.slice(i, i + chunkSize);
        await db.update(auditLogs)
          .set({ billed: true })
          .where(inArray(auditLogs.id, chunk));
      }
    }
    
    console.log("[Metering] Metering job completed successfully.");
  } catch (error) {
    console.error("[Metering] Fatal error in metering job:", error);
  }
}

// Allow running directly
if (require.main === module) {
  runMeteringJob().then(() => process.exit(0)).catch(() => process.exit(1));
}
