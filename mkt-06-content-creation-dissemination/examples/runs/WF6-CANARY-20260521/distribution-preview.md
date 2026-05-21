# Distribution Preview

Date: 2026-05-21

Distribution mode: Local preview only

Reason for workaround: Klaviyo preview/test-send proof is still a known live
service gap for MKT-06. This local packet proves the shape of the handoff but
does not claim live ESP validation.

Preview artifacts:

- `adaptations/email.md`
- `adaptations/linkedin.md`

Pass condition for local canary:

- at least one email adaptation exists
- at least one social adaptation exists
- both link back to the same source draft and content brief

Live-service upgrade required before Active:

- create a Klaviyo preview or internal test send
- capture campaign ID, preview URL, screenshot, or sent-test evidence
- record the result in the evidence log

