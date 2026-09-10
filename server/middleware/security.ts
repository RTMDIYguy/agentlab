import type { Request, Response, NextFunction } from "express";

/**
 * Content Security Policy (CSP) and Modern Web Security Headers Middleware
 *
 * Resolves Aikido / OWASP security requirements for front-end and API targets:
 * - https://agent-lab.tech
 * - https://agent-lab.tech/faq
 * - https://agent-lab.tech/api/*
 */
export const CSP_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https: wss: ws:",
  "frame-src 'self' https://meet.jit.si https://calendly.com https://calendar.app.google https://*.firebaseapp.com",
  "media-src 'self' https: data: blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

export const securityMiddleware = (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  // Content Security Policy
  res.setHeader("Content-Security-Policy", CSP_POLICY);

  // Additional defense-in-depth security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    'camera=(self "https://meet.jit.si"), microphone=(self "https://meet.jit.si"), geolocation=()'
  );
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  next();
};
