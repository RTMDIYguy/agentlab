# Asset — 7-Point Scorecard (GREEN / YELLOW / RED Thresholds)

Used at Day-7, Day-30, and monthly review. Two or more RED at Day-30 enters the Retire evaluation path.

## Email Performance (Klaviyo)

| Metric | GREEN | YELLOW | RED | Klaviyo ID |
|--------|-------|--------|-----|------------|
| Open rate | > 25% | 15–25% | < 15% | SvYcB2 |
| Click rate | > 3% | 1–3% | < 1% | W6PXBY |
| Click-to-open rate | > 10% | 5–10% | < 5% | derived |
| Unsubscribe rate | < 0.1% | 0.1–0.3% | > 0.3% | XTfR8t |
| Spam complaint rate | < 0.02% | 0.02–0.08% | > 0.08% | RSX9Yp |
| Bounce rate (email) | < 1% | 1–3% | > 3% | TFp3uS |
| SMS click rate | > 5% | 2–5% | < 2% | WDdKTd |

## Website & Content (GA4)

| Metric | GREEN | YELLOW | RED | Source |
|--------|-------|--------|-----|--------|
| Page views (30-day) | > 500 | 200–500 | < 200 | GA4 |
| Engagement rate | > 60% | 40–60% | < 40% | GA4 |
| Avg. time on page | > 2 min | 1–2 min | < 1 min | GA4 |
| Bounce rate (web) | < 40% | 40–60% | > 60% | GA4 |
| Organic traffic share | > 40% | 20–40% | < 20% | GA4 + GSC |

## Social (GoHighLevel)

| Metric | GREEN | YELLOW | RED | GHL ID |
|--------|-------|--------|-----|--------|
| Total engagements / post | > 20 | 5–20 | < 5 | RCArdw + Xuj3ha |
| DM conversations initiated / month | > 5 | 1–5 | 0 | RCArdw |
| Comment-to-post ratio | > 3% | 1–3% | < 1% | Xuj3ha |

## SEO (manual + GSC)

| Metric | GREEN | YELLOW | RED | Source |
|--------|-------|--------|-----|--------|
| Target keyword ranking | Top 10 | Position 11–30 | Position 30+ | GSC |
| Indexed pages (new content) | < 7 days | 7–21 days | > 21 days | GSC |
| Featured snippet captures / quarter | > 2 | 1 | 0 | GSC |

## Business Impact (HubSpot)

| Metric | GREEN | YELLOW | RED | Source |
|--------|-------|--------|-----|--------|
| Leads generated / month | > 10 | 5–10 | < 5 | HubSpot |
| Content-attributed deals / quarter | > 2 | 1 | 0 | HubSpot |
| Email signups from content / month | > 50 | 20–50 | < 20 | Klaviyo (SrkWfC list growth) |

## Note on thresholds

These are launch-phase defaults. Review and adjust quarterly based on accumulated baseline data and industry benchmarks. The `parameters` block in `kit.md` carries the live values.

## Note on the URC Master vs. Client Template variants

The Klaviyo metric IDs (SvYcB2, W6PXBY, TFp3uS, RSX9Yp, XTfR8t, WDdKTd) and GoHighLevel aggregate IDs (RCArdw, Xuj3ha) shown above are URC-specific. Replace with the consumer's IDs in the Client Template variant.
