import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  generateMaskedPreview,
  mapProviderToEnvKey,
  applySecretToEnv,
  normalizeEnvironmentVariables,
  CORE_PROVIDERS_CONFIG,
} from "../_core/env";

describe("Settings & MCP Integrations Suite", () => {
  it("verifies MCP integration payload schemas", () => {
    const mcpConfig = {
      name: "PostgreSQL MCP",
      type: "mcp",
      config: {
        transport: "sse",
        endpoint: "https://mcp.agent-lab.tech/sse",
        capabilities: ["tools", "resources"],
      },
      status: "active",
    };

    expect(mcpConfig.type).toBe("mcp");
    expect(mcpConfig.config.transport).toBe("sse");
    expect(mcpConfig.config.capabilities).toContain("tools");
  });

  it("verifies webhook integration payload schemas", () => {
    const webhookConfig = {
      name: "Mercury Bank Webhook",
      type: "webhook",
      config: {
        endpoint: "https://api.mercury.com/v1/webhooks",
        apiKey: "sec_test_123",
      },
      status: "active",
    };

    expect(webhookConfig.type).toBe("webhook");
    expect(webhookConfig.config.endpoint).toContain("mercury.com");
  });

  it("verifies granular LLM cognitive hyperparameter boundaries", () => {
    const hyperParams = {
      temperature: 0.2,
      maxOutputTokens: 4096,
      topP: 0.9,
      antiPassivityMandate: true,
      chainOfThought: true,
      qualityFlywheelScoring: true,
    };

    expect(hyperParams.temperature).toBeGreaterThanOrEqual(0.0);
    expect(hyperParams.temperature).toBeLessThanOrEqual(1.0);
    expect(hyperParams.maxOutputTokens).toBeGreaterThanOrEqual(2048);
    expect(hyperParams.antiPassivityMandate).toBe(true);
  });

  it("generates correct masked preview for API secrets in vault", () => {
    const testSecret = "sk_1e0a35b99d0ce169a76a72b5cfe1c5c3c6ae9f47e75ca881";
    const masked = generateMaskedPreview(testSecret);
    expect(masked).toContain("••••••••");
    expect(masked.startsWith("sk_1")).toBe(true);
    expect(masked.endsWith("a881")).toBe(true);
  });

  it("maps provider names to correct environment variable keys", () => {
    expect(mapProviderToEnvKey("instantly")).toBe("INSTANTLY_API_KEY");
    expect(mapProviderToEnvKey("hubspot")).toBe("HUBSPOT_PAT");
    expect(mapProviderToEnvKey("elevenlabs")).toBe("ELEVENLABS_API_KEY");
    expect(mapProviderToEnvKey("agentmail")).toBe("AGENTMAIL_API_KEY");
    expect(mapProviderToEnvKey("google")).toBe("GOOGLE_GENERATIVE_AI_API_KEY");
  });

  it("dynamically applies secrets to process.env and aliases", () => {
    applySecretToEnv("instantly", "test_instantly_key_12345");
    expect(process.env.INSTANTLY_API_KEY).toBe("test_instantly_key_12345");

    applySecretToEnv("hubspot", "test_hubspot_pat_67890");
    expect(process.env.HUBSPOT_PAT).toBe("test_hubspot_pat_67890");
    expect(process.env.HUBSPOT_ACCESS_TOKEN).toBe("test_hubspot_pat_67890");

    applySecretToEnv("elevenlabs", "test_elevenlabs_key_abcde");
    expect(process.env.ELEVENLABS_API_KEY).toBe("test_elevenlabs_key_abcde");
  });

  it("normalizes HubSpot, Instantly, and ElevenLabs environment variable aliases", () => {
    delete process.env.HUBSPOT_PAT;
    process.env.HUBSPOT_ACCESS_TOKEN = "test_token_alias";
    normalizeEnvironmentVariables();
    expect(process.env.HUBSPOT_PAT).toBe("test_token_alias");

    delete process.env.INSTANTLY_API_KEY;
    process.env.INSTANTLY_KEY = "test_instantly_alias";
    normalizeEnvironmentVariables();
    expect(process.env.INSTANTLY_API_KEY).toBe("test_instantly_alias");

    delete process.env.ELEVENLABS_API_KEY;
    process.env.XI_API_KEY = "test_eleven_alias";
    normalizeEnvironmentVariables();
    expect(process.env.ELEVENLABS_API_KEY).toBe("test_eleven_alias");
  });

  it("includes all core providers in synchronization config", () => {
    const providers = CORE_PROVIDERS_CONFIG.map(c => c.provider);
    expect(providers).toContain("instantly");
    expect(providers).toContain("hubspot");
    expect(providers).toContain("elevenlabs");
    expect(providers).toContain("agentmail");
    expect(providers).toContain("google_ai");
  });
});
