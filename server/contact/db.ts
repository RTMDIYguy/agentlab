import { contactSubmissions, statusIncidents, maintenanceSchedule, InsertContactSubmission } from "../../drizzle/schema";
import { getDb } from "../db";

export async function createContactSubmission(data: InsertContactSubmission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(contactSubmissions).values(data);
  return result;
}

export async function getContactSubmissions(limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(contactSubmissions).orderBy((t) => t.createdAt).limit(limit);
}

export async function markContactSubmissionAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { eq } = await import("drizzle-orm");
  return db.update(contactSubmissions).set({ status: "read" }).where(eq(contactSubmissions.id, id));
}

export async function getStatusIncidents(limit = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { desc } = await import("drizzle-orm");
  return db.select().from(statusIncidents).orderBy(desc(statusIncidents.startedAt)).limit(limit);
}

export async function getMaintenanceSchedule(limit = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { desc } = await import("drizzle-orm");
  return db.select().from(maintenanceSchedule).orderBy(desc(maintenanceSchedule.scheduledStart)).limit(limit);
}
