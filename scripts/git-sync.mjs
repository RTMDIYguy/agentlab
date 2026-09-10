#!/usr/bin/env node

/**
 * git-sync.mjs - Automated Git Sync Utility for AgentLab
 *
 * Usage:
 *   node scripts/git-sync.mjs [commit message] [flags]
 *   pnpm git:sync
 *   pnpm git:sync "feat: add new feature"
 *
 * Flags:
 *   --no-pull    Skip pulling from remote
 *   --no-push    Commit locally but do not push to remote
 *   --dry-run    Preview what will be staged/synced without executing changes
 *   --help, -h   Show help message
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import process from "process";

const args = process.argv.slice(2);

// Check for help flag
if (args.includes("--help") || args.includes("-h")) {
  console.log(`
\x1b[1m\x1b[36mAgentLab Git Sync Utility\x1b[0m

\x1b[1mUsage:\x1b[0m
  node scripts/git-sync.mjs [commit message] [options]
  pnpm git:sync [commit message]

\x1b[1mOptions:\x1b[0m
  --no-pull      Skip pulling latest changes before committing
  --no-push      Commit locally without pushing to remote
  --dry-run      Show planned actions without modifying git state
  -h, --help     Show this help screen
`);
  process.exit(0);
}

const noPull = args.includes("--no-pull");
const noPush = args.includes("--no-push");
const dryRun = args.includes("--dry-run");

// Filter out flag arguments to extract user commit message if provided
const messageArgs = args.filter(arg => !arg.startsWith("--") && !arg.startsWith("-"));
const userMessage = messageArgs.join(" ").trim();

function run(cmd, options = {}) {
  try {
    return execSync(cmd, {
      encoding: "utf8",
      stdio: options.silent ? "pipe" : "pipe",
      ...options,
    }).trim();
  } catch (error) {
    if (options.ignoreError) return null;
    throw error;
  }
}

function log(msg, color = "\x1b[32m") {
  console.log(`${color}[git-sync]\x1b[0m ${msg}`);
}

function warn(msg) {
  console.log(`\x1b[33m[git-sync] ⚠️  ${msg}\x1b[0m`);
}

function errorLog(msg) {
  console.error(`\x1b[31m[git-sync] ❌ ${msg}\x1b[0m`);
}

async function sync() {
  console.log("\n\x1b[1m\x1b[36m========================================\x1b[0m");
  console.log("\x1b[1m\x1b[36m   🔄 AgentLab Automated Git Sync       \x1b[0m");
  console.log("\x1b[1m\x1b[36m========================================\x1b[0m\n");

  // 0. Clear stale index.lock if present from aborted processes
  const lockFile = path.resolve(process.cwd(), ".git", "index.lock");
  if (fs.existsSync(lockFile)) {
    try {
      fs.unlinkSync(lockFile);
      log("Cleaned up stale .git/index.lock file.", "\x1b[33m");
    } catch (e) {
      warn(`Could not remove index.lock: ${e.message}`);
    }
  }

  // 1. Verify we are in a git repository
  try {
    run("git rev-parse --is-inside-work-tree", { silent: true });
  } catch {
    errorLog("Current directory is not a valid git repository.");
    process.exit(1);
  }

  // 2. Identify current branch and remote
  const branch = run("git rev-parse --abbrev-ref HEAD", { silent: true }) || "main";
  const remote = run("git remote", { silent: true }).split("\n")[0] || "origin";

  log(`Branch: \x1b[1m${branch}\x1b[0m | Remote: \x1b[1m${remote}\x1b[0m`);

  // 3. Inspect working tree status
  const statusOutput = run("git status --porcelain", { silent: true });
  const hasChanges = statusOutput.length > 0;

  if (hasChanges) {
    const changedFiles = statusOutput.split("\n").filter(Boolean);
    log(`Detected \x1b[1m${changedFiles.length}\x1b[0m modified/untracked file(s):`);
    changedFiles.slice(0, 10).forEach(line => console.log(`   ${line}`));
    if (changedFiles.length > 10) {
      console.log(`   ... and ${changedFiles.length - 10} more file(s)`);
    }
  } else {
    log("Working tree clean (no unstaged/uncommitted changes).", "\x1b[34m");
  }

  if (dryRun) {
    warn("Dry run mode enabled. No changes will be made.");
    process.exit(0);
  }

  // 4. Pull latest changes from remote (if enabled)
  if (!noPull) {
    log(`Pulling latest changes from \x1b[1m${remote}/${branch}\x1b[0m...`);
    try {
      if (hasChanges) {
        // Use autostash to cleanly merge or rebase if working directory is dirty
        run(`git pull --rebase --autostash ${remote} ${branch}`);
      } else {
        run(`git pull --rebase ${remote} ${branch}`);
      }
      log("Successfully synchronized with remote branch.");
    } catch (pullErr) {
      warn(`Pull/rebase encountered a note or warning: ${pullErr.message || pullErr}`);
      log("Continuing with local sync...");
    }
  } else {
    log("Skipping pull (--no-pull specified).", "\x1b[33m");
  }

  // 5. Stage and Commit changes (if there are changes)
  // Soft reset unpushed commits to remote tracking branch so clean unified commit is created
  try {
    const unpushed = run(`git log ${remote}/${branch}..HEAD --oneline`, { silent: true, ignoreError: true });
    if (unpushed && unpushed.trim().length > 0) {
      log("Squashing unpushed local commit(s) into staging...");
      run(`git reset ${remote}/${branch}`);
    }
  } catch {
    // Ignore if tracking branch is not yet established
  }

  const currentStatus = run("git status --porcelain", { silent: true });
  if (currentStatus.length > 0) {
    log("Staging all changes (git add -A)...");
    run("git add -A");

    const now = new Date();
    const timestamp = now.toISOString().replace("T", " ").substring(0, 19);
    const commitMsg = userMessage || `chore: automated workspace sync [${timestamp}]`;

    log(`Committing with message: "\x1b[1m${commitMsg}\x1b[0m"`);
    run(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`);
    log("Changes committed successfully.");
  } else {
    log("No local changes require committing.", "\x1b[34m");
  }

  // 6. Push to remote (if enabled)
  if (!noPush) {
    log(`Pushing commits to \x1b[1m${remote}/${branch}\x1b[0m...`);
    try {
      run(`git push ${remote} ${branch}`);
      log("🚀 Push completed successfully!", "\x1b[1m\x1b[32m");
    } catch (pushErr) {
      errorLog(`Failed to push to ${remote}/${branch}: ${pushErr.message || pushErr}`);
      warn("Your local commits are safe. Verify network/credentials and run `pnpm git:sync` again.");
      process.exit(1);
    }
  } else {
    log("Skipping push (--no-push specified).", "\x1b[33m");
  }

  console.log("\n\x1b[1m\x1b[32m✨ Git synchronization complete!\x1b[0m\n");
}

sync().catch(err => {
  errorLog(`Unexpected error during git sync: ${err.message || err}`);
  process.exit(1);
});
