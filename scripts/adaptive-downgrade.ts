import { getDb } from "../server/db";
import { workspaces, workspacePackages, knowledgePackages, auditLogs, workflows } from "../server/schema";
import { eq, lte, and, sql, inArray } from "drizzle-orm";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

async function runAdaptiveDowngrade() {
  console.log("[Downgrade] Starting adaptive downgrade sweep...");
  const db = await getDb();
  if (!db) {
    console.error("[Downgrade] Database connection failed");
    return;
  }

  try {
    // 1. Find expired trials
    const expiredWorkspaces = await db.select().from(workspaces)
      .where(lte(workspaces.trialEndsAt, sql`now()`));

    if (expiredWorkspaces.length === 0) {
      console.log("[Downgrade] No expired workspaces found.");
      return;
    }

    for (const workspace of expiredWorkspaces) {
      // 2. Check if they have an active paid subscription
      const packages = await db.select({
        packageId: workspacePackages.packageId,
        stripeSubscriptionId: workspacePackages.stripeSubscriptionId,
        departmentCode: knowledgePackages.departmentCode,
        name: knowledgePackages.name
      })
      .from(workspacePackages)
      .innerJoin(knowledgePackages, eq(workspacePackages.packageId, knowledgePackages.id))
      .where(eq(workspacePackages.workspaceId, workspace.id));

      if (packages.length === 0) continue;

      const hasPaidSub = packages.some(p => p.stripeSubscriptionId != null);
      if (hasPaidSub) {
        console.log(`[Downgrade] Workspace ${workspace.id} has a paid subscription. Skipping.`);
        continue;
      }

      console.log(`[Downgrade] Workspace ${workspace.id} trial expired without subscription. Analyzing usage...`);

      // 3. Fetch usage stats to determine which department is most critical.
      // We will aggregate auditLogs by workflow to see what they actually use.
      const logs = await db.select({
        workflowId: auditLogs.workflowId,
        workflowName: workflows.name,
        runCount: sql<number>`count(${auditLogs.id})`
      })
      .from(auditLogs)
      .leftJoin(workflows, eq(auditLogs.workflowId, workflows.id))
      .where(eq(auditLogs.workspaceId, workspace.id))
      .groupBy(auditLogs.workflowId, workflows.name);

      const usageStats = logs.map(l => `${l.workflowName || 'Unknown Workflow'}: ${l.runCount} runs`).join('\n');
      const availableDepartments = packages.map(p => `${p.departmentCode} (${p.name})`).join(', ');

      const prompt = `
        Analyze this user's workflow usage. They are dropping to a free tier. 
        Select the ONE most critical department they rely on to keep unlocked.
        
        Available Departments to choose from: ${availableDepartments}
        
        User's Usage Stats:
        ${usageStats || "No usage data. Pick their first installed department."}
      `;

      // 4. Call Gemini to decide
      const { object } = await generateObject({
        model: google("gemini-1.5-pro") as any,
        schema: z.object({
          keepUnlocked: z.string().describe("The departmentCode of the department to keep unlocked"),
          reason: z.string().describe("Explanation for why this department was chosen based on usage")
        }),
        prompt,
      });

      console.log(`[Downgrade] LLM selected department: ${object.keepUnlocked} because: ${object.reason}`);

      // 5. Apply downgrade
      const packageToKeep = packages.find(p => p.departmentCode === object.keepUnlocked) || packages[0];

      if (packageToKeep) {
        // Delete all other packages
        const otherPackageIds = packages
          .filter(p => p.packageId !== packageToKeep.packageId)
          .map(p => p.packageId);

        if (otherPackageIds.length > 0) {
          await db.delete(workspacePackages)
            .where(
              and(
                eq(workspacePackages.workspaceId, workspace.id),
                inArray(workspacePackages.packageId, otherPackageIds)
              )
            );
        }

        // Update the kept package
        await db.update(workspacePackages)
          .set({ dailyRunLimit: 5, status: 'active' })
          .where(
            and(
              eq(workspacePackages.workspaceId, workspace.id),
              eq(workspacePackages.packageId, packageToKeep.packageId)
            )
          );
          
        console.log(`[Downgrade] Downgraded workspace ${workspace.id}. Kept ${packageToKeep.packageId} with limit of 5 runs/day.`);
      }
    }

    console.log("[Downgrade] Sweep completed successfully.");
  } catch (error) {
    console.error("[Downgrade] Error in sweep:", error);
  }
}

// Allow running directly
if (require.main === module) {
  runAdaptiveDowngrade().then(() => process.exit(0)).catch(() => process.exit(1));
}
