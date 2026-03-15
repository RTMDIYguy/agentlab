import { notifyOwner } from "../_core/notification";
import { NewsletterCampaign, NewsletterSubscriber } from "../../drizzle/schema";

const COMPANY_NAME = "Uncle Robert Consulting";
const SUPPORT_EMAIL = "info@unclerobertconsulting.com";

/**
 * Send verification email to new newsletter subscriber
 */
export async function sendVerificationEmail(
  email: string,
  name: string
): Promise<boolean> {
  try {
    const verificationLink = `${process.env.VITE_FRONTEND_URL || "https://agentlab-ai-g5zlrreb.manus.space"}/newsletter/verify?token=VERIFICATION_TOKEN`;

    const emailContent = formatVerificationEmail(name, verificationLink);

    const notificationSent = await notifyOwner({
      title: `Confirm Your Newsletter Subscription - ${COMPANY_NAME}`,
      content: emailContent,
    });

    if (!notificationSent) {
      console.warn(
        "[Newsletter] Failed to send verification email to",
        email
      );
      return false;
    }

    console.log(
      `[Newsletter] Verification email sent successfully to ${email}`
    );
    return true;
  } catch (error) {
    console.error("[Newsletter] Error sending verification email:", error);
    return false;
  }
}

/**
 * Send newsletter campaign to subscribers
 */
export async function sendNewsletterCampaign(
  campaign: NewsletterCampaign,
  subscribers: NewsletterSubscriber[]
): Promise<number> {
  try {
    let sentCount = 0;

    for (const subscriber of subscribers) {
      try {
        const unsubscribeLink = `${process.env.VITE_FRONTEND_URL || "https://agentlab-ai-g5zlrreb.manus.space"}/newsletter/unsubscribe?token=UNSUBSCRIBE_TOKEN`;

        const emailContent = formatCampaignEmail(
          campaign.content,
          subscriber.name || "Subscriber",
          unsubscribeLink
        );

        const sent = await notifyOwner({
          title: campaign.subject,
          content: emailContent,
        });

        if (sent) {
          sentCount++;
        }
      } catch (error) {
        console.error(
          `[Newsletter] Error sending campaign to ${subscriber.email}:`,
          error
        );
      }
    }

    console.log(
      `[Newsletter] Campaign ${campaign.id} sent to ${sentCount} subscribers`
    );
    return sentCount;
  } catch (error) {
    console.error("[Newsletter] Error sending newsletter campaign:", error);
    return 0;
  }
}

/**
 * Send welcome email to new subscriber
 */
export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<boolean> {
  try {
    const emailContent = formatWelcomeEmail(name);

    const notificationSent = await notifyOwner({
      title: `Welcome to ${COMPANY_NAME} Newsletter!`,
      content: emailContent,
    });

    if (!notificationSent) {
      console.warn("[Newsletter] Failed to send welcome email to", email);
      return false;
    }

    console.log(`[Newsletter] Welcome email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error("[Newsletter] Error sending welcome email:", error);
    return false;
  }
}

/**
 * Format verification email
 */
function formatVerificationEmail(name: string, verificationLink: string): string {
  return `
Confirm Your Newsletter Subscription
═══════════════════════════════════════════════════════════

Hi ${name},

Thank you for subscribing to the ${COMPANY_NAME} newsletter! To complete your subscription, please verify your email address by clicking the link below:

VERIFICATION LINK: ${verificationLink}

This link will expire in 24 hours.

If you did not subscribe to this newsletter, please ignore this email.

Best regards,
${COMPANY_NAME} Team
${SUPPORT_EMAIL}

═══════════════════════════════════════════════════════════
This is an automated message. Please do not reply to this email.
  `.trim();
}

/**
 * Format campaign email
 */
function formatCampaignEmail(
  content: string,
  subscriberName: string,
  unsubscribeLink: string
): string {
  return `
${content}

═══════════════════════════════════════════════════════════

MANAGE YOUR PREFERENCES:
If you no longer wish to receive these emails, you can unsubscribe here:
${unsubscribeLink}

${COMPANY_NAME}
${SUPPORT_EMAIL}

═══════════════════════════════════════════════════════════
This is a newsletter from ${COMPANY_NAME}. You're receiving this because you subscribed.
  `.trim();
}

/**
 * Format welcome email
 */
function formatWelcomeEmail(name: string): string {
  return `
Welcome to ${COMPANY_NAME}!
═══════════════════════════════════════════════════════════

Hi ${name},

Welcome to our newsletter! We're excited to have you on board.

You'll now receive updates about:
  • Latest news and insights
  • Industry trends and analysis
  • Exclusive offers and promotions
  • Company announcements

WHAT TO EXPECT:
We typically send newsletters once a week with curated content tailored to your interests.

MANAGE YOUR PREFERENCES:
You can update your email preferences or unsubscribe at any time from the footer of any newsletter email.

If you have any questions, feel free to reach out to us at ${SUPPORT_EMAIL}.

Best regards,
${COMPANY_NAME} Team
${SUPPORT_EMAIL}

═══════════════════════════════════════════════════════════
This is an automated message. Please do not reply to this email.
  `.trim();
}

/**
 * Format unsubscribe confirmation email
 */
export function formatUnsubscribeConfirmationEmail(email: string): string {
  return `
Unsubscribe Confirmation
═══════════════════════════════════════════════════════════

We've successfully unsubscribed ${email} from the ${COMPANY_NAME} newsletter.

You will no longer receive newsletter emails from us.

If this was a mistake, you can resubscribe at any time by visiting our website.

Best regards,
${COMPANY_NAME} Team
${SUPPORT_EMAIL}

═══════════════════════════════════════════════════════════
This is an automated message. Please do not reply to this email.
  `.trim();
}
