import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { auditLogs } from "../schema";
import { eq, or, desc } from "drizzle-orm";
import { z } from "zod";

export const auditingRouter = router({
  getAuditLogs: protectedProcedure.query(async ({ ctx }) => {
    // Fetch system_diagnostic logs + any warning/error logs for the workspace
    const logs = await db.select().from(auditLogs)
      .where(
        or(
          eq(auditLogs.actionType, "system_diagnostic"),
          eq(auditLogs.status, "warning"),
          eq(auditLogs.status, "error")
        )
      )
      .orderBy(desc(auditLogs.createdAt))
      .limit(100);

    // Make sure we only return logs for this workspace if this was a true multitenant setup,
    // but right now the UI just needs the logs. We should filter by workspaceId:
    return logs.filter(l => l.workspaceId === ctx.user.workspaceId);
  }),

  resolveLog: protectedProcedure
    .input(z.object({ logId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Placeholder for auto-resolution triggers
      await db.update(auditLogs)
        .set({ status: "success" }) // mark resolved
        .where(eq(auditLogs.id, input.logId));
      
      return { success: true };
    }),
});
