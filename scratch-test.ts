import express from "express";
import { createExpressHandler } from "@autonoma-ai/server-express";

const config = {
  scopeField: "testRunId",
  sharedSecret: "test",
  signingSecret: "test",
  factories: {} as any,
  auth: async () => ({}),
};

const app = express();
app.post(
  "/api/test-raw",
  express.raw({ type: "application/json" }),
  (req, res) => {
    res.json({
      bodyType: typeof req.body,
      isBuffer: Buffer.isBuffer(req.body),
    });
  }
);
app.post(
  "/api/test-text",
  express.text({ type: "application/json" }),
  (req, res) => {
    res.json({
      bodyType: typeof req.body,
      isBuffer: Buffer.isBuffer(req.body),
    });
  }
);

const sdkHandler = createExpressHandler(config);
app.post(
  "/api/autonoma",
  express.text({ type: "application/json" }),
  (req, res, next) => {
    sdkHandler(req, res).catch(next);
  }
);

const server = app.listen(0, async () => {
  const port = (server.address() as any).port;
  console.log(`Port: ${port}`);

  const res1 = await fetch(`http://localhost:${port}/api/test-raw`, {
    method: "POST",
    body: '{"a":1}',
    headers: { "Content-Type": "application/json" },
  });
  console.log("Raw:", await res1.json());

  const res2 = await fetch(`http://localhost:${port}/api/test-text`, {
    method: "POST",
    body: '{"a":1}',
    headers: { "Content-Type": "application/json" },
  });
  console.log("Text:", await res2.json());

  const res3 = await fetch(`http://localhost:${port}/api/autonoma`, {
    method: "POST",
    body: '{"action":"discover"}',
    headers: { "Content-Type": "application/json", "x-signature": "invalid" },
  });
  console.log("Autonoma:", res3.status, await res3.text());

  process.exit(0);
});
