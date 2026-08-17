export type CrmSection =
  | "dashboard"
  | "users"
  | "healers"
  | "revenue"
  | "notifications"
  | "direct-data"
  | "audit"
  | "tickets"
  | "staff"
  | "leads"
  | "analytics"
  | "modules";

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

export const CRM_MODULES = [
  { id: "direct-data", title: "Direct Data Control", description: "Create, import CSV/XLS, edit fields, credits & GDPR tools", phase: "1", color: "blue" },
  { id: "users", title: "Users (clients)", description: "Client journey, activity timeline, credit expiry & their tickets", phase: "1", color: "blue" },
  { id: "healers", title: "Healers / Practitioners", description: "Sessions, licence/contract, booking tickets", phase: "1", color: "blue" },
  { id: "revenue", title: "Revenue & Payments", description: "Payments, credit expiry log, refund history", phase: "1", color: "blue" },
  { id: "notifications", title: "Monthly Notifications", description: "Needs-attention & inactive user queues", phase: "1", color: "blue" },
  { id: "tickets", title: "Support / Ticketing", description: "Track issues outside WhatsApp/email threads", phase: "2", color: "purple" },
  { id: "leads", title: "Lead Pipeline", description: "Prospect healers from first contact to onboarded", phase: "2", color: "purple" },
  { id: "staff", title: "Roles & Permissions", description: "Create viewer/editor staff logins for /admin", phase: "3", color: "teal" },
  { id: "analytics", title: "Analytics & Reporting", description: "Feature usage across scans & numerology", phase: "3", color: "teal" },
  { id: "audit", title: "Audit Log", description: "Who changed what, when, and previous values", phase: "A", color: "rose" },
  { id: "gdpr", title: "Data Export & Deletion", description: "GDPR/DPDPA access & erasure tooling", phase: "A", color: "rose" },
  { id: "rollback", title: "Rollback / Backup", description: "Revert a direct-edit from audit snapshots", phase: "A", color: "rose" },
] as const;
