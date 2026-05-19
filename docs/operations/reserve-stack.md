# Reserve Stack

Date created: 2026-05-16
Change control: CC-2026-05-16-006
Author: Claude (Cowork)
Origin: Operator correction during a ClickUp archaeology session — see
"History" below.

## Purpose

The Reserve Stack is the deliberately maintained set of cold-standby
platforms held against the day the active stack collapses.

It is not a fallback we plan to assemble in a crisis. It is a fallback we
already run, on free or near-free tools, that can take over operations if a
profound hammer falls and the active stack has to be abandoned.

The point of writing this down is so the practice is named. Right now the
reserve is being kept warm by habit. Habit dies when the person carrying it
changes machines, loses memory, or hands the system to someone new. The
Reserve Stack should survive those transitions.

## What Qualifies

A platform belongs in the Reserve Stack only if it meets all five tests:

- **Free or near-free.** No paid tier required to run real operations. A
  platform that costs money to keep warm fails this test.
- **Comprehensive.** Can run the business unit it covers without significant
  adjacent dependencies. A point tool that requires four others fails this
  test.
- **Proven.** Already battle-tested by URC. Not theoretical. A platform we
  have not lived in fails this test.
- **Independent.** Not a hostage of another platform. A wrapper around a
  vendor that could pull the plug fails this test.
- **Warm.** Kept current. Visited regularly enough that the next login is
  not a recovery exercise.

If a platform fails any of these, it is not Reserve Stack. It might still
be useful — just not part of this doctrine.

## Current Reserve Stack

### ClickUp

- **Role.** Full operating system for tasks, lists, docs, customer
  onboarding, projects, team coordination. Can host the whole agency in a
  pinch.
- **Why it qualifies.** Free tier covers comprehensive PM / docs / forms /
  boards / calendars; URC has been on it since the founding; the KKBKrazy →
  URC founding story lives in a ClickUp doc; the Teamspace Overview written
  by Sheena in July 2025 sketches the operating posture in long-form.
- **Cold-standby status.** Visited roughly once per month. Archive of
  chapter snapshots. Reserve until pulled forward.
- **Workspace ID.** `90131708337`.

### Notion

- **Role.** Workspace duplication, student business workspace template,
  early-iteration sandbox.
- **Why it qualifies.** Free tier covers personal use comprehensively; the
  "Notion workspace as business command center" pattern is baked into the
  Content Creator Class curriculum; portable workspace duplication is the
  graduation move in that class.
- **Cold-standby status.** Early iteration substrate. Not a current daily
  driver. Proven.

### Beacons.ai

- **Role.** Link site for any personal brand, with built-in analytics and
  a built-in media kit.
- **Why it qualifies.** Best free link-site analytics observed (reliable
  enough numbers for media-kit use); the media-kit feature is included at no
  cost; URC has run `beacons.ai/oldvprof` and tested it as a working asset
  since KKBKrazy chapter 1 (June 2025).
- **Cold-standby status.** Live with usable analytics. The media-kit
  feature is the surprise virtue most founders never find.

## What Is Not Reserve Stack

The following are part of the active stack and explicitly do not belong in
the reserve:

- WordPress + JetPack CRM (active, paid hosting)
- HubSpot CRM (active, paid features used)
- Klaviyo, Mailchimp, ConvertKit (active marketing automation)
- Make.com, n8n, Zapier (active automation tier; paid-plan dependencies
  have already blocked at least one install path this month)
- Stripe, PayPal (payment processors — different category, not
  interchangeable with reserve platforms)
- Microsoft 365 / Google Workspace (operating backbones; treated
  separately under the M365-default rule in `AGENTS.md`)
- Cloudflare DNS (infrastructure; treated separately)

Some of these could survive a hammer fall; some could not. The Reserve
Stack is what we plan to step *down to* if the active stack becomes
unusable, not what we plan to step *across to*.

## Operating Practice

To keep the Reserve Stack warm:

- **Monthly visit at minimum.** Open each reserve platform at least once a
  month. Confirm login works, data is present, nothing is in a
  deactivation cycle.
- **Annual stress test.** Once a year, run one real operational thing
  through a reserve platform end-to-end. Past example: the Content Creator
  Class master template was built and co-edited inside ClickUp by Robert
  and Sheena in October 2025.
- **No silent promotion.** If a reserve platform becomes the active
  platform for any real workload, that is a CC entry. The Reserve Stack
  should not quietly turn into the day-to-day tool without explicit
  decision.
- **No silent removal.** If a platform is dropped from the Reserve Stack,
  that is also a CC entry. Removing a reserve without naming the
  replacement creates a silent vulnerability.
- **No silent addition.** Same rule going the other direction. New
  reserves get a CC entry and a paragraph in this doc.

## Triggers For Pullback

The Reserve Stack activates when any of the following happens:

- A vendor in the active stack turns hostile, raises pricing past
  sustainability, deprecates a critical feature, or freezes the account.
- A domain, hosting, or DNS chain disappears (e.g., a registrar
  non-renews under the wrong conditions).
- A data breach or security event makes the active stack unsafe to
  operate from until cleared.
- A funding event forces a return to zero-paid-tools operating mode.
- A complete machine loss without recovery (the resilience event that
  motivated the GitHub mirror in `CC-2026-05-15-001`).

If a trigger fires, the move is documented in a CC entry naming which
active platform is being abandoned, which reserve platform takes over its
role, and what data needs to be migrated or rebuilt.

## History — Why These Platforms

The Reserve Stack was not chosen. It was lived into.

- **Beacons.ai** has been on the bench since June 2025 when Robert built
  `beacons.ai/oldvprof` as part of the KKBKrazy Entertainment launch for
  his niece Kayla. When Kayla quit the venture, the beacons site stayed.
  The link-site + analytics + media-kit combination has held up across
  more than a year of intermittent use.
- **ClickUp** has been on the bench since the founding of URC in mid-2025.
  The founding story (KKBKrazy → URC), the Plan, the Content Creator Class
  master template, and the Teamspace Overview all live there. The
  workspace is sparsely populated by design — most of the active work
  surface lives in OneDrive and now in the `agent-lab-site` repo — but
  ClickUp can take over the operating role on short notice if needed.
- **Notion** has been on the bench through the Content Creator Class
  iterations. The Class master template explicitly designs the student
  workspace to be duplicated and handed off as a graduation deliverable.
  That pattern presumes Notion will keep working at the free tier, and so
  far it has.

None of these platforms were selected because they were trendy. They were
selected because they kept working without bleeding cash. That criterion
is what the Reserve Stack respects going forward.

## Related Operating Docs

- `AGENTS.md` — operating rules, including the Microsoft 365 default
- `docs/operations/urc-v1-operating-architecture.md` — current operating
  model
- `docs/operations/kit-auth-standard.md` — auth contract any workflow
  installer must honor (a reserve-platform install path should be
  considered when binding a kit to a tool stack)
- `docs/operations/github-packaging-triage-2026-05-15.md` — the
  resilience-packaging push (`CC-2026-05-15-001`) that exposed local-only
  access as a risk and motivated treating the reserve discipline as a
  first-class operating doctrine
- `docs/operations/change-control-register.md` — where Reserve Stack
  changes get logged

## Change Log

| Date | Change ID | Type | Summary | Author |
| --- | --- | --- | --- | --- |
| 2026-05-16 | CC-2026-05-16-006 | initial | Documented the Reserve Stack doctrine: ClickUp, Notion, and Beacons.ai as cold-standby platforms held against active-stack collapse. Authored from a live ClickUp archaeology session and a direct operator correction on tool posture ("held in reserve" vs "demoted"). Names the qualifying criteria, current reserve members, operating practice, triggers for pullback, and history. | Claude |
