# Claude Handoff: Founder Signal System

Date: 2026-05-15
Owner: URC / Codex
Priority: Revenue sprint / market-facing package

## Why This Exists

MKT-06 is the clearest market pain point: founders struggle to know what to
say, where to say it, how often, and how to tell whether it is working.

But MKT-06 does not fully fire by itself. It depends on a thin marketing loop:

```text
MKT-01 -> MKT-03 -> MKT-06 -> MKT-05 -> MKT-02 -> MKT-04
```

Do not build the full Marketing department. Build the smallest sellable
vertical slice that can move a founder from unclear audience/message to
publishing, outreach, follow-up, and proof capture.

## Package To Build

Create:

```text
workflows/marketing-founder-signal-system/
  README.md
  kit.md
  source-map.md
  implementation-checklist.md
  offer-one-pager.md
  assets/
    intake-questions.md
    content-brief-template.md
    follow-up-sequence-template.md
    proof-capture-template.md
```

## Positioning

Working name:

**Founder Signal System**

Plain-English promise:

Help a founder define the right audience, sharpen the message, turn one idea
into focused content/outreach, follow up with interested people, and capture
proof of what resonates.

This is a starter system, not a full marketing department rebuild.

## Source Workflows

Use the imported workflow sources:

- `workflows/mkt-01-lead-generation-conversion/`
- `workflows/mkt-03-polls-assessments/`
- `workflows/mkt-06-content-creation-dissemination/`
- `workflows/mkt-05-outreach-engagement/`
- `workflows/mkt-02-email-sms-nurture/`
- `workflows/mkt-04-reviews-referrals/`

## Thin-Slice Flow

1. **ICP and fit focus** from MKT-01
   - Define target customer.
   - Define pain, desired outcome, urgency, and exclusion criteria.
   - Define what counts as a qualified conversation.

2. **Diagnostic/segmentation** from MKT-03
   - Ask enough questions to classify pain/readiness.
   - Use a short intake form or founder interview, not a heavy survey.

3. **Content engine** from MKT-06
   - Turn ICP + pain + point of view into a content brief.
   - Create 3-5 LinkedIn posts, 1 short email, and 1 longer anchor asset outline.

4. **Outreach lane** from MKT-05
   - Build a small prospect/reconnect list.
   - Write human outreach messages tied to the same signal.

5. **Follow-up lane** from MKT-02
   - Create a simple 3-touch follow-up sequence.
   - Segment responses by interested, not now, referral, or no response.

6. **Proof loop** from MKT-04
   - Capture replies, objections, testimonials, referrals, and content signals.
   - Feed learnings back into the next content/outreach cycle.

## Deliverables

### README.md

Should explain:

- what the package is
- who it is for
- the thin-slice flow
- what is intentionally excluded
- how it relates to the larger Marketing department workflow set

### kit.md

Draft a `kit/1.0` package manifest.

Keep it as a draft unless full certification evidence exists. Do not claim this
is active/certified.

### source-map.md

Map every package step back to the source workflow folders and specific files.

### implementation-checklist.md

Create a 3-5 day setup sprint:

- Day 1: ICP and offer focus
- Day 2: diagnostic/intake and message map
- Day 3: content brief and first asset batch
- Day 4: outreach/follow-up setup
- Day 5: proof loop and next-cycle review

### offer-one-pager.md

Make this sales-facing and usable now. Include:

- problem
- promise
- who it is for
- what is included
- what is not included
- setup timeline
- suggested starter price range
- CTA for a founder diagnostic

### assets/intake-questions.md

Questions should reveal:

- ICP
- painful problem
- current offer
- current content/outreach pattern
- proof or testimonials
- tools already in use
- audience/source of potential leads

### assets/content-brief-template.md

Must include:

- target persona
- pain point
- desired outcome
- offer/CTA
- channel targets
- founder point of view
- proof/example

### assets/follow-up-sequence-template.md

Simple 3-touch sequence:

- helpful follow-up
- specific problem/insight
- close-the-loop note

### assets/proof-capture-template.md

Capture:

- replies
- objections
- referrals
- testimonials
- content topics with traction
- next experiment

## Guardrails

- Preserve URC/internal vs client-facing variants.
- Do not import credentials, Keys folders, archive dumps, or temp folders.
- Do not redesign the whole business.
- Do not implement all 9 Marketing workflows.
- Use MKT-06 as the visible wedge, but include only the minimum viable
  dependencies from MKT-01, MKT-03, MKT-05, MKT-02, and MKT-04.
- Keep the package low-cost and tool-light; assume founders use messy existing
  tools.
- Keep Microsoft 365 as the default operating backbone where a default is
  needed.

## Verification

Run:

```powershell
pnpm change-control:check
git diff --check
```

Update:

- `docs/operations/change-control-register.md`
- `docs/operations/scheduled-change-queue.md`

Use a new change ID after `CC-2026-05-15-002`.
