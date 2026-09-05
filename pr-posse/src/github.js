/**
 * Thin wrapper around the `gh` CLI.
 *
 * We use gh instead of the GitHub API directly because:
 *   1. The user already has gh authenticated — no token plumbing.
 *   2. gh handles enterprise hosts, SSO, fine-grained tokens, etc., for us.
 *   3. It works the same on a laptop or in a GitHub Actions runner.
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);

/** Run `gh` with args and return stdout. Throws with a friendly message on failure. */
async function gh(args, { cwd } = {}) {
  try {
    const { stdout } = await exec('gh', args, { cwd, maxBuffer: 32 * 1024 * 1024 });
    return stdout;
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(
        "The `gh` CLI is not installed or not on PATH.\n" +
        "Install it: https://cli.github.com/  (on Ubuntu: `sudo apt install gh`)"
      );
    }
    const stderr = (err.stderr || '').trim();
    throw new Error(`gh ${args.join(' ')} failed: ${stderr || err.message}`);
  }
}

/** Confirm the user is logged in to gh. Returns the user login. */
export async function ensureAuth() {
  try {
    const out = await gh(['auth', 'status']);
    // The login is in stderr-or-stdout depending on gh version; cheap parse.
    const match = out.match(/Logged in to [^\s]+ as ([^\s]+)/);
    return match ? match[1] : 'unknown';
  } catch {
    throw new Error("You're not logged in to gh. Run: `gh auth login`");
  }
}

/**
 * Resolve a PR identifier into a normalized form.
 * Accepts:
 *   - { number: 42 }                         → uses current repo (cwd must be a clone)
 *   - { repo: "owner/name", number: 42 }
 *   - { url: "https://github.com/o/n/pull/42" }
 */
export function normalizePrRef(ref) {
  if (ref.url) {
    const m = ref.url.match(/github\.com\/([^/]+\/[^/]+)\/pull\/(\d+)/);
    if (!m) throw new Error(`Not a recognizable PR URL: ${ref.url}`);
    return { repo: m[1], number: Number(m[2]) };
  }
  return { repo: ref.repo, number: Number(ref.number) };
}

/** Fetch PR metadata + the unified diff. */
export async function fetchPr({ repo, number }) {
  const repoFlag = repo ? ['--repo', repo] : [];

  // Metadata as JSON.
  const fields = [
    'number', 'title', 'body', 'author', 'baseRefName', 'headRefName',
    'state', 'isDraft', 'additions', 'deletions', 'changedFiles', 'url',
    'files',
  ].join(',');
  const metaRaw = await gh(['pr', 'view', String(number), ...repoFlag, '--json', fields]);
  const meta = JSON.parse(metaRaw);

  // Unified diff.
  const diff = await gh(['pr', 'diff', String(number), ...repoFlag]);

  return {
    repo: repo || (meta.url ? meta.url.match(/github\.com\/([^/]+\/[^/]+)/)?.[1] : 'unknown'),
    number: meta.number,
    title: meta.title,
    body: meta.body || '',
    author: meta.author?.login || 'unknown',
    base: meta.baseRefName,
    head: meta.headRefName,
    isDraft: meta.isDraft,
    additions: meta.additions,
    deletions: meta.deletions,
    changedFiles: meta.changedFiles,
    url: meta.url,
    files: (meta.files || []).map(f => f.path),
    diff,
  };
}

/** Post the report as a PR comment. */
export async function postComment({ repo, number }, body) {
  const repoFlag = repo ? ['--repo', repo] : [];
  await gh(['pr', 'comment', String(number), ...repoFlag, '--body', body]);
}
