# Social Adept Operating Guide (Founder Signal Radar)

## Overview
**Social Adept** is AgentLab's lightweight, zero-bloat social listening and market intelligence scanner. It continuously monitors public community discussions (Reddit, Hacker News, RSS feeds, Google Alerts) to uncover real founder friction, software fatigue, and buying intent.

---

## Strategic Purpose
1. **Founder Verbatim & Pain Mining**: Extracts the exact quotes and vocabulary founders use to describe tool bloat and operational bottlenecks. Feeds into **MKT-01** (ICP definition) and **MKT-03** (Founder diagnostic questionnaires).
2. **Content Engine Fuel**: Turns emerging industry debates into ready-to-refine post angles for the **Agent Lab LinkedIn Content Queue** (`Agent Lab LinkedIn/Content-Queue.md`).
3. **Trigger-Event Detection**: Identifies founders actively asking for agency support, workflow automation alternatives, or tool consolidation for **Bootstrapper Capital Roundtables**.
4. **Zero Recurring SaaS Bloat**: Replaces $300-$1,000/mo enterprise social listening tools with a lean, automated script running directly in the repository.

---

## Configuration & Target Queries
The query watchlist is defined in [`config/social-adept-sources.json`](file:///e:/OneDrive%20-%20Uncle%20Robert%20Consulting%20LLC/Working%20Docs/AI%20Native%20Agency%20Deepened/AgentLab/config/social-adept-sources.json).

### Monitored Sources
- **Reddit**: Targets high-density founder subreddits (`r/SaaS`, `r/Entrepreneur`, `r/agency`, `r/smallbusiness`, `r/startups`).
- **Hacker News**: Live story and discussion comments via Algolia query indexing.
- **RSS Feeds**: Supports Google Alerts (e.g. "AI SDR", "agency automation") and Substack publications.
- **Exclusion Filters**: Automatically filters out spam, hiring posts, and promotional noise.

---

## How to Run

### 1. Dry Run (Preview without saving)
```bash
pnpm social-adept:scan --dry-run
```

### 2. Standard Production Scan
```bash
pnpm social-adept:scan
```

### 3. Custom Output or Config
```bash
pnpm social-adept:scan --config config/custom-queries.json --out-dir output/custom-signals
```

---

## Output Structure
Each run produces timestamped snapshots under `output/social-adept/YYYY-MM-DD/`:
- **`digest-<runId>.md`**: Markdown report categorized into high-value opportunities, founder verbatim quotes, suggested LinkedIn hook ideas, and roundtable prompts.
- **`signals-<runId>.json`**: Structured array of classified signals including raw metadata, URLs, author handles, and sentiment tags.

---

## Classification Taxonomy
- **`founder_pain`**: Frustration with manual workflows, disconnected spreadsheets, or operational overwhelm.
- **`tool_bloat`**: Objections to excessive SaaS subscription bills and tool fragmentation.
- **`buying_intent`**: Founders actively seeking agency partners, consultants, or custom automation systems.
- **`contrarian_debate`**: Controversial discussions on AI utility, replacing SaaS, or agency models.
- **`general_intel`**: Broader industry trends and background context.
