import type { Request } from "express";

/**
 * Read a path parameter as a plain string.
 *
 * Under Express 5, `req.params` values are typed `string | string[]`
 * (path-to-regexp v8 supports repeated params). Every parameter used in this
 * app is a single segment, so this helper narrows honestly: strings pass
 * through, anything else becomes "" — which the existing truthiness guards
 * (`if (!id)` → 400/404) already handle correctly.
 *
 * Introduced when the 2026-09-21 express@5.2.1 dependency bump (CC via
 * Dependabot #74) made `eq(table.id, req.params.id)` fail typecheck across
 * the controllers; see docs/operations/honesty-audit-2026-09-23.md follow-ups
 * and the 48-typecheck-errors change-control entry.
 */
export function param(req: Request, name: string): string {
  const value = (req.params as Record<string, string | string[]>)[name];
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.length === 1 ? value[0] : "";
  return "";
}

/**
 * Read a query parameter as a single plain string (same Express 5 widening
 * applies to req.query).
 */
export function queryParam(req: Request, name: string): string {
  const value = (req.query as Record<string, unknown>)[name];
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return "";
}
