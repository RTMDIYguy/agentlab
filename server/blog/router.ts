import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { createComment, getArticleComments, deleteComment, getCommentCount, createReply, getCommentReplies, getTopLevelComments } from "./db";
import { TRPCError } from "@trpc/server";

export const blogRouter = router({
  // Get all approved comments for an article
  getComments: publicProcedure
    .input(z.object({ articleId: z.string() }))
    .query(async ({ input }) => {
      try {
        const comments = await getArticleComments(input.articleId);
        return comments;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch comments",
        });
      }
    }),

  // Get comment count for an article
  getCommentCount: publicProcedure
    .input(z.object({ articleId: z.string() }))
    .query(async ({ input }) => {
      try {
        const count = await getCommentCount(input.articleId);
        return { count };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch comment count",
        });
      }
    }),

  // Create a new comment (requires authentication)
  createComment: protectedProcedure
    .input(
      z.object({
        articleId: z.string(),
        content: z.string().min(1).max(5000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Validate content
        if (input.content.trim().length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Comment cannot be empty",
          });
        }

        await createComment(input.articleId, ctx.user.id, input.content);

        return {
          success: true,
          message: "Comment posted successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create comment",
        });
      }
    }),

  // Delete a comment (only owner can delete)
  deleteComment: protectedProcedure
    .input(z.object({ commentId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await deleteComment(input.commentId, ctx.user.id);
        return { success: true, message: "Comment deleted successfully" };
      } catch (error) {
        if (error instanceof Error && error.message === "Unauthorized") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only delete your own comments",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete comment",
        });
      }
    }),

  // Get top-level comments for an article (threaded)
  getThreadedComments: publicProcedure
    .input(z.object({ articleId: z.string() }))
    .query(async ({ input }) => {
      try {
        const comments = await getTopLevelComments(input.articleId);
        return comments;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch threaded comments",
        });
      }
    }),

  // Get replies for a specific comment
  getCommentReplies: publicProcedure
    .input(z.object({ commentId: z.number() }))
    .query(async ({ input }) => {
      try {
        const replies = await getCommentReplies(input.commentId);
        return replies;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch comment replies",
        });
      }
    }),

  // Create a reply to a comment
  createReply: protectedProcedure
    .input(
      z.object({
        articleId: z.string(),
        parentCommentId: z.number(),
        content: z.string().min(1).max(5000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (input.content.trim().length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Reply cannot be empty",
          });
        }

        await createReply(
          input.articleId,
          ctx.user.id,
          input.content,
          input.parentCommentId
        );

        return {
          success: true,
          message: "Reply posted successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        if (error instanceof Error && error.message === "Parent comment not found") {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Parent comment not found",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create reply",
        });
      }
    }),
});
