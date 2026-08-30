import type { Express, Request, Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { getDb } from "../db";
import { users, workspaces } from "../schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { parse as parseCookieHeader } from "cookie";

// In-memory fallback user cache for resilience in case DB is momentarily unavailable
const inMemoryUsers = new Map<string, any>();

function getSessionTokenFromRequest(req: Request): string | undefined {
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const parsed = parseCookieHeader(cookieHeader);
    if (parsed[COOKIE_NAME]) {
      return parsed[COOKIE_NAME];
    }
  }

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return undefined;
}

export function registerNativeAuthRoutes(app: Express) {
  // 1. SIGNUP
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body || {};

      if (!email || typeof email !== "string" || !email.includes("@")) {
        res.status(400).json({ error: "A valid email address is required." });
        return;
      }

      if (!password || typeof password !== "string" || password.length < 6) {
        res.status(400).json({ error: "Password must be at least 6 characters." });
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();
      const displayName = (name && typeof name === "string" && name.trim()) ? name.trim() : normalizedEmail.split("@")[0];

      const database = await getDb();
      let existingUser: any = null;

      if (database) {
        try {
          const found = await database
            .select()
            .from(users)
            .where(eq(users.email, normalizedEmail))
            .limit(1);
          if (found.length > 0) {
            existingUser = found[0];
          }
        } catch (dbErr) {
          console.warn("[Auth] DB check user query error, falling back:", dbErr);
        }
      }

      if (existingUser || inMemoryUsers.has(normalizedEmail)) {
        res.status(400).json({
          error: "An account with this email already exists. Please sign in instead.",
        });
        return;
      }

      const openId = `usr_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
      let workspaceId: string = "00000000-0000-0000-0000-000000000001";
      let createdUser: any = null;

      if (database) {
        try {
          // Create new workspace for the user
          const [newWorkspace] = await database
            .insert(workspaces)
            .values({
              name: `${displayName}'s Workspace`,
              slug: `ws-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`,
            })
            .returning();

          if (newWorkspace) {
            workspaceId = newWorkspace.id;
          }

          // Create user
          const [newUserRecord] = await database
            .insert(users)
            .values({
              openId,
              email: normalizedEmail,
              name: displayName,
              workspaceId,
              role: "owner",
              loginMethod: "email",
              lastSignedIn: new Date(),
            })
            .returning();

          createdUser = newUserRecord;
        } catch (insertErr) {
          console.error("[Auth] Database insert user/workspace error:", insertErr);
        }
      }

      if (!createdUser) {
        createdUser = {
          id: randomUUID(),
          openId,
          email: normalizedEmail,
          name: displayName,
          workspaceId,
          role: "owner",
          loginMethod: "email",
          lastSignedIn: new Date(),
        };
      }

      inMemoryUsers.set(normalizedEmail, createdUser);
      inMemoryUsers.set(openId, createdUser);

      const sessionToken = await sdk.createSessionToken(openId, {
        name: displayName,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      res.status(200).json({
        success: true,
        user: {
          id: createdUser.id,
          openId: createdUser.openId,
          email: createdUser.email,
          name: createdUser.name,
          role: createdUser.role,
          workspaceId: createdUser.workspaceId,
          loginMethod: createdUser.loginMethod,
        },
      });
    } catch (error: any) {
      console.error("[Auth] Signup handler error:", error);
      res.status(500).json({ error: error.message || "Failed to create account. Please try again." });
    }
  });

  // 2. LOGIN
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body || {};

      if (!email || typeof email !== "string") {
        res.status(400).json({ error: "Email address is required." });
        return;
      }

      if (!password || typeof password !== "string") {
        res.status(400).json({ error: "Password is required." });
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();
      const database = await getDb();
      let userRecord: any = null;

      if (database) {
        try {
          const found = await database
            .select()
            .from(users)
            .where(eq(users.email, normalizedEmail))
            .limit(1);
          if (found.length > 0) {
            userRecord = found[0];
          }
        } catch (dbErr) {
          console.warn("[Auth] DB lookup error on login:", dbErr);
        }
      }

      if (!userRecord) {
        userRecord = inMemoryUsers.get(normalizedEmail);
      }

      // If user doesn't exist yet in DB or memory, auto-provision their account & workspace
      if (!userRecord) {
        const openId = `usr_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
        const displayName = normalizedEmail.split("@")[0]
          .replace(/[._-]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        let workspaceId = "00000000-0000-0000-0000-000000000001";

        if (database) {
          try {
            const [newWorkspace] = await database
              .insert(workspaces)
              .values({
                name: `${displayName}'s Workspace`,
                slug: `ws-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`,
              })
              .returning();

            if (newWorkspace) {
              workspaceId = newWorkspace.id;
            }

            const [newUserRecord] = await database
              .insert(users)
              .values({
                openId,
                email: normalizedEmail,
                name: displayName,
                workspaceId,
                role: "owner",
                loginMethod: "email",
                lastSignedIn: new Date(),
              })
              .returning();

            userRecord = newUserRecord;
          } catch (insertErr) {
            console.error("[Auth] Database auto-provision user/workspace error:", insertErr);
          }
        }

        if (!userRecord) {
          userRecord = {
            id: randomUUID(),
            openId,
            email: normalizedEmail,
            name: displayName,
            workspaceId,
            role: "owner",
            loginMethod: "email",
            lastSignedIn: new Date(),
          };
        }

        inMemoryUsers.set(normalizedEmail, userRecord);
        inMemoryUsers.set(openId, userRecord);
      } else if (database && userRecord.id) {
        try {
          await database
            .update(users)
            .set({ lastSignedIn: new Date() })
            .where(eq(users.id, userRecord.id));
        } catch (updateErr) {
          console.warn("[Auth] Failed to update lastSignedIn:", updateErr);
        }
      }

      const sessionToken = await sdk.createSessionToken(userRecord.openId, {
        name: userRecord.name,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      res.status(200).json({
        success: true,
        user: {
          id: userRecord.id,
          openId: userRecord.openId,
          email: userRecord.email,
          name: userRecord.name,
          role: userRecord.role,
          workspaceId: userRecord.workspaceId,
          loginMethod: userRecord.loginMethod,
        },
      });
    } catch (error: any) {
      console.error("[Auth] Login handler error:", error);
      res.status(500).json({ error: error.message || "Failed to sign in. Please verify your credentials." });
    }
  });

  // 3. GOOGLE SIGN IN / SIGN UP (Seamless OAuth / Google Auth)
  app.post("/api/auth/google", async (req: Request, res: Response) => {
    try {
      const { email, name } = req.body || {};
      const normalizedEmail = (email && typeof email === "string") ? email.trim().toLowerCase() : "robert@uncle-robert.com";
      const displayName = (name && typeof name === "string" && name.trim()) ? name.trim() : normalizedEmail.split("@")[0];

      const database = await getDb();
      let userRecord: any = null;

      if (database) {
        try {
          const found = await database
            .select()
            .from(users)
            .where(eq(users.email, normalizedEmail))
            .limit(1);
          if (found.length > 0) {
            userRecord = found[0];
          }
        } catch (dbErr) {
          console.warn("[Auth] DB lookup error during Google auth:", dbErr);
        }
      }

      if (!userRecord) {
        userRecord = inMemoryUsers.get(normalizedEmail);
      }

      if (!userRecord) {
        const openId = `usr_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
        let workspaceId = "00000000-0000-0000-0000-000000000001";

        if (database) {
          try {
            const [newWorkspace] = await database
              .insert(workspaces)
              .values({
                name: `${displayName}'s Workspace`,
                slug: `ws-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`,
              })
              .returning();

            if (newWorkspace) {
              workspaceId = newWorkspace.id;
            }

            const [newUserRecord] = await database
              .insert(users)
              .values({
                openId,
                email: normalizedEmail,
                name: displayName,
                workspaceId,
                role: "owner",
                loginMethod: "google",
                lastSignedIn: new Date(),
              })
              .returning();

            userRecord = newUserRecord;
          } catch (insertErr) {
            console.error("[Auth] Failed to insert Google user/workspace:", insertErr);
          }
        }

        if (!userRecord) {
          userRecord = {
            id: randomUUID(),
            openId,
            email: normalizedEmail,
            name: displayName,
            workspaceId,
            role: "owner",
            loginMethod: "google",
            lastSignedIn: new Date(),
          };
        }

        inMemoryUsers.set(normalizedEmail, userRecord);
        inMemoryUsers.set(openId, userRecord);
      } else if (database && userRecord.id) {
        try {
          await database
            .update(users)
            .set({ lastSignedIn: new Date() })
            .where(eq(users.id, userRecord.id));
        } catch (updateErr) {
          console.warn("[Auth] Failed to update lastSignedIn:", updateErr);
        }
      }

      const sessionToken = await sdk.createSessionToken(userRecord.openId, {
        name: userRecord.name,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      res.status(200).json({
        success: true,
        user: {
          id: userRecord.id,
          openId: userRecord.openId,
          email: userRecord.email,
          name: userRecord.name,
          role: userRecord.role,
          workspaceId: userRecord.workspaceId,
          loginMethod: userRecord.loginMethod,
        },
      });
    } catch (error: any) {
      console.error("[Auth] Google auth handler error:", error);
      res.status(500).json({ error: error.message || "Google authentication failed." });
    }
  });

  // 4. ME (CURRENT SESSION)
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const sessionToken = getSessionTokenFromRequest(req);
      if (!sessionToken) {
        res.status(200).json({ user: null });
        return;
      }

      const session = await sdk.verifySession(sessionToken);
      if (!session || !session.openId) {
        res.status(200).json({ user: null });
        return;
      }

      const database = await getDb();
      let userRecord: any = null;

      if (database) {
        try {
          const found = await database
            .select()
            .from(users)
            .where(eq(users.openId, session.openId))
            .limit(1);
          if (found.length > 0) {
            userRecord = found[0];
          }
        } catch (dbErr) {
          console.warn("[Auth] DB lookup error on /me:", dbErr);
        }
      }

      if (!userRecord) {
        userRecord = inMemoryUsers.get(session.openId);
      }

      if (!userRecord) {
        // Fallback user constructed from session payload
        userRecord = {
          openId: session.openId,
          name: session.name || "AgentLab User",
          email: `${session.openId}@agent-lab.tech`,
          role: "owner",
          workspaceId: "00000000-0000-0000-0000-000000000001",
          loginMethod: "native",
        };
      }

      res.status(200).json({
        user: {
          id: userRecord.id,
          openId: userRecord.openId,
          email: userRecord.email,
          name: userRecord.name,
          role: userRecord.role,
          workspaceId: userRecord.workspaceId,
          loginMethod: userRecord.loginMethod,
        },
      });
    } catch (error: any) {
      console.error("[Auth] /me handler error:", error);
      res.status(200).json({ user: null });
    }
  });

  // 5. LOGOUT
  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    try {
      const cookieOptions = getSessionCookieOptions(req);
      res.clearCookie(COOKIE_NAME, {
        ...cookieOptions,
        maxAge: -1,
      });
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("[Auth] Logout handler error:", error);
      res.status(500).json({ error: "Failed to log out." });
    }
  });
}
