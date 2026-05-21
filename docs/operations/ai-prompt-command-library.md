# AI Prompt And Command Library

## Purpose

This is the working library for useful prompts, commands, snippets, and agent instructions that support URC, Tactix, Bootstrapper Capital, Agent Lab, and the book funnel.

Use this as the searchable source-of-truth index before starting a new prompt library somewhere else.

## Library Rules

- Keep reusable prompts here or link to their source file.
- Prefer tested prompts over clever prompts.
- Include the job, when to use it, input needed, and expected output.
- Keep URC as the main business brand.
- Keep Bootstrapper Capital as the founder audience and event funnel.
- Keep Tactix as the fulfillment and Upwork arm.
- Do not paste private client data into generic prompts.
- When a prompt came from an email, tool, or external library, note the source.

## Quick Index

| Category | Use For | Status |
| --- | --- | --- |
| Model routing | OpenRouter auto model selection and logging | Active |
| Website builder | B12 / Agent Lab website generation and rewrite prompting | Needs original prompt recovered |
| Agent handoff | Starting future agents with the right business context | Active |
| Workflow generation | AI-native agency department workflow templates | Active source exists |
| Marketing prompts | Sales and marketing prompt libraries from Google Drive imports | Source inventory only |
| Book content | Presale videos, shorts, and book CTA content | Source inventory only |

## Command Snippets

### OpenRouter Auto Model Selection

Use when testing a prompt and you want OpenRouter to choose the model, while still logging the actual model used.

```python
response = client.chat.completions.create(
    model="openrouter/auto",
    messages=[
        {"role": "user", "content": "Summarize this document"}
    ],
)

print(response.model)  # shows which model actually served the request
```

Best use:

- quick drafts
- document summaries
- internal triage
- prompt testing
- comparing which models OpenRouter selects for real URC work

Operating rule:

- Log `response.model`, quality notes, rough latency, and cost when a prompt matters.
- If one model consistently performs best for a repeatable workflow, pin that model instead of leaving the workflow on auto.

## Prompt Templates

### B12 Website Build Or Rewrite Prompt

Status: reconstructed placeholder. The exact prompt from the prior session was not found in local search on 2026-05-18.

Use when creating or revising a B12-generated website for Agent Lab, URC, Tactix, or Bootstrapper Capital.

```text
You are helping build a practical business website, not a generic agency brochure.

Business context:
- Main business brand: Uncle Robert Consulting
- Public lab / proof surface: Agent Lab
- Founder audience and event funnel: Bootstrapper Capital
- Fulfillment and Upwork arm: Tactix

Site goal:
Create a clear, founder-facing website that explains what we do, builds trust, and moves visitors toward one next action.

Positioning:
We help founders simplify the tools they already have, turn messy workflows into usable operating systems, and package repeatable processes for growth.

Tone:
Plainspoken, capable, practical, and founder-friendly. Avoid hype, vague AI buzzwords, inflated agency claims, and generic "transform your business" copy.

Primary audience:
Founders, solopreneurs, and small teams who are overwhelmed by tools, scattered processes, inconsistent follow-up, and unclear operational ownership.

Primary CTA:
Book a founder diagnostic or join the next Bootstrapper Capital roundtable.

Required pages or sections:
- Home: clear promise, proof of work, practical offer, CTA
- Services: workflow cleanup, CRM-lite, founder signal system, automation setup, AI-native operating systems
- Agent Lab / Build Log: what is being tested and packaged
- About: URC origin and practical operating philosophy
- Contact / Diagnostic: short form that captures business, current tool stack, operational pain, and next desired outcome

Design guidance:
Make it feel like a working operating-system studio, not a flashy SaaS landing page. Prioritize clarity, trust, simple navigation, and proof that real systems are being built.

Output:
Draft the page structure, section copy, CTA wording, and form fields. Keep copy concise enough to use directly in B12.
```

### Future Agent Handoff Prompt

Use when starting a new agent on the broader operating system.

Source:

`C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\Agent Handoff Prompt.md`

Best use:

- starting a new ChatGPT/Codex/Claude session
- orienting an agent before it touches recovered files
- preventing the agent from redesigning URC from scratch

### AI-Native Agency Workflow Continuation Prompt

Use when continuing the department workflow template project.

Source:

`C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\AI Native Agency Deepened Prompts.txt`

Best use:

- continuing department workflow templates
- preserving the "templates first, URC-specific second" rule
- keeping Word-format workflows more complete than spreadsheet-only drafts

Short reusable version:

```text
Continue the AI-native agency workflow library. Build template workflows first, then URC-specific versions later. Use the established Word-format workflow style because it is more complete and easier to follow than spreadsheet-only drafts. Instructions must be complete and precise enough for a solopreneur or small team of up to five people to implement without prior technical experience.
```

## Source Inventory

These are the strongest local prompt-library candidates found on 2026-05-18.

| Source | Path | Notes |
| --- | --- | --- |
| Sales and marketing prompt library | `C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Prompt Template Library Sales n Marketing.docx` | Likely prior prompt-library attempt or imported asset. |
| User evaluation prompt | `C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\User Evaluation Prompt.docx` | Candidate for evaluation/checking section. |
| AI Native Agency prompts | `C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\AI Native Agency Deepened Prompts.txt` | Active conversational prompt history for workflow buildout. |
| AI Native Agency prompts docx | `C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\AI Native Agency Deepened Prompts.docx` | Word version of the same or related source. |
| Agent start prompt | `C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\To start the agent working prompt.docx` | Candidate startup prompt. |
| Agent handoff prompt | `C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\Agent Handoff Prompt.md` | Active handoff source. |
| Fundable Consulting prompting basics | `C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\Fundable Consulting\Prompting - Basics.docx` | Candidate training reference. |
| Book presale video prompt | `C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\Authority Assets\Book - Bootstrapper's Guide to the World\Marketing\Presale\video prompt.docx` | Book funnel content source. |
| Book shorts prompt | `C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\Authority Assets\Book - Bootstrapper's Guide to the World\Marketing\Presale\Shorts prompt.docx` | Book funnel short-form source. |
| Book shorts ready prompts | `C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\Authority Assets\Book - Bootstrapper's Guide to the World\Marketing\Presale\shorts ready prompts.docx` | Book funnel short-form source. |
| Google Drive import prompt folder | `C:\Users\thebo\OneDrive\Imports\thebossrob@gmail.com - Google Drive\` | Local mirror of many Drive prompt assets. |
| Glide prompts sheet | `C:\Users\thebo\OneDrive\Imports\thebossrob@gmail.com - Google Drive\Glide Projects\Prompts.xlsx` | Spreadsheet prompt collection. |
| HubSpot / Mindstream prompt assets | `C:\Users\thebo\OneDrive\Imports\thebossrob@gmail.com - Google Drive\Uncle Robert Consulting Blog Articles\CCC Assets\HubSpotnMindStream\` | Large marketing/productivity prompt libraries. |
| Prompt Library folder | `C:\Users\thebo\OneDrive\Imports\thebossrob@gmail.com - Google Drive\Uncle Robert Consulting Blog Articles\CCC Assets\CCC Assets\Partners_Mentors_Affiliates\About Perplexity. His thoughts and feelings\Prompt Library\` | Contains personal prompt-library candidates. |

## Intake Queue

Use this queue before adding bulk prompt content.

| Priority | Item | Action |
| --- | --- | --- |
| 1 | Recover exact B12 prompt | Search chat history or paste from prior conversation when available. |
| 2 | Open and extract headings from `AI Prompt Template Library Sales n Marketing.docx` | Decide whether it is useful, duplicate, or archive-only. |
| 3 | Extract book presale prompts | Add reusable video, shorts, and CTA prompts to this library. |
| 4 | Review Google Drive import prompt folders | Keep only prompts that support URC execution, lead generation, workflow packaging, or book funnel work. |
| 5 | Create a client-safe edition | Convert the best prompts into a shareable Word/PDF library only after internal sources are cleaned. |

## Maintenance Notes

- Add new prompts as sections, not scattered files.
- When a prompt becomes part of a workflow package, link the workflow package path here.
- If a prompt affects a sellable workflow package, record the change in `docs/operations/change-control-register.md`.
- Run `pnpm change-control:check` after workflow-package changes.
