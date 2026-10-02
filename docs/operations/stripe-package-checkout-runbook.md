# Stripe Package Checkout Runbook

Status: active (CC-2026-10-02-003)
Purpose: prove the marketplace package money loop end to end — without pre-cataloging every product at Stripe.

## Zero-catalog design (why you do not need to finish the Stripe catalog)

You do **not** need to create products/prices at Stripe by hand for marketplace packages:

1. On the **first checkout** of a package, the server resolves a price in this order:
   - explicit `priceId` in the request body (ops override)
   - `STRIPE_PACKAGE_PRICE_ID_<PKG_SLUG>` env (per package) or `STRIPE_PACKAGE_PRICE_ID` (global) — **use this for the one price you already created**
   - the active price on the package's `knowledge_packages.stripe_product_id`
   - if the product does not exist in the Stripe account, it is created on demand using the seeded catalog id (e.g. `prod_fss_100`), then a monthly price is created from `monthly_price`
2. Every later checkout reuses that active price.

So the catalog builds itself from real purchases. HubSpot's product catalog is not involved in this loop at all — nothing here waits on it.

Where secrets go: **Infisical only** (`infisical secrets set STRIPE_SECRET_KEY=... --env dev`), never a hand-edited `.env.local`. `pnpm dev` already wraps `infisical run`.

## One-time local verification (test mode)

1. `stripe login` (once), then in a second terminal:
   `stripe listen --forward-to localhost:3000/api/stripe/webhook`
   (3000 = the app's default port from `PORT || 3000`; if `PORT` is set
   differently or 3000 is busy and the app picks the next port, forward to
   whatever the `Server running on http://0.0.0.0:<port>/` boot line says.)
   Copy the printed `whsec_...` → `infisical secrets set STRIPE_WEBHOOK_SECRET=whsec_... --env dev`.
2. `infisical secrets set STRIPE_SECRET_KEY=sk_test_... --env dev`, then `pnpm dev`.
3. Open Marketplace (signed in) → an unmounted paid playbook — `sal-playbook` at $149/mo is the clean pick because the default workspace only seeds `mkt`/`ops` — shows **Subscribe · $149.00/mo** → click → Stripe hosted checkout → test card `4242 4242 4242 4242`, any future date, any CVC, any email.

   **Godmode note (owner testing):** your accounts map to the all-zeros
   workspace, which pre-unlocks every package — so no Subscribe button ever
   renders for you. Use the **🧪 Test Buy** ghost button on any priced
   playbook card (godmode only); it drives the exact same `/subscribe` →
   Checkout → webhook path. Alternatives: sign in with a non-god email
   (fresh workspace sees the store like a real buyer) or call the API:
   `curl -s -X POST http://localhost:3000/api/marketplace/packages/sal-playbook/subscribe`
   and open the returned `checkoutUrl`.
4. Expected loop:
   - `stripe listen` terminal shows `checkout.session.completed`
   - app logs `[Webhook] Package <id> unlocked for workspace <ws> ...`
   - Marketplace refreshes (15s poll) → **Active in OS**
5. Optional lifecycle checks: `stripe trigger invoice.payment_failed` and `stripe trigger customer.subscription.deleted` → app logs the `past_due` / `canceled` transition for the matching subscription.

## Event → status map

| Stripe event | Effect on `workspace_packages.status` |
| --- | --- |
| `checkout.session.completed` (paid) | `active` (+ subscription id when mode is subscription) |
| `checkout.session.async_payment_succeeded` | `active` (provisioning happens here for delayed methods) |
| `checkout.session.async_payment_failed` | logged; never unlocked |
| `invoice.payment_succeeded` | `active` (renewal) |
| `invoice.payment_failed` | `past_due` |
| `customer.subscription.deleted` | `canceled` |

Unknown subscription ids are a logged no-op — never a guess.

## Storefront behavior after CC-2026-10-02-003

- Paid + not entitled → **Subscribe** (Stripe Checkout)
- Free, or no `STRIPE_SECRET_KEY` (local dev) → one-click **Mount**
- `POST /marketplace/mount/:id` on a paid package with Stripe configured → **402 `payment_required`** pointing at the subscribe endpoint (admin/godmode comp grants exempt)
- Return from checkout: `/marketplace?checkout=success|canceled&packageId=...` → toast + refresh until the webhook provisions

## Production checklist

- [ ] `STRIPE_SECRET_KEY` (live) + endpoint `https://<host>/api/stripe/webhook` registered in the Stripe dashboard with the five events above (or CLI forward for smoke)
- [ ] `STRIPE_WEBHOOK_SECRET` for that endpoint in Infisical (prod env)
- [ ] First real purchase of one package → confirm product/price auto-created and reused on the second purchase
- [ ] Confirm `past_due`/`canceled` transitions in the Stripe test before relying on them live
