import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, Globe, TrendingUp, Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpTip } from "./HelpTip";
import { crm } from "./theme";
import type { CrmAccess } from "./types";

type DailyRow = {
  day: string;
  newUsers: number;
  logins: number;
  auraScans: number;
  vibeChecks: number;
  numerology: number;
  objectScans: number;
  creditEvents: number;
  payments: number;
  tickets: number;
  pageViews: number;
};

type DailyReport = {
  days: DailyRow[];
  recentCreditEvents: any[];
};

type WebsiteAnalytics = {
  periodDays: number;
  totalViews: number;
  uniqueVisitors: number;
  topPages: { path: string; views: number }[];
  totalRegisteredUsers: number;
  newUsersToday: number;
};

export default function InsightsWorkspace({ crmAccess }: { crmAccess: CrmAccess }) {
  const [periodDays, setPeriodDays] = useState(14);

  const dailyQuery = useQuery<DailyReport>({
    queryKey: ["/api/crm/insights/daily", periodDays],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/crm/insights/daily?days=${periodDays}`);
      return res.json();
    },
    enabled: !!crmAccess.canViewUsers,
  });

  const websiteQuery = useQuery<WebsiteAnalytics>({
    queryKey: ["/api/crm/insights/website", periodDays],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/crm/insights/website?days=${Math.min(periodDays, 30)}`);
      return res.json();
    },
    enabled: !!crmAccess.canViewUsers,
  });

  const today = dailyQuery.data?.days?.[0];
  const totals = (dailyQuery.data?.days || []).reduce(
    (acc, row) => ({
      newUsers: acc.newUsers + row.newUsers,
      logins: acc.logins + row.logins,
      pageViews: acc.pageViews + row.pageViews,
      payments: acc.payments + row.payments,
    }),
    { newUsers: 0, logins: 0, pageViews: 0, payments: 0 }
  );

  return (
    <div className="space-y-4">
      <HelpTip>
        <strong>Daily digest.</strong> See what happened on the site each day — sign-ups, logins, scans, payments, and
        page visits. Use the period buttons to change the date range.
      </HelpTip>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-slate-500">Show last:</span>
        {[7, 14, 30].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setPeriodDays(d)}
            className={`rounded-full px-3 py-1 text-xs border ${
              periodDays === d ? crm.pillActive : crm.pillInactive
            }`}
          >
            {d} days
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Registered users",
            value: websiteQuery.data?.totalRegisteredUsers ?? "…",
            icon: Users,
            tone: "text-sky-600",
          },
          {
            label: "New today",
            value: websiteQuery.data?.newUsersToday ?? "…",
            icon: TrendingUp,
            tone: "text-emerald-600",
          },
          {
            label: `Page views (${periodDays}d)`,
            value: websiteQuery.data?.totalViews ?? totals.pageViews,
            icon: Globe,
            tone: "text-indigo-600",
          },
          {
            label: `Visitors (${periodDays}d)`,
            value: websiteQuery.data?.uniqueVisitors ?? "…",
            icon: Activity,
            tone: "text-fuchsia-600",
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className={crm.card}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">{card.label}</span>
                  <Icon className={`h-4 w-4 ${card.tone}`} />
                </div>
                <div className="text-2xl font-semibold text-slate-900">
                  {typeof card.value === "number" ? card.value.toLocaleString() : card.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {today && (
        <Card className={crm.card}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Today ({today.day})</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
            {[
              { label: "New sign-ups", value: today.newUsers },
              { label: "Logins", value: today.logins },
              { label: "Page views", value: today.pageViews },
              { label: "Payments", value: today.payments },
              { label: "Aura scans", value: today.auraScans },
              { label: "Vibe checks", value: today.vibeChecks },
              { label: "Support tickets", value: today.tickets },
              { label: "Credit events", value: today.creditEvents },
            ].map((row) => (
              <div key={row.label} className="rounded-lg bg-slate-50 px-3 py-2">
                <div className="text-xs text-slate-500">{row.label}</div>
                <div className="text-lg font-semibold">{row.value}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid xl:grid-cols-2 gap-4">
        <Card className={crm.card}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Daily activity log</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className={crm.tableHead}>
                  <th className="pb-2 pr-2">Date</th>
                  <th className="pb-2 pr-2">Users</th>
                  <th className="pb-2 pr-2">Logins</th>
                  <th className="pb-2 pr-2">Views</th>
                  <th className="pb-2 pr-2">Scans</th>
                  <th className="pb-2 pr-2">Pay</th>
                  <th className="pb-2">Tickets</th>
                </tr>
              </thead>
              <tbody>
                {(dailyQuery.data?.days || []).map((row) => (
                  <tr key={row.day} className="border-b border-slate-100">
                    <td className="py-2 pr-2 font-medium">{row.day}</td>
                    <td className="py-2 pr-2">{row.newUsers}</td>
                    <td className="py-2 pr-2">{row.logins}</td>
                    <td className="py-2 pr-2">{row.pageViews}</td>
                    <td className="py-2 pr-2">
                      {row.auraScans + row.vibeChecks + row.numerology + row.objectScans}
                    </td>
                    <td className="py-2 pr-2">{row.payments}</td>
                    <td className="py-2">{row.tickets}</td>
                  </tr>
                ))}
                {!dailyQuery.data?.days?.length && (
                  <tr>
                    <td colSpan={7} className="py-4 text-slate-500 text-center">
                      {dailyQuery.isLoading ? "Loading…" : "No activity recorded yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className={crm.card}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top pages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-80 overflow-y-auto">
            {(websiteQuery.data?.topPages || []).length === 0 && (
              <p className="text-sm text-slate-500">
                Page visit data will appear here once visitors browse the site.
              </p>
            )}
            {(websiteQuery.data?.topPages || []).map((p) => (
              <div key={p.path} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="truncate pr-2 font-mono text-xs">{p.path}</span>
                <span className="font-semibold shrink-0">{p.views}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className={crm.card}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent credit events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-64 overflow-y-auto">
          {(dailyQuery.data?.recentCreditEvents || []).slice(0, 20).map((ev: any) => (
            <div key={ev.id} className="text-xs rounded-lg bg-slate-50 p-2 flex justify-between gap-2">
              <div>
                <span className="font-medium">@{ev.username || ev.userId}</span>{" "}
                <span className="text-slate-500">{ev.transactionType}</span>
                <div className="text-slate-400">{ev.description}</div>
              </div>
              <div className="text-right shrink-0">
                <div className={ev.amount >= 0 ? "text-emerald-600" : "text-rose-600"}>
                  {ev.amount >= 0 ? "+" : ""}
                  {ev.amount}
                </div>
                <div className="text-slate-400">
                  {ev.createdAt ? new Date(ev.createdAt).toLocaleString() : ""}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
