import type { Request, Response } from "express";
import { nanoid } from "nanoid";
import { desc, eq, isNull, or } from "drizzle-orm";
import { getDb } from "../db";
import { workspaceSnapshots } from "../schema";

/**
 * Workspace configuration snapshots — CC-2026-10-03-004 (audit finding F-14).
 *
 * WHAT WAS WRONG
 * Everything here read and wrote one module-level `let snapshotsStore` with
 * zero `workspaceId` references in the entire file. Consequences:
 *   1. Cross-tenant: any signed-in workspace listed every other workspace's
 *      snapshots, and could clone, restore or DELETE them — including the
 *      seeded templates that Settings.tsx hardcodes (`snap_kc_hq_primary`,
 *      `snap_franchise_starter`), so one workspace clicking delete broke the
 *      clone buttons for everyone.
 *   2. Ephemeral: the store was process-local, so a deploy wiped anything a
 *      user had saved — meaningless after 242 revisions.
 *
 * THE DATA-MODEL DECISION (recorded in the audit)
 * Two classes, distinguished by the same column:
 *   - `workspace_id IS NULL`  -> BUILT-IN TEMPLATE. Globally visible and
 *     clonable, because that is what a template is for and the client
 *     hardcodes the two ids; never deletable through the API.
 *   - `workspace_id = <you>`  -> your snapshot. Invisible everywhere else and
 *     deletable only by you.
 * Access goes through `visibleFilter()` on every read, so "not yours" reads as
 * 404 rather than leaking that it exists somewhere.
 *
 * Response shapes are byte-for-byte what Settings.tsx already expects
 * (`{success, snapshots, totalCount, lastUpdated}` etc.) — no client change.
 */

export interface WorkspaceSnapshot {
  id: string;
  name: string;
  officeName: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  version: string;
  tags: string[];
  scope: {
    integrations: boolean;
    hyperparameters: boolean;
    swarms: boolean;
    playbooks: boolean;
    prompts: boolean;
  };
  configuration: {
    llmSettings: {
      temperature: number;
      maxOutputTokens: number;
      topP: number;
      tier2Fallback: string;
      tier3Fallback: string;
      zeroRefusalMode: boolean;
    };
    integrations: {
      instantly: { enabled: boolean; maxDailyLeads: number };
      hubspot: { enabled: boolean; syncIntervalMins: number };
      agentmail: { enabled: boolean };
      elevenlabs: { enabled: boolean; defaultVoiceId: string };
      m365: { enabled: boolean; autoSyncSheets: boolean };
      ionos: { enabled: boolean };
      twilio: { enabled: boolean };
      n8n: { enabled: boolean };
      pulseSocial: { enabled: boolean };
    };
    activeAgents: Array<{
      id: string;
      name: string;
      role: string;
      department: string;
      status: "active" | "idle" | "paused";
      modelTier: string;
    }>;
    activeWorkflows: Array<{
      id: string;
      name: string;
      department: string;
      scheduleCron?: string;
    }>;
    customPromptOverrides?: Record<string, string>;
  };
}

type TemplateSeed = {
  id: string;
  name: string;
  officeName: string;
  description: string;
  /** Days before "now" — keeps templates sorting AFTER user snapshots (newest first). */
  ageDays: number;
  tags: string[];
  scope: WorkspaceSnapshot["scope"];
  configuration: WorkspaceSnapshot["configuration"];
};

/**
 * The two canonical configurations. Unchanged content from the original
 * in-memory seed; only the storage and the scoping are new.
 */
const TEMPLATES: TemplateSeed[] = [
  {
    id: "snap_kc_hq_primary",
    name: "Kansas City HQ Master Configuration",
    officeName: "Uncle Robert Consulting — KC Flagship",
    description:
      "Full production configuration with 10 autonomous workflows, Instantly.ai Batch 01, Pamela voice, and M365 control layer.",
    ageDays: 2,
    tags: ["flagship", "production", "m365", "instantly", "pamela"],
    scope: {
      integrations: true,
      hyperparameters: true,
      swarms: true,
      playbooks: true,
      prompts: true,
    },
    configuration: {
      llmSettings: {
        temperature: 0.2,
        maxOutputTokens: 8192,
        topP: 0.95,
        tier2Fallback: "gemini-flash-latest",
        tier3Fallback: "gemini-3.8-flash",
        zeroRefusalMode: true,
      },
      integrations: {
        instantly: { enabled: true, maxDailyLeads: 25 },
        hubspot: { enabled: true, syncIntervalMins: 15 },
        agentmail: { enabled: true },
        elevenlabs: { enabled: true, defaultVoiceId: "EXAVITQu4vr4xnSDxMaL" },
        m365: { enabled: true, autoSyncSheets: true },
        ionos: { enabled: true },
        twilio: { enabled: false },
        n8n: { enabled: true },
        pulseSocial: { enabled: true },
      },
      activeAgents: [
        { id: "agent_ops_lead", name: "Ops Lead Orchestrator", role: "COO & System Architect", department: "OPS", status: "active", modelTier: "gemini-2.5-pro" },
        { id: "agent_sdr_outbound", name: "SDR Autonomous Agent", role: "Outbound Enrichment & Prospecting", department: "SAL", status: "active", modelTier: "gemini-flash-latest" },
        { id: "agent_pamela_voice", name: "Pamela AI Receptionist", role: "24/7 Inbound Triage & Telephony", department: "OPS", status: "active", modelTier: "elevenlabs-multilingual-v2" },
        { id: "agent_fin_auditor", name: "Financial Reconciliation Node", role: "M365 Ledger & Cash Flow", department: "FIN", status: "active", modelTier: "gemini-flash-latest" },
        { id: "agent_content_dist", name: "Pulse Social Syndicator", role: "Multi-Platform Content Dissemination", department: "MKT", status: "active", modelTier: "gemini-flash-latest" },
      ],
      activeWorkflows: [
        { id: "mkt-01", name: "Inbound Lead Generation & Conversion", department: "Marketing" },
        { id: "sal-01", name: "Instantly 2-Step Outbound Outreach (Batch 01)", department: "Sales" },
        { id: "ops-01", name: "Pamela Google Voice Call Routing & Triage", department: "Operations" },
        { id: "fin-01", name: "M365 Financial Ledger & Mercury Sync", department: "Finance" },
      ],
    },
  },
  {
    id: "snap_franchise_starter",
    name: "Franchise & Branch Office Zero-Waste Starter",
    officeName: "Standard Partner Franchise Template",
    description:
      "Lightweight zero-cost starter kit optimized for new advisory branches, boutique agencies, and satellite locations.",
    ageDays: 5,
    tags: ["franchise", "starter", "low-burn", "branch-office"],
    scope: {
      integrations: true,
      hyperparameters: true,
      swarms: true,
      playbooks: true,
      prompts: false,
    },
    configuration: {
      llmSettings: {
        temperature: 0.1,
        maxOutputTokens: 4096,
        topP: 0.9,
        tier2Fallback: "gemini-flash-latest",
        tier3Fallback: "gemini-3.8-flash",
        zeroRefusalMode: false,
      },
      integrations: {
        instantly: { enabled: true, maxDailyLeads: 10 },
        hubspot: { enabled: true, syncIntervalMins: 60 },
        agentmail: { enabled: true },
        elevenlabs: { enabled: false, defaultVoiceId: "" },
        m365: { enabled: true, autoSyncSheets: true },
        ionos: { enabled: false },
        twilio: { enabled: false },
        n8n: { enabled: true },
        pulseSocial: { enabled: false },
      },
      activeAgents: [
        { id: "agent_ops_lite", name: "Branch Ops Assistant", role: "Branch Office Operations", department: "OPS", status: "active", modelTier: "gemini-flash-latest" },
        { id: "agent_sdr_lite", name: "Local SDR & Prospecting", role: "Regional Lead Intake", department: "SAL", status: "active", modelTier: "gemini-flash-latest" },
      ],
      activeWorkflows: [
        { id: "sal-01", name: "Regional Founder Diagnostic Outreach", department: "Sales" },
        { id: "ops-01", name: "Branch Intake & Client Onboarding", department: "Operations" },
      ],
    },
  },
];

let templatesSeeded = false;

/** Idempotent: inserts the two built-in templates once per process. */
async function ensureTemplatesSeeded(db: NonNullable<Awaited<ReturnType<typeof getDb>>>): Promise<void> {
  if (templatesSeeded) return;
  for (const t of TEMPLATES) {
    const created = new Date(Date.now() - t.ageDays * 86400000);
    await db
      .insert(workspaceSnapshots)
      .values({
        id: t.id,
        workspaceId: null, // built-in template: global
        name: t.name,
        officeName: t.officeName,
        description: t.description,
        version: "1.0.0",
        tags: t.tags,
        scope: t.scope,
        configuration: t.configuration,
        createdBy: "system:template",
        createdAt: created,
        updatedAt: created,
      })
      .onConflictDoNothing();
  }
  templatesSeeded = true;
}

/** A snapshot is readable when it is a template or belongs to the caller. */
function visibleFilter(workspaceId: string) {
  return or(
    isNull(workspaceSnapshots.workspaceId),
    eq(workspaceSnapshots.workspaceId, workspaceId)
  );
}

function toSnapshot(row: any): WorkspaceSnapshot {
  return {
    id: row.id,
    name: row.name,
    officeName: row.officeName,
    description: row.description ?? "",
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
    version: row.version,
    tags: Array.isArray(row.tags) ? row.tags : [],
    scope: row.scope,
    configuration: row.configuration,
  };
}

/** The gate guarantees a session, but a session with no workspace still gets a clear 401. */
function requireWorkspace(req: Request, res: Response): string | null {
  const workspaceId = req.workspaceId;
  if (!workspaceId) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  return workspaceId;
}

/**
 * GET /api/snapshots
 * Templates plus this workspace's own snapshots — nobody else's.
 */
export async function listSnapshots(req: Request, res: Response) {
  try {
    const workspaceId = requireWorkspace(req, res);
    if (!workspaceId) return;

    const db = await getDb();
    if (!db) return void res.status(503).json({ error: "Database unavailable" });

    await ensureTemplatesSeeded(db);

    const rows = await db
      .select()
      .from(workspaceSnapshots)
      .where(visibleFilter(workspaceId))
      .orderBy(desc(workspaceSnapshots.createdAt));

    return res.json({
      success: true,
      snapshots: rows.map(toSnapshot),
      totalCount: rows.length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to list snapshots", message: err.message });
  }
}

/**
 * POST /api/snapshots/save
 * Captures the caller's configuration into THEIR workspace.
 */
export async function saveSnapshot(req: Request, res: Response) {
  try {
    const workspaceId = requireWorkspace(req, res);
    if (!workspaceId) return;

    const { name, officeName, description, tags, scope, configuration } = req.body;

    if (!name || !officeName) {
      return res.status(400).json({ error: "Name and Office Name are required." });
    }

    const db = await getDb();
    if (!db) return void res.status(503).json({ error: "Database unavailable" });

    const now = new Date();
    const newSnapshot: WorkspaceSnapshot = {
      id: `snap_${nanoid(10)}`,
      name: String(name).trim(),
      officeName: String(officeName).trim(),
      description: description?.trim() || `Configuration snapshot for ${officeName}`,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      version: "1.0.0",
      tags: Array.isArray(tags) ? tags : ["custom", "branch"],
      scope: scope || {
        integrations: true,
        hyperparameters: true,
        swarms: true,
        playbooks: true,
        prompts: true,
      },
      configuration: configuration || {
        llmSettings: {
          temperature: 0.2,
          maxOutputTokens: 8192,
          topP: 0.95,
          tier2Fallback: "gemini-flash-latest",
          tier3Fallback: "gemini-3.8-flash",
          zeroRefusalMode: true,
        },
        integrations: {
          instantly: { enabled: true, maxDailyLeads: 25 },
          hubspot: { enabled: true, syncIntervalMins: 15 },
          agentmail: { enabled: true },
          elevenlabs: { enabled: true, defaultVoiceId: "EXAVITQu4vr4xnSDxMaL" },
          m365: { enabled: true, autoSyncSheets: true },
          ionos: { enabled: true },
          twilio: { enabled: false },
          n8n: { enabled: true },
          pulseSocial: { enabled: true },
        },
        activeAgents: [],
        activeWorkflows: [],
      },
    };

    await db.insert(workspaceSnapshots).values({
      id: newSnapshot.id,
      workspaceId, // scoped to the caller
      name: newSnapshot.name,
      officeName: newSnapshot.officeName,
      description: newSnapshot.description,
      version: newSnapshot.version,
      tags: newSnapshot.tags,
      scope: newSnapshot.scope as any,
      configuration: newSnapshot.configuration as any,
      createdBy: req.userEmail ?? null,
      createdAt: now,
      updatedAt: now,
    });

    return res.status(201).json({
      success: true,
      message: `Snapshot "${newSnapshot.name}" created successfully for ${newSnapshot.officeName}.`,
      snapshot: newSnapshot,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to save snapshot", message: err.message });
  }
}

/**
 * POST /api/snapshots/:id/clone
 * Cloning is allowed from a template or from your own snapshot; the clone is
 * always written into the CALLER's workspace, never back into the source's.
 */
export async function cloneSnapshot(req: Request, res: Response) {
  try {
    const workspaceId = requireWorkspace(req, res);
    if (!workspaceId) return;

    const { id } = req.params;
    const { targetOfficeName, newSnapshotName } = req.body;

    const db = await getDb();
    if (!db) return void res.status(503).json({ error: "Database unavailable" });

    await ensureTemplatesSeeded(db);

    const rows = await db
      .select()
      .from(workspaceSnapshots)
      .where(visibleFilter(workspaceId))
      .limit(500);
    const existing = rows.find(r => r.id === id);
    if (!existing) {
      return res.status(404).json({ error: "Snapshot not found." });
    }

    const now = new Date();
    const cloned: WorkspaceSnapshot = {
      ...toSnapshot(existing),
      id: `snap_${nanoid(10)}`,
      name: newSnapshotName || `${existing.name} (Clone - ${targetOfficeName || "New Office"})`,
      officeName: targetOfficeName || `${existing.officeName} - Branch 02`,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      tags: [...(Array.isArray(existing.tags) ? existing.tags : []), "cloned-branch"],
    };

    await db.insert(workspaceSnapshots).values({
      id: cloned.id,
      workspaceId,
      name: cloned.name,
      officeName: cloned.officeName,
      description: cloned.description,
      version: cloned.version,
      tags: cloned.tags,
      scope: cloned.scope as any,
      configuration: cloned.configuration as any,
      createdBy: req.userEmail ?? null,
      createdAt: now,
      updatedAt: now,
    });

    return res.json({
      success: true,
      message: `Successfully cloned snapshot to new office "${cloned.officeName}".`,
      snapshot: cloned,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to clone snapshot", message: err.message });
  }
}

/**
 * POST /api/snapshots/:id/restore
 * Returns the configuration. Templates are restorable by anyone — that is
 * what they are for; it reads nothing belonging to another workspace.
 */
export async function restoreSnapshot(req: Request, res: Response) {
  try {
    const workspaceId = requireWorkspace(req, res);
    if (!workspaceId) return;

    const { id } = req.params;

    const db = await getDb();
    if (!db) return void res.status(503).json({ error: "Database unavailable" });

    await ensureTemplatesSeeded(db);

    const rows = await db
      .select()
      .from(workspaceSnapshots)
      .where(visibleFilter(workspaceId))
      .limit(500);
    const existing = rows.find(r => r.id === id);
    if (!existing) {
      return res.status(404).json({ error: "Snapshot not found." });
    }

    return res.json({
      success: true,
      message: `Restored workspace configuration from "${existing.name}" (${existing.officeName}).`,
      appliedConfiguration: existing.configuration,
      appliedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to restore snapshot", message: err.message });
  }
}

/**
 * DELETE /api/snapshots/:id
 * Templates are protected (403) — one workspace could previously delete the
 * ids another workspace's Settings page hardcodes. A snapshot belonging to
 * someone else reads as 404, same as a snapshot that does not exist.
 */
export async function deleteSnapshot(req: Request, res: Response) {
  try {
    const workspaceId = requireWorkspace(req, res);
    if (!workspaceId) return;

    // String(): req.params types as string | string[], eq() takes string only.
    const id = String(req.params.id);

    const db = await getDb();
    if (!db) return void res.status(503).json({ error: "Database unavailable" });

    const rows = await db
      .select({ id: workspaceSnapshots.id, workspaceId: workspaceSnapshots.workspaceId })
      .from(workspaceSnapshots)
      .where(eq(workspaceSnapshots.id, id))
      .limit(1);
    const existing = rows[0];

    if (!existing) {
      return res.status(404).json({ error: "Snapshot not found." });
    }
    if (existing.workspaceId === null) {
      return res
        .status(403)
        .json({ error: "Built-in templates cannot be deleted." });
    }
    if (existing.workspaceId !== workspaceId) {
      // Not yours: indistinguishable from nonexistent, so it does not leak.
      return res.status(404).json({ error: "Snapshot not found." });
    }

    await db
      .delete(workspaceSnapshots)
      .where(eq(workspaceSnapshots.id, id));

    return res.json({ success: true, message: "Snapshot deleted." });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to delete snapshot", message: err.message });
  }
}
