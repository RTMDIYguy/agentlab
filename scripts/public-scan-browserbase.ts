import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

type CliOptions = {
  outDir: string;
  tag?: string;
  urlsFile?: string;
  screenshot: boolean;
};

function usage(): string {
  return [
    "Browserbase public scan renderer",
    "",
    "Usage:",
    "  pnpm public-scan:browserbase -- <url1> <url2> ...",
    "  pnpm public-scan:browserbase -- --urls-file urls.txt",
    "",
    "Options:",
    "  --out-dir <path>      Output root (default: output/public-signal-snapshots)",
    "  --tag <name>          Optional subfolder tag (e.g., ltem-scan)",
    "  --urls-file <path>    File containing one URL per line (supports # comments)",
    "  --no-screenshot       Skip PNG capture",
    "",
    "Env:",
    "  BROWSERBASE_API_KEY       Required",
    "  BROWSERBASE_PROJECT_ID    Optional (passed via env; Stagehand uses it when supported)",
    "  BROWSERBASE_MODEL         Optional (default: google/gemini-3-flash-preview)",
    "",
  ].join("\n");
}

function parseArgs(argv: string[]): { options: CliOptions; urls: string[]; showHelp: boolean } {
  const options: CliOptions = {
    outDir: "output/public-signal-snapshots",
    screenshot: true,
  };
  const urls: string[] = [];
  let showHelp = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg) continue;

    if (arg === "--help" || arg === "-h") {
      showHelp = true;
      continue;
    }

    if (arg === "--out-dir") {
      const next = argv[i + 1];
      if (!next) throw new Error("Missing value for --out-dir");
      options.outDir = next;
      i += 1;
      continue;
    }

    if (arg === "--tag") {
      const next = argv[i + 1];
      if (!next) throw new Error("Missing value for --tag");
      options.tag = next;
      i += 1;
      continue;
    }

    if (arg === "--urls-file") {
      const next = argv[i + 1];
      if (!next) throw new Error("Missing value for --urls-file");
      options.urlsFile = next;
      i += 1;
      continue;
    }

    if (arg === "--no-screenshot") {
      options.screenshot = false;
      continue;
    }

    if (arg.startsWith("--")) {
      throw new Error(`Unknown option: ${arg}`);
    }

    urls.push(arg);
  }

  return { options, urls, showHelp };
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function safeSlug(input: string): string {
  const normalized = input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized.length ? normalized : "snapshot";
}

async function readUrlsFile(filePath: string): Promise<string[]> {
  const raw = await readFile(filePath, "utf8");
  return raw
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => !line.startsWith("#"));
}

async function main(): Promise<void> {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.showHelp) {
    process.stdout.write(`${usage()}\n`);
    return;
  }

  const { options, urls: directUrls } = parsed;
  const fileUrls = options.urlsFile ? await readUrlsFile(options.urlsFile) : [];
  const urls = [...directUrls, ...fileUrls];

  if (!urls.length) {
    process.stdout.write(`${usage()}\n`);
    return;
  }

  const apiKey = process.env.BROWSERBASE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing env var: BROWSERBASE_API_KEY");
  }

  const model = process.env.BROWSERBASE_MODEL ?? "google/gemini-3-flash-preview";

  const runRoot = path.resolve(
    options.outDir,
    todayIsoDate(),
    options.tag ? safeSlug(options.tag) : "",
  );
  await mkdir(runRoot, { recursive: true });

  const { Stagehand } = await import("@browserbasehq/stagehand");
  const stagehand = new Stagehand({
    env: "BROWSERBASE",
    model,
  });

  await stagehand.init();
  const page = stagehand.page;

  for (const url of urls) {
    const startedAt = new Date().toISOString();
    let responseStatus: number | null = null;

    try {
      const response = await page.goto(url, { waitUntil: "domcontentloaded" });
      responseStatus = response ? response.status() : null;
      await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
      await page.waitForTimeout(1_000);

      const title = await page.title().catch(() => "");
      const html = await page.content();
      const htmlSha256 = createHash("sha256").update(html, "utf8").digest("hex");

      const targetDir = path.join(runRoot, safeSlug(url));
      await mkdir(targetDir, { recursive: true });

      await writeFile(path.join(targetDir, "page.html"), html, "utf8");
      if (options.screenshot) {
        await page.screenshot({ path: path.join(targetDir, "screenshot.png"), fullPage: true });
      }

      const meta = {
        startedAt,
        finishedAt: new Date().toISOString(),
        url,
        finalUrl: page.url(),
        title,
        responseStatus,
        htmlSha256,
        model,
      };
      await writeFile(path.join(targetDir, "meta.json"), JSON.stringify(meta, null, 2), "utf8");

      process.stdout.write(`OK ${url} -> ${targetDir}\n`);
    } catch (error) {
      const targetDir = path.join(runRoot, safeSlug(url));
      await mkdir(targetDir, { recursive: true });

      const meta = {
        startedAt,
        finishedAt: new Date().toISOString(),
        url,
        responseStatus,
        error: error instanceof Error ? error.message : String(error),
      };
      await writeFile(path.join(targetDir, "meta.json"), JSON.stringify(meta, null, 2), "utf8");

      process.stderr.write(`FAIL ${url} (${meta.error})\n`);
    }
  }

  await stagehand.close();
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
