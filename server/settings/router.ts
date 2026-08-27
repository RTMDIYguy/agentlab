import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import {
  workspaces,
  workspaceSecrets,
  workspaceIntegrations,
} from "../schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export const settingsRouter = router({
  // ==========================================
  // Workspace / LLM Settings
  // ==========================================
  getWorkspaceSettings: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = ctx.user.workspaceId;
    if (!workspaceId) throw new Error("No workspace ID found for user.");

    const [ws] = await db
      .select({
        id: workspaces.id,
        name: workspaces.name,
        orchestratorName: workspaces.orchestratorName,
        orchestratorSystemPrompt: workspaces.orchestratorSystemPrompt,
        defaultModel: workspaces.defaultModel,
      })
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    if (!ws) throw new Error("Workspace not found.");
    return ws;
  }),

  updateWorkspaceSettings: protectedProcedure
    .input(
      z.object({
        orchestratorName: z.string().min(1).max(128).optional(),
        orchestratorSystemPrompt: z.string().optional(),
        defaultModel: z.string().max(64).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const workspaceId = ctx.user.workspaceId;
      if (!workspaceId) throw new Error("No workspace ID found for user.");

      const [updated] = await db
        .update(workspaces)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(workspaces.id, workspaceId))
        .returning();

      return updated;
    }),

  // ==========================================
  // Secrets (Google Secret Manager Mock)
  // ==========================================
  getSecrets: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = ctx.user.workspaceId;
    if (!workspaceId) throw new Error("No workspace ID found for user.");

    return db
      .select()
      .from(workspaceSecrets)
      .where(eq(workspaceSecrets.workspaceId, workspaceId))
      .orderBy(workspaceSecrets.createdAt);
  }),

  upsertSecret: protectedProcedure
    .input(
      z.object({
        provider: z.string().min(1),
        value: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const workspaceId = ctx.user.workspaceId;
      if (!workspaceId) throw new Error("No workspace ID found for user.");

      // In production, this would write to GSM:
      // await gsm.addVersion(`projects/.../secrets/workspace_${workspaceId}_${input.provider}`, input.value);

      // Create a masked preview
      let maskedPreview = "********";
      if (input.value.length > 8) {
        maskedPreview =
          input.value.substring(0, 4) +
          "••••••••" +
          input.value.substring(input.value.length - 4);
      }

      // Check if secret metadata already exists
      const [existing] = await db
        .select()
        .from(workspaceSecrets)
        .where(
          and(
            eq(workspaceSecrets.workspaceId, workspaceId),
            eq(workspaceSecrets.provider, input.provider)
          )
        );

      if (existing) {
        const newVersion = (parseInt(existing.version) + 1).toString();
        const [updated] = await db
          .update(workspaceSecrets)
          .set({
            version: newVersion,
            maskedPreview,
            status: "connected",
            updatedAt: new Date(),
          })
          .where(eq(workspaceSecrets.id, existing.id))
          .returning();
        return updated;
      } else {
        const [inserted] = await db
          .insert(workspaceSecrets)
          .values({
            workspaceId,
            provider: input.provider,
            gsmSecretId: `workspace_${workspaceId.substring(0, 8)}_${input.provider}`,
            version: "1",
            maskedPreview,
            status: "connected",
          })
          .returning();
        return inserted;
      }
    }),

  deleteSecret: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = ctx.user.workspaceId;
      if (!workspaceId) throw new Error("No workspace ID found for user.");

      // Verify ownership
      const [existing] = await db
        .select()
        .from(workspaceSecrets)
        .where(
          and(
            eq(workspaceSecrets.id, input.id),
            eq(workspaceSecrets.workspaceId, workspaceId)
          )
        );

      if (!existing) throw new Error("Secret not found.");

      // In production, delete from GSM here.

      await db.delete(workspaceSecrets).where(eq(workspaceSecrets.id, input.id));
      return { success: true };
    }),

  // ==========================================
  // Integrations (MCP / Webhooks)
  // ==========================================
  getIntegrations: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = ctx.user.workspaceId;
    if (!workspaceId) throw new Error("No workspace ID found for user.");

    return db
      .select()
      .from(workspaceIntegrations)
      .where(eq(workspaceIntegrations.workspaceId, workspaceId))
      .orderBy(workspaceIntegrations.createdAt);
  }),

  upsertIntegration: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid().optional(),
        type: z.string(),
        name: z.string(),
        config: z.any(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const workspaceId = ctx.user.workspaceId;
      if (!workspaceId) throw new Error("No workspace ID found for user.");

      if (input.id) {
        const [existing] = await db
          .select()
          .from(workspaceIntegrations)
          .where(
            and(
              eq(workspaceIntegrations.id, input.id),
              eq(workspaceIntegrations.workspaceId, workspaceId)
            )
          );
        if (!existing) throw new Error("Integration not found.");

        const [updated] = await db
          .update(workspaceIntegrations)
          .set({
            type: input.type,
            name: input.name,
            config: input.config,
            updatedAt: new Date(),
          })
          .where(eq(workspaceIntegrations.id, input.id))
          .returning();
        return updated;
      } else {
        const [inserted] = await db
          .insert(workspaceIntegrations)
          .values({
            workspaceId,
            type: input.type,
            name: input.name,
            config: input.config,
            status: "active",
          })
          .returning();
        return inserted;
      }
    }),

  deleteIntegration: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = ctx.user.workspaceId;
      if (!workspaceId) throw new Error("No workspace ID found for user.");

      await db
        .delete(workspaceIntegrations)
        .where(
          and(
            eq(workspaceIntegrations.id, input.id),
            eq(workspaceIntegrations.workspaceId, workspaceId)
          )
        );
      return { success: true };
    }),
});
