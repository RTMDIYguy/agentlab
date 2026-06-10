import { eq, and, desc, isNull } from "drizzle-orm";
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

export async function createReply(
  articleId: string,
  userId: number,
  content: string,
  parentCommentId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verify parent comment exists
  const parentComment = await db
    .select()
    .from(blogComments)
    .where(eq(blogComments.id, parentCommentId))
    .limit(1);

  if (!parentComment[0]) {
    throw new Error("Parent comment not found");
  }

  const result = await db.insert(blogComments).values({
    articleId,
    userId,
    content,
    parentCommentId,
    status: "approved",
  });

  return result;
}

export async function getCommentReplies(parentCommentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const replies = await db
    .select()
    .from(blogComments)
    .where(
      and(
        eq(blogComments.parentCommentId, parentCommentId),
        eq(blogComments.status, "approved")
      )
    )
    .orderBy(desc(blogComments.createdAt));

  return replies;
}

export async function getTopLevelComments(articleId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const comments = await db
    .select()
    .from(blogComments)
    .where(
      and(
        eq(blogComments.articleId, articleId),
        eq(blogComments.status, "approved"),
        isNull(blogComments.parentCommentId)
      )
    )
    .orderBy(desc(blogComments.createdAt));

  return comments;
}

export async function getCommentWithReplies(commentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const comment = await db
    .select()
    .from(blogComments)
    .where(eq(blogComments.id, commentId))
    .limit(1);

  if (!comment[0]) {
    throw new Error("Comment not found");
  }

  const replies = await getCommentReplies(commentId);

  return {
    ...comment[0],
    replies,
  };
}
