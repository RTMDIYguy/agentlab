# MKT-06 — Content Creation & Dissemination (kit.md bundle)

This directory is the kit/1.0-conformant package for URC Marketing Workflow 6. It is the proof-of-concept conversion that the rest of the Marketing and Sales workflows should follow.

## What's in here

```
kit.md                                   # The unified kit/1.0 manifest + workflow guide
README.md                                # This file
examples/
  canary-test-asset.md                   # Worked 10-step canary verification example
skills/
  content-strategy.md                    # Topic selection + brief composition heuristics
  editorial-review.md                    # AI pre-screening checklist + 2-cycle revision cap
  seo-optimization.md                    # Keyword validation + on-page SEO automation
  multi-channel-adaptation.md            # Per-channel adaptation rules
  performance-analytics.md               # 7-Point Scorecard + Optimize/Retire decision tree
assets/
  seven-point-scorecard.md               # GREEN/YELLOW/RED thresholds for all metrics
  notion-content-calendar-schema.md      # Required Notion DB fields and formulas
  url-brand-voice-notes.md               # URC brand voice and tone notes
src/
  canary/run-canary.mjs                  # Verification driver
  automation/notion-to-jira.mjs          # Topic approval → Jira+GCal
  automation/jira-status-router.mjs      # Jira status → Teams/GitHub/Klaviyo
  automation/seven-point-scorer.mjs      # Day-7 / Day-30 scoring
  agents/drafting-agent.md               # Prompt + harness contract
```

## Conformance status

This bundle targets **Standard** conformance per `Journey_kit.md` v1.0:

- [x] YAML frontmatter with `schema: kit/1.0`
- [x] Required fields: `slug`, `title`, `summary`, `version`, `model` (with `hosting`)
- [x] `tags` non-empty
- [x] At least one tool or skill in frontmatter
- [x] At least one input, output, and failure in frontmatter
- [x] All 6 required body sections (Goal, When to Use, Setup, Steps, Constraints, Safety Notes)
- [x] Recommended sections present (Inputs, Outputs, Failures Overcome, Validation)
- [x] Setup uses recommended h3 subsections (Models, Services, Parameters, Environment)
- [x] Summary and description differ
- [x] No placeholder text in body

**Full** conformance items still to complete before the registry will accept the bundle as Full:

- [ ] `src/` files are spec stubs — replace with tested source from existing Make.com scenarios, Zapier zaps, and AI-agent prompts
- [ ] `verification` command (`node src/canary/run-canary.mjs`) needs the real implementation; current stub documents the contract only
- [ ] Atlassian domain typo (`atlasian.net` → `atlassian.net`) must be fixed before the Jira prerequisite check passes
- [ ] Klaviyo prerequisite check requires the named lists/templates to be provisioned

## How to use

1. Validate the manifest against the kit/1.0 schema: `npx @agent-kit/schema validate kit.md`
2. Run the canary: `node src/canary/run-canary.mjs --label internal-verification --date $(date +%F)`
3. Capture the 10-checkpoint evidence chain to `MKT-06-Canary-Evidence-Log.csv`
4. Pass / Pass-with-Workarounds → promote MKT-06 to Active in `../../Master Workflow Index.md`

## Pattern for replication

When converting the next workflow (suggested order: MKT-01 Lead Gen, MKT-02 Email/SMS Nurture, MKT-05 Outreach, then SAL-05/06, then the remaining Templates):

1. Copy this directory and rename to `<workflow-id>-<slug>/`
2. Update `slug`, `title`, `summary`, `tags`, `services`, `parameters` for the new workflow
3. Map the existing URC Master Edition .docx into Goal/When-to-Use/Constraints/Safety Notes
4. Map the Implementation Playbook into Setup/Steps/Failures Overcome
5. Map the Step 7 Performance Tracking content (or its analog) into Validation + outputs frontmatter
6. Wire `src/` to the actual automation scenarios that already exist in Make / Zapier / GoHighLevel
7. Run a canary, then promote to Active
