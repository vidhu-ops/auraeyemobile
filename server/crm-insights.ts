import { desc, gte, sql } from "drizzle-orm";
import { db } from "./db";
import { creditTransactions, users } from "../shared/schema";

function daysAgo(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

export async function getDailyActivityReport(days = 14) {
  const since = daysAgo(days - 1);

  const [
    newUsersByDay,
    loginsByDay,
    auraByDay,
    vibeByDay,
    numerologyByDay,
    objectsByDay,
    creditByDay,
    paymentsByDay,
    ticketsByDay,
    viewsByDay,
  ] = await Promise.all([
    db.execute(sql`
      SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day, count(*)::int AS count
      FROM users WHERE created_at >= ${since}
      GROUP BY 1 ORDER BY 1 DESC
    `),
    db
      .execute(sql`
        SELECT to_char(date_trunc('day', login_date), 'YYYY-MM-DD') AS day, count(*)::int AS count
        FROM login_sessions WHERE login_date >= ${since}
        GROUP BY 1 ORDER BY 1 DESC
      `)
      .catch(() => ({ rows: [] })),
    db.execute(sql`
      SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day, count(*)::int AS count
      FROM aura_readings WHERE created_at >= ${since}
      GROUP BY 1 ORDER BY 1 DESC
    `),
    db.execute(sql`
      SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day, count(*)::int AS count
      FROM vibe_readings WHERE created_at >= ${since}
      GROUP BY 1 ORDER BY 1 DESC
    `),
    db.execute(sql`
      SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day, count(*)::int AS count
      FROM numerology_readings WHERE created_at >= ${since}
      GROUP BY 1 ORDER BY 1 DESC
    `),
    db.execute(sql`
      SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day, count(*)::int AS count
      FROM object_analyses WHERE created_at >= ${since}
      GROUP BY 1 ORDER BY 1 DESC
    `),
    db.execute(sql`
      SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day, count(*)::int AS count
      FROM credit_transactions WHERE created_at >= ${since}
      GROUP BY 1 ORDER BY 1 DESC
    `),
    db.execute(sql`
      SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day, count(*)::int AS count
      FROM payment_transactions WHERE created_at >= ${since} AND status = 'completed'
      GROUP BY 1 ORDER BY 1 DESC
    `),
    db
      .execute(sql`
        SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day, count(*)::int AS count
        FROM support_tickets WHERE created_at >= ${since}
        GROUP BY 1 ORDER BY 1 DESC
      `)
      .catch(() => ({ rows: [] })),
    db
      .execute(sql`
        SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day, count(*)::int AS count
        FROM page_views WHERE created_at >= ${since}
        GROUP BY 1 ORDER BY 1 DESC
      `)
      .catch(() => ({ rows: [] })),
  ]);

  const toMap = (rows: any[]) => {
    const m: Record<string, number> = {};
    for (const r of rows) m[String(r.day)] = Number(r.count) || 0;
    return m;
  };

  const maps = {
    newUsers: toMap(newUsersByDay.rows as any[]),
    logins: toMap(loginsByDay.rows as any[]),
    auraScans: toMap(auraByDay.rows as any[]),
    vibeChecks: toMap(vibeByDay.rows as any[]),
    numerology: toMap(numerologyByDay.rows as any[]),
    objectScans: toMap(objectsByDay.rows as any[]),
    creditEvents: toMap(creditByDay.rows as any[]),
    payments: toMap(paymentsByDay.rows as any[]),
    tickets: toMap(ticketsByDay.rows as any[]),
    pageViews: toMap(viewsByDay.rows as any[]),
  };

  const allDays = new Set<string>();
  Object.values(maps).forEach((m) => Object.keys(m).forEach((d) => allDays.add(d)));
  const sortedDays = [...allDays].sort().reverse().slice(0, days);

  const daily = sortedDays.map((day) => ({
    day,
    newUsers: maps.newUsers[day] || 0,
    logins: maps.logins[day] || 0,
    auraScans: maps.auraScans[day] || 0,
    vibeChecks: maps.vibeChecks[day] || 0,
    numerology: maps.numerology[day] || 0,
    objectScans: maps.objectScans[day] || 0,
    creditEvents: maps.creditEvents[day] || 0,
    payments: maps.payments[day] || 0,
    tickets: maps.tickets[day] || 0,
    pageViews: maps.pageViews[day] || 0,
  }));

  const recentCredit = await db
    .select()
    .from(creditTransactions)
    .where(gte(creditTransactions.createdAt, since))
    .orderBy(desc(creditTransactions.createdAt))
    .limit(40);

  return { days: daily, recentCreditEvents: recentCredit };
}

export async function getWebsiteAnalytics(days = 7) {
  const since = daysAgo(days - 1);

  let topPages: { path: string; views: number }[] = [];
  let totalViews = 0;
  let uniqueVisitors = 0;

  try {
    const totals = await db.execute(sql`
      SELECT
        count(*)::int AS total_views,
        count(DISTINCT coalesce(session_id, user_agent, id::text))::int AS unique_visitors
      FROM page_views WHERE created_at >= ${since}
    `);
    const row = (totals.rows[0] as any) || {};
    totalViews = Number(row.total_views) || 0;
    uniqueVisitors = Number(row.unique_visitors) || 0;

    const pages = await db.execute(sql`
      SELECT path, count(*)::int AS views
      FROM page_views WHERE created_at >= ${since}
      GROUP BY path ORDER BY views DESC LIMIT 20
    `);
    topPages = (pages.rows as any[]).map((r) => ({ path: r.path, views: Number(r.views) || 0 }));
  } catch {
    // page_views table missing
  }

  const [userCount] = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(users);
  const todayStart = daysAgo(0);
  const [newToday] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(users)
    .where(gte(users.createdAt, todayStart));

  return {
    periodDays: days,
    totalViews,
    uniqueVisitors,
    topPages,
    totalRegisteredUsers: userCount?.count || 0,
    newUsersToday: newToday?.count || 0,
  };
}
