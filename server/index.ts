import express from "express";
import { createServer } from "http";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { tenantMiddleware } from "./middleware/tenant";
import { apiRouter } from "./routes/api";
import { processPendingRuns } from "./execution/queue-processor";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Security & Body Parsers
  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    })
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Multi-Tenant Isolation Middleware
  app.use(tenantMiddleware);

  // API Routes
  app.use("/api", apiRouter);

  // Top-level Health Check
  app.get("/health", (_req, res) => {
    res
      .status(200)
      .json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // Serve static UI in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "output", "agentlab-ui", "dist");

  app.use(express.static(staticPath));

  // Client-side SPA fallback
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(staticPath, "index.html"), err => {
      if (err) {
        res.status(200).send("AgentLab Node.js API Service running.");
      }
    });
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(
      `[AgentLab Server] Running on http://localhost:${port}/ (Environment: ${process.env.NODE_ENV || "development"})`
    );

    // Start the Execution Engine background poller
    setInterval(async () => {
      try {
        await processPendingRuns();
      } catch (e) {
        console.error("[Execution Engine Poller] Error:", e);
      }
    }, 5000); // Check every 5 seconds
    console.log(`[Execution Engine] Background poller started.`);
  });
}

startServer().catch(err => {
  console.error("[AgentLab Server] Fatal startup error:", err);
  process.exit(1);
});
