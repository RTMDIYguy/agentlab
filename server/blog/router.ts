import { z } from "zod";
import { and, asc, eq, sql } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb, getUserByOpenId } from "../db";
import { blogComments } from "../schema";

const contentSchema = z.string().trim().min(1).max(5000);

function rowToComment(row: any) {
  return {
    id: row.id,
    articleId: row.articleId,
    userId: row.userId,
    authorName: row.authorName,
    parentCommentId: row.parentCommentId,
    content: row.content,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

export const blogRouter = router({
  /** Threaded top-level comments for an article (public read for signed-in blog). */
  getThreadedComments: protectedProcedure
    .input(z.object({ articleId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const rows = await db
        .select()
        .from(blogComments)
        .where(
          and(
            eq(blogComments.articleId, input.articleId),
            sql`${blogComments.parentCommentId} is null`,
            eq(blogComments.status, "visible")
          )
        )
        .orderBy(asc(blogComments.createdAt));
      return rows.map(rowToComment);
    }),

  /** Replies for a given comment. */
  getCommentReplies: protectedProcedure
    .input(z.object({ commentId: z.string().uuid() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const rows = await db
        .select()
        .from(blogComments)
        .where(
          and(
            eq(blogComments.parentCommentId, input.commentId),
            eq(blogComments.status, "visible")
          )
        )
        .orderBy(asc(blogComments.createdAt));
      return rows.map(rowToComment);
    }),

  /** Count of visible comments on an article. */
  getCommentCount: protectedProcedure
    .input(z.object({ articleId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const [row] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(blogComments)
        .where(
          and(
            eq(blogComments.articleId, input.articleId),
            eq(blogComments.status, "visible")
          )
        );
      return { count: row?.count ?? 0 };
    }),

  /** Create a top-level comment. */
  createComment: protectedProcedure
    .input(
      z.object({
        articleId: z.number().int().positive(),
        content: contentSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const user = await getUserByOpenId(ctx.user!.openId);
      const [row] = await db
        .insert(blogComments)
        .values({
          articleId: input.articleId,
          userId: user?.id ?? null,
          content: input.content,
        })
        .returning();
      return rowToComment(row);
    }),

  /** Create a reply to an existing comment. */
  createReply: protectedProcedure
    .input(
      z.object({
        articleId: z.number().int().positive(),
        parentCommentId: z.string().uuid(),
        content: contentSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const user = await getUserByOpenId(ctx.user!.openId);
      const [row] = await db
        .insert(blogComments)
        .values({
          articleId: input.articleId,
          userId: user?.id ?? null,
          parentCommentId: input.parentCommentId,
          content: input.content,
        })
        .returning();
      return rowToComment(row);
    }),

  /** Soft-delete your own comment (admins may delete any). */
  deleteComment: protectedProcedure
    .input(z.object({ commentId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const user = await getUserByOpenId(ctx.user!.openId);
      if (!user) {
        throw new Error("User not found");
      }

      const [row] = await db
        .select()
        .from(blogComments)
        .where(eq(blogComments.id, input.commentId))
        .limit(1);

      if (!row) {
        throw new Error("Comment not found");
      }

      const isOwner = row.userId === user.id;
      const isAdmin = ctx.user!.role === "admin";
      if (!isOwner && !isAdmin) {
        throw new Error("You can only delete your own comments");
      }

      await db
        .update(blogComments)
        .set({ status: "deleted", updatedAt: new Date() })
        .where(eq(blogComments.id, input.commentId));

      return { success: true };
    }),
});
