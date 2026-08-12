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
  Filter,
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
  UserPlus,
  Wallet,
  Sparkles,
  Lock,
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
import {
  CRM_MODULES,
  PHASE_LABELS,
  type CrmAccess,
  type CrmOverview,
  type CrmSection,
  type CrmUserRow,
} from "./types";
import QuickActionDialog from "./QuickActionDialog";
import { FileImportPanel } from "./FileImportPanel";

const PIE_COLORS = ["#6366f1", "#06b6d4", "#a855f7", "#f59e0b", "#94a3b8"];

function phaseBadge(phase: string) {
  const map: Record<string, string> = {
    new: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    active: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    "at-risk": "bg-amber-500/20 text-amber-300 border-amber-500/40",
    dormant: "bg-slate-500/20 text-slate-300 border-slate-500/40",
    churned: "bg-slate-500/20 text-slate-300 border-slate-500/40",
  };
  return map[phase] || "bg-slate-500/20 text-slate-300 border-slate-500/40";
}

function phaseLabel(phase: string, override?: string) {
  if (override) return override;
  if (phase === "churned") return PHASE_LABELS.dormant;
  return PHASE_LABELS[phase] || phase;
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

function timelineTone(type: string) {
  const map: Record<string, string> = {
    aura_scan: "border-l-indigo-400",
    vibe_check: "border-l-fuchsia-400",
    numerology: "border-l-amber-400",
    object_scan: "border-l-cyan-400",
    credit: "border-l-emerald-400",
    payment: "border-l-sky-400",
    journal: "border-l-rose-300",
    meditation: "border-l-violet-400",
    login: "border-l-slate-400",
  };
  return map[type] || "border-l-slate-500";
}

function roleLabel(role: string) {
  const map: Record<string, string> = {
    owner: "Owner · full access",
    viewer: "Viewer · read only",
    editor: "Editor · can edit",
    support: "Support · tickets",
  };
  return map[role] || role;
}

export default function AdminCrmApp() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [section, setSection] = useState<CrmSection>("dashboard");
  const [userQuery, setUserQuery] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [creditAmount, setCreditAmount] = useState("5");
  const [creditValidityDays, setCreditValidityDays] = useState("30");
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [userTypeFilter, setUserTypeFilter] = useState<"client" | "all">("client");
  const [selectedHealerId, setSelectedHealerId] = useState<number | null>(null);
  const [createForm, setCreateForm] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    mobileNumber: "",
    userType: "client",
    credits: "10",
    creditValidityDays: "30",
    specialty: "",
  });
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    userType: "client",
    isActive: true,
  });
  const [staffForm, setStaffForm] = useState({
    username: "",
    password: "",
    displayName: "",
    role: "viewer",
  });
  const [ticketForm, setTicketForm] = useState({ subject: "", body: "", priority: "normal" });
  const [ticketStatusFilter, setTicketStatusFilter] = useState("all");
  const [ticketChannelFilter, setTicketChannelFilter] = useState("all");
  const [leadForm, setLeadForm] = useState({ name: "", email: "", mobileNumber: "", stage: "new", notes: "" });
  const [contractForm, setContractForm] = useState({
    licenceStatus: "unknown",
    contractStatus: "unsigned",
    startDate: "",
    endDate: "",
    renewalDate: "",
    notes: "",
  });
  const [entityFilter, setEntityFilter] = useState("all");

  const crmAccess = ((user as any)?.crmAccess || null) as CrmAccess | null;
  const canUseCrm = !!crmAccess;

  const overviewQuery = useQuery<CrmOverview>({
    queryKey: ["/api/crm/overview"],
    enabled: canUseCrm,
  });

  const usersQuery = useQuery<{ users: CrmUserRow[] }>({
    queryKey: ["/api/crm/users", userQuery, phaseFilter, section === "users" ? "client" : userTypeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userQuery) params.set("q", userQuery);
      if (phaseFilter !== "all") params.set("phase", phaseFilter);
      // Users page = clients only; Direct Data can browse everyone
      if (section === "users") params.set("type", "client");
      else if (userTypeFilter !== "all") params.set("type", userTypeFilter);
      params.set("limit", "200");
      const res = await apiRequest("GET", `/api/crm/users?${params.toString()}`);
      return res.json();
    },
    enabled: canUseCrm && !!crmAccess?.canViewUsers && (section === "users" || section === "direct-data"),
  });

  const userTicketsQuery = useQuery<{ tickets: any[] }>({
    queryKey: ["/api/crm/tickets", "by-user", selectedUserId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/crm/tickets?userId=${selectedUserId}`);
      return res.json();
    },
    enabled: canUseCrm && !!crmAccess?.canManageTickets && !!selectedUserId && (section === "users" || section === "healers"),
  });

  const healerTicketsQuery = useQuery<{ tickets: any[] }>({
    queryKey: ["/api/crm/tickets", "booking", selectedHealerId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/crm/tickets?channel=booking`);
      return res.json();
    },
    enabled: canUseCrm && !!crmAccess?.canManageTickets && section === "healers",
  });

  const healersQuery = useQuery<{ healers: any[] }>({
    queryKey: ["/api/crm/healers"],
    enabled: canUseCrm && !!crmAccess?.canViewUsers && section === "healers",
  });

  const revenueQuery = useQuery<any>({
    queryKey: ["/api/crm/revenue", entityFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (entityFilter !== "all") params.set("entity", entityFilter);
      const res = await apiRequest("GET", `/api/crm/revenue?${params.toString()}`);
      return res.json();
    },
    enabled: canUseCrm && !!crmAccess?.canViewRevenue && section === "revenue",
  });

  const auditQuery = useQuery<{ logs: any[] }>({
    queryKey: ["/api/crm/audit-logs"],
    enabled: canUseCrm && !!crmAccess?.canViewAudit && (section === "audit" || section === "dashboard"),
  });

  const ticketsQuery = useQuery<{ tickets: any[] }>({
    queryKey: ["/api/crm/tickets", ticketStatusFilter, ticketChannelFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (ticketStatusFilter !== "all") params.set("status", ticketStatusFilter);
      if (ticketChannelFilter !== "all") params.set("channel", ticketChannelFilter);
      const res = await apiRequest("GET", `/api/crm/tickets?${params.toString()}`);
      return res.json();
    },
    enabled: canUseCrm && !!crmAccess?.canManageTickets && section === "tickets",
  });

  const staffQuery = useQuery<{ staff: any[]; roleDefaults: any }>({
    queryKey: ["/api/crm/staff"],
    enabled: canUseCrm && !!crmAccess?.canManageStaff && section === "staff",
  });

  const leadsQuery = useQuery<{ leads: any[] }>({
    queryKey: ["/api/crm/leads"],
    enabled: canUseCrm && !!crmAccess?.canViewUsers && section === "leads",
  });

  const profileQuery = useQuery<any>({
    queryKey: ["/api/crm/users", selectedUserId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/crm/users/${selectedUserId}`);
      return res.json();
    },
    enabled: canUseCrm && !!crmAccess?.canViewUsers && !!selectedUserId,
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
    if (profileQuery.data?.contract) {
      const c = profileQuery.data.contract;
      setContractForm({
        licenceStatus: c.licenceStatus || "unknown",
        contractStatus: c.contractStatus || "unsigned",
        startDate: c.startDate || "",
        endDate: c.endDate || "",
        renewalDate: c.renewalDate || "",
        notes: c.notes || "",
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
      const payload: Record<string, unknown> = {
        amount: creditAmount,
        operation,
        description: `CRM ${operation} via admin panel`,
      };
      if (operation === "add" || operation === "set") {
        payload.creditValidityDays =
          creditValidityDays === "never" || creditValidityDays === "" ? null : Number(creditValidityDays);
      }
      const res = await apiRequest("POST", `/api/crm/users/${selectedUserId}/credits`, payload);
      return res.json();
    },
    onSuccess: (data) => {
      const expiryNote = data.expiresAt
        ? ` · expire ${new Date(data.expiresAt).toLocaleDateString()}`
        : "";
      toast({ title: "Credits updated", description: `Balance is now ${data.creditsAfter}${expiryNote}` });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/users", selectedUserId] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/overview"] });
    },
    onError: (err: any) => toast({ title: "Credit update failed", description: err.message, variant: "destructive" }),
  });

  const createAccountMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/crm/users", {
        username: createForm.username.trim(),
        password: createForm.password,
        name: createForm.name || createForm.username,
        email: createForm.email || null,
        mobileNumber: createForm.mobileNumber || null,
        userType: createForm.userType,
        credits: Number(createForm.credits) || 0,
        creditValidityDays:
          createForm.creditValidityDays === "never" || createForm.creditValidityDays === ""
            ? null
            : Number(createForm.creditValidityDays),
        specialty: createForm.specialty || undefined,
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Account created", description: data.message });
      setCreateForm({
        username: "",
        password: "",
        name: "",
        email: "",
        mobileNumber: "",
        userType: "client",
        credits: "10",
        creditValidityDays: "30",
        specialty: "",
      });
      setShowCreateAccount(false);
      if (data.user?.id) setSelectedUserId(data.user.id);
      queryClient.invalidateQueries({ queryKey: ["/api/crm/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/healers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/overview"] });
    },
    onError: (err: any) => toast({ title: "Create failed", description: err.message, variant: "destructive" }),
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

  const createStaffMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/crm/staff", staffForm);
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Staff login created", description: data.message });
      setStaffForm({ username: "", password: "", displayName: "", role: "viewer" });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/staff"] });
    },
    onError: (err: any) => toast({ title: "Could not create staff", description: err.message, variant: "destructive" }),
  });

  const updateStaffMutation = useMutation({
    mutationFn: async ({ id, patch }: { id: number; patch: Record<string, unknown> }) => {
      const res = await apiRequest("PATCH", `/api/crm/staff/${id}`, patch);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Staff updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/staff"] });
    },
    onError: (err: any) => toast({ title: "Update failed", description: err.message, variant: "destructive" }),
  });

  const createTicketMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/crm/tickets", {
        ...ticketForm,
        userId: selectedUserId || undefined,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Ticket created" });
      setTicketForm({ subject: "", body: "", priority: "normal" });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/overview"] });
    },
    onError: (err: any) => toast({ title: "Ticket failed", description: err.message, variant: "destructive" }),
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/crm/tickets/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/overview"] });
    },
  });

  const createLeadMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/crm/leads", leadForm);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Lead added" });
      setLeadForm({ name: "", email: "", mobileNumber: "", stage: "new", notes: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/leads"] });
    },
    onError: (err: any) => toast({ title: "Lead failed", description: err.message, variant: "destructive" }),
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: number; stage: string }) => {
      const res = await apiRequest("PATCH", `/api/crm/leads/${id}`, { stage });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/crm/leads"] }),
  });

  const contractMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PUT", `/api/crm/healers/${selectedUserId}/contract`, contractForm);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Contract saved" });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/users", selectedUserId] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/healers"] });
    },
    onError: (err: any) => toast({ title: "Contract failed", description: err.message, variant: "destructive" }),
  });

  const nav = useMemo(() => {
    const items: { id: CrmSection; label: string; icon: any; show: boolean }[] = [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, show: true },
      { id: "direct-data", label: "Direct Data Control", icon: Database, show: !!crmAccess?.canViewUsers },
      { id: "users", label: "Users (clients)", icon: Users, show: !!crmAccess?.canViewUsers },
      { id: "healers", label: "Healers / Practitioners", icon: UserCog, show: !!crmAccess?.canViewUsers },
      { id: "revenue", label: "Revenue & Payments", icon: Wallet, show: !!crmAccess?.canViewRevenue },
      { id: "notifications", label: "Monthly Notifications", icon: Bell, show: !!crmAccess?.canViewUsers },
      { id: "tickets", label: "Support / Ticketing", icon: Ticket, show: !!crmAccess?.canManageTickets },
      { id: "leads", label: "Lead Pipeline", icon: Filter, show: !!crmAccess?.canViewUsers },
      { id: "analytics", label: "Analytics", icon: BarChart3, show: true },
      { id: "staff", label: "Staff & permissions", icon: UserPlus, show: !!crmAccess?.canManageStaff },
      { id: "audit", label: "Audit Log", icon: Shield, show: !!crmAccess?.canViewAudit },
      { id: "modules", label: "All Modules", icon: Sparkles, show: true },
    ];
    return items.filter((i) => i.show);
  }, [crmAccess]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b1220] flex items-center justify-center text-white">
        Please log in first.
      </div>
    );
  }

  if (!canUseCrm) {
    return (
      <div className="min-h-screen bg-[#0b1220] flex flex-col items-center justify-center gap-4 p-4">
        <ShieldAlert className="h-12 w-12 text-red-400" />
        <h1 className="text-white text-xl font-bold">Access Denied</h1>
        <p className="text-slate-400 text-center max-w-md">
          Only the owner admin or CRM staff accounts can open this panel. Ask an owner to create a staff login for you.
        </p>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    );
  }

  const kpis = overviewQuery.data?.kpis;
  const readOnlyBanner = !crmAccess?.canEditUsers && !crmAccess?.canEditCredits;

  return (
    <div className="min-h-screen bg-[#0b1220] text-slate-100 flex">
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
          <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-[0.18em] text-slate-500">Menu</p>
          {nav.map((item) => {
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
              <div className="text-xs text-slate-400">{roleLabel(crmAccess?.role || "viewer")}</div>
            </div>
            <button onClick={() => logoutMutation.mutate()} className="text-slate-400 hover:text-white" title="Log out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="border-b border-white/10 bg-[#0d1526]/80 backdrop-blur sticky top-0 z-20">
          <div className="px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center gap-3 justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold">
                Welcome back, {user.name || user.username}
              </h1>
              <p className="text-sm text-slate-400">
                {readOnlyBanner
                  ? "You have view-only access — ask an owner if you need edit rights."
                  : "Here’s what’s happening with AuraEye today."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {readOnlyBanner && (
                <div className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-200 inline-flex items-center gap-1">
                  <Lock className="h-3 w-3" /> View only
                </div>
              )}
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                AuraEye Solutions Ltd (GBP)
              </div>
              {crmAccess?.canEditUsers && (
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500" onClick={() => setQuickActionOpen(true)}>
                  + Quick Action
                </Button>
              )}
              {!crmAccess?.canEditUsers && crmAccess?.canManageTickets && (
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500" onClick={() => setQuickActionOpen(true)}>
                  + Quick Action
                </Button>
              )}
            </div>
          </div>

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
                  { label: "Needs attention", value: kpis?.atRiskUsers, icon: AlertTriangle, tone: "text-amber-300" },
                  {
                    label: "Inactive (long quiet)",
                    value: kpis?.dormantUsers ?? kpis?.churnedUsers,
                    icon: FileWarning,
                    tone: "text-slate-300",
                  },
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
                        <BarChart
                          data={[
                            { name: "Issued", value: overviewQuery.data?.credits.issued || 0 },
                            { name: "Redeemed", value: overviewQuery.data?.credits.redeemed || 0 },
                            { name: "Refunded", value: overviewQuery.data?.credits.refunded || 0 },
                          ]}
                        >
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
                    <CardTitle className="text-base">Feature usage</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { label: "Aura scans", value: overviewQuery.data?.featureUsage?.auraScans },
                      { label: "Vibe checks", value: overviewQuery.data?.featureUsage?.vibeChecks },
                      { label: "Numerology", value: overviewQuery.data?.featureUsage?.numerology },
                      { label: "Object scans", value: overviewQuery.data?.featureUsage?.objectScans },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2">
                        <span className="text-sm text-slate-300">{row.label}</span>
                        <span className="font-mono text-sm text-indigo-200">{(row.value ?? 0).toLocaleString()}</span>
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
                      Review queues
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
                        <span
                          className={`inline-flex items-center gap-1 text-xs ${
                            s.status === "healthy" ? "text-emerald-300" : "text-amber-300"
                          }`}
                        >
                          {s.status === "healthy" ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <AlertTriangle className="h-3.5 w-3.5" />
                          )}
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
                        <div className="font-medium">
                          {log.actorUsername} · {log.action}
                        </div>
                        <div className="text-xs text-slate-400">
                          {log.entityType} {log.entityId || ""} ·{" "}
                          {log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}
                        </div>
                      </div>
                    ))}
                    {crmAccess?.canViewAudit && (
                      <button className="text-xs text-indigo-300 hover:underline" onClick={() => setSection("audit")}>
                        View all activity logs →
                      </button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}


          {section === "users" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4">
                <h2 className="text-lg font-semibold flex items-center gap-2"><Users className="h-5 w-5 text-sky-300" /> Clients & members</h2>
                <p className="text-sm text-slate-400 mt-1">Journey phase, activity timeline, credits, and support tickets for each client. Editing lives in Direct Data Control.</p>
              </div>
              <div className="grid xl:grid-cols-5 gap-4">
                <Card className="bg-white/5 border-white/10 xl:col-span-3">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <CardTitle className="text-base">Client directory</CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <div className="relative">
                          <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-slate-500" />
                          <Input value={userQuery} onChange={(e) => setUserQuery(e.target.value)} placeholder="Search clients…" className="pl-8 bg-black/20 border-white/10 w-48" />
                        </div>
                        <select value={phaseFilter} onChange={(e) => setPhaseFilter(e.target.value)} className="rounded-md bg-black/20 border border-white/10 text-sm px-2">
                          <option value="all">All phases</option>
                          <option value="new">{PHASE_LABELS.new}</option>
                          <option value="active">{PHASE_LABELS.active}</option>
                          <option value="at-risk">{PHASE_LABELS["at-risk"]}</option>
                          <option value="dormant">{PHASE_LABELS.dormant}</option>
                        </select>
                        {crmAccess?.canExportData && (
                          <a href="/api/crm/users.csv"><Button size="sm" variant="outline" className="border-white/15"><Download className="h-4 w-4 mr-1" /> CSV</Button></a>
                        )}
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
                              <th className="pb-2 pr-3">Client</th>
                              <th className="pb-2 pr-3">Journey</th>
                              <th className="pb-2 pr-3">Credits</th>
                              <th className="pb-2">Last active</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(usersQuery.data?.users || []).map((u) => (
                              <tr key={u.id} onClick={() => setSelectedUserId(u.id)} className={`border-b border-white/5 hover:bg-white/5 cursor-pointer ${selectedUserId === u.id ? "bg-indigo-500/10" : ""}`}>
                                <td className="py-2.5 pr-3">
                                  <div className="font-medium">{u.name || u.username}</div>
                                  <div className="text-xs text-slate-400">{u.email || u.username}</div>
                                </td>
                                <td className="py-2.5 pr-3"><span className={`text-[11px] px-2 py-0.5 rounded-full border ${phaseBadge(u.phase)}`}>{phaseLabel(u.phase, u.phaseLabel)}</span></td>
                                <td className="py-2.5 pr-3 font-mono text-emerald-300">{u.credits}</td>
                                <td className="py-2.5 text-xs text-slate-400">{u.lastActivityAt ? new Date(u.lastActivityAt).toLocaleDateString() : "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 xl:col-span-2">
                  <CardHeader className="pb-2"><CardTitle className="text-base">Client profile & support</CardTitle></CardHeader>
                  <CardContent>
                    {!selectedUserId && <p className="text-sm text-slate-400">Select a client to see activity, credit grants, and their tickets.</p>}
                    {selectedUserId && profileQuery.isLoading && <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-indigo-300" /></div>}
                    {selectedUserId && profileQuery.data && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="text-lg font-semibold">{profileQuery.data.user.name || profileQuery.data.user.username}</div>
                            <div className="text-xs text-slate-400">Credits: {profileQuery.data.user.credits} · {profileQuery.data.user.email || "no email"}</div>
                          </div>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full border ${phaseBadge(profileQuery.data.user.phase)}`}>{phaseLabel(profileQuery.data.user.phase, profileQuery.data.user.phaseLabel)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="rounded-lg bg-black/20 p-2">Aura: {profileQuery.data.activity.auraReadings.length}</div>
                          <div className="rounded-lg bg-black/20 p-2">Vibe: {profileQuery.data.activity.vibeReadings.length}</div>
                          <div className="rounded-lg bg-black/20 p-2">Numerology: {profileQuery.data.activity.numerologyReadings.length}</div>
                          <div className="rounded-lg bg-black/20 p-2">Payments: {profileQuery.data.payments.length}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium mb-2 flex items-center gap-2"><Activity className="h-4 w-4 text-indigo-300" /> Activity</div>
                          <div className="max-h-48 overflow-y-auto space-y-2">
                            {(profileQuery.data.timeline || []).slice(0, 25).map((ev: any, idx: number) => (
                              <div key={`${ev.type}-${idx}`} className={`rounded-lg bg-black/20 border-l-2 pl-3 py-2 ${timelineTone(ev.type)}`}>
                                <div className="text-xs font-medium">{ev.title}</div>
                                <div className="text-[10px] text-slate-500">{ev.at ? new Date(ev.at).toLocaleString() : ""}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        {(profileQuery.data.creditGrants || []).length > 0 && (
                          <div className="rounded-xl border border-white/10 p-3 space-y-2">
                            <div className="text-sm font-medium">Credit expiry</div>
                            {(profileQuery.data.creditGrants || []).map((g: any) => (
                              <div key={g.id} className="text-xs flex justify-between gap-2 bg-black/20 rounded px-2 py-1.5">
                                <span>{g.remaining}/{g.amount} left</span>
                                <span className="text-slate-400">{g.expiresAt ? `expires ${new Date(g.expiresAt).toLocaleDateString()}` : "no expiry"}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {crmAccess?.canManageTickets && (
                          <div className="rounded-xl border border-white/10 p-3 space-y-2">
                            <div className="text-sm font-medium flex items-center gap-2"><Ticket className="h-4 w-4" /> Support tickets</div>
                            {(userTicketsQuery.data?.tickets || []).length === 0 && <p className="text-xs text-slate-400">No tickets for this client.</p>}
                            {(userTicketsQuery.data?.tickets || []).slice(0, 8).map((t: any) => (
                              <div key={t.id} className="text-xs rounded bg-black/20 p-2">
                                <div className="font-medium">{t.subject}</div>
                                <div className="text-slate-400">{t.status} · {t.channel} · {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : ""}</div>
                              </div>
                            ))}
                            <Button size="sm" variant="outline" className="w-full border-white/15" onClick={() => { setQuickActionOpen(true); }}>New ticket</Button>
                          </div>
                        )}
                        {crmAccess?.canEditUsers && (
                          <Button size="sm" variant="outline" className="w-full border-white/15" onClick={() => setSection("direct-data")}>Open in Direct Data Control</Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {section === "direct-data" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4">
                <h2 className="text-lg font-semibold flex items-center gap-2"><Database className="h-5 w-5 text-indigo-300" /> Direct Data Control</h2>
                <p className="text-sm text-slate-400 mt-1">Create accounts, import CSV/XLS, edit fields, adjust credits with expiry, and run GDPR tools — without SQL.</p>
              </div>
              <div className="grid xl:grid-cols-2 gap-4">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base flex items-center gap-2"><UserPlus className="h-4 w-4 text-emerald-300" /> Create account</CardTitle>
                      <Button size="sm" onClick={() => setQuickActionOpen(true)}>Quick Action</Button>
                    </div>
                  </CardHeader>
                  <CardContent className="grid sm:grid-cols-2 gap-2">
                    <Input value={createForm.username} onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })} placeholder="Username *" className="bg-black/20 border-white/10" />
                    <Input type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} placeholder="Password *" className="bg-black/20 border-white/10" />
                    <Input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} placeholder="Name" className="bg-black/20 border-white/10" />
                    <Input value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} placeholder="Email" className="bg-black/20 border-white/10" />
                    <select value={createForm.userType} onChange={(e) => setCreateForm({ ...createForm, userType: e.target.value })} className="rounded-md bg-black/20 border border-white/10 text-sm px-3 py-2">
                      <option value="client">User (client)</option>
                      <option value="healer">Healer</option>
                      <option value="semi-healer">Semi-healer</option>
                    </select>
                    <Input type="number" value={createForm.credits} onChange={(e) => setCreateForm({ ...createForm, credits: e.target.value })} placeholder="Credits" className="bg-black/20 border-white/10" />
                    <select value={createForm.creditValidityDays} onChange={(e) => setCreateForm({ ...createForm, creditValidityDays: e.target.value })} className="rounded-md bg-black/20 border border-white/10 text-sm px-3 py-2">
                      <option value="3">3 days</option>
                      <option value="30">1 month</option>
                      <option value="60">2 months</option>
                      <option value="90">3 months</option>
                      <option value="180">6 months</option>
                    </select>
                    <Button className="bg-indigo-600 hover:bg-indigo-500" disabled={!crmAccess?.canEditUsers || createAccountMutation.isPending} onClick={() => createAccountMutation.mutate()}>
                      {createAccountMutation.isPending ? "Creating…" : "Create"}
                    </Button>
                  </CardContent>
                </Card>
                <FileImportPanel target="users" disabled={!crmAccess?.canEditUsers} />
              </div>

              <div className="grid xl:grid-cols-5 gap-4">
                <Card className="bg-white/5 border-white/10 xl:col-span-3">
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <CardTitle className="text-base">Find any record to edit</CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Input value={userQuery} onChange={(e) => setUserQuery(e.target.value)} placeholder="Search…" className="bg-black/20 border-white/10 w-40" />
                        <select value={userTypeFilter} onChange={(e) => setUserTypeFilter(e.target.value as any)} className="rounded-md bg-black/20 border border-white/10 text-sm px-2">
                          <option value="all">All types</option>
                          <option value="client">Clients</option>
                        </select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto max-h-80">
                      <table className="w-full text-sm">
                        <thead><tr className="text-left text-slate-400 border-b border-white/10"><th className="pb-2">User</th><th className="pb-2">Type</th><th className="pb-2">Credits</th></tr></thead>
                        <tbody>
                          {(usersQuery.data?.users || []).map((u) => (
                            <tr key={u.id} onClick={() => setSelectedUserId(u.id)} className={`border-b border-white/5 hover:bg-white/5 cursor-pointer ${selectedUserId === u.id ? "bg-indigo-500/10" : ""}`}>
                              <td className="py-2"><div className="font-medium">{u.name || u.username}</div><div className="text-xs text-slate-400">{u.email || ""}</div></td>
                              <td className="py-2">{u.userType}</td>
                              <td className="py-2 font-mono text-emerald-300">{u.credits}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 xl:col-span-2">
                  <CardHeader className="pb-2"><CardTitle className="text-base">Edit record</CardTitle></CardHeader>
                  <CardContent>
                    {!selectedUserId && <p className="text-sm text-slate-400">Select a record to edit fields, credits, contracts, or erase.</p>}
                    {selectedUserId && profileQuery.data && (
                      <div className="space-y-3">
                        <div className="text-sm font-semibold">{profileQuery.data.user.name || profileQuery.data.user.username} <span className="text-slate-400">#{selectedUserId}</span></div>
                        {crmAccess?.canEditUsers ? (
                          <div className="space-y-2">
                            <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Name" className="bg-black/20 border-white/10" />
                            <Input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} placeholder="Email" className="bg-black/20 border-white/10" />
                            <Input value={editForm.mobileNumber} onChange={(e) => setEditForm({ ...editForm, mobileNumber: e.target.value })} placeholder="Mobile" className="bg-black/20 border-white/10" />
                            <select value={editForm.userType} onChange={(e) => setEditForm({ ...editForm, userType: e.target.value })} className="w-full rounded-md bg-black/20 border border-white/10 text-sm px-3 py-2">
                              <option value="client">client</option>
                              <option value="healer">healer</option>
                              <option value="semi-healer">semi-healer</option>
                            </select>
                            <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={editForm.isActive} onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })} /> Active</label>
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-500" onClick={() => updateUserMutation.mutate()}>Save changes</Button>
                          </div>
                        ) : <p className="text-xs text-slate-400">View only</p>}
                        {crmAccess?.canEditCredits && (
                          <div className="rounded-xl border border-white/10 p-3 space-y-2">
                            <div className="text-sm font-medium">Credits + expiry</div>
                            <Input value={creditAmount} onChange={(e) => setCreditAmount(e.target.value)} className="bg-black/20 border-white/10" />
                            <select value={creditValidityDays} onChange={(e) => setCreditValidityDays(e.target.value)} className="w-full rounded-md bg-black/20 border border-white/10 text-sm px-3 py-2">
                              <option value="3">3 days</option>
                              <option value="30">1 month</option>
                              <option value="60">2 months</option>
                              <option value="90">3 months</option>
                              <option value="180">6 months</option>
                            </select>
                            <div className="grid grid-cols-3 gap-2">
                              <Button size="sm" variant="outline" onClick={() => creditMutation.mutate("add")}>Add</Button>
                              <Button size="sm" variant="outline" onClick={() => creditMutation.mutate("subtract")}>Subtract</Button>
                              <Button size="sm" variant="outline" onClick={() => creditMutation.mutate("set")}>Set</Button>
                            </div>
                          </div>
                        )}
                        {(profileQuery.data.user.userType === "healer" || profileQuery.data.user.userType === "semi-healer") && crmAccess?.canManageHealers && (
                          <div className="rounded-xl border border-white/10 p-3 space-y-2">
                            <div className="text-sm font-medium">Licence & contract</div>
                            <select value={contractForm.licenceStatus} onChange={(e) => setContractForm({ ...contractForm, licenceStatus: e.target.value })} className="w-full rounded-md bg-black/20 border border-white/10 text-sm px-3 py-2">
                              <option value="unknown">Licence: unknown</option>
                              <option value="valid">Licence: valid</option>
                              <option value="expired">Licence: expired</option>
                              <option value="pending">Licence: pending</option>
                            </select>
                            <select value={contractForm.contractStatus} onChange={(e) => setContractForm({ ...contractForm, contractStatus: e.target.value })} className="w-full rounded-md bg-black/20 border border-white/10 text-sm px-3 py-2">
                              <option value="unsigned">Contract: unsigned</option>
                              <option value="signed">Contract: signed</option>
                              <option value="expired">Contract: expired</option>
                            </select>
                            <Button size="sm" className="w-full" onClick={() => contractMutation.mutate()}>Save contract</Button>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          {crmAccess?.canExportData && <a href={`/api/crm/users/${selectedUserId}/export`} target="_blank" rel="noreferrer"><Button variant="outline" className="w-full border-white/15"><Download className="h-4 w-4 mr-1" /> Export</Button></a>}
                          {crmAccess?.canEraseUsers && <Button variant="destructive" className="w-full" onClick={() => { if (confirm("Erase PII and deactivate?")) eraseMutation.mutate(); }}><Trash2 className="h-4 w-4 mr-1" /> Erase</Button>}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}


          {section === "healers" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/5 p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2"><UserCog className="h-5 w-5 text-fuchsia-300" /> Healers / Practitioners</h2>
                  <p className="text-sm text-slate-400 mt-1">Sessions, credits, licence/contract status, and booking-related support tickets.</p>
                </div>
                {crmAccess?.canEditUsers && (
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500" onClick={() => setQuickActionOpen(true)}>Add healer</Button>
                )}
              </div>
              <div className="grid xl:grid-cols-5 gap-4">
                <Card className="bg-white/5 border-white/10 xl:col-span-3">
                  <CardHeader><CardTitle className="text-base">Practitioner directory</CardTitle></CardHeader>
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
                              <tr key={h.id} className={`border-b border-white/5 hover:bg-white/5 cursor-pointer ${selectedHealerId === h.id ? "bg-fuchsia-500/10" : ""}`}
                                onClick={() => { setSelectedHealerId(h.id); setSelectedUserId(h.id); }}>
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
                  </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 xl:col-span-2">
                  <CardHeader><CardTitle className="text-base">Practitioner detail</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {!selectedHealerId && <p className="text-sm text-slate-400">Select a practitioner to manage contract and see booking tickets.</p>}
                    {selectedHealerId && profileQuery.data && (
                      <>
                        <div className="text-lg font-semibold">{profileQuery.data.user.name || profileQuery.data.user.username}</div>
                        <div className="text-xs text-slate-400">Credits {profileQuery.data.user.credits} · Sessions {profileQuery.data.user.healerSessionCount || 0}</div>
                        {crmAccess?.canManageHealers && (
                          <div className="rounded-xl border border-white/10 p-3 space-y-2">
                            <div className="text-sm font-medium">Licence & contract</div>
                            <select value={contractForm.licenceStatus} onChange={(e) => setContractForm({ ...contractForm, licenceStatus: e.target.value })} className="w-full rounded-md bg-black/20 border border-white/10 text-sm px-3 py-2">
                              <option value="unknown">Licence: unknown</option>
                              <option value="valid">Licence: valid</option>
                              <option value="expired">Licence: expired</option>
                              <option value="pending">Licence: pending</option>
                            </select>
                            <select value={contractForm.contractStatus} onChange={(e) => setContractForm({ ...contractForm, contractStatus: e.target.value })} className="w-full rounded-md bg-black/20 border border-white/10 text-sm px-3 py-2">
                              <option value="unsigned">Contract: unsigned</option>
                              <option value="signed">Contract: signed</option>
                              <option value="expired">Contract: expired</option>
                            </select>
                            <Input value={contractForm.notes} onChange={(e) => setContractForm({ ...contractForm, notes: e.target.value })} placeholder="Notes" className="bg-black/20 border-white/10" />
                            <Button size="sm" className="w-full" onClick={() => contractMutation.mutate()}>Save contract</Button>
                          </div>
                        )}
                        {crmAccess?.canManageTickets && (
                          <div className="rounded-xl border border-white/10 p-3 space-y-2">
                            <div className="text-sm font-medium flex items-center gap-2"><Ticket className="h-4 w-4" /> Booking / support tickets</div>
                            {(healerTicketsQuery.data?.tickets || []).filter((t: any) => String(t.metadata || "").includes(String(selectedHealerId)) || t.userId === selectedHealerId).slice(0, 8).map((t: any) => (
                              <div key={t.id} className="text-xs rounded bg-black/20 p-2">
                                <div className="font-medium">{t.subject}</div>
                                <div className="text-slate-400">{t.status} · {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : ""}</div>
                              </div>
                            ))}
                            {(healerTicketsQuery.data?.tickets || []).length === 0 && <p className="text-xs text-slate-400">No booking tickets yet.</p>}
                            <Button size="sm" variant="outline" className="w-full border-white/15" onClick={() => setSection("tickets")}>Open full inbox</Button>
                          </div>
                        )}
                        {crmAccess?.canEditUsers && (
                          <Button size="sm" variant="outline" className="w-full border-white/15" onClick={() => setSection("direct-data")}>Edit in Direct Data</Button>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}


          {section === "revenue" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <h2 className="text-lg font-semibold flex items-center gap-2"><Wallet className="h-5 w-5 text-emerald-300" /> Revenue, credits & refunds</h2>
                <p className="text-sm text-slate-400 mt-1">Payments, credit expiry log, and refund history in one place.</p>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-slate-400">Entity:</span>
                {["all", "gbp", "inr"].map((e) => (
                  <button key={e} onClick={() => setEntityFilter(e)} className={`rounded-full px-3 py-1 text-xs border ${entityFilter === e ? "bg-indigo-500/20 border-indigo-400/40" : "border-white/10"}`}>
                    {e === "all" ? "All" : e.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
                {[
                  { label: "Completed revenue", value: `£${(revenueQuery.data?.summary?.totalRevenue || 0).toLocaleString()}`, tone: "text-emerald-300" },
                  { label: "Refunds", value: `£${(revenueQuery.data?.summary?.totalRefunds || 0).toLocaleString()}`, tone: "text-rose-300" },
                  { label: "Credits expired", value: (revenueQuery.data?.summary?.expiredCredits || 0).toLocaleString(), tone: "text-amber-300" },
                  { label: "Grants expiring ≤14d", value: (revenueQuery.data?.summary?.expiringSoonCount || 0).toLocaleString(), tone: "text-sky-300" },
                ].map((c) => (
                  <Card key={c.label} className="bg-white/5 border-white/10"><CardContent className="p-4"><div className="text-xs text-slate-400 mb-1">{c.label}</div><div className={`text-xl font-semibold ${c.tone}`}>{c.value}</div></CardContent></Card>
                ))}
              </div>
              <div className="grid xl:grid-cols-2 gap-4">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader><CardTitle className="text-base">Refund log</CardTitle></CardHeader>
                  <CardContent className="space-y-2 max-h-72 overflow-y-auto">
                    {(revenueQuery.data?.refundLog || []).length === 0 && <p className="text-sm text-slate-400">No refunds recorded yet.</p>}
                    {(revenueQuery.data?.refundLog || []).slice(0, 40).map((r: any, i: number) => (
                      <div key={`${r.kind}-${r.id}-${i}`} className="text-xs rounded-lg bg-black/20 p-2 flex justify-between gap-2">
                        <div>
                          <div className="font-medium">{r.kind === "payment_refund" ? "Payment refund" : "Credit refund"}</div>
                          <div className="text-slate-400">User #{r.userId}{r.username ? ` · @${r.username}` : ""} · {r.description || ""}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-rose-300">{typeof r.amount === "number" ? r.amount : r.amount}</div>
                          <div className="text-slate-500">{r.at ? new Date(r.at).toLocaleDateString() : ""}</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10">
                  <CardHeader><CardTitle className="text-base">Credit expiry log</CardTitle></CardHeader>
                  <CardContent className="space-y-2 max-h-72 overflow-y-auto">
                    {(revenueQuery.data?.expiryLog || []).length === 0 && <p className="text-sm text-slate-400">No expiries yet. Expiring grants appear below.</p>}
                    {(revenueQuery.data?.expiryLog || []).slice(0, 40).map((r: any, i: number) => (
                      <div key={`exp-${r.id}-${i}`} className="text-xs rounded-lg bg-black/20 p-2 flex justify-between gap-2">
                        <div>
                          <div className="font-medium">Expired credits</div>
                          <div className="text-slate-400">@{r.username || r.userId} · {r.description || ""}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-amber-300">-{r.amount}</div>
                          <div className="text-slate-500">{r.at ? new Date(r.at).toLocaleDateString() : ""}</div>
                        </div>
                      </div>
                    ))}
                    {(revenueQuery.data?.expiringSoon || []).length > 0 && (
                      <div className="pt-2 border-t border-white/10 space-y-2">
                        <div className="text-sm font-medium text-sky-200">Expiring soon</div>
                        {(revenueQuery.data?.expiringSoon || []).map((g: any) => (
                          <div key={g.id} className="text-xs rounded-lg bg-sky-500/10 p-2 flex justify-between">
                            <span>User #{g.userId} · {g.remaining} left</span>
                            <span>{g.expiresAt ? new Date(g.expiresAt).toLocaleDateString() : ""}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              <Card className="bg-white/5 border-white/10">
                <CardHeader><CardTitle className="text-base">Recent payments</CardTitle></CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-slate-400 border-b border-white/10"><th className="pb-2">User</th><th className="pb-2">Amount</th><th className="pb-2">Status</th><th className="pb-2">When</th></tr></thead>
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
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4 text-amber-300" /> Monthly Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-3">
                {(overviewQuery.data?.monthlyNotifications || []).map((n) => (
                  <div key={n.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-sm font-semibold mb-1">{n.title}</div>
                    <p className="text-xs text-slate-400 mb-3">{n.detail}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/15"
                      onClick={() => {
                        const map: Record<string, string> = {
                          inactive: "at-risk",
                          churned: "dormant",
                          dormant: "dormant",
                          new: "new",
                          "at-risk": "at-risk",
                        };
                        setPhaseFilter(map[n.id] || "all");
                        setSection("users");
                      }}
                    >
                      Review users
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {section === "tickets" && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-slate-400">Status:</span>
                {["all", "open", "in_progress", "resolved", "closed"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setTicketStatusFilter(s)}
                    className={`rounded-full px-3 py-1 text-xs border ${
                      ticketStatusFilter === s ? "bg-indigo-500/20 border-indigo-400/40" : "border-white/10"
                    }`}
                  >
                    {s === "in_progress" ? "In progress" : s}
                  </button>
                ))}
                <span className="text-sm text-slate-400 ml-2">Source:</span>
                {["all", "contact", "help", "feedback", "booking", "crm"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setTicketChannelFilter(c)}
                    className={`rounded-full px-3 py-1 text-xs border ${
                      ticketChannelFilter === c ? "bg-indigo-500/20 border-indigo-400/40" : "border-white/10"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400">
                Inbox includes contact-form messages, Help tickets, product feedback, healer booking messages, and manually created tickets.
              </p>
            <div className="grid xl:grid-cols-3 gap-4">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-base">New ticket</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Input
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    placeholder="Subject"
                    className="bg-black/20 border-white/10"
                  />
                  <textarea
                    value={ticketForm.body}
                    onChange={(e) => setTicketForm({ ...ticketForm, body: e.target.value })}
                    placeholder="What happened?"
                    className="w-full min-h-[100px] rounded-md bg-black/20 border border-white/10 text-sm px-3 py-2"
                  />
                  <select
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                    className="w-full rounded-md bg-black/20 border border-white/10 text-sm px-3 py-2"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  <p className="text-[11px] text-slate-500">
                    {selectedUserId ? `Linked to selected user #${selectedUserId}` : "Optional: select a user first to link"}
                  </p>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-500" onClick={() => createTicketMutation.mutate()}>
                    Create ticket
                  </Button>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10 xl:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">
                    Support inbox ({(ticketsQuery.data?.tickets || []).length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {ticketsQuery.isLoading && (
                    <div className="py-8 flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-indigo-300" />
                    </div>
                  )}
                  {(ticketsQuery.data?.tickets || []).length === 0 && !ticketsQuery.isLoading && (
                    <p className="text-sm text-slate-400">
                      No tickets yet. Contact form, Help → Submit a Ticket, feedback, and healer bookings will appear here.
                    </p>
                  )}
                  {(ticketsQuery.data?.tickets || []).map((t: any) => (
                    <div key={t.id} className="rounded-xl border border-white/10 p-3 text-sm flex flex-wrap gap-3 justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium">{t.subject}</div>
                        <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-2 items-center">
                          <span className="rounded-full bg-white/10 px-2 py-0.5">{t.channel || "crm"}</span>
                          <span>{t.status}</span>
                          <span>{t.priority}</span>
                          {t.category && <span>{t.category}</span>}
                          {t.requesterName || t.requesterEmail ? (
                            <span>
                              {t.requesterName || ""}
                              {t.requesterEmail ? ` · ${t.requesterEmail}` : ""}
                            </span>
                          ) : null}
                          {t.username ? <span>@{t.username}</span> : t.userId ? <span>user #{t.userId}</span> : null}
                          <span>{t.createdAt ? new Date(t.createdAt).toLocaleString() : ""}</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-2 whitespace-pre-wrap">{t.body}</p>
                      </div>
                      <div className="flex gap-2 items-start shrink-0">
                        {t.status === "open" && (
                          <Button size="sm" variant="outline" onClick={() => updateTicketMutation.mutate({ id: t.id, status: "in_progress" })}>
                            Start
                          </Button>
                        )}
                        {t.status !== "resolved" && t.status !== "closed" && (
                          <Button size="sm" variant="outline" onClick={() => updateTicketMutation.mutate({ id: t.id, status: "resolved" })}>
                            Resolve
                          </Button>
                        )}
                        {t.userId && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUserId(t.userId);
                              setSection("users");
                            }}
                          >
                            User
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            </div>
          )}

          {section === "leads" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4">
                <h2 className="text-lg font-semibold">Lead Pipeline</h2>
                <p className="text-sm text-slate-400 mt-1">Add leads manually or upload CSV/XLS. Track from first contact to onboarded.</p>
              </div>
              <FileImportPanel target="leads" disabled={!crmAccess?.canEditUsers} />
            <div className="grid xl:grid-cols-3 gap-4">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-base">Add lead</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {!crmAccess?.canEditUsers && (
                    <p className="text-xs text-amber-200">Your role can view leads but not create them.</p>
                  )}
                  <Input
                    value={leadForm.name}
                    onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                    placeholder="Name"
                    className="bg-black/20 border-white/10"
                    disabled={!crmAccess?.canEditUsers}
                  />
                  <Input
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    placeholder="Email"
                    className="bg-black/20 border-white/10"
                    disabled={!crmAccess?.canEditUsers}
                  />
                  <Input
                    value={leadForm.mobileNumber}
                    onChange={(e) => setLeadForm({ ...leadForm, mobileNumber: e.target.value })}
                    placeholder="Mobile"
                    className="bg-black/20 border-white/10"
                    disabled={!crmAccess?.canEditUsers}
                  />
                  <textarea
                    value={leadForm.notes}
                    onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                    placeholder="Notes"
                    className="w-full min-h-[80px] rounded-md bg-black/20 border border-white/10 text-sm px-3 py-2"
                    disabled={!crmAccess?.canEditUsers}
                  />
                  {crmAccess?.canEditUsers && (
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-500" onClick={() => createLeadMutation.mutate()}>
                      Save lead
                    </Button>
                  )}
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10 xl:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Pipeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(leadsQuery.data?.leads || []).map((l: any) => (
                    <div key={l.id} className="rounded-xl border border-white/10 p-3 flex flex-wrap gap-3 justify-between text-sm">
                      <div>
                        <div className="font-medium">{l.name}</div>
                        <div className="text-xs text-slate-400">
                          {l.email || "no email"} · {l.mobileNumber || "no mobile"}
                        </div>
                        {l.notes && <p className="text-xs text-slate-300 mt-1">{l.notes}</p>}
                      </div>
                      <select
                        value={l.stage}
                        disabled={!crmAccess?.canEditUsers}
                        onChange={(e) => updateLeadMutation.mutate({ id: l.id, stage: e.target.value })}
                        className="rounded-md bg-black/20 border border-white/10 text-xs px-2 h-8"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="onboarded">Onboarded</option>
                        <option value="lost">Lost</option>
                      </select>
                    </div>
                  ))}
                  {(leadsQuery.data?.leads || []).length === 0 && (
                    <p className="text-sm text-slate-400">No leads yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>
            </div>
          )}

          {section === "analytics" && (
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                { label: "Aura scans", value: overviewQuery.data?.featureUsage?.auraScans },
                { label: "Vibe checks", value: overviewQuery.data?.featureUsage?.vibeChecks },
                { label: "Numerology reads", value: overviewQuery.data?.featureUsage?.numerology },
                { label: "Object scans", value: overviewQuery.data?.featureUsage?.objectScans },
                { label: "Credits issued", value: overviewQuery.data?.credits.issued },
                { label: "Credits redeemed", value: overviewQuery.data?.credits.redeemed },
                { label: "Open tickets", value: kpis?.openTickets },
                { label: "Active healers", value: kpis?.activeHealers },
              ].map((card) => (
                <Card key={card.label} className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="text-xs text-slate-400 mb-2">{card.label}</div>
                    <div className="text-2xl font-semibold">{(card.value ?? 0).toLocaleString()}</div>
                  </CardContent>
                </Card>
              ))}
              <Card className="bg-white/5 border-white/10 md:col-span-2 xl:col-span-4">
                <CardHeader>
                  <CardTitle className="text-base">Journey mix</CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-4 gap-3">
                  {Object.entries(overviewQuery.data?.phases || {}).map(([key, value]) => (
                    <div key={key} className="rounded-xl bg-black/20 p-3">
                      <div className="text-xs text-slate-400 mb-1">{phaseLabel(key)}</div>
                      <div className="text-xl font-semibold">{(value as number).toLocaleString()}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {section === "staff" && (
            <div className="grid xl:grid-cols-3 gap-4">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-teal-300" /> Add staff login
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-slate-400">
                    Create a username and password that can open <code>/admin</code>. Choose Viewer for look-only access,
                    Editor for day-to-day edits, or Support for tickets.
                  </p>
                  <Input
                    value={staffForm.username}
                    onChange={(e) => setStaffForm({ ...staffForm, username: e.target.value })}
                    placeholder="Username"
                    className="bg-black/20 border-white/10"
                  />
                  <Input
                    type="password"
                    value={staffForm.password}
                    onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                    placeholder="Password (min 6)"
                    className="bg-black/20 border-white/10"
                  />
                  <Input
                    value={staffForm.displayName}
                    onChange={(e) => setStaffForm({ ...staffForm, displayName: e.target.value })}
                    placeholder="Display name (optional)"
                    className="bg-black/20 border-white/10"
                  />
                  <select
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                    className="w-full rounded-md bg-black/20 border border-white/10 text-sm px-3 py-2"
                  >
                    <option value="viewer">Viewer — can only view</option>
                    <option value="editor">Editor — view + edit users/credits</option>
                    <option value="support">Support — tickets + view users</option>
                    <option value="owner">Owner — full access</option>
                  </select>
                  <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-500"
                    disabled={createStaffMutation.isPending}
                    onClick={() => createStaffMutation.mutate()}
                  >
                    Create login
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 xl:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Staff accounts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(staffQuery.data?.staff || []).length === 0 && (
                    <p className="text-sm text-slate-400">No staff yet. Create a viewer login on the left.</p>
                  )}
                  {(staffQuery.data?.staff || []).map((s: any) => (
                    <div key={s.id} className="rounded-xl border border-white/10 p-3 flex flex-wrap gap-3 justify-between items-center">
                      <div>
                        <div className="font-medium text-sm">
                          {s.displayName || s.name || s.username}{" "}
                          <span className="text-slate-400 font-normal">@{s.username}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {roleLabel(s.role)} · {s.isActive === false ? "disabled" : "active"}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {s.canEditUsers && <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10">edit users</span>}
                          {s.canEditCredits && <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10">credits</span>}
                          {s.canManageTickets && <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10">tickets</span>}
                          {s.canViewRevenue && <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10">revenue</span>}
                          {!s.canEditUsers && !s.canEditCredits && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-100">view only</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <select
                          value={s.role}
                          onChange={(e) => updateStaffMutation.mutate({ id: s.id, patch: { role: e.target.value } })}
                          className="rounded-md bg-black/20 border border-white/10 text-xs px-2 h-8"
                        >
                          <option value="viewer">viewer</option>
                          <option value="editor">editor</option>
                          <option value="support">support</option>
                          <option value="owner">owner</option>
                        </select>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateStaffMutation.mutate({
                              id: s.id,
                              patch: { isActive: s.isActive === false },
                            })
                          }
                        >
                          {s.isActive === false ? "Enable" : "Disable"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {section === "audit" && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-rose-300" /> Audit Log
                </CardTitle>
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
                        <td className="py-2 text-slate-400">
                          {log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}
                        </td>
                        <td className="py-2">{log.actorUsername}</td>
                        <td className="py-2">{log.action}</td>
                        <td className="py-2">
                          {log.entityType} {log.entityId || ""}
                        </td>
                        <td className="py-2 text-slate-400">{log.note || "—"}</td>
                        <td className="py-2">
                          {crmAccess?.canEditUsers &&
                            log.action === "update" &&
                            log.entityType === "user" &&
                            log.previousValue && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-white/15"
                                onClick={() => rollbackMutation.mutate(log.id)}
                              >
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
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-blue-400" /> Phase 1
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-purple-400" /> Phase 2
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-teal-400" /> Phase 3
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-rose-400" /> Addition
                  </span>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {CRM_MODULES.map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => {
                      if (mod.id === "gdpr" || mod.id === "rollback") {
                        setSection(mod.id === "rollback" ? "audit" : "users");
                        return;
                      }
                      if (
                        [
                          "direct-data",
                          "users",
                          "healers",
                          "revenue",
                          "notifications",
                          "tickets",
                          "leads",
                          "staff",
                          "analytics",
                          "audit",
                        ].includes(mod.id)
                      ) {
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
          <div>AuraEye Admin CRM · v1.2.0 · Distinct pages + imports</div>
        </footer>
      </div>

      <QuickActionDialog
        open={quickActionOpen}
        onClose={() => setQuickActionOpen(false)}
        canEditUsers={!!crmAccess?.canEditUsers}
        canEditCredits={!!crmAccess?.canEditCredits}
        canManageTickets={!!crmAccess?.canManageTickets}
        selectedUserId={selectedUserId}
      />
    </div>
  );
}
