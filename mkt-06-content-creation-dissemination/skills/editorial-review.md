# Skill — Editorial Review

AI pre-screening checklist plus the 2-cycle revision cap for MKT-06 Step 3.

## When to load

Resolver hint: `When running editorial review` (see `kit.md > resolverHints`).

## AI pre-screening checklist

Run before the human editor opens the doc. Post results as Notion comments on the content page with line-level feedback.

1. **Grammar and mechanics.** Errors per 1,000 words. Flag if > 5.
2. **Brand voice consistency score.** 0–100 against `assets/url-brand-voice-notes.md`. Flag if < 80.
3. **Plagiarism.** Run external check. Flag if > 5% match against any single external source.
4. **Factual claim verification.** Every quantitative claim ("X% of founders", "the top 3", etc.) has a citation or is removed.
5. **CTA alignment.** Every piece has exactly one primary CTA matching the brief's content format.
6. **Internal-link suggestions.** ≥ 3 internal links to existing URC content from the Notion content inventory.

## Human editor pass

Editor opens the Google Doc in Suggesting Mode. Focus areas (in order):

1. Strategic messaging — does the piece advance the URC pillar named in the brief?
2. Accuracy — every numeric or factual claim survives a credibility check.
3. Brand alignment — voice and tone match URC, not generic LLM output.
4. Hook and close — first 100 words earn attention; last 100 words drive the next action.

Editor approves via Jira workflow transition to `Approved`. The transition fires the lock-doc-and-merge-PR automation.

## 2-cycle revision cap

If revisions are needed: Jira → `Revisions Requested` → Teams ping to creator → cycle repeats. **After 2 cycles**, the ticket auto-escalates to the Creative Director. After 3 cycles, the ticket is killed and the topic returns to Step 1 with a "rework" tag.

The cap exists to protect throughput. Every cycle past 2 indicates the brief was wrong, not the draft.

## SLA

Editorial review completes within 24 hours of submission. A 12-hour Teams nudge fires automatically; a 24-hour escalation auto-routes the ticket to the Creative Director.

## Common failure modes

- Reviewer waits "until they have time" — the SLA escalation prevents this.
- AI pre-screening runs after the human editor instead of before — eliminates the value. Pre-screen always runs first.
- Edits made directly in the doc instead of Suggesting Mode — destroys the audit trail.
