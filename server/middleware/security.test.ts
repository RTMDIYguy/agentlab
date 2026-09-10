import { describe, it, expect, vi } from "vitest";
import { securityMiddleware, CSP_POLICY } from "./security";
import type { Request, Response, NextFunction } from "express";

describe("Security Middleware & CSP Header", () => {
  it("should set Content-Security-Policy header with complete directive whitelist", () => {
    const req = {} as Request;
    const headers: Record<string, string> = {};
    const res = {
      setHeader: vi.fn((key: string, value: string) => {
        headers[key] = value;
      }),
    } as unknown as Response;
    const next: NextFunction = vi.fn();

    securityMiddleware(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith("Content-Security-Policy", CSP_POLICY);
    expect(headers["Content-Security-Policy"]).toContain("default-src 'self'");
    expect(headers["Content-Security-Policy"]).toContain("script-src");
    expect(headers["Content-Security-Policy"]).toContain("style-src");
    expect(headers["Content-Security-Policy"]).toContain("font-src");
    expect(headers["Content-Security-Policy"]).toContain("img-src");
    expect(headers["Content-Security-Policy"]).toContain("connect-src");
    expect(headers["Content-Security-Policy"]).toContain("frame-src");
    expect(headers["Content-Security-Policy"]).toContain("object-src 'none'");
    expect(headers["Content-Security-Policy"]).toContain("base-uri 'self'");
    expect(headers["Content-Security-Policy"]).toContain("form-action 'self'");
    expect(headers["Content-Security-Policy"]).toContain("upgrade-insecure-requests");
    expect(next).toHaveBeenCalled();
  });

  it("should set essential defensive headers (X-Content-Type-Options, X-Frame-Options, etc.)", () => {
    const req = {} as Request;
    const headers: Record<string, string> = {};
    const res = {
      setHeader: vi.fn((key: string, value: string) => {
        headers[key] = value;
      }),
    } as unknown as Response;
    const next: NextFunction = vi.fn();

    securityMiddleware(req, res, next);

    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["X-Frame-Options"]).toBe("SAMEORIGIN");
    expect(headers["X-XSS-Protection"]).toBe("1; mode=block");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["Permissions-Policy"]).toBeDefined();
    expect(next).toHaveBeenCalled();
  });
});
