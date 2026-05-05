# Skill — SEO Optimization

Keyword validation, on-page SEO automation, and schema-markup decisions for MKT-06 Step 4.

## Trigger

Jira ticket → `Approved` fires the AI SEO Agent. Optimization SLA is 4 hours; on-page score target ≥ 85/100.

## Keyword validation

For the brief's primary and secondary keywords:

1. Pull current GSC ranking and search volume.
2. Pull top-10 competing pages from Google for the primary keyword.
3. Identify content gaps versus competitors (subtopics, schemas, formats they cover that the draft does not).
4. Surface gaps as Notion comments on the content page; editor decides whether to expand or accept.

## On-page automation (applied to the Google Doc directly)

- Meta title: includes primary keyword, ≤ 60 chars, click-worthy phrasing.
- Meta description: includes primary keyword + ≥ 1 secondary, ≤ 155 chars.
- Header hierarchy: one H1, sequential H2/H3, no skipped levels.
- Image alt text: every image has descriptive alt; primary keyword in at least one.
- Internal linking: ≥ 3 to existing URC content from the Notion content inventory.

## Schema markup

Generated and stored as a Confluence SOP page tied to the content type:

- Blog → `Article` schema
- Case study → `Article` + `Organization` mention
- Video → `VideoObject`
- Email content republished as web → `WebPage` + `Article` if long-form

## Output

- SEO-optimized version committed to GitHub with a detailed commit message
- Optimization report saved to Notion as a linked DB entry
- Jira ticket → `SEO Complete`

## Common failure modes

- Optimizing for high-volume keywords URC has no domain authority for: produces page-3 rankings forever. Difficulty score must be checked; if difficulty > URC's domain authority threshold, swap to a long-tail variant.
- Schema markup added but not validated with Google's Rich Results Test: produces silent indexing failures.
- Internal links to dead or thin content: dilutes link equity. The Notion content inventory must be filtered to "Top Performer" and "Evergreen" tags only.
