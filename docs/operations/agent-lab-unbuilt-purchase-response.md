# Agent Lab Unbuilt Purchase Response

Date created: 2026-05-16

## Purpose

Agent Lab now has a live client-facing site and sales platform. Some offers may
be purchased before the exact buyer-specific workflow has been fully built.

This is acceptable if the response is immediate, honest, and useful: the buyer
gets a clear next step, and Agent Lab gets the information needed to build the
workflow correctly.

## Operating Rule

If a visitor purchases an item that is not fully built yet:

1. Acknowledge the purchase quickly.
2. Thank them and confirm the selected offer.
3. Send an intake tool before promising delivery details.
4. Explain that the intake is how Agent Lab scopes and prepares the workflow.
5. Route the response into the relevant department workflow:
   - Sales
   - Marketing
   - Finance
   - Operations
   - Fulfillment
   - AfterCare
   - Culture
6. Use the intake to define what gets built, what can be reused, and what needs
   human review.

Do not imply that an unbuilt workflow is already finished. Do not apologize in a
way that weakens trust. Frame the intake as the first step of the build process.

## Intake Tool

Default intake source:

`workflows/marketing-founder-signal-system/assets/intake-questions.md`

Use this as the starting point for founder/workflow discovery. Adapt questions
only as needed for the purchased offer and department area.

For non-marketing workflows, keep the same structure:

- buyer context
- painful workflow
- current tools
- current manual steps
- desired outcome
- existing assets and access
- urgency and constraints
- approval and contact preferences

## Buyer Reply Template

Subject: Next step for your Agent Lab workflow

Hi [Name],

Thank you for purchasing [Offer Name]. I received it and I am glad you are here.

The next step is a short intake so we can build the workflow around your actual
tools, friction points, and operating goals instead of handing you a generic
template.

Please complete this intake:

[Insert intake form or document link]

Once I have your answers, I will review the workflow area, confirm the best
starting point, and send the next build step.

Agent Lab is built around a simple rule: simplify the work first, automate what
is repeatable, and keep humans in the judgment loop.

Robert

## Internal Handling

After the intake is returned:

1. Create or update the lead/customer record in the CRM-lite tracker.
2. Mark source as `Agent Lab website purchase`.
3. Record purchased offer, payment status, and follow-up date.
4. Assign the likely department workflow.
5. Create a delivery note with:
   - buyer problem
   - current tools
   - promised offer
   - required build assets
   - missing access or information
   - next human review point
6. If the workflow is not yet certified, mark it as `custom build / not yet
   certified` until tested.

## Notes

This response pattern buys time without hiding the truth. The intake itself
explains why the buyer needs to wait: Agent Lab is gathering the material needed
to build the right workflow.

