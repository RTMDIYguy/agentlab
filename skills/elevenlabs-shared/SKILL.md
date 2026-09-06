---
name: "elevenlabs-shared"
description: "elevenlabs CLI: Shared patterns for authentication, global flags, and output formatting."
---

# elevenlabs — Shared Reference

## Authentication

- **OAuth** (bearer): custom auth provider

## Global Flags

These flags appear across the CLI. The harness-level ones (`--dry-run`, `--format`, `--base-url`, `--quiet`) are available on every command; the rest (`--page-all`, `--output`, ...) surface on operations whose spec supports the affordance — check the per-op `--schema` output's `paginable` / `binaryResponse` hints to know which ops carry them.

| Flag | Description | Default |
|------|-------------|---------|
| `--dry-run` | Validate locally without sending the request | |
| `--format <FMT>` | Output format: `json`, `table`, `yaml`, `csv`, `raw`, `jsonl`, `http` | `json` |
| `--base-url <URL>` | Override the API base URL | |
| `--params <JSON>` | URL/query/path parameters as JSON | |
| `--json <JSON>` | Request body for POST/PATCH/PUT | |
| `-o, --output <PATH>` | Write binary responses to a file; use `-` to stream to stdout for piping into other commands (e.g. `ffplay -`, `aplay -`). | |
| `--page-all` | Auto-paginate (NDJSON) | off |
| `--page-limit <N>` | Max pages to fetch | `10` |
| `--page-delay <MS>` | Delay between page fetches | `100` |
| `--no-pager` | Disable pager even on interactive terminals | |
| `--no-retry` | Disable retries | |
| `--no-extract` | Print the full response body | |

## Output Formatting

```bash
# JSON (default)
elevenlabs <resource> <method> --format json

# Table view
elevenlabs <resource> <method> --format table

# Pipe-friendly: jq, grep, etc.
elevenlabs <resource> <method> | jq '.fieldName'
```

## Dry Run

Use `--dry-run` to preview the HTTP request without sending it:

```bash
elevenlabs <resource> <method> --dry-run
```

