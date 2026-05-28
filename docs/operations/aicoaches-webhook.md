# AI Coaches Webhook (Owned Capture)

This repo includes an endpoint to receive AI Coaches widget webhook events and log them locally for CRM-lite / follow-up tracking.

## Endpoint

- `POST /api/aicoaches/webhook`

## Optional auth

If `AICOACHES_WEBHOOK_TOKEN` is set, the endpoint requires a matching token:

- header `x-webhook-token: <token>` **or**
- query string `?token=<token>`

If `AICOACHES_WEBHOOK_TOKEN` is not set, the endpoint accepts requests without auth (OK for early internal testing; not recommended for public exposure).

## Output files

Events are written to:

- `output/aicoaches-webhook/events.jsonl` (raw payload + headers; one JSON object per line)
- `output/aicoaches-webhook/leads.csv` (normalized rows: name/email/phone + metadata)

## Notes

- Treat webhook payloads as PII-containing; do not commit `output/` artifacts to git.
- Prefer making `phone` optional on the widget to reduce friction.

