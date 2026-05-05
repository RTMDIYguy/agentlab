#!/usr/bin/env node
/**
 * notion-to-jira — Topic approval in Notion creates Jira ticket + GCal event.
 *
 * Status: SPEC STUB.
 *
 * Trigger: Notion DB webhook fires when a Content Calendar row's Status
 *          transitions to 'Approved'.
 *
 * Actions:
 *   1. Read the approved Notion page (title, slug, format, owner, due dates,
 *      brief URL, channel targets, primary keyword).
 *   2. Create a Jira ticket in the URC 'MKT-Content' project with:
 *      - Type: Content Task
 *      - Custom workflow states: To Do → In Progress → In Review → Revisions →
 *        Approved → SEO Complete → Adaptation Complete → Published
 *      - Assignee: Notion 'Owner' field
 *      - Due date: Notion 'Publish Date'
 *      - Description: full brief text plus link to Notion page
 *   3. Create Google Calendar events for draft-due, review-due, publish-date.
 *   4. Write the resulting Jira ticket ID back to the Notion page.
 *   5. Post a Microsoft Teams notification to #content-planning.
 *
 * Replaces the current Make.com scenario "Notion approval → Jira + GCal".
 *
 * Required env vars:
 *   NOTION_API_KEY, ATLASSIAN_API_TOKEN, ATLASSIAN_SITE_URL (must be atlassian.net),
 *   GOOGLE_OAUTH_REFRESH_TOKEN, TEAMS_WEBHOOK_CONTENT_PLANNING
 *
 * TODO: Implement.
 */

throw new Error("notion-to-jira.mjs is a spec stub — implementation pending.");
