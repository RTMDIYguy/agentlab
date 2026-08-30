import type { Express, Request, Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import * as db from "../db";
import { createHash } from "crypto";

function generateOpenIdFromEmail(email: string): string {
  return "usr_" + createHash("sha256").update(email.toLowerCase().trim()).digest("hex").slice(0, 24);
}

export function registerNativeAuthRoutes(app: Express) {
  // Login Endpoint
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const openId = generateOpenIdFromEmail(email);
      const userName = name || email.split("@")[0] || "AgentLab User";

      await db.upsertUser({
        openId,
        email: email.toLowerCase().trim(),
        name: userName,
        loginMethod: "native_email",
        lastSignedIn: new Date(),
      });

      const user = await db.getUserByOpenId(openId);
      const sessionToken = await sdk.createSessionToken(openId, {
        name: userName,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      return res.status(200).json({
        ok: true,
        user,
        token: sessionToken,
      });
    } catch (error) {
      console.error("[Auth] Native login error:", error);
      return res.status(500).json({ error: "Authentication failed" });
    }
  });

  // Signup Endpoint
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const openId = generateOpenIdFromEmail(email);
      const userName = name || email.split("@")[0] || "AgentLab User";

      await db.upsertUser({
        openId,
        email: email.toLowerCase().trim(),
        name: userName,
        loginMethod: "native_email",
        lastSignedIn: new Date(),
      });

      const user = await db.getUserByOpenId(openId);
      const sessionToken = await sdk.createSessionToken(openId, {
        name: userName,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      return res.status(200).json({
        ok: true,
        user,
        token: sessionToken,
      });
    } catch (error) {
      console.error("[Auth] Native signup error:", error);
      return res.status(500).json({ error: "Signup failed" });
    }
  });

  // Google / AI Studio Auth Endpoint
  app.post("/api/auth/google", async (req: Request, res: Response) => {
    try {
      const { email, name, sub } = req.body;
      const effectiveEmail = email || "robert@uncle-robert.com";
      const openId = sub ? "goog_" + sub : generateOpenIdFromEmail(effectiveEmail);
      const userName = name || "Google User";

      await db.upsertUser({
        openId,
        email: effectiveEmail.toLowerCase().trim(),
        name: userName,
        loginMethod: "google_ai_studio",
        lastSignedIn: new Date(),
      });

      const user = await db.getUserByOpenId(openId);
      const sessionToken = await sdk.createSessionToken(openId, {
        name: userName,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      return res.status(200).json({
        ok: true,
        user,
        token: sessionToken,
      });
    } catch (error) {
      console.error("[Auth] Google/AI Studio login error:", error);
      return res.status(500).json({ error: "Google authentication failed" });
    }
  });

  // Me Endpoint
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req);
      return res.status(200).json({ ok: true, user });
    } catch {
      return res.status(200).json({ ok: true, user: null });
    }
  });

  // Logout Endpoint
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return res.status(200).json({ ok: true });
  });
}
