/**
 * Regression test for the capped asset count (CC-2026-10-02-009,
 * disposition 12): listArtifacts applies `limit` to the returned rows, so
 * totalCount (rows.length) froze at the limit — the Command Center's
 * "N Assets" badge showed 30 forever. The response now carries an
 * additive workspace-wide `total` computed without the limit, alongside
 * the unchanged totalCount for existing consumers.
 */

import { describe, expect, it, vi, beforeEach } from "vitest";

const selectMock = vi.fn();

vi.mock("../db", () => ({
  getDb: vi.fn(async () => ({ select: selectMock })),
}));

import { listArtifacts } from "./artifacts";

function makeRes() {
  const res: any = { statusCode: 0, body: undefined as unknown };
  res.status = vi.fn((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.json = vi.fn((payload: unknown) => {
    res.body = payload;
    return res;
  });
  return res;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("listArtifacts — true count beyond the limit", () => {
  it("returns an unbounded `total` next to the capped totalCount", async () => {
    const rows = [
      { id: "a1", artifactType: "post" },
      { id: "a2", artifactType: "report" },
    ];

    selectMock
      .mockImplementationOnce(() => ({
        from: () => ({
          where: () => ({
            orderBy: () => ({
              limit: async () => rows,
            }),
          }),
        }),
      }))
      .mockImplementationOnce(() => ({
        from: () => ({
          where: async () => [{ total: 42 }],
        }),
      }));

    const res = makeRes();
    await listArtifacts(
      { workspaceId: "ws-1", query: { limit: "30" } } as any,
      res
    );

    expect(res.statusCode).toBe(200);
    expect((res.body as any).artifacts).toHaveLength(2);
    expect((res.body as any).totalCount).toBe(2); // capped view, unchanged
    expect((res.body as any).total).toBe(42); // true count
    expect(selectMock).toHaveBeenCalledTimes(2);
  });

  it("falls back to the row count when the count query fails", async () => {
    const rows = [{ id: "a1", artifactType: "post" }];

    selectMock
      .mockImplementationOnce(() => ({
        from: () => ({
          where: () => ({
            orderBy: () => ({
              limit: async () => rows,
            }),
          }),
        }),
      }))
      .mockImplementationOnce(() => ({
        from: () => ({
          where: async () => {
            throw new Error("count blew up");
          },
        }),
      }));

    const res = makeRes();
    await listArtifacts({ workspaceId: "ws-1", query: {} } as any, res);

    expect(res.statusCode).toBe(200);
    expect((res.body as any).total).toBe(1);
  });
});
