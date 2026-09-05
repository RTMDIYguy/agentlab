#!/usr/bin/env node
/**
 * PR Posse — CLI entry point.
 */

import { parseArgs } from 'node:util';
import { writeFileSync } from 'node:fs';
import { ensureAuth, fetchPr, normalizePrRef, postComment } from './github.js';
import { reviewPr } from './swarm.js';
import { renderReport } from './report.js';

const HELP = `
🤠 pr-posse — a swarm of agents reviews your GitHub PR

Usage:
  pr-posse <pr>                  Review the given PR
  pr-posse --demo                Print a sample report (no API calls)

Where <pr> is one of:
  • A number (e.g. 42) — uses the repo of your current directory
  • owner/repo#42
  • A full PR URL: https://github.com/owner/repo/pull/42

Options:
  --post                Post the report as a comment on the PR
  --out <file>          Write the report to a file (default: stdout)
  --model <name>        Override the model agentic-flow uses (e.g. claude-sonnet-4-5)
  --demo                Use canned reviewer outputs (no agents spawned, no API key needed)
  --quiet               Suppress progress output
  -h, --help            Show this help

Examples:
  pr-posse 42
  pr-posse owner/repo#42 --post
  pr-posse https://github.com/owner/repo/pull/42 --out review.md
  pr-posse --demo
`;

function parsePrArg(arg) {
  if (!arg) return null;
  if (/^\d+$/.test(arg)) return { number: Number(arg) };
  if (arg.startsWith('http')) return normalizePrRef({ url: arg });
  const m = arg.match(/^([^/]+\/[^#]+)#(\d+)$/);
  if (m) return { repo: m[1], number: Number(m[2]) };
  throw new Error(`Could not parse "${arg}" as a PR. Try a number, owner/repo#N, or a URL.`);
}

function progressLogger(quiet) {
  if (quiet) return () => {};
  return (e) => {
    switch (e.phase) {
      case 'mesh-start':
        console.error(`\n🐝 Spawning ${e.count} reviewers in parallel mesh...\n`);
        break;
      case 'agent-start':
        console.error(`  ${e.emoji}  ${e.name} — working...`);
        break;
      case 'agent-done':
        console.error(`  ${e.emoji}  ${e.name} — done in ${(e.ms / 1000).toFixed(1)}s ✅`);
        break;
      case 'agent-fail':
        console.error(`  ${e.emoji}  ${e.name} — FAILED after ${(e.ms / 1000).toFixed(1)}s: ${e.error}`);
        break;
      case 'synth-start':
        console.error(`\n🧠 Synthesizer combining findings...\n`);
        break;
      case 'synth-done':
        console.error(`  Done in ${(e.ms / 1000).toFixed(1)}s ✅\n`);
        break;
      case 'synth-fail':
        console.error(`  Synthesizer failed: ${e.error}\n  Falling back to raw reviews.\n`);
        break;
    }
  };
}

async function main() {
  let parsed;
  try {
    parsed = parseArgs({
      allowPositionals: true,
      options: {
        post: { type: 'boolean', default: false },
        out: { type: 'string' },
        model: { type: 'string' },
        demo: { type: 'boolean', default: false },
        quiet: { type: 'boolean', default: false },
        help: { type: 'boolean', short: 'h', default: false },
      },
    });
  } catch (err) {
    console.error(`Error: ${err.message}\n${HELP}`);
    process.exit(2);
  }

  const { values, positionals } = parsed;
  if (values.help) {
    console.log(HELP);
    return;
  }

  const onProgress = progressLogger(values.quiet);

  // ─── Demo mode: skip everything network-y, just render a canned report ────
  if (values.demo) {
    const fakePr = {
      repo: 'acme/widgets', number: 42,
      title: 'Add multi-tenant auth + redirect handling',
      author: 'octocat', base: 'main', head: 'feat/multi-tenant-auth',
      additions: 187, deletions: 23, changedFiles: 6,
      url: 'https://github.com/acme/widgets/pull/42',
      files: ['src/auth.js', 'src/users.js', 'src/cache.js', 'README.md', '.env.example', 'tests/auth.test.js'],
      diff: '(elided)', body: '',
    };
    const { reviews, synthesis } = await reviewPr(fakePr, { demo: true });
    const report = renderReport({ prData: fakePr, reviews, synthesis });
    output(report, values);
    return;
  }

  // ─── Real mode: need a PR argument ────────────────────────────────────────
  if (positionals.length === 0) {
    console.error(`Error: missing PR argument.\n${HELP}`);
    process.exit(2);
  }

  const ref = parsePrArg(positionals[0]);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      "⚠️  No ANTHROPIC_API_KEY in environment.\n" +
      "    The reviewers need it to run. Either:\n" +
      "      • export ANTHROPIC_API_KEY=sk-ant-...\n" +
      "      • or run with --demo to see a sample report without spending tokens.\n"
    );
    process.exit(1);
  }

  await ensureAuth();
  if (!values.quiet) console.error(`📥 Fetching PR data via gh...`);
  const prData = await fetchPr(ref);

  if (!values.quiet) {
    console.error(`   ${prData.repo}#${prData.number} — "${prData.title}"`);
    console.error(`   +${prData.additions} / -${prData.deletions} across ${prData.changedFiles} file(s)`);
  }

  const { reviews, synthesis } = await reviewPr(prData, { onProgress, model: values.model });
  const report = renderReport({ prData, reviews, synthesis });

  output(report, values);

  if (values.post) {
    if (!values.quiet) console.error(`📤 Posting comment to ${prData.repo}#${prData.number}...`);
    await postComment(ref, report);
    if (!values.quiet) console.error(`   Posted ✅  ${prData.url}`);
  }
}

function output(report, values) {
  if (values.out) {
    writeFileSync(values.out, report);
    if (!values.quiet) console.error(`📝 Report written to ${values.out}`);
  } else {
    process.stdout.write(report);
  }
}

main().catch(err => {
  console.error(`\n❌ ${err.message}`);
  process.exit(1);
});
