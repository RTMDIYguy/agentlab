import fs from "fs";
import path from "path";
import dotenv from "dotenv";

/**
 * Secrets source resolution (2026-09-25, CC-2026-09-25-005).
 *
 * The operating system gets its credentials from Infisical, injected into the
 * process by `infisical run -- <command>`. The wrapped package.json scripts
 * mark that mode with SECRETS_SOURCE=infisical.
 *
 * The distinction matters because of `override`. Historically the app loaded
 * `.env.local` with `override: true`, which means a stale file on disk would
 * beat anything already present in the environment — including secrets the
 * Infisical CLI had just injected. That is the failure mode where a migration
 * "works" but keeps reading disk. This module makes the choice explicit:
 *
 *   - Infisical-managed: injected values win; `.env.local`/`.env` may only
 *     fill gaps (no override, standard dotenv semantics).
 *   - Disk mode (no Infisical): the previous behavior is preserved exactly —
 *     `.env.local` overrides the ambient environment, and `.env` fills the gaps.
 */

export const SECRETS_SOURCE_ENV_KEY = "SECRETS_SOURCE";
export const INFISICAL_SOURCE = "infisical";

export type SecretsSource = "infisical" | "disk";

/**
 * True when this process is running under Infisical.
 *
 * `SECRETS_SOURCE=infisical` is set by the wrapped scripts (see package.json).
 * `INFISICAL_PROJECT_ID` is honored as a secondary signal so that machine-
 * identity/CI runs are treated as Infisical-managed even if they forget the
 * flag — treating them as disk mode could clobber properly injected secrets.
 */
export function isInfisicalManaged(env: NodeJS.ProcessEnv = process.env): boolean {
  if (env[SECRETS_SOURCE_ENV_KEY] === INFISICAL_SOURCE) return true;
  return Boolean(env.INFISICAL_PROJECT_ID);
}

export interface LoadSecretLayersOptions {
  /** Directory holding `.env` / `.env.local`. Defaults to process.cwd(). */
  cwd?: string;
  /** Target object to populate. Defaults to process.env (tests pass a plain object). */
  env?: NodeJS.ProcessEnv;
}

export interface LoadSecretLayersResult {
  source: SecretsSource;
  /** Files that existed and were read, in load order. */
  loadedFiles: string[];
  /**
   * Keys whose value changed because of the disk files — i.e. the app would
   * read them from disk rather than from the environment/Infisical. Key names
   * only: never values.
   */
  contributedKeys: string[];
}

/**
 * Load `.env.local` then `.env` into `env`, honoring the source rules above.
 * Returns metadata only (file names, key names) so callers can report which
 * source supplied which credential without printing values.
 */
export function loadSecretLayers(options: LoadSecretLayersOptions = {}): LoadSecretLayersResult {
  const cwd = options.cwd ?? process.cwd();
  const env = options.env ?? process.env;
  const source: SecretsSource = isInfisicalManaged(env) ? INFISICAL_SOURCE : "disk";

  // Layer order mirrors the legacy loader exactly: `.env.local` first, then
  // `.env` as a gap-filler only. In disk mode `.env.local` (the local override
  // file) wins over the ambient environment; under Infisical nothing on disk
  // may override the injected values.
  const layers: Array<{ file: string; override: boolean }> = [
    { file: path.resolve(cwd, ".env.local"), override: source === "disk" },
    { file: path.resolve(cwd, ".env"), override: false },
  ];

  const before = new Map<string, string | undefined>(Object.entries(env));
  const loadedFiles: string[] = [];

  for (const layer of layers) {
    if (!fs.existsSync(layer.file)) continue;
    dotenv.config({ path: layer.file, override: layer.override, processEnv: env, quiet: true });
    loadedFiles.push(layer.file);
  }

  const contributedKeys = Object.keys(env).filter(key => before.get(key) !== env[key]);

  return { source, loadedFiles, contributedKeys };
}
