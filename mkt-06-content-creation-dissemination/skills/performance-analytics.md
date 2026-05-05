# Skill — Performance Analytics

The 7-Point Scorecard and the Optimize / Retire decision tree for MKT-06 Step 7.

## When to load

Resolver hint: `When optimizing post-publish` (see `kit.md > resolverHints`).

## Trigger architecture

Three independent cycles run continuously:

- **Day-7 pulse.** Catches quick wins and critical problems early. Pulls GA4 + Klaviyo opens/clicks + YouTube first-week retention.
- **Day-30 full review.** The primary optimize-or-retire decision point.
- **Real-time alerts.** Spam > 0.08% (immediate pause), traffic spike > 3x baseline (viral protocol), unsub > 0.3% (list hygiene), HubSpot deal attribution (amplify).

## The 7-Point Scorecard

Apply at Day-7, Day-30, and monthly. Score each metric GREEN / YELLOW / RED. Two or more RED at Day-30 enters the Retire evaluation path.

The full GREEN/YELLOW/RED thresholds for all metrics live in `../assets/seven-point-scorecard.md`.

## Optimize / Retire decision tree

```
DAY 30
  ├── TOP PERFORMER (majority GREEN)
  │     → Repurpose into 3 social formats
  │     → Add to Klaviyo email flow as featured content
  │     → Boost on GoHighLevel
  │
  ├── UNDERPERFORMER (1+ RED)
  │     → Refresh keywords + intro
  │     → Update CTA / subject line A/B test
  │     → Resubmit to Klaviyo flow
  │     → Open Jira ticket: type=Refresh
  │
  └── NO ENGAGEMENT (all RED / zero)
        → Archive content
        → Extract any usable insights
        → Open Jira ticket for replacement content
```

## Common failure modes

- Scoring without all five sources emitting (GA4, Klaviyo, YouTube, HubSpot, GoHighLevel): produces partial-data verdicts that miss the truth. Sub-step 7.1 must verify all sources before scoring.
- Optimizing twice on the same piece without retiring: dead content drains crawl budget. Two refresh cycles maximum, then retire.
- Top-performer amplification without a paid-boost approval gate: blows budget. Manual approval gate stays on paid spend.

## Tool wiring

- Daily 6 AM CDT pull: `src/automation/seven-point-scorer.mjs`
- Day-7 / Day-30 trigger: Notion DB formula on publish date
- Real-time alert routing: Klaviyo automation → Make.com → Microsoft Teams + Outlook
