import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { createContactSubmission, getContactSubmissions, getStatusIncidents, getMaintenanceSchedule } from "./db";
import { notifyOwner } from "../_core/notification";

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
        await createContactSubmission({
          name: input.name,
          email: input.email,
          subject: input.subject,
          message: input.message,
          status: "new",
        });

        // Send notification to owner
        await notifyOwner({
          title: `New Contact Form Submission from ${input.name}`,
          content: `Email: ${input.email}\nSubject: ${input.subject}\n\nMessage:\n${input.message}`,
        });

        return { success: true, message: "Your message has been sent successfully" };
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
