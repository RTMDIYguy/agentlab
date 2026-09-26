import { readFileSync } from "fs";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { executeOrchestratorWorkflow } from "./orchestrator-execute";
import { getDb } from "../db";
import { processPendingRuns } from "../execution/queue-processor";
import {
  agents,
  workflows,
  workflowSteps,
  workflowRuns,
  workflowRunSteps,
  workflowArtifacts,
} from "../schema";

vi.mock("../db", () => ({ getDb: vi.fn() }));
vi.mock("../execution/queue-processor", () => ({
  processPendingRuns: vi.fn(),
}));

function makeRes() {
  const res: any = {
    statusCode: 200,
    body: undefined as Record<string, any> | undefined,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(payload: Record<string, any>) {
      res.body = payload;
      return res;
    },
  };
  return res;
}

/**
 * Table-keyed hermetic DB mock. Each `select` chain is resolved by the table
 * passed to `.from()`, so the controller's read-backs can be scripted per
 * test. Insert values are recorded for assertions.
 */
function makeDb(config: {
  findWorkflow?: any[];
  existingSteps?: any[];
  existingAgents?: any[];
  finalRun?: any;
  runSteps?: any[];
  artifacts?: any[];
  insertReturning?: Record<string, any[]>;
}) {
  const insertedValues: any[] = [];
  const db: any = {
    _insertedValues: insertedValues,
    select: vi.fn(() => {
      const b: any = {};
      b.from = (table: any) => {
        b._table = table;
        return b;
      };
      b.where = () => b;
      b.orderBy = () => b;
      b.limit = async () => resolveRows(b._table);
      b.then = (resolve: any, reject: any) =>
        Promise.resolve(resolveRows(b._table)).then(resolve, reject);
      return b;
    }),
    insert: vi.fn(() => {
      const b: any = {};
      let returning: any[] = [];
      b.values = (v: any) => {
        insertedValues.push({ table: b._table, values: v });
        return b;
      };
      b.returning = (fn?: any) => {
        returning = fn ?? [{ id: "generated-id" }];
        return {
          then: (resolve: any, reject: any) =>
            Promise.resolve(returning).then(resolve, reject),
        };
      };
      b._setTable = (t: any) => {
        b._table = t;
        return b;
      };
      b.then = (resolve: any, reject: any) =>
        Promise.resolve(
          (config.insertReturning?.[String(b._table)] as any) ?? [{ id: "generated-id" }]
        ).then(resolve, reject);
      return b;
    }),
  };

  function resolveRows(table: any): any[] {
    if (table === workflows) return config.findWorkflow ?? [];
    if (table === workflowSteps) return config.existingSteps ?? [];
    if (table === workflowRuns) return config.finalRun ? [config.finalRun] : [];
    if (table === workflowRunSteps) return config.runSteps ?? [];
    if (table === workflowArtifacts) return config.artifacts ?? [];
    if (table === agents) return config.existingAgents ?? [];
    return [];
  }

  // Tag insert builders by table so _insertedValues can be filtered.
  const rawInsert = db.insert;
  db.insert = vi.fn((table: any) => {
    const b = rawInsert(table);
    b._table = table;
    return b;
  });

  return db;
}

const validProposal = {
  name: "Founder Signal Sprint",
  description: "Test DAG",
  departmentCode: "MKT",
  steps: [
    { stepNumber: 1, title: "Draft ICP brief", type: "agent", detail: "Write the ICP brief from notes" },
    { stepNumber: 2, title: "Human approval gate", type: "guardrail", detail: "Founder reviews before send" },
  ],
};

function runController(db: any, body: any) {
  return executeOrchestratorWorkflow(
    { workspaceId: "ws-1", body } as any,
    makeRes()
  );
}

describe("executeOrchestratorWorkflow (real pipeline)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(processPendingRuns).mockResolvedValue(undefined);
  });

  it("rejects proposals without a name or steps without touching the DB", async () => {
    const db = makeDb({});
    vi.mocked(getDb).mockResolvedValue(db);
    const res = makeRes();

    await executeOrchestratorWorkflow(
      { workspaceId: "ws-1", body: { proposal: { name: "x", steps: [] } } } as any,
      res
    );

    expect(res.statusCode).toBe(400);
    expect(db.insert).not.toHaveBeenCalled();
    expect(processPendingRuns).not.toHaveBeenCalled();
  });

  it("503s when the database is unavailable and never fakes a run", async () => {
    vi.mocked(getDb).mockResolvedValue(null as any);
    const res = makeRes();

    await executeOrchestratorWorkflow(
      { workspaceId: "ws-1", body: { proposal: validProposal } } as any,
      res
    );

    expect(res.statusCode).toBe(503);
    expect(res.body.error).toMatch(/database unavailable/i);
  });

  it("queues a pending run with real timestamps, syncs steps once, and runs the real pipeline", async () => {
    const db = makeDb({
      findWorkflow: [],
      existingSteps: [],
      finalRun: {
        id: "generated-id",
        status: "completed",
        startedAt: new Date("2026-09-23T10:00:00Z"),
        completedAt: new Date("2026-09-23T10:00:05Z"),
      },
      runSteps: [
        { status: "completed", cost: "0.002000" },
        { status: "completed", cost: "0.002321" },
      ],
      artifacts: [{ title: "ICP Brief" }],
    });
    vi.mocked(getDb).mockResolvedValue(db);

    const res = makeRes();
    await executeOrchestratorWorkflow(
      { workspaceId: "ws-1", body: { proposal: validProposal } } as any,
      res
    );

    expect(processPendingRuns).toHaveBeenCalledTimes(1);

    const runInsert = db._insertedValues.find(
      (iv: any) => iv.table === workflowRuns
    );
    expect(runInsert.values.status).toBe("pending");
    expect(runInsert.values.triggerSource).toBe("ops_agent");
    expect(runInsert.values.startedAt).toBeUndefined();
    expect(runInsert.values.completedAt).toBeUndefined();

    const stepInsert = db._insertedValues.find(
      (iv: any) => iv.table === workflowSteps
    );
    expect(stepInsert.values).toHaveLength(2);
    expect(stepInsert.values[0].stepType).toBe("agent");
    expect(stepInsert.values[1].stepType).toBe("guardrail");

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("completed");
    expect(res.body.artifacts).toEqual(["ICP Brief"]);
    expect(res.body.executionMetrics.tokensUsed).toBeNull(); // per-run tokens are not persisted anywhere
    expect(res.body.executionMetrics.cost).toBe("0.004321");
    expect(res.body.executionMetrics.latencyMs).toBe(5000);
    expect(res.body.summary).toMatch(/completed/i);
  });

  it("reports paused_for_approval honestly when a guardrail halts the run", async () => {
    const db = makeDb({
      findWorkflow: [],
      existingSteps: [],
      finalRun: {
        id: "generated-id",
        status: "paused_for_approval",
        startedAt: new Date("2026-09-23T10:00:00Z"),
        completedAt: null,
      },
      runSteps: [{ status: "completed" }],
      artifacts: [],
    });
    vi.mocked(getDb).mockResolvedValue(db);

    const res = makeRes();
    await executeOrchestratorWorkflow(
      { workspaceId: "ws-1", body: { proposal: validProposal } } as any,
      res
    );

    expect(res.body.status).toBe("paused_for_approval");
    expect(res.body.success).toBe(true);
    expect(res.body.summary).toMatch(/paused for approval/i);
  });

  it("reports failure with the real error message instead of fake success", async () => {
    const db = makeDb({
      findWorkflow: [],
      existingSteps: [],
      finalRun: {
        id: "generated-id",
        status: "failed",
        startedAt: new Date("2026-09-23T10:00:00Z"),
        completedAt: new Date("2026-09-23T10:00:02Z"),
        errorMessage: "Step 1 failed: OPENAI_API_KEY is not configured",
      },
      runSteps: [{ status: "failed" }],
      artifacts: [],
    });
    vi.mocked(getDb).mockResolvedValue(db);

    const res = makeRes();
    await executeOrchestratorWorkflow(
      { workspaceId: "ws-1", body: { proposal: validProposal } } as any,
      res
    );

    expect(res.body.success).toBe(false);
    expect(res.body.status).toBe("failed");
    expect(res.body.errorMessage).toMatch(/OPENAI_API_KEY/);
    expect(res.body.summary).toMatch(/failed/i);
  });

  it("omits token and cost telemetry as null when the pipeline wrote none", async () => {
    const db = makeDb({
      findWorkflow: [],
      existingSteps: [],
      finalRun: {
        id: "generated-id",
        status: "completed",
        startedAt: new Date("2026-09-23T10:00:00Z"),
        completedAt: new Date("2026-09-23T10:00:01Z"),
      },
      runSteps: [{ status: "completed", cost: null }],
      artifacts: [],
    });
    vi.mocked(getDb).mockResolvedValue(db);

    const res = makeRes();
    await executeOrchestratorWorkflow(
      { workspaceId: "ws-1", body: { proposal: validProposal } } as any,
      res
    );

    expect(res.body.executionMetrics.tokensUsed).toBeNull();
    expect(res.body.executionMetrics.cost).toBeNull();
  });

  it("reuses existing steps and workflow on re-execution (no duplicate DAG rows)", async () => {
    const existingStep = { id: "step-1" };
    const existingWf = { id: "wf-existing" };
    const db = makeDb({
      findWorkflow: [existingWf],
      existingSteps: [existingStep],
      finalRun: {
        id: "generated-id",
        status: "completed",
        startedAt: new Date("2026-09-23T10:00:00Z"),
        completedAt: new Date("2026-09-23T10:00:01Z"),
      },
      runSteps: [{ status: "completed" }],
      artifacts: [],
    });
    vi.mocked(getDb).mockResolvedValue(db);

    const res = makeRes();
    await executeOrchestratorWorkflow(
      { workspaceId: "ws-1", body: { proposal: validProposal } } as any,
      res
    );

    const stepInsert = db._insertedValues.find(
      (iv: any) => iv.table === workflowSteps
    );
    expect(stepInsert).toBeUndefined(); // steps already existed
    const wfInsert = db._insertedValues.find(
      (iv: any) => iv.table === workflows
    );
    expect(wfInsert).toBeUndefined(); // workflow already existed
    expect(res.body.workflowId).toBe("wf-existing");
  });

  it("leaves no fabricated template artifacts in the source", () => {
    const source = readFileSync("server/controllers/orchestrator-execute.ts", "utf-8");
    expect(source).not.toContain("Founder Signal Brief & ICP Matrix");
    expect(source).not.toContain("Core Message Map & Value Pillars");
    expect(source).not.toContain("qualityScore: 96");
    expect(source).not.toContain("new Date(Date.now() - 3600)");
    expect(source).not.toContain("status: \"completed\"");
  });

  // CC-2026-09-25-007: invented agent ids ("agent_ops_lead", "agent-sal-crm")
  // used to sync into workflow_steps.agent_id (a uuid column) and crash the
  // run on bind. Only ids that exist in the agents table may pass through;
  // everything else must bind SQL NULL.
  it("resolves proposal agentIds to NULL unless they exist as real agent rows", async () => {
    const realAgentId = "11111111-1111-1111-1111-111111111111";
    const db = makeDb({
      existingAgents: [{ id: realAgentId }],
      finalRun: {
        id: "generated-id",
        status: "completed",
        startedAt: new Date("2026-09-25T10:00:00Z"),
        completedAt: new Date("2026-09-25T10:00:01Z"),
      },
      runSteps: [{ status: "completed" }],
      artifacts: [],
    });
    vi.mocked(getDb).mockResolvedValue(db);

    const res = makeRes();
    await executeOrchestratorWorkflow(
      {
        workspaceId: "ws-1",
        body: {
          proposal: {
            ...validProposal,
            steps: [
              {
                stepNumber: 1,
                title: "Enrich leads",
                type: "agent",
                detail: "Use the real agent",
                agentId: realAgentId,
              },
              {
                stepNumber: 2,
                title: "Fake agent reference",
                type: "agent",
                detail: "This id was invented by a generator",
                agentId: "agent_ops_lead",
              },
              {
                stepNumber: 3,
                title: "No agent at all",
                type: "trigger",
                detail: "Agent-less step",
              },
            ],
          },
        },
      } as any,
      res
    );

    const stepInsert = db._insertedValues.find(
      (iv: any) => iv.table === workflowSteps
    );
    expect(stepInsert).toBeDefined();
    const rows = Array.isArray(stepInsert.values)
      ? stepInsert.values
      : [stepInsert.values];
    expect(rows[0].agentId).toBe(realAgentId); // real row -> kept
    expect(rows[1].agentId).toBeNull(); // invented id -> NULL, never the string
    expect(rows[2].agentId).toBeNull(); // absent -> NULL
    expect(res.body.status).toBe("completed");
  });

  it("never writes the fake agent ids that crashed DAG runs", () => {
    // The comment in orchestrator-execute.ts mentions the old fake id; assert
    // on ASSIGNMENT forms, not documentation strings.
    const executeSource = readFileSync("server/controllers/orchestrator-execute.ts", "utf-8");
    expect(executeSource).not.toMatch(/agentId:\s*["']agent_ops_lead/);
    const chatSource = readFileSync("client/src/components/OpsAgentChat.tsx", "utf-8");
    expect(chatSource).not.toMatch(/agentId:\s*["']agent_ops_lead/);
    const orchestratorSource = readFileSync("server/controllers/orchestrator.ts", "utf-8");
    expect(orchestratorSource).not.toMatch(/agentId:\s*["']agent-sal-crm/);
    expect(orchestratorSource).not.toContain("-specialist`");
  });
});
