import { eq, and, desc } from "drizzle-orm";
import { blogComments } from "../../drizzle/schema";
import { getDb } from "../db";

export async function createComment(
  articleId: string,
  userId: number,
  content: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(blogComments).values({
    articleId,
    userId,
    content,
    status: "approved", // Auto-approve for now, can add moderation later
  });

  return result;
}

export async function getArticleComments(articleId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const comments = await db
    .select()
    .from(blogComments)
    .where(
      and(
        eq(blogComments.articleId, articleId),
        eq(blogComments.status, "approved")
      )
    )
    .orderBy(desc(blogComments.createdAt));

  return comments;
}

export async function deleteComment(commentId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Only allow users to delete their own comments
  const comment = await db
    .select()
    .from(blogComments)
    .where(eq(blogComments.id, commentId))
    .limit(1);

  if (!comment[0] || comment[0].userId !== userId) {
    throw new Error("Unauthorized");
  }

  await db.delete(blogComments).where(eq(blogComments.id, commentId));

  return { success: true };
}

export async function getCommentCount(articleId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(blogComments)
    .where(
      and(
        eq(blogComments.articleId, articleId),
        eq(blogComments.status, "approved")
      )
    );

  return result.length;
}
