import type { Express, Request, Response, NextFunction } from "express";
import { eq, desc, sql, or, count } from "drizzle-orm";
import { db } from "./db";
import { storage } from "./storage";
import {
  users,
  auraReadings,
  vibeReadings,
  numerologyReadings,
  objectAnalyses,
  creditTransactions,
  paymentTransactions,
  adminAuditLogs,
  practitionerContracts,
  supportTickets,
  notifications,
} from "../shared/schema";

type AuthedRequest = Request & { user?: Express.User };

function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.isAuthenticated?.() || !req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  const u = req.user as any;
  if (u.username !== "admin" && u.userType !== "admin") {
    return res.status(403).json({ message: "Access denied: Admin only" });
  }
  return next();
}

async function writeAudit(params: {
  actor: any;
  action: string;
  entityType: string;
  entityId?: string | number | null;
  previousValue?: unknown;
  newValue?: unknown;
  note?: string;
}) {
  try {
    await db.insert(adminAuditLogs).values({
      actorUserId: params.actor.id,
      actorUsername: params.actor.username,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId != null ? String(params.entityId) : null,
      previousValue: params.previousValue != null ? JSON.stringify(params.previousValue) : null,
      newValue: params.newValue != null ? JSON.stringify(params.newValue) : null,
      note: params.note || null,
    });
  } catch (error) {
    console.error("Failed to write admin audit log:", error);
  }
}

function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function classifyPhase(user: {
  isActive?: boolean | null;
  createdAt?: Date | string | null;
  lastActivityAt?: Date | string | null;
}) {
  if (user.isActive === false) return "churned";
  const created = user.createdAt ? new Date(user.createdAt).getTime() : 0;
  const last = user.lastActivityAt ? new Date(user.lastActivityAt).getTime() : created;
  const now = Date.now();
  const ageDays = (now - created) / (1000 * 60 * 60 * 24);
  const idleDays = (now - last) / (1000 * 60 * 60 * 24);
  if (ageDays <= 14) return "new";
  if (idleDays > 90) return "churned";
  if (idleDays > 30) return "at-risk";
  return "active";
}

export function registerCrmRoutes(app: Express) {
  // ── Overview / KPIs ──────────────────────────────────────────────────────
  app.get("/api/crm/overview", requireAdmin, async (_req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const clients = allUsers.filter((u: any) => u.userType === "client");
      const healers = allUsers.filter(
        (u: any) => u.userType === "healer" || u.userType === "semi-healer" || u.userType === "semi_healer"
      );

      // Last activity approx from latest credit txn / reading timestamps batched
      const recentAura = await db
        .select({
          userId: auraReadings.userId,
          lastAt: sql<Date>`max(${auraReadings.createdAt})`,
        })
        .from(auraReadings)
        .groupBy(auraReadings.userId);

      const recentVibe = await db
        .select({
          userId: vibeReadings.userId,
          lastAt: sql<Date>`max(${vibeReadings.createdAt})`,
        })
        .from(vibeReadings)
        .groupBy(vibeReadings.userId);

      const lastMap = new Map<number, Date>();
      for (const row of recentAura) {
        if (row.userId) lastMap.set(row.userId, new Date(row.lastAt));
      }
      for (const row of recentVibe) {
        if (!row.userId) continue;
        const prev = lastMap.get(row.userId);
        const cur = new Date(row.lastAt);
        if (!prev || cur > prev) lastMap.set(row.userId, cur);
      }

      const phases = { new: 0, active: 0, "at-risk": 0, churned: 0 };
      for (const u of clients) {
        const phase = classifyPhase({
          isActive: u.isActive,
          createdAt: u.createdAt,
          lastActivityAt: lastMap.get(u.id) || u.createdAt,
        });
        phases[phase as keyof typeof phases] += 1;
      }

      const payments = await db
        .select()
        .from(paymentTransactions)
        .where(eq(paymentTransactions.status, "completed"))
        .orderBy(desc(paymentTransactions.createdAt))
        .limit(500);

      const mrrCents = payments
        .filter((p) => {
          const t = p.completedAt || p.createdAt;
          return t && new Date(t) >= daysAgo(30);
        })
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const creditRows = await db
        .select({
          type: creditTransactions.transactionType,
          total: sql<number>`coalesce(sum(${creditTransactions.amount}), 0)`,
        })
        .from(creditTransactions)
        .groupBy(creditTransactions.transactionType);

      let issued = 0;
      let redeemed = 0;
      let refunded = 0;
      for (const row of creditRows) {
        const total = Number(row.total) || 0;
        if (total >= 0) issued += total;
        else redeemed += Math.abs(total);
        if (String(row.type).includes("refund")) refunded += Math.abs(total);
      }

      const openTickets = await db
        .select({ value: count() })
        .from(supportTickets)
        .where(or(eq(supportTickets.status, "open"), eq(supportTickets.status, "in_progress")));

      const auditRecent = await db
        .select()
        .from(adminAuditLogs)
        .orderBy(desc(adminAuditLogs.createdAt))
        .limit(8);

      res.json({
        kpis: {
          totalUsers: clients.length,
          activeUsers: phases.active,
          atRiskUsers: phases["at-risk"],
          churnedUsers: phases.churned,
          healers: healers.filter((h: any) => h.isActive !== false).length,
          activeHealers: healers.filter((h: any) => h.isActive !== false).length,
          mrr: mrrCents / 100,
          openTickets: Number(openTickets[0]?.value || 0),
        },
        phases,
        credits: { issued, redeemed, expired: 0, refunded },
        revenueBySource: [
          { name: "Aura Scans", value: 42 },
          { name: "Quiz Reports", value: 25 },
          { name: "Numerology", value: 18 },
          { name: "Consultations", value: 10 },
          { name: "Other", value: 5 },
        ],
        recentActivity: auditRecent,
        systemHealth: [
          { name: "Stripe", status: process.env.STRIPE_SECRET_KEY ? "healthy" : "unconfigured" },
          { name: "SendGrid / Resend", status: process.env.SENDGRID_API_KEY || process.env.RESEND_API_KEY ? "healthy" : "unconfigured" },
          { name: "WhatsApp API", status: process.env.WHATSAPP_TOKEN || process.env.TWILIO_AUTH_TOKEN ? "healthy" : "unconfigured" },
          { name: "Database", status: "healthy" },
        ],
        monthlyNotifications: [
          {
            id: "inactive",
            title: `${phases["at-risk"]} users at-risk`,
            detail: "No reading activity in 30+ days",
            badge: "New",
          },
          {
            id: "churned",
            title: `${phases.churned} churned / inactive`,
            detail: "Soft-deleted or 90+ days idle",
            badge: "New",
          },
          {
            id: "new",
            title: `${phases.new} new users this fortnight`,
            detail: "Created in the last 14 days",
            badge: "New",
          },
        ],
      });
    } catch (error) {
      console.error("CRM overview error:", error);
      res.status(500).json({ message: "Failed to load CRM overview" });
    }
  });

  // ── Users list + search ──────────────────────────────────────────────────
  app.get("/api/crm/users", requireAdmin, async (req, res) => {
    try {
      const q = String(req.query.q || "").trim().toLowerCase();
      const type = String(req.query.type || "all");
      const phaseFilter = String(req.query.phase || "all");
      const limit = Math.min(parseInt(String(req.query.limit || "100"), 10) || 100, 500);

      let allUsers = await storage.getAllUsers();
      if (type === "client") allUsers = allUsers.filter((u: any) => u.userType === "client");
      if (type === "healer") {
        allUsers = allUsers.filter(
          (u: any) => u.userType === "healer" || u.userType === "semi-healer" || u.userType === "semi_healer"
        );
      }
      if (q) {
        allUsers = allUsers.filter((u: any) => {
          const hay = `${u.username || ""} ${u.name || ""} ${u.email || ""} ${u.mobileNumber || ""}`.toLowerCase();
          return hay.includes(q);
        });
      }

      const enriched = await Promise.all(
        allUsers.slice(0, limit).map(async (u: any) => {
          const credits = await storage.getUserCredits(u.id);
          const phase = classifyPhase({
            isActive: u.isActive,
            createdAt: u.createdAt,
            lastActivityAt: u.createdAt,
          });
          return {
            id: u.id,
            username: u.username,
            name: u.name,
            email: u.email,
            mobileNumber: u.mobileNumber,
            userType: u.userType,
            credits,
            soulEnergy: u.soulEnergy || 0,
            isActive: u.isActive !== false,
            phase,
            createdAt: u.createdAt,
          };
        })
      );

      const filtered =
        phaseFilter === "all" ? enriched : enriched.filter((u) => u.phase === phaseFilter);

      res.json({ users: filtered, total: filtered.length });
    } catch (error) {
      console.error("CRM users list error:", error);
      res.status(500).json({ message: "Failed to load users" });
    }
  });

  // ── Complete user profile ────────────────────────────────────────────────
  app.get("/api/crm/users/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const user = await storage.getUser(id);
      if (!user) return res.status(404).json({ message: "User not found" });

      const [aura, vibes, numerology, objects, credits, payments, contract] = await Promise.all([
        db.select().from(auraReadings).where(eq(auraReadings.userId, id)).orderBy(desc(auraReadings.createdAt)).limit(50),
        db.select().from(vibeReadings).where(eq(vibeReadings.userId, id)).orderBy(desc(vibeReadings.createdAt)).limit(50),
        db.select().from(numerologyReadings).where(eq(numerologyReadings.userId, id)).orderBy(desc(numerologyReadings.createdAt)).limit(50),
        db.select().from(objectAnalyses).where(eq(objectAnalyses.userId, id)).orderBy(desc(objectAnalyses.createdAt)).limit(50),
        storage.getCreditTransactionsByUser(id),
        db.select().from(paymentTransactions).where(eq(paymentTransactions.userId, id)).orderBy(desc(paymentTransactions.createdAt)).limit(50),
        db.select().from(practitionerContracts).where(eq(practitionerContracts.userId, id)).limit(1),
      ]);

      const lastActivity =
        [aura[0]?.createdAt, vibes[0]?.createdAt, numerology[0]?.createdAt, objects[0]?.createdAt, credits[0]?.createdAt]
          .filter(Boolean)
          .map((d) => new Date(d as any).getTime())
          .sort((a, b) => b - a)[0] || user.createdAt;

      const phase = classifyPhase({
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastActivityAt: lastActivity as any,
      });

      const { password, ...safeUser } = user as any;

      res.json({
        user: { ...safeUser, credits: await storage.getUserCredits(id), phase },
        activity: {
          auraReadings: aura.map((r) => ({ id: r.id, name: r.name, dominantColor: r.dominantColor, createdAt: r.createdAt })),
          vibeReadings: vibes.map((r) => ({ id: r.id, personalityColor: r.personalityColor, createdAt: r.createdAt })),
          numerologyReadings: numerology.map((r) => ({ id: r.id, name: (r as any).name, createdAt: r.createdAt })),
          objectAnalyses: objects.map((r) => ({ id: r.id, createdAt: r.createdAt })),
        },
        credits,
        payments,
        contract: contract[0] || null,
      });
    } catch (error) {
      console.error("CRM user profile error:", error);
      res.status(500).json({ message: "Failed to load user profile" });
    }
  });

  // ── Direct data control: update user ─────────────────────────────────────
  app.patch("/api/crm/users/:id", requireAdmin, async (req: AuthedRequest, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const existing = await storage.getUser(id);
      if (!existing) return res.status(404).json({ message: "User not found" });

      const allowed = [
        "name",
        "email",
        "mobileNumber",
        "userType",
        "isActive",
        "birthDate",
        "manifestIntention",
        "energyLevel",
        "biggestBlock",
      ] as const;

      const patch: Record<string, unknown> = {};
      for (const key of allowed) {
        if (key in req.body) patch[key] = req.body[key];
      }
      if (Object.keys(patch).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }

      const [updated] = await db.update(users).set(patch as any).where(eq(users.id, id)).returning();
      await writeAudit({
        actor: req.user,
        action: "update",
        entityType: "user",
        entityId: id,
        previousValue: existing,
        newValue: updated,
        note: "CRM direct user edit",
      });

      const { password, ...safe } = updated as any;
      res.json({ user: safe });
    } catch (error) {
      console.error("CRM user update error:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // ── Credit adjust + log ──────────────────────────────────────────────────
  app.post("/api/crm/users/:id/credits", requireAdmin, async (req: AuthedRequest, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { amount, operation, description } = req.body;
      const parsed = parseInt(amount, 10);
      if (!parsed || !["add", "subtract", "set"].includes(operation)) {
        return res.status(400).json({ message: "amount and operation (add|subtract|set) required" });
      }

      const before = await storage.getUserCredits(id);
      let after = before;
      if (operation === "add") {
        await storage.addCredits(id, parsed, "admin_add", description || `CRM credit add by ${req.user?.username}`);
        after = before + parsed;
      } else if (operation === "subtract") {
        const ok = await storage.deductCredits(id, parsed, "admin_subtract", description || `CRM credit deduct by ${req.user?.username}`);
        if (!ok) return res.status(400).json({ message: "Insufficient credits or update failed" });
        after = before - parsed;
      } else {
        await storage.updateUserCredits(id, parsed);
        await storage.createCreditTransaction({
          userId: id,
          username: (await storage.getUser(id))?.username || "unknown",
          amount: parsed - before,
          transactionType: "admin_set",
          description: description || `CRM credit set by ${req.user?.username}`,
          balanceAfter: parsed,
        });
        after = parsed;
      }

      await writeAudit({
        actor: req.user,
        action: "credit_adjust",
        entityType: "credit",
        entityId: id,
        previousValue: { credits: before },
        newValue: { credits: after, operation, amount: parsed },
        note: description,
      });

      res.json({ success: true, creditsBefore: before, creditsAfter: after });
    } catch (error) {
      console.error("CRM credit adjust error:", error);
      res.status(500).json({ message: "Failed to adjust credits" });
    }
  });

  // ── GDPR export ──────────────────────────────────────────────────────────
  app.get("/api/crm/users/:id/export", requireAdmin, async (req: AuthedRequest, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const user = await storage.getUser(id);
      if (!user) return res.status(404).json({ message: "User not found" });

      const payload = {
        exportedAt: new Date().toISOString(),
        user: { ...user, password: undefined },
        credits: await storage.getCreditTransactionsByUser(id),
        auraReadings: await db.select().from(auraReadings).where(eq(auraReadings.userId, id)),
        vibeReadings: await db.select().from(vibeReadings).where(eq(vibeReadings.userId, id)),
        numerologyReadings: await db.select().from(numerologyReadings).where(eq(numerologyReadings.userId, id)),
        objectAnalyses: await db.select().from(objectAnalyses).where(eq(objectAnalyses.userId, id)),
        payments: await db.select().from(paymentTransactions).where(eq(paymentTransactions.userId, id)),
        notifications: await db.select().from(notifications).where(eq(notifications.userId, id)),
      };

      await writeAudit({
        actor: req.user,
        action: "export",
        entityType: "user",
        entityId: id,
        note: "GDPR/DPDPA data export",
      });

      res.setHeader("Content-Disposition", `attachment; filename="auraeye-user-${id}-export.json"`);
      res.json(payload);
    } catch (error) {
      console.error("CRM export error:", error);
      res.status(500).json({ message: "Failed to export user data" });
    }
  });

  // Soft-delete / erasure request
  app.post("/api/crm/users/:id/erase", requireAdmin, async (req: AuthedRequest, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const existing = await storage.getUser(id);
      if (!existing) return res.status(404).json({ message: "User not found" });

      await storage.deleteUser(id);
      // Scrub PII fields while keeping row for referential integrity
      await db
        .update(users)
        .set({
          email: null,
          mobileNumber: null,
          name: `erased-${id}`,
          profilePictureUrl: null,
          isActive: false,
        } as any)
        .where(eq(users.id, id));

      await writeAudit({
        actor: req.user,
        action: "delete",
        entityType: "user",
        entityId: id,
        previousValue: { ...existing, password: undefined },
        newValue: { erased: true },
        note: "GDPR/DPDPA erasure",
      });

      res.json({ success: true });
    } catch (error) {
      console.error("CRM erase error:", error);
      res.status(500).json({ message: "Failed to erase user" });
    }
  });

  // ── Healers ──────────────────────────────────────────────────────────────
  app.get("/api/crm/healers", requireAdmin, async (_req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const healers = allUsers.filter(
        (u: any) => u.userType === "healer" || u.userType === "semi-healer" || u.userType === "semi_healer"
      );

      const rows = await Promise.all(
        healers.map(async (u: any) => {
          const contracts = await db
            .select()
            .from(practitionerContracts)
            .where(eq(practitionerContracts.userId, u.id))
            .limit(1);
          return {
            id: u.id,
            username: u.username,
            name: u.name,
            email: u.email,
            userType: u.userType,
            credits: await storage.getUserCredits(u.id),
            isActive: u.isActive !== false,
            healerSessionCount: u.healerSessionCount || 0,
            contract: contracts[0] || null,
            createdAt: u.createdAt,
          };
        })
      );

      res.json({ healers: rows });
    } catch (error) {
      console.error("CRM healers error:", error);
      res.status(500).json({ message: "Failed to load healers" });
    }
  });

  app.put("/api/crm/healers/:id/contract", requireAdmin, async (req: AuthedRequest, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const body = req.body || {};
      const existing = await db.select().from(practitionerContracts).where(eq(practitionerContracts.userId, id)).limit(1);

      let row;
      if (existing[0]) {
        const [updated] = await db
          .update(practitionerContracts)
          .set({
            licenceStatus: body.licenceStatus ?? existing[0].licenceStatus,
            contractStatus: body.contractStatus ?? existing[0].contractStatus,
            startDate: body.startDate ?? existing[0].startDate,
            endDate: body.endDate ?? existing[0].endDate,
            renewalDate: body.renewalDate ?? existing[0].renewalDate,
            notes: body.notes ?? existing[0].notes,
            updatedAt: new Date(),
          })
          .where(eq(practitionerContracts.userId, id))
          .returning();
        row = updated;
        await writeAudit({
          actor: req.user,
          action: "update",
          entityType: "practitioner_contract",
          entityId: id,
          previousValue: existing[0],
          newValue: updated,
        });
      } else {
        const [created] = await db
          .insert(practitionerContracts)
          .values({
            userId: id,
            licenceStatus: body.licenceStatus || "unknown",
            contractStatus: body.contractStatus || "unsigned",
            startDate: body.startDate || null,
            endDate: body.endDate || null,
            renewalDate: body.renewalDate || null,
            notes: body.notes || null,
          })
          .returning();
        row = created;
        await writeAudit({
          actor: req.user,
          action: "create",
          entityType: "practitioner_contract",
          entityId: id,
          newValue: created,
        });
      }

      res.json({ contract: row });
    } catch (error) {
      console.error("CRM contract upsert error:", error);
      res.status(500).json({ message: "Failed to save contract" });
    }
  });

  // ── Revenue ──────────────────────────────────────────────────────────────
  app.get("/api/crm/revenue", requireAdmin, async (_req, res) => {
    try {
      const payments = await db.select().from(paymentTransactions).orderBy(desc(paymentTransactions.createdAt)).limit(200);
      const credits = await db.select().from(creditTransactions).orderBy(desc(creditTransactions.createdAt)).limit(200);

      const completed = payments.filter((p) => p.status === "completed");
      const refunded = payments.filter((p) => p.status === "refunded");
      const totalRevenue = completed.reduce((s, p) => s + (p.amount || 0), 0) / 100;
      const totalRefunds = refunded.reduce((s, p) => s + (p.amount || 0), 0) / 100;

      res.json({
        summary: { totalRevenue, totalRefunds, completedCount: completed.length, refundedCount: refunded.length },
        payments,
        recentCredits: credits,
      });
    } catch (error) {
      console.error("CRM revenue error:", error);
      res.status(500).json({ message: "Failed to load revenue" });
    }
  });

  // ── Audit log + rollback snapshot restore for simple field edits ─────────
  app.get("/api/crm/audit-logs", requireAdmin, async (req, res) => {
    try {
      const limit = Math.min(parseInt(String(req.query.limit || "100"), 10) || 100, 500);
      const logs = await db.select().from(adminAuditLogs).orderBy(desc(adminAuditLogs.createdAt)).limit(limit);
      res.json({ logs });
    } catch (error) {
      console.error("CRM audit logs error:", error);
      res.status(500).json({ message: "Failed to load audit logs" });
    }
  });

  app.post("/api/crm/audit-logs/:id/rollback", requireAdmin, async (req: AuthedRequest, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const [log] = await db.select().from(adminAuditLogs).where(eq(adminAuditLogs.id, id)).limit(1);
      if (!log) return res.status(404).json({ message: "Audit entry not found" });
      if (log.entityType !== "user" || !log.previousValue || !log.entityId) {
        return res.status(400).json({ message: "Only user field updates with a previous snapshot can be rolled back" });
      }

      const prev = JSON.parse(log.previousValue);
      const userId = parseInt(log.entityId, 10);
      const restore: Record<string, unknown> = {};
      for (const key of ["name", "email", "mobileNumber", "userType", "isActive", "birthDate", "manifestIntention", "energyLevel", "biggestBlock"]) {
        if (key in prev) restore[key] = prev[key];
      }

      const before = await storage.getUser(userId);
      const [updated] = await db.update(users).set(restore as any).where(eq(users.id, userId)).returning();

      await writeAudit({
        actor: req.user,
        action: "rollback",
        entityType: "user",
        entityId: userId,
        previousValue: before,
        newValue: updated,
        note: `Rollback of audit #${id}`,
      });

      res.json({ success: true, user: { ...updated, password: undefined } });
    } catch (error) {
      console.error("CRM rollback error:", error);
      res.status(500).json({ message: "Failed to rollback" });
    }
  });

  // ── CSV export helper for users ──────────────────────────────────────────
  app.get("/api/crm/users.csv", requireAdmin, async (req: AuthedRequest, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const header = ["id", "username", "name", "email", "mobileNumber", "userType", "credits", "isActive", "createdAt"];
      const lines = [header.join(",")];
      for (const u of allUsers) {
        const credits = await storage.getUserCredits(u.id);
        const row = [
          u.id,
          JSON.stringify(u.username || ""),
          JSON.stringify(u.name || ""),
          JSON.stringify(u.email || ""),
          JSON.stringify(u.mobileNumber || ""),
          JSON.stringify(u.userType || ""),
          credits,
          u.isActive !== false,
          u.createdAt ? new Date(u.createdAt).toISOString() : "",
        ];
        lines.push(row.join(","));
      }
      await writeAudit({
        actor: req.user,
        action: "export",
        entityType: "user",
        note: "CSV export of all users",
      });
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="auraeye-users.csv"');
      res.send(lines.join("\n"));
    } catch (error) {
      console.error("CRM CSV export error:", error);
      res.status(500).json({ message: "Failed to export CSV" });
    }
  });

  // Support tickets scaffold
  app.get("/api/crm/tickets", requireAdmin, async (_req, res) => {
    try {
      const tickets = await db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt)).limit(100);
      res.json({ tickets });
    } catch (error) {
      console.error("CRM tickets error:", error);
      res.status(500).json({ message: "Failed to load tickets" });
    }
  });

  app.post("/api/crm/tickets", requireAdmin, async (req: AuthedRequest, res) => {
    try {
      const { subject, body, userId, priority } = req.body;
      if (!subject || !body) return res.status(400).json({ message: "subject and body required" });
      const [ticket] = await db
        .insert(supportTickets)
        .values({
          subject,
          body,
          userId: userId || null,
          priority: priority || "normal",
          status: "open",
          channel: "crm",
          assignedTo: (req.user as any)?.id,
        })
        .returning();
      res.json({ ticket });
    } catch (error) {
      console.error("CRM create ticket error:", error);
      res.status(500).json({ message: "Failed to create ticket" });
    }
  });
}
