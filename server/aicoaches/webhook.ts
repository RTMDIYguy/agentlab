import type { Express, Request, Response } from "express";
import { appendFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

type NormalizedLead = {
  receivedAt: string;
  sourceIp: string | null;
  userAgent: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  coachName: string | null;
  widgetId: string | null;
  conversationId: string | null;
};

function getString(value: unknown): string | null {
  if (typeof value === "string") return value.trim() || null;
  return null;
}

function safeCsv(value: string | null): string {
  const v = value ?? "";
  const escaped = v.replaceAll('"', '""');
  return `"${escaped}"`;
}

function normalizePayload(payload: unknown, req: Request): NormalizedLead {
  const body = (payload ?? {}) as Record<string, unknown>;

  const name =
    getString(body.name) ??
    getString(body.full_name) ??
    getString(body.fullName) ??
    getString(body.visitor_name) ??
    getString(body.visitorName) ??
    null;

  const email =
    getString(body.email) ??
    getString(body.visitor_email) ??
    getString(body.visitorEmail) ??
    null;

  const phone =
    getString(body.phone) ??
    getString(body.visitor_phone) ??
    getString(body.visitorPhone) ??
    null;

  const coachName = getString(body.coach_name) ?? getString(body.coachName) ?? null;
  const widgetId = getString(body.widget_id) ?? getString(body.widgetId) ?? null;
  const conversationId =
    getString(body.conversation_id) ?? getString(body.conversationId) ?? null;

  const sourceIp =
    getString(req.headers["x-forwarded-for"])?.split(",")[0]?.trim() ??
    getString(req.socket.remoteAddress) ??
    null;

  return {
    receivedAt: new Date().toISOString(),
    sourceIp,
    userAgent: getString(req.headers["user-agent"]),
    name,
    email,
    phone,
    coachName,
    widgetId,
    conversationId,
  };
}

async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

function getWebhookToken(req: Request): string | null {
  const headerToken = getString(req.headers["x-webhook-token"]);
  const queryToken = getString(req.query.token);
  return headerToken ?? queryToken ?? null;
}

export function registerAICoachesWebhookRoutes(app: Express): void {
  app.post("/api/aicoaches/webhook", async (req: Request, res: Response) => {
    const requiredToken = process.env.AICOACHES_WEBHOOK_TOKEN?.trim();
    if (requiredToken) {
      const token = getWebhookToken(req);
      if (!token || token !== requiredToken) {
        return res.status(401).json({ ok: false, error: "unauthorized" });
      }
    }

    const baseDir = path.resolve(process.cwd(), "output", "aicoaches-webhook");
    await ensureDir(baseDir);

    const normalized = normalizePayload(req.body, req);

    const jsonlPath = path.join(baseDir, "events.jsonl");
    const csvPath = path.join(baseDir, "leads.csv");

    await appendFile(
      jsonlPath,
      `${JSON.stringify({ receivedAt: normalized.receivedAt, headers: req.headers, body: req.body })}\n`,
      "utf8"
    );

    if (!(await fileExists(csvPath))) {
      const header =
        [
          "receivedAt",
          "sourceIp",
          "userAgent",
          "name",
          "email",
          "phone",
          "coachName",
          "widgetId",
          "conversationId",
        ].join(",") + "\n";
      await appendFile(csvPath, header, "utf8");
    }

    const row =
      [
        safeCsv(normalized.receivedAt),
        safeCsv(normalized.sourceIp),
        safeCsv(normalized.userAgent),
        safeCsv(normalized.name),
        safeCsv(normalized.email),
        safeCsv(normalized.phone),
        safeCsv(normalized.coachName),
        safeCsv(normalized.widgetId),
        safeCsv(normalized.conversationId),
      ].join(",") + "\n";
    await appendFile(csvPath, row, "utf8");

    return res.json({ ok: true });
  });
}

