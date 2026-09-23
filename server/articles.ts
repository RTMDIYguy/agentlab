import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { eq, desc, and, isNull, sql } from "drizzle-orm";
import { getDb } from "./db";
import { articles, users } from "./schema";

export const articlesRouter = router({
  getMyArticles: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(200).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database unavailable");
      }
      const rows = await db
        .select()
        .from(articles)
        .where(eq(articles.ownerOpenId, ctx.user!.openId))
        .orderBy(desc(articles.createdAt))
        .limit(input.limit);
      return rows.map(rowToArticle);
    }),

  getBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database unavailable");
      }
      const rows = await db
        .select()
        .from(articles)
        .where(
          and(
            eq(articles.slug, input.slug),
            eq(articles.ownerOpenId, ctx.user!.openId)
          )
        )
        .limit(1);
      if (rows.length === 0) {
        throw new Error(`Article not found: ${input.slug}`);
      }
      return rowToArticle(rows[0]);
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        excerpt: z.string().optional(),
        content: z.string().min(1),
        slug: z.string().min(1),
        category: z.string().default("General"),
        status: z.enum(["draft", "scheduled", "published"]).default("draft"),
        scheduledFor: z.string().optional(),
        featuredImage: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database unavailable");
      }
      const scheduledFor =
        input.status === "scheduled" && input.scheduledFor
          ? new Date(input.scheduledFor)
          : null;
      const [row] = await db
        .insert(articles)
        .values({
          ownerOpenId: ctx.user!.openId,
          title: input.title,
          excerpt: input.excerpt || null,
          content: input.content,
          slug: input.slug,
          category: input.category,
          status: input.status,
          scheduledFor,
          featuredImage: input.featuredImage || null,
        })
        .returning();
      return rowToArticle(row);
    }),

  update: protectedProcedure
    .input(
      z.object({
        articleId: z.number().int().positive(),
        title: z.string().min(1),
        excerpt: z.string().optional(),
        content: z.string().min(1),
        category: z.string().default("General"),
        status: z.enum(["draft", "scheduled", "published"]).default("draft"),
        scheduledFor: z.string().optional(),
        featuredImage: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database unavailable");
      }
      const scheduledFor =
        input.status === "scheduled" && input.scheduledFor
          ? new Date(input.scheduledFor)
          : null;
      const [row] = await db
        .update(articles)
        .set({
          title: input.title,
          excerpt: input.excerpt ?? articles.excerpt,
          content: input.content,
          category: input.category,
          status: input.status,
          scheduledFor,
          featuredImage: input.featuredImage ?? articles.featuredImage,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(articles.id, input.articleId),
            eq(articles.ownerOpenId, ctx.user!.openId)
          )
        )
        .returning();
      if (!row) {
        throw new Error("Article not found or not owned by you");
      }
      return rowToArticle(row);
    }),

  /**
   * Public: all published articles (blog index). Authors' display names are
   * pulled from the users table so the blog renders real authors.
   */
  getPublished: publicProcedure
    .input(
      z
        .object({ limit: z.number().min(1).max(100).default(50) })
        .default({ limit: 50 })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      const rows = await db
        .select({
          id: articles.id,
          title: articles.title,
          excerpt: articles.excerpt,
          slug: articles.slug,
          category: articles.category,
          status: articles.status,
          featuredImage: articles.featuredImage,
          views: articles.views,
          createdAt: articles.createdAt,
          publishedAt: articles.scheduledFor,
          authorName: users.name,
        })
        .from(articles)
        .leftJoin(users, eq(users.openId, articles.ownerOpenId))
        .where(eq(articles.status, "published"))
        .orderBy(desc(articles.updatedAt))
        .limit(input.limit);

      return rows.map(row => ({
        id: row.id,
        title: row.title,
        excerpt: row.excerpt || "",
        slug: row.slug,
        category: row.category,
        featuredImage: row.featuredImage || "",
        views: row.views ?? 0,
        authorName: row.authorName || "Uncle Robert Consulting",
        publishedAt: (row.publishedAt || row.createdAt).toISOString(),
      }));
    }),

  /**
   * Public: single published article by slug (blog detail).
   */
  getPublishedBySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1).max(255) }))
    .query(async ({ input }) => {
      const db = await getDb();
      const [row] = await db
        .select({
          id: articles.id,
          title: articles.title,
          excerpt: articles.excerpt,
          content: articles.content,
          slug: articles.slug,
          category: articles.category,
          status: articles.status,
          featuredImage: articles.featuredImage,
          views: articles.views,
          createdAt: articles.createdAt,
          updatedAt: articles.updatedAt,
          scheduledFor: articles.scheduledFor,
          authorName: users.name,
        })
        .from(articles)
        .leftJoin(users, eq(users.openId, articles.ownerOpenId))
        .where(
          and(
            eq(articles.slug, input.slug),
            eq(articles.status, "published")
          )
        )
        .limit(1);

      if (!row) {
        throw new Error(`Article not found: ${input.slug}`);
      }

      return {
        id: row.id,
        title: row.title,
        excerpt: row.excerpt || "",
        content: row.content,
        slug: row.slug,
        category: row.category,
        featuredImage: row.featuredImage || "",
        views: row.views ?? 0,
        authorName: row.authorName || "Uncle Robert Consulting",
        publishedAt: (row.scheduledFor || row.createdAt).toISOString(),
      };
    }),

  /** Related published articles (same category, excludes current). */
  getRelated: publicProcedure
    .input(
      z.object({
        slug: z.string().min(1).max(255),
        limit: z.number().min(1).max(6).default(3),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      const [current] = await db
        .select({ category: articles.category })
        .from(articles)
        .where(eq(articles.slug, input.slug))
        .limit(1);

      if (!current) return [];

      const rows = await db
        .select({
          id: articles.id,
          title: articles.title,
          excerpt: articles.excerpt,
          slug: articles.slug,
          category: articles.category,
          createdAt: articles.createdAt,
        })
        .from(articles)
        .where(
          and(
            eq(articles.status, "published"),
            eq(articles.category, current.category),
            sql`${articles.slug} <> ${input.slug}`
          )
        )
        .orderBy(desc(articles.updatedAt))
        .limit(input.limit);

      return rows.map(row => ({
        id: row.id,
        title: row.title,
        excerpt: row.excerpt || "",
        slug: row.slug,
        category: row.category,
        publishedAt: row.createdAt.toISOString(),
      }));
    }),

  /** Increment view counter when an article is read. */
  incrementViews: publicProcedure
    .input(z.object({ slug: z.string().min(1).max(255) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db
        .update(articles)
        .set({ views: sql`${articles.views} + 1` })
      .where(eq(articles.slug, input.slug));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ articleId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database unavailable");
      }
      const [deleted] = await db
        .delete(articles)
        .where(
          and(
            eq(articles.id, input.articleId),
            eq(articles.ownerOpenId, ctx.user!.openId)
          )
        )
        .returning({ id: articles.id });
      if (!deleted) {
        throw new Error("Article not found or not owned by you");
      }
      return { success: true, articleId: input.articleId };
    }),
});

function rowToArticle(row: any) {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt || "",
    content: row.content,
    slug: row.slug,
    category: row.category,
    status: row.status,
    scheduledFor: row.scheduledFor
      ? row.scheduledFor.toISOString()
      : null,
    featuredImage: row.featuredImage || "",
    views: row.views ?? 0,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
