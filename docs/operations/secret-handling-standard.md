# URC Secret Handling Standard

Date created: 2026-06-03
Status: v0 active standard
Scope: Internal security, credentials, service accounts, API keys, backup codes,
and workflow credential artifacts

## Purpose

This standard defines how Robert and authorized agents handle agency secrets
without turning chat, Markdown, Git, screenshots, or loose files into a secret
store.

The operating goal is continuity without exposure: if Robert is unavailable,
the agency should still know what secrets exist, what they unlock, where they
are secured, who owns recovery, and which workflows depend on them. The agency
does not need secret values in the repo to achieve that.

## Non-Negotiable Rules

- Do not put secret values in Markdown, Git commits, screenshots, chat, issue
  comments, or public/private documentation.
- Do not paste secret values into agent-visible conversation unless there is no
  safer route and Robert explicitly authorizes that one-time handling.
- Do not print secret file contents to terminal output.
- Do not import raw files from `Keys`, backup-code folders, `.env` files, or
  credential exports into the repo.
- Store actual values only in an approved vault or credential surface: Postman
  Vault, n8n credentials, a password manager, environment variables, or another
  explicitly approved secure store.
- Record metadata and handling actions, not values.

## Authorized Agent Handling Boundary

Codex or another authorized agent may:

- list secret-bearing filenames and folder paths when needed for inventory
  without opening values;
- classify secret artifacts by type using filenames, surrounding docs, or
  redacted metadata;
- help Robert move a secret value into Postman Vault, n8n credentials,
  environment variables, or another approved vault;
- use a credential in a local tool only when the task requires it and Robert
  has authorized the use;
- record a metadata-only handling log entry after use.

Agents must not claim technical memory erasure. The practical rule is:

- do not repeat the value;
- do not preserve the value in docs, command output, logs, or commits;
- keep only the metadata log.

## Secret Artifact Classes

| Class | Examples | Approved Destination | Repo Record |
| --- | --- | --- | --- |
| API key or token | OpenAI key, HubSpot token, Stripe key | Postman Vault, n8n credential, password manager, env var | Metadata only |
| Service account JSON | Google service account, cloud marketplace key | Password manager or n8n credential; optionally Postman if supported | Metadata only; never raw JSON |
| OAuth app config | Client ID, client secret, redirect settings | Password manager plus platform app settings | Client ID may be metadata if non-secret; secret value stays vaulted |
| Webhook secret | n8n webhook secret, platform callback secret | n8n credential or env var | Metadata only |
| Backup code set | Recovery codes, MFA backup codes | Password manager secure note or approved backup-code folder | Existence and location pointer only |
| Postman environment | Environment export with values | Postman local vault; repo may keep `.example.json` only | Non-secret example only |
| Workflow blueprint JSON | n8n workflow, Make blueprint, Postman collection | Workflow automation folder after secret scan | Sanitized artifact only |
| Unknown JSON | Any unclassified JSON from Keys | Quarantine folder | Metadata with `review-needed` |

## Quarantine And Classification Procedure

1. Treat every file in `AI Native Agency Deepened\Keys`, backup-code folders,
   `.env` files, and credential exports as secret-bearing until classified.
2. Inventory filenames, locations, file type, and suspected service without
   printing values.
3. Classify each artifact as one of:
   - API key or token
   - service account JSON
   - OAuth app config
   - webhook secret
   - backup code set
   - Postman collection/environment
   - workflow blueprint JSON
   - data/config artifact with no secret values
   - unknown/retired
4. Move or copy only sanitized workflow blueprints into repo workflow folders.
5. Move usable secret values into the approved vault or credential surface.
6. Leave unknown artifacts quarantined with `review-needed` status.
7. Record every handling action in the metadata-only secret handling log.

## Postman Import Rules

When Postman requests a variable import with `Key`, `Value`, and
`Allowed domains`:

| Field | Rule |
| --- | --- |
| Key | Use the variable name Postman will expose, such as `PROD_OPENAI_API_KEY` or `LOCAL_N8N_WEBHOOK_SECRET`. |
| Value | Paste the actual secret only inside Postman or approved vault UI. Do not place it in CSV, Markdown, or Git. |
| Allowed domains | Use the narrowest hostnames the key needs, such as `api.openai.com`, `sheets.googleapis.com`, or `api.hubapi.com`. If unknown, mark `review-needed` rather than guessing broad access. |

If a key does not specify domains, infer only from confirmed service
documentation, working workflow nodes, or a successful tool-specific setup
guide. Otherwise leave the domain field for human review.

## Metadata Log

The active metadata-only handling log lives in the compliance evidence area:

`C:\Users\thebo\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\Compliance Audits\secret-handling-log.md`

Required columns:

| Field | Meaning |
| --- | --- |
| Date | Date of handling action. |
| Handler | Human or authorized agent who handled the secret. |
| Artifact ID / Filename | Filename, variable name, or redacted identifier. |
| Secret Class | Class from this standard. |
| Service / Tool | Tool, platform, or account the secret belongs to. |
| Related Workflow(s) | Workflow IDs or business processes that depend on it. |
| Action Taken | Classified, vaulted, imported, tested, rotated, retired, or left quarantined. |
| Secure Location | Vault/tool/location pointer without the value. |
| Reason | Why the secret was handled. |
| Result | Outcome of the action. |
| Value Retained In Docs/Chat? | Must be `No`. |
| Next Review | Rotation, domain review, or owner review date. |

## Operating Registry Relationship

The future Tool / Account / Relationship registry should include a
`Credential Artifact` or `Security Metadata` record type. That record type may
store:

- secret exists: yes/no
- secure location pointer
- service/tool
- related account
- related workflow IDs
- owner
- environment: local, dev, staging, prod
- allowed domains status
- last used date
- rotation/review date
- status: active, fallback, trial, lost, retired, review-needed

It must not store actual secret values.

## Emergency Access Model

The agency should not depend on any one agent or chat session as the only
secret custodian. At least one human emergency owner should have controlled
access to the approved vault or recovery instructions.

Minimum emergency model:

- Robert remains primary owner.
- One trusted human/legal fallback is named outside the repo.
- Vault recovery instructions exist in a secure location.
- Backup codes are stored in a password manager secure note or approved
  backup-code folder, with only metadata in the registry.

## Stop Conditions

Stop and ask Robert before continuing if:

- a file appears to contain multiple unrelated secrets;
- the destination vault/tool is unclear;
- a secret appears exposed in Git, chat, screenshots, or public docs;
- a key may need rotation because it was exposed or imported into the wrong
  place;
- broad allowed domains would be required and no narrow hostnames are known;
- the artifact might belong to a client, partner, or third-party account rather
  than URC.

## Success Criteria

- Secret values are secured in approved vault or credential surfaces.
- The agency can tell what exists, where it is secured, and what depends on it.
- Secret handling actions are logged without revealing values.
- Workflow packages can reference credential requirements without bundling
  credentials.
- Agents can help with continuity without becoming the secret store.
