# Postman Export Lane

This folder is the repo-safe lane for Postman collections and non-secret
environment templates.

## Purpose

Use Postman Desktop as the working API and vault surface without relying on the
paid GitHub integration. Export reviewed collections manually and commit only
files that are safe to share.

## Folder Map

| Folder | Use | Commit? |
| --- | --- | --- |
| `collections/` | Postman collection exports such as `agentic-recipes.postman_collection.json`. | Yes, after review. |
| `environments/` | Example environment templates with placeholder values only. | Commit `*.example.json` only. |

## Rules

- Do not commit real API keys, tokens, secrets, passwords, private keys, or live
  webhook signing secrets.
- Export collections from Postman Desktop when the API shape is ready to share.
- Export environments only as examples with blank or placeholder values.
- Keep real values in Postman Vault, Postman local environments, or the approved
  API key inventory workflow.
- If a secret appears in a screenshot, chat, repo file, or exported JSON, rotate
  or revoke it immediately.

## Suggested Collection Names

- `agentic-recipes.postman_collection.json`
- `agent-lab-admin.postman_collection.json`
- `founder-intake.postman_collection.json`
- `public-site-smoke-tests.postman_collection.json`

## Manual Export Procedure

1. In Postman Desktop, open the collection.
2. Use **Export** and choose Collection v2.1 JSON unless another format is
   required.
3. Save the file under `postman/collections/`.
4. Open the JSON and scan for accidental secret values before committing.
5. For environment files, create a matching `*.example.json` with placeholders
   only.
6. Run normal repo checks before committing if the exported collection supports
   a workflow-package or site change.

## Current Planned Collection

`Agentic Recipes` should export to:

`postman/collections/agentic-recipes.postman_collection.json`
