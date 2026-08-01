import type { Express, Request, Response } from "express";
import { getTableColumns } from "drizzle-orm";
import { getDb } from "../db";
import * as schema from "../../drizzle/schema";

type DrizzleTable = (typeof schema)[keyof typeof schema];

const ENTITY_TABLES: Record<string, DrizzleTable> = {
  users: schema.users,
  subscriptions: schema.subscriptions,
  payments: schema.payments,
  blogComments: schema.blogComments,
  blogArticles: schema.blogArticles,
  contactSubmissions: schema.contactSubmissions,
  statusIncidents: schema.statusIncidents,
  maintenanceSchedule: schema.maintenanceSchedule,
  newsletterSubscribers: schema.newsletterSubscribers,
  newsletterCampaigns: schema.newsletterCampaigns,
  newsletterTemplates: schema.newsletterTemplates,
  newsletterEvents: schema.newsletterEvents,
  cartItems: schema.cartItems,
  orders: schema.orders,
  orderItems: schema.orderItems,
  quotes: schema.quotes,
};

function buildSchema() {
  const entities: Record<string, { fields: string[] }> = {};
  for (const [name, table] of Object.entries(ENTITY_TABLES)) {
    entities[name] = { fields: Object.keys(getTableColumns(table as any)) };
  }
  return { entities };
}

type CreateGraphEntry = {
  entity?: string;
  values?: Record<string, unknown>;
};

/**
 * Minimal Autonoma SDK endpoint: discover returns the app's data model,
 * up/down provision and tear down scenario fixture data. The exact request/
 * response contract isn't documented on our side, so this started from
 * validate_sdk's error (a top-level `schema` object is required) and should
 * be adjusted based on further validation/dry-run feedback.
 */
export function registerAutonomaSdkRoutes(app: Express) {
  app.all("/api/autonoma", async (req: Request, res: Response) => {
    try {
      const body = (req.body ?? {}) as Record<string, unknown>;
      const action =
        (typeof body.action === "string" && body.action) ||
        (typeof req.query.action === "string" ? req.query.action : undefined) ||
        "discover";

      if (action === "discover") {
        return res.json({ schema: buildSchema() });
      }

      if (action === "up") {
        const db = await getDb();
        if (!db) {
          return res.status(503).json({ error: "Database not available" });
        }

        const recipe = (body.recipe ?? {}) as { create?: Record<string, CreateGraphEntry> };
        const createGraph = recipe.create ?? {};
        const created: Record<string, unknown> = {};

        for (const [key, entry] of Object.entries(createGraph)) {
          const table = entry.entity ? ENTITY_TABLES[entry.entity] : undefined;
          if (!table || !entry.values) continue;
          const [result] = await db.insert(table as any).values(entry.values);
          created[key] = { id: (result as { insertId?: number }).insertId };
        }

        return res.json({ created });
      }

      if (action === "down") {
        // Preview databases are torn down with the environment itself, so
        // there is nothing to clean up here unless specific ids are passed.
        return res.json({ ok: true });
      }

      return res.status(400).json({ error: `Unknown action: ${action}` });
    } catch (error) {
      console.error("[Autonoma SDK] Handler error:", error);
      return res.status(500).json({ error: "Internal error handling Autonoma SDK request" });
    }
  });
}
