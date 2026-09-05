/**
 * Swarm orchestration for PR Posse.
 *
 * Pattern (from the swarm-orchestration skill):
 *
 *   ┌──────────── MESH (parallel) ────────────┐         PIPELINE
 *   │  🔒 Security   📐 Style   📚 Docs       │            │
 *   │  ⚡ Perf       🧪 Tests                  │   ───────► 🧠 Synthesizer ───► report
 *   └──────────────────────────────────────────┘
 *
 * Phase 1 (mesh): every reviewer agent runs concurrently on the same diff.
 *                 No agent depends on another's output.
 * Phase 2 (pipeline): the synthesizer agent runs once Phase 1 completes,
 *                     consuming all reviewer outputs.
 *
 * Each agent is realized as `npx agentic-flow --agent reviewer --task <prompt>`
 * — that's the stable public CLI for spawning a single agentic-flow agent
 * backed by Claude. We orchestrate N of these in parallel with Promise.all.
 *
 * If the user is offline / has no API key, --demo mode swaps in canned
 * reviewer outputs so they can see a real report without spending a token.
 */

import { spawn } from 'node:child_process';
import { REVIEWERS, SYNTHESIZER } from './reviewers.js';

/** Run a single agent and return its stdout. */
function runAgent({ agentType, prompt, timeoutMs = 5 * 60 * 1000, model }) {
  return new Promise((resolve, reject) => {
    const args = ['agentic-flow', '--agent', agentType, '--task', prompt];
    if (model) args.push('--model', model);

    const child = spawn('npx', args, {
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', d => { stdout += d; });
    child.stderr.on('data', d => { stderr += d; });

    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`Agent timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.on('close', code => {
      clearTimeout(timer);
      if (code === 0) return resolve(stdout.trim());
      reject(new Error(
        `Agent exited with code ${code}\n` +
        `stderr: ${stderr.trim().slice(-500)}`
      ));
    });

    child.on('error', err => {
      clearTimeout(timer);
      if (err.code === 'ENOENT') {
        return reject(new Error(
          "Could not find `npx`. Is Node.js installed?\n" +
          "On Ubuntu: `sudo apt install nodejs npm`"
        ));
      }
      reject(err);
    });
  });
}

/**
 * Run the parallel mesh phase: all reviewers at once.
 * Returns an array of { id, name, emoji, output, error? } in REVIEWER order.
 *
 * We catch errors per-reviewer so one bad agent doesn't tank the whole swarm —
 * that's the "fault tolerance" point from the skill's best practices.
 */
async function runMeshPhase(prData, { onProgress, model }) {
  onProgress?.({ phase: 'mesh-start', count: REVIEWERS.length });

  const tasks = REVIEWERS.map(async (r) => {
    const start = Date.now();
    try {
      onProgress?.({ phase: 'agent-start', id: r.id, name: r.name, emoji: r.emoji });
      const output = await runAgent({
        agentType: r.agentType,
        prompt: r.prompt({ diff: prData.diff, files: prData.files, meta: prData }),
        model,
      });
      const ms = Date.now() - start;
      onProgress?.({ phase: 'agent-done', id: r.id, name: r.name, emoji: r.emoji, ms });
      return { id: r.id, name: r.name, emoji: r.emoji, output };
    } catch (err) {
      const ms = Date.now() - start;
      onProgress?.({ phase: 'agent-fail', id: r.id, name: r.name, emoji: r.emoji, ms, error: err.message });
      return { id: r.id, name: r.name, emoji: r.emoji, output: `_(reviewer failed: ${err.message})_`, error: err.message };
    }
  });

  return Promise.all(tasks);
}

/** Run the synthesizer phase: one agent ingests all reviewer outputs. */
async function runSynthesizerPhase(prData, reviews, { onProgress, model }) {
  onProgress?.({ phase: 'synth-start' });
  const start = Date.now();
  try {
    const output = await runAgent({
      agentType: SYNTHESIZER.agentType,
      prompt: SYNTHESIZER.prompt({ meta: prData, reviews }),
      model,
    });
    const ms = Date.now() - start;
    onProgress?.({ phase: 'synth-done', ms });
    return output;
  } catch (err) {
    onProgress?.({ phase: 'synth-fail', error: err.message });
    // Fall back: if the synthesizer fails, hand back the raw reviews so the
    // user still gets *something*.
    return reviews
      .map(r => `### ${r.emoji} ${r.name}\n${r.output}`)
      .join('\n\n---\n\n');
  }
}

/** Public entry: run the full PR Posse swarm. */
export async function reviewPr(prData, opts = {}) {
  const { onProgress, model, demo } = opts;

  const reviews = demo
    ? cannedReviews(prData)
    : await runMeshPhase(prData, { onProgress, model });

  const synthesis = demo
    ? cannedSynthesis(prData, reviews)
    : await runSynthesizerPhase(prData, reviews, { onProgress, model });

  return { reviews, synthesis };
}

/* ----------------------------- demo fixtures ------------------------------ */

function cannedReviews(prData) {
  return [
    { id: 'security', emoji: '🔒', name: 'Security Sentinel', output:
      `Verdict: minor concerns
- [LOW] \`src/auth.js:42\` — user-supplied \`redirectUrl\` is concatenated into a header without allowlist validation. Open redirect risk.
- [LOW] No findings on the new DB query — it uses parameterized statements. Good.` },
    { id: 'performance', emoji: '⚡', name: 'Perf Hawk', output:
      `Verdict: minor concerns
- [MED] \`src/users.js:88\` — \`getActiveUsers\` calls \`fetchProfile\` inside a loop. Classic N+1; batch with \`fetchProfilesByIds\`.
- [LOW] The new cache has no TTL; on a long-running process it will grow unbounded.` },
    { id: 'style', emoji: '📐', name: 'Style Sergeant', output:
      `Verdict: clean
- [nit] \`src/users.js:54\` — function name \`doIt\` is opaque. Consider \`hydrateUserSession\`.` },
    { id: 'tests', emoji: '🧪', name: 'Test Tracker', output:
      `Verdict: gaps
- [HIGH] No test exercises the new \`/auth/redirect\` path. Given the security note above, please add coverage for both allowed and disallowed redirect targets.
- [MED] The N+1 fix (once added) should have a regression test asserting a single DB call.` },
    { id: 'docs', emoji: '📚', name: 'Docs Detective', output:
      `Verdict: docs gap
- [LOW] \`README.md\` still describes the old single-user auth flow. The PR adds multi-tenant; update the "Authentication" section.
- [LOW] New \`AUTH_REDIRECT_ALLOWLIST\` env var is undocumented in \`.env.example\`.` },
  ];
}

function cannedSynthesis(prData, reviews) {
  return `## Overall Verdict
⚠️ Approve with nits — there's good work here, but a few items should land before merge.

## Must Fix
- **Open redirect risk** in \`src/auth.js:42\`: validate \`redirectUrl\` against an allowlist before reflecting it in a response header.
- **Missing test coverage** for the new \`/auth/redirect\` path. Cover both allowed and disallowed targets.

## Should Fix
- **N+1 query** in \`src/users.js:88\`. Replace the per-user \`fetchProfile\` call with a batched \`fetchProfilesByIds\`.
- **Unbounded cache** introduced in this PR — give it a TTL or size cap.
- Update the **README** authentication section to describe the new multi-tenant flow, and document **\`AUTH_REDIRECT_ALLOWLIST\`** in \`.env.example\`.

## Nits
- Rename \`doIt\` in \`src/users.js:54\` to something descriptive (\`hydrateUserSession\`?).

## Kudos
- All new DB calls use parameterized queries — solid baseline hygiene.
`;
}
