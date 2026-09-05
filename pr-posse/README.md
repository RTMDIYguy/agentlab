# 🤠 PR Posse

A swarm of specialized AI agents reviews your GitHub pull request — in parallel — then synthesizes one clean, prioritized verdict you can post back to the PR.

Built on top of the [`swarm-orchestration`](https://github.com/ruvnet/agentic-flow/blob/main/.claude/skills/swarm-orchestration/SKILL.md) skill from [agentic-flow](https://www.npmjs.com/package/agentic-flow). Each reviewer is an independent agent; they don't see each other's findings, which avoids groupthink. The synthesizer then reads everyone's report and writes the final review.

```
   ┌──────────── MESH (parallel) ────────────┐         PIPELINE
   │  🔒 Security   📐 Style   📚 Docs        │            │
   │  ⚡ Perf       🧪 Tests                  │   ───────► 🧠 Synthesizer ───► review.md
   └──────────────────────────────────────────┘
```

## What it does

For any GitHub PR, PR Posse:

1. Pulls the unified diff and metadata via the `gh` CLI (no token plumbing — `gh` is already authed).
2. Spawns **5 reviewer agents in parallel** via `agentic-flow`, each looking at the PR through one specialty:
   - 🔒 **Security Sentinel** — injection, auth flaws, leaked secrets, unsafe patterns
   - ⚡ **Perf Hawk** — N+1s, blocking I/O, unbounded structures, hot paths
   - 📐 **Style Sergeant** — readability, naming, conventions, dead code
   - 🧪 **Test Tracker** — coverage gaps, missing edge cases, brittle tests
   - 📚 **Docs Detective** — README/CHANGELOG drift, undocumented APIs and flags
3. Pipes their five reports into a 🧠 **Posse Captain** synthesizer agent that dedupes, prioritizes, and produces the final verdict.
4. Prints the report (or writes it to a file, or posts it as a PR comment).

If one reviewer agent crashes, the rest continue — fault tolerance per the skill's best practices.

## Quick start (Ubuntu)

```bash
git clone <wherever you put this>  pr-posse
cd pr-posse
./install.sh
```

The installer checks for Node ≥ 18 and `gh` (and that `gh` is authenticated), runs `npm install`, and symlinks `pr-posse` into `~/.local/bin`.

If `pr-posse` isn't found after install, add `~/.local/bin` to your `PATH`:

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc && source ~/.bashrc
```

### See a sample report (no API key needed)

```bash
pr-posse --demo
```

This uses canned reviewer outputs so you can see exactly what a real report looks like without spending a single API token.

### Real reviews

You'll need an Anthropic API key:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

Then point it at any PR you can read:

```bash
# From inside a repo clone, just give a number:
pr-posse 42

# From anywhere:
pr-posse owner/repo#42
pr-posse https://github.com/owner/repo/pull/42

# Save to file:
pr-posse 42 --out review.md

# Post the review back to GitHub as a comment:
pr-posse 42 --post
```

## Options

| Flag | Effect |
|---|---|
| `--demo` | Use canned outputs; spawn no agents. |
| `--post` | Post the report as a comment on the PR. |
| `--out <file>` | Write report to a file instead of stdout. |
| `--model <id>` | Override the model the agents use (e.g. `claude-sonnet-4-5`). |
| `--quiet` | Suppress progress output. |
| `-h`, `--help` | Show help. |

## How the swarm works

The `swarm-orchestration` skill describes three patterns: mesh (parallel peers), hierarchical (queen + workers), and pipeline (sequential stages). PR Posse uses **mesh + pipeline**:

- **Mesh phase**: `Promise.all` over the 5 reviewers, each invoking `npx agentic-flow --agent reviewer --task <specialized-prompt>` in its own subprocess. They run truly concurrently and never see each other.
- **Pipeline phase**: once the mesh completes, the synthesizer agent runs once, with all 5 reviewer outputs as input.

If you want to tweak the swarm, everything lives in [`src/reviewers.js`](src/reviewers.js). Adding a sixth reviewer is a matter of pushing one object onto the `REVIEWERS` array — the orchestrator scales automatically.

## File layout

```
pr-posse/
├── bin/pr-posse           # Shebanged entry, just imports src/index.js
├── src/
│   ├── index.js           # CLI: parse args, glue everything together
│   ├── github.js          # Thin wrapper around the `gh` CLI
│   ├── swarm.js           # Mesh + pipeline orchestration
│   ├── reviewers.js       # The 5 reviewer specs + the synthesizer
│   └── report.js          # Markdown rendering
├── examples/
│   └── sample-output.md   # What a finished report looks like
├── install.sh             # Ubuntu-friendly setup
├── package.json
├── .env.example
└── README.md
```

## Tweaking & extending

- **Different specialties**: edit `REVIEWERS` in `src/reviewers.js`. The framework supports many agent types beyond `reviewer` (see agentic-flow's docs); change `agentType` per reviewer if you want.
- **Different model**: pass `--model claude-sonnet-4-5` (or whatever) on the CLI, or set it in `.env`.
- **Run in CI**: nothing about this is laptop-specific. In a GitHub Actions workflow, install Node + `gh` (`gh` is preinstalled on GitHub-hosted runners), set `ANTHROPIC_API_KEY` as a secret, and run `pr-posse ${{ github.event.pull_request.number }} --post --quiet`.

## Troubleshooting

| Problem | Fix |
|---|---|
| `gh` not found | `sudo apt install gh` (or see https://cli.github.com) |
| `gh` not authenticated | `gh auth login` |
| `ANTHROPIC_API_KEY` missing | Add to `.env` or `export` it in your shell |
| One reviewer hangs | Each agent has a 5-minute timeout; the rest finish without it |
| Want to dry-run a real PR cheaply | Use `--demo` first to confirm the report shape |

## License

MIT.
