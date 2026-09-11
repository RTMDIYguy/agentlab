import http from "http";
import url from "url";
import fs from "fs";
import path from "path";

const PORT = 3000;
const CLIENT_ID = "aa05ecea-6034-4641-a54b-2a17df2203fa";

const CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET || "c658f487-eb53-4fb4-ac61-b611266a2293";

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  console.log(`[OAuth Server] ${req.method} ${pathname}`);

  // Handle CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  let tokenExchangeSuccess = false;
  let exchangeError = null;

  // If authorization code is present in query parameters, perform token exchange
  if (query.code) {
    const authCode = String(query.code);
    console.log(`[OAuth Server] 🔑 Processing HubSpot authorization code: ${authCode.substring(0, 15)}...`);

    try {
      const tokenParams = new URLSearchParams({
        grant_type: "authorization_code",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: `http://localhost:${PORT}`,
        code: authCode,
      });

      const tokenRes = await fetch("https://api.hubapi.com/oauth/v1/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: tokenParams.toString(),
      });

      const tokenData = await tokenRes.json();

      if (tokenRes.ok && tokenData.access_token) {
        tokenExchangeSuccess = true;
        console.log(`[OAuth Server] 🚀 Token Exchange Successful! App successfully installed.`);
        console.log(`[OAuth Server] Refresh Token acquired: ${tokenData.refresh_token ? "YES" : "NO"}`);
      } else {
        exchangeError = tokenData.message || JSON.stringify(tokenData);
        console.warn(`[OAuth Server] Token exchange notice:`, exchangeError);
      }
    } catch (err) {
      exchangeError = err.message;
      console.error(`[OAuth Server] Token exchange request failed:`, err);
    }
  }

  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>AgentLab HubSpot OAuth Service</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: #1e293b; padding: 2.5rem; border-radius: 1rem; border: 1px solid #334155; text-align: center; max-width: 480px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
          h1 { color: #38bdf8; font-size: 1.5rem; margin-bottom: 0.5rem; }
          .badge { display: inline-block; background: #0284c7; color: white; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.8rem; font-weight: bold; margin-bottom: 1rem; }
          p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; }
          .status { color: #4ade80; font-weight: bold; margin-top: 1.5rem; padding: 0.75rem; background: rgba(74, 222, 128, 0.1); border-radius: 0.5rem; border: 1px solid rgba(74, 222, 128, 0.2); }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">AgentLab OS</div>
          <h1>HubSpot OAuth Authorized</h1>
          <p>Local authorization handshake completed successfully.</p>
          <div class="status">
            ${tokenExchangeSuccess ? "🎉 App Installed & Verified on Test Account!" : "✅ Authorization Code Captured. You can return to your CLI."}
          </div>
        </div>
      </body>
    </html>
  `);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`\n======================================================`);
  console.log(`  🚀 AgentLab HubSpot Auto-Exchange OAuth Server on Port ${PORT}`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
