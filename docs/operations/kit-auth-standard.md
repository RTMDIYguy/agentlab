# Kit Auth Standard v1.0

Date started: 2026-05-07

## Purpose

This standard lets a single `Kit.md` support one-click installation and
agentic installation across many connector auth patterns without forcing every
service into the same auth method.

The rule is simple: every connector can authenticate differently, but every
connector must declare the same auth contract.

## Policy

```yaml
authStandard: kit-auth/1.0
authPolicy:
  noPlaintextSecrets: true
  preferOAuth: true
  requireValidationTest: true
  requireLeastPrivilegeScopes: true
  requireRevocationPath: true
  requireFallbackPath: true
```

## Auth Method Taxonomy

| Method | Use For | Notes |
| --- | --- | --- |
| `oauth2-delegated` | User-granted access | Preferred for buyer-owned SaaS accounts |
| `oauth2-admin` | Admin-consent apps | Use when tenant-wide scopes are required |
| `connection-prompt` | Make, n8n, Zapier, or similar built-in connector prompts | Preferred for standard self-serve installs |
| `api-key-vault` | Services that require API keys | Store only in the automation platform credential store or approved vault |
| `pat-vault` | GitHub or similar personal access tokens | Prefer fine-grained tokens with least privilege |
| `service-account` | Google-style service accounts or workload identities | Use when delegation is impractical |
| `webhook-secret` | Generated shared secret for inbound workflow calls | Generate per install; never reuse across buyers |
| `basic-vault` | Legacy systems only | Avoid unless no better option exists |
| `manual-fallback` | Last-resort documented setup path | Must not be the default premium experience |

## Connector Contract

Each connector in `Kit.md` must declare:

```yaml
auth:
  connectors:
    - id: microsoft-365
      service: Microsoft Graph
      required: true
      method: oauth2-delegated
      setupMode: guided
      grantedBy: buyer
      scopes:
        - Mail.Send
        - Calendars.ReadWrite
        - Files.ReadWrite
      validation:
        test: graph-profile-and-draft-message
        expected: Graph profile resolves and a draft/test message can be created
      fallback: oauth2-admin
      revocation: Remove app consent from Microsoft Entra or disconnect credential in the automation platform
      missingImpact: Email, calendar, and OneDrive steps cannot run
```

## Required Fields

| Field | Required | Meaning |
| --- | --- | --- |
| `id` | yes | Stable connector ID used by installer and validation reports |
| `service` | yes | Human-readable service name |
| `required` | yes | Whether the workflow can run without this connector |
| `method` | yes | One auth method from the taxonomy |
| `setupMode` | yes | `guided`, `auto-generated`, `platform-prompt`, `vault-entry`, or `manual` |
| `grantedBy` | yes | `buyer`, `buyer-admin`, `agency`, or `system` |
| `scopes` | yes, if applicable | Least-privilege permissions or API capabilities |
| `validation` | yes | Test name and expected result |
| `fallback` | yes | Backup setup path |
| `revocation` | yes | How to revoke access |
| `missingImpact` | yes | What breaks if the connector is unavailable |

## Installation Modes

### Standard Tier

Standard install should use a one-click template/import path whenever possible:

1. Buyer opens the install link from `Kit.md`.
2. Platform prompts for built-in connector authentication.
3. Installer validates each required connector.
4. Installer returns a pass/fail readiness report.

### Premium Tier

Premium install may use an agentic installer, but the agent should not ask the
buyer to hunt for API keys when OAuth or platform connector prompts are
available.

The agent should:

1. read the `auth` connector matrix from `Kit.md`
2. detect already-connected services
3. prompt only for missing connectors
4. prefer OAuth and platform connection prompts
5. store credentials only in the buyer's automation platform credential store or approved vault
6. run connector validation tests
7. generate an activation report

### Manual Fallback

Manual import remains available for advanced users and broken connector flows,
but it is not the primary customer experience.

## Certification Rule

No workflow can be certified until every required connector has:

- declared auth method
- least-privilege scope list or capability list
- setup mode
- validation test
- fallback path
- revocation path
- missing-impact note

## Change Log

| Date | Change ID | Version | Type | Summary | Author |
| --- | --- | --- | --- | --- | --- |
| 2026-05-07 | CC-2026-05-07-003 | 1.0.0 | standard | Added flexible connector auth contract for one-click and agentic kit installation. | codex |
