export type CrmSection = "home" | "people" | "money" | "inbox" | "team" | "audit";

export type CrmAccess = {
  role: string;
  canViewUsers: boolean;
  canEditUsers: boolean;
  canEditCredits: boolean;
  canViewRevenue: boolean;
  canManageHealers: boolean;
  canManageTickets: boolean;
  canManageStaff: boolean;
  canExportData: boolean;
  canEraseUsers: boolean;
  canViewAudit: boolean;
};

export interface CrmOverview {
  phaseLabels?: Record<string, string>;
  kpis: {
    totalUsers: number;
    activeUsers: number;
    atRiskUsers: number;
    dormantUsers?: number;
    churnedUsers?: number;
    healers: number;
    activeHealers: number;
    mrr: number;
    openTickets: number;
  };
  phases: Record<string, number>;
  credits: { issued: number; redeemed: number; expired: number; refunded: number };
  featureUsage?: { auraScans: number; vibeChecks: number; numerology: number; objectScans: number };
  revenueBySource: { name: string; value: number }[];
  recentActivity: any[];
  systemHealth: { name: string; status: string }[];
  monthlyNotifications: { id: string; title: string; detail: string; badge: string }[];
}

export interface CrmUserRow {
  id: number;
  username: string;
  name: string | null;
  email: string | null;
  mobileNumber?: string | null;
  userType: string;
  credits: number;
  soulEnergy?: number;
  isActive: boolean;
  phase: string;
  phaseLabel?: string;
  lastActivityAt?: string;
  createdAt?: string;
}

export const PHASE_LABELS: Record<string, string> = {
  new: "New",
  active: "Active",
  "at-risk": "Needs attention",
  dormant: "Inactive — long quiet",
};

/** Line-by-line checklist from ADMIN_CRM.md spec */
export const CRM_CHECKLIST: { id: string; label: string; done: boolean }[] = [
  { id: "kpi", label: "Dashboard KPIs (users, active, attention, inactive, healers, revenue, credits)", done: true },
  { id: "direct", label: "Direct edit user fields + credits with expiry (add/subtract/set)", done: true },
  { id: "create", label: "Create user/healer accounts with credits + validity period", done: true },
  { id: "expiry", label: "Credit grants expire automatically", done: true },
  { id: "timeline", label: "Full activity timeline (aura, vibe, numerology, objects, journals, meditations, logins, payments, credits)", done: true },
  { id: "healers", label: "Healer list + licence/contract editor", done: true },
  { id: "revenue", label: "Revenue & payments (GBP/INR filter + refund log + expiry log)", done: true },
  { id: "notify", label: "Monthly notifications queue from journey phases", done: true },
  { id: "search", label: "Search / filter + CSV export", done: true },
  { id: "audit", label: "Audit log + rollback for user edits", done: true },
  { id: "gdpr", label: "GDPR export + erasure (PII scrub + deactivate)", done: true },
  { id: "health", label: "Integration health indicators", done: true },
  { id: "tickets", label: "Support ticketing (create / start / resolve)", done: true },
  { id: "ingest", label: "Auto-ingest contact forms, help, feedback, bookings", done: true },
  { id: "leads", label: "Lead pipeline (new → contacted → qualified → onboarded / lost)", done: true },
  { id: "staff", label: "Staff logins with viewer / editor / support / owner roles", done: true },
  { id: "analytics", label: "Analytics & feature usage reporting", done: true },
  { id: "import", label: "CSV/XLS bulk import for users and leads", done: true },
  { id: "resetpw", label: "Reset password to healer123 from edit panel", done: true },
  { id: "dormant", label: "Journey phase renamed: churned → dormant (Inactive — long quiet)", done: true },
];
