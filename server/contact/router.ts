import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import {
  createContactSubmission,
  getContactSubmissions,
  getStatusIncidents,
  getMaintenanceSchedule,
  markContactSubmissionAsRead,
} from "./db";
import { sendContactFormEmail, sendContactFormReply } from "./email-service";

export const contactRouter = router({
  // Submit contact form
  submitContact: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        subject: z.string().min(5, "Subject must be at least 5 characters"),
        message: z.string().min(10, "Message must be at least 10 characters"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Save to database
        const submission = await createContactSubmission({
          name: input.name,
          email: input.email,
          subject: input.subject,
          message: input.message,
          status: "new",
        });

        // Send email notification to support team
        const emailSent = await sendContactFormEmail({
          name: input.name,
          email: input.email,
          subject: input.subject,
          message: input.message,
        });

        // Send automated reply to user
        const replySent = await sendContactFormReply(input.email, input.name);

        if (!emailSent) {
          console.warn(
            "[Contact Router] Failed to send contact form email to support team"
          );
        }

        if (!replySent) {
          console.warn(
            "[Contact Router] Failed to send auto-reply to user"
          );
        }

        return {
          success: true,
          message:
            "Your message has been sent successfully. We'll get back to you soon!",
          submissionId: (submission as any).insertId,
        };
      } catch (error) {
        console.error("Error submitting contact form:", error);
        throw new Error("Failed to submit contact form");
      }
    }),

  // Get contact submissions (admin only)
  getSubmissions: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }

      try {
        const submissions = await getContactSubmissions(input.limit);
        return submissions || [];
      } catch (error) {
        console.error("Error fetching contact submissions:", error);
        return [];
      }
    }),

  // Mark submission as read (admin only)
  markAsRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }

      try {
        await markContactSubmissionAsRead(input.id);
        return { success: true, message: "Submission marked as read" };
      } catch (error) {
        console.error("Error marking submission as read:", error);
        throw new Error("Failed to mark submission as read");
      }
    }),

  // Get system status incidents
  getStatusIncidents: publicProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      try {
        const incidents = await getStatusIncidents(input.limit);
        return incidents || [];
      } catch (error) {
        console.error("Error fetching status incidents:", error);
        return [];
      }
    }),

  // Get maintenance schedule
  getMaintenanceSchedule: publicProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      try {
        const schedule = await getMaintenanceSchedule(input.limit);
        return schedule || [];
      } catch (error) {
        console.error("Error fetching maintenance schedule:", error);
        return [];
      }
    }),
});
