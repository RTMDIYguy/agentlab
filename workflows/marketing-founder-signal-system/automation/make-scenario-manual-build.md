# Founder Signal System — Make.com Manual Build

Use this when Make.com shows "Module Not Found" after importing the draft JSON.
That error means the scenario should be rebuilt manually from a blank canvas.

## Recommended Free-Tier Scenario

Keep the first live version to three modules:

1. **Tally — Watch New Responses** or **Webhooks — Custom webhook**
2. **OpenAI — Generate a response** or **OpenAI — Create a Completion**
3. **Gmail / Outlook / Google Sheets — Send summary or add row**

Skip HubSpot and Microsoft 365 Excel for the first working version unless those
connections are already active in the Make account. The goal is to get one
working Magic Template Link before adding optional CRM outputs.

## Module 1 — Intake Trigger

Preferred if Tally is already connected:

- App: `Tally`
- Module: `Watch New Responses`
- Form: Founder Signal intake form

Fallback:

- App: `Webhooks`
- Module: `Custom webhook`
- Webhook name: `Founder Signal Intake`

Full-package expected fields:

- `founder_name`
- `email`
- `company`
- `offer`
- `ideal_customer`
- `painful_problem`
- `desired_outcome`
- `proof_points`
- `exclusions`
- `primary_channel`
- `notification_email`

Current Tally v1 fields:

- Event ID
- Response Submission ID
- Respondent ID
- Form ID
- Form Name
- Created At
- First name
- Last name
- Work email
- Company name
- Current monthly revenue
- #1 goal for the next 90 days

Use the current Tally v1 fields for the first working scenario. The missing
fields can be inferred lightly by the OpenAI module and then confirmed by a
human before outreach.

## Module 2 — OpenAI Setup Packet

- App: `OpenAI`
- Module: Prefer `Generate a response`
- Alternate module name: `Create a Completion`
- Model: `gpt-4o-mini`, or the lowest-cost reliable chat model available

Make.com's OpenAI module names vary by workspace and connector version. If
`Generate a response` exists, use it. If it does not, use `Create a Completion`.
Do not look for `Create a Chat Completion`; many current Make workspaces do not
show that exact label.

Instructions / system message:

```text
You are the Founder Signal System setup assistant for Uncle Robert Consulting. Create practical, buyer-ready setup outputs from the founder intake. Keep the founder's voice human. Do not invent proof. Do not recommend paid ads, large-list automation, or a website rebuild.
```

Prompt / user message:

```text
Create a Founder Signal setup packet from this intake. Return sections titled Signal Brief, Content Cycle Prompt, Outreach Angle, Three-Touch Follow-Up Draft, Proof Loop Fields, and Next Cycle Question.

Founder: {{First name}} {{Last name}}
Email: {{Work email}}
Company: {{Company name}}
Current monthly revenue: {{Current monthly revenue}}
Primary 90-day goal: {{#1 goal for the next 90 days}}
Form: {{Form name}}
Submitted at: {{Created at}}

Because this intake does not include offer, ideal customer, proof points, exclusions, or primary channel, infer only a tentative draft from the company name, revenue range, and 90-day goal. Clearly label any inferred section as "Needs founder confirmation." Default the primary channel to LinkedIn unless the goal implies otherwise.
```

Map each `{{field}}` from Module 1. If the module has a single prompt field
instead of separate system/user messages, paste the system message first, then
paste the user message below it in the same field.

## Module 3 — Output

Choose one output for the first version.

### Option A — Email Summary

- App: `Gmail` or `Microsoft 365 Email`
- Module: `Send an email`
- To: `notification_email`, falling back to `email`
- Subject: `Founder Signal setup packet for {{company}}`
- Body: OpenAI response text from Module 2

### Option B — Google Sheets Tracker

- App: `Google Sheets`
- Module: `Add a Row`
- Sheet: `Founder Signal Tracker`
- Columns:
  - Date
  - Founder
  - Company
  - Email
  - Primary Channel
  - Status
  - Setup Packet
  - Next Action

## Enablement Checklist

- [ ] Delete the failed imported scenario or remove all "Module Not Found" modules.
- [ ] Build the three-module version from a blank scenario.
- [ ] Submit one test Tally response or webhook payload.
- [ ] Confirm the OpenAI output includes all six required sections.
- [ ] Confirm the email or tracker row is created.
- [ ] Save the scenario.
- [ ] Turn the scenario on.
- [ ] Click **Share** and enable the public sharing link.
- [ ] Paste the link into `../template.md`.

## Common Test Errors

### OpenAI 429 — Credits Or Monthly Budget Exhausted

If Make returns:

```text
[429] You have consumed all credits in your OpenAI account, or exceeded your monthly OpenAI budget.
```

the scenario mapping is probably working. The OpenAI account connected to Make
cannot run the request until billing credits or the monthly budget are fixed.

Options:

- Add credits or raise the monthly budget in the OpenAI platform billing
  settings, then rerun the same Make test.
- Temporarily swap the OpenAI module for another connected AI provider already
  available in Make.
- Keep the scenario off and use the manual Markdown fallback until billing is
  restored.

Do not enable the public Magic Template Link until one OpenAI test run succeeds.

## Later Optional Modules

After the link works, add optional HubSpot or Microsoft 365 tracker modules.
Do not add them before the first public link test unless they are already
connected and easy to validate.
