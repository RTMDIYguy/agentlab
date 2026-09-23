import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { messengerMessages, messengerThreads } from "../schema";

/**
 * Normalized lead shape accepted from any capture path (contact router,
 * /api/intake, future sources). Callers map their own field names.
 */
export type LeadThreadInput = {
  submissionId: string;
  name: string | null;
  email: string;
  company: string | null;
  topic: string | null;
  message: string | null;
  source: string | null;
};

function truncate(value: string | null | undefined, max: number): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.length > max ? `${trimmed.slice(0, max - 1)}…` : trimmed;
}

/**
 * Give every captured lead a DM thread in the ClientMessenger so the founder
 * can communicate with (and about) the lead in one place. Idempotent: the
 * thread slug is derived from the submission id, so re-running this for the
 * same lead never duplicates threads or intro messages.
 *
 * Never throws — lead capture must not fail because messenger sync did.
 */
export async function ensureLeadDmThread(lead: LeadThreadInput): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    const slug = `dm-lead-${lead.submissionId}`;
    const displayName = lead.name?.trim() || lead.email;
    const tagline = truncate(
      [lead.company, lead.topic].filter(Boolean).join(" • ") || "New inbound lead",
      255
    );

    const inserted = await db
      .insert(messengerThreads)
      .values({
        type: "dm",
        slug,
        name: displayName.slice(0, 128),
        tagline,
        role: "New Lead",
        company: truncate(lead.company, 128),
      })
      .onConflictDoNothing()
      .returning({ id: messengerThreads.id });

    let threadId = inserted[0]?.id as string | undefined;

    if (!threadId) {
      // Thread already existed — reuse it without re-posting the intro.
      const existing = await db
        .select({ id: messengerThreads.id })
        .from(messengerThreads)
        .where(eq(messengerThreads.slug, slug))
        .limit(1);
      threadId = existing[0]?.id;
      if (!threadId) return false;
      return true;
    }

    const introParts = [
      `🔔 New lead captured via ${lead.source ?? "website"}.`,
      `Contact: ${displayName} <${lead.email}>${lead.company ? ` — ${lead.company}` : ""}`,
      lead.topic ? `Interest: ${lead.topic}` : null,
      lead.message ? `Notes: ${truncate(lead.message, 2000)}` : null,
    ].filter(Boolean);

    await db.insert(messengerMessages).values({
      threadId,
      sender: "bot",
      senderName: "LeadPulse Agent",
      content: introParts.join("\n"),
      isMeetingLink: false,
    });

    return true;
  } catch (err: any) {
    console.error("[Messenger] ensureLeadDmThread failed (lead unaffected):", err?.message);
    return false;
  }
}
