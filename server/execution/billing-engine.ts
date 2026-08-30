import { getDb } from "../db";
import { workspaces, auditLogs, workspacePackages, knowledgePackages } from "../schema";
import { lt, eq, and, sql, gte } from "drizzle-orm";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

/**
 * Smart Downgrade & Pay-As-You-Go Engine
 * Evaluates workspaces with expired trials. If they haven't purchased a subscription,
 * analyzes their usage over the last 30 days and gracefully downgrades them to a
 * "pay-as-you-go" tier containing only the playbook modules they actually used.
 */
export async function processTrialExpirations() {
  const db = await getDb();
  if (!db) return;

  try {
    const expiredWorkspaces = await db
      .select()
      .from(workspaces)
      .where(lt(workspaces.trialEndsAt, sql`now()`));

    for (const workspace of expiredWorkspaces) {
      // Check active packages for this workspace
      const packages = await db
        .select()
        .from(workspacePackages)
        .where(and(
          eq(workspacePackages.workspaceId, workspace.id),
          eq(workspacePackages.status, 'active')
        ));

      if (packages.length === 0) continue;

      // If they have stripeSubscriptionId on any package, skip (they are paying)
      const hasPaidSubs = packages.some(p => p.stripeSubscriptionId !== null && p.stripeSubscriptionId !== "");
      if (hasPaidSubs) continue;
      
      // Fetch audit logs (last 30 days usage)
      const logs = await db
        .select()
        .from(auditLogs)
        .where(and(
          eq(auditLogs.workspaceId, workspace.id),
          gte(auditLogs.createdAt, sql`now() - interval '30 days'`)
        ))
        .limit(100);

      const allPackages = await db.select().from(knowledgePackages);

      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (!apiKey) {
        console.warn("[Billing Engine] GOOGLE_GENERATIVE_AI_API_KEY not set, skipping smart downgrade LLM check.");
        continue;
      }
      
      const google = createGoogleGenerativeAI({ apiKey });
      
      try {
        const { text } = await generateText({
          model: google("gemini-2.5-flash") as any,
          system: `You are the AgentLab billing orchestrator. 
Analyze the provided audit logs of a workspace whose trial has ended.
Based on the workflows they actually ran, decide which knowledge packages from the catalog they should keep.
Respond with a JSON array of package IDs (e.g., ["mkt-playbook"]).
Only recommend packages that directly support the workflows they used. If none, return [].`,
          prompt: `Audit Logs: ${JSON.stringify(logs.map(l => ({ action: l.actionType, payload: l.payloadIn })))}\n\nCatalog: ${JSON.stringify(allPackages.map(p => ({ id: p.id, desc: p.description })))}`
        });

        // Parse JSON from LLM
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        let recommendedIds: string[] = [];

        if (jsonMatch) {
          try {
            recommendedIds = JSON.parse(jsonMatch[0]);
          } catch(e) {
            console.error("[Billing Engine] Failed to parse LLM JSON:", e);
          }
        }

        // Downgrade: set unneeded ones to canceled, keep recommended ones as pay_as_you_go
        for (const p of packages) {
          if (recommendedIds.includes(p.packageId)) {
            await db.update(workspacePackages)
              .set({ status: 'pay_as_you_go' })
              .where(and(
                eq(workspacePackages.workspaceId, workspace.id),
                eq(workspacePackages.packageId, p.packageId)
              ));
          } else {
             await db.update(workspacePackages)
              .set({ status: 'canceled' })
              .where(and(
                eq(workspacePackages.workspaceId, workspace.id),
                eq(workspacePackages.packageId, p.packageId)
              ));
          }
        }

        console.log(`[Billing Engine] Downgraded workspace ${workspace.id} to pay-as-you-go. Retained packages: ${recommendedIds.length > 0 ? recommendedIds.join(', ') : 'none'}`);

      } catch (e) {
        console.error(`[Billing Engine] Error evaluating workspace ${workspace.id}:`, e);
      }
    }
  } catch (err) {
    console.error("[Billing Engine] Fatal error processing trial expirations:", err);
  }
}
