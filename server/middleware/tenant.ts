import type { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../schema";
import { sdk } from "../_core/sdk";
import { getSessionTokenFromRequest } from "../_core/authRoutes";

/**
 * Identity for the REST /api surface — CC-2026-10-03-003.
 *
 * WHAT THIS REPLACED (see docs/operations/rest-auth-posture-audit-2026-10-03.md):
 *
 *  1. `decodeJwt(token)` — decodes the payload without checking the signature,
 *     key, issuer, audience or expiry. A hand-minted JWT carrying a god-mode
 *     email became admin over the god workspace; an unknown email auto-
 *     INSERTed a workspace and a user row from an unauthenticated request.
 *  2. A "legacy fallback" that assigned `role: "admin"` to every caller with no
 *     credentials, and trusted `x-user-role`, `x-user-email` and
 *     `x-workspace-id` verbatim — which made tenant isolation a request header.
 *  3. `catch { next(); }`, which failed open.
 *
 * WHAT IT DOES NOW:
 *
 *  - Identity comes from a VERIFIED session only: the session cookie (HS256,
 *    same secret and same `sdk.verifySession` the tRPC layer has used in
 *    production all along) or that same token in an Authorization: Bearer
 *    header. No other credential shape is honoured.
 *  - Role and workspace come from the `users` row, never from a header.
 *  - With no verifiable session there is simply no identity: no default
 *    workspace, no default role, nothing. `req.authenticated` is false and the
 *    gate in middleware/apiAuth.ts refuses the request.
 *
 * WHY `next()` IS STILL CALLED IN THE CATCH BLOCK
 *
 * The audit's draft said "catch -> 401". Taken literally that would 401
 * /api/health, /api/orchestrator/models and /api/dashboard/llm-ping whenever
 * identity resolution hiccups — taking down the deploy smoke test for a
 * problem those routes do not have. So this middleware never blocks; it only
 * ever *withholds* identity. Enforcement lives in `apiAuthGate`, which is
 * fail-closed for every route that is not explicitly public. Net behaviour is
 * the same, without collateral damage to the public routes.
 */

// Extend Express Request interface with multi-tenant context
declare global {
  namespace Express {
    interface Request {
      workspaceId?: string;
      userEmail?: string;
      userRole?: string;
      /** TRUE only when identity was proven by a verified session. */
      authenticated?: boolean;
      /** The verified session subject (users.open_id). */
      openId?: string;
    }
  }
}

/** The workspace reserved for the founding operator accounts. */
const GOD_WORKSPACE_ID = "00000000-0000-0000-0000-000000000000";

const GOD_MODE_EMAILS = [
  "thebossrob@gmail.com",
  "agentlab.tech@gmail.com",
  "robert@unclerobertconsulting.com",
  "robmccarthymaed@yahoo.com",
  "robert@agent-lab.tech",
  "burnssheena335@gmail.com",
];

/**
 * Read the session token exactly the way the login routes write it — via
 * getSessionTokenFromRequest in _core/authRoutes.ts (httpOnly session cookie
 * first, then that same value in an Authorization: Bearer header).
 *
 * Deliberately NOT honoured: `x-user-role`, `x-user-email`, `x-workspace-id`,
 * and any Google/Manus/whatever token we did not sign ourselves. A token we
 * cannot verify proves nothing, so it grants nothing.
 */
function readSessionToken(req: Request): string | undefined {
  return getSessionTokenFromRequest(req);
}

type Identity = {
  openId: string;
  email: string;
  role: string;
  workspaceId: string | null;
};

async function resolveIdentity(req: Request): Promise<Identity | null> {
  const token = readSessionToken(req);
  if (!token) return null;

  // HS256 against the session secret — signature, expiry and all.
  const session = await sdk.verifySession(token);
  if (!session?.openId) return null;

  const rows = await db
    .select({
      openId: users.openId,
      email: users.email,
      role: users.role,
      workspaceId: users.workspaceId,
    })
    .from(users)
    .where(eq(users.openId, session.openId))
    .limit(1);

  const user = rows[0];
  // A session we can verify for a subject that no longer exists resolves to
  // "no identity" rather than to a default — same rule tRPC applies.
  if (!user) return null;

  const isGodMode = GOD_MODE_EMAILS.includes((user.email || "").toLowerCase());

  return {
    openId: user.openId,
    email: user.email,
    role: isGodMode ? "admin" : user.role,
    workspaceId: isGodMode ? GOD_WORKSPACE_ID : user.workspaceId ?? null,
  };
}

export const tenantMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const identity = await resolveIdentity(req);

    if (identity) {
      req.authenticated = true;
      req.openId = identity.openId;
      req.userEmail = identity.email;
      req.userRole = identity.role;
      req.workspaceId = identity.workspaceId ?? undefined;
    } else {
      req.authenticated = false;
      req.openId = undefined;
      req.userEmail = undefined;
      req.userRole = undefined;
      req.workspaceId = undefined;
    }
  } catch (error) {
    // Fail closed on identity: an error resolving it never grants one. We still
    // call next() so public routes stay reachable — see the file header.
    console.error("[Tenant Middleware] identity resolution failed:", error);
    req.authenticated = false;
    req.openId = undefined;
    req.userEmail = undefined;
    req.userRole = undefined;
    req.workspaceId = undefined;
  }

  next();
};
