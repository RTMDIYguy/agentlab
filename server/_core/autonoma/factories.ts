import { defineFactory } from "@autonoma-ai/sdk";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { users, workspaces, workspacePackages } from "../../schema";
import { getUserByOpenId, upsertUser, getDb } from "../../db";

async function deleteById(table: any, id: number | string) {
  const db = await getDb();
  if (!db) return;
  await db.delete(table).where(eq(table.id, id));
}

// users — root entity. Creates through the app's real upsert path (which also
// derives the admin role for ENV.ownerOpenId), then re-reads the row for its id.
const User = defineFactory({
  inputSchema: z.object({
    openId: z.string(),
    name: z.string().optional(),
    email: z.string().optional(),
    loginMethod: z.string().optional(),
    role: z.enum(["user", "admin", "operator", "owner", "auditor"]).optional(),
  }),
  create: async data => {
    await upsertUser({
      openId: data.openId,
      name: data.name ?? "Test User",
      email: data.email ?? "test@example.com",
      loginMethod: data.loginMethod ?? null,
      role: data.role,
    });
    const row = await getUserByOpenId(data.openId);
    if (!row)
      throw new Error(`upsertUser did not persist openId=${data.openId}`);
    return row as unknown as Record<string, unknown> & { id: string };
  },
  teardown: async record => deleteById(users, record.id as string),
});

export const factories = {
  users: User,
};
