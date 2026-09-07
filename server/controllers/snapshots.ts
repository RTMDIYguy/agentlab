import type { Request, Response } from "express";
import { nanoid } from "nanoid";

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

// In-memory persistent snapshot store seeded with canonical configurations
let snapshotsStore: WorkspaceSnapshot[] = [
  {
    id: "snap_kc_hq_primary",
    name: "Kansas City HQ Master Configuration",
    officeName: "Uncle Robert Consulting — KC Flagship",
    description: "Full production configuration with 10 autonomous workflows, Instantly.ai Batch 01, Pamela voice, and M365 control layer.",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    version: "1.1.0",
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
        tier2Fallback: "gemini-2.5-flash",
        tier3Fallback: "gemini-2.0-flash-lite",
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
        { id: "agent_sdr_outbound", name: "SDR Autonomous Agent", role: "Outbound Enrichment & Prospecting", department: "SAL", status: "active", modelTier: "gemini-2.5-flash" },
        { id: "agent_pamela_voice", name: "Pamela AI Receptionist", role: "24/7 Inbound Triage & Telephony", department: "OPS", status: "active", modelTier: "elevenlabs-multilingual-v2" },
        { id: "agent_fin_auditor", name: "Financial Reconciliation Node", role: "M365 Ledger & Cash Flow Monitor", department: "FIN", status: "active", modelTier: "gemini-2.5-flash" },
        { id: "agent_content_dist", name: "Pulse Social Syndicator", role: "Multi-Platform Content Dissemination", department: "MKT", status: "active", modelTier: "gemini-2.5-flash" },
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
    description: "Lightweight zero-cost starter kit optimized for new advisory branches, boutique agencies, and satellite locations.",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
    version: "1.0.0",
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
        tier2Fallback: "gemini-2.5-flash",
        tier3Fallback: "gemini-2.0-flash-lite",
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
        { id: "agent_ops_lite", name: "Branch Ops Assistant", role: "Branch Office Operations", department: "OPS", status: "active", modelTier: "gemini-2.5-flash" },
        { id: "agent_sdr_lite", name: "Local Outbound SDR", role: "Regional Lead Intake", department: "SAL", status: "active", modelTier: "gemini-2.5-flash" },
      ],
      activeWorkflows: [
        { id: "sal-01", name: "Regional Founder Diagnostic Outreach", department: "Sales" },
        { id: "ops-01", name: "Branch Intake & Client Onboarding", department: "Operations" },
      ],
    },
  },
];

/**
 * GET /api/snapshots
 * List all saved workspace snapshots.
 */
export async function listSnapshots(req: Request, res: Response) {
  try {
    return res.json({
      success: true,
      snapshots: snapshotsStore,
      totalCount: snapshotsStore.length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to list snapshots", message: err.message });
  }
}

/**
 * POST /api/snapshots/save
 * Capture and save current configuration as a new snapshot.
 */
export async function saveSnapshot(req: Request, res: Response) {
  try {
    const { name, officeName, description, tags, scope, configuration } = req.body;

    if (!name || !officeName) {
      return res.status(400).json({ error: "Name and Office Name are required." });
    }

    const newSnapshot: WorkspaceSnapshot = {
      id: `snap_${nanoid(10)}`,
      name: name.trim(),
      officeName: officeName.trim(),
      description: description?.trim() || `Configuration snapshot for ${officeName}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
          tier2Fallback: "gemini-2.5-flash",
          tier3Fallback: "gemini-2.0-flash-lite",
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

    snapshotsStore.unshift(newSnapshot);

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
 * Clone a snapshot into a new office or branch configuration.
 */
export async function cloneSnapshot(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { targetOfficeName, newSnapshotName } = req.body;

    const existing = snapshotsStore.find((s) => s.id === id);
    if (!existing) {
      return res.status(404).json({ error: "Snapshot not found." });
    }

    const cloned: WorkspaceSnapshot = {
      ...JSON.parse(JSON.stringify(existing)),
      id: `snap_${nanoid(10)}`,
      name: newSnapshotName || `${existing.name} (Clone - ${targetOfficeName || "New Office"})`,
      officeName: targetOfficeName || `${existing.officeName} - Branch 02`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [...existing.tags, "cloned-branch"],
    };

    snapshotsStore.unshift(cloned);

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
 * Restore workspace to a saved snapshot.
 */
export async function restoreSnapshot(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const existing = snapshotsStore.find((s) => s.id === id);
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
 * Delete a snapshot from the system.
 */
export async function deleteSnapshot(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const initialLen = snapshotsStore.length;
    snapshotsStore = snapshotsStore.filter((s) => s.id !== id);

    if (snapshotsStore.length === initialLen) {
      return res.status(404).json({ error: "Snapshot not found." });
    }

    return res.json({ success: true, message: "Snapshot deleted." });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to delete snapshot", message: err.message });
  }
}
