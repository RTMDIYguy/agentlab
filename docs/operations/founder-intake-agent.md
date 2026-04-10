# Founder Intake Agent

## Purpose

This app now includes a first-party Founder Intake Agent intended to help generate leads for:

- URC
- Bootstrapper Capital
- Tactix
- Ownable OS

It is designed to:

- greet site visitors
- ask about their biggest pain point
- qualify them into the right next step
- capture their contact details
- route them toward a Founder Roundtable or Business Systems Diagnostic

## What It Runs

### Frontend

The chat widget is mounted through:

- `client/src/components/LiveChat.tsx`

It appears as a floating chat launcher on the site.

### Backend

The intake logic is exposed through:

- `server/founder-intake/router.ts`

It is registered under:

- `founderIntake.respond`
- `founderIntake.captureLead`

## Lead Flow

The intended flow is:

1. visitor opens chat
2. visitor describes their bottleneck
3. agent asks one useful next question
4. agent recommends a next step
5. visitor shares name and email
6. lead is stored through the contact submission flow
7. lead is followed up into roundtable, diagnostic, workshop, or consulting

## Environment Variables

Required for AI responses:

- `OPENAI_API_KEY`

Optional:

- `OPENAI_FOUNDER_AGENT_MODEL`

Suggested default:

- `gpt-5-mini`

If `OPENAI_API_KEY` is not set, the agent still works in fallback mode using deterministic logic.

## Vercel Setup

Add these environment variables in Vercel:

- `OPENAI_API_KEY`
- `OPENAI_FOUNDER_AGENT_MODEL` if desired

Then redeploy the app.

## Recommended Next Improvements

- connect captured leads into the preferred CRM-lite system
- add explicit booking links for roundtable and diagnostic
- add analytics for open rate, chat starts, and lead capture rate
- tailor responses more tightly to URC, Bootstrapper Capital, and Ownable OS offers
