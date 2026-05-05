#!/usr/bin/env node
/**
 * jira-status-router — Routes Jira status changes to downstream actions.
 *
 * Status: SPEC STUB.
 *
 * Trigger: Atlassian Jira webhook on issue update where status changed.
 *
 * Routing table:
 *   In Progress         → Fire AI Drafting Agent → create Google Doc
 *   In Review           → Teams notification to reviewer + AI pre-screen
 *   Approved            → Run AI SEO Agent + lock doc + merge GitHub PR
 *   SEO Complete        → Fire AI Adaptation Agent
 *   Adaptation Complete → Stage Klaviyo preview send to List XbByas
 *   Published           → Send Klaviyo campaign to List SrkWfC + GHL social
 *                         schedule + Outlook to client segments + Teams broadcast
 *
 * Required env vars:
 *   ATLASSIAN_API_TOKEN, ATLASSIAN_SITE_URL, GOOGLE_OAUTH_REFRESH_TOKEN,
 *   GITHUB_TOKEN, KLAVIYO_API_KEY, GHL_API_KEY, TEAMS_WEBHOOK_CONTENT_REVIEW,
 *   TEAMS_WEBHOOK_CONTENT_PUBLISHED, OUTLOOK_OAUTH_TOKEN
 *
 * TODO: Implement.
 */

throw new Error("jira-status-router.mjs is a spec stub — implementation pending.");
