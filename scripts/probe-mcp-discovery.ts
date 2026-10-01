/**
 * READ-ONLY probe: run the OS's own MCP OAuth discovery module against a real
 * MCP endpoint (default: Upwork). No secrets involved, no tokens requested —
 * public RFC 9728/8414 metadata only.
 *
 * Usage: pnpm exec tsx scripts/probe-mcp-discovery.ts [mcpEndpointUrl]
 */
import { discoverMcpOAuthFlow } from "../server/execution/mcp-oauth";

const endpoint = process.argv[2] ?? "https://mcp.upwork.com/mcp";

console.log(`[probe] discovering OAuth metadata for ${endpoint} ...\n`);
try {
  const { resource, server } = await discoverMcpOAuthFlow(endpoint);
  console.log("== protected resource (RFC 9728) ==");
  console.log(JSON.stringify(resource, null, 2));
  console.log("\n== authorization server (RFC 8414) ==");
  console.log(
    JSON.stringify(
      {
        issuer: server.issuer,
        authorization_endpoint: server.authorization_endpoint,
        token_endpoint: server.token_endpoint,
        revocation_endpoint: server.revocation_endpoint,
        grant_types_supported: server.grant_types_supported,
        code_challenge_methods_supported: server.code_challenge_methods_supported,
        token_endpoint_auth_methods_supported: server.token_endpoint_auth_methods_supported,
        scopes_supported: server.scopes_supported,
      },
      null,
      2
    )
  );
  console.log("\n[probe] SUCCESS — the OS discovery module reads the real server.");
  console.log("[probe] Next connect step (needs Robert's Upwork app registration):");
  console.log(
    `  authorize URL base: ${server.authorization_endpoint}`
  );
} catch (err) {
  console.error("[probe] FAILED:", (err as Error).message);
  process.exit(1);
}
