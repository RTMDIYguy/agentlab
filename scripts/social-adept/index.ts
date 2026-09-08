import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { SignalCollector } from "./collector.js";
import { SignalClassifier } from "./classifier.js";
import { SignalSink } from "./sink.js";
import type { SocialAdeptConfig, ScanRunResult } from "./types.js";

function usage(): string {
  return [
    "Social Adept: Founder Signal & Social Listening Radar",
    "",
    "Usage:",
    "  pnpm social-adept:scan [options]",
    "",
    "Options:",
    "  --config <path>    Config file path (default: config/social-adept-sources.json)",
    "  --out-dir <path>   Output directory (default: output/social-adept)",
    "  --dry-run          Run collection and classification without writing persistent files",
    "  --help, -h         Show help",
    "",
    "Env:",
    "  GEMINI_API_KEY     Optional (Enables Gemini LLM classification; falls back to heuristics)",
    "",
  ].join("\n");
}

async function loadConfig(configPath: string): Promise<SocialAdeptConfig> {
  try {
    const raw = await readFile(configPath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[SocialAdept] Could not read ${configPath}, using default config. (${(err as Error).message})`);
    return {
      reddit: {
        enabled: true,
        subreddits: ["SaaS", "Entrepreneur", "agency"],
        queries: ["AI tools Zapier", "SaaS bloat"],
        limit: 5,
      },
      hackerNews: {
        enabled: true,
        queries: ["AI agents agency", "SaaS fatigue"],
        limit: 5,
      },
    };
  }
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  let configPath = "config/social-adept-sources.json";
  let outDir = "output/social-adept";
  let dryRun = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      console.log(usage());
      return;
    }
    if (arg === "--config" && argv[i + 1]) {
      configPath = argv[++i];
    } else if (arg === "--out-dir" && argv[i + 1]) {
      outDir = argv[++i];
    } else if (arg === "--dry-run") {
      dryRun = true;
    }
  }

  const startedAt = new Date().toISOString();
  const runId = Math.random().toString(36).substring(2, 9);

  console.log(`[SocialAdept] Starting Market Signal Scan (Run: ${runId})...`);

  const config = await loadConfig(configPath);
  const collector = new SignalCollector(config);
  const classifier = new SignalClassifier();
  const sink = new SignalSink(outDir);

  console.log(`[SocialAdept] Collecting signals from public endpoints...`);
  const rawItems = await collector.collectAll();
  console.log(`[SocialAdept] Collected ${rawItems.length} candidate items.`);

  if (rawItems.length === 0) {
    console.log(`[SocialAdept] No new items discovered. Finished.`);
    return;
  }

  console.log(`[SocialAdept] Classifying signals (LLM / Heuristic)...`);
  const classified = await classifier.classifyBatch(rawItems);
  const highValue = classified.filter((s) => s.classification.actionableScore >= 4);

  const result: ScanRunResult = {
    runId,
    startedAt,
    completedAt: new Date().toISOString(),
    totalCollected: rawItems.length,
    totalClassified: classified.length,
    highValueCount: highValue.length,
    digestPath: "",
    signals: classified,
  };

  if (dryRun) {
    console.log(`\n--- [DRY RUN] Generated Digest Preview ---`);
    console.log(sink.generateDigestMarkdown(result));
    console.log(`--- [DRY RUN] Complete ---`);
    return;
  }

  const { digestFile, jsonFile } = await sink.saveOutputs(result);
  result.digestPath = digestFile;

  console.log(`\n======================================================`);
  console.log(` [SocialAdept] Scan Complete!`);
  console.log(` - Total Signals Analyzed: ${classified.length}`);
  console.log(` - High-Value Opportunities: ${highValue.length}`);
  console.log(` - Digest Markdown: ${path.resolve(digestFile)}`);
  console.log(` - Structured JSON: ${path.resolve(jsonFile)}`);
  console.log(`======================================================\n`);
}

main().catch((err) => {
  console.error(`[SocialAdept] Fatal error:`, err);
  process.exit(1);
});
