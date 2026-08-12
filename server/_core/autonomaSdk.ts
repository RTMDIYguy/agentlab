import { createExpressHandler } from "@autonoma-ai/server-express";
import type { HandlerConfig } from "@autonoma-ai/sdk";
import { COOKIE_NAME } from "@shared/const";
import express, { type Express } from "express";
import { factories } from "./autonoma/factories";
import { sdk } from "./sdk";

// This app has no multi-tenant scope column (no organizationId/tenantId on
// any model), which the SDK expects for isolating one test run's data from
// another's. "testRunId" is the SDK-documented fallback for non-multi-tenant
// apps: no factory ever returns a field with this name, so
// detectScopeValue() always misses and the SDK falls back to the real
// testRunId — see @autonoma-ai/sdk dist/index.js `detectScopeValue`.
const config: HandlerConfig = {
  scopeField: "testRunId",
  sharedSecret: process.env.AUTONOMA_SHARED_SECRET ?? "",
  signingSecret: process.env.AUTONOMA_SIGNING_SECRET ?? "",
  factories,
  auth: async user => {
    if (!user || typeof user.openId !== "string") {
      return {};
    }
    const token = await sdk.createSessionToken(user.openId, {
      name: typeof user.name === "string" ? user.name : "",
    });
    return {
      cookies: [
        {
          name: COOKIE_NAME,
          value: token,
          httpOnly: true,
          sameSite: "lax",
          path: "/",
        },
      ],
    };
  },
};

const handler = createExpressHandler(config);

/**
 * Autonoma Environment Factory endpoint (discover/up/down). Must be mounted
 * BEFORE express.json()/urlencoded() — the SDK verifies an HMAC over the raw
 * request bytes, so framework body-parsing middleware must not touch the
 * body first (same requirement as the Stripe webhook route).
 */
export function registerAutonomaSdkRoutes(app: Express) {
  // Use express.text to parse the raw body as a string for HMAC verification.
  // This prevents the SDK's req.on('data') from hanging in serverless/proxied environments.
  app.post("/api/autonoma", express.text({ type: "application/json" }), (req, res, next) => {
    const originalJson = res.json;
    res.json = function (body) {
      if (res.statusCode >= 400) {
        console.error("Autonoma SDK Error Response:", res.statusCode, body);
      }
      return originalJson.apply(this, arguments as any);
    };
    
    // Express 4 doesn't catch async handler errors automatically
    Promise.resolve(handler(req, res)).catch(next);
  });
}
