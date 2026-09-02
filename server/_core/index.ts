import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerNativeAuthRoutes } from "./authRoutes";
import { registerAutonomaSdkRoutes } from "./autonomaSdk";

import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import {
  constructWebhookEvent,
  handleCheckoutSessionCompleted,
} from "../stripe/webhook";
import { registerAICoachesWebhookRoutes } from "../aicoaches/webhook";
import { apiRouter } from "../routes/api";
import { tenantMiddleware } from "../middleware/tenant";
import { triggerFullEcosystemSync } from "../controllers/aiStudioSync";

function startDailyEcosystemScheduler() {
  const calculateNext5AmCt = () => {
    const now = new Date();
    const ctString = now.toLocaleString("en-US", { timeZone: "America/Chicago" });
    const ctDate = new Date(ctString);
    const targetCt = new Date(ctString);
    targetCt.setHours(5, 0, 0, 0);
    if (ctDate.getTime() >= targetCt.getTime()) {
      targetCt.setDate(targetCt.getDate() + 1);
    }
    const diffMs = targetCt.getTime() - ctDate.getTime();
    return Math.max(diffMs, 1000);
  };

  const scheduleNext = () => {
    const delay = calculateNext5AmCt();
    console.log(`[Scheduler] Next automated ecosystem sync scheduled in ${Math.round(delay / 60000)} minutes.`);
    setTimeout(async () => {
      try {
        console.log("[Scheduler] Executing automated 5:00 AM Central Time daily ecosystem sync...");
        await triggerFullEcosystemSync();
      } catch (err: any) {
        console.warn("[Scheduler] Automated daily sync failed:", err.message);
      }
      scheduleNext();
    }, delay);
  };

  scheduleNext();
}

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, "0.0.0.0", () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Autonoma SDK endpoint (discover/up/down) under /api/autonoma. MUST be
  // registered BEFORE express.json() — it verifies an HMAC over the raw
  // request bytes.
  registerAutonomaSdkRoutes(app);
  // Stripe webhook endpoint MUST be registered BEFORE express.json()
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const signature = req.headers["stripe-signature"] as string;

      try {
        const event = constructWebhookEvent(req.body as Buffer, signature);

        // Handle test events for verification
        if (event.id.startsWith("evt_test_")) {
          console.log(
            "[Webhook] Test event detected, returning verification response"
          );
          return res.json({ verified: true });
        }

        // Handle different event types
        switch (event.type) {
          case "checkout.session.completed":
            await handleCheckoutSessionCompleted(event.data.object as any);
            break;
          default:
            console.log(`[Webhook] Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
      } catch (error) {
        console.error("[Webhook] Error processing event:", error);
        res
          .status(400)
          .json({ error: "Webhook signature verification failed" });
      }
    }
  );

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // AI Coaches webhook endpoint (expects JSON; optional token via AICOACHES_WEBHOOK_TOKEN)
  registerAICoachesWebhookRoutes(app);
  // Native email & AI Studio auth routes under /api/auth
  registerNativeAuthRoutes(app);
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // REST API with tenant middleware
  app.use("/api", tenantMiddleware, apiRouter);

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }


  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}/`);
    startDailyEcosystemScheduler();
  });
}

startServer().catch(console.error);
