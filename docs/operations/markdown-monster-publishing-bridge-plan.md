# Markdown Monster Publishing Bridge Plan

Date started: 2026-06-04

## Purpose

Markdown Monster may become a lightweight drafting, image-generation, and weblog
publishing workstation for Agent Lab / URC content. Treat it as a publishing
bridge candidate, not as the system of record, until the export, weblog, and
LinkedIn handoff paths are proven.

## Current Discovery

Robert found the Markdown Monster OpenAI configuration panel and weblog add-in
configuration.

Visible OpenAI completion settings:

- Completion provider connection exists.
- Completion model: `gpt-4.1-nano`.
- API endpoint: `https://api.openai.com/v1/`.
- Endpoint template: `{0}/{1}`.
- API key is already set in the application UI.

Visible OpenAI image settings:

- Image provider is not yet configured.
- Required fields appear to be connection name, model ID, API key, API endpoint,
  and endpoint template.

Visible weblog settings:

- `PostsFolder` points to
  `C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Documents\Markdown Monster Weblog Posts`.
- `Weblogs` is currently empty.
- Front matter insertion is currently disabled.
- The add-in supports custom fields including location, post date, GitHub edit
  URL, featured image, and slug update.

## OpenAI Image Provider Candidate

Use a project-scoped OpenAI API key created for this workstation/tool lane. Do
not paste or store the key in repo documentation, chat, screenshots, or source
files.

Candidate settings to test:

- Connection name: `OpenAI Images`
- Model ID: `gpt-image-2`
- API endpoint: `https://api.openai.com/v1/`
- Endpoint template: `{0}/{1}`

Official OpenAI image API reference point:

- Image generations endpoint: `https://api.openai.com/v1/images/generations`
- Current image guide:
  <https://developers.openai.com/api/docs/guides/image-generation>

If Markdown Monster does not yet support `gpt-image-2`, fall back to the newest
GPT Image model it accepts after a one-image sandbox test. Keep image quality on
the cheapest usable setting until the workflow proves useful.

## Publishing Route Options

### Route 1 - Blog First, LinkedIn Draft Second

1. Draft and edit the article in Markdown Monster.
2. Publish to a controlled weblog/CMS that emits RSS.
3. Use the RSS item to create a LinkedIn-ready draft in the Agent Lab content
   queue or a scheduler.
4. Human reviews and posts to LinkedIn.

This is the safest first route because LinkedIn remains a manual review step.

### Route 2 - Blog First, Scheduler Second

1. Markdown Monster publishes to a weblog/CMS.
2. RSS or webhook sends the item to a scheduler such as Buffer, Make, Zapier, or
   n8n.
3. Scheduler creates a queued LinkedIn post.
4. Human approves before publish.

This is acceptable after Route 1 proves the fields and formatting.

### Route 3 - Direct LinkedIn Posting

Direct LinkedIn publishing should be treated as a later integration, not the
first test. LinkedIn API posting requires app credentials, permissions, and
policy alignment. Do not promise direct auto-posting until the credential and
approval path is confirmed.

## Recommended V1

Use Markdown Monster as:

- local Markdown drafting workstation
- image helper after OpenAI image provider setup
- optional weblog publisher to a controlled blog
- RSS/source feed for LinkedIn-ready drafts

Do not use it as:

- the only content archive
- a direct LinkedIn auto-poster
- a place to store reusable secret values outside its own app settings
- a replacement for the Agent Lab LinkedIn content queue

## Sandbox Test

1. Configure the image provider with a project-scoped key.
2. Generate one low-cost test image and save it outside the repo.
3. Create one test Markdown post in the configured posts folder.
4. Add front matter manually for title, publish status, source, intended channel,
   and review status.
5. Configure one sandbox weblog target.
6. Publish a test post to the sandbox target.
7. Confirm images, links, title, slug, and metadata survive the publish.
8. Confirm RSS or export can produce a LinkedIn-ready record.
9. Only after the sandbox passes, decide whether to connect a scheduler.

## Source Of Truth Rule

Agent Lab LinkedIn content remains controlled by:

- `C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\Agent Lab LinkedIn\Content-Queue.md`
- repo operating docs and change-control records

Markdown Monster can feed that queue, but it should not silently bypass it.
