# Make.com Public Template Publisher Checklist

Use this checklist to convert the Founder Signal System Standard-tier draft
into the live Magic Template Link referenced in `../template.md`.

## Source Artifact

- Draft blueprint:
  `automation/Founder-Signal-System-Make-Blueprint.json`
- Buyer-facing link file:
  `template.md`

Important: `Founder-Signal-System-Make-Blueprint.json` is a build spec, not a
Make.com-importable export. Do not import it directly. Hand-authored module
slugs such as `openai:createCompletion` may show as "Module Not Found" in
Make. Build the scenario from a blank canvas using the steps below, then use
Make's own public sharing link as the buyer-facing Magic Template Link.

## Current Test Status

Logged: 2026-05-17

- Scenario manually rebuilt in Make.com after direct JSON import showed
  "Module Not Found."
- Tally trigger test: passed.
- Gmail output node test: passed.
- OpenAI node: reachable and mapped, but blocked by OpenAI account error
  `[429] You have consumed all credits in your OpenAI account, or exceeded
  your monthly OpenAI budget.`
- Scenario status: built, not enabled.
- Next action: restore OpenAI credits or raise monthly budget, rerun one full
  sequence test, then turn on the scenario and generate the public sharing
  link.

## Publish Steps

1. In Make.com, create a new scenario named:
   `Founder Signal System — Intake to Signal Brief`.
2. Rebuild the modules from
   `Founder-Signal-System-Make-Blueprint.json`. Do not import the JSON.
3. Confirm the trigger is a custom webhook or intake source the buyer can
   connect easily.
4. Add setup notes to every module so a buyer understands what to connect,
   what to customize, and which optional modules can be deleted.
5. Validate the OpenAI module with a test intake that contains no sensitive
   client data.
6. Validate optional HubSpot behavior:
   - creates or updates one contact
   - marks `founder_signal_status`
   - does not overwrite existing deal or customer records
7. Validate optional Microsoft 365 behavior:
   - sends the setup summary to the notification address
   - writes one row to the tracker if the buyer has configured it
8. Disable or clearly label optional modules before publishing if they require
   accounts not included in the Standard package.
9. Save the scenario.
10. Use Make.com's scenario sharing flow:
    - click **Share** in the scenario builder
    - enable **Public sharing link**
    - copy the generated link
11. Paste the link into `../template.md`, replacing
    `PENDING_MAKE_PUBLIC_SHARING_LINK`.
12. Run one install test from the link in a separate Make.com account or team.
13. Record the final test result in change control before calling the package
    ready for Standard-tier sale.

## Test Intake

Use this non-sensitive test data:

| Field | Value |
| --- | --- |
| founder_name | Jordan Lee |
| email | jordan@example.com |
| company | Bright Harbor Ops |
| offer | Operations cleanup sprint for small service businesses |
| ideal_customer | Founder-led service business with 3-15 employees |
| painful_problem | Work is spread across inboxes, spreadsheets, and memory |
| desired_outcome | One weekly operating rhythm and one clean lead follow-up tracker |
| proof_points | Reduced missed follow-ups; created one shared owner dashboard |
| exclusions | Not for venture-backed teams replacing their full CRM |
| primary_channel | LinkedIn |
| notification_email | jordan@example.com |

## Acceptance Criteria

- The public link opens a Make.com preview page.
- **Use this scenario** copies the scenario into another Make.com account.
- The scenario prompts for required app connections.
- A test run creates a useful setup packet without exposing secrets.
- Optional HubSpot and Microsoft 365 modules can be configured or removed
  without breaking the core intake-to-brief path.
- `template.md` contains the real link and no placeholder text.

## Do Not Claim

Do not claim the Magic Template Link is live, certified, or fully wired until
the link has been generated in Make.com and tested from a second account.
