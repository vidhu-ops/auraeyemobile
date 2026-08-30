import { db } from "./db";
import { pageViews } from "../shared/schema";

export async function recordPageView(params: {
  path: string;
  referrer?: string | null;
  userId?: number | null;
  sessionId?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  const path = String(params.path || "/").slice(0, 500);
  if (path.startsWith("/api/") || path.includes(".")) return;

  try {
    await db.insert(pageViews).values({
      path,
      referrer: params.referrer?.slice(0, 500) || null,
      userId: params.userId ?? null,
      sessionId: params.sessionId?.slice(0, 128) || null,
      userAgent: params.userAgent?.slice(0, 500) || null,
    });
  } catch (error) {
    // Table may not exist on older DBs
    console.error("recordPageView failed:", error);
  }
}
