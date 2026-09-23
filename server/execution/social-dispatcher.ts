/**
 * Social Media Posting Dispatcher
 *
 * Reads workflowArtifacts with status="scheduled" and posts them to
 * LinkedIn, Facebook, and Instagram when their scheduledFor time has arrived.
 *
 * Platform credentials are read from environment variables.
 * Access tokens (not just client IDs/secrets) are required for each platform.
 *
 * Integrated into queue-processor.ts: called after processPendingRuns completes.
 */

import { getDb } from "../db";
import { workflowArtifacts } from "../schema";
import { eq, and, lte, isNotNull } from "drizzle-orm";
import crypto from "crypto";

// ─── LinkedIn ────────────────────────────────────────────────────────────────

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || "";
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET || "";
const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN || "";

/**
 * Post content to LinkedIn via UGC Posts API.
 *
 * Requires LINKEDIN_ACCESS_TOKEN to be set (obtained via OAuth 2.0).
 * The client ID + secret alone are not sufficient for posting — an access
 * token with w_member_social (personal) or w_organization_social (page)
 * scope is required.
 *
 * If you have a LinkedIn access token, set LINKEDIN_ACCESS_TOKEN in .env.local.
 * If you need to obtain one, use the OAuth 2.0 Authorization Code Grant flow
 * with the LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET and a redirect URI.
 */
export async function postToLinkedIn(
  content: string,
  title: string,
  metadata?: Record<string, any>
): Promise<{ success: boolean; postId?: string; error?: string }> {
  if (!LINKEDIN_ACCESS_TOKEN) {
    return {
      success: false,
      error: "LINKEDIN_ACCESS_TOKEN not configured. Set it in .env.local.",
    };
  }

  try {
    // LinkedIn UGC Posts API — correct payload format
    // https://learn.microsoft.com/en-us/linkedin/consumer/uxbadge/ugc-post-api
    const body = {
      author: `urn:li:person:${metadata?.authorId || "UNKNOWN"}`,
      lifecycleState: "APPROVED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            commentary: content.slice(0, 3000),
          },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };

    const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return { success: false, error: `LinkedIn API ${res.status}: ${errorText.slice(0, 300)}` };
    }

    const result = await res.json();
    const postId = result.id || result.value?.id;
    return { success: true, postId };
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown LinkedIn error" };
  }
}

// ─── Facebook / Instagram / Threads ──────────────────────────────────────────

const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID || "";
const FACEBOOK_PAGE_TOKEN = process.env.FACEBOOK_PAGE_TOKEN || "";
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN || "";

// Use page token if available, fall back to access token
const FB_TOKEN = FACEBOOK_PAGE_TOKEN || FACEBOOK_ACCESS_TOKEN;

const INSTAGRAM_USER_ID = process.env.INSTAGRAM_USER_ID || "";
const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID || "";
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET || "";

const THREADS_USER_ID = process.env.THREADS_USER_ID || "";
const THREADS_APP_ID = process.env.THREADS_APP_ID || "";
const THREADS_APP_SECRET = process.env.THREADS_APP_SECRET || "";

/**
 * Post content to a Facebook Page via Graph API.
 *
 * Requires FACEBOOK_PAGE_ID and FACEBOOK_ACCESS_TOKEN in .env.local.
 * Token needs pages_manage_posts permission.
 */
export async function postToFacebook(
  content: string,
  title: string,
  metadata?: Record<string, any>
): Promise<{ success: boolean; postId?: string; error?: string }> {
  if (!FB_TOKEN || !FACEBOOK_PAGE_ID) {
    return {
      success: false,
      error: "FACEBOOK_PAGE_ID and a Facebook access token (FACEBOOK_PAGE_TOKEN or FACEBOOK_ACCESS_TOKEN) not configured.",
    };
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v18.0/${FACEBOOK_PAGE_ID}/feed`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${FB_TOKEN}` },
        body: new URLSearchParams({
          message: content.slice(0, 63206), // FB wall post limit
          link: metadata?.url || "",
        }),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      return { success: false, error: `Facebook API ${res.status}: ${errorText.slice(0, 200)}` };
    }

    const result = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { success: true, postId: (result as any).id };
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown Facebook error" };
  }
}

// Instagram: use the Facebook page token + Instagram User ID (connected to the FB Page)
// The Instagram App ID / Secret are for OAuth — the actual posting uses the FB page token.

export async function postToInstagram(
  content: string,
  title: string,
  metadata?: Record<string, any>
): Promise<{ success: boolean; postId?: string; error?: string }> {
  if (!FB_TOKEN || !INSTAGRAM_USER_ID) {
    return {
      success: false,
      error: "INSTAGRAM_USER_ID and a Facebook access token (FACEBOOK_PAGE_TOKEN or FACEBOOK_ACCESS_TOKEN) not configured.",
    };
  }

  try {
    // Step 1: Create media container
    const containerRes = await fetch(
      `https://graph.facebook.com/v18.0/${INSTAGRAM_USER_ID}/media`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${FB_TOKEN}` },
        body: new URLSearchParams({
          image_url: metadata?.imageUrl || "",
          caption: content.slice(0, 2200), // Instagram caption limit
        }),
      }
    );

    if (!containerRes.ok) {
      const errorText = await containerRes.text();
      return { success: false, error: `Instagram container create failed: ${errorText.slice(0, 200)}` };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const container = (await containerRes.json()) as any;
    const creationId = container.id;
    if (!creationId) {
      return { success: false, error: "No creation ID returned from Instagram container create." };
    }

    // Step 2: Publish container
    const publishRes = await fetch(
      `https://graph.facebook.com/v18.0/${INSTAGRAM_USER_ID}/media_publish`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${FB_TOKEN}` },
        body: new URLSearchParams({ creation_id: creationId }),
      }
    );

    if (!publishRes.ok) {
      const errorText = await publishRes.text();
      return { success: false, error: `Instagram publish failed: ${errorText.slice(0, 200)}` };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const publishResult = await publishRes.json() as any;
    return { success: true, postId: publishResult.id || creationId };
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown Instagram error" };
  }
}

/**
 * Post content to Threads via the Threads API (Graph API).
 *
 * Threads posting uses the same Graph API as Instagram, but targets
 * the Threads user object. Requires a token with appropriate Threads
 * permissions (or fall back to Instagram Graph API if the account is
 * linked).
 *
 * Set THREADS_USER_ID + FB_TOKEN (FACEBOOK_PAGE_TOKEN or FACEBOOK_ACCESS_TOKEN).
 */
export async function postToThreads(
  content: string,
  title: string,
  metadata?: Record<string, any>
): Promise<{ success: boolean; postId?: string; error?: string }> {
  if (!FB_TOKEN || !THREADS_USER_ID) {
    return {
      success: false,
      error: "THREADS_USER_ID and a Facebook access token not configured.",
    };
  }

  try {
    // Threads API: POST to the Threads user's thread endpoint
    const res = await fetch(
      `https://graph.facebook.com/v18.0/${THREADS_USER_ID}/threads`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${FB_TOKEN}` },
        body: new URLSearchParams({
          text: content.slice(0, 280), // Threads character limit (280 for now)
        }),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      // If Threads API not available, fall back to Instagram-style posting
      if (res.status === 403 || res.status === 404) {
        return {
          success: false,
          error: `Threads API not available for this account (status ${res.status}). Try the Instagram user ID instead, or check Threads API permissions. ${errorText.slice(0, 200)}`,
        };
      }
      return { success: false, error: `Threads API ${res.status}: ${errorText.slice(0, 200)}` };
    }

    const result = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { success: true, postId: (result as any).id };
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown Threads error" };
  }
}

// ─── Dispatcher ──────────────────────────────────────────────────────────────

export interface PostResult {
  artifactId: string;
  platform: string;
  success: boolean;
  postId?: string;
  error?: string;
  postedAt?: string;
}

/**
 * Scan workflowArtifacts for scheduled posts whose time has come,
 * post them to the appropriate platform, and update their status.
 *
 * Called from queue-processor.ts after processPendingRuns completes.
 */
export async function dispatchScheduledPosts(): Promise<PostResult[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[SocialDispatcher] Database not available");
    return [];
  }

  try {
    // Find scheduled posts whose time has arrived
    const now = new Date();
    const scheduled = await db
      .select()
      .from(workflowArtifacts)
      .where(
        and(
          eq(workflowArtifacts.status, "scheduled"),
          isNotNull(workflowArtifacts.scheduledFor),
          lte(workflowArtifacts.scheduledFor, now)
        )
      )
      .limit(50);

    if (scheduled.length === 0) {
      return [];
    }

    console.log(`[SocialDispatcher] Dispatching ${scheduled.length} scheduled post(s)...`);

    const results: PostResult[] = [];

    for (const artifact of scheduled) {
      const platform = artifact.targetPlatform || "linkedin";
      const content = artifact.content || "";
      const title = artifact.title || "Untitled Post";
      const metadata = artifact.metadata || {};

      let result: PostResult;

      if (platform === "linkedin") {
        const postResult = await postToLinkedIn(content, title, metadata);
        result = {
          artifactId: artifact.id,
          platform,
          success: postResult.success,
          postId: postResult.postId,
          error: postResult.error,
          postedAt: new Date().toISOString(),
        };
      } else if (platform === "facebook") {
        const postResult = await postToFacebook(content, title, metadata);
        result = {
          artifactId: artifact.id,
          platform,
          success: postResult.success,
          postId: postResult.postId,
          error: postResult.error,
          postedAt: new Date().toISOString(),
        };
      } else if (platform === "instagram") {
        const postResult = await postToInstagram(content, title, metadata);
        result = {
          artifactId: artifact.id,
          platform,
          success: postResult.success,
          postId: postResult.postId,
          error: postResult.error,
          postedAt: new Date().toISOString(),
        };
      } else if (platform === "threads") {
        const postResult = await postToThreads(content, title, metadata);
        result = {
          artifactId: artifact.id,
          platform,
          success: postResult.success,
          postId: postResult.postId,
          error: postResult.error,
          postedAt: new Date().toISOString(),
        };
      } else {
        // Unknown platform — mark as failed
        result = {
          artifactId: artifact.id,
          platform,
          success: false,
          error: `Unsupported platform: ${platform}`,
          postedAt: new Date().toISOString(),
        };
      }

      results.push(result);

      // Update artifact status
      if (result.success) {
        await db
          .update(workflowArtifacts)
          .set({
            status: "published",
            updatedAt: new Date(),
            metadata: {
              ...(artifact.metadata || {}),
              postId: result.postId,
              postedAt: result.postedAt,
              platform,
            },
          })
          .where(eq(workflowArtifacts.id, artifact.id));
      } else {
        await db
          .update(workflowArtifacts)
          .set({
            status: "failed",
            updatedAt: new Date(),
            metadata: {
              ...(artifact.metadata || {}),
              errorMessage: result.error,
              platform,
              lastDispatchAttempt: result.postedAt,
            },
          })
          .where(eq(workflowArtifacts.id, artifact.id));
      }
    }

    return results;
  } catch (err: any) {
    console.error("[SocialDispatcher] Error dispatching posts:", err);
    return [];
  }
}

// ─── Orchestrator call (for immediate posting from agent output) ─────────────

/**
 * Post a single artifact immediately (called when an agent finishes a content
 * creation step and the orchestrator wants to publish right away).
 */
export async function postArtifactNow(
  artifactId: string,
  platform?: string
): Promise<PostResult> {
  const db = await getDb();
  if (!db) {
    return { artifactId, platform: platform || "unknown", success: false, error: "DB unavailable" };
  }

  const artifact = await db
    .select()
    .from(workflowArtifacts)
    .where(eq(workflowArtifacts.id, artifactId))
    .limit(1);

  if (artifact.length === 0) {
    return { artifactId, platform: platform || "unknown", success: false, error: "Artifact not found" };
  }

  const a = artifact[0];
  const platformToUse = platform || (a.targetPlatform || "linkedin");

  const content = a.content || "";
  const title = a.title || "Untitled";
  const metadata = a.metadata || {};

  let result: PostResult;

  if (platformToUse === "linkedin") {
    const postResult = await postToLinkedIn(content, title, metadata);
    result = { artifactId: a.id, platform: platformToUse, ...postResult, postedAt: new Date().toISOString() };
  } else if (platformToUse === "facebook") {
    const postResult = await postToFacebook(content, title, metadata);
    result = { artifactId: a.id, platform: platformToUse, ...postResult, postedAt: new Date().toISOString() };
  } else if (platformToUse === "instagram") {
    const postResult = await postToInstagram(content, title, metadata);
    result = { artifactId: a.id, platform: platformToUse, ...postResult, postedAt: new Date().toISOString() };
  } else if (platformToUse === "threads") {
    const postResult = await postToThreads(content, title, metadata);
    result = { artifactId: a.id, platform: platformToUse, ...postResult, postedAt: new Date().toISOString() };
  } else {
    result = { artifactId: a.id, platform: platformToUse, success: false, error: `Unsupported platform: ${platformToUse}` };
  }

  // Update status
  if (result.success) {
    await db
      .update(workflowArtifacts)
      .set({
        status: "published",
        updatedAt: new Date(),
        metadata: { ...(a.metadata || {}), postId: result.postId, postedAt: result.postedAt, platform: platformToUse },
      })
      .where(eq(workflowArtifacts.id, a.id));
  } else {
    await db
      .update(workflowArtifacts)
      .set({
        status: "failed",
        updatedAt: new Date(),
        metadata: { ...(a.metadata || {}), errorMessage: result.error, platform: platformToUse },
      })
      .where(eq(workflowArtifacts.id, a.id));
  }

  return result;
}
