# Magic Template Link — Founder Signal System

Status: Make scenario deferred; n8n selected as preferred v1 runtime
Tier: Standard
Template type: Make.com public scenario sharing link
Current link: `PENDING_MAKE_PUBLIC_SHARING_LINK`

## Current Publisher Status

Logged: 2026-05-17

- Make.com scenario has been manually rebuilt from the package spec.
- Tally intake trigger fired successfully.
- Gmail output node test fired successfully.
- OpenAI node is reachable and mapped, but full sequence test is blocked by
  OpenAI error `[429] You have consumed all credits in your OpenAI account,
  or exceeded your monthly OpenAI budget.`
- Scenario should remain off until OpenAI credits or monthly budget are
  restored and one full Tally to OpenAI to Gmail test succeeds.
- Public Magic Template Link has not been generated yet.
- 2026-05-17 update: Robert confirmed local n8n is running and has Workflow 06
  available/tested recently. Use n8n as the v1 runtime while Make remains
  blocked by free-plan activation limits and OpenAI credits.

## What This Link Does

The Magic Template Link is the fastest install path for buyers who want the
Founder Signal System preloaded in Make.com.

Once the Make.com scenario is published and this file is updated with the
public sharing link, the buyer can:

1. Open the link.
2. Preview the scenario in Make.com.
3. Click **Use this scenario**.
4. Log in or create a Make.com account.
5. Connect the required apps.
6. Clone the workflow into their own Make.com account.
7. Run a test intake before turning the workflow on.

## Required Connections

The Standard-tier template expects these services:

| Service | Required? | Used For |
| --- | --- | --- |
| Make.com | Yes | Scenario hosting and execution |
| OpenAI | Yes | Drafting the signal brief, content prompts, and follow-up language |
| HubSpot | Optional | Creating or updating the CRM-lite contact record |
| Microsoft 365 Outlook | Optional | Sending the internal setup summary |
| Microsoft 365 Excel or Lists | Optional | Logging proof-loop and follow-up records |

If a buyer does not use HubSpot or Microsoft 365, run the Manual tier instead
and use the Markdown templates in `assets/`.

## Buyer Setup Instructions

Use these instructions after `Current link` above has been replaced with the
real Make.com public sharing link.

1. Click the Magic Template Link.
2. In Make.com, click **Use this scenario**.
3. Connect the required account prompts shown by Make.com.
4. Review each module and confirm the default field mappings.
5. Add the buyer's business name, offer, primary audience, and preferred
   notification email in the scenario setup fields.
6. Run the built-in test with one sample founder intake.
7. Confirm the output creates:
   - one signal brief draft
   - one content cycle prompt
   - one three-touch follow-up draft
   - one proof-loop record or setup email
8. Turn the scenario on only after the test output is reviewed.

## Publisher Setup Instructions

Use `automation/make-public-template-publisher-checklist.md` to publish the
scenario and replace the placeholder link in this file.

If a direct JSON import shows "Module Not Found", discard the failed import and
use `automation/make-scenario-manual-build.md`. The JSON file is a build spec,
not a Make.com-generated export.

For the current v1 runtime path, use
`automation/n8n-v1-runtime-handoff.md`.

## Fallback

If the Make.com link is unavailable, the package still works manually:

- Run `assets/intake-questions.md`.
- Fill `assets/content-brief-template.md`.
- Use `assets/follow-up-sequence-template.md`.
- Log results in `assets/proof-capture-template.md`.

Do not delay buyer delivery just because the public sharing link is not ready.
