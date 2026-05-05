# Skill — Content Strategy

How to apply URC topic-selection heuristics and brief composition for MKT-06 Step 1 (Planning & Ideation).

## When to load

Resolver hint: `When planning a new content piece` (see `kit.md > resolverHints`).

## Topic selection heuristics

Score each candidate topic on five axes and surface the top 3 to the strategist for approval:

1. **Pipeline relevance.** Does HubSpot show recent prospect questions, deal-stalling objections, or content gaps for an active segment?
2. **Search opportunity.** Does GSC show URC ranking page 2 for the primary keyword, or zero coverage for a high-intent secondary keyword?
3. **Competitive whitespace.** Have competitors NOT covered the angle, or are they covering it weakly (thin content, no original data)?
4. **Brand authority fit.** Does the topic reinforce one of URC's three pillars: AI-native operations, founder-led growth, or transferable business systems?
5. **Repurpose potential.** Will the asset reasonably yield ≥ 4 channel adaptations and at least one Klaviyo email?

A topic is approvable when it scores ≥ 3 of 5 axes at "yes."

## Brief composition

Every approved topic becomes a Notion brief with these fields populated before drafting starts:

- Topic title (working)
- Primary keyword + 2–4 secondary keywords (with GSC volume and difficulty)
- Target persona / audience segment (HubSpot list)
- Content format (blog / email / social / video / case study)
- Competitive references (3 URLs that currently rank for the primary keyword)
- SEO difficulty score
- Channel targets (≥ 4 channels for full repurpose path)
- Owner, due dates (draft / review / publish), Jira ticket ID
- Brand voice cues — see `assets/url-brand-voice-notes.md`

A brief is "ready to draft" when every field above is non-empty.

## Common failure modes

- Drafting against an empty `target persona` field: produces generic copy that lands flat in Klaviyo CTRs.
- Skipping `competitive references`: produces undifferentiated content that struggles in organic search.
- Targeting < 4 channels: violates the multi-channel SLA and reduces compounding value of the asset.

## Tool wiring

- The AI Research Agent runs against GA4 + GSC + HubSpot to score topic candidates.
- Approval in Notion fires the Make.com scenario `notion-to-jira` to create the Jira ticket and Google Calendar events.
