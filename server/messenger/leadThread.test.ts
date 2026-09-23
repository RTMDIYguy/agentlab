import { beforeEach, describe, expect, it, vi } from "vitest";
import { ensureLeadDmThread } from "./leadThread";
import { getDb } from "../db";
import { messengerMessages, messengerThreads } from "../schema";

vi.mock("../db", () => ({ getDb: vi.fn() }));

function makeDb(opts: { threadReturn?: any[]; existing?: any[] } = {}) {
  const insertedValues: { table: any; value: any }[] = [];
  const db = {
    select: vi.fn(() => {
      const b: any = {};
      b.from = (t: any) => {
        b._table = t;
        return b;
      };
      b.where = () => b;
      b.limit = async () => (b._table === messengerThreads ? opts.existing ?? [] : []);
      return b;
    }),
    insert: vi.fn((table: any) => {
      const b: any = {};
      b.values = (v: any) => {
        insertedValues.push({ table, value: v });
        return b;
      };
      b.onConflictDoNothing = () => b;
      b.returning = async () =>
        table === messengerThreads ? opts.threadReturn ?? [] : [{ id: "msg-1" }];
      return b;
    }),
    _insertedValues: insertedValues,
  };
  return db;
}

const baseLead = {
  submissionId: "aaaaaaa1-1111-4111-8111-111111111111",
  name: "Dr. Sarah Lin",
  email: "sarah@auramedspa.com",
  company: "Aura MedSpa",
  topic: "Patient intake automation",
  message: "We want to automate weekend patient intake.",
  source: "contact-page",
};

describe("ensureLeadDmThread", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a DM thread and posts the intro message for a new lead", async () => {
    const db = makeDb({ threadReturn: [{ id: "thread-1" }] });
    vi.mocked(getDb).mockResolvedValue(db as any);

    const ok = await ensureLeadDmThread(baseLead);

    expect(ok).toBe(true);

    const threadInsert = db._insertedValues.find(v => v.table === messengerThreads);
    expect(threadInsert?.value.type).toBe("dm");
    expect(threadInsert?.value.slug).toBe(`dm-lead-${baseLead.submissionId}`);
    expect(threadInsert?.value.name).toBe("Dr. Sarah Lin");
    expect(threadInsert?.value.company).toBe("Aura MedSpa");

    const messageInsert = db._insertedValues.find(v => v.table === messengerMessages);
    expect(messageInsert?.value.sender).toBe("bot");
    expect(messageInsert?.value.content).toContain("sarah@auramedspa.com");
    expect(messageInsert?.value.content).toContain("contact-page");
    expect(messageInsert?.value.content).toContain("Patient intake automation");
  });

  it("is idempotent: an existing thread is reused without a duplicate intro", async () => {
    const db = makeDb({ threadReturn: [], existing: [{ id: "thread-1" }] });
    vi.mocked(getDb).mockResolvedValue(db as any);

    const ok = await ensureLeadDmThread(baseLead);

    expect(ok).toBe(true);
    const messageInserts = db._insertedValues.filter(v => v.table === messengerMessages);
    expect(messageInserts).toHaveLength(0);
  });

  it("derives the display name and tagline from email when name is missing", async () => {
    const db = makeDb({ threadReturn: [{ id: "thread-1" }] });
    vi.mocked(getDb).mockResolvedValue(db as any);

    await ensureLeadDmThread({ ...baseLead, name: null, company: null, topic: null });

    const threadInsert = db._insertedValues.find(v => v.table === messengerThreads);
    expect(threadInsert?.value.name).toBe(baseLead.email);
    expect(threadInsert?.value.tagline).toBe("New inbound lead");
  });

  it("returns false when the database is unavailable", async () => {
    vi.mocked(getDb).mockResolvedValue(null as any);

    expect(await ensureLeadDmThread(baseLead)).toBe(false);
  });

  it("never throws when the database errors — lead capture stays safe", async () => {
    vi.mocked(getDb).mockRejectedValue(new Error("connection refused"));

    await expect(ensureLeadDmThread(baseLead)).resolves.toBe(false);
  });
});
