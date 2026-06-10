import { notifyOwner } from "../_core/notification";

const SUPPORT_EMAIL = "info@unclerobertconsulting.com";
const SUPPORT_PHONE = "+1 (816) 301-1048";
const COMPANY_NAME = "Uncle Robert Consulting";

export interface ContactEmailPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Send a contact form submission email notification to the support team
 * Uses Manus's built-in notification API to deliver emails
 */
export async function sendContactFormEmail(
  payload: ContactEmailPayload
): Promise<boolean> {
  try {
    const { name, email, subject, message } = payload;

    // Format the email notification for the support team
    const emailTitle = `New Contact Form Submission: ${subject}`;
    const emailContent = formatContactEmail({
      name,
      email,
      subject,
      message,
    });

    // Send notification to project owner (which includes email delivery)
    const notificationSent = await notifyOwner({
      title: emailTitle,
      content: emailContent,
    });

    if (!notificationSent) {
      console.warn(
        "[Contact Service] Failed to send contact form email notification"
      );
      return false;
    }

    console.log(
      `[Contact Service] Contact form email sent successfully from ${email}`
    );
    return true;
  } catch (error) {
    console.error("[Contact Service] Error sending contact form email:", error);
    return false;
  }
}

/**
 * Send an automated reply to the user who submitted the contact form
 */
export async function sendContactFormReply(
  userEmail: string,
  userName: string
): Promise<boolean> {
  try {
    const replyTitle = `We received your message - ${COMPANY_NAME}`;
    const replyContent = formatAutoReplyEmail(userName);

    // Send automated reply notification
    const replySent = await notifyOwner({
      title: replyTitle,
      content: replyContent,
    });

    if (!replySent) {
      console.warn(
        "[Contact Service] Failed to send auto-reply to user",
        userEmail
      );
      return false;
    }

    console.log(
      `[Contact Service] Auto-reply sent successfully to ${userEmail}`
    );
    return true;
  } catch (error) {
    console.error("[Contact Service] Error sending auto-reply:", error);
    return false;
  }
}

/**
 * Format contact form submission as a professional email
 */
function formatContactEmail(payload: ContactEmailPayload): string {
  const { name, email, subject, message } = payload;
  const timestamp = new Date().toLocaleString("en-US", {
    timeZone: "America/Chicago",
  });

  return `
New Contact Form Submission
═══════════════════════════════════════════════════════════

FROM:
  Name: ${name}
  Email: ${email}

SUBJECT: ${subject}

SUBMITTED: ${timestamp} (Central Time)

MESSAGE:
─────────────────────────────────────────────────────────
${message}
─────────────────────────────────────────────────────────

CONTACT INFORMATION:
  Support Email: ${SUPPORT_EMAIL}
  Support Phone: ${SUPPORT_PHONE}
  Company: ${COMPANY_NAME}

ACTION REQUIRED:
Please review this submission and respond to the user within 24 hours.
You can reply directly to ${email} or use the contact information above.

═══════════════════════════════════════════════════════════
This is an automated notification from AgentLab Contact Form
  `.trim();
}

/**
 * Format automated reply email to send to the user
 */
function formatAutoReplyEmail(userName: string): string {
  const timestamp = new Date().toLocaleString("en-US", {
    timeZone: "America/Chicago",
  });

  return `
Thank you for contacting ${COMPANY_NAME}!

Dear ${userName},

We have received your message and appreciate you taking the time to reach out to us.
Our support team will review your submission and get back to you as soon as possible.

EXPECTED RESPONSE TIME:
  • Email: Within 24 hours
  • Urgent matters: Within 2 hours during business hours (9am-6pm EST)

CONTACT INFORMATION:
If you need immediate assistance, you can reach us at:
  Phone: ${SUPPORT_PHONE}
  Email: ${SUPPORT_EMAIL}
  Hours: Monday - Friday, 9am - 6pm EST

REFERENCE INFORMATION:
  Submitted: ${timestamp} (Central Time)
  Company: ${COMPANY_NAME}

We look forward to helping you!

Best regards,
${COMPANY_NAME} Support Team
${SUPPORT_EMAIL}
${SUPPORT_PHONE}

═══════════════════════════════════════════════════════════
This is an automated response. Your message has been recorded in our system.
  `.trim();
}
