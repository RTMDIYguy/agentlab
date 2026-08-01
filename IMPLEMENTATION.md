# Autonoma SDK Integration — Implementation Checklist

Spec: `C:\Users\RobertM\.autonoma\e-onedrive-uncle-robert-consulting-llc-working-docs-ai-native-agency-deepened-agentlab\integration-prompt.md`

## Setup

- [x] Branch cut: `autonoma-integration` (already checked out from a prior session; continuing on it, not cutting a second branch)
- [x] SDK + adapter installed: `@autonoma-ai/sdk`, `@autonoma-ai/server-express` (npm, added to `package.json`)
- [x] Endpoint implemented: `POST /api/autonoma` (`server/_core/autonomaSdk.ts`), registered before `express.json()` in `server/_core/index.ts`
- [x] HMAC verified against `AUTONOMA_SHARED_SECRET` env (SDK handles it internally via `sharedSecret` config) — confirmed: unsigned POST to `/api/autonoma` returns `INVALID_SIGNATURE`
- [x] Local app running: `http://localhost:3000` (mysql on `127.0.0.1:3307`, db `agentlab`). Required `.env.local` additions beyond what the prior session left: `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` placeholders (server crashed at boot without them — `new Stripe("")` throws; the factories never make real Stripe calls, they call `upsertSubscription`/`createPayment` directly, so placeholders are sufficient). Also: the server only auto-loads `.env` via `dotenv/config`, not `.env.local`, so local validation runs need `DOTENV_CONFIG_PATH=.env.local` set when starting the process.

## Factories (entity audit + scenarios.md — 16 entities)

Roots (real creation function per entity-audit.md — verified each named function actually exists at its stated file):

- [x] users — `upsertUser` (server/db.ts)
- [x] subscriptions — `upsertSubscription` (server/stripe/db.ts)
- [x] payments — `createPayment` (server/stripe/db.ts)
- [x] blogArticles — `createArticle` (server/blog/articles.ts)
- [x] blogComments — `createComment`/`createReply` (server/blog/db.ts)
- [x] contactSubmissions — `createContactSubmission` (server/contact/db.ts)
- [x] newsletterSubscribers — `subscribeToNewsletter` (server/newsletter/db.ts)
- [x] newsletterCampaigns — `createNewsletterCampaign` (server/newsletter/db.ts)
- [x] newsletterTemplates — `createNewsletterTemplate` (server/newsletter/db.ts)
- [x] newsletterEvents — `trackNewsletterEvent` (server/newsletter/db.ts)

Dependents (no reusable creation function anywhere in the app — verified by grepping every db/router file for an insert into these tables; the quote builder on `/pricing` is entirely client-side and never persists, and the status/cart/orders/quotes tables have schema + migrations but no server-side writer yet). Documented fallback per the spec: direct insert via the exact schema table, with scoped delete-by-id teardown:

- [x] statusIncidents — direct insert (`drizzle/schema.ts` `statusIncidents`)
- [x] maintenanceSchedule — direct insert (`maintenanceSchedule`)
- [x] cartItems — direct insert (`cartItems`)
- [x] orders — direct insert (`orders`)
- [x] orderItems — direct insert (`orderItems`)
- [x] quotes — direct insert (`quotes`)

All factories live in `server/_core/autonoma/factories.ts`, all have teardown (delete-by-id), and all support `_alias`/`_ref` via the SDK's recipe resolution.

## Teardown

- [x] Per-record delete-by-id teardown implemented for every factory. This schema has no tenant/org/scope column anywhere (confirmed by reading every table in `drizzle/schema.ts`), so there is no scoping root to cascade-delete from — per-record teardown in reverse dependency order is the correct approach for this app, per the spec's fallback clause.

## Auth callback

- [x] `auth` callback in `server/_core/autonomaSdk.ts` calls `sdk.createSessionToken(openId, { name })` — produces a real signed JWT that the app's own `sdk.verifySession` will accept — and returns it as the real session cookie (`COOKIE_NAME` from `@shared/const`), not a placeholder.

## Maintenance note

- [x] `AGENTS.md` — appended "Autonoma Test Data" section

## Recipe

- [x] `recipe.json` generated at the planner output path from `scenarios.md`, validated entity-by-entity, full-pass, and concurrently; `validation.status` set to `"validated"`
- [x] Uniqueness audit done against `drizzle/schema.ts` unique columns/indexes (every `.unique()` in the file was read; live DB not additionally queried for indexes since the ORM schema is the single source of truth here — confirmed no raw migrations add constraints the schema doesn't declare)

Unique columns found (mysql `.unique()` in schema) and how each will be covered:

| table | unique column | recipe coverage |
|---|---|---|
| users | openId | `{{testRunShortId}}` embedded |
| subscriptions | stripeSubscriptionId | `{{testRunShortId}}` embedded |
| payments | stripePaymentIntentId | `{{testRunShortId}}` embedded |
| blogArticles | slug | `{{testRunShortId}}` embedded |
| newsletterSubscribers | email | `{{testRunId}}` embedded |
| newsletterSubscribers | unsubscribeToken | app-generated random token (`generateToken()`, not recipe-supplied) — collision-safe by construction |
| orders | orderNumber | `{{testRunShortId}}` embedded |
| orders | stripePaymentIntentId | nullable, not set by this recipe — MySQL treats each NULL as distinct in a unique index, so concurrent runs never collide on it |

No other `.unique()` columns exist in `drizzle/schema.ts`.

## Validation — entity by entity

All 16 verified via `sdk up` on a single-entity slice (with its minimal parent chain) → DB query confirms exact rows/values/relations → `sdk down` → DB query confirms rows gone.

- [x] users — 4 rows, roles/emails correct
- [x] subscriptions — 3 rows, correctly `_ref`'d to their parent user
- [x] payments — 5 rows, `amount` transform and unique `stripePaymentIntentId` correct
- [x] blogArticles — 3 rows (published/draft/scheduled). Found and fixed a real interaction: the app's own `startScheduledPublisher` background job auto-publishes any article whose `scheduledFor` has passed — the scenario's original `2025-12-01` date is now in the past (current date 2026-08-01), so the "scheduled" row was being flipped to "published" by real app logic seconds after creation. Not a bug in the factory — it's the real side effect working — but it defeated the scenario's intent, so `recipe.json`'s `a_bootcamp.scheduledFor` was moved to `2027-06-01`. Re-verified: published/draft/scheduled states now hold as intended.
- [x] blogComments — 4 rows including a threaded reply (`parentCommentId` resolved via `_ref` to the parent's real id)
- [x] contactSubmissions — 3 rows, new/read/responded status patches all correct (`respondedAt` set)
- [x] statusIncidents — 3 rows (direct-insert fallback)
- [x] maintenanceSchedule — 2 rows (direct-insert fallback)
- [x] newsletterSubscribers — 4 rows, all 4 statuses correct, real random `verificationToken`/`unsubscribeToken` generated per row
- [x] newsletterTemplates — 1 row, `createdBy` wired to admin user
- [x] newsletterCampaigns — 2 rows (sent/draft), `templateId` wired
- [x] newsletterEvents — 6 rows; confirmed the real side effect too: `trackNewsletterEvent` bumped the parent campaign's open/click/bounce/complaint/unsubscribe counters by 1 each, as expected
- [x] cartItems — 2 rows (direct-insert fallback), wired to user
- [x] orders — 2 rows (completed/failed), unique `orderNumber` tokenized
- [x] orderItems — 3 rows, wired to their parent order via `_ref`
- [x] quotes — 5 rows including the guest quote (`userId: null`, omitted from the record rather than set)

## Full recipe pass

- [x] Full `recipe.json` up → succeeds; `refs` counts match scenario counts exactly for all 16 entities (users:4, subscriptions:3, payments:5, blogArticles:3, blogComments:4, contactSubmissions:3, statusIncidents:3, maintenanceSchedule:2, newsletterSubscribers:4, newsletterTemplates:1, newsletterCampaigns:2, newsletterEvents:6, cartItems:2, orders:2, orderItems:3, quotes:5); cross-checked against the live DB
- [x] Full `recipe.json` down → succeeds, every affected table confirmed at 0 matching rows in the DB afterward
- [x] Wrong signature rejected — confirmed with a bad `x-signature` header, SDK's own HMAC check (not disabled)
- [x] `up` response auth payload contains a real signed JWT session cookie (`app_session_id`), decodable to `{openId, appId, name, exp}` matching the seeded admin user — not a placeholder

## Two concurrent instances

- [x] `up --test-run-id concurrent-a` succeeded (200), then `up --test-run-id concurrent-b` succeeded (200) while A was still live (no teardown of A first)
- [x] DB confirmed both sets of rows coexisted distinctly — 4/4 users, 3/3 subscriptions, 3/3 blogArticles, 2/2 orders, 3/3 contactSubmissions for A vs B, no unique-constraint collisions on any tokenized column
- [x] `down` on A removed only A's rows (0 left for A, B's 4 users / 3 articles / 2 orders untouched)
- [x] `down` on B then removed the rest; DB confirmed 0 rows left from either instance

(Incidentally observed a third, unrelated testRunId's rows appear and clean themselves up mid-test — almost certainly the Autonoma planner's own background health-check hitting the same local endpoint. It did not affect the A/B counts above and is not part of this integration's surface.)

## Ship it

- [x] Branch pushed: `autonoma-integration` (commit `cb39ca0a`)
- [x] Pull request — `gh` is installed but not authenticated in this environment (`gh auth status` → not logged in), so the PR could not be opened programmatically. The push succeeded and printed the compare URL for the developer to open in one click:
      https://github.com/RTMDIYguy/agentlab/pull/new/autonoma-integration

## Done

- [x] Completion marker written
