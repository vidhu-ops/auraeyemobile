export type CrmSection =
  | "dashboard"
  | "users"
  | "healers"
  | "revenue"
  | "notifications"
  | "direct-data"
  | "audit"
  | "tickets"
  | "modules";

export interface CrmOverview {
  kpis: {
    totalUsers: number;
    activeUsers: number;
    atRiskUsers: number;
    churnedUsers: number;
    healers: number;
    activeHealers: number;
    mrr: number;
    openTickets: number;
  };
  phases: Record<string, number>;
  credits: { issued: number; redeemed: number; expired: number; refunded: number };
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
  createdAt?: string;
}

export const CRM_MODULES = [
  { id: "direct-data", title: "Direct Data Control", description: "Edit users, healers, credits & records without SQL", phase: "1", color: "blue" },
  { id: "users", title: "Users", description: "Complete profiles, journey phase, activity & payments", phase: "1", color: "blue" },
  { id: "healers", title: "Healers / Practitioners", description: "Onboarding, activity, payouts, licence tracking", phase: "1", color: "blue" },
  { id: "revenue", title: "Revenue & Payments", description: "Stripe transactions, credits issued vs redeemed", phase: "1", color: "blue" },
  { id: "notifications", title: "Monthly Notifications", description: "At-risk, inactive & renewal attention queue", phase: "1", color: "blue" },
  { id: "tickets", title: "Support / Ticketing", description: "Centralize issues outside WhatsApp/email threads", phase: "2", color: "purple" },
  { id: "comms", title: "Communication Tools", description: "Templated WhatsApp/email campaigns", phase: "2", color: "purple", soon: true },
  { id: "pipeline", title: "Lead Pipeline", description: "Prospect healers from first contact to onboarded", phase: "2", color: "purple", soon: true },
  { id: "roles", title: "Roles & Permissions", description: "Founder / support / hire access slices", phase: "3", color: "teal", soon: true },
  { id: "analytics", title: "Analytics & Reporting", description: "Cohorts, top healers, feature usage", phase: "3", color: "teal", soon: true },
  { id: "audit", title: "Audit Log", description: "Who changed what, when, and previous values", phase: "A", color: "rose" },
  { id: "gdpr", title: "Data Export & Deletion", description: "GDPR/DPDPA access & erasure tooling", phase: "A", color: "rose" },
  { id: "rollback", title: "Rollback / Backup", description: "Revert a direct-edit from audit snapshots", phase: "A", color: "rose" },
  { id: "credits-log", title: "Credit Expiry & Refund Log", description: "Expiry rules and refund/dispute history", phase: "A", color: "rose", soon: true },
  { id: "contracts", title: "Practitioner Contracts", description: "Licence start/end and renewal state", phase: "A", color: "rose" },
] as const;
