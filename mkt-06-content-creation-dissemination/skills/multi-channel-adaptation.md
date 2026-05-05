# Skill — Multi-Channel Adaptation

Per-channel adaptation rules for MKT-06 Step 5.

## Trigger

Jira → `SEO Complete` fires the AI Adaptation Agent. SLA is 8 hours; minimum 4 channel variants per asset.

## Channel rules

| Channel | Format | Length | Image / Asset Spec | Notes |
|---------|--------|--------|--------------------|-------|
| Blog (CMS) | HTML | as-drafted | Hero image 1200×630, alt text required | Klaviyo email links here as canonical |
| Email (Klaviyo) | HTML template | 200–400 words preview, full content as web link | 600px max width, alt text required | A/B subject line; goes to List `SrkWfC` |
| LinkedIn | Post | 1200–1500 chars | 1200×627 image | Hashtags: 3–5 from URC standard set |
| Twitter/X | Thread | 5–9 tweets, hook in tweet 1 | One image in tweet 1 or 2 | Quote-tweet from `@unclerobertcons` after 24h |
| Instagram | Carousel | 5–10 slides | 1080×1350 portrait | First slide = hook, last slide = CTA |
| Facebook | Post + link | 100–250 chars | Reuse LinkedIn image | Lower priority; do not over-invest |
| YouTube (when applicable) | Video script | per content brief duration | Thumbnail concept + caption file | Watch time ≥ 50% retention is the bar |
| Podcast (when applicable) | Outline + show notes | per episode | — | Show notes link back to canonical blog |

## Storage paths

- Google Drive: `/Content-Assets/{YYYY-MM}/{channel}/`
- OneDrive: `/Shared-Content/`
- Dropbox: `/Client-Deliverables/` (only when client-shared)
- GitHub: `RTMDIYguy/urc-content-assets/adaptations/{ticket-id}/`

All variants link back to the master Notion content page; Jira moves to `Adaptation Complete`.

## Common failure modes

- Email variant authored without sending to Klaviyo Preview List `XbByas` first: produces broken templates that ship to subscribers. Preview send is non-negotiable.
- Social variants reuse identical copy across platforms: triggers low engagement on every platform. Each variant must be platform-native.
- Video adaptations skipping the thumbnail concept: kills CTR. Every video has a thumbnail concept attached before publish.
