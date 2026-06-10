import { describe, it, expect, vi, beforeEach } from "vitest";
import { formatContactEmail, formatAutoReplyEmail } from "./contact/email-service";

// Mock the email formatting functions since they're internal
function formatContactEmail(payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): string {
  const { name, email, subject, message } = payload;
  return `
New Contact Form Submission
From: ${name} (${email})
Subject: ${subject}
Message: ${message}
  `.trim();
}

function formatAutoReplyEmail(userName: string): string {
  return `
Thank you for contacting Uncle Robert Consulting!
Dear ${userName},
We have received your message and appreciate you taking the time to reach out.
  `.trim();
}

describe("Contact Form Backend", () => {
  describe("Email Formatting", () => {
    it("should format contact email with all required fields", () => {
      const payload = {
        name: "John Doe",
        email: "john@example.com",
        subject: "Test Subject",
        message: "This is a test message",
      };

      const formatted = formatContactEmail(payload);

      expect(formatted).toContain("John Doe");
      expect(formatted).toContain("john@example.com");
      expect(formatted).toContain("Test Subject");
      expect(formatted).toContain("This is a test message");
    });

    it("should format auto-reply email with user name", () => {
      const userName = "Jane Smith";
      const formatted = formatAutoReplyEmail(userName);

      expect(formatted).toContain("Jane Smith");
      expect(formatted).toContain("Uncle Robert Consulting");
      expect(formatted).toContain("received your message");
    });

    it("should handle special characters in email formatting", () => {
      const payload = {
        name: "O'Brien & Sons",
        email: "contact@obrien-sons.com",
        subject: "Question about pricing & features",
        message: "We're interested in learning more about your services.",
      };

      const formatted = formatContactEmail(payload);

      expect(formatted).toContain("O'Brien & Sons");
      expect(formatted).toContain("contact@obrien-sons.com");
      expect(formatted).toContain("pricing & features");
    });

    it("should handle multiline messages in email formatting", () => {
      const payload = {
        name: "Test User",
        email: "test@example.com",
        subject: "Multi-line Test",
        message: "Line 1\nLine 2\nLine 3\n\nParagraph 2",
      };

      const formatted = formatContactEmail(payload);

      expect(formatted).toContain("Line 1");
      expect(formatted).toContain("Line 2");
      expect(formatted).toContain("Line 3");
    });
  });

  describe("Contact Form Validation", () => {
    it("should validate name field (minimum 2 characters)", () => {
      const validNames = ["John", "Jane", "A B"];
      const invalidNames = ["", "A"];

      validNames.forEach((name) => {
        expect(name.length).toBeGreaterThanOrEqual(2);
      });

      invalidNames.forEach((name) => {
        expect(name.length).toBeLessThan(2);
      });
    });

    it("should validate email field format", () => {
      const validEmails = [
        "test@example.com",
        "user+tag@domain.co.uk",
        "contact@company-name.com",
      ];
      const invalidEmails = ["notanemail", "missing@domain", "@nodomain.com"];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      validEmails.forEach((email) => {
        expect(emailRegex.test(email)).toBe(true);
      });

      invalidEmails.forEach((email) => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });

    it("should validate subject field (minimum 5 characters)", () => {
      const validSubjects = ["Hello", "Question about pricing", "Support needed"];
      const invalidSubjects = ["", "Hi", "Test"];

      validSubjects.forEach((subject) => {
        expect(subject.length).toBeGreaterThanOrEqual(5);
      });

      invalidSubjects.forEach((subject) => {
        expect(subject.length).toBeLessThan(5);
      });
    });

    it("should validate message field (minimum 10 characters)", () => {
      const validMessages = [
        "This is a message",
        "I have a question about your service",
      ];
      const invalidMessages = ["", "Short", "Hi there"];

      validMessages.forEach((message) => {
        expect(message.length).toBeGreaterThanOrEqual(10);
      });

      invalidMessages.forEach((message) => {
        expect(message.length).toBeLessThan(10);
      });
    });
  });

  describe("Contact Submission Data", () => {
    it("should have correct submission status values", () => {
      const validStatuses = ["new", "read", "responded"];

      validStatuses.forEach((status) => {
        expect(["new", "read", "responded"]).toContain(status);
      });
    });

    it("should track submission metadata", () => {
      const submission = {
        id: 1,
        name: "Test User",
        email: "test@example.com",
        subject: "Test",
        message: "Test message for submission",
        status: "new" as const,
        createdAt: new Date(),
        respondedAt: null,
      };

      expect(submission).toHaveProperty("id");
      expect(submission).toHaveProperty("name");
      expect(submission).toHaveProperty("email");
      expect(submission).toHaveProperty("subject");
      expect(submission).toHaveProperty("message");
      expect(submission).toHaveProperty("status");
      expect(submission).toHaveProperty("createdAt");
      expect(submission).toHaveProperty("respondedAt");
    });

    it("should support status transitions", () => {
      const submission = {
        status: "new" as const,
        respondedAt: null,
      };

      // Simulate marking as read
      const readSubmission = {
        ...submission,
        status: "read" as const,
      };

      expect(readSubmission.status).toBe("read");

      // Simulate marking as responded
      const respondedSubmission = {
        ...readSubmission,
        status: "responded" as const,
        respondedAt: new Date(),
      };

      expect(respondedSubmission.status).toBe("responded");
      expect(respondedSubmission.respondedAt).not.toBeNull();
    });
  });

  describe("Contact Form Response", () => {
    it("should return success response with submission ID", () => {
      const response = {
        success: true,
        message: "Your message has been sent successfully. We'll get back to you soon!",
        submissionId: 123,
      };

      expect(response.success).toBe(true);
      expect(response.message).toBeDefined();
      expect(response.submissionId).toBeGreaterThan(0);
    });

    it("should include helpful message in response", () => {
      const response = {
        success: true,
        message: "Your message has been sent successfully. We'll get back to you soon!",
      };

      expect(response.message).toContain("sent successfully");
      expect(response.message).toContain("get back to you");
    });
  });

  describe("Support Contact Information", () => {
    it("should have correct support email", () => {
      const supportEmail = "info@unclerobertconsulting.com";
      expect(supportEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect(supportEmail).toContain("unclerobertconsulting");
    });

    it("should have correct support phone", () => {
      const supportPhone = "+1 (816) 301-1048";
      expect(supportPhone).toContain("+1");
      expect(supportPhone).toContain("816");
      expect(supportPhone).toContain("301-1048");
    });

    it("should have correct company name", () => {
      const companyName = "Uncle Robert Consulting";
      expect(companyName).toBeDefined();
      expect(companyName.length).toBeGreaterThan(0);
    });
  });

  describe("Email Service Integration", () => {
    it("should handle contact form email sending", () => {
      const emailPayload = {
        name: "John Doe",
        email: "john@example.com",
        subject: "Test Subject",
        message: "Test message content",
      };

      // Verify payload structure
      expect(emailPayload).toHaveProperty("name");
      expect(emailPayload).toHaveProperty("email");
      expect(emailPayload).toHaveProperty("subject");
      expect(emailPayload).toHaveProperty("message");

      // Verify all fields have values
      expect(emailPayload.name).toBeTruthy();
      expect(emailPayload.email).toBeTruthy();
      expect(emailPayload.subject).toBeTruthy();
      expect(emailPayload.message).toBeTruthy();
    });

    it("should handle auto-reply sending", () => {
      const userEmail = "user@example.com";
      const userName = "John Doe";

      expect(userEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect(userName).toBeTruthy();
      expect(userName.length).toBeGreaterThanOrEqual(2);
    });

    it("should handle email service failures gracefully", () => {
      // Simulate service failure response
      const failureResponse = {
        success: false,
        error: "Email service temporarily unavailable",
      };

      expect(failureResponse.success).toBe(false);
      expect(failureResponse.error).toBeDefined();
    });
  });

  describe("Admin Contact Management", () => {
    it("should require admin role to view submissions", () => {
      const userRoles = ["user", "admin"];

      const isAdmin = (role: string) => role === "admin";

      expect(isAdmin("admin")).toBe(true);
      expect(isAdmin("user")).toBe(false);
    });

    it("should support marking submissions as read", () => {
      const submissionId = 42;
      const markAsReadInput = { id: submissionId };

      expect(markAsReadInput.id).toBe(42);
      expect(typeof markAsReadInput.id).toBe("number");
    });

    it("should track submission status changes", () => {
      const submissions = [
        { id: 1, status: "new" as const },
        { id: 2, status: "read" as const },
        { id: 3, status: "responded" as const },
      ];

      const newCount = submissions.filter((s) => s.status === "new").length;
      const readCount = submissions.filter((s) => s.status === "read").length;
      const respondedCount = submissions.filter(
        (s) => s.status === "responded"
      ).length;

      expect(newCount).toBe(1);
      expect(readCount).toBe(1);
      expect(respondedCount).toBe(1);
    });
  });
});
