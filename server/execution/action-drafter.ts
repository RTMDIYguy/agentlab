/**
 * Action drafting for human-gated steps.
 *
 * An 'action' step's agent run must produce a JSON draft contract:
 *   { "connector": "<registered connector name>",
 *     "title": "<human-readable approval summary>",
 *     "payload": { ...connector-shaped outbound payload... } }
 *
 * The draft is produced by the same real agent-runner pipeline as every other
 * step (real model call, real telemetry). Parsing is strict: a draft without a
 * registered connector, a title, or a payload fails the step honestly — no
 * invented defaults are ever dispatched.
 */

import { runAgentStep } from "./agent-runner";
import { CONNECTORS } from "./connectors";

export interface ParsedActionDraft {
  ok: boolean;
  connector?: string;
  title?: string;
  payload?: Record<string, unknown>;
  error?: string;
}

const DRAFT_SYSTEM_SUFFIX = `

=== ACTION DRAFT MODE (HUMAN-GATED) ===
You are drafting an outbound action for HUMAN APPROVAL — it will NOT be sent
without an explicit human decision. Produce ONLY a JSON object with exactly
these keys:
  "connector": one of the registered connectors
  "title": a short human-readable summary of what this dispatch does (max 200 chars)
  "payload": the outbound payload, shaped for the chosen connector
Do not include commentary outside the JSON.`;

export async function draftActionPayload(
  actionPrompt: string,
  inputContext: Record<string, any>,
  workspaceId: string
): Promise<string> {
  const registered = Object.values(CONNECTORS)
    .map((c) => `- ${c.name}: ${c.label} (requires ${c.requiredKeys.join(", ")})`)
    .join("\n");

  const prompt = `${actionPrompt}

[REGISTERED CONNECTORS]
${registered}

Draft the outbound action as the JSON contract described in your instructions.`;

  const result = await runAgentStep(
    prompt,
    DRAFT_SYSTEM_SUFFIX,
    inputContext,
    workspaceId,
    [] // departments are enforced inside the runner via workspace packages
  );

  if (result.hasRefusal) {
    throw new Error(
      `Action drafting agent refused or failed capability check: ${result.refusalReason ?? "no reason given"}`
    );
  }

  // The runner's payload is structured; prefer an explicit `draft` field,
  // else stringify the whole payload (models often emit raw JSON text).
  const payload = result.outputPayload as Record<string, unknown>;
  if (typeof payload?.draft === "string") return payload.draft;
  if (payload?.draft && typeof payload?.draft === "object") {
    return JSON.stringify(payload.draft);
  }
  if (typeof payload?.result === "string" && payload.result.trim().startsWith("{")) {
    return payload.result;
  }
  return JSON.stringify(payload);
}

/**
 * Strictly parses a draft into the dispatch contract. Unknown connectors,
 * missing keys, or non-object payloads are rejected — nothing is defaulted.
 */
export function parseActionDraft(draft: string): ParsedActionDraft {
  let obj: unknown;
  try {
    obj = JSON.parse(extractJsonObject(draft));
  } catch {
    return { ok: false, error: "draft is not parseable JSON" };
  }

  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    return { ok: false, error: "draft must be a JSON object" };
  }

  const { connector, title, payload } = obj as Record<string, unknown>;

  if (typeof connector !== "string" || !CONNECTORS[connector]) {
    const known = Object.keys(CONNECTORS).join(", ");
    return { ok: false, error: `unknown or missing connector (registered: ${known})` };
  }
  if (typeof title !== "string" || title.trim() === "") {
    return { ok: false, error: "missing title" };
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, error: "payload must be an object" };
  }

  return {
    ok: true,
    connector,
    title: title.trim().slice(0, 200),
    payload: payload as Record<string, unknown>,
  };
}

/** Extracts the first balanced JSON object from mixed text output. */
export function extractJsonObject(text: string): string {
  const start = text.indexOf("{");
  if (start === -1) return text;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      continue;
    }
    if (ch === '"') inString = !inString;
    if (inString) continue;
    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return text.slice(start);
}
