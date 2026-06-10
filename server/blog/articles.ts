import { eq, and, desc, gte, lte, isNull } from "drizzle-orm";
import { blogArticles } from "../../drizzle/schema";
import { getDb } from "../db";

export async function createArticle(
  title: string,
  excerpt: string,
  content: string,
  slug: string,
  category: string,
  authorId: number,
  status: "draft" | "scheduled" | "published" = "draft",
  scheduledFor?: Date,
  featuredImage?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if slug already exists
  const existing = await db
    .select()
    .from(blogArticles)
    .where(eq(blogArticles.slug, slug))
    .limit(1);

  if (existing.length > 0) {
    throw new Error("Article with this slug already exists");
  }

  const result = await db.insert(blogArticles).values({
    title,
    excerpt,
    content,
    slug,
    category,
    authorId,
    status,
    scheduledFor: status === "scheduled" ? scheduledFor : null,
    publishedAt: status === "published" ? new Date() : null,
    featuredImage,
  });

  return result;
}

export async function updateArticle(
  articleId: number,
  updates: {
    title?: string;
    excerpt?: string;
    content?: string;
    category?: string;
    status?: "draft" | "scheduled" | "published";
    scheduledFor?: Date | null;
    featuredImage?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = { ...updates };

  // If publishing, set publishedAt
  if (updates.status === "published") {
    updateData.publishedAt = new Date();
  }

  await db.update(blogArticles).set(updateData).where(eq(blogArticles.id, articleId));

  return { success: true };
}

export async function getArticleById(articleId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const article = await db
    .select()
    .from(blogArticles)
    .where(eq(blogArticles.id, articleId))
    .limit(1);

  return article[0] || null;
}

export async function getArticleBySlug(slug: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const article = await db
    .select()
    .from(blogArticles)
    .where(eq(blogArticles.slug, slug))
    .limit(1);

  return article[0] || null;
}

export async function getPublishedArticles(limit: number = 10, offset: number = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const articles = await db
    .select()
    .from(blogArticles)
    .where(eq(blogArticles.status, "published"))
    .orderBy(desc(blogArticles.publishedAt))
    .limit(limit)
    .offset(offset);

  return articles;
}

export async function getAuthorArticles(authorId: number, limit: number = 20, offset: number = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const articles = await db
    .select()
    .from(blogArticles)
    .where(eq(blogArticles.authorId, authorId))
    .orderBy(desc(blogArticles.updatedAt))
    .limit(limit)
    .offset(offset);

  return articles;
}

export async function getScheduledArticles() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();

  const articles = await db
    .select()
    .from(blogArticles)
    .where(
      and(
        eq(blogArticles.status, "scheduled"),
        lte(blogArticles.scheduledFor, now)
      )
    );

  return articles;
}

export async function deleteArticle(articleId: number, authorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verify ownership
  const article = await db
    .select()
    .from(blogArticles)
    .where(eq(blogArticles.id, articleId))
    .limit(1);

  if (!article[0] || article[0].authorId !== authorId) {
    throw new Error("Unauthorized: You can only delete your own articles");
  }

  await db.delete(blogArticles).where(eq(blogArticles.id, articleId));

  return { success: true };
}

export async function publishScheduledArticles() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const scheduledArticles = await getScheduledArticles();

  for (const article of scheduledArticles) {
    await db
      .update(blogArticles)
      .set({
        status: "published",
        publishedAt: new Date(),
      })
      .where(eq(blogArticles.id, article.id));
  }

  return { published: scheduledArticles.length };
}

export async function incrementArticleViews(articleId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const article = await db
    .select()
    .from(blogArticles)
    .where(eq(blogArticles.id, articleId))
    .limit(1);

  if (!article[0]) throw new Error("Article not found");

  await db
    .update(blogArticles)
    .set({ views: (article[0].views || 0) + 1 })
    .where(eq(blogArticles.id, articleId));

  return { success: true };
}
