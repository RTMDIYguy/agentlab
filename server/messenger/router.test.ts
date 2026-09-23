import { beforeEach, describe, expect, it, vi } from "vitest";
import { messengerRouter } from "./router";
import { getDb } from "../db";
import { invokeLLM } from "../_core/llm";
import { messengerMessages, messengerThreads } from "../schema";

vi.mock("../db", () => ({ getDb: vi.fn() }));
vi.mock("../_core/llm", () => ({ invokeLLM: vi.fn() }));

const caller = messengerRouter.createCaller({
  user: { id: "u-1", role: "admin" },
  req: { headers: {} } as any,
  res: {} as any,
} as any);

function makeDb(overrides: {
  threads?: any[];
  messages?: any[];
  insertReturning?: any[];
}) {
  const insertedValues: any[] = [];
  const db = {
    select: vi.fn(() => {
      const b: any = {};
      b.from = (table: any) => {
        b._table = table;
        return b;
      };
      b.where = () => b;
      b.orderBy = () => b;
      b.limit = async () =>
        b._table === messengerThreads ? (overrides.threads ?? []) : (overrides.messages ?? []);
      b.then = (resolve: any, reject: any) =>
        Promise.resolve(
          b._table === messengerThreads ? (overrides.threads ?? []) : (overrides.messages ?? [])
        ).then(resolve, reject);
      return b;
    }),
    insert: vi.fn(() => {
      const b: any = {};
      b.values = (v: any) => {
        insertedValues.push(v);
        return b;
      };
      b.onConflictDoNothing = () => b;
      b.onConflictDoUpdate = () => b;
      b.returning = async () => overrides.insertReturning ?? [];
      b.then = (resolve: any, reject: any) =>
        Promise.resolve(overrides.insertReturning ?? []).then(resolve, reject);
      return b;
    }),
    update: vi.fn(() => ({
      set: () => ({ where: async () => {} }),
    })),
    _insertedValues: insertedValues,
  };
  return db;
}

const threadRow = {
  id: "11111111-1111-4111-8111-111111111111",
  type: "dm",
  slug: "dm-sarah",
  name: "Dr. Sarah Lin",
  tagline: "Aura MedSpa",
  role: "Founder / Medical Director",
  company: "Aura MedSpa",
  createdAt: new Date("2026-09-23T08:00:00Z"),
  updatedAt: new Date("2026-09-23T08:00:00Z"),
};

const messageRow = {
  id: "22222222-2222-4222-8222-222222222222",
  threadId: threadRow.id,
  sender: "client",
  senderName: "Dr. Sarah Lin",
  content: "Could we schedule a 15-minute War Room meeting?",
  isMeetingLink: false,
  createdAt: new Date("2026-09-23T10:14:00Z"),
};

describe("messengerRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("listThreads seeds the four default office channels and serializes rows", async () => {
    const rows = ["chan-general", "chan-sales", "chan-fulfillment", "chan-portal"].map(
      (slug, i) => ({
        id: `id-${i}`,
        type: "channel",
        slug,
        name: slug,
        tagline: null,
        role: null,
        company: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );
    const db = makeDb({ threads: rows });
    vi.mocked(getDb).mockResolvedValue(db as any);

    const result = await caller.listThreads();

    // The four seed channels were inserted conflict-safely
    expect(db._insertedValues).toHaveLength(4);
    for (const value of db._insertedValues) {
      expect(value.type).toBe("channel");
      expect(value.slug).toBeTruthy();
    }

    expect(result).toHaveLength(4);
    expect(typeof result[0].createdAt).toBe("string");
  });

  it("getMessages throws NOT_FOUND for an unknown thread", async () => {
    vi.mocked(getDb).mockResolvedValue(makeDb({ threads: [] }) as any);

    await expect(
      caller.getMessages({ threadId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee" })
    ).rejects.toThrow(/Thread not found/);
  });

  it("getMessages returns serialized messages for a known thread", async () => {
    vi.mocked(getDb).mockResolvedValue(
      makeDb({ threads: [threadRow], messages: [messageRow] }) as any
    );

    const result = await caller.getMessages({ threadId: threadRow.id });

    expect(result).toHaveLength(1);
    expect(result[0].content).toContain("War Room");
    expect(typeof result[0].createdAt).toBe("string");
  });

  it("sendMessage persists a founder message and bumps thread activity", async () => {
    const db = makeDb({ threads: [threadRow], insertReturning: [messageRow] });
    vi.mocked(getDb).mockResolvedValue(db as any);

    const result = await caller.sendMessage({
      threadId: threadRow.id,
      content: "Absolutely — sending an invite now.",
    });

    expect(db.insert).toHaveBeenCalled();
    expect(db.update).toHaveBeenCalled(); // thread updatedAt bump
    // The input was persisted verbatim, and the DB row was returned serialized
    expect(db._insertedValues[0].content).toContain("invite");
    expect(result.content).toBe(messageRow.content);
    expect(typeof result.createdAt).toBe("string");
  });

  it("sendMessage rejects empty content via input validation", async () => {
    vi.mocked(getDb).mockResolvedValue(makeDb({ threads: [threadRow] }) as any);

    await expect(
      caller.sendMessage({ threadId: threadRow.id, content: "   " })
    ).rejects.toThrow();
  });

  it("sendMessage rejects an unknown thread", async () => {
    vi.mocked(getDb).mockResolvedValue(makeDb({ threads: [] }) as any);

    await expect(
      caller.sendMessage({
        threadId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
        content: "hello",
      })
    ).rejects.toThrow(/Thread not found/);
  });

  it("draftReply returns a trimmed draft from a string model response", async () => {
    vi.mocked(getDb).mockResolvedValue(
      makeDb({ threads: [threadRow], messages: [messageRow] }) as any
    );
    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [{ message: { content: "  Happy to help — here is my availability.  " } }],
    } as any);

    const result = await caller.draftReply({ threadId: threadRow.id });

    expect(result.draft).toBe("Happy to help — here is my availability.");
    // The draft is grounded: the transcript passed to the model includes the client's message
    const call = vi.mocked(invokeLLM).mock.calls[0][0];
    const userMsg = call.messages.find(m => m.role === "user");
    expect(JSON.stringify(userMsg)).toContain("War Room");
  });

  it("draftReply flattens array-content model responses", async () => {
    vi.mocked(getDb).mockResolvedValue(
      makeDb({ threads: [threadRow], messages: [messageRow] }) as any
    );
    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [
        { message: { content: [{ type: "text", text: "Part one " }, { type: "text", text: "part two" }] } },
      ],
    } as any);

    const result = await caller.draftReply({ threadId: threadRow.id });
    expect(result.draft).toBe("Part one part two");
  });

  it("draftReply refuses to invent a draft when the thread is empty", async () => {
    vi.mocked(getDb).mockResolvedValue(
      makeDb({ threads: [threadRow], messages: [] }) as any
    );

    await expect(caller.draftReply({ threadId: threadRow.id })).rejects.toThrow(
      /No messages in this thread yet/
    );
    expect(invokeLLM).not.toHaveBeenCalled();
  });

  it("draftReply surfaces model failures instead of faking a draft", async () => {
    vi.mocked(getDb).mockResolvedValue(
      makeDb({ threads: [threadRow], messages: [messageRow] }) as any
    );
    vi.mocked(invokeLLM).mockRejectedValue(new Error("OPENAI_API_KEY is not configured"));

    await expect(caller.draftReply({ threadId: threadRow.id })).rejects.toThrow(
      /OPENAI_API_KEY is not configured/
    );
  });

  it("createThread slugifies channel names", async () => {
    const created = { ...threadRow, type: "channel", slug: "growth-experiments", name: "Growth Experiments" };
    const db = makeDb({ insertReturning: [created] });
    vi.mocked(getDb).mockResolvedValue(db as any);

    const result = await caller.createThread({ type: "channel", name: "Growth Experiments" });

    expect(db._insertedValues[0].slug).toBe("growth-experiments");
    expect(result.slug).toBe("growth-experiments");
  });
});
