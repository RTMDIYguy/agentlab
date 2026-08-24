import type { Request, Response, NextFunction } from "express";

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

export const tenantMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  // Extract tenant workspace ID from header, query param, or fallback to default tenant
  const workspaceHeader = req.headers["x-workspace-id"] as string;

  // Default fallback workspace ID for local development / single-tenant preview
  req.workspaceId = workspaceHeader || "00000000-0000-0000-0000-000000000001";
  req.userEmail =
    (req.headers["x-user-email"] as string) || "operator@agentlab.local";
  req.userRole = (req.headers["x-user-role"] as string) || "admin";

  next();
};
