import { readFileSync } from "fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { teardownRouter } from "./router";
import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";
import { teardownSessions } from "../schema";

vi.mock("../_core/llm", () => ({ invokeLLM: vi.fn() }));
vi.mock("../db", () => ({
  getDb: vi.fn(),
  getUserByOpenId: vi.fn(),
}));

const caller = teardownRouter.createCaller({
  user: { id: "u-1", role: "admin", openId: "op-1", workspaceId: "ws-1" },
  req: { headers: {} } as any,
  res: {} as any,
} as any);

const notesInput = {
  title: "MedSpa Intake Audit",
  durationSeconds: 222,
  notes:
    "Walked through their current booking flow. Manual data entry between the form and the CRM. Around 00:45 I show the double-entry problem. They asked about automating confirmations.",
};

describe("teardownRouter.summarizeTeardown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a trimmed brief and model name from a string response", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({
      model: "gemini-2.5-flash",
      choices: [{ message: { content: "### Video Teardown Brief\n- Real brief from notes" } }],
    } as any);

    const result = await caller.summarizeTeardown(notesInput);

    expect(result.brief).toContain("Real brief from notes");
    expect(result.model).toBe("gemini-2.5-flash");
  });

  it("flattens array-content model responses", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({
      model: "m",
      choices: [
        {
          message: {
            content: [
              { type: "text", text: "Part one. " },
              { type: "text", text: "Part two." },
            ],
          },
        },
      ],
    } as any);

    const result = await caller.summarizeTeardown(notesInput);
    expect(result.brief).toBe("Part one. Part two.");
  });

  it("grounds the prompt in the notes, title, and real duration", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({
      model: "m",
      choices: [{ message: { content: "ok" } }],
    } as any);

    await caller.summarizeTeardown(notesInput);

    const call = vi.mocked(invokeLLM).mock.calls[0][0];
    const userMsg = JSON.stringify(call.messages.find((m: any) => m.role === "user"));
    expect(userMsg).toContain("Manual data entry between the form and the CRM");
    expect(userMsg).toContain("MedSpa Intake Audit");
    expect(userMsg).toContain("03:42");
    const systemMsg = JSON.stringify(call.messages.find((m: any) => m.role === "system"));
    expect(systemMsg).toContain("do NOT invent timestamps");
  });

  it("rejects honestly when the model returns an empty brief", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({
      model: "m",
      choices: [{ message: { content: "" } }],
    } as any);

    await expect(caller.summarizeTeardown(notesInput)).rejects.toThrow(/empty brief/);
  });

  it("surfaces model failures instead of faking a brief", async () => {
    vi.mocked(invokeLLM).mockRejectedValue(new Error("OPENAI_API_KEY is not configured"));

    await expect(caller.summarizeTeardown(notesInput)).rejects.toThrow(
      /OPENAI_API_KEY is not configured/
    );
  });

  it("rejects empty notes via input validation", async () => {
    await expect(
      caller.summarizeTeardown({ ...notesInput, notes: "   " })
    ).rejects.toThrow();
  });

  it("no trace of the old fabricated brief template remains in the UI", () => {
    const source = readFileSync("client/src/pages/ScreenRecorder.tsx", "utf-8");
    expect(source).not.toContain("high-ROI automation insertion points");
    expect(source).not.toContain("4.2 seconds");
    expect(source).not.toContain("Indexed in Results Vault");
    expect(source).not.toContain("Aura MedSpa VIP Patient Flow Teardown");
    expect(source).not.toContain("Vance CRE Nevada Opportunity Radar");
    expect(source).not.toContain("setTimeout(r, 1400)");
  });
});

function makeDb(overrides: {
  listRows?: any[];
  insertReturning?: any[];
  updateReturning?: any[];
}) {
  const insertedValues: any[] = [];
  const db: any = {
    select: vi.fn(() => {
      const b: any = {};
      b.from = () => b;
      b.where = () => b;
      b.orderBy = () => b;
      b.limit = async () => overrides.listRows ?? [];
      b.then = (resolve: any, reject: any) =>
        Promise.resolve(overrides.listRows ?? []).then(resolve, reject);
      return b;
    }),
    insert: vi.fn(() => {
      const b: any = {};
      b.values = (v: any) => {
        insertedValues.push(v);
        return b;
      };
      b.returning = async () => overrides.insertReturning ?? [];
      b.then = (resolve: any, reject: any) =>
        Promise.resolve(overrides.insertReturning ?? []).then(resolve, reject);
      return b;
    }),
    update: vi.fn(() => {
      const b: any = {};
      b.set = () => b;
      b.where = () => b;
      b.returning = async () => overrides.updateReturning ?? [];
      b.then = (resolve: any, reject: any) =>
        Promise.resolve(overrides.updateReturning ?? []).then(resolve, reject);
      return b;
    }),
    delete: vi.fn(() => ({
      where: async () => undefined,
    })),
  };
  db._insertedValues = insertedValues;
  return db;
}

const SESSION_A = "33333333-3333-4333-8333-333333333333";

describe("teardownRouter persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("save persists a metadata row without any video binary", async () => {
    const db = makeDb({ insertReturning: [{ id: SESSION_A }] });
    vi.mocked(getDb).mockResolvedValue(db as any);

    const result = await caller.save({
      title: "MedSpa Intake Audit",
      durationSeconds: 222,
      sizeBytes: 0,
    });

    expect(result.id).toBe(SESSION_A);
    const values = db._insertedValues[0];
    expect(values.title).toBe("MedSpa Intake Audit");
    expect(values.durationSeconds).toBe(222);
    expect(values.videoData).toBeUndefined();
  });

  it("list maps rows to honest metadata (no blobs over the wire)", async () => {
    const db = makeDb({
      listRows: [
        {
          id: SESSION_A,
          title: "With video",
          durationSeconds: 60,
          sizeBytes: 2048,
          notes: "some notes",
          aiBrief: "a brief",
          hasVideo: true,
          createdAt: new Date("2026-09-23T10:00:00Z"),
        },
        {
          id: "sess-2",
          title: "Notes only",
          durationSeconds: 0,
          sizeBytes: 0,
          notes: null,
          aiBrief: null,
          hasVideo: false,
          createdAt: new Date("2026-09-23T11:00:00Z"),
        },
      ],
    });
    vi.mocked(getDb).mockResolvedValue(db as any);

    const rows = await caller.list({});

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      id: SESSION_A,
      hasVideo: true,
      hasBrief: true,
      createdAt: "2026-09-23T10:00:00.000Z",
    });
    expect(rows[1]).toMatchObject({ hasVideo: false, hasBrief: false });
    expect(JSON.stringify(rows)).not.toContain("videoData");
  });

  it("updateBrief updates the stored brief and reports NOT_FOUND when absent", async () => {
    const dbOk = makeDb({ updateReturning: [{ id: SESSION_A }] });
    vi.mocked(getDb).mockResolvedValue(dbOk as any);
    await expect(
      caller.updateBrief({ sessionId: SESSION_A, brief: "updated brief", model: "m" })
    ).resolves.toMatchObject({ ok: true });

    const dbMissing = makeDb({ updateReturning: [] });
    vi.mocked(getDb).mockResolvedValue(dbMissing as any);
    await expect(
      caller.updateBrief({ sessionId: SESSION_A, brief: "updated brief" })
    ).rejects.toThrow(/not found/i);
  });

  it("delete removes the session row", async () => {
    const db = makeDb({});
    vi.mocked(getDb).mockResolvedValue(db as any);

    await expect(caller.delete({ sessionId: SESSION_A })).resolves.toMatchObject({ ok: true });
    expect(db.delete).toHaveBeenCalled();
  });

  it("rejects oversized sizeBytes input via validation", async () => {
    await expect(
      caller.save({
        title: "Too big",
        sizeBytes: 3_000_000_000,
      })
    ).rejects.toThrow();
  });

  it("the library no longer claims browser-only storage", () => {
    const source = readFileSync("client/src/pages/ScreenRecorder.tsx", "utf-8");
    expect(source).not.toContain("browser only, not persisted server-side");
    expect(source).toContain("survive refresh");
  });
});
