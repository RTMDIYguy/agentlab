# Browserbase / Stagehand Public Scan Harness

This repo includes a small harness for rendering JS-heavy public pages (HTML + screenshot) so public-signal scans can diff meaningful changes over time.

## Scope and safety

- Intended for **public, unauthenticated** pages.
- Do **not** use this harness for accounts/logins or sensitive internal content unless you have explicitly accepted Browserbase retention/logging characteristics.

## Setup

Set environment variables (prefer local `.env.local` that is gitignored or your runner’s secret store):

- `BROWSERBASE_API_KEY` (required)
- `BROWSERBASE_PROJECT_ID` (optional; if your Browserbase setup uses project scoping)
- `BROWSERBASE_MODEL` (optional; default: `google/gemini-3-flash-preview`)

## Run

Render one or more URLs:

```bash
pnpm public-scan:browserbase -- https://iltem.org https://bootstrapper.ai https://bootstrappercapital.com
```

Or render from a file (one URL per line; `#` comments allowed):

```bash
pnpm public-scan:browserbase -- --urls-file docs/operations/public-signal-scan-urls.txt --tag ltem-ecosystem
```

Outputs are written under:

- `output/public-signal-snapshots/YYYY-MM-DD/<tag>/<slug>/`
  - `page.html`
  - `screenshot.png` (unless `--no-screenshot`)
  - `meta.json` (status/title/hash)

## Recommended URL list (starter)

Create a local URL file (do not put secrets in it). Example:

- `https://iltem.org/`
- `https://bootstrapper.ai/`
- `https://bootstrapper.ai/pricing`
- `https://bootstrappercapital.com/`

