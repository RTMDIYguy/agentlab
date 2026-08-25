import type { Request, Response, NextFunction } from "express";
import { decodeJwt } from "jose";
import { db } from "../db";
import { users, workspaces } from "../schema";
import { eq } from "drizzle-orm";

// Extend Express Request interface with multi-tenant context
declare global {
  namespace Express {
    interface Request {
      workspaceId?: string;
      userEmail?: string;
      userRole?: string;
    }
  }
}

const GOD_MODE_EMAILS = [
  'thebossrob@gmail.com',
  'agentlab.tech@gmail.com',
  'robert@unclerobertconsulting.com',
  'robmccarthymaed@yahoo.com',
  'robert@agent-lab.tech',
  'burnssheena335@gmail.com'
];

export const tenantMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    let decodedEmail = "";

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = decodeJwt(token);
        if (decoded && decoded.email) {
          decodedEmail = decoded.email as string;
        }
      } catch (err) {
        console.warn("[Tenant Middleware] Failed to decode JWT:", err);
      }
    }

    if (decodedEmail) {
      req.userEmail = decodedEmail;
      
      if (GOD_MODE_EMAILS.includes(decodedEmail)) {
        req.workspaceId = '00000000-0000-0000-0000-000000000000';
        req.userRole = 'admin';
      } else {
        const userRecords = await db
          .select({ workspaceId: users.workspaceId, role: users.role })
          .from(users)
          .where(eq(users.email, decodedEmail))
          .limit(1);

        if (userRecords.length > 0) {
          req.workspaceId = userRecords[0].workspaceId || undefined;
          req.userRole = userRecords[0].role;
        } else {
          // Auto-provision user and workspace if they don't exist
          try {
            const [newWorkspace] = await db.insert(workspaces).values({
              name: `${decodedEmail.split('@')[0]}'s Workspace`,
              slug: `ws-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`,
            }).returning();

            await db.insert(users).values({
              openId: decodedEmail, // using email as openId for uniqueness
              email: decodedEmail,
              name: decodedEmail.split('@')[0],
              workspaceId: newWorkspace.id,
              role: 'owner',
            });
            
            req.workspaceId = newWorkspace.id;
            req.userRole = 'owner';
            console.log(`[Tenant Middleware] Auto-provisioned workspace ${newWorkspace.id} for ${decodedEmail}`);
          } catch (insertErr) {
            console.error("[Tenant Middleware] Failed to auto-provision user/workspace:", insertErr);
            req.userRole = 'operator';
          }
        }
      }
    } else {
      // Legacy fallback
      const workspaceHeader = req.headers["x-workspace-id"] as string;
      req.workspaceId = workspaceHeader || "00000000-0000-0000-0000-000000000001";
      req.userEmail = (req.headers["x-user-email"] as string) || "operator@agentlab.local";
      req.userRole = (req.headers["x-user-role"] as string) || "admin";
    }

    next();
  } catch (error) {
    console.error("[Tenant Middleware] Error:", error);
    next();
  }
};
