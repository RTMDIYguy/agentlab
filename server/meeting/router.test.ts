import { beforeEach, describe, expect, it, vi } from "vitest";
import { meetingRouter } from "./router";
import { invokeLLM } from "../_core/llm";

vi.mock("../_core/llm", () => ({ invokeLLM: vi.fn() }));

const caller = meetingRouter.createCaller({
  user: { id: "u-1", role: "admin" },
  req: { headers: {} } as any,
  res: {} as any,
} as any);

const notesInput = {
  roomName: "medspa-intake-lounge",
  durationSeconds: 1500,
  notes:
    "Discussed weekend patient intake bottleneck. Dr. Lin wants automated booking confirmations. Agreed to pilot the 5-day intake sprint. Follow up on pricing next week.",
};

describe("meetingRouter.summarizeNotes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a trimmed summary and model name from a string response", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({
      model: "gemini-2.5-flash",
      choices: [{ message: { content: "### Meeting Executive Summary\n- Real summary from notes" } }],
    } as any);

    const result = await caller.summarizeNotes(notesInput);

    expect(result.summary).toContain("Real summary from notes");
    expect(result.model).toBe("gemini-2.5-flash");
  });

  it("flattens array-content model responses", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({
      model: "gemini-2.5-flash",
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

    const result = await caller.summarizeNotes(notesInput);
    expect(result.summary).toBe("Part one. Part two.");
  });

  it("grounds the prompt in the notes, room name, and duration", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({
      model: "m",
      choices: [{ message: { content: "ok" } }],
    } as any);

    await caller.summarizeNotes(notesInput);

    const call = vi.mocked(invokeLLM).mock.calls[0][0];
    const userMsg = JSON.stringify(call.messages.find(m => m.role === "user"));
    expect(userMsg).toContain("weekend patient intake");
    expect(userMsg).toContain("medspa-intake-lounge");
    expect(userMsg).toContain("25:00");
    // System prompt must forbid invented commitments
    const systemMsg = JSON.stringify(call.messages.find(m => m.role === "system"));
    expect(systemMsg).toContain("do not invent");
  });

  it("rejects honestly when the model returns an empty summary", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({
      model: "m",
      choices: [{ message: { content: "" } }],
    } as any);

    await expect(caller.summarizeNotes(notesInput)).rejects.toThrow(/empty summary/);
  });

  it("surfaces model failures instead of faking a summary", async () => {
    vi.mocked(invokeLLM).mockRejectedValue(new Error("OPENAI_API_KEY is not configured"));

    await expect(caller.summarizeNotes(notesInput)).rejects.toThrow(
      /OPENAI_API_KEY is not configured/
    );
  });

  it("rejects empty notes via input validation", async () => {
    await expect(
      caller.summarizeNotes({ ...notesInput, notes: "   " })
    ).rejects.toThrow();
  });
});
