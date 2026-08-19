import { db } from "./db";
import { supportTickets, type SupportTicket } from "../shared/schema";

export type CreateTicketInput = {
  subject: string;
  body: string;
  userId?: number | null;
  requesterName?: string | null;
  requesterEmail?: string | null;
  channel?: string;
  category?: string;
  priority?: string;
  assignedTo?: number | null;
  metadata?: Record<string, unknown> | string | null;
};

/** Create a support ticket for CRM. Failures are logged and return null so callers keep working. */
export async function createSupportTicket(input: CreateTicketInput): Promise<SupportTicket | null> {
  try {
    const subject = String(input.subject || "").trim();
    const body = String(input.body || "").trim();
    if (!subject || !body) {
      console.warn("createSupportTicket skipped: missing subject/body");
      return null;
    }

    const metadata =
      input.metadata == null
        ? null
        : typeof input.metadata === "string"
          ? input.metadata
          : JSON.stringify(input.metadata);

    const [ticket] = await db
      .insert(supportTickets)
      .values({
        subject: subject.slice(0, 240),
        body,
        userId: input.userId ?? null,
        requesterName: input.requesterName || null,
        requesterEmail: input.requesterEmail || null,
        channel: input.channel || "web",
        category: input.category || "general",
        priority: input.priority || "normal",
        assignedTo: input.assignedTo ?? null,
        metadata,
        status: "open",
      })
      .returning();

    return ticket;
  } catch (error) {
    console.error("createSupportTicket failed:", error);
    return null;
  }
}

export function subjectFromCategory(category: string): string {
  const map: Record<string, string> = {
    aura: "Aura Reading",
    healing: "Energy Healing",
    horoscope: "Horoscope",
    account: "Account Support",
    feedback: "Product Feedback",
    booking: "Healer Booking",
    help: "Help Request",
    other: "Other",
    general: "General Inquiry",
  };
  return map[category] || category || "Support Request";
}
