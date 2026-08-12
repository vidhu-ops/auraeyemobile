import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  CheckCircle2,
  CreditCard,
  Database,
  Download,
  Eye,
  FileWarning,
  HeartPulse,
  LayoutDashboard,
  Loader2,
  LogOut,
  Search,
  Shield,
  ShieldAlert,
  Ticket,
  Trash2,
  Users,
  UserCog,
  Wallet,
  Sparkles,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CRM_MODULES, type CrmOverview, type CrmSection, type CrmUserRow } from "./types";

const PIE_COLORS = ["#6366f1", "#06b6d4", "#a855f7", "#f59e0b", "#94a3b8"];

function phaseBadge(phase: string) {
  const map: Record<string, string> = {
    new: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    active: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    "at-risk": "bg-amber-500/20 text-amber-300 border-amber-500/40",
    churned: "bg-rose-500/20 text-rose-300 border-rose-500/40",
  };
  return map[phase] || "bg-slate-500/20 text-slate-300 border-slate-500/40";
}

function moduleTone(color: string) {
  const map: Record<string, string> = {
    blue: "border-blue-500/30 bg-blue-500/10",
    purple: "border-purple-500/30 bg-purple-500/10",
    teal: "border-teal-500/30 bg-teal-500/10",
    rose: "border-rose-500/30 bg-rose-500/10",
  };
  return map[color] || map.blue;
}

export default function AdminCrmApp() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [section, setSection] = useState<CrmSection>("dashboard");
  const [userQuery, setUserQuery] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [creditAmount, setCreditAmount] = useState("5");
  const [editForm, setEditForm] = useState({ name: "", email: "", mobileNumber: "", userType: "client", isActive: true });

  const isAdmin = user?.username === "admin" || (user as any)?.userType === "admin";

  const overviewQuery = useQuery<CrmOverview>({
    queryKey: ["/api/crm/overview"],
    enabled: !!isAdmin,
  });

  const usersQuery = useQuery<{ users: CrmUserRow[] }>({
    queryKey: ["/api/crm/users", userQuery, phaseFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userQuery) params.set("q", userQuery);
      if (phaseFilter !== "all") params.set("phase", phaseFilter);
      params.set("limit", "200");
      const res = await apiRequest("GET", `/api/crm/users?${params.toString()}`);
      return res.json();
    },
    enabled: !!isAdmin && (section === "users" || section === "direct-data" || section === "dashboard"),
  });

  const healersQuery = useQuery<{ healers: any[] }>({
    queryKey: ["/api/crm/healers"],
    enabled: !!isAdmin && section === "healers",
  });

  const revenueQuery = useQuery<any>({
    queryKey: ["/api/crm/revenue"],
    enabled: !!isAdmin && section === "revenue",
  });

  const auditQuery = useQuery<{ logs: any[] }>({
    queryKey: ["/api/crm/audit-logs"],
    enabled: !!isAdmin && (section === "audit" || section === "dashboard"),
  });

  const ticketsQuery = useQuery<{ tickets: any[] }>({
    queryKey: ["/api/crm/tickets"],
    enabled: !!isAdmin && section === "tickets",
  });

  const profileQuery = useQuery<any>({
    queryKey: ["/api/crm/users", selectedUserId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/crm/users/${selectedUserId}`);
      return res.json();
    },
    enabled: !!isAdmin && !!selectedUserId,
  });

  useEffect(() => {
    if (profileQuery.data?.user) {
      const u = profileQuery.data.user;
      setEditForm({
        name: u.name || "",
        email: u.email || "",
        mobileNumber: u.mobileNumber || "",
        userType: u.userType || "client",
        isActive: u.isActive !== false,
      });
    }
  }, [profileQuery.data]);

  const updateUserMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/crm/users/${selectedUserId}`, editForm);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Saved", description: "User updated and audit-logged." });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/users", selectedUserId] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/audit-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/overview"] });
    },
    onError: (err: any) => toast({ title: "Update failed", description: err.message, variant: "destructive" }),
  });

  const creditMutation = useMutation({
    mutationFn: async (operation: "add" | "subtract" | "set") => {
      const res = await apiRequest("POST", `/api/crm/users/${selectedUserId}/credits`, {
        amount: creditAmount,
        operation,
        description: `CRM ${operation} via admin panel`,
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Credits updated", description: `Balance is now ${data.creditsAfter}` });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/users", selectedUserId] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/overview"] });
    },
    onError: (err: any) => toast({ title: "Credit update failed", description: err.message, variant: "destructive" }),
  });

  const eraseMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/crm/users/${selectedUserId}/erase`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Erasure complete", description: "PII scrubbed and account deactivated." });
      setSelectedUserId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/crm/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/overview"] });
    },
    onError: (err: any) => toast({ title: "Erasure failed", description: err.message, variant: "destructive" }),
  });

  const rollbackMutation = useMutation({
    mutationFn: async (logId: number) => {
      const res = await apiRequest("POST", `/api/crm/audit-logs/${logId}/rollback`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Rolled back", description: "Previous snapshot restored." });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/audit-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/users"] });
    },
    onError: (err: any) => toast({ title: "Rollback failed", description: err.message, variant: "destructive" }),
  });

  const nav = useMemo(
    () => [
      { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
      { id: "direct-data" as const, label: "Direct Data Control", icon: Database },
      { id: "users" as const, label: "Users", icon: Users },
      { id: "healers" as const, label: "Healers / Practitioners", icon: UserCog },
      { id: "revenue" as const, label: "Revenue & Payments", icon: Wallet },
      { id: "notifications" as const, label: "Monthly Notifications", icon: Bell },
      { id: "tickets" as const, label: "Support / Ticketing", icon: Ticket },
      { id: "audit" as const, label: "Audit Log", icon: Shield },
      { id: "modules" as const, label: "All Modules", icon: Sparkles },
    ],
    []
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b1220] flex items-center justify-center text-white">
        Please log in first.
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0b1220] flex flex-col items-center justify-center gap-4 p-4">
        <ShieldAlert className="h-12 w-12 text-red-400" />
        <h1 className="text-white text-xl font-bold">Access Denied</h1>
        <p className="text-slate-400 text-center">Only the admin account can use AuraEye Admin CRM.</p>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    );
  }

  const kpis = overviewQuery.data?.kpis;

  return (
    <div className="min-h-screen bg-[#0b1220] text-slate-100 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-white/10 bg-[#0d1526] shrink-0">
        <div className="px-5 py-5 border-b border-white/10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center">
            <Eye className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-semibold tracking-tight">AuraEye ADMIN CRM</div>
            <div className="text-xs text-slate-400">Operational backbone</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-[0.18em] text-slate-500">Core · Phase 1</p>
          {nav.slice(0, 6).map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  active ? "bg-indigo-500/20 text-white border border-indigo-400/30" : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
          <p className="px-3 pt-4 pb-1 text-[10px] uppercase tracking-[0.18em] text-slate-500">Additional</p>
          {nav.slice(6).map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  active ? "bg-indigo-500/20 text-white border border-indigo-400/30" : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-indigo-500/30 flex items-center justify-center text-sm font-semibold">
              {(user.name || user.username || "A").slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{user.name || user.username}</div>
              <div className="text-xs text-slate-400">Super Admin</div>
            </div>
            <button
              onClick={() => logoutMutation.mutate()}
              className="text-slate-400 hover:text-white"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="border-b border-white/10 bg-[#0d1526]/80 backdrop-blur sticky top-0 z-20">
          <div className="px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center gap-3 justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold">
                Welcome back, {user.name || user.username} 👋
              </h1>
              <p className="text-sm text-slate-400">Here&apos;s what&apos;s happening with AuraEye today.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                AuraEye Solutions Ltd (GBP)
              </div>
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500"
                onClick={() => setSection("direct-data")}
              >
                + Quick Action
              </Button>
            </div>
          </div>

          {/* Mobile nav */}
          <div className="lg:hidden flex gap-2 overflow-x-auto px-4 pb-3">
            {nav.map((item) => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs border ${
                  section === item.id ? "bg-indigo-500/20 border-indigo-400/40 text-white" : "border-white/10 text-slate-300"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {section === "dashboard" && (
            <>
              <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
                {[
                  { label: "Total Users", value: kpis?.totalUsers, icon: Users, tone: "text-sky-300" },
                  { label: "Active Users", value: kpis?.activeUsers, icon: Activity, tone: "text-emerald-300" },
                  { label: "At-Risk Users", value: kpis?.atRiskUsers, icon: AlertTriangle, tone: "text-amber-300" },
                  { label: "Churned Users", value: kpis?.churnedUsers, icon: FileWarning, tone: "text-rose-300" },
                  { label: "Healers / Practitioners", value: kpis?.healers, icon: HeartPulse, tone: "text-fuchsia-300" },
                ].map((card) => {
                  const Icon = card.icon;
                  return (
                    <Card key={card.label} className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-slate-400">{card.label}</span>
                          <Icon className={`h-4 w-4 ${card.tone}`} />
                        </div>
                        <div className="text-2xl font-semibold">
                          {overviewQuery.isLoading ? "…" : (card.value ?? 0).toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="grid xl:grid-cols-3 gap-4">
                <Card className="bg-white/5 border-white/10 xl:col-span-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-indigo-300" /> Revenue Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold mb-1">
                      £{(kpis?.mrr ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <p className="text-xs text-slate-400 mb-4">Completed payments · last 30 days</p>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { name: "Issued", value: overviewQuery.data?.credits.issued || 0 },
                          { name: "Redeemed", value: overviewQuery.data?.credits.redeemed || 0 },
                          { name: "Refunded", value: overviewQuery.data?.credits.refunded || 0 },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff14" />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                          <YAxis stroke="#94a3b8" fontSize={11} />
                          <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                          <Bar dataKey="value" fill="#818cf8" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Revenue by Source</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={overviewQuery.data?.revenueBySource || []}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={45}
                            outerRadius={70}
                            paddingAngle={3}
                          >
                            {(overviewQuery.data?.revenueBySource || []).map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-1 text-xs text-slate-300">
                      {(overviewQuery.data?.revenueBySource || []).map((s) => (
                        <div key={s.name} className="flex justify-between">
                          <span>{s.name}</span>
                          <span>{s.value}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Credits Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { label: "Issued", value: overviewQuery.data?.credits.issued, color: "text-emerald-300" },
                      { label: "Redeemed", value: overviewQuery.data?.credits.redeemed, color: "text-sky-300" },
                      { label: "Expired", value: overviewQuery.data?.credits.expired, color: "text-amber-300" },
                      { label: "Refunded", value: overviewQuery.data?.credits.refunded, color: "text-rose-300" },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2">
                        <span className="text-sm text-slate-300">{row.label}</span>
                        <span className={`font-mono text-sm ${row.color}`}>{(row.value ?? 0).toLocaleString()}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="grid xl:grid-cols-3 gap-4">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Monthly Notifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(overviewQuery.data?.monthlyNotifications || []).map((n) => (
                      <div key={n.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-medium text-sm">{n.title}</div>
                          <span className="text-[10px] uppercase tracking-wide rounded-full bg-indigo-500/20 text-indigo-200 px-2 py-0.5">
                            {n.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{n.detail}</p>
                      </div>
                    ))}
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-500" onClick={() => setSection("notifications")}>
                      Send Monthly Summary
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">System Health</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(overviewQuery.data?.systemHealth || []).map((s) => (
                      <div key={s.name} className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2 text-sm">
                        <span>{s.name}</span>
                        <span className={`inline-flex items-center gap-1 text-xs ${s.status === "healthy" ? "text-emerald-300" : "text-amber-300"}`}>
                          {s.status === "healthy" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                          {s.status}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(overviewQuery.data?.recentActivity || []).length === 0 && (
                      <p className="text-sm text-slate-400">No CRM edits yet. Changes will appear here.</p>
                    )}
                    {(overviewQuery.data?.recentActivity || []).map((log: any) => (
                      <div key={log.id} className="text-sm border-b border-white/5 pb-2">
                        <div className="font-medium">{log.actorUsername} · {log.action}</div>
                        <div className="text-xs text-slate-400">
                          {log.entityType} {log.entityId || ""} · {log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}
                        </div>
                      </div>
                    ))}
                    <button className="text-xs text-indigo-300 hover:underline" onClick={() => setSection("audit")}>
                      View all activity logs →
                    </button>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {(section === "users" || section === "direct-data") && (
            <div className="grid xl:grid-cols-5 gap-4">
              <Card className="bg-white/5 border-white/10 xl:col-span-3">
                <CardHeader className="pb-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-sky-300" />
                      {section === "direct-data" ? "Direct Data Control" : "Users"}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <div className="relative">
                        <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-slate-500" />
                        <Input
                          value={userQuery}
                          onChange={(e) => setUserQuery(e.target.value)}
                          placeholder="Search users…"
                          className="pl-8 bg-black/20 border-white/10 w-48"
                        />
                      </div>
                      <select
                        value={phaseFilter}
                        onChange={(e) => setPhaseFilter(e.target.value)}
                        className="rounded-md bg-black/20 border border-white/10 text-sm px-2"
                      >
                        <option value="all">All phases</option>
                        <option value="new">New</option>
                        <option value="active">Active</option>
                        <option value="at-risk">At-risk</option>
                        <option value="churned">Churned</option>
                      </select>
                      <a href="/api/crm/users.csv">
                        <Button size="sm" variant="outline" className="border-white/15">
                          <Download className="h-4 w-4 mr-1" /> CSV
                        </Button>
                      </a>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {usersQuery.isLoading ? (
                    <div className="py-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-indigo-300" /></div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-slate-400 border-b border-white/10">
                            <th className="pb-2 pr-3">User</th>
                            <th className="pb-2 pr-3">Type</th>
                            <th className="pb-2 pr-3">Phase</th>
                            <th className="pb-2 pr-3">Credits</th>
                            <th className="pb-2">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(usersQuery.data?.users || []).map((u) => (
                            <tr
                              key={u.id}
                              onClick={() => {
                                setSelectedUserId(u.id);
                              }}
                              className={`border-b border-white/5 hover:bg-white/5 cursor-pointer ${selectedUserId === u.id ? "bg-indigo-500/10" : ""}`}
                            >
                              <td className="py-2.5 pr-3">
                                <div className="font-medium">{u.name || u.username}</div>
                                <div className="text-xs text-slate-400">{u.email || u.username}</div>
                              </td>
                              <td className="py-2.5 pr-3 text-slate-300">{u.userType}</td>
                              <td className="py-2.5 pr-3">
                                <span className={`text-[11px] px-2 py-0.5 rounded-full border ${phaseBadge(u.phase)}`}>{u.phase}</span>
                              </td>
                              <td className="py-2.5 pr-3 font-mono text-emerald-300">{u.credits}</td>
                              <td className="py-2.5">{u.isActive ? "Active" : "Inactive"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 xl:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Complete User Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  {!selectedUserId && <p className="text-sm text-slate-400">Select a user to view history, edit fields, adjust credits, or export/erase.</p>}
                  {selectedUserId && profileQuery.isLoading && (
                    <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-indigo-300" /></div>
                  )}
                  {selectedUserId && profileQuery.data && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-lg font-semibold">{profileQuery.data.user.name || profileQuery.data.user.username}</div>
                          <div className="text-xs text-slate-400">
                            Phase: <span className="text-indigo-200">{profileQuery.data.user.phase}</span> · Credits: {profileQuery.data.user.credits}
                          </div>
                        </div>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full border ${phaseBadge(profileQuery.data.user.phase)}`}>
                          {profileQuery.data.user.phase}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg bg-black/20 p-2">Aura: {profileQuery.data.activity.auraReadings.length}</div>
                        <div className="rounded-lg bg-black/20 p-2">Vibe: {profileQuery.data.activity.vibeReadings.length}</div>
                        <div className="rounded-lg bg-black/20 p-2">Numerology: {profileQuery.data.activity.numerologyReadings.length}</div>
                        <div className="rounded-lg bg-black/20 p-2">Payments: {profileQuery.data.payments.length}</div>
                      </div>

                      <div className="space-y-2">
                        <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Name" className="bg-black/20 border-white/10" />
                        <Input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} placeholder="Email" className="bg-black/20 border-white/10" />
                        <Input value={editForm.mobileNumber} onChange={(e) => setEditForm({ ...editForm, mobileNumber: e.target.value })} placeholder="Mobile" className="bg-black/20 border-white/10" />
                        <select
                          value={editForm.userType}
                          onChange={(e) => setEditForm({ ...editForm, userType: e.target.value })}
                          className="w-full rounded-md bg-black/20 border border-white/10 text-sm px-3 py-2"
                        >
                          <option value="client">client</option>
                          <option value="healer">healer</option>
                          <option value="semi-healer">semi-healer</option>
                        </select>
                        <label className="flex items-center gap-2 text-sm text-slate-300">
                          <input
                            type="checkbox"
                            checked={editForm.isActive}
                            onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                          />
                          Active account
                        </label>
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-500" disabled={updateUserMutation.isPending} onClick={() => updateUserMutation.mutate()}>
                          Save changes
                        </Button>
                      </div>

                      <div className="rounded-xl border border-white/10 p-3 space-y-2">
                        <div className="text-sm font-medium flex items-center gap-2"><CreditCard className="h-4 w-4" /> Credits</div>
                        <Input value={creditAmount} onChange={(e) => setCreditAmount(e.target.value)} className="bg-black/20 border-white/10" />
                        <div className="grid grid-cols-3 gap-2">
                          <Button size="sm" variant="outline" onClick={() => creditMutation.mutate("add")}>Add</Button>
                          <Button size="sm" variant="outline" onClick={() => creditMutation.mutate("subtract")}>Subtract</Button>
                          <Button size="sm" variant="outline" onClick={() => creditMutation.mutate("set")}>Set</Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <a href={`/api/crm/users/${selectedUserId}/export`} target="_blank" rel="noreferrer">
                          <Button variant="outline" className="w-full border-white/15"><Download className="h-4 w-4 mr-1" /> GDPR Export</Button>
                        </a>
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={() => {
                            if (confirm("Erase PII and deactivate this user?")) eraseMutation.mutate();
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Erase
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {section === "healers" && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><UserCog className="h-4 w-4 text-fuchsia-300" /> Healer / Practitioner Management</CardTitle>
              </CardHeader>
              <CardContent>
                {healersQuery.isLoading ? (
                  <div className="py-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-indigo-300" /></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-slate-400 border-b border-white/10">
                          <th className="pb-2 pr-3">Healer</th>
                          <th className="pb-2 pr-3">Type</th>
                          <th className="pb-2 pr-3">Credits</th>
                          <th className="pb-2 pr-3">Sessions</th>
                          <th className="pb-2 pr-3">Licence</th>
                          <th className="pb-2">Contract</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(healersQuery.data?.healers || []).map((h: any) => (
                          <tr key={h.id} className="border-b border-white/5 hover:bg-white/5 cursor-pointer" onClick={() => { setSelectedUserId(h.id); setSection("users"); }}>
                            <td className="py-2.5 pr-3">
                              <div className="font-medium">{h.name || h.username}</div>
                              <div className="text-xs text-slate-400">{h.email || "—"}</div>
                            </td>
                            <td className="py-2.5 pr-3">{h.userType}</td>
                            <td className="py-2.5 pr-3 font-mono text-emerald-300">{h.credits}</td>
                            <td className="py-2.5 pr-3">{h.healerSessionCount}</td>
                            <td className="py-2.5 pr-3">{h.contract?.licenceStatus || "unknown"}</td>
                            <td className="py-2.5">{h.contract?.contractStatus || "unsigned"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-4">Open a healer to edit profile/credits. Contract fields are available via API <code>/api/crm/healers/:id/contract</code>.</p>
              </CardContent>
            </Card>
          )}

          {section === "revenue" && (
            <div className="grid xl:grid-cols-3 gap-4">
              <Card className="bg-white/5 border-white/10">
                <CardHeader><CardTitle className="text-base">Revenue summary</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Completed revenue</span><span className="font-mono">£{(revenueQuery.data?.summary?.totalRevenue || 0).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Refunds</span><span className="font-mono text-rose-300">£{(revenueQuery.data?.summary?.totalRefunds || 0).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Completed txns</span><span>{revenueQuery.data?.summary?.completedCount || 0}</span></div>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10 xl:col-span-2">
                <CardHeader><CardTitle className="text-base">Recent payments</CardTitle></CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-400 border-b border-white/10">
                        <th className="pb-2">User</th>
                        <th className="pb-2">Amount</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(revenueQuery.data?.payments || []).slice(0, 30).map((p: any) => (
                        <tr key={p.id} className="border-b border-white/5">
                          <td className="py-2">{p.userId}</td>
                          <td className="py-2 font-mono">£{((p.amount || 0) / 100).toFixed(2)}</td>
                          <td className="py-2">{p.status}</td>
                          <td className="py-2 text-slate-400">{p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}

          {section === "notifications" && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4 text-amber-300" /> Monthly Notifications</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-3">
                {(overviewQuery.data?.monthlyNotifications || []).map((n) => (
                  <div key={n.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-sm font-semibold mb-1">{n.title}</div>
                    <p className="text-xs text-slate-400 mb-3">{n.detail}</p>
                    <Button size="sm" variant="outline" className="border-white/15" onClick={() => { setPhaseFilter(n.id === "inactive" ? "at-risk" : n.id === "churned" ? "churned" : "new"); setSection("users"); }}>
                      Review users
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {section === "tickets" && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-base">Support / Ticketing (Phase 2 scaffold)</CardTitle>
              </CardHeader>
              <CardContent>
                {(ticketsQuery.data?.tickets || []).length === 0 ? (
                  <p className="text-sm text-slate-400">No tickets yet. Create via <code>POST /api/crm/tickets</code>.</p>
                ) : (
                  <div className="space-y-2">
                    {ticketsQuery.data?.tickets.map((t: any) => (
                      <div key={t.id} className="rounded-xl border border-white/10 p-3 text-sm">
                        <div className="font-medium">{t.subject}</div>
                        <div className="text-xs text-slate-400">{t.status} · {t.priority}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {section === "audit" && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4 text-rose-300" /> Audit Log</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 border-b border-white/10">
                      <th className="pb-2">When</th>
                      <th className="pb-2">Actor</th>
                      <th className="pb-2">Action</th>
                      <th className="pb-2">Entity</th>
                      <th className="pb-2">Note</th>
                      <th className="pb-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(auditQuery.data?.logs || []).map((log: any) => (
                      <tr key={log.id} className="border-b border-white/5">
                        <td className="py-2 text-slate-400">{log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}</td>
                        <td className="py-2">{log.actorUsername}</td>
                        <td className="py-2">{log.action}</td>
                        <td className="py-2">{log.entityType} {log.entityId || ""}</td>
                        <td className="py-2 text-slate-400">{log.note || "—"}</td>
                        <td className="py-2">
                          {log.action === "update" && log.entityType === "user" && log.previousValue && (
                            <Button size="sm" variant="outline" className="border-white/15" onClick={() => rollbackMutation.mutate(log.id)}>
                              Rollback
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {section === "modules" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">All Modules</h2>
                <div className="flex gap-3 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-400" /> Phase 1</span>
                  <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-purple-400" /> Phase 2</span>
                  <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-teal-400" /> Phase 3</span>
                  <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-400" /> Addition</span>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {CRM_MODULES.map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => {
                      if ((mod as any).soon) {
                        toast({ title: "Coming soon", description: `${mod.title} is scoped for a later phase.` });
                        return;
                      }
                      if (mod.id === "gdpr" || mod.id === "contracts" || mod.id === "rollback") {
                        setSection(mod.id === "rollback" ? "audit" : "users");
                        return;
                      }
                      if (["direct-data", "users", "healers", "revenue", "notifications", "tickets", "audit"].includes(mod.id)) {
                        setSection(mod.id as CrmSection);
                      }
                    }}
                    className={`text-left rounded-2xl border p-4 transition hover:scale-[1.01] ${moduleTone(mod.color)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-sm">{mod.title}</div>
                      <span className="text-[10px] uppercase tracking-wide opacity-80">
                        {mod.phase === "A" ? "Addition" : `Phase ${mod.phase}`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300/90">{mod.description}</p>
                    {(mod as any).soon && <p className="text-[11px] text-amber-200 mt-2">Scaffold only</p>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>

        <footer className="border-t border-white/10 px-4 md:px-6 py-3 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-4">
            <span>Active Healers: {kpis?.activeHealers ?? "—"}</span>
            <span>Open Tickets: {kpis?.openTickets ?? 0}</span>
            <span>MRR (30d): £{(kpis?.mrr ?? 0).toLocaleString()}</span>
          </div>
          <div>AuraEye Admin CRM · v1.0.0 · Built for conscious businesses</div>
        </footer>
      </div>
    </div>
  );
}
