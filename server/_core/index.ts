import "./env";
import { syncWorkspaceVaultSecrets } from "./env";
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
import { securityMiddleware } from "../middleware/security";
import { triggerFullEcosystemSync } from "../controllers/aiStudioSync";
import { ensureDatabaseSchema, startDatabaseKeepalive } from "../db";

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
  // Schema bootstrap with retry (2026-09-24): the Neon cold-start frequently
  // refuses the very first connection(s); previously a single failed attempt
  // left ensureDatabaseSchema dead for the whole process lifetime, so every
  // DB write silently no-oped (signups fell back to the in-memory user
  // cache). Retry with backoff before giving up.
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      await ensureDatabaseSchema();
      console.log(`[Database] Schema bootstrap OK (attempt ${attempt}).`);
      break;
    } catch (err: any) {
      console.error(`[Database] Schema bootstrap attempt ${attempt}/4 failed:`, err?.message ?? err);
      if (attempt === 4) {
        console.error("[Database] Continuing without verified schema — DB-backed features will be degraded until the connection recovers.");
        break;
      }
      await new Promise(r => setTimeout(r, attempt * 3000));
    }
  }
  // Auto-sync workspace vault secrets from environment to database (retried
  // in the background — a cold-start failure here must not kill boot).
  syncWorkspaceVaultSecrets().catch(err =>
    console.warn("[Vault Sync] background retry failed:", err?.message ?? err)
  );

  // Neon keepalive (opt-in via NEON_KEEPALIVE_MINUTES): prevents the
  // free-plan compute auto-suspend cold starts documented in CC-2026-09-24-004.
  startDatabaseKeepalive();

  const app = express();
  const server = createServer(app);

  // Security Headers (CSP, X-Content-Type-Options, etc.)
  app.use(securityMiddleware);

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

  // ----------------------------------------------------------------
  // Poller kick endpoint (2026-09-30 poller design): Cloud Scheduler hits
  // this once a minute with an OIDC token; we (fire-and-forget) ask the Run
  // API to start one agentlab-poller Job execution. The Job — not this
  // service — executes pending runs, so a slow execution never holds an HTTP
  // request open (the 7–52 min observed run lengths rule that out).
  // Registered BEFORE the /api mount on purpose: no tenant middleware, no
  // user session — the caller is infrastructure, not a workspace user.
  // Auth: EITHER a Scheduler OIDC token (signature via Google JWKS, issuer
  // accounts.google.com, audience = this service URL, email = the configured
  // scheduler SA) OR the KICK_SECRET shared secret (operator testing).
  // With neither configured the route answers 503 — honest, not open.
  app.post("/api/internal/poller-kick", async (req, res) => {
    const schedulerSa = process.env.POLLER_SCHEDULER_SA || "";
    const kickSecret = process.env.KICK_SECRET || "";
    if (!schedulerSa && !kickSecret) {
      res.status(503).json({ error: "poller-kick not configured" });
      return;
    }

    const authHeader = req.headers.authorization || "";
    const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const providedSecret = String(req.headers["x-kick-secret"] || "");

    let authorized = false;
    if (bearer && schedulerSa) {
      try {
        const { createRemoteJWKSet, jwtVerify } = await import("jose");
        const JWKS = createRemoteJWKSet(
          new URL("https://www.googleapis.com/oauth2/v3/certs")
        );
        const expectedAud =
          process.env.POLLER_KICK_AUDIENCE ||
          `https://${process.env.K_SERVICE || "agentlab-718497644379.us-central1.run.app"}`;
        const { payload } = await jwtVerify(bearer, JWKS, {
          issuer: "https://accounts.google.com",
          audience: expectedAud,
        });
        // Bind to the scheduler SA. Google SA ID tokens (Scheduler and IAM
        // impersonation alike) may OMIT the email claim (observed 2026-09-30:
        // iss/aud present, email undefined) — the stable unforgeable pin is
        // `sub`, the SA's unique numeric id (POLLER_SCHEDULER_SA_ID). Email
        // is checked only as a secondary signal when present.
        const saId = process.env.POLLER_SCHEDULER_SA_ID || "";
        const sub = String(payload.sub || "");
        const email = String(payload.email || "").toLowerCase();
        if (saId) {
          authorized = sub === saId;
        } else if (payload.email !== undefined) {
          authorized = email === schedulerSa.toLowerCase();
        }
        // Without POLLER_SCHEDULER_SA_ID and without an email claim we do
        // NOT accept — iss+aud alone would admit any Google user minting a
        // token against our public URL.
      } catch {
        authorized = false;
      }
    }
    if (!authorized && kickSecret && providedSecret.length > 0) {
      const { createHash } = await import("crypto");
      authorized =
        createHash("sha256").update(providedSecret).digest("hex") ===
        createHash("sha256").update(kickSecret).digest("hex");
    }
    if (!authorized) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    try {
      // Resolve project/region: env first, metadata server fallback.
      let project = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || "";
      if (!project) {
        const meta = await fetch(
          "http://metadata.google.internal/computeMetadata/v1/project/project-id",
          { headers: { "Metadata-Flavor": "Google" } }
        );
        if (meta.ok) project = (await meta.text()).trim();
      }
      const region = process.env.POLLER_REGION || "us-central1";
      const jobName = process.env.POLLER_JOB_NAME || "agentlab-poller";
      if (!project) {
        res.status(500).json({ error: "could not resolve project id" });
        return;
      }

      // Metadata-server access token for the runtime service account.
      const tokenRes = await fetch(
        "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token",
        { headers: { "Metadata-Flavor": "Google" } }
      );
      if (!tokenRes.ok) {
        res.status(500).json({ error: "metadata token unavailable" });
        return;
      }
      const { access_token } = (await tokenRes.json()) as { access_token: string };

      const jobsBase = `https://run.googleapis.com/v2/projects/${project}/locations/${region}/jobs/${jobName}`;
      const authHeaders = { Authorization: `Bearer ${access_token}` };

      // Quota guard: skip if an execution is already active.
      const listRes = await fetch(`${jobsBase}/executions?pageSize=1`, {
        headers: authHeaders,
      });
      if (listRes.ok) {
        const list = (await listRes.json()) as {
          executions?: Array<{ state?: string }>;
        };
        const active = (list.executions || []).some(
          e => e.state === "ACTIVE" || e.state === "PENDING"
        );
        if (active) {
          res.status(202).json({ kicked: false, reason: "execution already active" });
          return;
        }
      }

      const runRes = await fetch(`${jobsBase}:run`, {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: "{}",
      });
      if (!runRes.ok) {
        const body = await runRes.text();
        console.error("[PollerKick] job run failed:", runRes.status, body.slice(0, 300));
        res.status(502).json({ error: "job run request failed", status: runRes.status });
        return;
      }
      console.log("[PollerKick] job execution requested.");
      res.status(202).json({ kicked: true });
    } catch (err: any) {
      console.error("[PollerKick] error:", err?.message ?? err);
      res.status(500).json({ error: "kick failed" });
    }
  });

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
