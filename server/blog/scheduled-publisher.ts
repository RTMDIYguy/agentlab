import { publishScheduledArticles } from "./articles";

/**
 * Publish scheduled articles that have reached their scheduled time
 * This should be called periodically (e.g., every minute or every 5 minutes)
 */
export async function publishScheduledPosts() {
  try {
    const result = await publishScheduledArticles();
    if (result.published > 0) {
      console.log(`[Blog Publisher] Published ${result.published} scheduled articles`);
    }
  } catch (error) {
    console.error("[Blog Publisher] Error publishing scheduled articles:", error);
  }
}

/**
 * Start the scheduled post publisher
 * Runs every 60 seconds to check for articles that should be published
 */
export function startScheduledPublisher() {
  // Run immediately on startup
  publishScheduledPosts();

  // Then run every 60 seconds
  setInterval(publishScheduledPosts, 60 * 1000);

  console.log("[Blog Publisher] Scheduled post publisher started (runs every 60 seconds)");
}
