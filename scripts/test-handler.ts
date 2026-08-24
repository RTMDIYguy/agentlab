import express from "express";
import { createExpressHandler } from "@autonoma-ai/server-express";
import { factories } from "../server/_core/autonoma/factories";
import crypto from "crypto";

const app = express();
const sharedSecret =
  "6f9e882cd074b211800a0b7a795ec730fc0c34d53185b516e2d6be977225167a";

const config = {
  scopeField: "testRunId",
  sharedSecret,
  signingSecret: "",
  factories: factories as any,
  auth: async () => ({}),
};

app.post("/api/autonoma", createExpressHandler(config));

const server = app.listen(0, async () => {
  const port = (server.address() as any).port;
  console.log(`Server started on port ${port}`);

  const body = JSON.stringify({ action: "discover" });
  const signature = crypto
    .createHmac("sha256", sharedSecret)
    .update(body)
    .digest("hex");

  try {
    const res = await fetch(`http://localhost:${port}/api/autonoma`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "autonoma-signature": signature,
      },
      body,
    });

    const text = await res.text();
    console.log("STATUS:", res.status);
    console.log("BODY:", text);
  } catch (err) {
    console.error(err);
  } finally {
    server.close();
    process.exit(0);
  }
});
