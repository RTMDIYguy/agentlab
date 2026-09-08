---
document_id: DOC-PLAYBOOK-LAYER
title: "AgentLab Playbook Layer"
document_type: operating_playbook_model
authority_level: operational
status: active
owner: "Robert T. McCarthy / OPS"
canonical_sources:
  - docs/operations/workflow-relationship-map.md
  - docs/operations/weekly-workflow-audit-bank.md
---

# AgentLab Playbook Layer

## Purpose

The workflow registry describes individual department procedures. The
playbook layer describes how those procedures cooperate across department
boundaries.

A playbook is a governed journey with:

- a trigger and completion definition
- required inputs and expected outputs
- primary and approval owners
- explicit handoff contracts
- fallback and stop protocols
- evidence requirements

The layer preserves the existing workflow IDs. It does not replace the
workflow registry, department packages, or client-facing workflow kits.

## Initial journeys

The first implementation seeds five high-value journeys:

1. `revenue-lead-to-sale`
2. `sale-to-delivery`
3. `delivery-to-retention`
4. `finance-control-loop`
5. `proof-and-referral-loop`

These cover the revenue spine, finance controls, client continuity, and the
feedback loop into marketing. Department-only playbooks can be added later
without changing the handoff model.

## Runtime model

`playbooks` stores the governed journey contract. `playbook_handoffs` stores
the ordered transitions between stable workflow codes such as `MKT-01`,
`SAL-01`, and `FUL-02`.

The API exposes:

- `GET /api/playbooks`
- `GET /api/playbooks/:id`

Seed or refresh the canonical layer with:

```bash
pnpm db:push
pnpm seed:playbooks
```

The fallback protocol is mandatory. A playbook must remain operable when an
integration, paid tool, or automation endpoint is unavailable; the receiving
owner must still be able to accept the handoff manually and preserve evidence.
