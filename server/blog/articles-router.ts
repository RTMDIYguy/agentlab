import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import {
  createArticle,
  updateArticle,
  getArticleById,
  getArticleBySlug,
  getPublishedArticles,
  getAuthorArticles,
  deleteArticle,
} from "./articles";
import { TRPCError } from "@trpc/server";

export const articlesRouter = router({
  // Get published articles with pagination
  getPublished: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const articles = await getPublishedArticles(input.limit, input.offset);
        return articles;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch articles",
        });
      }
    }),

  // Get article by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      try {
        const article = await getArticleBySlug(input.slug);
        if (!article) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Article not found",
          });
        }
        return article;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch article",
        });
      }
    }),

  // Get author's articles (requires auth)
  getMyArticles: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const articles = await getAuthorArticles(ctx.user.id, input.limit, input.offset);
        return articles;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch your articles",
        });
      }
    }),

  // Create new article
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        excerpt: z.string().max(500),
        content: z.string().min(1),
        slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
        category: z.string().default("General"),
        status: z.enum(["draft", "scheduled", "published"]).default("draft"),
        scheduledFor: z.date().optional(),
        featuredImage: z.string().url().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Validate scheduling
        if (input.status === "scheduled" && !input.scheduledFor) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Scheduled articles must have a scheduledFor date",
          });
        }

        if (input.scheduledFor && input.scheduledFor < new Date()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Scheduled date must be in the future",
          });
        }

        await createArticle(
          input.title,
          input.excerpt,
          input.content,
          input.slug,
          input.category,
          ctx.user.id,
          input.status,
          input.scheduledFor,
          input.featuredImage
        );

        return { success: true, message: "Article created successfully" };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        if (error instanceof Error && error.message.includes("already exists")) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Article with this slug already exists",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create article",
        });
      }
    }),

  // Update article
  update: protectedProcedure
    .input(
      z.object({
        articleId: z.number(),
        title: z.string().min(1).max(255).optional(),
        excerpt: z.string().max(500).optional(),
        content: z.string().min(1).optional(),
        category: z.string().optional(),
        status: z.enum(["draft", "scheduled", "published"]).optional(),
        scheduledFor: z.date().optional().nullable(),
        featuredImage: z.string().url().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const article = await getArticleById(input.articleId);

        if (!article) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Article not found",
          });
        }

        if (article.authorId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only edit your own articles",
          });
        }

        // Validate scheduling if status is being changed to scheduled
        if (input.status === "scheduled" && !input.scheduledFor) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Scheduled articles must have a scheduledFor date",
          });
        }

        if (input.scheduledFor && input.scheduledFor < new Date()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Scheduled date must be in the future",
          });
        }

        await updateArticle(input.articleId, {
          title: input.title,
          excerpt: input.excerpt,
          content: input.content,
          category: input.category,
          status: input.status,
          scheduledFor: input.scheduledFor,
          featuredImage: input.featuredImage,
        });

        return { success: true, message: "Article updated successfully" };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update article",
        });
      }
    }),

  // Delete article
  delete: protectedProcedure
    .input(z.object({ articleId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await deleteArticle(input.articleId, ctx.user.id);
        return { success: true, message: "Article deleted successfully" };
      } catch (error) {
        if (error instanceof Error && error.message.includes("Unauthorized")) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only delete your own articles",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete article",
        });
      }
    }),
});
