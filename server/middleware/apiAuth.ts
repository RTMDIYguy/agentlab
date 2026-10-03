import type { Request, Response, NextFunction } from "express";
import { timingSafeEqual } from "crypto";

/**
 * The REST authorization gate — CC-2026-10-03-003.
 *
 * Mounted once, at the top of `apiRouter`, so every route under /api is
 * denied unless it is explicitly listed as public or the caller proved an
 * identity (see middleware/tenant.ts). Routes registered below inherit the
 * gate automatically; nothing has to remember to opt in.
 *
 * Three classes:
 *
 *  PUBLIC   — reachable with no session at all. Keep this list SHORT and
 *             deliberate: every entry is a deliberate hole, so each one is
 *             justified inline. Derived from the client call sites on pages a
 *             signed-out visitor can actually open (see the audit, section A).
 *  WEBHOOK  — inbound machine callers that cannot hold a session. They must
 *             present WEBHOOK_INGEST_SECRET; with no secret configured they
 *             answer 503 (not 200, not 401-with-a-hint) because "open until
 *             someone configures it" is exactly how this surface rotted.
 *  EVERYTHING ELSE — requires a verified session (req.authenticated).
 *
 * `req.path` inside a router is mount-relative (router mounted at /api sees
 * "/runs"), but we normalise defensively so the matcher behaves the same if
 * the mount point ever changes.
 */

export type RouteMatcher = { method: string; path: RegExp };

/** Static workspace used by ingest routes that never carry a browser session. */
const SERVICE_WORKSPACE_ID = "00000000-0000-0000-0000-000000000001";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Public by design. Reasons, so nobody adds to this list casually:
 *  - health / orchestrator/models / dashboard/llm-ping: the documented
 *    post-deploy smoke checks (CC-2026-10-02-021 and the runbook); they expose
 *    a service name, a model catalog and a ping result, no tenant data.
 *  - share/runs: the share-link reader. It resolves its workspace from the
 *    share token hash, never from the tenant middleware, so authenticating it
 *    would break links Robert has already sent.
 *  - campaigns/*: the four lead-capture funnels Robert confirmed stay
 *    anonymous on 2026-10-03 (founder-sprint booking, MedSpa and Real-Estate
 *    dispatch, plus POST /api/intake which is mounted ahead of this router).
 */
export const PUBLIC_API_ROUTES: RouteMatcher[] = [
  { method: "GET", path: /^\/health$/ },
  { method: "GET", path: /^\/orchestrator\/models$/ },
  { method: "GET", path: /^\/dashboard\/llm-ping$/ },
  { method: "GET", path: /^\/share\/runs$/ },
  { method: "GET", path: /^\/share\/runs\/[^/]+$/ },
  { method: "POST", path: /^\/campaigns\/founder-sprint\/book$/ },
  { method: "POST", path: /^\/campaigns\/outreach\/medspa$/ },
  { method: "POST", path: /^\/campaigns\/outreach\/cre$/ },
];

/**
 * Inbound machine endpoints. These cannot present a browser session, so they
 * authenticate with WEBHOOK_INGEST_SECRET instead of being left open.
 * Includes POST /sync/action + /aistudio/action — the unauthenticated
 * workflow-trigger / approve path the audit called the worst open route.
 */
export const WEBHOOK_API_ROUTES: RegExp[] = [
  /^\/webhooks\/instantly$/,
  /^\/voice\/webhook$/,
  /^\/aistudio\/ingest$/,
  /^\/sync\/ingest$/,
  /^\/fulfillment\/onboarding\/ingest$/,
  /^\/aistudio\/webhook\/register$/,
  /^\/aistudio\/action$/,
  /^\/sync\/action$/,
];

/** Strip the mount prefix so matching does not depend on where we are mounted. */
function normalisePath(url: string): string {
  const path = url.split("?")[0];
  return path.startsWith("/api/") ? path.slice(4) : path;
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Still burn a comparison so length differences are not measurably faster.
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

/**
 * A secret-authenticated service caller MAY name the workspace it acts for.
 * Header-supplied identity is therefore only ever read *after* the secret has
 * been proved — which is the whole difference from the old fallback, where
 * anonymous callers selected their own tenant.
 */
function bindServiceCaller(req: Request) {
  const header = req.headers["x-workspace-id"];
  const requested = Array.isArray(header) ? header[0] : header;
  const workspaceId =
    typeof requested === "string" && UUID_RE.test(requested)
      ? requested
      : SERVICE_WORKSPACE_ID;

  req.workspaceId = workspaceId;
  req.userRole = "service";
  req.userEmail = `webhook:${normalisePath(req.path || req.url).replace(
    /^\//,
    ""
  )}`;
  // Not a session: req.authenticated stays false, so these callers never pass
  // a session-gated route even with the right secret.
}

function requireWebhookSecret(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const secret = process.env.WEBHOOK_INGEST_SECRET || "";
  if (!secret) {
    res.status(503).json({
      error: "Webhook ingestion is not configured",
    });
    return;
  }

  const headerValue = req.headers["x-webhook-secret"];
  const provided =
    (Array.isArray(headerValue) ? headerValue[0] : headerValue) ||
    String((req.query as Record<string, unknown>)?.secret || "");

  if (!safeEqual(String(provided), secret)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  bindServiceCaller(req);
  next();
}

export function apiAuthGate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const method = (req.method || "GET").toUpperCase();
  const path = normalisePath(req.path || req.url || "/");

  for (const route of PUBLIC_API_ROUTES) {
    if (route.method === method && route.path.test(path)) {
      next();
      return;
    }
  }

  for (const pattern of WEBHOOK_API_ROUTES) {
    if (pattern.test(path)) {
      requireWebhookSecret(req, res, next);
      return;
    }
  }

  if (req.authenticated) {
    next();
    return;
  }

  res.status(401).json({ error: "Unauthorized" });
}
