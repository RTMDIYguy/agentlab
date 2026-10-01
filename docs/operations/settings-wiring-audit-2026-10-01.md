# Settings Wiring Audit — 2026-10-01

**Document ID:** DOC-OPS-SETTINGS-AUDIT-2026-10-01
**Scope:** every control on the OS Settings surface (`/settings`)
**Method:** each stored field was traced to a runtime consumer (server code that reads it when decisions are made or work is executed). A control is **WIRED** only if changing it changes real behavior. Stored-but-unread is called what it is.
**Companion register entry:** CC-2026-10-01-008
**Trigger:** Robert asked for the same honesty sweep already done for Secrets (CC-2026-10-01-004) and MCP (CC-2026-10-01-005/006/007), extended to every remaining tab.

---

## Verdict at a glance

| Tab | Controls | Verdict |
|---|---|---|
| Secrets | vault rows + upsert/delete | **WIRED** (fixed today, CC-2026-10-01-004/006/007 lineage) |
| Integrations | MCP connect/disconnect/list-tools, connector registry | **WIRED** (today, CC-2026-10-01-007) |
| LLM / Ops Agent | 15 controls | **3 stored-but-unconsumed · 12 fictional decorations** |
| Profile | name, email, company, etc. | **FICTIONAL** — localStorage only |
| Billing | invoice fields | **FICTIONAL** — localStorage only |
| Notifications | 6 toggles | **FICTIONAL** — localStorage only |
| Security | status badges + "Manage Auth" | **FICTIONAL** — hardcoded badges, dead button |

---

## Tab-by-tab findings

### 1. Secrets — WIRED (after today's lineage)

- `getSecrets`/`upsertSecret`/`deleteSecret` drive real vault behavior; the
  multi-tenant guard (2026-09-24) holds; MCP tokens now ride the same pattern
  (`MCP_<NAME>_TOKEN`, CC-2026-10-01-007).
- One follow-up already recorded: **non-operator workspaces cannot complete an
  OAuth connect** (per-workspace token storage is unwired) — refused honestly.

### 2. Integrations — WIRED (today)

- MCP rows: Connect/Disconnect/List Tools now exercise the real runtime
  client; `testIntegration` for MCP runs a live session probe; the
  `mcp_tool_call` connector dispatches through the human gate.
- Honest limitation (documented in-file): the six stdio catalog rows remain
  unreachable by design — the Settings form still *offers* stdio presets
  (PostgreSQL, Filesystem, GitHub, Puppeteer, BigQuery, Brave) that can be
  mounted but never executed. Recommendation below.

### 3. LLM / Ops Agent tab — the biggest honesty debt

Fifteen controls live here. Three persist to the `workspaces` row via
`updateWorkspaceSettings` but **no server code reads them**:

| Control | Column | Saved where | Runtime consumer |
|---|---|---|---|
| Orchestrator Name | `workspaces.orchestrator_name` | DB | **none found** |
| Orchestrator System Prompt | `workspaces.orchestrator_system_prompt` | DB | **none found** — chat uses `buildSystemPrompt(departments, telemetry)` (orchestrator.ts:575) |
| Default Model | `workspaces.default_model` | DB | **none found** (already recorded in CC-2026-09-30-012 follow-ups) |

The other twelve are decoration: saved to `localStorage` under
`agentlab_llm_granular_settings` and never read by anything — persona role,
tone style, active knowledge brain, fallback model, temperature,
max output tokens, top-p, anti-passivity mandate, chain-of-thought toggle,
quality-flywheel toggle, monthly token budget cap, auto-pause threshold.

**The one that actively misleads:** "Monthly Token Budget Cap" +
"Auto-Pause Threshold". The `workspaces` table carries real governance
columns — `hard_monthly_budget` (default 500.00), `auto_pause_threshold_enabled`,
`pii_redaction_enabled`, `saif_enforcement_enabled`, `audit_retention_days` —
and **none of them have any consumer in server or client code** (grep over
`server/` and `client/`, excluding schema/drizzle, returns zero rows). The
Settings slider writes a localStorage number; the real budget column is
never read by the billing engine or the queue processor. Meanwhile SAIF and
PII protection genuinely exist — but as hardcoded pipeline behavior, not as
toggles anyone can turn.

**The one with real leverage:** the Orchestrator System Prompt. The Ops
Agent's conversational persona is currently fixed in code. Wiring this field
into `buildSystemPrompt` would make the OS's central agent personality
operator-controllable — the most valuable wiring candidate on the page.

### 4. Profile tab — fictional

Every field (name, email, company name, etc.) saves to `localStorage` only
(`agentlab_profile_settings`). No server call. Changing your name or email
here changes nothing anywhere. The real identity lives in the `users` table
and the auth session.

### 5. Billing tab — fictional

Invoice fields save to `localStorage` only (`agentlab_billing_settings`).
The integration catalog has a Stripe webhook row with a placeholder endpoint;
no Stripe billing mutation exists behind this tab. The genuine billing
telemetry (real cost accumulation per step, the billing engine) is displayed
elsewhere and is not governed by these fields.

### 6. Notifications tab — fictional

Six toggles saved to `localStorage` only (`agentlab_notification_settings`).
No notification dispatcher reads them. (The real notification surfaces that
exist today — watchdog toasts — are wired in `OpsAgentChat.tsx` and are not
governed by these toggles.)

### 7. Security tab — fictional

Two hardcoded "Active & Enforced" badges with no data behind them, and a
"Manage Auth" button with no `onClick` — it does nothing when clicked. The
genuine security posture (SAIF checks on dispatch, multi-tenant workspace
isolation, signed OAuth state) is real but lives in the pipeline, not on
this page.

---

## What is genuinely wired across the Settings surface

For the record, the honest list: the **vault** (secrets CRUD + env round-trip
+ multi-tenant guard), the **integration catalog + MCP runtime** (today's
work), **workspace settings transport** (getWorkspaceSettings /
updateWorkspaceSettings — the API works; the fields just lack consumers), and
the **documentation/registry surfaces** that read from the DB.

---

## Recommended dispositions (Robert decides)

Robert approved the full order on 2026-10-01; execution recorded as CC-2026-10-01-009.

| # | Item | Recommendation | Status |
|---|---|---|---|
| 1 | Orchestrator System Prompt | **Wire it** into `buildSystemPrompt` — highest-leverage, small change, makes the persona operator-controllable | **DONE** — stored prompt now leads the base identity (+ name clause); built-in default applies when empty; the fake "Engine v2.4" string removed from the base prompt |
| 2 | Default Model | **Wire or remove** | **DONE** — the stored defaultModel LEADS the chat chain when it is a real current id; retired/dormant/unknown ids are skipped with a logged note |
| 3 | Governance columns (budget, auto-pause, PII, SAIF, retention) | **Wire budget + auto-pause first** | **DONE (budget + auto-pause)** — the queue processor evaluates the workspace's hard_monthly_budget against real month-to-date token spend (declared $0.25/M-token estimate) and auto-pauses with an honest audit row when enabled and over; PII/SAIF/retention remain hardcoded pipeline behavior |
| 4 | Profile / Billing / Notifications / Security tabs | **Relabel as demo-only or hide** | **DONE (relabel)** — amber demo-only banners on Profile/Billing/Notifications; Security badges now carry verification tooltips and the dead Manage Auth button became a real Sign Out |
| 5 | stdio MCP presets | **Remove or mark "not runtime-reachable"** | **DONE (mark)** — the preset strip now states stdio servers are not runtime-executable |

### What deliberately remains unwired

- **PII / SAIF / audit-retention toggles**: the protections are real but hardcoded; making them operator-toggleable is a governance decision, not a wiring fix — deliberately not done in this pass.
- **The twelve localStorage LLM decorations** (persona role, tone, knowledge brain, temperature, top-p, etc.): still browser-only. The two that matter (system prompt, model) are now real; the rest stay cosmetic until a consumer justifies them.
- **Profile/Billing/Notifications real wiring**: relabeled only — building real backing (users table updates, Stripe, a notification dispatcher) is future work by design.

---

*Audit method note: "wired" was verified by tracing consumers in server and
client code (grep + read), not by UI appearance. Findings are reproducible:
each claim names its storage location and the absence of its consumer.*
