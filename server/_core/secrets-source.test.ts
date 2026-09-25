import { afterEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { isInfisicalManaged, loadSecretLayers } from "./secrets-source";

/**
 * Hermetic tests for the Infisical/disk precedence rules (CC-2026-09-25-005).
 * Fixtures are temp directories and plain objects, so no real .env file, no
 * real credential, and no network are involved.
 */

const tempDirs: string[] = [];

function makeEnvDir(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "agentlab-secrets-"));
  tempDirs.push(dir);
  for (const [name, contents] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), contents, "utf8");
  }
  return dir;
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("isInfisicalManaged", () => {
  it("detects the flag the wrapped scripts set", () => {
    expect(isInfisicalManaged({ SECRETS_SOURCE: "infisical" })).toBe(true);
  });

  it("detects a machine-identity run via INFISICAL_PROJECT_ID", () => {
    expect(isInfisicalManaged({ INFISICAL_PROJECT_ID: "abc-123" })).toBe(true);
  });

  it("stays in disk mode otherwise", () => {
    expect(isInfisicalManaged({})).toBe(false);
    expect(isInfisicalManaged({ SECRETS_SOURCE: "disk" })).toBe(false);
  });
});

describe("loadSecretLayers under Infisical", () => {
  it("never lets disk files override injected secrets but still fills gaps", () => {
    const dir = makeEnvDir({
      ".env.local": "DATABASE_URL=postgres://from-disk-local\nONLY_ON_DISK=disk-only-value\n",
      ".env": "DATABASE_URL=postgres://from-disk-env\n",
    });
    const env: NodeJS.ProcessEnv = {
      SECRETS_SOURCE: "infisical",
      DATABASE_URL: "postgres://from-infisical",
    };

    const result = loadSecretLayers({ cwd: dir, env });

    expect(result.source).toBe("infisical");
    // The injected value survives every disk layer.
    expect(env.DATABASE_URL).toBe("postgres://from-infisical");
    expect(result.contributedKeys).not.toContain("DATABASE_URL");
    // A key Infisical does not provide can still come from disk during transition.
    expect(env.ONLY_ON_DISK).toBe("disk-only-value");
    expect(result.contributedKeys).toContain("ONLY_ON_DISK");
    expect(result.loadedFiles).toHaveLength(2);
  });
});

describe("loadSecretLayers in legacy disk mode", () => {
  it("keeps .env.local winning over ambient env and .env filling gaps", () => {
    const dir = makeEnvDir({
      ".env.local": "DATABASE_URL=postgres://from-disk-local\n",
      ".env": "DATABASE_URL=postgres://from-disk-env\nOTHER=from-env-file\n",
    });
    const env: NodeJS.ProcessEnv = { DATABASE_URL: "postgres://from-ambient" };

    const result = loadSecretLayers({ cwd: dir, env });

    expect(result.source).toBe("disk");
    expect(env.DATABASE_URL).toBe("postgres://from-disk-local");
    expect(env.OTHER).toBe("from-env-file");
    expect(result.contributedKeys).toEqual(
      expect.arrayContaining(["DATABASE_URL", "OTHER"])
    );
  });

  it("is a no-op when no env files exist", () => {
    const dir = makeEnvDir({});
    const env: NodeJS.ProcessEnv = { KEEP: "1" };

    const result = loadSecretLayers({ cwd: dir, env });

    expect(result.loadedFiles).toEqual([]);
    expect(result.contributedKeys).toEqual([]);
    expect(env).toEqual({ KEEP: "1" });
  });
});
