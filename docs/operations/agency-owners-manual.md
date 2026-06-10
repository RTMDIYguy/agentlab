# Agency Owner's Manual

**Owner:** Robert T. McCarthy / Uncle Robert Consulting LLC
**Date Created:** 2026-06-09
**Last Structural Update:** 2026-06-10
**Version:** v0.2 — expanded to full 12-section blueprint
**Purpose:** Operational reference for running the URC family of businesses. Covers business orientation, workflows, tools, SOPs, finance controls, secret handling, products, infrastructure, and change control in one navigable document.

> **SECURITY CONSTRAINT (permanent):** This document must never contain secret values,
> credential strings, backup codes, OAuth tokens, service-account JSON, client PII, or
> unredacted finance records. Link only to approved metadata, vault instructions, or
> sanitized evidence. See [Section 8](#8-secret-and-credential-handling) for the full rule.

---

## How To Use This Document

This is the owner's manual — not the architecture deck, not the SOP library, not the
strategy doc. Read it when you want to know where the controls are, why a decision was
made, or how to orient a new agent or operator.

- **New to the business?** Start at [Section 1](#1-start-here), then read [Section 2](#2-business-map).
- **Running a workflow?** Go to [Section 4](#4-workflow-map), then [Section 5](#5-sop-library).
- **Handling money or accounts?** [Section 7](#7-finance-control-layer).
- **Handling a credential or secret?** [Section 8](#8-secret-and-credential-handling) — mandatory before acting.
- **Something changed?** Log it in [Section 11](#11-evidence-audits-and-change-control).
- **Showing something publicly?** Check [Section 12](#12-public-tour-guide-layer) first.

---

## 1. Start Here

**Description:** Orientation layer. Answers "where is everything?" for a new human, agent,
or returning collaborator. Keeps the most important operating rules visible without
requiring a deep dive.

**Source of truth:** `docs/operations/agency-operating-manual.md`

**Supporting docs:**
- `docs/operations/urc-agent-execution-checklist.md` — rules every agent must follow before acting
- `docs/operations/urc-v1-operating-architecture.md` — business structure and platform decisions
- `docs/operations/urc-90-day-implementation-plan.md` — current execution horizon

**Owner:** Robert T. McCarthy / OPS
**Last reviewed:** 2026-06-10
**Status:** Active
**Classification:** Public-facing (no sensitive content in this section)

### Operating Principle

The agency should be built so a capable operator can get in and drive it. That means one
obvious starting point, named business lanes, visible source-of-truth locations, clear
workflow ownership, a small number of live offers, documented manual fallbacks, and SOPs
written from real work, not theory.

### AI Session Lessons

#### The 90% Context Rule

**Date logged:** 2026-06-09

Do not close a Claude session at 90% of context capacity assuming you can pick back up
cleanly. Claude sessions are stateless across context boundaries. The next session opens
cold with no memory of what was done unless you explicitly pass a handoff prompt.

**What to do instead:**
1. Before the session runs out, write a handoff prompt describing what was accomplished,
   what is in progress, which files were created or changed, and what the next action is.
2. Save that handoff prompt somewhere retrievable (notes file, draft message, anywhere).
3. Use the remaining session to reach a clean stopping point.
4. Open the next session with the handoff prompt as the first message.

**The rule:** Use the whole session. Just make sure the handoff prompt is written before it
runs out — not after.

---

## 2. Business Map

**Description:** Defines the legal and operational entities, their roles, how they relate
to each other, and what each one owns. The source of truth for "which entity does what."

**Source of truth:** `docs/operations/urc-v1-operating-architecture.md`

**Owner:** Robert T. McCarthy / OPS
**Last reviewed:** 2026-06-10
**Status:** Active — v0 architecture, decisions still in progress on platform selection
**Classification